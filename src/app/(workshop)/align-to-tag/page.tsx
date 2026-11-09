import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import Link from "next/link";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/align-to-tag");

const linkStyle =
  "text-[var(--accent)] underline hover:no-underline font-medium";

/**
 * Added November 2026, on the owner's call, and written against Workshop-Code
 * `swerve-align-to-tag` (b5651d8), whose parent is `swerve-drive-to-point`.
 *
 * This is not the retired `/drive-to-tag-inline`. That page drove a loop of
 * its own straight off camera-space numbers, with no plan for losing the tag.
 * This one is the Drive to Point call with a different pose supplier: Vision
 * places each tag in the drivetrain's pose frame once per frame, the wheels
 * carry the robot between frames and after the tag leaves view, and BLine
 * drives in the tag's frame. The spot is recorded off telemetry with the robot
 * parked by hand, never measured, so camera-mount and tag-mount error cancel.
 *
 * API read off the alpha-7 jar: `FiducialTarget.getRobotPose_TargetSpace()`
 * copies the raw array into a `Pose3d` with no axis change, so `toTagFrame`
 * does the conversion. Phoenix's `samplePoseAt` takes the same clock as
 * `addVisionMeasurement`, so it gets the same `estimate.timestampSeconds`.
 *
 * Verified in simulation with a synthesized sighting, November 2026: tag 7 at
 * field (5, 3) facing -X, spot (1, 0, 180) reached at (3.98, 2.98, 0.0) in
 * 3.4 s, the same with sightings cut off one second into the drive, and an
 * immediate end with no motion when the tag was never seen.
 *
 * NOT verified: the Limelight target-space signs inside `toTagFrame`. The sim
 * check builds its sighting with the inverse of the same function, so it
 * cannot catch a wrong sign. The first check on this page is that test, on a
 * real camera, and it has to pass before the robot is allowed to drive.
 */
