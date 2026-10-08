# Brief: /swerve-calibration, "Swerve Calibration" (Workshop 5)

No branch prop (works on `1-Swerve`), 12 minutes, "No Java". After /swerve-drive-project, before /swerve-drive-tuning.

## 1. Teaches (page order)

- **Three kinds of zeroing**: `seedFieldCentric()` (left bumper: current facing becomes forward), `applyOperatorPerspective()` (every loop: 0° blue, 180° red), neither supplies x or y. `resetPose(Pose2d)` moves the pose, exists on the Phoenix drivetrain, but `DriveMechanism` does not expose it and nothing calls it; until Vision, `Drivetrain/Pose` is distance since boot.
- **Zero the modules**: disable; straight edge flat along both wheels of a side, then the other side ("half a degree... walks the robot 5 cm sideways over six meters"); **bevel gear faces the vertical center of the robot** or it zeroes 180° off; run calibration in the generator; regenerate and replace `TunerConstants.java`, redeploy. MarginNote: glue CANcoders down.
- **Tune the steer gains**: a position loop with no gravity, skip kG, start at kS. Shipped kP 100, kD 0.5, kS 0.1, kV 1.91 are often close: adjust, don't zero. Order from /pid-control#feedforward-first. Plot angle from `Drivetrain/ModuleStates` and `Drivetrain/ModuleTargets` on one AdvantageScope graph, flick the right stick: tuned = traces on top of each other; untuned lags, overshoots, buzzes.
- **Check**: tracks a taped line with no steady curve; traces overlap through every flick; bumper after a 90° turn moves forward but x and y don't change. Steady curve = zeros; wander that comes and goes = steer gains.

## 2. Format: **hybrid**

Two bench procedures (Tuner X calibration, AdvantageScope steer plot) are recordings, plus real-camera cut-ins of the straight edge and bevel gears. One concept needs animation: **three things called "zeroing" act on three different things**, a short animated beat on the field drawable. A second short animation: **why half a degree matters** (a 0.5° wheel walking 5 cm over 6 m).

**Shot list:**

1. Camera, top-down on the robot: straight edge pressed along the left pair of wheels, then the right. Zoom: the gap (none) between edge and tread.
2. Camera close-up: each bevel gear facing the robot center; one flipped module shown and corrected. Zoom: the gear.
3. Tuner X: open the exported swerve project (**Import Project**), pick a module, **Encoder Calibration** popup, accept. Repeat for four. Zoom: the popup's confirm and the module list.
4. Tuner X: **Generate only TunerConstants**. VS Code: replace the file, diff shows only the four `k*EncoderOffset` lines changing. Zoom: those lines. Deploy.
5. AdvantageScope: line graph, add `Drivetrain/ModuleStates` and `Drivetrain/ModuleTargets` angle for one module. Flick the right stick. First an untuned run (lag), then tuned (overlap). Zoom: the two traces.
6. Tuner X steer motor config, Slot0: change one value per test. Show the field, not a student-copyable list of tuned numbers (the shipped generator values are on the page and fine to read aloud).
7. Camera: robot driving along a taped carpet seam; then turn 90°, bumper, cut to AdvantageScope `Drivetrain/Pose` x/y unchanged.

## 3. The concept that needs motion

**Forward vs pose.** On the field drawable: the robot turns 90°; the bumper rotates the **driver-forward arrow** to the new nose; the pose readout's x and y do not move. `applyOperatorPerspective` shown as the same arrow snapping to 0° or 180° by alliance. A third, greyed card, `resetPose(Pose2d)`, moves the ghost pose itself but is labelled "not exposed in `DriveMechanism`". Prose lists three nearly identical verbs; the picture shows they move different arrows.

**A steady curve is an offset.** One module 0.5° off; robot walks sideways along a 6 m line, ending 5 cm off. Contrast: a wandering trace (gains) that comes and goes.

## 4. Student knows already / Sets up

