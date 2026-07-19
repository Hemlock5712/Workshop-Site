import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

export default function AddingCommands() {
  return (
    <PageTemplate title="Commands">
      <KeyConceptSection
        title="Commands with WPILib Commands V3"
        description={[
          "A command is what a mechanism can do: a factory method that returns a named Command the scheduler can run. Anything that wants to move the arm does it through a command — the setters stay private, which is how the scheduler prevents two things fighting over the same motor.",
          "On this team almost every mechanism command is a hold: it keeps re-sending its closed-loop setpoint forever, so the motor stays actively commanded until another command takes the mechanism over. Hold a button (whileTrue), the arm goes to the angle and stays there; release it, and the default command comes back.",
        ]}
        concept="A command is a named action from a mechanism factory. Most of ours are holds — and a hold never finishes."
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
          The default command shape: a hold
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          <code>runRepeatedly(...)</code> re-runs its body every scheduler tick,
          so the closed-loop request is re-sent forever. That&apos;s the whole
          recipe: one line of setup, re-sent repeatedly, named with a{" "}
          <code>(hold)</code> suffix. This is how every preset on the robot is
          written.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — hold commands, exactly as the 2027-Template writes them"
          code={`// The subsystem owns the hardware, keeps its setters private, and exposes
// commands. Each factory returns a Command that re-sends its setpoint
// forever — a hold. The "(hold)" suffix is part of the convention.
public Command vertical() {
  return runRepeatedly(() -> setPosition(VERTICAL_POSITION))
      .named("vertical (hold)");
}

public Command horizontal() {
  return runRepeatedly(() -> setPosition(HORIZONTAL_POSITION))
      .named("horizontal (hold)");
}

public Command scoring() {
  return runRepeatedly(() -> setPosition(SCORING_POSITION))
      .named("scoring (hold)");
}

// Not a command — a question other code can ask. Chains use it as a
// finish line: arm.scoring().until(arm::isAtTarget).
public boolean isAtTarget() {
  return Math.abs(getPosition() - getTargetPosition()) < TOLERANCE;
}

// Private. The only way to move the arm is through a command.
private void setPosition(double position) { ... }`}
        />

        <Box
          variant="alert-warning"
          tag="THE ONE RULE"
          title="A hold never finishes, so nothing may ever wait on a hold"
        >
          <p>
            A hold has no finish line, so a sequence that contains a bare hold
            sticks on it forever. Every hold is named with <code>(hold)</code>{" "}
            so you can catch this: if a stuck routine is sitting on a{" "}
            <code>(hold)</code> command on the dashboard or in the log,
            that&apos;s the bug.
          </p>
        </Box>

        <Box
          variant="alert-info"
          tag="NOTE · NO …AndWait METHODS"
          title="Waiting happens at the call site, not in the factory"
        >
          <p>
            Mechanisms never bake waiting into their commands — there is no{" "}
            <code>scoringAndWait()</code>. When a chain needs the hold to end,
            you give it a finish line where you use it:{" "}
            <code>arm.scoring().until(arm::isAtTarget)</code>. One factory per
            preset, and the caller decides whether to wait.
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
          Chaining: routines out of holds
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Routines that touch more than one mechanism are built where
          they&apos;re used — in an OpMode — by chaining the mechanisms&apos;
          commands. Three tools, in order: <code>Command.sequence</code> for
          steps that finish on their own, <code>.until(...)</code> to give a
          hold a finish line, and <code>Command.race(step, hold)</code> for
          &quot;do this step WHILE holding.&quot; Add{" "}
          <code>.withTimeout(...)</code> as the seatbelt on any step that waits
          on a sensor condition.
        </p>

        <CodeBlock
          language="java"
          title="Score the preload — built in an @Autonomous OpMode constructor"
          code={`routine =
    Command.sequence(
            // spinUp() is a hold — it would stick here forever. .until(...)
            // gives it a finish line, and .withTimeout(...) is the seatbelt:
            // if the wheel never quite reaches speed, the auto moves on after
            // two seconds instead of burning the whole period.
            robot.flywheel.spinUp()
                .until(robot.flywheel::isAtSpeed)
                .withTimeout(Seconds.of(2))
                .named("spin up"),

            // Feed WHILE the flywheel hold keeps the wheel at speed. The
            // feed step finishes (it has its own finish line), and the race
            // then cancels the hold.
            Command.race(
                    robot.intake.feed()
                        .until(robot.intake::isEmpty)
                        .named("feed until empty"),
                    robot.flywheel.spinUp())
                .named("feed holding speed"))
        .named("Score Preload");`}
        />

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          A race ends when its first member finishes and cancels the rest — and
          since a hold never finishes, the step is always what decides. The full
          drive-stow-drive version of this pattern lives in the template:
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveChainedOpMode.java"
          title="DriveStowDriveChainedOpMode.java — the chaining reference"
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
          When a command should finish on its own
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Not everything is a hold. A step with its own natural ending — drive
          this distance, run the roller until the beam break trips — can be a
          self-finishing command. The workshop template ships{" "}
          <code>utils/ClassicCommand</code>, a small base class with the
          explicit <code>initialize</code> / <code>execute</code> /{" "}
          <code>isFinished</code> / <code>end</code> lifecycle. Extend it,
          override what you need, and the instance <em>is</em> a{" "}
          <code>Command</code> — you&apos;ll see it again in{" "}
          <code>DriveToPoint</code>.
        </p>

        <CodeBlock
          language="java"
          title="DriveDistance.java — a self-finishing step"
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

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Because it finishes on its own, a step like this can sit in a{" "}
          <code>Command.sequence</code> as-is — no <code>.until(...)</code>{" "}
          needed. That&apos;s the dividing line: holds get finish lines at the
          call site; steps bring their own.
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
          Cancellation
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          A hold only ever ends by being cancelled — the driver releases a{" "}
          <code>whileTrue</code> button, a race&apos;s step finishes, an{" "}
          <code>.until(...)</code> condition trips. Usually that&apos;s fine
          as-is: the motor keeps its last closed-loop request in firmware until
          the next command sends a new one. When a command <em>does</em> need
          cleanup on interruption — stop the rollers, zero a voltage — that goes
          in a <code>.whenCanceled(...)</code> hook on the builder.
        </p>

        <CodeBlock
          language="java"
          title="A hold that cleans up after itself"
          code={`// The intake should never keep spinning after its command is taken away.
public Command feed() {
  return runRepeatedly(() -> setVelocity(FEED_SPEED))
      .whenCanceled(() -> roller.stopMotor())
      .named("feed (hold)");
}`}
        />

        <p
          className="text-[14px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The <code>whenCanceled</code> callback fires only when the command is
          interrupted, which for a hold is the only way it ends — so it&apos;s
          effectively the hold&apos;s &quot;on the way out&quot; hook.
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
          The advanced dialect: coroutines (optional)
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          v3 commands can also be written as a single body that pauses itself
          from the inside — <code>run(coroutine -&gt; {`{ ... }`})</code> with{" "}
          <code>coroutine.await(command)</code>, <code>fork(command)</code>, and{" "}
          <code>waitUntil(condition)</code>. Reach for it only when a hold must
          span many steps or the logic needs loops and branches; you won&apos;t
          need it in this workshop. The template keeps a worked example of the
          same drive-stow-drive routine in that dialect:
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/DriveStowDriveOpMode.java"
          title="DriveStowDriveOpMode.java — the coroutine dialect (optional)"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </section>

      <Box
        variant="alert-info"
        tag="NOTE · API STATUS"
        title="This is the WPILib 2027 alpha"
      >
        <code>runRepeatedly</code>, the staged builder, and the compile-time
        enforcement of <code>.named(...)</code> run on <strong>Java 25</strong>{" "}
        and deploy to <strong>SystemCore</strong>. The stack is the WPILib 2027{" "}
        <em>alpha</em> (GradleRIO <code>2027.0.0-alpha-6</code>), so the exact
        APIs are still moving between alpha builds. This page was last verified
        against alpha-6 in July 2026.
      </Box>

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              "What makes a mechanism command a hold, and how do you spell it in v3?",
            options: [
              "It sets the motor once and exits — run(coroutine -> setControl(...))",
              'It re-sends its closed-loop setpoint every tick and never finishes — runRepeatedly(() -> setPosition(TARGET)).named("target (hold)")',
              "It runs at maximum priority so nothing can interrupt it",
              "It waits on a condition — coroutine.waitUntil(this::atTarget)",
            ],
            correctAnswer: 1,
            explanation:
              'A hold keeps re-sending its setpoint forever, so the motor stays actively commanded and the command that issued the request keeps running as long as the request is active. runRepeatedly(...) is the spelling, and the "(hold)" suffix in the name is part of the convention.',
          },
          {
            id: 2,
            question: 'Why does every hold\'s name end in "(hold)"?',
            options: [
              "The compiler plugin requires the suffix for runRepeatedly commands",
              'So that when a routine gets stuck waiting on one, the dashboard and logs show a "(hold)" name — which tells you exactly what the bug is',
              "The scheduler uses the suffix to assign holds the lowest priority",
              "It's purely cosmetic — any name works the same",
            ],
            correctAnswer: 1,
            explanation:
              'THE ONE RULE is that a hold never finishes, so nothing may wait on one. Mistakes still happen — and when they do, the stuck routine sits on a command whose name literally says "(hold)". The naming convention turns a mystery hang into a one-glance diagnosis.',
          },
          {
            id: 3,
            question:
              "An auto needs the arm at scoring angle before the next step. The mechanism only exposes scoring(), a hold. What do you write?",
            options: [
              "arm.scoringAndWait() — mechanisms provide a waiting variant of each preset",
              "arm.scoring().until(arm::isAtTarget), with .withTimeout(...) as a seatbelt — the finish line is applied at the call site",
              "arm.scoring() directly — sequences detect holds and skip ahead automatically",
              "coroutine.await(arm.scoring()) — awaiting adds a finish line",
            ],
            correctAnswer: 1,
            explanation:
              'There are no "...AndWait" methods — waiting is always spelled at the call site with .until(...). Awaiting or sequencing a bare hold just moves the forever-wait somewhere else. The timeout keeps an unreachable setpoint from burning the rest of the period.',
          },
          {
            id: 4,
            question:
              "In Command.race(robot.intake.feed().until(robot.intake::isEmpty), robot.flywheel.spinUp()), what ends the race?",
            options: [
              "Whichever member finishes first — it's unpredictable",
              "The feed step — the flywheel hold never finishes, so the step always decides, and the race then cancels the hold",
              "The flywheel hold, once the wheel reaches speed",
              "The race never ends — one member is a hold",
            ],
            correctAnswer: 1,
            explanation:
              "A race ends when its first member finishes and cancels the rest. The hold can't finish, so the self-finishing step is always the decider — that's what makes race the tool for \"do this step WHILE holding.\"",
          },
          {
            id: 5,
            question:
              "How do you run cleanup code when a hold is interrupted (which is the only way a hold ends)?",
            options: [
              "Attach a .whenCanceled(runnable) hook on the command builder",
              "Wrap the body in a try/catch — cancellation throws a CancelledException",
              "Put the cleanup at the bottom of the body — it runs when the command ends",
              "Override an end(boolean interrupted) method on the hold",
            ],
            correctAnswer: 0,
            explanation:
              '.whenCanceled(...) registers a Runnable that fires only on cancellation. A cancelled command is simply dropped, so trailing code in the body never runs on interruption — for a hold, whenCanceled is effectively the "on the way out" hook.',
          },
        ]}
      />
    </PageTemplate>
  );
}
