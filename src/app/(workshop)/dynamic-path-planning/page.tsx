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
 * `swerve-pathplanner`. It reuses `followPath` from /pathplanner and adds
 * `pathfindTo`, which drives PathPlannerLib's `Pathfinding` (LocalADStar) from
 * a Commands v3 coroutine.
 *
 * The route is planned once. PathPlannerLib replans inside its own
 * PathfindingCommand, which is built on the other command framework, so this
 * page does not teach replanning. The replan-policy table that used to be
 * here described code nobody could run.
 */
export default function DynamicPathPlanning() {
  return (
    <PageTemplate
      title="Pathfinding"
      lede="A drawn path starts where you drew it. Pathfinding starts wherever the robot is and searches a grid of the field for a way around the obstacles. The route goes to the same follower."
      needs={[
        <>
          <code>followPath</code> and the Follow Path auto from{" "}
          <strong>PathPlanner</strong>, working in simulation.
        </>,
        <>A pose you trust, from odometry or from vision.</>,
      ]}
      branch="swerve-pathfinding"
      time="15 minutes"
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

      <LessonSection id="find-a-route" title="Find a route, then follow it">
        <p>
          The search, AD*, runs on its own thread from the moment the robot
          program starts. A command hands it a start and a goal, waits for a
          route, and drives it with <code>followPath</code>.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          title="pathfindTo: plan once, then follow"
          code={`public Command pathfindTo(Pose2d goal) {
  return run(coroutine -> {
        Pathfinding.setStartPosition(getPose().getTranslation());
        Pathfinding.setGoalPosition(goal.getTranslation());

        if (coroutine
            .waitUntil(() -> Pathfinding.isNewPathAvailable(), Seconds.of(1.0))
            .timedOut()) {
          stopDriving();
          return;
        }

        PathPlannerPath route =
            Pathfinding.getCurrentPath(
                pathfindConstraints, new GoalEndState(0.0, goal.getRotation()));
        if (route == null) {
          stopDriving(); // the search found no route
          return;
        }

        coroutine.await(followPath(route));
      })
      .whenCanceled(() -> stopDriving())
      .named("PathfindTo");
}`}
        />
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              Every way out of this command sends zero speed first. A search
              that never answers and a search that answers with nothing both end
              the command. Stopping before the <code>return</code> means a robot
              that was moving does not keep its last request.
            </p>
            <p>
              <code>Pathfinding.ensureInitialized()</code> goes in the{" "}
              <code>DriveMechanism</code> constructor. It loads the grid and
              starts the search thread at boot, so the first button press does
              not pay for it.
            </p>
          </div>
          <MarginNote label="Planned once">
            The route is fixed when the command starts. A robot pushed off it is
            pulled back by the follower, not rerouted. Rerouting lives in
            PathPlannerLib&apos;s own pathfinding command, which this project
            cannot run.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="bind-it" title="Bind it to a button">
        <p>
          Hold A in teleop and the robot drives itself to the middle of the
          neutral zone, around the hub. Let go and the command is canceled,{" "}
          <code>whenCanceled</code> sends the zero, and the joystick default
          takes the drivetrain back.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          title="Hold A to pathfind"
          code={`driver.a().whileTrue(drivetrain.pathfindTo(new Pose2d(7.5, 4.0, Rotation2d.ZERO)));`}
        />
        <p>
          The goal is blue-origin, like every pose on this robot. Pathfinding is
          good at crossing the field and poor at the last few centimeters,
          because it picks its own heading on the way in. Send it to a pose near
          the target, then finish with <strong>Drive to Point</strong>.
        </p>
      </LessonSection>

      <LessonSection id="failure-shapes" title="Three failure shapes">
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Nothing moves",
              term: "No route",
              body: (
                <>
                  The wait timed out or the route came back empty. A goal deep
                  inside a blocked area, or a grid painted solid by mistake.
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
            In simulation, run the <strong>Follow Path</strong> auto so the
            robot ends where your path does, on the near side of the hub.
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
              Letting go halfway stops the robot at once, and the sticks drive
              it again.
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
              "pathfindTo times out waiting for a route. Why does it call stopDriving() before return?",
            options: [
              "The scheduler requires a request before a command can end",
              "return cancels the command, which then sends its own zero",
              "Pathfinding needs a stopped robot to search again",
              "The robot may still be moving, and its last request stays latched after the command ends",
            ],
            correctAnswer: 3,
            explanation:
              "Ending a command sends nothing to the motors. If the drivetrain was moving when the command took it, that speed stays applied. Stopping first is the rule for every way out of a routine.",
          },
          {
            id: 3,
            question:
              "Someone bumps the robot halfway along a found route. What happens?",
            options: [
              "The follower pulls it back toward the same route, because the route was planned once",
              "AD* plans a new route from the new pose",
              "The command cancels and the sticks take over",
              "The robot stops and waits for the button again",
            ],
            correctAnswer: 0,
            explanation:
              "pathfindTo asks for one route when it starts and then hands it to followPath. The follower corrects toward that plan. Rerouting mid-drive is something this command does not do.",
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
              "Pathfinding chooses its own heading on the way in, so it is weak at the final line-up. Use it to cross the field, then hand the last short move to a command built for precision.",
          },
        ]}
      />
    </PageTemplate>
  );
}
