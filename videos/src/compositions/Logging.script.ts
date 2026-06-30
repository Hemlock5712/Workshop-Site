import type { VideoScript } from "../lib/types";

const epilogueSource = `import edu.wpi.first.epilogue.Logged;

@Logged
public class ArmSubsystem extends SubsystemBase {
  private final TalonFX motor;

  public double getPosition() {
    return motor.getPosition().getValueAsDouble();
  }

  public double getVelocity() {
    return motor.getVelocity().getValueAsDouble();
  }

  public double getCurrent() {
    return motor.getSupplyCurrent().getValueAsDouble();
  }
}`;

export const LoggingScript: VideoScript = {
  id: "Logging",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "A match lasts two or three minutes, and when something goes wrong you only get a few minutes in the pits to figure out why. Without logs you are debugging blind — guessing from what the driver thought they saw. With logs you can replay exactly what the robot did.",
      slide: {
        kind: "title",
        title: "Why Log Everything",
        subtitle: "Debug after the fact, not in the moment",
        accent: "blue",
      },
    },
    {
      id: "options",
      text: "FRC teams have four main choices. DataLogManager is built into WPILib and captures NetworkTables to a binary wpilog file. Epilogue, new in WPILib 2025, uses a Logged annotation to generate logging code at compile time. AdvantageKit adds deterministic replay. And Hoot Logging is tuned for CTRE Phoenix 6 hardware.",
      slide: {
        kind: "bullets",
        title: "Four logging frameworks",
        accent: "teal",
        bullets: [
          "DataLogManager — WPILib built-in, captures NetworkTables",
          "Epilogue — @Logged annotation, compile-time codegen",
          "AdvantageKit — deterministic replay, full IO capture",
          "Hoot Logging — optimized for Phoenix 6 and CANivore",
        ],
      },
    },
    {
      id: "workshop-choice",
      text: "This workshop combines DataLogManager and Epilogue. Together you get one-line setup, automatic capture of every public getter on your subsystems, and zero runtime overhead because the logging code is generated at compile time. No SmartDashboard dot put calls in periodic.",
      slide: {
        kind: "code",
        title: "ArmSubsystem.java — @Logged",
        language: "java",
        code: epilogueSource,
        highlightLines: [3, 4],
        caption:
          "Add @Logged and every public getter is logged automatically at 50Hz.",
      },
    },
    {
      id: "advantagescope",
      text: "Logs land in dot wpilog files, and AdvantageScope is how you read them. Open a file for post-match analysis, or connect over NetworkTables to watch live data while you tune. Overlay target versus actual on the same graph, scrub the match timeline, even view robot pose on a 3D field.",
      slide: {
        kind: "bullets",
        title: "AdvantageScope visualizes the data",
        accent: "purple",
        bullets: [
          "Open .wpilog files for post-match replay",
          "Connect live over NetworkTables for tuning",
          "Overlay target vs actual on one graph",
          "3D field view for pose and odometry",
        ],
      },
    },
    {
      id: "outro",
      text: "Log inputs, motor outputs, robot state, and your control signals — and always log setpoints next to actual values. Good logging is the difference between a mystery bug and a fifteen-minute fix between matches.",
      slide: {
        kind: "title",
        title: "Log first, debug second",
        subtitle: "DataLogManager + Epilogue + AdvantageScope",
        accent: "mint",
      },
    },
  ],
};
