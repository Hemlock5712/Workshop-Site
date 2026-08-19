import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import { MarginNote, Split } from "@/components/lesson/Prose";

export default function OpModes() {
  return (
    <PageTemplate
      title="Put mode-specific behavior in a mode-specific class"
      emphasis="mode-specific class"
      lede="Teleop, autonomous, and utility behavior do not share one giant switch statement. Each mode is a class with an annotation, a constructor for setup, and lifecycle methods for work that must happen when the mode starts or ends."
      needs={[
        <>
          The project from <strong>Project Setup</strong>.
        </>,
        <>
          Triggers, mechanisms, commands, and the scheduler from the{" "}
          <strong>Command-Based Framework</strong> lesson.
        </>,
        <>
          A classic mechanism command from <strong>Classic Commands</strong>.
        </>,
      ]}
      time="About 25 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "An OpMode describes one way the robot can run. The framework discovers annotated OpMode classes and gives the selected one access to the shared Robot object.",
            "Bindings created in an OpMode constructor belong to that mode. When the driver station changes modes, the scheduler removes that mode's triggers and commands.",
          ]}
          concept="Robot owns hardware for the whole process. An OpMode owns behavior for one selected operating mode."
        />
        <MarginNote label="2027 STACK">
          Older tutorials put every controller binding in RobotContainer. This
          project uses Commands v3 and OpModes; there is no RobotContainer.
        </MarginNote>
      </Split>

      <LessonSection id="three-kinds" title="Recognize the three OpMode roles">
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Driver control",
              term: "@Teleop",
              body: "Controller bindings and driver-facing defaults that exist only while teleop mode is selected.",
            },
            {
              label: "Preplanned",
              term: "@Autonomous",
              body: "One selected routine scheduled when autonomous starts and canceled when the mode ends.",
            },
            {
              label: "Pit work",
              term: "@Utility",
              body: "Calibration, characterization, and diagnostics that should never be mixed into match controls.",
            },
          ]}
        />
      </LessonSection>

      <LessonSection id="teleop-shape" title="Build the smallest Teleop OpMode">
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          title="TeleopOpMode.java: one binding, one mode"
          code={`package frc.robot.opmodes;

import frc.robot.Robot;
import org.wpilib.command3.button.CommandNiDsXboxController;
import org.wpilib.opmode.PeriodicOpMode;
import org.wpilib.opmode.Teleop;

@Teleop(name = "Driver Control")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    driver.a().whileTrue(robot.arm.runSlow());
  }
}`}
        />
        <p>
          The annotation makes the class discoverable. The constructor receives
          the one <code>Robot</code> object, then connects a trigger to a
          command. There is no loop here because the scheduler checks the
          trigger and runs the command.
        </p>
        <Box variant="concept" title="Constructor means configure the mode">
          <p>
            Create bindings and mode-scoped default commands in the constructor.
            Do not start long-running actions there. The selected OpMode may be
            constructed before the robot is enabled.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="lifecycle"
        title="Use start and end for mode boundaries"
      >
        <CodeBlock
          language="java"
          title="The lifecycle shape"
          code={`@Override
public void start() {
  // Called once when this OpMode becomes active.
}

@Override
public void end() {
  // Called once when this OpMode stops being active.
}`}
        />
        <p>
          Most teleop classes need only constructor bindings. Autonomous uses
          <code>start()</code> to schedule its routine and <code>end()</code> to
          cancel it. Utility modes use the same boundary for a calibration or
          characterization run.
        </p>
      </LessonSection>

      <LessonSection
        id="scope"
        title="Put each behavior at the narrowest useful scope"
      >
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Driver buttons belong in a <code>@Teleop</code> constructor.
          </li>
          <li>
            An autonomous routine belongs in its <code>@Autonomous</code> class.
          </li>
          <li>
            Calibration controls belong in a <code>@Utility</code> class.
          </li>
          <li>
            A binding that applies in every mode belongs in <code>Robot</code>,
            and should be rare.
          </li>
          <li>
            Motor configuration belongs in the mechanism that owns the motor,
            not in an OpMode.
          </li>
        </ul>
        <Box
          variant="alert-warning"
          tag="COMMON MIX-UP"
          title="An OpMode is not a mechanism"
        >
          <p>
            The OpMode decides when an action is available. The mechanism still
            owns the motor and creates the command. If changing driver controls
            requires editing motor configuration, those responsibilities have
            been mixed together.
          </p>
        </Box>
      </LessonSection>
    </PageTemplate>
  );
}
