import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";

/**
 * Lesson 17, and the page for `mech-4-ReadingState`. It left Workshop 6
 * alongside Command Composition because `/autonomous` ends every step in its
 * routine on a `.withTimeout(...)`, and in September 2026 both moved again
 * into the end of Workshop 3: an arm reporting its own angle needs no swerve
 * module, and behind four drivetrain lessons a team without one could not
 * reach it.
 *
 * "One button, both mechanisms" is new with alpha-7. The branch's MyTeleop now
 * binds Y to a coroutine rather than a `Command.sequence`, which is the first
 * coroutine in the course. It is deliberately thin: fork, waitUntil, await,
 * named once each and no timeline diagram. `/coroutines` is the next lesson
 * and owns the full treatment. What this page owes it is the reason a
 * coroutine exists at all, and that reason is the arrival check above it.
 *
 * It is also the first page on the site to use `.until(...)` and the word
 * `BooleanSupplier`. `/java-basics` pre-taught both fourteen lessons early and
 * no longer does, so section one defines them where they first appear.
 *
 * Written once, read twice from "The arrival question" down — see
 * `src/data/mechanisms.ts`. The arm compares an angle and the flywheel
 * compares a speed, which is two different `isAtTarget()` and not one with a
 * noun swapped, so that section forks. Everything from "Both endings on one
 * step" stays shared, because a condition and a timeout read the same on
 * either mechanism.
 *
 * There is no `Command.sequence` on this page. It carried a `score` routine
 * with two flywheel members until September 2026, which meant the arrival
 * check, multi-member composition and the coroutine all landed in the same
 * scroll. Composition is `/chaining-commands`, one lesson back, and the
 * two-mechanism version is `/coroutines`, one lesson on. What is left here is
 * the one thing this lesson owns: giving a single hold an ending. The quiz
 * question about a sequence's last member went with it, because its answer
 * was no longer taught on the page.
 *
 * Trimmed from 14.8 minutes to budget in September 2026. What else went: an
 * opening paragraph that restated the lede, the "the other mechanism has the
 * same three methods" aside on a page whose whole point is that you read one
 * mechanism, and two of the three forward references to `/coroutines`. The
 * remaining quiz, the procedure, the failure grid and every number a student
 * types are untouched. `time` stays at 15 because the procedure rebuilds and
 * redeploys four times, which no amount of cutting makes faster.
 *
 * The old `debounce` and `audit-a-sequence` sections are gone. The one
 * load-bearing idea in the first, a condition that goes true too early, is the
 * third failure shape below. The second was a checklist of things the page had
 * already said once.
 */
