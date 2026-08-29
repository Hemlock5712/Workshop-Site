import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

export default function DynamicPathPlanning() {
  return (
    <PageTemplate
      title="Dynamic Path Planning"
      lede="A preplanned path assumes a known start and a mostly known field. Dynamic planning starts from the current vision-corrected pose, finds a collision-free route to a target, and can replace that route when the field changes."
      needs={[
        <>Vision measurements accepted into drivetrain odometry.</>,
        <>A basic and profiled drive-to-point command that finish reliably.</>,
        <>The PathPlanner field model and navigation grid from Workshop 4.</>,
      ]}
      time="7 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "The planner chooses geometry around obstacles. The follower turns that geometry into motion. The pose estimator tells both where the robot really is.",
            "Replanning is a decision, not a reflex. A small pose correction should not throw away a good route; a blocked corridor or large deviation should.",
          ]}
          concept="Estimate, plan, follow, validate, and replan only when the current route is no longer safe or useful."
        />
        <MarginNote label="INTEGRATION BOUNDARY">
          PathPlanner documents its AD* pathfinder and dynamic-obstacle model,
          but its published Java command examples still target Commands v2. Keep
          the Commands v3 adapter isolated; do not mix v2 command types into
          this project.
        </MarginNote>
      </Split>

      <LessonSection id="five-parts" title="The five parts">
        <FigureGrid
          items={[
            {
              label: "1 · Estimate",
              term: "Current pose",
              body: "Swerve odometry supplies smooth motion; vision corrects drift. Reject stale or implausible measurements before planning.",
            },
            {
              label: "2 · Model",
              term: "Obstacles",
              body: "The navigation grid describes fixed blocked space. Runtime detections add temporary obstacle bounds.",
            },
            {
              label: "3 · Search",
              term: "Route",
              body: "The planner searches from the current translation to the goal and refines the path while keeping clear of blocked cells.",
            },
            {
              label: "4 · Follow",
              term: "Motion",
              body: "A profiled follower tracks the route within velocity and acceleration limits. Final heading can be handled separately from travel direction.",
            },
            {
              label: "5 · Validate",
              term: "Replan decision",
              body: "Watch route clearance, pose error, and target validity. Replace the route only when a defined condition crosses its threshold.",
            },
          ]}
        />
      </LessonSection>

      <LessonSection id="navigation-grid" title="The navigation grid">
        <p>
          The grid marks where the robot center may travel after accounting for
          the full bumper footprint. Inflate fixed obstacles by the robot&apos;s
          half-width plus a margin; otherwise a centerline that looks clear can
          still sweep a bumper through field structure.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Keep walls, stages, and protected structures in the static grid.
          </li>
          <li>
            Represent movable robots or game pieces as runtime obstacles only
            when the sensor can support that claim.
          </li>
          <li>
            Leave deliberate corridors wider than the robot&apos;s theoretical
            minimum.
          </li>
          <li>
            Version the grid with the field layout so an old obstacle map cannot
            silently ship.
          </li>
        </ul>
        <Box
          variant="alert-warning"
          tag="SAFETY"
          title="Unknown space is not automatically free space"
        >
          <p>
            A camera losing sight of an obstacle does not prove it disappeared.
            Give runtime obstacles a deliberate confidence and expiration
            policy, then slow or stop when the planner cannot establish a safe
            route.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="replan-policy" title="Write the replan policy">
        <p>
          Choose measurable triggers rather than &quot;replan whenever it looks
          wrong.&quot;
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="py-2 pr-4">Signal</th>
                <th className="py-2 pr-4">Replan when</th>
                <th className="py-2">Do not replan for</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">Route clearance</td>
                <td className="py-2 pr-4">
                  A trusted obstacle intersects the remaining corridor.
                </td>
                <td className="py-2">An obstacle behind the robot.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">Cross-track error</td>
                <td className="py-2 pr-4">
                  The robot remains outside a tolerance for a defined time.
                </td>
                <td className="py-2">One noisy pose sample.</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Goal</td>
                <td className="py-2 pr-4">
                  The requested target moves or becomes invalid.
                </td>
                <td className="py-2">
                  A new goal equal to the current goal within tolerance.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Box variant="concept" title="Add hysteresis and a short delay">
          <p>
            Use a stricter threshold to trigger replanning than to remain on the
            new route, and wait briefly before another replan. Without those two
            guards, noise can make the planner alternate between equally good
            routes every loop.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="final-approach" title="Travel, not alignment">
        <p>
          Global planning is good at finding a clear route across the field. It
          is not the best tool for the last few centimeters at a scoring
          station. Plan to a staging pose with clearance, then hand control to
          the profiled drive-to-point command for the final approach. That keeps
          obstacle avoidance and precision alignment independently testable.
        </p>
      </LessonSection>

      <LessonSection
        id="test-matrix"
        title="Test failures before testing speed"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <strong>Static route:</strong> start and goal with no runtime
            obstacles.
          </li>
          <li>
            <strong>Blocked corridor:</strong> add one obstacle and confirm the
            route clears the inflated boundary.
          </li>
          <li>
            <strong>Obstacle appears:</strong> introduce it after motion begins
            and verify one controlled replan.
          </li>
          <li>
            <strong>Obstacle disappears:</strong> verify the current safe route
            is not abandoned merely because a shorter one becomes available.
          </li>
          <li>
            <strong>Vision loss:</strong> confirm the system slows, stops, or
            continues under the written confidence policy.
          </li>
          <li>
            <strong>No route:</strong> verify the command finishes or fails
            safely instead of driving through blocked space.
          </li>
        </ol>
        <DocumentationButton
          href="https://pathplanner.dev/pplib-pathfinding.html"
          title="PathPlanner: Path finding and dynamic obstacles"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>
    </PageTemplate>
  );
}
