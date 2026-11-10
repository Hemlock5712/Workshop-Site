import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CoroutineTimeline from "@/components/lesson/CoroutineTimeline";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/coroutines");

/**
 * The page for `mech-5-Coroutines`, and since November 2026 the only place
 * the course builds a routine. Owner's call in that month's review: Commands
 * v3 composes with coroutines, so Command Composition (`Command.sequence`,
 * `Command.race`, `.withTimeout`) was cut and Finish Conditions lost
 * `.until(...)`. A routine waits on `isAtTarget()` with
 * `coroutine.waitUntil(...)`, never by decorating a hold.
 *
 * Two routines, one branch. The Y button in `MyTeleop` moved here from
 * `mech-4-ReadingState` when that branch was rebuilt: it waits with no time
 * limit, because the driver can let go. `RaiseAndShootOpMode` is the same
 * routine as an autonomous, where every wait gets a limit and somewhere to
 * go when it runs out. The page used to open by arguing that a sequence stays
 * the default; that framing went with the lesson that taught sequences.
 *
 * "The core calls" lost `coroutine.yield()` and its hand-written `while`
 * loop in the same pass. `waitUntil` is that loop, and no routine in the
 * course writes one by hand, so `/java-basics` no longer sends anyone to the
 * Loops module.
 *
 * The lambda explanation (`() -> robot.arm.isAtTarget()` versus a bare call,
 * and the `boolean cannot be converted to BooleanSupplier` error) moved here
 * from Finish Conditions with `.until(...)`, because `waitUntil` takes the
 * same `BooleanSupplier`.
 *
 * The routine stops the flywheel before every return that comes after
 * `runFast()`. A forked command runs its first pass on the spot
 * (`Scheduler.schedule` runs a child immediately), and `stop()` evicts
 * `runFast()` because they share the flywheel, so the zero is sent before the
 * `return` cancels everything. The arm gets no stop: a latched position
 * request holds it where it is.
 *
 * Cancel-is-not-stop is taught once, on `/running-program`. This page links
 * to it.
 */
