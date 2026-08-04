import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import { GitBranch } from "lucide-react";

export default function CommandFramework() {
  return (
    <PageTemplate
      title="Four words the rest of the workshop is written in"
      emphasis="the rest of the workshop"
      lede="Robot code on this team is built out of three kinds of thing. Triggers are the WHEN: a button, a sensor reading, anything that is either true or false. Mechanisms are the WHAT: one class per physical thing, holding that thing's motors. Commands are the actions you run on a mechanism."
      needs={[
        <>
          <strong>What you need first:</strong> the vocabulary from{" "}
          <strong>The Java You Need</strong> — class, field, method,
          constructor, lambda, method reference. Every code block below uses all
          six.
        </>,
        <>
          <strong>Also useful:</strong> the robot template you cloned in{" "}
          <strong>Project Setup</strong>, open in your editor. The last section
          of this page has you go looking through it.
        </>,
        <>
          <strong>What you get:</strong> the four words the rest of the workshop
          is written in — trigger, mechanism, command, scheduler — plus the one
          rule that causes more stuck robots than anything else.
        </>,
      ]}
      time="About 20 minutes"
    >
      <KeyConceptSection
        title="Three parts and a loop"
        description={[
          "Underneath all three sits the scheduler. It is a loop that runs fifty times a second, checks every trigger, starts and stops commands, and keeps track of which command owns which mechanism so two commands can never fight over the same motor.",
          "Nothing here is code you type. This is the map for the next four lessons, where you build each piece for real.",
        ]}
        concept="Triggers start Commands. Commands drive Mechanisms. The scheduler runs the loop and settles who owns what."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>About 20 minutes</strong>, and no code to write. You start
          writing on the next page.
        </p>
      </Box>

      {/* ── the triad ────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6">
        <Box
          variant="concept"
          tag="WHEN"
          title="Triggers"
          subtitle={<strong>Something that is true or false</strong>}
        >
          A controller button, a sensor reading, a comparison you wrote
          yourself. You attach a command to a trigger, and the scheduler watches
          it for you. Bindings written in an OpMode&apos;s constructor belong to
          that OpMode and are removed when the driver station switches modes.
        </Box>

        <Box
          variant="concept"
          tag="WHAT"
          title="Mechanisms"
          subtitle={<strong>One physical thing each</strong>}
        >
          The arm. The flywheel. The drivetrain. Each is a class that{" "}
          <code>extends Mechanism</code>. Its motors and sensors are private
          fields, and its wiring configuration happens once, in the constructor.
        </Box>

        <Box
          variant="concept"
          tag="HOW"
          title="Commands"
          subtitle={<strong>Named actions, mostly holds</strong>}
        >
          Methods on a mechanism that hand back a <code>Command</code>. Almost
          every one you write in Workshop #1 is a <em>hold</em>: it keeps
          re-sending the same request and never ends by itself.
        </Box>
      </div>

      <LessonSection
        id="the-big-picture"
        title="The big picture"
        className="mt-4"
      >
        <ArchitectureDiagram variant="simple" />
      </LessonSection>

      {/* ── the scheduler ────────────────────────────────────────────── */}
      <LessonSection
        id="the-scheduler-and-the-one-line"
        title="The scheduler, and the one line that starts it"
      >
        <p>
          None of the three pieces above does anything on its own. A trigger is
          a question nobody is asking; a command you build and hold in a
          variable is inert. The <strong>scheduler</strong> is what makes them
          move, and it moves them because your <code>Robot</code> class asks it
          to, once per loop:
        </p>

        <CodeBlock
          language="java"
          title="Robot.java — trimmed to the two things this page is about"
          filename="src/main/java/frc/robot/Robot.java"
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
          That <code>robotPeriodic()</code> method is called for you, over and
          over, for as long as the robot is powered on. The gap between calls is
          20 milliseconds, so it runs <strong>50 times a second</strong>. One
          pass is called a <strong>tick</strong>, and you will see that word
          everywhere from here on. When a page says a command &quot;runs every
          tick,&quot; it means fifty times a second.
        </p>

        <p>
          Here is what one call to <code>Scheduler.getDefault().run()</code>{" "}
          actually does, in order. This list is the WPILib 2027 alpha&apos;s own
          description of the method, in plainer words:
        </p>

        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Cancel any commands and triggers that belonged to a mode the driver
            station is no longer running. This is why switching modes needs no
            cleanup code from you.
          </li>
          <li>
            Run any plain background tasks that were added to the scheduler (see
            the note below).
          </li>
          <li>
            Check every trigger. Newly-true ones queue up their command;
            newly-false ones can cancel theirs.
          </li>
          <li>
            For any mechanism with nothing queued or running, queue its{" "}
            <strong>default command</strong>.
          </li>
          <li>Promote the queued commands to the running set.</li>
          <li>
            Run every command in the running set — one step each, then hand
            control back so the next one gets its turn.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="NOTE · THE ESCAPE HATCH"
          title="Work that is not a command"
        >
          <p>
            Some jobs are not actions on a mechanism. Reading a camera, pushing
            numbers to a dashboard, refreshing an LED strip — these need to
            happen every tick but they do not own any hardware.{" "}
            <code>addPeriodic</code> is where they go:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`Scheduler.getDefault().addPeriodic(camera::update);`}
            />
          </div>
          <p className="mt-3">
            That exact line is real — the vision lesson&apos;s{" "}
            <code>Limelight</code> class registers each camera this way. Do not
            reach for it to move a motor; motors go through commands, so the
            scheduler can arbitrate who owns them.
          </p>
        </Box>
      </LessonSection>

      {/* ── ownership ────────────────────────────────────────────────── */}
      <LessonSection
        id="one-mechanism-one-command-at-a"
        title="One mechanism, one command at a time"
      >
        <p>
          This is the part of the framework that earns its keep. A command
          declares which mechanisms it needs — a command built by{" "}
          <code>arm.runFast()</code> needs the arm — and while that command is
          running, it <strong>owns</strong> the arm. No second command touches
          that motor at the same time. You never write the code that enforces
          this; the scheduler does it.
        </p>

        <p>
          So what happens when a second command wants a mechanism that is
          already owned? Every command carries a priority number, and every
          command you write in this workshop has the same one. When they tie,{" "}
          <strong>the newcomer wins</strong>: it takes the mechanism, and the
          command that was running is canceled. The only command that loses is
          one whose priority is strictly lower than what is already there.
        </p>

        <Box
          variant="concept"
          title="What happens when nothing claims a mechanism"
        >
          <p>
            Every mechanism has a <strong>default command</strong>, and unless
            you set one yourself it is <code>idle()</code>. An idle command owns
            the mechanism at the lowest possible priority — so anything can take
            it away — and it sends <em>nothing at all</em> to the motor.
          </p>
          <p className="mt-3">
            Read that last part twice, because it surprises everyone: idle does
            not switch the motor off. Phoenix keeps applying whatever request it
            was last given. A canceled command does not stop hardware. The{" "}
            <strong>Commands</strong> lesson shows what to do about it.
          </p>
        </Box>

        <p>
          Reading about ownership is worth about a tenth of watching one command
          shove another off a motor. Once you have a mechanism, two buttons and
          a simulator to watch, bind two commands that both need the arm and
          press both. The second one takes it.
        </p>
      </LessonSection>

      {/* ── opmodes ──────────────────────────────────────────────────── */}
      <LessonSection
        id="opmodes-the-layer-above-all-of"
        title="OpModes: the layer above all of it"
      >
        <p>
          Mechanisms own hardware. Something has to own the <em>policy</em> for
          a phase of the match: which buttons do what right now, which
          autonomous routine to run. That is an <strong>OpMode</strong>.
        </p>

        <p>
          The split is two files deep. <code>Robot</code> holds the mechanisms
          as <code>public final</code> fields and runs the scheduler — you saw
          it above. Each mode is then its own separate class, tagged with{" "}
          <code>@Teleop</code>, <code>@Autonomous</code> or{" "}
          <code>@Utility</code>. The framework finds those classes by their tag
          and lists them on the driver station, and each one is handed the{" "}
          <code>Robot</code> so it can reach the mechanisms.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — the shape of every mode class"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
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
          The bindings live in the <strong>constructor</strong>, and that is the
          whole trick. The framework builds this class when someone picks
          &quot;Teleop&quot; on the driver station, and throws it away on a mode
          switch. The bindings go with it. You write no cleanup code, and no
          leftover binding from auto can fire during teleop.
        </p>

        <Box
          variant="alert-warning"
          tag="IF YOU HAVE SEEN FRC CODE BEFORE"
          title="There is no RobotContainer and no SendableChooser here"
        >
          <p>
            Older FRC projects put every subsystem and every binding in one{" "}
            <code>RobotContainer</code> class, and picked the autonomous routine
            from a dropdown called a <code>SendableChooser</code>. Neither
            exists on this stack. Mechanisms live on <code>Robot</code>, and
            each autonomous routine is its own <code>@Autonomous</code> class
            that the driver station lists next to Teleop.
          </p>
          <p className="mt-3">
            If you find a tutorial with <code>RobotContainer</code> or{" "}
            <code>edu.wpi.first</code> imports in it, you are reading about a
            different framework. Ours is <code>org.wpilib</code>.
          </p>
        </Box>
      </LessonSection>

      {/* ── holds ────────────────────────────────────────────────────── */}
      <LessonSection
        id="holds-what-almost-every-command-here"
        title="Holds: what almost every command here is"
      >
        <p>
          A <strong>hold</strong> is a command whose body runs again on every
          tick — re-sending the same request fifty times a second — and never
          reaches an end. Two reasons that is the house style here. The request
          survives a motor controller rebooting mid-match, because the very next
          tick sends it again. And a command that never ends is a command that
          keeps owning its mechanism, so nothing else quietly takes the motor
          out from under it.
        </p>

        <p>
          Here is the real thing, from the arm you build two lessons from now.
          Three lines from three different parts of one file:
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — a hold, its voltage, and the setter it calls"
          filename="Workshop-Code, branch 2-Commands · subsystems/Arm.java"
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
          Read it from the inside out. <code>setVoltage(6.0)</code> asks the
          motor for six volts, once. <code>runRepeatedly(...)</code> wraps that
          in a command that re-runs it every tick, so the request never goes
          stale. <code>.named(&quot;runFast (hold)&quot;)</code> gives the
          finished command a name, and the <code>(hold)</code> on the end is a
          promise from whoever wrote it: <em>this command has no ending</em>.
        </p>

        <p>
          Six volts is a push, not a position. The arm goes where gravity and
          friction let it. Aiming at a real angle needs feedback, which arrives
          in <strong>PID Control</strong>. Until then a hold is a steady shove.
        </p>

        {/* ── THE ONE RULE ───────────────────────────────────────────── */}
        <Box
          variant="alert-warning"
          tag="THE ONE RULE"
          title="A hold never finishes, so nothing may ever wait on a hold"
        >
          <p>
            Put a hold in a list of steps and the list stops there{" "}
            <em>forever</em>. Step two never runs, because step one never
            reaches an end. No exception is thrown and no error appears in the
            log — the routine sits there looking broken.
          </p>
          <p className="mt-3">
            It is not a bug in the framework. A hold is <em>supposed</em> to run
            until something takes the mechanism away from it. That is the whole
            point of a hold.
          </p>
          <p className="mt-3">
            <strong>How you spot one:</strong> the <code>(hold)</code> suffix.
            Every command name on this site that has no ending carries it, and
            the whole reason the convention exists is this bug. Once you work
            out which command a stuck routine is sitting on, its name tells you
            whether it was ever going to finish.
          </p>
        </Box>

        <Box
          variant="concept"
          tag="THE FIXES ARRIVE LATER"
          title="Two ways to give a hold an ending"
        >
          <p>
            Diagnosing is all you can do today, and that is fine — you have no
            multi-step routines yet to get stuck. Both cures are named lessons
            further down the sidebar:
          </p>
          <ul className="ml-4 mt-3 list-disc space-y-2">
            <li>
              <code>.withTimeout(...)</code> — end the hold after a fixed amount
              of time. Blunt, but it works on the very first commands you write.
              That is <strong>Chaining Commands</strong>.
            </li>
            <li>
              <code>.until(arm::isAtTarget)</code> — end the hold when the
              mechanism reports that it actually arrived. Better, but it needs a
              mechanism that can measure itself, which yours cannot do yet. That
              is <strong>Finish Lines</strong>.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <p>
          There is no code to run, so check the words against the real project
          instead. Open the robot template you cloned in{" "}
          <strong>Project Setup</strong> and find these five things. Each one
          should take under a minute.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open <code>src/main/java/frc/robot/Robot.java</code>.{" "}
            <strong>You should see:</strong> <code>extends OpModeRobot</code> on
            the class line, and a few <code>public final</code> fields —{" "}
            <code>drivetrain</code>, <code>arm</code>, <code>flywheel</code>.
            Those are the mechanisms.
          </li>
          <li>
            Search that same file for <code>robotPeriodic</code>.{" "}
            <strong>You should see:</strong> one method, containing exactly one
            line — <code>Scheduler.getDefault().run();</code>. That is the whole
            engine.
          </li>
          <li>
            Look through the file list for a file called{" "}
            <code>RobotContainer.java</code>. <strong>You should see:</strong>{" "}
            there isn&apos;t one. A full-text search is a different matter — the
            name does turn up, in the comments at the top of{" "}
            <code>Robot.java</code> and <code>TeleopOpMode.java</code> and in
            the template&apos;s markdown docs, every time to say the thing does
            not exist here. What matters is that no file declares the class. If
            a tutorial you find later has you create one, it is not describing
            this stack.
          </li>
          <li>
            Open the folder <code>src/main/java/frc/robot/opmodes/</code>.{" "}
            <strong>You should see:</strong> six classes. Each one is a separate
            mode the driver station can run. Open two of them and look at the
            line above <code>public class</code> — <code>TeleopOpMode</code> is
            tagged <code>@Teleop</code>, <code>UtilityOpMode</code> is tagged{" "}
            <code>@Utility(name = &quot;Stow&quot;)</code>. The tag is what puts
            it on the driver station.
          </li>
          <li>
            Open <code>src/main/java/frc/robot/subsystems/arm/Arm.java</code>{" "}
            and search it for <code>(hold)</code>.{" "}
            <strong>You should see:</strong> five hits. Three of them are
            command names — <code>vertical (hold)</code>,{" "}
            <code>horizontal (hold)</code>, <code>scoring (hold)</code> — and
            the other two are in the comment block above them, where the file
            states the rule for itself. Three commands, three holds, no
            exceptions.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Three things that go wrong here"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                You have a <code>RobotContainer.java</code>, and no{" "}
                <code>opmodes</code> folder.
              </strong>{" "}
              You generated a blank project from the VS Code wizard instead of
              cloning the team template. That wizard produces the older
              framework, and nothing in this workshop will line up with it. Go
              back to <strong>Project Setup</strong> and clone the template.
            </li>
            <li>
              <strong>
                <code>Arm.java</code> has <code>vertical()</code>,{" "}
                <code>horizontal()</code> and <code>scoring()</code>, not the{" "}
                <code>runFast()</code> from the code block above.
              </strong>{" "}
              Correct, and expected. The template is the finished robot; the
              lesson branches build up to it one step at a time. The three names
              differ, the <code>(hold)</code> suffix does not.
            </li>
            <li>
              <strong>
                Your editor finds nothing when you search for{" "}
                <code>Scheduler</code>.
              </strong>{" "}
              You are probably searching one open file rather than the whole
              folder, or you opened the zip rather than the extracted project.
              Open the project folder itself, then search again.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── what comes later ─────────────────────────────────────────── */}
      <LessonSection
        id="what-this-page-left-out-on"
        title="What this page left out on purpose"
      >
        <p>
          Four words are worth knowing so they do not surprise you in someone
          else&apos;s code. Each has its own lesson; none of it is needed to
          start.
        </p>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Chaining</strong> — gluing commands into one bigger command
            so a single button runs several things in order. This is the style
            almost everything on this team is written in.{" "}
            <strong>Chaining Commands</strong>.
          </li>
          <li>
            <strong>Finish lines</strong> — ending a step when a mechanism
            reports it has arrived, rather than after a fixed time.{" "}
            <strong>Finish Lines</strong>.
          </li>
          <li>
            <strong>Coroutines</strong> — a second way of writing a command,
            where the body pauses itself from the inside. Reach for it when one
            hold has to span many steps. <strong>Coroutines</strong>, in
            Advanced Topics.
          </li>
          <li>
            <strong>State machines</strong> — the robot is always in exactly one
            named state, and buttons move it between them.{" "}
            <strong>State Machines</strong>, in Advanced Topics.
          </li>
        </ul>

        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
          <h3 className="display m-0 mb-4 text-lede">
            Ground truth for this lesson
          </h3>
          <p className="text-[var(--foreground)] mb-4">
            Every code block above was trimmed out of one of these files, not
            written for the page. Three of them are on branch{" "}
            <code>2-Commands</code> of the workshop code:{" "}
            <code>Robot.java</code> is the mechanisms and the scheduler tick,{" "}
            <code>TeleopOpMode.java</code> is the mode class and its bindings,
            and <code>Arm.java</code> is the hold. The <code>addPeriodic</code>{" "}
            line is from <code>Limelight.java</code> on branch{" "}
            <code>3-Limelight</code>. The onboarding guide is where the holds
            rule is stated in the team&apos;s own words.
          </p>
          <div className="flex flex-col gap-3">
            <DocumentationButton
              href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/ONBOARDING.md"
              title="2027-Template ONBOARDING.md — Holds never finish"
              icon={<GitBranch className="w-5 h-5" />}
            />
            <DocumentationButton
              href="https://github.com/Hemlock5712/Workshop-Code/blob/2-Commands/src/main/java/frc/robot/Robot.java"
              title="Workshop-Code 2-Commands — Robot.java, the mechanisms and the scheduler tick"
              icon={<GitBranch className="w-5 h-5" />}
            />
            <DocumentationButton
              href="https://github.com/Hemlock5712/Workshop-Code/blob/2-Commands/src/main/java/frc/robot/opmodes/TeleopOpMode.java"
              title="Workshop-Code 2-Commands — TeleopOpMode.java, bindings in the constructor"
              icon={<GitBranch className="w-5 h-5" />}
            />
            <DocumentationButton
              href="https://github.com/Hemlock5712/Workshop-Code/blob/2-Commands/src/main/java/frc/robot/subsystems/Arm.java"
              title="Workshop-Code 2-Commands — Arm.java, the arm you build in two lessons"
              icon={<GitBranch className="w-5 h-5" />}
            />
            <DocumentationButton
              href="https://github.com/Hemlock5712/Workshop-Code/blob/3-Limelight/src/main/java/frc/robot/subsystems/Limelight.java"
              title="Workshop-Code 3-Limelight — Limelight.java, the addPeriodic call"
              icon={<GitBranch className="w-5 h-5" />}
            />
          </div>
        </div>
      </LessonSection>

      <Box
        variant="alert-info"
        tag="NOTE · API STATUS"
        title="This is the WPILib 2027 alpha"
      >
        Commands v3 and the OpMode framework run on <strong>Java 25</strong> and
        deploy to <strong>SystemCore</strong> (GradleRIO{" "}
        <code>2027.0.0-alpha-6</code>, Phoenix 6 <code>26.50.0-alpha-1</code>).
        This is alpha software, so exact APIs still move between builds. The
        scheduler behavior described above was read out of the alpha-6 source in
        July 2026.
      </Box>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "What are the three pieces of the command-based framework, and which one owns hardware?",
            options: [
              "Inputs, Logic, Outputs — Outputs owns hardware",
              "Triggers, Mechanisms, Commands — Mechanisms owns hardware",
              "Sensors, Subsystems, Scheduler — Subsystems owns hardware",
              "Buttons, Routines, Motors — Motors owns hardware",
            ],
            correctAnswer: 1,
            explanation:
              "Triggers say when to run something, Mechanisms own the hardware (motors, sensors, configuration), and Commands are the actions that get scheduled onto a mechanism.",
          },
          {
            id: 2,
            question:
              "Robot.java calls Scheduler.getDefault().run() inside robotPeriodic(). What breaks if you delete that line?",
            options: [
              "Nothing — the scheduler starts itself when the first command is built",
              "Every command on the robot stops running: triggers are never checked and nothing is ever scheduled",
              "Only autonomous stops working; teleop bindings run directly off the driver station",
              "The motors keep running but stop logging",
            ],
            correctAnswer: 1,
            explanation:
              "That one line is the whole engine. robotPeriodic() runs 50 times a second, and each call is the pass where the scheduler checks triggers, queues default commands, and gives every running command a turn. Without it, a built command is inert.",
          },
          {
            id: 3,
            question:
              "One command has the arm. A button fires and a second command that also needs the arm gets scheduled. Both have the ordinary priority. Who ends up with the arm?",
            options: [
              "The command that was already running — a mechanism cannot be taken away",
              "The new command; the one that was running is canceled",
              "Both run at once and their voltages are added together",
              "Neither — the scheduler drops both and runs the default command",
            ],
            correctAnswer: 1,
            explanation:
              "A newcomer only loses if its priority is strictly lower than the running command's. Every command you write has the same priority, so ties go to the newcomer and the older command is canceled. Bind two commands that both need the arm to two buttons and you can watch it happen.",
          },
          {
            id: 4,
            question:
              'A routine has been stuck for eight seconds, and the command it is sitting on is named "runFast (hold)". What does that name tell you?',
            options: [
              "The command crashed and the scheduler is retrying it",
              "It is a hold, which never finishes on its own — so whatever is waiting on it will wait forever",
              "The mechanism is busy and the command has not started yet",
              "Nothing useful; command names are decorative",
            ],
            correctAnswer: 1,
            explanation:
              "That is what the (hold) suffix is for. A hold has no ending by design, so anything waiting on one waits forever. The two ways to give a hold an ending — .withTimeout(...) and .until(...) — arrive in Chaining Commands and Finish Lines.",
          },
          {
            id: 5,
            question:
              "No command is claiming the flywheel. What is the mechanism doing?",
            options: [
              "Nothing is running, and the motor has been switched off",
              "Its default command — idle() — owns it at the lowest priority and sends no output at all, so the motor keeps applying whatever request it last received",
              "The scheduler re-runs the last command that finished",
              "It throws an error until something claims it",
            ],
            correctAnswer: 1,
            explanation:
              "Every mechanism defaults to idle(). Idle owns the mechanism so anything can take it, but it commands nothing — it does not zero the previous request. Canceling a command is not the same as stopping a motor, which is why a separate stop() command exists.",
          },
        ]}
      />
    </PageTemplate>
  );
}
