import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import CoroutineTimeline from "@/components/lesson/CoroutineTimeline";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/coroutines");

/**
 * Lesson 18, the last of the mechanism chain before swerve, and the page for
 * `mech-5-Coroutines`. It writes the Y-button routine from `/finish-conditions`
 * again as an autonomous, where nobody can let go of a button, so every wait
 * gets a time limit and somewhere to go when it runs out.
 *
 * October 2026 rebuilt the ramp into it. The jump from `runRepeatedly` +
 * `whileTrue` straight to a coroutine body was too steep, so the page now
 * hands a student the same kind of standard kit buttons have:
 *
 * - "The core five" replaces the old verb table. It leads with
 *   `waitUntil(condition, timeout)` and `.timedOut()`, because that is the
 *   call an autonomous needs first, and it says where `WaitResult` lives and
 *   that `ForkResult` exists. `park`, `awaitAll` and `awaitAny` get one line.
 * - "House rules" is the coroutine equivalent of `runRepeatedly(...)` plus
 *   `whileTrue`. Every rule in it is something the routine below obeys.
 *
 * Waits are native: `coroutine.waitUntil(...)`. Never
 * `coroutine.await(Command.waitUntil(...).named(...).withTimeout(...))`,
 * which was the shape before alpha-7 gave `Coroutine` its own timeout.
 *
 * The routine stops the flywheel before every return that comes after
 * `runFast()`. Until October 2026 it did not: the page said to end with stop
 * steps and the success box said both holds were released, while the code
 * left the flywheel latched at 75 rps on a timeout and at the end. The fix is
 * `coroutine.fork(robot.flywheel.stop())`, on the branch too. A forked command
 * runs its first pass on the spot (`Scheduler.schedule` runs a child
 * immediately), and it evicts `runFast()` because they share the flywheel, so
 * the zero is sent before the `return` cancels everything. The arm gets no
 * stop: a latched position request holds it where it is, which is the same
 * thing `MyTeleop`'s left trigger relies on, and `Arm` has had no `stop()`
 * since `mech-3-MotionMagic`.
 *
 * Cancel-is-not-stop is taught once, on `/running-program`. This page links
 * to it rather than explaining it a seventh time.
 *
 * This page also owns `coroutine.yield()` and the first real `while` loop in
 * the course, which is why it sends a student to Codecademy's Loops module.
 * `/java-basics` tells them to skip that module until here, and
 * `/drive-to-tag-inline` names this page as its prerequisite.
 *
 * Nothing on this page cites 2027-Template. The quiz used to quote it.
 */
