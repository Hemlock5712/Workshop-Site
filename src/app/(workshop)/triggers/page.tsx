import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { GitBranch } from "lucide-react";

/**
 * The Trigger reference page, rewritten August 2026 against the shape of
 * `/pid-control` and the rules in `context/lesson-budget.md`.
 *
 * It was 23 minutes, eight sections and seven code blocks, and most of it was
 * a second copy of `/adding-commands` (the pair form, holds, the whole
 * MyTeleop file) or of `/command-framework` (the scheduler, where bindings
 * live, the no-RobotContainer point). Both of those pages were rewritten first
 * and they carry that material now.
 *
 * What is left is the part only this page has: the four binding verbs and what
 * each one cancels, `and` / `or` / `negate` / `debounce`, and the three
 * binding scopes. Every API here was checked against
 * `commandsv3/src/main/java/org/wpilib/command3/Trigger.java`,
 * `BindingScope.java` and the generated `CommandNiDsXboxController` in
 * allwpilib: `leftTrigger()` really is an axis thresholded at 0.5, and
 * `createNarrowestScope` really is command, then opmode, then global.
 *
 * Four code blocks kept verbatim, three deleted. The B-button exercise moved
 * into the closing check as a step, because `/running-program` expects that
 * line to exist and prints it.
 *
 * Verifier pass, same day. `Trigger.poll()` does fire every falling-edge
 * binding on its first poll, because `m_previousSignal` starts null and only
 * the `cached == previous` early return guards the edge. A margin note here
 * said so and named the consequence on this branch. It came out: on
 * `mech-2-Commands` the A binding's `whileFalse(flywheel.stop())` is registered
 * after the right trigger's `whileFalse(flywheel.runSlow())`, so it takes the flywheel
 * in the same loop and nothing turns, which is what `/running-program` tells
 * the student to expect on Enable. The note read as a contradiction of that
 * page while teaching nothing this lesson needs. Bench-check it before it goes
 * anywhere.
 *
 * Also restored: `unbind()` (the reason no cleanup code exists), the
 * rising/falling edge names the prose and quiz both use, and a sixth quiz
 * question on the 0.5 threshold. A quiz costs a flat two minutes, so the
 * sixth question is free.
 */
