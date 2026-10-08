# Brief: /swerve-prerequisites, "How Swerve Works" (Workshop 5, first lesson)

No branch, no code on the page, 12 minutes. Opens Workshop 5. Next is /swerve-drive-project.

## 1. Teaches (page order)

- **What makes a drive "swerve"**: a module at each corner, each with **two motors**, "one spins the wheel, the other points it". The robot can travel one way while facing another: **holonomic** motion. "You never write the swerve math": **kinematics** lives in `TunerConstants.java` and `CommandSwerveDrivetrain.java`; you ask for a chassis speed. New device: the **Pigeon 2 gyro** (`kPigeonId`).
- **Driver forward**: robot-centric (forward follows the robot's nose, no gyro) vs field-centric (forward is down the field, "even if it has to drive backwards to do it", needs the gyro to subtract heading). The workshop code only drives field-centric (`SwerveRequest.FieldCentric`). WatchOut: `applyOperatorPerspective` flips the driver's forward by alliance, 0° blue, 180° red.
- **Where am I? `Pose2d`**: X down the field from the blue driver station, Y across to the left, a `Rotation2d` heading (`Rotation2d.fromDegrees(180)`, `Rotation2d.ZERO`). WatchOut: "(0, 0) is the blue corner, even when you are on red." Only the driver's forward flips; the field frame never does.
- **Odometry, and why it goes wrong**: each loop adds up wheel travel and direction. "It is addition and it never subtracts." Slip, a 1% wrong radius (10 cm per 10 m, always the same way), being shoved or lifted. Two fixes: calibration (slower drift), vision via `addVisionMeasurement(...)` (correction).
- **Check**: on a real robot, tape the four corners named from behind, find the drive motor, steer motor, CANcoder, Pigeon 2, CANivore. "Thirteen devices."

## 2. Format: **animated**

Every idea on the page is spatial: two meanings of "forward", a coordinate frame that does not flip while the driver's forward does, an error that only accumulates. Nothing on the page is a procedure in a tool. The check is physical and stays on the page.

## 3. The concept that needs motion

**Field-centric: the stick names a field direction, and the wheels work out the rest.** Prose says "even if it has to drive backwards"; a picture of a robot spinning slowly while its translation arrow stays pinned down-field, wheels re-pointing every frame, makes it obvious. The same scene, toggled to robot-centric, shows the translation arrow rotating with the nose.

**Two kinds of flip.** Red driver at the far wall: the "driver forward" arrow turns 180°, the field axes at the blue corner do not move, and the pose readout shows a large X. This is the page's main trap and quiz 3.

**Drift.** A solid robot (true) and a ghost robot (odometry) start together; a slip, a shove and a slightly-wrong radius pull them apart, and they never come back together.

Module vectors as the way the robot moves sideways is fine as one opening beat (the page says each wheel "can point wherever it likes"), but **the page never teaches module vector addition or angle optimization**, and says "Nothing in Workshop 5 asks you to compute a wheel angle." Show the wheels re-pointing as a visual consequence; do not narrate the vector math or the flip-instead-of-turn-180° optimization. If the caller wants optimization, it needs a page change first.

## 4. Student knows already / Sets up

- **Knows**: CAN bus, CANcoder, CANivore (/hardware); a TalonFX holds a request (/running-program#latched); a mechanism has commands (/mechanisms, /adding-commands); logging and AdvantageScope (/logging-implementation).
- **Sets up**: /swerve-drive-project needs the thirteen device IDs corner by corner, the vocabulary `TunerConstants.java` / `CommandSwerveDrivetrain.java`, and field-centric + the left bumper's "forward". /swerve-calibration needs "drift" and the forward-vs-pose distinction. Workshop 6 needs `Pose2d` from the blue corner.

## 5. Code or settings on screen

None on the page. Allowed labels only: `SwerveRequest.FieldCentric`, `Pose2d`, `Rotation2d.ZERO`, `drivetrain.getPose()`, `applyOperatorPerspective`, `kPigeonId`. Real values from `1-Swerve` `CommandSwerveDrivetrain.java`: blue perspective `Rotation2d.ZERO`, red `Rotation2d.PI`. Use `ZERO`, never `kZero`.

## 6. Misconceptions / failure modes

- Field-centric robot facing you, stick away: it "drives away from you, backwards", not toward you (quiz 1).
- Red alliance flips the coordinates: no, "(0, 0) stays in the blue corner; only the driver's idea of forward flipped" (quiz 3). "A red robot parked against its own wall reports a large X, not zero."
- Odometry drift is noise: "not noise, but an error that only accumulates."
- Fewer than thirteen devices "is a wiring fault to fix first."

## 7. Interactive moment idea

"Drive it field-centric." The viewer holds the left stick in one direction (a single arrow key) and spins the robot with the right stick. The translation arrow stays pinned to the field while the nose turns and all four wheel arrows re-point. A toggle switches to robot-centric so the same input sends the robot curving off. Optional second gate: pick an alliance; the driver-forward arrow flips, the field axes and pose readout do not.

## 8. Visual pieces needed (new: top-down swerve robot + field)

**Top-down swerve robot drawable** (`drawSwerveRobot(ctx, pose, modules, opts)`):

- Square chassis, bumpers, a clear **front marker** (notch or colored bumper edge) and a **heading arrow** from center.
- **Four modules** at the corners, labelled FL / FR / BL / BR (toggleable), each drawn as a wheel rectangle **rotated to its steer angle**, independent of the chassis rotation.
- A **speed arrow per module** along the wheel direction, length proportional to wheel speed, reversing when the wheel runs backwards.
- Optional per-module parts for the check beat: drive motor, steer motor, CANcoder on top; a Pigeon 2 and CANivore on the frame.
- Optional **chassis-motion arrow** (translation) and a curved **rotation arrow** at center.
- `ghost` mode (translucent) for the odometry pose, and a fading trail.

**Field drawable** (`drawField`):

- Top-down field outline with blue and red driver stations at the ends.
- **Field axes at the blue corner**: +X down the field, +Y to the left, origin dot labelled (0, 0). Never moves.
- A **driver-forward arrow** at a driver station, which rotates 180° for red.
- A **pose readout** card: `x`, `y`, `heading`.

**Controller**: kit's `drawController` has only triggers. Swerve needs **left and right sticks with deflection** and a **left bumper** highlight.

The kinematics that drive the wheel arrows can be computed in the scene (sum of translation plus rotation-tangent per corner, CTRE-style shortest-turn is fine visually) since it is never narrated.

## 9. Draft beat outline

1. **Name it.** "A swerve robot can face one way and drive another."
2. **Anatomy.** Four corners, two motors each; one spins, one points. Pigeon appears. "You never write the math: two generated files do."
3. **Holonomic.** Robot slides sideways, then drives straight while spinning; wheels re-point.
4. **Which way is forward?** Stick pushed away. Robot-centric: arrow follows the nose; turn around and inputs mirror.
5. **Field-centric.** Same input, arrow pinned down-field; robot faces the driver and drives away backwards. Needs the gyro.
6. **Your turn.** Gate: hold a direction, spin the robot.
7. **Alliance.** Red driver; driver-forward arrow flips 180°.
8. **Pose2d.** Field axes appear at the blue corner; X, Y, heading readout.
9. **The trap.** Red robot at its own wall; readout shows large X. "Only the driver's forward flips."
10. **Odometry.** Ghost tracks the robot by adding wheel travel.
11. **Drift.** Slip, shove, wrong radius; ghost walks off and never returns. "Calibration slows it; vision corrects it."
12. **Takeaway + handoff.** "Thirteen devices. Find them and write down the IDs: the generator asks for them next."

## 10. Site/branch mismatches

- None on this page versus `1-Swerve`; the perspective rotations, `FieldCentric`, `getPose()` and `addVisionMeasurement` all match. Note that the page does not cover module vectors or angle optimization, despite the brief request suggesting it.