export default function Coroutines() {
  return (
    <PageTemplate
      title="Coroutines"
      lede="Finish Conditions ran this routine off a held button, with nothing bounding its waits. Autonomous has no button and nobody to let go of one, so every wait here gets a time limit and a way out."
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
          A sequence is already a small coroutine that awaits each member in
          turn. It stays the default, and a chained routine that works should
          stay chained.
        </p>
        <p>
          Write the body yourself for one of two reasons. A hold has to span
          several steps, which a list cannot do. Or the logic needs a real loop
          or branch, and a coroutine body is ordinary Java, so{" "}
          <code>while</code> and <code>if</code> work as usual.
        </p>
      </LessonSection>

      <LessonSection id="core-five" title="The core five">
        <p>
          A coroutine body takes one argument, an object called{" "}
          <code>coroutine</code>. These five calls on it cover nearly every
          routine, in the order you will reach for them.
        </p>

        <CodeBlock
          language="java"
          title="The core five, one example each"
          code={`// 1. Wait for a condition, with a limit. On a timeout, stop what you started and leave.
if (coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0)).timedOut()) {
  return;
}

// 2. Start a hold and keep going. It runs underneath until the routine ends.
coroutine.fork(robot.arm.vertical());

// 3. Run a step that ends by itself, and wait here until it does.
coroutine.await(raiseArm); // the .until(...) step from Finish Conditions

// 4. Wait a fixed time. Forked holds keep running through it.
coroutine.wait(Seconds.of(1.0));

// 5. Inside a loop of your own: give up the rest of this robot loop.
while (!robot.arm.isAtTarget()) {
  coroutine.yield();
}`}
        />

        <p>
          <code>waitUntil</code> returns a <code>WaitResult</code>. House style
          calls <code>.timedOut()</code> on it in the same line, and stores it
          only when it is read twice. It is declared inside{" "}
          <code>Coroutine</code>, so the bare name needs{" "}
          <code>import org.wpilib.command3.Coroutine.WaitResult;</code>.
        </p>
        <p>
          <code>fork</code> and <code>await</code> return a{" "}
          <code>ForkResult</code> for a command that could not start. The
          routine cancels itself when that happens, so you can ignore it.{" "}
          <code>park</code>, <code>awaitAll</code> and <code>awaitAny</code>{" "}
          exist too. Nothing here needs them.
        </p>
        <p>
          Example 5 is what <code>waitUntil</code> does inside. The{" "}
          <code>yield</code> makes one pass one robot loop, and without it
          nothing else on the robot gets a turn. If <code>while</code> is new,
          do the <strong>Loops</strong> module of Codecademy&apos;s{" "}
          <a
            href="https://www.codecademy.com/learn/learn-java"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline hover:text-[var(--accent)]"
          >
            Learn Java
          </a>{" "}
          before Drive to Tag.
        </p>

        <CoroutineTimeline />
      </LessonSection>

      <LessonSection id="house-rules" title="House rules">
        <Box variant="concept" title="House rules">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>A button</strong> binds a hold,{" "}
              <code>runRepeatedly(...).named(&quot;x (hold)&quot;)</code>, with{" "}
              <code>whileTrue</code>. A flywheel adds{" "}
              <code>.whileFalse(robot.flywheel.stop())</code>.
            </li>
            <li>
              <strong>A routine across mechanisms</strong> is{" "}
              <code>
                Command.noRequirements(coroutine -&gt; body(coroutine))
              </code>{" "}
              with <code>.named(...)</code>. The body is a private method, so a{" "}
              <code>return</code> plainly leaves the routine.
            </li>
            <li>
              <strong>A body that drives one mechanism</strong> is that
              mechanism&apos;s <code>run(coroutine -&gt; ...)</code>, written
              inside its class next to <code>runRepeatedly</code>.
            </li>
            <li>
              <strong>Fork holds, await steps.</strong> A hold never finishes,
              so <code>await</code> on one never returns. The Y button does that
              on its last line on purpose, to run until release.
            </li>
            <li>
              <strong>Waits are</strong> <code>coroutine.waitUntil(...)</code>.
              Never build a wait out of a <code>Command</code> inside a body.
            </li>
            <li>
              <strong>Every wait in an autonomous has a timeout</strong>, about
              twice the time you measured.
            </li>
            <li>
              <strong>Every exit stops what it started.</strong>{" "}
              <a
                href="/running-program#latched"
                className="text-[var(--accent)] underline hover:text-[var(--accent)]"
              >
                Canceling is not stopping
              </a>
              , so fork the flywheel&apos;s <code>stop()</code> before each{" "}
              <code>return</code>. The arm needs none, because its last position
              request holds it.
            </li>
          </ul>
        </Box>
        <p>
          Rules two and three differ in what they claim. <code>run(...)</code>{" "}
          holds its mechanism for the whole body. <code>noRequirements</code>{" "}
          claims nothing, and each fork claims its own mechanism only while it
          runs.
        </p>
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
          Paste the whole shell. No button binds this routine, so{" "}
          <code>start()</code> and <code>end()</code> schedule and cancel it.
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
          Every build runs Spotless, which strips an import no line uses yet, so
          add it again if it vanishes.
        </p>

        <CodeBlock
          language="java"
          title="Add below the fork"
          code={`// TODO: time your own arm.
if (coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0)).timedOut()) {
  // The flywheel never started, so there is nothing to stop.
  return;
}`}
        />

        <p>
          This is the Y button&apos;s wait with a limit added. Three seconds is
          a placeholder: use the time you wrote down at the end of Finish
          Conditions, doubled.
        </p>

        <h3 className="display m-0 text-aside">
          Step 4: The flywheel, then the shot
        </h3>

        <CodeBlock
          language="java"
          title="The rest of the body"
          code={`// The arm hold is still running. That is the point of fork.
coroutine.fork(robot.flywheel.runFast());

if (coroutine.waitUntil(() -> robot.flywheel.isAtTarget(), Seconds.of(3.0)).timedOut()) {
  coroutine.fork(robot.flywheel.stop());
  return;
}

coroutine.wait(Seconds.of(1.0)); // shoot

// stop() replaces runFast() and sends its zero on this loop, before the routine ends.
coroutine.fork(robot.flywheel.stop());`}
        />

        <p>
          Two forks are live now, the arm holding 90&deg; while the flywheel
          climbs to 75 rotations per second. This branch has no feeder, so the
          one-second wait stands in for the shot.
        </p>
        <p>
          Every way out from here forks <code>stop()</code> first. It shares the
          flywheel with <code>runFast()</code>, so it replaces it, and a forked
          command runs its first pass on the spot. The zero goes out before the
          routine ends.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>Build it, run it, then break it on purpose.</p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Start the program with{" "}
            <strong>WPILib: Hardware Sim Robot Code</strong> and pick{" "}
            <strong>Raise And Shoot</strong> in the Driver Station. That name is
            the <code>@Autonomous</code> string, not the class name.
          </li>
          <li>
            Time the run. A healthy one is the arm, plus the flywheel, plus one
            second, and then the flywheel coasts down.
          </li>
          <li>
            Change the arm&apos;s tolerance to <code>Degrees.of(0.001)</code>{" "}
            and run again. Then delete the <code>if</code> and its{" "}
            <code>return</code> around the arm&apos;s wait and run once more.
            Put both back.
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
            <li>
              The routine ending a second later. The flywheel coasts to a stop
              and the arm keeps holding vertical.
            </li>
            <li>
              With the tolerance broken, the routine giving up after three
              seconds and the flywheel never starting. Without the{" "}
              <code>if</code>, it shoots anyway, at an angle nobody checked.
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
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  The routine ends and the flywheel keeps spinning
                </td>
                <td className="px-3 py-2">
                  A <code>return</code>, or the last line, with no{" "}
                  <code>stop()</code> forked before it.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <code>cannot find symbol: Seconds</code>
                </td>
                <td className="px-3 py-2">
                  The import is missing, or Spotless stripped it before a line
                  used it.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Logging is next. It is how you read back a routine that ran with
          nobody watching.
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
              "robot.arm.vertical() is built with runRepeatedly and is named 'vertical (hold)'. A hold never finishes on its own, so await would sit on that line for the rest of the match with no error and no log. fork starts it and returns at once. The house rule is fork holds, await steps.",
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
              "In teleop the driver is the backstop: the wait is unbounded, but releasing Y cancels the whole routine. Autonomous has no button and nobody watching the arm, so a jammed mechanism or a tolerance that never comes true stalls the routine for the entire period with nothing thrown and nothing logged. The time limit gives it an exit.",
          },
          {
            id: 3,
            question:
              "You write coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0)); and ignore what it returns. The arm jams. What does the routine do?",
            options: [
              "It carries on to the flywheel and the shot, three seconds later, as though the arm had arrived",
              "It throws, and the scheduler logs a timed-out wait",
              "It sits on that line for the rest of the autonomous period",
              "It cancels itself, because a timed-out wait ends the routine",
            ],
            correctAnswer: 0,
            explanation:
              "The timeout ends the wait, not the routine. Execution falls to the next line either way. waitUntil returns a WaitResult so you can tell the two endings apart, and ignoring it means the routine treats giving up and arriving as the same thing. That is why each wait sits inside if (...timedOut()) { return; }.",
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
              "Ending the routine cancels everything it forked, on an early return as much as on the last line. Canceled is not stopped, though. Nothing sends a zero, so the last request stays latched in the motor controller. The routine forks the flywheel's stop() before it ends for that reason.",
          },
          {
            id: 5,
            question:
              "Your routine drives to a pose, then drives to a second pose, and nothing needs to be held across both legs. Which style should you use?",
            options: [
              "A coroutine, because coroutines are the newer style",
              "Either, but a coroutine will run faster",
              "Chaining: Command.sequence runs two legs in order, and nothing has to be held across them",
              "A coroutine, because Command.sequence cannot hold two drive legs",
            ],
            correctAnswer: 2,
            explanation:
              "Chaining is the default and this routine gives you no reason to leave it. Coroutines are for two cases: a hold that must span several steps, and logic that needs real loops or branches. Two independent legs in order is neither.",
          },
          {
            id: 6,
            question:
              "You delete the last line, coroutine.fork(robot.flywheel.stop()), and run the routine. What does the flywheel do after the routine ends?",
            options: [
              "It stops, because ending the routine cancels runFast()",
              "It coasts down, because the motor's neutral mode is Coast",
              "It drops to runSlow(), the flywheel's resting speed",
              "It keeps spinning at 75 rotations per second, because canceling runFast() sends nothing",
            ],
            correctAnswer: 3,
            explanation:
              "Ending the routine does cancel runFast(), but canceling a command sends nothing to the motor. The last velocity request stays latched and Phoenix keeps holding 75 rotations per second. Coast only applies once something sends the motor to neutral, and forking stop() is what does that.",
          },
        ]}
      />
    </PageTemplate>
  );
}
