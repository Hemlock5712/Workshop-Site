import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import RoutineView from "@/components/lesson/RoutineView";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/coroutines");

/**
 * The page for `mech-5-Coroutines`, and the only place the course builds a
 * routine. Commands v3 composes with coroutines, so there is no
 * `Command.sequence`, `Command.race` or `.until(...)` anywhere on the site.
 *
 * Owner's review, November 2026, restructured it around three teleop routines
 * and one autonomous, each shown as a Code / Timeline toggle (`RoutineView`)
 * so the picture costs no page length:
 *
 * - Y, `raiseAndLower`: the arm alone. Shown as the whole `MyTeleop.java`,
 *   because a student who already has the file needs to see where it goes,
 *   then explained line by line.
 * - X, `spinUpAndStop`: the flywheel alone, with `wait` and a forked `stop()`.
 * - B, `wave`: the arm routine in a `for` loop, to show a routine is plain
 *   Java.
 * - `RaiseAndShootOpMode`: both mechanisms, every wait limited, each
 *   `WaitResult` stored in a variable before the `if`, because the one-line
 *   `if (coroutine.waitUntil(...).timedOut())` was too long to read.
 *
 * The word "hold" is gone from this page. Owner's call: say `runRepeatedly`,
 * the thing the student typed. The rule is "fork what never ends, await what
 * can end", stated once in the core calls and not repeated in House rules.
 *
 * The lambda paragraph no longer quotes the `BooleanSupplier` compile error;
 * the owner cut it. A routine prints with `System.out.println`: `Coroutine`
 * has no print or log call of its own.
 *
 * The flywheel gets a forked `stop()` before every exit after `runFast()`. A
 * forked command runs its first pass on the spot, and `stop()` evicts
 * `runFast()` because they share the flywheel, so the zero is sent before the
 * routine ends. The arm gets no stop: a latched position request holds it.
 * Cancel-is-not-stop is taught on `/running-program`.
 *
 * Timeline times are illustrative: 0.5 s per 90 degrees of arm travel, 0.6 s
 * to reach 75 rps. The routines themselves build on the branch; with the
 * branch's 0.0 gains nothing arrives, so the timing is not measured.
 */
