# Capture one app window to PNG, even behind other windows (PrintWindow with
# PW_RENDERFULLCONTENT, which also catches GPU-drawn apps like Tuner X).
#   powershell -File tools/capture-window.ps1 -Process phoenix-tuner-x -Out captures/x.png
param([string]$Process = "phoenix-tuner-x", [string]$Out = "capture.png")

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System; using System.Runtime.InteropServices;
public class Win {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint flags);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
"@
[Win]::SetProcessDPIAware() | Out-Null

# the biggest visible window of that process is the app
$best = $null; $area = 0
foreach ($p in Get-Process $Process -ErrorAction Stop) {
  $h = $p.MainWindowHandle
  if ($h -eq [IntPtr]::Zero) { continue }
  $r = New-Object Win+RECT
  [Win]::GetWindowRect($h, [ref]$r) | Out-Null
  $a = ($r.R - $r.L) * ($r.B - $r.T)
  if ($a -gt $area) { $area = $a; $best = @{ h = $h; r = $r } }
}
if (-not $best) { throw "no window for $Process" }
if ([Win]::IsIconic($best.h)) { [Win]::ShowWindow($best.h, 9) | Out-Null; Start-Sleep -Milliseconds 400; [Win]::GetWindowRect($best.h, [ref]$best.r) | Out-Null }

$w = $best.r.R - $best.r.L; $hgt = $best.r.B - $best.r.T
$bmp = New-Object System.Drawing.Bitmap $w, $hgt
$g = [System.Drawing.Graphics]::FromImage($bmp)
$dc = $g.GetHdc()
[Win]::PrintWindow($best.h, $dc, 2) | Out-Null   # 2 = PW_RENDERFULLCONTENT
$g.ReleaseHdc($dc); $g.Dispose()
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
"$Out ${w}x$hgt"
