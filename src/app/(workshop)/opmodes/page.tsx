import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M } from "@/components/lesson/Mechanism";
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
 * `/running-program#latched`. This page links there rather than
 * carrying its own warning box about it.
 */
export default function OpModes() {
  return (
    <PageTemplate
      title="OpModes"
      lede="Each way the robot can run is its own class, marked with an annotation. Project Setup generated one marked @Teleop. On branch mech-2-Commands you edit it so the controller's buttons run the commands you just wrote."
      needs={[
        <>
          The three commands on each mechanism from{" "}
          <strong>Writing Commands</strong>, building clean.
        </>,
        <>
          The <code>robot.arm</code> and <code>robot.flywheel</code> fields from{" "}
          <strong>Mechanisms</strong>.
        </>,
      ]}
      branch="mech-2-Commands"
      time="7 minutes"
    >
      <MechanismSelector />

      <LessonSection id="the-generated-file" title="The generated MyTeleop">
        <p>
          Open <code>src/main/java/first/robot/opmode/MyTeleop.java</code>. The
          New Project Creator wrote it with <code>@Teleop</code> on the class,
          and that annotation is the whole registration. The framework finds
          every annotated class on its own, and the driver station lists each
          one by name. There is no <code>RobotContainer</code> in this project
          and nothing else to edit.
        </p>
        <p>
          The generated file holds five empty methods with comments in them:{" "}
          <code>disabledPeriodic</code>, <code>start</code>,{" "}
          <code>periodic</code>, <code>end</code> and <code>close</code>. A
          teleop built from commands needs none of them, and you replace the
          whole class below. Edit this file rather than making a new one. A
          second <code>@Teleop</code> class puts two teleops on the driver
          station.
        </p>
        <p>
          <code>MyAuto.java</code> beside it is marked <code>@Autonomous</code>{" "}
          and stays empty for now. Autonomous routines arrive in Workshop 4,
          where <strong>Coroutines</strong> writes the first one.
        </p>
      </LessonSection>

      <LessonSection id="bind-the-buttons" title="Bind the buttons">
        <p>Replace everything below the copyright header with this.</p>

        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/opmode/MyTeleop.java"
          code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.command3.button.CommandNiDsXboxController;
import org.wpilib.opmode.PeriodicOpMode;
import org.wpilib.opmode.Teleop;

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
          <code>name = &quot;Teleop&quot;</code> is the label in the driver
          station&apos;s list. Leave it off and the list shows the class name.
          The <code>0</code> is the controller&apos;s port on the driver
          station. The constructor is handed the one <code>Robot</code>, so
          every binding reaches a mechanism as <code>robot.arm</code> or{" "}
          <code>robot.flywheel</code>.
        </p>
        <p>
          <code>whileTrue</code> schedules its command when the button goes down
          and cancels it when the button comes up. <code>whileFalse</code>{" "}
          schedules its command on the way up. So the left trigger runs{" "}
          <code>runFast</code> while held and <code>stop</code> after, and the
          right trigger drops the flywheel to <code>runSlow</code> rather than
          to zero. Every hold here has a <code>whileFalse</code> behind it, and{" "}
          <a href="/running-program#latched" className="underline">
            Hardware Simulation
          </a>{" "}
          shows what a release does without one.
        </p>
        <p>
          Building only the <M k="noun" />? Delete the{" "}
          <code>
            robot.
            <M k="otherNoun" />
          </code>{" "}
          bindings. They call commands on a class your project does not have.
        </p>
        <p>
          Bindings made in the constructor belong to this OpMode. The framework
          removes them when the mode changes, so there is no cleanup to write.
          Bind in the constructor, but never drive a motor from it, because the
          robot can still be disabled when that code runs.
        </p>
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
              A <code>whileFalse</code> on every binding line you kept.
            </li>
          </ul>
        </Box>
        <p>
          <code>cannot find symbol: variable flywheel</code>, or{" "}
          <code>arm</code>, means a binding names a mechanism your{" "}
          <code>Robot</code> does not build. Delete that line.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You release the right trigger. What is the flywheel doing a moment later?",
            options: [
              "Stopped, because whileTrue cancels runFast on the release",
              "Running runSlow, because whileFalse schedules it as the trigger comes up",
              "Still running runFast, because a trigger has no release event",
              "Coasting, because no command owns the flywheel",
            ],
            correctAnswer: 1,
            explanation:
              "whileTrue cancels runFast on the way up, and whileFalse schedules runSlow at the same moment. The wheel drops to the slow voltage, not to zero. The A button is the binding that sends stop().",
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
          {
            id: 3,
            question:
              "You built only the arm, and the build stops on cannot find symbol: variable flywheel. What do you change?",
            options: [
              "Delete the two bindings that name robot.flywheel",
              "Add an empty Flywheel field to Robot",
              "Rename robot.flywheel to robot.arm in both lines",
              "Mark the flywheel bindings @Utility",
            ],
            correctAnswer: 0,
            explanation:
              "Those lines call commands on a field your Robot does not have. Deleting them is the fix. Renaming them would bind the arm to two more buttons, which compiles and does something you did not ask for.",
          },
          {
            id: 4,
            question:
              "The driver switches from Teleop to Autonomous. What happens to the bindings made in MyTeleop's constructor?",
            options: [
              "They keep firing until MyTeleop calls end()",
              "They keep firing until the robot reboots",
              "The framework removes them, and there is no cleanup code to write",
              "MyAuto has to cancel them in its constructor",
            ],
            correctAnswer: 2,
            explanation:
              "Bindings belong to the OpMode that made them. The framework builds the class when the mode is picked and takes its bindings away on a mode switch. This teleop needs no start() or end().",
          },
        ]}
      />
    </PageTemplate>
  );
}
