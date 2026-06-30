import type { VideoScript } from "../lib/types";

const armSubsystemSource = `public class Arm extends SubsystemBase {
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

export const CommandFrameworkScript: VideoScript = {
  id: "CommandFramework",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "Command-based programming is how WPILib organizes robot code. It breaks the robot into three pieces: subsystems for hardware, commands for actions, and triggers for inputs that decide when a command should run.",
      slide: {
        kind: "title",
        title: "Command-Based Framework",
        subtitle: "Subsystems, Commands, and Triggers",
        accent: "purple",
      },
    },
    {
      id: "three-pieces",
      text: "Subsystems own the hardware and expose safe methods to control it. Commands are the actions you want the robot to perform. Triggers connect inputs like buttons or sensors to those commands. Keeping these layers separate is what makes the whole pattern work.",
      slide: {
        kind: "bullets",
        title: "Three building blocks",
        accent: "purple",
        bullets: [
          "Subsystems — model hardware, hold state",
          "Commands — describe what the robot does",
          "Triggers — decide when a command runs",
        ],
      },
    },
    {
      id: "subject",
      text: "Take the workshop's arm subsystem. It has a motor, a voltage control method, and a stop method. Now we want commands that move it up, move it down, and stop it — and we want them to live right alongside the hardware they control.",
      slide: {
        kind: "image",
        src: "images/mechanisms/arm.png",
        title: "Commands for the arm",
        caption: "Move up, move down, stop — defined on the subsystem itself.",
      },
    },
    {
      id: "code",
      text: "Here is the pattern the workshop uses. Each command is a factory method on the subsystem that returns a Command. The runOnce helper builds a command that calls your action one time and finishes. Because these factories live on the subsystem, the scheduler automatically treats the subsystem as a requirement — no manual wiring needed. Bind moveUp to a button and the arm gets a new behavior.",
      slide: {
        kind: "code",
        title: "Arm.java — command factories",
        language: "java",
        code: armSubsystemSource,
        highlightLines: [14, 15, 16, 18, 19, 20, 22, 23, 24],
        caption:
          "runOnce() returns a Command; the subsystem is the implicit requirement.",
      },
    },
    {
      id: "outro",
      text: "Build subsystems first, then add command factories on top of them, then wire triggers to call those factories. That's the order the rest of the workshop follows, all the way up to PID, Motion Magic, and swerve drive.",
      slide: {
        kind: "title",
        title: "Subsystems, then commands, then triggers",
        subtitle: "The order every workshop step builds on",
        accent: "purple",
      },
    },
  ],
};
