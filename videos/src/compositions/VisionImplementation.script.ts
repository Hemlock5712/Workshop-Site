import type { VideoScript } from "../lib/types";

const stdDevFormulaSource = `// Trust scales with distance^1.2 and shrinks with tag count squared.
// Farther tags = less trust. Multiple tags = much more trust.
// MT2's rotation is just the gyro echoed back — pass infinity so the
// pose estimator ignores that channel and the gyro stays in charge.
double distanceFactor = Math.pow(poseEstimate.avgTagDist, 1.2);
double tagFactor = poseEstimate.tagCount * poseEstimate.tagCount;

double xyStdDev = 0.333 * distanceFactor / tagFactor;
double rotStdDev = poseEstimate.isMegaTag2
    ? Double.POSITIVE_INFINITY
    : 1.5 * distanceFactor / tagFactor;`;

const limelightSubsystemSource = `public class Limelight extends SubsystemBase {
  private final String[] cameraNames;
  private final CommandSwerveDrivetrain drivetrain;

  @Override
  public void periodic() {
    // 1. Push the robot's gyro heading so MegaTag2 can disambiguate one-tag
    //    detections. Batched: NoFlush per camera, then a single Flush().
    double yawDeg = drivetrain.getPose().getRotation().getDegrees();
    double omegaDeg = Math.toDegrees(
        drivetrain.getState().Speeds.omegaRadiansPerSecond);
    for (String name : cameraNames) {
      LimelightHelpers.SetRobotOrientation_NoFlush(
          name, yawDeg, omegaDeg, 0, 0, 0, 0);
    }
    LimelightHelpers.Flush();

    // 2. Per camera independently — MT1/MT2 switch + five filters happen
    //    inside getValidPoseEstimate(). No fusion in subsystem code; the
    //    Kalman filter inside the pose estimator combines cameras for us.
    for (String name : cameraNames) {
      PoseEstimate est = getValidPoseEstimate(name);
      if (est == null) continue;
      Matrix<N3, N1> stdDevs = computeStdDevs(est);
      drivetrain.addVisionMeasurement(est.pose, est.timestampSeconds, stdDevs);
    }
  }
}`;

