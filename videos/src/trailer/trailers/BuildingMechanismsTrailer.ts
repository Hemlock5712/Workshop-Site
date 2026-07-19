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
      text: "Your robot is a pile of physical parts. An arm. A flywheel. A drivetrain. Commands version three gives each part one home: a class that extends Mechanism. Get this class right, and the rest of the workshop clicks into place.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "one-class",
      text: "The rule is one class per physical thing. The arm gets an Arm class that extends Mechanism. That class alone owns the arm's hardware. No other file in the project touches this motor.",
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
      text: "Inside, hardware lives in private fields: the motor and its control requests. Private means only this class can touch them. Setup happens once, in the constructor. Brake mode and current limits get applied at startup.",
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
      text: "And the actions? Public factory methods that return Commands. A factory is a method that builds a command for you. There is no periodic method in version three. Every action is a command the scheduler can start and cancel.",
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
      text: "Here it is for real. Hardware sits in private fields. The constructor applies the config once. Then scoring uses runRepeatedly: re-send the target every tick, forever. That command is a hold, so its name says hold. Forget dot named, and the build fails.",
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
      text: "One more habit. Every mechanism has a default command. It runs whenever nothing else owns the mechanism. Out of the box, that default is idle: do nothing. Want a resting pose instead? This elevator sets its own stowed hold as the default.",
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
      text: "Mechanisms are step one of the whole framework. Commands and triggers build right on top of this class. See the full anatomy, the factories, and default commands at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
