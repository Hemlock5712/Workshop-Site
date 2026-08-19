import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { Book, GitBranch } from "lucide-react";

/**
 * Lesson 28, rewritten against `context/writing-style.md`. It measured 33.8
 * minutes across nine sections and fourteen code blocks, which is two lessons
 * sharing one page.
 *
 * What went, and why it was safe to go:
 *
 * - The `6-Coroutines` "before" embed. The student wrote that constructor on
 *   the previous page; two sentences recall it.
 * - The imports embed, and the one-line embeds for `new StateMachine(...)` and
 *   `setInitialState(...)`. All three read better as inline code inside the
 *   numbered step that tells you to type them.
 * - The whole-file `GitHubContent`. The four remaining blocks cover the entire
 *   constructor, and the button at the end of "Build the machine" still opens
 *   the file on the branch.
 * - Both `CollapsibleSection`s. The one load-bearing item in them, that a
 *   no-argument `switchFromAny()` only covers the states that exist when it
 *   runs, is step 4 of the procedure now.
 * - `Command.parallel`'s own section, and the `ParallelGroupBuilder.optional`
 *   paragraph it carried. Nothing in Workshop-Code or the template calls
 *   `optional(...)`, and a named API with no worked example is trivia.
 *
 * What stayed, deliberately: the four numbered steps, the `.negate()`
 * explanation (this is the first page on the site to use it), the untuned-arm
 * warning, all three failure shapes, the five bench checks, and the quiz.
 *
 * The four surviving code blocks carry long comments, and that is load-bearing
 * rather than lazy. The linter does not charge for words inside a `code` prop,
 * but more to the point the student reading this file in VS Code has the
 * comments and not this page. So the prose here never repeats them.
 *
 * Verification pass put four things back, paid for out of prose that narrated
 * the code blocks: the import packages (`org.wpilib.system.DataLogManager` is
 * not guessable from `command3`), the two Motion Magic config names, the
 * `0.5` rotations-per-second tolerance that "read the gap" is measured
 * against, and the two facts quiz Q2 and Q5 test (`Command.race`, and the
 * order a transition resolves in). A quiz question is not where content
 * survives a cut.
 */
