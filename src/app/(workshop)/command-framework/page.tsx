import PageTemplate from "@/components/PageTemplate";
import FigureGrid from "@/components/lesson/FigureGrid";
import { Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

/**
 * The conceptual spine of Workshop 2: trigger, mechanism, command, scheduler.
 *
 * Five sections, three code blocks, one warning. Two sections went away in the
 * August 2026 prose pass. The architecture diagram was a second copy of the
 * figure grid plus a five-step narration of the same arm hold shown in code,
 * and "what this page left out" was a second copy of the curriculum drawer.
 *
 * The no-RobotContainer point survives as a margin note, where it costs a
 * student who has never seen FRC code nothing at all.
 */
export default function CommandFramework() {
  return (
    <PageTemplate
      title="The Command Framework"
      lede="Robot code on this team is built out of three kinds of thing: triggers, mechanisms, and commands. Underneath them a scheduler runs fifty times a second and settles which command owns which motor."
      needs={[
        <>
          The vocabulary from <strong>Java Basics</strong>: class, field,
          method, constructor, lambda, method reference.
        </>,
        <>
          <strong>2027-Template</strong> open in a tab. The check at the end
          reads it.
        </>,
      ]}
      time="12 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Four words carry the rest of the workshop: trigger, mechanism,
            command, scheduler. Every later lesson uses them, and so does the
            folder layout of every project in this course.
          </p>
          <p>
            The next four lessons build each piece for real. This one is the
            map, plus one rule about commands that never end.
          </p>
        </div>
      </Split>

      {/* ── the triad ────────────────────────────────────────────────── */}
      <FigureGrid
        items={[
          {
            label: "When",
            term: "Triggers",
            body: (
              <>
                A controller button, a sensor reading, a comparison you wrote
                yourself. Attach a command to a trigger and the scheduler
                watches it for you.
              </>
            ),
          },
          {
            label: "What",
            term: "Mechanisms",
            body: (
              <>
                The arm. The flywheel. The drivetrain. Each one is a class that{" "}
                <code>extends Mechanism</code>, with its motors and sensors as
                private fields and its configuration done once, in the
                constructor.
              </>
            ),
          },
          {
            label: "How",
            term: "Commands",
            body: (
              <>
                Named actions on a mechanism. Almost every command in Workshop 2
                is a <em>hold</em>: it re-sends the same request and never ends
                by itself.
              </>
            ),
          },
        ]}
      />

      {/* ── the scheduler ────────────────────────────────────────────── */}
      <LessonSection
        id="the-scheduler-and-the-one-line"
        title="The scheduler tick"
      >
        <p>
          None of the three does anything on its own. A trigger is a question
          nobody is asking, and a command sitting in a variable is inert. The
          scheduler moves them, and only because <code>Robot.java</code> asks it
          to, once per loop.
        </p>

        <CodeBlock
          language="java"
          title="Robot.java: the mechanisms and the scheduler"
          filename="src/main/java/first/robot/Robot.java"
          code={`public class Robot extends OpModeRobot {
  // The robot's mechanisms. Public so OpModes can use them.
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}`}
        />

        <p>
          <code>robotPeriodic()</code> is called for you for as long as the
          robot has power. The gap between calls is 20 milliseconds, so it runs{" "}
          <strong>50 times a second</strong>. One pass is a{" "}
          <strong>tick</strong>. When a page here says every tick, it means
          fifty times a second.
        </p>

        <p>One call to the scheduler does this, in order:</p>

        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Cancel commands and triggers belonging to a mode the driver station
            has left. Switching modes needs no cleanup code from you.
          </li>
          <li>
            Run background tasks added with{" "}
            <code>Scheduler.getDefault().addPeriodic(...)</code>: reading a
            camera, pushing numbers to a dashboard. Never a motor, because
            motors go through commands.
          </li>
          <li>
            Check every trigger. Newly true ones queue their command, and newly
            false ones can cancel theirs.
          </li>
          <li>
            Queue the <strong>default command</strong> for any mechanism with
            nothing queued or running.
          </li>
          <li>
            Promote everything queued into the running set, then give every
            running command one step and hand control to the next one.
          </li>
        </ol>
      </LessonSection>

      {/* ── ownership ────────────────────────────────────────────────── */}
      <LessonSection
        id="one-mechanism-one-command-at-a"
        title="One command per mechanism"
      >
        <p>
          A command declares which mechanisms it needs. The command from{" "}
          <code>arm.runFast()</code> needs the arm, and while it runs, it{" "}
          <strong>owns</strong> the arm. No other command touches that motor at
          the same time. You never write the code that enforces it.
        </p>

        <p>
          When a second command wants a mechanism that is already owned,
          priority settles it. A newcomer loses only if its priority is strictly
          lower. Every command you write here carries the same one, so ties go
          to the newcomer.
        </p>

        <Box variant="concept" title="Default commands">
          <p>
            Every mechanism has a <strong>default command</strong>, and unless
            you set one it is <code>idle()</code>. An idle command owns the
            mechanism at the lowest possible priority, so anything can take it
            away. It sends <em>nothing at all</em> to the motor.
          </p>
          <p className="mt-3">
            Read that last part twice. Idle does not switch the motor off.
            Phoenix keeps applying whatever request it was last given, so
            canceling a command does not stop hardware.{" "}
            <strong>Writing Commands</strong> deals with that.
          </p>
        </Box>
      </LessonSection>

      {/* ── opmodes ──────────────────────────────────────────────────── */}
      <LessonSection
        id="opmodes-the-layer-above-all-of"
        title="Where bindings live"
      >
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              Mechanisms own hardware. Something has to own the policy for one
              phase of the match: which buttons do what right now, which
              autonomous routine runs. That is an <strong>OpMode</strong>.
            </p>
            <p>
              <code>Robot</code> holds the mechanisms as{" "}
              <code>public final</code> fields and runs the scheduler. Each mode
              is its own class, tagged <code>@Teleop</code>,{" "}
              <code>@Autonomous</code> or <code>@Utility</code>. The framework
              finds them by their tag, lists them on the driver station, and
              hands each one the <code>Robot</code>.
            </p>
          </div>
        </Split>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java: the shape of a mode class"
          filename="src/main/java/first/robot/opmode/TeleopOpMode.java"
          code={`@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    final Arm arm = robot.arm;

    // Left trigger: push the arm up while held, stop when released.
    driver.leftTrigger().onTrue(arm.runFast()).onFalse(arm.stop());
  }
}`}
        />

        <p>
          The bindings live in the <strong>constructor</strong>. The framework
          builds this class when someone picks Teleop, and throws it away on a
          mode switch. The bindings go with it, so no binding from auto ever
          fires during teleop.
        </p>
      </LessonSection>

      {/* ── holds ────────────────────────────────────────────────────── */}
      <LessonSection
        id="holds-what-almost-every-command-here"
        title="Holds and the one rule"
      >
        <p>
          A <strong>hold</strong> is a command whose body runs again on every
          tick, re-sending the same request, and never reaching an end. It is
          the house style here for two reasons. The request survives a motor
          controller rebooting mid-match, and a command that never ends keeps
          owning its mechanism.
        </p>

        <p>Here is a real one, from the arm you build two lessons from now.</p>

        <CodeBlock
          language="java"
          title="Arm.java: a hold, its voltage, and the setter"
          filename="Workshop-Code, branch mech-2-Commands · mechanisms/Arm.java"
          code={`private static final double FAST_VOLTAGE = 6.0;

/** Push the arm with a stronger voltage and keep pushing. Never finishes. */
public Command runFast() {
  return runRepeatedly(() -> setVoltage(FAST_VOLTAGE)).named("runFast (hold)");
}

private void setVoltage(double voltage) {
  motor.setControl(voltageOut.withOutput(voltage));
}`}
        />

        <p>
          <code>runRepeatedly</code> re-runs <code>setVoltage</code> every tick,
          so the six-volt request never goes stale. The <code>(hold)</code> on
          the end of the name is a promise from whoever wrote it:{" "}
          <em>this command has no ending</em>.
        </p>

        <p>
          Six volts is a push, not a position. The arm ends up wherever gravity
          and friction let it.
        </p>

        <Box
          variant="alert-warning"
          tag="THE ONE RULE"
          title="Nothing may ever wait on a hold"
        >
          <p>
            Put a hold in a list of steps and the list stops there{" "}
            <em>forever</em>. Step two never runs, because step one never
            reaches an end. No exception is thrown and nothing appears in the
            log. The routine sits there looking broken.
          </p>
          <p className="mt-3">
            <strong>How you spot one:</strong> the <code>(hold)</code> suffix.
            Every command name on this site that has no ending carries it. Work
            out which command a stuck routine is sitting on, and the name tells
            you whether it was ever going to finish. Workshop 5 gives a hold an
            ending two ways, <code>.withTimeout(...)</code> and{" "}
            <code>.until(...)</code>.
          </p>
        </Box>
      </LessonSection>

      {/* ── the check ────────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Check your work">
        <p>
          There is no code to run, so check the words against real code. Open{" "}
          <strong>2027-Template</strong>, the finished robot this course builds
          toward, and find three things.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <code>Robot.java</code>: <code>extends OpModeRobot</code>,{" "}
            <code>public final</code> fields for the mechanisms, and a{" "}
            <code>robotPeriodic()</code> holding one line,{" "}
            <code>Scheduler.getDefault().run();</code>.
          </li>
          <li>
            No <code>RobotContainer.java</code> in the file list, and an{" "}
            <code>opmode</code> folder with a class per mode, each tagged{" "}
            <code>@Teleop</code>, <code>@Autonomous</code> or{" "}
            <code>@Utility</code>. Find a real <code>RobotContainer.java</code>{" "}
            with no <code>opmode</code> folder beside it and you are reading a
            Commands v2 project, not this one.
          </li>
          <li>
            <code>subsystems/arm/Arm.java</code>, searched for{" "}
            <code>(hold)</code>: three command names carry it. They differ from{" "}
            <code>runFast()</code> above because the template is the finished
            robot, and the lesson branches build up to it.
          </li>
        </ol>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/blob/mech-2-Commands/src/main/java/first/robot/Robot.java"
          title="Workshop-Code mech-2-Commands: Robot.java"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Robot.java calls Scheduler.getDefault().run() inside robotPeriodic(). What breaks if you delete that line?",
            options: [
              "Every command on the robot stops running: triggers are never checked and nothing is ever scheduled",
              "Only autonomous stops working; teleop bindings run directly off the driver station",
              "The motors keep running but stop logging",
              "Nothing: the scheduler starts itself when the first command is built",
            ],
            correctAnswer: 0,
            explanation:
              "That one line is the engine. robotPeriodic() runs 50 times a second, and each call is the pass where the scheduler checks triggers, queues default commands, and gives every running command a turn. Without it, a built command is inert.",
          },
          {
            id: 2,
            question:
              "One command has the arm. A button fires and a second command that also needs the arm gets scheduled. Both have the ordinary priority. Who ends up with the arm?",
            options: [
              "Neither: the scheduler drops both and runs the default command",
              "The command that was already running: a mechanism cannot be taken away",
              "The new command; the one that was running is canceled",
              "Both run at once and their voltages are added together",
            ],
            correctAnswer: 2,
            explanation:
              "A newcomer only loses if its priority is strictly lower than the running command's. Every command you write has the same priority, so ties go to the newcomer. Bind two commands that both need the arm to two buttons and you can watch it happen.",
          },
          {
            id: 3,
            question:
              'A routine has been stuck for eight seconds, and the command it is sitting on is named "runFast (hold)". What does that name tell you?',
            options: [
              "The command crashed and the scheduler is retrying it",
              "It is a hold, which never finishes on its own, so whatever is waiting on it will wait forever",
              "The mechanism is busy and the command has not started yet",
              "Nothing useful; command names are decorative",
            ],
            correctAnswer: 1,
            explanation:
              "That is what the (hold) suffix is for. A hold has no ending by design, so anything waiting on one waits forever. Chaining Commands and Finish Lines give a hold an ending two ways: .withTimeout(...) and .until(...).",
          },
          {
            id: 4,
            question:
              "No command is claiming the flywheel. What is the mechanism doing?",
            options: [
              "The scheduler re-runs the last command that finished",
              "It throws an error until something claims it",
              "Nothing is running, and the motor has been switched off",
              "Its default command, idle(), owns it at the lowest priority and sends no output at all, so the motor keeps applying whatever request it last received",
            ],
            correctAnswer: 3,
            explanation:
              "Every mechanism defaults to idle(). Idle owns the mechanism so anything can take it away, but it commands nothing: it does not zero the previous request. Canceling a command is not the same as stopping a motor, so a separate stop() command exists.",
          },
        ]}
      />
    </PageTemplate>
  );
}
