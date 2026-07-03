import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";

export default function BuildingSubsystems() {
  return (
    <PageTemplate title="Mechanisms">
      <KeyConceptSection
        title="Mechanisms with WPILib Commands V3"
        description={[
          "A mechanism models one physical part of the robot: an arm, a flywheel, the drivetrain. In Commands V3, Mechanism is a base class you extend. It gives you factory methods (run(), runRepeatedly(), idle()) that hand you a Command builder you can name, schedule, or compose.",
          "One class per physical thing, hardware as private fields, configuration in the constructor. Default behavior comes from an automatic idle() default (override it with setDefaultCommand) rather than a periodic() override, and the WPILib compiler plugin enforces .named(...) on every command at build time; forget it and the project won't compile.",
        ]}
        concept="One mechanism per physical thing. The base class gives you Command factories; you give it your hardware and the per-command behavior."
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
          Anatomy of a Mechanism
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          A v3 mechanism is a regular Java class that{" "}
          <code>extends Mechanism</code>. Hardware lives in private fields,
          configuration happens in the constructor, and every public method that
          callers will schedule returns a <code>Command</code> built from one of
          the base class&apos;s factory methods.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — a Mechanism from the inside out"
          code={`public class Arm extends Mechanism {
  // 1. Hardware lives in private fields.
  private final TalonFX motor = new TalonFX(31);
  private final PositionVoltage positionVoltage = new PositionVoltage(0);

  // 2. Configuration happens once, in the constructor.
  public Arm() {
    var config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Brake;
    motor.getConfigurator().apply(config);

    // No setDefaultCommand needed here: Mechanism automatically installs a
    // low-priority idle() default. Call setDefaultCommand(...) only when you
    // want a holding behavior instead of "do nothing".
  }

  // 3. Public methods return Commands built from the base-class factories.
  //    .named(...) is enforced at compile time — leave it off, build breaks.
  public Command goTo(Angle target, Angle tolerance) {
    return run(coroutine -> {
      motor.setControl(positionVoltage.withPosition(target.in(Degrees)));
      coroutine.waitUntil(() -> atTarget(target, tolerance));
    }).named("Arm:goTo:" + target.in(Degrees));
  }

  // 4. Plain reader methods stay plain — only schedulable behavior
  //    needs to return a Command.
  public Angle getPosition() {
    return Degrees.of(motor.getPosition().getValueAsDouble());
  }

  // atTarget(...) — simple |current − target| < tolerance check.
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
          The factory methods you&apos;ll actually use
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          The <code>Mechanism</code> base class provides three built-in
          factories that cover most of the commands you&apos;ll write. Each
          returns a builder; chain <code>.named(&quot;...&quot;)</code> to
          finish it.
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          <Box
            variant="concept"
            tag="ONCE THEN HOLD"
            title="mech.run(coroutine -> { ... })"
            code={
              <code>
                run(coroutine -&gt; {"{"} ... {"}"}).named(&quot;...&quot;)
              </code>
            }
          >
            <p>
              Runs the lambda once. If the body uses{" "}
              <code>coroutine.yield()</code>, <code>waitUntil(...)</code>, or
              <code> await(...)</code>, the command stays scheduled until the
              body falls off. Most teaching examples use this.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="EVERY TICK"
            title="mech.runRepeatedly(runnable)"
            code={<code>runRepeatedly(this::tick).named(...)</code>}
          >
            <p>
              Calls the runnable every scheduler tick (20 ms) for as long as the
              command is scheduled. This is the v3 spelling of &quot;put it in{" "}
              <code>periodic()</code>&quot;, but it&apos;s scoped to a command
              instead of always-on.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="DO NOTHING"
            title="mech.idle()"
            code={<code>setDefaultCommand(idle())</code>}
          >
            <p>
              Returns a ready-made command that yields forever at{" "}
              <code>LOWEST_PRIORITY</code>. Every mechanism already has this
              wired as its default — set your own default to override.
            </p>
          </Box>
        </div>

        <Box
          variant="alert-info"
          tag="NOTE · NAMING IS ENFORCED"
          title=".named(...) is a compile-time requirement"
        >
          Both <code>run(...)</code> and <code>runRepeatedly(...)</code> hand
          back a staged builder, not a finished <code>Command</code>. A WPILib
          compiler plugin watches for that builder escaping a method without a
          matching <code>.named(...)</code> call and turns it into a build
          error, so every command shows up in telemetry under a name you
          actually chose.
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
          Default commands and idle behavior
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Every mechanism has a default command. The scheduler runs it whenever
          no higher-priority command requires that mechanism, and pre-empts it
          the moment one does. Out of the box, the default is{" "}
          <code>idle()</code> — a no-op park at <code>LOWEST_PRIORITY</code> —
          so a fresh mechanism just sits there safely. Call{" "}
          <code>setDefaultCommand(...)</code> to override it. A default that
          needs no controller (like hold-in-place) can be set right in the
          mechanism&apos;s constructor; a default that depends on a joystick is
          set from the <strong>Teleop OpMode</strong> instead, because the
          mechanism&apos;s constructor has no controller (see the Triggers
          page).
        </p>

        <CodeBlock
          language="java"
          title="Two common default-command shapes"
          code={`public class Elevator extends Mechanism {
  // ... motors

  public Elevator() {
    // No controller needed, so set it here: hold position instead of going limp.
    setDefaultCommand(
      run(coroutine -> {
        motor.setControl(positionVoltage.withPosition(getPosition().in(Rotations)));
        coroutine.park();
      }).named("Elevator:hold")
    );
  }
}

// The drivetrain's teleop drive default needs the controller, so it's set from
// the Teleop OpMode's constructor — not the mechanism's. (More on the Triggers page.)
@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  public TeleopOpMode(Robot robot) {
    robot.drivetrain.setDefaultCommand(
      robot.drivetrain
        .runRepeatedly(() -> robot.drivetrain.drive(driver.getLeftX(), driver.getLeftY(), driver.getRightX()))
        .named("Drivetrain:teleopDrive")
    );
  }
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
          A second example: leader/follower flywheel
        </h2>

        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--fg-mute)" }}
        >
          Multi-motor mechanisms follow the same shape. The Phoenix 6 follower
          control still lives in the constructor, the per-command behavior still
          comes from <code>run(...)</code>, and reads stay as plain getters.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — the new line is the Follower"
          code={`public class Flywheel extends Mechanism {
  private final TalonFX leader = new TalonFX(21);
  private final TalonFX follower = new TalonFX(22);

  public Flywheel() {
    var config = new TalonFXConfiguration();
    leader.getConfigurator().apply(config);
    follower.getConfigurator().apply(config);

    // The whole "multi-motor" part is this one line.
    // Follower mirrors the leader's percent output, opposite direction.
    follower.setControl(new Follower(leader.getDeviceID(), true));
  }

  // setVoltage(...) and spinTo(...) — same shape as the Arm's commands,
  // just calling leader.setControl(...) instead of motor.setControl(...).
}`}
        />

        <Box variant="alert-warning" title="Physical hardware vs. code example">
          The workshop&apos;s flywheel mechanism only has one physical motor.
          The follower wiring above is included to show the multi-motor pattern.
          If you&apos;re running this on the workshop hardware, either drop the
          follower lines or add a second physical motor.
        </Box>
      </section>

      <Box
        variant="alert-info"
        tag="NOTE · API STATUS"
        title="This is the WPILib 2027 alpha"
      >
        Commands V3 — including the <code>Mechanism</code> base class, the
        builder-chain factories, and the compile-time <code>.named(...)</code>{" "}
        enforcement — run on <strong>Java 25</strong> and deploy to{" "}
        <strong>SystemCore</strong>. The stack is the WPILib 2027 <em>alpha</em>{" "}
        (GradleRIO <code>2027.0.0-alpha-6</code>).
      </Box>

      <Quiz
        title="Knowledge Check"
        questions={[
          {
            id: 1,
            question:
              "Which statement about the v3 Mechanism base class is correct?",
            options: [
              "Mechanism is an interface you implement, not a class you extend",
              "Mechanism is a base class you extend; it has no periodic() override, supplies the run()/runRepeatedly()/idle() factories, and auto-installs a low-priority idle() default",
              "Every command factory returns a finished Command, so .named(...) is optional",
              "Mechanism is final; you compose it with helper classes instead of subclassing",
            ],
            correctAnswer: 1,
            explanation:
              "Mechanism is a base class you extend. There's no periodic() override — use a runRepeatedly(...) default or publish from inside command bodies. It supplies the run()/runRepeatedly()/idle() factories, and every mechanism automatically holds a low-priority idle() default until something else commands it.",
          },
          {
            id: 2,
            question:
              "You write mech.run(coroutine -> motor.setControl(...)) and return it directly. The build fails. Why?",
            options: [
              "run() requires a Runnable, not a Consumer<Coroutine>",
              'You forgot to chain .named("...") — the WPILib compiler plugin enforces command naming',
              "You can't call setControl from inside a coroutine body",
              "Mechanism methods can't be called from other Mechanism methods",
            ],
            correctAnswer: 1,
            explanation:
              "run() returns a staged builder, not a finished Command. The WPILib compiler plugin watches for that builder leaving a method without a .named(...) call and turns the situation into a build error. Pick a name and the build passes.",
          },
          {
            id: 3,
            question:
              "Where should motors, sensors, and motor configuration live in a v3 mechanism?",
            options: [
              "All three in the constructor",
              "Hardware fields at the top, configuration in the constructor, control in command factories",
              "All three inside the body of each command factory",
              "Hardware and configuration both in periodic(), control wherever",
            ],
            correctAnswer: 1,
            explanation:
              "Declare hardware as private fields so they're shared across the mechanism, apply configuration once in the constructor at startup, and put per-command control logic inside the run(...) / runRepeatedly(...) bodies that callers schedule.",
          },
          {
            id: 4,
            question:
              "What does mech.idle() return, and why does every mechanism start with it as the default command?",
            options: [
              "A command that turns off the motors — chosen so unused mechanisms don't draw current",
              "A command that yields forever at LOWEST_PRIORITY — chosen so any real command can pre-empt it without fighting the scheduler",
              "A no-op that finishes immediately, freeing the mechanism for the next command",
              "Nothing — idle() is just a marker; the scheduler skips mechanisms without a real default",
            ],
            correctAnswer: 1,
            explanation:
              "idle() returns a command whose body parks (yields forever) at LOWEST_PRIORITY. Anything scheduled on the mechanism — a teleop default, a trigger-bound command, an auto routine — outranks it and takes over immediately. Override setDefaultCommand(...) to swap idle() for a hold-in-place or teleop-drive default of your own.",
          },
          {
            id: 5,
            question:
              "The v3 Mechanism base class doesn't define a periodic() hook. How do you run every-tick behavior like telemetry?",
            options: [
              "Telemetry isn't supported in v3 mechanisms",
              "Override the inherited periodic() from the parent — Mechanism still has it",
              "A runRepeatedly(...) default command, or NetworkTables publishers updated inside command bodies",
              "A standalone Telemetry mechanism that wraps every other mechanism",
            ],
            correctAnswer: 2,
            explanation:
              "The Mechanism base class intentionally doesn't define periodic(). When you want every-tick behavior, set a runRepeatedly(...) command as the default — the scheduler runs it whenever nothing else owns the mechanism. For pure telemetry that should always publish, instantiate NetworkTables publishers in the constructor and push to them from inside the command bodies that produce the values.",
          },
        ]}
      />
    </PageTemplate>
  );
}
