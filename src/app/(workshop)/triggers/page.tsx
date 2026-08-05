import PageTemplate from "@/components/PageTemplate";
import FigureGrid from "@/components/lesson/FigureGrid";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

export default function Triggers() {
  return (
    <PageTemplate
      title="A Trigger is a yes-or-no question with commands attached"
      emphasis="yes-or-no question"
      lede="Last lesson you added six commands and a TeleopOpMode that runs them from the controller. This page takes that OpMode apart: what driver.a() actually hands you, the four verbs you can hang off it, and why the branch writes every binding as a pair."
      needs={[
        <>
          The <code>2-Commands</code> branch checked out, with <code>Arm</code>,{" "}
          <code>Flywheel</code> and <code>opmodes/TeleopOpMode.java</code> in
          place.
        </>,
        <>
          <code>runSlow()</code>, <code>runFast()</code> and <code>stop()</code>{" "}
          on both mechanisms, from{" "}
          <a href="/adding-commands" className="underline">
            Commands
          </a>
          .
        </>,
        <>
          <code>./gradlew build</code> passing before you change anything.
        </>,
      ]}
      branch="2-Commands"
      time="Roughly 25 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "The part worth slowing down for is not what you write. It is where you write it. A binding typed inside an OpMode constructor belongs to that OpMode and disappears when the mode changes. A binding typed inside the Robot constructor lasts for the whole program.",
          ]}
          concept="A Trigger fires a Command. Where you type the binding decides how long it lives."
        />
        <MarginNote label="WHAT YOU'LL BUILD">
          A fourth button binding of your own, and a clear rule for where every
          binding in the project belongs. Nothing moves yet — the controller
          does not get pressed until{" "}
          <a href="/running-program" className="underline">
            Running Your Code
          </a>
          , so every check on this page is a build check.
        </MarginNote>
      </Split>

      {/* ── what a Trigger is ────────────────────────────────────────── */}
      <LessonSection
        id="what-driver-a-hands-you"
        title={
          <>
            What <code>driver.a()</code> hands you
          </>
        }
        outlineLabel="What driver.a() hands you"
      >
        <p className="prose-body measure">
          It hands you a <code>Trigger</code>. A Trigger is a yes-or-no question
          that the scheduler asks once every loop, with a list of commands
          attached to the moments the answer changes. That is the whole idea.
          The class lives in <code>org.wpilib.command3</code>; the controllers
          that produce them, like <code>CommandNiDsXboxController</code>, live
          one package down in <code>org.wpilib.command3.button</code>.
        </p>

        <p className="prose-body measure">
          Nothing about a Trigger requires a button.{" "}
          <code>new Trigger(...)</code> takes a <code>BooleanSupplier</code> —
          any lambda or method reference that answers true or false. WPILib
          builds its own robot-mode Triggers exactly that way:
        </p>

        <CodeBlock
          language="java"
          title="A Trigger with no button behind it"
          filename="org/wpilib/command3/button/RobotModeTriggers.java"
          code={`/**
 * Returns a trigger that is true when the robot is disabled.
 *
 * @return A trigger that is true when the robot is disabled.
 */
public static Trigger disabled() {
  return new Trigger(RobotState::isDisabled);
}`}
        />

        <p className="prose-body measure">
          <code>RobotState::isDisabled</code> is a method reference: a yes-or-no
          method handed over as a value, so the scheduler can call it later.
          Wrap it in <code>new Trigger(...)</code> and it binds commands the
          same way the A button does.
        </p>

        <Box
          variant="alert-info"
          tag="NOTE · THIS BRANCH"
          title="Every Trigger in your project is a button right now"
        >
          <p>
            On <code>2-Commands</code>, <code>Arm</code> and{" "}
            <code>Flywheel</code> expose three commands each and nothing else —
            no method anywhere returns a position, a speed, or a true/false
            answer. So there is nothing yet to put inside{" "}
            <code>new Trigger(...)</code>. The first readable condition on a
            mechanism arrives on{" "}
            <a href="/finish-lines" className="underline">
              Finish Lines
            </a>
            , when the arm learns to report whether it got where it was sent:{" "}
            <code>arm::isAtTarget</code>. That is a <code>BooleanSupplier</code>
            , exactly what <code>new Trigger(...)</code> takes — though Finish
            Lines spends it on <code>.until(...)</code> rather than on a
            Trigger.
          </p>
        </Box>
      </LessonSection>

      {/* ── the four verbs ───────────────────────────────────────────── */}
      <LessonSection id="the-four-verbs" title="The four verbs">
        <p className="prose-body measure">
          A Trigger has four binding methods. Two of them react to a change and
          walk away; two of them own a command for as long as the answer stays
          the same.
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <code>onTrue(cmd)</code> — schedules <code>cmd</code> the loop the
            answer changes from false to true. Fires once per press.{" "}
            <strong>It never cancels anything.</strong>
          </li>
          <li>
            <code>onFalse(cmd)</code> — schedules <code>cmd</code> the loop the
            answer changes from true to false. Fires once per release. Also
            never cancels anything.
          </li>
          <li>
            <code>whileTrue(cmd)</code> — schedules <code>cmd</code> when the
            answer goes true <em>and cancels it</em> when the answer goes false.
            If <code>cmd</code> ends on its own while the button is still down,
            it is not restarted.
          </li>
          <li>
            <code>whileFalse(cmd)</code> — the mirror image: schedules{" "}
            <code>cmd</code> when the answer goes false, cancels it when the
            answer goes true.
          </li>
        </ul>

        <p className="prose-body measure">
          All four hand the Trigger back to you, which is why they chain onto
          one line. There are two more, <code>toggleOnTrue</code> and{" "}
          <code>toggleOnFalse</code>, which flip a command on and off with
          repeated presses. Neither appears anywhere in the workshop code or the
          team&apos;s template; the four above cover the whole course.
        </p>
      </LessonSection>

      {/* ── why the branch uses pairs ────────────────────────────────── */}
      <LessonSection
        id="why-the-branch-writes-every-binding"
        title="Why the branch writes every binding as a pair"
      >
        <p className="prose-body measure">
          Here are the three bindings sitting in your <code>TeleopOpMode</code>{" "}
          constructor right now, comments and all. Every one of them is two
          calls, not one.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — the bindings on 2-Commands"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`// Left trigger: push the arm up while held, stop when released.
