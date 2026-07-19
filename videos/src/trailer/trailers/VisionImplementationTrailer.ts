import type { Rect, TrailerScript } from "../lib/types";

// Vision implementation: the four-step pipeline as a diagram, the Limelight
// class (a plain class, not a Mechanism) as typed code, and the trust math.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 120, width: 2200, height: 1100 };
const CODE: Rect = { x: 5480, y: 260, width: 1560, height: 980 };
const CODE2: Rect = { x: 7560, y: 200, width: 1500, height: 800 };
const END: Rect = { x: 9760, y: 60, width: 1920, height: 1080 };

const LIMELIGHT_UPDATE = `public final class Limelight {
  private void update() {
    PoseEstimate est = LimelightHelpers.getBotPoseEstimate_wpiBlue(name);
    if (est == null || !isValid(est)) return;
    Matrix<N3, N1> stdDevs = computeStdDevs(est);
    drivetrain.addVisionMeasurement(est.pose, est.timestampSeconds, stdDevs);
  }
}`;

const LIMELIGHT_FULL = `public final class Limelight {
  public static void registerAll(DriveMechanism drivetrain, String... names) {
    for (String name : names) {
      Limelight camera = new Limelight(drivetrain, name);
      Scheduler.getDefault().addPeriodic(camera::update);
    }
  }

  private void update() {
    PoseEstimate est = LimelightHelpers.getBotPoseEstimate_wpiBlue(name);
    if (est == null || !isValid(est)) return;
    Matrix<N3, N1> stdDevs = computeStdDevs(est);
    drivetrain.addVisionMeasurement(est.pose, est.timestampSeconds, stdDevs);
  }
}`;

const STDDEV_CODE = `// Trust falls with distance — squared. More tags divide it back down.
double xyStandardDev =
    0.5 * Math.pow(poseEstimate.avgTagDist, 2.0) / poseEstimate.tagCount;

// Rotation gets a larger base — heading from one tag is shaky.
double rotationStandardDev =
    5.0 * Math.pow(poseEstimate.avgTagDist, 2.0) / poseEstimate.tagCount;`;

export const VisionImplementationTrailer: TrailerScript = {
  id: "VisionImplementationTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Vision Implementation",
      subtitle: "Four steps from camera to corrected pose",
      accent: "blue",
    },
    {
      kind: "diagram",
      id: "steps",
      rect: DIAGRAM,
      title: "The four-step pipeline",
      nodes: [
        {
          id: "helpers",
          label: "LimelightHelpers",
          sublabel: "NetworkTables, wrapped clean",
          x: 40,
          y: 440,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "limelight",
          label: "Limelight",
          sublabel: "pose + timestamp + std devs",
          x: 590,
          y: 440,
          width: 460,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "estimator",
          label: "Pose Estimator",
          sublabel: "CTRE, inside the drivetrain",
          x: 1140,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 3,
        },
        {
          id: "robot",
          label: "Robot Constructor",
          sublabel: "registerAll — cameras go live",
          x: 1690,
          y: 440,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "helpers", to: "limelight", label: "feeds" },
        { from: "limelight", to: "estimator", label: "measures into" },
        { from: "estimator", to: "robot", label: "wired up by" },
      ],
    },
    {
      kind: "code",
      id: "limelight-code",
      rect: CODE,
      fileName: "Limelight.java",
      language: "java",
      states: ["", LIMELIGHT_UPDATE, LIMELIGHT_FULL],
    },
    {
      kind: "code",
      id: "stddev-code",
      rect: CODE2,
      fileName: "Limelight.java",
      language: "java",
      states: ["", STDDEV_CODE],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Wire vision into your drivetrain",
      subtitle:
        "LimelightHelpers, the trust math, and three pre-flight filters",
      url: "frc5712.com/vision-implementation",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Your drivetrain's odometry drifts — its position guess slides away from the truth. The fix is four steps of code. A wrapper, a camera class, a pose estimator, and one line in the Robot constructor. By the end, every AprilTag your camera sees corrects your position.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "steps-one-two",
      text: "Step one: LimelightHelpers. It reads the camera's NetworkTables data — the numbers it broadcasts. Step two: a Limelight class. It turns raw tag data into three things — a pose, a timestamp, and standard deviations. Those say how much to trust the measurement.",
      camera: { x: 2540, y: 400, width: 1400, height: 800 },
      events: [
        {
          type: "diagram",
          artifact: "steps",
          step: 1,
          at: { word: "LimelightHelpers" },
        },
        { type: "diagram", artifact: "steps", step: 2, at: { word: "class" } },
      ],
    },
    {
      id: "steps-three-four",
      text: "Step three: a CTRE pose estimator inside the drivetrain. It blends camera measurements with your wheel odometry. Step four: register every camera in the Robot constructor. One call, and the pipeline runs itself.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "steps",
          step: 3,
          at: { word: "estimator" },
        },
        {
          type: "diagram",
          artifact: "steps",
          step: 4,
          at: { word: "register" },
        },
      ],
    },
    {
      id: "plain-class",
      text: "The Limelight is not a Mechanism, because it owns no motors. It's a plain class. Its update method reads a fresh estimate, computes trust, and feeds the drivetrain. One registerAll call hooks every camera into Scheduler addPeriodic — update then runs every loop.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "limelight-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "limelight-code",
          state: 2,
          at: { word: "registerAll" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "trust-math",
      text: "How much should you trust one measurement? Distance hurts. Trust falls with the distance squared. Far tags count for less. More tags help. You divide by the tag count. And rotation gets the least trust of all. Heading read from a single tag is shaky.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "stddev-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "filters",
      text: "Before any measurement counts, three quick checks run. Is the pose inside the field? Is the tag ambiguous — could the math flip it? Is the height sane? And Phoenix 6 now shares WPILib's clock, so the timestamp goes straight in. No conversion needed.",
      camera: { x: 5520, y: 520, width: 1480, height: 700 },
      holdAfter: 0.8,
    },
    {
      id: "cta",
      text: "That's the whole pipeline: helpers, camera class, estimator, one registration line. Now your robot knows where it is, even after taking a hit. Build it step by step at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