export default function AlignToTag() {
  return (
    <PageTemplate
      title="Align to Tag"
      lede="Hold a button and the robot lines up on a spot measured from one AprilTag. It never asks where it is on the field, so a wrong field pose cannot move the spot. You record the spot on each field before the event."
      needs={[
        <>
          <strong>Drive to Point</strong>. This lesson is the same call with a
          different pose.
        </>,
        <>
          <strong>Vision</strong>, working on the real robot. There is no camera
          in the simulator.
        </>,
        <>
          An AprilTag on a wall at scoring height, and room to drive two meters
          out from it.
        </>,
      ]}
      branch="swerve-align-to-tag"
      time="14 minutes"
    >
      <p>
        Drive to Point arrives where the field pose says the spot is. If the
        pose is off by 10 cm, so is the robot. Scoring usually happens in front
        of one tag, and the camera can see that tag the whole way in. Measure
        the spot from that tag and the field pose drops out of the problem.
      </p>

      <LessonSection id="the-tags-frame" title="The tag's frame">
        <p>
          A pose measured from a tag uses the tag&apos;s own axes. X points
          straight out of its face and Y to the tag&apos;s left. The heading is
          180° when the robot squarely faces the tag. A spot 1 m out, centered,
          facing the tag is <code>new Pose2d(1.0, 0.0, Rotation2d.PI)</code>.
        </p>

        <p>
          The Limelight reports the same thing in its own convention, called
          target space. X points right as you face the tag, Y down, and Z into
          the wall. <code>toTagFrame</code> turns one into the other.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Vision.java"
          title="toTagFrame"
          code={`private static Pose2d toTagFrame(Pose3d robotInTargetSpace) {
  return new Pose2d(
      -robotInTargetSpace.getZ(),
      robotInTargetSpace.getX(),
      // Turning about the downward Y axis is turning clockwise seen from above.
      Rotation2d.PI.minus(new Rotation2d(robotInTargetSpace.getRotation().getY())));
}`}
        />

        <Box
          variant="alert-danger"
          tag="DANGER · SIGNS"
          title="Test this first"
        >
          <p>
            A wrong sign here sends the robot the wrong way at full speed. Run
            the first check below with the robot on blocks or disabled before
            anything drives.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="remember-the-tag" title="The tag map">
        <Split>
          <ProseBlock>
            <p>
              The camera answers a few dozen times a second and late, and it
              loses the tag when the robot gets close. The wheels answer every
              loop. So each sighting puts the tag down once, in the same frame
              as <code>drivetrain.getPose()</code>. Between sightings the wheels
              say where the robot is from that spot.
            </p>
            <p>
              <code>samplePoseAt</code> looks up where the robot was when the
              picture was taken. Adding the tag&apos;s offset from the robot to
              that pose places the tag. The call goes before the trust gates in{" "}
              <code>addFrame</code>, because one close tag is exactly the
              sighting those gates throw out.
            </p>
          </ProseBlock>
          <MarginNote label="Why it does not drift">
            Every new frame places the tag again, so drift only builds up
            between frames, or after the tag leaves view. Over the last meter or
            two that is a few millimeters.
          </MarginNote>
        </Split>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Vision.java"
          title="The tag map, rememberTags and robotInTag"
          code={`// Where each tag sat in the drivetrain's pose frame the last time a camera saw it, by tag ID.
private final Map<Integer, Pose2d> tagPoses = new HashMap<>();

private void rememberTags(LimelightResults frame, double timestampSeconds) {
  Optional<Pose2d> poseThen = drivetrain.samplePoseAt(timestampSeconds);
  if (poseThen.isEmpty()) {
    return;
  }
  for (FiducialTarget tag : frame.fiducialTargets) {
    Pose2d robotInTag = toTagFrame(tag.getRobotPose_TargetSpace());
    // The tag's own origin, seen from the robot, added to where the robot was.
    Pose2d tagPose = poseThen.get().plus(new Transform2d(robotInTag, Pose2d.ZERO));
    tagPoses.put(tag.fiducialId, tagPose);
    Telemetry.getTable("Vision").log("RobotInTag" + tag.fiducialId, robotInTag);
  }
}

public Optional<Pose2d> robotInTag(int tagId) {
  Pose2d tagPose = tagPoses.get(tagId);
  if (tagPose == null) {
    return Optional.empty();
  }
  return Optional.of(drivetrain.getPose().relativeTo(tagPose));
}`}
        />

        <p>
          The first line of <code>addFrame</code> gets the call, right after the
          MegaTag1 estimate:{" "}
          <code>rememberTags(frame, estimate.timestampSeconds);</code>.{" "}
          <code>DriveMechanism</code> gets a one-line <code>samplePoseAt</code>{" "}
          that passes the call to the drivetrain.
        </p>
      </LessonSection>

      <LessonSection
        id="drive-in-the-tags-frame"
        title="Drive in the tag's frame"
      >
        <p>
          BLine follows whatever pose it is handed. Give it a builder whose pose
          comes from <code>vision.robotInTag(tagId)</code> and it drives in the
          tag&apos;s frame, with the same one-waypoint path as Drive to Point.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          title="alignToTag, under driveToPoint"
          code={`public Command alignToTag(Vision vision, int tagId, Pose2d spotInTag) {
  FollowPath align =
      new FollowPath.Builder(
              DriveType.SWERVE,
              this,
              () -> vision.robotInTag(tagId).orElseThrow(), // where the robot is, from the tag
              pose -> {}, // never reset odometry from a tag-relative pose
              () -> getRobotVelocity(),
              velocities -> driveRobotRelative(velocities),
              new PIDController(2.0, 0.0, 0.0),
              new PIDController(3.0, 0.0, 0.0),
              new PIDController(0.2, 0.0, 0.0))
          // The tag's frame has no alliance side, so there is nothing to turn around.
          .withShouldFlip(() -> false)
          .build(new Path(new Path.Waypoint(spotInTag)));

  return Command.noRequirements(
          coroutine -> {
            if (vision.robotInTag(tagId).isEmpty()) {
              DataLogManager.log("AlignToTag: tag " + tagId + " not seen yet");
              return;
            }
            coroutine.await(align);
          })
      .named("AlignToTag");
}`}
        />

        <p>
          The pose reset does nothing, because a pose measured from a tag is not
          a field pose. If no camera has seen the tag, the check before the{" "}
          <code>await</code> ends the command at once. The robot never drives on
          an empty answer. The gains are the ones from{" "}
          <Link href="/bline#builder" className={linkStyle}>
            BLine Paths
          </Link>
          .
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          title="The binding, under the Drive to Point bindings"
          code={`    // Hold X to line up 1 m straight out from tag 7, facing it.
    driver
        .x()
        .whileTrue(drivetrain.alignToTag(robot.vision, 7, new Pose2d(1.0, 0.0, Rotation2d.PI)));`}
        />
      </LessonSection>

      <LessonSection id="record-your-spot" title="Record your spot">
        <p>
          Do not measure the spot with a tape. Record it with the camera that
          will drive to it, and its mounting error goes into the number and back
          out again.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Disable the robot and push it by hand to exactly where it should
            score, with the camera on the tag.
          </li>
          <li>
            Read <code>Vision/RobotInTag7</code> in AdvantageScope or Elastic:
            X, Y and the heading in degrees.
          </li>
          <li>
            Type them into the binding, converting the heading with{" "}
            <code>Rotation2d.fromDegrees(...)</code>, and deploy.
          </li>
        </ol>

        <p>
          Record it again on the competition field at the event, before the
          first match. Field crews mount tags by hand, so no two fields match to
          the centimeter. A spot recorded on that field is right on that field.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Disabled, push the robot square to tag 7, about 1.5 m out, and read{" "}
            <code>Vision/RobotInTag7</code>. Push it toward its own right, then
            turn it a little to the left.
          </li>
          <li>
            Park the robot 2 to 3 m from the tag at an angle. Enable Teleop and
            hold <strong>X</strong>.
          </li>
          <li>
            Cover the camera, push the robot a meter sideways so the field pose
            is wrong, uncover it, and hold <strong>X</strong> again.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              About (1.5, 0, 180°) square on. Y growing as the robot moves to
              its right, and the heading wrapping from 180° to about −175° as it
              turns left.
            </li>
            <li>
              The robot drive to 1 m out and turn to face the tag, then stop on
              its own.
            </li>
            <li>
              The same stopping spot the second time, wrong field pose or not.
            </li>
          </ul>
        </Box>

        <p>
          <strong>The command ends at once and nothing moves.</strong> No camera
          has seen that tag ID. Check the number on the tag and that{" "}
          <code>Vision/RobotInTag7</code> is updating.
        </p>

        <p>
          <strong>The first check reads the wrong way.</strong> A Y that shrinks
          as the robot moves right, or a heading that grows as it turns right,
          is a sign flipped in <code>toTagFrame</code>. Fix it there and run the
          first check again. Do not drive on it.
        </p>

        <p>
          <strong>
            It stops a few centimeters off, the same way every time.
          </strong>{" "}
          The spot is off, not the code. Record it again with the robot parked
          where you want it.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "The field pose is 20 cm wrong when the driver holds X. Where does the robot stop?",
            options: [
              "20 cm from the spot, the same as Drive to Point",
              "On the spot. Every sighting places the tag again from the camera, so the field pose error cancels",
              "Nowhere. The command ends because the pose is untrusted",
              "On the spot, but only if the error is in X and not Y",
            ],
            correctAnswer: 1,
            explanation:
              "Vision places the tag by adding the camera's tag offset to the drivetrain's pose, and the robot's distance from the tag is the drivetrain's pose minus that placement. A shared 20 cm error appears in both and subtracts out.",
          },
          {
            id: 2,
            question:
              "The camera loses the tag 40 cm from the spot. What happens?",
            options: [
              "The command ends and the robot stops short",
              "The robot stops and waits for the tag to come back",
              "The robot drives on toward the field origin",
              "The robot finishes on the wheels, measured from the last place the tag was put down",
            ],
            correctAnswer: 3,
            explanation:
              "robotInTag keeps answering from drivetrain.getPose() against the stored tag pose. Odometry over the last 40 cm drifts by millimeters.",
          },
          {
            id: 3,
            question: "How should a team get the numbers for spotInTag?",
            options: [
              "Measure from the tag with a tape and convert to meters",
              "Copy them from the field drawing's tag layout",
              "Park the robot by hand where it should score and read Vision/RobotInTag on that field",
              "Drive to the spot with Drive to Point and read Drivetrain/Pose",
            ],
            correctAnswer: 2,
            explanation:
              "Recording with the same camera puts the camera's own mounting error into the spot, where it cancels when the robot drives back. Recording on the event's field takes that field's tag mounting with it.",
          },
          {
            id: 4,
            question:
              "Why does rememberTags run before the trust gates in addFrame?",
            options: [
              "One close tag is the sighting the pose estimator gates throw out, and it is exactly the one alignment needs",
              "The gates need the tag map to decide",
              "It runs faster before the gates",
              "The gates change the frame's timestamp",
            ],
            correctAnswer: 0,
            explanation:
              "The gates protect the field pose from shaky single-tag solves. Alignment never touches the field pose, and the tag it is lining up on is often the only one in view.",
          },
          {
            id: 5,
            question:
              "In the first check, Y shrinks as the robot is pushed toward its own right. What does that mean?",
            options: [
              "The camera is mounted upside down, so flip it in the web interface",
              "Nothing. Y depends on which side of the tag the robot started",
              "The spot was recorded on a different field",
              "A sign in toTagFrame is flipped, and the robot must not drive until it is fixed",
            ],
            correctAnswer: 3,
            explanation:
              "Facing the tag, the robot's right is the tag's left, which is plus Y. A shrinking Y means the conversion mirrors the frame, and BLine would steer the wrong way.",
          },
        ]}
      />
    </PageTemplate>
  );
}
