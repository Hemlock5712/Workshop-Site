import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import CollapsibleSection from "@/components/CollapsibleSection";
import GitHubContent from "@/components/GitHubContent";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import DocumentationButton from "@/components/DocumentationButton";
import { Book, GitBranch, GitPullRequest } from "lucide-react";

export default function StateMachines() {
  return (
    <PageTemplate
      title="One robot, one state at a time"
      emphasis="one state at a time"
      lede="Every button binding you have written so far holds its own preset. Hold A and the flywheel spins. Let go and it stops. Nothing in the code knows what the robot is doing overall — there is only a pile of bindings, and whichever one you pressed last wins."
      needs={[
        <>
          The arm and flywheel from <strong>Finish Lines</strong> onward —{" "}
          <code>arm.vertical()</code>, <code>arm.horizontal()</code>,{" "}
          <code>flywheel.runFast()</code>, <code>flywheel.stop()</code> and{" "}
          <code>flywheel.isAtTarget()</code>.
        </>,
        <>
          The <code>7-StateBased</code> branch. It is <em>one commit</em> past{" "}
          <code>6-Coroutines</code>, the branch you used last page, so you are
          staying on the same track — no re-clone. That commit touches exactly
          one file: <code>opmodes/TeleopOpMode.java</code>.
        </>,
        <>
          The simulator, from <strong>Running Your Code</strong>, and a
          controller on port 0.
        </>,
      ]}
      branch="7-StateBased"
      time="About 30 minutes"
    >
      <KeyConceptSection
        description={[
          "This page rebuilds the same arm-and-flywheel teleop a different way. The robot is always in exactly one named state — stowed, pickup, spin-up, or ready — and the buttons move it between states. The machine cancels the old state's command and starts the new one for you. A jump you never declared cannot happen.",
        ]}
        concept="A state is one Command that runs the whole time the machine sits in that state. A transition is a condition that cancels that command and moves to the next state."
      />

      <Box
        variant="alert-tip"
        tag="ADVANCED"
        title="You can build a full robot without this page"
      >
        <p>
          Holds, button bindings and chaining cover everything else in this
          workshop. Reach for a <code>StateMachine</code> when button-per-preset
          stops being enough: a routine that has to repeat, skip, or recover by
          jumping back a phase, or a superstructure where certain combinations
          must be impossible rather than merely unlikely.
        </p>
        <p className="mt-3">
          It is also the smallest of the three dialects to learn. There is one
          new class, four setup steps, and two kinds of transition.
        </p>
      </Box>

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>What you&apos;ll build:</strong> the same teleop, rebuilt as a
          four-state machine — with the two shooting states separated so the
          robot can tell &quot;spinning up&quot; apart from &quot;ready to
          shoot.&quot; <strong>About 30 minutes.</strong>
        </p>
      </Box>

      <Box
        variant="alert-info"
        tag="OFFICIAL · WPILIB 2027 ALPHA-6"
        title="StateMachine is a shipped WPILib class"
      >
        This is not a pattern the team invented. It is{" "}
        <code>org.wpilib.command3.StateMachine</code>, merged into WPILib on 8
        May 2026 and released in the 2027 alpha-6 build the same day. Everything
        on this page is checked against that source. Alpha APIs can still shift
        before the 2027 kickoff release.
      </Box>

      {/* ── what changes ─────────────────────────────────────────────── */}
      <LessonSection id="what-you-are-replacing" title="What you are replacing">
        <p className="prose-body measure">
          Here is the constructor you have now, on <code>6-Coroutines</code>.
          Four bindings, each one independent of the others.
        </p>

        <CodeBlock
          language="java"
          title="6-Coroutines — TeleopOpMode.java, the bindings you have now"
          code={`driver.leftTrigger().onTrue(arm.vertical());

driver.rightTrigger().onTrue(flywheel.runFast()).onFalse(flywheel.runSlow());

driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());

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
          Nothing here is wrong. But nothing here knows the difference between
          &quot;the arm is up because we are shooting&quot; and &quot;the arm is
          up because someone leaned on the left trigger.&quot; Press the left
          trigger halfway through the Y routine and two commands want the arm;
          the new one takes it, which cancels the whole Y group — flywheel step
          included. The flywheel does not stop, because canceling a command does
          not zero the last request. You are left with a spinning wheel that no
          command owns and no name for what the robot is doing.
        </p>

        <p className="prose-body measure">
          The whole constructor gets replaced by the machine below.
        </p>
      </LessonSection>

      {/* ── Command.parallel ─────────────────────────────────────────── */}
      <LessonSection
        id="first-the-operator-this-needs-command"
        title={
          <>
            First, the operator this needs: <code>Command.parallel</code>
          </>
        }
        outlineLabel="First, the operator this needs: Command.parallel"
      >
        <p className="prose-body measure">
          A state has to pose the <em>whole</em> robot, not one mechanism. If a
          state only said &quot;arm vertical,&quot; the flywheel would be
          wherever the last binding left it, and you would be back to guessing.
          So each state runs one command that commands both mechanisms at once.
        </p>

        <CodeBlock
          language="java"
          title="Two holds, one command"
          code={`Command.parallel(arm.vertical(), flywheel.stop()).named("Stowed (hold)")`}
        />

        <p className="prose-body measure">
          <code>Command.parallel(a, b)</code> starts every member at once and
          finishes when <strong>all</strong> of them have finished. That is the
          opposite of <code>Command.race</code> from{" "}
          <strong>Chaining Commands</strong>, which finishes as soon as{" "}
          <em>any</em> one member does and cancels the rest.
        </p>

        <Box
          variant="concept"
          title="A parallel group of holds is itself a hold"
        >
          <p>
            <code>arm.vertical()</code> and <code>flywheel.stop()</code> are
            both holds, so neither ever finishes, so the group never finishes
            either. That sounds like THE ONE RULE being broken — and it would
            be, inside a <code>Command.sequence</code>. Here it is exactly what
            you want. A state machine never <em>waits</em> for a state&apos;s
            command; it cancels it the moment a transition fires.
          </p>
          <p className="mt-3">
            The group also inherits its members&apos; requirements, so this one
            command owns both the arm and the flywheel. That is why nothing else
            can be quietly driving the flywheel while the machine thinks the
            robot is stowed.
          </p>
        </Box>

        <p className="prose-body measure">
          Like <code>sequence</code> and <code>race</code>,{" "}
          <code>Command.parallel(...)</code> hands you a builder rather than a
          finished command, so it needs the same{" "}
          <code>.named(&quot;...&quot;)</code> terminal. And because these
          groups are holds, they keep the <code>(hold)</code> suffix in the
          name.
        </p>

        {/* TODO(verify): ParallelGroupBuilder.optional(Command...) exists in the
            alpha-6 source, but no file in Workshop-Code or 2027-Template calls
            it. Named here only; do not build a worked example on it until a
            reference implementation exists. */}
        <p className="prose-body-sm measure">
          There is a third form worth knowing the name of:{" "}
          <code>ParallelGroupBuilder.optional(...)</code> marks some members as
          not required, so they get canceled once the required members finish —
          the general shape of a deadline with any number of members. No file in
          the workshop code or the robot template uses it, so there is no worked
          example here to copy.
        </p>
      </LessonSection>

      {/* ── build it ─────────────────────────────────────────────────── */}
      <LessonSection
        id="build-it-four-steps-in-one"
        title="Build it: four steps in one constructor"
      >
        <p className="prose-body measure">
          Four steps, in this order, replacing the four bindings above — the
          same four the branch numbers in its own comments. Check the imports at
          the top of the file first — <code>StateMachine</code>,{" "}
          <code>State</code>, <code>Scheduler</code> and{" "}
          <code>DataLogManager</code> are new since last lesson:
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`import org.wpilib.command3.Command;
import org.wpilib.command3.Scheduler;
import org.wpilib.command3.StateMachine;
import org.wpilib.command3.StateMachine.State;
import org.wpilib.system.DataLogManager;`}
        />

        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--fg)", fontFamily: "var(--font-serif)" }}
        >
          1. Build the machine
        </h3>

        <CodeBlock
          language="java"
          hideControls
          code={`// 1. Build the machine. The name is required and shows up in telemetry.
StateMachine sm = new StateMachine("Superstructure");`}
        />

        <p className="prose-body measure">
          <strong>Result:</strong> nothing yet, and the project will not build
          until step 3. That is deliberate — see step 3.
        </p>

        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--fg)", fontFamily: "var(--font-serif)" }}
        >
          2. Add the states
        </h3>

        <CodeBlock
          language="java"
          hideControls
          code={`// 2. Add states. Each state owns one command. parallel(...) turns two commands into one, so
//    each state poses the whole robot. The poses are holds that never finish - that is fine,
//    because the machine cancels the old state's command when it switches. SpinUp is the
//    exception: .until(...) gives its command an ending, so it can use whenComplete() below.
State stowed =
    sm.addState(Command.parallel(arm.vertical(), flywheel.stop()).named("Stowed (hold)"));
State pickup =
    sm.addState(Command.parallel(arm.horizontal(), flywheel.stop()).named("Pickup (hold)"));
State spinUp =
    sm.addState(
        Command.parallel(arm.vertical(), flywheel.runFast())
            .until(flywheel::isAtTarget)
            .named("SpinUp until at speed"));
State ready =
    sm.addState(
        Command.parallel(arm.vertical(), flywheel.runFast()).named("ReadyToShoot (hold)"));`}
        />

        <p className="prose-body measure">
          <strong>Result:</strong> four <code>State</code> variables and still
          no behavior. <code>addState(...)</code> hands back the state it
          created; you need that variable to hang transitions off in step 4.
        </p>

        <Box
          variant="concept"
          title="Why SpinUp and ReadyToShoot run the same pose"
        >
          <p>
            Look closely: <code>spinUp</code> and <code>ready</code> command the
            arm and flywheel identically. The difference is that{" "}
            <code>spinUp</code> ends and <code>ready</code> does not.{" "}
            <code>.until(flywheel::isAtTarget)</code> gives the parallel group
            an end condition — when the flywheel reaches its target speed, the
            group exits early instead of waiting for two holds that will never
            finish.
          </p>
          <p className="mt-3">
            Splitting them buys you a name for the moment the shot becomes
            legal. Drivers, LEDs and autonomous routines can all ask &quot;are
            we in ReadyToShoot?&quot; instead of re-deriving it from a speed
            reading.
          </p>
        </Box>

        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--fg)", fontFamily: "var(--font-serif)" }}
        >
          3. Pick the starting state
        </h3>

        <CodeBlock
          language="java"
          hideControls
          code={`// 3. Every machine needs a starting state. Forget this and the build fails.
sm.setInitialState(stowed);`}
        />

        <p className="prose-body measure">
          <strong>Result:</strong> the project compiles again. Delete this line
          and <code>gradlew build</code> fails. The WPILib compiler plugin
          refuses to let a state machine exist without one, the same way it
          refuses an unnamed command. There is a runtime backstop too — a
          machine that somehow reaches the scheduler without an initial state
          throws <code>IllegalStateException</code> when it starts — but you
          will hit the compiler first.
        </p>

        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--fg)", fontFamily: "var(--font-serif)" }}
        >
          4. Wire the transitions
        </h3>

        <CodeBlock
          language="java"
          hideControls
          code={`// 4. Wire the transitions. Each condition is checked every loop while its state is active,
//    and fires the moment it flips from false to true.
stowed.switchTo(pickup).when(driver.leftTrigger()); // driver asks to intake
pickup.switchTo(stowed).when(driver.leftTrigger().negate()); // trigger released - pack up

stowed.switchTo(spinUp).when(driver.rightTrigger()); // driver asks to shoot

// SpinUp's command ends on its own, so this uses whenComplete(): it fires once, when the
// command finishes. Ready runs the same pose as SpinUp - it exists so drivers, LEDs, and
// autos can tell "spinning up" apart from "ready to shoot".
spinUp.switchTo(ready).whenComplete();

// Releasing the right trigger backs out of either shooting state.
sm.switchFromAny(spinUp, ready).to(stowed).when(driver.rightTrigger().negate());

// B is the escape hatch: back to stowed from ANY state.
// switchFromAny() with no args covers every state added so far, so declare it last.
sm.switchFromAny().to(stowed).when(driver.b());`}
        />

        <p className="prose-body measure">
          <strong>Result:</strong> a graph. Read the arrows and you have the
          whole behavior of the robot on one screen — which is the real payoff.
          Notice what is <em>absent</em>: there is no arrow from{" "}
          <code>pickup</code> to <code>spinUp</code>. You cannot start a shot
          with the arm down, because nobody wrote that transition.
        </p>

        <p className="prose-body measure">
          That is the end of the branch&apos;s numbered comments. Two more
          pieces of the file are worth walking through on their own.
        </p>
      </LessonSection>

      {/* ── hand it to the scheduler ─────────────────────────────────── */}
      <LessonSection
        id="hand-the-machine-to-the-scheduler"
        title="Hand the machine to the scheduler"
      >
        <p className="prose-body measure">
          This part lives outside the numbered sequence, because it is spread
          across three places in the file: one new field, the last line of the
          constructor, and two overrides.
        </p>

        <CodeBlock
          language="java"
          title="Three places in TeleopOpMode.java"
          hideControls
          code={`// Field on the OpMode - this one is new:
private final Command machine;
// (the driver field is already there from last lesson, unchanged)

// Last line of the constructor:
machine = sm; // a StateMachine is just a Command - schedule it like any other

// Two overrides, below the constructor:
@Override
public void start() {
  Scheduler.getDefault().schedule(machine);
}

@Override
public void end() {
  Scheduler.getDefault().cancel(machine);
}`}
        />

        <p className="prose-body measure">
          <code>StateMachine</code> implements <code>Command</code>, so{" "}
          <code>machine = sm;</code> is not a conversion — it is only storing
          it. Building a command does nothing on its own; the scheduler has to
          be handed it. Same shape as the coroutine OpMode last page: build in
          the constructor, <code>schedule</code> in <code>start()</code>,{" "}
          <code>cancel</code> in <code>end()</code>.
        </p>

        <p className="prose-body measure">
          The machine itself claims no mechanisms — its <em>states&apos;</em>{" "}
          commands do. That is why a machine over the arm and flywheel can run
          at the same time as a drivetrain command: nothing they own overlaps.
        </p>
      </LessonSection>

      {/* ── logging ──────────────────────────────────────────────────── */}
      <LessonSection
        id="see-the-state-changes-onenter-and"
        title={
          <>
            See the state changes: <code>onEnter</code> and <code>onExit</code>
          </>
        }
        outlineLabel="See the state changes: onEnter and onExit"
      >
        <p className="prose-body measure">
          A machine that works and a machine that is stuck look identical from
          the driver seat. Every state can register callbacks that run on the
          way in and on the way out, without touching the state&apos;s command.
          The branch uses them to write markers into the log.
        </p>

        <CodeBlock
          language="java"
          hideControls
          code={`// onEnter/onExit run small extras on the way in and out of a state, without touching the
// state's command. These two write markers into the log, so you can see exactly when the
// machine entered and left ReadyToShoot.
ready.onEnter(() -> DataLogManager.log("Superstructure: entered ReadyToShoot"));
ready.onExit(() -> DataLogManager.log("Superstructure: left ReadyToShoot"));`}
        />

        <p className="prose-body measure">
          <strong>Result:</strong> two lines every time the robot passes through
          ReadyToShoot. <code>DataLogManager.log(...)</code> writes each message
          into the <code>.wpilog</code> <em>and</em> prints it to the console,
          so you can watch transitions happen live in the terminal running the
          simulator and still have timestamps to read afterwards. It also starts
          the log manager for you the first time you call it. This is the way to
          watch a machine work — add a pair to any state you are suspicious of.
        </p>

        <p className="prose-body-sm measure">
          Entry callbacks run immediately <em>after</em> the state&apos;s
          command is scheduled, so they can see it running. Exit callbacks run
          immediately before the command is canceled on a transition, or right
          after it finishes on its own. Both run in the order you added them.
          One catch: if a callback schedules a command of its own, that command
          is scoped to the whole machine, not to the state.
        </p>
      </LessonSection>

      {/* ── the whole file ───────────────────────────────────────────── */}
      <LessonSection id="the-whole-file" title="The whole file">
        <p className="prose-body measure">
          Every block above, in one place, plus three commented-out extras at
          the bottom for when you need them.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="7-StateBased"
          filePath="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
        />
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <Box
          variant="alert-warning"
          tag="FIRST"
          title="The branch ships the arm untuned"
        >
          <p>
            <code>7-StateBased</code> ships <code>Arm.java</code> with{" "}
            <code>kG</code>, <code>kS</code>, <code>kP</code> and{" "}
            <code>kD</code> all at <code>0.0</code>, each marked{" "}
            <code>{"// NEEDS TUNING"}</code>, and{" "}
            <code>MotionMagicCruiseVelocity</code> and{" "}
            <code>MotionMagicAcceleration</code> at <code>0.0</code> marked{" "}
            <code>{"// NEEDS SETTING"}</code>. With those numbers the arm does
            not move. The branch never carries your values, so put back the ones
            you tuned on <strong>PID Control</strong> and{" "}
            <strong>Motion Magic</strong> before you run the checks below, or
            you will decide the state machine is broken when it is doing exactly
            what you asked.
          </p>
          <p className="mt-3">
            The flywheel is in better shape — it ships <code>kV = 0.125</code>{" "}
            and its Motion Magic limits set, so it spins. But its{" "}
            <code>kS</code> and <code>kP</code> are also <code>0.0</code>, which
            matters for step 3.
          </p>
        </Box>

        <ol
          className="ml-5 list-decimal space-y-3 text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            Start the simulator and click Enable.{" "}
            <strong>You should see:</strong> the arm drives to vertical and the
            flywheel stays stopped. That is <code>Stowed (hold)</code>, the
            initial state, running on its own with no button pressed.
          </li>
          <li>
            Hold the left trigger. <strong>You should see:</strong> the arm
            swings to horizontal. Release it. <strong>You should see:</strong>{" "}
            the arm goes back to vertical. You have driven{" "}
            <code>stowed &rarr; pickup &rarr; stowed</code>.
          </li>
          <li>
            Hold the right trigger. <strong>You should see:</strong> the arm
            stays vertical, the flywheel spins up, and{" "}
            <code>Superstructure: entered ReadyToShoot</code> appears in the
            console. The hardware does not change when that line lands — the two
            states run the same pose on purpose, so the console is the only
            place the transition shows up. <strong>Watch the timing.</strong>{" "}
            The line can arrive the moment you pull the trigger instead of after
            a spin-up, and it can fail to arrive at all; the two failure modes
            below cover both.
          </li>
          <li>
            Release the right trigger. <strong>You should see:</strong> the
            flywheel stops. That is{" "}
            <code>switchFromAny(spinUp, ready).to(stowed)</code> firing.
          </li>
          <li>
            Hold the left trigger, then press B while still holding it.{" "}
            <strong>You should see:</strong> the arm returns to vertical even
            though the left trigger is still down — the any-state escape hatch
            beats whatever state you were in. <strong>Keep holding it.</strong>{" "}
            The arm stays vertical. The <code>stowed &rarr; pickup</code>{" "}
            transition needs the trigger to go false and true again, because
            transitions fire on the rising edge. Release and press again to go
            back to pickup.
          </li>
          <li>
            Now try to break it: hold the left trigger to get into{" "}
            <code>pickup</code>, and while still holding it, pull the right
            trigger too. <strong>You should see:</strong> nothing. The arm stays
            down and the flywheel stays stopped. There is no{" "}
            <code>pickup &rarr; spinUp</code> transition, so that jump does not
            exist. This is the whole point of the page.
          </li>
          <li>
            Scroll back through the console, or open the <code>.wpilog</code>{" "}
            from the run. <strong>You should see:</strong> one{" "}
            <code>entered ReadyToShoot</code> and one{" "}
            <code>left ReadyToShoot</code> for each time you held the right
            trigger long enough to get up to speed. Matched pairs mean the
            machine is moving through the graph the way you drew it.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Four things that go wrong here"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                The build fails and the error points at your{" "}
                <code>StateMachine</code>.
              </strong>{" "}
              Either <code>setInitialState(...)</code> is missing, or one of
              your <code>Command.parallel(...)</code> groups has no{" "}
              <code>.named(&quot;...&quot;)</code>. Both are compiler-plugin
              errors, not runtime surprises. Read the message: it names the one
              that is wrong.
            </li>
            <li>
              <strong>
                The flywheel spins up and the machine never leaves SpinUp.
              </strong>{" "}
              The <code>.until(flywheel::isAtTarget)</code> is never coming
              true, so the state&apos;s command never finishes and{" "}
              <code>whenComplete()</code> never fires. On the branch{" "}
              <code>isAtTarget()</code> asks whether the measured speed is
              within <code>0.5</code> rotations per second of the target, and
              the branch ships the flywheel with <code>kS = 0.0</code> and{" "}
              <code>kP = 0.0</code> — only <code>kV</code> is set, so there is
              nothing correcting the last bit of error. Log{" "}
              <code>flywheel.getVelocity()</code> against{" "}
              <code>flywheel.getTargetVelocity()</code> and look at the gap.
            </li>
            <li>
              <strong>
                The machine reaches ReadyToShoot the instant you pull the
                trigger.
              </strong>{" "}
              The opposite failure, and the cause is worth knowing.{" "}
              <code>getTargetVelocity()</code> does not read a measured setpoint
              — it returns <code>velocityOut.getVelocityMeasure()</code>, the
              speed stored on the Motion Magic request object, which is{" "}
              <code>0</code> until <code>setVelocity(...)</code> has run once.
              So the first time <code>isAtTarget()</code> is asked, it can be
              comparing a stopped wheel against a target of zero, which is
              comfortably inside the <code>0.5</code> rot/s tolerance and
              already true. The state finishes on its first check and{" "}
              <code>whenComplete()</code> fires immediately. The branch does not
              guard against it. If you hit it, put a floor in the condition —
              require the measured speed to be above zero as well as near the
              target — instead of trusting <code>isAtTarget()</code> on its own
              at the instant a state starts.
            </li>
            <li>
              <strong>
                A state you added last never becomes reachable by pressing B.
              </strong>{" "}
              <code>switchFromAny()</code> with no arguments applies to every
              state that exists <em>at the moment you call it</em>. Add a state
              after that line and it does not get the transition. Keep the
              no-argument <code>switchFromAny()</code> as the last line of the
              constructor.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── two kinds of transition ──────────────────────────────────── */}
      <LessonSection
        id="two-kinds-of-transition-and-how"
        title="Two kinds of transition, and how to pick"
      >
        <p className="prose-body measure">
          This is the one decision that catches people out. It is decided by the
          state, not by the condition: does that state&apos;s command finish on
          its own or not?
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Box
            variant="concept"
            tag="FOR STATES THAT HOLD"
            title="switchTo(next).when(condition)"
          >
            <p>
              Checked every scheduler loop{" "}
              <em>while the state&apos;s command is running</em>, and fires on
              the rising edge — the moment the condition flips from false to
              true. It has to go false and come back before it can fire again,
              which is why{" "}
              <code>switchFromAny().to(stowed).when(driver.b())</code> does not
              spin in a loop when you are already stowed.
            </p>
            <p className="mt-3">
              Five of the six transitions on the branch use{" "}
              <code>.when(...)</code>; only <code>spinUp.switchTo(ready)</code>{" "}
              uses <code>whenComplete()</code>. A state that holds can only ever
              use <code>.when(...)</code>. A state that finishes can use either,
              and <code>spinUp</code> uses both — <code>whenComplete()</code> to
              advance to <code>ready</code>, and the{" "}
              <code>switchFromAny(spinUp, ready)</code> <code>.when(...)</code>{" "}
              to bail out when the trigger is released.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="FOR STATES THAT FINISH"
            title="switchTo(next).whenComplete()"
          >
            <p>
              Checked once, <em>after</em> the state&apos;s command finishes on
              its own. <code>spinUp</code> is the only state on the branch that
              can use it, because <code>.until(flywheel::isAtTarget)</code> is
              what gives its command an ending.
            </p>
            <p className="mt-3">
              Put <code>whenComplete()</code> on a hold-backed state and it
              never fires, because the command never finishes. Put{" "}
              <code>.when(...)</code> on a one-shot that finishes without ever
              yielding and it never fires either, because the loop that checks
              it never runs.
            </p>
            <p className="mt-3">
              There is a third spelling, <code>whenCompleteAnd(condition)</code>
              . It is a variant of this one — the same completion check plus an
              extra condition — and the two boxes below use it.
            </p>
          </Box>
        </div>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Order matters twice"
        >
          <p>
            Conditional transitions are checked in the order you declared them,
            and the first rising edge wins. If two conditions can be true at
            once, the one you wrote first is the one that fires — the second is
            silently unreachable.
          </p>
          <p className="mt-3">
            Completion transitions have their own order:{" "}
            <code>whenCompleteAnd(...)</code> conditions are evaluated first, in
            declaration order, and take precedence over a plain{" "}
            <code>whenComplete()</code>. A second plain{" "}
            <code>whenComplete()</code> on the same state overwrites the first
            rather than adding to it.
          </p>
        </Box>

        <Box variant="concept" title='Two ways to write "not"'>
          <p>
            <code>driver.rightTrigger()</code> is a <code>Trigger</code>, and{" "}
            <code>.negate()</code> gives you a <code>Trigger</code> that is true
            exactly when the original is false. That is the spelling the branch
            uses for &quot;the driver let go.&quot;
          </p>
          <p className="mt-3">
            When the thing you are inverting is a plain method rather than a{" "}
            <code>Trigger</code>, you write the lambda by hand and put a{" "}
            <code>!</code> in front of it. <code>!</code> means &quot;not&quot;
            — it flips true to false and false to true. Watch for it. It is one
            character, it reverses the entire meaning of the line, and it
            disappears when you skim. The branch&apos;s own commented-out
            example uses it:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`// whenCompleteAnd is whenComplete plus an extra check. It wins over plain whenComplete().
//   spinUp.switchTo(stowed).whenCompleteAnd(() -> !hasGamePiece()); // lost the piece - bail`}
            />
          </div>
        </Box>
      </LessonSection>

      {/* ── switchFromAny ────────────────────────────────────────────── */}
      <CollapsibleSection title="More on switchFromAny, and leaving the machine">
        <div className="flex flex-col gap-4">
          <p className="prose-body-sm measure">
            <code>switchFromAny(...)</code> is shorthand, nothing more. It adds
            the same transition to several states in one line. These two blocks
            do the same thing:
          </p>

          <CodeBlock
            language="java"
            title="The shorthand and what it expands to"
            code={`sm.switchFromAny(spinUp, ready).to(stowed).when(driver.rightTrigger().negate());

// Same as writing both by hand:
spinUp.switchTo(stowed).when(driver.rightTrigger().negate());
ready.switchTo(stowed).when(driver.rightTrigger().negate());`}
          />

          <p className="prose-body-sm measure">
            Called with no arguments it applies to every state in the machine{" "}
            <strong>at the time of the call</strong>. States added afterwards do
            not get it retroactively, which is the reason the branch puts that
            line last and says so in a comment.
          </p>

          <p className="prose-body-sm measure">
            A transition can also end the machine outright instead of moving to
            another state. Both spellings are real; the branch ships the first
            one commented out at the bottom of the file.
          </p>

          <CodeBlock
            language="java"
            title="Leaving the machine"
            code={`// From every state:
sm.switchFromAny().toExitStateMachine().when(driver.back());

// From one state:
spinUp.exitStateMachine().when(driver.back());`}
          />

          <p className="prose-body-sm measure">
            When the machine exits, the machine command itself finishes.
            Whatever the last state was commanding is canceled, and the
            mechanisms fall back to <code>idle()</code> — which issues no output
            and does <em>not</em> zero the last request. Phoenix keeps applying
            whatever it last received. Same trap as a finishing group in{" "}
            <strong>Chaining Commands</strong>: if you exit the machine, exit it
            into something that stops the hardware.
          </p>

          <p className="prose-body-sm measure">
            The branch also leaves a note about picking the target state at
            switch time rather than in advance — <code>switchTo(...)</code>{" "}
            accepts a supplier as well as a state, and the supplier is evaluated
            when the condition is met:
          </p>

          <CodeBlock
            language="java"
            hideControls
            code={`// The target state can be picked at switch time (a Supplier<State> instead of a State):
//   spinUp.switchTo(() -> hasGamePiece() ? ready : stowed).whenComplete();`}
          />
        </div>
      </CollapsibleSection>

      {/* ── lifecycle ────────────────────────────────────────────────── */}
      <CollapsibleSection title="What the machine does every loop">
        <ol
          className="ml-5 list-decimal space-y-2 text-[14px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            The current state starts as the one you passed to{" "}
            <code>setInitialState(...)</code>.
          </li>
          <li>
            The state&apos;s command is started, then its <code>onEnter</code>{" "}
            callbacks run — in that order, so a callback can see the command
            already running.
          </li>
          <li>
            Every loop, while that command is still running, each of the
            state&apos;s conditional transitions is checked in declaration
            order.
          </li>
          <li>
            On the first rising edge: <code>onExit</code> runs, the command is
            canceled, and the next state takes over <em>in the same loop</em> —
            no wasted cycle. A chain of fast transitions resolves immediately.
          </li>
          <li>
            If the command finishes on its own instead, <code>onExit</code> runs
            and the completion transitions are checked once —{" "}
            <code>whenCompleteAnd(...)</code> first, then plain{" "}
            <code>whenComplete()</code>.
          </li>
          <li>
            If nothing matches when the command finishes, the machine exits and
            the machine command is done.
          </li>
        </ol>
      </CollapsibleSection>

      {/* ── where this sits ──────────────────────────────────────────── */}
      <LessonSection
        id="where-this-sits-next-to-the"
        title="Where this sits next to the other two dialects"
      >
        <p className="prose-body measure">
          Commands v3 gives you three ways to write a routine, and this team
          teaches them in this order.
        </p>

        <ul
          className="ml-5 list-disc space-y-2 text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <strong>Chaining</strong> — <code>Command.sequence</code>,{" "}
            <code>Command.race</code>, <code>.withTimeout(...)</code>,{" "}
            <code>.until(...)</code>. The everyday tool, and as far as most
            routines ever need to go.
          </li>
          <li>
            <strong>Coroutines</strong> — one command body with loops and
            branches inside it, from the last page.
          </li>
          <li>
            <strong>State machines</strong> — this page. For behavior that jumps
            between named phases and has to be able to go backwards.
          </li>
        </ul>

        <p className="prose-body measure">
          The difference from a sequence is worth stating flatly. A{" "}
          <code>Command.sequence</code> is a line: A, then B, then C, and when C
          is done it is over. A state machine is a graph: any state can go to
          any state you drew an arrow to, at any time, and it can come back. If
          your routine only ever moves forwards, use a sequence — it is less
          code and easier to read.
        </p>

        <p className="prose-body measure">
          The robot template lets you compare the first two directly: it has the
          drive-stow-drive auto written twice, once with coroutines (
          <code>DriveStowDriveOpMode</code>) and once by chaining (
          <code>DriveStowDriveChainedOpMode</code>). Alongside them sits{" "}
          <code>StateMachineTeleop</code>, a separate superstructure demo built
          the same way as the machine on this page.
        </p>

        <div className="flex flex-wrap gap-4">
          <DocumentationButton
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/StateMachineTeleop.java"
            title="StateMachineTeleop.java — the template's state machine"
            icon={<GitBranch className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://github.com/wpilibsuite/allwpilib/blob/main/design-docs/commands-v3-state-machines.md"
            title="WPILib state machine design doc"
            icon={<Book className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://github.com/wpilibsuite/allwpilib/pull/8297"
            title="allwpilib PR #8297 — the StateMachine API"
            icon={<GitPullRequest className="w-5 h-5" />}
          />
        </div>
      </LessonSection>

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              "Why does each state on the branch use Command.parallel(arm.…(), flywheel.…()) instead of a single mechanism command?",
            options: [
              "parallel runs commands faster than scheduling them separately",
              "A state has to pose the whole robot, so one command has to command both mechanisms — otherwise the other one is left wherever it was",
              "StateMachine.addState only accepts parallel groups",
              "It is required so the state can use whenComplete()",
            ],
            correctAnswer: 1,
            explanation:
              "addState takes any Command. The reason for parallel is that a state is supposed to describe the whole robot. If Stowed only said 'arm vertical', the flywheel would be doing whatever the previous state left it doing, and the state name would be a lie. The group also inherits both mechanisms' requirements, so nothing else can quietly drive them.",
          },
          {
            id: 2,
            question:
              "What is the difference between Command.parallel(a, b) and Command.race(a, b)?",
            options: [
              "parallel finishes when all members finish; race finishes as soon as any one member finishes and cancels the rest",
              "parallel finishes when any member finishes; race waits for all of them",
              "They are the same; race is the older spelling",
              "parallel runs members in order; race runs them at the same time",
            ],
            correctAnswer: 0,
            explanation:
              "Both start every member at once. parallel treats every member as required, so the group ends when the last one is done. race treats every member as optional, so the first one to finish ends the group and cancels the others. Two holds in a parallel group never finish, which is exactly why the states on this branch are holds.",
          },
          {
            id: 3,
            question:
              "SpinUp uses spinUp.switchTo(ready).whenComplete() while every other transition uses .when(...). Why?",
            options: [
              "whenComplete is faster because it skips the per-loop check",
              "Because SpinUp is the only state whose command ends on its own — .until(flywheel::isAtTarget) gives it an ending, and whenComplete fires once when it does",
              "Because SpinUp has two mechanisms and the others have one",
              "Because ready is the last state that was added",
            ],
            correctAnswer: 1,
            explanation:
              "whenComplete() is checked once, after the state's command finishes on its own. Three of the four states run holds that never finish, so whenComplete would never fire on them and they use .when(...) instead. SpinUp's .until(flywheel::isAtTarget) is what gives its parallel group an ending, which is what makes whenComplete available.",
          },
          {
            id: 4,
            question:
              "You add a fifth state to the machine, on the line right after sm.switchFromAny().to(stowed).when(driver.b());. Pressing B from that new state does nothing. Why?",
            options: [
              "B is already bound elsewhere and the bindings conflict",
              "switchFromAny() with no arguments applies only to the states that existed when it was called — the new state was added after",
              "You need to call setInitialState again after adding a state",
              "switchFromAny only works on states with hold commands",
            ],
            correctAnswer: 1,
            explanation:
              "switchFromAny() with no arguments is shorthand for adding the transition to every state in the machine at the time of the call. It is not retroactive. Declare cross-cutting transitions after all the states are added — the branch puts that line last and comments it for exactly this reason.",
          },
          {
            id: 5,
            question:
              "A conditional transition fires while a state's command is running. In what order do things happen?",
            options: [
              "The next state's command starts, then the old one is canceled in the background",
              "onExit runs, the current command is canceled, and the next state's command starts in the same loop — no extra cycle",
              "The scheduler yields first, and the switch completes on the next loop",
              "The next state's onEnter runs before the old state's onExit, so the two can hand off",
            ],
            correctAnswer: 1,
            explanation:
              "Transitions resolve inside a single scheduler loop: onExit callbacks, then cancel, then the next state's command starts and its onEnter callbacks run. Nothing yields in between, so a chain of transitions that are all immediately true resolves without wasting loops.",
          },
          {
            id: 6,
            question:
              "When should you reach for a StateMachine instead of Command.sequence?",
            options: [
              "Whenever a routine has more than two steps",
              "When the routine has to repeat a phase, skip a phase, or go backwards — a sequence only moves forwards, top to bottom",
              "Whenever more than one mechanism is involved",
              "Whenever you want the routine to appear in telemetry",
            ],
            correctAnswer: 1,
            explanation:
              "Command.sequence is a line: A, then B, then C, then done. A state machine is a graph — any state can move to any state you connected, including back to an earlier one, plus onEnter/onExit hooks and switchFromAny interrupts. If your routine only moves forwards, the sequence is less code and easier to read.",
          },
        ]}
      />
    </PageTemplate>
  );
}