- **Knows**: generated project and the module test, `seedFieldCentric()` on the bumper (/swerve-drive-project); field frame from the blue corner, drift (/swerve-prerequisites); kS/kP/kD order and the three failure shapes (/pid-control); AdvantageScope plots (/logging-implementation).
- **Sets up**: /swerve-drive-tuning needs zeros clean before measuring radius ("no radius correction fixes a heading error"). Vision (Workshop 6) is where the pose gets placed.

## 5. Code or settings on screen

No Java taught. From `1-Swerve` `TunerConstants.java` (example robot, fine to show): the four offsets e.g. `kFrontLeftEncoderOffset = Rotations.of(0.15234375)`, and `steerGains`: `withKP(100) .withKD(0.5) .withKS(0.1) .withKV(1.91)`. Telemetry names from `DriveMechanism.logState`: `Drivetrain/ModuleStates` (logged from `state.ModuleVelocities`), `Drivetrain/ModuleTargets`, `Drivetrain/Pose`. Never show the student's own tuned steer gains as copyable text.

## 6. Misconceptions / failure modes

- Steady curve fixed with steer kP: no, "Put the straight edge back on and re-save" (quiz 1).
- Bevel gear facing out: "zeroes 180 degrees off, and the drive tests fail later without saying why" (quiz 2).
- Tuned looks like lag or a settle: no, "Two traces on top of each other" (quiz 3).
- `seedFieldCentric()` or `applyOperatorPerspective()` moving x and y (quiz 4). Red forward is 180° (quiz 5).
- A CANcoder that shifts in a collision "makes all four wrong, and it looks like bad odometry".

## 7. Interactive moment idea

"Find the bad module." Four wheel angle readouts; one is half a degree off. The viewer drags a straight-edge over each side; the off module shows a sliver of light under the edge. Fixing it straightens the robot's path line. Alternative: viewer turns the robot and presses the bumper; the forward arrow moves, the pose numbers don't.

## 8. Visual pieces needed

Top-down swerve robot + field (spec in `swerve-prerequisites.md`), plus: a **straight-edge** overlay; a per-module **angle error** exaggeration mode; a **path trace** with a 6 m scale and a 5 cm offset callout; an **angle plot** (commanded vs measured, two traces) styled like AdvantageScope; three labelled cards for the zeroing verbs, one greyed.

## 9. Draft beat outline

1. **Open.** "Three calls say reset. They reset three different things."
2. **Bumper** moves forward, not position. **Perspective** sets forward by alliance.
3. **resetPose** moves the pose; nobody calls it yet. Pose = distance since boot.
4. **Offsets** came from somebody else's robot.
5. **Half a degree**: 5 cm over six meters.
6. **Straight edge**, both sides; **bevel gears** face in.
7. **Encoder Calibration** ×4, Generate only TunerConstants, redeploy.
8. **Steer gains**: no gravity, start at kS, adjust the shipped values.
9. **The plot**: lag, overshoot, buzz, then overlap.
10. **Check**: straight down the seam; bumper after a turn, x and y unchanged.
11. **Handoff**: "Steady curve: zeros. Comes and goes: gains. Next, the carpet."

## 10. Site/branch mismatches

- **Contradiction with /swerve-drive-project.** That page's step 4 already captures each corner's CANcoder offset with the wheel held straight, and step 5 replaces the whole file. This lede says the file "came with somebody else's numbers" and the zero section says the four `k*EncoderOffset` constants "came off somebody else's robot". After the generator page they are the student's own (by-eye) zeros. Reword as "re-zero against a straight edge" or drop the offset step from the generator page.
- Needs says "Logging on"; the check only needs live NT in AdvantageScope, which `1-Swerve` already publishes. `.wpilog` files need `2-Logging`'s `DataLogManager.start()`.
- CTRE's Verify Steer step (modules turn counter-clockwise from above) isn't on either page; fine, but the recording will show it.
