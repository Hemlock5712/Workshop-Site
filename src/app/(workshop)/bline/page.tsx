import PageTemplate from "@/components/PageTemplate";
import Quiz from "@/components/Quiz";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import ImageBlock from "@/components/ImageBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/bline");

/**
 * Written against Workshop-Code `swerve-bline` (8492c6d), whose parent is
 * `swerve-autonomous` (the Leave Start routine from /autonomous).
 *
 * BLine-Lib `2027.0.0-beta.3` from JitPack, paired with the BLine Web editor
 * v1.0.0 at bline.run. `FollowPath` implements `org.wpilib.command3.Command`.
 * A finished or canceled path sends a zero velocity, but on disable Robot's
 * Idle binding overwrites that zero in the same loop, so the page credits the
 * stop to disabling and never to the cancel. Reached events run through the
 * scheduler one loop later, in path order; canceling drops unreached ones.
 *
 * Verified in simulation, November 2026: pose reset, finish within 0.03 m and
 * 2 degrees, one event per run, None, red flip, re-enable, disable. Not
 * verified: real hardware, the editor's folder-picker export, the desktop app.
 */
export default function BLineLesson() {
  return (
    <PageTemplate
      title="BLine Paths"
      lede="BLine is a path library with a field editor. You draw a path in the browser, export it into the robot project, and the library turns it into a command. This lesson replaces the Leave Start timer with a drawn path."
      needs={[
        <>
          The <strong>Leave Start</strong> routine from{" "}
          <strong>Autonomous</strong>, and the numbers it measured.
        </>,
        <>
          <code>coroutine.await(...)</code> and the OpMode lifecycle, from{" "}
          <strong>Coroutines</strong> and <strong>Autonomous</strong>.
        </>,
        <>A browser for the editor at bline.run.</>,
      ]}
      branch="swerve-bline"
      time="30 minutes"
    >
      <p>
        A <strong>path</strong> is an ordered list of elements. A waypoint sets
        where the robot starts, translations are the points it drives through,
        and rotations set the way it faces on the way. An{" "}
        <strong>event trigger</strong> is a marker along the path that runs a
        piece of code when the robot passes it.
      </p>

      <LessonSection id="install" title="Install the library">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            In VS Code, open the <strong>WPILib Vendor Dependencies</strong>{" "}
            view. Expand <strong>INSTALL FROM URL</strong>, paste the URL below,
            and press <strong>Install</strong>.
          </li>
          <li>
            Build the project. Gradle downloads the library from JitPack the
            first time, so the first build needs internet.
          </li>
        </ol>
        <CodeBlock
          language="text"
          title="BLine-Lib 2027.0.0-beta.3, WPILib 2027 alpha-7"
          code="https://raw.githubusercontent.com/edanliahovetsky/BLine-Lib/wpilib-2027/BLine-Lib-2027.json"
        />
        <p>
          The editor at <strong>bline.run</strong> is version 1.0.0, the one
          that pairs with this library. Its home page links a Windows build.
        </p>
      </LessonSection>

      <LessonSection id="draw" title="Draw a path">
        <p>
          The editor works on the <code>src/main/deploy/autos</code> folder:{" "}
          <code>config.json</code>, <code>project.json</code>, and one file per
          path under <code>paths/</code>. It ships to the robot with every
          deploy.
        </p>
        <ImageBlock
          src="/images/bline/editor-import-autos-folder.png"
          alt="BLine editor home screen with the Import menu open, showing Autos folder and Project archive"
          width={1600}
          height={950}
          caption="Home, then Import, then Autos folder. A project with no autos folder yet starts from Create project."
        />
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            On <strong>Home</strong>, open <strong>Import ▾</strong>, choose{" "}
            <strong>Autos folder</strong>, and pick{" "}
            <code>src/main/deploy/autos</code>. With no folder yet, click{" "}
            <strong>Create project</strong>.
          </li>
          <li>
            Choose <strong>File → New Path</strong>. Name it{" "}
            <code>leave-start</code> in the <strong>Project Navigator</strong>,
            press <strong>✓</strong>, close the navigator, and pick the path in
            the path selector at the top.
          </li>
          <li>
            With the <strong>Waypoint</strong> tool, key 1, click the start.
            Type <strong>X (m)</strong> 1.0 and <strong>Y (m)</strong> 2.0 in
            the inspector. With the <strong>Translation</strong> tool, key 2,
            click once for each next point. This path needs one, at 3.5 and 2.0.
          </li>
          <li>
            With the <strong>Rotation</strong> tool, key 3, click the segment.
            Set <strong>Rotation (deg)</strong> to 45 and{" "}
            <strong>Rotation Pos (0-1)</strong> to 0.8.
          </li>
          <li>
            With the <strong>Event</strong> tool, key 4, click the segment. Set{" "}
            <strong>Event Pos (0-1)</strong> to 0.5 and <strong>Lib Key</strong>{" "}
            to <code>atMidpoint</code>.
          </li>
          <li>
            Press play to preview. Then choose{" "}
            <strong>File → Import / Export → Export Autos Folder...</strong> and
            put the <code>autos</code> folder in <code>src/main/deploy</code>.
          </li>
        </ol>
        <ImageBlock
          src="/images/bline/editor-event-trigger-key.png"
          alt="A short path on the blue side of the field, with the Event Trigger inspector open: Event Pos 0.5, Lib Key atMidpoint"
          width={1600}
          height={950}
          caption="An event trigger selected. Lib Key is the name the robot code looks up."
        />
        <Split>
          <p className="measure prose-body m-0">
            Speed limits sit on the <strong>Constraints</strong> tab. Each one
            reads <strong>Auto</strong> and follows <code>config.json</code>,
            which ships at 2 m/s and 2 m/s². To pin one, click its chip, switch
            it to <strong>Manual</strong>, type the value, and press{" "}
            <strong>Generate</strong>.
          </p>
          <MarginNote label="Delete strays">
            Every <strong>New Path</strong> you click exports, empty or not. An
            empty path throws <code>Path has no destination</code> when the
            robot loads it, so delete strays before you export.
          </MarginNote>
        </Split>
        <ImageBlock
          src="/images/bline/editor-export-autos-folder.png"
          alt="BLine editor File menu open on Import / Export, showing Export Autos Folder"
          width={1600}
          height={950}
          caption="Export Autos Folder writes config.json, project.json and every path."
        />
      </LessonSection>

      <LessonSection id="builder" title="The builder in DriveMechanism">
        <p>
          <code>FollowPath.Builder</code> is built once, in the{" "}
          <code>DriveMechanism</code> constructor, and turns every path file
          into a command.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          title="The request field, and the builder in the constructor"
          code={`// BLine hands back speeds relative to the robot, so the request is robot-relative too.
// Velocity asks each wheel for an exact speed, so the small corrections at the end of a path
// still turn the wheels instead of stalling against friction.
private final SwerveRequest.ApplyRobotVelocity pathRequest =
    new SwerveRequest.ApplyRobotVelocity().withDriveRequestType(DriveRequestType.Velocity);

  // Teaches BLine how to drive this robot. After this, followPath can turn any path drawn in
  // the BLine editor into a command.
  pathBuilder =
      new FollowPath.Builder(
              DriveType.SWERVE,
              this, // path commands require this mechanism
              () -> getPose(), // where the robot is
              pose -> resetPose(pose), // used when a path says where the robot starts
              () -> getRobotVelocity(), // how fast it is moving, in its own directions
              velocities -> driveRobotRelative(velocities), // drive like this
              // Each controller pulls the robot back toward the path. TODO: tune on your robot.
              new PIDController(2.0, 0.0, 0.0), // distance to the target: m/s per meter
              // At 1.0 the turn lagged and stalled short of the end tolerance in simulation.
              new PIDController(3.0, 0.0, 0.0), // heading error: rad/s per radian
              new PIDController(0.2, 0.0, 0.0)) // drift off the line: m/s per meter
          // Paths are drawn from the blue side. On red, BLine turns them around the field center.
          .withDefaultShouldFlip();`}
        />
        <p>
          BLine reads and writes <code>ChassisVelocities</code> in the
          robot&apos;s own directions, with X as its forward, so{" "}
          <code>driveRobotRelative</code> feeds them to an{" "}
          <code>ApplyRobotVelocity</code> request. Velocity mode matters at the
          end of a path, where a small voltage can leave a wheel stuck against
          friction.
        </p>
        <p>
          <code>followPath(name)</code> calls{" "}
          <code>pathBuilder.build(new Path(name))</code>, which reads{" "}
          <code>deploy/autos/paths/&lt;name&gt;.json</code> right there. The
          three gains are a starting point tuned in simulation only. If the
          robot stalls short of the end, raise them.
        </p>
      </LessonSection>

      <LessonSection id="auto-opmode" title="The Auto OpMode">
        <p>
          Delete <code>LeaveStartAuto.java</code>. One <code>@Autonomous</code>{" "}
          class now runs every routine, and a drop-down on the dashboard picks
          which one.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/AutoOpMode.java"
          title="AutoOpMode, without imports and Javadoc"
          code={`@Autonomous(name = "Auto")
public class AutoOpMode extends PeriodicOpMode {
  private final Selectable<Command> autoChooser = new Selectable<>();
  private Command routine;

  public AutoOpMode(Robot robot) {
    // Event triggers are the markers along a path. The key in quotes must match the marker's key
    // in the BLine editor exactly. This one is a stand-in that only prints a line to the driver
    // station console and the log. A robot with an intake would start the intake here instead.
    FollowPath.registerEventTrigger(
        "atMidpoint", () -> DataLogManager.log("Leave Start: reached the midpoint"));

    // Read the path file now, so a misspelled name fails when this OpMode is picked.
    // withPoseReset puts odometry at the path's first point before it drives.
    final var leaveStartPath = robot.drivetrain.followPath("leave-start").withPoseReset();

    // The routine owns no mechanism itself. The path command it awaits claims the drivetrain for
    // as long as it drives, and a second path would go on the next line.
    final Command leaveStart =
        Command.noRequirements(
                coroutine -> {
                  coroutine.await(leaveStartPath);
                })
            .named("Leave Start");
    final Command none = Command.noRequirements(coroutine -> {}).named("None");

    autoChooser.addDefault("Leave Start", leaveStart);
    autoChooser.add("None", none);
    Tunables.publish("Auto", autoChooser);
  }

  @Override
  public void start() {
    routine = autoChooser.getSelected();
    Scheduler.getDefault().schedule(routine);
  }

  @Override
  public void end() {
    Scheduler.getDefault().cancel(routine);
    FollowPath.clearPendingEventTriggers();
  }

  @Override
  public void close() {
    Tunables.remove("Auto");
  }
}`}
        />
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              The event trigger is registered first, before any path command is
              built. The routine is a coroutine that awaits the path, so a
              second path is one more line under the first:{" "}
              <code>coroutine.await(nextPath);</code>.
            </p>
            <p>
              <code>start()</code> reads the drop-down, because someone can
              still change it after picking the mode. <code>end()</code> cancels
              the routine and clears any event the path passed but has not run
              yet. <code>close()</code> takes the drop-down off the dashboard
              when another OpMode is picked.
            </p>
          </div>
          <MarginNote label="Events">
            A reached event runs through the scheduler one loop later, in path
            order. A canceled path drops the events it never reached. An event
            command can keep running after its path ends.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <strong>WPILib: Simulate Robot Code</strong> and pick{" "}
            <strong>Auto</strong> from the autonomous list.{" "}
            <code>Leave Start</code> is already selected under{" "}
            <code>Tunables/Auto</code>.
          </li>
          <li>
            Enable and watch <code>Drivetrain/Pose</code> on the 2D field in
            AdvantageScope. Disable and enable again, then try <code>None</code>
            , then <code>Leave Start</code> on red.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              The pose jump to 1.0, 2.0 at enable, then the robot drive to
              within 3 cm of 3.5, 2.0, facing 45 degrees within 2. Positive
              angles turn counterclockwise.
            </li>
            <li>
              <code>Leave Start: reached the midpoint</code> once per run in the
              console, a moment after the robot passes the marker.
            </li>
            <li>
              A re-enable running the path again from the start, and a disable
              stopping the robot. <code>None</code> holding still, and on red
              the path turned around the field center.
            </li>
          </ul>
        </Box>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Fails when picked",
              term: "A missing file",
              body: (
                <>
                  The name in <code>followPath</code> does not match a file in{" "}
                  <code>autos/paths</code>, <code>autos/config.json</code> is
                  missing, or an empty path threw{" "}
                  <code>Path has no destination</code>.
                </>
              ),
            },
            {
              label: "No console line",
              term: "A key mismatch",
              body: (
                <>
                  <strong>Lib Key</strong> in the editor and the string in{" "}
                  <code>registerEventTrigger</code> differ. They must match
                  letter for letter, capitals included.
                </>
              ),
            },
            {
              label: "Wrong place",
              term: "No pose reset",
              body: (
                <>
                  Without <code>withPoseReset()</code>, odometry keeps whatever
                  it read before, and the robot and the path disagree about
                  where the path begins.
                </>
              ),
            },
          ]}
        />
        <DocumentationButton
          href="https://docs.bline.run"
          title="BLine documentation"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              'Which file does robot.drivetrain.followPath("leave-start") read?',
            options: [
              "deploy/autos/project.json, which lists every path",
              "deploy/autos/paths/leave-start.json",
              "A file the editor sends to the robot over the network",
              "deploy/leave-start.path",
            ],
            correctAnswer: 1,
            explanation:
              "The library loads paths from deploy/autos/paths/<name>.json, and it needs autos/config.json beside them. The editor never talks to the robot. The exported folder ships with every deploy.",
          },
          {
            id: 2,
            question:
              "The event never prints, but the robot drives the whole path. What is the likely cause?",
            options: [
              "The event trigger needs its own path file",
              "Event triggers only run on a real robot",
              "The path has no rotation element",
              "Lib Key in the editor does not match the string passed to registerEventTrigger",
            ],
            correctAnswer: 3,
            explanation:
              "The marker in the path file carries a key, and the robot runs whatever code was registered under that key. A single wrong capital is enough to break the match.",
          },
          {
            id: 3,
            question:
              "Why does the path request use DriveRequestType.Velocity?",
            options: [
              "Each wheel is asked for an exact speed, so small corrections near the end still turn it",
              "BLine refuses to drive any other request type",
              "Velocity mode makes the robot field-relative",
              "It turns off the heading controller",
            ],
            correctAnswer: 0,
            explanation:
              "Near the end of a path the corrections are small. A small voltage can leave a wheel sitting against friction, so the path stalls short of its tolerance. A velocity request keeps closing the gap.",
          },
          {
            id: 4,
            question:
              "How do you make the Leave Start routine drive a second path after the first?",
            options: [
              "Draw both into one path, because a routine can only run one",
              "Register the second path as an event trigger",
              "Add another coroutine.await line for the second path under the first",
              "Make a second @Autonomous class",
            ],
            correctAnswer: 2,
            explanation:
              "The routine is a coroutine, and await waits for a command to finish before moving on. Each path is one await line, in the order the robot drives them.",
          },
          {
            id: 5,
            question:
              "The robot drives the right shape but in the wrong place on the field. What is missing?",
            options: [
              "withDefaultShouldFlip on the builder",
              "withPoseReset on the path command",
              "A second translation in the editor",
              "Tunables.publish in the constructor",
            ],
            correctAnswer: 1,
            explanation:
              "withPoseReset puts odometry at the path's first point before it drives. Without it, odometry keeps its old reading, and the robot and the path disagree about where the path starts.",
          },
          {
            id: 6,
            question:
              "Why does AutoOpMode read the drop-down in start() and not in its constructor?",
            options: [
              "The constructor runs when the mode is picked, and the drop-down can still change after that",
              "Selectable only works inside start()",
              "The constructor runs after start()",
              "Reading it twice would schedule the routine twice",
            ],
            correctAnswer: 0,
            explanation:
              "Picking Auto on the driver station builds the OpMode. Enabling calls start(). A driver can change the dashboard choice between the two, so the choice is read at enable.",
          },
        ]}
      />
    </PageTemplate>
  );
}
