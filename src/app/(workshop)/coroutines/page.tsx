import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import CoroutineTimeline from "@/components/lesson/CoroutineTimeline";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

/**
 * Lesson 27. It ran 27.8 minutes across seven sections, and the length was
 * never the procedure: every code step on the branch survived this rewrite.
 * What went was the commentary around them.
 *
 * Two sections are gone. "The same routine, both dialects" printed two whole
 * OpModes out of the 2027-Template, neither of them on any Workshop-Code
 * branch, to make the point section one makes in four lines. "What's next" was
 * a paragraph of pointers, which is one sentence at the end of the check
 * instead.
 *
 * This page also owns two things `/java-basics` used to pre-teach fifteen
 * lessons early and no longer does: `coroutine.yield()`, and the fact that a
 * coroutine body can hold a real `while (true)` loop. Both are defined in
 * section two, where they first appear. It is also the only lesson that writes
 * an ordinary Java loop, so it is the one that sends a student to Codecademy's
 * Loops module. `/java-basics` tells them to skip that module and says this
 * page will ask for it. `/drive-to-tag-inline` names this page
 * as the prerequisite for exactly that.
 *
 * Four things came back on the verification pass, all of them things the cut
 * took with it rather than things it meant to remove. Section one said the
 * template "ships this routine written both ways", which it does not: the
 * matched pair is `DriveStowDrive`, and naming it is also what gives the
 * documentation button at the foot of the page a referent. `coroutine.wait` is
 * the fifth verb, in code the student types, and deleting the sentence that
 * glossed it left it in no table and no sentence. Step 6 lost that canceling a
 * fork is not stopping the mechanism, and with it the one instruction that
 * followed from it: a mid-match routine needs explicit stop steps. The quiz
 * answered b three times out of five.
 */
