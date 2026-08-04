import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

export default function FinishLines() {
  return (
    <PageTemplate
      title="End the command when the arm actually arrives"
      emphasis="actually arrives"
      lede="On Chaining Commands you gave a hold an ending with a stopwatch: run for one second, then move on. That number was a guess, because the arm had no way to say where it was."
      needs={[
        <>
          The arm from <strong>PID Control</strong> and{" "}
          <strong>Motion Magic</strong> — <code>vertical()</code> and{" "}
          <code>horizontal()</code>, with real gains and real Motion Magic
          limits in place. The arm has to be able to move before it can arrive.
        </>,
        <>
          The flywheel commands you have had since <strong>Commands</strong> —{" "}
          <code>runSlow()</code>, <code>runFast()</code>, <code>stop()</code>.
        </>,
        <>
          The Y-button routine you built on <strong>Chaining Commands</strong>.
          You are going to rewrite it.
        </>,
      ]}
      branch="5-GettersAndSetters"
      time="Roughly 30 minutes"
    >
      <KeyConceptSection
        description={[
          "PID and Motion Magic gave the arm a target. This page adds the other half — a way to read where the arm really is, compare it to where it is headed, and end the step on arrival instead of on a clock.",
        ]}
        concept="A finish line is a question the command asks every loop, not a number of seconds."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>What you&apos;ll build:</strong> three new methods on each
          mechanism, and a Y button that waits for the arm to reach vertical
          before it spins the flywheel. <strong>Roughly 30 minutes.</strong>
        </p>
        <p className="mt-3">
          <strong>Reference branch:</strong> <code>5-GettersAndSetters</code> in
          Workshop-Code — three files, about eighty lines. The branch name says
          Java accessors; the lesson is finish lines.
        </p>
      </Box>

      {/* ── the problem ──────────────────────────────────────────────── */}
      <LessonSection id="a-stopwatch-is-a-guess" title="A stopwatch is a guess">
        <p className="prose-body measure">
          Here is your Chaining Commands routine, written with the arm commands
          PID handed you. Back then the arm ran on raw voltage; now it drives to
          a position, so <code>runFast()</code> has become{" "}
          <code>vertical()</code>. The shape is the same.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — the version you have now"
          code={`driver
    .y()
    .whileTrue(
        Command.sequence(
                arm.vertical().withTimeout(Seconds.of(1.0)),
                flywheel.runFast())
            .named("Lift Then Spin (hold)"))
    .whileFalse(flywheel.stop());`}
        />

        <p className="prose-body measure">
          One second is wrong in both directions. Start the arm at horizontal
          and one second is not enough — the flywheel spins up while the arm is
          still swinging. Start it already near vertical and one second is far
          too long — the routine sits doing nothing for most of it. Change the
          gearing, the battery, or the starting angle, and the right number
          changes with them.
        </p>

        <p className="prose-body measure">
          What you want to say is &quot;move on when the arm gets there.&quot;
          For that, the arm has to answer three questions: where am I, where am
          I headed, and am I close enough?
        </p>
      </LessonSection>

      {/* ── 1. getters ───────────────────────────────────────────────── */}
      <LessonSection
        id="read-where-the-arm-is"
        title="Read where the arm is, and where it is headed"
      >
        <p className="prose-body measure">
          Two methods, both public, both added below <code>horizontal()</code>{" "}
          in <code>Arm.java</code>.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — two new methods, below horizontal()"
          code={`  /** Current measured arm angle. */
  public Angle getPosition() {
    return encoder.getPosition().getValue();
  }

  /** Angle the arm is currently driving toward. */
  public Angle getTargetPosition() {
    return positionOut.getPositionMeasure();
  }`}
        />

        <p className="prose-body measure">
          They read from two completely different places, and the difference is
          the whole point.
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <code>getPosition()</code> reads <code>encoder</code> — the CANcoder
            on CAN&nbsp;32 that has been a field at the top of this class since{" "}
            <strong>Mechanisms</strong>. It is a measurement of the physical
            arm. It is also the same sensor the motor&apos;s PID loop uses,
            because the constructor wired it in with{" "}
            <code>config.Feedback.withRemoteCANcoder(encoder)</code>. Your code
            and the motor controller are looking at one number.
          </li>
          <li>
            <code>getTargetPosition()</code> reads <code>positionOut</code> —
            the <code>MotionMagicVoltage</code> request object. That is not a
            sensor. It is the last thing your code asked for, read back.{" "}
            <code>setPosition(0.25)</code> writes 0.25 rotations into it, and{" "}
            <code>getPositionMeasure()</code> hands it back.
          </li>
        </ul>

        <Box variant="concept" title="Angle, not double">
          <p>
            Both methods return <code>Angle</code>, a WPILib unit type — the
            same family as the <code>Time</code> you met on Chaining Commands.
            An <code>Angle</code> is not a number. You cannot write{" "}
            <code>getPosition() - getTargetPosition()</code>, because Java has
            no minus operator for objects, and that is deliberate: the CANcoder
            reports rotations, your tolerance is in degrees, and a bare{" "}
            <code>double</code> would let you subtract one from the other and
            get nonsense.
          </p>
          <p className="mt-3">
            The imports at the top of <code>Arm.java</code>:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`import static org.wpilib.units.Units.Degrees;
import org.wpilib.units.measure.Angle;`}
            />
          </div>
        </Box>
      </LessonSection>

      {/* ── 2. isAtTarget ────────────────────────────────────────────── */}
      <LessonSection
        id="ask-whether-the-arm-has"
        title="Ask whether the arm has arrived"
      >
        <p className="prose-body measure">
          Add a constant with the other constants at the top of the class, a
          field next to <code>positionOut</code>, and one more method.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — the tolerance constant, the field, and the check"
          code={`  // How close counts as "at target".
  private static final double POSITION_TOLERANCE_DEGREES = 1.0;

  // ... down with the other fields, beside positionOut:

  private final Angle tolerance = Degrees.of(POSITION_TOLERANCE_DEGREES);

  // ... down with the other methods:

  /** True when the arm has reached its target angle. */
  public boolean isAtTarget() {
    return getPosition().isNear(getTargetPosition(), tolerance);
  }`}
        />

        <Box
          variant="alert-warning"
          tag="WHY A TOLERANCE"
          title="A measured angle never lands exactly on the target"
        >
          <p>
            You might expect the check to be &quot;is the position equal to the
            target.&quot; It cannot be. The CANcoder reports a real measurement
            of a real arm, down to fractions of a degree, and it jitters. Ask
            for 90.000° and successive readings look more like 89.994°, then
            90.007°, then 89.998°. An exact comparison would be false
            essentially forever, and your routine would hang.
          </p>
          <p className="mt-3">
            So you decide how close is close enough. This arm uses{" "}
            <strong>1.0 degree</strong>. That is a real engineering choice, not
            a formality — too tight and <code>isAtTarget()</code> never turns
            true, too loose and the flywheel starts while the arm is still
            visibly moving. One degree is tight enough that you cannot see the
            error and loose enough that a working arm always crosses it.
          </p>
        </Box>

        <p className="prose-body measure">
          <code>isNear(other, tolerance)</code> is true when the gap between the
          two measures is no bigger than the tolerance. It converts both sides
          to the same base unit first, so comparing a CANcoder reading in
          rotations against a tolerance in degrees works and you never write the
          360 yourself. That is what the unit types buy you.
        </p>

        <p className="prose-body measure">
          You may see this written elsewhere as{" "}
          <code>
            Math.abs(getPosition() - getTargetPosition()) &lt; TOLERANCE
          </code>
          . That is the raw-<code>double</code> version, and it does not compile
          against these methods. Use <code>isNear</code>.
        </p>
      </LessonSection>

      {/* ── 3. flywheel ──────────────────────────────────────────────── */}
      <LessonSection
        id="do-the-same-three-on"
        title="Do the same three on the flywheel"
      >
        <p className="prose-body measure">
          Same pattern, different quantity. The arm measures an angle; the
          flywheel measures a speed. So the unit type is{" "}
          <code>AngularVelocity</code> and the tolerance is in rotations per
          second.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — constant, field, and three methods"
          code={`  // How close the measured speed needs to be to count as "at target".
  private static final double VELOCITY_TOLERANCE_RPS = 0.5;

  private final AngularVelocity tolerance = RotationsPerSecond.of(VELOCITY_TOLERANCE_RPS);

  /** True when the flywheel is within tolerance of its target speed. */
  public boolean isAtTarget() {
    return getVelocity().isNear(getTargetVelocity(), tolerance);
  }

  /** Current measured flywheel speed. */
  public AngularVelocity getVelocity() {
    return leader.getVelocity().getValue();
  }

  /** Speed the flywheel is currently driving toward. */
  public AngularVelocity getTargetVelocity() {
    return velocityOut.getVelocityMeasure();
  }`}
        />

        <p className="prose-body measure">
          <code>getVelocity()</code> reads <code>leader</code>, the TalonFX on
          CAN&nbsp;21. The follower on CAN&nbsp;22 copies it, so there is one
          speed to read. Only one import is new here:
        </p>

        <CodeBlock
          language="java"
          hideControls
          code={`import org.wpilib.units.measure.AngularVelocity;`}
        />

        <p className="prose-body measure">
          The arm needed two new imports because <code>Arm.java</code> had never
          mentioned an angle unit before.{" "}
          <code>import static org.wpilib.units.Units.RotationsPerSecond;</code>{" "}
          has been at the top of <code>Flywheel.java</code> since{" "}
          <strong>Motion Magic</strong> — the private <code>setVelocity</code>{" "}
          already calls <code>RotationsPerSecond.of(rps)</code>. Check before
          you paste.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="getTargetVelocity() reads the request, not the motor"
        >
          <p>
            <code>stop()</code> is{" "}
            <code>
              runRepeatedly(leader::stopMotor).named(&quot;stop (hold)&quot;)
            </code>
            . It talks to the motor directly and never touches{" "}
            <code>velocityOut</code>. So for as long as the wheel is coasting
            down after a stop, <code>getTargetVelocity()</code> still reports
            the 75 rot/s you last asked for, and <code>isAtTarget()</code> reads
            false.
          </p>
          <p className="mt-3">
            That is correct behavior for what these methods mean — one reports
            the last request, the other reports the wheel — but it means{" "}
            <code>flywheel.isAtTarget()</code> is not a way to find out whether
            a stop has finished. It answers &quot;am I at the speed I asked
            for,&quot; and after <code>stop()</code> nobody asked for anything.
          </p>
        </Box>
      </LessonSection>

      {/* ── 4. until ─────────────────────────────────────────────────── */}
      <LessonSection
        id="spend-the-answer-with-until"
        title={
          <>
            4. Spend the answer with <code>.until(...)</code>
          </>
        }
        outlineLabel="Spend the answer with .until(...)"
      >
        <p className="prose-body measure">
          One expression turns the arm hold into a step that ends on arrival.
        </p>

        <CodeBlock
          language="java"
          title="The finish line, in three parts"
          code={`arm.vertical().until(arm::isAtTarget).named("vertical until at target")`}
        />

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <code>arm.vertical()</code> — the hold. Re-sends its position
            request every loop and never finishes on its own.
          </li>
          <li>
            <code>.until(arm::isAtTarget)</code> — the finish line. Every loop
            the scheduler calls <code>isAtTarget()</code>. The first time it
            answers true, the hold is canceled and the step ends.
          </li>
          <li>
            <code>.named(&quot;vertical until at target&quot;)</code> —
            required. More on that below.
          </li>
        </ul>

        <Box variant="concept" title="What .until(...) actually builds">
          <p>
            It builds a race. On one side is your command; on the other is a
            small watcher that does nothing but check the condition. Whichever
            finishes first ends the group and cancels the other. The watcher
            always wins, because the hold cannot finish — which is exactly why
            the hold gets canceled the instant the arm arrives.
          </p>
          <p className="mt-3">
            That is the same <code>Command.race</code> behavior from Chaining
            Commands, with the condition doing the deciding instead of a clock.
          </p>
        </Box>

        <h3
          className="display measure m-0"
          style={{ fontSize: "var(--text-title)", lineHeight: 1.15 }}
        >
          The two colons matter
        </h3>

        <p className="prose-body measure">
          <code>arm::isAtTarget</code> hands over the <em>method itself</em>, so
          the scheduler can call it again on every loop. It is a question, not
          an answer.
        </p>

        <CodeBlock
          language="java"
          title="Three spellings, two of which are the same"
          code={`// Identical. The first is shorthand for the second.
.until(arm::isAtTarget)
.until(() -> arm.isAtTarget())

// NOT the same, and it will not compile:
//   "incompatible types: boolean cannot be converted to BooleanSupplier"
// The parentheses run the method right now and hand over a frozen
// true-or-false that could never change.
.until(arm.isAtTarget())`}
        />

        <Box variant="alert-danger" tag="DON'T" title="Leaving the name off">
          <p>
            <code>.until(...)</code> hands you a builder, not a{" "}
            <code>Command</code> — the same way{" "}
            <code>Command.sequence(...)</code> does.{" "}
            <code>arm.vertical().until(arm::isAtTarget)</code> on its own is a
            build error, and the compiler will tell you{" "}
            <code>ParallelGroupBuilder</code> cannot be converted to{" "}
            <code>Command</code>.
          </p>
          <p className="mt-3">
            <code>.named(&quot;...&quot;)</code> is what finishes it. Naming
            happens once, on the builder, where the command is built.
          </p>
        </Box>
      </LessonSection>

      {/* ── 5. rebuild the routine ───────────────────────────────────── */}
      <LessonSection id="rebuild-the-y-routine" title="Rebuild the Y routine">
        <p className="prose-body measure">
          One import at the top of <code>TeleopOpMode.java</code>, if it is not
          already there from <strong>Chaining Commands</strong> — that is where
          the file first used <code>Command.sequence</code>:
        </p>

        <CodeBlock
          language="java"
          hideControls
          code={`import org.wpilib.command3.Command;`}
        />

        <p className="prose-body measure">
          Then replace the Y binding in the constructor, below the existing A
          binding.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — inside the constructor"
          code={`    // A: spin fast while held, stop when released.
    driver.a().whileTrue(flywheel.runFast()).whileFalse(flywheel.stop());

    // Y: raise the arm, wait until it really reaches the target,
    // THEN spin the flywheel fast.
    driver
        .y()
        .whileTrue(
            Command.sequence(
                    arm.vertical().until(arm::isAtTarget).named("vertical until at target"),
                    flywheel.runFast())
                .named("Spin Up When Ready (hold)"))
        .whileFalse(flywheel.stop());`}
        />

        <p className="prose-body measure">
          The A binding is shown the way your file has it after Chaining
          Commands. On the branch it is still the older{" "}
          <code>onTrue(flywheel.runFast()).onFalse(flywheel.stop())</code> pair
          — same behavior, pre-Chaining spelling. Leave yours as{" "}
          <code>whileTrue</code>/<code>whileFalse</code>.
        </p>

        <p className="prose-body measure">
          Everything else about the shape is unchanged from Chaining Commands.
          The last step is still <code>flywheel.runFast()</code>, still a hold,
          so the whole group is still a hold — which is why it is still bound
          with <code>whileTrue</code> and still paired with{" "}
          <code>whileFalse(flywheel.stop())</code>. One step changed its finish
          line. Nothing else moved.
        </p>
      </LessonSection>

      {/* ── 6. seatbelt ──────────────────────────────────────────────── */}
      <LessonSection
        id="keep-the-timeout-as-a"
        title="Keep the timeout as a seatbelt"
      >
        <p className="prose-body measure">
          A condition is better than a clock, and it has one failure mode a
          clock does not: if the arm never gets within tolerance, the step never
          ends. In teleop that is a button that seems dead, and you let go. In
          autonomous nobody is holding a button, and you have fifteen seconds
          for the whole routine. One stuck step eats all of them.
        </p>

        <p className="prose-body measure">
          So keep both. The condition is how the step normally ends; the timeout
          is how it ends when something is wrong.
        </p>

        <CodeBlock
          language="java"
          title="Arrive, or give up after three seconds"
          code={`arm.vertical()
    .until(arm::isAtTarget)
    .named("vertical until at target")
    .withTimeout(Seconds.of(3.0))`}
        />

        <Box
          variant="alert-info"
          tag="NOTE · ORDER"
          title="Name it, then time it"
        >
          <p>
            <code>.named(...)</code> comes before <code>.withTimeout(...)</code>
            , and swapping them will not compile. <code>.until(...)</code> gives
            you a builder; <code>.named(...)</code> turns the builder into a{" "}
            <code>Command</code>; <code>.withTimeout(...)</code> is a method on{" "}
            <code>Command</code>. Each step needs the thing before it.
          </p>
          <p className="mt-3">
            <code>Seconds.of(3.0)</code> needs the static import you added on
            Chaining Commands:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`import static org.wpilib.units.Units.Seconds;`}
            />
          </div>
        </Box>

        <p className="prose-body measure">
          The branch says the same thing in its own comment on this binding: add
          the timeout in an auto, &quot;if the arm never quite arrives, the
          routine moves on instead of getting stuck for the rest of the
          period.&quot;
        </p>
      </LessonSection>

      {/* ── the team rule ────────────────────────────────────────────── */}
      <LessonSection
        id="the-rule-waiting-is-spelled-at"
        title="The rule: waiting is spelled at the call site"
      >
        <p className="prose-body measure">
          Once <code>isAtTarget()</code> exists, someone always proposes putting
          the waiting inside the mechanism — a <code>verticalAndWait()</code>{" "}
          method on <code>Arm</code> that goes to vertical and finishes when it
          gets there. It reads nicely at the call site. Do not add it.
        </p>

        <Box
          variant="alert-danger"
          tag="TEAM RULE"
          title="No ...AndWait() methods on a mechanism"
        >
          <p>
            A mechanism command says what the hardware does.{" "}
            <code>vertical()</code> means &quot;go to vertical and hold
            there.&quot; How long a particular caller is willing to wait for
            that is the caller&apos;s business, and it differs — teleop wants to
            wait indefinitely, an auto wants to give up after three seconds, and
            a driver-assist routine might not wait at all.
          </p>
          <p className="mt-3">
            Add <code>verticalAndWait()</code> and you have committed{" "}
            <code>Arm</code> to one answer for all three. Then you need{" "}
            <code>horizontalAndWait()</code>, and a timeout variant of each, and
            the class grows a method for every combination anyone ever wanted.
          </p>
          <p className="mt-3">
            <code>.until(arm::isAtTarget)</code> is four extra words at the one
            place that knows what it needs. The branch puts it plainly:{" "}
            <em>
              don&apos;t go add a special &quot;AndWait&quot; method to the
              subsystem.
            </em>
          </p>
        </Box>
      </LessonSection>

      {/* ── the whole file ───────────────────────────────────────────── */}
      <LessonSection
        id="the-finished-arm-java"
        title={
          <>
            The finished <code>Arm.java</code>
          </>
        }
        outlineLabel="The finished Arm.java"
      >
        <p className="prose-body measure">
          Everything from this page in one file, live from the branch. Read the
          class comment at the top and the block above <code>vertical()</code> —
          both spell out the rule this page is built on.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="5-GettersAndSetters"
          filePath="src/main/java/frc/robot/subsystems/Arm.java"
        />

        <Box
          variant="alert-warning"
          tag="HEADS UP · GAINS"
          title="The gains on this branch are still zeros"
        >
          <p>
            <code>kG</code>, <code>kS</code>, <code>kP</code> and{" "}
            <code>kD</code> all ship as <code>0.0 // NEEDS TUNING</code>, and{" "}
            <code>MOTION_MAGIC_CRUISE_VELOCITY</code> and{" "}
            <code>MOTION_MAGIC_ACCELERATION</code> ship as{" "}
            <code>0.0 // NEEDS SETTING</code>. Those are placeholders, not
            settings. An arm with those numbers does not move, so{" "}
            <code>isAtTarget()</code> never turns true and the routine on this
            page never gets past step one.
          </p>
          <p className="mt-3">
            If you skipped ahead, go back to <strong>PID Control</strong> and{" "}
            <strong>Motion Magic</strong> and tune your own before you test
            anything here.
          </p>
        </Box>
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            Build the project. It should compile clean. If it does not, skip to
            the compile failures below — there are exactly two shapes.
          </li>
          <li>
            Start the simulator and click Enable, the same way{" "}
            <strong>Running Your Code</strong> showed you. Move the arm by hand
            to somewhere near horizontal first, so it has a distance to travel.
          </li>
          <li>
            Hold Y. <strong>You should see:</strong> the arm swings toward
            vertical while the flywheel stays completely still. The moment the
            arm settles, the flywheel starts.
          </li>
          <li>
            Release Y, move the arm by hand to a <em>different</em> starting
            angle, and hold Y again. <strong>You should see:</strong> the
            handoff happens at a different moment than last time. That is the
            difference from the timeout version, which started the flywheel at
            exactly one second every single run regardless of where the arm was.
          </li>
          <li>
            Keep holding Y. <strong>You should see:</strong> the flywheel keeps
            spinning and never stops by itself. Correct — the last step is a
            hold, so the group is a hold.
          </li>
          <li>
            Release Y. <strong>You should see:</strong> the flywheel stops,
            because <code>whileFalse(flywheel.stop())</code> takes over.
          </li>
          <li>
            <strong>Now break it on purpose.</strong> Change{" "}
            <code>POSITION_TOLERANCE_DEGREES</code> to <code>0.01</code> and
            redeploy. Hold Y. <strong>You should see:</strong> the arm arrives
            and sits at vertical, and the flywheel never starts. The step is
            waiting for a hundredth of a degree, which the arm and the CANcoder
            cannot hold. This is what a stuck condition looks like — no error,
            no log line, a routine that sits there.
          </li>
          <li>
            <strong>Now prove the seatbelt.</strong> Leave the tolerance at{" "}
            <code>0.01</code> and add <code>.withTimeout(Seconds.of(3.0))</code>{" "}
            after the <code>.named(...)</code>. Hold Y.{" "}
            <strong>You should see:</strong> the flywheel starts three seconds
            in. The routine gave up on the condition and moved on. Put the
            tolerance back to <code>1.0</code> and keep the timeout.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Three things that go wrong here"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>
                Y does nothing, and the flywheel never starts — but the arm does
                not move either.
              </strong>{" "}
              The finish line is fine; the arm cannot reach it. Check{" "}
              <code>MOTION_MAGIC_CRUISE_VELOCITY</code>,{" "}
              <code>MOTION_MAGIC_ACCELERATION</code> and the four gains. If any
              of them are still <code>0.0</code>, the motor has no correction
              strength and no speed to ramp to, and the arm stays exactly where
              it is forever. Fix the tuning, not the condition.
            </li>
            <li>
              <strong>
                The flywheel starts the instant you press Y, with no arm
                movement at all.
              </strong>{" "}
              <code>isAtTarget()</code> was already true. The arm is parked
              within 1° of vertical, so the finish line was crossed before the
              step began, and the sequence went straight to step two. Move the
              arm somewhere else by hand and press Y again. Nothing is broken.
            </li>
            <li>
              <strong>It will not compile, pointing at your Y binding.</strong>{" "}
              Two shapes cause this and the compiler names both.{" "}
              <em>
                &quot;ParallelGroupBuilder cannot be converted to Command&quot;
              </em>{" "}
              means you left the <code>.named(&quot;...&quot;)</code> off the{" "}
              <code>.until(...)</code>.{" "}
              <em>
                &quot;boolean cannot be converted to BooleanSupplier&quot;
              </em>{" "}
              means you wrote <code>arm.isAtTarget()</code> with parentheses —
              drop them and use <code>arm::isAtTarget</code>.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── what's next ──────────────────────────────────────────────── */}
      <LessonSection
        id="where-this-shows-up-again"
        title="Where this shows up again"
      >
        <p className="prose-body measure">
          Every mechanism you build from here gets the same three methods: a
          reading, a target, and an <code>isAtTarget()</code> that compares them
          with a tolerance. On <strong>State Machines</strong> the flywheel
          version does the deciding — <code>.until(flywheel::isAtTarget)</code>{" "}
          is what tells the robot it is safe to leave the spin-up state.
        </p>

        <p className="prose-body measure">
          Read the branch&apos;s <code>TeleopOpMode.java</code> next. It is the
          answer key for step 5, and its comments explain the same routine in
          the branch author&apos;s words.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/blob/5-GettersAndSetters/src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          title="TeleopOpMode.java on 5-GettersAndSetters"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does isAtTarget() compare with a tolerance instead of checking whether the position equals the target?",
            options: [
              "Equality is slower to compute than isNear",
              "A measured angle almost never lands exactly on the target, so an exact check would be false forever and the routine would hang",
              "The Angle type has no equals method",
              "Tolerance is only needed on hardware; in simulation equality works",
            ],
            correctAnswer: 1,
            explanation:
              "The CANcoder measures a real arm and the reading jitters — ask for 90.000° and you get 89.994°, then 90.007°. An exact comparison would essentially never be true, so the step would never end. You pick how close is close enough; this arm uses 1.0 degree.",
          },
          {
            id: 2,
            question:
              "What does arm::isAtTarget hand to .until(...), and why does arm.isAtTarget() not work there?",
            options: [
              "Both work; the double colon is a style preference",
              "The method itself, so the scheduler can call it every loop — the parenthesised version runs it once and hands over a frozen boolean, which does not even compile",
              "A copy of the arm object, which .until then queries",
              "The method reference is faster because it skips the lambda",
            ],
            correctAnswer: 1,
            explanation:
              "arm::isAtTarget is shorthand for () -> arm.isAtTarget() — a question the scheduler asks every loop. arm.isAtTarget() with parentheses runs the method right there and produces a boolean, and .until wants a BooleanSupplier, so the compiler rejects it: “boolean cannot be converted to BooleanSupplier.”",
          },
          {
            id: 3,
            question:
              "arm.vertical().until(arm::isAtTarget) on its own is a build error. Why?",
            options: [
              ".until can only be used inside Command.sequence",
              ".until returns a ParallelGroupBuilder, not a Command — .named(“…”) is what turns it into one",
              "vertical() is a hold and holds cannot take a finish line",
              "The condition has to be a lambda, not a method reference",
            ],
            correctAnswer: 1,
            explanation:
              "Same rule as Command.sequence from Chaining Commands: these builders are not Commands until they are named. The compiler says “ParallelGroupBuilder cannot be converted to Command.” The branch writes .until(arm::isAtTarget).named(“vertical until at target”).",
          },
          {
            id: 4,
            question:
              "getTargetPosition() returns positionOut.getPositionMeasure(). What is it telling you?",
            options: [
              "Where the arm physically is right now",
              "The last position your code asked the motor for, read back off the control request — not a sensor reading",
              "The position the arm was in when the robot booted",
              "An average of the last few CANcoder readings",
            ],
            correctAnswer: 1,
            explanation:
              "positionOut is the MotionMagicVoltage request object. setPosition(0.25) writes into it and getPositionMeasure() reads it back. The measurement comes from the other getter, getPosition(), which reads the CANcoder. isAtTarget() is what compares the two.",
          },
          {
            id: 5,
            question:
              "Your auto routine hangs because the arm stops a fraction outside tolerance. Which fix matches the team rule?",
            options: [
              "Add a verticalAndWait() method to Arm that blocks until the arm arrives",
              "Keep .until(arm::isAtTarget) and add .withTimeout(Seconds.of(3.0)) after the .named(...)",
              "Widen the tolerance to 45 degrees so the check always passes",
              "Drop .until(...) and go back to a fixed one-second timeout",
            ],
            correctAnswer: 1,
            explanation:
              "The condition stays as the normal ending and the timeout is the seatbelt — if the arm never quite arrives, the routine moves on instead of burning the rest of the period. Never move the waiting into the mechanism: vertical() says what the hardware does, and how long a caller waits is the caller's business. No ...AndWait() methods.",
          },
        ]}
      />
    </PageTemplate>
  );
}
