# Roda escondido desde o login e:
#   - mostra "BATER PONTO" ao entrar no Windows, ao voltar da suspensao e ao desbloquear a tela;
#     (ao bloquear, quem mostra o aviso e a imagem da tela de bloqueio, configurada no instalar.ps1)
#   - segura o desligamento/reinicio pelo menu Iniciar exibindo "BATER PONTO" na tela do Windows
#     (basta clicar em "Desligar mesmo assim" depois de bater o ponto).

$aviso = Join-Path $PSScriptRoot 'bater-ponto.ps1'
$flag = Join-Path $env:TEMP 'bater-ponto-autorizado.txt'

$mutex = New-Object System.Threading.Mutex($false, 'Local\BaterPontoMonitor')
if (-not $mutex.WaitOne(0)) { exit }

Add-Type -ReferencedAssemblies System.Windows.Forms, System.Drawing -TypeDefinition @'
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;

public class BaterPontoMonitor : Form
{
    [DllImport("user32.dll")]
    static extern bool ShutdownBlockReasonCreate(IntPtr hWnd, [MarshalAs(UnmanagedType.LPWStr)] string reason);
    [DllImport("user32.dll")]
    static extern bool ShutdownBlockReasonDestroy(IntPtr hWnd);
    [DllImport("wtsapi32.dll")]
    static extern bool WTSRegisterSessionNotification(IntPtr hWnd, int flags);

    const int WM_QUERYENDSESSION = 0x11;
    const int WM_POWERBROADCAST = 0x218;
    const int WM_WTSSESSION_CHANGE = 0x2B1;
    const int PBT_APMRESUMESUSPEND = 0x7;
    const int PBT_APMRESUMEAUTOMATIC = 0x12;
    const int WTS_SESSION_UNLOCK = 0x8;

    readonly string avisoScript;
    readonly string flagFile;
    DateTime ultimoAviso = DateTime.MinValue;

    public BaterPontoMonitor(string avisoScript, string flagFile)
    {
        this.avisoScript = avisoScript;
        this.flagFile = flagFile;
        Text = "Bater Ponto - Monitor";
        ShowInTaskbar = false;
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.Manual;
        Location = new Point(-32000, -32000);
        Size = new Size(1, 1);
        Opacity = 0;
    }

    protected override void OnHandleCreated(EventArgs e)
    {
        base.OnHandleCreated(e);
        WTSRegisterSessionNotification(Handle, 0);
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e);
        Avisar();
    }

    bool DesligamentoAutorizado()
    {
        return File.Exists(flagFile)
            && (DateTime.Now - File.GetLastWriteTime(flagFile)).TotalMinutes < 2;
    }

    void Avisar()
    {
        if ((DateTime.Now - ultimoAviso).TotalSeconds < 10) return;
        ultimoAviso = DateTime.Now;
        var info = new ProcessStartInfo("powershell.exe",
            "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File \"" + avisoScript + "\"");
        info.UseShellExecute = false;
        info.CreateNoWindow = true;
        try { Process.Start(info); } catch { }
    }

    protected override void WndProc(ref Message m)
    {
        switch (m.Msg)
        {
            case WM_QUERYENDSESSION:
                if (DesligamentoAutorizado())
                {
                    ShutdownBlockReasonDestroy(Handle);
                    m.Result = (IntPtr)1;
                }
                else
                {
                    ShutdownBlockReasonCreate(Handle, "BATER PONTO! Depois de registrar o ponto, clique em \"Desligar mesmo assim\".");
                    m.Result = IntPtr.Zero;
                }
                return;
            case WM_POWERBROADCAST:
                int evento = m.WParam.ToInt32();
                if (evento == PBT_APMRESUMESUSPEND || evento == PBT_APMRESUMEAUTOMATIC) Avisar();
                break;
            case WM_WTSSESSION_CHANGE:
                if (m.WParam.ToInt32() == WTS_SESSION_UNLOCK) Avisar();
                break;
        }
        base.WndProc(ref m);
    }
}
'@

[System.Windows.Forms.Application]::Run((New-Object BaterPontoMonitor -ArgumentList $aviso, $flag))
