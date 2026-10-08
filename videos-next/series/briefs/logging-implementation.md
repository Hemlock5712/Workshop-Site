# Brief: /logging-implementation (Logging, Workshop 4, 13 min page)

## 1. Teaches

- **Start the log once**: `DataLogManager.start()` plus `DriverStation.startDataLog(DataLogManager.getLog())` at the top of the `Robot` constructor. The first captures NetworkTables values and console output; the second adds what NetworkTables never sees (enabled state, robot mode, which OpMode, joysticks). Leave it on in every mode and every build.
- **Publish three signals** from the mechanism through `Telemetry.getTable(getName())` and `table.log(name, value)`, read in pairs: position (or velocity) against target, and applied voltage. `.in(Rotations)` decides the unit; say it again in the name.
- **Make it run all the time**: `Scheduler.getDefault().addPeriodic(() -> record())` as the last constructor line. Not from inside a command, because "a command logs only while it runs, so the trace stops the moment a button comes up."
- **Signal names**: unit in the name, let the table group, one writer per fact, add a signal only when you can name its question.
- **Read the file back** in AdvantageScope: `logs` folder, `NT:/Telemetry/Arm`, target and position on one graph, volts on another, lined up against the enabled interval. Three first-time failures: Empty tree, Flat line, Wrong scale.

## 2. The concept that needs motion

**A moment that's gone, and the file that kept it.** The page's opening claim is a timing claim: "A failure that lasts a tenth of a second is gone before anyone sees it. The file on disk is the only record." Show the arm doing something wrong for a blink while nobody looks, then show the same instant as a trace you can drag a cursor back over. The motion is a live number on the TalonFX card leaving a trail behind it: each loop drops a sample onto a strip that scrolls left, and afterwards the strip is a graph you can scrub.

Second motion, which is also the page's main failure: **logging from a command vs. from `addPeriodic`.** Same run twice. Command version: trace draws while the trigger is held, then goes flat at release even though the arm keeps moving. `addPeriodic` version: trace follows the arm the whole run. This reuses the Latched Request idea directly (a command only runs while held) and is the "Flat line" card and quiz 4/6.

**AdvantageScope itself should be a screen recording**, not animated: opening the `.wpilog`, expanding `NT:/Telemetry/Arm`, dragging signals onto graphs. Keep it to a 10 to 15 s insert or leave it to the page; the animated video should end on a stylised plot, not reproduce the tool's UI.

## 3. Student knows already / Sets up

