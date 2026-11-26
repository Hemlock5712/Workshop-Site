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
 *
 * November 2026: `MyTeleop` is no longer generated. The project now starts
 * from the "Command v3 Robot Skeleton (Advanced)" template, which ships no
 * OpMode, so the student creates the file in `/project-setup` and it holds one
 * empty constructor. The first section says that instead of listing five
 * generated methods, `MyAuto` is gone from the chain and from this page, and
 * both blocks are `implements OpMode`, matching `mech-2-Commands`.
 */
export default function OpModes() {
  return (
    <PageTemplate
      title="OpModes"
      lede="Bind the controller's buttons to your commands in a teleop OpMode."
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
      <p>
        Each way the robot can run is its own class, marked with an annotation.
      </p>

      <MechanismSelector />

      <LessonSection id="the-generated-file" title="The MyTeleop file">
        <p>
          Open <code>src/main/java/first/robot/opmode/MyTeleop.java</code>. You
          created this teleop file in <strong>Project Setup</strong>. The{" "}
          <code>@Teleop</code> on the class is what puts it on the driver
          station. If you leave it off, it no longer shows up as an OpMode you
          can choose.
        </p>
        <p>
          The class holds one empty constructor, and this lesson fills it. Edit
          this file rather than making a new one: a second <code>@Teleop</code>{" "}
          class puts two teleops on the driver station.
        </p>
        <p>
          An autonomous routine gets its own class, marked{" "}
          <code>@Autonomous</code>. We will work on those later.
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
import org.wpilib.command3.button.CommandXboxController;
import org.wpilib.framework.OpModeRobot;

public class Robot extends OpModeRobot {
  // The robot's mechanisms. Public so OpModes can use them.
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  // The driver's controller on port 0. OpModes bind its buttons through robot.driver.
  public final CommandXboxController driver = new CommandXboxController(0);

  // ... the constructor and robotPeriodic, unchanged
}`}
          highlightLines={[6, 14, 15]}
        />

        <p>
          <code>new CommandXboxController(0)</code> creates an Xbox controller.
          The <code>0</code> is its port on the driver station.
        </p>
      </LessonSection>

      <LessonSection id="bind-the-buttons" title="Bind the buttons">
        <p>Replace the contents of the file with this.</p>

        <Mech for="arm">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/opmode/MyTeleop.java"
            code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.opmode.OpMode;
import org.wpilib.opmode.Teleop;

@Teleop(name = "Teleop")
public class MyTeleop implements OpMode {
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
import org.wpilib.opmode.OpMode;
import org.wpilib.opmode.Teleop;

@Teleop(name = "Teleop")
public class MyTeleop implements OpMode {
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
              "The build fails, because only one class may implement OpMode",
              "Nothing: the framework uses the newest class",
              "The bindings run twice, once from each class",
              "The driver station lists two teleops, and the empty MyTeleop can be picked by mistake",
            ],
            correctAnswer: 3,
            explanation:
              "Every annotated class is registered, so both appear in the list. Picking the empty MyTeleop runs a teleop with no bindings, and nothing moves. Edit the file you already have rather than adding a second one.",
          },
        ]}
      />
    </PageTemplate>
  );
}
