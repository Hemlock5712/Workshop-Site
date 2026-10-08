# Drive a desktop app by screen coordinates, one action per call.
#   ui.ps1 shot  <out.png> [scale]       screenshot of the whole screen (scaled for viewing)
#   ui.ps1 click <x> <y> [right|double]  physical pixel coordinates
#   ui.ps1 move  <x> <y>
#   ui.ps1 type  "<text>"                SendKeys syntax; {ENTER}, ^a (ctrl+a), {TAB}
#   ui.ps1 scroll <x> <y> <clicks>       negative = down
#   ui.ps1 focus [process]
#   ui.ps1 mark  <label>                 a named point in the log (e.g. "beat:zero", "end")
# With $env:UI_LOG set, every action appends one JSON line to that file:
#   {"t": <unix ms>, "a": "click", "x": 1234, "y": 567, ...}   x/y are physical screen pixels
# tools/capture-edit.mjs reads that log next to a record-window.ps1 recording.
param([string]$Action, [string]$A1, [string]$A2, [string]$A3)

Add-Type -AssemblyName System.Drawing, System.Windows.Forms
Add-Type @"
using System; using System.Runtime.InteropServices;
public class U {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, int dx, int dy, int d, IntPtr e);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
}
"@
[U]::SetProcessDPIAware() | Out-Null

function Log($a, $x, $y, $extra = @{}) {
  if (-not $env:UI_LOG) { return }
  $o = [ordered]@{ t = [DateTimeOffset]::Now.ToUnixTimeMilliseconds(); a = $a; x = [int]$x; y = [int]$y }
  foreach ($k in $extra.Keys) { $o[$k] = $extra[$k] }
  Add-Content -Path $env:UI_LOG -Value ($o | ConvertTo-Json -Compress) -Encoding utf8
}
function Cursor { $p = [System.Windows.Forms.Cursor]::Position; @($p.X, $p.Y) }

# $env:UI_APP names the process clicks focus first; Tuner X when unset.
function Focus($name = $(if ($env:UI_APP) { $env:UI_APP } else { "phoenix-tuner-x" })) {
  $p = Get-Process $name -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if ($p) { [U]::ShowWindow($p.MainWindowHandle, 3) | Out-Null; [U]::SetForegroundWindow($p.MainWindowHandle) | Out-Null; Start-Sleep -Milliseconds 250 }
}

switch ($Action) {
  "shot" {
    $b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.CopyFromScreen($b.Left, $b.Top, 0, 0, $bmp.Size)
    $scale = if ($A2) { [double]$A2 } else { 1.0 }
    if ($scale -ne 1.0) {
      $s = New-Object System.Drawing.Bitmap ([int]($b.Width * $scale)), ([int]($b.Height * $scale))
      $gs = [System.Drawing.Graphics]::FromImage($s); $gs.InterpolationMode = "HighQualityBicubic"
      $gs.DrawImage($bmp, 0, 0, $s.Width, $s.Height); $gs.Dispose(); $bmp.Dispose(); $bmp = $s
    }
    $bmp.Save($A1, [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
    "shot $A1 ($($b.Width)x$($b.Height) screen, scale $scale)"
  }
  "click" {
    Focus
    [U]::SetCursorPos([int]$A1, [int]$A2) | Out-Null; Start-Sleep -Milliseconds 120
    if ($A3 -eq "right") { [U]::mouse_event(0x08, 0, 0, 0, 0); [U]::mouse_event(0x10, 0, 0, 0, 0) }
    else {
      [U]::mouse_event(0x02, 0, 0, 0, 0); Start-Sleep -Milliseconds 60; [U]::mouse_event(0x04, 0, 0, 0, 0)
      if ($A3 -eq "double") { Start-Sleep -Milliseconds 80; [U]::mouse_event(0x02, 0, 0, 0, 0); [U]::mouse_event(0x04, 0, 0, 0, 0) }
    }
    Log "click" $A1 $A2 @{ button = $(if ($A3) { $A3 } else { "left" }) }
    "click $A1,$A2 $A3"
  }
  "move" { [U]::SetCursorPos([int]$A1, [int]$A2) | Out-Null; Log "move" $A1 $A2; "move $A1,$A2" }
  "type" { $c = Cursor; Log "type" $c[0] $c[1] @{ text = $A1 }; [System.Windows.Forms.SendKeys]::SendWait($A1); Log "typed" $c[0] $c[1]; "typed" }
  "scroll" {
    Focus
    [U]::SetCursorPos([int]$A1, [int]$A2) | Out-Null
    [U]::mouse_event(0x0800, 0, 0, [int]$A3 * 120, 0); Log "scroll" $A1 $A2 @{ clicks = [int]$A3 }; "scroll $A3"
  }
  "focus" { if ($A1) { Focus $A1 } else { Focus }; "focused" }
  "mark" { $c = Cursor; Log "mark" $c[0] $c[1] @{ label = $A1 }; "mark $A1" }
}