driver.leftTrigger().onTrue(arm.runFast()).onFalse(arm.stop());

// Right trigger: spin fast while held, drop back to the slow voltage when released.
driver.rightTrigger().onTrue(flywheel.runFast()).onFalse(flywheel.runSlow());

// A: spin fast while held, stop when released.
driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());`}
        />

        <p className="prose-body measure">
          The reason is the one you met last lesson. <code>onTrue</code>{" "}
          schedules and nothing more, and <code>arm.runFast()</code> is a hold —
          it re-sends 6&nbsp;V every loop and never finishes. Leave the second
          call off and that command owns the arm for the rest of the match. What
          ends it is the release binding: <code>arm.stop()</code> needs the arm
          too, and a command of equal or higher priority claiming a mechanism
          interrupts whatever was already on it. Both run at the default
          priority of 0, so <code>stop()</code> wins by arriving second.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Canceling a command does not stop a motor"
        >
          <p>
            This is why a release half that is meant to stop the mechanism has
            to name a real command. When nothing claims a mechanism it falls
            back to <code>idle()</code>, which sends <em>no output at all</em> —
            it does not zero the last request. Phoenix keeps applying the last
            voltage it was handed. Stopping the motor takes a command that
            actively asks for zero, which is what <code>stop()</code> is for.
          </p>
          <p className="mt-3">
            An unpaired <code>onTrue</code> is therefore a deliberate choice,
            not an oversight. You will see one on <code>3-PID</code>:{" "}
            <code>driver.leftTrigger().onTrue(arm.vertical());</code>, where{" "}
            <code>vertical()</code> is a position hold and the arm is supposed
            to stay put after you let go. Pair the binding when the release
            should stop or change something. Leave it unpaired when the right
            answer on release is &quot;keep holding.&quot;
          </p>
        </Box>

        <p className="prose-body measure">
          Now look at the right trigger again. Releasing it does not stop the
          flywheel — it drops the flywheel back to the slow voltage. That is the
          real argument for the pair form:{" "}
          <strong>
            the pair form lets you say what happens on release, not only that
            something should stop.
          </strong>{" "}
          You name two commands and get two behaviors.
        </p>
      </LessonSection>

      {/* ── whileTrue later ──────────────────────────────────────────── */}
      <LessonSection
        id="why-whiletrue-takes-over-later"
        title={
          <>
            Why <code>whileTrue</code> takes over later
          </>
        }
        outlineLabel="Why whileTrue takes over later"
      >
        <p className="prose-body measure">
          Two bindings that have to stay in sync is two chances to get it wrong.
          Where the release really does mean &quot;stop doing that&quot;, one
          verb says it:
        </p>

        <CodeBlock
          language="java"
          title="The same button, two ways to write it"
          code={`// What 2-Commands writes: the press schedules one command, the release
