import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

export default function LoggingImplementation() {
  return (
    <PageTemplate
      title="Record the evidence before you need it"
      emphasis="before you need it"
      lede="A log turns a one-time robot failure into data you can inspect after the motor stops. Start the recorder in Robot.java, publish a few useful values, and verify the file before the project becomes complicated."
      needs={[
        <>
          The project from <strong>Project Setup</strong> building successfully.
        </>,
        <>
          <strong>Robot.java</strong> and <strong>Mechanisms</strong> from the
          previous lessons.
        </>,
        <>AdvantageScope installed from Prerequisites.</>,
      ]}
      time="About 20 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "DataLogManager records console output and every NetworkTables value change. DriverStation adds robot mode and controller data to the same timeline.",
            "Logging is most useful when it is always on. Start it once in Robot.java; do not wait for a bug and then redeploy a special logging build.",
          ]}
          concept="Log inputs, outputs, and state. A useful timeline can answer what the robot sensed, what it decided, and what it commanded."
        />
        <MarginNote label="SCOPE">
          This is intentionally basic logging. Workshop 3 adds drivetrain pose
          and swerve telemetry after those types have been introduced.
        </MarginNote>
      </Split>

      <LessonSection
        id="start-the-log"
        title="Start one course-wide log in Robot.java"
      >
        <p>
          Put the setup at the beginning of the <code>Robot</code> constructor
          so startup messages and every OpMode are captured.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/Robot.java"
          title="Robot.java — logging starts once"
          code={`import org.wpilib.driverstation.DriverStation;
import org.wpilib.system.DataLogManager;

public Robot() {
  DataLogManager.start();
  DriverStation.startDataLog(DataLogManager.getLog());

  // Construct mechanisms and global bindings after logging is active.
}`}
        />
        <Box variant="concept" title="Two calls, two layers of context">
          <p>
            <code>DataLogManager.start()</code> starts the file and captures
            NetworkTables plus console output.{" "}
            <code>DriverStation.startDataLog</code>
            adds enabled state, robot mode, alliance, match time, and joystick
            data.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="publish-one-mechanism"
        title="Publish a small mechanism story"
      >
        <p>
          Start with three values: the sensor reading, the target, and the
          output request. Names should group related signals so the viewer
          presents them together.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Arm.java"
          title="Arm.java — three numbers worth keeping"
          code={`import org.wpilib.networktables.DoublePublisher;
import org.wpilib.networktables.NetworkTableInstance;

private final DoublePublisher positionLog =
    NetworkTableInstance.getDefault().getDoubleTopic("Arm/PositionRot").publish();
private final DoublePublisher targetLog =
    NetworkTableInstance.getDefault().getDoubleTopic("Arm/TargetRot").publish();
private final DoublePublisher voltageLog =
    NetworkTableInstance.getDefault().getDoubleTopic("Arm/AppliedVolts").publish();

private void record(double position, double target, double volts) {
  positionLog.set(position);
  targetLog.set(target);
  voltageLog.set(volts);
}`}
        />
        <p>
          Call the small <code>record</code> helper from the same repeated
          command or scheduler task that refreshes the values. Do not invent a
          second control loop only for telemetry.
        </p>
        <Box
          variant="alert-info"
          tag="NAMING"
          title="Put units in the signal name"
        >
          <p>
            <code>Arm/Position</code> makes the reader guess.{" "}
            <code>Arm/PositionRot</code>
            and <code>Arm/AppliedVolts</code> remain clear months later and can
            share a project with degrees, radians, or duty-cycle output without
            collisions.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="read-the-file"
        title="Create a file and prove you can read it"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run the program, enable the appropriate OpMode, and move the
            mechanism through one short test.
          </li>
          <li>Disable cleanly and stop the program so the log is flushed.</li>
          <li>
            Open the newest <code>.wpilog</code> from the project&apos;s{" "}
            <code>logs</code> directory in AdvantageScope.
          </li>
          <li>
            Plot position and target on one graph, then voltage on a second
            graph.
          </li>
          <li>
            Confirm the enabled interval and controller action line up with the
            mechanism movement.
          </li>
        </ol>
        <Box
          variant="alert-warning"
          tag="CHECK NOW"
          title="An unread log is not a logging system"
        >
          <p>
            Do not continue because the program printed “logging started.”
            Finish only after a real signal appears in a real file and its units
            make sense.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="logging-rules"
        title="Keep the first logging rules simple"
      >
        <ul className="ml-5 list-disc space-y-2">
          <li>Log measured state and requested state together.</li>
          <li>
            Prefer stable, hierarchical names over one-off debug messages.
          </li>
          <li>Include units in names when the type does not carry units.</li>
          <li>Do not publish the same fact from multiple classes.</li>
          <li>Keep logging enabled in every mode and every build.</li>
          <li>
            Add a signal only when someone can name the question it answers.
          </li>
        </ul>
        <DocumentationButton
          href="https://docs.wpilib.org/en/latest/docs/software/telemetry/datalog.html"
          title="WPILib — On-robot telemetry recording"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>
    </PageTemplate>
  );
}