- **Knows**: `/running-program` (Hardware Simulation, the latched demo: canceling isn't stopping). `/finish-conditions` gave `getPosition()`, `getTargetPosition()`, `isAtTarget()` (branch `mech-4-ReadingState`). `/coroutines` built `RaiseAndShootOpMode`, an unattended routine with `waitUntil(..., Seconds.of(3.0))` that silently `return`s on `timedOut()`. AdvantageScope installed in Prerequisites.
- **Sets up**: `/testing` (the other way to check a routine nobody watches). Workshop 5/6 drivetrain logs `Pose2d` through the same `log`.
- Note: the page's "You'll need" still says "the project from Hardware Simulation"; the lesson sits after Coroutines.

## 4. Code on screen

**Page code blocks are ground truth; no branch carries them.** Verified against the alpha-7 jars (`Telemetry.getTable(String)`, `TelemetryTable.log(String,double)`, `DriverStation.startDataLog(DataLog)`, `Scheduler.addPeriodic(Runnable)` all exist). `getPosition()`, `getTargetPosition()`, private `motor` match `mech-6-Testing` `Arm.java`. The branch `Robot()` constructor is empty, as the page says.

Robot.java (page block, trimmed):

```java
public Robot() {
  DataLogManager.start();
  DriverStation.startDataLog(DataLogManager.getLog());
}
```

Arm.java (page block):

```java
private void record() {
  TelemetryTable table = Telemetry.getTable(getName());

  table.log("PositionRot", getPosition().in(Rotations));
  table.log("TargetRot", getTargetPosition().in(Rotations));
  table.log("AppliedVolts", motor.getMotorVoltage().getValueAsDouble());
}
```

Arm constructor, last line (page block):

```java
  motor.getConfigurator().apply(talonFXCfg);
  Scheduler.getDefault().addPeriodic(() -> record());
```

The wrong version for the Flat-line beat is not on the page as code. If shown, label it as the mistake and keep it plausible, e.g. a `runRepeatedly(() -> { setPosition(0.25); record(); })` inside `vertical()`. Flywheel fork if needed: `VelocityRPS` / `TargetRPS` via `getVelocity()` / `getTargetVelocity()` `.in(RotationsPerSecond)`.

## 5. Misconceptions / failure modes

- **Flat line**: "The trace freezes partway through and holds one value. `record` is called from a command that finished, not from `addPeriodic`."
- **Flat isn't always broken**: "Telemetry writes an entry only when the value changes." "Every signal stopping at the same instant means the logging stopped. One flat signal among live ones means the thing it measures was flat."
- **Empty tree**: constructor lines never ran, or the `addPeriodic` line is missing.
- **Wrong scale**: right shape, off by the gear ratio; fix `SensorToMechanismRatio`.
- **Killing it while enabled**: "Entries reach disk in batches... the last second or two never gets written." Disable, stop, then cut power.
- Skipping `startDataLog`: "numbers with no way to tell whether the robot was enabled."
- A special logging build "records the next failure instead of the one you are trying to explain."
- Never mention AdvantageKit or Epilogue.

## 6. Interactive moment idea

**"Scrub to the moment."** After the unattended Raise And Shoot run, the student gets the finished plot (TargetRot steps to 0.25, PositionRot climbs and stalls short, enabled band behind) and drags a cursor along it. Prompt: "Find where the routine gave up." The correct answer is three seconds after the target stepped, with position still short: the `waitUntil` timed out. Snapping the cursor there lights the `timedOut()` line in the code panel. Fallback: two candidate traces side by side, "which one was logged from a command?"

## 7. Visual pieces needed beyond the kit

- **Scrolling trace strip** under the TalonFX card: three named rows (`Arm/PositionRot`, `Arm/TargetRot`, `Arm/AppliedVolts`), samples dropping in per loop; becomes a static, scrubbable graph with a time cursor.
- **Enabled band**: shaded interval behind the plot (what `startDataLog` contributes), and an OpMode label strip ("Raise And Shoot").
- **Pipeline diagram** (one beat only): `table.log` → `/Telemetry` → NetworkTables → DataLogManager → `.wpilog` file icon. Quiz 2 is exactly this chain.
- **File icon** with name `WPILIB_TBD_*.wpilog` renaming to a dated name (optional, tiny).
- Short AdvantageScope screen capture, if used.

## 8. Draft beat outline

1. **Cold open**: Raise And Shoot runs on its own. Arm rises, stops short, flywheel never spins, routine ends. Nobody saw why. "It already happened."
2. **Name it**: a log is a recording of numbers over time, kept in a file you can open afterwards.
3. **Connect**: last lesson's routine gives up quietly after three seconds. A driver can't see a timeout. A file can.
4. **Start the recorder**: Robot constructor, two lines highlight. Enabled band appears, OpMode label appears: that's the second line's job.
5. **Give it something to record**: `record()` highlights line by line; each `log` call grows one row on the trace strip. Unit word in the name glows next to the unit in the code.
6. **Make it always run**: the `addPeriodic` line. Loop ticks, samples drop every tick.
7. **The wrong place**: replay with `record()` inside the command. Hold trigger, trace draws; release, trace goes flat while the arm keeps moving on its latched request. "A command only logs while it runs."
8. **Your turn**: scrub the finished plot to the moment the routine gave up.
9. **Reveal**: cursor lands at target-plus-three-seconds, position short of target, `timedOut()` lights. Volts row shows the motor working the whole time, so it's tuning, not wiring.
10. **Two cautions, quick**: one flat row among live ones means the thing was still; disable and stop before pulling power or the last seconds are lost.
11. **Takeaway**: "Log from the start, all the time, and the file will tell you what nobody watched."