export default function FinishConditions() {
  return (
    <PageTemplate
      title="Finish Conditions"
      lede="Command Composition ended every step with a stopwatch, and that number was a guess. This lesson ends a step when a sensor reports the mechanism arrived. The stopwatch stays on as a backstop."
      needs={[
        <>
          <code>Command.sequence</code> and <code>.withTimeout(...)</code>, from{" "}
          <strong>Command Composition</strong>.
        </>,
        <>An arm position hold, with gains that reach the angle it asks for.</>,
        <>
          Lambdas, from <strong>Java Basics</strong>.
        </>,
        <>
          The simulator running, from <strong>Hardware Simulation</strong>.
        </>,
      ]}
      branch="mech-4-ReadingState"
      time="15 minutes"
    >
      <MechanismSelector />

      <LessonSection id="two-endings" title="Timeouts and conditions">
        <p>
          <code>.until(...)</code> wraps a command and ends it on the first loop
          a condition comes back true. That condition is a{" "}
          <code>BooleanSupplier</code>: a small piece of code that answers true
          or false when it is asked. The scheduler asks about fifty times a
          second.
        </p>
        <p>
          Hand it a lambda. <code>() -&gt; robot.arm.isAtTarget()</code> is a
          question the scheduler can ask on every loop. Drop the{" "}
          <code>() -&gt;</code> and the method runs on the spot, passing one
          frozen answer. The build stops on{" "}
          <code>boolean cannot be converted to BooleanSupplier</code>.
        </p>
        <p>
          <code>.until(...)</code> returns a builder, not a <code>Command</code>
          , the same way <code>Command.sequence(...)</code> did.{" "}
          <code>.named(&quot;...&quot;)</code> closes it, and leaving it off
          fails the build.
        </p>
      </LessonSection>

      <LessonSection id="sensor-condition" title="The arrival question">
        <p>
          The mechanism owns the comparison. Its units, its target and its
          tolerance already live in that file. Put the arithmetic there too, and
          every call site gets one readable question.
        </p>
        <Mech for="arm">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/mechanisms/Arm.java"
            title="Arm.java: the arrival check"
            code={`private final Angle tolerance = Degrees.of(1.0);

/** Where the arm is now, straight off the CANcoder. */
public Angle getPosition() {
  return encoder.getPosition().getValue();
}

/** Where the last position request asked it to go. */
public Angle getTargetPosition() {
  return positionOut.getPositionMeasure();
}

/** True when the arm has reached its target angle. */
public boolean isAtTarget() {
  return getPosition().isNear(getTargetPosition(), tolerance);
}`}
          />
        </Mech>

        <Mech for="flywheel">
          <CodeBlock
            language="java"
            filename="src/main/java/first/robot/mechanisms/Flywheel.java"
            title="Flywheel.java: the arrival check"
            code={`private final AngularVelocity tolerance = RotationsPerSecond.of(0.5);

/** How fast the wheel is turning now, straight off the motor. */
public AngularVelocity getVelocity() {
  return motor.getVelocity().getValue();
}

/** The speed the last velocity request asked for. */
public AngularVelocity getTargetVelocity() {
  return velocityOut.getVelocityMeasure();
}

/** True when the flywheel has reached its target speed. */
public boolean isAtTarget() {
  return getVelocity().isNear(getTargetVelocity(), tolerance);
}`}
          />
        </Mech>

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <Mech for="arm" as="p">
              <code>getPosition()</code> reads the CANcoder.{" "}
              <code>getTargetPosition()</code> asks the request object where it
              was last told to go. Both return an <code>Angle</code>, so nothing
              here can mix up rotations and degrees. <code>isNear</code> is true
              when the two are within <code>tolerance</code>, and one degree is
              the arm&apos;s.
            </Mech>
            <Mech for="flywheel" as="p">
              <code>getVelocity()</code> reads the motor.{" "}
              <code>getTargetVelocity()</code> asks the request object what
              speed it was last told to hold. Both return an{" "}
              <code>AngularVelocity</code>, so nothing here can mix up rotations
              a second and RPM. <code>isNear</code> is true when the two are
              within <code>tolerance</code>, and half a rotation a second is the
              flywheel&apos;s.
            </Mech>
          </div>
          <MarginNote label="Too tight, too loose">
            A tolerance smaller than the sensor&apos;s own jitter never comes
            true. One wider than the job passes before the <M k="noun" /> is
            anywhere useful. Start from where the Tuner X plot settled.
          </MarginNote>
        </Split>
        <Box
          variant="alert-warning"
          tag="NO EXACT EQUALITY"
          title="Sensors jitter"
        >
          <p>
            Never wait for{" "}
            <code>
              <Mech for="arm">position</Mech>
              <Mech for="flywheel">velocity</Mech> == target
            </code>
            .{" "}
            <Mech for="arm">
              Ask for 0.25 rotations and you read 0.2497, then 0.2503.
            </Mech>
            <Mech for="flywheel">
              Ask for 75 rotations a second and you read 74.98, then 75.03.
            </Mech>{" "}
            An exact comparison is false forever, so a step waiting on one never
            ends.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="decorate-the-hold" title="Both endings on one step">
        <p>
          <code>robot.arm.vertical()</code> is a hold. It re-sends its position
          request every loop and never finishes, which suits a held button and
          is useless in a list. One call site turns it into a step.
        </p>
        <CodeBlock
          language="java"
          title="A condition to finish on, a timeout to give up on"
          code={`import static org.wpilib.units.Units.Seconds;

Command raiseArm =
    robot.arm.vertical()
        .until(() -> robot.arm.isAtTarget())
        .named("vertical until at target")
        .withTimeout(Seconds.of(2.0));`}
        />
        <p>
          <code>vertical()</code> itself is untouched. The condition is the
          ending you want; the timeout is the ending you get when a sensor dies
          or the arm jams. It goes after <code>.named(...)</code>, because{" "}
          <code>.withTimeout(...)</code> is a method on <code>Command</code>,
          not on the builder.
        </p>
        <p>
          <code>raiseArm</code> is a <code>Command</code> like any other now, so
          it can be bound to a button or dropped into a routine. It ends itself
          either way.
        </p>
        <Box variant="concept" title="What a timeout proves">
          <p>
            That the waiting is over, and nothing else. If the next step assumes
            the arm arrived, ask <code>robot.arm.isAtTarget()</code> again
            before running it.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="one-button" title="One button, both mechanisms">
        <p>
          Raise the arm, wait for it to really arrive, then spin the flywheel
          while the arm goes on holding. That is not a list of steps. A sequence
          drives the mechanisms it names one at a time, so the arm cannot keep
          holding while the flywheel spins.
        </p>
        <p>
          The shape with two timelines is a <strong>coroutine</strong>. Its body
          is ordinary Java, read top to bottom, and it can pause partway through
          and carry on from the same line.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/opmode/MyTeleop.java"
          title="MyTeleop.java: the binding, and the body it calls"
          code={`// Y: raise the arm, then spin the flywheel once it is really there.
driver
    .y()
    .whileTrue(
        Command.noRequirements(coroutine -> spinUpWhenReady(coroutine))
            .named("Spin Up When Ready (hold)"))
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

        <p>
          Three verbs, and the middle one is this lesson&apos;s.{" "}
          <code>fork</code> starts a command and keeps reading, so the arm hold
          runs underneath everything after it. <code>waitUntil</code> stops
          until <code>isAtTarget()</code> comes back true. <code>await</code>{" "}
          runs a command and stops until it finishes.
        </p>
        <p>
          <code>MyTeleop</code> needs <code>robot</code> as a field:{" "}
          <code>private final Robot robot;</code>, assigned in the constructor.
          Import <code>org.wpilib.command3.Command</code> and{" "}
          <code>org.wpilib.command3.Coroutine</code>.
        </p>

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              <code>Command.noRequirements</code> claims no mechanism of its
              own, and does not need to: each forked command claims its own, for
              only as long as it runs. One mechanism, write a composition. Two
              that have to overlap, write a coroutine.
            </p>
          </div>
          <MarginNote label="No timeout here">
            Every wait on this page is unbounded, and that is safe only because
            a driver is holding Y and can let go. Coroutines does the same
            routine in autonomous, where nobody can, so every wait there is
            bounded.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection
        id="never-finishes"
        title="Conditions that never come true"
      >
        <p>
          A condition that cannot go true is as bad as a bare hold. The sequence
          sits on that step, nothing throws, nothing logs, and the arm keeps
          pushing. Fifteen seconds of autonomous go on step one.
        </p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Never true",
              term: "Tolerance too tight",
              body: (
                <>
                  The arm settles half a degree outside the band and stops
                  there. The plot looks fine. The routine does not move.
                </>
              ),
            },
            {
              label: "Never changes",
              term: "A dead sensor",
              body: (
                <>
                  A CANcoder off the bus reports one value forever, so{" "}
                  <code>isAtTarget()</code> gives the same answer every loop
                  whatever the arm does.
                </>
              ),
            },
            {
              label: "True too early",
              term: "Passing through",
              body: (
                <>
                  A fast mechanism crosses the target for one loop on its way
                  past. The step ends while it is still moving.
                </>
              ),
            },
          ]}
        />
        <p>
          The timeout covers the first two and cannot help with the third. For a
          mechanism that overshoots, require the reading to stay inside
          tolerance for several loops in a row. Keep that behind the same{" "}
          <code>isAtTarget()</code>, so no call site changes.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Run it in the simulator, then break it on purpose. You are done when
          you can tell the two endings apart without watching a clock.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Add <code>isAtTarget()</code> to <code>Arm</code> and{" "}
            <code>Flywheel</code>, then bind <code>raiseArm</code> to a button
            with <code>onTrue</code> in your <code>MyTeleop</code>. It is a step
            now, so it ends itself.
          </li>
          <li>Press it once and time how long the step takes to end.</li>
          <li>
            Change the arm&apos;s <code>tolerance</code> to{" "}
            <code>Degrees.of(0.001)</code> and press it again.
          </li>
          <li>
            Leave the tolerance broken, drop <code>.withTimeout(...)</code>, and
            press it once more.
          </li>
          <li>
            Put the tolerance back, add the Y binding, and hold Y. The arm goes
            up, and the flywheel starts only once the arm is there.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              The arm reaching its angle and the step ending well under two
              seconds.
            </li>
            <li>
              At <code>0.001</code>, the step running the full two seconds every
              time.
            </li>
            <li>
              With the timeout gone as well, the arm pushing until you disable.
            </li>
            <li>
              On Y, the flywheel waiting out the arm&apos;s travel, then
              spinning up with the arm still holding.
            </li>
          </ul>
        </Box>
        <p>
          Write down the tolerance you settled on and how long the step took.
          Double that time for a backstop that will not fire on a good run.
          Coroutines asks for that number.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 7,
            question:
              "Why is the Y button a coroutine instead of Command.sequence(robot.arm.vertical().until(...), robot.flywheel.runFast())?",
            options: [
              "Command.sequence cannot take more than two members",
              "A sequence owns both mechanisms for its whole run and drives one at a time, so the arm cannot keep holding while the flywheel spins",
              "Coroutines run at a higher scheduler priority",
              "isAtTarget() can only be read from inside a coroutine",
            ],
            correctAnswer: 1,
            explanation:
              "The two mechanisms have to overlap: the arm holds vertical while the flywheel spins up. A sequence runs one member at a time, so the arm's step has to end before the flywheel's can start, and the group holds both mechanisms throughout either way. In the coroutine, fork starts the arm hold and leaves it running, and each forked command claims only its own mechanism for only as long as it runs.",
          },
          {
            id: 1,
            question:
              "Why does isAtTarget() compare against a tolerance instead of checking whether the position equals the target?",
            options: [
              "Tolerance is only needed on hardware; in simulation equality works",
              "Equality is slower to compute than a subtraction",
              "A measured angle almost never lands exactly on the target, so an exact check would be false forever and the step would never end",
              "The double type has no equality operator in Java",
            ],
            correctAnswer: 2,
            explanation:
              "The encoder measures a real arm and the reading jitters. Ask for 0.25 rotations and you read 0.2497, then 0.2503. An exact comparison would almost never be true, so a step waiting on it would sit there for the rest of the match. You choose how close is close enough, in the same units as the target.",
          },
          {
            id: 2,
            question:
              "What does () -> robot.arm.isAtTarget() hand to .until(...), and why does a bare robot.arm.isAtTarget() not work in the same place?",
            options: [
              "Both work; the double colon is a style preference",
              "The method itself, so the scheduler can call it every loop. The version with parentheses runs it once and passes a frozen boolean, which does not compile",
              "A copy of the arm object, which .until then queries each loop",
              "The method reference is faster because it skips building a lambda",
            ],
            correctAnswer: 1,
            explanation:
              "() -> robot.arm.isAtTarget() hands over the question itself, not an answer, so the scheduler can ask it about fifty times a second. A bare robot.arm.isAtTarget() runs the method right there and produces one boolean, frozen at the moment the binding was built. .until takes a BooleanSupplier, so javac rejects it: boolean cannot be converted to BooleanSupplier.",
          },
          {
            id: 3,
            question:
              "robot.arm.vertical().until(() -> robot.arm.isAtTarget()) on its own will not compile. What is missing?",
            options: [
              "vertical() is a hold, and holds cannot take a finish condition",
              "The condition has to be a lambda rather than a method reference",
              ".until can only be used inside Command.sequence",
              '.until returns a builder, and .named("...") is what turns it into a Command',
            ],
            correctAnswer: 3,
            explanation:
              'Same rule as Command.sequence from Command Composition: these builders are not Commands until they are named. The compiler reports a builder type where a Command was wanted. Write .until(() -> robot.arm.isAtTarget()).named("vertical until at target").',
          },
          {
            id: 4,
            question:
              "A step ends after exactly the 2.0 seconds its .withTimeout(...) allowed. What do you know about the arm?",
            options: [
              "The command failed, so the rest of the sequence was canceled",
              "It reached its target right at 2.0 seconds",
              "Nothing. The timeout tells you the waiting is over, not where the arm is",
              "The condition was never checked, because a timeout overrides it",
            ],
            correctAnswer: 2,
            explanation:
              "Ending on the timeout means the condition was still false when time ran out. The arm may be a degree short, jammed, or reading from a dead encoder. If the next step assumes arrival, ask isAtTarget() again before running it, and log the answer so a post-match file can tell the two endings apart.",
          },
          {
            id: 5,
            question:
              "The arm settles a fraction outside tolerance, so the routine sits on that step for the rest of the match. What keeps one bad step from costing the whole autonomous period?",
            options: [
              "Keep .until(() -> robot.arm.isAtTarget()) and add .withTimeout(Seconds.of(2.0)) after the .named(...)",
              "Widen the tolerance to a quarter rotation so the check always passes",
              "Drop .until(...) and go back to a fixed one-second timeout",
              "Add a verticalAndWait() method to Arm that blocks until the arm arrives",
            ],
            correctAnswer: 0,
            explanation:
              "The condition stays as the normal ending and the timeout is the backstop, so an arm that never quite arrives costs you one step instead of the whole period. A quarter-rotation tolerance would pass while the arm was still nowhere near its angle. Do not move the waiting into the mechanism either: vertical() says what the hardware does, and how long a caller waits is the caller's business.",
          },
        ]}
      />
    </PageTemplate>
  );
}
