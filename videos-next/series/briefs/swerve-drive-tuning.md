# Brief: /swerve-drive-tuning, "Swerve Drive Tuning" (Workshop 5)

No branch prop (edits `1-Swerve`'s `TeleopOpMode.java`), 15 minutes. After /swerve-calibration; next is the autonomous half of Workshop 5.

## 1. Teaches (page order)

- **Wheel radius** (while still open-loop, since `kSpeedAt12Volts` means speed at 12 V): the effective radius, squashed and sunk into carpet. Tape, restart so `Drivetrain/Pose` reads (0, 0), drive ~5 m slowly, tape again. `newRadius = (actualDistance / reportedDistance) × currentRadius`; worked: tape 5.00, log 4.80, 2.167 in → 2.257 in. Three runs each way. "If it got worse, you inverted the ratio."
- **Top speed**: after radius. Full stick on six meters of competition surface; read the plateau of `Drivetrain/TranslationSpeedMps`, not the spike, into `kSpeedAt12Volts` (ships 4.54). `maxSpeed` in `TeleopOpMode` reads it back.
- **Slip current**: robot squared against a wall, Tuner X **Voltage Out** on one drive motor, plot velocity and stator current, ramp slowly. Current climbs, velocity zero; velocity jumps, current drops: read the top of the climb into `kSlipCurrent`. Shipped 120 A stator, 70 A supply in `driveInitialConfigs`; a flat 120 A trace means you're reading the limit. Danger box: stalled motors heat fast.
- **Close the drive loop**: velocity loop, kV then kS then kP, starts kP 0.2 / kV 0.124. Tune on the ground. Constant gap = kV; gap only at low speed = kS; slow recovery after a direction change = kP. Then switch `DriveRequestType.OpenLoopVoltage` → `DriveRequestType.Velocity`, last.
- **The deadband**: 10% of 4.54 m/s throws away ~0.45 m/s. Shrink, don't delete: on blocks, hands off, halve until `Drivetrain/ModuleTargets` speed twitches, back one.
- **Check**: 3 m square, back on the tape, pose near (0, 0) after twelve meters. Rotated square = zeros; worse after the switch = drive gains; odd pose numbers = nothing broken.

## 2. Format: **hybrid**

Mostly field and tool recordings (tape measure, AdvantageScope, Tuner X plot). Two concepts need animation: **effective radius and the correction ratio** (which way it goes), and **reading the slip point off two traces**.

**Shot list:**

1. Camera: tape at front edge; AdvantageScope `Drivetrain/Pose` reads (0, 0) after restart. Zoom: x readout.
2. Camera: slow 5 m drive; second tape; tape measure between marks. Split with AdvantageScope x at the end. Zoom: 5.00 vs 4.80.
3. VS Code `TunerConstants.java`: `kWheelRadius = Inches.of(2.167)` edited to the new value. Zoom the line.
4. AdvantageScope: full-stick run; line graph `Drivetrain/TranslationSpeedMps`; cursor on the plateau, not the spike. Zoom the plateau.
5. VS Code: `kSpeedAt12Volts = MetersPerSecond.of(4.54)`, then `TeleopOpMode`'s `maxSpeed` line reading it.
6. Camera: robot squared on a wall, all four wheels into it; one person on disable.
7. Tuner X: one drive TalonFX, Control **Voltage Out**, plot velocity and stator current, ramp slowly; the knee. Zoom: the peak before the drop. Short ramps, back to zero.
8. VS Code: `kSlipCurrent = Amps.of(120)` (show the field only; the student types their own).
9. AdvantageScope: commanded vs measured drive speed from `ModuleTargets` / `ModuleStates`, three gap shapes annotated.
10. VS Code `TeleopOpMode.java`: `DriveRequestType.OpenLoopVoltage` → `DriveRequestType.Velocity`. Zoom the one token.
11. On blocks, hands off: `ModuleTargets` speed flat; deadband `0.1` → `0.05`; twitch appears; back one.
12. Camera overhead: the square, robot back on the tape; AdvantageScope pose near (0, 0).

## 3. The concept that needs motion

**Which way the radius moves.** Odometry = wheel rotations × radius. A wheel squashed into carpet rolls a smaller circle than the file thinks... and the page's own example goes the other way (robot went further than reported → radius goes up). Animate a wheel rolling: the "file" circle and the "real" circle, the tape distance and the logged distance, and the ratio sliding into place. The quiz's distractor is the inverted ratio, so the picture must make "under-reports → bigger radius" visible.

**The slip knee.** Velocity at zero while current climbs, then both change at once. A two-trace plot synced to a wheel against a wall (tire gripping, then spinning) makes "read the top of the climb" obvious; prose alone invites reading after the drop.

## 4. Student knows already / Sets up

- **Knows**: zeros and steer gains, the angle plot (/swerve-calibration); `kSpeedAt12Volts`, `maxSpeed`, the default drive request (/swerve-drive-project); kV/kS/kP and feedforward-first (/pid-control); stator vs supply current (/hardware or Workshop 1 Tuner X lessons); `.wpilog` (/logging-implementation).
- **Sets up**: trustworthy odometry and a closed velocity loop for the autonomous lessons (/autonomous, /pathplanner), which drive `DriveMechanism` with field speeds; "pose measures from where the code started" until Vision.

## 5. Code or settings on screen

`1-Swerve` `src/main/java/frc/robot/opmodes/TeleopOpMode.java`, before → after (the only Java edit):

```java
.withDeadband(maxSpeed * 0.1)
.withRotationalDeadband(maxAngularRate * 0.1)
.withDriveRequestType(DriveRequestType.OpenLoopVoltage);
```

```java
.withDriveRequestType(DriveRequestType.Velocity);
```

`src/main/java/frc/robot/generated/TunerConstants.java`: `kWheelRadius = Inches.of(2.167)`, `kSpeedAt12Volts = MetersPerSecond.of(4.54)`, `kSlipCurrent = Amps.of(120)`, `driveGains = new Slot0Configs().withKP(0.2).withKI(0).withKD(0).withKS(0).withKV(0.124)`, `driveInitialConfigs ... withSupplyCurrentLimit(Amps.of(70))`. Those are the generator's example numbers, fine to show; never show a student's tuned gains.

## 6. Misconceptions / failure modes

- Inverted ratio (quiz 2): "a robot that under-reports needs a bigger radius."
- Speed before radius (quiz 3): the speed is wheel rotations × that radius.
- Reading current after the drop, or the 70 A supply limit (quiz 4); a flat 120 A means you measured the limit.
- Switching to `Velocity` first: "Velocity with untuned gains chases a speed the motor cannot hold" (quiz 1, failure grid).
- Tuning drive gains on blocks: no load, gains won't hold.
- Deleting the deadband: stick drift creeps the robot (quiz 5).
- Rotated square fixed with radius: "no radius correction fixes a heading error."

## 7. Interactive moment idea

"Fix the radius." Viewer sees tape 5.00 m and log 4.80 m and drags a slider on `kWheelRadius`; the logged distance re-computes live, and the ghost robot's end mark slides onto the tape when the ratio is right. Overshoot the wrong way and the gap widens.

## 8. Visual pieces needed

Top-down swerve robot + field (spec in `swerve-prerequisites.md`) with a **tape mark** and a **ghost end mark**; a side-view **wheel on carpet** with file vs effective radius circles; a **two-trace plot** (velocity, stator current) with a knee marker; a **wall** drawable with tire-grip/spin states; a **speed plateau plot**; motor card heat indicator for the stall warning.

## 9. Draft beat outline

1. **Open.** "The generator guessed three numbers. The carpet tells you the real ones."
2. **Order.** Radius, then speed, both on volts; then slip; then close the loop.
3. **Radius**: tape vs log; the ratio; which way it goes.
4. **Your turn**: drag the radius until the marks agree.
5. **Top speed**: plateau, not the spike, into `kSpeedAt12Volts`.
6. **Slip**: wall, Voltage Out, the knee. Stall safety.
7. **Measuring the limit**: flat 120 A, raise and ramp again.
8. **Velocity loop**: kV, kS, kP; on the ground.
9. **One word**: `OpenLoopVoltage` → `Velocity`, last.
10. **Deadband**: 0.45 m/s thrown away; halve until twitch, back one.
11. **Check**: the square; three failure shapes.

## 10. Site/branch mismatches

- The radius paragraph says the effective wheel is "squashed... sunk into carpet" (smaller), but the worked example and quiz 2 increase the radius (robot under-reports). Both are possible; the prose primes the wrong direction. Worth one clarifying sentence.
- Needs says two measurements "come out of a `.wpilog`"; `1-Swerve` has no `DataLogManager.start()`, which `2-Logging` adds. Live NT in AdvantageScope works on `1-Swerve`, so either say live plot or point to `2-Logging`.
- Page links /pid-control with a plain `<a>` and inline `style` colour, unlike the other pages' `Link` with `linkStyle`. Cosmetic.
