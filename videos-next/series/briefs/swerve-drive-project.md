# Brief: /swerve-drive-project, "Swerve Project Generator" (Workshop 5)

Branch `1-Swerve`, 60 minutes. After /swerve-prerequisites, before /swerve-calibration.

## 1. Teaches (page order)

- **What the generator writes**: only `src/main/java/frc/robot/generated/TunerConstants.java` comes back. It holds thirteen IDs, `kDriveGearRatio`, `kSteerGearRatio`, `kWheelRadius`, per-module X/Y offsets and CANcoder offsets; `steerGains`, `driveGains`, `kSlipCurrent`, `kSpeedAt12Volts` are estimates. The checked-in copy is someone else's robot: square, 10 in offsets, 7.36:1, fake IDs.
- **Six steps**: unique IDs on one bus → Mechanisms → New Project → four measurements (wheelbase FL to BL, trackwidth FL to FR, wheel radius, drive ratio) → module test on blocks, hold wheel straight (CANcoder offset) → replace `TunerConstants.java` → team number in `.wpilib/wpilib_preferences.json` (ships `5712`), deploy to SystemCore.
- **Full simulation**: **Simulate Robot Code** (not Hardware Sim); drag controller onto **Joystick[0]**, **Teleoperated**, select **Teleop**; AdvantageScope `Drivetrain/Pose` on a 2D field.
- **Three files, one drivetrain**: `TunerConstants` (Tuner X's), `CommandSwerveDrivetrain` (Tuner X's, lightly edited), `DriveMechanism` (workshop's, `implements Mechanism`, owns the drivetrain privately; `applyRequest`, `seedFieldCentric`, `setControl`, `getPose`, `getFieldVelocity`, `addVisionMeasurement`).
- **The drivetrain default command**: a drivetrain's last request is a speed, so teleop gives it a real default, the only `setDefaultCommand` in the workshop code. Built on `runRepeatedly`, so released sticks send zero.
- **Check**: on blocks, still at enable; forward stick → four modules aligned; right stick → rotation pattern; on the floor, field-centric holds after a 90° turn; release → stops.

## 2. Format: **hybrid**, mostly screen recording

The generator is a procedure in Tuner X (recording). One short animated beat earns its place: **why the drivetrain needs a default command and the arm didn't**, reusing the latched-request picture. Simulation is a short VS Code + AdvantageScope recording.

**Shot list** (Tuner X; labels from CTRE's generator docs, verify on capture since the page warns "Tuner X moves its controls between releases"):

1. Tuner X **Devices** list: thirteen devices on the CANivore, no duplicate-ID warning, no red firmware badge. Zoom: the device count and bus name.
2. **Mechanisms** page → swerve generator → **New Project** (beside **Import Project**). Zoom: the button.
3. Dimension form: **Wheel Radius (inches)**, **FL to FR distance (inches)**, **FL to BL distance (inches)**, **Module Type**, **Drive Ratio**. Type each. Zoom field by field; pause on the two FL labels (the swapped pair).
4. Module config: pick a module (dropdown on the left, or the yellow corner squares on the robot icon top-left); select encoder, steer motor, drive motor. Zoom: device dropdowns; the warning icon if an ID is reused.
5. **Encoder Calibration** popup with a cut-in of hands holding the wheel straight, bevel gear facing in. Module leaves **Incomplete Modules**. Repeat ×4 at speed.
6. **Configuration Completed!** Note CTRE's warning that devices are factory-defaulted.
7. Verification: **Verify Steer** (modules turn counter-clockwise seen from above), **Verify Drive**. A cut-in of the wrong corner moving = swapped IDs.
8. **Generate only TunerConstants**; then the **Save As** export icon top-right (lets calibration regenerate later).
9. VS Code: replace the file in `src/main/java/frc/robot/generated/`; zoom on the `kCANBus` line and your IDs.
10. VS Code: `.wpilib/wpilib_preferences.json` team number; WPILib deploy.
11. Driver station: **Teleop** in the mode list.
12. Simulation: **Simulate Robot Code**, Joystick[0], Teleoperated, Teleop; AdvantageScope 2D field with `Drivetrain/Pose`; push the stick, robot moves, let go, robot stops.

## 3. The concept that needs motion

**Canceled is not stopped, and a drivetrain's last request is a speed.** The arm's latched request is a position, so it holds; a drivetrain left on "2 m/s forward" keeps rolling. The default command fixes it by never ending: every loop it re-reads the sticks, and centered sticks send zero. A scheduler-timeline lane with `applyRequest` running forever, and its request card ticking "vx 0.0" when the sticks centre, carries it. Link, don't re-teach: /running-program#latched.

## 4. Student knows already / Sets up

- **Knows**: module anatomy, field-centric, thirteen devices taped by corner (/swerve-prerequisites); deploy and Hardware Sim (/running-program); OpModes and bindings (/opmodes); `runRepeatedly` (/adding-commands); latched requests (/running-program#latched); AdvantageScope (/logging-implementation).
- **Sets up**: /swerve-calibration re-zeros and tunes steer gains from this project, re-generating `TunerConstants` (export the project now). `seedFieldCentric()` vs `resetPose` is finished there. `DriveRequestType.OpenLoopVoltage` is switched in /swerve-drive-tuning.

## 5. Code on screen

`1-Swerve`, `src/main/java/frc/robot/opmodes/TeleopOpMode.java` (matches the page block):

```java
private final SwerveRequest.FieldCentric drive =
    new SwerveRequest.FieldCentric()
        .withDeadband(maxSpeed * 0.1)
        .withRotationalDeadband(maxAngularRate * 0.1)
        .withDriveRequestType(DriveRequestType.OpenLoopVoltage);
```

```java
drivetrain.setDefaultCommand(
    drivetrain.applyRequest(
        () ->
            drive
                .withVelocityX(-driver.getLeftY() * maxSpeed)
                .withVelocityY(-driver.getLeftX() * maxSpeed)
                .withRotationalRate(-driver.getRightX() * maxAngularRate)));

driver.leftBumper().onTrue(drivetrain.seedFieldCentric());
```

`src/main/java/frc/robot/subsystems/DriveMechanism.java`:

```java
public Command applyRequest(Supplier<SwerveRequest> request) {
  return runRepeatedly(() -> drivetrain.setControl(request.get())).named("applyRequest");
}
```

`TunerConstants.java` lines worth a zoom (example robot, safe to show, not tuned gains of the student's): `kDriveGearRatio = 7.363636363636365`, `kWheelRadius = Inches.of(2.167)`, `kFrontLeftXPos = Inches.of(10)`, `kCANBus = new CANBus("canivore")`, `kSpeedAt12Volts = MetersPerSecond.of(4.54)`.

Do not show the `Robot` disabled binding as a stop (it uses `SwerveRequest.Idle`, which is not a stop; it is harmless only because disabling cuts output). If a video ever needs to stop the drivetrain from a command, the stop is `driveRequest.withVelocity(new ChassisVelocities())`.

## 6. Misconceptions / failure modes

- Taking the whole generated project instead of one file (quiz 1).
- Wrong corner moves in the test: "two CAN IDs are swapped" (quiz 2), not an offset or an inversion.
- One module fighting the others: "Re-run the module test for that corner rather than editing the file" (quiz 6).
- "Nothing moves and no error appears": Teleop not selected, or the `setDefaultCommand` line missing.
- Robot stops because canceling sends zero / falls back to idle: wrong; the default command is "asking for zero" (quiz 4).
- `seedFieldCentric()` zeroes x and y: no, heading reference only (quiz 5).
- A default command requiring another mechanism: `IllegalArgumentException` at runtime.

## 7. Interactive moment idea

In the animated beat: the viewer flicks the stick and releases. With the default command, the request card drops to zero and the robot stops. A toggle "delete `setDefaultCommand`" swaps in a one-shot drive command; release and the robot keeps rolling off the field.

## 8. Visual pieces needed

Top-down swerve robot + field from the /swerve-prerequisites brief; controller with sticks and left bumper; scheduler timeline (kit) with a drivetrain lane; a request card reading `FieldCentric vx / vy / ω`.

## 9. Draft beat outline

1. **Open.** "Tuner X measures your drivetrain and writes one file."
2. **Thirteen devices** in the Devices list.
3. **Four numbers**: measure, type; the swapped pair.
4. **Module by module**: devices, wheel held straight, Encoder Calibration.
5. **Verify**: wrong corner = swapped IDs.
6. **Generate only TunerConstants**, export the project.
7. **Swap the file**, team number, deploy; Teleop listed.
8. **Simulate** with no robot; pose moves on the 2D field.
9. **Three files**: who wrote what; `DriveMechanism` is what you talk to.
10. **A speed stays latched** (animated); the default command sends zero every loop.
11. **Check**: aligned modules, rotation splay, field-centric after a 90° turn, release and stop.

## 10. Site/branch mismatches

- **Download tag is behind the branch.** The page's button downloads `v3.0-swerve`, which is commit `06d3460` (alpha-6, `extends Mechanism`, Phoenix `26.50.0-alpha-1`, a separate `Telemetry.java`). `1-Swerve` is `cdee4c0` (alpha-7, `implements Mechanism`, Phoenix 26.70). The page text says `DriveMechanism` "implements `Mechanism`", which the download does not. Retag or cut a new release before recording.
- Step 3, "Wheel radius: half the tread width": tread width is the wrong dimension (CTRE's doc says "width of the module wheel" meaning diameter). Should read half the wheel's diameter.
- `TeleopOpMode` keeps `final DriveMechanism drivetrain = robot.drivetrain;`, the alias pattern the mech chain dropped; fine to show as is until the swerve rebuild.
- `Robot.java` comment "Brake while disabled" sits on a `SwerveRequest.Idle` binding; Idle does not brake. Don't put that comment on screen.
- 2-Logging only adds `DataLogManager.start()`; 1-Swerve already publishes `Drivetrain/*` through `Telemetry`, so live AdvantageScope works on this branch.
