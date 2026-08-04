import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

export default function JavaBasics() {
  return (
    <PageTemplate
      title="About twelve pieces of Java hold up this whole site"
      emphasis="twelve pieces of Java"
      lede="The specimen is the arm from Workshop-Code branch 1-Subsystem — the version you build at Mechanisms, and deliberately the smallest arm in the course. Fifty-odd lines of a language you may never have seen. This page takes that file apart until nothing in it is a mystery."
      needs={[
        <>
          Nothing. No open project, no robot, no simulator, no build. Every file
          this page reads is printed on the page. You read here; you write on
          the lessons after this one.
        </>,
        <>
          The arm in the template you cloned at <strong>Project Setup</strong>{" "}
          is a different, longer file —{" "}
          <code>src/main/java/frc/robot/subsystems/arm/Arm.java</code>, the
          finished version. Leave it alone for now. It will make sense by{" "}
          <strong>Finish Lines</strong>.
        </>,
      ]}
      time="Roughly 40 minutes"
    >
      <KeyConceptSection
        description={[
          "Every example below is copied out of real robot code — the arm and flywheel you build at Mechanisms and Commands. There are no animals, shapes, or bank accounts on this page.",
        ]}
        concept="You will read far more Java on this site than you write. Reading is the skill this page builds."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>What you&apos;ll get:</strong> you can open a mechanism file,
          point at any line, and say what it does.{" "}
          <strong>Roughly 40 minutes.</strong>
        </p>
        <p className="mt-3">
          One honest limit: this is not a Java course. It covers the twelve
          things this site actually uses and then stops. If some Java feature is
          not on this page, you will not need it here.
        </p>
      </Box>

      {/* ── the whole file ───────────────────────────────────────────── */}
      <LessonSection
        id="start-with-a-whole-file"
        title="Start with a whole file"
      >
        <p className="prose-body measure">
          Below is the entire arm mechanism at the earliest point in the course.
          Read it once now. It will look like noise, and that is fine — the rest
          of the page is this file, taken apart. Only the three-line license
          comment at the very top has been cut.
        </p>

        <CodeBlock
          language="java"
          title="src/main/java/frc/robot/subsystems/Arm.java — Workshop-Code, branch 1-Subsystem"
          code={`package frc.robot.subsystems;

import com.ctre.phoenix6.CANBus;
import com.ctre.phoenix6.configs.TalonFXConfiguration;
import com.ctre.phoenix6.controls.VoltageOut;
import com.ctre.phoenix6.hardware.CANcoder;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.signals.InvertedValue;
import com.ctre.phoenix6.signals.NeutralModeValue;
import frc.robot.utils.TalonFXUtil;
import org.wpilib.command3.Mechanism;

/**
 * The arm. One TalonFX motor plus a CANcoder that measures the arm's angle.
 *
 * <p>Every mechanism in this project follows the same pattern: extend {@code Mechanism}, keep the
 * hardware in private fields, and set it up once in the constructor.
 *
 * <p>Right now the arm can only do one thing: push a voltage at the motor. The methods are public
 * so you can call them and watch the arm move. In the next lesson (2-Commands) we wrap them in
 * commands.
 */
public class Arm extends Mechanism {
  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX motor = new TalonFX(31, canivore);
  private final CANcoder encoder = new CANcoder(32, canivore);

  // Pushes a set voltage at the motor. No sensors involved.
  private final VoltageOut voltageOut = new VoltageOut(0);

  public Arm() {
    TalonFXConfiguration config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Coast; // easy to move by hand
    config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;

    // Use the CANcoder for position, so the motor knows the arm's real angle.
    config.Feedback.withRemoteCANcoder(encoder);

    TalonFXUtil.applyConfigWithRetries(motor, config);
  }

  /**
   * Push the arm with a fixed voltage. Positive voltage moves the arm counter-clockwise.
   *
   * @param voltage The voltage to apply.
   */
  public void setVoltage(double voltage) {
    motor.setControl(voltageOut.withOutput(voltage));
  }

  /** Stop the arm motor. */
  public void stop() {
    motor.stopMotor();
  }
}`}
        />

        <p className="prose-body measure">
          Ignore the details for a moment and look at the shape. Every Java file
          on this site has the same four bands, top to bottom:
        </p>

        <ol
          className="ml-5 list-decimal space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <strong>
              <code>package</code>, then <code>import</code> lines.
            </strong>{" "}
            Bookkeeping. Where this file lives, and what other files it borrows
            from.
          </li>
          <li>
            <strong>Fields.</strong> The things the arm owns — a bus, a motor,
            an encoder, a voltage request. Four lines.
          </li>
          <li>
            <strong>A constructor</strong> — <code>public Arm()</code>. Setup
            that runs once.
          </li>
          <li>
            <strong>Methods</strong> — <code>setVoltage(...)</code> and{" "}
            <code>stop()</code>. The things the arm can do.
          </li>
        </ol>
      </LessonSection>

      {/* ── 1. class vs object ───────────────────────────────────────── */}
      <LessonSection
        id="a-class-is-a-blueprint"
        title="A class is a blueprint. An object is the thing you get."
      >
        <CodeBlock
          language="java"
          hideControls
          code={`public class Arm extends Mechanism {`}
        />

        <p className="prose-body measure">
          <code>class Arm</code> describes an arm. On its own it does nothing —
          it is a drawing, not a robot. Somewhere else a line says{" "}
          <code>new Arm()</code>, and <em>that</em> builds one real arm from the
          drawing. The drawing is the <strong>class</strong>. What you get back
          is an <strong>object</strong>.
        </p>

        <p className="prose-body measure">
          One class, as many objects as you want. The flywheel uses the same{" "}
          <code>TalonFX</code> class twice —{" "}
          <code>new TalonFX(21, canivore)</code> and{" "}
          <code>new TalonFX(22, canivore)</code> — and gets two separate motors.
        </p>

        <p className="prose-body measure">
          <code>extends Mechanism</code> says: start from the{" "}
          <code>Mechanism</code> class, then add to it. Everything{" "}
          <code>Mechanism</code> can do, <code>Arm</code> can do, without a line
          of it appearing in <code>Arm.java</code>. That is where{" "}
          <code>runRepeatedly(...)</code> comes from at{" "}
          <strong>Commands</strong>. Search <code>Arm.java</code> for it and you
          will not find it defined anywhere, and it works anyway.
        </p>

        <p className="prose-body measure">
          Here is where the arm object is actually made. This is the class the
          whole robot starts from:
        </p>

        <CodeBlock
          language="java"
          title="src/main/java/frc/robot/Robot.java — branch 1-Subsystem (license and doc comment trimmed)"
          code={`package frc.robot;

import frc.robot.subsystems.Arm;
import frc.robot.subsystems.Flywheel;
import frc.robot.utils.SimStartup;
import org.wpilib.command3.Scheduler;
import org.wpilib.framework.OpModeRobot;

public class Robot extends OpModeRobot {
  // The robot's mechanisms. Public so OpModes can use them.
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  public Robot() {}

  @Override
  public void simulationInit() {
    // Lets simulation start enabled when a launcher asks for it. Does nothing in a normal run.
    // See SimStartup for details.
    SimStartup.arm();
  }

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}`}
        />

        <p className="prose-body measure">
          Two classes, two objects, one line each. Both are{" "}
          <code>public final</code>, which is why an OpMode can reach them later
          by writing <code>robot.arm</code>.
        </p>
      </LessonSection>

      {/* ── 2. braces ────────────────────────────────────────────────── */}
      <LessonSection
        id="braces-semicolons-and-the-three"
        title="Braces, semicolons, and the three places a line can live"
      >
        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <code>{"{"}</code> opens a block and <code>{"}"}</code> closes it.
            Everything between them belongs to whatever came immediately before
            the <code>{"{"}</code>.
          </li>
          <li>
            Blocks sit inside blocks. In <code>Arm.java</code>, the class block
            contains the constructor block, which contains five statements.
          </li>
          <li>
            Every statement ends in <code>;</code>. Lines that open a block —{" "}
            <code>public Arm() {"{"}</code> — do not, because they are not
            statements.
          </li>
          <li>
            Indentation is for you. The compiler only reads braces. Nothing
            breaks if your indentation is wrong, and nothing works if a brace
            is.
          </li>
          <li>
            <code>{"//"}</code> comments out the rest of the line.{" "}
            <code>{"/* ... */"}</code> comments out a span.{" "}
            <code>{"/** ... */"}</code> is the same thing with a documentation
            tool reading it — that is the paragraph at the top of{" "}
            <code>Arm.java</code>.
          </li>
        </ul>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Where a line lives changes whether it compiles"
        >
          <p>
            Two lines from <code>Arm.java</code> that look similar and are not
            interchangeable:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`private final TalonFX motor = new TalonFX(31, canivore);   // a FIELD
TalonFXConfiguration config = new TalonFXConfiguration();  // a STATEMENT`}
            />
          </div>
          <p className="mt-3">
            The field goes directly inside the class braces. The statement only
            compiles inside a method or constructor. Swap them and the error
            does not say &quot;wrong region&quot; — it says something like{" "}
            <code>&lt;identifier&gt; expected</code>, pointing at a line that
            looks perfectly fine.
          </p>
        </Box>
      </LessonSection>

      {/* ── 3. fields ────────────────────────────────────────────────── */}
      <LessonSection
        id="fields-private-final-and-new"
        title={
          <>
            3. Fields: <code>private</code>, <code>final</code>, and{" "}
            <code>new</code>
          </>
        }
        outlineLabel="Fields: private, final, and new"
      >
        <CodeBlock
          language="java"
          title="Arm.java, branch 1-Subsystem — the four fields"
          code={`private final CANBus canivore = new CANBus("canivore");
private final TalonFX motor = new TalonFX(31, canivore);
private final CANcoder encoder = new CANcoder(32, canivore);

// Pushes a set voltage at the motor. No sensors involved.
private final VoltageOut voltageOut = new VoltageOut(0);`}
        />

        <p className="prose-body measure">
          Take the second one apart. Six parts, left to right:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <code>private</code> — only code inside <code>Arm.java</code> can
            touch this. No other file can reach <code>motor</code> at all.
          </li>
          <li>
            <code>final</code> — <code>motor</code> will point at this one
            TalonFX for the rest of the object&apos;s life. You cannot later
            write <code>motor = </code> something else. It does <em>not</em>{" "}
            freeze the motor: <code>motor.setControl(...)</code> still works.
          </li>
          <li>
            <code>TalonFX</code> — the type. What kind of thing goes in the box.
          </li>
          <li>
            <code>motor</code> — the name you use everywhere else in the file.
          </li>
          <li>
            <code>=</code> — put the thing on the right into the box on the
            left.
          </li>
          <li>
            <code>new TalonFX(31, canivore)</code> — <code>new</code> is the
            word that builds an object. The <code>31</code> and{" "}
            <code>canivore</code> are handed to <code>TalonFX</code>: CAN ID 31,
            on the CANivore bus.
          </li>
        </ul>

        <p className="prose-body measure">
          <code>public</code> is the opposite of <code>private</code>.{" "}
          <code>Robot.java</code> writes <code>public final Arm arm</code>{" "}
          precisely so other files <em>can</em> reach it.
        </p>

        <Box variant="concept" title="Why one word here matters so much">
          <p>
            On this branch <code>setVoltage</code> is <code>public</code>. One
            branch later it becomes <code>private</code>, and that single word
            is most of the Commands lesson. Once nothing outside the arm can
            shove a voltage at the motor, every request has to arrive as a
            command — and the scheduler can keep two commands from fighting over
            the same motor.
          </p>
        </Box>
      </LessonSection>

      {/* ── 4. constructor ───────────────────────────────────────────── */}
      <LessonSection
        id="the-constructor-code-that-runs"
        title="The constructor: code that runs once, when the object is made"
      >
        <CodeBlock
          language="java"
          title="Arm.java, branch 1-Subsystem — the constructor"
          code={`public Arm() {
  TalonFXConfiguration config = new TalonFXConfiguration();
  config.MotorOutput.NeutralMode = NeutralModeValue.Coast; // easy to move by hand
  config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;

  // Use the CANcoder for position, so the motor knows the arm's real angle.
  config.Feedback.withRemoteCANcoder(encoder);

  TalonFXUtil.applyConfigWithRetries(motor, config);
}`}
        />

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            Same name as the class, and no return type in front of it. That is
            what makes it a constructor rather than a method.
          </li>
          <li>
            It runs <strong>once</strong>, automatically, the instant{" "}
            <code>new Arm()</code> runs. You never call it by name and there is
            no way to run it twice on the same object.
          </li>
          <li>
            Fields with a <code>= new ...</code> on them are built first, then
            the constructor body runs. So <code>motor</code> and{" "}
            <code>encoder</code> already exist by the time the last line hands
            them to Phoenix.
          </li>
          <li>
            <code>config</code> is a <strong>local variable</strong>, not a
            field. It exists from that line until the closing brace and then it
            is gone. <code>setVoltage</code> cannot see it.
          </li>
          <li>
            <code>()</code> is the parameter list, empty here. Constructors can
            take parameters: <code>public TeleopOpMode(Robot robot)</code> takes
            one <code>Robot</code>.
          </li>
        </ul>

        <Box
          variant="alert-info"
          tag="WHY THIS COMES BACK LATER"
          title="Button bindings live in a constructor"
        >
          <p>
            The driver&apos;s buttons are wired up inside{" "}
            <code>TeleopOpMode</code>&apos;s constructor. Runs once, when the
            mode starts — not every loop. The Triggers lesson is built on that
            fact, so it is worth having straight now.
          </p>
        </Box>
      </LessonSection>

      {/* ── 5. method signature ──────────────────────────────────────── */}
      <LessonSection
        id="reading-a-method-signature"
        title="Reading a method signature"
      >
        <CodeBlock
          language="java"
          title="Arm.java, branch 1-Subsystem — the first method on the site"
          code={`/**
 * Push the arm with a fixed voltage. Positive voltage moves the arm counter-clockwise.
 *
 * @param voltage The voltage to apply.
 */
public void setVoltage(double voltage) {
  motor.setControl(voltageOut.withOutput(voltage));
}`}
        />

        <p className="prose-body measure">
          The first line carries five separate pieces of information:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <code>public</code> — who is allowed to call it.
          </li>
          <li>
            <code>void</code> — what it hands back when it finishes:{" "}
            <strong>nothing</strong>. You call this for its effect, not for an
            answer.
          </li>
          <li>
            <code>setVoltage</code> — the name.
          </li>
          <li>
            <code>(double voltage)</code> — the parameter list. One value comes
            in, it is a <code>double</code>, and inside the method body it is
            called <code>voltage</code>.
          </li>
          <li>
            <code>{"{"}</code> — the body starts here and runs to the matching{" "}
            <code>{"}"}</code>.
          </li>
        </ul>

        <p className="prose-body measure">
          Three type words show up constantly. <code>double</code> is a number
          that can have a decimal point — <code>3.0</code>, <code>6.0</code>,{" "}
          <code>0.25</code>. <code>boolean</code> is <code>true</code> or{" "}
          <code>false</code> and nothing else. <code>void</code> only ever
          appears as a return type and means the method hands nothing back.
        </p>

        <p className="prose-body measure">
          <code>public void stop()</code> in the same file has an empty
          parameter list, so you call it as <code>arm.stop()</code> with nothing
          in the parentheses.
        </p>

        <p className="prose-body measure">
          A method that hands back a <code>boolean</code> arrives later, at{" "}
          <strong>Finish Lines</strong>. Same five pieces, different return
          type:
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch 5-GettersAndSetters — you will write this later"
          code={`/** True when the arm has reached its target angle. */
public boolean isAtTarget() {
  return getPosition().isNear(getTargetPosition(), tolerance);
}`}
        />
      </LessonSection>

      {/* ── 6. return + the dot ──────────────────────────────────────── */}
      <LessonSection
        id="return-the-dot-and-why"
        title={
          <>
            6. <code>return</code>, the dot, and why the type decides what you
            can type next
          </>
        }
        outlineLabel="return, the dot, and why the type decides what you can type next"
      >
        <p className="prose-body measure">
          <code>return</code> hands a value back to whoever called the method,
          and stops the method right there. In <code>isAtTarget()</code> the
          value handed back is a <code>true</code> or a <code>false</code> —
          which matches the everyday idea that a function gives you an answer.
        </p>

        <p className="prose-body measure">
          Now the jump that catches everyone. A method can hand back an{" "}
          <strong>object</strong> instead of a number:
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch 2-Commands — a method that returns a Command"
          code={`// Voltages for the two example commands.
private static final double SLOW_VOLTAGE = 3.0;

/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
}`}
        />

        <p className="prose-body measure">
          <code>runSlow()</code> does not move the arm. It builds a{" "}
          <code>Command</code> object and hands it to you. Something else runs
          it later. Nothing about the word <code>return</code> tells you that —
          the return type <code>Command</code> is the only clue, and it is the
          one to read first on any method you meet.
        </p>

        <p className="prose-body measure">
          The dot is the other half. <code>a.b()</code> means &quot;on the thing{" "}
          <code>a</code>, call <code>b</code>.&quot; Chains read left to right,
          and each link hands back a new thing for the next link to act on:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <code>runRepeatedly(...)</code> hands back a{" "}
            <strong>builder</strong> — a half-finished command. Not a{" "}
            <code>Command</code> yet.
          </li>
          <li>
            <code>.named(&quot;runSlow (hold)&quot;)</code> is called on that
            builder, and hands back a finished <code>Command</code>.
          </li>
          <li>
            <code>return</code> hands that <code>Command</code> out of the
            method.
          </li>
        </ul>

        <p className="prose-body measure">
          What you are allowed to type after a dot depends entirely on{" "}
          <em>what the thing before the dot is</em>. The builder offers{" "}
          <code>.named(...)</code>, <code>.withPriority(...)</code> and{" "}
          <code>.whenCanceled(...)</code>. A finished <code>Command</code>{" "}
          offers <code>.until(...)</code>, <code>.withTimeout(...)</code>,{" "}
          <code>.andThen(...)</code> and <code>.alongWith(...)</code> — but no{" "}
          <code>.named(...)</code>. The two sets overlap in places and neither
          one contains the other.
        </p>

        <p className="prose-body measure">
          <code>.named(...)</code> is the one that only ever lives on a builder,
          and that is the whole reason{" "}
          <code>arm.runFast().named(&quot;lift&quot;)</code> will not compile:{" "}
          <code>runFast()</code> already called <code>.named(...)</code> on your
          behalf, so what comes back is a <code>Command</code>, with nothing
          left to name.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title='"Cannot find symbol" after a dot is rarely a typo'
        >
          <p>
            When your editor underlines a method name right after a dot, check
            the type of the thing in front of the dot before you check your
            spelling. It is usually not the type you assumed.
          </p>
        </Box>
      </LessonSection>

      {/* ── 7. lambda ────────────────────────────────────────────────── */}
      <LessonSection
        id="the-lambda-gt"
        title={
          <>
            7. The lambda: <code>() -&gt; ...</code>
          </>
        }
        outlineLabel="The lambda: () -&gt; ..."
      >
        <p className="prose-body measure">
          <code>runRepeatedly</code> needs a chunk of code to run every loop.
          Not a number and not an object — <em>code</em>. A lambda is how you
          write a chunk of code down and hand it over.
        </p>

        <CodeBlock
          language="java"
          hideControls
          code={`runRepeatedly(() -> setVoltage(SLOW_VOLTAGE))`}
        />

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            The <code>()</code> on the left is the input list. Empty here — this
            code needs nothing handed to it.
          </li>
          <li>
            <code>-&gt;</code> separates the inputs from the body. Two
            characters: a dash and a greater-than.
          </li>
          <li>
            <code>setVoltage(SLOW_VOLTAGE)</code> is the body. That is the code
            being handed over.
          </li>
        </ul>

        <Box
          variant="alert-warning"
          tag="THE PART THAT SURPRISES PEOPLE"
          title="Writing a lambda runs nothing"
        >
          <p>
            Call <code>arm.runSlow()</code> and <code>setVoltage(3.0)</code>{" "}
            does <strong>not</strong> happen. <code>runSlow()</code> builds a
            command and hands it back, with the lambda parked inside it, unused.
            The lambda first runs when the scheduler runs that command — and
            then it runs every loop, fifty times a second, for as long as the
            command is scheduled.
          </p>
          <p className="mt-3">
            The mistake looks like this: you call <code>arm.runSlow()</code>{" "}
            from somewhere, the arm does not move, and there is no error
            anywhere. Nothing is broken. Nobody ever scheduled the command.
          </p>
        </Box>

        <p className="prose-body measure">
          Lambdas come in two shapes. One expression, as above. Or braces and
          several statements, each with its own semicolon — and if there are
          inputs, they get names. This is the actual source of{" "}
          <code>runRepeatedly</code> inside WPILib:
        </p>

        <CodeBlock
          language="java"
          title="Mechanism.java, WPILib 2027.0.0-alpha-6 — a lambda with one input and a block body"
          code={`public NeedsNameBuilderStage runRepeatedly(Runnable loopBody) {
  return run(
      coroutine -> {
        while (true) {
          loopBody.run();
          coroutine.yield();
        }
      });
}`}
        />

        <p className="prose-body measure">
          Do not worry about <code>coroutine.yield()</code> — that is the last
          lesson on the site. What matters here is the shape: one named input on
          the left of the arrow, braces on the right, several statements inside.
          It is also a straight answer to a question <strong>Commands</strong>{" "}
          will raise. <code>runRepeatedly</code> is a <code>while (true)</code>{" "}
          loop, which is exactly why a command built with it never finishes on
          its own.
        </p>
      </LessonSection>

      {/* ── 8. method reference ──────────────────────────────────────── */}
      <LessonSection
        id="the-method-reference"
        title={
          <>
            8. The method reference: <code>::</code>
          </>
        }
        outlineLabel="The method reference: ::"
      >
        <CodeBlock
          language="java"
          title="Arm.java, branch 2-Commands — the stop command"
          code={`/** Stop the arm motor and keep it stopped. Never finishes. */
public Command stop() {
  return runRepeatedly(motor::stopMotor).named("stop (hold)");
}`}
        />

        <p className="prose-body measure">
          <code>motor::stopMotor</code> means exactly{" "}
          <code>() -&gt; motor.stopMotor()</code>. Two colons, and no
          parentheses after the method name. You are handing the method itself
          over, not calling it.
        </p>

        <p className="prose-body measure">
          Write <code>motor.stopMotor()</code> in that slot instead and Java
          calls the method on the spot, gets back nothing, and tries to hand{" "}
          <em>nothing</em> to <code>runRepeatedly</code>. It will not compile.
        </p>

        <p className="prose-body measure">
          Both spellings fill the same slot. <code>runRepeatedly</code> takes a{" "}
          <code>Runnable</code>, which is Java&apos;s name for &quot;code that
          takes nothing and hands nothing back.&quot;{" "}
          <code>() -&gt; setVoltage(SLOW_VOLTAGE)</code> is a{" "}
          <code>Runnable</code>. <code>motor::stopMotor</code> is a{" "}
          <code>Runnable</code>. Pick whichever reads better.
        </p>

        <p className="prose-body measure">
          Now the one that runs through the whole rest of the site:
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java, branch 5-GettersAndSetters — a method handed over as a value"
          code={`arm.vertical().until(arm::isAtTarget).named("vertical until at target")`}
        />

        <p className="prose-body measure">
          <code>.until(...)</code> has to ask &quot;are we there yet?&quot; over
          and over, every loop, for as long as the command runs. So it cannot
          take an answer — it needs the question. Java&apos;s name for
          &quot;code that takes nothing and hands back a <code>boolean</code>
          &quot; is <code>BooleanSupplier</code>, and that is what{" "}
          <code>arm::isAtTarget</code> is.
        </p>

        <p className="prose-body measure">
          That line also settles the builder question from section 6.{" "}
          <code>arm.vertical()</code> hands back a finished <code>Command</code>
          , and <code>.until(...)</code> on a <code>Command</code> hands back a
          builder again — so <code>.named(...)</code> is legal at the end of the
          chain. Adding a condition puts you back in the middle of building
          something, and anything in the middle of being built still needs a
          name.
        </p>

        <Box variant="concept" title="The whole difference in one line">
          <p>
            <code>arm::isAtTarget</code> is the method, handed over, not yet
            called. <code>arm.isAtTarget()</code> is a single <code>true</code>{" "}
            or <code>false</code>, decided at the moment that line ran. Hand the
            second one to <code>.until(...)</code> and you have frozen the
            answer forever — if the arm was not there when the binding was
            created, it never will be.
          </p>
          <p className="mt-3">
            <code>::</code> hands a method over. <code>()</code> calls it.
            Everything <code>.until(...)</code>,{" "}
            <code>Command.waitUntil(...)</code> and{" "}
            <code>new Trigger(...)</code> do follows from that difference.
          </p>
        </Box>
      </LessonSection>

      {/* ── 9. static ────────────────────────────────────────────────── */}
      <LessonSection
        id="static-calling-a-method-on"
        title={
          <>
            9. <code>static</code>: calling a method on a class you never built
          </>
        }
        outlineLabel="static: calling a method on a class you never built"
      >
        <p className="prose-body measure">
          The last line of the arm&apos;s constructor is{" "}
          <code>TalonFXUtil.applyConfigWithRetries(motor, config)</code>. Search
          the whole project for <code>new TalonFXUtil(</code> and there is none.
          There is a dot, and no object in front of it — only a class name.
        </p>

        <CodeBlock
          language="java"
          title="src/main/java/frc/robot/utils/TalonFXUtil.java, branch 1-Subsystem — signature only"
          code={`public static boolean applyConfigWithRetries(TalonFX motor, TalonFXConfiguration config) {`}
        />

        <p className="prose-body measure">
          <code>static</code> on a method means the method belongs to the class
          itself rather than to any object built from it. You call it on the
          class name, and there is nothing to construct first.
        </p>

        <p className="prose-body measure">
          <code>static</code> on a <em>field</em> means one shared copy for the
          whole class instead of one per object. Paired with <code>final</code>,
          that is how you write a named constant:
        </p>

        <CodeBlock
          language="java"
          hideControls
          code={`private static final double SLOW_VOLTAGE = 3.0;
private static final double FAST_VOLTAGE = 6.0;`}
        />

        <p className="prose-body measure">
          The all-capitals name is a convention for constants, not a rule the
          compiler cares about.
        </p>

        <p className="prose-body measure">
          One more, from <code>Robot.java</code>, and it is worth walking
          through because it mixes the two ideas:{" "}
          <code>Scheduler.getDefault().run()</code>. <code>getDefault()</code>{" "}
          is static, so it is called on the class <code>Scheduler</code>. It
          hands back the single shared scheduler object. <code>.run()</code> is
          then called on <em>that object</em>. Two links, and only the first one
          is static.
        </p>

        <p className="prose-body measure">
          You will meet the same shape again as{" "}
          <code>Command.sequence(...)</code> and{" "}
          <code>Command.parallel(...)</code>. Class name, dot, method: static.
        </p>
      </LessonSection>

      {/* ── 10. annotations ──────────────────────────────────────────── */}
      <LessonSection
        id="annotations-teleop-and-override"
        title={
          <>
            10. Annotations: <code>@Teleop</code> and <code>@Override</code>
          </>
        }
        outlineLabel="Annotations: @Teleop and @Override"
      >
        <p className="prose-body measure">
          An <code>@Something</code> is a label stuck on the line below it. It
          does not run and it changes no behavior by itself. It tells the
          compiler, or the framework, how to treat what follows.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java, branch 2-Commands — the top of the driver's OpMode"
          code={`@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;
    final Flywheel flywheel = robot.flywheel;

    // Left trigger: push the arm up while held, stop when released.
    driver.leftTrigger().onTrue(arm.runFast()).onFalse(arm.stop());

    // (two more bindings on the real branch, trimmed here)
  }
}`}
        />

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <code>@Teleop(name = &quot;Teleop&quot;)</code> is how the framework
            finds this class. Nothing you write ever calls{" "}
            <code>new TeleopOpMode(...)</code> — the framework does, when
            &quot;Teleop&quot; is picked on the driver station. Delete the
            annotation and the mode disappears from the list, with no compile
            error to tell you why. <code>@Autonomous</code> and{" "}
            <code>@Utility</code> are the other two.
          </li>
          <li>
            <code>name = &quot;Teleop&quot;</code> inside the parentheses is an
            annotation setting, not a method parameter.
          </li>
          <li>
            <code>@Override</code>, on <code>Robot.robotPeriodic()</code>, means
            &quot;this method replaces one from the class I extended.&quot;
            Misspell the method name and the compiler stops you instead of
            silently defining a new method that nothing ever calls. Catching
            that typo is its entire job.
          </li>
        </ul>

        <p className="prose-body measure">
          Notice <code>final Arm arm = robot.arm;</code> in the constructor — a
          local variable, marked <code>final</code>, holding a shortcut to a{" "}
          <code>public</code> field on another object. Every idea in that line
          has now appeared on this page.
        </p>
      </LessonSection>

      {/* ── 11. loose ends ───────────────────────────────────────────── */}
      <LessonSection id="11-loose-ends" title="11. Loose ends">
        <h3 className="display m-0 text-aside">Imports</h3>

        <p className="prose-body measure">
          One line per class borrowed from somewhere else, at the top of the
          file under <code>package</code>.{" "}
          <code>import org.wpilib.command3.Mechanism;</code> is what lets the
          rest of the file say <code>Mechanism</code> instead of the full name.
          Your editor writes these for you; you almost never type one.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java, branch 5-GettersAndSetters — the static form"
          code={`import static org.wpilib.units.Units.Degrees;

// ...later in the same file:
private final Angle tolerance = Degrees.of(POSITION_TOLERANCE_DEGREES);`}
        />

        <p className="prose-body measure">
          <code>import static</code> pulls in one member rather than a whole
          class, so you can write <code>Degrees.of(1.0)</code> without{" "}
          <code>Units.</code> in front of it. <code>Seconds</code> arrives the
          same way at <strong>Chaining Commands</strong>.
        </p>

        <Box
          variant="alert-tip"
          tag="ABOUT THE SNIPPETS ON THIS SITE"
          title="Most code blocks here are one method, not one file"
        >
          <p>
            Imports and the surrounding class are usually left off so the point
            of the block is visible. If you paste one into your editor and it
            reports <code>cannot find symbol</code>, an import is missing — the
            code is fine. Blocks that show a file name in their header are the
            complete thing.
          </p>
        </Box>

        <h3 className="display m-0 text-aside">
          <code>super</code> and <code>this</code>
        </h3>

        <p className="prose-body measure">
          Both turn up much later, at <strong>Drive to Point</strong>, in a
          constructor whose parameter has the same name as its field:
        </p>

        <CodeBlock
          language="java"
          title="commands/DriveToPoint.java, branch 5-DriveToPoint — trimmed"
          code={`public class DriveToPoint extends ClassicCommand {
  private final DriveMechanism drivetrain;
  private final Pose2d targetPose;

  public DriveToPoint(DriveMechanism drivetrain, Pose2d targetPose) {
    super("DriveToPoint", drivetrain); // command name + required mechanism
    this.drivetrain = drivetrain;
    this.targetPose = targetPose;
  }
}`}
        />

        <p className="prose-body measure">
          <code>super(...)</code> runs the constructor of the class you
          extended, and has to be the first line. <code>this.drivetrain</code>{" "}
          means the <em>field</em>, as opposed to <code>drivetrain</code> the
          parameter. They share a name, and <code>this.</code> is how you say
          which one you mean.
        </p>

        <h3 className="display m-0 text-aside">
          The comparison and logic symbols
        </h3>

        <p className="prose-body measure">
          <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code>{" "}
          <code>&gt;=</code> compare numbers. <code>==</code> asks
          &quot;equal?&quot; and <code>!=</code> asks &quot;not equal?&quot;.{" "}
          <code>&amp;&amp;</code> is and, <code>||</code> is or, and a leading{" "}
          <code>!</code> flips true and false — it is one character and it
          reverses the meaning of everything after it, so read for it
          deliberately.
        </p>

        <p className="prose-body measure">
          On triggers this site writes <code>.negate()</code> rather than{" "}
          <code>!</code>. <code>driver.leftTrigger().negate()</code>, on the
          State Machines branch, means &quot;while the left trigger is{" "}
          <em>not</em> pulled.&quot;
        </p>
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <p className="prose-body measure">
          There is nothing to run, so the check is a reading test. Work through
          it before opening the answers.
        </p>

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            Scroll back to the full <code>Arm.java</code> at the top of this
            page. Put your finger on the line where the fields stop and the
            constructor starts. <strong>You should see:</strong>{" "}
            <code>public Arm() {"{"}</code> on line 31 of the block, directly
            after the <code>voltageOut</code> field.
          </li>
          <li>
            Find the one local variable in that file.{" "}
            <strong>You should see:</strong> <code>config</code>, and nothing
            else. Seven lines in that file carry an <code>=</code>. Four declare
            fields. One declares <code>config</code>. The two{" "}
            <code>config.MotorOutput</code> lines declare nothing at all — they
            set a value on an object that already exists, which is a different
            job from making a new variable.
          </li>
          <li>
            Now the real exercise. Below is a complete piece of the{" "}
            <code>Arm</code> you write at <strong>Commands</strong>. Name every
            part of it out loud, then check yourself.{" "}
            <strong>You should see:</strong> the seven questions under it
            answered without scrolling back up this page.
          </li>
        </ol>

        <CodeBlock
          language="java"
          title="Arm.java, branch 2-Commands — name every part"
          code={`// Voltages for the two example commands.
private static final double SLOW_VOLTAGE = 3.0;

/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
}`}
        />

        <ol
          className="ml-5 list-decimal space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            What are <code>private</code>, <code>static</code> and{" "}
            <code>final</code> each doing on the first line, separately?
          </li>
          <li>
            What is <code>double</code>?
          </li>
          <li>
            What does <code>runSlow</code> hand back, and what does it{" "}
            <em>not</em> do?
          </li>
          <li>
            Where is <code>runRepeatedly</code> defined? It is not in this file.
          </li>
          <li>
            What is <code>() -&gt; setVoltage(SLOW_VOLTAGE)</code>, and when
            does <code>setVoltage</code> actually run?
          </li>
          <li>
            What is <code>.named(...)</code> called on, and what does it hand
            back?
          </li>
          <li>
            Why can you not add a second <code>.named(...)</code> where you use{" "}
            <code>arm.runSlow()</code>?
          </li>
        </ol>

        <CollapsibleSection title="Answers">
          <ol className="ml-5 list-decimal space-y-2">
            <li>
              <code>private</code>: nothing outside <code>Arm.java</code> can
              see it. <code>static</code>: one copy shared by the class, not one
              per arm. <code>final</code>: it can never be reassigned. Together,
              a named constant.
            </li>
            <li>
              A number that can carry a decimal point. The value is{" "}
              <code>3.0</code> — three volts.
            </li>
            <li>
              It hands back a <code>Command</code> object. It does not move the
              arm and it does not schedule anything.
            </li>
            <li>
              In <code>Mechanism</code>, which <code>Arm</code> extends. That is
              what <code>extends</code> buys you.
            </li>
            <li>
              A lambda — a chunk of code handed over as a value. It runs when
              the scheduler runs this command, and then every loop after that,
              not when <code>runSlow()</code> is called.
            </li>
            <li>
              On the builder that <code>runRepeatedly(...)</code> handed back.
              It hands back a finished <code>Command</code>.
            </li>
            <li>
              Because <code>runSlow()</code> gives you a finished{" "}
              <code>Command</code>, and <code>.named(...)</code> only exists on
              the builder. The type in front of the dot decides what you can
              call.
            </li>
          </ol>
        </CollapsibleSection>

        <Box
          variant="alert-success"
          tag="YOU ARE READY"
          title="Seven out of seven, without scrolling"
        >
          <p>
            If you can answer all seven from memory, the next three lessons are
            readable and you should move on. Five or six is fine too — the
            pieces you missed will come back, in real code, within two pages.
          </p>
        </Box>
      </LessonSection>

      {/* ── if it didn't work ────────────────────────────────────────── */}
      <LessonSection id="if-it-didn-t-work" title="If it didn't work">
        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Three things that go wrong here"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>
                You cannot tell a field from a local variable at a glance.
              </strong>{" "}
              Look at which braces the line sits <em>directly</em> inside.
              Directly inside the class braces means a field, and it lives as
              long as the object does. Inside a method&apos;s or
              constructor&apos;s braces means local, and it is gone at the
              closing brace. In <code>Arm.java</code>, <code>motor</code> is a
              field and <code>config</code> is local — try to use{" "}
              <code>config</code> from <code>setVoltage</code> and you get{" "}
              <code>cannot find symbol</code>.
            </li>
            <li>
              <strong>
                You expected the lambda to run when the method was called.
              </strong>{" "}
              This one produces no error at all, which is what makes it nasty.
              You call <code>arm.runSlow()</code>, nothing moves, nothing logs.{" "}
              <code>runSlow()</code> only built a <code>Command</code> and
              handed it to you. A command handed to nobody never runs — it has
              to be bound to a button or scheduled.
            </li>
            <li>
              <strong>
                You pasted a snippet from this site and it will not compile.
              </strong>{" "}
              <code>cannot find symbol: class Command</code> means an import is
              missing — most blocks here are one method, not a whole file.{" "}
              <code>&lt;identifier&gt; expected</code> usually means the
              opposite kind of mistake: a statement pasted where a field
              belongs, or a method pasted inside another method.
            </li>
          </ul>
        </Box>

        <p className="prose-body measure">
          If a specific word still has no meaning attached to it, the glossary
          has short entries for most of them, and every one of these constructs
          reappears in real code within the next three lessons. Reading them in
          place beats re-reading this page.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/blob/1-Subsystem/src/main/java/frc/robot/subsystems/Arm.java"
          title="Arm.java on 1-Subsystem — the file from this page"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "In runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)), when does setVoltage(3.0) actually run?",
            options: [
              "Immediately, when runSlow() is called",
              "Once, at the moment the command is scheduled",
              "Every loop, for as long as the scheduler is running that command",
              "Never — a lambda is only a description",
            ],
            correctAnswer: 2,
            explanation:
              "Writing a lambda runs nothing. runSlow() builds a Command and hands it back with the lambda parked inside. runRepeatedly is a while(true) loop, so once something schedules the command, the body runs every loop until the command is canceled.",
          },
          {
            id: 2,
            question:
              "Why is it motor::stopMotor and not motor.stopMotor() inside runRepeatedly(...)?",
            options: [
              ":: is a style preference — both compile",
              ":: hands the method over to be called later; () calls it right now and hands back nothing",
              ":: is required whenever the method takes no arguments",
              "motor.stopMotor() would stop the motor twice",
            ],
            correctAnswer: 1,
            explanation:
              "runRepeatedly needs a Runnable — code it can call every loop. motor::stopMotor is shorthand for () -> motor.stopMotor(). Writing motor.stopMotor() calls the method on the spot and produces nothing to hand over, so it does not compile.",
          },
          {
            id: 3,
            question:
              "In arm.vertical().until(arm::isAtTarget), what is arm::isAtTarget?",
            options: [
              "A single true or false, worked out when that line ran",
              "A BooleanSupplier — the method itself, handed over so it can be asked every loop",
              "A field on Arm holding the arm's state",
              "A Command that finishes when the arm arrives",
            ],
            correctAnswer: 1,
            explanation:
              "until(...) has to re-ask the question every loop, so it needs the method, not one answer. arm.isAtTarget() with parentheses would freeze a single true or false at the moment the binding was created — and if the arm was not there then, it never would be.",
          },
          {
            id: 4,
            question:
              "private final TalonFX motor = new TalonFX(31, canivore); — what does final promise?",
            options: [
              "The motor cannot be commanded to move",
              "motor will point at this one TalonFX forever; it cannot be reassigned",
              "No other class can reach the field",
              "The CAN ID 31 can never change",
            ],
            correctAnswer: 1,
            explanation:
              "final locks the box, not what is in it. motor = someOtherTalonFX would not compile, but motor.setControl(...) works fine. Keeping other classes out is the separate job of private.",
          },
          {
            id: 5,
            question:
              'runRepeatedly(...).named("runSlow (hold)") compiles, but arm.runFast().named("lift") does not. Why?',
            options: [
              "Command names have to be unique across the project",
              "runRepeatedly hands back a builder, which has .named(...); runFast() already called it, so what comes back is a finished Command, which does not",
              ".named(...) may only be called inside a mechanism class",
              "runFast() returns void, so there is nothing to call a method on",
            ],
            correctAnswer: 1,
            explanation:
              "What you can type after a dot is decided by the type in front of it. named(String) lives on the builder that runRepeatedly(...) hands back, alongside .withPriority(...) and .whenCanceled(...). A Command has no named(String) at all — so runFast(), which already called it, gives you back something with nothing left to name.",
          },
        ]}
      />
    </PageTemplate>
  );
}
