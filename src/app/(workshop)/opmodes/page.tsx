import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/opmodes");

/**
 * The page where the commands from `/adding-commands` get a button. It teaches
 * exactly what `mech-2-Commands` changes in `opmode/MyTeleop.java` and nothing
 * else, and it owns the binding vocabulary: `whileTrue` and `whileFalse` are
 * taught here, and `/adding-commands` neither teaches nor quizzes them.
 *
 * It used to open with a three-card grid of `@Teleop` / `@Autonomous` /
 * `@Utility`, a section on `start()` and `end()`, and a scope table, ten
 * lessons before anyone writes an autonomous routine. All of that is now one
 * paragraph saying autos come later. `/coroutines` writes the first
 * `@Autonomous` in Workshop 4.
 *
 * Why a release needs a `whileFalse` is shown, not told, on
 * `/running-program#latched`.
 *
 * The code block is forked by mechanism: a student reads and pastes only the
 * bindings for the mechanism they built. After the block, one line per piece,
 * at the level an 11-to-18-year-old needs (owner's November 2026 review).
 */
export default function OpModes() {
  return (
    <PageTemplate
      title="OpModes"
      lede="Each way the robot can run is its own class, marked with an annotation. Project Setup generated one marked @Teleop. You edit it so the controller's buttons run the commands you just wrote."
      needs={[
        <>
          The three commands on each mechanism from{" "}
          <strong>Writing Commands</strong>, building clean.
        </>,
        <>
          The{" "}
          <code>
            robot.
            <M k="noun" />
          </code>{" "}
          field from <strong>Mechanisms</strong>.
        </>,
      ]}
      branch="mech-2-Commands"
      time="7 minutes"
    >
      <MechanismSelector />

      <LessonSection id="the-generated-file" title="The generated MyTeleop">
        <p>
          Open <code>src/main/java/first/robot/opmode/MyTeleop.java</code>. The
          New Project Creator created this teleop file for you. The{" "}
          <code>@Teleop</code> on the class is what puts it on the driver
          station. If you leave it off, it no longer shows up as an OpMode you
          can choose.
        </p>
        <p>
          The generated file holds five empty methods with comments in them:{" "}
          <code>disabledPeriodic</code>, <code>start</code>,{" "}
          <code>periodic</code>, <code>end</code> and <code>close</code>. We do
          not need them in this project, so you replace the whole class below.
          They are useful to know for future projects, such as autonomous
          routines. Edit this file rather than making a new one: a second{" "}
          <code>@Teleop</code> class puts two teleops on the driver station.
        </p>
        <p>
          <code>MyAuto.java</code> beside it is marked <code>@Autonomous</code>{" "}
          and stays empty for now. We will work on autonomous routines later.
        </p>
      </LessonSection>

      <LessonSection id="add-the-controller" title="Add the controller">
        <p>
          The controller lives in <code>Robot.java</code>, beside the
          mechanisms, so every OpMode reaches it the same way:{" "}
          <code>robot.driver</code>. Add the import and the field.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/Robot.java"
          code={`package first.robot;

import first.robot.mechanisms.Arm;
import first.robot.mechanisms.Flywheel;
import org.wpilib.command3.Scheduler;
import org.wpilib.command3.button.CommandNiDsXboxController;
import org.wpilib.framework.OpModeRobot;

public class Robot extends OpModeRobot {
  // The robot's mechanisms. Public so OpModes can use them.
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  // The driver's controller on port 0. OpModes bind its buttons through robot.driver.
  public final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  // ... the constructor and robotPeriodic, unchanged
}`}
          highlightLines={[6, 14, 15]}
        />

        <p>
          <code>new CommandNiDsXboxController(0)</code> creates an Xbox
          controller. The <code>0</code> is its port on the driver station.
        </p>
      </LessonSection>

      <LessonSection id="bind-the-buttons" title="Bind the buttons">
        <p>Replace everything below the copyright header with this.</p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/opmode/MyTeleop.java"
            code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.opmode.PeriodicOpMode;
import org.wpilib.opmode.Teleop;

@Teleop(name = "Teleop")
public class MyTeleop extends PeriodicOpMode {
  public MyTeleop(Robot robot) {
    // Left trigger: push the arm up while held, stop when released.
    robot.driver.leftTrigger().whileTrue(robot.arm.runFast()).whileFalse(robot.arm.stop());
  }
}`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/opmode/MyTeleop.java"
            code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.opmode.PeriodicOpMode;
import org.wpilib.opmode.Teleop;

@Teleop(name = "Teleop")
public class MyTeleop extends PeriodicOpMode {
  public MyTeleop(Robot robot) {
    // Right trigger: spin fast while held, drop back to the slow voltage when released.
    robot
        .driver
        .rightTrigger()
        .whileTrue(robot.flywheel.runFast())
        .whileFalse(robot.flywheel.runSlow());

    // A: spin fast while held, stop when released.
    robot.driver.a().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.stop());
  }
}`}
          />
        </Mech>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>@Teleop(name = &quot;Teleop&quot;)</code> is the name in the
            driver station&apos;s list.
          </li>
          <li>
            <code>MyTeleop(Robot robot)</code> hands this OpMode the robot, so
            it can reach your mechanism and the controller.
          </li>
          <li>
            <code>robot.driver.leftTrigger()</code> is a button on the
            controller you added to <code>Robot</code>.
          </li>
          <li>
            <code>whileTrue</code> runs a command while the button is held, and
            cancels it on release.
          </li>
          <li>
            <code>whileFalse</code> runs a command once the button is released.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Run <em>WPILib: Build Robot Code</em>. Nothing moves until{" "}
          <strong>Hardware Simulation</strong>, so check the file as well as the
          build.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <code>BUILD SUCCESSFUL</code> as the last line of the terminal.
            </li>
            <li>
              One hit when you search the <code>opmode</code> folder for{" "}
              <code>@Teleop</code>.
            </li>
            <li>
              A <code>whileFalse</code> on every binding line.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "A binding reads robot.driver.rightTrigger().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.runSlow()). You release the trigger. What is running a moment later?",
            options: [
              "Nothing, because whileTrue cancels runFast on the release",
              "runSlow, because whileFalse runs it once the trigger is released",
              "runFast, because a trigger has no release event",
              "Both runFast and runSlow, one after the other",
            ],
            correctAnswer: 1,
            explanation:
              "whileTrue cancels runFast when the trigger comes up, and whileFalse starts runSlow at the same moment.",
          },
          {
            id: 2,
            question:
              "Instead of editing MyTeleop, a teammate makes a new TeleopOpMode.java with @Teleop on it and the same bindings. What goes wrong?",
            options: [
              "The build fails, because only one class may extend PeriodicOpMode",
              "Nothing: the framework uses the newest class",
              "The bindings run twice, once from each class",
              "The driver station lists two teleops, and the generated empty one can be picked by mistake",
            ],
            correctAnswer: 3,
            explanation:
              "Every annotated class is registered, so both appear in the list. Picking the generated MyTeleop runs a teleop with no bindings, and nothing moves. Edit the generated file rather than adding a second one.",
          },
        ]}
      />
    </PageTemplate>
  );
}
