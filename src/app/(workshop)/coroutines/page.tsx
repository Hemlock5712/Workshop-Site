import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import CoroutineTimeline from "@/components/lesson/CoroutineTimeline";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";

/**
 * Lesson 18, and the last of the mechanism chain a student meets before
 * swerve. It moved twice in 2026. Out of Workshop 6, because the routine it
 * writes is an autonomous routine and it was landing five lessons after
 * `/autonomous`. Then out of Workshop 4 with Command Composition and Finish
 * Conditions, because none of the three needs a drivetrain and a team with an
 * arm and no swerve module could not reach any of them.
 *
 * Alpha-7 rewrote the middle of it. Waits used to be
 * `await(Command.waitUntil(cond).named(...).withTimeout(...))`, a v2 shape
 * built out of a command; `Coroutine` now has `waitUntil(condition, timeout)`
 * natively, and it returns a `WaitResult` that says which ending happened. So
 * the page no longer teaches builder-ordering as a gotcha, and it does teach
 * the branch: bail out when a wait times out rather than carrying on as if
 * the arm arrived.
 *
 * The framing follows the branch's own retitle. This is the autonomous
 * lesson. `/finish-lines` already writes the same routine on the Y button
 * with no time limit anywhere in it, and the contrast is the whole point: a
 * driver can let go, and in autonomous nobody can.
 *
 * It ran 27.8 minutes across seven sections, and the length was
 * never the procedure: every code step on the branch survived this rewrite.
 * What went was the commentary around them.
 *
 * Two sections are gone. "The same routine, both dialects" printed two whole
 * OpModes that were on no Workshop-Code branch at all, to make the point
 * section one makes in four lines. "What's next" was
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
 * Nothing on this page cites 2027-Template any more. Section one used to
 * quote it on chaining being "as far as most routines ever need to go", and
 * the foot of the page linked its `DriveStowDrive` pair. Workshop-Code has no
 * equivalent pair, and the template is a lesson repo we do not teach from, so
 * both went and the house rule is stated on its own. `coroutine.wait` is
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
      lede="Finish Conditions ran this routine off a held button, with nothing bounding its waits. Autonomous has no button and nobody to let go of one. So every wait gets a time limit, and somewhere to go when it runs out."
      needs={[
        <>
          An <code>Arm</code> and <code>Flywheel</code> with{" "}
          <code>isAtTarget()</code>, and the Y-button coroutine, from{" "}
          <strong>Finish Conditions</strong>.
        </>,
        <>
          Tuned arm gains from <strong>PID Tuning in Tuner X</strong>. The
          branch ships zeros.
        </>,
        <>
          The simulator running, from <strong>Hardware Simulation</strong>.
        </>,
      ]}
      branch="mech-5-Coroutines"
      time="15 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            A list of steps runs one at a time, waiting for each to finish. It
            covers most routines.
          </p>
          <p>
            Pick the arm and flywheel project back up, then check out{" "}
            <code>mech-5-Coroutines</code>.
          </p>
        </div>
        <MarginNote label="What you'll build">
          One new file, <code>RaiseAndShootOpMode.java</code>. It is the Y
          button from the last lesson, moved into autonomous, with a time limit
          on every wait.
        </MarginNote>
      </Split>

      <LessonSection id="two-reasons" title="Two reasons for a coroutine">
        <p>
          Chaining stays the default. Steps in order, on one mechanism, is what{" "}
          <code>Command.sequence</code> is for, and most routines never need
          anything else.
        </p>

        <Box variant="concept" title="When to use a coroutine">
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

      <LessonSection id="four-verbs" title="Five verbs">
        <p>
          A coroutine body takes one argument, an object called{" "}
          <code>coroutine</code>. Five of its methods cover almost every
          routine, and Finish Conditions used the first three.
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
                  <br />
                  <code>waitUntil(condition, timeout)</code>
                </td>
                <td className="px-3 py-2">
                  Stops here until the condition comes back true. Given a
                  timeout, it also gives up after that long, and the{" "}
                  <code>WaitResult</code> it returns says which of the two
                  happened.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <code>wait(duration)</code>
                </td>
                <td className="px-3 py-2">
                  Stops here for a fixed time. Forked commands keep running
                  through it.
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
          own. A coroutine can hold a real <code>while (true)</code> loop with a{" "}
          <code>yield</code> at the bottom. That yield keeps one pass through
          the loop equal to one robot loop. Leave it out and nothing else on the
          robot gets a turn. This routine has no loop in it. Drive to Tag is the
          lesson that writes one. Do the <strong>Loops</strong> module of
          Codecademy&apos;s{" "}
          <a
            href="https://www.codecademy.com/learn/learn-java"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline hover:text-[var(--accent)]"
          >
            Learn Java
          </a>{" "}
          before then if <code>while</code> and <code>for</code> are new.
        </p>

        <CoroutineTimeline />
      </LessonSection>

      <LessonSection id="build-the-routine" title="Build the routine">
        <p>
          The diff adds one file and changes nothing else:{" "}
          <code>src/main/java/first/robot/opmode/RaiseAndShootOpMode.java</code>
          . Four steps.
        </p>

        <h3 className="display m-0 text-aside">Step 1: The empty shell</h3>

        <CodeBlock
          language="java"
          title="RaiseAndShootOpMode.java: the shell"
          code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.command3.Command;
import org.wpilib.command3.Coroutine;
import org.wpilib.command3.Scheduler;
import org.wpilib.opmode.Autonomous;
import org.wpilib.opmode.PeriodicOpMode;

@Autonomous(name = "Raise And Shoot")
public class RaiseAndShootOpMode extends PeriodicOpMode {
  private final Robot robot;
  private final Command routine;

  public RaiseAndShootOpMode(Robot robot) {
    this.robot = robot;
    routine =
        Command.noRequirements(coroutine -> raiseAndShoot(coroutine)).named("Raise And Shoot");
  }

  private void raiseAndShoot(Coroutine coroutine) {
    // Steps 2 to 4 go in here.
  }

  /** No trigger owns this routine, so the OpMode starts and stops it. */
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
          The body is a named method rather than a lambda with five statements
          in it. That is what lets the steps below return early.{" "}
          <code>Command.noRequirements</code> claims no mechanism of its own,
          because the forked commands claim theirs. Nothing binds this routine,
          so <code>start()</code> and <code>end()</code> schedule and cancel it
          themselves.
        </p>
        <p>
          Paste the whole shell rather than typing it. Nothing in it is yours to
          invent, and the braces of <code>raiseAndShoot</code> are where every
          step from here lands.
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

        <h3 className="display m-0 text-aside">Step 3: Wait, with a limit</h3>

        <p>
          Add <code>import static org.wpilib.units.Units.Seconds;</code> first.
          Every compile runs <code>spotlessApply</code>, which strips an import
          no line uses yet, so add it again if it vanishes.
        </p>

        <CodeBlock
          language="java"
          title="Add below the fork"
          code={`// TODO: time your own arm.
if (coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0)).timedOut()) {
  return;
}`}
        />

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              This is the line the Y button wrote as{" "}
              <code>coroutine.waitUntil(() -&gt; robot.arm.isAtTarget())</code>,
              with two things added. The second argument is how long to wait
              before giving up, and the <code>if</code> is what happens then.
            </p>
            <p>
              <code>waitUntil</code> hands back a <code>WaitResult</code>, and{" "}
              <code>timedOut()</code> asks it which of the two endings happened.
              Three seconds is a placeholder. Use the number you wrote down at
              the end of Finish Conditions, doubled.
            </p>
          </div>
          <MarginNote label="Why bail out">
            Without the <code>return</code>, the routine reads a timeout as an
            arrival and shoots at whatever angle the arm reached. That looks
            like working code.
          </MarginNote>
        </Split>

        <h3 className="display m-0 text-aside">
          Step 4: The flywheel, then the shot
        </h3>

        <CodeBlock
          language="java"
          title="The rest of the body"
          code={`// The arm hold is still running. That is the point of fork.
coroutine.fork(robot.flywheel.runFast());

if (coroutine.waitUntil(() -> robot.flywheel.isAtTarget(), Seconds.of(3.0)).timedOut()) {
  return;
}

coroutine.wait(Seconds.of(1.0)); // shoot

// Returning cancels both forked holds.`}
        />

        <p>
          Two forks are live now. The arm still holds 90&deg; while the flywheel
          climbs to 75 rotations per second. A list of steps would need a{" "}
          <code>Command.race</code> around every later step.
        </p>
        <p>
          Nothing there fires a shot: this branch has an arm, a flywheel, and no
          feeder, so the wait stands in for one. A <code>wait</code> pauses for
          a fixed time, where <code>waitUntil</code> pauses for a condition, and
          both forks keep running through it.
        </p>
        <p>
          There is no cleanup step. The method runs out of lines, the routine
          finishes, and both forks are canceled. Every <code>return</code> above
          does the same thing.
        </p>
        <p>
          Canceled is not stopped. Nothing commands the mechanism afterwards and
          nothing sends a zero, so the last request stays latched in the motor
          controller and the flywheel keeps spinning. End a mid-match routine
          with explicit stop steps.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>Build it, run it, then break it on purpose.</p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Build, and check that <code>Seconds</code> survived. Spotless strips
            the import until a line uses it.
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
            Now make a wait time out. Change the arm&apos;s tolerance to{" "}
            <code>Degrees.of(0.001)</code> and run again. Three seconds in, the
            routine gives up and ends, and the flywheel never starts. Then
            delete the <code>if</code> and its <code>return</code> around that
            same wait and run once more: now it shoots at an arm angle nobody
            checked. Put both back.
          </li>
          <li>
            Last one. Change the first line to{" "}
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
            <li>
              With the tolerance broken, the routine ending after three seconds
              with the flywheel never having started.
            </li>
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
                  Three seconds, then the routine ends. The arm never gets there
                </td>
                <td className="px-3 py-2">
                  The first wait timed out and returned. The branch ships the
                  arm gains at <code>0.0</code>. Tune it first.
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
                  The full seven seconds, and it shoots anyway
                </td>
                <td className="px-3 py-2">
                  A wait with no <code>timedOut()</code> check around it. The
                  routine cannot tell a timeout from an arrival.
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
          That is the mechanism chain finished. Workshop 4 builds a swerve drive
          and writes an autonomous routine against it. State Machines goes back
          to chaining, and Drive to Tag returns here with a body that is one{" "}
          <code>while (true)</code> loop.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does the routine call coroutine.fork(robot.arm.vertical()) instead of coroutine.await(robot.arm.vertical())?",
            options: [
              "fork is faster than await",
              "fork automatically applies a three-second timeout",
              "await only works on commands that require no mechanisms",
              "vertical() is a hold and never finishes, so await would stop the routine there permanently",
            ],
            correctAnswer: 3,
            explanation:
              "robot.arm.vertical() is built with runRepeatedly and is named 'vertical (hold)'. A hold never finishes on its own, so await would sit on that line for the rest of the match with no error and no log. fork starts it and returns at once. The branch comment on that line says so: 'fork, not await: vertical() is a hold and never finishes.'",
          },
          {
            id: 2,
            question:
              "The Y button in Finish Conditions wrote coroutine.waitUntil(() -> robot.arm.isAtTarget()) with no timeout. Why does the same wait need one here?",
            options: [
              "Autonomous runs the scheduler at a different rate, so untimed waits drift",
              "Nobody is holding a button in autonomous, so a wait that never comes true has nothing to end it and eats the rest of the period",
              "waitUntil refuses to compile inside an @Autonomous class without a timeout",
              "The arm is slower in autonomous than it is in teleop",
            ],
            correctAnswer: 1,
            explanation:
              "In teleop the driver is the backstop: the wait is unbounded, but releasing Y cancels the whole routine. Autonomous has no button and nobody watching the arm, so a jammed mechanism or a tolerance that never comes true parks the routine for the entire period with nothing thrown and nothing logged. The time limit is what gives it an exit.",
          },
          {
            id: 3,
            question:
              "You write coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0)); and ignore what it returns. The arm jams. What does the routine do?",
            options: [
              "It carries on to the flywheel and the shot, three seconds later, as though the arm had arrived",
              "It throws, and the scheduler logs a timed-out wait",
              "It parks on that line for the rest of the autonomous period",
              "It cancels itself, because a timed-out wait ends the routine",
            ],
            correctAnswer: 0,
            explanation:
              "The timeout is what ends the wait; it is not what ends the routine. Execution falls to the next line either way. waitUntil returns a WaitResult so you can tell the two endings apart, and ignoring it means the routine treats giving up and arriving as the same thing. That is why the branch wraps each wait in if (...timedOut()) { return; }.",
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
              "Ending the routine cancels everything it forked, and that is the bookkeeping a coroutine does for you, on an early return as much as on the last line. Note that canceled is not the same as stopped: nothing commands the mechanisms afterwards and nothing sends a zero, so the last request stays latched in the motor controller and Phoenix keeps applying it.",
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
