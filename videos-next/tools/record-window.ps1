# Record one app window to MP4 while you (or ui.ps1) drive it.
#   powershell -File tools/record-window.ps1 -Process PathPlanner -Out captures/pathplanner/raw.mp4
#   powershell -File tools/record-window.ps1 -Seconds 60 -Out captures/voltage-out.mp4
# Stops after -Seconds, or earlier when <Out>.stop appears (New-Item it from another shell),
# by sending ffmpeg "q" so the MP4 is finalized. The window must stay on top and unmoved
# while recording (it grabs that screen region).
# Writes <Out>.json beside the video: { start: <unix ms of the first frame>, x, y, w, h }
# in physical screen pixels, which tools/capture-edit.mjs lines up with the ui.ps1 log.
param([string]$Process = "phoenix-tuner-x", [int]$Seconds = 300, [string]$Out = "recording.mp4", [int]$Fps = 30)

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
$Out = [IO.Path]::GetFullPath($Out)
New-Item -ItemType Directory -Force (Split-Path $Out) | Out-Null
$stop = "$Out.stop"; Remove-Item $stop -ErrorAction SilentlyContinue
"recording ${w}x$hh at $x,$y for up to $Seconds s -> $Out  (stop early: New-Item '$stop')"

$psi = New-Object System.Diagnostics.ProcessStartInfo "ffmpeg"
# -use_wallclock_as_timestamps stamps each frame with the wall clock. One branch of the
# graph keeps frame 0 only and prints it (showinfo), which gives the first frame's unix
# time to the millisecond; the other branch is the recording, rebased to start at 0.
$graph = "[0:v]split[a][b];[b]select='eq(n,0)',showinfo,nullsink;[a]setpts=PTS-STARTPTS[v]"
$psi.Arguments = "-hide_banner -nostats -loglevel info -y -copyts -use_wallclock_as_timestamps 1 -f gdigrab -framerate $Fps -offset_x $x -offset_y $y -video_size ${w}x$hh -draw_mouse 1 -i desktop -t $Seconds -filter_complex `"$graph`" -map [v] -c:v libx264 -preset veryfast -crf 18 -g $Fps -pix_fmt yuv420p `"$Out`""
$psi.UseShellExecute = $false; $psi.RedirectStandardInput = $true; $psi.RedirectStandardError = $true
$ff = [System.Diagnostics.Process]::Start($psi)
$err = $ff.StandardError.ReadToEndAsync()
while (-not $ff.HasExited) {
  if (Test-Path $stop) { $ff.StandardInput.Write("q"); $ff.StandardInput.Flush(); break }
  Start-Sleep -Milliseconds 100
}
$ff.WaitForExit()
Remove-Item $stop -ErrorAction SilentlyContinue
$log = $err.Result
if ($log -notmatch "pts_time:([0-9.]+)") { $log; throw "no first-frame time from ffmpeg" }
$start = [int64]([double]$Matches[1] * 1000)
[ordered]@{ start = $start; x = $x; y = $y; w = $w; h = $hh; fps = $Fps } | ConvertTo-Json -Compress | Set-Content -Encoding utf8 "$Out.json"
"done $Out"
