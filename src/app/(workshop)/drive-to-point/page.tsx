import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import Link from "next/link";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/drive-to-point");

const linkStyle =
  "text-[var(--accent)] underline hover:no-underline font-medium";

/**
 * Rewritten November 2026, when the course moved all on-the-fly driving to
 * BLine. Written against Workshop-Code `swerve-drive-to-point` (8acefaf),
 * whose parent is `swerve-vision`, whose parent is `swerve-bline`.
 *
 * The old page built `DriveToPoint.java`, three hand-tuned PID controllers in
 * a `while (true)` loop, and `/advanced-drive-to-point` then replaced its
 * kP-times-error speed with a LinearPath profile. Both are gone. A one-waypoint
 * BLine path built in code gets the same controllers, speed limits, end
 * tolerances and stop-on-finish as every drawn path, so the method is one
 * expression and the lesson is about what a field pose means and why this one
 * must not flip. `/advanced-drive-to-point` 308s here.
 *
 * Verified in simulation, November 2026: from (0, 0, 0) to (3, 2, 180) in
 * 3.8 s, finished at (2.98, 2.00, 178.0), zero velocity one second later. A
 * code-built path needs no extra setup: it picks up BLine's defaults without
 * `config.json` being loaded first. Not verified on hardware.
 */
export default function DriveToPoint() {
  return (
    <PageTemplate
      title="Drive to Point"
      lede="Hold a button and the robot drives itself to one spot on the field, position and heading together. It is a BLine path with one waypoint, built in code at the moment you ask for it instead of drawn in the editor beforehand."
      needs={[
        <>
          <strong>BLine Paths</strong>, for the builder in{" "}
          <code>DriveMechanism</code>.
        </>,
        <>
          <strong>Vision</strong>. The robot drives to where its pose says the
          spot is, so the pose has to be right.
        </>,
        <>
          <code>whileTrue</code> from <strong>Writing Commands</strong>.
        </>,
      ]}
      branch="swerve-drive-to-point"
      time="8 minutes"
    >
      <LessonSection id="the-pose-you-are-driving-to" title="The target pose">
        <p>
          The target is a <code>Pose2d</code>, a field coordinate measured from
          the blue alliance corner, as in{" "}
          <Link href="/swerve-basics" className={linkStyle}>
            Swerve Basics
          </Link>
          . The robot only arrives where you meant if <code>getPose()</code>{" "}
          agrees with the field. Odometry alone drifts and starts wherever the
          code started. Vision pulls it back, so this lesson comes after Vision.
        </p>
      </LessonSection>

      <LessonSection id="one-waypoint" title="One waypoint, built in code">
        <p>
          A drawn path is a list of elements read from a file. The same list can
          be built in Java. Add <code>driveToPoint</code> to{" "}
          <code>DriveMechanism</code>, under <code>followPath</code>. One{" "}
          <code>Path.Waypoint</code> is the whole path: BLine starts from
          wherever the robot is when the command starts, and drives to the
          waypoint.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          highlightLines={[
            4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
          ]}
          code={`public class DriveMechanism implements Mechanism {
  // ... everything up to followPath, unchanged

  /**
   * Returns a command that drives straight to a spot on the field, from wherever the robot is when
   * it starts. It is a BLine path with one waypoint, built in code instead of drawn in the editor,
   * so it gets the same controllers, speed limits and end tolerances as every drawn path.
   *
   * <p>The command finishes when the robot is within the end tolerances in {@code config.json}, and
   * sends a zero when it finishes or is canceled.
   *
   * @param goal where to drive, in field coordinates from the blue alliance corner
   */
  public FollowPath driveToPoint(Pose2d goal) {
    return pathBuilder
        .build(new Path(new Path.Waypoint(goal)))
        // A field coordinate is the same spot on either alliance, so never turn it around.
        .withShouldFlip(() -> false);
  }

  // ... the rest, unchanged
}`}
        />

        <p>
          Everything the <code>pathBuilder</code> was given in{" "}
          <Link href="/bline#builder" className={linkStyle}>
            BLine Paths
          </Link>{" "}
          comes along: the three controllers, the speed limits in{" "}
          <code>config.json</code>, and the end tolerances. The command finishes
          once the robot is within 3 cm and 2° of the goal. It sends a zero
          velocity on the way out, finished or canceled.
        </p>
        <p>
          <code>withShouldFlip(() -&gt; false)</code> overrides the
          builder&apos;s default. Paths are drawn from the blue side, and on red
          BLine turns them around the field center. A field coordinate is a
          fixed spot. Flipping (3, 2) on red would send the robot to the far end
          of the field.
        </p>
      </LessonSection>

      <LessonSection id="bind-it" title="Bind it">
        <p>
          Hold <strong>A</strong> to drive to the field origin, and{" "}
          <strong>B</strong> to drive to (3 m, 2 m) facing 180°. Add the two
          imports and the two bindings to <code>TeleopOpMode</code>, under the
          left-bumper binding.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          highlightLines={[1, 2, 10, 11, 12]}
          code={`import org.wpilib.math.geometry.Pose2d;
import org.wpilib.math.geometry.Rotation2d;
// ... the other imports, unchanged

public class TeleopOpMode extends PeriodicOpMode {
  public TeleopOpMode(Robot robot) {
    // Left bumper: make the robot's current facing the new "forward".
    robot.driver.leftBumper().onTrue(robot.drivetrain.seedFieldCentric());

    // Hold A or B to drive straight to a fixed spot on the field. Let go to stop.
    robot.driver.a().whileTrue(robot.drivetrain.driveToPoint(Pose2d.ZERO));
    robot.driver.b().whileTrue(robot.drivetrain.driveToPoint(new Pose2d(3, 2, Rotation2d.PI)));
  }
}`}
        />

        <p>
          <code>whileTrue</code> cancels the command when the button is
          released, and BLine sends the zero on the way out. While it runs, the
          path command owns the drivetrain, so the joystick default waits. Once
          the robot arrives the command ends, and the sticks have the drivetrain
          back even if the button is still down.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Enable Teleop in{" "}
            <Link
              href="/swerve-drive-project#full-simulation"
              className={linkStyle}
            >
              full simulation
            </Link>
            , drive a few meters from where the robot started, and turn it. Hold{" "}
            <strong>A</strong>.
          </li>
          <li>
            Release <strong>A</strong> halfway through the trip with the sticks
            centered.
          </li>
          <li>
            Hold <strong>B</strong> until the robot stops, then switch to red
            and hold <strong>B</strong> again.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              On A, the robot drive back and turn to 0° at the same time, then
              stop on its own.
            </li>
            <li>On release, the robot stop where it is.</li>
            <li>
              On B, <code>Drivetrain/Pose</code> settle within 3 cm of (3, 2)
              and 2° of 180°, on both alliances.
            </li>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "How many waypoints does the path inside driveToPoint have, and where does the robot start from?",
            options: [
              "Two: the robot's pose at build time and the goal",
              "One, the goal. BLine starts from wherever the robot is when the command starts",
              "One, the goal, and the robot's pose is reset to the field origin first",
              "None. The goal is passed to the controllers directly",
            ],
            correctAnswer: 1,
            explanation:
              "The path is new Path(new Path.Waypoint(goal)). BLine drives from the robot's current pose to that waypoint. Nothing resets the pose: withPoseReset is never called, which is right, since the robot is not starting from a known spot.",
          },
          {
            id: 2,
            question:
              "Why does driveToPoint call withShouldFlip(() -> false) when followPath does not?",
            options: [
              "Flipping only works on paths read from a file",
              "A code-built path has no alliance, so flipping would throw",
              "Flipping costs a loop of latency that a short path cannot spare",
              "The goal is a fixed spot on the field, and flipping would mirror it to the other end on red",
            ],
            correctAnswer: 3,
            explanation:
              "The builder was made with withDefaultShouldFlip, which turns a path around the field center on red. That is right for a routine drawn from the blue side and wrong for a field coordinate, which names the same spot on both alliances.",
          },
          {
            id: 3,
            question:
              "The driver holds B. The robot arrives and the button is still down. Who has the drivetrain?",
            options: [
              "The path command, until the button is released",
              "Nobody, until the button is released",
              "The joystick default command, because the path command finished on arrival",
              "The path command, which restarts every loop while the button is held",
            ],
            correctAnswer: 2,
            explanation:
              "The command ends once the robot is inside the end tolerances. whileTrue does not restart a command that finished, so the default command gets the drivetrain back.",
          },
        ]}
      />
    </PageTemplate>
  );
}