// schedules another, and the second one interrupts the first.
driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());

// What you will write from Chaining Commands on: the press schedules,
// the release cancels. The whileFalse is still needed, because canceling
// leaves the motor at its last request.
driver.a().whileTrue(flywheel.runFast()).whileFalse(flywheel.stop());`}
        />

        <p className="prose-body measure">
          Both lines do the same thing to the flywheel. They get there
          differently: in the first, <code>stop()</code> ends{" "}
          <code>runFast()</code> by taking the mechanism away from it; in the
          second, the release itself cancels <code>runFast()</code> and{" "}
          <code>stop()</code> is there only to zero the motor.
        </p>

        <p className="prose-body measure">
          The second shape wins as soon as a button runs more than one command.
          On{" "}
          <a href="/chaining-commands" className="underline">
            Chaining Commands
          </a>{" "}
          you glue several commands into one group and bind the whole group to a
          button. &quot;Cancel that group&quot; is a thing{" "}
          <code>whileTrue</code> can do on its own; there is no single command
          you could name in an <code>onFalse</code> that would unwind a group
          step by step. <code>whileTrue</code> also cannot be half-written — the
          cancel is built into the verb.
        </p>

        <Box
          variant="alert-tip"
          tag="DO THIS NOW"
          title="Do not convert the three existing bindings"
        >
          <p>
            Leave the left trigger, the right trigger and A in the pair form the
            branch wrote them in. The pair form is what <code>2-Commands</code>{" "}
            teaches, and rewriting them now costs you the comparison. The switch
            to <code>whileTrue</code>&nbsp;+&nbsp;<code>whileFalse</code>{" "}
            happens on Chaining Commands, on code that has a reason for it. You
            do add one binding of your own further down this page — that one is
            the only change to the file.
          </p>
        </Box>
      </LessonSection>

      {/* ── scope: where the line goes ───────────────────────────────── */}
      <LessonSection
        id="where-you-type-the-binding-decides"
        title="Where you type the binding decides how long it lives"
      >
        <p className="prose-body measure">
          Different phases of a match want different controls. The A button
          spins the flywheel in teleop; in autonomous it should mean nothing.
          There is no <code>if (isTeleop)</code> anywhere in this project, and
          no code that removes a binding. Instead, a binding belongs to whatever
          was running when you created it — and you choose that by picking which
          constructor to type the line into.
        </p>

        <FigureGrid
          cols={2}
          items={[
            {
              label: "OpMode · lifetime of the mode",
              term: "Typed in an OpMode constructor",
              body: (
                <>
                  Where almost every binding goes. It exists while that OpMode
                  is the selected mode and is removed when the mode changes. All
                  three of your controller bindings are here.
                </>
              ),
            },
            {
              label: "Global · lifetime of the program",
              term: "Typed in the Robot constructor",
              body: (
                <>
                  Runs before any OpMode is selected, so there is no mode to
                  belong to and the binding lasts as long as the robot program
                  does. Your <code>Robot()</code> on <code>2-Commands</code> is
                  empty — you have none. The team&apos;s template has exactly
                  one, and that is the right number.
                </>
              ),
            },
          ]}
        />

        <h3 className="display m-0 text-aside">
          The OpMode case, which is the one you have
        </h3>

        <p className="prose-body measure">
          <code>TeleopOpMode</code> is its own class, tagged{" "}
          <code>@Teleop</code>. The framework finds it by that annotation, lists
          it by name on the driver station, and builds it when the driver picks
          it. Its constructor runs once at that moment — which is exactly when
          you want bindings created. The file&apos;s own javadoc, on the branch,
          says what happens next:
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — the shape, with the branch's own comment"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`/**
 * The driver's controls. The framework builds this class when "Teleop" is picked on the driver
 * station. The button bindings made in the constructor belong to this OpMode, and the framework
 * removes them on a mode switch. No cleanup code needed.
 *
 * <p>The buttons here run the arm and flywheel commands.
 */
