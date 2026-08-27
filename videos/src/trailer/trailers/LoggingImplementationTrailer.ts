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
      text: "The recorder is running. Trouble is, a log full of nothing is still nothing. You want a robot that tells you what it was thinking, and Commands v3 has one wrinkle that catches everybody on the way there.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "recipe",
      text: "First you enable the recorder in the constructor, and everything downstream comes along free. Then the part that actually takes judgement: publish. Poses, setpoints, currents, whatever you'd stare at on a dashboard mid-match. Later you open the file and read what happened.",
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
      text: "A publisher is just a field on the mechanism. This one pushes the arm's position under the key Arm slash Position, and that slash matters: AdvantageScope treats it as a folder, so nothing lands in one flat list.",
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
      text: "And the wrinkle: v3 mechanisms have no periodic method. Nothing runs on its own. So the default command does the publishing — runRepeatedly, forever, while the arm sits there doing nothing. The instant a real command wants the arm, telemetry steps aside.",
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
      text: "Some values only mean something together. A pose is X, Y, and heading at one instant, so send the whole struct rather than three loose doubles that drift apart in the log. Add velocities, and AdvantageScope draws the whole swerve state.",
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
      text: "In simulation the logs land in a folder inside your project. On the SystemCore they go to a USB stick if one's plugged in, otherwise the controller's own storage. Practice matches count. Log those too.",
      camera: { x: 2600, y: 320, width: 2120, height: 1060 },
      holdAfter: 0.6,
    },
    {
      id: "cta",
      text: "Do this once and you stop debugging from memory. The next time a mechanism does something insane in a match, you'll already have the recording, and you'll know within a minute which line lied to you.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
