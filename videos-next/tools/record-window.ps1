# Record one app window to MP4 for a fixed time while you drive it.
#   powershell -File tools/record-window.ps1 -Seconds 60 -Out captures/voltage-out.mp4
# The window must stay on top and unmoved while recording (it grabs that screen region).
param([string]$Process = "phoenix-tuner-x", [int]$Seconds = 30, [string]$Out = "recording.mp4", [int]$Fps = 30)

Add-Type @"
using System; using System.Runtime.InteropServices;
public class Win2 {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
}
"@
[Win2]::SetProcessDPIAware() | Out-Null
$best = $null; $area = 0
foreach ($p in Get-Process $Process -ErrorAction Stop) {
  $h = $p.MainWindowHandle
  if ($h -eq [IntPtr]::Zero) { continue }
  $r = New-Object Win2+RECT
  [Win2]::GetWindowRect($h, [ref]$r) | Out-Null
  $a = ($r.R - $r.L) * ($r.B - $r.T)
  if ($a -gt $area) { $area = $a; $best = @{ h = $h; r = $r } }
}
if (-not $best) { throw "no window for $Process" }
[Win2]::SetForegroundWindow($best.h) | Out-Null
# trim the invisible resize border Windows adds, and keep sizes even for H.264
Add-Type -AssemblyName System.Windows.Forms
$scr = [System.Windows.Forms.Screen]::FromHandle($best.h).Bounds
$x = [Math]::Max($best.r.L + 8, $scr.Left); $y = [Math]::Max($best.r.T, $scr.Top)
$x1 = [Math]::Min($best.r.R - 8, $scr.Right); $y1 = [Math]::Min($best.r.B - 8, $scr.Bottom)
$w = ($x1 - $x) -band -2; $hh = ($y1 - $y) -band -2
"recording ${w}x$hh at $x,$y for $Seconds s -> $Out"
ffmpeg -v error -y -f gdigrab -framerate $Fps -offset_x $x -offset_y $y -video_size "${w}x$hh" -draw_mouse 1 -i desktop -t $Seconds -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p $Out
"done"
