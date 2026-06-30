import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import { Book, BookOpen } from "lucide-react";

export default function CommandFramework() {
  return (
    <PageTemplate title="Command-Based Framework">
      <KeyConceptSection
        title="The Command-Based Framework"
        description={[
          "Command-based programming organizes robot code into three pieces — Triggers (when), Mechanisms (what hardware), and Commands (the actions to run on that hardware). The scheduler is the loop that ties them together: it watches Triggers, schedules Commands, and tracks which Mechanism owns whom so two commands never fight for the same motor.",
          "Commands V3 gives each piece a concrete type: Mechanism for hardware, Command for the coroutine-bodied actions, and Scheduler for the loop. You compose commands either with factories (Command.sequence / Command.parallel) or as a real method body, not just a tree of group objects.",
          "The top-level wiring: a Robot class owns the mechanisms, and each mode — driver teleop, an autonomous routine, a calibration task — is its own OpMode class. You'll see that on the Triggers and Running the Program pages.",
        ]}
        concept="Triggers schedule Commands. Commands operate on Mechanisms. The Scheduler enforces who-owns-what so nothing collides."
      />

      <div className="grid md:grid-cols-3 gap-6">
        <Box
          variant="concept"
          tag="WHEN"
          title="Triggers"
          subtitle={<strong>BooleanSuppliers wired to commands</strong>}
        >
          Buttons, sensor predicates, custom expressions — anything that
          evaluates to a boolean. Bindings are scoped (global / opmode /
          command), so they auto-clean up when the scope exits.
        </Box>

        <Box
          variant="concept"
          tag="WHAT"
          title="Mechanisms"
          subtitle={<strong>One physical thing each</strong>}
        >
          An arm, a flywheel, the drivetrain. The type is <code>Mechanism</code>{" "}
          — a class you <code>extends</code>. Hardware lives in private fields,
          configuration in the constructor.
        </Box>

        <Box
          variant="concept"
          tag="HOW"
          title="Commands"
          subtitle={<strong>Coroutine-shaped bodies</strong>}
        >
          A single method body that runs on the scheduler. Calls out to{" "}
          <code>coroutine.wait</code>, <code>waitUntil</code>,{" "}
          <code>await</code>, <code>fork</code> whenever it needs to suspend.
        </Box>
      </div>

      <section className="flex flex-col gap-8 mt-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          The big picture
        </h2>
        <ArchitectureDiagram variant="simple" />
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
          Decorators
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          A <em>decorator</em> is a method on the <code>Command</code> interface
          (or on the builder) that returns a wrapped command with some behavior
          added. The ones below cover the cases that come up daily.
        </p>

        <CodeBlock
          language="java"
          title="The decorators you'll actually reach for"
          code={`// Names a command. Compile-time enforced on every command-builder chain.
// Without this call, the project does not compile.
arm.scoring().named("arm:scoring");

// Finishes the command early when a condition becomes true. Here: stop
// holding as soon as the arm reaches its target.
arm.scoring().until(arm::isAtTarget).named("arm:scoring:untilThere");

// Adds an interrupt-only cleanup hook. Fires only on cancellation —
// not on normal completion. This matters because a cancelled coroutine is
// dropped: code after a park() or an infinite loop never runs, so any
// "on interrupt" cleanup goes here.
arm.scoring()
   .whenCanceled(() -> motor.setControl(voltageOut.withOutput(0)))
   .named("arm:scoring:safeCancel");

// Raises priority so this command pre-empts a lower-priority command that's
// already running on the same mechanism (default priority is 0; idle() is
// the lowest).
emergencyStop()
   .withPriority(1)
   .named("eStop");

// Sequence two commands: do A, then B. Command.sequence is the v3 way to
// chain — the resulting command requires everything its children require.
Command.sequence(arm.horizontal(), intake.grab()).named("pickup");`}
        />

        <Box
          variant="alert-info"
          tag="NOTE · DECORATOR RULES"
          title="A few rules worth knowing"
        >
          <p>
            <code>.named(...)</code> is required — the WPILib compiler plugin
            makes an unnamed command a build error, so every builder chain ends
            in <code>.named(...)</code>. The interrupt-only cleanup hook is{" "}
            <code>.whenCanceled(...)</code>; it&apos;s where interrupt cleanup
            must live, because a cancelled coroutine is simply dropped.
            Time-based options take a <code>Time</code> (e.g.{" "}
            <code>Seconds.of(...)</code>), not a raw <code>double</code>, in
            keeping with v3&apos;s units-everywhere policy. Chain and group
            commands with the <code>Command.sequence(...)</code> /{" "}
            <code>Command.parallel(...)</code> factories.
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
          Composition: two ways to combine commands
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          You combine commands two ways — in sequence, or in parallel. The{" "}
          <strong>composition factories</strong> (<code>Command.sequence</code>{" "}
          / <code>Command.parallel</code>) combine whole commands; the combined
          command automatically requires everything its children require. The{" "}
          <strong>coroutine helpers</strong> (<code>await</code> /{" "}
          <code>awaitAll</code> / <code>awaitAny</code> / <code>fork</code> /{" "}
          <code>wait</code> / <code>waitUntil</code>), called from inside a
          command body, let one command coordinate steps from the inside — handy
          when the sequence depends on runtime data.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Box
            variant="concept"
            tag="FACTORIES · WHOLE COMMANDS"
            title="Command.sequence, Command.parallel"
            code={<code>Command.sequence(a, b, c)</code>}
          >
            <p>
              Combine commands into one routine, then hand it to the scheduler
              or bind it to a trigger. The combined command inherits the union
              of its children&apos;s requirements, so the scheduler knows
              everything the routine will touch before it starts. This is the
              everyday way to coordinate several mechanisms.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="COROUTINE · INSIDE ONE BODY"
            title="coroutine.await, awaitAll, awaitAny"
            code={<code>coroutine.awaitAll(a, b);</code>}
          >
            <p>
              From inside a <code>run(coroutine -&gt; {`{ ... }`})</code> body
              you can pause on other work: <code>await</code> one command,{" "}
              <code>awaitAll</code> / <code>awaitAny</code> several,{" "}
              <code>fork</code> a background task, or <code>wait</code> /{" "}
              <code>waitUntil</code> for a duration or a condition. Best when
              the steps depend on sensor readings at runtime.
            </p>
          </Box>
        </div>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The two compose: a coroutine body can <code>await</code> a command
          built with <code>Command.sequence</code>, and a sequence can contain a
          command whose body coordinates further work. Pick the spelling
          that&apos;s clearer for the routine in front of you.
        </p>

        <CodeBlock
          language="java"
          title="Two ways to build a command"
          code={`// ── Composition factories: combine whole commands ───────────────────
// Coordinate several mechanisms by combining their commands. The result
// requires the arm, the flywheel, and the intake automatically.
public Command scoreSequence() {
  return Command.sequence(
      arm.scoring(),
      Command.parallel(flywheel.spinUp(), intake.feed()),
      arm.vertical()
  ).named("scoreSequence");
}

// ── Coroutine body: one command, paused from the inside ──────────────
// Runs on one mechanism; the helpers let it wait inline. Reach for this
// when a step depends on a sensor reading or a delay at runtime.
public Command nudgeForward() {
  return drivetrain.run(coroutine -> {
    drivetrain.setControl(forward);      // start moving
    coroutine.wait(Seconds.of(0.5));     // hold for half a second...
    drivetrain.setControl(stop);         // ...then stop
  }).named("nudgeForward");
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
          The three parallel shapes, in one table
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          There are three flavors of parallel. One is a factory (
          <code>Command.parallel</code>); the other two are coroutine helpers.
        </p>

        <CodeBlock
          language="java"
          title="What each parallel shape means"
          code={`// "Run both, finish when both finish."
//   Command.parallel(a, b)                       // factory flavor
//   coroutine.awaitAll(a, b)                     // coroutine flavor

// "Run both, finish when the first one finishes; cancel the loser."
//   coroutine.awaitAny(a, b)

// "Run both, finish when the deadline (first arg) finishes; cancel the rest."
//   coroutine -> { coroutine.fork(background); coroutine.await(deadline); }
//        (fork starts background, await blocks on deadline,
//         coroutine exit cancels the still-running fork)`}
        />

        <Box
          variant="alert-info"
          tag="NOTE"
          title="awaitAny and fork cover the asymmetric cases"
        >
          <p>
            There&apos;s one parallel factory for the symmetric &quot;wait for
            all&quot; case (<code>Command.parallel</code>), and the coroutine
            helpers express the asymmetric cases with normal method calls:{" "}
            <code>awaitAny</code> for &quot;first done wins&quot; and{" "}
            <code>fork</code> + <code>await</code> for a background task guarded
            by a deadline. A <code>fork</code> that&apos;s still running when
            the outer body exits is cancelled automatically.
          </p>
        </Box>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Implementation sequence
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The workshop builds up a command-based project in this order. Each
          step assumes the previous one is in place.
        </p>

        <ol
          className="ml-5 list-decimal space-y-2 text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <strong>Mechanisms</strong> — hardware fields, configuration,{" "}
            <code>setDefaultCommand</code>.
          </li>
          <li>
            <strong>Commands</strong> — coroutine-bodied factory methods on each
            mechanism (and cross-mechanism routines).
          </li>
          <li>
            <strong>Triggers</strong> — controller bindings + the scoping rules
            (global / opmode / command).
          </li>
          <li>
            <strong>PID control</strong> — closed-loop commands wrapping CTRE
            position / velocity requests.
          </li>
          <li>
            <strong>Motion Magic</strong> — profiled-position commands with
            acceleration and cruise-velocity bounds.
          </li>
          <li>
            <strong>State machines &amp; auto routines</strong> — the V3{" "}
            <code>StateMachine</code> class for anything with phases that can
            repeat, skip, or interrupt.
          </li>
        </ol>

        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Official WPILib documentation
          </h3>
          <p className="text-[var(--foreground)] mb-4">
            For the full v3 design doc and the upstream API reference:
          </p>
          <DocumentationButton
            href="https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html"
            title="WPILib Command-Based Programming Guide"
            icon={<Book className="w-5 h-5" />}
          />
        </div>
      </section>

      <Box
        variant="alert-info"
        tag="NOTE · API STATUS"
        title="This is the WPILib 2027 alpha"
      >
        Commands V3 — the staged builder, the coroutine helpers, the
        compile-time naming enforcement, and the <code>StateMachine</code> class
        — run on <strong>Java 25</strong> and deploy to{" "}
        <strong>SystemCore</strong>. The stack is the WPILib 2027 <em>alpha</em>{" "}
        (GradleRIO <code>2027.0.0-alpha-6</code>, Phoenix 6{" "}
        <code>26.50.0-alpha-1</code>), so the exact APIs are still moving
        between alpha builds.
      </Box>

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              "What are the three pieces of the command-based framework, and which one owns hardware?",
            options: [
              "Inputs, Logic, Outputs — Outputs owns hardware",
              "Triggers, Mechanisms, Commands — Mechanisms owns hardware",
              "Sensors, Subsystems, Scheduler — Subsystems owns hardware",
              "Buttons, Routines, Motors — Motors owns hardware",
            ],
            correctAnswer: 1,
            explanation:
              "Triggers say when to run something, Mechanisms own the hardware (motors, sensors, configuration), and Commands are the actions that get scheduled.",
          },
          {
            id: 2,
            question:
              "Which decorator is enforced at compile time by the WPILib compiler plugin?",
            options: [
              ".until(BooleanSupplier)",
              ".named(String)",
              ".whenCanceled(Runnable)",
              ".withPriority(int)",
            ],
            correctAnswer: 1,
            explanation:
              ".named(...) is enforced — every command-builder chain has to end with a name call or the project won't compile, so every command shows up in telemetry under a name you actually chose.",
          },
          {
            id: 3,
            question:
              'Which expresses "run both, the first one to finish wins, cancel the loser"?',
            options: [
              "Command.parallel(a, b)",
              "coroutine.awaitAny(a, b)",
              "coroutine.awaitAll(a, b)",
              "There's no way to express this",
            ],
            correctAnswer: 1,
            explanation:
              "coroutine.awaitAny(a, b) schedules both together; the first to finish returns control to the caller and the rest are cancelled. The deadline shape — a background task guarded by one command — is fork + await.",
          },
          {
            id: 4,
            question:
              "You write a routine as Command.sequence(a, b), and elsewhere you await the same two commands from inside a mechanism's run(coroutine -> { coroutine.await(a); coroutine.await(b); }) body. What's the practical difference?",
            options: [
              "Command.sequence is faster — coroutine bodies pay a per-await yield cost",
              "Command.sequence inherits the union of its children's requirements automatically; a coroutine body holds the requirements of the mechanism it runs on, so reach for the factory for fixed multi-mechanism routines and the body when the steps are data-driven",
              "The coroutine body cancels its children when interrupted; Command.sequence doesn't",
              "Nothing — they compile to identical bytecode",
            ],
            correctAnswer: 1,
            explanation:
              'Both express "a then b." Command.sequence automatically requires everything its children require, so it\'s the clean way to combine commands across several mechanisms. A coroutine body runs on (and requires) the mechanism whose run(...) created it and awaits work from the inside — reach for it when the sequence depends on runtime data. Pick the factory for fixed, multi-mechanism routines; pick the body when the steps branch on sensor readings.',
          },
          {
            id: 5,
            question:
              "A coroutine body forks a background command and then exits via await on a different command. What happens to the forked child?",
            options: [
              "It keeps running independently — fork detaches it from the parent",
              "It's cancelled automatically when the parent coroutine exits",
              "It transfers ownership to the next command scheduled on the same mechanism",
              "It throws an IllegalStateException — fork-then-exit is not allowed",
            ],
            correctAnswer: 1,
            explanation:
              "coroutine.fork ties the child's lifetime to the parent's. When the body returns (normally or via cancellation), still-running forks are cancelled — so a forked background task can't outlive the routine that started it.",
          },
        ]}
      />
    </PageTemplate>
  );
}
