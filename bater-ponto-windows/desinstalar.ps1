# Remove o aviso "BATER PONTO".
Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" |
    Where-Object { $_.CommandLine -like '*BaterPonto*monitor.ps1*' } |
    ForEach-Object { Invoke-CimMethod -InputObject $_ -MethodName Terminate | Out-Null }

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

Write-Host 'Bater Ponto removido.' -ForegroundColor Green
