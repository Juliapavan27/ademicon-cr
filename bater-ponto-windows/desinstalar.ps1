# Remove o aviso "BATER PONTO".
Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" |
    Where-Object { $_.CommandLine -like '*BaterPonto*monitor.ps1*' } |
    ForEach-Object { Invoke-CimMethod -InputObject $_ -MethodName Terminate | Out-Null }

# Devolve o Windows + L (versao anterior) e o botao de energia ao normal.
[Microsoft.Win32.Registry]::SetValue('HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Policies\System', 'DisableLockWorkstation', 0, 'DWord')
$original = Join-Path $env:LOCALAPPDATA 'BaterPonto\botao-energia-original.txt'
if (Test-Path $original) {
    $ac, $dc = (Get-Content $original -Raw).Trim() -split ' '
    powercfg /setacvalueindex SCHEME_CURRENT SUB_BUTTONS PBUTTONACTION ([Convert]::ToInt32($ac, 16))
    powercfg /setdcvalueindex SCHEME_CURRENT SUB_BUTTONS PBUTTONACTION ([Convert]::ToInt32($dc, 16))
    powercfg /setactive SCHEME_CURRENT
}

$desktop = [Environment]::GetFolderPath('Desktop')
Remove-Item -Force -ErrorAction SilentlyContinue -Path @(
    (Join-Path ([Environment]::GetFolderPath('Startup')) 'Bater Ponto (monitor).lnk'),
    (Join-Path $desktop 'Suspender (Bater Ponto).lnk'),
    (Join-Path $desktop 'Desligar (Bater Ponto).lnk'),
    (Join-Path $desktop 'Bloquear tela (Bater Ponto).lnk')
)
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue -Path @(
    (Join-Path ([Environment]::GetFolderPath('Programs')) 'Bater Ponto'),
    (Join-Path $env:LOCALAPPDATA 'BaterPonto')
)

Write-Host 'Bater Ponto removido. Escolha uma nova imagem para a tela de bloqueio na janela que vai abrir.' -ForegroundColor Green
Start-Process 'ms-settings:lockscreen'
