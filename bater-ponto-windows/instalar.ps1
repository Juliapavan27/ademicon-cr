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

# Liga o monitor agora (ele ja mostra o primeiro aviso).
Start-Process -FilePath $ps -ArgumentList $monitor -WindowStyle Hidden

Write-Host 'Bater Ponto instalado! O aviso vai aparecer agora e sempre que voce ligar o notebook.' -ForegroundColor Green
