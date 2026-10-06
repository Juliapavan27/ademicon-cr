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

# Cores da marca Maria Dolores
$corFundo = [System.Drawing.Color]::FromArgb(238, 232, 229)
$corDourado = [System.Drawing.Color]::FromArgb(168, 116, 47)
$corTexto = [System.Drawing.Color]::FromArgb(110, 92, 78)

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Bater Ponto'
$form.ClientSize = New-Object System.Drawing.Size(560, 430)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.TopMost = $true
$form.BackColor = $corFundo

$cabecalho = Join-Path $PSScriptRoot 'aviso-cabecalho.jpg'
if (Test-Path $cabecalho) {
    $imagem = New-Object System.Windows.Forms.PictureBox
    $imagem.Image = [System.Drawing.Image]::FromFile($cabecalho)
    $imagem.SizeMode = 'Zoom'
    $imagem.Location = New-Object System.Drawing.Point(0, 0)
    $imagem.Size = New-Object System.Drawing.Size(560, 240)
    $form.Controls.Add($imagem)
}

$titulo = New-Object System.Windows.Forms.Label
$titulo.Text = 'BATER PONTO'
$titulo.Font = New-Object System.Drawing.Font('Segoe UI Light', 28)
$titulo.ForeColor = $corDourado
$titulo.TextAlign = 'MiddleCenter'
$titulo.Location = New-Object System.Drawing.Point(0, 252)
$titulo.Size = New-Object System.Drawing.Size(560, 60)
$form.Controls.Add($titulo)

$subtitulo = New-Object System.Windows.Forms.Label
$subtitulo.Text = $textos[$Acao][0]
$subtitulo.Font = New-Object System.Drawing.Font('Segoe UI', 11)
$subtitulo.ForeColor = $corTexto
$subtitulo.TextAlign = 'MiddleCenter'
$subtitulo.Location = New-Object System.Drawing.Point(20, 312)
$subtitulo.Size = New-Object System.Drawing.Size(520, 40)
$form.Controls.Add($subtitulo)

function Novo-Botao($texto, $principal) {
    $botao = New-Object System.Windows.Forms.Button
    $botao.Text = $texto
    $botao.Font = New-Object System.Drawing.Font('Segoe UI', 10.5)
    $botao.FlatStyle = 'Flat'
    $botao.FlatAppearance.BorderColor = $corDourado
    $botao.FlatAppearance.BorderSize = 1
    $botao.Cursor = [System.Windows.Forms.Cursors]::Hand
    if ($principal) {
        $botao.BackColor = $corDourado
        $botao.ForeColor = [System.Drawing.Color]::White
    } else {
        $botao.BackColor = $corFundo
        $botao.ForeColor = $corDourado
    }
    $botao
}

$ok = Novo-Botao $textos[$Acao][1] $true
$ok.DialogResult = [System.Windows.Forms.DialogResult]::OK
$form.Controls.Add($ok)
$form.AcceptButton = $ok

if ($Acao -eq 'Aviso') {
    $ok.Location = New-Object System.Drawing.Point(180, 366)
    $ok.Size = New-Object System.Drawing.Size(200, 44)
    $form.CancelButton = $ok
} else {
    $ok.Location = New-Object System.Drawing.Point(40, 366)
    $ok.Size = New-Object System.Drawing.Size(300, 44)

    $cancelar = Novo-Botao 'Cancelar' $false
    $cancelar.Location = New-Object System.Drawing.Point(360, 366)
    $cancelar.Size = New-Object System.Drawing.Size(160, 44)
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
    'Bloquear' { rundll32.exe user32.dll,LockWorkStation }
}
