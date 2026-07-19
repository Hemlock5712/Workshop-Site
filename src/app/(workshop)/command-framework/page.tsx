import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import { Book, BookOpen, GitBranch } from "lucide-react";

export default function CommandFramework() {
  return (
    <PageTemplate title="Command-Based Framework">
      <KeyConceptSection
        title="The Command-Based Framework"
        description={[
          "Command-based programming organizes robot code into three pieces — Triggers (when), Mechanisms (what hardware), and Commands (the actions to run on that hardware). The scheduler is the loop that ties them together: it watches Triggers, schedules Commands, and tracks which command owns which Mechanism so two commands never fight for the same motor.",
          "Commands V3 gives each piece a concrete type: Mechanism for hardware, Command for the actions, and Scheduler for the loop. On this team, most commands are holds — they keep re-sending a setpoint so the motor stays actively commanded — and routines are built by chaining commands together.",
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
          command), so they clean themselves up when the scope exits.
        </Box>

        <Box
          variant="concept"
          tag="WHAT"
          title="Mechanisms"
          subtitle={<strong>One physical thing each</strong>}
        >
          An arm, a flywheel, the drivetrain. The type is <code>Mechanism</code>
          , a class you <code>extends</code>. Hardware lives in private fields,
          configuration in the constructor.
        </Box>

        <Box
          variant="concept"
          tag="HOW"
          title="Commands"
          subtitle={<strong>Named actions, mostly holds</strong>}
        >
          Factory methods on a mechanism, each returning a named{" "}
          <code>Command</code>. Most of ours are <em>holds</em> — they keep the
          motor at a setpoint until something else takes over.
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
          Holds: what our commands actually are
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Our mechanism commands — <code>arm.scoring()</code>,{" "}
          <code>flywheel.spinUp()</code>, <code>robot.stow()</code> — are{" "}
          <strong>holds</strong>: they keep re-sending their setpoint forever,
          so the motor stays actively commanded. The plain-words version: press
          a button, the arm goes to the scoring angle <em>and stays there</em>,
          fighting gravity, until another command takes the arm over.
        </p>

        <CodeBlock
          language="java"
          title="A hold — runRepeatedly re-sends the closed-loop request"
          code={`// From the 2027-Template's Arm mechanism. runRepeatedly re-runs the body
// every scheduler tick, so the closed-loop request is re-sent forever.
// This command never finishes on its own — that's what makes it a hold.
public Command scoring() {
  return runRepeatedly(() -> setPosition(SCORING_POSITION))
      .named("scoring (hold)");
}`}
        />

        <Box
          variant="alert-warning"
          tag="THE ONE RULE"
          title="A hold never finishes, so nothing may ever wait on a hold"
        >
          <p>
            Put a hold inside <code>Command.sequence(...)</code> and the
            sequence sticks on it <em>forever</em> — the hold has no finish
            line, so the next step never starts. Every hold is named with{" "}
            <code>(hold)</code> so you can catch this: if a stuck routine is
            sitting on a <code>(hold)</code> command on the dashboard or in the
            log, that&apos;s the bug. The fix is to give the hold a finish line
            at the call site: <code>arm.scoring().until(arm::isAtTarget)</code>.
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
          Chaining: how routines get built
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Routines — especially autos — are built by <strong>chaining</strong>.
          Chaining is as far as most routines ever need to go, and it takes just
          three tools, learned in this order:
        </p>

        <ol
          className="ml-5 list-decimal space-y-2 text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <strong>
              <code>Command.sequence(a, b, c)</code>
            </strong>{" "}
            — steps that finish on their own (a <code>DriveToPose</code> leg,
            for example) can sit in a sequence as-is.
          </li>
          <li>
            <strong>
              <code>.until(mech::isAtTarget)</code>
            </strong>{" "}
            — gives a hold a finish line, right where you need one. This is
            always applied at the call site; mechanisms never bake waiting into
            their command factories.
          </li>
          <li>
            <strong>
              <code>Command.race(step, hold)</code>
            </strong>{" "}
            — &quot;do this step WHILE holding that pose.&quot; A race ends when
            its first member finishes and cancels the rest — and since a hold
            never finishes, the step is always what decides.
          </li>
        </ol>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Plus one seatbelt: <code>.withTimeout(Seconds.of(...))</code> on any
          step that waits on a sensor condition, so an auto never burns the
          whole period stuck at a setpoint it can&apos;t quite reach.
        </p>

        <CodeBlock
          language="java"
          title="The reference routine — drive, stow, drive (from the 2027-Template)"
          code={`routine =
    Command.sequence(
            // Leg 1: DriveToPose finishes on its own, so it can sit in a
            // sequence as-is.
            new DriveToPose(robot.drivetrain, pose1),

            // Stow is a hold - it would stick here forever. .until(...) gives
            // it a finish line: this step ends the moment the arm actually
            // reaches the stow angle.
            robot.stow().until(robot.arm::isAtTarget).named("stow until stowed"),

            // Leg 2 WHILE holding the stow pose: the race ends when
            // DriveToPose finishes (the hold never finishes, so the drive
            // always decides) and cancels the hold.
            Command.race(new DriveToPose(robot.drivetrain, pose2), robot.stow())
                .named("drive holding stow"))
        .named("Drive Stow Drive (Chained)");`}
        />

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveChainedOpMode.java"
          title="DriveStowDriveChainedOpMode.java — the full working example"
          icon={<GitBranch className="w-5 h-5" />}
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
          Decorators
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          A <em>decorator</em> is a method on the <code>Command</code> interface
          that returns a wrapped command with some behavior added. The ones
          below cover the cases that come up daily.
        </p>

        <CodeBlock
          language="java"
          title="The decorators you'll actually reach for"
          code={`// Names a command. Compile-time enforced on every command-builder chain.
// Without this call, the project does not compile. Holds get a "(hold)"
// suffix so a stuck routine is visible on the dashboard.
arm.scoring().named("scoring (hold)");

// Gives a hold a finish line at the call site: this step ends the moment
// the arm reaches its target. This is THE tool for using a hold in a
// sequence.
arm.scoring().until(arm::isAtTarget).named("scoring until there");

// The seatbelt: cap any condition-waiting step so an auto can't sit at an
// unreachable setpoint for the rest of the period.
arm.scoring().until(arm::isAtTarget).withTimeout(Seconds.of(2)).named("scoring capped");

// Adds an interrupt-only cleanup hook. Fires only on cancellation —
// not on normal completion.
arm.scoring()
   .whenCanceled(() -> motor.setControl(voltageOut.withOutput(0)))
   .named("scoring safeCancel");

// Raises priority so this command pre-empts a lower-priority command that's
// already running on the same mechanism (default priority is 0; idle() is
// the lowest).
emergencyStop()
   .withPriority(1)
   .named("eStop");`}
        />

        <Box
          variant="alert-info"
          tag="NOTE · DECORATOR RULES"
          title="A few rules worth knowing"
        >
          <p>
            <code>.named(...)</code> is required: the WPILib compiler plugin
            makes an unnamed command a build error, so every builder chain ends
            in <code>.named(...)</code>. The interrupt-only cleanup hook is{" "}
            <code>.whenCanceled(...)</code>. Time-based options take a{" "}
            <code>Time</code> (e.g. <code>Seconds.of(...)</code>), not a raw{" "}
            <code>double</code>, in keeping with v3&apos;s units-everywhere
            policy. And note what is <em>not</em> here: there are no{" "}
            <code>...AndWait</code> variants on mechanisms — waiting is always
            spelled <code>.until(...)</code> at the call site.
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
          The advanced dialects (you can skip these)
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Commands V3 has two more ways to write routines. You don&apos;t need
          either one for this workshop — chaining covers everything we build —
          but you should know they exist so the template code doesn&apos;t
          surprise you.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Box
            variant="concept"
            tag="OPTIONAL · COROUTINES"
            title="fork / await / waitUntil"
            code={<code>coroutine.await(command);</code>}
          >
            <p>
              A command body that pauses itself from the inside. Reach for it
              when a hold must span many steps or the logic needs loops and
              branches — it keeps everything actively commanded between steps,
              where a chained sequence lets a mechanism sit
              owned-but-uncommanded. See{" "}
              <a
                href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveOpMode.java"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                DriveStowDriveOpMode.java
              </a>{" "}
              — the same routine as above, written in this dialect.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="OPTIONAL · STATE MACHINE"
            title="StateMachine"
            code={<code>machine.when(...)</code>}
          >
            <p>
              The robot is always in exactly one named state, and
              buttons/sensors move it between states; illegal jumps simply
              don&apos;t exist because no transition was declared for them. See{" "}
              <a
                href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/StateMachineTeleop.java"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                StateMachineTeleop.java
              </a>{" "}
              and the State Machines lesson in Advanced Topics.
            </p>
          </Box>
        </div>
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
            <strong>Commands</strong> — hold factories on each mechanism, named
            with a <code>(hold)</code> suffix.
          </li>
          <li>
            <strong>Triggers</strong> — controller bindings + the scoping rules
            (global / opmode / command).
          </li>
          <li>
            <strong>PID control</strong> — closed-loop requests for the holds to
            re-send.
          </li>
          <li>
            <strong>Motion Magic</strong> — profiled-position requests with
            acceleration and cruise-velocity bounds.
          </li>
          <li>
            <strong>Auto routines</strong> — chained sequences of drive legs and
            holds, exactly the pattern above.
          </li>
        </ol>

        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Ground truth for this lesson
          </h3>
          <p className="text-[var(--foreground)] mb-4">
            Our team&apos;s reference implementation, with the hold and chaining
            rules written up in its onboarding guide:
          </p>
          <div className="flex flex-col gap-3">
            <DocumentationButton
              href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/ONBOARDING.md"
              title="2027-Template ONBOARDING.md — Holds never finish"
              icon={<GitBranch className="w-5 h-5" />}
            />
            <DocumentationButton
              href="https://docs.wpilib.org/en/stable/docs/software/commandbased/index.html"
              title="WPILib Command-Based Programming Guide"
              icon={<Book className="w-5 h-5" />}
            />
          </div>
        </div>
      </section>

      <Box
        variant="alert-info"
        tag="NOTE · API STATUS"
        title="This is the WPILib 2027 alpha"
      >
        Commands V3 — the staged builder, the compile-time naming enforcement,
        and the <code>StateMachine</code> class — runs on{" "}
        <strong>Java 25</strong> and deploys to <strong>SystemCore</strong>. The
        stack is the WPILib 2027 <em>alpha</em> (GradleRIO{" "}
        <code>2027.0.0-alpha-6</code>, Phoenix 6 <code>26.50.0-alpha-1</code>),
        so the exact APIs are still moving between alpha builds. This page was
        last verified against alpha-6 in July 2026.
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
              ".named(...) is enforced — every command-builder chain has to end with a name call or the project won't compile. That's also why every hold carries a \"(hold)\" suffix: the name is what you'll see on the dashboard when a routine gets stuck.",
          },
          {
            id: 3,
            question:
              "You put arm.scoring() — a hold — directly into Command.sequence(driveLeg, arm.scoring(), nextLeg). What happens when the auto runs?",
            options: [
              "The arm reaches the scoring angle and the sequence moves on",
              "The sequence sticks on the hold forever — nextLeg never starts",
              "The scheduler throws an exception at schedule time",
              "The hold is skipped because sequences ignore non-finishing commands",
            ],
            correctAnswer: 1,
            explanation:
              'THE ONE RULE: a hold never finishes, so nothing may ever wait on a hold. The sequence waits on scoring (hold) forever. On the dashboard you\'d see the routine sitting on a "(hold)"-named command — that name is the debugging clue.',
          },
          {
            id: 4,
            question:
              "What's the right fix for the stuck sequence in the previous question?",
            options: [
              "Call arm.scoringAndWait() instead",
              "Give the hold a finish line at the call site: arm.scoring().until(arm::isAtTarget)",
              "Wrap the hold in Command.parallel so the sequence doesn't wait",
              "Lower the hold's priority so the next step can pre-empt it",
            ],
            correctAnswer: 1,
            explanation:
              'Waiting is always spelled at the call site with .until(...) — there are no "...AndWait" methods on mechanisms. Add .withTimeout(...) as a seatbelt if the target might be unreachable.',
          },
          {
            id: 5,
            question:
              "In Command.race(new DriveToPose(robot.drivetrain, pose2), robot.stow()), which member decides when the race ends?",
            options: [
              "Whichever finishes first — it could be either",
              "DriveToPose — the hold never finishes, so the drive leg is always what decides, and the race cancels the hold",
              "robot.stow() — holds win races because they run at higher priority",
              "Neither — a race needs an explicit .until(...) to end",
            ],
            correctAnswer: 1,
            explanation:
              'A race ends when its first member finishes and cancels the rest. Since a hold never finishes, the self-finishing step is always the decider — that\'s why race is the tool for "do this step WHILE holding that pose."',
          },
        ]}
      />
    </PageTemplate>
  );
}
