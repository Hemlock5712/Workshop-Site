import type { Rect, TrailerScript } from "../lib/types";

// One class per physical thing. The camera travels:
// title card → anatomy diagram → Arm.java built up in stages (fields,
// config, hold factory) → the default-command habit → end card.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const DIAGRAM: Rect = { x: 2560, y: 140, width: 2200, height: 1100 };
const CODE: Rect = { x: 5480, y: 200, width: 1620, height: 1000 };
const CODE2: Rect = { x: 7660, y: 280, width: 1500, height: 760 };
const END: Rect = { x: 9720, y: 60, width: 1920, height: 1080 };

const ARM_FIELDS = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);
}`;

const ARM_CONFIG = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);

  public Arm() {
    var config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Brake;
    motor.getConfigurator().apply(config);
  }
}`;

const ARM_FULL = `public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);

  public Arm() {
    var config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Brake;
    motor.getConfigurator().apply(config);
  }

  // A hold: re-sends the setpoint every tick, forever.
  public Command scoring() {
    return runRepeatedly(() -> setPosition(SCORING_POSITION))
        .named("scoring (hold)");
  }

  private void setPosition(double position) { ... } // private on purpose
}`;

const ELEVATOR_HOLD = `public class Elevator extends Mechanism {
  public Elevator() {
    // The default is one of the mechanism's own holds.
    setDefaultCommand(stowed());
  }

  public Command stowed() {
    return runRepeatedly(() -> setPosition(STOWED_POSITION))
        .named("stowed (hold)");
  }
}`;

export const BuildingMechanismsTrailer: TrailerScript = {
  id: "BuildingMechanismsTrailer",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Mechanisms",
      subtitle: "One class per physical thing",
      accent: "mint",
    },
    {
      kind: "diagram",
      id: "anatomy",
      rect: DIAGRAM,
      title: "Anatomy of a Mechanism",
      nodes: [
        {
          id: "mech",
          label: "Mechanism",
          sublabel: "one class per physical thing",
          x: 80,
          y: 440,
          width: 460,
          height: 220,
          accent: "purple",
          step: 1,
        },
        {
          id: "fields",
          label: "Private fields",
          sublabel: "TalonFX + control requests",
          x: 880,
          y: 150,
          width: 460,
          height: 220,
          accent: "blue",
          step: 2,
        },
        {
          id: "ctor",
          label: "Constructor",
          sublabel: "config applied once",
          x: 880,
          y: 730,
          width: 460,
          height: 220,
          accent: "amber",
          step: 3,
        },
        {
          id: "factories",
          label: "Command factories",
          sublabel: "holds that return Command",
          x: 1680,
          y: 440,
          width: 460,
          height: 220,
          accent: "mint",
          step: 4,
        },
      ],
      edges: [
        { from: "mech", to: "fields", label: "owns" },
        { from: "mech", to: "ctor", label: "configures" },
        { from: "fields", to: "factories" },
        { from: "ctor", to: "factories" },
      ],
    },
    {
      kind: "code",
      id: "arm-code",
      rect: CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", ARM_FIELDS, ARM_CONFIG, ARM_FULL],
    },
    {
      kind: "code",
      id: "elevator-code",
      rect: CODE2,
      fileName: "Elevator.java",
      language: "java",
      states: ["", ELEVATOR_HOLD],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "One class per physical thing",
      subtitle: "Private hardware, hold factories, default commands",
      url: "frc5712.com/building-subsystems",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "An arm. A flywheel. A drivetrain. Each one gets exactly one class, and that class is the only thing in the whole project allowed to touch its motor. Get that boundary wrong and you'll spend a season chasing two files fighting over one TalonFX.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "one-class",
      text: "The arm gets an Arm class that extends Mechanism, and the TalonFX lives inside as a private field. Nothing else reaches that motor. Not the OpMode, not another mechanism, not some helper written at midnight.",
      camera: { x: 2560, y: 380, width: 1400, height: 790 },
      events: [
        {
          type: "diagram",
          artifact: "anatomy",
          step: 1,
          at: { word: "Mechanism" },
        },
      ],
    },
    {
      id: "fields-config",
      text: "Hardware handles go in private fields, so the compiler enforces the rule instead of a code reviewer. Config happens once, in the constructor: brake mode, current limits, offsets. Re-apply it in a loop and you'll chase a stuttering motor all week.",
      camera: { x: 3280, y: 200, width: 1500, height: 1040 },
      events: [
        {
          type: "diagram",
          artifact: "anatomy",
          step: 2,
          at: { word: "fields" },
        },
        {
          type: "diagram",
          artifact: "anatomy",
          step: 3,
          at: { word: "constructor" },
        },
      ],
    },
    {
      id: "factories",
      text: "Actions come out as public factory methods that hand back a Command. No periodic method anymore. That's on purpose: the scheduler gets something it can start, cancel, or interrupt without you tracking a single flag.",
      camera: DIAGRAM,
      events: [
        {
          type: "diagram",
          artifact: "anatomy",
          step: 4,
          at: { word: "factory" },
        },
      ],
    },
    {
      id: "code",
      text: "Private fields at the top. The constructor applies config once, then gets out of the way. Then scoring, which uses runRepeatedly to re-issue the request every single tick instead of firing once and hoping gravity cooperates. Forget .named and your logs say nothing.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "arm-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "arm-code",
          state: 2,
          at: { word: "constructor" },
        },
        {
          type: "code-state",
          artifact: "arm-code",
          state: 3,
          at: { word: "runRepeatedly" },
        },
      ],
      holdAfter: 1.2,
    },
    {
      id: "defaults",
      text: "Every mechanism gets a default command, and out of the box that default does nothing. Fine for a flywheel. Terrible for an elevator, which will sag to the bottom of its travel the second you let go. It holds stowed instead.",
      camera: CODE2,
      events: [
        {
          type: "code-state",
          artifact: "elevator-code",
          state: 1,
          at: { word: "elevator" },
        },
      ],
      holdAfter: 1.2,
    },
    {
      id: "cta",
      text: "Get the Arm class right. Everything after this just calls the factories you already wrote: Commands, Triggers, the whole framework.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