export default function Coroutines() {
  return (
    <PageTemplate
      title="Coroutines"
      lede="A coroutine is a routine written as ordinary Java, read top to bottom, that can pause on a line and carry on from there. This lesson writes one for a button, then the same one for autonomous."
      needs={[
        <>
          An <code>Arm</code> and <code>Flywheel</code> with{" "}
          <code>isAtTarget()</code>, from <strong>Finish Conditions</strong>.
        </>,
        <>
          Tuned arm gains from <strong>PID Tuning in Tuner X</strong>.
        </>,
        <>
          The simulator running, from <strong>Hardware Simulation</strong>.
        </>,
      ]}
      branch="mech-5-Coroutines"
      time="15 minutes"
    >
      <LessonSection id="core-calls" title="The core calls">
        <p>
          A coroutine body takes one argument, an object called{" "}
          <code>coroutine</code>. Four calls on it build every routine in this
          course.
        </p>

        <CodeBlock
          language="java"
          title="The core calls, one example each"
          code={`// Start a hold and keep going. It runs underneath until the routine ends.
coroutine.fork(robot.arm.vertical());

// Pause here until a condition comes true.
coroutine.waitUntil(() -> robot.arm.isAtTarget());

// Run a command and pause here until it finishes.
coroutine.await(someStep);

// Pause for a fixed time. Forked holds keep running through it.
coroutine.wait(Seconds.of(1.0));`}
        />

        <p>
          <code>vertical()</code> is a hold, so it gets <code>fork</code>.{" "}
          <code>await</code> on a hold never returns, because a hold never
          finishes. The house rule is <strong>fork holds, await steps</strong>.
        </p>
        <p>
          <code>waitUntil</code> takes a lambda.{" "}
          <code>() -&gt; robot.arm.isAtTarget()</code> is a question the
          coroutine asks again on every loop. Drop the <code>() -&gt;</code> and
          the method runs once on the spot, handing over one frozen answer. The
          build stops on{" "}
          <code>boolean cannot be converted to BooleanSupplier</code>.
        </p>
      </LessonSection>

      <LessonSection id="y-button" title="The Y button">
        <p>
          Raise the arm, wait for it to arrive, then spin the flywheel while the
          arm keeps holding.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Give <code>MyTeleop</code> a <code>robot</code> field. The routine
            body is a method of its own, and the constructor&apos;s{" "}
            <code>robot</code> parameter does not reach it. Add{" "}
            <code>private final Robot robot;</code> beside <code>driver</code>,
            and make <code>this.robot = robot;</code> the first line of the
            constructor.
          </li>
          <li>
            Import <code>org.wpilib.command3.Command</code> and{" "}
            <code>org.wpilib.command3.Coroutine</code>.
          </li>
          <li>
            Add the Y binding to the constructor and the method below it to the
            class.
          </li>
        </ol>

        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/opmode/MyTeleop.java"
          title="MyTeleop.java: the binding, and the body it calls"
          code={`// Y: raise the arm, then spin the flywheel once it is really there.
driver
    .y()
    .whileTrue(
        Command.noRequirements(coroutine -> spinUpWhenReady(coroutine))
            .named("Spin Up When Ready"))
    .whileFalse(robot.flywheel.stop());

// ... and, further down the class:

private void spinUpWhenReady(Coroutine coroutine) {
  // fork, not await: vertical() is a hold and never finishes.
  coroutine.fork(robot.arm.vertical());

  coroutine.waitUntil(() -> robot.arm.isAtTarget());

  // runFast is a hold too, so this never returns: releasing Y cancels the whole routine.
  coroutine.await(robot.flywheel.runFast());
}`}
        />

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              <code>Command.noRequirements</code> claims no mechanism itself.
              Each forked command claims its own, for only as long as it runs,
              so the arm can keep holding while the flywheel spins.
            </p>
            <p>
              The last line awaits a hold on purpose, so the routine runs until
              you let go. Releasing Y cancels the routine and everything it
              forked, and <code>whileFalse</code> stops the flywheel.
            </p>
          </div>
          <MarginNote label="No time limit here">
            The wait is unbounded, which is safe only because a driver is
            holding Y and can let go.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="house-rules" title="House rules">
        <Box variant="concept" title="House rules">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>A routine</strong> is{" "}
              <code>
                Command.noRequirements(coroutine -&gt; body(coroutine))
              </code>{" "}
              with <code>.named(...)</code>. The body is a private method, so a{" "}
              <code>return</code> plainly leaves the routine.
            </li>
            <li>
              <strong>Fork holds, await steps.</strong>
            </li>
            <li>
              <strong>Wait on a condition</strong> with{" "}
              <code>coroutine.waitUntil(...)</code>.
            </li>
            <li>
              <strong>Every wait in an autonomous has a time limit.</strong>
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
      </LessonSection>

      <LessonSection id="build-the-routine" title="The autonomous version">
        <p>
          Autonomous has no button and nobody to let go of one. A wait that
          never comes true would eat the whole period. So every wait gets a time
          limit and somewhere to go when it runs out.
        </p>
        <p>
          The diff adds one file:{" "}
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
        </p>

        <h3 className="display m-0 text-aside">Step 2: Fork the arm hold</h3>

        <CodeBlock
          language="java"
          title="First line of the body"
          code={`// fork, not await: vertical() is a hold and never finishes.
coroutine.fork(robot.arm.vertical());`}
        />

        <h3 className="display m-0 text-aside">Step 3: Wait, with a limit</h3>

        <p>
          Add <code>import static org.wpilib.units.Units.Seconds;</code> first.
          Every build runs Spotless, which strips an import no line uses yet, so
          add it again if it vanishes.
        </p>

        <CodeBlock
          language="java"
          title="Add below the fork"
          code={`if (coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0)).timedOut()) {
  // The flywheel never started, so there is nothing to stop.
  return;
}`}
        />

        <p>
          This is the Y button&apos;s wait with a limit added.{" "}
          <code>waitUntil</code> returns a <code>WaitResult</code>, and{" "}
          <code>.timedOut()</code> tells you which ending you got. Ignore it and
          the routine carries on as if the arm had arrived.
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
          There is no feeder, so the one-second wait stands in for the shot.
          Every way out from here forks <code>stop()</code> first. It shares the
          flywheel with <code>runFast()</code>, so it replaces it, and the zero
          goes out before the routine ends.
        </p>

        <CoroutineTimeline />
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Start <strong>WPILib: Hardware Sim Robot Code</strong>, enable
            Teleoperated, and hold Y.
          </li>
          <li>
            Switch to Autonomous and pick <strong>Raise And Shoot</strong>. That
            name is the <code>@Autonomous</code> string, not the class name.
          </li>
          <li>
            Change the arm&apos;s tolerance to <code>Degrees.of(0.001)</code>{" "}
            and run the autonomous again. Put it back.
          </li>
          <li>
            Change the first line to{" "}
            <code>coroutine.await(robot.arm.vertical())</code> and run again.
            Put the <code>fork</code> back.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              On Y, the flywheel waiting out the arm&apos;s travel, then
              spinning up with the arm still holding. Release, and it stops.
            </li>
            <li>
              In autonomous, the same, then the routine ending a second later.
              The flywheel coasts down and the arm keeps holding vertical.
            </li>
            <li>
              With the tolerance broken, the routine giving up after three
              seconds and the flywheel never starting.
            </li>
            <li>With the arm awaited, the arm moving and nothing else.</li>
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
                  The first wait timed out. The branch ships the arm gains at{" "}
                  <code>0.0</code>. Tune it first.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">One thing happens, then nothing</td>
                <td className="px-3 py-2">
                  A hold inside <code>await</code>.
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
              "robot.arm.vertical() is built with runRepeatedly. A hold never finishes on its own, so await would sit on that line for the rest of the match. fork starts it and returns at once. The house rule is fork holds, await steps.",
          },
          {
            id: 2,
            question:
              "The Y button waits on robot.arm.isAtTarget() with no time limit. Why does the autonomous version need one?",
            options: [
              "Autonomous runs the scheduler at a different rate, so untimed waits drift",
              "Nobody is holding a button in autonomous, so a wait that never comes true has nothing to end it and eats the rest of the period",
              "waitUntil refuses to compile inside an @Autonomous class without a timeout",
              "The arm is slower in autonomous than it is in teleop",
            ],
            correctAnswer: 1,
            explanation:
              "In teleop the driver is the backstop: releasing Y cancels the whole routine. Autonomous has no button and nobody watching the arm, so a jammed mechanism or a tolerance that never comes true stalls the routine for the entire period. The time limit gives it an exit.",
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
              "The time limit ends the wait, not the routine. Execution falls to the next line either way. waitUntil returns a WaitResult so you can tell the two endings apart, so each wait sits inside if (...timedOut()) { return; }.",
          },
          {
            id: 4,
            question:
              "You write coroutine.waitUntil(robot.arm.isAtTarget()) without the () ->. What happens?",
            options: [
              "It works the same; the () -> is optional",
              "It waits forever, because the answer is checked only once",
              "The build fails: boolean cannot be converted to BooleanSupplier",
              "It skips the wait, because the arm is not at target yet",
            ],
            correctAnswer: 2,
            explanation:
              "Without the lambda, isAtTarget() runs right there and produces one frozen boolean. waitUntil takes a BooleanSupplier, a question it can ask again every loop, so javac rejects the bare boolean.",
          },
          {
            id: 5,
            question:
              "You delete the last line, coroutine.fork(robot.flywheel.stop()), and run the routine. What does the flywheel do after the routine ends?",
            options: [
              "It stops, because ending the routine cancels runFast()",
              "It keeps spinning at 75 rotations per second, because canceling runFast() sends nothing",
              "It coasts down, because the motor's neutral mode is Coast",
              "It drops to runSlow(), the flywheel's resting speed",
            ],
            correctAnswer: 1,
            explanation:
              "Ending the routine does cancel runFast(), but canceling a command sends nothing to the motor. The last velocity request stays latched and Phoenix keeps holding 75 rotations per second. Forking stop() is what sends the zero.",
          },
        ]}
      />
    </PageTemplate>
  );
}
