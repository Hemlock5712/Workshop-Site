import type { Rect, TrailerScript } from "../lib/types";

// Logging implementation: three steps (enable, publish, open), telemetry via a
// runRepeatedly default command (no periodic() in v3), and struct publishers
// for whole poses. Camera: title → steps diagram → Arm.java → Telemetry.java → end.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 160, width: 2200, height: 1150 };
const CODE: Rect = { x: 5480, y: 180, width: 1700, height: 1000 };
const CODE2: Rect = { x: 7680, y: 300, width: 1620, height: 800 };
const END: Rect = { x: 9900, y: 60, width: 1920, height: 1080 };

const ARM_NO_DEFAULT = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final DoublePublisher positionPub = NetworkTableInstance.getDefault()
      .getTable("Arm").getDoubleTopic("Position").publish();

  private void publishTelemetry() {
    positionPub.set(motor.getPosition().getValueAsDouble());
  }
}`;

const ARM_FULL = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final DoublePublisher positionPub = NetworkTableInstance.getDefault()
      .getTable("Arm").getDoubleTopic("Position").publish();

  public Arm() {
    // No periodic() in v3 — publish while idle with a default command.
    setDefaultCommand(runRepeatedly(this::publishTelemetry).named("Arm:telemetry"));
  }

  private void publishTelemetry() {
    positionPub.set(motor.getPosition().getValueAsDouble());
  }
}`;

const STRUCT_POSE = `private final StructPublisher<Pose2d> pose =
    table.getStructTopic("Pose", Pose2d.struct).publish();

public void telemeterize(SwerveDriveState state) {
  pose.set(state.Pose);
}`;

const STRUCT_FULL = `private final StructPublisher<Pose2d> pose =
    table.getStructTopic("Pose", Pose2d.struct).publish();
private final StructPublisher<ChassisVelocities> velocity =
    table.getStructTopic("Velocity", ChassisVelocities.struct).publish();

public void telemeterize(SwerveDriveState state) {
  pose.set(state.Pose);
  velocity.set(state.Velocity);
}`;

export const LoggingImplementationTrailer: TrailerScript = {
  id: "LoggingImplementationTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Logging Implementation",
      subtitle: "Three steps from silent robot to full telemetry",
      accent: "mint",
    },
    {
      kind: "diagram",
      id: "steps",
      rect: DIAGRAM,
      title: "The three steps",
      nodes: [
        {
          id: "enable",
          label: "1. Enable",
          sublabel: "DataLogManager in the Robot constructor",
          x: 80,
          y: 460,
          width: 460,
          height: 220,
          accent: "purple",
          step: 1,
        },
        {
          id: "publish",
          label: "2. Publish",
          sublabel: "everything to NetworkTables",
          x: 870,
          y: 460,
          width: 460,
          height: 220,
          accent: "amber",
          step: 2,
        },
        {
          id: "open",
          label: "3. Open",
          sublabel: "the .wpilog in AdvantageScope",
          x: 1660,
          y: 460,
          width: 460,
          height: 220,
          accent: "mint",
          step: 3,
        },
      ],
      edges: [
        {
          from: "enable",
          to: "publish",
          label: "captured automatically",
          step: 2,
        },
        { from: "publish", to: "open", label: "wpilog", step: 3 },
      ],
    },
    {
      kind: "code",
      id: "arm-code",
      rect: CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", ARM_NO_DEFAULT, ARM_FULL],
    },
    {
      kind: "code",
      id: "struct-code",
      rect: CODE2,
      fileName: "Telemetry.java",
      language: "java",
      states: ["", STRUCT_POSE, STRUCT_FULL],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Instrument once, replay forever",
      subtitle:
        "Struct publishers, telemetry default commands, and AdvantageScope",
      url: "frc5712.com/logging-implementation",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "You turned logging on. Now make the logs worth opening. Three steps take your robot from silent to telling you everything. And in Commands v3, telemetry — the data your robot reports — has one new twist.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "recipe",
      text: "The recipe has three steps. First, enable DataLogManager in the Robot constructor. Second, publish everything to NetworkTables. It all gets recorded for free. Third, open the wpilog file in AdvantageScope. That's the whole pipeline. The rest is doing it well.",
      camera: DIAGRAM,
      events: [
        { type: "diagram", artifact: "steps", step: 1, at: { word: "enable" } },
        {
          type: "diagram",
          artifact: "steps",
          step: 2,
          at: { word: "Publish" },
        },
        { type: "diagram", artifact: "steps", step: 3, at: { word: "open" } },
      ],
    },
    {
      id: "publisher",
      text: "Here's a real v3 mechanism. The publisher is a field on the class. It sends the arm's position to NetworkTables, under Arm slash Position. Name keys like folders, and AdvantageScope sorts every mechanism into its own folder.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "arm-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
    },
    {
      id: "default-command",
      text: "Here's the twist: v3 mechanisms have no periodic method. So publish with a default command — the one that runs while the arm is idle. runRepeatedly calls publishTelemetry over and over. Any real command takes over. Telemetry for free, never in the way.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "arm-code",
          state: 2,
          at: { word: "runRepeatedly" },
        },
      ],
      holdAfter: 1.2,
    },
    {
      id: "structs",
      text: "Some data comes in bundles, like a full robot pose. Don't scatter it as loose numbers. A StructPublisher sends the whole Pose2d at once. Add velocities too. Now one telemeterize call streams complete swerve state onto AdvantageScope's field view.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "struct-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "struct-code",
          state: 2,
          at: { word: "velocities" },
        },
      ],
      holdAfter: 1.2,
    },
    {
      id: "files",
      text: "Where do the log files land? In simulation, a logs folder right in your project. On the SystemCore, a USB drive or the controller's own logs folder. Either way, every run writes a wpilog you can replay.",
      camera: { x: 2600, y: 320, width: 2120, height: 1060 },
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "Set this up once, and every practice run becomes data you can replay. The full build is waiting at frc5712.com — struct publishers, telemetry default commands, and reading your logs in AdvantageScope.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