export default function Coroutines() {
  return (
    <PageTemplate
      title="Coroutines"
      lede="A coroutine is a routine written as ordinary Java, read top to bottom, that can pause on a line and carry on from there. This lesson writes three for buttons, then one for autonomous."
      needs={[
        <>
          An <code>Arm</code> and <code>Flywheel</code> with{" "}
          <code>isAtTarget()</code>, from{" "}
          <strong>Conditions and Logging</strong>.
        </>,
        <>
          Tuned gains from <strong>PID Tuning in Tuner X</strong>.
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
          code={`// Start a command and keep going. It runs in the background until the routine ends.
coroutine.fork(robot.arm.vertical());

// Pause here until a condition comes true.
coroutine.waitUntil(() -> robot.arm.isAtTarget());

// Run a command and pause here until it finishes.
coroutine.await(someStep);

// Pause for a fixed time. Forked commands keep running through it.
coroutine.wait(Seconds.of(1.0));`}
        />

        <p>
          <code>vertical()</code> is a <code>runRepeatedly</code> command, so it
          never finishes. If we used <code>await</code> on it, the routine would
          never get past that line. With <code>fork</code>, it runs in the
          background while the routine goes on to the next line. So{" "}
          <strong>fork</strong> anything that never ends, and{" "}
          <strong>await</strong> anything that can end.
        </p>
        <p>
          <code>waitUntil</code> takes a lambda,{" "}
          <code>() -&gt; robot.arm.isAtTarget()</code>, and calls it again on
          every loop to get a fresh answer. Without the <code>() -&gt;</code>,
          the method would be called once, and that one answer would never
          change.
        </p>
      </LessonSection>

      <LessonSection id="arm-routine" title="An arm routine">
        <p>
          Hold Y and the arm goes up, waits until it gets there, comes back
          down, waits again, and prints that it is done. Here is the whole{" "}
          <code>MyTeleop.java</code> with it added. The marked lines are new.
        </p>

        <RoutineView
          code={
            <CodeBlock
              language="java"
              filename="src/main/java/first/robot/opmode/MyTeleop.java"
              code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.command3.Command;
import org.wpilib.command3.Coroutine;
import org.wpilib.opmode.PeriodicOpMode;
import org.wpilib.opmode.Teleop;

@Teleop(name = "Teleop")
public class MyTeleop extends PeriodicOpMode {
  private final Robot robot;

  public MyTeleop(Robot robot) {
    this.robot = robot;
    robot.driver.leftTrigger().whileTrue(robot.arm.vertical());
    robot
        .driver
        .rightTrigger()
        .whileTrue(robot.flywheel.runFast())
        .whileFalse(robot.flywheel.runSlow());
    robot.driver.a().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.stop());

    // Y: raise the arm, wait for it, lower it, wait again.
    robot
        .driver
        .y()
        .whileTrue(
            Command.noRequirements(coroutine -> raiseAndLower(coroutine)).named("Raise And Lower"));
  }

  private void raiseAndLower(Coroutine coroutine) {
    coroutine.fork(robot.arm.vertical());
    coroutine.waitUntil(() -> robot.arm.isAtTarget());

    coroutine.fork(robot.arm.horizontal());
    coroutine.waitUntil(() -> robot.arm.isAtTarget());

    System.out.println("Raise And Lower: done");
  }
}`}
              highlightLines={[
                4, 5, 11, 14, 23, 24, 25, 26, 27, 28, 31, 32, 33, 35, 36, 38,
                39,
              ]}
            />
          }
          steps={[
            {
              line: "fork(arm.vertical())",
              at: [[0, 0]],
              note: "fork starts vertical() and moves to the next line on the same loop.",
            },
            {
              line: "waitUntil(arm at target)",
              at: [[0, 0.5]],
              note: "The routine waits here. vertical() keeps running underneath and moves the arm.",
            },
            {
              line: "fork(arm.horizontal())",
              at: [[0.5, 0.5]],
              note: "horizontal() needs the arm too, so it replaces vertical().",
            },
            {
              line: "waitUntil(arm at target)",
              at: [[0.5, 1.0]],
              note: "Waiting again. isAtTarget() now compares against the new target.",
            },
            {
              line: 'println("Raise And Lower: done")',
              at: [[1.0, 1.0]],
              note: "The message prints to the console. That was the last line.",
            },
          ]}
          lanes={[
            {
              name: "Arm",
              segments: [
                { from: 0, to: 0.5, label: "vertical()" },
                { from: 0.5, to: 1.0, label: "horizontal()" },
                {
                  from: 1.0,
                  to: 1.6,
                  label: "request latched · holds",
                  kind: "after",
                },
              ],
            },
          ]}
          end={1.0}
          total={1.6}
          endNote="The routine ends and cancels horizontal(). Canceling sends nothing, so the last position request stays latched and the arm holds."
        />

        <ul className="ml-5 list-disc space-y-3">
          <li>
            <code>private final Robot robot;</code> and{" "}
            <code>this.robot = robot;</code> keep the robot in a field. The
            routine is a method of its own, and the constructor&apos;s{" "}
            <code>robot</code> parameter does not reach it.
          </li>
          <li>
            <code>robot.driver.y().whileTrue(...)</code> runs the routine while
            Y is held. Letting go cancels it, and everything it forked.
          </li>
          <li>
            <code>Command.noRequirements(...)</code> turns a coroutine into a
            command. Inside a mechanism you build commands with{" "}
            <code>runRepeatedly</code>, which claims that mechanism. Outside a
            mechanism you use <code>Command.noRequirements</code>. The routine
            claims nothing itself, and each command it forks claims its own
            mechanism for as long as it runs.
          </li>
          <li>
            <code>.named(&quot;Raise And Lower&quot;)</code> is required.{" "}
            <code>noRequirements</code> hands back a builder, and it only
            becomes a <code>Command</code> once it has a name. The name is what
            the scheduler shows while it runs.
          </li>
          <li>
            <code>raiseAndLower</code> is the routine itself. The scheduler
            hands it the <code>coroutine</code> to call <code>fork</code> and{" "}
            <code>waitUntil</code> on.
          </li>
          <li>
            <code>System.out.println</code> prints to the console: the VS Code
            terminal in simulation, the Driver Station console on the robot.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="flywheel-routine" title="A flywheel routine">
        <p>
          X spins the flywheel up, keeps it at speed for one second, then stops
          it. Add the binding under Y and the method under{" "}
          <code>raiseAndLower</code>.
        </p>

        <RoutineView
          code={
            <CodeBlock
              language="java"
              filename="src/main/java/first/robot/opmode/MyTeleop.java"
              code={`import static org.wpilib.units.Units.Seconds;

import first.robot.Robot;
// ... the other imports, unchanged

public class MyTeleop extends PeriodicOpMode {
  // ... fields, unchanged

  public MyTeleop(Robot robot) {
    // ... everything up to Y, unchanged

    // X: spin up, keep the speed for one second, stop.
    robot
        .driver
        .x()
        .whileTrue(
            Command.noRequirements(coroutine -> spinUpAndStop(coroutine)).named("Spin Up And Stop"))
        .whileFalse(robot.flywheel.stop());
  }

  // ... raiseAndLower, unchanged

  private void spinUpAndStop(Coroutine coroutine) {
    coroutine.fork(robot.flywheel.runFast());
    coroutine.waitUntil(() -> robot.flywheel.isAtTarget());

    coroutine.wait(Seconds.of(1.0));

    // stop() replaces runFast() and sends its zero before the routine ends.
    coroutine.fork(robot.flywheel.stop());
    System.out.println("Spin Up And Stop: done");
  }
}`}
              highlightLines={[
                1, 12, 13, 14, 15, 16, 17, 18, 23, 24, 25, 27, 29, 30, 31, 32,
              ]}
            />
          }
          steps={[
            {
              line: "fork(flywheel.runFast())",
              at: [[0, 0]],
              note: "fork starts runFast() and moves on.",
            },
            {
              line: "waitUntil(flywheel at target)",
              at: [[0, 0.6]],
              note: "Waiting for the wheel to reach its target speed.",
            },
            {
              line: "wait(1 s)",
              at: [[0.6, 1.6]],
              note: "A fixed one-second wait. runFast() keeps the wheel at speed.",
            },
            {
              line: "fork(flywheel.stop())",
              at: [[1.6, 1.6]],
              note: "stop() needs the flywheel, so it replaces runFast() and sends a zero on this loop.",
            },
            {
              line: 'println("Spin Up And Stop: done")',
              at: [[1.6, 1.6]],
              note: "The message prints. That was the last line.",
            },
          ]}
          lanes={[
            {
              name: "Flywheel",
              segments: [
                { from: 0, to: 1.6, label: "runFast()" },
                {
                  from: 1.6,
                  to: 2.2,
                  label: "stop sent · coasting down",
                  kind: "after",
                },
              ],
            },
          ]}
          end={1.6}
          total={2.2}
          endNote="The routine ends. The zero from stop() already went out, so the wheel coasts down instead of spinning on."
        />

        <p>
          Unlike the arm, the flywheel needs <code>stop()</code> at the end.
          Ending a routine cancels what it forked, and{" "}
          <a
            href="/running-program#latched"
            className="text-[var(--accent)] underline hover:text-[var(--accent)]"
          >
            canceling is not stopping
          </a>
          : the wheel would keep spinning. <code>whileFalse</code> covers the
          other way out, letting go of X early.
        </p>
      </LessonSection>

      <LessonSection id="loop-routine" title="A routine in a loop">
        <p>
          A routine is ordinary Java, so anything Java can do, it can do. B puts
          the arm routine inside a <code>for</code> loop and runs it three
          times.
        </p>

        <RoutineView
          code={
            <CodeBlock
              language="java"
              filename="src/main/java/first/robot/opmode/MyTeleop.java"
              code={`public class MyTeleop extends PeriodicOpMode {
  // ... fields, unchanged

  public MyTeleop(Robot robot) {
    // ... everything up to X, unchanged

    // B: raise and lower the arm three times.
    robot.driver.b().whileTrue(Command.noRequirements(coroutine -> wave(coroutine)).named("Wave"));
  }

  // ... raiseAndLower and spinUpAndStop, unchanged

  private void wave(Coroutine coroutine) {
    for (int i = 0; i < 3; i++) {
      coroutine.fork(robot.arm.vertical());
      coroutine.waitUntil(() -> robot.arm.isAtTarget());

      coroutine.fork(robot.arm.horizontal());
      coroutine.waitUntil(() -> robot.arm.isAtTarget());
    }
    System.out.println("Wave: done");
  }
}`}
              highlightLines={[7, 8, 13, 14, 15, 16, 18, 19, 20, 21, 22]}
            />
          }
          steps={[
            { line: "for (3 times) {" },
            {
              line: "  fork(arm.vertical())",
              at: [
                [0, 0],
                [1, 1],
                [2, 2],
              ],
              note: "Up.",
            },
            {
              line: "  waitUntil(arm at target)",
              at: [
                [0, 0.5],
                [1, 1.5],
                [2, 2.5],
              ],
              note: "Waiting for the arm to reach vertical.",
            },
            {
              line: "  fork(arm.horizontal())",
              at: [
                [0.5, 0.5],
                [1.5, 1.5],
                [2.5, 2.5],
              ],
              note: "Down.",
            },
            {
              line: "  waitUntil(arm at target)",
              at: [
                [0.5, 1],
                [1.5, 2],
                [2.5, 3],
              ],
              note: "Waiting for the arm to reach horizontal. Then the loop goes around.",
            },
            { line: "}" },
            {
              line: 'println("Wave: done")',
              at: [[3, 3]],
              note: "Three times round, then the message prints.",
            },
          ]}
          lanes={[
            {
              name: "Arm",
              segments: [
                { from: 0, to: 0.5, label: "vertical()" },
                { from: 0.5, to: 1, label: "horizontal()" },
                { from: 1, to: 1.5, label: "vertical()" },
                { from: 1.5, to: 2, label: "horizontal()" },
                { from: 2, to: 2.5, label: "vertical()" },
                { from: 2.5, to: 3, label: "horizontal()" },
                { from: 3, to: 3.5, label: "latched · holds", kind: "after" },
              ],
            },
          ]}
          end={3}
          total={3.5}
          endNote="The loop ran three times. The routine ends and the arm holds its last position."
        />
      </LessonSection>

      <LessonSection id="build-the-routine" title="The autonomous version">
        <p>
          Autonomous has no button and nobody to let go of one. A wait that
          never comes true would eat the whole period. So every wait gets a time
          limit and somewhere to go when it runs out. This routine uses both
          mechanisms: raise the arm, spin up, shoot.
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

        <h3 className="display m-0 text-aside">Step 2: Fork the arm</h3>

        <CodeBlock
          language="java"
          title="First line of the body"
          code={`// fork, not await: vertical() uses runRepeatedly and never finishes.
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
          code={`Coroutine.WaitResult armResult =
    coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0));
if (armResult.timedOut()) {
  // The flywheel never started, so there is nothing to stop.
  return;
}`}
        />

        <p>
          This is the arm routine&apos;s wait with a limit added.{" "}
          <code>waitUntil</code> returns a <code>WaitResult</code>, kept here in{" "}
          <code>armResult</code>, and <code>.timedOut()</code> tells you which
          ending you got. Ignore it and the routine carries on as if the arm had
          arrived.
        </p>

        <h3 className="display m-0 text-aside">
          Step 4: The flywheel, then the shot
        </h3>

        <CodeBlock
          language="java"
          title="The rest of the body"
          code={`// vertical() is still running. That is the point of fork.
coroutine.fork(robot.flywheel.runFast());

Coroutine.WaitResult flywheelResult =
    coroutine.waitUntil(() -> robot.flywheel.isAtTarget(), Seconds.of(3.0));
if (flywheelResult.timedOut()) {
  coroutine.fork(robot.flywheel.stop());
  return;
}

coroutine.wait(Seconds.of(1.0)); // shoot

// stop() replaces runFast() and sends its zero on this loop, before the routine ends.
coroutine.fork(robot.flywheel.stop());`}
        />

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              There is no feeder, so the one-second wait stands in for the shot.
              Every way out from here forks <code>stop()</code> first, for the
              same reason as the X button.
            </p>
          </div>
          <MarginNote label="No limit on the buttons">
            The teleop waits have no limit, which is safe only because a driver
            is holding the button and can let go.
          </MarginNote>
        </Split>

        <p>The finished body, and what it does over time:</p>

        <RoutineView
          code={
            <CodeBlock
              language="java"
              filename="src/main/java/first/robot/opmode/RaiseAndShootOpMode.java"
              code={`private void raiseAndShoot(Coroutine coroutine) {
  // fork, not await: vertical() uses runRepeatedly and never finishes.
  coroutine.fork(robot.arm.vertical());

  Coroutine.WaitResult armResult =
      coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0));
  if (armResult.timedOut()) {
    // The flywheel never started, so there is nothing to stop.
    return;
  }

  // vertical() is still running. That is the point of fork.
  coroutine.fork(robot.flywheel.runFast());

  Coroutine.WaitResult flywheelResult =
      coroutine.waitUntil(() -> robot.flywheel.isAtTarget(), Seconds.of(3.0));
  if (flywheelResult.timedOut()) {
    coroutine.fork(robot.flywheel.stop());
    return;
  }

  coroutine.wait(Seconds.of(1.0)); // shoot

  // stop() replaces runFast() and sends its zero on this loop, before the routine ends.
  coroutine.fork(robot.flywheel.stop());
}`}
            />
          }
          steps={[
            {
              line: "fork(arm.vertical())",
              at: [[0, 0]],
              note: "fork starts vertical() and moves on.",
            },
            {
              line: "armResult = waitUntil(..., 3 s)",
              at: [[0, 0.5]],
              note: "Waiting on the arm, for three seconds at most.",
            },
            {
              line: "if (armResult.timedOut()) return",
              at: [[0.5, 0.5]],
              note: "The arm arrived in time, so the routine goes on.",
            },
            {
              line: "fork(flywheel.runFast())",
              at: [[0.5, 0.5]],
              note: "A second fork. vertical() is still running beside it.",
            },
            {
              line: "flywheelResult = waitUntil(..., 3 s)",
              at: [[0.5, 1.1]],
              note: "Waiting on the flywheel. Both mechanisms are running underneath.",
            },
            {
              line: "if (flywheelResult.timedOut())",
              at: [[1.1, 1.1]],
              note: "Up to speed in time, so no early stop.",
            },
            {
              line: "wait(1 s)  // shoot",
              at: [[1.1, 2.1]],
              note: "The shot. Both forked commands keep running.",
            },
            {
              line: "fork(flywheel.stop())",
              at: [[2.1, 2.1]],
              note: "stop() replaces runFast() and sends the zero.",
            },
          ]}
          lanes={[
            {
              name: "Arm",
              segments: [
                { from: 0, to: 2.1, label: "vertical()" },
                { from: 2.1, to: 2.8, label: "latched · holds", kind: "after" },
              ],
            },
            {
              name: "Flywheel",
              segments: [
                { from: 0.5, to: 2.1, label: "runFast()" },
                {
                  from: 2.1,
                  to: 2.8,
                  label: "stop sent · coasting",
                  kind: "after",
                },
              ],
            },
          ]}
          end={2.1}
          total={2.8}
          endNote="The routine ends. The arm holds on its latched request, and the flywheel coasts down from the zero stop() sent."
        />
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
              <strong>Wait on a condition</strong> with{" "}
              <code>coroutine.waitUntil(...)</code> and a lambda.
            </li>
            <li>
              <strong>Every wait in an autonomous has a time limit.</strong>
            </li>
            <li>
              <strong>Every exit stops the flywheel</strong> once it has
              started. The arm needs no stop, because its last position request
              holds it.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Start <strong>WPILib: Hardware Sim Robot Code</strong>, enable
            Teleoperated, and hold Y until it prints. Then X, then B.
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
            Change the first line of <code>raiseAndShoot</code> to{" "}
            <code>coroutine.await(robot.arm.vertical())</code> and run again.
            Put the <code>fork</code> back.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              On Y, the arm going up, then down, then{" "}
              <code>Raise And Lower: done</code> in the console. On X, the
              flywheel spinning up, holding a second, and stopping. On B, three
              waves.
            </li>
            <li>
              In autonomous, the arm rising, the flywheel spinning up, and the
              routine ending a second later. The flywheel coasts down and the
              arm keeps holding vertical.
            </li>
            <li>
              With the tolerance broken, the routine giving up after three
              seconds and the flywheel never starting.
            </li>
            <li>With the arm awaited, the arm moving and nothing else.</li>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does the routine call coroutine.fork(robot.arm.vertical()) instead of coroutine.await(robot.arm.vertical())?",
            options: [
              "fork automatically applies a three-second timeout",
              "await only works on commands that require no mechanisms",
              "vertical() uses runRepeatedly and never finishes, so await would never get past that line",
              "fork is faster than await",
            ],
            correctAnswer: 2,
            explanation:
              "robot.arm.vertical() is built with runRepeatedly, so it never finishes on its own. await would sit on that line for the rest of the match. fork starts it in the background and moves to the next line. Fork what never ends, await what can end.",
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
              "In teleop the driver is the backstop: letting go of Y cancels the whole routine. Autonomous has no button and nobody watching the arm, so a jammed mechanism or a tolerance that never comes true stalls the routine for the entire period. The time limit gives it an exit.",
          },
          {
            id: 3,
            question:
              "You write coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0)); and ignore what it returns. The arm jams. What does the routine do?",
            options: [
              "It throws, and the scheduler logs a timed-out wait",
              "It sits on that line for the rest of the autonomous period",
              "It cancels itself, because a timed-out wait ends the routine",
              "It carries on to the flywheel and the shot, three seconds later, as though the arm had arrived",
            ],
            correctAnswer: 3,
            explanation:
              "The time limit ends the wait, not the routine. Execution falls to the next line either way. waitUntil returns a WaitResult so you can tell the two endings apart, so the routine keeps it in armResult and checks armResult.timedOut().",
          },
          {
            id: 4,
            question:
              "Why does waitUntil take () -> robot.arm.isAtTarget() instead of robot.arm.isAtTarget()?",
            options: [
              "The lambda adds a default time limit to the wait",
              "The lambda makes the check run faster",
              "The lambda is called again on every loop, so the routine sees the arm arrive. A bare call would give one answer that never changes",
              "Lambdas are required for any method that returns a boolean",
            ],
            correctAnswer: 2,
            explanation:
              "waitUntil asks its question again on every loop. Without the () ->, isAtTarget() would run once, right there, and hand over one answer that never changes.",
          },
          {
            id: 5,
            question:
              "You delete the line coroutine.fork(robot.flywheel.stop()) from the X routine. What does the flywheel do after the routine ends?",
            options: [
              "It keeps spinning at 75 rotations per second, because canceling runFast() sends nothing",
              "It coasts down, because the motor's neutral mode is Coast",
              "It drops to runSlow(), the flywheel's resting speed",
              "It stops, because ending the routine cancels runFast()",
            ],
            correctAnswer: 0,
            explanation:
              "Ending the routine does cancel runFast(), but canceling a command sends nothing to the motor. The last velocity request stays latched and Phoenix keeps holding 75 rotations per second. Forking stop() is what sends the zero.",
          },
        ]}
      />
    </PageTemplate>
  );
}
