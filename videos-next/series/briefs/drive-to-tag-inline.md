# Brief: /drive-to-tag-inline, "Example: Drive to Tag" (Workshop 6, optional, last lesson)

**No `branch` prop, on purpose.** The page is written on LimelightLib 2 (`com.limelightvision.Limelight`, alpha7 vendordep); `7-InlineCommands` still uses the copied `LimelightHelpers` and an older loop. **Show the page's code, not the branch's.** One new file `commands/DriveToTagInline.java` and one binding. 13 minutes. Worked example, not a concept lesson.

## 1. Teaches (page order)

- **The tag's frame**: every other drive command works in field space; this one works in target space, origin at the tag. LimelightLib axes: X out of the tag's face, Y to the tag's left, Z up. `readRobotInTag` returns null unless `hasTarget()` and a `fiducialTargets` entry matches our ID; `hasTarget()` goes false once the newest frame is 0.25 s old, because "the getters never go blank."
- **One controller per axis**: three `ProfiledPIDController`s (distance, lateral, heading), "a trapezoid profile and a PID controller in one object," all locals the coroutine closes over. Heading wraps; tolerances 3 cm, 3 cm, 2°. `ApplyRobotVelocity`, because "this command has no idea where the field is."
- **The loop**: `drivetrain.run(coroutine -> { while (true) { ... coroutine.yield(); } })`. No tag → stop, then `coroutine.waitUntil(..., Seconds.of(1.0))`; timed out → `return`. First sighting (`tracking` false) → reset each profile at the real position. Each speed = `calculate(...)` + `getSetpoint().velocity`. Goal yaw is `Math.PI` (facing the tag), on the wrap; minus signs on forward and sideways. `break` on all three `atGoal()`, after the `calculate` calls.
- **Every gain ships at 0.0**: the profile does the whole job; "20 cm short stays 20 cm short."
- **A stop on every exit**: arrive (`break` → stop), give up (stop already sent, `return`), canceled (`.whenCanceled(...)` → same `stop` helper). Zero `ChassisVelocities`, not Idle.

## 2. Format: **animated** (one optional recorded insert)

The lesson lives in a frame the student can't see: the tag's axes riding on a wall, the robot's pose in them, and a loop that stops, waits, resumes. A top-down view with the tag's frame drawn on it, plus a code panel whose highlight walks the `while`, carries it. Optional insert: 3 s of the Limelight web interface showing the detected tag ID (check step 2), recorded on the real camera.

## 3. The concept that needs motion

**One coroutine loop with three ways out.** The highlight cycles read → drive → `yield` while the robot closes in; cover the camera and the highlight drops to the null branch, the robot stops dead, the line goes dashed on `waitUntil` with a one-second bar draining; uncover in time and the loop resumes with profiles reset (no lurch); leave it covered and the bar empties, `return`, robot still stopped. Then release mid-approach: the body is dropped mid-line (frozen highlight greys out) and `whenCanceled` fires the stop. That's three exits and three stops, visible only in time. Second: **why the yaw goal is π**: rotate the robot to face the tag and watch its heading in the tag frame land on the seam of the −π…π dial.

## 4. Student knows already / sets up

