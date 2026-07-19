import PageTemplate from "@/components/PageTemplate";
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
    <PageTemplate title="State Machines">
      <KeyConceptSection
        title="State Machines with WPILib Commands V3"
        description={[
          "A state machine models a system as a set of discrete states, an active behavior per state, and transitions that move between them. WPILib's Commands V3 ships a first-class StateMachine class that gives you all of this, including entry/exit hooks and any-state interrupts, without writing scaffolding by hand.",
          "This is an optional, advanced dialect. In everyday teleop, each button holds a superstructure preset (whileTrue) — hold A, the scoring hold runs; let go, the default command comes back. With a state machine, the robot is instead always in exactly one named state, and buttons/sensors move it between states. The machine cancels the old state's command and starts the new one for you; illegal jumps simply don't exist because no transition was declared for them.",
        ]}
        concept="A state is a Command that runs while the machine is in it. Transitions are edge-triggered conditions that cancel the current state's command and move to the next state. onEnter / onExit fire around each transition."
      />

      <Box
        variant="alert-tip"
        tag="OPTIONAL · ADVANCED"
        title="You don't need this lesson to build a working robot"
      >
        Everything in the workshop — teleop presets, autos — is covered by
        holds, button bindings, and chaining. Reach for a{" "}
        <code>StateMachine</code> only when button-per-preset stops being
        enough: sequences that must repeat, skip, or recover by jumping back a
        phase, or a superstructure where illegal combinations need to be
        impossible by construction. The team&apos;s worked example is{" "}
        <a
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/StateMachineTeleop.java"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          StateMachineTeleop.java in the 2027-Template
        </a>{" "}
        — the same teleop as the ordinary hold-per-button OpMode, rebuilt as a
        four-state machine.
      </Box>

      <Box
        variant="alert-info"
        tag="OFFICIAL · WPILIB 2027 ALPHA-6"
        title="StateMachine is a shipped WPILib API"
      >
        This lesson teaches the official Commands-v3 <code>StateMachine</code>{" "}
        class (<code>org.wpilib.command3.StateMachine</code>), released in
        WPILib 2027 alpha-6 in May 2026. Everything on this page is checked
        against the published source. Alpha APIs can still shift before the 2027
        kickoff release, but this is the real class, not a preview sketch.
      </Box>

      <div className="flex flex-wrap gap-4">
        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/StateMachineTeleop.java"
          title="StateMachineTeleop.java — the team's reference example"
          icon={<GitBranch className="w-5 h-5" />}
        />
        <DocumentationButton
          href="https://github.com/wpilibsuite/allwpilib/blob/main/design-docs/commands-v3-state-machines.md"
          title="WPILib State Machine Design Doc"
          icon={<Book className="w-5 h-5" />}
        />
        <DocumentationButton
          href="https://github.com/wpilibsuite/allwpilib/pull/8297"
          title="StateMachine API Pull Request"
          icon={<GitPullRequest className="w-5 h-5" />}
        />
      </div>

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
          Building a state machine takes four steps. Each state wraps a single{" "}
          <code>Command</code>. Transitions are declared on the states
          themselves and are checked every scheduler tick while that state is
          active.
        </p>

        <CodeBlock
          language="java"
          title="Superstructure as a state machine (the StateMachineTeleop pattern)"
          code={`import org.wpilib.command3.Command;
import org.wpilib.command3.StateMachine;
import org.wpilib.command3.StateMachine.State;

// 1. Construct — name is required and shows up in telemetry.
StateMachine sm = new StateMachine("Superstructure");

// 2. Add states. Each state owns a Command — here they're the mechanism's
//    ordinary "(hold)" commands, the same ones the button bindings use.
State stowed  = sm.addState(arm.stowed());
State pickup  = sm.addState(arm.pickup());
State scoring = sm.addState(arm.scoring());

// 3. Set the initial state. setInitialState() is enforced at compile time —
//    leaving it out is a build error, not a runtime surprise.
sm.setInitialState(stowed);

// 4. Wire transitions. Because every state's command is a hold (it never
//    finishes), every transition here is a .when(...) — checked each tick
//    while the state runs. Declaring the graph is what makes illegal jumps
//    impossible: stowed can't teleport to scoring, because no transition says so.
stowed.switchTo(pickup).when(operator.a());
pickup.switchTo(scoring).when(gripper::hasGamePiece);
scoring.switchTo(stowed).when(() -> !gripper.hasGamePiece());

// Any-state interrupt: "get safe now" wins from anywhere.
sm.switchFromAny().to(stowed).when(operator.b());`}
        />

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <code>arm.stowed()</code> and friends are the same hold factories you
          built on the Mechanisms page — <code>runRepeatedly</code> re-sending a
          setpoint, named <code>&quot;stowed (hold)&quot;</code>. The state
          machine doesn&apos;t care how a state&apos;s command is built, but
          holds fit it naturally: the machine cancels the old state&apos;s hold
          and starts the new one on each transition, so the mechanism is always
          actively commanded and THE ONE RULE is never violated — nothing ever{" "}
          <em>waits</em> on the hold; transitions watch conditions instead.
        </p>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Here are those four steps in the workshop&apos;s real code: the{" "}
          <code>6-StateBased</code> branch runs the whole Arm + Flywheel teleop
          as one state machine — stowed, pickup, spin-up, and ready states,
          button-driven transitions, a sensor-driven{" "}
          <code>flywheel::isAtTarget</code> handoff, and a{" "}
          <code>switchFromAny</code> panic interrupt.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="6-StateBased"
          filePath="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
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
                on its own. Use this for self-finishing state commands (like a
                one-shot <code>fireOnce()</code>). A hold never finishes, so a{" "}
                <code>whenComplete()</code> on a hold-backed state will never
                fire — use <code>.when(...)</code> there instead.
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
            code={`State aiming  = sm.addState(turret.aimAtGoal());   // a hold — never finishes
State scoring = sm.addState(shooter.fireOnce());   // self-finishing one-shot

// Conditional: the aiming hold runs until the turret reports on-target.
aiming.switchTo(scoring).when(turret::aimedAtGoal);

// Completion: fireOnce() finishes on its own; loop it while we have a ball.
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
            state&apos;s main command: schedule a background animation, stiffen
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
            Some transitions should fire regardless of which state is active:
            emergency interrupts, mode overrides, &quot;back to idle on
            disable&quot;. Declare those on the state machine itself with{" "}
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
            There is also an exit variant:{" "}
            <code>sm.switchFromAny().toExitStateMachine().when(eStop)</code>{" "}
            ends the whole machine instead of moving to another state, and a
            single state can do the same with{" "}
            <code>state.exitStateMachine().when(...)</code>.
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
            The state&apos;s command is forked, then <code>onEnter</code>{" "}
            callbacks fire, so they can see the command already running.
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
          Where this sits next to the other dialects
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Commands V3 gives you three ways to express a routine, and this team
          teaches them in this order: <strong>chaining</strong> (
          <code>Command.sequence</code> + call-site <code>.until</code> +{" "}
          <code>race</code>) is the everyday tool and as far as most routines
          ever need to go; <strong>coroutines</strong> (
          <code>fork / await / waitUntil</code>) handle logic with loops and
          branches inside one command body; and the{" "}
          <strong>StateMachine</strong> on this page handles behavior that jumps
          between named phases. The second two are optional dialects — worth
          recognizing in the template, not required learning. Compare the three
          side by side in the template&apos;s opmodes folder:{" "}
          <a
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveChainedOpMode.java"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            DriveStowDriveChainedOpMode.java
          </a>{" "}
          (chaining),{" "}
          <a
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveOpMode.java"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            DriveStowDriveOpMode.java
          </a>{" "}
          (coroutines), and{" "}
          <a
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/StateMachineTeleop.java"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            StateMachineTeleop.java
          </a>{" "}
          (this page).
        </p>
      </section>

      <Box
        variant="alert-info"
        tag="NOTE · API STATUS"
        title="This is the WPILib 2027 alpha"
      >
        Commands V3 and the <code>StateMachine</code> class run on{" "}
        <strong>Java 25</strong> and deploy to <strong>SystemCore</strong>. The
        stack is the WPILib 2027 <em>alpha</em> (GradleRIO{" "}
        <code>2027.0.0-alpha-6</code>) — the release where StateMachine first
        shipped. This page was last verified against alpha-6 in July 2026.
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
              "setInitialState() is marked @PostConstructionInitializer, and the WPILib compiler plugin fails the build if you construct a StateMachine and never call it — the same build-time enforcement Commands V3 applies to .named() on command builders. As a backstop, a machine that reaches the scheduler without one throws IllegalStateException when it starts.",
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
