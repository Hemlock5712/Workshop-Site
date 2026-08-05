import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import GitHubContent from "@/components/GitHubContent";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";

export default function AddingCommands() {
  return (
    <PageTemplate
      title="Stop calling the motor. Ask for a command instead."
      emphasis="Ask for a command instead."
      lede="Right now anyone in your project can call arm.setVoltage(6.0). Two pieces of code could call it in the same loop with different numbers, and the motor would flip between them. This page closes that door: the setter becomes private, and the arm hands out commands instead."
      needs={[
        <>
          The <code>Arm</code> and <code>Flywheel</code> from{" "}
          <strong>Mechanisms</strong> — branch <code>1-Subsystem</code>, with{" "}
          <code>public void setVoltage(double)</code> on both.
        </>,
        <>
          A project that builds. <code>./gradlew build</code> should already
          finish clean.
        </>,
        <>
          Lambdas (<code>() -&gt;</code>), method references (<code>::</code>
          ), and <code>private</code> from <strong>The Java You Need</strong>.
          Every line below uses at least one of them.
        </>,
      ]}
      branch="2-Commands"
      time="Roughly 40 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "A command is a named job the scheduler runs. It owns the mechanism while it runs, so nothing else can touch that motor at the same time. That is the whole reason the door gets closed.",
          ]}
          concept="A command is a named job that owns its mechanism while it runs. Making the setter private is what forces everything to go through one."
        />
        <MarginNote label="WHAT YOU'LL BUILD">
          Three commands on the arm, three on the flywheel, and a teleop OpMode
          that binds them to the controller. You will not run any of it yet —
          pressing buttons and watching motors turn is two lessons away, on{" "}
          <strong>Running Your Code</strong>. The check on this page is a clean
          build.
        </MarginNote>
      </Split>

      {/* ── the diff ─────────────────────────────────────────────────── */}
      <LessonSection
        id="what-changes-on-this-branch"
        title="What changes on this branch"
      >
        <Split>
          <ProseBlock>
            <p>
              This lesson is branch <code>2-Commands</code>, one commit on top
              of <code>1-Subsystem</code>. It touches four files:{" "}
              <code>Arm.java</code> and <code>Flywheel.java</code> get commands,{" "}
              <code>opmodes/TeleopOpMode.java</code> is brand new, and{" "}
              <code>Robot.java</code> only has its comment updated. The
              mechanisms are already public fields on <code>Robot</code> from
              last lesson, so nothing has to be registered anywhere.
            </p>
          </ProseBlock>
          <MarginNote label="WHY CLOSE THE DOOR">
            The scheduler tracks which command owns which mechanism. If two
            commands both need the arm, the second cancels the first — one of
            them wins, on purpose, and you can find out which. That bookkeeping
            only works for commands. A plain <code>setVoltage(6.0)</code> goes
            around all of it: two callers, two different numbers, same loop, and
            the motor takes whichever ran last. <code>private</code> is what
            makes the bookkeeping unavoidable.
          </MarginNote>
        </Split>

        <CodeBlock
          language="java"
          title="Arm.java — the shape of the change"
          code={`// BEFORE (1-Subsystem): anything in the project can push a voltage.
public void setVoltage(double voltage) { ... }
public void stop() { ... }

// AFTER (2-Commands): the setter is shut away, and three commands take
// its place. Every one of them returns a Command.
public Command runSlow()  { ... }
public Command runFast()  { ... }
public Command stop()     { ... }

private void setVoltage(double voltage) { ... }`}
        />
      </LessonSection>

      {/* ── step 1 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="make-the-setter-private"
        title="Make the setter private"
      >
        <p className="prose-body measure">
          Open <code>src/main/java/frc/robot/subsystems/Arm.java</code>. Find{" "}
          <code>setVoltage</code> at the bottom of the class. Change one word.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Arm.java"
          code={`private void setVoltage(double voltage) {
  motor.setControl(voltageOut.withOutput(voltage));
}`}
        />

        <p className="prose-body measure">
          Delete the old <code>public void stop()</code> while you are in there
          — a command with the same name replaces it in step 3.
        </p>

        <p className="prose-body measure">
          <strong>{"You should see: "}</strong> nothing breaks. Nothing outside{" "}
          <code>Arm</code> was calling <code>setVoltage</code> yet, so the build
          still passes. That is the moment to add the commands, before anything
          comes to depend on the open door.
        </p>
      </LessonSection>

      {/* ── step 2 ───────────────────────────────────────────────────── */}
      <LessonSection id="your-first-command" title="Your first command">
        <p className="prose-body measure">
          Two constants at the top of the class, next to the hardware fields,
          then one method.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — the two voltages and runSlow()"
          code={`// Voltages for the two example commands.
private static final double SLOW_VOLTAGE = 3.0;
private static final double FAST_VOLTAGE = 6.0;

/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
}`}
        />

        <p className="prose-body measure">
          You also need one new import,{" "}
          <code>import org.wpilib.command3.Command;</code>. That single line of
          method body is doing three separate things, and it is worth taking
          apart before you write five more like it.
        </p>

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <code>() -&gt; setVoltage(SLOW_VOLTAGE)</code> is a lambda: a scrap
            of code written down and handed over instead of run. Writing this
            line does not move the arm.
          </li>
          <li>
            <code>runRepeatedly(...)</code> comes from <code>Mechanism</code>,
            which <code>Arm</code> extends. It wraps that scrap in a{" "}
            <code>while (true)</code> loop, so once the command is running the
            lambda fires every loop, about fifty times a second. Re-sending the
            request every loop is also what restores it if a motor controller
            reboots.
          </li>
          <li>
            <code>.named(&quot;runSlow (hold)&quot;)</code> finishes the build
            and produces the actual <code>Command</code> the method returns.
          </li>
        </ol>

        <Box variant="concept" title="Three types in one line">
          <p>
            Each link of that chain hands back a different type, and that is
            what decides what you are allowed to write next:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`() -> setVoltage(SLOW_VOLTAGE)   // a Runnable — the code, not run yet
runRepeatedly( ... )             // a NeedsNameBuilderStage — a half-built command
.named("runSlow (hold)")         // a Command — finished, and what gets returned`}
            />
          </div>
          <p className="mt-3">
            The middle one is a <strong>builder</strong>, not a command. It has
            no name yet, and the scheduler cannot run it.
          </p>
        </Box>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="The name is not optional"
        >
          <p>
            Leave <code>.named(...)</code> off and the build fails: the method
            promises to return a <code>Command</code>, and a builder is not one.
            That is the whole error. The builder is still being returned, so
            nothing has been thrown away.
          </p>
          <p className="mt-3">
            A second, separate check catches the other way of getting this
            wrong. Both <code>NeedsNameBuilderStage</code> and{" "}
            <code>Command</code> carry WPILib&apos;s <code>@NoDiscard</code>{" "}
            annotation, and the compiler plugin reports it when the result of
            such a call is discarded — a builder or a command written as a
            statement on its own line and then never used. <code>Command</code>
            &apos;s version supplies the message —{" "}
            <em>
              &quot;Commands must be used! Did you mean to fork it or bind it to
              a trigger?&quot;
            </em>
          </p>
          <p className="mt-3">
            The reason is practical. A command with no name is invisible when
            you are trying to work out what the robot is doing.
          </p>
        </Box>
      </LessonSection>

      {/* ── step 3 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="runfast-and-stop"
        title={
          <>
            Step 3 — <code>runFast()</code> and <code>stop()</code>
          </>
        }
        outlineLabel="runFast() and stop()"
      >
        <p className="prose-body measure">
          Same shape, twice more. <code>stop()</code> is the interesting one: it
          hands over a method reference rather than a lambda, and it is a
          command like any other, not a special case.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — all three commands"
          code={`/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
}

/** Push the arm with a stronger voltage and keep pushing. Never finishes. */
public Command runFast() {
  return runRepeatedly(() -> setVoltage(FAST_VOLTAGE)).named("runFast (hold)");
}

/** Stop the arm motor and keep it stopped. Never finishes. */
public Command stop() {
  return runRepeatedly(motor::stopMotor).named("stop (hold)");
}`}
        />

        <p className="prose-body measure">
          <code>motor::stopMotor</code> means the same thing as{" "}
          <code>() -&gt; motor.stopMotor()</code>. And notice what{" "}
          <code>stop()</code> is: a command that calls <code>stopMotor()</code>{" "}
          every single loop, forever. Not a one-shot. It has to keep saying it,
          and the section on bindings below explains why.
        </p>

        <p className="prose-body measure">
          <strong>{"You should see: "}</strong> <code>./gradlew build</code>{" "}
          passes, and your <code>Arm</code> now has three public methods that
          all return <code>Command</code> and one private one that returns{" "}
          <code>void</code>.
        </p>
      </LessonSection>

      {/* ── the (hold) suffix ────────────────────────────────────────── */}
      <LessonSection
        id="why-every-name-ends-in-hold"
        title={
          <>
            Why every name ends in <code>(hold)</code>
          </>
        }
        outlineLabel="Why every name ends in (hold)"
      >
        <p className="prose-body measure">
          <code>runRepeatedly</code> is a <code>while (true)</code> loop. There
          is no exit. A command built with it never finishes on its own — it
          runs until something else takes the mechanism away from it. The team
          calls that a <strong>hold</strong>, and every hold on this robot is
          named with the suffix so you can spot one at a glance.
        </p>

        <Box
          variant="alert-warning"
          tag="THE ONE RULE"
          title="Nothing may ever wait on a hold"
        >
          <p>
            Every command you wrote on this page is a hold, including{" "}
            <code>stop()</code>. Later, when you start putting commands in a
            list and running them in order, a hold in that list stops the list
            there forever. Nothing crashes — the routine just sits.
          </p>
          <p className="mt-3">
            That is why the suffix is in the name: when a routine seems frozen,
            look at what it is sitting on. If the name says <code>(hold)</code>,
            you have found the bug. The fix — giving a hold an ending — is the
            first thing <strong>Chaining Commands</strong> teaches.
          </p>
        </Box>

        <Box
          variant="alert-info"
          tag="NOTE"
          title="There are no ...AndWait methods here"
        >
          <p>
            A mechanism never bakes waiting into its own commands. There is no{" "}
            <code>runFastAndWait()</code>. One factory per behavior, and whoever
            uses it decides whether to wait and for how long. Keeping that
            decision at the call site is what makes these six small commands
            recombine into anything.
          </p>
        </Box>
      </LessonSection>

      {/* ── step 4 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="the-same-three-on"
        title="The same three on the flywheel"
      >
        <p className="prose-body measure">
          Open <code>subsystems/Flywheel.java</code> and do it again. Identical
          pattern, identical voltages. The one difference: the flywheel has two
          motors, a leader on CAN 21 and a follower on CAN 22 that spins the
          opposite direction, so the commands talk to <code>leader</code>.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — same three commands, leader motor"
          code={`private static final double SLOW_VOLTAGE = 3.0;
private static final double FAST_VOLTAGE = 6.0;

/** Spin the flywheel with a gentle voltage and hold it there. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)");
}

/** Spin the flywheel with a stronger voltage and hold it there. Never finishes. */
public Command runFast() {
  return runRepeatedly(() -> setVoltage(FAST_VOLTAGE)).named("runFast (hold)");
}

/** Stop the flywheel and keep it stopped. Never finishes. */
public Command stop() {
  return runRepeatedly(leader::stopMotor).named("stop (hold)");
}

private void setVoltage(double voltage) {
  leader.setControl(voltageOut.withOutput(voltage));
}`}
        />

        <p className="prose-body measure">
          You never command the follower. It was told once, in the constructor,
          to copy the leader. Six commands total now, three per mechanism, and
          none of them can be reached except through the mechanism that owns
          them.
        </p>
      </LessonSection>

      {/* ── step 5 ───────────────────────────────────────────────────── */}
      <LessonSection id="bind-them-to-the" title="Bind them to the controller">
        <p className="prose-body measure">
          Six commands that nothing calls do nothing. Create a new file,{" "}
          <code>src/main/java/frc/robot/opmodes/TeleopOpMode.java</code>. This
          is the whole file on the branch, minus the three-line WPILib copyright
          header that every generated file already carries.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`package frc.robot.opmodes;

import frc.robot.Robot;
import frc.robot.subsystems.Arm;
import frc.robot.subsystems.Flywheel;
import org.wpilib.command3.button.CommandNiDsXboxController;
import org.wpilib.opmode.PeriodicOpMode;
import org.wpilib.opmode.Teleop;

/**
 * The driver's controls. The framework builds this class when "Teleop" is picked
 * on the driver station. The button bindings made in the constructor belong to
 * this OpMode, and the framework removes them on a mode switch. No cleanup code
 * needed.
 *
 * <p>The buttons here run the arm and flywheel commands.
 */
@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;
    final Flywheel flywheel = robot.flywheel;

    // Left trigger: push the arm up while held, stop when released.
    driver.leftTrigger().onTrue(arm.runFast()).onFalse(arm.stop());

    // Right trigger: spin fast while held, drop back to the slow voltage when released.
    driver.rightTrigger().onTrue(flywheel.runFast()).onFalse(flywheel.runSlow());

    // A: spin fast while held, stop when released.
    driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());
  }
}`}
        />

        <p className="prose-body measure">
          Four things to notice, and then the next lesson takes this apart
          properly:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <code>@Teleop(name = &quot;Teleop&quot;)</code> is a label. The
            framework finds this class by that annotation, so nothing has to be
            registered in <code>Robot.java</code>.
          </li>
          <li>
            The bindings live in the <strong>constructor</strong> — code that
            runs once, when the OpMode is built. They are set up one time, not
            every loop.
          </li>
          <li>
            <code>robot.arm</code> and <code>robot.flywheel</code> are the
            public fields you made last lesson. Every OpMode is handed the{" "}
            <code>Robot</code> and reaches the mechanisms through it.
          </li>
          <li>
            <code>onTrue(x)</code> schedules <code>x</code> the moment the
            button goes down. <code>onFalse(y)</code> schedules <code>y</code>{" "}
            the moment it comes back up. They return the trigger, which is why
            they chain onto one line. <strong>Triggers</strong>, next lesson, is
            the full treatment.
          </li>
        </ul>

        <p className="prose-body measure">
          <strong>{"You should see: "}</strong> <code>./gradlew build</code>{" "}
          passes with the new file in place. That is the last check this page
          can give you — the buttons are real, but you need the simulator from{" "}
          <strong>Running Your Code</strong> to press them.
        </p>
      </LessonSection>

      {/* ── the pair rule / idle ─────────────────────────────────────── */}
      <LessonSection
        id="why-every-binding-comes-in-a"
        title="Why every binding comes in a pair"
      >
        <p className="prose-body measure">
          Look at those three bindings again. Not one of them is a single call.
          Every <code>onTrue</code> has an <code>onFalse</code> behind it. That
          is not style — leave the second half off and the motor never stops.
          There are two separate reasons for that, and both are worth knowing.
        </p>

        <p className="prose-body measure">
          <strong>
            One: <code>onTrue</code> does not undo itself.
          </strong>{" "}
          It schedules a command the instant the button goes down, and that is
          all it does. Nothing happens on release. Since{" "}
          <code>arm.runFast()</code> is a hold, it would sit there pushing 6 V
          for the rest of the match. What actually ends it is the second
          binding: <code>arm.stop()</code> needs the arm as well, and a command
          of equal or greater priority claiming a mechanism interrupts and
          cancels the one already on it. Both run at the default priority of 0,
          so <code>stop()</code> wins by arriving second.
        </p>

        <p className="prose-body measure">
          <strong>
            Two: canceling on its own would not have stopped the motor either.
          </strong>{" "}
          When a command ends or is canceled with nothing to replace it, the
          mechanism goes back to its <strong>default command</strong>. You never
          set one on the arm — you did not have to. <code>Mechanism</code>
          &apos;s own constructor already did it, and here is exactly what it
          set. No branch in the mechanism track ever calls{" "}
          <code>setDefaultCommand</code>; every mechanism runs the
          constructor-supplied <code>idle()</code> for the whole of Workshop #1.
        </p>

        <CodeBlock
          language="java"
          title="Mechanism.java, WPILib 2027.0.0-alpha-6 — the default command every mechanism gets"
          code={`public Command idle() {
  return run(Coroutine::park).withPriority(Command.LOWEST_PRIORITY).named(getName() + "[IDLE]");
}`}
        />

        <p className="prose-body measure">
          <code>Coroutine</code> is the machinery underneath every command; you
          will not write one yourself until <strong>Coroutines</strong>, at the
          end of the course. <code>park</code> is its &quot;stop here and do
          nothing&quot; instruction, so <code>idle()</code> holds the mechanism
          and does nothing at all. Read that carefully, because the consequence
          is the thing that catches people out:
        </p>

        <Box
          variant="alert-danger"
          tag="THE TRAP"
          title="Canceling a command does not stop the motor"
        >
          <p>
            <code>idle()</code> sends <em>no output</em>. It does not zero
            anything. It does not undo the last request. Phoenix is still
            holding whatever voltage it was last given, so the arm keeps pushing
            at 6 V after the command that asked for 6 V is long gone.
          </p>
          <p className="mt-3">
            So &quot;stop the command&quot; and &quot;stop the motor&quot; are
            two different things. That is why <code>stop()</code> exists as its
            own command, and why it has to keep saying <code>stopMotor()</code>{" "}
            every loop rather than once. Something has to actively send zero,
            and something has to hold the mechanism while it does.
          </p>
        </Box>

        <p className="prose-body measure">
          <code>LOWEST_PRIORITY</code> is what keeps idling out of the way. It
          is <code>Integer.MIN_VALUE</code>, so any command at all outranks it
          and can take the mechanism. Yours never set a priority, so they all
          sit at <code>DEFAULT_PRIORITY</code>, which is 0 — which is exactly
          why <code>arm.stop()</code> is able to interrupt{" "}
          <code>arm.runFast()</code>. Equal counts.
        </p>

        <p className="prose-body measure">
          One last detail worth noticing in that OpMode: the right trigger
          releases to <code>flywheel.runSlow()</code>, not{" "}
          <code>flywheel.stop()</code>. A wheel left turning at 3 V does not
          have to spin up from dead the next time you want it. The pair does not
          have to be do-and-undo — it has to be do-and-then-what.
        </p>
      </LessonSection>

      {/* ── rest of the builder ──────────────────────────────────────── */}
      <LessonSection
        id="the-rest-of-the-builder"
        title="The rest of the builder"
      >
        <p className="prose-body measure">
          <code>runRepeatedly(...)</code> hands back a{" "}
          <code>NeedsNameBuilderStage</code>, and that type offers exactly four
          methods. You have used one. The other three are worth recognizing even
          though nothing on this branch calls them:
        </p>

        <CodeBlock
          language="java"
          title="NeedsNameBuilderStage — the whole interface"
          code={`NeedsNameBuilderStage whenCanceled(Runnable onCancel);
