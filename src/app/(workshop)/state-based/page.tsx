import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import CollapsibleSection from "@/components/CollapsibleSection";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";

export default function StateMachines() {
  return (
    <PageTemplate title="State Machines">
      <KeyConceptSection
        title="State Machines with WPILib Commands V3"
        description={[
          "A state machine models a system as a set of discrete states, an active behavior per state, and transitions that move between them. WPILib's Commands V3 ships a first-class StateMachine class that gives you all of this — including entry/exit hooks and any-state interrupts — without writing scaffolding by hand.",
          "Reach for a StateMachine whenever a routine has phases that can repeat, skip, or back up to an earlier phase based on sensor input. Auto routines that recover from being knocked off-course, LED logic that escalates between info/warning animations, and superstructure choreography are all natural fits.",
        ]}
        concept="A state is a Command that runs while the machine is in it. Transitions are edge-triggered conditions that cancel the current state's command and move to the next state. onEnter / onExit fire around each transition."
      />

      <Box
        variant="alert-warning"
        tag="PROVISIONAL · WPILIB 2027 ALPHA"
        title="StateMachine API is still settling"
      >
        This lesson teaches WPILib&apos;s Commands-v3 <code>StateMachine</code>{" "}
        — the intended v3 way to model multi-state routines. It is a real 2027
        feature, but its exact method names and behavior are{" "}
        <strong>still being finalized in the alpha</strong>, and the
        workshop&apos;s reference template doesn&apos;t yet ship a finished
        StateMachine example. Treat the <code>StateMachine</code> code on this
        page as a faithful sketch of the design intent rather than a
        guaranteed-compiling API — we&apos;ll pin it to a verified example once
        one lands. The surrounding pieces (the <code>Arm</code> command
        factories, the coroutine bodies) follow the same verified v3 patterns as
        the rest of the workshop.
      </Box>

      <section className="flex flex-col gap-6">
        <h2
          className="text-2xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          Anatomy of a StateMachine
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Building a state machine is a four-step staged process. Each state
          wraps a single <code>Command</code>. Transitions are declared on the
          states themselves and are checked every scheduler tick while that
          state is active.
        </p>

        <CodeBlock
          language="java"
          title="Arm cycle as a state machine"
          code={`import org.wpilib.command3.Command;
import org.wpilib.command3.StateMachine;
import org.wpilib.command3.StateMachine.State;

public Command autoArmCycle() {
  // 1. Construct — name is required and shows up in telemetry.
  StateMachine sm = new StateMachine("Auto Arm Cycle");

  // 2. Add states. Each state owns a Command.
  State stowed  = sm.addState(arm.low());
  State pickup  = sm.addState(arm.low());        // ready to grab
  State scoring = sm.addState(arm.high());
  State defense = sm.addState(arm.backward());

  // 3. Set the initial state. setInitialState() is enforced at compile time —
  //    leaving it out is a build error, not a runtime surprise.
  sm.setInitialState(stowed);

  // 4. Wire transitions.
  stowed.switchTo(pickup).when(operator.intake);
  pickup.switchTo(scoring).when(gripper::hasGamePiece);
  scoring.switchTo(stowed).whenCompleteAnd(() -> !gripper.hasGamePiece());

  // Any-state interrupt: defense mode wins from anywhere.
  sm.switchFromAny().to(defense).when(driver.defenseMode);

  return sm;
}`}
        />

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <code>arm.low()</code> and friends are factory methods on the{" "}
          <code>Arm</code> mechanism that return a configured{" "}
          <code>Command</code>. The state machine itself doesn&apos;t care how
          they&apos;re built — only that each state has one command to run.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — one factory per target position"
          code={`/** Drive to a target angle and finish once we arrive. */
public Command goTo(Angle target, Angle tolerance, String label) {
  return run(coroutine -> {
    setPosition(target);
    coroutine.waitUntil(() -> atTarget(target, tolerance));
  }).named("Arm:" + label);
}

// Thin wrappers — one per useful position.
public Command low()      { return goTo(Degrees.of(0),   Degrees.of(1), "LOW"); }
public Command high()     { return goTo(Degrees.of(90),  Degrees.of(2), "HIGH"); }
public Command backward() { return goTo(Degrees.of(180), Degrees.of(3), "BACKWARD"); }`}
        />
      </section>

      <CollapsibleSection title="Two kinds of transitions">
        <div className="flex flex-col gap-4">
          <p
            className="text-[14px] leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            Transitions come in two flavors. Use the right one for the kind of
            state you&apos;re leaving.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <Box
              variant="concept"
              tag="WHEN · CONDITIONAL"
              title="switchTo(...).when(cond)"
            >
              <p>
                Checked every scheduler tick{" "}
                <em>while the state&apos;s command is running</em>. Rising-edge
                guarded, so <code>state.switchTo(state).when(...)</code> never
                infinite loops — the condition has to go false and then true
                again to fire a second time.
              </p>
              <p style={{ marginTop: 8 }}>
                Does <strong>not</strong> fire for one-shot commands that never
                yield — the loop checking it never runs.
              </p>
            </Box>

            <Box
              variant="concept"
              tag="WHEN · COMPLETION"
              title="switchTo(...).whenComplete()"
            >
              <p>
                Checked once, <em>after</em> the state&apos;s command finishes
                on its own. Use this for one-shot states that don&apos;t loop,
                or for &quot;and then move on&quot; transitions at the end of a
                phase.
              </p>
              <p style={{ marginTop: 8 }}>
                <code>whenCompleteAnd(cond)</code> is the same idea with an
                extra check, and takes precedence over a plain{" "}
                <code>whenComplete()</code> when both apply.
              </p>
            </Box>
          </div>

          <CodeBlock
            language="java"
            title="Mixing conditional and completion transitions"
            code={`State aiming  = sm.addState(turret.aimAtGoal());
State scoring = sm.addState(shooter.fireOnce());

// Conditional: fire as soon as the turret reports it's on-target.
aiming.switchTo(scoring).when(turret::aimedAtGoal);

// Completion: loop the scoring state as long as we have a ball.
scoring.switchTo(scoring).whenCompleteAnd(hopper::hasBall);`}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Entry and exit hooks">
        <div className="flex flex-col gap-4">
          <p
            className="text-[14px] leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            Each state can register any number of <code>onEnter</code> and{" "}
            <code>onExit</code> callbacks. Useful when entering or leaving a
            state needs to kick off side-effects that aren&apos;t part of the
            state&apos;s main command — schedule a background animation, stiffen
            the drivetrain, log a marker, etc.
          </p>

          <CodeBlock
            language="java"
            title="Lock the swerve wheels in X when leaving the drive-up state"
            code={`State getInPosition = sm.addState(drivetrain.driveToScoringLocation());

// Background command — owns the drivetrain after we let go of it.
getInPosition.onExit(
  () -> Scheduler.getDefault().schedule(drivetrain.setX())
);`}
          />

          <p
            className="text-[13.5px] leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            Callbacks fire in the order they were added. Entry callbacks run
            immediately after the state&apos;s command is scheduled, so they can
            see it running. Exit callbacks run just before the command is
            canceled (on a transition) or just after it finishes (on a
            completion).
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Cross-cutting transitions with switchFromAny">
        <div className="flex flex-col gap-4">
          <p
            className="text-[14px] leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            For transitions that should fire regardless of which state is active
            — emergency interrupts, mode overrides, &quot;back to idle on
            disable&quot; — declare them on the state machine itself with{" "}
            <code>switchFromAny(...)</code>.
          </p>

          <CodeBlock
            language="java"
            title="LED priority machine: warning beats info beats idle"
            code={`StateMachine sm = new StateMachine("LEDs");

State idle    = sm.addState(leds.idleAnimation());     // priority -1
State info    = sm.addState(leds.infoAnimation());     // priority  0
State warning = sm.addState(leds.warningAnimation());  // priority  1

sm.setInitialState(idle);

// Normal transitions.
idle.switchTo(info).when(normalPriorityEvent.and(highPriorityEvent.negate()));
idle.switchTo(warning).when(highPriorityEvent);

info.switchTo(warning).whenCompleteAnd(highPriorityEvent);
warning.switchTo(info).whenCompleteAnd(normalPriorityEvent);

// Any-state interrupts. switchFromAny() with no args = every state in the
// machine at call time.
sm.switchFromAny().to(warning).when(highPriorityEvent);
sm.switchFromAny().to(idle).whenComplete();`}
          />

          <p
            className="text-[13.5px] leading-relaxed"
            style={{ color: "var(--fg-mute)" }}
          >
            Listing specific states is fine too:{" "}
            <code>sm.switchFromAny(state1, state2).to(state3).when(...)</code>{" "}
            is shorthand for adding the same transition to each listed state.
          </p>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Lifecycle, in one breath">
        <ol
          className="ml-5 list-decimal space-y-2 text-[14px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            Set <code>currentState</code> to the initial state.
          </li>
          <li>
            <code>onEnter</code> callbacks fire, then the state&apos;s command
            is forked.
          </li>
          <li>
            Each scheduler tick, every conditional transition is checked in
            declaration order. The first rising edge wins: <code>onExit</code>{" "}
            fires, the command is canceled, and the next state takes over{" "}
            <em>without an extra yield</em>.
          </li>
          <li>
            If the command finishes on its own, completion transitions are
            checked once (<code>whenCompleteAnd</code> first, then plain{" "}
            <code>whenComplete</code>). The first matching target becomes the
            next state.
          </li>
          <li>
            If no transition matches when the command finishes, the machine
            exits.
          </li>
        </ol>
      </CollapsibleSection>

      <section className="flex flex-col gap-6">
        <h2
          className="text-2xl font-semibold leading-tight"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--fg)",
            letterSpacing: "-0.01em",
          }}
        >
          Beyond state machines: where v3 changes what you can write
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The <code>StateMachine</code> class is the headline v3 feature for
          this page, but the underlying coroutine model also unlocks command
          shapes that would otherwise need a custom <code>Command</code>{" "}
          subclass. The classic case: a command that reads a sensor value
          mid-sequence and picks a different next step based on what it saw.
        </p>

        <CodeBlock
          language="java"
          title="Grab a piece, then choose where to score based on what we got"
          code={`/**
 * A method on the Arm mechanism: it drives the arm directly and awaits the
 * intake's commands. Running the body on one mechanism lets it read a sensor
 * and branch with plain Java between steps.
 */
public Command grabAndScore() {
  return run(coroutine -> {
    setPosition(GROUND_PICKUP);
    coroutine.waitUntil(() -> atTarget(GROUND_PICKUP, TOL));
    coroutine.await(intake.grab());

    // Read sensor state into a local variable.
    int weight = sensors.readPieceWeight();

    if (weight == 0) {
      // Got nothing — bail quietly to stowed.
      setPosition(STOWED);
      coroutine.waitUntil(() -> atTarget(STOWED, TOL));
    } else if (weight > HEAVY_THRESHOLD) {
      // Too heavy for the high goal — score low.
      setPosition(LOW_GOAL);
      coroutine.waitUntil(() -> atTarget(LOW_GOAL, TOL));
      coroutine.await(intake.release());
    } else {
      setPosition(HIGH_GOAL);
      coroutine.waitUntil(() -> atTarget(HIGH_GOAL, TOL));
      coroutine.await(intake.release());
    }
  }).named("Grab & Score");
}`}
        />

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The powerful line is{" "}
          <code>int weight = sensors.readPieceWeight();</code> followed by a
          three-way <code>if/else</code> picking between different next
          sub-commands. Because the whole routine is one method body, a value
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
          <code>if</code>/<code>else</code>, and <code>await</code> the step you
          chose — no phase field, no manual child scheduling. The{" "}
          <code>StateMachine</code> class earlier in this lesson is a structured
          version of the same idea: declarative transitions between phases
          without writing the scaffolding by hand.
        </Box>
      </section>

      <Box
        variant="alert-info"
        tag="NOTE · API STATUS"
        title="This is the WPILib 2027 alpha"
      >
        Commands V3 and the <code>StateMachine</code> class run on{" "}
        <strong>Java 25</strong> and deploy to <strong>SystemCore</strong>. The
        stack is the WPILib 2027 <em>alpha</em> (GradleRIO{" "}
        <code>2027.0.0-alpha-6</code>), where the StateMachine API is still
        moving between builds (see the provisional note at the top).
      </Box>

      <Quiz
        title="Knowledge check"
        questions={[
          {
            id: 1,
            question:
              "A state runs a Command that completes immediately (a one-shot, no yield). Which kind of transition will move you to the next state?",
            options: [
              "switchTo(next).when(cond)",
              "switchTo(next).whenComplete()",
              "Either — they're interchangeable",
              "Neither; one-shot states aren't supported",
            ],
            correctAnswer: 1,
            explanation:
              "Conditional transitions (.when) are checked inside the loop that runs while the state's command is active. A one-shot never enters that loop, so the condition is never checked. Use whenComplete() (or whenCompleteAnd()) for one-shot states — it's checked exactly once after the command finishes.",
          },
          {
            id: 2,
            question:
              "What does sm.switchFromAny().to(safeState).when(eStop) do?",
            options: [
              "Adds an eStop transition only to the initial state",
              "Schedules safeState as the new default command for every mechanism",
              "Adds the same transition to every state that exists in the machine at the time the call is made",
              "Replaces every existing transition with this one",
            ],
            correctAnswer: 2,
            explanation:
              "switchFromAny() with no arguments is shorthand for adding the transition to every state currently in the machine. States added after this call don't get the transition retroactively, so declare cross-cutting transitions after you've added all the states you want them to apply to.",
          },
          {
            id: 3,
            question:
              "Why is setInitialState() required, and how does WPILib enforce it?",
            options: [
              "It's a convention; nothing enforces it",
              "Runtime check only — you'll see an IllegalStateException the first time the machine runs",
              "It's enforced at build time, the same way .named() is on regular command builders",
              "It auto-defaults to the first state added; you only need it to override",
            ],
            correctAnswer: 2,
            explanation:
              "A state machine with no initial state has nothing to run, so the intent is for the build to reject it — the same compile-time enforcement Commands V3 applies to .named() on command builders. (Exact mechanism is still being finalized in the 2027 alpha; see the provisional note at the top of this page.)",
          },
          {
            id: 4,
            question:
              "A conditional transition fires while a state's command is running. What happens in this order?",
            options: [
              "The next state's command starts, then the old command is canceled in the background",
              "The state's onExit callbacks run, the current command is canceled, and the next state takes over in the same scheduler tick",
              "The scheduler yields, then everything happens on the next tick",
              "onExit fires after the next state's onEnter, so they can hand off state",
            ],
            correctAnswer: 1,
            explanation:
              "Transitions are synchronous within a single scheduler iteration. onExit runs first, then the current command is canceled, then the next state becomes current and its command is forked — all without an extra yield. This is intentional so a chain of fast transitions doesn't waste scheduler cycles.",
          },
          {
            id: 5,
            question:
              "What's the practical difference between a StateMachine and a Command.sequence(...) of the same commands?",
            options: [
              "Nothing — StateMachine is implemented as a Command.sequence internally",
              "StateMachine supports transitions back to earlier phases and entry/exit hooks; Command.sequence only runs phases in order, top to bottom",
              "Command.sequence is faster because it doesn't have to check transitions",
              "StateMachine can only have two states; Command.sequence is unlimited",
            ],
            correctAnswer: 1,
            explanation:
              "Command.sequence(...) is a linear pipeline — A then B then C. A StateMachine is a graph: any state can transition to any other state at any time, with onEnter/onExit hooks and switchFromAny interrupts. If your routine can repeat phases, skip phases, or recover by jumping back, you want a state machine, not a sequence.",
          },
        ]}
      />
    </PageTemplate>
  );
}
