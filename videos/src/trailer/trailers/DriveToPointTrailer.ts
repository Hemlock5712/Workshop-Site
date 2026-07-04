import type { Rect, TrailerScript } from "../lib/types";

// Press a button, arrive at an exact field pose. Two poses (target and
// odometry), three PID controllers, one field-relative velocity request.
// Camera travels: title card → pose-error diagram → execute() code →
// Teleop OpMode bindings → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1100 };
const CODE: Rect = { x: 5480, y: 200, width: 1620, height: 1000 };
const CODE2: Rect = { x: 7620, y: 280, width: 1500, height: 780 };
const END: Rect = { x: 9860, y: 60, width: 1920, height: 1080 };

// Sub-regions of the diagram the camera pushes into.
const POSES_CLOSEUP: Rect = { x: 2580, y: 220, width: 1240, height: 1000 };
const PID_CLOSEUP: Rect = { x: 3220, y: 380, width: 1400, height: 800 };

// The heart of the command, from the Drive to Point lesson.
const EXECUTE_CODE = `@Override
protected void execute() {
  Pose2d currentPose = m_drivetrain.getPose();

  // One PID per axis: how fast should I move to close the gap?
  double xVelocity = xController.calculate(currentPose.getX(), m_targetPose.getX());
  double yVelocity = yController.calculate(currentPose.getY(), m_targetPose.getY());
  double thetaVelocity = thetaController.calculate(
      currentPose.getRotation().getRadians(),
      m_targetPose.getRotation().getRadians());

  // Hand the field-relative velocities to the drivetrain.
  m_drivetrain.setControl(
      driveRequest.withVelocity(new ChassisVelocities(xVelocity, yVelocity, thetaVelocity)));
}`;

// Bindings live in the Teleop OpMode constructor — scoped to teleop.
const BINDINGS_CODE = `// Inside the @Teleop OpMode constructor — bindings are scoped to this OpMode.
public TeleopOpMode(Robot robot) {
  DriveMechanism drivetrain = robot.drivetrain;

  // Hold A: drive to origin (0, 0, 0°)
  driver.a().whileTrue(new DriveToPoint(drivetrain, Pose2d.kZero));

  // Hold B: drive to (3 m, 2 m, 180°)
  driver.b().whileTrue(
      new DriveToPoint(drivetrain, new Pose2d(3, 2, Rotation2d.fromDegrees(180))));
}`;

export const DriveToPointTrailer: TrailerScript = {
  id: "DriveToPointTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Drive to Point",
      subtitle: "One button, any pose on the field",
      accent: "teal",
    },
    {
      kind: "diagram",
      id: "flow",
      rect: DIAGRAM,
      title: "Pose error → velocity",
      nodes: [
        {
          id: "target",
          label: "Target Pose2d",
          sublabel: "(3, 2, 180°) — where you want to be",
          x: 80,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "odometry",
          label: "Odometry",
          sublabel: "getPose() — where you are",
          x: 80,
          y: 730,
          width: 460,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "pids",
          label: "Three PIDs",
          sublabel: "x, y, theta — one per axis",
          x: 880,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 3,
        },
        {
          id: "velocity",
          label: "ChassisVelocities",
          sublabel: "vx, vy, omega — one request",
          x: 1680,
          y: 440,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "target", to: "pids", label: "setpoint" },
        { from: "odometry", to: "pids", label: "measurement" },
        { from: "pids", to: "velocity", label: "calculate" },
      ],
    },
    {
      kind: "code",
      id: "execute-code",
      rect: CODE,
      fileName: "DriveToPoint.java",
      language: "java",
      states: ["", EXECUTE_CODE],
    },
    {
      kind: "code",
      id: "bindings-code",
      rect: CODE2,
      fileName: "TeleopOpMode.java",
      language: "java",
      states: ["", BINDINGS_CODE],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "One button, any pose",
      subtitle: "Tuning tips, tolerance checks, and auto sequences",
      url: "frc5712.com/drive-to-point",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Your driver lines up the same scoring position forty times a match. What if one button drove the robot to the exact spot — x, y, and heading — every time? That's drive to point, and it's about thirty lines of code.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "poses",
      text: "Every field position is a Pose2d — x in meters, y in meters, and a rotation. Odometry already tracks yours. So the robot always knows two poses: where it is, and where you want it.",
      camera: POSES_CLOSEUP,
      events: [
        { type: "diagram", artifact: "flow", step: 1, at: { word: "Pose2d" } },
        {
          type: "diagram",
          artifact: "flow",
          step: 2,
          at: { word: "Odometry" },
        },
      ],
    },
    {
      id: "pids",
      text: "The gap between those poses is just error — and you already know what closes error. Three PID controllers, one per axis: x, y, and rotation, because a swerve drive moves all three independently.",
      camera: PID_CLOSEUP,
      events: [
        { type: "diagram", artifact: "flow", step: 3, at: { word: "PID" } },
      ],
    },
    {
      id: "velocities",
      text: "Each controller answers one question — how fast should my axis move to close my gap? The three outputs become field-relative velocities, handed to the drivetrain and recalculated every twenty milliseconds until the robot settles on the target.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "flow",
          step: 4,
          at: { word: "velocities" },
        },
      ],
    },
    {
      id: "code",
      text: "Here's the whole loop. Read the current pose from odometry, run calculate on each controller against the target, and send the three results as one field-relative velocity request. As the error shrinks, the robot slows — and lands.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "execute-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "bindings",
      text: "Then give it to your driver. In the Teleop OpMode, hold A to drive to the origin, hold B to drive to a scoring pose. Release the button and the command cancels — the drivetrain just stops.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "bindings-code",
          state: 1,
          at: { progress: 0.05 },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "cta",
      text: "Preset scoring positions, tuning tips, tolerance checks, and the autonomous sequences built from this single command — the full drive to point lesson is at frc5712.com. Your button is waiting.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
