import type { Rect, TrailerScript } from "../lib/types";

// One class per physical thing. The camera travels:
// title card → anatomy diagram → Arm.java built up in stages →
// the default-command habit → end card.

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

  public Command goTo(Angle target, Angle tolerance) {
    return run(coroutine -> {
      motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
      coroutine.waitUntil(() -> atTarget(target, tolerance));
    }).named("Arm:goTo:" + target.in(Degrees));
  }
}`;

const ELEVATOR_HOLD = `public class Elevator extends Mechanism {
  public Elevator() {
    setDefaultCommand(
      run(coroutine -> {
        motor.setControl(positionVoltage.withPosition(getPosition().in(Rotations)));
        coroutine.park();
      }).named("Elevator:hold")
    );
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
          sublabel: "methods that return Command",
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
      subtitle: "Factories, defaults, and the full Mechanism anatomy",
      url: "frc5712.com/building-subsystems",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Your robot is a collection of physical things — an arm, a flywheel, a drivetrain. Commands version three gives each one a home: a class that extends Mechanism. Get this shape right, and the rest of the workshop clicks into place.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "one-class",
      text: "The rule is one class per physical thing. The arm gets an Arm class, it extends Mechanism, and it alone owns that hardware. No other file in the project touches this motor.",
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
      text: "Inside, hardware lives in private fields — the TalonFX, the control requests. Configuration happens once, in the constructor: brake mode, current limits, applied at startup instead of scattered across the codebase.",
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
      text: "And the behavior? Public factory methods that return Commands. There is no periodic method to override in version three — every action is a command the scheduler can start, cancel, and compose with others.",
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
      text: "Here it is for real. Hardware sits in private fields. The constructor applies the config once. Then a factory wraps a coroutine body with run, chains dot named — and the compiler enforces that name at build time.",
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
          at: { word: "wraps" },
        },
      ],
      holdAfter: 1.2,
    },
    {
      id: "defaults",
      text: "One more habit: there is no periodic. Every mechanism starts with an automatic idle default, and when you want a real resting behavior — an elevator holding its position — you set a default command that parks.",
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
      text: "Mechanisms are step one of the whole framework — commands and triggers build straight on top of this class. See the full anatomy, the three factories, and default commands at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
