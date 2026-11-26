import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import ImageBlock from "@/components/ImageBlock";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import PairedLesson from "@/components/lesson/PairedLesson";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/project-setup");

/**
 * The lesson that opens Workshop 3, and the gate to every code lesson
 * after it. It used to close Workshop 2, which put the last idea of the
 * concepts group between a student and the project they build with it.
 *
 * This page used to clone the team's 2027-Template. It no longer does. Nothing
 * about the 2027 season is official yet, so the offseason course builds its own
 * project from the WPILib New Project Creator and adds Phoenix 6 by hand.
 * Workshop 5 goes back to a prepared download, because a swerve drivetrain
 * with CTRE generated constants is not something a student types.
 *
 * November 2026: the Project Base is "Command v3 Robot Skeleton (Advanced)",
 * not "OpMode Robot" (owner's call). The fact behind it is read out of the
 * alpha-7 VS Code extension rather than guessed: its `templates.json` entry
 * "Command v3 Robot Skeleton (Advanced)", foldername `commandv3skeleton`, is
 * `"commandversion": 3`, so the extension installs CommandsV3 itself. "OpMode
 * Robot" is `"commandversion": 2`, which is why this page used to delete
 * CommandsV2 and install CommandsV3 by hand. That step, its screenshot and its
 * quiz question are gone.
 *
 * The skeleton costs two small edits instead, and both match `main` on
 * Workshop-Code. Its `Robot.java` ships `@Logged` and `Epilogue.update(this)`,
 * which the student deletes because the course logs through `Telemetry`. And
 * it ships no OpMode, so the student creates `opmode/MyTeleop.java` by hand as
 * `implements OpMode`. There is no `MyAuto`.
 *
 * Three screenshots showed "OpMode Robot" or the CommandsV2 swap and were
 * taken off the page until they are re-captured: `step-4.png`, `step-6.png`
 * and `step-8.png`. The files are still in `public/images/project-setup/`,
 * and the "Step N" titles on the remaining figures keep their old numbers so
 * the new captures drop back into place.
 */
