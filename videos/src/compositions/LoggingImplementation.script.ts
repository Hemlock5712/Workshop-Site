import type { VideoScript } from "../lib/types";

const epilogueArmSource = `import edu.wpi.first.epilogue.Logged;

@Logged  // This annotation automatically logs all public fields and methods
public class ArmSubsystem extends SubsystemBase {
  private final TalonFX motor;
  private final PositionVoltage positionRequest = new PositionVoltage(0);

  // Logged automatically: position, velocity, current, voltage, temperature
  public double getPosition() {
    return motor.getPosition().getValueAsDouble();
  }

  public double getVelocity() {
    return motor.getVelocity().getValueAsDouble();
  }

  public double getCurrent() {
    return motor.getSupplyCurrent().getValueAsDouble();
  }

  // No periodic() method needed for logging!
  // Epilogue automatically logs all public getters at 50Hz
}`;

const smartDashboardArmSource = `public class ArmSubsystem extends SubsystemBase {
  private final TalonFX motor;
  private final PositionVoltage positionRequest = new PositionVoltage(0);

  @Override
  public void periodic() {
    // Publish motor telemetry to NetworkTables
    // DataLogManager will automatically log these values

    SmartDashboard.putNumber("Arm/Position", motor.getPosition().getValueAsDouble());
    SmartDashboard.putNumber("Arm/Velocity", motor.getVelocity().getValueAsDouble());
    SmartDashboard.putNumber("Arm/Current", motor.getSupplyCurrent().getValueAsDouble());
    SmartDashboard.putNumber("Arm/Voltage", motor.getMotorVoltage().getValueAsDouble());

    // Log target vs actual for PID analysis
    SmartDashboard.putNumber("Arm/TargetPosition", positionRequest.Position);
    SmartDashboard.putNumber("Arm/Error",
        positionRequest.Position - motor.getPosition().getValueAsDouble());
  }
}`;

const swervePoseSource = `public class CommandSwerveDrivetrain extends SubsystemBase {

  @Override
  public void periodic() {
    // Get current robot pose
    Pose2d pose = getState().Pose;

    // Log pose components
    SmartDashboard.putNumber("Odometry/X", pose.getX());
    SmartDashboard.putNumber("Odometry/Y", pose.getY());
    SmartDashboard.putNumber("Odometry/Heading", pose.getRotation().getDegrees());

    // Log as array for AdvantageScope field visualization
    SmartDashboard.putNumberArray("Odometry/Pose", new double[] {
      pose.getX(),
      pose.getY(),
      pose.getRotation().getRadians()
    });
  }
}`;

export const LoggingImplementationScript: VideoScript = {
  id: "LoggingImplementation",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "In the overview we talked about why logging matters. In this deep dive we wire it up. We will turn on DataLogManager, drop the Logged annotation on a subsystem, hand-publish telemetry the old way for comparison, and end up with a wpilog file you can open in AdvantageScope.",
      slide: {
        kind: "title",
        title: "Implementing Logging",
        subtitle: "From annotation to .wpilog file",
        accent: "teal",
      },
    },
    {
      id: "setup-steps",
      text: "The plan has four moving parts. Enable DataLogManager once in Robot dot java so a wpilog file is written every time the robot boots. Annotate your subsystems with Logged so Epilogue captures them at compile time. For anything Epilogue does not see, publish to NetworkTables with SmartDashboard. Then open the resulting file in AdvantageScope.",
      slide: {
        kind: "bullets",
        title: "Four steps to a working pipeline",
        accent: "teal",
        bullets: [
          "Enable DataLogManager in Robot.java",
          "Annotate subsystems with @Logged",
          "Publish extras via SmartDashboard.putNumber",
          "Open the .wpilog in AdvantageScope",
        ],
      },
    },
    {
      id: "epilogue-code",
      text: "Here is the workshop's arm subsystem with Epilogue turned on. One import, one annotation above the class, and every public getter — position, velocity, current, voltage, temperature — is logged automatically at fifty hertz. No periodic method, no SmartDashboard calls, no boilerplate. The code is generated at compile time, so there is zero runtime overhead from reflection.",
      slide: {
        kind: "code",
        title: "ArmSubsystem.java — Epilogue @Logged",
        language: "java",
        code: epilogueArmSource,
        highlightLines: [1, 3, 4],
        caption: "One annotation captures every public getter at 50Hz.",
      },
    },
    {
      id: "smartdashboard-code",
      text: "When you need to log something Epilogue cannot see — like target setpoints or computed error — fall back to SmartDashboard. Notice the hierarchical keys: Arm slash Position, Arm slash Velocity, Arm slash Error. That structure is what lets AdvantageScope group related signals. And always log target next to actual — that pair is how you tune a PID.",
      slide: {
        kind: "code",
        title: "ArmSubsystem.java — manual telemetry",
        language: "java",
        code: smartDashboardArmSource,
        highlightLines: [11, 16, 17, 18],
        caption:
          "Hierarchical keys + target-vs-actual pairs make logs analyzable.",
      },
    },
    {
      id: "swerve-pose",
      text: "Pose data needs one extra trick. Publish X, Y, and heading as individual numbers so you can graph them, but also publish a number array containing X, Y, and rotation in radians. AdvantageScope reads that array as a Pose2d and draws your robot on a 3D field. Same data, two formats, two completely different views.",
      slide: {
        kind: "code",
        title: "CommandSwerveDrivetrain.java — logging pose",
        language: "java",
        code: swervePoseSource,
        highlightLines: [13, 14, 15, 16, 17, 18, 19, 20],
        caption:
          "putNumberArray lets AdvantageScope render pose on a 3D field.",
      },
    },
    {
      id: "performance",
      text: "A few rules to keep the robot loop healthy. Do not log strings at high frequency — they are expensive to serialize. Do not publish the same value twice from different places. Watch for loop overrun warnings, because they usually mean you are logging too much. And not every signal needs fifty hertz — slow-moving data can sample slower.",
      slide: {
        kind: "bullets",
        title: "Keep logging cheap",
        accent: "amber",
        bullets: [
          "Avoid high-frequency strings — prefer numbers and booleans",
          "Do not publish the same key from multiple places",
          "Loop overrun warnings = you are logging too much",
          "Not every signal needs 50Hz",
        ],
      },
    },
    {
      id: "viewing",
      text: "Every boot produces a wpilog file on the roboRIO. Open AdvantageScope, point it at the file, and drag any signal onto a graph. To tune live, pick Connect to Robot instead and AdvantageScope subscribes over NetworkTables. Save your dashboard layout once and you can reuse it every match.",
      slide: {
        kind: "bullets",
        title: "Reading the output",
        accent: "mint",
        bullets: [
          ".wpilog files live on the roboRIO after every boot",
          "File > Download Logs pulls them back to your laptop",
          "Connect to Robot for live tuning over NetworkTables",
          "Save layouts to reuse between matches",
        ],
      },
    },
    {
      id: "outro",
      text: "That is the whole loop. DataLogManager writes the file, Epilogue fills it with subsystem state for free, SmartDashboard adds the extras, and AdvantageScope makes it readable. Set this up once and every match you run leaves behind a complete record you can replay between matches.",
      slide: {
        kind: "title",
        title: "Annotate, publish, replay",
        subtitle: "DataLogManager + Epilogue + AdvantageScope",
        accent: "teal",
      },
    },
  ],
};
