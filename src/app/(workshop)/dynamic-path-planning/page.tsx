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

export const metadata = lessonMetadata("/dynamic-path-planning");

/**
 * Written against Workshop-Code `swerve-pathfinding`, one commit on top of
 * `swerve-pathplanner`. It adds `pathfindTo`, which returns
 * `AutoBuilder.pathfindToPose` from the team's Commands v3 PathPlannerLib, and
 * one teleop binding.
 *
 * That command is PathPlannerLib's own PathfindingCommand. It takes each
 * refined AD* route until it is within 2 m of the goal, but the search's start
 * point is set once, at start (`PathfindingFollower.start`/`update`). When the
 * 2027 release could not run it, this page planned once by hand.
 *
 * With no route, PathfindingFollower sends nothing and never finishes, so the
 * command holds the drivetrain on its last request until A is released. The
 * branch has no fallback for that, so the page tells the student to let go
 * rather than teaching code Workshop-Code does not have. A goal on a blocked
 * cell is moved to the nearest open one (`LocalADStar.findClosestNonObstacle`).
 *
 * A canceled pathfind sends no zero (`PathFollower.stop(true)`). The teleop
 * binding is safe because the joystick default command takes the drivetrain
 * back on release.
 */
export default function DynamicPathPlanning() {
  return (
    <PageTemplate
      title="Pathfinding"
      lede="A drawn path starts where you drew it. Pathfinding starts wherever the robot is and searches a grid of the field for a way around the obstacles, then drives the route it found."
      needs={[
        <>
          <code>AutoBuilder.configure</code> and the Auto OpMode from{" "}
          <strong>PathPlanner</strong>, working in simulation.
        </>,
        <>A pose you trust, from odometry or from vision.</>,
      ]}
      branch="swerve-pathfinding"
      time="12 minutes"
    >
      <LessonSection id="navigation-grid" title="The navigation grid">
        <p>
          The PathPlanner app wrote <code>deploy/pathplanner/navgrid.json</code>{" "}
          the first time it opened the project. It splits the field into 0.3 m
          squares and marks each one blocked or open. Open means the{" "}
          <em>center</em> of the robot can pass through without the bumpers
          touching anything.
        </p>
        <p>
          That is why the default grid blocks a wide band around the hub, not
          just the hub. The margin is the bumper. Open the{" "}
          <strong>Navigation Grid</strong> page in the app to see it. Leave it
          as shipped until a run shows the bumper reaching an obstacle.
        </p>
      </LessonSection>

      <LessonSection id="find-a-route" title="Find a route and drive it">
        <p>
          The search, AD*, runs on its own thread. Start it in the{" "}
          <code>DriveMechanism</code> constructor, before{" "}
          <code>AutoBuilder.configure</code>, so the first button press does not
          pay to load the grid.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          title="First line of the constructor"
          code={`// Load deploy/pathplanner/navgrid.json and start the route search on its own thread, now,
// so the first request does not pay for it.
Pathfinding.ensureInitialized();`}
        />
        <p>
          Then one method asks <code>AutoBuilder</code> for a pathfinding
          command. It uses the controller, config and alliance flip that{" "}
          <code>configure</code> already gave it.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          title="pathfindTo"
          code={`public Command pathfindTo(Pose2d goal) {
  // Speed limits for routes the pathfinder makes up: 2 m/s, 2 m/s², and a turn rate of 3/4 of a
  // turn per second. A drawn path carries its own limits; a found one gets these.
  return AutoBuilder.pathfindToPose(
      goal, new PathConstraints(2.0, 2.0, Math.toRadians(270), Math.toRadians(360), 12.0));
}`}
        />
        <Split>
          <p className="measure prose-body m-0">
            The command plans from the robot&apos;s pose when it starts. AD*
            keeps refining that route while the robot drives. The command takes
            each better one until the robot is within 2 m of the goal. It
            finishes at the goal with zero speed. Started within 0.5 m of the
            goal, it sends zero and finishes without moving. That is one more
            reason the last stretch belongs to <strong>Drive to Point</strong>.
          </p>
          <MarginNote label="Bumped off course">
            The search never moves its start point. A robot pushed off the route
            is pulled back toward it by the follower, the same as on a drawn
            path.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="bind-it" title="Bind it to a button">
        <p>
          Hold A in teleop and the robot drives itself to the middle of the
          neutral zone, around the hub.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          title="Hold A to pathfind"
          code={`// Hold A: find a way around the hub to the middle of the neutral zone, and drive it. Let go
// and the sticks take over again. The goal is blue-origin, like every pose on this robot.
driver.a().whileTrue(drivetrain.pathfindTo(new Pose2d(7.5, 4.0, Rotation2d.ZERO)));`}
        />
        <p>
          Let go and the command is canceled. A canceled pathfind sends no zero.
          What stops the robot is the joystick default command, which takes the
          drivetrain back the same loop and sends whatever the sticks say. Bind
          this anywhere without a drive default and the robot keeps its{" "}
          <a href="/running-program#latched" className="underline">
            last request
          </a>
          .
        </p>
        <p>
          Pathfinding is good at crossing the field and poor at the last few
          centimeters. Send it to a pose near the target, then finish with{" "}
          <strong>Drive to Point</strong>.
        </p>
      </LessonSection>

      <LessonSection id="failure-shapes" title="Three failure shapes">
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Keeps rolling",
              term: "No route",
              body: (
                <>
                  A goal on a blocked square is moved to the nearest open one,
                  so that is not it. The open area around the goal is walled off
                  from the robot. The command sends nothing and holds the
                  drivetrain, so the last request stays on. Let go of A.
                </>
              ),
            },
            {
              label: "Clips the hub",
              term: "Grid too thin",
              body: (
                <>
                  The center stayed on open squares and the bumper still hit.
                  The robot is wider than the grid&apos;s margin. Paint more
                  squares blocked around that obstacle.
                </>
              ),
            },
            {
              label: "Odd start",
              term: "A bad pose",
              body: (
                <>
                  The route begins somewhere the robot is not. The search trusts{" "}
                  <code>getPose()</code>, so fix odometry or vision before the
                  grid.
                </>
              ),
            },
          ]}
        />
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            In simulation, run the <code>Leave Start</code> auto so the robot
            ends on the near side of the hub.
          </li>
          <li>
            Switch to <strong>Teleop</strong>, enable, and hold A. Watch{" "}
            <code>Drivetrain/Pose</code> on the 2D field in AdvantageScope.
          </li>
          <li>Drive back with the sticks, hold A again, and let go halfway.</li>
        </ol>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              A route that passes beside the hub, never through it, and ends
              within a few centimeters of (7.5, 4.0), facing down the field.
            </li>
            <li>A stop at the goal that stays stopped while A is held.</li>
            <li>
              Letting go halfway hands the robot straight back to the sticks.
            </li>
          </ul>
        </Box>
        <DocumentationButton
          href="https://pathplanner.dev/pplib-pathfinding.html"
          title="PathPlanner: Pathfinding"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question: "What does an open square on the navigation grid mean?",
            options: [
              "The whole robot fits inside that square",
              "The center of the robot can pass through it without the bumpers hitting anything",
              "A camera has seen that square recently",
              "No robot has driven there yet this match",
            ],
            correctAnswer: 1,
            explanation:
              "The search plans for one point, the robot's center. The bumper is accounted for by blocking a margin around every obstacle, so the default grid blocks far more than the hub itself.",
          },
          {
            id: 2,
            question:
              "You let go of A halfway. What stops the robot from rolling on?",
            options: [
              "The pathfinding command sends zero speed when it is canceled",
              "The scheduler zeroes every motor a canceled command used",
              "Pathfinding.ensureInitialized resets the drivetrain",
              "The joystick default command takes the drivetrain back and sends the sticks",
            ],
            correctAnswer: 3,
            explanation:
              "A canceled pathfind sends nothing, and the last request stays latched. In teleop the drive default command claims the drivetrain the moment the pathfind lets go, so the sticks are in charge again.",
          },
          {
            id: 3,
            question:
              "Someone bumps the robot halfway along a found route. What happens?",
            options: [
              "The follower pulls it back toward the route",
              "AD* starts a fresh search from the new pose",
              "The command cancels and the sticks take over",
              "The robot stops and waits for the button again",
            ],
            correctAnswer: 0,
            explanation:
              "The search's start point is set once, when the command starts. Refined routes still begin there, so the follower pulls a bumped robot back, the same way it does on a drawn path.",
          },
          {
            id: 4,
            question:
              "You need the robot square to a scoring target within 2 cm. What is the better plan?",
            options: [
              "Pathfind straight to the target pose",
              "Shrink the grid squares until the route is precise enough",
              "Pathfind to a pose near the target, then finish with Drive to Point",
              "Raise the follower gains until it lands on the target",
            ],
            correctAnswer: 2,
            explanation:
              "Pathfinding is built to cross the field around obstacles, not to line up the last centimeters. Use it to get close, then hand the short move to a command built for precision.",
          },
        ]}
      />
    </PageTemplate>
  );
}
