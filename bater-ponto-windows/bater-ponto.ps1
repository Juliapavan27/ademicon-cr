# Mostra o aviso "BATER PONTO".
#   -Acao Aviso      -> apenas mostra o aviso (usado ao ligar, voltar da suspensao ou desbloquear)
#   -Acao Suspender  -> mostra o aviso e, se confirmado, suspende o notebook
#   -Acao Desligar   -> mostra o aviso e, se confirmado, desliga o notebook
#   -Acao Bloquear   -> mostra o aviso e, se confirmado, bloqueia a tela
param(
    [ValidateSet('Aviso', 'Suspender', 'Desligar', 'Bloquear')]
    [string]$Acao = 'Aviso'
)

Add-Type -AssemblyName System.Windows.Forms, System.Drawing

# Evita varios avisos empilhados (ex.: voltar da suspensao + desbloquear a tela).
$criado = $false
$mutex = New-Object System.Threading.Mutex($true, 'Local\BaterPontoAviso', [ref]$criado)
if (-not $criado) { exit }

$textos = @{
    Aviso     = @('Não esqueça de registrar o seu ponto!', 'OK, entendi')
    Suspender = @('Registre o seu ponto antes de suspender o notebook.', 'Já bati o ponto - Suspender')
    Desligar  = @('Registre o seu ponto antes de desligar o notebook.', 'Já bati o ponto - Desligar')
    Bloquear  = @('Registre o seu ponto antes de bloquear a tela.', 'Já bati o ponto - Bloquear')
}

[System.Windows.Forms.Application]::EnableVisualStyles()

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Bater Ponto'
$form.ClientSize = New-Object System.Drawing.Size(560, 260)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.TopMost = $true
$form.BackColor = [System.Drawing.Color]::White

$titulo = New-Object System.Windows.Forms.Label
$titulo.Text = 'BATER PONTO'
$titulo.Font = New-Object System.Drawing.Font('Segoe UI', 36, [System.Drawing.FontStyle]::Bold)
$titulo.ForeColor = [System.Drawing.Color]::FromArgb(200, 0, 0)
$titulo.TextAlign = 'MiddleCenter'
$titulo.Location = New-Object System.Drawing.Point(0, 20)
$titulo.Size = New-Object System.Drawing.Size(560, 90)
$form.Controls.Add($titulo)

$subtitulo = New-Object System.Windows.Forms.Label
$subtitulo.Text = $textos[$Acao][0]
$subtitulo.Font = New-Object System.Drawing.Font('Segoe UI', 12)
$subtitulo.TextAlign = 'MiddleCenter'
$subtitulo.Location = New-Object System.Drawing.Point(20, 115)
$subtitulo.Size = New-Object System.Drawing.Size(520, 50)
$form.Controls.Add($subtitulo)

$ok = New-Object System.Windows.Forms.Button
$ok.Text = $textos[$Acao][1]
$ok.Font = New-Object System.Drawing.Font('Segoe UI', 11)
$ok.DialogResult = [System.Windows.Forms.DialogResult]::OK
$form.Controls.Add($ok)
$form.AcceptButton = $ok

if ($Acao -eq 'Aviso') {
    $ok.Location = New-Object System.Drawing.Point(180, 185)
    $ok.Size = New-Object System.Drawing.Size(200, 45)
    $form.CancelButton = $ok
} else {
    $ok.Location = New-Object System.Drawing.Point(40, 185)
    $ok.Size = New-Object System.Drawing.Size(300, 45)

    $cancelar = New-Object System.Windows.Forms.Button
    $cancelar.Text = 'Cancelar'
    $cancelar.Font = New-Object System.Drawing.Font('Segoe UI', 11)
    $cancelar.Location = New-Object System.Drawing.Point(360, 185)
    $cancelar.Size = New-Object System.Drawing.Size(160, 45)
    $cancelar.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
    $form.Controls.Add($cancelar)
    $form.CancelButton = $cancelar
}

$form.Add_Shown({ $form.Activate() })
$resultado = $form.ShowDialog()
$mutex.ReleaseMutex()

if ($Acao -eq 'Aviso') { exit }
if ($resultado -ne [System.Windows.Forms.DialogResult]::OK) { exit }

# Avisa o monitor que este desligamento ja foi confirmado, para ele nao bloquear.
Set-Content -Path (Join-Path $env:TEMP 'bater-ponto-autorizado.txt') -Value (Get-Date -Format o)

switch ($Acao) {
    'Suspender' {
        Add-Type -Name Energia -Namespace BaterPonto -MemberDefinition @'
[DllImport("powrprof.dll")]
public static extern bool SetSuspendState(bool hibernate, bool forceCritical, bool disableWakeEvent);
'@
        [BaterPonto.Energia]::SetSuspendState($false, $false, $false) | Out-Null
    }
    'Desligar' { Stop-Computer }
    'Bloquear' {
        # O monitor desliga o bloqueio do Windows para segurar o Windows + L; religa so para bloquear agora.
        [Microsoft.Win32.Registry]::SetValue('HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Policies\System', 'DisableLockWorkstation', 0, 'DWord')
        rundll32.exe user32.dll,LockWorkStation
    }
}
