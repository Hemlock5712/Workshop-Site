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
 * step" stays shared: it is a `Command.sequence` naming both mechanisms, and
 * the point of it is the composition rather than either one.
 *
 * The old `debounce` and `audit-a-sequence` sections are gone. The one
 * load-bearing idea in the first, a condition that goes true too early, is the
 * third failure shape below. The second was a checklist of things the page had
 * already said once.
 */
export default function FinishLines() {
  return (
    <PageTemplate
      title="Finish Conditions"
      lede="Command Composition ended every step with a stopwatch, and that number was a guess. This lesson ends a step when a sensor reports the mechanism arrived. The stopwatch stays on as a backstop."
      needs={[
        <>
          <code>Command.sequence</code> and <code>.withTimeout(...)</code>, from{" "}
          <strong>Command Composition</strong>.
        </>,
        <>
          An arm position hold that keeps asking for one angle, and gains that
          reach it.
        </>,
        <>
          Lambdas and method references, from <strong>Java Basics</strong>.
        </>,
        <>
          The simulator running, from <strong>Hardware Simulation</strong>.
        </>,
      ]}
      branch="mech-4-ReadingState"
      time="15 minutes"
    >
      <MechanismSelector />

      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            A timeout ends a step after a fixed number of seconds and never asks
            whether anything happened. Two seconds is plenty for the arm on a
            fresh battery and short on a tired one.
          </p>
          <Mech for="arm" as="p">
            The arm already has a sensor that says where it is. Compare that
            reading against the angle the step asked for, and the step can end
            on arrival rather than on the clock.
          </Mech>
          <Mech for="flywheel" as="p">
            The flywheel already reports how fast it is turning. Compare that
            reading against the speed the step asked for, and the step can end
            once the wheel is up rather than on the clock.
          </Mech>
        </div>
        <MarginNote label="Where this goes">
          Coroutines is next, and every wait in it is built on the question you
          are about to write. The autonomous routine in Workshop 4 ends its
          steps on timeouts, because a drivetrain has nothing to ask yet. The
          arm does.
        </MarginNote>
      </Split>

      <LessonSection id="two-endings" title="Timeouts and conditions">
        <p>
          <code>.until(...)</code> wraps a command and ends it on the first loop
          a condition comes back true. That condition is a{" "}
          <code>BooleanSupplier</code>: any small piece of code that answers
          true or false when it is asked. The scheduler asks about fifty times a
          second.
        </p>
        <p>
          Hand it a lambda. Written as{" "}
          <code>() -&gt; robot.arm.isAtTarget()</code>, the condition is a
          question the scheduler can ask again on every loop. Drop the{" "}
          <code>() -&gt;</code> and <code>robot.arm.isAtTarget()</code> runs the
          method on the spot, passing one frozen answer. That will not compile:{" "}
          <code>boolean cannot be converted to BooleanSupplier</code>.
        </p>
        <p>
          <code>.until(...)</code> returns a builder rather than a{" "}
          <code>Command</code>, the same way <code>Command.sequence(...)</code>{" "}
          did. <code>.named(&quot;...&quot;)</code> closes it. Leave the name
          off and the build fails, because a builder is not a{" "}
          <code>Command</code>.
        </p>
      </LessonSection>

      <LessonSection id="sensor-condition" title="The arrival question">
        <p>
          The mechanism owns the comparison. Its units, its target, and its
          tolerance are already in that one file. Put the arithmetic there too,
          and every call site gets one readable question instead.
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
              <code>getPosition()</code> reads the CANcoder, and{" "}
              <code>getTargetPosition()</code> asks the request object where it
              was last told to go. Both return an <code>Angle</code> rather than
              a bare number, so nothing on this line can mix up rotations and
              degrees.
            </Mech>
            <Mech for="flywheel" as="p">
              <code>getVelocity()</code> reads the motor, and{" "}
              <code>getTargetVelocity()</code> asks the request object what
              speed it was last told to hold. Both return an{" "}
              <code>AngularVelocity</code> rather than a bare number, so nothing
              on this line can mix up rotations a second and RPM.
            </Mech>
            <p>
              <code>isNear</code> does the comparison for you. It is true when
              the two are within <code>tolerance</code> of each other, and the
              tolerance is the number you pick.{" "}
              <Mech for="arm">One degree is the arm&apos;s.</Mech>
              <Mech for="flywheel">
                Half a rotation a second is the flywheel&apos;s.
              </Mech>
            </p>
            <Mech for="arm" as="p">
              The flywheel answers the same question about speed. Same three
              methods, with <code>AngularVelocity</code> in place of{" "}
              <code>Angle</code>: <code>getVelocity()</code>,{" "}
              <code>getTargetVelocity()</code>, and a tolerance of{" "}
              <code>RotationsPerSecond.of(0.5)</code>.
            </Mech>
            <Mech for="flywheel" as="p">
              The arm answers the same question about angle. Same three methods,
              with <code>Angle</code> in place of <code>AngularVelocity</code>:{" "}
              <code>getPosition()</code>, <code>getTargetPosition()</code>, and
              a tolerance of <code>Degrees.of(1.0)</code>.
            </Mech>
          </div>
          <MarginNote label="Too tight, too loose">
            A tolerance smaller than the sensor&apos;s own jitter never comes
            true. One wider than the job passes before the <M k="noun" /> is
            anywhere useful. Start from where the Tuner X plot settled, then
            widen it until the step ends on every run.
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
            ends. <code>isNear</code> exists so you never write that comparison.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="decorate-the-hold" title="Both endings on one step">
        <p>
          <code>robot.arm.vertical()</code> is a hold. It re-sends its position
          request every loop and never finishes, so it suits a held button and
          is useless as a member of a list. One call site turns it into a step.
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
          <code>vertical()</code> itself is untouched and still reusable
          anywhere. The condition is the ending you want. The timeout is the
          ending you get when a sensor dies or the arm jams. It goes after{" "}
          <code>.named(...)</code>, since <code>.withTimeout(...)</code> is a
          method on <code>Command</code> and not on the builder.
        </p>
        <Box variant="concept" title="What a timeout proves">
          <p>
            That the waiting is over. Nothing else. If the next step assumes the
            arm arrived, ask <code>robot.arm.isAtTarget()</code> again before
            running it. Or log the answer, so a post-match file separates a
            success from a step that hit its timeout.
          </p>
        </Box>
        <p>
          A routine is those steps in order. Every member needs an ending,
          including the last one.
        </p>
        <CodeBlock
          language="java"
          title="Every member ends, so the group ends"
          code={`Command score =
    Command.sequence(
            robot.arm.vertical()
                .until(() -> robot.arm.isAtTarget())
                .named("raise arm")
                .withTimeout(Seconds.of(2.0)),
            robot.flywheel.runFast().withTimeout(Seconds.of(1.0)),
            robot.flywheel.stop().withTimeout(Seconds.of(0.1)))
        .named("Score");`}
        />
        <p>
          The two flywheel members have no arrival to wait for, so their
          timeouts are the intended ending rather than a backstop. Spinning for
          one second is the instruction. <code>robot.flywheel.stop()</code> is a
          hold too, so without a timeout on it the group never finishes either.
          A tenth of a second is long enough to send zero and release the
          mechanism. The autonomous routine in Workshop 4 stops its drivetrain
          the same way.
        </p>
        <p>
          <code>score</code> is three steps on two mechanisms, one at a time,
          and a sequence is the right shape for it. Ask for the arm to{" "}
          <em>keep holding</em> while the flywheel spins and it stops being a
          list, which is the next section.
        </p>
      </LessonSection>

      <LessonSection id="one-button" title="One button, both mechanisms">
        <p>
          Raise the arm, wait for it to really arrive, then spin the flywheel up
          while the arm goes on holding. That is not a list of steps. A sequence
          owns every mechanism it names, from its first step to its last, and
          drives them one at a time. So the arm cannot go on holding while the
          flywheel spins.
        </p>
        <p>
          The shape that does have two timelines is a <strong>coroutine</strong>
          . Its body is ordinary Java, read top to bottom, and it can pause
          partway through and carry on from the same line.
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
          runs underneath everything after it. <code>waitUntil</code> stops on
          its line until the condition comes back true, and the condition is{" "}
          <code>isAtTarget()</code>. <code>await</code> runs a command and stops
          until it finishes.
        </p>
        <p>
          Reaching <code>robot</code> from a method means <code>MyTeleop</code>{" "}
          has to keep it: <code>private final Robot robot;</code> as a field,
          assigned in the constructor. Import{" "}
          <code>org.wpilib.command3.Command</code> and{" "}
          <code>org.wpilib.command3.Coroutine</code>.
        </p>

        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              <code>Command.noRequirements</code> claims no mechanism of its
              own. It does not need to: each forked command claims its own, and
              only for as long as that command runs. So the rule is short. One
              mechanism, write a composition. Two or more that have to overlap,
              write a coroutine.
            </p>
          </div>
          <MarginNote label="No timeout here">
            Every wait on this page is unbounded, and that is safe only because
            a driver is holding Y and can let go. Coroutines is next and does
            the same routine in autonomous, where nobody can, so every wait
            there is bounded.
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
          pushing. A fifteen-second autonomous period spends all fifteen on step
          one.
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
          The timeout covers the first two. It cannot help with the third. For a
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
          Write down the tolerance you settled on and how long the step took at
          it. That time is the floor for any timeout on this arm. Double it and
          you have a backstop that will not fire on a good run. Coroutines is
          next, and that number is the one it asks you for.
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
          {
            id: 6,
            question:
              "Why is the last member of the sequence robot.flywheel.stop().withTimeout(Seconds.of(0.1)) rather than robot.flywheel.stop()?",
            options: [
              "The timeout is what makes stop() outrank runFast() for the mechanism",
              "Command.sequence requires a timeout on every member",
              "stop() needs 0.1 seconds to bring the wheel to a halt",
              "stop() is a hold, so without an ending it never finishes and neither does the group",
            ],
            correctAnswer: 3,
            explanation:
              "stop() is built with runRepeatedly and never ends on its own, so a group ending on it is a hold as well. A tenth of a second is long enough to send zero and release the mechanism. The step still has to be there: canceling a command does not stop a motor, because nothing sends a zero on the way out and Phoenix keeps applying the last request.",
          },
        ]}
      />
    </PageTemplate>
  );
}