export default function Coroutines() {
  return (
    <PageTemplate
      title="Coroutines"
      lede="Command Composition built a routine out of a list of steps. A coroutine is the same routine written as one block of Java, read top to bottom. The block can pause partway through and resume on the same line."
      needs={[
        <>
          An <code>Arm</code> and <code>Flywheel</code> with{" "}
          <code>isAtTarget()</code>, from <strong>Finish Conditions</strong>.
        </>,
        <>
          Tuned arm gains from <strong>PID Tuning in Tuner X</strong>. The
          branch ships zeros.
        </>,
        <>
          The simulator running, from <strong>Hardware Simulation</strong>.
        </>,
        <>
          The <strong>Loops</strong> module of Codecademy&apos;s Learn Java, if{" "}
          <code>while</code> is new.
        </>,
      ]}
      branch="mech-5-Coroutines"
      time="14 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            A list of steps runs one at a time, waiting for each to finish. It
            carries most routines.
          </p>
          <p>
            Pick the arm and flywheel project back up, then check out{" "}
            <code>mech-5-Coroutines</code>.
          </p>
        </div>
        <MarginNote label="What you'll build">
          One new file, <code>RaiseAndShootOpMode.java</code>. It raises the
          arm, spins the flywheel up while the arm keeps holding, then shoots.
        </MarginNote>
      </Split>

      <LessonSection id="two-reasons" title="Two reasons for a coroutine">
        <p>
          Chaining stays the default. The robot template ships its{" "}
          <code>DriveStowDrive</code> auto both ways, and calls the chained
          version &quot;as far as most routines ever need to go.&quot;
        </p>

        <Box variant="concept" title="When a coroutine earns its keep">
          <p>
            <strong>A hold has to span several steps.</strong> In a list, a hold
            needs a finish line before the next step can run. A coroutine starts
            it once and it keeps running underneath.
          </p>
          <p className="mt-3">
            <strong>The logic needs a real loop or a real branch.</strong> A
            list is fixed. A coroutine body is ordinary Java, so{" "}
            <code>while</code> and <code>if</code> work as usual.
          </p>
        </Box>

        <p>
          Everything else belongs to <code>Command.sequence</code> and{" "}
          <code>Command.race</code>. Do not rewrite a chained routine that
          works.
        </p>
      </LessonSection>

      <LessonSection id="four-verbs" title="Four verbs">
        <p>
          A coroutine body takes one argument, an object called{" "}
          <code>coroutine</code>. Four of its methods carry almost every
          routine.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Verb</th>
                <th className="px-3 py-2 text-left">What it does</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>fork(command)</code>
                </td>
                <td className="px-3 py-2">
                  Starts a command and keeps going. It runs underneath until the
                  routine ends.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>await(command)</code>
                </td>
                <td className="px-3 py-2">
                  Runs a command and stops here until it finishes.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>waitUntil(condition)</code>
                </td>
                <td className="px-3 py-2">
                  Stops here until the condition comes back true.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>yield()</code>
                </td>
                <td className="px-3 py-2">
                  Stops here for one scheduler loop, then carries on.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <code>yield</code> is the one you need when the body has a loop of its
          own. A coroutine can hold a real <code>while (true)</code> loop, with
          a <code>yield</code> at the bottom of it. This is the first lesson
          that writes an ordinary Java loop. Do the <strong>Loops</strong>{" "}
          module of Codecademy&apos;s{" "}
          <a
            href="https://www.codecademy.com/learn/learn-java"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline hover:text-[var(--accent)]"
          >
            Learn Java
          </a>{" "}
          first if <code>while</code> and <code>for</code> are new.
        </p>
        <p>
          That yield keeps one pass through the loop equal to one robot loop.
          Leave it out and the loop never hands control back, so nothing else on
          the robot gets a turn.
        </p>

        <CoroutineTimeline />
      </LessonSection>

      <LessonSection id="build-the-routine" title="Build the routine">
        <p>
          The diff adds one file and changes nothing else:{" "}
          <code>src/main/java/first/robot/opmode/RaiseAndShootOpMode.java</code>
          . Six steps.
        </p>

        <h3 className="display m-0 text-aside">Step 1: The empty shell</h3>

        <CodeBlock
          language="java"
          title="RaiseAndShootOpMode.java: the shell"
          code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.command3.Command;
import org.wpilib.command3.Scheduler;
import org.wpilib.opmode.Autonomous;
import org.wpilib.opmode.PeriodicOpMode;

@Autonomous(name = "Raise And Shoot")
public class RaiseAndShootOpMode extends PeriodicOpMode {
  private final Command routine;

  public RaiseAndShootOpMode(Robot robot) {
    routine =
        Command.noRequirements(
                coroutine -> {
                  // Steps 2 to 6 go in here.
                })
            .named("Raise And Shoot");
  }

  @Override
  public void start() {
    Scheduler.getDefault().schedule(routine);
  }

  @Override
  public void end() {
    Scheduler.getDefault().cancel(routine);
  }
}`}
        />

        <p>
          It is a whole OpMode, shaped like <code>MyTeleop</code>.{" "}
          <code>Command.noRequirements</code> claims no mechanism of its own,
          because the forked commands claim theirs.
        </p>
        <p>
          Paste the whole shell rather than typing it. Nothing inside{" "}
          <code>Command.noRequirements(coroutine -&gt; {"{}"})</code> is yours
          to invent, and the two braces are where every step from here lands.
        </p>
        <p>
          Your copy will move the first time you build. Every compile runs{" "}
          <code>spotlessApply</code>, and the moment a line goes inside the
          braces the formatter re-indents the whole block. Nothing is wrong when
          that happens. It is what makes your file match the branch character
          for character.
        </p>
        <p>
          Build now and <strong>Raise And Shoot</strong> appears in the
          autonomous list, doing nothing.
        </p>

        <h3 className="display m-0 text-aside">Step 2: Fork the arm hold</h3>

        <CodeBlock
          language="java"
          title="First line of the body"
          code={`// fork, not await: vertical() is a hold and never finishes.
coroutine.fork(robot.arm.vertical());`}
        />

        <p>
          Run it and the arm barely twitches. That is correct. The body has no
          lines after the fork, so the routine ends on its first pass, and
          ending a routine cancels everything it forked.
        </p>

        <h3 className="display m-0 text-aside">Step 3: Wait for the arm</h3>

        <p>
          Add <code>import static org.wpilib.units.Units.Seconds;</code> first.
          Every compile runs <code>spotlessApply</code>, which strips an import
          no line uses yet, so add it again if it vanishes.
        </p>

        <CodeBlock
          language="java"
          title="Add below the fork"
          code={`// Always time out a wait in an auto, or a stuck arm freezes the whole match.
coroutine.await(
    Command.waitUntil(robot.arm::isAtTarget)
        .named("wait for the arm")
        .withTimeout(Seconds.of(3.0))); // TODO: time your own arm`}
        />

        <p>
          <code>Command.waitUntil(robot.arm::isAtTarget)</code> does nothing
          except finish once the arm arrives, so <code>await</code> is safe on
          it. The timeout stops a jammed arm from eating the whole autonomous
          period. Three seconds is a placeholder.
        </p>

        <h3 className="display m-0 text-aside">
          Step 4: The flywheel, same pair
        </h3>

        <CodeBlock
          language="java"
          title="Add below the arm wait"
          code={`// The arm hold is still running here - that is the point of fork.
coroutine.fork(robot.flywheel.runFast());
coroutine.await(
    Command.waitUntil(robot.flywheel::isAtTarget)
        .named("wait for the flywheel")
        .withTimeout(Seconds.of(3.0)));`}
        />

        <p>
          Two forks are live now. The arm still holds 90&deg; while the flywheel
          climbs to 75 rotations per second. A list of steps would need a{" "}
          <code>Command.race</code> around every later step.
        </p>

        <h3 className="display m-0 text-aside">Step 5: Shoot</h3>

        <CodeBlock
          language="java"
          title="The last line in the body"
          code={`coroutine.wait(Seconds.of(1.0)); // shoot`}
        />

        <p>
          Nothing there fires a shot: this branch has an arm, a flywheel, and no
          feeder, so the wait stands in for one. A <code>wait</code> pauses for
          a fixed time, where <code>waitUntil</code> pauses for a condition, and
          both forks keep running through it.
        </p>

        <h3 className="display m-0 text-aside">Step 6: Fall off the end</h3>

        <p>
          There is no cleanup step. The body runs out of lines, the routine
          finishes, and both forks are canceled.
        </p>
        <p>
          Canceled is not stopped. <code>idle()</code> sends no output and never
          clears the last request, so the flywheel keeps spinning. End a
          mid-match routine with explicit stop steps.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>Build it, run it, then break it on purpose.</p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Build. If it compiles, <code>.named(...)</code> and{" "}
            <code>.withTimeout(...)</code> are in the right order.
          </li>
          <li>
            Start the program with{" "}
            <strong>WPILib: Hardware Sim Robot Code</strong> and pick{" "}
            <strong>Raise And Shoot</strong> in the Driver Station. That name is
            the <code>@Autonomous</code> string, not the class name.
          </li>
          <li>
            Time the run. A healthy one is the arm, plus the flywheel, plus one
            second.
          </li>
          <li>
            Now break it. Change the first line to{" "}
            <code>coroutine.await(robot.arm.vertical())</code> and run again.
            The arm moves and nothing else ever happens. Put the{" "}
            <code>fork</code> back.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              The arm swinging to vertical, 0.25 rotations, and staying there
              while the flywheel reaches 75 rotations per second.
            </li>
            <li>The routine ending a second later, both holds released.</li>
          </ul>
        </Box>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">What you see</th>
                <th className="px-3 py-2 text-left">Cause</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  Seven seconds every run, nothing arrives
                </td>
                <td className="px-3 py-2">
                  Both waits timed out: 3 + 3 + 1. The branch ships the arm
                  gains at <code>0.0</code>. Tune it first.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">One thing happens, then nothing</td>
                <td className="px-3 py-2">
                  A hold inside <code>await</code>. Only self-finishing commands
                  belong there.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  Will not compile, on a <code>waitUntil</code> line
                </td>
                <td className="px-3 py-2">
                  <code>.withTimeout(...)</code> written before{" "}
                  <code>.named(...)</code>.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>cannot find symbol: Seconds</code>
                </td>
                <td className="px-3 py-2">
                  The import is missing, or spotless stripped it before a line
                  used it.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          State Machines is next, and it goes back to chaining. Drive to Tag
          returns here with a body that is one <code>while (true)</code> loop.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveOpMode.java"
          title="The template's coroutine OpMode"
          icon={<GitBranch className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does the routine call coroutine.fork(arm.vertical()) instead of coroutine.await(robot.arm.vertical())?",
            options: [
              "fork is faster than await",
              "fork automatically applies a three-second timeout",
              "await only works on commands that require no mechanisms",
              "vertical() is a hold and never finishes, so await would stop the routine there permanently",
            ],
            correctAnswer: 3,
            explanation:
              "arm.vertical() is built with runRepeatedly and is named 'vertical (hold)'. A hold never finishes on its own, so await would sit on that line for the rest of the match with no error and no log. fork starts it and returns at once. The branch comment on that line says so: 'fork, not await: vertical() is a hold and never finishes.'",
          },
          {
            id: 2,
            question:
              'Why is it .named("wait for the arm").withTimeout(Seconds.of(3.0)) and not the other way around?',
            options: [
              "Command.waitUntil(...) returns a builder; .named(...) turns it into a Command, and .withTimeout(...) is a Command method",
              "withTimeout must come last so the scheduler reads the name first",
              "Style only: either order compiles",
              "Timeouts can only be applied to commands that have no requirements",
            ],
            correctAnswer: 0,
            explanation:
              "Command.waitUntil(...) hands back a builder stage rather than a finished Command, and that stage has no withTimeout on it. Naming it produces a Command, and .withTimeout(Time) is a method on Command. Reversing the two does not compile.",
          },
          {
            id: 3,
            question:
              "What does the .withTimeout(Seconds.of(3.0)) on each wait protect you from?",
            options: [
              "It stops the motor from overheating",
              "It caps how long the flywheel is allowed to spin",
              "If the mechanism never reaches its target, the routine moves on instead of freezing for the rest of the period",
              "It makes isAtTarget() return true after three seconds",
            ],
            correctAnswer: 2,
            explanation:
              "The branch comment says it plainly: 'Always time out a wait in an auto, or a stuck arm freezes the whole match.' A jammed arm means isAtTarget() never becomes true, so the wait would never end. The timeout gives up and lets the rest of the routine run.",
          },
          {
            id: 4,
            question:
              "The coroutine body forks the arm hold and the flywheel hold, waits a second, and then runs out of lines. What happens to the two forked holds?",
            options: [
              "They keep running until something else claims those mechanisms",
              "Both are canceled automatically when the routine ends",
              "They are canceled only if you call coroutine.park() first",
              "They finish on their own, which is what ends the routine",
            ],
            correctAnswer: 1,
            explanation:
              "Ending the routine cancels everything it forked, and that is the bookkeeping a coroutine does for you. Note that canceled is not the same as stopped: the mechanisms fall back to idle(), which sends no output and does not clear the last request, so Phoenix keeps applying it.",
          },
          {
            id: 5,
            question:
              "Your routine drives to a pose, then drives to a second pose, and nothing needs to be held across both legs. Which style should you use?",
            options: [
              "A coroutine, because coroutines are the newer and more capable style",
              "Either, but a coroutine will run faster",
              "Chaining: Command.sequence handles it, and the template calls chaining 'as far as most routines ever need to go'",
              "A coroutine, because Command.sequence cannot hold two drive legs",
            ],
            correctAnswer: 2,
            explanation:
              "Chaining is the default and this routine gives you no reason to leave it. Coroutines are for two cases: a hold that must span several steps, and logic that needs real loops or branches. Two independent legs in order is neither.",
          },
        ]}
      />
    </PageTemplate>
  );
}
