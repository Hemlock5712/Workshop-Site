import PageTemplate from "@/components/PageTemplate";
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
      title="Design the route on the field before writing the routine"
      emphasis="before writing the routine"
      lede="PathPlanner gives you a field editor for shaping reusable path segments, checking headings and constraints, and assembling an autonomous plan where the whole route is visible at once."
      needs={[
        <>A calibrated swerve drive with trustworthy odometry.</>,
        <>The robot project opened once in the PathPlanner desktop app.</>,
        <>
          The current season field image and the robot&apos;s measured
          dimensions.
        </>,
      ]}
      time="About 30 minutes"
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
              body: "One segment from a start to an end. Waypoints shape the curve; rotation targets control where a holonomic robot faces; constraints cap motion.",
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

      <LessonSection
        id="draw-one-path"
        title="Draw one path that is easy to test"
      >
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
            Add holonomic rotation targets only where the robot needs to change
            facing.
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

      <LessonSection
        id="events"
        title="Place events only after the drive is repeatable"
      >
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

      <LessonSection
        id="handoff"
        title="Hand the next lesson a readable route plan"
      >
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
    </PageTemplate>
  );
}
