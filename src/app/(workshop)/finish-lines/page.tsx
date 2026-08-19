import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";

/**
 * Lesson 22. It moved out of Workshop 5 alongside Command Composition, because
 * `/autonomous` is the very next page and every step in its routine ends on a
 * `.withTimeout(...)`. Taught five lessons later, this page explained a rule
 * the student had already been made to follow without it.
 *
 * It is also the first page on the site to use `.until(...)` and the word
 * `BooleanSupplier`. `/java-basics` pre-taught both fourteen lessons early and
 * no longer does, so section one defines them where they first appear.
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
      time="About 20 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            A timeout ends a step after a fixed number of seconds and never asks
            whether anything happened. Two seconds is plenty for the arm on a
            fresh battery and short on a tired one.
          </p>
          <p>
            The arm already carries a sensor that says where it is. Compare that
            reading against the angle the step asked for, and the step can end
            on arrival rather than on the clock.
          </p>
        </div>
        <MarginNote label="Where this goes">
          Autonomous is next, and both of its steps end on timeouts. A
          drivetrain has nothing to ask yet. The arm does, so this is the page
          that writes the question.
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
          Hand it a method reference. Written as <code>arm::isAtTarget</code>,
          the condition passes the method itself, so it can be called again on
          every loop. Add the parentheses and <code>arm.isAtTarget()</code> runs
          the method on the spot, passing one frozen answer. That will not
          compile: <code>boolean cannot be converted to BooleanSupplier</code>.
        </p>
        <p>
          <code>.until(...)</code> hands back a builder rather than a{" "}
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
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Arm.java"
          title="Arm.java: the arrival check"
          code={`private static final double POSITION_TOLERANCE_ROT = 0.01;

public boolean isAtTarget() {
  double error = targetPositionRot - getPositionRot();
  return Math.abs(error) <= POSITION_TOLERANCE_ROT;
}`}
        />
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              <code>targetPositionRot</code> is the angle the last position
              request asked for. The other half of the subtraction,{" "}
              <code>getPositionRot()</code>, reads the CANcoder through the
              motor. The units are mechanism rotations, because{" "}
              <strong>Mechanisms</strong> made that encoder the feedback source.
              The tolerance is the number you pick, and a hundredth of a
              rotation is about three and a half degrees.
            </p>
          </div>
          <MarginNote label="Too tight, too loose">
            A tolerance smaller than the encoder&apos;s own jitter never comes
            true. One wider than the job passes before the arm is anywhere
            useful. Start from where the Tuner X plot settled, then widen it
            until the step ends on every run.
          </MarginNote>
        </Split>
        <Box
          variant="alert-warning"
          tag="NO EXACT EQUALITY"
          title="Sensors jitter"
        >
          <p>
            Never wait for <code>position == target</code>. Ask for 0.25
            rotations and you read 0.2497, then 0.2503. An exact comparison is
            false forever, so a step waiting on one never ends. Give the
            tolerance the same units as the target.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="decorate-the-hold" title="Both endings on one step">
        <p>
          <code>arm.vertical()</code> is a hold. It re-sends its position
          request every loop and never finishes, so it suits a held button and
          is useless as a member of a list. One call site turns it into a step.
        </p>
        <CodeBlock
          language="java"
          title="A condition to finish on, a timeout to give up on"
          code={`import static org.wpilib.units.Units.Seconds;

Command raiseArm =
    arm.vertical()
        .until(arm::isAtTarget)
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
            arm arrived, ask <code>arm.isAtTarget()</code> again before running
            it. Or log the answer, so a post-match file separates a success from
            a step that hit its timeout.
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
            arm.vertical()
                .until(arm::isAtTarget)
                .named("raise arm")
                .withTimeout(Seconds.of(2.0)),
            flywheel.runFast().withTimeout(Seconds.of(1.0)),
            flywheel.stop().withTimeout(Seconds.of(0.1)))
        .named("Score");`}
        />
        <p>
          The two flywheel members have no arrival to wait for, so their
          timeouts are the intended ending rather than a backstop. Spinning for
          one second is the instruction. <code>flywheel.stop()</code> is a hold
          too, so without a timeout on it the group never finishes either. A
          tenth of a second is long enough to send zero and release the
          mechanism. Autonomous stops its drivetrain the same way.
        </p>
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
            Add <code>isAtTarget()</code> to <code>Arm</code>, then bind{" "}
            <code>raiseArm</code> to a button with <code>onTrue</code> in your{" "}
            <code>TeleopOpMode</code>. It is a step now, so it ends itself.
          </li>
          <li>Press it once and time how long the step takes to end.</li>
          <li>
            Set <code>POSITION_TOLERANCE_ROT</code> to <code>0.0001</code> and
            press it again.
          </li>
          <li>
            Leave the tolerance broken, drop <code>.withTimeout(...)</code>, and
            press it once more.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              The arm reaching its angle and the step ending well under two
              seconds.
            </li>
            <li>
              At <code>0.0001</code>, the step running the full two seconds
              every time.
            </li>
            <li>
              With the timeout gone as well, the arm pushing until you disable.
            </li>
          </ul>
        </Box>
        <p>
          Write down the tolerance you settled on and how long the step took at
          it. That time is the floor for any timeout on this arm. Double it and
          you have a backstop that will not fire on a good run.
        </p>
      </LessonSection>

      <Quiz
        questions={[
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
              "What does arm::isAtTarget hand to .until(...), and why does arm.isAtTarget() not work in the same place?",
            options: [
              "Both work; the double colon is a style preference",
              "The method itself, so the scheduler can call it every loop. The version with parentheses runs it once and passes a frozen boolean, which does not compile",
              "A copy of the arm object, which .until then queries each loop",
              "The method reference is faster because it skips building a lambda",
            ],
            correctAnswer: 1,
            explanation:
              "arm::isAtTarget is shorthand for () -> arm.isAtTarget(), a question the scheduler can ask about fifty times a second. Writing arm.isAtTarget() runs the method right there and produces one boolean, and .until takes a BooleanSupplier, so javac rejects it: boolean cannot be converted to BooleanSupplier.",
          },
          {
            id: 3,
            question:
              "arm.vertical().until(arm::isAtTarget) on its own will not compile. What is missing?",
            options: [
              "vertical() is a hold, and holds cannot take a finish condition",
              "The condition has to be a lambda rather than a method reference",
              ".until can only be used inside Command.sequence",
              '.until hands back a builder, and .named("...") is what turns it into a Command',
            ],
            correctAnswer: 3,
            explanation:
              'Same rule as Command.sequence from Command Composition: these builders are not Commands until they are named. The compiler reports a builder type where a Command was wanted. Write .until(arm::isAtTarget).named("vertical until at target").',
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
              "Keep .until(arm::isAtTarget) and add .withTimeout(Seconds.of(2.0)) after the .named(...)",
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
              "Why is the last member of the sequence flywheel.stop().withTimeout(Seconds.of(0.1)) rather than flywheel.stop()?",
            options: [
              "The timeout is what makes stop() outrank runFast() for the mechanism",
              "Command.sequence requires a timeout on every member",
              "stop() needs 0.1 seconds to bring the wheel to a halt",
              "stop() is a hold, so without an ending it never finishes and neither does the group",
            ],
            correctAnswer: 3,
            explanation:
              "stop() is built with runRepeatedly and never ends on its own, so a group ending on it is a hold as well. A tenth of a second is long enough to send zero and release the mechanism. The step still has to be there: canceling a command does not stop a motor, because idle() sends nothing and Phoenix keeps applying the last request.",
          },
        ]}
      />
    </PageTemplate>
  );
}
