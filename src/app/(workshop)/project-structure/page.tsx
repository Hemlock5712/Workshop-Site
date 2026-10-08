import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/project-structure");

/**
 * The map of the project, between making it and writing the first file in it.
 *
 * Every claim on this page is read off the mechanism chain, `main` through
 * `mech-5-Coroutines`, rather than off a generic WPILib project. Two of those
 * claims are easy to get wrong from memory. There is no `Constants` class on
 * any branch: CAN IDs, setpoints and tolerances all sit in the class that
 * uses them. And `Robot`'s constructor is empty on every mechanism branch, so
 * the always-on binding slot is described, not shown.
 *
 * The check is the sort exercise in the quiz, because "where does this go" is
 * the one skill the page exists to teach.
 */
export default function ProjectStructure() {
  return (
    <PageTemplate
      title="Project Structure"
      lede="A robot project has three kinds of Java file and a handful of files that are not Java at all. Each kind of code has one place it goes, and the folders tell you which."
      needs={[
        <>
          The <code>Workshop</code> project from{" "}
          <a href="/project-setup" className="underline">
            Project Setup
          </a>
          , building clean.
        </>,
      ]}
      time="9 minutes"
    >
      <Split>
        <ProseBlock>
          <p>
            This page is a map, and nothing on it gets typed. By the end of
            Workshop 3 your project looks like the tree below. Every lesson
            after this one adds a file to a folder named here.
          </p>
        </ProseBlock>
      </Split>

      <LessonSection id="the-tree" title="The tree">
        <CodeBlock
          language="text"
          title="Workshop/ at the end of Workshop 3"
          showLineNumbers={false}
          code={`Workshop/
  build.gradle                 how to build, and which libraries
  settings.gradle              where Gradle finds WPILib
  gradlew, gradlew.bat         run Gradle without installing it
  .wpilib/
    wpilib_preferences.json    your team number
  vendordeps/
    CommandsV3.json            one file per vendor library
    Phoenix6-26.70.0-alpha-2.json
  src/main/deploy/             files copied onto the robot
  src/main/java/first/
    Main.java                  starts the program. Never edited
    robot/
      Robot.java               owns the mechanisms
      mechanisms/
        Arm.java               one class per mechanism
        Flywheel.java
      opmode/
        MyTeleop.java          one class per mode
        MyAuto.java
  build/                       made by every build. Never edited`}
        />
        <p>
          The <code>mechanisms</code> folder does not exist yet. You make it in
          the next lesson. Everything else is already there from the New Project
          Creator.
        </p>
        <p>
          Three things you leave alone. <code>Main.java</code> holds one line
          that matters,{" "}
          <code>RobotBase.startRobot(first.robot.Robot::new)</code>. Its own
          comment says to leave the file alone. <code>build/</code> is rewritten
          on every build, so an edit there disappears. The{" "}
          <code>gradle/wrapper</code> files pin the Gradle version for everyone
          on the team.
        </p>
      </LessonSection>

      <LessonSection id="three-kinds" title="Three kinds of Java file">
        <p>
          <strong>Robot.java</strong> owns the mechanisms, one{" "}
          <code>public final</code> field each, and runs the scheduler once per
          loop in <code>robotPeriodic()</code>. Its constructor is where a
          binding goes that must work in every mode. On this course that
          constructor stays empty.
        </p>
        <CodeBlock
          filename="src/main/java/first/robot/Robot.java"
          code={`public class Robot extends OpModeRobot {
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  public Robot() {}

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}`}
        />
        <p>
          <strong>A mechanism class</strong> is one physical thing on the robot.
          It <code>implements Mechanism</code> and keeps its motors and sensors{" "}
          <code>private</code>. Its <code>public</code> methods either return a{" "}
          <code>Command</code>, like <code>arm.vertical()</code>, or answer a
          question, like <code>arm.isAtTarget()</code>. Nothing outside the
          class touches the motor.
        </p>
        <p>
          <strong>An OpMode class</strong> is one entry on the driver station
          list. <code>@Teleop</code> or <code>@Autonomous</code> above the class
          puts it there. Its constructor binds buttons to commands, and it
          reaches the mechanisms through <code>robot.arm</code> and{" "}
          <code>robot.flywheel</code>.
        </p>
        <Split>
          <p>
            An OpMode only shows up if it sits in <code>first.robot</code> or a
            folder under it. The framework searches that package and nowhere
            else.
          </p>
          <MarginNote label="Says so in the file">
            The generated <code>Robot.java</code> comment reads: OpMode classes
            anywhere in the package, or sub-packages, where this class is
            located are automatically registered.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="where-numbers-live" title="Where numbers live">
        <p>
          There is no <code>Constants</code> file on any branch of this course.
          A number sits in the class that uses it, next to the line that uses
          it.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            CAN IDs sit where the device is made:{" "}
            <code>new TalonFX(21, canivore)</code>.
          </li>
          <li>
            Gains sit in the configuration you paste from Tuner X, in the
            mechanism&apos;s constructor.
          </li>
          <li>
            Setpoints sit in the command that asks for them:{" "}
            <code>setVelocity(75.0)</code> inside <code>runFast()</code>.
          </li>
          <li>
            Tolerances are a <code>private final</code> field at the top of the
            mechanism.
          </li>
        </ul>
        <p>
          When an OpMode needs to know whether the arm has arrived, it calls{" "}
          <code>robot.arm.isAtTarget()</code>. It never compares angles itself,
          so the tolerance stays in one place and changes in one place.
        </p>
      </LessonSection>

      <LessonSection id="where-new-code-goes" title="Where new code goes">
        <p>Ask what the code talks to.</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>A motor or a sensor.</strong> The mechanism that owns it, as
            a <code>private</code> method.
          </li>
          <li>
            <strong>Something one mechanism does.</strong> A <code>public</code>{" "}
            method on that mechanism that returns a <code>Command</code>.
          </li>
          <li>
            <strong>A button.</strong> The constructor of the OpMode it belongs
            to. A button for every mode goes in the <code>Robot</code>{" "}
            constructor.
          </li>
          <li>
            <strong>Two mechanisms working together.</strong> The OpMode that
            runs the routine. <code>spinUpWhenReady</code> lives in{" "}
            <code>MyTeleop</code> for that reason.
          </li>
          <li>
            <strong>A vendor library.</strong> <code>vendordeps/</code>, added
            through <strong>WPILib: Manage Vendor Libraries</strong>, never by
            copying a jar.
          </li>
          <li>
            <strong>A file the robot reads while running.</strong>{" "}
            <code>src/main/deploy/</code>. A deploy copies it onto the
            SystemCore.
          </li>
        </ul>
        <Box variant="alert-warning" title="New file, wrong folder">
          <p>
            Every Java file starts with a <code>package</code> line, and it has
            to match the folder. <code>Arm.java</code> in{" "}
            <code>robot/mechanisms/</code> says{" "}
            <code>package first.robot.mechanisms;</code>. Put the file one level
            up and VS Code marks that line red: the declared package does not
            match the expected package. Move the file, not the line.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Open the Explorer in VS Code and expand{" "}
          <code>src/main/java/first</code>. Then sort the four quiz questions
          below without scrolling back up.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <code>Main.java</code> beside a <code>robot</code> folder, and{" "}
              <code>Robot.java</code> beside an <code>opmode</code> folder.
            </li>
            <li>
              <code>MyTeleop.java</code> and <code>MyAuto.java</code> inside{" "}
              <code>opmode</code>.
            </li>
            <li>Four out of four in the quiz.</li>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You need the CAN ID of a second flywheel motor. Where do you write it?",
            options: [
              "In a new Constants.java beside Robot.java",
              "In MyTeleop, next to the button that spins the flywheel",
              "In Flywheel.java, where that TalonFX is created",
              "In vendordeps, beside the Phoenix 6 file",
            ],
            correctAnswer: 2,
            explanation:
              "A number sits in the class that uses it. The motor is Flywheel's private hardware, so its CAN ID goes in the line that creates it. Nothing outside Flywheel ever needs that number.",
          },
          {
            id: 2,
            question:
              "Pressing B should lower the arm to horizontal, but only in Teleop. What do you add, and where?",
            options: [
              "A binding on driver.b() in the MyTeleop constructor, calling robot.arm.horizontal()",
              "A binding in the Robot constructor, so the button is always ready",
              "A new method in Arm that reads the controller and moves the motor",
              "A line in Main.java that schedules the command at startup",
            ],
            correctAnswer: 0,
            explanation:
              "Buttons belong to the OpMode they are used in. The command already exists on Arm, so the only new code is one binding in MyTeleop. The Robot constructor is for bindings every mode needs, and a mechanism never reads a controller.",
          },
          {
            id: 3,
            question:
              "A routine raises the arm and then spins the flywheel. Where does it go?",
            options: [
              "In Arm.java, because the arm moves first",
              "In Flywheel.java, because the flywheel finishes the routine",
              "In Robot.java, because it owns both mechanisms",
              "In the OpMode that runs it, calling commands from both mechanisms",
            ],
            correctAnswer: 3,
            explanation:
              "A mechanism knows only itself. Code that coordinates two of them lives in the OpMode that runs it, the way spinUpWhenReady lives in MyTeleop and raiseAndShoot lives in RaiseAndShootOpMode.",
          },
          {
            id: 4,
            question:
              "You write a new OpMode in src/main/java/first/auto with package first.auto. It builds. Why does it not appear on the driver station?",
            options: [
              "OpModes need a second annotation to be listed",
              "Only classes in first.robot or a package under it are found",
              "The driver station lists one OpMode of each kind",
              "New OpModes appear only after a deploy, never in simulation",
            ],
            correctAnswer: 1,
            explanation:
              "The framework searches the package Robot is in and everything under it, and first.auto is beside first.robot rather than under it. Move the file into opmode, change its package line to first.robot.opmode, and it shows up.",
          },
        ]}
      />
    </PageTemplate>
  );
}
