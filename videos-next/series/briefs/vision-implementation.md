# Brief: /vision-implementation, "Vision" (Workshop 6)

**No branch, deliberately.** Page code is ground truth; `3-Limelight` still has the copied `LimelightHelpers.java` and a class named `Limelight`. LimelightLib 2 vendordep pinned to alpha-7 (`2.0.0-beta9-alpha7`). Page `time="14 minutes"`. Follows /vision-hardware; next is /drive-to-point.

## 1. Teaches (page order)

- **Install the library**: a vendordep now, not a copied file. WPILib Vendor Dependencies view → INSTALL FROM URL → the alpha-7 URL. Build. Delete any old `LimelightHelpers.java`.
- **MegaTag1 and MegaTag2**: MT1 solves position _and_ heading from tag geometry (good with two or more tags, shaky with one). MT2 takes your heading as given and solves only position; one tag is enough, but "a gyro ten degrees out returns a position that is wrong and looks fine."
- **One frame at a time**: `Vision` (not `Limelight`, the library owns that name). `registerAll` writes the shared heading once per loop and puts each camera's `update()` on `addPeriodic`. `readResultsQueue()` gives every frame since the last call: no frame skipped, none fused twice. Ask MT1, read `fieldedTagCount`, re-ask MT2 under two tags. Skip on `rejectionFlags != 0` or distance over 4 m.
- **The trust weighting**: a standard deviation per sighting. "Distance hurts gently and tag count helps hard": one tag at 2 m ≈ 0.77 m, two tags ≈ 0.19 m. MT2 heading goes in at `IGNORE_VISION_HEADING` so the robot doesn't agree with itself. Use `estimate.timestampSeconds`; the estimator rewinds, folds in, replays. Call `registerAll` from `Robot`'s constructor, not an OpMode.
- **Check**: cover the camera, push the robot a metre, uncover; pose walks back over about a second. Corrections stop past 4 m; one tag moves position but not heading.

## 2. Format

**Animated, with one short recorded insert** (the vendordep install, about 8 s: activity bar → WPILib Vendor Dependencies → expand INSTALL FROM URL → paste → Install → appears under INSTALLED DEPENDENCIES; zoom to the URL box and the Install button). Everything else is a concept that happens in time on the field: frames arriving at a different rate to loops, an estimate pulled gradually toward a sighting, a rejected frame, a sighting folded in at the past moment it was taken.

## 3. The concept that needs motion

**Fusion, not replacement.** The estimated pose (ghost) and the true robot have drifted apart. A sighting arrives with an error circle sized by its standard deviation. The ghost moves toward it by a fraction, not all the way; big circle, small pull; small circle, bigger pull. Several frames later the ghost has walked back to the truth "over a second rather than in one frame." That gradual walk is the page's check and is impossible to see in prose.

**The timestamp rewind.** The robot is moving; a sighting arrives labelled with when the picture was taken, a few frames ago. The trail rewinds to that point, the correction is applied there, then the trail replays forward to now. Applying it "now" instead visibly drags the pose backward.

**The queue.** Two clocks side by side: robot loops tick evenly, camera frames arrive unevenly. Some loops get none, some get two. A per-loop "latest" reader double-counts or drops; the queue reader takes exactly what arrived.

## 4. Student knows already / sets up

- **Knows:** camera mounted, offsets entered, AprilTag pipeline, name written down (/vision-hardware); odometry drift and blue-corner origin (/swerve-prerequisites); trusted wheel radius (/swerve-drive-tuning); three kinds of zeroing, and `seedFieldCentric()` only changes driver forward (/swerve-calibration); `addPeriodic` for always-on work and that OpMode bindings are torn down on a mode switch (/logging-implementation, /opmodes); vendordep install (/pathplanner).
- **Sets up:** /drive-to-point and everything after it, whose accuracy "comes from odometry," now corrected over a match.

## 5. Code on screen (page code blocks)

URL: `https://limelightvision.github.io/limelightlib-public/LimelightLib-alpha7.json`

`src/main/java/frc/robot/subsystems/Vision.java`, setup (trimmed):

```java
private Vision(String name, DriveMechanism drivetrain) {
  this.camera = new Limelight(name);
  this.drivetrain = drivetrain;
  camera.setUseSharedOrientation(true);
}

public static void registerAll(DriveMechanism drivetrain, String... cameraNames) {
  Scheduler.getDefault()
      .addPeriodic(
          () ->
              Limelight.setSharedRobotOrientation(
                  drivetrain.getPose().getRotation().getDegrees()));

  for (String name : cameraNames) {
    Vision vision = new Vision(name, drivetrain);
    Scheduler.getDefault().addPeriodic(() -> vision.update());
  }
}
```

Update (trimmed):

```java
for (LimelightResults frame : camera.readResultsQueue()) {
  PoseEstimate estimate = camera.getPoseEstimate(frame, PoseEstimateType.MT1_WPIBLUE);
  if (estimate.fieldedTagCount < MIN_TAGS_FOR_MEGATAG1) {
    estimate = camera.getPoseEstimate(frame, PoseEstimateType.MT2_WPIBLUE);
  }
  if (estimate.rejectionFlags != 0
      || estimate.avgTagDistanceMeters > MAX_TAG_DISTANCE_METERS) {
    continue;
  }
  double distanceFactor = Math.pow(estimate.avgTagDistanceMeters, 1.2);
  double tagFactor = estimate.fieldedTagCount * estimate.fieldedTagCount;
  double xyStdDev = XY_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;
  double headingStdDev =
      estimate.isMT2()
          ? IGNORE_VISION_HEADING
          : ROTATION_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;
  drivetrain.addVisionMeasurement(
      estimate.pose, estimate.timestampSeconds,
      VecBuilder.fill(xyStdDev, xyStdDev, headingStdDev));
}
```

