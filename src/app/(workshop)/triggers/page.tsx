import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";

export default function Triggers() {
  return (
    <PageTemplate title="Triggers">
      <KeyConceptSection
        title="Triggers in Commands V3"
        description={[
          "A Trigger is a yes/no signal — a button, a sensor reading, any true-or-false question — with bind helpers attached: button.whileTrue(cmd), sensor.onTrue(cmd), and friends. A Trigger fires a Command.",
          "Every binding belongs to a scope (global, opmode, or command). Exiting that scope removes the binding automatically, so a binding's lifetime always matches the thing it belongs to: the whole program, a single match phase, or one running command.",
        ]}
        concept="A Trigger fires a Command. What matters is who owns the binding's lifetime, and therefore when it goes away."
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
          The basic shape
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          A <code>Trigger</code> exposes <code>onTrue</code> /{" "}
          <code>onFalse</code> / <code>whileTrue</code> /{" "}
          <code>whileFalse</code> for binding a command to an edge or a hold.
          Predicate-based triggers wrap any <code>BooleanSupplier</code> in{" "}
          <code>new Trigger(...)</code>, so a sensor reading binds the same way
          a button does.
        </p>

        <CodeBlock
          language="java"
          title="Binding a trigger"
          code={`CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

// Button → command. This is the team's default binding: while A is held,
// the scoring hold keeps the arm at the scoring angle. Release A and the
// hold is cancelled — the arm's DEFAULT COMMAND takes back over.
driver.a().whileTrue(arm.scoring());

// onTrue fires once at the rising edge. Use it for self-finishing
// commands — never for a bare hold (see the tip below).
driver.start().onTrue(drivetrain.resetHeading());

// Sensor → command. Same shape, just a different boolean source:
// while we're carrying a game piece, keep the arm stowed.
Trigger hasPiece = new Trigger(intake::hasPiece);
hasPiece.whileTrue(arm.stowed());`}
        />

        <Box
          variant="alert-tip"
          tag="RULE · HOLDS + whileTrue"
          title="Bind holds with whileTrue, so the default command can come back"
        >
          <p>
            Holds make the choice between these two bind methods matter a lot. A
            hold never finishes — so if you bind one with <code>onTrue</code>,
            it runs <em>forever</em>, and the mechanism&apos;s default command
            never gets the mechanism back. Bind holds with{" "}
            <code>whileTrue</code> instead: release the button, the hold is
            cancelled, and the default command takes over. Save{" "}
            <code>onTrue</code> for commands that finish on their own, like a
            heading reset.
          </p>
        </Box>

        <p
          className="text-[14px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The <code>Trigger</code> class and the controllers (like{" "}
          <code>CommandNiDsXboxController</code>) live under{" "}
          <code>org.wpilib.command3.button</code>. The interesting part
          isn&apos;t what you write at the binding site; it&apos;s{" "}
          <em>where</em> you write it, because that decides how long the binding
          lives.
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
          Why bindings are scoped
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Different phases of a match want different bindings: the A button
          might raise the arm in teleop and do nothing in auto. Scoping ties a
          binding&apos;s lifetime to the thing it belongs to. A binding made for
          a mode lives exactly as long as that mode is active; a binding made
          for a running command lives exactly as long as that command runs. When
          the mode changes or the command ends, its bindings go away with it.
        </p>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The payoff is that you never track or clear bindings by hand, and a
          binding can&apos;t linger into a phase it was never meant for. You
          declare each binding in the scope it belongs to and let the framework
          add and remove it at the right moments. The next sections cover the
          three scopes and when to reach for each.
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
          The three trigger scopes
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Every binding belongs to a scope. The scope decides when the binding
          goes away.
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          <Box
            variant="concept"
            tag="GLOBAL · LIFETIME OF PROGRAM"
            title="Bindings made in the Robot constructor"
          >
            <p>
              Created before any OpMode is selected, so they live as long as the
              robot program runs. Good fit for bindings that are genuinely
              always on: the template&apos;s brake-while-disabled (
              <code>RobotModeTriggers.disabled()</code>), an emergency stop, a
              low-battery alert. Not much else qualifies.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="OPMODE · LIFETIME OF MODE"
            title="Bindings made in an OpMode constructor"
          >
            <p>
              Live while the opmode is active; cleaned up when it exits.
              Teleop&apos;s driver-controller bindings, auto&apos;s
              sensor-trigger bindings, test mode&apos;s diagnostic toggles —
              each opmode declares its own and the framework swaps the active
              set when the mode changes.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="COMMAND · LIFETIME OF COMMAND"
            title="Bindings made inside a Command body"
          >
            <p>
              Live only while the command is scheduled. Useful for &quot;while
              this routine is running, also fire X on sensor Y&quot;. The extra
              binding disappears when the routine finishes or is cancelled.
            </p>
          </Box>
        </div>
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
          OpMode: a sibling to Mechanism
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          &quot;The mode the robot is in&quot; is a first-class concept: the{" "}
          <strong>OpMode</strong>. Where a <code>Mechanism</code> owns hardware,
          an OpMode owns the <em>policy</em> for a phase of the match — which
          bindings are live, which default commands are in force, what auto
          routine to run. Teleop, auto, and a utility/calibration mode each
          become their own class: you <code>extends PeriodicOpMode</code> and
          tag it <code>@Teleop</code>, <code>@Autonomous</code>, or{" "}
          <code>@Utility</code> (the framework discovers it by that annotation
          and lists it on the driver station). The bindings go in the{" "}
          <strong>constructor</strong>, and because the Triggers are constructed
          there, they&apos;re scoped to the OpMode and torn down automatically
          on a mode switch.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — bindings scoped to the mode"
          code={`@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  // Controllers on the driver station; the controller-dependent bindings below
  // are why these live here and not on Robot.
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);
  private final CommandNiDsXboxController operator = new CommandNiDsXboxController(1);

  // The framework constructs this when "Teleop" is selected and discards it on
  // a mode switch. Every binding here is scoped to this OpMode — no cleanup.
  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;
    final DriveMechanism drivetrain = robot.drivetrain;

    // Presets are holds, so they're bound with whileTrue: hold the button,
    // the arm holds the preset; release it, the arm's default command takes
    // back over. (onTrue on a hold would never give the mechanism back.)
    driver.a().whileTrue(arm.scoring());
    driver.b().whileTrue(arm.horizontal());
    driver.leftBumper().whileTrue(arm.stowed());

    operator.rightTrigger().whileTrue(drivetrain.brake());
  }
}`}
        />

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Selecting auto on the driver station <em>constructs</em> the auto
          OpMode (building its bindings) and tears down the teleop OpMode along
          with its bindings. When the driver picks Teleop again, a fresh
          TeleopOpMode is constructed and only its bindings come back. Each
          mode&apos;s bindings come and go with the mode; nothing to clean up by
          hand. The team&apos;s working example is{" "}
          <a
            href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/opmodes/TeleopOpMode.java"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            TeleopOpMode.java in the 2027-Template
          </a>
          .
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
          Command-scoped bindings
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The third scope is the most situational but worth knowing about.
          Bindings registered from <em>inside</em> a command body live as long
          as that command is scheduled. The instant the command finishes or is
          cancelled, the binding goes away.
        </p>

        <CodeBlock
          language="java"
          title="A binding that only exists while we're climbing"
          code={`public Command climb() {
  return climber.run(coroutine -> {
    // While the climb is in progress, the operator can abort with B. The
    // Trigger is constructed here, so it's scoped to this command — it
    // disappears the moment the command ends. lower() is self-finishing
    // (drive to the bottom, then end), which is why onTrue is right here.
    // It requires the climber, so scheduling it interrupts this climb.
    operator.b().onTrue(climber.lower());

    setHeight(TOP);                       // command the climber up
    coroutine.waitUntil(climber::atTop);  // hold until we're there
  }).named("climb");
}`}
        />

        <p
          className="text-[14px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Outside of <code>climb()</code> the operator&apos;s B button does
          whatever the opmode-level binding (or nothing) says it should. The
          abort binding exists only for the duration of the climb: it&apos;s
          created when the command starts and dropped the moment it ends, with
          no cleanup code of your own. (The body here uses the coroutine dialect
          — the optional advanced form from the Commands page — because a
          command-scoped binding can only be made from inside a running command
          body.)
        </p>
      </section>

      <Box
        variant="alert-info"
        tag="NOTE · API STATUS"
        title="All three binding scopes are shipped API"
      >
        The three scopes on this page (command, opmode, global) come straight
        from the WPILib 2027 alpha-6 scheduler: when a binding is created, the
        scheduler captures the <em>narrowest active scope</em> — the running
        command if there is one, else the current opmode, else global — and
        removes the binding when that scope ends. The template demonstrates the
        opmode and global scopes; command-scoped bindings work the same way but
        aren&apos;t shown there yet. The stack is the WPILib 2027 <em>alpha</em>
        , on <strong>Java 25</strong> and <strong>SystemCore</strong>, so the
        exact APIs are still moving between alpha builds. This page was last
        verified against alpha-6 in July 2026.
      </Box>

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              "You write driver.a().whileTrue(arm.scoring()) inside a TeleopOpMode's constructor. When does this binding go away?",
            options: [
              "Never — button bindings are always global",
              "When the teleop OpMode exits (e.g., auto starts, the robot disables, the mode changes)",
              "Only when you manually call binding.remove()",
              "When the bound command is cancelled",
            ],
            correctAnswer: 1,
            explanation:
              "Bindings registered inside an OpMode are opmode-scoped. They live for the lifetime of the opmode and are torn down automatically when it exits. This is the whole point of scoping — the binding lifetime matches the lifetime of the policy it's part of.",
          },
          {
            id: 2,
            question:
              "Which scope would you use for a binding that should only exist while a specific command is running?",
            options: [
              "Global — register in the Robot constructor",
              "OpMode — register inside the OpMode's constructor",
              "Command — register inside the command's body",
              "There's no way to scope a binding to a single command's lifetime",
            ],
            correctAnswer: 2,
            explanation:
              "Bindings registered from inside a command body live as long as that command is scheduled and disappear when it ends or is cancelled. Useful for routines that want to expose an abort button or sensor-triggered shortcut only while the routine is active.",
          },
          {
            id: 3,
            question:
              "What is OpMode conceptually a sibling of, in the v3 model?",
            options: [
              "Trigger — both are predicates on robot state",
              "Mechanism — both are first-class classes you write, with their own scoped lifetime and contents",
              "Command — both are scheduled by the framework",
              "Scheduler — both manage the run loop",
            ],
            correctAnswer: 1,
            explanation:
              "Mechanism owns hardware and the commands that act on it. OpMode owns policy — which bindings are live during a phase, what default commands are in force, what auto routine to run. They're the two structural classes you write in a v3 codebase: a Mechanism you extend (one per physical thing), and an OpMode you annotate @Teleop/@Autonomous/@Utility (one per phase of the match).",
          },
          {
            id: 4,
            question:
              "An emergency-stop binding should run no matter which OpMode is active. Where should it be registered?",
            options: [
              "At global scope (the Robot constructor), so it lives for the lifetime of the program",
              "Inside every OpMode's constructor, so every mode has it",
              "Inside a Command body that's always scheduled",
              "It can't be registered — global bindings are gone in v3",
            ],
            correctAnswer: 0,
            explanation:
              "Global scope is the right home for genuinely always-on bindings — emergency stops, low-battery alerts, anything that has to fire regardless of mode. Most other bindings should be opmode- or command-scoped so they don't pollute modes they shouldn't apply to.",
          },
        ]}
      />
    </PageTemplate>
  );
}
