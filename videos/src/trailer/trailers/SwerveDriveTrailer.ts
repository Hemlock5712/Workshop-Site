import type { Rect, TrailerScript } from "../lib/types";

// From CTRE's swerve project generator to a driving robot: run the Tuner X
// wizard, wrap the generated drivetrain in a DriveMechanism, calibrate, drive.
// Camera travels: title card → generator pipeline diagram → teleop request
// code (open-loop → calibrated Velocity) → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 200, width: 2200, height: 1100 };
const CODE: Rect = { x: 5480, y: 260, width: 1560, height: 920 };
const END: Rect = { x: 7900, y: 40, width: 1920, height: 1080 };

// Sub-regions of the diagram the camera pushes into.
const TUNER_CLOSEUP: Rect = { x: 2600, y: 240, width: 1300, height: 740 };
const GENERATED_CLOSEUP: Rect = { x: 3900, y: 240, width: 1400, height: 790 };

// The drive request as the generator ships it: open-loop voltage + deadband.
const CODE_OPEN_LOOP = `// Field-centric teleop — feed the joystick values directly:
drivetrain.setControl(
    new SwerveRequest.FieldCentric()
        .withDeadband(MaxSpeed * 0.1)
        .withDriveRequestType(DriveRequestType.OpenLoopVoltage)
        .withVelocityX(joystickX)           // field +X (m/s)
        .withVelocityY(joystickY)           // field +Y (m/s)
        .withRotationalRate(joystickOmega)  // rad/s, CCW positive
);`;

// After calibration: closed-loop Velocity, deadband dropped.
const CODE_CALIBRATED = `// Field-centric teleop — feed the joystick values directly:
drivetrain.setControl(
    new SwerveRequest.FieldCentric()
        .withDriveRequestType(DriveRequestType.Velocity)
        // Deadband removed for precise control
        .withVelocityX(joystickX)           // field +X (m/s)
        .withVelocityY(joystickY)           // field +Y (m/s)
        .withRotationalRate(joystickOmega)  // rad/s, CCW positive
);`;

export const SwerveDriveTrailer: TrailerScript = {
  id: "SwerveDriveTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Swerve Drive Project",
      subtitle: "From Tuner X wizard to a driving robot",
      accent: "blue",
    },
    {
      kind: "diagram",
      id: "pipeline",
      rect: DIAGRAM,
      title: "Generate → wrap → calibrate → drive",
      nodes: [
        {
          id: "tuner",
          label: "Phoenix Tuner X",
          sublabel: "connect — every module needs a CAN ID",
          x: 120,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 1,
        },
        {
          id: "generated",
          label: "Generated Project",
          sublabel: "CommandSwerveDrivetrain + TunerConstants",
          x: 1620,
          y: 150,
          width: 460,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "mechanism",
          label: "DriveMechanism",
          sublabel: "extends Mechanism — owns the drivetrain",
          x: 1620,
          y: 730,
          width: 460,
          height: 220,
          accent: "purple",
          step: 3,
        },
        {
          id: "calibrate",
          label: "Calibrate",
          sublabel: "gains, slip current, wheel radius",
          x: 120,
          y: 730,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "tuner", to: "generated", label: "generates" },
        { from: "generated", to: "mechanism", label: "wrapped by" },
        { from: "mechanism", to: "calibrate", label: "then tune" },
      ],
    },
    {
      kind: "code",
      id: "drive-code",
      rect: CODE,
      fileName: "TeleopOpMode.java",
      language: "java",
      states: ["", CODE_OPEN_LOOP, CODE_CALIBRATED],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Generate, calibrate, drive",
      subtitle: "Full walkthrough + baseline project download",
      url: "frc5712.com/swerve-drive-project",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Writing swerve code by hand is a rite of passage nobody needs. Kinematics, odometry, module control — CTRE's generator writes all of it. Here's the fastest path from four modules on a chassis to a robot you can actually drive.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "tuner",
      text: "Start in Phoenix Tuner X. Connect to the robot, make sure every drive motor, steer motor, and encoder has a unique CAN ID, then open Mechanisms — and the swerve wizard takes over.",
      camera: TUNER_CLOSEUP,
      events: [
        {
          type: "diagram",
          artifact: "pipeline",
          step: 1,
          at: { word: "Tuner" },
        },
      ],
    },
    {
      id: "generate",
      text: "Feed it your wheelbase, trackwidth, wheel diameter, and gear ratio, and it generates a complete CommandSwerveDrivetrain — field-centric drive requests, simulation support, and odometry with pose estimation already wired in.",
      camera: GENERATED_CLOSEUP,
      events: [
        {
          type: "diagram",
          artifact: "pipeline",
          step: 2,
          at: { word: "generates" },
        },
      ],
    },
    {
      id: "wrap-calibrate",
      text: "In Commands v3, you wrap that class in a DriveMechanism that owns the drivetrain and exposes the drive commands. Then calibration — motor gains, slip current, wheel radius — turns generated code into a drivetrain you can trust.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "pipeline",
          step: 3,
          at: { word: "DriveMechanism" },
        },
        {
          type: "diagram",
          artifact: "pipeline",
          step: 4,
          at: { word: "calibration" },
        },
      ],
    },
    {
      id: "drive",
      text: "Driving it is one request. FieldCentric takes your joystick values — velocity X, velocity Y, rotational rate — and the drivetrain solves every module angle and every wheel speed for you, on every loop.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "drive-code",
          state: 1,
          at: { word: "FieldCentric" },
        },
      ],
      holdAfter: 1.0,
    },
    {
      id: "precision",
      text: "One calibration change makes it precise. Switch the drive request to closed-loop Velocity and drop the deadband — now the wheels track commanded speed instead of guessing from voltage, and low-speed control gets crisp.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "drive-code",
          state: 2,
          at: { word: "Velocity" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "cta",
      text: "Generate it, wrap it, calibrate it, drive it. The full walkthrough — plus a complete baseline project you can download — is waiting at frc5712.com. Your swerve drivetrain is one wizard away.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
