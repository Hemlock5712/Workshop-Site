import type { VideoScript } from "../lib/types";

const armCommandFactoriesSource = `public class Arm extends SubsystemBase {
  private final TalonFX motor = new TalonFX(31);
  private final VoltageOut voltageOut = new VoltageOut(0);

  public void setVoltage(double volts) {
    motor.setControl(voltageOut.withOutput(volts));
  }

  public void stop() {
    motor.stopMotor();
  }

  // Command factories live on the subsystem
  public Command moveUp() {
    return runOnce(() -> setVoltage(6));
  }

  public Command moveDown() {
    return runOnce(() -> setVoltage(-6));
  }

  public Command stopArm() {
    return runOnce(() -> stop());
  }
}`;

const robotContainerSource = `public class RobotContainer {
  // Hardware - controllers and subsystems
  private final CommandXboxController controller =
      new CommandXboxController(0);
  private final Arm arm = new Arm();
  private final Flywheel flywheel = new Flywheel();

  public RobotContainer() {
    configureBindings();
  }

  private void configureBindings() {
    // Left trigger: arm runs fast when pressed
    controller.leftTrigger().onTrue(arm.moveUp());

    // Right trigger: flywheel fast on press, slow on release
    controller.rightTrigger()
        .onTrue(flywheel.runFast())
        .onFalse(flywheel.runSlow());

    // A button: flywheel fast on press, stop on release
    controller.a()
        .onTrue(flywheel.runFast())
        .onFalse(flywheel.stopCommand());
  }
}`;

export const AddingCommandsScript: VideoScript = {
  id: "AddingCommands",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "In the overview we said commands are the actions your robot performs. In this deep dive, let's actually write some — using the workshop's arm subsystem — and then wire them to the controller so a button press makes the robot do something real.",
      slide: {
        kind: "title",
        title: "Adding Commands — Deep Dive",
        subtitle: "From subsystem methods to button bindings",
        accent: "purple",
      },
    },
    {
      id: "context",
      text: "Here's where we're starting. The arm already has a setVoltage method and a stop method. That's enough to control the motor, but nothing on the robot can actually call those methods yet. We need commands — small, reusable actions — and we want them to live right on the subsystem itself.",
      slide: {
        kind: "image",
        src: "images/mechanisms/arm.png",
        title: "Starting point: an Arm with raw control methods",
        caption:
          "setVoltage and stop exist — now we wrap them as commands the scheduler can run.",
      },
    },
    {
      id: "factories",
      text: "This is the pattern the workshop uses. moveUp, moveDown, and stopArm are factory methods that each return a Command. The runOnce helper builds a command that calls your action one time and then finishes. Because these factories are defined on the Arm subsystem, the scheduler automatically treats the Arm as a requirement — you never have to call addRequirements yourself.",
      slide: {
        kind: "code",
        title: "Arm.java — command factories on the subsystem",
        language: "java",
        code: armCommandFactoriesSource,
        highlightLines: [15, 16, 17, 19, 20, 21, 23, 24, 25],
        caption:
          "runOnce returns a Command; the subsystem is the implicit requirement.",
      },
    },
    {
      id: "why-factories",
      text: "Why a factory method instead of a Command class? Three reasons. The action stays next to the hardware that performs it, so it's easy to read. Requirements are wired up for free, which eliminates a whole category of scheduling bugs. And every call returns a fresh Command instance, so you can bind the same action to multiple buttons without them stepping on each other.",
      slide: {
        kind: "bullets",
        title: "Why factories on the subsystem?",
        accent: "purple",
        bullets: [
          "Action lives next to the hardware it controls",
          "Subsystem requirement is implicit — no addRequirements",
          "Each call returns a fresh Command instance",
        ],
      },
    },
    {
      id: "bindings",
      text: "Now the other half. In RobotContainer, configureBindings is where we connect controller inputs to those command factories. controller.leftTrigger().onTrue(arm.moveUp()) reads almost like English — when the left trigger goes from false to true, run the moveUp command. Chain onFalse after onTrue to handle the release, like running the flywheel fast on press and slow on release.",
      slide: {
        kind: "code",
        title: "RobotContainer.java — configureBindings()",
        language: "java",
        code: robotContainerSource,
        highlightLines: [13, 16, 17, 18, 21, 22, 23],
        caption: "onTrue fires on press; chain onFalse for release behavior.",
      },
    },
    {
      id: "lifecycle",
      text: "One detail worth understanding. onTrue runs the command's full lifecycle: initialize, then execute, then end. Because runOnce finishes immediately, the lifecycle is short — but the scheduler still owns it. That means if a new command grabs the arm, it cleanly interrupts the old one. You get safe, predictable behavior without writing any of the coordination yourself.",
      slide: {
        kind: "bullets",
        title: "What onTrue actually does",
        accent: "purple",
        bullets: [
          "Schedules the command on press",
          "Runs initialize → execute → end",
          "Interrupts cleanly if another command requires the same subsystem",
        ],
      },
    },
    {
      id: "outro",
      text: "So that's the full picture. Define command factories on the subsystem with runOnce. Then bind those factories to controller buttons in configureBindings using onTrue and onFalse. Every later workshop step — triggers, state machines, PID, Motion Magic — is just a richer version of this same pattern.",
      slide: {
        kind: "title",
        title: "Factories on subsystems, bindings in RobotContainer",
        subtitle: "The pattern every later step builds on",
        accent: "purple",
      },
    },
  ],
};