- **Knows:** `while` + `yield`, bounded `waitUntil(cond, timeout)` + `.timedOut()`, "every exit stops what it started" (/coroutines); profile plus correction, trapezoid limits 2.5 / 3.0 (/advanced-drive-to-point; Motion Magic's trapezoid from /motion-magic); heading wrap with `enableContinuousInput` (/drive-to-point); `ClassicCommand`'s `run`/`onCancel` as a coroutine with a cancel hook (/drive-to-point); target IDs, camera name, LimelightLib vendordep (/vision-hardware, /vision-implementation); latched requests (/running-program#latched); gains shipping at zero (/motion-magic-code).
- **Sets up:** end of the course. Leaves the student able to write any "drive until a sensor says so" loop inline.

## 5. Code on screen (page code blocks, trimmed)

```java
private static Pose3d readRobotInTag(Limelight camera, int targetTagId) {
  if (!camera.hasTarget()) {
    return null;
  }
  for (FiducialTarget tag : camera.getLatestResults().fiducialTargets) {
    if (tag.fiducialId == targetTagId) {
      return tag.getRobotPose_TargetSpace();
    }
  }
  return null;
}
```

```java
  return drivetrain
      .run(
          coroutine -> {
            boolean tracking = false;
            while (true) {
              Pose3d robotInTag = readRobotInTag(camera, targetTagId);
              if (robotInTag == null) {
                stop(drivetrain, driveRequest);
                tracking = false;
                if (coroutine
                    .waitUntil(() -> readRobotInTag(camera, targetTagId) != null, Seconds.of(1.0))
                    .timedOut()) {
                  return;
                }
                continue;
              }
              if (!tracking) {
                distance.reset(robotInTag.getX());
                lateral.reset(robotInTag.getY());
                heading.reset(robotInTag.getRotation().getZ());
                tracking = true;
              }
              double forward =
                  distance.calculate(robotInTag.getX(), standoffMeters)
                      + distance.getSetpoint().velocity;
              // sideways: lateral toward 0.0; turn: heading toward Math.PI
              drivetrain.setControl(
                  driveRequest.withVelocity(new ChassisVelocities(-forward, -sideways, turn)));
              if (distance.atGoal() && lateral.atGoal() && heading.atGoal()) {
                break;
              }
              coroutine.yield();
            }
            stop(drivetrain, driveRequest);
          })
      .whenCanceled(() -> stop(drivetrain, driveRequest))
      .named("DriveToTagInline");
```

```java
private static void stop(DriveMechanism drivetrain, SwerveRequest.ApplyRobotVelocity request) {
  drivetrain.setControl(request.withVelocity(new ChassisVelocities()));
}
```

Binding: `driver.x().whileTrue(DriveToTagInline.create(robot.drivetrain, "limelight", 1, 1.0))`. Controllers are `new ProfiledPIDController(0.0, 0.0, 0.0, new TrapezoidProfile.Constraints(2.5, 3.0))` (heading `Math.PI, 2.0 * Math.PI`).

LimelightLib API names are the page's, which says they were read off `2.0.0-beta9-alpha7`; only `beta2` is in this machine's Gradle cache, so I could not re-verify `hasTarget()` / `getLatestResults().fiducialTargets` / `getRobotPose_TargetSpace()` locally.

## 6. Misconceptions / failure modes

- **Holding X stops the robot and nothing else**: helper returns null every pass: wrong camera name, wrong tag ID, or tag not in view. "The web interface settles which."
- **Drives away, slides sideways, or spins**: a sign. "Negate the one value that matches what the robot did, and only that one." Test on blocks first.
- **Stops short and never ends**: zero gains, profile done, outside the 3 cm band. Give `distance` and `lateral` a small kP. (_Falls short_, /pid-control.)
- Removing the ID check: drives at whichever tag is first in the list (quiz 2).
- Moving `break` above the `calculate` calls: asks a controller with no measurement whether it arrived.
- No `tracking` reset: the profile resumes its old plan mid-ramp and the robot lurches.
- `whenCanceled` "redundant": a canceled body never resumes, so the bottom stop never runs (quiz 5).
- Idle as stop (quiz 6): "the robot keeps rolling, because Idle leaves each module on its last request." Fine while disabled, wrong to stop.
- In simulation there is no camera: X stops the robot, one second later the command ends and the sticks work, X still held. That _is_ the expected sim result.

## 7. Interactive moment idea

**"Cover the camera."** A hand button over the camera icon. Tap briefly: robot stops, one-second bar drains partway, refills, approach resumes smoothly from a fresh profile. Hold it: bar empties, `return` lights, command ends, scheduler lane hands back to the joystick default. Optional second toggle: "skip the `tracking` reset" to show the lurch.

## 8. Visual pieces needed beyond the field kit (see drive-to-point brief)

- **AprilTag on a wall segment** with its own axis triad drawn on the floor (X out of the face, Y to the tag's left), and a second tag (ID 4) nearby for the ID-check beat.
- **Camera cone** on the robot's front; tag inside/outside cone; a **staleness timer** (0.25 s) on the camera chip.
- **Target-space readout**: `(x, y, yaw)` in tag frame next to the robot, with the standoff line at 1.0 m and a centerline at y = 0.
- **Heading dial** reused, with the goal at π on the seam.
- **Three profile mini-plots** (distance, lateral, heading) each with a playhead, resetting on reacquire.
- **Exit markers** on the code panel: `break`, `return`, cancel, each lighting its `stop` call.
- **One-second wait bar** under the dashed `waitUntil` line, reusing the /coroutines timeline vocabulary (dashed = waiting).
- Swerve request card showing `ApplyRobotVelocity` and the zero after each exit; module speed bars going dark.

## 9. Draft beat outline

1. **Name it.** "Hold X, and the robot drives to a meter in front of a tag using nothing but the camera."
2. **Connect.** Drive to Point needed a field and a pose. This one needs a tag.
3. **The tag's frame.** Axes on the tag; robot pose read in it; pick our ID, ignore tag 4.
4. **Three profiled controllers.** Distance, sideways, squareness, each a trapezoid plus a correction, gains at zero.
5. **Facing it is π.** Robot rotates to face the tag; dial lands on the seam; minus signs because forward is the tag's −X.
6. **The loop.** Read, drive, `yield`, the shape from /coroutines and from `ClassicCommand`.
7. **No tag.** Stop, bounded wait, give up stopped.
8. **Your turn.** Cover the camera.
9. **Reacquire.** `tracking` resets the profiles; no lurch.
10. **Three exits, three stops.** Arrive, give up, canceled → `whenCanceled`. Idle shown failing once; link /running-program.
11. **Checks.** Sim: stops, ends in a second. Blocks: signs. Floor: ramp, cruise, slow, stop square at 1 m.
12. **Takeaway.** "One loop, one stop on every way out."

## 10. Site/branch mismatches

`7-InlineCommands/src/main/java/frc/robot/commands/DriveToTagInline.java` differs from the page in substance; the page knowingly omits `branch`, and CLAUDE.md calls the swerve chain due for a rebuild:

- Uses `LimelightHelpers` (`getTV`, `getFiducialID`, `getBotPose3d_TargetSpace`, `setPriorityTagID` with a `-1` cleanup in two places); the page uses `Limelight` / `FiducialTarget`.
- Old target space (distance = `getZ()`, lateral = `getX()`, yaw = rotation about Y, heading goal `0.0`, no minus signs); page is NWU (X, Y, yaw about Z, goal `Math.PI`, `-forward, -sideways`).
- No-tag branch just `yield`s forever with zero speed; the page's bounded `waitUntil(..., Seconds.of(1.0))` + `return` and the `tracking` flag are not on the branch. Profiles are reset once before the loop, not on every reacquire.
- Branch lambda is typed `(Coroutine coroutine) ->`; page is `coroutine ->`.
- Binding: branch `DriveToTagInline.create(drivetrain, ...)` via a local alias; page `robot.drivetrain`.
- Page top comment says the branch has "the Idle stop"; it doesn't, the branch already sends zero `ChassisVelocities` everywhere. Only the helper is stale.
- Branch class javadoc says "See frc5712.com"; fine.
