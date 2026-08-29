import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { Split } from "@/components/lesson/Prose";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M } from "@/components/lesson/Mechanism";

export default function OpModes() {
  return (
    <PageTemplate
      title="OpModes"
      lede="Every way the robot can run is its own class with an annotation on top. The driver station lists those classes by name, and picking one builds it. There is no RobotContainer in this project."
      needs={[
        <>
          The project from <strong>Project Setup</strong>, building clean.
        </>,
        <>
          Commands and button bindings from <strong>Writing Commands</strong>.
        </>,
        <>
          The scheduler vocabulary from <strong>The Command Framework</strong>.
        </>,
      ]}
      time="8 minutes"
    >
      <MechanismSelector />

      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            An OpMode is one way the robot can run: driver control, a single
            autonomous routine, a pit procedure that zeroes an arm before a
            match.
          </p>
          <p>
            Nothing registers these classes anywhere. The framework finds them
            by their annotation, and the driver station shows what it found.
          </p>
        </div>
      </Split>

      <LessonSection id="three-kinds" title="Three OpMode roles">
        <p>
          All three are ordinary Java classes. The annotation decides which name
          the driver station shows, and it says what the mode is for.
        </p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Driver control",
              term: "@Teleop",
              body: "Controller bindings and the defaults a driver expects. They exist only while teleop is the selected mode.",
            },
            {
              label: "Preplanned",
              term: "@Autonomous",
              body: "One routine, named on the driver station, scheduled when the mode starts and canceled when it ends.",
            },
            {
              label: "Pit work",
              term: "@Utility",
              body: "Zeroing, characterization, diagnostics. Keeping these out of teleop means a driver cannot trip one in a match.",
            },
          ]}
        />
        <p>
          One routine per class, not one class holding four of them. Four
          autonomous plans mean four <code>@Autonomous</code> classes and four
          names on the list.
        </p>
      </LessonSection>

      <LessonSection id="teleop-shape" title="The Teleop OpMode">
        <p>
          The commands you wrote on <strong>Writing Commands</strong> call
          nothing yet. This is the class that calls them.{" "}
          <strong>Project Setup</strong> left a generated{" "}
          <code>MyTeleop.java</code> in <code>opmode/</code>, already carrying{" "}
          <code>@Teleop</code>. That is the file you edit. Replace its body with
          the whole file from the branch, minus the copyright header.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/opmode/MyTeleop.java"
          code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.command3.button.CommandNiDsXboxController;
import org.wpilib.opmode.PeriodicOpMode;
import org.wpilib.opmode.Teleop;

/**
 * The driver's controls. The framework builds this class when "Teleop" is picked on the driver
 * station. The button bindings made in the constructor belong to this OpMode, and the framework
 * removes them on a mode switch. No cleanup code needed.
 *
 * <p>The buttons here run the arm and flywheel commands.
 */
@Teleop(name = "Teleop")
public class MyTeleop extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public MyTeleop(Robot robot) {
    // Left trigger: push the arm up while held, stop when released.
    driver.leftTrigger().whileTrue(robot.arm.runFast()).whileFalse(robot.arm.stop());

