import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import CollapsibleSection from "@/components/CollapsibleSection";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import {
  BarChart2,
  Book,
  Globe,
  Zap,
  Lightbulb,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function LoggingImplementation() {
  return (
    <PageTemplate title="Implementing Logging">
      {/* Introduction */}
      <KeyConceptSection
        title="Setting Up DataLogManager"
        description="We log with WPILib's built-in DataLogManager. No vendordep, no LoggedRobot, no replay layer. Two lines in Robot's constructor turn it on; after that, anything published to NetworkTables (your telemetry plus the Driver-Station and joystick data) is captured to a .wpilog file you open in AdvantageScope."
        concept="Turn it on in Robot's constructor, then publish what you care about to NetworkTables. DataLogManager records every NT change to disk."
      />

      {/* Turning it on */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Turning on logging
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          <code>DataLogManager</code> is part of WPILib, so there&apos;s nothing
          to install. Start it in <code>Robot</code>&apos;s constructor before
          anything else, and add the Driver-Station data feed:
        </p>

        <CodeBlock
          filename="Robot.java"
          language="java"
          code={`import org.wpilib.driverstation.DriverStation;
import org.wpilib.framework.OpModeRobot;
import org.wpilib.system.DataLogManager;

public class Robot extends OpModeRobot {
  // Subsystems live here as public final fields — see the Command-Based Framework page.

  public Robot() {
    // Start on-robot logging. Two lines, no vendordep:
    DataLogManager.start();                              // records every NetworkTables change + console output
    DriverStation.startDataLog(DataLogManager.getLog()); // adds Driver-Station state + joystick data

    // ... construct subsystems and always-on bindings after this.
  }
}`}
        />

        <Box
          variant="alert-info"
          title="Where the logs go"
          icon={<Info className="w-5 h-5" />}
        >
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Simulation:</strong> a <code>.wpilog</code> under{" "}
              <code>./logs</code> in your project.
            </li>
            <li>
              <strong>On SystemCore:</strong> a USB drive if one is plugged in,
              otherwise <code>/home/systemcore/logs</code>.
            </li>
            <li>
              <strong>Phoenix 6 devices</strong> additionally log to a{" "}
              <code>.hoot</code> file (high-rate signal data) that you can open
              in Tuner X or AdvantageScope, so you get that extra detail for
              free.
            </li>
          </ul>
        </Box>
      </section>

      {/* What you get for free */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What you get automatically
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          The moment <code>DataLogManager.start()</code> runs, these are
          captured with no further code:
        </p>

        <Box
          variant="alert-tip"
          title="Captured for free"
          icon={<Lightbulb className="w-5 h-5" />}
        >
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Every NetworkTables value change</strong>, including
              everything your telemetry publishes (more below)
            </li>
            <li>
              <strong>Console output</strong>: anything printed to stdout/stderr
            </li>
            <li>
              <strong>Driver-Station data</strong> (via{" "}
              <code>startDataLog</code>): alliance, mode, match time, and full
              joystick axes/buttons
            </li>
            <li>
              <strong>Phoenix 6 signals</strong> in the <code>.hoot</code> file:
              motor positions, velocities, currents, temperatures
            </li>
          </ul>
        </Box>
      </section>

      {/* Logging your own values */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Logging your own values
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          To log something specific,{" "}
          <strong>publish it to NetworkTables</strong>;{" "}
          <code>DataLogManager</code> records the change to the{" "}
          <code>.wpilog</code> automatically. For a quick number,{" "}
          <code>SmartDashboard.putNumber(&quot;Arm/Position&quot;, pos)</code>{" "}
          works. For structured types like <code>Pose2d</code> or{" "}
          <code>ChassisVelocities</code>, use a NetworkTables{" "}
          <em>struct publisher</em> so AdvantageScope can render them natively.
        </p>

        <CollapsibleSection title="🗺️ The drivetrain telemetry surface (struct publishers)">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            The template&apos;s <code>Telemetry</code> class is the
            project&apos;s logging surface. It publishes the swerve state to
            NetworkTables with type-aware struct publishers; CTRE calls it from
            the odometry thread (register with{" "}
            <code>drivetrain.registerTelemetry(telemetry::telemeterize)</code>).
            Because it&apos;s on NetworkTables, <code>DataLogManager</code>{" "}
            writes it to the <code>.wpilog</code> too.
          </p>
          <CodeBlock
            filename="Telemetry.java"
            language="java"
            code={`import org.wpilib.networktables.DoublePublisher;
import org.wpilib.networktables.NetworkTable;
import org.wpilib.networktables.NetworkTableInstance;
import org.wpilib.networktables.StructPublisher;
import org.wpilib.math.geometry.Pose2d;
import org.wpilib.math.kinematics.ChassisVelocities;

public class Telemetry {
  private final NetworkTable table =
      NetworkTableInstance.getDefault().getTable("Drivetrain");

  // Struct publishers are type-aware: AdvantageScope drops a Pose2d straight
  // onto the field view, no manual x/y/heading wiring.
  private final StructPublisher<Pose2d> pose =
      table.getStructTopic("Pose", Pose2d.struct).publish();
  private final StructPublisher<ChassisVelocities> velocity =
      table.getStructTopic("Velocity", ChassisVelocities.struct).publish();
  private final DoublePublisher translationSpeed =
      table.getDoubleTopic("TranslationSpeedMps").publish();

  // CTRE invokes this every new swerve state. Each set(...) lands on NT under
  // Drivetrain/* and is captured to the .wpilog by DataLogManager.
  public void telemeterize(SwerveDriveState state) {
    pose.set(state.Pose);
    velocity.set(state.Velocity);
    translationSpeed.set(Math.hypot(state.Velocity.vx, state.Velocity.vy));
  }
}`}
          />
        </CollapsibleSection>

        <CollapsibleSection title="📊 Logging from a mechanism (there's no periodic() in v3)">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            v3 mechanisms don&apos;t have a <code>periodic()</code> method, so
            &quot;publish my state every loop&quot; needs a different home. The
            simple pattern is a <code>runRepeatedly(...)</code> default command
            that publishes each tick whenever nothing else is using the
            mechanism:
          </p>
          <CodeBlock
            filename="Arm.java"
            language="java"
            code={`public class Arm extends Mechanism {
  private final TalonFX motor = new TalonFX(31);
  private final DoublePublisher positionPub =
      NetworkTableInstance.getDefault().getTable("Arm").getDoubleTopic("Position").publish();

  public Arm() {
    // Publish telemetry every loop while idle; a real command pre-empts it.
    setDefaultCommand(runRepeatedly(this::publishTelemetry).named("Arm:telemetry"));
  }

  private void publishTelemetry() {
    positionPub.set(motor.getPosition().getValueAsDouble()); // -> NT Arm/Position -> .wpilog
  }
}`}
          />
          <p className="text-slate-600 dark:text-slate-300 mt-4">
            You can also publish from inside a command body, right next to the
            setpoint that produced the value — handy for logging
            target-vs-actual during a move.
          </p>
        </CollapsibleSection>

        <Box
          variant="alert-warning"
          title="Performance Considerations"
          icon={<AlertTriangle className="w-5 h-5" />}
        >
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Use hierarchical keys</strong> (e.g.{" "}
              <code>&quot;Arm/Position&quot;</code>) so the log stays organized.
            </li>
            <li>
              <strong>Prefer struct types</strong>: publish one{" "}
              <code>Pose2d</code> rather than three separate numbers.
            </li>
            <li>
              <strong>Avoid high-frequency strings</strong>. They&apos;re
              expensive; log numbers and booleans.
            </li>
            <li>
              <strong>Don&apos;t over-publish</strong>. Too much NT traffic can
              affect loop timing.
            </li>
          </ul>
        </Box>
      </section>

      {/* Workshop Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Workshop Code Implementation
        </h2>

        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Robot.java — starting DataLogManager
        </h3>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="2-Logging"
          filePath="src/main/java/frc/robot/Robot.java"
        />

        <CollapsibleSection title="🔧 Drivetrain telemetry">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            The drivetrain is the canonical example: it publishes{" "}
            <code>Pose2d</code>, velocity, and per-module states to
            NetworkTables through its telemetry helper, and{" "}
            <code>DataLogManager</code> records all of it.
          </p>
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="2-Logging"
            filePath="src/main/java/frc/robot/subsystems/CommandSwerveDrivetrain.java"
          />
        </CollapsibleSection>
      </section>

      {/* Viewing Logs */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          AdvantageScope
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          AdvantageScope is the natural viewer for the logs you&apos;re
          producing. It reads <code>.wpilog</code> files for post-match analysis
          and connects to your robot over NetworkTables for live monitoring.
          (Glass and Tuner X can also read these; Tuner X opens the{" "}
          <code>.hoot</code> files.)
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              📡 Real-Time Data Viewing
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Everything you publish to NetworkTables is visible live.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Open AdvantageScope on your driver station</li>
              <li>Select &quot;Connect to Robot&quot; from the menu</li>
              <li>Enter your team number or robot address</li>
              <li>
                Browse the NetworkTables tree — your keys land under their table
                (e.g. <code>Drivetrain/Pose</code>)
              </li>
              <li>
                Add graphs, the 3D field view, or swerve module visualizations
              </li>
            </ol>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              📥 Post-Match Log Analysis
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              Pull <code>.wpilog</code> files off the USB drive or download them
              from the robot with AdvantageScope.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Open Preferences and set the robot address / log folder</li>
              <li>Click &quot;File&quot; &gt; &quot;Download Logs...&quot;</li>
              <li>Select the logs to download (newest at top)</li>
              <li>
                Open the downloaded <code>.wpilog</code> file
              </li>
              <li>Add line graphs or use the 3D field view for analysis</li>
            </ol>
          </div>
        </div>

        <Box
          variant="alert-info"
          title="Where the data lives in NetworkTables"
          icon={<Info className="w-5 h-5" />}
        >
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
            Your published values land under whatever table you chose, and the
            auto-captured data sits alongside it:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <code>Drivetrain/Pose</code>, <code>Drivetrain/Velocity</code>, …:
              your telemetry struct publishers
            </li>
            <li>
              <code>SmartDashboard/...</code>: anything you sent via{" "}
              <code>SmartDashboard.put*</code>
            </li>
            <li>
              Driver-Station and joystick data captured by{" "}
              <code>startDataLog</code>
            </li>
          </ul>
        </Box>

        <Box
          variant="alert-tip"
          title="AdvantageScope Pro Tips"
          icon={<Lightbulb className="w-5 h-5" />}
        >
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Overlay multiple signals:</strong> compare target vs
              actual on the same graph
            </li>
            <li>
              <strong>Video sync:</strong> line log data up with match video
            </li>
            <li>
              <strong>Save layouts:</strong> reusable dashboards for quick
              analysis
            </li>
            <li>
              <strong>Drag struct types in:</strong> drop a logged{" "}
              <code>Pose2d</code> onto the 2D/3D field view directly
            </li>
          </ul>
        </Box>

        <DocumentationButton
          href="https://docs.advantagescope.org/"
          title="AdvantageScope Documentation"
          icon={<Book className="w-5 h-5" />}
        />
      </section>

      {/* Best Practices */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Logging Best Practices
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Box variant="alert-success" title="✅ Do">
            <ul className="list-disc list-inside space-y-2">
              <li>
                Log sensor inputs, motor outputs, and target setpoints together
              </li>
              <li>
                Use hierarchical keys (<code>Subsystem/Parameter</code>)
              </li>
              <li>
                Prefer struct types (<code>Pose2d</code>,{" "}
                <code>SwerveModuleVelocity[]</code>) over flattened number
                arrays
              </li>
              <li>
                Start DataLogManager first thing in Robot&apos;s constructor
              </li>
              <li>
                Download logs after every match and review between matches
              </li>
            </ul>
          </Box>

          <Box variant="alert-danger" title="❌ Don&rsquo;t">
            <ul className="list-disc list-inside space-y-2">
              <li>Log high-frequency strings (use numbers or booleans)</li>
              <li>
                Publish so much that NetworkTables traffic hurts loop timing
              </li>
              <li>
                Forget a USB drive on the robot if you want the log off the
                controller easily
              </li>
              <li>Ignore loop-overrun warnings from excessive publishing</li>
            </ul>
          </Box>
        </div>
      </section>

      {/* Resources */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Additional Resources
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <DocumentationButton
            href="https://docs.wpilib.org/en/stable/docs/software/telemetry/datalog.html"
            title="WPILib DataLogManager Documentation"
            icon={<Book className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://docs.wpilib.org/en/stable/docs/software/networktables/networktables-intro.html"
            title="NetworkTables (publishing values)"
            icon={<Globe className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://docs.advantagescope.org/"
            title="AdvantageScope - Log Visualization"
            icon={<BarChart2 className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://v6.docs.ctr-electronics.com/"
            title="Phoenix 6 (.hoot signal logging)"
            icon={<Zap className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question: "How do you turn on logging in the 2027 template?",
              options: [
                "Extend LoggedRobot and add the AdvantageKit vendordep",
                "Call DataLogManager.start() and DriverStation.startDataLog(...) in Robot's constructor",
                "Annotate every field with @Logged",
                "Enable it from the Driver Station settings",
              ],
              correctAnswer: 1,
              explanation:
                "DataLogManager is built into WPILib. Two lines in Robot's constructor do it: DataLogManager.start() records NetworkTables changes and console output, and DriverStation.startDataLog(DataLogManager.getLog()) adds Driver-Station and joystick data. No vendordep and no LoggedRobot.",
            },
            {
              id: 2,
              question: "What does DataLogManager capture automatically?",
              options: [
                "Only values you pass to Logger.recordOutput(...)",
                "Every NetworkTables value change, console output, and (via startDataLog) Driver-Station + joystick data",
                "Only Phoenix 6 motor signals",
                "Nothing until you annotate fields with @Logged",
              ],
              correctAnswer: 1,
              explanation:
                "Once started, DataLogManager records all NetworkTables value changes and console output to a .wpilog; startDataLog adds the Driver-Station state and joystick data. Phoenix 6 devices also log signals to a separate .hoot file.",
            },
            {
              id: 3,
              question:
                "How do you get a custom value (say, the arm's position) into the log?",
              options: [
                'Call Logger.recordOutput("Arm/Position", pos)',
                "Publish it to NetworkTables (SmartDashboard.putNumber or a NT publisher) — DataLogManager records NT changes",
                "Write it to a text file yourself",
                "It can't be logged without AdvantageKit",
              ],
              correctAnswer: 1,
              explanation:
                "DataLogManager logs whatever changes on NetworkTables, so you log a custom value by publishing it there — SmartDashboard.putNumber for a quick number, or a NetworkTables struct publisher for types like Pose2d.",
            },
            {
              id: 4,
              question:
                "Why publish a Pose2d through a NetworkTables struct publisher instead of three separate doubles?",
              options: [
                "Three doubles aren't allowed on NetworkTables",
                "A struct publisher keeps it as one type-aware value, so AdvantageScope can drop it straight onto the 2D/3D field view",
                "It uses less battery",
                "Struct publishers are required for DataLogManager to run",
              ],
              correctAnswer: 1,
              explanation:
                "Pose2d (and ChassisVelocities, SwerveModuleVelocity[], etc.) are WPILib struct types. Publishing them through a StructPublisher keeps them as one coherent value that AdvantageScope reconstructs and renders natively — no manual axis wiring.",
            },
            {
              id: 5,
              question:
                "A v3 Mechanism has no periodic() method. Where do you put per-loop telemetry publishing?",
              options: [
                "Override periodic() — Mechanism still has it",
                "In a runRepeatedly(this::publishTelemetry).named(...) default command, or from inside command bodies",
                "Telemetry isn't possible without periodic()",
                "In Robot.robotPeriodic() for every mechanism",
              ],
              correctAnswer: 1,
              explanation:
                "Mechanism intentionally drops periodic(). Set a runRepeatedly(...) default command to publish each loop while the mechanism is idle, or publish from inside command bodies next to the setpoint. The drivetrain uses a CTRE-registered Telemetry callback instead.",
            },
          ]}
        />
      </section>

      {/* What's Next Section */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What&apos;s Next?
        </h2>

        <Box variant="alert-success" title="Up Next: Drive to Point">
          With DataLogManager recording your pose, velocities, and module
          states, you&apos;re ready to implement autonomous navigation, with
          every PID setpoint, error, and motor output captured for tuning the
          moment something looks off.
        </Box>
      </section>
    </PageTemplate>
  );
}
