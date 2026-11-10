import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { MarginNote, Split } from "@/components/lesson/Prose";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/finish-conditions");

/**
 * The page for `mech-4-ReadingState`, and since November 2026 only the
 * arrival question: `getPosition()`, `getTargetPosition()` and `isAtTarget()`
 * on the arm, the velocity pair and `isAtTarget()` on the flywheel.
 *
 * Owner's call in the November 2026 review: Commands v3 composes with
 * coroutines, so Command Composition was cut and this page lost `.until(...)`,
 * `.withTimeout(...)`, the builder-versus-Command `.named` ordering, and the
 * Y-button coroutine. Waiting on `isAtTarget()` is
 * `coroutine.waitUntil(...)`, taught on `/coroutines`, and the Y button moved
 * to `mech-5-Coroutines` with it. `mech-4-ReadingState` was rebuilt the same
 * day so nothing on it calls `isAtTarget()` yet.
 *
 * That leaves no routine to run, so the check is the Tuner X plot: hold the
 * binding, read how far the mechanism settles from its target, and confirm
 * the tolerance is wider than that wiggle. The failure shapes stay here
 * because they are properties of the question, not of whatever waits on it;
 * `/coroutines` breaks the tolerance on purpose and shows the timeout.
 *
 * Written once, read twice; see `src/data/mechanisms.ts`.
 */
