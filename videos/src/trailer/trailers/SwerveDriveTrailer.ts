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
      text: "Writing swerve code by hand is a mountain of tricky math. Wheel angles, wheel speeds, position tracking. CTRE's generator writes all of it for you. Four modules on a chassis. Here's the fastest path to a robot you can actually drive.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "tuner",
      text: "Start in Phoenix Tuner X, CTRE's setup app. Connect to the robot. Give every drive motor, steer motor, and encoder its own CAN ID — that's its name on the network. Then open Mechanisms. The swerve wizard takes over.",
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
      text: "Feed it your robot's measurements: wheelbase, trackwidth, wheel diameter, and gear ratio. It generates a complete CommandSwerveDrivetrain class. Drive code, simulation, and odometry — position tracking — are already wired in.",
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
      text: "In Commands v3, you wrap that class in a DriveMechanism. It owns the drivetrain and hands out the drive commands. Then you calibrate. Calibration means measuring the real robot: motor gains, slip current, wheel radius. That turns generated code into a drivetrain you can trust.",
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
      text: "Driving it takes one request. FieldCentric means you steer relative to the field, not the robot's nose. Give it your joystick values — velocity X, velocity Y, and turn rate. The drivetrain solves every module angle and wheel speed, every loop.",
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
      text: "One change makes it precise. Switch the drive request to closed-loop Velocity. Closed-loop means each wheel checks its real speed and fixes it. You can drop the deadband too — that dead zone near the stick's center. Low-speed control gets crisp.",
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
      text: "Generate it, wrap it, calibrate it, drive it. The full walkthrough is waiting at frc5712.com. There's a complete baseline project you can download too. Your swerve drivetrain is one wizard away.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