@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;
    final Flywheel flywheel = robot.flywheel;

    // ... the three bindings go here ...
  }
}`}
        />

        <p className="prose-body measure">
          Two details in that shape are worth naming. <code>driver</code> is a
          field, so it is built before the constructor body runs; port 0 is the
          first controller on the driver station. <code>arm</code> and{" "}
          <code>flywheel</code> are local shorthands for the mechanisms{" "}
          <code>Robot</code> owns, and they exist only inside this constructor —
          which is also where every binding has to go.
        </p>

        <p className="prose-body measure">
          Pick autonomous on the driver station and the framework constructs
          that OpMode and tears down this one, taking its bindings with it. Pick
          Teleop again and a brand-new <code>TeleopOpMode</code> is constructed,
          so the same constructor runs again and the same three bindings come
          back. Each mode&apos;s controls come and go with the mode. You write
          no cleanup code, and a teleop binding cannot leak into autonomous,
          because it no longer exists there.
        </p>

        <p className="prose-body-sm measure">
          The same rule is why the mode kinds are separate classes at all:{" "}
          <code>@Teleop</code>, <code>@Autonomous</code> and{" "}
          <code>@Utility</code> each get their own file, their own constructor,
          and therefore their own set of bindings. Adding a second{" "}
          <code>@Teleop</code> class — a demo layout, a single-driver layout —
          adds another entry on the driver station and another independent set
          of controls.
        </p>

        <h3 className="display m-0 text-aside">
          The global case, and the one binding that earns it
        </h3>

        <p className="prose-body measure">
          A binding created in the <code>Robot</code> constructor has no OpMode
          to belong to yet, so it is global and never removed. That fits a
          binding whose whole job is to work no matter which mode is selected.
          The team&apos;s template has exactly one, and it is about being{" "}
          <em>disabled</em>, which is not a mode any OpMode owns:
        </p>

        <CodeBlock
          language="java"
          title="Robot.java — the one global binding, from the 2027-Template"
          filename="src/main/java/frc/robot/Robot.java"
          code={`public Robot() {
  // ...

  // Brake while disabled, in every mode. Created here (before any OpMode is selected) so the
  // binding is global; the opmodes' bindings are scoped to their OpMode and removed on a switch.
  final var idle = new SwerveRequest.Idle();
  RobotModeTriggers.disabled().whileTrue(drivetrain.applyRequest(() -> idle));
}`}
        />

        <p className="prose-body measure">
          The command here acts on a swerve drivetrain you do not have yet —
          that is Workshop&nbsp;#2. The address is the lesson, not the command.{" "}
          <code>RobotModeTriggers.disabled()</code> is true whenever the robot
          is disabled, which happens between modes and before any mode has been
          picked, so a binding on it has to outlive every OpMode. Nothing else
          in the project qualifies. If you find yourself adding a second global
          binding, check first whether it really belongs in each OpMode that
          needs it.
        </p>

        <Box
          variant="concept"
          tag="HOW IT WORKS · ALPHA-6"
          title="The scheduler picks the narrowest scope that is active"
        >
          <p>
            You never name a scope. When a binding is created, the scheduler
            looks at what is running and captures the{" "}
            <strong>narrowest active scope</strong>: the currently running
            command if there is one, otherwise the currently selected OpMode,
            otherwise global. When that scope ends, the binding is dropped and
            any command it started is canceled.
          </p>
          <p className="mt-3">
            That is the whole mechanism, and it is why the answer to &quot;how
            long does this binding live?&quot; is always &quot;as long as the
            thing you typed it inside of.&quot; <code>Trigger</code> does have a
            public <code>unbind()</code> method, but the scheduler calls it for
            you when the scope goes inactive.
          </p>
        </Box>

        <p className="prose-body-sm measure">
          That first case — a binding created inside a running command, alive
          only while that command runs — is real and occasionally useful: a
          routine can expose an abort button that exists only while the routine
          is going. Writing one means writing a command body by hand, which is
          the coroutine dialect. It waits for{" "}
          <a href="/coroutines" className="underline">
            Coroutines
          </a>{" "}
          in Advanced Topics. Nothing in Workshop&nbsp;#1 or #2 needs it.
        </p>
      </LessonSection>

      {/* ── your turn ────────────────────────────────────────────────── */}
      <LessonSection id="add-a-fourth-binding" title="Add a fourth binding">
        <p className="prose-body measure">
          The branch binds three controls — left trigger, right trigger, A. B is
          free. Give it the arm at the gentle voltage. This goes{" "}
          <strong>
            inside <code>public TeleopOpMode(Robot robot)</code>
          </strong>
          , below the existing A binding — the same block as the other three,
          not above the constructor and not in a method of its own.
        </p>

        <CodeBlock
          language="java"
          title="Add this to the constructor"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`// B: push the arm gently while held, stop when released.