export const VisionImplementationScript: VideoScript = {
  id: "VisionImplementation",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "In the overview we covered why vision matters. Now let's get into the actual code. We'll wire Limelight into the swerve drivetrain, validate measurements, and feed AprilTag pose estimates into the CTRE pose estimator with the right amount of trust.",
      slide: {
        kind: "title",
        title: "Implementing Vision",
        subtitle: "Limelight into swerve odometry — the code",
        accent: "teal",
      },
    },
    {
      id: "strategy",
      text: "The workshop follows a four-step integration. Start with the LimelightHelpers library to skip raw NetworkTables. Build a Limelight subsystem that produces three values: pose, timestamp, and standard deviation. Pass those to the CTRE pose estimator already living inside the drivetrain. Then wire it all together in RobotContainer.",
      slide: {
        kind: "bullets",
        title: "Four-step integration",
        accent: "teal",
        bullets: [
          "1. LimelightHelpers — clean NetworkTables wrapper",
          "2. Limelight subsystem — produce pose, timestamp, std dev",
          "3. CTRE pose estimator — accepts vision measurements",
          "4. RobotContainer — give vision access to drivetrain",
        ],
      },
    },
    {
      id: "limelight-image",
      text: "Before we look at code, remember the hardware. Limelight runs the AprilTag pipeline on-device and publishes a pose estimate to NetworkTables every frame. Your roboRIO just has to read it, decide whether to trust it, and hand it to the pose estimator.",
      slide: {
        kind: "image",
        src: "images/mechanisms/limelight.png",
        title: "Limelight does the heavy lifting",
        caption: "Pipeline runs on the camera — roboRIO consumes the result.",
      },
    },
    {
      id: "stddev-code",
      text: "The most important piece of the subsystem is the standard deviation formula. It tells the pose estimator how much to trust each vision update. Distance hurts accuracy, so we scale by distance to the one-point-two power. More tags helps a lot, so we divide by tag count squared. Two tags is roughly four times more trustworthy than one. Rotation gets a special case. When the estimate is MegaTag2, the heading came from our own gyro in the first place, so we pass infinity. That tells the pose estimator to ignore that channel and keep the gyro in charge of heading.",
      slide: {
        kind: "code",
        title: "Standard deviation formula",
        language: "java",
        code: stdDevFormulaSource,
        highlightLines: [5, 6, 7, 8, 9, 10, 11],
        caption:
          "Distance up, tag count squared down, MT2 rotation = infinity.",
      },
    },
    {
      id: "subsystem-code",
      text: "Here is the heart of the Limelight subsystem. Each loop runs two passes over the cameras. The first pass pushes the robot's gyro heading to every Limelight so MegaTag2 has what it needs. We batch the NetworkTables writes with NoFlush and a single Flush at the end. The second pass runs each camera independently. The helper called getValidPoseEstimate picks MegaTag1 or MegaTag2 and runs five filters. If anything fails it returns null and we skip. Survivors get a standard deviation and flow straight to addVisionMeasurement. We do not pre-fuse the cameras. That is the Kalman filter's job, and it does it better.",
      slide: {
        kind: "code",
        title: "Limelight.java — the subsystem",
        language: "java",
        code: limelightSubsystemSource,
        highlightLines: [16, 17, 18, 19, 20, 21, 22, 25, 26, 27, 28, 29, 30],
        caption:
          "Per-camera filter pipeline — no fusion before the pose estimator.",
      },
    },
    {
      id: "filtering",
      text: "Inside getValidPoseEstimate we run five filters before any pose touches odometry. The first filter is ambiguity. Limelight tells us how confident the solve is, and we drop anything over zero point three. The second filter is distance. Beyond five and a half meters the tags are too few pixels to trust. The third filter is angular velocity. Spinning fast smears the image, and MegaTag2 has a tighter cap than MegaTag1 because it depends on a synchronized gyro reading. The fourth filter is field bounds. If the computed pose is outside the field rectangle plus a half-meter margin, it is obviously wrong. The fifth and final piece is standard deviation scaling. Survivors do not get equal weight. They are scaled by distance and tag count so the pose estimator weighs them correctly.",
      slide: {
        kind: "bullets",
        title: "Five filters before vision touches odometry",
        accent: "teal",
        bullets: [
          "Ambiguity — drop if Limelight isn't confident in the solve",
          "Distance — drop beyond ~5.5 m, too few pixels to trust",
          "Angular velocity — spin cap, tighter for MT2 (gyro-synced)",
          "Field bounds — drop poses outside the field rectangle",
          "Std-dev scaling — survivors weighted by distance and tag count",
        ],
      },
    },
    {
      id: "robotcontainer",
      text: "Finally, RobotContainer ties it together. The drivetrain owns the CTRE pose estimator. When we construct the Limelight subsystem, we pass the drivetrain's addVisionMeasurement method as the consumer. Every periodic loop, validated Limelight poses flow straight into odometry, correcting drift in real time — no extra glue code in the command layer.",
      slide: {
        kind: "title",
        title: "Vision feeds the pose estimator",
        subtitle: "RobotContainer wires addVisionMeasurement as the consumer",
        accent: "teal",
      },
    },
    {
      id: "outro",
      text: "That is the full vision implementation. LimelightHelpers gives us a clean NetworkTables wrapper. The subsystem switches between MegaTag1 and MegaTag2 per camera based on tag count, runs every estimate through the five filters, and scales the standard deviations by distance and tag count. RobotContainer hands the drivetrain in so vision measurements flow straight to the pose estimator. Odometry is now corrected by AprilTags, which sets us up for drive-to-point navigation and vision-aimed shooting.",
      slide: {
        kind: "title",
        title: "Vision-corrected odometry, ready to use",
        subtitle: "Next: drive-to-point and vision shooting",
        accent: "teal",
      },
    },
  ],
};
