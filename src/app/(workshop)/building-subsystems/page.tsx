import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

export default function BuildingSubsystems() {
  return (
    <PageTemplate
      title="One class per physical thing"
      emphasis="per physical thing"
      lede="A mechanism is one physical part of the robot, written as one Java class: the arm, the flywheel, later the drivetrain. The class owns that part's motors and sensors, sets them up once, and is the only code in the project allowed to touch them."
      needs={[
        <>
          A working toolchain, from <strong>Project Setup</strong> — Java 25,
          the vendordeps and the 2027 alpha, proven by one clean{" "}
          <code>./gradlew build</code>.
        </>,
        <>
          Class, field, constructor, method, <code>new</code>,{" "}
          <code>public</code> / <code>private</code> / <code>final</code>,{" "}
          <code>void</code> and <code>double</code>, from{" "}
          <strong>The Java You Need</strong>. That page took this exact file
          apart word by word; this one asks what each line is <em>for</em>.
        </>,
        <>
          Your bench devices answering in Tuner X on the bus named{" "}
          <code>canivore</code>, from <strong>Mechanism Setup</strong> — arm
          motor <code>31</code>, arm encoder <code>32</code>, flywheel{" "}
          <code>21</code> and <code>22</code>.
        </>,
      ]}
      branch="1-Subsystem"
      time="Roughly 30 minutes"
    >
      <KeyConceptSection
        description={[
          "This page builds two of them and hands them to the robot. Neither class writes a command of its own yet — that is the next lesson. What they do have is real hardware: CAN IDs, a CANivore, an encoder wired into the motor's feedback, and a configuration that gets retried if the bus hiccups on boot.",
          "The last file you write is the shortest and the most important. It is the one that starts the scheduler.",
        ]}
        concept="One class per physical thing. Hardware in private fields, configuration in the constructor, and one line in Robot.java that makes the whole framework run."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>What you&apos;ll build:</strong> <code>Arm.java</code>,{" "}
          <code>Flywheel.java</code>, and the <code>Robot.java</code> that owns
          them both. <strong>Roughly 30 minutes.</strong>
        </p>
        <p className="mt-3">
          <strong>Which project you work in — read this before Step 1.</strong>{" "}
          Not the 2027-Template clone from <strong>Project Setup</strong>. That
          template is the finished robot: twenty-odd Java files under{" "}
          <code>frc/robot/</code>, an <code>opmodes</code> folder with six
          OpModes, and an arm at <code>subsystems/arm/Arm.java</code> that
          already does everything this page is about to teach. The lesson code
          is a second, much smaller repository. Clone it alongside the template
          and work in the clone:
        </p>
        <div className="mt-3">
          <CodeBlock
            language="bash"
            hideControls
            code={`git clone -b 1-Subsystem https://github.com/Hemlock5712/Workshop-Code.git`}
          />
        </div>
        <p className="mt-3">
          That clone is the finished version of this page — six Java files, and
          this page writes three of them. To type the code yourself, delete{" "}
          <code>subsystems/Arm.java</code> and{" "}
          <code>subsystems/Flywheel.java</code> and start from the class line in
          Step 1. To read instead of type, leave them in place and follow along.
          Either way, every file path and every check below is written against
          that clone, not against the template.
        </p>
      </Box>

      {/* ── what is on this branch ───────────────────────────────────── */}
      <LessonSection
        id="what-this-branch-actually-contains"
        title="What this branch actually contains"
      >
        <p>
          <code>1-Subsystem</code> is the first branch of the mechanism track,
          and it is deliberately tiny. The arm can push a voltage at its motor
          and it can stop. That is the entire public surface of the class. Not
          one line of code on the branch builds a <code>Command</code>, there is
          no <code>opmodes</code> folder, and there is nothing to press a button
          on yet.
        </p>

        <p>The file says so itself, in the comment at the top:</p>

        <CodeBlock
          language="java"
          title="Arm.java — from the branch's own doc comment"
          hideControls
          code={`/**
 * The arm. One TalonFX motor plus a CANcoder that measures the arm's angle.
 *
 * <p>Every mechanism in this project follows the same pattern: extend {@code Mechanism}, keep the
 * hardware in private fields, and set it up once in the constructor.
 *
 * <p>Right now the arm can only do one thing: push a voltage at the motor. The methods are public
 * so you can call them and watch the arm move. In the next lesson (2-Commands) we wrap them in
 * commands.
 */`}
        />

        <p>
          Take that at face value. Everything about commands — making the setter{" "}
          <code>private</code>, <code>runRepeatedly(...)</code>, naming them,
          the <code>(hold)</code> suffix — lands on the next page, against the
          branch that adds it. What you learn here is the part that never
          changes: where hardware lives, where configuration goes, and how the
          robot gets hold of your mechanism.
        </p>

        <div className="grid gap-4 lg:grid-cols-3">
          <Box
            variant="concept"
            tag="REGION 1 · FIELDS"
            title="The hardware"
            code={<code>private final TalonFX motor = ...</code>}
          >
            <p>
              One field per physical device, all <code>private</code> and all{" "}
              <code>final</code>. Built once when the mechanism is built, and
              never handed out.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="REGION 2 · CONSTRUCTOR"
            title="The setup"
            code={<code>public Arm() {"{ ... }"}</code>}
          >
            <p>
              Runs once, automatically, the moment the object is created.
              Everything the motor needs to be told before it turns goes here
              and nowhere else.
            </p>
          </Box>

          <Box
            variant="concept"
            tag="REGION 3 · METHODS"
            title="The behavior"
            code={<code>public void setVoltage(double v)</code>}
          >
            <p>
              What the outside world can ask the arm to do. On this branch there
              are two of them, and they are the only lines that ever send output
              to the motor.
            </p>
          </Box>
        </div>
      </LessonSection>

      {/* ── step 1 ───────────────────────────────────────────────────── */}
      <LessonSection id="the-arm-s-hardware" title="The arm's hardware fields">
        <p>
          Open <code>src/main/java/frc/robot/subsystems/Arm.java</code> in your
          clone — empty if you deleted it, the finished file if you did not —
          and start with the class line and four fields.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — the class line and the fields"
          filename="src/main/java/frc/robot/subsystems/Arm.java"
          code={`public class Arm extends Mechanism {
  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX motor = new TalonFX(31, canivore);
  private final CANcoder encoder = new CANcoder(32, canivore);

  // Pushes a set voltage at the motor. No sensors involved.
  private final VoltageOut voltageOut = new VoltageOut(0);`}
        />

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>extends Mechanism</code> is what makes this class a mechanism
            rather than a plain object. Building one registers it with the
            scheduler, so the scheduler knows the arm exists and can later
            arbitrate who owns it. The base constructor also installs a default{" "}
            <code>idle()</code> command on every mechanism — that is the
            scheduler&apos;s fallback for a mechanism nothing else is
            commanding, and <strong>Commands</strong> builds on it. Next lesson{" "}
            <code>Mechanism</code> is also where <code>runRepeatedly(...)</code>{" "}
            comes from.
          </li>
          <li>
            <code>new CANBus(&quot;canivore&quot;)</code> names the bus these
            devices are on. That string has to match the name you gave the
            CANivore in Tuner X on <strong>Hardware Setup</strong>. Spell it
            differently and nothing on the bus answers.
          </li>
          <li>
            <code>31</code>, <code>32</code>, <code>21</code> and{" "}
            <code>22</code> are CAN device IDs — the numbers in the table on{" "}
            <strong>Mechanism Setup</strong>. Each device on the bus answers to
            exactly one. If your bench hardware ended up with different IDs,
            change these numbers to match. Do not leave the code and the
            hardware disagreeing.
          </li>
          <li>
            <code>VoltageOut</code> is a Phoenix 6 <em>control request</em>: an
            object that says &quot;apply this many volts.&quot; It is built once
            here as a field and reused, rather than allocated every loop.
          </li>
        </ul>

        <Box variant="alert-success" tag="RESULT" title="You should see">
          <p>
            Add the imports your editor asks for —{" "}
            <code>com.ctre.phoenix6.*</code> for the four CTRE types,{" "}
            <code>org.wpilib.command3.Mechanism</code> for the base class — and
            every type name in those five lines stops being underlined in red.
            The class itself still will not compile: it has no closing brace
            until Step 3.
          </p>
        </Box>

        <Box
          variant="alert-tip"
          tag="WHY private"
          title="Nobody outside this class gets the motor"
        >
          <p>
            Every field is <code>private</code>, so no other file can write{" "}
            <code>arm.motor.setControl(...)</code>. Every request to move the
            arm has to go through a method the arm chooses to offer. That is the
            whole point of putting one physical thing in one class, and it is
            what the next lesson tightens further.
          </p>
        </Box>
      </LessonSection>

      {/* ── step 2 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="configure-the-motor-once"
        title="Configure the motor once, in the constructor"
      >
        <p>
          The constructor runs one time, automatically, when{" "}
          <code>new Arm()</code> is evaluated. Five statements, and each one is
          a decision.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — the constructor"
          code={`  public Arm() {
    TalonFXConfiguration config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Coast; // easy to move by hand
    config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;

    // Use the CANcoder for position, so the motor knows the arm's real angle.
    config.Feedback.withRemoteCANcoder(encoder);

    TalonFXUtil.applyConfigWithRetries(motor, config);
  }`}
        />

        <Box
          variant="concept"
          tag="NEUTRAL MODE"
          title="Coast, not Brake — and it is a choice"
        >
          <p>
            <strong>Neutral mode</strong> is what the motor does when nothing is
            commanding it. <code>Coast</code> cuts the power and lets the shaft
            spin freely. <code>Brake</code> makes the motor resist being turned,
            so the mechanism stays roughly where you left it.
          </p>
          <p className="mt-3">
            The lesson arm picks <code>Coast</code>, and the branch says why on
            that very line: <code>{"// easy to move by hand"}</code>. You are
            going to be pushing this arm around on a bench all day. A
            competition arm carrying real weight usually wants{" "}
            <code>Brake</code>, or it drops the instant you disable the robot.
            One word, two very different behaviors — decide it on purpose.
          </p>
        </Box>

        <Box
          variant="concept"
          tag="FEEDBACK SOURCE"
          title="This is the line that puts the CANcoder in the loop"
        >
          <p>
            A TalonFX counts its own rotor turns. That count starts at zero
            every time the motor controller powers on, so it has no idea where
            the arm physically is. The CANcoder does — it is an{" "}
            <strong>absolute</strong> encoder mounted on the arm, and it knows
            its angle the moment it boots.
          </p>
          <p className="mt-3">
            <code>config.Feedback.withRemoteCANcoder(encoder)</code> tells the
            motor to use that sensor as its position source instead of the
            rotor. Nothing on this branch reads a position yet, but this one
            line is the reason the arm can aim at a real angle later, on{" "}
            <strong>PID Control</strong>. Leave it out and every position you
            ask for after that is measured from wherever the arm happened to be
            at power-on.
          </p>
        </Box>

        <Box
          variant="concept"
          tag="APPLYING IT"
          title="Why not motor.getConfigurator().apply(config)?"
        >
          <p>
            Phoenix&apos;s own <code>apply(...)</code> sends the configuration
            once and hands back a status code. It does not retry. A CAN bus can
            hiccup while the robot is booting and everything is powering up at
            the same moment, and a config that quietly failed to apply is a
            miserable thing to debug.
          </p>
          <p className="mt-3">
            <code>TalonFXUtil.applyConfigWithRetries(motor, config)</code> tries
            up to five times and reports an error to the driver station if all
            five fail. It is a small helper file that ships on the branch, and
            you call it on the class itself — there is no{" "}
            <code>new TalonFXUtil(...)</code> anywhere, because there is nothing
            to build.
          </p>
        </Box>

        <Box variant="alert-success" tag="RESULT" title="You should see">
          <p>
            Type <code>TalonFXUtil.</code> and your editor offers{" "}
            <code>applyConfigWithRetries</code> straight off the class name, no{" "}
            <code>new</code> involved. The whole constructor is free of red
            underlines. The one error still on the file is the missing closing
            brace — Step 3 adds it, and that is where the first clean build
            comes from.
          </p>
        </Box>
      </LessonSection>

      {/* ── step 3 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="two-methods-and-why"
        title="Two methods, and why they are public for now"
      >
        <CodeBlock
          language="java"
          title="Arm.java — the two methods"
          code={`  /**
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

        <p>
          <code>voltageOut.withOutput(voltage)</code> sets the number on the
          request object you built as a field, and{" "}
          <code>motor.setControl(...)</code> sends it. The motor holds that
          request until something replaces it. Nothing here reads a sensor,
          nothing aims at a target, and nothing corrects itself — ask for 6 V
          and you get 6 V, whatever the arm does with it.
        </p>

        <Box
          variant="alert-warning"
          tag="TEMPORARY"
          title="These will not stay public"
        >
          <p>
            Right now any file in the project can call{" "}
            <code>arm.setVoltage(6.0)</code>. The branch is open about why: the
            methods are public &quot;so you can call them and watch the arm
            move.&quot; Nothing on this branch does call them — there is no
            OpMode yet — so for one lesson the arm is a readable surface with no
            framework in front of it.
          </p>
          <p className="mt-3">
            It is also the problem the next page fixes. Two callers, two
            different numbers, the same loop, and the motor takes whichever ran
            last. On <strong>Commands</strong> the setter becomes{" "}
            <code>private</code> and the arm hands out commands instead — which
            is the single change that lets the scheduler stop two things
            fighting over one motor.
          </p>
        </Box>

        <Box variant="alert-success" tag="RESULT" title="You should see">
          <p>
            The closing brace on the last line finishes the class. Run{" "}
            <code>./gradlew build</code>: <code>BUILD SUCCESSFUL</code>. That is
            the first build of your own arm, and it passes even though no other
            file in the project mentions <code>Arm</code> yet.
          </p>
        </Box>
      </LessonSection>

      {/* ── the finished file ────────────────────────────────────────── */}
      <LessonSection
        id="the-finished-file-live-from-the"
        title="The finished file, live from the branch"
      >
        <p>
          Here is the whole of <code>Arm.java</code> on <code>1-Subsystem</code>
          , imports and all, pulled straight from the repository — around sixty
          lines including the comments. Compare it against what you typed,
          especially the import list, which is the part people miss.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          branch="1-Subsystem"
          filePath="src/main/java/frc/robot/subsystems/Arm.java"
        />
      </LessonSection>

      {/* ── step 4 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="the-flywheel-two-motors"
        title="The flywheel: two motors, one of them a follower"
      >
        <p>
          Same three regions, same pattern, one new idea. The flywheel has two
          TalonFX motors — a leader on CAN <code>21</code> and a follower on CAN{" "}
          <code>22</code> — and the code only ever talks to the leader.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — fields and constructor"
          filename="src/main/java/frc/robot/subsystems/Flywheel.java"
          code={`public class Flywheel extends Mechanism {
  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX leader = new TalonFX(21, canivore);
  private final TalonFX follower = new TalonFX(22, canivore);

  // Pushes a set voltage at the leader motor. No sensors involved.
  private final VoltageOut voltageOut = new VoltageOut(0);

  public Flywheel() {
    // The follower copies the leader, spinning the opposite direction.
    follower.setControl(new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed));

    TalonFXConfiguration config = new TalonFXConfiguration();
    config.MotorOutput.NeutralMode = NeutralModeValue.Coast; // easy to spin by hand
    config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;

    TalonFXUtil.applyConfigWithRetries(leader, config);
  }`}
        />

        <p>
          The two methods are the arm&apos;s two methods, pointed at the leader:
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — the two methods"
          code={`  /**
   * Spin the flywheel with a fixed voltage.
   *
   * @param voltage The voltage to apply.
   */
  public void setVoltage(double voltage) {
    leader.setControl(voltageOut.withOutput(voltage));
  }

  /** Stop the flywheel motors. */
  public void stop() {
    leader.stopMotor();
  }
}`}
        />

        <Box
          variant="alert-warning"
          tag="WATCH THE SECOND ARGUMENT"
          title="MotorAlignmentValue.Opposed, not true"
        >
          <p>
            <code>
              new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed)
            </code>{" "}
            is told to CAN 22 exactly once, in the constructor, and then never
            again. From that point on, whatever output the leader is given, the
            follower mirrors — running the opposite way, because of how the two
            motors are mounted.
          </p>
          <p className="mt-3">
            The second argument is a <code>MotorAlignmentValue</code>, not a
            true/false flag. If you copy a snippet from somewhere else that
            passes a boolean there, it is not this API. And if you flip{" "}
            <code>Opposed</code> to match a guide that says both motors should
            spin the same way, you will fight your correctly-wired flywheel all
            afternoon — <strong>Mechanism Setup</strong> has the bench check
            that proves which direction is right.
          </p>
        </Box>

        <Box
          variant="alert-info"
          tag="NOTE · THE TEMPLATE DIFFERS"
          title="One motor there, two motors here"
        >
          <p>
            Every branch on the mechanism track ships this two-motor flywheel.
            The <strong>2027-Template</strong>, which is a different robot,
            ships a single-motor flywheel with no <code>Follower</code> at all.
            So do not treat the template as a line-for-line check on this file —
            the branch is the ground truth for the lesson code, and the two are
            allowed to disagree.
          </p>
        </Box>

        <Box variant="alert-success" tag="RESULT" title="You should see">
          <p>
            Build again. <code>BUILD SUCCESSFUL</code>, with two mechanism
            classes compiled and still nothing constructing either of them. Step
            5 is the file that does.
          </p>
        </Box>
      </LessonSection>

      {/* ── step 5 ───────────────────────────────────────────────────── */}
      <LessonSection
        id="hand-the-mechanisms-to"
        title="Hand the mechanisms to the robot, and start the scheduler"
      >
        <p>
          Two mechanism classes that nobody builds are two files that do
          nothing. <code>Robot.java</code> is where they become real objects,
          and it is one of the shortest files on the branch. Here it is in full,
          license header trimmed.
        </p>

        <CodeBlock
          language="java"
          title="Robot.java — the whole file"
          filename="src/main/java/frc/robot/Robot.java"
          code={`package frc.robot;

import frc.robot.subsystems.Arm;
import frc.robot.subsystems.Flywheel;
import frc.robot.utils.SimStartup;
import org.wpilib.command3.Scheduler;
import org.wpilib.framework.OpModeRobot;

/**
 * The main robot class. The robot's mechanisms live here as public fields. Every OpMode gets a
 * {@link Robot} in its constructor and reaches the mechanisms through it.
 *
 * <p>In this lesson there are just two mechanisms and no commands or OpModes yet. Those come in the
 * next lesson (2-Commands). The only job this class has right now is to run the command scheduler
 * every loop.
 */
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

        <Box
          variant="alert-success"
          tag="THE LINE THAT STARTS EVERYTHING"
          title="Scheduler.getDefault().run();"
        >
          <p>
            <code>robotPeriodic()</code> is called for you, over and over, for
            as long as the robot is powered on — every 20 milliseconds, so{" "}
            <strong>fifty times a second</strong>. The one line inside it hands
            control to the scheduler for a single pass: check every trigger,
            work out which command owns which mechanism, run one step of
            everything that is running.
          </p>
          <p className="mt-3">
            Delete it and the project still compiles. The mechanisms still get
            built. Nothing else in the entire workshop ever happens again — no
            trigger is checked, no command ever takes a step. Every page after
            this one is standing on this line.
          </p>
        </Box>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>extends OpModeRobot</code> is the top of the whole program.
            There is no <code>RobotContainer</code> on this stack and there
            never will be — if a tutorial has you create one, it is describing a
            different framework.
          </li>
          <li>
            <code>public final Arm arm = new Arm();</code> — <code>public</code>{" "}
            so the OpModes you write next lesson can reach it as{" "}
            <code>robot.arm</code>, <code>final</code> so exactly one arm exists
            for the whole match.
          </li>
          <li>
            <code>@Override</code> is a label on the two methods below it. It
            does not run. It tells the compiler &quot;this is meant to replace a
            method I inherited&quot;, so if you misspell{" "}
            <code>robotPeriodic</code> you get a build error instead of a robot
            that silently does nothing.
          </li>
          <li>
            <code>simulationInit()</code> and <code>SimStartup.arm()</code> are
            plumbing for the simulator. They do nothing at all unless the{" "}
            <code>frc.sim.startMode</code> system property is set, in which case{" "}
            <code>SimStartup</code> picks an OpMode and enables the sim robot
            the way a person would click Enable. There is no OpMode to pick on
            this branch, so leave both alone.
          </li>
        </ul>

        <Box variant="alert-success" tag="RESULT" title="You should see">
          <p>
            Build one more time. <code>BUILD SUCCESSFUL</code>, with{" "}
            <code>Scheduler</code> and <code>OpModeRobot</code> both resolving —
            that is the only proof this file is wired up. Nothing moves yet:
            there is no OpMode, so there is nothing for the driver station to
            select and nothing for the scheduler to run.
          </p>
        </Box>
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <p>
          There is nothing to press yet, so the checks are a clean build, three
          things you can see in your own files, and one last look at Tuner X.
          Each one takes under a minute.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <code>./gradlew build</code>. <strong>You should see:</strong>{" "}
            <code>BUILD SUCCESSFUL</code>. That is the real check on this page —
            it means every import resolved and every name you typed exists.
          </li>
          <li>
            Look at your file tree under <code>src/main/java/frc/robot/</code>.{" "}
            <strong>You should see:</strong> <code>Main.java</code>,{" "}
            <code>Robot.java</code>, <code>subsystems/Arm.java</code>,{" "}
            <code>subsystems/Flywheel.java</code>,{" "}
            <code>utils/SimStartup.java</code> and{" "}
            <code>utils/TalonFXUtil.java</code>. Six files, and{" "}
            <strong>
              no <code>opmodes</code> folder
            </strong>
            . That folder arrives next lesson.
          </li>
          <li>
            Open <code>Arm.java</code> and search it for <code>Command</code>.{" "}
            <strong>You should see:</strong> one hit, and it is inside the doc
            comment — &quot;In the next lesson (2-Commands) we wrap them in
            commands.&quot; Not one line of code on this branch builds a
            command. If your file has one, you have got ahead of yourself.
          </li>
          <li>
            Open <code>Robot.java</code> and search for <code>Scheduler</code>.{" "}
            <strong>You should see:</strong> two hits — the import at the top,
            and the single call inside <code>robotPeriodic()</code>.
          </li>
          <li>
            With Tuner X connected the way <strong>Mechanism Setup</strong>{" "}
            showed, check that all four devices are listed on the{" "}
            <code>canivore</code> bus at IDs 31, 32, 21 and 22.{" "}
            <strong>You should see:</strong> the same four numbers that appear
            in your two constructors. The code and the bus have to agree, and
            this is the last moment where checking is cheap.
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
                The build fails on <code>cannot find symbol</code> pointing at{" "}
                <code>Mechanism</code>, <code>CANBus</code> or{" "}
                <code>TalonFXUtil</code>.
              </strong>{" "}
              A missing import. <code>Mechanism</code> comes from{" "}
              <code>org.wpilib.command3</code>, the CTRE types from{" "}
              <code>com.ctre.phoenix6.*</code>, and <code>TalonFXUtil</code>{" "}
              from <code>frc.robot.utils</code> — which only resolves if that
              helper file is in your project at all. The embedded file above has
              the full import list; copy it.
            </li>
            <li>
              <strong>
                The build is clean, but nothing on the bench responds when you
                call <code>setVoltage</code>.
              </strong>{" "}
              Three usual causes, in order of likelihood: the CANivore is not
              named <code>canivore</code> in Tuner X, so{" "}
              <code>new CANBus(&quot;canivore&quot;)</code> is talking to
              nothing; a device ID in your code does not match the bench; or
              Tuner X still owns the bus. Tuner X and your robot code cannot
              both drive the same motor — see the CANivore USB toggle on{" "}
              <strong>Mechanism Setup</strong>.
            </li>
            <li>
              <strong>
                Your <code>Arm.java</code> has <code>vertical()</code>,{" "}
                <code>horizontal()</code> and <code>scoring()</code> on it.
              </strong>{" "}
              You are reading the robot template instead of the lesson branch.
              The template is the finished robot, several lessons ahead; it also
              keeps its arm at <code>subsystems/arm/Arm.java</code>, one folder
              deeper. Work from <code>1-Subsystem</code> for this page.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── what comes next ──────────────────────────────────────────── */}
      <LessonSection
        id="what-this-page-left-out-on"
        title="What this page left out on purpose"
      >
        <p>
          Everything below is real and everything below is coming. None of it
          exists in the files you wrote above, which is why none of it is on
          this page.
        </p>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Commands, and the private setter.</strong>{" "}
            <code>runRepeatedly(...)</code>, the mandatory{" "}
            <code>.named(...)</code>, the <code>(hold)</code> convention, and
            what happens to a mechanism nothing is commanding. All of it is the
            next page, <strong>Commands</strong>, against branch{" "}
            <code>2-Commands</code>.
          </li>
          <li>
            <strong>Buttons.</strong> Binding a command to a controller needs an
            OpMode, and there is no OpMode on this branch.{" "}
            <strong>Triggers</strong>.
          </li>
          <li>
            <strong>Actually running it.</strong> Three pages away, on{" "}
            <strong>Running Your Code</strong>.
          </li>
          <li>
            <strong>Aiming at an angle.</strong> The CANcoder is wired into the
            motor&apos;s feedback here, but nothing reads it and nothing
            corrects for error yet. That is <strong>PID Control</strong>.
          </li>
        </ul>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/tree/1-Subsystem"
          title="Branch 1-Subsystem on GitHub"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "Which statement about the v3 Mechanism base class is correct?",
            options: [
              "Mechanism is an interface you implement, so Arm writes implements Mechanism",
              "Mechanism is a class you extend, so Arm writes extends Mechanism",
              "Mechanism is final, so you wrap one in a helper class instead of subclassing",
              "Mechanism is an empty marker — extending it changes nothing about the class",
            ],
            correctAnswer: 1,
            explanation:
              "In the alpha this workshop pins, v2027.0.0-alpha-6, Mechanism.java declares `public class Mechanism`, and both the lesson branches and the robot template write `extends Mechanism`. It is not an empty marker either: constructing one registers it with the default scheduler, which is how the scheduler knows your arm exists. This is alpha software, so if you are on a newer build, check the class line before you trust a tutorial.",
          },
          {
            id: 2,
            question:
              "On branch 1-Subsystem, what can the Arm class actually do?",
            options: [
              "Drive to an angle you ask for, using the CANcoder as feedback",
              "Push a fixed voltage at the motor, and stop it — that is the whole class",
              "Run three named commands: runSlow(), runFast() and stop()",
              "Nothing, because a mechanism with no commands cannot be constructed",
            ],
            correctAnswer: 1,
            explanation:
              "The class has exactly two methods, public void setVoltage(double) and public void stop(), and both talk to the motor directly. The CANcoder is configured as the motor's position source, but nothing on this branch reads a position or aims at one. Commands arrive on the next page; closed-loop position arrives on PID Control.",
          },
          {
            id: 3,
            question:
              "The constructor sets config.MotorOutput.NeutralMode = NeutralModeValue.Coast. What does that mean, and why this arm?",
            options: [
              "Coast caps the arm's maximum speed while you are learning",
              "Coast cuts power when nothing is commanding the motor, so you can move the arm by hand on the bench",
              "Coast makes the motor resist being turned, so the arm holds its position when disabled",
              "Coast is required whenever a CANcoder is attached to a TalonFX",
            ],
            correctAnswer: 1,
            explanation:
              "Neutral mode is what the motor does when nothing is commanding it. Coast lets the shaft spin freely; Brake makes it resist motion and hold roughly still. The branch chooses Coast and explains itself on that line — `// easy to move by hand`. A competition arm carrying weight usually wants Brake, or it drops the moment you disable.",
          },
          {
            id: 4,
            question:
              "Flywheel's constructor runs follower.setControl(new Follower(leader.getDeviceID(), MotorAlignmentValue.Opposed)). What has it set up?",
            options: [
              "CAN 22 mirrors CAN 21 and turns the same way, so both push together",
              "CAN 22 mirrors CAN 21 and turns the opposite way, so one setVoltage call drives both",
              "CAN 21 and CAN 22 alternate, one taking over each scheduler loop",
              "It copies CAN 21's configuration onto CAN 22",
            ],
            correctAnswer: 1,
            explanation:
              "Follower tells one TalonFX to copy another's output. The second argument is a MotorAlignmentValue — not a true/false flag — and Opposed means the follower runs backwards relative to the leader, which is correct for how these two motors are mounted. It is told once in the constructor; after that the class only ever talks to the leader.",
          },
          {
            id: 5,
            question:
              "Robot.java has @Override public void robotPeriodic() { Scheduler.getDefault().run(); }. What breaks if you delete that method?",
            options: [
              "Nothing — the scheduler starts itself when the first Mechanism is constructed",
              "The mechanisms are never built, so robot.arm is null",
              "Every command in the project stops running: no trigger is checked and no command is ever stepped",
              "Only default commands stop; commands bound to buttons keep running",
            ],
            correctAnswer: 2,
            explanation:
              "robotPeriodic() is called for you every 20 ms, fifty times a second, and that one line asks the scheduler for a single pass — check the triggers, settle who owns which mechanism, step every running command. The mechanisms are fields on Robot, so they would still be constructed; nothing would ever move them. This is the line the rest of the workshop stands on.",
          },
        ]}
      />
    </PageTemplate>
  );
}
