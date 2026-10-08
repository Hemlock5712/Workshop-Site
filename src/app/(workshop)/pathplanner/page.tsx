import PageTemplate from "@/components/PageTemplate";
import Quiz from "@/components/Quiz";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split, WatchOut } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/pathplanner");

/**
 * Written against Workshop-Code `swerve-pathplanner`, whose parent is
 * `swerve-autonomous` (the Leave Start routine from /autonomous), whose parent
 * is `1-Swerve`.
 *
 * PathPlannerLib 2027.0.0-alpha-4 is the 2027_alpha7 vendordep. Its AutoBuilder,
 * FollowPathCommand, NamedCommands and PathPlannerAuto are still built on the
 * other command framework, so the lesson uses only the classes that are not
 * commands: PathPlannerPath, RobotConfig, PathPlannerTrajectory and
 * PPHolonomicDriveController, driven from a Commands v3 coroutine. Every name
 * below was read off the jar, not the docs.
 *
 * The path is picked with org.wpilib.tunable.Selectable, the owner's call in
 * October 2026. WPILib's own templates show Selectable only in TimedRobot
 * projects; the OpMode templates pick autos with @Autonomous classes. Here the
 * auto is one @Autonomous class and the Selectable picks the path inside it.
 * Topic names below were read off a sim run: /Tunables/Auto Path/{.type,
 * default, options, selected/value}.
 *
 * The 2027 alpha WatchOut covers a crash in that release: on WPILib alpha-7,
 * RobotConfig's static initializer throws "Alert already allocated". Delete
 * it when a PathPlannerLib release fixes it.
 */
