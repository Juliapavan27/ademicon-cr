# Instala o aviso "BATER PONTO" para o usuario atual (nao precisa de administrador).
$ErrorActionPreference = 'Stop'

$destino = Join-Path $env:LOCALAPPDATA 'BaterPonto'
$ps = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$base = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File'

# Para um monitor antigo, caso esteja reinstalando.
Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" |
    Where-Object { $_.CommandLine -like '*BaterPonto*monitor.ps1*' } |
    ForEach-Object { Invoke-CimMethod -InputObject $_ -MethodName Terminate | Out-Null }

New-Item -ItemType Directory -Force -Path $destino | Out-Null
Copy-Item -Force -Path (Join-Path $PSScriptRoot 'bater-ponto.ps1'), (Join-Path $PSScriptRoot 'monitor.ps1') -Destination $destino

$shell = New-Object -ComObject WScript.Shell
function Novo-Atalho($pasta, $nome, $argumentos, $icone) {
    $atalho = $shell.CreateShortcut((Join-Path $pasta "$nome.lnk"))
    $atalho.TargetPath = $ps
    $atalho.Arguments = $argumentos
    $atalho.WorkingDirectory = $destino
    $atalho.IconLocation = $icone
    $atalho.WindowStyle = 7
    $atalho.Save()
}

$aviso = "$base `"$destino\bater-ponto.ps1`""
$monitor = "$base `"$destino\monitor.ps1`""

# Inicia o monitor sempre que o usuario entrar no Windows.
Novo-Atalho ([Environment]::GetFolderPath('Startup')) 'Bater Ponto (monitor)' $monitor "$env:SystemRoot\System32\shell32.dll,21"

# Atalhos na Area de Trabalho e no menu Iniciar.
$menu = Join-Path ([Environment]::GetFolderPath('Programs')) 'Bater Ponto'
New-Item -ItemType Directory -Force -Path $menu | Out-Null
foreach ($pasta in @([Environment]::GetFolderPath('Desktop'), $menu)) {
    Novo-Atalho $pasta 'Suspender (Bater Ponto)' "$aviso -Acao Suspender" "$env:SystemRoot\System32\shell32.dll,27"
    Novo-Atalho $pasta 'Desligar (Bater Ponto)' "$aviso -Acao Desligar" "$env:SystemRoot\System32\shell32.dll,27"
    Novo-Atalho $pasta 'Bloquear tela (Bater Ponto)' "$aviso -Acao Bloquear" "$env:SystemRoot\System32\shell32.dll,47"
}

# Botao de energia passa a "Desligar", para cair na tela de desligamento com o aviso BATER PONTO
# (a suspensao nao pode ser interrompida pelo Windows). Guarda a configuracao original.
$original = Join-Path $destino 'botao-energia-original.txt'
if (-not (Test-Path $original)) {
    $valores = [regex]::Matches((powercfg /query SCHEME_CURRENT SUB_BUTTONS PBUTTONACTION | Out-String), '0x[0-9a-fA-F]+')
    if ($valores.Count -ge 2) { Set-Content -Path $original -Value "$($valores[0].Value) $($valores[1].Value)" }
}
powercfg /setacvalueindex SCHEME_CURRENT SUB_BUTTONS PBUTTONACTION 3
powercfg /setdcvalueindex SCHEME_CURRENT SUB_BUTTONS PBUTTONACTION 3
powercfg /setactive SCHEME_CURRENT

# Desfaz o bloqueio do Windows + L da versao anterior, que nao funcionou.
[Microsoft.Win32.Registry]::SetValue('HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Policies\System', 'DisableLockWorkstation', 0, 'DWord')

# Imagem da tela de bloqueio com "BATER PONTO": aparece assim que a tela bloqueia
# (Windows + L, tampa, suspensao ou inatividade).
Add-Type -AssemblyName System.Drawing
$imagem = Join-Path $destino 'tela-de-bloqueio.png'
$bitmap = New-Object System.Drawing.Bitmap(1920, 1080)
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::FromArgb(150, 0, 0))
$centro = New-Object System.Drawing.StringFormat
$centro.Alignment = 'Center'
$centro.LineAlignment = 'Center'
$g.DrawString('BATER PONTO', (New-Object System.Drawing.Font('Segoe UI', 150, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)),
    [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(0, 560, 1920, 220)), $centro)
$g.DrawString('Registre o seu ponto antes de sair e ao voltar', (New-Object System.Drawing.Font('Segoe UI', 48, [System.Drawing.GraphicsUnit]::Pixel)),
    [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF(0, 780, 1920, 90)), $centro)
$g.Dispose()
$bitmap.Save($imagem, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' } | Select-Object -First 1
    $asTaskOp = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
    [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
    [Windows.System.UserProfile.LockScreen, Windows.System.UserProfile, ContentType = WindowsRuntime] | Out-Null

    $tarefa = $asTaskOp.MakeGenericMethod([Windows.Storage.StorageFile]).Invoke($null, @([Windows.Storage.StorageFile]::GetFileFromPathAsync($imagem)))
    $tarefa.Wait(-1) | Out-Null
    $asTask.Invoke($null, @([Windows.System.UserProfile.LockScreen]::SetImageFileAsync($tarefa.Result))).Wait(-1) | Out-Null
    Write-Host 'Tela de bloqueio configurada com BATER PONTO.' -ForegroundColor Green
} catch {
    Write-Host "Nao consegui trocar a tela de bloqueio automaticamente ($($_.Exception.Message))." -ForegroundColor Yellow
    Write-Host "Abra Configuracoes > Personalizacao > Tela de bloqueio, escolha 'Imagem' e selecione: $imagem" -ForegroundColor Yellow
}

# Liga o monitor agora (ele ja mostra o primeiro aviso).
Start-Process -FilePath $ps -ArgumentList $monitor -WindowStyle Hidden

Write-Host 'Bater Ponto instalado! O aviso vai aparecer agora e sempre que voce ligar o notebook.' -ForegroundColor Green
