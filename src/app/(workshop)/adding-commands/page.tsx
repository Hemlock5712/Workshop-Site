import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";

export default function AddingCommands() {
  return (
    <PageTemplate title="Commands">
      <KeyConceptSection
        title="Commands with WPILib Commands V3"
        description={[
          "A coroutine Command is a single method body that the scheduler runs once. Inside the body you write plain Java; whenever the command needs to wait (for time to pass, for a condition to become true, for a sub-command to finish), you explicitly yield to the scheduler through the Coroutine parameter. There's no separate init / execute / isFinished / end to fill in, just the one body.",
          "Most commands you write will be a single line of motor setup wrapped in mech.run(...). The coroutine parameter is there when you need it (.wait, .waitUntil, .await, .park) and ignored when you don't. Roughly 80% of teaching examples never touch it.",
        ]}
        concept="A command is a body. You yield through the coroutine wherever you need to wait. Most bodies don't need to."
      />

      <section className="flex flex-col gap-6">
        <h2
          className="text-2xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          The default command shape
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Most commands live on a mechanism as a thin factory: take some
          arguments, configure the hardware, hand the resulting{" "}
          <code>Command</code> back. The body runs once. If it doesn&apos;t
          yield, the command finishes immediately. If it does, it stays
          scheduled until the yield resolves and the body falls off the end.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — three commands of escalating commitment"
          code={`// 1. Set once and finish. The coroutine parameter is unused —
//    the body has nothing to wait on, so it ends after the call.
public Command setVoltage(double volts) {
  return run(coroutine -> motor.setControl(voltageOut.withOutput(volts)))
      .named("Arm:setVoltage:" + volts);
}

// 2. Set once, then hold until the command is cancelled.
//    coroutine.park() yields forever — the scheduler keeps the
//    command active until something else pre-empts the mechanism.
public Command holdAt(Angle target) {
  return run(coroutine -> {
    motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
    coroutine.park();
  }).named("Arm:holdAt:" + target.in(Degrees));
}

// 3. Set once, then wait until a condition becomes true,
//    then finish on its own.
public Command goTo(Angle target, Angle tolerance) {
  return run(coroutine -> {
    motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
    coroutine.waitUntil(() -> atTarget(target, tolerance));
  }).named("Arm:goTo:" + target.in(Degrees));
}`}
        />
      </section>

      <section className="flex flex-col gap-6">
        <h2
          className="text-2xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          Two ways to write a command
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The inline <code>run(coroutine -&gt; …)</code> style above is one way
          to write a command. The other is the explicit <code>initialize</code>{" "}
          / <code>execute</code> / <code>isFinished</code> / <code>end</code>{" "}
          lifecycle: the workshop template ships{" "}
          <code>utils/ClassicCommand</code>, a small base class that gives you
          those four methods. Extend it, override only the methods you need, and
          the instance <em>is</em> a <code>Command</code> you can schedule or
          bind to a trigger. Reach for <code>ClassicCommand</code> when a
          command has explicit, stateful steps; reach for the inline{" "}
          <code>run(coroutine -&gt; …)</code> body when a single body reads more
          clearly.
        </p>

        <CodeBlock
          language="java"
          title="DriveDistance.java — the initialize / execute / isFinished / end lifecycle"
          code={`// utils/ClassicCommand gives you an explicit initialize/execute/isFinished/end lifecycle.
public class DriveDistance extends ClassicCommand {
  private final Drive drive;
  private final double meters;

  public DriveDistance(Drive drive, double meters) {
    super("DriveDistance", drive); // the command's name + the mechanism it requires
    this.drive = drive;
    this.meters = meters;
  }

  @Override protected void initialize()      { drive.resetEncoders(); }
  @Override protected void execute()         { drive.arcade(0.5, 0); }
  @Override protected boolean isFinished()   { return drive.distance() >= meters; }
  @Override protected void end(boolean intr) { drive.stop(); }
}`}
        />

        <Box
          variant="alert-tip"
          tag="HOW IT MAPS"
          title="How the lifecycle runs on the scheduler"
        >
          Under the hood <code>ClassicCommand</code> runs{" "}
          <code>initialize()</code> once, then loops <code>execute()</code> +{" "}
          <code>isFinished()</code> with a yield each tick.{" "}
          <code>end(false)</code> runs on a natural finish;{" "}
          <code>end(true)</code> runs on cancellation. The base class wires the
          cancel hook for you, because (as with any v3 command) a cancelled
          coroutine is dropped and wouldn&apos;t otherwise reach your cleanup.
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2
          className="text-2xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          Four shapes cover almost everything
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          When you&apos;re writing a new command, the question to answer first
          is <em>what does it have to wait for?</em> That answer picks the
          shape.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Box
            variant="concept"
            tag="SHAPE 1 · SET ONCE"
            title="Body sets a value and falls off"
            code={<code>run(coroutine -&gt; setVoltage(6)).named(...)</code>}
          >
            <p>
              No yield, no wait. The command finishes the same tick it&apos;s
              scheduled. Good for fire-and-forget actions where the next command
              in a chain is responsible for whatever comes next.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="SHAPE 2 · SET AND HOLD"
            title="Body sets a value then parks"
            code={
              <code>
                run(coroutine -&gt; {"{"} setVoltage(6); coroutine.park(); {"}"}
                )
              </code>
            }
          >
            <p>
              Yields forever after the setup. The command stays scheduled until
              something cancels it (a default-command return, a higher-priority
              command, a button release). Good for &quot;run while held&quot;
              bindings.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="SHAPE 3 · SET THEN WAIT"
            title="Body sets a value then waits on a condition"
            code={
              <code>
                run(coroutine -&gt; {"{"} setPosition(t);
                coroutine.waitUntil(atTarget); {"}"})
              </code>
            }
          >
            <p>
              Yields until the predicate goes true. Falls off on its own when
              the condition is met. The bread-and-butter shape for &quot;move
              there&quot; commands that need to report when they&apos;ve
              arrived.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="SHAPE 4 · MULTI-PHASE"
            title="Body awaits child commands in order"
            code={<code>coroutine.await(a); coroutine.await(b);</code>}
          >
            <p>
              Yields for the full duration of each child. The body reads top to
              bottom like a script. Good when the sequence is fixed and each
              phase&apos;s setup depends only on what came before it.
            </p>
          </Box>
        </div>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          For shapes 1, 2, and 3 the <code>coroutine</code> parameter is the
          only thing that lets the scheduler know when to yield. For shape 4 you
          chain commands together by awaiting them on the same coroutine,
          inheriting all of their requirements.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2
          className="text-2xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          Composing across mechanisms
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          A routine that touches more than one mechanism is hosted on the
          mechanism it <em>primarily drives</em>. From inside that
          mechanism&apos;s <code>run(coroutine -&gt; {`{ ... }`})</code> body it
          controls its own hardware directly and <code>await</code>s or{" "}
          <code>fork</code>s the other mechanisms&apos; commands. Each awaited
          command carries its own requirement, so the scheduler still tracks who
          owns what.
        </p>

        <CodeBlock
          language="java"
          title="A two-mechanism shoot routine (a method on Flywheel)"
          code={`/** Spin the flywheel up, then drop the arm to feed for half a second. */
// Lives on the flywheel — it drives the flywheel directly and awaits the
// arm's commands. The flywheel keeps spinning while the arm moves because
// Phoenix holds the last velocity request we sent.
public Command shoot() {
  return run(coroutine -> {
    setVelocity(SHOOT_RPM);                       // start spinning this flywheel
    coroutine.await(arm.goTo(HANDOFF, TOL));      // drive arm to handoff
    coroutine.waitUntil(this::atTarget);          // make sure we're spun up
    coroutine.await(arm.goTo(FEED, TOL));         // drop into the feed roller
    coroutine.wait(Seconds.of(0.5));              // give it time to clear
  }).named("shoot");
}`}
        />

        <Box
          variant="alert-info"
          tag="NOTE"
          title="One body coordinates the whole sequence"
        >
          <p>
            The body reads top to bottom: <code>setVelocity</code> starts the
            flywheel and Phoenix holds it while the arm moves, and the{" "}
            <code>await</code> / <code>wait</code> calls sequence the rest. When
            you genuinely need a background command that the routine can later
            cancel, that&apos;s what <code>coroutine.fork(...)</code> is for: a
            forked command is cancelled automatically when the parent body
            exits.
          </p>
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2
          className="text-2xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          Beyond static sequences: runtime decisions in command bodies
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The four shapes above cover routines that are <em>static</em>: the
          sequence is known when the command is built. The interesting case is
          when one phase&apos;s outcome decides what the next phase should be.
          v3 lets the body read a sensor, store the result in a local variable,
          and branch with plain Java.
        </p>

        <CodeBlock
          language="java"
          title="Pick a scoring height based on what the intake actually grabbed"
          code={`/**
 * Drive arm to pickup, grab, then decide where to score based on
 * what we picked up.
 */
// A method on Arm: it drives the arm directly and awaits the intake's
// commands. Because the body runs on one mechanism, it can read a sensor and
// branch with plain Java between phases.
public Command grabAndScore() {
  return run(coroutine -> {
    setPosition(GROUND_PICKUP);
    coroutine.waitUntil(this::atTarget);
    coroutine.await(intake.grab());

    // Plain local variable. Read once, branch on it.
    int weight = sensors.readPieceWeight();

    if (weight == 0) {
      // Got nothing — bail quietly to stowed.
      setPosition(STOWED);
      coroutine.waitUntil(this::atTarget);
    } else if (weight > HEAVY_THRESHOLD) {
      // Too heavy for the high goal — score low.
      setPosition(LOW_GOAL);
      coroutine.waitUntil(this::atTarget);
      coroutine.await(intake.release());
    } else {
      setPosition(HIGH_GOAL);
      coroutine.waitUntil(this::atTarget);
      coroutine.await(intake.release());
    }
  }).named("grabAndScore");
}`}
        />

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The key line is <code>int weight = sensors.readPieceWeight();</code>{" "}
          followed by a three-way <code>if/else</code> picking between different
          next phases. Because the whole routine is one method body, a value
          read in one phase is just a local variable the later phases can branch
          on.
        </p>

        <Box
          variant="concept"
          tag="WHY THIS MATTERS"
          title="Write control flow as control flow"
        >
          Because the routine is a single method body, multi-phase logic reads
          top to bottom in plain Java: read a sensor into a local, branch with{" "}
          <code>if/else</code>, and <code>await</code> the phase you chose. The{" "}
          <code>coroutine</code> parameter suspends and resumes the body at each{" "}
          <code>await</code> / <code>waitUntil</code>, so there&apos;s no phase
          bookkeeping to maintain.
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2
          className="text-2xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          Cancellation
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          A command&apos;s normal completion is just the body falling off the
          end. Cancellation cleanup goes in a <code>.whenCanceled(...)</code>{" "}
          hook on the command builder. This matters because a cancelled
          coroutine is simply <em>dropped</em>: any code after a{" "}
          <code>park()</code> or an unfinished <code>waitUntil</code> never
          runs, so a trailing &quot;cleanup&quot; line at the end of the body
          won&apos;t fire on cancellation.
        </p>

        <CodeBlock
          language="java"
          title="Drop the arm voltage if we get cancelled mid-move"
          code={`public Command goTo(Angle target, Angle tolerance) {
  return run(coroutine -> {
        motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
        coroutine.waitUntil(() -> atTarget(target, tolerance));
      })
      .whenCanceled(() -> motor.setControl(voltageOut.withOutput(0)))
      .named("Arm:goTo:" + target.in(Degrees));
}`}
        />

        <p
          className="text-[14px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The <code>whenCanceled</code> callback only fires when the command is
          interrupted. Code that should run only on <em>normal</em> completion
          goes at the bottom of the body (it runs when the body returns on its
          own). Because cancellation drops the coroutine before it reaches that
          point, interrupt cleanup has to live in <code>whenCanceled</code>. Two
          clear places, one for each way a command can end.
        </p>
      </section>

      <Box
        variant="alert-info"
        tag="NOTE · API STATUS"
        title="This is the WPILib 2027 alpha"
      >
        The <code>Coroutine</code> API, the staged builder, and the compile-time
        enforcement of <code>.named(...)</code> run on <strong>Java 25</strong>{" "}
        and deploy to <strong>SystemCore</strong>. The stack is the WPILib 2027{" "}
        <em>alpha</em> (GradleRIO <code>2027.0.0-alpha-6</code>), so the exact
        APIs are still moving between alpha builds.
      </Box>

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              'You write run(coroutine -> motor.setControl(voltageOut.withOutput(6))).named("setHigh"). The body never yields. When does this command finish?',
            options: [
              "Immediately, the same scheduler tick it's scheduled — the body has nothing to wait on",
              "Never — without a yield, the scheduler treats it as a hold-forever command",
              "On the next tick, after one mandatory yield is inserted by the framework",
              "When the mechanism's default command pre-empts it",
            ],
            correctAnswer: 0,
            explanation:
              "A v3 command finishes as soon as its body returns. If you never call coroutine.yield(), waitUntil, await, or park, the body runs straight through to the end on the same tick and the command is done. Use coroutine.park() if you want a set-then-hold command instead.",
          },
          {
            id: 2,
            question:
              'What\'s the v3 spelling of "set this value once, then hold it until the command is cancelled"?',
            options: [
              "runOnce(() -> setValue(x))",
              "run(coroutine -> { setValue(x); coroutine.park(); })",
              "runRepeatedly(() -> setValue(x)) on its own — there's no other way",
              "idle() on its own — it already holds the last value",
            ],
            correctAnswer: 1,
            explanation:
              "Setting once and then parking gives you a command that does its setup, then yields forever waiting for cancellation. runRepeatedly works too but re-applies the setpoint every 20 ms, which is usually wasteful. The park form sets the value exactly once.",
          },
          {
            id: 3,
            question:
              "About what fraction of teaching-level commands actually use the coroutine parameter?",
            options: [
              "All of them — the parameter is required",
              "Most of them — almost every command yields at least once",
              "Roughly 20% — most commands are set-once factories that ignore the parameter",
              "Only the multi-phase composers — even waitUntil commands skip it",
            ],
            correctAnswer: 2,
            explanation:
              "Single set-once factories (setVoltage, runIntake, openClaw) never need to wait, so they never touch the coroutine. The coroutine matters when a command holds (park), waits (waitUntil / wait), or composes children (await / awaitAll / awaitAny / fork). That's roughly 20% of the commands a working robot project tends to define.",
          },
          {
            id: 4,
            question:
              "v3 has no end(boolean interrupted). How do you run cleanup code only when a command is cancelled?",
            options: [
              "Attach a .whenCanceled(runnable) hook on the command builder",
              "Wrap the body in a try/catch — cancellation throws a CancelledException",
              "Override the inherited end() from Command — it still takes a boolean",
              "Add a coroutine.onInterrupt() call at the start of the body",
            ],
            correctAnswer: 0,
            explanation:
              ".whenCanceled(...) on the builder registers a Runnable that fires only on cancellation. There's no exception to catch: the scheduler just drops the coroutine, so code after a park()/waitUntil never runs. Cleanup that should happen only on normal completion goes at the bottom of the body; interrupt cleanup goes in .whenCanceled.",
          },
        ]}
      />
    </PageTemplate>
  );
}
