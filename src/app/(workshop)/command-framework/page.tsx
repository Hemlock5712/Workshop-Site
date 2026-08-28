import PageTemplate from "@/components/PageTemplate";
import FigureGrid from "@/components/lesson/FigureGrid";
import { Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";

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
      lede="Robot code is built using three main concepts: triggers, mechanisms, and commands. Underneath them a scheduler runs fifty times a second and settles which command owns which motor."
      needs={[
        <>
          The vocabulary from <strong>Java Basics</strong>: class, field,
          method, constructor, lambda, method reference.
        </>,
      ]}
      time="9 minutes"
    >
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
        title="The scheduler loop"
      >
        <p>
          None of the three does anything on its own.{" "}
          <code>robotPeriodic()</code> is called for you for as long as the
          robot has power. The gap between calls is 20 milliseconds, so it runs{" "}
          <strong>50 times a second</strong>.
        </p>

        <CodeBlock
          language="java"
          title="Robot.java: the one call that runs the scheduler"
          filename="src/main/java/first/robot/Robot.java"
          code={`public class Robot extends OpModeRobot {
  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}`}
        />

        <p>
          One call does the whole job. It checks every trigger, starts and
          cancels commands from what it finds, and runs any background code you
          register.
        </p>
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
          the same time.
        </p>

        <p>
          Priorities are new in Commands v3. A second command takes a mechanism
          only if its priority is the same or higher than the command already
          holding it. Every command in this workshop carries the same priority,
          so a new one always gets to run.
        </p>

        <Box variant="concept" title="Canceling is not stopping">
          <p>
            A mechanism nothing has claimed runs its{" "}
            <strong>default command</strong>, which is the built-in{" "}
            <code>idle()</code> unless you set another. Idle has the lowest
            priority, so anything can take the mechanism from it, and it sends{" "}
            <em>nothing at all</em> to the motor.
          </p>
          <p className="mt-3">
            Read that last part twice. Idle does not switch the motor off.
            Phoenix keeps applying whatever request it was last given, so
            canceling a command does not stop hardware.{" "}
            <strong>Writing Commands</strong> deals with that.
          </p>
          <p className="mt-3">
            The arm and flywheel rarely reach idle in this workshop. A command
            with no finish condition keeps its mechanism, and every binding here
            replaces one such command with another.
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
              A mechanism owns hardware. An <strong>OpMode</strong> decides what
              the robot does during one part of the match. That means which
              buttons do what while a driver is in control, or which routine
              runs in autonomous.
            </p>
            <p>
              The mechanisms sit on the same <code>Robot.java</code> as that
              scheduler call.
            </p>
          </div>
        </Split>

        <CodeBlock
          language="java"
          title="Robot.java: the same file, with the mechanisms added"
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
          Each mode is a separate class marked <code>@Teleop</code>,{" "}
          <code>@Autonomous</code> or <code>@Utility</code>. That marking is how
          it shows up in the list on the driver station. Every mode is handed
          the <code>Robot</code>, so it can reach the arm and the flywheel.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java: the shape of a mode class"
          filename="src/main/java/first/robot/opmode/TeleopOpMode.java"
          code={`@Teleop(name = "Teleop")
public class TeleopOpMode extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public TeleopOpMode(Robot robot) {
    // Left trigger: push the arm up while held, stop when released.
    driver.leftTrigger().whileTrue(robot.arm.runFast()).whileFalse(robot.arm.stop());
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
        title="Commands with no finish condition"
      >
        <p>
          Almost every command in this workshop is built with{" "}
          <code>runRepeatedly(...)</code>. The body runs every loop. If you have
          seen a <code>while</code> loop before, this is one. Each pass runs the
          body, then waits for the next loop, 20 milliseconds later.
        </p>
        <p>
          Nothing inside it decides when to stop, so ending it is somebody
          else&apos;s job. Releasing the trigger is what does it above:{" "}
          <code>whileTrue</code> cancels the command on the way down, and{" "}
          <code>whileFalse</code> schedules <code>arm.stop()</code> in its
          place.
        </p>
        <p>
          There are two main reasons to write commands this way. The main one is
          visibility. A command that keeps running stays the command on its
          mechanism, so a log always names what has the arm right now. The
          second is that re-sending every loop keeps the request alive through a
          motor controller rebooting mid-match.
        </p>

        <p>Here is a real one, from the arm you build two lessons from now.</p>

        <CodeBlock
          language="java"
          title="Arm.java: one command, from the arm you build later"
          filename="Workshop-Code, branch mech-2-Commands · mechanisms/Arm.java"
          code={`/** Push the arm with a stronger voltage and keep pushing. Never finishes. */
public Command runFast() {
  return runRepeatedly(() -> setVoltage(6.0)).named("runFast (hold)");
}`}
        />

        <p>
          <code>runRepeatedly</code> re-runs <code>setVoltage</code> every loop,
          so the six-volt request never goes stale. Every command on this site
          built that way carries the <code>(hold)</code> suffix, which is a
          promise from whoever wrote it: <em>this command has no ending</em>.
        </p>

        <p>
          Six volts is a push, not a position. The arm ends up wherever gravity
          and friction let it.
        </p>
      </LessonSection>

      {/* ── the check ────────────────────────────────────────────────── */}
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