export default function ProjectSetup() {
  return (
    <PageTemplate
      title="Project Setup"
      lede="Generate the robot project and add Phoenix 6."
      needs={[
        <>
          The WPILib <strong>2027 alpha 7</strong> installed, from{" "}
          <strong>Prerequisites</strong>.
        </>,
        <>An internet connection. The first build downloads a lot.</>,
        <>A local folder to work in, not one synced to the cloud.</>,
      ]}
      time="12 minutes"
    >
      <p>
        You generate a Commands v3 robot project with the WPILib New Project
        Creator, make two small edits, and add Phoenix 6. The build at the end
        proves Java, Gradle and the vendor libraries all work.
      </p>

      <PairedLesson kind="tuner" to="/hardware" />

      <LessonSection id="make-the-project" title="Make the project">
        <p>
          The 2027 installer installs a WPILib-specific VS Code. Make sure to
          use this version, not the ordinary one. Once open, its title bar has a
          small red WPILib icon at the top right. Click it.
        </p>
        <ImageBlock
          src="/images/project-setup/step-1.png"
          alt="Visual Studio Code welcome screen with the red WPILib icon circled in the top right of the title bar"
          title="Step 1 · The WPILib icon"
          caption="No red icon here means you have the ordinary VS Code open. Close it and find the WPILib one."
          width={1908}
          height={821}
        />
        <p>
          The icon opens the command palette with <code>&gt;WPILib </code>{" "}
          already in it. Type <code>create</code> and pick{" "}
          <strong>WPILib: Create a new project</strong>.
        </p>
        <ImageBlock
          src="/images/project-setup/step-2.png"
          alt="The VS Code command palette filtered to WPILib create, with WPILib: Create a new project highlighted"
          title="Step 2 · Create a new project"
          caption="The palette also lists an import command for older projects. You want the create one."
          width={1908}
          height={821}
        />
        <p>
          The creator runs as four numbered pages. On the first, choose{" "}
          <strong>Template</strong>. An example is somebody else&apos;s finished
          robot.
        </p>
        <ImageBlock
          src="/images/project-setup/step-3.png"
          alt="WPILib New Project Creator step 1, with the Template card selected and Example beside it"
          title="Step 3 · Template, not Example"
          caption="Template gives you a skeleton. Example gives you a complete robot you did not write."
          width={1908}
          height={821}
        />
        <p>
          On the second page set <strong>Language</strong> to <code>java</code>{" "}
          and <strong>Project Base</strong> to{" "}
          <strong>Command v3 Robot Skeleton (Advanced)</strong>. It is a
          Commands v3 project holding little more than the scheduler call. Timed
          Robot and Command v2 Robot sit in the same list, and neither matches
          what this course teaches.
        </p>
        {/* step-4.png showed OpMode Robot selected. Re-capture, then restore. */}
        <p>The third page is the one worth slowing down for.</p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <strong>Base Folder.</strong> Click <strong>Select Folder</strong>{" "}
            and pick <code>Downloads</code>, or any plain local path. Check that
            the box does not read <code>OneDrive</code> anywhere.
          </li>
          <li>
            <strong>Project Name.</strong> Type <code>Workshop</code>. Later
            lessons name that folder when they tell you where to look.
          </li>
          <li>
            <strong>Team Number.</strong> Yours. The screenshot below shows
            5712.
          </li>
          <li>
            <strong>Enable Desktop Support.</strong> Tick it. Workshop 3 runs
            your program on this laptop, driving the real motors through the
            CANivore, and that needs the desktop build this box turns on.
          </li>
        </ol>
        <ImageBlock
          src="/images/project-setup/step-5.png"
          alt="WPILib New Project Creator step 3, with base folder Downloads, project name Workshop, team number 5712, and Enable Desktop Support circled and checked"
          title="Step 5 · Location and config"
          caption="Enable Desktop Support is circled. Miss it and the project cannot run on the laptop, so hardware simulation is not available."
          width={1908}
          height={821}
        />
        <Box variant="alert-warning" title="Not in OneDrive">
          <p>
            OneDrive, Google Drive and Dropbox rewrite files underneath Gradle
            while it is working. The build then fails in ways that look like
            broken code. On a school laptop <code>Documents</code> and{" "}
            <code>Desktop</code> are often synced without anyone saying so.{" "}
            <code>Downloads</code> usually is not.
          </p>
        </Box>
        <p>
          The fourth page repeats your choices back. Read the{" "}
          <strong>Location</strong> line, then press{" "}
          <strong>Create Project</strong>.
        </p>
        {/* step-6.png showed project base OpMode Robot. Re-capture, then restore. */}
        <p>
          A dialog asks whether to open the folder. Choose{" "}
          <strong>Yes (Current Window)</strong>. A new window works too, but
          leaves two VS Code windows open.
        </p>
        <ImageBlock
          src="/images/project-setup/step-7.png"
          alt="Dialog reading Project successfully created. Would you like to open the folder, with Yes (Current Window), Yes (New Window) and No"
          title="Step 7 · Yes (Current Window)"
          caption="Pressing No leaves the project on disk unopened. File then Open Folder recovers it."
          width={1908}
          height={821}
        />
      </LessonSection>

      <LessonSection id="delete-epilogue" title="Delete the Epilogue lines">
        <p>
          Open <code>src/main/java/first/robot/Robot.java</code>. The skeleton
          turns on Epilogue, a logging tool this course does not use. Delete
          four lines.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>@Logged</code>, on the line above{" "}
            <code>public class Robot</code>.
          </li>
          <li>
            <code>Epilogue.update(this);</code>, inside{" "}
            <code>robotPeriodic()</code>.
          </li>
          <li>
            The two imports that start <code>org.wpilib.epilogue</code>.
          </li>
        </ul>
        <p>The file now reads like this below its copyright header.</p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/Robot.java"
          code={`package first.robot;

import org.wpilib.command3.Scheduler;
import org.wpilib.framework.OpModeRobot;

public class Robot extends OpModeRobot {
  public Robot() {}

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}`}
        />
        <p>
          The course logs through <code>Telemetry</code>. Left in, Epilogue logs
          each mechanism a second time under <code>Robot</code>. It also prints
          an <code>[EPILOGUE] Excluded from logs</code> note on every build, for
          each field it cannot log.
        </p>
      </LessonSection>

      <LessonSection id="create-myteleop" title="Create MyTeleop">
        <p>
          The skeleton ships no OpMode, so the driver station has nothing to
          pick yet. An OpMode is one way the robot can run, and you make the
          teleop one by hand.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            In the Explorer, right-click the <code>robot</code> folder under{" "}
            <code>src/main/java/first</code>, choose <strong>New Folder</strong>
            , and type <code>opmode</code>.
          </li>
          <li>
            Right-click the <code>opmode</code> folder, choose{" "}
            <strong>New File</strong>, and type <code>MyTeleop.java</code>.
          </li>
          <li>Paste this into the file and save it.</li>
        </ol>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/opmode/MyTeleop.java"
          code={`package first.robot.opmode;

import first.robot.Robot;
import org.wpilib.opmode.OpMode;
import org.wpilib.opmode.Teleop;

@Teleop
public class MyTeleop implements OpMode {
  public MyTeleop(Robot robot) {}
}`}
        />
        <p>
          <code>@Teleop</code> is what puts the class in the driver
          station&apos;s list. The constructor is empty for now, and{" "}
          <strong>OpModes</strong> fills it with button bindings. Keep the name{" "}
          <code>MyTeleop</code>, because every later lesson edits this file.
        </p>
      </LessonSection>

      <LessonSection id="vendor-libraries" title="Phoenix 6">
        <p>
          Every Java example in this course is <strong>Commands v3</strong>, and
          the skeleton installed that library for you. The hardware is CTRE, and
          the project has no CTRE library yet.
        </p>
        <p>
          Click the WPILib icon in the activity bar, the narrow strip of icons
          down the left edge, to open{" "}
          <strong>WPILib Vendor Dependencies</strong>. Nothing needs a URL
          typed.
        </p>
        <p>
          Under <strong>Available Dependencies</strong>, install{" "}
          <strong>CTRE-Phoenix (v6)</strong>. Take care here.{" "}
          <strong>CTRE-Phoenix Replay (v6)</strong> sits directly under it and
          is a different library.
        </p>
        {/* step-8.png showed the CommandsV2 swap. Re-capture, then restore. */}
        <p>
          Changing a dependency starts a build on its own. Leave it alone. The
          first one downloads Gradle and the vendor libraries, so it is slow.
          Gradle caches them in your home folder, so later builds are faster.
        </p>
        <p>
          A build that stops on <code>Could not resolve</code> could not reach a
          library it needed. Reconnect, then click the same WPILib icon you used
          to create the project, type <code>build</code>, and pick{" "}
          <strong>WPILib: Build Robot Code</strong>.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>Wait for the build to settle, then look at the file tree.</p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <code>BUILD SUCCESSFUL</code> as the last line of the terminal.
            </li>
            <li>
              A <code>Workshop</code> folder under <code>Downloads</code>, with{" "}
              <code>gradlew</code> at the top of it.
            </li>
            <li>
              <code>CommandsV3.json</code> and a Phoenix 6 file under{" "}
              <code>vendordeps/</code>.
            </li>
            <li>
              Your team number in <code>.wpilib/wpilib_preferences.json</code>.
            </li>
            <li>
              A <code>Robot.java</code> with no Epilogue lines, and an{" "}
              <code>opmode</code> folder holding <code>MyTeleop</code> only.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question: "Which Project Base does this course use?",
            options: [
              "Timed Robot, the simplest one in the list",
              "Command v2 Robot, because the course teaches commands",
              "Command v3 Robot Skeleton (Advanced)",
              "RobotBase Skeleton, for full control",
            ],
            correctAnswer: 2,
            explanation:
              "The skeleton is a Commands v3 project, so the right command library is installed from the start. Command v2 Robot is the trap in this list: the course is Commands v3 throughout.",
          },
          {
            id: 2,
            question:
              "Why delete @Logged and Epilogue.update(this) from Robot.java?",
            options: [
              "The course logs through Telemetry, and Epilogue left in logs each mechanism a second time",
              "Epilogue runs too slowly for the scheduler loop on SystemCore",
              "Epilogue does not compile under Java 25",
              "It is optional, and deleting them changes nothing",
            ],
            correctAnswer: 0,
            explanation:
              "Epilogue writes its own copy of each mechanism under Robot, beside the one Telemetry writes. It also prints an [EPILOGUE] Excluded from logs note on every build for each field it cannot log. Deleting the four lines leaves one logging system.",
          },
          {
            id: 3,
            question: "Why not put the project in a OneDrive folder?",
            options: [
              "OneDrive deletes Java files",
              "Git does not work inside OneDrive",
              "OneDrive makes the robot run slower",
              "Sync rewrites files while Gradle is working, and the build fails",
            ],
            correctAnswer: 3,
            explanation:
              "Cloud sync moves files underneath Gradle mid-build. The failures that follow look like broken code. On a school laptop Documents and Desktop are often synced quietly, so read the path before you accept it.",
          },
          {
            id: 4,
            question: "What does Enable Desktop Support turn on?",
            options: [
              "Deploying over USB instead of Wi-Fi",
              "Simulation and unit testing",
              "A desktop shortcut for the project",
              "Support for a second driver station",
            ],
            correctAnswer: 1,
            explanation:
              "Workshop 3 runs the program on your laptop, which sends real requests to the real motors through the CANivore. That runs through the simulator, so it needs the desktop build. Miss the box and the fix is one line in build.gradle: set includeDesktopSupport to true.",
          },
        ]}
      />
    </PageTemplate>
  );
}