driver.b().onTrue(arm.runSlow()).onFalse(arm.stop());`}
        />
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            Read your constructor top to bottom.{" "}
            <strong>{"You should see: "}</strong> the two local declarations,
            then four bindings, then the constructor&apos;s closing brace — and
            no binding anywhere outside it.
          </li>
          <li>
            Run <code>./gradlew build</code> (or{" "}
            <em>WPILib: Build Robot Code</em>).{" "}
            <strong>{"You should see: "}</strong> <code>BUILD SUCCESSFUL</code>.
          </li>
          <li>
            <strong>Break it on purpose.</strong> Delete{" "}
            <code>.onFalse(arm.stop())</code> from your new line, leaving{" "}
            <code>driver.b().onTrue(arm.runSlow());</code>. Build again.{" "}
            <strong>{"You should see: "}</strong> <code>BUILD SUCCESSFUL</code>{" "}
            again. That is the point of the exercise. A missing release binding
            is not a compile error — it is an arm that starts pushing on the
            first press and never stops. Put the <code>.onFalse(...)</code>{" "}
            back.
          </li>
          <li>
            <strong>Break it the other way.</strong> Cut your B line out of the
            constructor and paste it above the constructor, next to the{" "}
            <code>driver</code> field. Build again.{" "}
            <strong>{"You should see: "}</strong> the build fail. A binding is a
            statement, and statements live inside constructors and methods — and
            even if Java allowed it there, <code>arm</code> is a local variable
            of the constructor and does not exist at field level. Put the line
            back inside the constructor.
          </li>
          <li>
            Build one last time. <strong>{"You should see: "}</strong>{" "}
            <code>BUILD SUCCESSFUL</code>, with four bindings in the
            constructor. Pressing them is the next lesson.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="No TeleopOpMode, unresolved symbols, or an arm that never stops"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                There is no <code>TeleopOpMode.java</code> to edit, and the
                driver station lists no Teleop mode.
              </strong>{" "}
              You are still on <code>1-Subsystem</code>. That branch has no{" "}
              <code>opmodes</code> package at all — checking it out removes the
              file this page is about. Switch to <code>2-Commands</code> and the
              folder comes back.
            </li>
            <li>
              <strong>
                <code>cannot find symbol: method runSlow()</code>, pointing at{" "}
                <code>arm</code>.
              </strong>{" "}
              You have <code>2-Commands</code> checked out but an{" "}
              <code>Arm.java</code> copied in from <code>1-Subsystem</code>.
              That version has no commands at all — only{" "}
              <code>setVoltage(double)</code> and a <code>stop()</code> that
              returns <code>void</code> instead of a <code>Command</code>.
              Restore the branch&apos;s own <code>Arm.java</code> and rebuild.
            </li>
            <li>
              <strong>
                <code>cannot find symbol</code>, pointing at <code>driver</code>{" "}
                or <code>b()</code>.
              </strong>{" "}
              Check the field is spelled{" "}
              <code>
                private final CommandNiDsXboxController driver = new
                CommandNiDsXboxController(0);
              </code>{" "}
              and that the import{" "}
              <code>org.wpilib.command3.button.CommandNiDsXboxController</code>{" "}
              is at the top of the file.
            </li>
            <li>
              <strong>
                It compiles, and later the arm runs but never stops.
              </strong>{" "}
              Either the <code>onFalse</code> half is missing, or you bound the
              release to a command on the wrong mechanism —{" "}
              <code>flywheel.stop()</code> does not take the arm away from{" "}
              <code>arm.runSlow()</code>, so the arm keeps pushing. The release
              command has to need the same mechanism as the press command.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── the real file ────────────────────────────────────────────── */}
      <LessonSection
        id="the-whole-file-live-from-the"
        title="The whole file, live from the branch"
      >
        <p className="prose-body measure">
          This is <code>opmodes/TeleopOpMode.java</code> as it exists on{" "}
          <code>2-Commands</code> — the file this page has been taking apart.
          Yours should match it, plus your B binding.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="2-Commands"
          filePath="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
        />

        <p className="prose-body measure">
          For the global binding, read the template&apos;s <code>Robot</code>{" "}
          constructor. It is the only global binding the team writes — the same
          single line reappears in the <code>Robot</code> constructor of every
          Workshop&nbsp;#2 branch, and it is always this one binding.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/Robot.java"
          title="Robot.java — the one global binding"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You write driver.a().onTrue(flywheel.runFast()) inside TeleopOpMode's constructor. When does that binding go away?",
            options: [
              "Never — button bindings always last for the whole program",
              "When the OpMode ends: the driver picks a different mode, the framework tears this OpMode down, and the binding goes with it",
              "Only when you call unbind() on the trigger yourself",
              "When runFast() finishes",
            ],
            correctAnswer: 1,
            explanation:
              "A binding created in an OpMode constructor belongs to that OpMode. Selecting another mode constructs that OpMode and tears this one down, and its bindings are removed automatically — no cleanup code. Trigger does have a public unbind(), but the scheduler calls it for you when the scope goes inactive. And runFast() is a hold, so it never finishes on its own.",
          },
          {
            id: 2,
            question:
              "Why does 2-Commands write .onFalse(arm.stop()) after .onTrue(arm.runFast()) instead of leaving it off?",
            options: [
              "Style — the framework rejects an unpaired onTrue at build time",
              "onTrue only schedules and never cancels, and runFast() is a hold, so the release binding is what takes the arm away from it",
              "onFalse re-runs the onTrue command in reverse",
              "Without it the arm would run at half voltage",
            ],
            correctAnswer: 1,
            explanation:
              "onTrue schedules a command on the press and does nothing on the release. runFast() is a hold, so nothing ends it. arm.stop() needs the same mechanism, and a command of equal or higher priority claiming a mechanism interrupts the one already on it — both are at the default priority of 0, so stop() wins by arriving second. Leaving the onFalse off builds fine and leaves the arm pushing.",
          },
          {
            id: 3,
            question:
              "Which of the branch's three bindings could NOT be rewritten as whileTrue paired with whileFalse(stop)?",
            options: [
              "Left trigger: arm runs fast while held, stops on release",
              "A: flywheel runs fast while held, stops on release",
              "Right trigger: flywheel runs fast while held, drops back to the slow voltage on release",
              "None of them — whileTrue plus whileFalse(stop) replaces every onTrue/onFalse pair",
            ],
            correctAnswer: 2,
            explanation:
              "whileTrue cancels its command on release, and canceling does not choose what runs next — the mechanism falls back to idle(), which sends no output and does not zero the last request. That is why whileFalse(stop) is the pairing: it actively asks for zero. The right-trigger binding needs the release to START something else (the slow hold), not stop, so whileFalse(stop) is the wrong second half and only naming that second command works. The other two want a stop, so the whileTrue/whileFalse(stop) form expresses them fine.",
          },
          {
            id: 4,
            question:
              "A binding should brake the drivetrain whenever the robot is disabled, in every mode. Where do you type it?",
            options: [
              "In the Robot constructor, which runs before any OpMode is selected — that makes the binding global",
              "In every OpMode constructor, one copy each",
              "Inside a command body that is always scheduled",
              "Nowhere — Commands v3 removed global bindings",
            ],
            correctAnswer: 0,
            explanation:
              "The template writes exactly this: RobotModeTriggers.disabled().whileTrue(drivetrain.applyRequest(() -> idle)) in the Robot constructor. The scheduler captures the narrowest active scope when a binding is created; in the Robot constructor there is no running command and no selected OpMode, so the scope is global and the binding is never removed. Being disabled is not a mode any OpMode owns, which is why this one earns global scope.",
          },
          {
            id: 5,
            question: "What does new Trigger(...) take as its argument?",
            options: [
              "A button number on the driver station",
              "A BooleanSupplier — any lambda or method reference that answers true or false",
              "A Command to run",
              "The Mechanism the binding should require",
            ],
            correctAnswer: 1,
            explanation:
              "A Trigger is a yes-or-no question the scheduler polls once per loop. WPILib's own RobotModeTriggers.disabled() is literally new Trigger(RobotState::isDisabled). Buttons are the common source, not the only one — on 2-Commands they are the only one, because nothing on the Arm or Flywheel is readable from outside yet.",
          },
        ]}
      />
    </PageTemplate>
  );
}
