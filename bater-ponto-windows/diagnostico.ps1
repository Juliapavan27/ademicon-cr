# Junta informacoes para descobrir por que o aviso nao aparece antes de bloquear/desligar.
$saida = Join-Path ([Environment]::GetFolderPath('Desktop')) 'diagnostico-bater-ponto.txt'

function Valor($chave, $nome) {
    try { (Get-ItemProperty -Path $chave -Name $nome -ErrorAction Stop).$nome } catch { '(nao definido)' }
}

$linhas = @()
$so = Get-CimInstance Win32_OperatingSystem
$pc = Get-CimInstance Win32_ComputerSystem
$linhas += "Windows: $($so.Caption) $($so.Version)"
$linhas += "Em dominio da empresa: $($pc.PartOfDomain)"
$linhas += "Azure AD / Intune: " + ((dsregcmd /status | Select-String 'AzureAdJoined|DomainJoined') -join ' | ')

$monitor = Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" | Where-Object { $_.CommandLine -like '*BaterPonto*monitor.ps1*' }
$linhas += "Monitor rodando: $([bool]$monitor)"
$linhas += "Atalho de inicializacao: " + (Test-Path (Join-Path ([Environment]::GetFolderPath('Startup')) 'Bater Ponto (monitor).lnk'))
$linhas += "Arquivos instalados: " + ((Get-ChildItem (Join-Path $env:LOCALAPPDATA 'BaterPonto') -ErrorAction SilentlyContinue).Name -join ', ')

$linhas += "powercfg: " + ((powercfg /query SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 7648efa3-dd9c-4e3e-b566-50f929386280 | Out-String).Trim() -replace '\s+', ' ')
$linhas += "Botao de energia (AC DC): " + ([regex]::Matches((powercfg /query SCHEME_CURRENT 4f971e89-eebd-4455-a8de-9e59040e7347 7648efa3-dd9c-4e3e-b566-50f929386280 | Out-String), '0x[0-9a-fA-F]+').Value -join ' ')

$linhas += "--- Politicas da tela de bloqueio ---"
foreach ($chave in 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\Personalization', 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\PersonalizationCSP') {
    foreach ($nome in 'LockScreenImage', 'LockScreenImagePath', 'NoChangingLockScreen', 'NoLockScreen', 'LockScreenImageStatus') {
        $linhas += "$chave\$nome = $(Valor $chave $nome)"
    }
}
$linhas += "Spotlight (HKCU RotatingLockScreenEnabled) = " + (Valor 'HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager' 'RotatingLockScreenEnabled')

$linhas += "--- Politicas de bloqueio ---"
$linhas += "HKCU DisableLockWorkstation = " + (Valor 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Policies\System' 'DisableLockWorkstation')
$linhas += "HKLM DisableLockWorkstation = " + (Valor 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' 'DisableLockWorkstation')
try {
    [Microsoft.Win32.Registry]::SetValue('HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Policies\System', 'DisableLockWorkstation', 0, 'DWord')
    $linhas += "Consigo gravar DisableLockWorkstation: sim"
} catch {
    $linhas += "Consigo gravar DisableLockWorkstation: NAO ($($_.Exception.Message))"
}

$linhas += "--- Teste de troca da tela de bloqueio ---"
try {
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' } | Select-Object -First 1
    $asTaskOp = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } | Select-Object -First 1
    [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
    [Windows.System.UserProfile.LockScreen, Windows.System.UserProfile, ContentType = WindowsRuntime] | Out-Null
    $linhas += "Imagem atual: $([Windows.System.UserProfile.LockScreen]::OriginalImageFile)"
    $imagem = Join-Path $env:LOCALAPPDATA 'BaterPonto\tela-de-bloqueio.png'
    if (Test-Path $imagem) {
        $tarefa = $asTaskOp.MakeGenericMethod([Windows.Storage.StorageFile]).Invoke($null, @([Windows.Storage.StorageFile]::GetFileFromPathAsync($imagem)))
        $tarefa.Wait(-1) | Out-Null
        $asTask.Invoke($null, @([Windows.System.UserProfile.LockScreen]::SetImageFileAsync($tarefa.Result))).Wait(-1) | Out-Null
        $linhas += "Troca da imagem: ok. Imagem agora: $([Windows.System.UserProfile.LockScreen]::OriginalImageFile)"
    } else {
        $linhas += "Troca da imagem: arquivo tela-de-bloqueio.png nao existe"
    }
} catch {
    $linhas += "Troca da imagem: ERRO ($($_.Exception.InnerException.Message) $($_.Exception.Message))"
}

$linhas | Set-Content -Path $saida -Encoding UTF8
notepad.exe $saida