export default function Triggers() {
  return (
    <PageTemplate
      title="Triggers"
      lede="A Trigger is a yes-or-no question the scheduler asks once a loop, with commands hung on the moments the answer changes. This page covers the four binding verbs, the operators that build one condition out of several, and how long a binding lasts. You add one line to MyTeleop."
      needs={[
        <>
          Branch <code>mech-2-Commands</code> checked out, with{" "}
          <code>opmode/MyTeleop.java</code> and its three bindings.
        </>,
        <>
          Holds, and why a <code>whileTrue</code> comes with a{" "}
          <code>whileFalse</code>, from{" "}
          <a href="/adding-commands" className="underline">
            Writing Commands
          </a>
          .
        </>,
        <>A clean build before you change anything.</>,
      ]}
      branch="mech-2-Commands"
      time="12 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            The three bindings on <code>mech-2-Commands</code> all read the same
            way: a button, a command on the press, a command on the release.
          </p>
          <p>
            That is one shape out of several. The condition behind a Trigger
            needs no button at all, and two of the four verbs cancel.
          </p>
        </div>
        <MarginNote label="What you add">
          One binding on the B button, inside the <code>MyTeleop</code>{" "}
          constructor.{" "}
          <a href="/running-program" className="underline">
            Hardware Simulation
          </a>{" "}
          expects it there. Nothing moves on this page, so the check at the end
          is a build.
        </MarginNote>
      </Split>

      <LessonSection id="the-four-verbs" title="The four verbs">
        <p>
          A Trigger holds one condition and a list of bindings. Once a loop the
          scheduler reads the condition, compares the answer with the previous
          loop&apos;s, and acts on the change. A change to true is the rising
          edge, a change to false the falling edge.
        </p>
        <p>
          The condition can be more than a switch.{" "}
          <code>driver.leftTrigger()</code> reads an analog axis and answers
          true past 0.5. A third of a pull fires nothing.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Verb</th>
                <th className="px-3 py-2 text-left">Schedules</th>
                <th className="px-3 py-2 text-left">Cancels</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>onTrue</code>
                </td>
                <td className="px-3 py-2">The loop the answer turns true</td>
                <td className="px-3 py-2">Nothing, ever</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>onFalse</code>
                </td>
                <td className="px-3 py-2">The loop the answer turns false</td>
                <td className="px-3 py-2">Nothing, ever</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>whileTrue</code>
                </td>
                <td className="px-3 py-2">The loop the answer turns true</td>
                <td className="px-3 py-2">
                  Its own command, when the answer turns false
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>whileFalse</code>
                </td>
                <td className="px-3 py-2">The loop the answer turns false</td>
                <td className="px-3 py-2">
                  Its own command, when the answer turns true
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Each verb hands the Trigger back, so they chain onto one line. A{" "}
          <code>whileTrue</code> command that ends by itself while the button is
          still down does not restart.
        </p>
        <p>
          Four other verbs exist. Two of them, <code>retryWhileTrue</code> and{" "}
          <code>retryWhileFalse</code>, do restart a command that ended early.
          Bind with <code>toggleOnTrue</code> or <code>toggleOnFalse</code>{" "}
          instead, and repeated presses flip one command on and off. The course
          uses none of the four.
        </p>
      </LessonSection>

      <LessonSection id="pairs-and-whiletrue" title="Why whileTrue, not onTrue">
        <p>
          Both lines below leave the flywheel stopped when the button comes up.
          The route there is different.
        </p>

        <CodeBlock
          language="java"
          title="The same button, two ways to write it"
          code={`// onTrue/onFalse: the press schedules one command, the release schedules
// another, and the second displaces the first by arriving later.
driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());

// whileTrue/whileFalse: the press schedules, the release cancels. This is what
// the branch writes. The whileFalse is still needed, because canceling leaves
// the motor at its last request.
driver.a().whileTrue(flywheel.runFast()).whileFalse(flywheel.stop());`}
        />

        <p>
          Nothing cancels in the first line. Between two commands at equal
          priority the mechanism goes to the one that arrived second, so{" "}
          <code>flywheel.stop()</code> takes it away from <code>runFast()</code>
          . The second line cancels instead, and <code>whileFalse</code> is what
          sends zero.
        </p>
        <p>
          The course writes the second form everywhere. A cancel gives a log a
          real start and end for the held command, and it hands the mechanism
          back. With <code>onTrue</code> the mechanism is never released, so a
          default command never gets a turn.
        </p>
        <p>
          <code>whileFalse</code> names what runs next, and a stop is only one
          of the choices. The branch&apos;s right trigger releases into{" "}
          <code>runSlow()</code>, so the wheel keeps turning at 3&nbsp;V. Leave
          the second verb off and the motor holds whatever it had. That is how a
          closed-loop position request keeps an arm where you left it.
        </p>
      </LessonSection>

      <LessonSection id="compose-the-condition" title="Compose the condition">
        <p>
          <code>new Trigger(...)</code> takes a <code>BooleanSupplier</code>:
          any lambda or method reference that answers true or false. WPILib
          builds its own robot-mode triggers that way.
        </p>

        <CodeBlock
          language="java"
          title="A Trigger with no button behind it"
          filename="org/wpilib/command3/button/RobotModeTriggers.java"
          code={`/**
 * Returns a trigger that is true when the robot is disabled.
 *
 * @return A trigger that is true when the robot is disabled.
 */
public static Trigger disabled() {
  return new Trigger(RobotState::isDisabled);
}`}
        />

        <p>
          <code>and</code>, <code>or</code> and <code>negate</code> each return
          a new Trigger built from the old one. The Trigger{" "}
          <code>driver.b().and(driver.leftBumper())</code> is true only while
          both are held, and letting go of either one is the falling edge.
        </p>
        <p>
          <code>debounce</code> takes a duration and waits for the condition to
          hold that long before it counts. A switch that rattles fires one
          command instead of forty.
        </p>
        <p>
          Nothing on the <code>Arm</code> or <code>Flywheel</code> answers a
          question yet. Both expose three commands and nothing else, so every
          Trigger in the project is still a button. The first readable condition
          is <code>arm::isAtTarget</code>, on{" "}
          <a href="/finish-lines" className="underline">
            Finish Conditions
          </a>
          .
        </p>
      </LessonSection>

      <LessonSection id="binding-scope" title="Binding scope">
        <p>
          The A button spins the flywheel in teleop. In autonomous it should
          mean nothing. The project holds no <code>if (isTeleop)</code> and no
          code that removes a binding.
        </p>
        <p>
          When a binding is created the scheduler captures the narrowest scope
          that is active, and drops the binding when that scope ends. Inside a
          running command, the binding lasts as long as the command. Inside an
          OpMode constructor, as long as that mode is selected. In the{" "}
          <code>Robot</code> constructor, where no mode exists yet, it is
          global.
        </p>
        <p>
          Almost every binding belongs in an OpMode constructor. Pick autonomous
          and the framework tears <code>MyTeleop</code> down, bindings included.
          Pick teleop again and a fresh one is built, so the same constructor
          runs and the same bindings come back. You write no cleanup code:{" "}
          <code>Trigger</code> has a public <code>unbind()</code>, and the
          scheduler calls it when a scope ends.
        </p>
        <p>
          The template writes exactly one global binding, and it is about being
          disabled, which no OpMode owns.
        </p>

        <CodeBlock
          language="java"
          title="Robot.java: the one global binding, from the 2027-Template"
          filename="src/main/java/first/robot/Robot.java"
          code={`public Robot() {
  // ...

  // Brake while disabled, in every mode. Created here (before any OpMode is selected) so the
  // binding is global; the opmodes' bindings are scoped to their OpMode and removed on a switch.
  final var idle = new SwerveRequest.Idle();
  RobotModeTriggers.disabled().whileTrue(drivetrain.applyRequest(() -> idle));
}`}
        />

        <p>
          The drivetrain belongs to Workshop 4. What matters here is where the
          line sits: a binding that has to survive a mode switch cannot live
          inside a mode.{" "}
          <a href="/coroutines" className="underline">
            Coroutines
          </a>{" "}
          is where the third scope turns up, because a binding inside a running
          command needs a command body written by hand.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/Robot.java"
          title="2027-Template: Robot.java"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <LessonSection id="did-it-work" title="Check your work">
        <p>
          Add the binding the next lesson expects, then break it twice on
          purpose.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Inside <code>public MyTeleop(Robot robot)</code>, below the A
            binding, add{" "}
            <code>
              driver.b().whileTrue(arm.runSlow()).whileFalse(arm.stop());
            </code>{" "}
            Build it: <code>BUILD SUCCESSFUL</code>.
          </li>
          <li>
            Delete <code>.whileFalse(arm.stop())</code> and build again. It
            still succeeds. A missing release binding compiles fine and leaves
            the arm pushing until the match ends. Put it back.
          </li>
          <li>
            Move the B line above the constructor, next to the{" "}
            <code>driver</code> field, and build. It fails, because a binding is
            a statement and <code>arm</code> is a local variable of the
            constructor.
          </li>
          <li>Put the line back inside the constructor and build once more.</li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>Four bindings, every one of them inside the constructor.</li>
            <li>
              <code>BUILD SUCCESSFUL</code>, and nothing moving. Pressing the
              buttons comes next.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Which verb cancels the command it scheduled, without you naming a second command?",
            options: [
              "onTrue",
              "whileTrue",
              "onFalse",
              "None of them: a Trigger only ever schedules",
            ],
            correctAnswer: 1,
            explanation:
              "whileTrue schedules on the rising edge and cancels on the falling edge. onTrue and onFalse only ever schedule; neither one takes a command back. Canceling still is not stopping, so the branch pairs whileTrue with a whileFalse.",
          },
          {
            id: 2,
            question:
              "The right trigger is whileTrue(flywheel.runFast()).whileFalse(flywheel.runSlow()). Why not whileTrue on its own?",
            options: [
              "Releasing would cancel the command and leave the last 6 V request applied, so the wheel would keep spinning fast",
              "whileTrue does not work on an analog axis",
              "whileTrue releases the mechanism, and an unclaimed mechanism coasts to a stop on its own",
              "It would not compile: whileTrue requires a matching whileFalse",
            ],
            correctAnswer: 0,
            explanation:
              "Canceling is not stopping. With nothing bound to the release the flywheel falls back to idle(), which sends nothing at all, so Phoenix keeps applying 6 V. whileFalse names what runs next, and here that is runSlow() rather than a stop: a wheel still turning at 3 V does not have to spin up from dead.",
          },
          {
            id: 3,
            question: "What does new Trigger(...) take as its argument?",
            options: [
              "A Command to run",
              "The Mechanism the binding should require",
              "A BooleanSupplier: any lambda or method reference answering true or false",
              "A button number on the driver station",
            ],
            correctAnswer: 2,
            explanation:
              "A Trigger wraps a condition the scheduler polls once a loop. RobotModeTriggers.disabled() is new Trigger(RobotState::isDisabled). Buttons are the only source on this branch because nothing on the Arm or Flywheel is readable yet.",
          },
          {
            id: 4,
            question:
              "driver.b().and(driver.leftBumper()) is bound with onTrue. You hold the bumper, then press B. What fires?",
            options: [
              "Nothing: and only reads the first button",
              "The command fires twice, once per button",
              "Nothing until you release and press both together",
              "The command fires once, on the loop both answers are true",
            ],
            correctAnswer: 3,
            explanation:
              "and builds a new Trigger whose answer is both conditions together. It has one rising edge, on the loop the combined answer turns true, and the order you pressed them in does not matter.",
          },
          {
            id: 5,
            question:
              "A binding should brake the drivetrain whenever the robot is disabled, in any mode. Where do you type it?",
            options: [
              "In every OpMode constructor, one copy each",
              "In the Robot constructor, where no mode is selected yet",
              "Inside a command body that is always scheduled",
              "Nowhere: Commands v3 removed global bindings",
            ],
            correctAnswer: 1,
            explanation:
              "The scheduler captures the narrowest active scope. In the Robot constructor there is no running command and no selected OpMode, so the scope is global and the binding is never dropped. Being disabled belongs to no OpMode, so nothing narrower would work.",
          },
          {
            id: 6,
            question:
              "The left trigger is bound with whileTrue(arm.runFast()). You pull the trigger a third of the way and hold it there. What does the arm do?",
            options: [
              "Pushes at a third of the fast voltage, because the axis scales the command",
              "Pushes at the fast voltage, because any movement of the axis counts as a press",
              "Nothing at first, then starts once you have held it long enough",
              "Nothing, because the axis has to pass 0.5 before the answer turns true",
            ],
            correctAnswer: 3,
            explanation:
              "leftTrigger() turns an analog axis into a yes-or-no answer at 0.5. A third of a pull leaves the answer false, so there is no rising edge and nothing is scheduled. A Trigger hands a command no magnitude either: past 0.5, runFast() sends the voltage it always sends.",
          },
        ]}
      />
    </PageTemplate>
  );
}