`Robot` constructor: `Vision.registerAll(drivetrain, "limelight");`

The coefficients (0.333, 1.5, 4.0 m, 2 tags) are the page's shipped starting values, not tuned gains; fine to show.

## 6. Misconceptions / failure modes

- "None of this runs in the simulator." Check on the real robot.
- Leaving `LimelightHelpers.java` in: "two readers of the same camera."
- Old sample code with nested `Limelight.PoseEstimate`: "will not compile."
- Reading the latest value (quiz 2): drops or double-counts frames.
- MT2 with a bad gyro: "wrong and looks fine." Fix by seeding the gyro, "Not with `seedFieldCentric()`."
- Feeding MT2 heading back (quiz 5): "the robot agreeing with itself."
- `registerAll` in an OpMode (quiz 6): torn down on a mode switch.
- Pose never moves = the name string doesn't match the NetworkTables table. Jumps somewhere impossible = offsets. Lands on the far side = red-origin pose into a blue estimator, hence `MT1_WPIBLUE`.

## 7. Interactive moment idea

**"Cover the camera."** The field shows true robot, estimate ghost, a tag on the wall and the camera cone. A COVER toggle and drag-to-push the robot. Covered: push it a metre, the ghost follows the wheels faithfully and drifts. Uncovered: sightings start arriving with error circles and the ghost walks back. Second control: a distance slider, so past 4 m the dots turn grey (rejected) and the pull stops; a 1-tag/2-tag switch shows the circle shrink to a quarter and the heading locked under MT2.

## 8. Visual pieces needed beyond the kit

- **Field + robot drawable** (see autonomous.md), with **true robot vs estimated ghost**, a pose trail that can **rewind and replay**, wall-mounted **AprilTags** at field positions, a **camera view cone** on the robot.
- **Sighting marker** with a scalable **error circle** (std dev) and a separate heading wedge that can be "ignored" (greyed) for MT2.
- **Rejected sighting** style (grey, struck), with a small reason tag (e.g. "too far").
- **Two-clock strip**: robot loop ticks vs uneven camera frames, with a queue bucket emptying each loop.
- **MT1/MT2 chip** on each sighting, and a gyro heading arrow feeding into the camera for MT2.

## 9. Draft beat outline

1. **Callback.** "The camera sees a tag and knows where it is. Now the robot has to listen."
2. **Install** (recorded insert). Vendordep URL, pinned to the alpha.
3. **Two solvers.** MT1 solves heading from the tags; MT2 borrows yours. One tag → MT2.
4. **Heading first.** One shared heading write each loop, every camera reads it.
5. **One frame at a time.** Two clocks; the queue takes exactly what arrived.
6. **Gates.** Rejection flags and 4 m; rejected dots grey out.
7. **Trust.** Error circles: distance grows them gently, a second tag shrinks them to a quarter.
8. **Don't agree with yourself.** MT2 heading ignored.
9. **When the picture was taken.** Rewind, fold in, replay.
10. **Where it runs.** `Robot`'s constructor, every mode.
11. **Your turn.** Cover, push, uncover; the ghost walks home.
12. **Failure readings.** Never moves (name), jumps (offsets), far side (red origin), strange on one tag (seed the gyro).

## 10. Site/branch mismatches

- Page is ahead of `3-Limelight` on purpose (CLAUDE.md agrees): branch has `LimelightHelpers`, class `Limelight`, `Flush()`, `SetRobotOrientation_NoFlush`, `tagCount`, `avgTagDist`, `isMegaTag2`. Same formula and constants. The page adds `MIN_TAGS_FOR_MEGATAG1` and the `rejectionFlags` gate.
- **Alpha-7 LimelightLib API could not be verified locally**: only `limelightlib-java-2.0.0-beta2` is in the Gradle cache. Page names (`readResultsQueue`, `getPoseEstimate(frame, PoseEstimateType.MT1_WPIBLUE)`, `fieldedTagCount`, `isMT2()`) match CLAUDE.md but were taken on trust here.
- **Possible timestamp epoch issue, worth checking before recording the rewind beat.** `DriveMechanism.addVisionMeasurement` passes the timestamp straight to Phoenix's `SwerveDrivetrain.addVisionMeasurement`, whose javadoc (Phoenix 6 `26.70.0-alpha-2`, verified) requires the epoch of `Utils.getCurrentTimeSeconds()`, and the branch's own javadoc says the same. Neither `DriveMechanism` nor `CommandSwerveDrivetrain` converts (no `Utils.fpgaToCurrentTime`). If LimelightLib's `timestampSeconds` is on the WPILib/NT clock and the two differ on SystemCore, every sighting is folded in at the wrong moment. Unverified either way.
- Page "needs" says "The swerve project, with logging," but `registerAll` only needs `DriveMechanism`; logging is irrelevant to the check, which reads NetworkTables.
- `/vision-implementation` sets no `branch`, correctly per CLAUDE.md; re-add when the swerve chain is rebuilt.
