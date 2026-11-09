import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import ImageBlock from "@/components/ImageBlock";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
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
      <p>
        Hold <strong>A</strong> for the field origin. Hold <strong>B</strong>{" "}
        for (3 m, 2 m) facing 180°.
      </p>

      <LessonSection id="the-pose-you-are-driving-to" title="The target pose">
        <p>
          A <code>Pose2d</code> bundles three numbers: X in meters, Y in meters,
          and a <code>Rotation2d</code> heading. The robot&apos;s current
          position and the place you are sending it are both written this way.
          0° points down the field.
        </p>

        <ImageBlock
          src="/images/drive-to-point-field.png"
          alt="Field coordinates: X down the length of the field, Y across it to the left"
          width={1024}
          height={469}
          caption="The origin is the blue alliance corner for both alliances. It never flips."
        />

        <p>
          The target is a field coordinate, so the robot only arrives where you
          meant if <code>getPose()</code> agrees with the field. Odometry alone
          drifts and starts wherever the code started. Vision pulls it back, so
          this lesson comes after Vision.
        </p>
      </LessonSection>

      <LessonSection id="one-waypoint" title="One waypoint, built in code">
        <p>
          A drawn path is a list of elements read from a file. The same list can
          be built in Java. One <code>Path.Waypoint</code> is the whole path:
          BLine starts from wherever the robot is when the command starts, and
          drives to the waypoint.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          title="driveToPoint, under followPath"
          code={`/**
 * Returns a command that drives straight to a spot on the field, from wherever the robot is when
 * it starts. It is a BLine path with one waypoint, built in code instead of drawn in the editor,
 * so it gets the same controllers, speed limits and end tolerances as every drawn path.
 *
 * @param goal where to drive, in field coordinates from the blue alliance corner
 */
public FollowPath driveToPoint(Pose2d goal) {
  return pathBuilder
      .build(new Path(new Path.Waypoint(goal)))
      // A field coordinate is the same spot on either alliance, so never turn it around.
      .withShouldFlip(() -> false);
}`}
        />

        <Split>
          <ProseBlock>
            <p>
              Everything the <code>pathBuilder</code> was given in{" "}
              <Link href="/bline#builder" className={linkStyle}>
                BLine Paths
              </Link>{" "}
              comes along: the three controllers, the speed limits in{" "}
              <code>config.json</code>, and the end tolerances. The command
              finishes once the robot is within 3 cm and 2° of the goal. It
              sends a zero velocity on the way out, finished or canceled.
            </p>
            <p>
              <code>withShouldFlip(() -&gt; false)</code> overrides the
              builder&apos;s default. Paths are drawn from the blue side. On
              red, BLine turns them around the field center so the same routine
              runs from the other end. A field coordinate is a fixed spot.
              Flipping (3, 2) on red would send the robot to the far end of the
              field.
            </p>
          </ProseBlock>
          <MarginNote label="It finishes">
            Because it ends on arrival, the command can go inside an autonomous
            routine as one more <code>coroutine.await(...)</code> line, the same
            as a drawn path.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="bind-it" title="Bind it">
        <p>
          Two bindings go in the <code>TeleopOpMode</code> constructor, under
          the left-bumper binding already there.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          title="Two imports and two bindings"
          code={`import org.wpilib.math.geometry.Pose2d;
import org.wpilib.math.geometry.Rotation2d;

// ... inside the constructor, after the seedFieldCentric binding:

    // Hold A or B to drive straight to a fixed spot on the field. Let go to stop.
    driver.a().whileTrue(drivetrain.driveToPoint(Pose2d.ZERO));
    driver.b().whileTrue(drivetrain.driveToPoint(new Pose2d(3, 2, Rotation2d.PI)));`}
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
              The robot drive back and turn to 0° at the same time, then stop on
              its own.
            </li>
            <li>
              A release stop it where it is, not coast on at its last speed.
            </li>
            <li>
              <code>Drivetrain/Pose</code> settle within 3 cm of (3, 2) and 2°
              of 180°, on both alliances.
            </li>
          </ul>
        </Box>

        <p>
          <strong>It drives off confidently in the wrong direction.</strong>{" "}
          Suspect the pose, not the gains. The robot is driving correctly toward
          where it believes the target is, so graph <code>Drivetrain/Pose</code>{" "}
          before touching a number.
        </p>

        <p>
          <strong>On red it heads for the other end of the field.</strong> The{" "}
          <code>withShouldFlip(() -&gt; false)</code> line is missing, so the
          builder&apos;s default flipped the goal.
        </p>

        <p>
          <strong>It stops short and the command never ends.</strong> The
          controllers cannot push the last few centimeters past friction. Raise
          the translation and heading gains in the builder, the same fix as a
          drawn path that stalls.
        </p>
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
          {
            id: 4,
            question:
              "In simulation the robot stops 5 cm short of the goal and the command never ends. What is the first fix?",
            options: [
              "Raise the translation and heading gains in the path builder",
              "Add a second waypoint 5 cm past the goal",
              "Switch the request to OpenLoopVoltage",
              "Loosen the end tolerances until it finishes",
            ],
            correctAnswer: 0,
            explanation:
              "The controllers ask for a speed proportional to the error, and near the goal that speed is too small to move the wheels. Raising the gains is the same fix BLine Paths gives for a drawn path that stalls. Loosening the tolerance hides the miss instead of fixing it.",
          },
        ]}
      />
    </PageTemplate>
  );
}