    // Right trigger: spin fast while held, drop back to the slow voltage when released.
    driver.rightTrigger().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.runSlow());

    // A: spin fast while held, stop when released.
    driver.a().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.stop());
  }
}`}
        />

        <p>
          Building only the <M k="noun" />? Delete the{" "}
          <code>
            robot.
            <M k="otherNoun" />
          </code>{" "}
          bindings along with them. Same reason as the field: they call commands
          on a class that does not exist in your project.
        </p>

        <p>
          Every <code>whileTrue</code> has a <code>whileFalse</code> behind it.{" "}
          <code>whileTrue</code> schedules the command on the press and cancels
          it on the release.
        </p>

        <Box
          variant="alert-danger"
          tag="THE TRAP"
          title="Canceling a command does not stop the motor"
        >
          <p>
            The motor is not running in your code. It is running on the motor
            controller, which keeps applying the last request it was sent until
            something sends a different one. So canceling a command does not
            affect the controller.
          </p>
          <p className="mt-3">
            So something else has to take over. That is either a{" "}
            <code>whileFalse</code>, as here, or a default command on the
            mechanism. With neither, releasing the trigger leaves the{" "}
            <M k="noun" /> running on the last thing it was told.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="lifecycle" title="Mode boundaries">
        <p>
          Most teleop classes need neither method below. Bindings made in the
          constructor are enough, and the framework removes them when the mode
          changes. There is no cleanup code to write. Bind in the constructor,
          but never drive a motor from it: the robot can still be disabled when
          that code runs.
        </p>
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
          Autonomous is where the two earn their place. <code>start()</code>{" "}
          schedules the routine and <code>end()</code> cancels it. Pair them
          every time. Hit disable partway through a run and <code>end()</code>{" "}
          fires, so the routine stops on that loop rather than running on into
          the next mode.
        </p>
        <p>
          Utility modes use the same boundary. Begin the calibration in{" "}
          <code>start()</code>, stop it in <code>end()</code>, and the mode is
          safe to leave at any point.
        </p>
      </LessonSection>

      <LessonSection id="scope" title="Where behavior lives">
        <p>
          One question settles most of it. What is the smallest scope where this
          behavior still works? Put it there.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Behavior</th>
                <th className="px-3 py-2 text-left">Home</th>
                <th className="px-3 py-2 text-left">Anywhere else</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Driver buttons</td>
                <td className="px-3 py-2">
                  The <code>@Teleop</code> class
                </td>
                <td className="px-3 py-2">
                  A binding in <code>Robot</code> stays live in every mode.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">One autonomous routine</td>
                <td className="px-3 py-2">
                  Its own <code>@Autonomous</code> class
                </td>
                <td className="px-3 py-2">
                  A routine with no annotation has no name to select.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Zeroing, characterization</td>
                <td className="px-3 py-2">
                  A <code>@Utility</code> class
                </td>
                <td className="px-3 py-2">
                  On a driver button, someone starts it during a match.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">A binding every mode needs</td>
                <td className="px-3 py-2">
                  The <code>Robot</code> constructor
                </td>
                <td className="px-3 py-2">
                  Copied into each OpMode, the copies drift apart.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Motor IDs and gains</td>
                <td className="px-3 py-2">The mechanism</td>
                <td className="px-3 py-2">
                  In an OpMode, two modes can configure the same motor.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Run <em>WPILib: Build Robot Code</em>. You should see{" "}
          <code>BUILD SUCCESSFUL</code>. Nothing runs until{" "}
          <strong>Hardware Simulation</strong>, so the rest of this is a read
          through your own class.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You bind whileTrue(robot.arm.runFast()) and leave the whileFalse off. You release the trigger. What does the arm do?",
            options: [
              "Stops, because canceling a command releases the mechanism",
              "Keeps pushing, because the motor controller is still holding the last request it was sent",
              "Stops, because the scheduler zeroes a mechanism nothing is commanding",
              "Nothing compiles: a whileTrue needs a whileFalse",
            ],
            correctAnswer: 1,
            explanation:
              "Canceling ends the command, and that is all it does. The request lives on the motor controller, which keeps applying it until something sends a different one. Either a whileFalse or a default command has to take over.",
          },
          {
            id: 2,
            question:
              "You switch from Teleop to Autonomous. What happens to the bindings made in the teleop constructor?",
            options: [
              "They keep firing, so the Autonomous class has to cancel them",
              "They keep firing until the next reboot",
              "The framework removes them, and there is no cleanup code to write",
              "They survive only if the OpMode implements end()",
            ],
            correctAnswer: 2,
            explanation:
              "Bindings belong to the OpMode that made them. The framework builds the class on selection and takes its bindings away on a mode switch. That is why most teleop classes need neither start() nor end().",
          },
          {
            id: 3,
            question:
              "A binding has to brake the drivetrain whenever the robot is disabled, in every mode. Where does it go?",
            options: [
              "The Robot constructor",
              "The @Teleop class, since that is where the drivers are",
              "One copy in every OpMode",
              "A @Utility class somebody selects before the match",
            ],
            correctAnswer: 0,
            explanation:
              "Smallest scope where the behavior still works. An OpMode's bindings die on a mode switch, so a rule that has to hold in every mode belongs to the one object that outlives them all. Copied into each OpMode, the copies drift apart.",
          },
          {
            id: 4,
            question:
              "Your team has four autonomous routines. How many classes, and what picks between them?",
            options: [
              "One class holding four routines, with a chooser on the dashboard",
              "One class, and the driver station hands the routine name to its constructor",
              "Four @Autonomous classes, each listed on the driver station by its own name",
              "Four @Utility classes, selected before the match starts",
            ],
            correctAnswer: 2,
            explanation:
              "One routine per class. The annotation puts each name on the driver station, so picking a routine is picking a mode. There is no SendableChooser in this project.",
          },
        ]}
      />
    </PageTemplate>
  );
}
