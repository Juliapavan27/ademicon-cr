# Roda escondido desde o login e:
#   - mostra "BATER PONTO" ao entrar no Windows, ao voltar da suspensao e ao desbloquear a tela;
#   - troca o Windows + L: primeiro mostra o aviso e so bloqueia depois de "Ja bati o ponto";
#   - segura o desligamento (menu Iniciar ou botao de energia) exibindo "BATER PONTO" na tela do
#     Windows (basta clicar em "Desligar mesmo assim" depois de bater o ponto).

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
using Microsoft.Win32;

public class BaterPontoMonitor : Form
{
    [DllImport("user32.dll")]
    static extern bool ShutdownBlockReasonCreate(IntPtr hWnd, [MarshalAs(UnmanagedType.LPWStr)] string reason);
    [DllImport("user32.dll")]
    static extern bool ShutdownBlockReasonDestroy(IntPtr hWnd);
    [DllImport("wtsapi32.dll")]
    static extern bool WTSRegisterSessionNotification(IntPtr hWnd, int flags);

    delegate IntPtr HookProc(int nCode, IntPtr wParam, IntPtr lParam);
    [DllImport("user32.dll", SetLastError = true)]
    static extern IntPtr SetWindowsHookEx(int idHook, HookProc lpfn, IntPtr hMod, uint dwThreadId);
    [DllImport("user32.dll")]
    static extern bool UnhookWindowsHookEx(IntPtr hhk);
    [DllImport("user32.dll")]
    static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);
    [DllImport("user32.dll")]
    static extern short GetAsyncKeyState(int vKey);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
    static extern IntPtr GetModuleHandle(string lpModuleName);

    const int WM_QUERYENDSESSION = 0x11;
    const int WM_POWERBROADCAST = 0x218;
    const int WM_WTSSESSION_CHANGE = 0x2B1;
    const int PBT_APMSUSPEND = 0x4;
    const int PBT_APMRESUMESUSPEND = 0x7;
    const int PBT_APMRESUMEAUTOMATIC = 0x12;
    const int WTS_SESSION_LOCK = 0x7;
    const int WTS_SESSION_UNLOCK = 0x8;
    const int WH_KEYBOARD_LL = 13;
    const int WM_KEYDOWN = 0x100;
    const int WM_SYSKEYDOWN = 0x104;
    const int VK_L = 0x4C;
    const int VK_LWIN = 0x5B;
    const int VK_RWIN = 0x5C;

    const string ChavePolitica = @"HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Policies\System";

    readonly string avisoScript;
    readonly string flagFile;
    readonly HookProc hookProc;
    IntPtr hook = IntPtr.Zero;
    DateTime ultimoAviso = DateTime.MinValue;

    public BaterPontoMonitor(string avisoScript, string flagFile)
    {
        this.avisoScript = avisoScript;
        this.flagFile = flagFile;
        hookProc = TeclaPressionada;
        Text = "Bater Ponto - Monitor";
        ShowInTaskbar = false;
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.Manual;
        Location = new Point(-32000, -32000);
        Size = new Size(1, 1);
        Opacity = 0;
    }

    // Com o bloqueio do Windows desligado, o Windows + L nao faz nada e quem bloqueia
    // a tela e o bater-ponto.ps1, depois do aviso.
    public static void BloqueioDoWindows(bool ligado)
    {
        try { Registry.SetValue(ChavePolitica, "DisableLockWorkstation", ligado ? 0 : 1, RegistryValueKind.DWord); }
        catch { }
    }

    protected override void OnHandleCreated(EventArgs e)
    {
        base.OnHandleCreated(e);
        WTSRegisterSessionNotification(Handle, 0);
        BloqueioDoWindows(false);
        hook = SetWindowsHookEx(WH_KEYBOARD_LL, hookProc, GetModuleHandle("user32.dll"), 0);
    }

    protected override void OnFormClosed(FormClosedEventArgs e)
    {
        if (hook != IntPtr.Zero) UnhookWindowsHookEx(hook);
        BloqueioDoWindows(true);
        base.OnFormClosed(e);
    }

    protected override void OnShown(EventArgs e)
    {
        base.OnShown(e);
        Avisar("Aviso");
    }

    IntPtr TeclaPressionada(int nCode, IntPtr wParam, IntPtr lParam)
    {
        if (nCode >= 0)
        {
            int msg = wParam.ToInt32();
            if ((msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN) && Marshal.ReadInt32(lParam) == VK_L
                && (GetAsyncKeyState(VK_LWIN) < 0 || GetAsyncKeyState(VK_RWIN) < 0))
            {
                BeginInvoke((MethodInvoker)delegate { Avisar("Bloquear"); });
            }
        }
        return CallNextHookEx(hook, nCode, wParam, lParam);
    }

    bool DesligamentoAutorizado()
    {
        return File.Exists(flagFile)
            && (DateTime.Now - File.GetLastWriteTime(flagFile)).TotalMinutes < 2;
    }

    void Avisar(string acao)
    {
        if (acao == "Aviso")
        {
            if ((DateTime.Now - ultimoAviso).TotalSeconds < 10) return;
            ultimoAviso = DateTime.Now;
        }
        var info = new ProcessStartInfo("powershell.exe",
            "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File \"" + avisoScript + "\" -Acao " + acao);
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
                // Religa o bloqueio antes de suspender, para o Windows pedir a senha ao voltar.
                if (evento == PBT_APMSUSPEND) BloqueioDoWindows(true);
                if (evento == PBT_APMRESUMESUSPEND || evento == PBT_APMRESUMEAUTOMATIC) Avisar("Aviso");
                break;
            case WM_WTSSESSION_CHANGE:
                int sessao = m.WParam.ToInt32();
                if (sessao == WTS_SESSION_LOCK || sessao == WTS_SESSION_UNLOCK) BloqueioDoWindows(false);
                if (sessao == WTS_SESSION_UNLOCK) Avisar("Aviso");
                break;
        }
        base.WndProc(ref m);
    }
}
'@

try {
    [System.Windows.Forms.Application]::Run((New-Object BaterPontoMonitor -ArgumentList $aviso, $flag))
} finally {
    [BaterPontoMonitor]::BloqueioDoWindows($true)
}
