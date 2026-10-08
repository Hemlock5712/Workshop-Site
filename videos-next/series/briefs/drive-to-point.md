# Brief: /drive-to-point, "Drive to Point" (Workshop 6)

Branch **`5-DriveToPoint`** (page sets `branch`). Swerve chain: `frc.robot.commands`, `frc.robot.subsystems`, `frc.robot.opmodes.TeleopOpMode`; show as is. Diff from `4-DynamicFlywheel` adds `commands/DriveToPoint.java` (88 lines), `utils/ClassicCommand.java` (123 lines), two bindings, and deletes the flywheel. 15 minutes. Opens the navigation half of Workshop 6, after the two vision lessons.

## 1. Teaches (page order)

- **The target pose**: a `Pose2d` is X m, Y m, and a `Rotation2d` heading, measured from the blue corner for both alliances. `getPose()` is only what odometry counted; without Vision, A sends the robot "somewhere you did not intend."
- **Four methods to fill in**: `ClassicCommand` (a workshop file, not WPILib) is a coroutine body that calls `initialize()` once, then `execute()` / `isFinished()` / `yield()` in a loop, then `end(false)`; `onCancel()` calls `end(true)`. `super("DriveToPoint", drivetrain)` gives name + requirement. First use of `super` and `this`.
- **Build the command**: three `PIDController`s (X, Y kP 10; heading kP 7), one `ApplyFieldVelocity` with `BlueAlliance` perspective. Heading gets `enableContinuousInput(-Math.PI, Math.PI)`; meters do not wrap. `calculate(measurement, setpoint)` → kP × error → `ChassisVelocities(vx, vy, omega)`. `isFinished()` is `false`, so it cannot sit in a sequence. Stop in `end(...)` with a zero `ChassisVelocities`, not `SwerveRequest.Idle`.
- **The gains**: not Slot 0. kP 10 means 10 m/s per meter of error. Three meters out asks for **30 m/s** against **4.54 m/s**. "The robot lurches away at full power, then crawls in over the last half meter."
- **Check**: drives and turns together; stick ignored while held; release mid-trip stops; B parks at (3, 2, 180°) making small corrections; speed graph is flat-out then a steep falloff.

## 2. Format: **animated**

Everything here is a picture of numbers on a field: a pose, an error vector, a velocity arrow proportional to it, a clamp at top speed, a wrap on a heading dial. The procedure (copy a file, add two bindings) is short and VS Code footage adds nothing a code panel doesn't.

## 3. The concept that needs motion

**Speed proportional to distance.** A static diagram can say "kP × error"; only motion shows what that _feels_ like: an arrow from robot to goal, a velocity arrow ten times its length, clipped hard at the 4.54 m/s ring, so the robot bolts, then the clip releases about 0.45 m out and the arrow shrinks with the gap until the robot crawls and stalls short. A live speed-vs-time trace drawn beside it produces the page's last check (flat top, steep fall). Second: **heading wrap**, a dial at 179° asked for −179° spinning the long way, then the short way once continuous input is on.

## 4. Student knows already / sets up

- **Knows:** the three failure shapes and "kP is output per unit of error" (/pid-control: _Runs away_, _Buzzes_, _Falls short_); Motion Magic's trapezoid (/motion-magic, /motion-magic-code); `whileTrue`, holds (/adding-commands, /opmodes); coroutine `while` + `yield()` (/coroutines); latched requests (/running-program#latched); pose from odometry and vision (/swerve-calibration, /vision-implementation); graphing `Drivetrain/*` (/logging-implementation).
- **Sets up:** /advanced-drive-to-point keeps this file and swaps the raw P for a planned trip; its finish line fixes the `false` here.

## 5. Code on screen

`5-DriveToPoint`, `utils/ClassicCommand.java` (the part that matters, page block):

```java
public final void run(Coroutine coroutine) {
  initialize();
  while (true) {
    execute();
    if (isFinished()) {
      break;
    }
    coroutine.yield();
  }
  end(false); // natural finish
}

public final void onCancel() {
  end(true);
}
```

`commands/DriveToPoint.java`, trimmed:

```java
  private final PIDController xController = new PIDController(10, 0, 0);
  private final PIDController yController = new PIDController(10, 0, 0);
  private final PIDController headingController = new PIDController(7, 0, 0);

  @Override
  protected void execute() {
    Pose2d currentPose = drivetrain.getPose();
    double vx = xController.calculate(currentPose.getX(), targetPose.getX());
    double vy = yController.calculate(currentPose.getY(), targetPose.getY());
    double omega =
        headingController.calculate(
            currentPose.getRotation().getRadians(), targetPose.getRotation().getRadians());
    drivetrain.setControl(driveRequest.withVelocity(new ChassisVelocities(vx, vy, omega)));
  }

  @Override
  protected void end(boolean interrupted) {
    drivetrain.setControl(driveRequest.withVelocity(new ChassisVelocities()));
  }
```

`opmodes/TeleopOpMode.java`:

```java
    driver.a().whileTrue(new DriveToPoint(drivetrain, Pose2d.ZERO));
    driver
        .b()
        .whileTrue(new DriveToPoint(drivetrain, new Pose2d(3, 2, Rotation2d.fromDegrees(180))));
```