export default function StateMachines() {
  return (
    <PageTemplate
      title="State Machines"
      lede="Your teleop is four independent button bindings, and none of them names what the robot is doing. This lesson rebuilds it as four named states with the arrows drawn between them. A jump nobody drew cannot happen."
      needs={[
        <>
          The arm and flywheel from <strong>Finish Conditions</strong>,
          including <code>flywheel.isAtTarget()</code>.
        </>,
        <>
          The <code>7-StateBased</code> branch, one commit past{" "}
          <code>6-Coroutines</code>. It touches one file.
        </>,
        <>
          Your gains from <strong>PID Tuning in Tuner X</strong> and{" "}
          <strong>Motion Magic</strong>, ready to paste back.
        </>,
        <>The simulator running, and a controller on port 0.</>,
      ]}
      branch="7-StateBased"
      time="About 25 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Each binding holds its own preset. Hold A and the flywheel spins,
            let go and it stops. Nothing names the difference between an arm
            that is up to shoot and one that is up by accident.
          </p>
          <p>
            Pull the left trigger during the Y routine and the arm changes
            hands, which cancels the whole Y group. The flywheel keeps spinning,
            because a canceled command does not zero the last request.
          </p>
          <p>
            A <code>Command.sequence</code> only moves forwards. A machine is a
            graph, so reach for one when a routine has to repeat or skip a
            phase.
          </p>
        </div>
        <MarginNote label="Shipped, not invented">
          <code>StateMachine</code> is{" "}
          <code>org.wpilib.command3.StateMachine</code>, released in the WPILib
          2027 alpha-6 build. Alpha APIs can still move.
        </MarginNote>
      </Split>

      <LessonSection id="one-command-per-state" title="One command per state">
        <p>
          A state is one command that runs the whole time the machine sits in
          it. A transition cancels that command and starts the next one.
        </p>
        <p>
          A state has to pose the whole robot. If Stowed only said &quot;arm
          vertical,&quot; the flywheel would sit wherever the last state left
          it. So each state commands both mechanisms at once.
        </p>
        <p>
          <code>Command.parallel(a, b)</code> starts both at once and finishes
          only when both have finished. <code>Command.race</code> ends its group
          on the first member to finish and cancels the rest. Two holds never
          finish, so neither does a parallel group. In a{" "}
          <code>Command.sequence</code> that is a bug. Here it is fine: the
          machine cancels a state&apos;s command the moment a transition fires.
        </p>
      </LessonSection>

      <LessonSection id="build-it-four-steps-in-one" title="Build the machine">
        <p>
          The constructor from last lesson gets replaced. Four imports are new:{" "}
          <code>StateMachine</code>, <code>StateMachine.State</code> and{" "}
          <code>Scheduler</code> from <code>org.wpilib.command3</code>, plus{" "}
          <code>org.wpilib.system.DataLogManager</code>.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <code>
              StateMachine sm = new StateMachine(&quot;Superstructure&quot;);
            </code>{" "}
            The name is required and reaches telemetry.
          </li>
          <li>
            Add one state per pose with <code>sm.addState(...)</code>. Each call
            returns a <code>State</code> for step 4.
          </li>
          <li>
            <code>sm.setInitialState(stowed);</code> Leave it out and{" "}
            <code>gradlew build</code> fails.
          </li>
          <li>
            Wire the transitions. Declare the bare <code>switchFromAny()</code>{" "}
            last: it only covers states that exist when it runs.
          </li>
        </ol>

        <CodeBlock
          language="java"
          hideControls
          code={`// 2. Add states. Each state owns one command. parallel(...) turns two commands into one, so
//    each state poses the whole robot. The poses are holds that never finish - that is fine,
//    because the machine cancels the old state's command when it switches. SpinUp is the
//    exception: .until(...) gives its command an ending, so it can use whenComplete() below.
State stowed =
    sm.addState(Command.parallel(arm.vertical(), flywheel.stop()).named("Stowed (hold)"));
State pickup =
    sm.addState(Command.parallel(arm.horizontal(), flywheel.stop()).named("Pickup (hold)"));
State spinUp =
    sm.addState(
        Command.parallel(arm.vertical(), flywheel.runFast())
            .until(flywheel::isAtTarget)
            .named("SpinUp until at speed"));
State ready =
    sm.addState(
        Command.parallel(arm.vertical(), flywheel.runFast()).named("ReadyToShoot (hold)"));`}
        />

        <p>
          <code>spinUp</code> and <code>ready</code> pose the robot identically.
          The difference is that <code>spinUp</code> ends, which names the
          moment the shot becomes legal.
        </p>

        <CodeBlock
          language="java"
          hideControls
          code={`// 4. Wire the transitions. Each condition is checked every loop while its state is active,
//    and fires the moment it flips from false to true.
stowed.switchTo(pickup).when(driver.leftTrigger()); // driver asks to intake
pickup.switchTo(stowed).when(driver.leftTrigger().negate()); // trigger released - pack up

stowed.switchTo(spinUp).when(driver.rightTrigger()); // driver asks to shoot

// SpinUp's command ends on its own, so this uses whenComplete(): it fires once, when the
// command finishes. Ready runs the same pose as SpinUp - it exists so drivers, LEDs, and
// autos can tell "spinning up" apart from "ready to shoot".
spinUp.switchTo(ready).whenComplete();

// Releasing the right trigger backs out of either shooting state.
sm.switchFromAny(spinUp, ready).to(stowed).when(driver.rightTrigger().negate());

// B is the escape hatch: back to stowed from ANY state.
// switchFromAny() with no args covers every state added so far, so declare it last.
sm.switchFromAny().to(stowed).when(driver.b());`}
        />

        <p>
          Read the arrows and the robot&apos;s behavior fits on one screen.
          Notice the absence: no arrow runs from <code>pickup</code> to{" "}
          <code>spinUp</code>. You cannot start a shot with the arm down,
          because nobody drew it.
        </p>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/blob/7-StateBased/src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          title="The whole file on 7-StateBased"
          icon={<GitBranch className="h-5 w-5" />}
        />
      </LessonSection>

      <LessonSection
        id="hand-the-machine-to-the-scheduler"
        title="Hand it to the scheduler"
      >
        <p>
          A <code>StateMachine</code> implements <code>Command</code>, so a
          field holds it directly. Building one still runs nothing until the
          scheduler is handed it.
        </p>

        <CodeBlock
          language="java"
          title="Three places in TeleopOpMode.java"
          hideControls
          code={`// Field on the OpMode - this one is new:
private final Command machine;
// (the driver field is already there from last lesson, unchanged)

// Last line of the constructor:
machine = sm; // a StateMachine is just a Command - schedule it like any other

// Two overrides, below the constructor:
@Override
public void start() {
  Scheduler.getDefault().schedule(machine);
}

@Override
public void end() {
  Scheduler.getDefault().cancel(machine);
}`}
        />
      </LessonSection>

      <LessonSection
        id="two-kinds-of-transition-and-how"
        title="Two kinds of transition"
      >
        <p>
          The state settles which spelling you use, not the condition.{" "}
          <code>whenComplete()</code> fires only when a state&apos;s command
          ends on its own. Only <code>spinUp</code> qualifies:{" "}
          <code>.until(flywheel::isAtTarget)</code> gives it an ending.
        </p>
        <p>
          A rising edge is the first loop a condition goes from false to true.
          It has to go false again before it fires twice, so holding B does not
          spin the machine. Conditions are checked in declaration order and the
          first edge wins, so a second one true at the same moment never fires.
        </p>
        <p>
          <code>.negate()</code> hands back a <code>Trigger</code> that is true
          exactly when the original is false. That is how the branch writes
          &quot;the driver let go.&quot; Inverting a plain method means a{" "}
          <code>!</code> in front of your lambda: one character that reverses
          the whole line.
        </p>
      </LessonSection>

      <LessonSection id="did-it-work" title="Check your work">
        <Box
          variant="alert-warning"
          tag="FIRST"
          title="The branch ships the arm untuned"
        >
          <p>
            <code>7-StateBased</code> ships <code>Arm.java</code> with{" "}
            <code>kG</code>, <code>kS</code>, <code>kP</code> and{" "}
            <code>kD</code> at <code>0.0</code>, and{" "}
            <code>MotionMagicCruiseVelocity</code> and{" "}
            <code>MotionMagicAcceleration</code> at <code>0.0</code>. The arm
            will not move. Paste your tuned values back first, or you will
            decide the machine is broken while it does exactly what you asked.
          </p>
        </Box>

        <p>
          Add a pair of log markers first. A working machine and a stuck one
          look identical from the driver seat.
        </p>

        <CodeBlock
          language="java"
          hideControls
          code={`// onEnter/onExit run small extras on the way in and out of a state, without touching the
// state's command. These two write markers into the log, so you can see exactly when the
// machine entered and left ReadyToShoot.
ready.onEnter(() -> DataLogManager.log("Superstructure: entered ReadyToShoot"));
ready.onExit(() -> DataLogManager.log("Superstructure: left ReadyToShoot"));`}
        />

        <p>
          <code>DataLogManager.log(...)</code> prints to the console and writes
          into the <code>.wpilog</code>. On a transition <code>onExit</code>{" "}
          runs, then the cancel, then the next state&apos;s command, all in one
          loop.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Enable in the simulator. The arm drives to vertical and the flywheel
            stays stopped. That is <code>Stowed (hold)</code>, running with no
            button pressed.
          </li>
          <li>
            Hold the left trigger and the arm swings to horizontal. Release it
            and the arm comes back. That is stowed to pickup and back again.
          </li>
          <li>
            Hold the right trigger. The flywheel spins up and{" "}
            <code>entered ReadyToShoot</code> lands in the console. Release it
            and the flywheel stops.
          </li>
          <li>
            Hold the left trigger, then press B while still holding it. The arm
            returns to vertical and stays there. Pickup needs the trigger
            released and pulled again.
          </li>
          <li>
            From pickup, pull the right trigger as well. Nothing happens. There
            is no arrow from <code>pickup</code> to <code>spinUp</code>, so that
            jump does not exist.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Three ways this goes wrong"
        >
          <p>
            <strong>The build fails.</strong> Either{" "}
            <code>setInitialState(...)</code> is missing, or a{" "}
            <code>Command.parallel(...)</code> group has no{" "}
            <code>.named(...)</code>. Both are compiler-plugin errors, and the
            message names which.
          </p>
          <p className="mt-3">
            <strong>It never leaves SpinUp.</strong>{" "}
            <code>.until(flywheel::isAtTarget)</code> never comes true. The
            tolerance is <code>0.5</code> rotations per second. The branch ships
            the flywheel with <code>kS</code> and <code>kP</code> at{" "}
            <code>0.0</code>, so nothing corrects the last of the error. Log the
            measured speed against the target and read the gap.
          </p>
          <p className="mt-3">
            <strong>It reaches ReadyToShoot at once.</strong>{" "}
            <code>getTargetVelocity()</code> returns <code>0</code> until{" "}
            <code>setVelocity(...)</code> has run once, so a stopped wheel
            already counts as at target. Require the measured speed to be above
            zero too.
          </p>
        </Box>

        <DocumentationButton
          href="https://github.com/wpilibsuite/allwpilib/blob/main/design-docs/commands-v3-state-machines.md"
          title="WPILib state machine design doc"
          icon={<Book className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Why does each state on the branch use Command.parallel(arm.…(), flywheel.…()) instead of a single mechanism command?",
            options: [
              "parallel runs commands faster than scheduling them separately",
              "A state has to pose the whole robot, so one command has to command both mechanisms: otherwise the other one is left wherever it was",
              "StateMachine.addState only accepts parallel groups",
              "It is required so the state can use whenComplete()",
            ],
            correctAnswer: 1,
            explanation:
              "addState takes any Command. The reason for parallel is that a state is supposed to describe the whole robot. If Stowed only said 'arm vertical', the flywheel would be doing whatever the previous state left it doing, and the state name would be a lie. The group also inherits both mechanisms' requirements, so nothing else can quietly drive them.",
          },
          {
            id: 2,
            question:
              "What is the difference between Command.parallel(a, b) and Command.race(a, b)?",
            options: [
              "parallel finishes when all members finish; race finishes as soon as any one member finishes and cancels the rest",
              "parallel finishes when any member finishes; race waits for all of them",
              "They are the same; race is the older spelling",
              "parallel runs members in order; race runs them at the same time",
            ],
            correctAnswer: 0,
            explanation:
              "Both start every member at once. parallel treats every member as required, so the group ends when the last one is done. race treats every member as optional, so the first one to finish ends the group and cancels the others. Two holds in a parallel group never finish, and that is why the states on this branch are holds.",
          },
          {
            id: 3,
            question:
              "SpinUp uses spinUp.switchTo(ready).whenComplete() while every other transition uses .when(...). Why?",
            options: [
              "whenComplete is faster because it skips the per-loop check",
              "Because SpinUp has two mechanisms and the others have one",
              "Because SpinUp is the only state whose command ends on its own: .until(flywheel::isAtTarget) gives it an ending, and whenComplete fires once when it does",
              "Because ready is the last state that was added",
            ],
            correctAnswer: 2,
            explanation:
              "whenComplete() is checked once, after the state's command finishes on its own. Three of the four states run holds that never finish, so whenComplete would never fire on them and they use .when(...) instead. SpinUp's .until(flywheel::isAtTarget) is what gives its parallel group an ending, which is what makes whenComplete available.",
          },
          {
            id: 4,
            question:
              "You add a fifth state to the machine, on the line right after sm.switchFromAny().to(stowed).when(driver.b());. Pressing B from that new state does nothing. Why?",
            options: [
              "B is already bound elsewhere and the bindings conflict",
              "switchFromAny() with no arguments applies only to the states that existed when it was called: the new state was added after",
              "You need to call setInitialState again after adding a state",
              "switchFromAny only works on states with hold commands",
            ],
            correctAnswer: 1,
            explanation:
              "switchFromAny() with no arguments is shorthand for adding the transition to every state in the machine at the time of the call. It is not retroactive. Declare cross-cutting transitions after all the states are added: the branch puts that line last and comments it for that reason.",
          },
          {
            id: 5,
            question:
              "A conditional transition fires while a state's command is running. In what order do things happen?",
            options: [
              "The next state's command starts, then the old one is canceled in the background",
              "The scheduler yields first, and the switch completes on the next loop",
              "The next state's onEnter runs before the old state's onExit, so the two can hand off",
              "onExit runs, the current command is canceled, and the next state's command starts in the same loop: no extra cycle",
            ],
            correctAnswer: 3,
            explanation:
              "Transitions resolve inside a single scheduler loop: onExit callbacks, then cancel, then the next state's command starts and its onEnter callbacks run. Nothing yields in between, so a chain of transitions that are all immediately true resolves without wasting loops.",
          },
          {
            id: 6,
            question:
              "When should you reach for a StateMachine instead of Command.sequence?",
            options: [
              "Whenever a routine has more than two steps",
              "Whenever more than one mechanism is involved",
              "When the routine has to repeat a phase, skip a phase, or go backwards: a sequence only moves forwards, top to bottom",
              "Whenever you want the routine to appear in telemetry",
            ],
            correctAnswer: 2,
            explanation:
              "Command.sequence is a line: A, then B, then C, then done. A state machine is a graph: any state can move to any state you connected, including back to an earlier one, plus onEnter/onExit hooks and switchFromAny interrupts. If your routine only moves forwards, the sequence is less code and easier to read.",
          },
        ]}
      />
    </PageTemplate>
  );
}