export default function PathPlannerLesson() {
  return (
    <PageTemplate
      title="PathPlanner Paths"
      lede="PathPlanner is a field editor. You draw a path on the field, and PathPlannerLib turns it into a speed for every loop. This lesson replaces the Leave Start timer with a drawn path."
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
            The app saves each path as a file in the robot project. The robot
            reads that file, plans the trip from wherever it is, and follows the
            plan one loop at a time.
          </p>
        </div>
        <MarginNote label="Paths, not autos">
          The app&apos;s Auto editor, event markers and named commands build
          commands for PathPlannerLib&apos;s own classes, which use a different
          command framework from this project. Here an auto is an{" "}
          <code>@Autonomous</code> class, the same as Leave Start.
        </MarginNote>
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
            In VS Code, open <strong>WPILib: Manage Vendor Libraries</strong>,
            choose <strong>Install new libraries (online)</strong>, and paste
            the URL below.
          </li>
          <li>Build the project. It should compile with nothing else added.</li>
        </ol>
        <CodeBlock
          language="text"
          title="PathPlannerLib for WPILib 2027 alpha-7"
          code="https://3015rangerrobotics.github.io/pathplannerlib/PathplannerLibSystemCoreAlpha.json"
        />
        <WatchOut label={"2027\nalpha"}>
          <p>
            PathPlannerLib <code>2027.0.0-alpha-4</code> builds, then stops the
            robot program at boot with{" "}
            <code>AlertException: Alert already allocated</code> from{" "}
            <code>RobotConfig.&lt;clinit&gt;</code>. The fault is in that
            release. Update the vendordep when a fixed one is published.
          </p>
        </WatchOut>
        <p>
          Then open <strong>Settings</strong> and the{" "}
          <strong>Robot Config</strong> tab. PathPlannerLib reads these numbers
          back on the robot and uses them to decide how hard each wheel can
          push. A guessed number shapes every path the robot drives.
        </p>
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

      <LessonSection id="draw-one-path" title="Draw one path">
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
            <strong>Goal End State</strong> rotation to 45 degrees.
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
      </LessonSection>

      <LessonSection id="drive-it-from-code" title="Drive it from code">
        <p>
          <code>DriveMechanism</code> gets one new command. When it starts, it
          plans the whole trip from the robot&apos;s pose and speed. Then each
          loop asks the plan where the robot should be, and{" "}
          <code>PPHolonomicDriveController</code> turns the gap into a speed.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          title="followPath: plan once, then follow"
          code={`public Command followPath(PathPlannerPath path) {
  return run(coroutine -> {
        PathPlannerTrajectory trajectory =
            path.generateTrajectory(getRobotVelocity(), getPose().getRotation(), pathConfig);
        pathController.reset(getPose(), getRobotVelocity());
        double startTime = Utils.getCurrentTimeSeconds();
        double elapsed = 0.0;

        while (elapsed < trajectory.getTotalTimeSeconds()) {
          PathPlannerTrajectoryState target = trajectory.sample(elapsed);
          drivetrain.setControl(
              pathRequest.withVelocity(
                  pathController.calculateRobotRelativeSpeeds(getPose(), target)));
          Telemetry.getTable(getName()).log("PathTarget", target.pose);
          coroutine.yield();
          elapsed = Utils.getCurrentTimeSeconds() - startTime;
        }

        stopDriving();
      })
      .whenCanceled(() -> stopDriving())
      .named("FollowPath " + path.name);
}`}
        />
        <p>
          <code>stopDriving()</code> sends zero speed, and it runs on both
          exits. A canceled command sends nothing to the motors, so without{" "}
          <code>whenCanceled</code> a disable halfway leaves the last speed
          latched in the drivetrain.
        </p>
        <p>
          The <strong>Follow Path</strong> OpMode runs whichever path is picked.
          It reads the choice in <code>start()</code>, because the choice can
          still change after the mode is picked. Then it resets odometry to the
          path&apos;s first pose, gives odometry one loop, and awaits the
          follower.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/FollowPathAuto.java"
          title="Follow Path: read the choice at enable"
          code={`@Override
public void start() {
  PathPlannerPath path = robot.autoPath.getSelected();

  routine =
      Command.noRequirements(
              coroutine -> {
                path.getStartingHolonomicPose()
                    .ifPresent(pose -> robot.drivetrain.resetPose(pose));
                coroutine.yield(); // give odometry one loop to report the new pose
                coroutine.await(robot.drivetrain.followPath(path));
              })
          .named("Follow Path");

  Scheduler.getDefault().schedule(routine);
}`}
        />
      </LessonSection>

      <LessonSection id="auto-path" title="The Auto Path drop-down">
        <p>
          The list of paths is a <code>Selectable</code>, the WPILib 2027
          drop-down for choosing one value out of several. <code>Robot</code>{" "}
          owns it, so it exists from boot, before any mode is picked.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/Robot.java"
          title="One line per path"
          code={`public final Selectable<PathPlannerPath> autoPath = new Selectable<>();

public Robot() {
  // ...
  // The name in quotes must match the path's name in the PathPlanner app exactly.
  autoPath.addDefault("Leave Start", DriveMechanism.loadPath("Leave Start"));
  Tunables.publish("Auto Path", autoPath);
}`}
        />
        <p>
          On the dashboard it appears under <code>Tunables/Auto Path</code>. The{" "}
          <code>options</code> entry lists every name, <code>default</code>{" "}
          names the one marked with <code>addDefault</code>, and{" "}
          <code>selected</code> is the one you set. Nothing set, or a name that
          is not on the list, and <code>getSelected()</code> hands back the
          default.
        </p>
        <p>
          To add a path, draw it in the app and add one line under the first:{" "}
          <code>
            autoPath.add(&quot;Pickup&quot;,
            DriveMechanism.loadPath(&quot;Pickup&quot;));
          </code>{" "}
          Keep exactly one <code>addDefault</code>. With none,{" "}
          <code>getSelected()</code> returns <code>null</code> when nothing is
          set, and Follow Path throws a NullPointerException at enable.
        </p>
      </LessonSection>

      <LessonSection id="failure-shapes" title="Three failure shapes">
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Stops at boot",
              term: "A missing file",
              body: (
                <>
                  <code>Could not load PathPlanner path</code> means a name in{" "}
                  <code>Robot</code> has no file under <code>paths/</code>. A
                  missing <code>settings.json</code> means the app never opened
                  this project.
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
                  <code>PathTarget</code> runs away from <code>Pose</code>. A
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
            Run <strong>WPILib: Simulate Robot Code</strong>. In the sim GUI,
            open <strong>NetworkTables</strong> and check that{" "}
            <code>Tunables/Auto Path/options</code> lists{" "}
            <code>Leave Start</code>.
          </li>
          <li>
            Pick <strong>Follow Path</strong> from the autonomous list and
            enable. Plot <code>Drivetrain/Pose</code> and{" "}
            <code>Drivetrain/PathTarget</code> in AdvantageScope.
          </li>
          <li>
            Deploy, put the robot on the tape mark, and run it three times with
            one person on disable.
          </li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              In sim, <code>Pose</code> tracking <code>PathTarget</code> the
              whole way and ending within a few centimeters of the last
              waypoint, turned to 45 degrees.
            </li>
            <li>A full stop at the end that stays stopped.</li>
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
              "Why does Follow Path read the Selectable in start() and not in its constructor?",
            options: [
              "A Selectable can only be read while the robot is enabled",
              "The constructor runs when the mode is picked, and the choice can change after that",
              "The constructor cannot see the Robot fields",
              "Reading it twice would load the path twice",
            ],
            correctAnswer: 1,
            explanation:
              "Picking Follow Path on the driver station builds the OpMode. Someone can still change Auto Path before enabling. start() runs at enable, so it reads the choice that is set when the robot moves.",
          },
          {
            id: 5,
            question:
              "Why does followPath call stopDriving() in whenCanceled as well as after the loop?",
            options: [
              "The scheduler calls whenCanceled first, so it stops the robot sooner",
              "whenCanceled runs on every exit, so the second call is a spare",
              "A canceled command never reaches the code after the loop, and the last speed stays latched",
              "The disabled binding in Robot needs a zero to start from",
            ],
            correctAnswer: 2,
            explanation:
              "Cancel stops the coroutine where it is, so the line after the loop never runs. Canceling sends nothing to the motors, and setControl keeps applying the last request. whenCanceled runs only on a cancel, so the normal exit needs its own call.",
          },
          {
            id: 6,
            question:
              "You rename the path to Leave Start Left in the app and deploy. The robot program stops at boot. What fixes it?",
            options: [
              "Change the name in Robot.java to match, spelled exactly the same",
              "Redraw the path from scratch",
              "Delete settings.json so the app writes it again",
              "Install the vendordep again",
            ],
            correctAnswer: 0,
            explanation:
              "loadPath looks for a file named after the string in Robot.java. Rename one side and the file is not found. Robot loads every path at boot, so it fails on the bench, not in the middle of a match.",
          },
        ]}
      />
    </PageTemplate>
  );
}