NeedsNameBuilderStage withPriority(int priority);
NeedsNameBuilderStage until(BooleanSupplier endCondition);
Command               named(String name);`}
        />

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <code>whenCanceled(...)</code> runs a scrap of cleanup code when the
            command is interrupted. For a hold that is the only way it ever
            ends, so it works out as the &quot;on the way out&quot; hook.
          </li>
          <li>
            <code>withPriority(...)</code> changes who wins a fight over the
            mechanism. <code>idle()</code> uses it to sit at the bottom.
          </li>
          <li>
            <code>until(...)</code> gives the command an ending condition. It
            needs the mechanism to be able to report on itself, which yours
            cannot do yet. That arrives on <strong>Finish Lines</strong>.
          </li>
        </ul>

        <Box
          variant="alert-info"
          tag="NOTE"
          title="These three go before the name, not after"
        >
          <p>
            They are builder methods. Once <code>.named(...)</code> has run you
            have a finished <code>Command</code>, and a <code>Command</code>{" "}
            does not have them. Order is not a preference here:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`runRepeatedly(...).named("x").withPriority(5)   // does not compile
runRepeatedly(...).withPriority(5).named("x")   // compiles`}
            />
          </div>
        </Box>
      </LessonSection>

      {/* ── the branch ───────────────────────────────────────────────── */}
      <LessonSection
        id="the-finished-file-live-from-the"
        title="The finished file, live from the branch"
      >
        <p className="prose-body measure">
          Compare this against what you typed. The{" "}
          <strong>GitHub Changes</strong> tab shows the whole{" "}
          <code>1-Subsystem</code> → <code>2-Commands</code> diff — all four
          files, side by side, which is the fastest way to check you did not
          miss anything. Read the block of comments above <code>runSlow()</code>{" "}
          too; THE ONE RULE is written out in the source itself.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="2-Commands"
          filePath="src/main/java/frc/robot/subsystems/Arm.java"
          pr={{ number: 2, focusFile: "Arm.java" }}
        />
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            Run <code>./gradlew build</code> (or{" "}
            <em>WPILib: Build Robot Code</em>).{" "}
            <strong>{"You should see: "}</strong> <code>BUILD SUCCESSFUL</code>.
          </li>
          <li>
            In <code>Arm.java</code>, count the public methods.{" "}
            <strong>{"You should see: "}</strong> exactly three, all returning{" "}
            <code>Command</code>, plus the constructor. <code>setVoltage</code>{" "}
            is <code>private</code> and returns <code>void</code>.
          </li>
          <li>
            Count the same in <code>Flywheel.java</code>.{" "}
            <strong>{"You should see: "}</strong> the same three, with{" "}
            <code>leader::stopMotor</code> in <code>stop()</code> rather than{" "}
            <code>motor::stopMotor</code>.
          </li>
          <li>
            Check every command name ends in <code>(hold)</code>.{" "}
            <strong>{"You should see: "}</strong> six names, six suffixes. If
            one is missing, add it now — the suffix is what makes a stuck
            routine diagnosable later.
          </li>
          <li>
            <strong>Break it on purpose.</strong> Delete the{" "}
            <code>.named(&quot;runSlow (hold)&quot;)</code> from{" "}
            <code>runSlow()</code> and build again.{" "}
            <strong>{"You should see: "}</strong> a compile error pointing at
            that line. A builder is not a <code>Command</code>. Put it back.
          </li>
          <li>
            <strong>Break it the other way.</strong> Add{" "}
            <code>arm.setVoltage(6.0);</code> to the <code>TeleopOpMode</code>{" "}
            constructor and build. <strong>{"You should see: "}</strong> an
            error saying <code>setVoltage</code> has private access in{" "}
            <code>Arm</code>. That error is the entire point of this lesson.
            Delete the line.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Missing names, misordered builders, missing imports"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                &quot;incompatible types: NeedsNameBuilderStage cannot be
                converted to Command&quot;
              </strong>{" "}
              — a <code>.named(...)</code> is missing from that method. javac
              prints the package-qualified names, so what you actually see is{" "}
              <code>org.wpilib.command3.NeedsNameBuilderStage</code> and{" "}
              <code>org.wpilib.command3.Command</code>.
            </li>
            <li>
              <strong>
                &quot;cannot find symbol: method withPriority(int), location:
                interface Command&quot;
              </strong>{" "}
              — a builder method landed <em>after</em> <code>.named(...)</code>.
              The same error shows up for <code>whenCanceled</code>. Once the
              name has run you are holding a <code>Command</code>, and a{" "}
              <code>Command</code> does not have those two. Move the builder
              call in front of the name.
              <br />
              Note that <code>until</code> and <code>withTimeout</code> are{" "}
              <em>not</em> in that group — both exist on <code>Command</code>{" "}
              itself, which is why{" "}
              <code>arm.vertical().until(arm::isAtTarget)</code> compiles later
              on <strong>Finish Lines</strong>.
            </li>
            <li>
              <strong>&quot;cannot find symbol: class Command&quot;</strong> —
              the import is missing. Add{" "}
              <code>import org.wpilib.command3.Command;</code> at the top of{" "}
              <code>Arm.java</code> and <code>Flywheel.java</code>. Check the
              package while you are there: this stack is{" "}
              <code>org.wpilib.*</code>, never <code>edu.wpi.first.*</code>.
            </li>
            <li>
              <strong>
                The OpMode builds but does not appear on the driver station
              </strong>{" "}
              (you will hit this two lessons from now) — the class has to sit in{" "}
              <code>frc.robot.opmodes</code> and carry{" "}
              <code>@Teleop(name = &quot;...&quot;)</code>. The framework finds
              it by that annotation and nothing else.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── what's next ──────────────────────────────────────────────── */}
      <LessonSection id="where-this-goes-next" title="What's next">
        <p className="prose-body measure">
          You have six commands and one command per button. Three pages build on
          that:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--tx2)" }}
        >
          <li>
            <strong>Triggers</strong>, next — where{" "}
            <code>driver.leftTrigger().onTrue(...)</code> comes from, what else
            can be a trigger, and why the bindings in that constructor disappear
            on their own when the OpMode changes.
          </li>
          <li>
            <strong>Chaining Commands</strong> — how to give a hold an ending
            and run several of these commands from one button, in order. That is
            where <code>Command.sequence</code>, <code>Command.race</code> and{" "}
            <code>.withTimeout(...)</code> arrive, and where the{" "}
            <code>onTrue</code>/<code>onFalse</code> pair gets replaced by a
            single <code>whileTrue</code>.
          </li>
          <li>
            <strong>Coroutines</strong>, at the end of the course — a second way
            to write a command body, as one block of code that pauses itself
            from the inside. It is the advanced dialect and you will not need it
            for a long while. Everything between here and there is chaining.
          </li>
        </ul>
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does 2-Commands change setVoltage from public to private?",
            options: [
              "Private methods run faster on SystemCore",
              "So that the only way to move the arm is through a command, which lets the scheduler track who owns the motor",
              "Because Mechanism requires all setters to be private",
              "To hide the voltage constants from other mechanisms",
            ],
            correctAnswer: 1,
            explanation:
              "The scheduler tracks which command owns which mechanism, so two commands can never drive the same motor at once. That bookkeeping only applies to commands. A plain setVoltage(6.0) call from anywhere goes around it, so the door gets closed.",
          },
          {
            id: 2,
            question:
              'In runRepeatedly(() -> setVoltage(SLOW_VOLTAGE)).named("runSlow (hold)"), what does runRepeatedly(...) hand back before .named(...) runs?',
            options: [
              "A finished Command, ready to schedule",
              "A NeedsNameBuilderStage — a half-built command that is not a Command until it is named",
              "void — runRepeatedly schedules the command immediately",
              "A Runnable that the scheduler wraps later",
            ],
            correctAnswer: 1,
            explanation:
              "runRepeatedly returns a NeedsNameBuilderStage. .named(String) is what turns it into a Command. Leave the name off and the build fails, because the method promises a Command and a builder is not one. WPILib's @NoDiscard check is a separate matter: it catches a builder or a command written as a standalone statement and then thrown away.",
          },
          {
            id: 3,
            question:
              "Every command on this branch is a hold. What makes it one?",
            options: [
              "The (hold) suffix in the name — the framework reads it",
              "runRepeatedly wraps the body in a while (true) loop, so the command never finishes on its own",
              "Holds are scheduled at HIGHEST_PRIORITY so nothing can cancel them",
              "The command is bound with onTrue rather than onFalse",
            ],
            correctAnswer: 1,
            explanation:
              "runRepeatedly builds a while (true) loop around the body. There is no exit, so the command runs until something takes the mechanism away from it. The (hold) suffix is a naming convention that makes that visible to you — the framework does not read it.",
          },
          {
            id: 4,
            question:
              "You bind driver.a().onTrue(flywheel.runFast()) and leave the onFalse off. You release A. What happens?",
            options: [
              "The flywheel stops — releasing the button cancels the command, and canceling stops the motor",
              "runFast() is never canceled, so it keeps re-sending 6 V for the rest of the match",
              "The command is canceled but the wheel keeps spinning anyway",
              "The build fails — onTrue requires a matching onFalse",
            ],
            correctAnswer: 1,
            explanation:
              "onTrue schedules on the press and does nothing on release. runFast() is a hold, so nothing ends it. The onFalse binding is what ends it, by scheduling flywheel.stop(), which needs the same mechanism and therefore interrupts it. And note that even a plain cancellation would not have stopped the wheel: idle() sends no output and does not zero the last request.",
          },
          {
            id: 5,
            question: "Where does .whenCanceled(...) go in the chain, and why?",
            options: [
              "After .named(...), because a command must exist before you can hook it",
              "Before .named(...), because it is a NeedsNameBuilderStage method and .named(...) ends the builder",
              "Either position compiles — it is a style preference",
              "It is passed as a second argument to runRepeatedly",
            ],
            correctAnswer: 1,
            explanation:
              "whenCanceled, withPriority and until are all declared on NeedsNameBuilderStage, the builder type. .named(String) closes the builder and hands back a Command, which does not have those methods. So they go before the name.",
          },
        ]}
      />
    </PageTemplate>
  );
}
