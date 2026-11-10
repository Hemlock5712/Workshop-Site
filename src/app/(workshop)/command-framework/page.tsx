import PageTemplate from "@/components/PageTemplate";
import FigureGrid from "@/components/lesson/FigureGrid";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/command-framework");

/**
 * The conceptual spine of Workshop 2: trigger, coroutine, command, mechanism,
 * ordered small to large, then the scheduler that runs them.
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
      lede="Robot code is made up of four main parts: triggers, coroutines, commands and mechanisms."
      time="10 minutes"
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
                yourself. Attach a command to a trigger, and when the trigger
                becomes true or false the command runs automatically.
              </>
            ),
          },
          {
            label: "Steps",
            term: "Coroutines",
            body: (
              <>
                The body of a command. It runs a step each loop and can wait for
                the next loop before carrying on.
              </>
            ),
          },
          {
            label: "How",
            term: "Commands",
            body: (
              <>
                Named actions. A command can require a mechanism, which means it
                owns it while it runs, or require none.
              </>
            ),
          },
          {
            label: "What",
            term: "Mechanisms",
            body: (
              <>
                The arm. The flywheel. The drivetrain. Each one is a class that{" "}
                <code>implements Mechanism</code>, with its motors and sensors
                as private fields and its configuration done once, in the
                constructor.
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
          None of the four does anything on its own.{" "}
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
        title="Commands in a mechanism"
      >
        <p>
          We build most commands inside a mechanism. We will also build commands
          outside one that require no mechanism, such as a command that runs
          other commands together.
        </p>

        <p>
          Take <code>runFast()</code>, a command inside <code>Arm</code>. While{" "}
          <code>runFast</code> runs, it <strong>owns</strong> the arm. This
          prevents multiple commands from running on the same motor at one time.
        </p>

        <p>
          Every command has a priority. By default, a new command takes a
          mechanism only if its priority is the same or higher than the command
          already holding it. Every command in this workshop uses the same
          priority, so the new one always gets to run.
        </p>

        <Box variant="concept" title="Canceling is not stopping">
          <p>
            A mechanism can be given a <strong>default command</strong>, which
            the scheduler runs whenever nothing else has claimed it. Set one
            with <code>setDefaultCommand(...)</code> and give it a low priority,
            so anything can take the mechanism from it. Set none and an
            unclaimed mechanism has nothing running on it, which sends{" "}
            <em>nothing at all</em> to the motor.
          </p>
          <p className="mt-3">
            Nothing commanding the motor is not the same as the motor being off.
            Phoenix keeps applying the last request it was given, so canceling a
            command does not stop hardware.{" "}
            <a href="/running-program#latched" className="underline">
              Hardware Simulation
            </a>{" "}
            shows it.
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
              A mechanism owns hardware: the motors and encoders for that
              mechanism. We create our mechanisms in <code>Robot.java</code>,
              the same file as the scheduler call, so every OpMode can use them.
            </p>
            <p>
              An <strong>OpMode</strong> decides what the robot does during one
              part of the match. That means which buttons do what while a driver
              is in control, or which routine runs in autonomous.
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
          There are three types of OpMode: Teleop, Autonomous and Utility. Each
          mode is a separate class marked <code>@Teleop</code>,{" "}
          <code>@Autonomous</code> or <code>@Utility</code>. That marking is how
          it shows up in the list on the driver station. Every mode is handed
          the <code>Robot</code>, so it can reach the arm and the flywheel.
        </p>

        <CodeBlock
          language="java"
          title="MyTeleop.java: the shape of a mode class"
          filename="src/main/java/first/robot/opmode/MyTeleop.java"
          code={`@Teleop(name = "Teleop")
public class MyTeleop extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public MyTeleop(Robot robot) {
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
        <MarginNote label="Coroutine">
          <code>runRepeatedly(body)</code> is shorthand. <code>Mechanism</code>{" "}
          writes it as{" "}
          <code>
            {"run(coroutine -> { while (true) { body; coroutine.yield(); } })"}
          </code>
          . The <code>coroutine</code> is the command&apos;s own handle, and{" "}
          <code>yield()</code> is where it waits for the next loop.
        </MarginNote>
        <p>
          Nothing inside it decides when to stop, so ending it is somebody
          else&apos;s job. A trigger can do it. When the button is released,{" "}
          <code>whileTrue</code> cancels the command. To have something happen
          on the release, add it with <code>whileFalse</code>.
        </p>

        <CodeBlock
          language="java"
          title="MyTeleop.java: run while held, stop on release"
          code={`driver.leftTrigger().whileTrue(robot.arm.runFast()).whileFalse(robot.arm.stop());`}
        />
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          No editor yet. Take the left-trigger binding in <code>MyTeleop</code>{" "}
          above. Write down which command owns the arm before the press, while
          the trigger is held, and after the release.
        </p>
        <Box variant="alert-success" title="You should have">
          <ul className="ml-5 list-disc space-y-2">
            <li>Before the press: nothing. The arm is unclaimed.</li>
            <li>
              While held: <code>runFast</code>, started by{" "}
              <code>whileTrue</code>.
            </li>
            <li>
              After the release: <code>stop</code>, started by{" "}
              <code>whileFalse</code> as <code>runFast</code> is canceled.
            </li>
          </ul>
        </Box>
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
              "A newcomer only loses if its priority is strictly lower than the running command's. Every command you write has the same priority, so ties go to the newcomer.",
          },
          {
            id: 3,
            question:
              "A routine has been stuck for eight seconds on runFast, which is built with runRepeatedly. Why?",
            options: [
              "The command crashed and the scheduler is retrying it",
              "runRepeatedly never finishes on its own, so whatever is waiting on it will wait forever",
              "The mechanism is busy and the command has not started yet",
              "The arm hit a limit and the command is waiting for it to move",
            ],
            correctAnswer: 1,
            explanation:
              "A command built with runRepeatedly has no ending by design, so anything waiting on one waits forever. A routine never waits on the hold itself. It waits on a question about the mechanism, such as isAtTarget(), and Coroutines does that with coroutine.waitUntil(...).",
          },
          {
            id: 4,
            question:
              "No command is claiming the flywheel. What is the mechanism doing?",
            options: [
              "The scheduler re-runs the last command that finished",
              "It throws an error until something claims it",
              "Nothing is running, and the motor has been switched off",
              "Nothing is commanding it, and nothing sent a zero on the way out, so the motor keeps applying whatever request it last received",
            ],
            correctAnswer: 3,
            explanation:
              "Unless you gave the mechanism a default command, an unclaimed mechanism has nothing running on it at all. Nobody zeroes the previous request on the way out, so Phoenix carries on applying it. Canceling a command is not the same as stopping a motor. A separate stop() command exists for that.",
          },
        ]}
      />
    </PageTemplate>
  );
}
