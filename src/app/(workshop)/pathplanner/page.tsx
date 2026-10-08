import PageTemplate from "@/components/PageTemplate";
import Quiz from "@/components/Quiz";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/pathplanner");

/**
 * Written against Workshop-Code `swerve-pathplanner`, whose parent is
 * `swerve-autonomous` (the Leave Start routine from /autonomous), whose parent
 * is `1-Swerve`.
 *
 * PathPlannerLib is the team's Commands v3 build,
 * `2027.0.0-alpha-7-commandsv3-1`, from the `vendordep` branch of
 * JosephTLockwood/pathplanner. It adds `com.pathplanner.lib.command3`:
 * AutoBuilder, NamedCommands, PathPlannerAuto, FollowPathCommand and
 * PathfindingCommand written as coroutines, and it carries the fix for the
 * alpha-4 "Alert already allocated" crash. Every name below was read off
 * `new-path-2027-commands-v3`, not the upstream docs. Swap the URL back to
 * the official vendordep once upstream ships Commands v3.
 *
 * A path that finishes with a goal velocity under 0.1 m/s sends zero speed.
 * A canceled one sends nothing (`PathFollower.stop(true)`), so the stop on a
 * cancel comes from disabling or from the drive default command taking over.
 */
export default function PathPlannerLesson() {
  return (
    <PageTemplate
      title="PathPlanner Paths"
      lede="PathPlanner is a field editor. You draw paths on the field, string them into autos with the actions between them, and PathPlannerLib turns each auto into one command. This lesson replaces the Leave Start timer with a drawn auto."
      needs={[
        <>
          The <strong>Leave Start</strong> routine from{" "}
          <strong>Autonomous</strong>, and the three numbers it measured.
        </>,
        <>
          Wheel radius, top speed and slip current from{" "}
          <strong>Swerve Drive Tuning</strong>.
        </>,
        <>
          The robot&apos;s weight with battery and bumpers, and a tape measure.
        </>,
      ]}
      branch="swerve-pathplanner"
      time="30 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            A <strong>path</strong> is one drive from a start pose to an end
            pose. Waypoints shape the curve. The rotation is set apart from
            them, so a swerve robot can travel one way while it faces another.
          </p>
          <p>
            An <strong>auto</strong> is a list: drive this path, run this
            action, drive the next path. The app saves both as files in the
            robot project, and the robot builds each auto into a single command
            at boot.
          </p>
        </div>
      </Split>

      <LessonSection id="install" title="Install and configure">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Install <strong>PathPlanner</strong> from the Microsoft Store or the
            GitHub releases page.
          </li>
          <li>
            Click <strong>Open Robot Project</strong> and pick the project root,
            the folder with <code>build.gradle</code> in it. The app creates{" "}
            <code>src/main/deploy/pathplanner</code>.
          </li>
          <li>
            In VS Code, open the <strong>WPILib Vendor Dependencies</strong>{" "}
            view from the activity bar. Expand <strong>INSTALL FROM URL</strong>
            , paste the URL below, and press <strong>Install</strong>.
          </li>
          <li>Build the project. It should compile with nothing else added.</li>
        </ol>
        <CodeBlock
          language="text"
          title="PathPlannerLib for Commands v3, WPILib 2027 alpha-7"
          code="https://raw.githubusercontent.com/JosephTLockwood/pathplanner/vendordep/PathplannerLib.json"
        />
        <Split>
          <p className="measure prose-body m-0">
            Then open <strong>Settings</strong> and the{" "}
            <strong>Robot Config</strong> tab. PathPlannerLib reads these
            numbers back on the robot and uses them to decide how hard each
            wheel can push. A guessed number shapes every path the robot drives.
          </p>
          <MarginNote label="Which build">
            The official PathPlannerLib release for 2027 builds its commands on
            the older command framework. This build is the same library with a{" "}
            <code>command3</code> package added, so every command it makes runs
            on the Commands v3 scheduler.
          </MarginNote>
        </Split>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Setting</th>
                <th className="px-3 py-2 text-left">Where it comes from</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Robot Mass</td>
                <td className="px-3 py-2">
                  A scale, with battery and bumpers on, in kilograms. 68 kg is
                  the usual stand-in until you weigh it.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Robot MOI</td>
                <td className="px-3 py-2">
                  Mass &times; (length&sup2; + width&sup2;) &divide; 12, in
                  meters. A 68 kg robot, 0.84 m square, comes to about 8.0.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Bumper Width, Length</td>
                <td className="px-3 py-2">
                  The tape measure, outside edge to outside edge.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Wheel Radius, Drive Gearing</td>
                <td className="px-3 py-2">
                  <code>kWheelRadius</code> and <code>kDriveGearRatio</code> in{" "}
                  <code>TunerConstants.java</code>. The radius there is in
                  inches. Multiply by 0.0254.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">True Max Drive Speed</td>
                <td className="px-3 py-2">
                  The plateau you measured for <code>kSpeedAt12Volts</code>.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">Drive Motor, Current Limit</td>
                <td className="px-3 py-2">
                  Kraken X60, and <code>kSlipCurrent</code>. Leave Wheel COF at
                  1.2 unless your wheel vendor lists one.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Module Offsets</td>
                <td className="px-3 py-2">
                  <code>kFrontLeftXPos</code> and the other seven, converted to
                  meters. The shipped 10 inches is 0.254.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </LessonSection>

      <LessonSection id="draw-one-path" title="Draw a path and auto">
        <p>
          Draw the trip Leave Start made, from the same tape mark. The field in
          the app has its origin at the blue alliance corner, the same as{" "}
          <code>Drivetrain/Pose</code>.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Click <strong>+</strong> in the Paths section and name the path{" "}
            <code>Leave Start</code>.
          </li>
          <li>
            Drag the first waypoint onto the tape mark. Set{" "}
            <strong>Ideal Starting State</strong> rotation to the way the front
            bumper points.
          </li>
          <li>
            Drag the last waypoint about two meters out, in open floor. Set{" "}
            <strong>Goal End State</strong> rotation to 45 degrees and leave its
            velocity at 0.
          </li>
          <li>
            Set <strong>Global Constraints</strong> to 2 m/s and 2 m/s². Watch
            the bumper outline through the preview, not just the line.
          </li>
        </ol>
        <p>
          The app saves as you go, to{" "}
          <code>deploy/pathplanner/paths/Leave Start.path</code>. That file
          ships to the robot with every deploy.
        </p>
        <p>
          A path on its own does nothing. The robot runs autos, so wrap the path
          in one. Click <strong>+</strong> in the Autos section, name it{" "}
          <code>Leave Start</code>, and drag the <code>Leave Start</code> path
          into its command list. Leave <strong>Reset Odometry</strong> on. At
          enable it tells odometry the robot is sitting on the first path&apos;s
          start pose.
        </p>
        <p>
          The branch ships two longer autos built the same way. Each box in the
          list runs after the one above it finishes:
        </p>
        <FigureGrid
          cols={2}
          items={[
            {
              label: "Shoot and Leave",
              term: "Path, action, path",
              body: (
                <>
                  <code>Start to Shoot</code>, then the <code>Shoot</code> named
                  command, then <code>Shoot to Neutral Zone</code>.
                </>
              ),
            },
            {
              label: "Neutral Zone Run",
              term: "Path, path, action",
              body: (
                <>
                  <code>Start to Neutral Zone</code>, with an{" "}
                  <code>Intake</code> zone along it, then{" "}
                  <code>Neutral Zone to Shoot</code> and <code>Shoot</code>.
                </>
              ),
            },
          ]}
        />
      </LessonSection>

      <LessonSection id="configure" title="Teach AutoBuilder the robot">
        <p>
          <code>AutoBuilder</code> is what turns a file into a command. It has
          to know how to read this robot and how to drive it, once, before any
          auto loads. That goes in the <code>DriveMechanism</code> constructor.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          title="In the constructor, after registerTelemetry"
          code={`// Teaches PathPlanner how to drive this robot. After this, AutoBuilder can turn any path or
// auto drawn in the PathPlanner app into a command.
AutoBuilder.configure(
    () -> getPose(), // where the robot is
    pose -> resetPose(pose), // used when an auto says where the robot starts
    () -> getRobotVelocity(), // how fast it is moving, in its own directions
    speeds -> drivetrain.setControl(pathRequest.withVelocity(speeds)), // drive like this
    // Pulls the robot back onto the path when it drifts. The first gain is for position (m/s
    // of correction per meter of error), the second for heading. TODO: tune on your robot.
    new PPHolonomicDriveController(
        new PIDConstants(5.0, 0.0, 0.0), new PIDConstants(5.0, 0.0, 0.0)),
    loadPathConfig(),
    // Paths are drawn from the blue side. On red, PathPlanner mirrors them across the field.
    () -> MatchState.getAlliance().orElse(Alliance.BLUE) == Alliance.RED,
    this); // path commands require this mechanism`}
        />
        <p>
          Import <code>AutoBuilder</code> from{" "}
          <code>com.pathplanner.lib.command3</code>. The one in{" "}
          <code>com.pathplanner.lib.auto</code> makes commands for the other
          framework, and they will not compile against{" "}
          <code>org.wpilib.command3.Command</code>.
        </p>
        <p>
          <code>pathRequest</code> is a{" "}
          <code>SwerveRequest.ApplyRobotVelocity</code> field, because
          PathPlannerLib hands back speeds relative to the robot.{" "}
          <code>loadPathConfig()</code> wraps{" "}
          <code>RobotConfig.fromGUISettings()</code>, which reads the Robot
          Config tab out of <code>deploy/pathplanner/settings.json</code>.
        </p>
      </LessonSection>

      <LessonSection id="auto-opmode" title="One Auto OpMode">
        <p>
          Delete <code>LeaveStartAuto.java</code>. The drawn auto replaces it,
          and one <code>@Autonomous</code> class now runs every auto in the
          project. It registers the named commands, asks{" "}
          <code>AutoBuilder</code> for a drop-down of autos, and runs the
          selected one at enable.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/AutoOpMode.java"
          title="AutoOpMode: register, list, run"
          code={`@Autonomous(name = "Auto")
public class AutoOpMode extends PeriodicOpMode {
  private final Selectable<Command> autoChooser;
  private Command routine;

  public AutoOpMode(Robot robot) {
    // The name in quotes must match the name in the PathPlanner app exactly.
    NamedCommands.registerCommand(
        "Shoot",
        Command.noRequirements(coroutine -> coroutine.wait(Seconds.of(1.0))).named("Shoot"));
    NamedCommands.registerCommand(
        "Intake", Command.noRequirements(coroutine -> coroutine.park()).named("Intake"));

    // PathPlanner fills this with one choice per auto drawn in the app, plus "None". It loads
    // every auto, so the named commands above have to be registered first.
    autoChooser = AutoBuilder.buildAutoChooser("Leave Start");
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
  }

  /** Takes the drop-down off the dashboard when another OpMode is picked. */
  @Override
  public void close() {
    Tunables.remove("Auto");
  }
}`}
        />
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              <code>Shoot</code> and <code>Intake</code> are stand-ins that only
              take time. A robot with a shooter registers its real command under
              the same name. Every auto that uses <code>Shoot</code> picks it up
              with no change in the app.
            </p>
            <p>
              <code>Intake</code> parks, so it never finishes on its own. It
              runs inside the event marker zone on{" "}
              <code>Start to Neutral Zone</code>. The path starts it when the
              robot enters the zone and cancels it when the robot leaves.
            </p>
            <p>
              The selected auto is read in <code>start()</code>, because someone
              can still change the drop-down after picking the mode. On the
              dashboard it appears under <code>Tunables/Auto</code>.
            </p>
          </div>
          <MarginNote label="How it stops">
            A path whose goal velocity is 0 sends zero speed when it finishes. A
            path canceled halfway sends nothing, the same{" "}
            <a href="/running-program#latched" className="underline">
              latched request
            </a>{" "}
            as any other command. In auto, disabling cuts the output.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="failure-shapes" title="Three failure shapes">
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Does nothing",
              term: "A missing name",
              body: (
                <>
                  The driver station reports a missing file, or the auto skips
                  an action. A name in the app does not match a path file or a
                  registered command, letter for letter.
                </>
              ),
            },
            {
              label: "Wrong place",
              term: "Pose and plan disagree",
              body: (
                <>
                  The robot drives the right shape, offset or rotated. The
                  starting rotation in the app does not match the way the robot
                  sat on the tape.
                </>
              ),
            },
            {
              label: "Lags or overshoots",
              term: "Config or gains",
              body: (
                <>
                  The robot falls behind the path or swings past its end. A
                  guessed top speed or mass asks for more than the robot has.
                  Fix the config before the gains.
                </>
              ),
            },
          ]}
        />
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Run <strong>WPILib: Simulate Robot Code</strong>. Pick{" "}
            <strong>Auto</strong> from the autonomous list. In the sim GUI, open{" "}
            <strong>NetworkTables</strong> and check that{" "}
            <code>Tunables/Auto/options</code> lists all three autos and{" "}
            <code>None</code>.
          </li>
          <li>
            Enable with <code>Leave Start</code> selected. Watch{" "}
            <code>Drivetrain/Pose</code> on the 2D field in AdvantageScope.
          </li>
          <li>
            Select <code>Neutral Zone Run</code>, enable again, and watch the
            scheduler for <code>Intake</code> and <code>Shoot</code>.
          </li>
          <li>
            Deploy, put the robot on the tape mark, and run{" "}
            <code>Leave Start</code> three times with one person on disable.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              In sim, the robot ending within a few centimeters of the last
              waypoint, turned to 45 degrees, and staying stopped.
            </li>
            <li>
              <code>Intake</code> running only through the marked zone, and{" "}
              <code>Shoot</code> taking one second at the end.
            </li>
            <li>
              Three floor runs that land closer together than the three timed
              runs of Leave Start did.
            </li>
          </ul>
        </Box>
        <DocumentationButton
          href="https://pathplanner.dev/gui-editing-paths-and-autos.html"
          title="PathPlanner: Editing paths and autos"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "On a swerve path, what sets the direction the robot faces?",
            options: [
              "The waypoints, because the robot always faces along the curve",
              "The order the waypoints were placed in",
              "The starting and goal rotations and any rotation targets, set apart from the waypoints",
              "The angular velocity constraint",
            ],
            correctAnswer: 2,
            explanation:
              "Waypoints shape where the robot goes. Facing is set on its own: the ideal starting state, the goal end state, and rotation targets in between. Angular constraints cap how fast it turns, never where it ends up.",
          },
          {
            id: 2,
            question:
              "Where do wheel radius and True Max Drive Speed in Robot Config come from?",
            options: [
              "TunerConstants and the top speed you measured, because the robot reads them back to plan every path",
              "The defaults, since they only change the preview drawing",
              "The app measures them from the field image",
              "Whatever numbers make the preview look smooth",
            ],
            correctAnswer: 0,
            explanation:
              "The app saves Robot Config to settings.json, and the robot loads it to decide how hard each wheel can push. A guessed number shapes every path the robot drives, not just the picture on screen.",
          },
          {
            id: 3,
            question: "The drawn line clears the hub. What can still hit it?",
            options: [
              "Nothing, as long as the line itself is clear",
              "Nothing, because the app refuses to save a path that clips",
              "The wheels, since module positions are left out of the preview",
              "The bumpers, because the line tracks the robot's center",
            ],
            correctAnswer: 3,
            explanation:
              "The line is the path of one point, the center of the robot. Set the bumper size in Robot Config and watch the outline. A corner sweeps wide where the robot turns and moves at once, and the app saves the path either way.",
          },
          {
            id: 4,
            question:
              "Why does AutoOpMode register its named commands before it calls buildAutoChooser?",
            options: [
              "Tunables.publish only accepts a chooser built after registration",
              "buildAutoChooser loads every auto, and each auto looks up its named commands as it loads",
              "Named commands only run if they are registered in an OpMode",
              "The order does not matter, it is only for readability",
            ],
            correctAnswer: 1,
            explanation:
              "Building the chooser builds every auto in the project. An auto that names Shoot looks Shoot up right then, so a command registered afterward is missing from every auto already built.",
          },
          {
            id: 5,
            question:
              "Intake parks forever. Why does it stop in Neutral Zone Run?",
            options: [
              "Its event marker is a zone, and the path cancels it when the robot leaves the zone",
              "Named commands time out after one second",
              "Shoot requires the same mechanism and takes it over",
              "The auto ends, and only then is it canceled",
            ],
            correctAnswer: 0,
            explanation:
              "A zone marker starts its command when the robot enters the zone and cancels it at the zone's end. Event commands are children of the path command, so they also end if the path ends first.",
          },
          {
            id: 6,
            question:
              "You rename the Shoot and Leave auto in the app and deploy. What changes on the robot?",
            options: [
              "The program stops at boot until AutoOpMode is edited to match",
              "Nothing, until the vendordep is installed again",
              "The drop-down lists the new name, with no code change",
              "The auto runs, but its named commands are skipped",
            ],
            correctAnswer: 2,
            explanation:
              "buildAutoChooser lists whatever .auto files are deployed. Only the default auto is named in code. Rename Leave Start and the default falls back to None until the string in AutoOpMode matches.",
          },
        ]}
      />
    </PageTemplate>
  );
}
