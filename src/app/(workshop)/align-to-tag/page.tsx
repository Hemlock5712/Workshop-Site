import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import Link from "next/link";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/align-to-tag");

const linkStyle =
  "text-[var(--accent)] underline hover:no-underline font-medium";

/**
 * Added November 2026, on the owner's call, and written against Workshop-Code
 * `swerve-align-to-tag`, whose parent is `swerve-vision`.
 *
 * This is not the retired `/drive-to-tag-inline`. That page drove a loop of
 * its own straight off camera-space numbers, with no plan for losing the tag.
 * This one is the Drive to Point call with a different pose supplier. The spot
 * is recorded off telemetry with the robot parked by hand, never measured, so
 * camera-mount and tag-mount error cancel.
 *
 * API read off the alpha-7 jar: `FiducialTarget.getRobotPose_TargetSpace()`
 * copies the raw array into a `Pose3d` with no axis change, so `toTagFrame`
 * does the conversion.
 *
 * NOT verified: the Limelight target-space signs inside `toTagFrame`. The sim
 * check builds its sighting in the tag's frame directly, so it cannot catch a
 * wrong sign. Limelight's coordinate-systems page says target-space Z points
 * OUT of the target, where this code assumes into the wall; the page's first
 * check is that test, on a real camera, and it has to pass before the robot is
 * allowed to drive.
 *
 * Owner's review, November 2026 (Recording 13), and his two follow-ups the
 * same day: simplified, but a lost tag must not brake the robot. `Vision`
 * keeps the newest `Sighting` of each tag: where the tag put the robot, and
 * where the wheels said the robot was when the picture was taken
 * (`samplePoseAt` on the frame's timestamp). `robotInTag` is that sighting
 * plus how far the wheels have moved since, which is the same math as
 * re-computing the target in the drivetrain's frame on every sighting and
 * driving to the last one. There is no time limit on a sighting, so a tag
 * seen long ago still answers. The pose supplier falls back to the spot itself
 * only when the tag was never seen. Sim, same month, with sightings written
 * straight into `Vision` at 10 Hz: tag at field (5, 3) facing -X, spot
 * (1, 0, 180) reached at (3.99, 2.99, 0) with a 0.4 s blackout mid-drive and
 * again with sightings cut off for good 1.5 s in, the speed never dipping; no
 * motion when the tag was never seen. That harness skips `samplePoseAt`, so
 * the real camera path is compiled and not yet run. The spot is still read off
 * `Vision/RobotInTag<id>` rather than the Limelight web page: the web page
 * shows Limelight's own axes, and the logged value is the exact number the
 * path drives on.
 *
 * Known limit, raised in review of PR 151: `getPose()` is the fused pose, so a
 * vision correction applied after a sighting reads as wheel motion until the
 * next sighting replaces it. While the tag is in view that is at most one
 * frame's correction. Anchoring the tag in the field frame, as the first
 * version did, is the same subtraction and has the same limit. Phoenix does not
 * expose wheel-only odometry, so this stands.
 */