10 / 10 / 7 are the branch's own TODO starting points and are printed on the page; they can appear as the arithmetic ("10 × 3 m = 30 m/s"). Never `ChassisSpeeds`, never `kZero`.

## 6. Misconceptions / failure modes

- "These three controllers are not the Slot 0 gains you tuned in Tuner X." Meters/radians in, chassis velocity out, in code, once a loop.
- **Drives off confidently the wrong way**: "Suspect the pose, not the gains." Graph `Drivetrain/Pose` first; then check `ForwardPerspectiveValue.BlueAlliance`. (Visually the /pid-control _Runs away_ shape, different cause.)
- **Creeps in, never arrives**: "One centimeter of error asks for 10 cm/s... there is no I term." The _Falls short_ shape.
- `Idle` as a stop: "Idle does nothing to the modules, so each one keeps its last request." Teleop forgives a missing stop (joystick default); autonomous does not. Link /running-program#latched, don't re-teach.
- `isFinished()` false: "A sequence handed a command that never ends sticks on that leg forever."
- Compile errors: `ChassisSpeeds`, `.named(...)` on the new command, `super(...)` not first.
- Untuned on real hardware: "A gain this large turns a wrong pose into a fast wrong move."

## 7. Interactive moment idea

**"Drag the goal."** The viewer drags a ghost target pose (a robot outline with a heading notch) anywhere on the field; the error arrow, the 10× velocity arrow and the top-speed ring update live. Hold A: the robot bolts, the speed trace draws, the arrow comes off the ring near the goal, and it creeps. A toggle "heading wrap off/on" lets them set 179° → −179° and watch it spin the long way.

## 8. Visual pieces needed (new: top-down field + swerve robot kit)

This is the first navigation video; the kit below serves all four.

- **Field**: top-down, blue-origin axes drawn from the blue corner (X down-field, Y to the left), a 1 m grid, origin marker that never flips. Optional red-alliance overlay that shows the operator's forward flipping while the axes stay put.
- **Swerve robot**: square bumper with a heading notch/arrow, four modules each with a wheel angle and a speed bar (so `Idle` vs zero is visible: on Idle the bars stay lit). A trail of recent poses.
- **Pose readout**: `(x, y, θ)` chip on the robot; a ghost robot for the goal pose.
- **Vectors**: error vector (robot → goal), commanded velocity vector, angular rate arc; a top-speed ring at 4.54 m/s that clips the velocity arrow (red clip mark).
- **Heading dial**: −π…π with the wrap seam marked, showing short vs long way.
- **Speed-vs-time trace** (like AdvantageScope's line graph, labeled `Drivetrain/TranslationSpeedMps`).
- **Swerve request card** (counterpart of the TalonFX card): request type and the latest `ChassisVelocities`; states `ApplyFieldVelocity (vx, vy, ω)`, `zero`, and `Idle` (bars frozen on last values).
- Code panel and controller (A/B) from the existing kit; scheduler lane for "Drivetrain" showing joystick default vs DriveToPoint.

## 9. Draft beat outline

1. **Name it.** "Hold a button, and the robot drives itself to a spot on the field."
2. **Connect.** Every meter so far a human drove; the pose from vision and odometry is the robot's idea of where it is.
3. **The pose.** Field from the blue corner, a `Pose2d` chip, goal ghost at (3, 2, 180°).
4. **Four methods.** `ClassicCommand` as a coroutine loop: initialize, execute, isFinished, yield; `onCancel` → `end(true)`. "It's the `while` and `yield` you already wrote, with four slots."
5. **Three controllers.** X, Y, heading; error arrows on each axis; robot drives and turns together.
6. **The wrap.** 179° to −179° spins the long way; `enableContinuousInput` takes the short way.
7. **The arithmetic.** 3 m × 10 = 30 m/s; arrow pinned to the 4.54 ring; speed trace flat-out.
8. **Your turn.** Drag the goal; hold A.
9. **The creep.** Near the goal the arrow shrinks to nothing; it stalls short. Callback to _Falls short_.
10. **The stop.** Release mid-trip: `end(true)` sends zero; the Idle version shown beside it keeps rolling (module bars stay lit). One line to /running-program.
11. **Takeaway.** "Speed proportional to distance gets you there, badly. Next, plan the trip."

## 10. Site/branch mismatches

- **Page says the branch still sends Idle** (prose "which the branch's copy still sends" and the top comment "the branch still sends Idle and needs the same one-line edit"). `5-DriveToPoint`'s `end()` already sends `driveRequest.withVelocity(new ChassisVelocities())` with the comment "Zero speed, not SwerveRequest.Idle". The page sentence is stale; delete it.
- Teleop binding on the branch uses a local alias `final DriveMechanism drivetrain = robot.drivetrain;`. The mech-chain rule (no aliases) does not apply to the unrebuilt swerve chain; show as is.
- The branch also deletes `Flywheel.java` and `TalonFXUtil.java`; the page no longer mentions it. Fine, but the PR #11 diff will show it.
