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
      text: "Watch your driver at a match. Forty lineups at the same scoring spot, all by eye, each one burning a second of stick-nudging while the clock runs down. A button never gets nervous in the endgame.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "poses",
      text: "Anywhere on the field, a Pose2d names it. An x, a y, and which way you're facing. Odometry has been tracking yours all match, off wheel positions and the gyro. So the robot holds both poses. Nobody's asked it to compare them.",
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
      text: "Subtract one pose from the other and you get error, the only thing PID has ever cared about. So run a controller per axis: forward, sideways, and turning. A swerve drive moves all of them at once, so nobody waits.",
      camera: PID_CLOSEUP,
      events: [
        { type: "diagram", artifact: "flow", step: 3, at: { word: "PID" } },
      ],
    },
    {
      id: "velocities",
      text: "Each controller only reports a speed for its own axis. Bundle those answers into one set of field-relative velocities, and the drivetrain stops caring which way its bumpers happen to be pointed. New request every loop. Fifty times a second, forever.",
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
      text: "The whole thing fits on one screen. Pose in, a calculate call per axis, one velocity request out. No trajectory files, and nothing to regenerate when the drive team decides the scoring spot is four inches off.",
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
      text: "Hand it to your driver. The bindings go in your Teleop OpMode constructor, and whileTrue does the rest: hold the button, the command runs; let go, it cancels mid-drive. Because the thing a driver never forgives is a robot that won't give the stick back.",
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
      text: "Tolerance is where people get burned. Set it too tight and the command never ends, and your auto stands there vibrating on a pose it reached four seconds ago while the clock runs out.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
