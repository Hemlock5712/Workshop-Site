import PageTemplate from "@/components/PageTemplate";
import Quiz from "@/components/Quiz";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

export default function PathPlannerLesson() {
  return (
    <PageTemplate
      title="PathPlanner Paths and Autos"
      lede="PathPlanner is a field editor for shaping reusable path segments and assembling them into an autonomous plan. This lesson covers the robot configuration the editor needs, one drawn path, and event markers. The routine itself belongs to the next lesson."
      needs={[
        <>A calibrated swerve drive with trustworthy odometry.</>,
        <>The robot project opened once in the PathPlanner desktop app.</>,
        <>
          The current season field image and the robot&apos;s measured
          dimensions.
        </>,
      ]}
      time="9 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "A path is one continuous drive segment. An auto is an ordered routine that can combine paths, waits, and mechanism events.",
            "For a holonomic drivetrain, direction of travel and robot rotation are separate. The robot can follow a curve while facing a game piece or scoring target.",
          ]}
          concept="Plan geometry in the field editor. Keep robot behavior in commands. Connect the two only at deliberate event points."
        />
        <MarginNote label="THIS LESSON">
          The goal here is route design and file vocabulary. The next lesson
          owns the Commands v3 Autonomous OpMode that runs a routine.
        </MarginNote>
      </Split>

      <Box
        variant="alert-warning"
        tag="2027 ALPHA"
        title="Do not paste the current RobotContainer examples"
      >
        <p>
          PathPlanner&apos;s published Java integration examples target the
          classic Commands v2 stack and use <code>edu.wpi.first</code>,
          <code>RobotContainer</code>, and <code>frc2.Command</code>-style
          assumptions. This workshop uses Commands v3, OpModes, and
          <code>org.wpilib</code>. Use the editor in this lesson, but do not add
          v2 integration code to the 2027 project. The autonomous lesson builds
          its routine from the v3 commands already supplied by the workshop.
        </p>
      </Box>

      <LessonSection id="path-and-auto" title="Separate a path from an auto">
        <FigureGrid
          cols={2}
          items={[
            {
              label: "Reusable movement",
              term: "Path",
              body: "One segment from a start to an end. Waypoints shape the curve; the goal end rotation and rotation targets control where a holonomic robot faces; constraints cap motion.",
            },
            {
              label: "Complete routine",
              term: "Auto",
              body: "An ordered plan made from paths and actions. The same path can appear in several autos without being redrawn.",
            },
          ]}
        />
        <p>
          Draw separate paths for actions you may reuse: leave the starting
          area, reach a pickup, return to score. A single path with many
          unrelated responsibilities is harder to tune and harder to replace.
        </p>
      </LessonSection>

      <LessonSection
        id="configure-project"
        title="Configure the editor from measurements"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open the root of the robot project, not the <code>src</code> folder.
          </li>
          <li>Select the current field and enable holonomic mode.</li>
          <li>
            Enter robot mass, moment of inertia, wheel radius, drive gearing,
            current limit, and module positions from the calibrated drivetrain.
          </li>
          <li>
            Enter conservative default velocity, acceleration, angular velocity,
            and angular acceleration constraints.
          </li>
          <li>
            Set the robot footprint so the preview shows whether bumpers clear
            field obstacles.
          </li>
        </ol>
        <Box
          variant="concept"
          title="The editor cannot correct a bad measurement"
        >
          <p>
            A path preview is only as honest as the robot configuration. Wheel
            radius and module position came from Swerve Calibration; do not tune
            the drawn curve to compensate for odometry that is still wrong.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="draw-one-path" title="Draw one testable path">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Place the first waypoint at the robot&apos;s known starting pose.
          </li>
          <li>
            Place the final waypoint in open field space, not at a scoring
            target yet.
          </li>
          <li>
            Adjust control handles so the curve is smooth and does not skim an
            obstacle.
          </li>
          <li>
            Set the goal end rotation, then add rotation targets only where the
            robot needs to turn along the way.
          </li>
          <li>
            Apply slower constraints near tight geometry instead of slowing the
            entire route.
          </li>
          <li>
            Name the segment for its job, such as <code>Leave Start Left</code>,
            and save it.
          </li>
        </ol>
        <Box
          variant="alert-warning"
          tag="FOOTPRINT"
          title="The center point is not the whole robot"
        >
          <p>
            A curve can clear an obstacle while the bumper clips it. Inspect the
            full robot preview through turns, especially where rotation and
            translation happen together.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="events" title="Add events one at a time">
        <p>
          Event markers connect route progress to robot commands. Name the event
          after an action such as <code>Start Intake</code>, not after a button
          or motor voltage. First test the path with no events. Then add one
          event at a time so a mechanism problem cannot masquerade as a
          path-following problem.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>Use position-based events for actions tied to a location.</li>
          <li>
            Use waits for intentional time, not to hide a command with no finish
            condition.
          </li>
          <li>
            Keep final alignment as its own short segment when precision
            matters.
          </li>
          <li>
            Give every event command a name that matches the editor exactly.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="handoff" title="Hand off the route plan">
        <p>
          Finish with one tested-looking path segment, a written starting pose,
          the end pose, constraints, and a short list of intended events. The
          Autonomous lesson will turn that plan into an <code>@Autonomous</code>
          OpMode and v3 commands without depending on concepts from Workshops 4
          or 5.
        </p>
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
            question: "What separates a path from an auto?",
            options: [
              "A path is one continuous drive segment; an auto is an ordered routine built from paths and actions",
              "A path is the blue alliance route; an auto is its red alliance mirror",
              "A path belongs to one auto, so a second auto needs its own copy of it",
              "A path is an auto that has already been tested on the field",
            ],
            correctAnswer: 0,
            explanation:
              "One path is one trip, from a start pose to an end pose. An auto orders paths, waits, and events into a routine. Because the editor saves them as separate files, the same segment can appear in several autos without being redrawn.",
          },
          {
            id: 2,
            question:
              "On a holonomic path, what sets the direction the robot faces?",
            options: [
              "The waypoints, because the robot always faces along the curve",
              "The goal end rotation and the rotation targets, both separate from the waypoints",
              "The order the waypoints were placed in",
              "The angular velocity constraint",
            ],
            correctAnswer: 1,
            explanation:
              "Waypoints and their control handles shape where the robot goes. Facing is set apart from them. The goal end rotation fixes where the robot looks at the finish, and a rotation target turns it anywhere along the way. Angular constraints cap how fast it turns, never where it ends up.",
          },
          {
            id: 3,
            question:
              "Where do the mass, wheel radius, and module positions in the editor come from?",
            options: [
              "The editor measures them from the field image once you pick the season",
              "Defaults are fine, since the numbers only affect the preview drawing",
              "Measured values from the calibrated drivetrain, typed into the editor settings",
              "Whichever numbers make the preview match the curve you drew",
            ],
            correctAnswer: 2,
            explanation:
              "Mass, moment of inertia, wheel radius, gearing, current limit, and module positions all describe the real robot. The editor cannot discover any of them. Wheel radius came out of Swerve Calibration, and module positions match the ones the drive code already uses. Those numbers shape the motion the robot is asked to produce, so a default carries onto the field.",
          },
          {
            id: 4,
            question:
              "The drawn curve clears an obstacle. What can still hit it?",
            options: [
              "Nothing, as long as the curve itself is clear",
              "The wheels, since module positions are left out of the preview",
              "Nothing, because the editor refuses to save a path whose preview clips a wall",
              "The bumpers, because the curve tracks the robot center and not its outline",
            ],
            correctAnswer: 3,
            explanation:
              "The curve is the path of one point, the center of the robot. Set the bumper footprint and watch the whole outline through the preview. A corner sweeps wide where rotation and translation happen together, so a clear-looking line can still clip a wall. The editor checks nothing for you, and it saves the path either way.",
          },
          {
            id: 5,
            question:
              "You have drawn a new path. When do the event markers go on?",
            options: [
              "Before the first test, so the path and the mechanisms get tested together",
              "After the path drives repeatably, one event at a time",
              "Never on a path; markers belong to the auto instead",
              "Last, once the whole routine is competition ready",
            ],
            correctAnswer: 1,
            explanation:
              "Test the path with nothing on it first, then add one event at a time. An intake that misbehaves looks exactly like a path-following problem. Debug them together and you will redraw a curve that was never wrong. Markers ride on the path itself, so they follow that segment into every auto that uses it.",
          },
          {
            id: 6,
            question: "How should an event marker be named?",
            options: [
              "After the action it starts, spelled the same as the command it runs",
              "After the button a driver would press to do it by hand",
              "After the motor output it applies, such as forty percent",
              "After the path it sits on, so markers sort by path",
            ],
            correctAnswer: 0,
            explanation:
              "The name you type in the editor is the string the robot code looks up, so the two have to be spelled identically. Rename one side and the marker fires nothing while the path drives on. Start Intake still describes the action next season. A button or a voltage describes the wiring you happen to have today.",
          },
        ]}
      />
    </PageTemplate>
  );
}