export default function AlignToTag() {
  return (
    <PageTemplate
      title="Align to Tag"
      lede="Hold a button and the robot lines up on a spot measured from one AprilTag."
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
      time="12 minutes"
    >
      <p>
        In the last lesson, we added vision to correct our position on the
        field. This makes our field pose more accurate and lets us drive to a
        spot on the field. However, there are issues with this.
      </p>
      <ul className="ml-5 list-disc space-y-2">
        <li>The AprilTags can be slightly bent, or mounted a little off.</li>
        <li>The field is never built exactly to the drawing.</li>
        <li>
          The camera position and angle you entered in the Limelight are not
          quite right. An angle that is 1° off moves the answer about 5 cm when
          the tag is 3 m away.
        </li>
      </ul>
      <p>
        So to line up on something next to a tag, we skip the field pose and
        measure straight from that one tag.
      </p>

      <LessonSection id="the-tags-frame" title="The tag's frame">
        <p>
          A pose measured from a tag uses the tag&apos;s own axes. X points
          straight out of its face and Y to the tag&apos;s left. The heading is
          180° when the robot squarely faces the tag. A spot 1 m out, centered,
          facing the tag is <code>new Pose2d(1.0, 0.0, Rotation2d.PI)</code>.
        </p>

        <p>
          The Limelight reports the same thing in its own axes, called target
          space. Add <code>toTagFrame</code> at the bottom of{" "}
          <code>Vision</code> to turn one into the other.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Vision.java"
          code={`public class Vision {
  // ... everything up to the end of addFrame, unchanged

  private static Pose2d toTagFrame(Pose3d robotInTargetSpace) {
    return new Pose2d(
        -robotInTargetSpace.getZ(),
        robotInTargetSpace.getX(),
        // Turning about the downward Y axis is turning clockwise seen from above.
        Rotation2d.PI.minus(new Rotation2d(robotInTargetSpace.getRotation().getY())));
  }
}`}
        />

        <Box
          variant="alert-danger"
          tag="DANGER · SIGNS"
          title="Test this first"
        >
          <p>
            A wrong sign here sends the robot the wrong way at full speed. Run
            the first check below with the robot disabled before anything
            drives.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="remember-the-tag" title="Remember each tag">
        <p>
          The camera will lose the tag now and then, and we do not want the
          robot to slam on the brakes when it does. So for each sighting,{" "}
          <code>Vision</code> saves where the tag put the robot and where the
          wheels said the robot was when the picture was taken. From then on the
          wheels fill in, and the robot keeps driving to the last place it saw
          the tag. Add a record, a map, one call in <code>addFrame</code>, and
          two methods.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Vision.java"
          highlightLines={[
            4, 5, 6, 8, 9, 13, 14, 15, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
          ]}
          code={`public class Vision {
  // ... drivetrain and cameras, unchanged

  // One look at a tag: where the tag put the robot, and where the wheels said the robot was when
  // the picture was taken.
  private record Sighting(Pose2d robotInTag, Pose2d drivePose) {}

  // The newest sighting of each tag, by tag ID.
  private final Map<Integer, Sighting> sightings = new HashMap<>();

  private void addFrame(Limelight camera, LimelightResults frame) {
    PoseEstimate estimate = camera.getPoseEstimate(frame, PoseEstimateType.MT1_WPIBLUE);
    // Before the trust checks below: lining up on one close tag is exactly the sighting they
    // throw out.
    rememberTags(frame, estimate.timestampSeconds);

    // ... the rest of addFrame, unchanged
  }

  // ... toTagFrame, from above

  private void rememberTags(LimelightResults frame, double timestampSeconds) {
    // Where the wheels said the robot was when the picture was taken.
    Optional<Pose2d> poseThen = drivetrain.samplePoseAt(timestampSeconds);
    if (poseThen.isEmpty()) {
      return;
    }
    for (FiducialTarget tag : frame.fiducialTargets) {
      Pose2d pose = toTagFrame(tag.getRobotPose_TargetSpace());
      sightings.put(tag.fiducialId, new Sighting(pose, poseThen.get()));
      Telemetry.getTable("Vision").log("RobotInTag" + tag.fiducialId, pose);
    }
  }

  public Optional<Pose2d> robotInTag(int tagId) {
    Sighting seen = sightings.get(tagId);
    if (seen == null) {
      return Optional.empty();
    }
    // How far the wheels say the robot has moved since that picture.
    Transform2d movedSince = drivetrain.getPose().minus(seen.drivePose());
    return Optional.of(seen.robotInTag().plus(movedSince));
  }
}`}
        />

        <p>
          <code>rememberTags</code> runs on every frame.{" "}
          <code>samplePoseAt</code> looks up where the wheels said the robot was
          when the picture was taken. That goes into a <code>Sighting</code>{" "}
          beside what the tag said. It also logs the pose, which you will read
          in a later step.
        </p>
        <p>
          <code>robotInTag</code> answers where the robot is now, measured from
          one tag. It takes the newest sighting and adds how far the wheels have
          moved since. Each new picture replaces the last one, so the answer
          gets better as the robot gets closer. It is empty until a camera has
          seen that tag.
        </p>
      </LessonSection>

      <LessonSection
        id="drive-in-the-tags-frame"
        title="Drive in the tag's frame"
      >
        <p>
          Add <code>alignToTag</code> to <code>DriveMechanism</code>, under{" "}
          <code>driveToPoint</code>, and the one-line <code>samplePoseAt</code>{" "}
          that <code>Vision</code> calls. It is the same one-waypoint path as
          Drive to Point, on a builder whose pose comes from{" "}
          <code>vision.robotInTag(tagId)</code>, so BLine drives in the
          tag&apos;s frame.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/DriveMechanism.java"
          highlightLines={[
            4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22,
          ]}
          code={`public class DriveMechanism implements Mechanism {
  // ... everything up to driveToPoint, unchanged

  public FollowPath alignToTag(Vision vision, int tagId, Pose2d spotInTag) {
    return new FollowPath.Builder(
            DriveType.SWERVE,
            this,
            () -> vision.robotInTag(tagId).orElse(spotInTag), // where the robot is, from the tag
            pose -> {}, // a pose measured from a tag is not a field pose, so never reset to it
            () -> getRobotVelocity(),
            velocities -> driveRobotRelative(velocities),
            new PIDController(2.0, 0.0, 0.0),
            new PIDController(3.0, 0.0, 0.0),
            new PIDController(0.2, 0.0, 0.0))
        // The tag's frame has no alliance side, so there is nothing to turn around.
        .withShouldFlip(() -> false)
        .build(new Path(new Path.Waypoint(spotInTag)));
  }

  public Optional<Pose2d> samplePoseAt(double timestampSeconds) {
    return drivetrain.samplePoseAt(timestampSeconds);
  }

  // ... the rest, unchanged
}`}
        />

        <p>
          If the camera loses the tag on the way in, the robot finishes the
          drive on its wheels. It works from the last place it saw the tag. If
          no camera has seen the tag at all, <code>orElse(spotInTag)</code>{" "}
          reports that the robot is already on the spot. The path finishes at
          once and nothing moves. The gains are the ones from{" "}
          <Link href="/bline#builder" className={linkStyle}>
            BLine Paths
          </Link>
          .
        </p>

        <p>
          Then bind it in <code>TeleopOpMode</code>, under the Drive to Point
          buttons.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          highlightLines={[6, 7, 8, 9, 10, 11]}
          code={`  public TeleopOpMode(Robot robot) {
    // ... everything up to the Drive to Point bindings, unchanged
    robot.driver.a().whileTrue(robot.drivetrain.driveToPoint(Pose2d.ZERO));
    robot.driver.b().whileTrue(robot.drivetrain.driveToPoint(new Pose2d(3, 2, Rotation2d.PI)));

    // Hold X to line up 1 m straight out from tag 7, facing it. The camera has to see the tag.
    robot
        .driver
        .x()
        .whileTrue(
            robot.drivetrain.alignToTag(robot.vision, 7, new Pose2d(1.0, 0.0, Rotation2d.PI)));
  }`}
        />
      </LessonSection>

      <LessonSection id="record-your-spot" title="Record your spot">
        <p>
          Do not measure the spot with a tape. Record it with the camera that
          will drive to it, so the camera&apos;s mounting error cancels out.
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
          the centimeter.
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
            Back the robot up, hold <strong>X</strong> again, and cover the
            camera partway in.
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
              The robot finish the drive with the camera covered, and stop close
              to the same spot.
            </li>
          </ul>
        </Box>

        <p>
          If Y shrinks as the robot moves to its right, or the heading grows as
          it turns right, a sign in <code>toTagFrame</code> is flipped. Fix it
          there and run the first check again before anything drives.
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
              "On the spot. The path drives on the pose measured from the tag and never reads the field pose",
              "Nowhere. The command ends because the pose is untrusted",
              "On the spot, but only if the error is in X and not Y",
            ],
            correctAnswer: 1,
            explanation:
              "alignToTag builds its path on vision.robotInTag, which comes straight from the camera's view of that one tag. The field pose is not part of it.",
          },
          {
            id: 2,
            question:
              "The camera loses the tag 40 cm from the spot and does not get it back. What happens?",
            options: [
              "The robot stops where it is and waits for the tag to come back",
              "The robot keeps driving at its last speed until the button is released",
              "The robot drives on toward the field origin",
              "The robot finishes the drive on its wheels, measured from the last place it saw the tag",
            ],
            correctAnswer: 3,
            explanation:
              "robotInTag is the newest sighting plus how far the wheels have moved since. With no new picture, it keeps answering from the last one.",
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
              "Recording with the same camera cancels its mounting error. Recording on the event's field takes that field's tag mounting with it.",
          },
          {
            id: 4,
            question:
              "Why does rememberTags run before the trust checks in addFrame?",
            options: [
              "The trust checks decide whether a frame corrects the field pose. Alignment needs every sighting of its tag, including one from a frame the checks reject",
              "The checks need the saved tags to decide",
              "It runs faster before the checks",
              "The checks change the frame's timestamp",
            ],
            correctAnswer: 0,
            explanation:
              "The checks protect the field pose from a shaky solve. Alignment never touches the field pose, so rememberTags saves the sighting first, whether or not the frame goes on to pass.",
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
