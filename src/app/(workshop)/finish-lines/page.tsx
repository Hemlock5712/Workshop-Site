import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import { MarginNote, Split } from "@/components/lesson/Prose";

export default function FinishLines() {
  return (
    <PageTemplate
      title="A sequence can continue only when the current step can finish"
      emphasis="can finish"
      lede="Most mechanism commands are holds: they keep refreshing a request and never end on their own. Advanced routines work only when each step has an explicit, testable finish condition."
      needs={[
        <>Classic mechanism commands from Workshop 2.</>,
        <>
          A composed sequence from <strong>More Complex Commands</strong>.
        </>,
        <>At least one sensor value the mechanism can read.</>,
      ]}
      time="About 25 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "A hold describes what should remain true while it runs. A step also answers when the routine may move on.",
            "Put the finish condition at the call site when it belongs to one routine. Put it in a command class when it is part of that command's identity everywhere it is used.",
          ]}
          concept="Every command inside a sequence needs one honest finish line and, for physical motion, one defensive timeout."
        />
        <MarginNote label="THE FAILURE">
          If step one is a bare hold, step two is not late. It is unreachable.
          The scheduler is correctly waiting for a command that promised it
          would keep running.
        </MarginNote>
      </Split>

      <LessonSection
        id="four-finish-lines"
        title="Choose the finish line that matches the job"
      >
        <FigureGrid
          cols={2}
          items={[
            {
              label: "Elapsed time",
              term: "withTimeout",
              body: "Useful as a safety ceiling or for a deliberately timed action. It is weak evidence that a mechanism arrived.",
            },
            {
              label: "Sensor condition",
              term: "until",
              body: "Ends when a Boolean condition becomes true, such as position error entering tolerance or a beam break seeing a game piece.",
            },
            {
              label: "Command-owned",
              term: "isFinished",
              body: "Best when completion is intrinsic to the command everywhere it runs, such as a path whose profile reaches its end.",
            },
            {
              label: "Operator release",
              term: "Trigger cancellation",
              body: "Correct for manual holds in teleop, but not a finish line an autonomous sequence can wait on.",
            },
          ]}
        />
      </LessonSection>

      <LessonSection
        id="sensor-condition"
        title="Turn a sensor reading into one named condition"
      >
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Arm.java"
          title="Arm.java — the mechanism owns the measurement"
          code={`private static final double POSITION_TOLERANCE_ROT = 0.01;

public boolean isAtTarget() {
  double error = targetPositionRot - getPositionRot();
  return Math.abs(error) <= POSITION_TOLERANCE_ROT;
}`}
        />
        <p>
          The OpMode or routine should not reach into the motor controller and
          repeat this arithmetic. The mechanism owns its sensor units, target,
          and tolerance, so it offers one readable question:
          <code>arm.isAtTarget()</code>.
        </p>
        <Box
          variant="alert-warning"
          tag="NO EXACT EQUALITY"
          title="Sensors do not land on one perfect number"
        >
          <p>
            Never wait for <code>position == target</code>. Noise, quantization,
            and control error make exact equality unreliable. Define a tolerance
            in the same mechanism units used by the target.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="decorate-the-hold"
        title="Give a hold a local finish line"
      >
        <CodeBlock
          language="java"
          title="The condition says success; the timeout says stop waiting"
          code={`Command raiseArm =
    arm.vertical()
        .until(arm::isAtTarget)
        .withTimeout(Seconds.of(2.0));`}
        />
        <p>
          <code>arm.vertical()</code> remains a reusable hold. This call site
          turns it into a finite step for one routine. The sensor condition is
          the intended finish; the timeout prevents a disconnected sensor or
          jammed arm from blocking the sequence forever.
        </p>
        <Box
          variant="concept"
          title="Timeout is a seatbelt, not a success signal"
        >
          <p>
            After the command ends, check whether <code>isAtTarget()</code> is
            true before performing an action that assumes the arm arrived. A
            timeout means the wait ended, not that the move succeeded.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="debounce"
        title="Require stability when one sample is not enough"
      >
        <p>
          Fast mechanisms can cross the tolerance for one loop and leave again.
          For a flywheel, shooter angle, or final drive pose, finish only after
          the measurement remains inside tolerance for several consecutive
          samples or a short duration. Keep that stability logic behind a named
          mechanism method such as <code>isReadyToShoot()</code>.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>Position may need error and velocity tolerances together.</li>
          <li>Velocity may need a minimum time inside the acceptable band.</li>
          <li>
            Vision alignment may need a recent target and a heading tolerance.
          </li>
          <li>
            A digital sensor may need debouncing to reject contact bounce.
          </li>
        </ul>
      </LessonSection>

      <LessonSection
        id="audit-a-sequence"
        title="Audit every sequence from left to right"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>Name what makes the current step finish.</li>
          <li>
            Name what happens to the actuator when the step ends or is canceled.
          </li>
          <li>Add a defensive timeout for physical motion.</li>
          <li>
            Decide whether a timeout should continue, branch to recovery, or
            abort the routine.
          </li>
          <li>
            Log the finish reason so a post-match file distinguishes success
            from timeout.
          </li>
        </ol>
        <p>
          With those answers explicit, the same finite steps can be used by the
          coroutine and state-machine patterns in the next lessons.
        </p>
      </LessonSection>
    </PageTemplate>
  );
}