export default function FinishConditions() {
  return (
    <PageTemplate
      title="Finish Conditions"
      lede="A hold never finishes, so a routine cannot wait for it to end. It waits for an answer instead: has the mechanism arrived? This lesson writes that question."
      needs={[
        <>
          An arm or flywheel on Motion Magic, from{" "}
          <strong>Motion Magic in Code</strong>, with gains that reach the
          target it asks for.
        </>,
        <>
          The simulator running, from <strong>Hardware Simulation</strong>.
        </>,
      ]}
      branch="mech-4-ReadingState"
      time="8 minutes"
    >
      <MechanismSelector />

      <LessonSection id="sensor-condition" title="The arrival question">
        <p>
          The mechanism owns the comparison. Its units, its target and its
          tolerance already live in that file. Put the arithmetic there too, and
          every routine gets one readable question.
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
            Never check{" "}
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
            An exact comparison is false forever, so anything waiting on one
            waits forever.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="never-finishes" title="Questions that answer wrong">
        <p>
          A routine trusts this answer completely. Three shapes of wrong answer
          are worth knowing before you write one.
        </p>
        <Mech for="arm">
          <FigureGrid
            cols={3}
            items={[
              {
                label: "Never true",
                term: "Tolerance too tight",
                body: (
                  <>
                    The arm settles just outside the band and stays there. A
                    routine waiting on it does not move.
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
                    A fast arm crosses the target for one loop on its way past.
                    The answer is true while it is still moving.
                  </>
                ),
              },
            ]}
          />
        </Mech>
        <Mech for="flywheel">
          <FigureGrid
            cols={3}
            items={[
              {
                label: "Never true",
                term: "Tolerance too tight",
                body: (
                  <>
                    The wheel settles just outside the band and stays there. A
                    routine waiting on it does not move.
                  </>
                ),
              },
              {
                label: "Never changes",
                term: "A dead sensor",
                body: (
                  <>
                    A motor off the bus reports one speed forever, so{" "}
                    <code>isAtTarget()</code> gives the same answer every loop
                    whatever the wheel does.
                  </>
                ),
              },
              {
                label: "True too early",
                term: "Passing through",
                body: (
                  <>
                    A wheel that overshoots crosses 75 for one loop on the way
                    up. The answer is true before the speed has settled.
                  </>
                ),
              },
            ]}
          />
        </Mech>
        <p>
          The first two are why every wait in an autonomous gets a time limit,
          on the next lesson. The third is a tuning problem: fix the overshoot.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Nothing calls <code>isAtTarget()</code> yet. Coroutines is the first
          lesson to wait on it. For now, check that it builds and that the
          tolerance fits your <M k="noun" />.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Add the three methods and the <code>tolerance</code> field to{" "}
            <code>
              <M k="file" />
            </code>
            .
          </li>
          <li>
            Start <strong>Hardware Sim Robot Code</strong>, enable Teleoperated,
            and hold the <Mech for="arm">left trigger</Mech>
            <Mech for="flywheel">right trigger</Mech>.
          </li>
          <li>
            Plot the <Mech for="arm">CANcoder&apos;s position</Mech>
            <Mech for="flywheel">motor&apos;s velocity</Mech> in Tuner X once it
            has settled.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>The build finish with no errors.</li>
            <li>
              The plot settle and wiggle inside a band narrower than{" "}
              <Mech for="arm">one degree</Mech>
              <Mech for="flywheel">half a rotation a second</Mech> either side
              of the target.
            </li>
          </ul>
        </Box>
        <p>
          If it settles outside that band, the gains are the problem, not the
          tolerance. Fix them in{" "}
          <a href="/pid-control" className="underline">
            PID Tuning in Tuner X
          </a>{" "}
          rather than widening the band to match.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does isAtTarget() compare against a tolerance instead of checking whether the reading equals the target?",
            options: [
              "Tolerance is only needed on hardware; in simulation equality works",
              "A measured value almost never lands exactly on the target, so an exact check would be false forever",
              "Equality is slower to compute than a subtraction",
              "The double type has no equality operator in Java",
            ],
            correctAnswer: 1,
            explanation:
              "The sensor measures a real mechanism and the reading jitters. An arm asked for 0.25 rotations reads 0.2497, then 0.2503. An exact comparison would almost never be true, so anything waiting on it would wait for the rest of the match. You choose how close is close enough, in the same units as the target.",
          },
          {
            id: 2,
            question:
              "Why does isAtTarget() live in the mechanism's own class instead of being written out wherever a routine needs it?",
            options: [
              "Only a mechanism class is allowed to read a sensor",
              "The scheduler only checks conditions declared on a mechanism",
              "Java requires a boolean method to sit next to the field it reads",
              "The tolerance, the target and the units already live there, so every routine asks one readable question",
            ],
            correctAnswer: 3,
            explanation:
              "The mechanism knows its own target, its own units and how close counts. Every routine that waits on it calls isAtTarget() and gets the same answer, and changing the tolerance is one edit in one file.",
          },
          {
            id: 3,
            question:
              "The Tuner X plot shows the arm settling 2 degrees short of its target, with a 1 degree tolerance. What do you change?",
            options: [
              "The gains, in Tuner X. The arm is not reaching its target, and a wider band would only hide that",
              "The tolerance, to 3 degrees, so isAtTarget() comes true",
              "Nothing. isAtTarget() only matters on hardware",
              "The target, to 2 degrees lower, so the arm lands on it",
            ],
            correctAnswer: 0,
            explanation:
              "A tolerance describes how much jitter is acceptable once the arm has arrived. An arm that settles 2 degrees short has not arrived. Widening the band makes the routine move on with the arm in the wrong place.",
            only: "arm",
          },
          {
            id: 5,
            question:
              "The Tuner X plot shows the flywheel settling at 73 rotations per second against a target of 75, with a 0.5 tolerance. What do you change?",
            options: [
              "The tolerance, to 2.5 rotations per second, so isAtTarget() comes true",
              "The gains, in Tuner X. The wheel is not reaching its target, and a wider band would only hide that",
              "Nothing. isAtTarget() only matters on hardware",
              "The target, to 77, so the wheel lands on 75",
            ],
            correctAnswer: 1,
            explanation:
              "A tolerance describes how much jitter is acceptable once the wheel is up to speed. A wheel that settles 2 rotations per second slow has not arrived. Widening the band makes the routine shoot with the wheel at the wrong speed.",
            only: "flywheel",
          },
          {
            id: 4,
            question:
              "A CANcoder drops off the CAN bus. What does isAtTarget() do?",
            options: [
              "It throws, and the routine stops",
              "It returns false until the CANcoder reconnects",
              "It keeps giving the same answer every loop, whatever the arm does, because the reading stops changing",
              "It returns true, because the last request is still applied",
            ],
            only: "arm",
            correctAnswer: 2,
            explanation:
              "A sensor off the bus keeps reporting its last value. isAtTarget() compares that frozen value with the target and gets the same answer every loop. A routine waiting on it either never moves on or moves on for the wrong reason. Every wait in an autonomous gets a time limit for this reason.",
          },
          {
            id: 6,
            question:
              "The flywheel motor drops off the CAN bus. What does isAtTarget() do?",
            options: [
              "It keeps giving the same answer every loop, whatever the wheel does, because the reading stops changing",
              "It throws, and the routine stops",
              "It returns true, because the last request is still applied",
              "It returns false until the motor reconnects",
            ],
            correctAnswer: 0,
            explanation:
              "A motor off the bus keeps reporting its last speed. isAtTarget() compares that frozen value with the target and gets the same answer every loop. A routine waiting on it either never moves on or moves on for the wrong reason. Every wait in an autonomous gets a time limit for this reason.",
            only: "flywheel",
          },
        ]}
      />
    </PageTemplate>
  );
}
