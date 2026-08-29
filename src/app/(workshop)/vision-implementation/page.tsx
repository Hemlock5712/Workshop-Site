import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { Link } from "lucide-react";

/**
 * Cut from 35.5 minutes and nine sections to six.
 *
 * What went: the five excerpt code blocks that walked through `Limelight.java`
 * a paragraph at a time, the `_NoFlush` batching aside, the worked-numbers
 * table, the `Robot.java` PR embed, the standalone Reference section, and the
 * "What's next" teaser. The class is shown once, whole, through the embed that
 * was already here; the constants are named in prose where they are used.
 *
 * What stayed, because a student cannot do this lesson without it: camera
 * mounting, the five-step camera setup with ChArUco, MegaTag1 against
 * MegaTag2, `validPoseEstimate` and the two-condition filter, the four
 * constants, the timestamp, and the simulator warning.
 *
 * A verification pass then put back four things the cut had taken with it, and
 * paid for them out of prose: the instruction to create
 * `subsystems/Limelight.java`, the `registerAll` call itself (it had been left
 * in the embed's `description`, which the reading budget does not count),
 * `ROTATION_STD_DEV_COEFFICIENT = 1.5`, and the warning that seeding the gyro
 * is not `seedFieldCentric()`.
 */
export default function VisionImplementation() {
  return (
    <PageTemplate
      title="Vision"
      lede="Wheel odometry adds up wheel turns, and it drifts. An AprilTag sighting is absolute, occasional, and noisy. This lesson feeds sightings into the pose estimator so the camera pulls odometry back toward the truth."
      needs={[
        <>
          The swerve project with logging. Branch <code>3-Limelight</code> is
          one commit off <code>2-Logging</code>.
        </>,
        <>
          Odometry you trust, from <strong>Swerve Calibration</strong>. Vision
          corrects drift, not a wrong wheel radius.
        </>,
        <>A Limelight bolted to the robot, powered, on the robot network.</>,
        <>An AprilTag. A printed one on a wall works.</>,
      ]}
      branch="3-Limelight"
      time="12 minutes"
    >
      <Box variant="alert-warning" title="No camera in simulation">
        <p>
          <code>Limelight.java</code> does nothing in the simulator: no camera,
          so nothing publishes to NetworkTables and the update method returns
          every loop. Check this page on the real robot.
        </p>
      </Box>

      <LessonSection id="camera-placement" title="Camera placement">
        <Split>
          <ProseBlock>
            <p>
              Every AprilTag carries an ID. The field drawing says where that ID
              sits, so measuring the tag relative to the camera works backwards
              to the robot&apos;s position.
            </p>
            <p>
              Mounting decides whether any of this works, and it is the part
              teams get wrong. Put the camera where it can see the scoring tags
              while you are scoring. Never mount it{" "}
              <strong>level with the tags</strong>. You want a tag viewed from
              an angle: off to one side, and above or below. Dead-on and level
              gives the worst estimate there is.
            </p>
          </ProseBlock>
          <MarginNote label="Two cameras">
            Many teams run more than one, angled so that something always has a
            tag in frame.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="set-the-camera-up" title="Set the camera up">
        <p>
          None of the Java below fixes a badly configured camera. Do this on the
          hardware first, with the robot powered.
        </p>

        <ol className="ml-5 list-decimal space-y-4">
          <li>
            <strong>Switch the active pipeline to AprilTag.</strong> A
            color-blob pipeline never publishes a botpose.
          </li>
          <li>
            <strong>Drop the exposure</strong> as low as it can go while still
            finding tags. A short shutter cuts motion blur. A blurred tag gives
            a wrong answer, not no answer.
          </li>
          <li>
            <strong>Enter the camera offsets.</strong> Measure where the camera
            sits relative to the robot&apos;s center, and at what angle. Solving
            gives the camera&apos;s pose; the offsets make it the robot&apos;s.
            Get them wrong and every measurement shifts the same way.
            <div className="mt-3">
              <DocumentationButton
                href="https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltag-3d#full-3d-tracking"
                title="Limelight: full 3D tracking"
                icon={<Link className="w-5 h-5" />}
              />
            </div>
          </li>
          <li>
            <strong>Calibrate the lens</strong> with a printed ChArUco board. It
            corrects lens distortion, worst at the edges of the image. Tags sit
            there when you are lined up on something.
            <div className="mt-3">
              <DocumentationButton
                href="https://docs.limelightvision.io/docs/docs-limelight/getting-started/performing-charuco-camera-calibration"
                title="Limelight: ChArUco calibration"
                icon={<Link className="w-5 h-5" />}
              />
            </div>
          </li>
          <li>
            <strong>Write down the camera&apos;s name.</strong> That string is
            the NetworkTables table it publishes to, and the Java addresses the
            camera by it. The branch uses the default, <code>limelight</code>.
          </li>
        </ol>

        <p>
          Hold a tag in front of the camera. The web interface should report its
          ID.
        </p>
      </LessonSection>

      <LessonSection
        id="two-solvers-megatag1-and-megatag2"
        title="MegaTag1 and MegaTag2"
      >
        <Split>
          <ProseBlock>
            <p>
              MegaTag1 solves position and heading from the geometry of the tags
              in frame. Two or more tags spread across the image constrain that
              geometry well. One tag does not. A small error in the measured
              corners swings the solved heading, and the position follows.
            </p>
            <p>
              MegaTag2 takes your heading as given and solves only for position.
              One tag is enough. The heading goes in uncorrected, so a gyro ten
              degrees out returns a position that is wrong and looks fine.
            </p>
            <p>
              <code>Limelight.java</code> asks for MegaTag1 first. If that
              estimate is valid but came from one tag, it asks again for
              MegaTag2.
            </p>
          </ProseBlock>
          <MarginNote label="Heading first">
            The class writes the robot&apos;s heading to the camera at the top
            of every update. MegaTag2 cannot answer without it.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="valid-estimates" title="The validity gate">
        <p>
          Copy <code>LimelightHelpers.java</code> from the branch into{" "}
          <code>src/main/java/frc/robot/</code>. Take the branch&apos;s copy: it
          is migrated to the <code>org.wpilib.*</code> packages, and a stock
          download will not import.
        </p>

        <p>
          A bad estimate does not fail loudly. It gets folded into odometry and
          drags the robot&apos;s idea of where it is somewhere wrong.
        </p>

        <CodeBlock
          language="java"
          title="LimelightHelpers.java: the gate"
          code={`public static Boolean validPoseEstimate(PoseEstimate pose) {
  return pose != null && pose.rawFiducials != null && pose.rawFiducials.length != 0;
}`}
        />

        <p>
          A <em>fiducial</em> is one detected tag. So: did we get an answer, and
          did at least one tag go into it? With nothing to read,{" "}
          <code>LimelightHelpers</code> returns a pose at the field origin with
          an empty fiducial array. A camera that is off or misnamed produces
          silence, not a robot that thinks it is in a corner.
        </p>

        <p>
          <code>update()</code> returns early on two conditions and no others:
          the estimate fails that gate, or <code>avgTagDist</code> is past{" "}
          <code>MAX_TAG_DISTANCE_METERS</code>, set to 4.0 on the branch.
          Everything else gets through.
        </p>

        <Box variant="concept" title="Why so few checks">
          <p>
            A tag past four meters is a handful of pixels, so that cut is a hard
            line. Everything nearer is weighted, not rejected: a distant
            sighting arrives with a large error bar.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="how-much-to-trust-it" title="The trust weighting">
        <Split>
          <ProseBlock>
            <p>
              Every sighting goes in with a standard deviation: how far off it
              might be, in meters and radians. Bigger means trust it less, and
              the estimator blends the sighting against the wheels in that
              proportion.
            </p>
            <p>
              Distance hurts gently and tag count helps hard. The position
              deviation is{" "}
              <code>XY_STD_DEV_COEFFICIENT * avgTagDist^1.2 / tagCount^2</code>,
              with the coefficient at 0.333. The heading term scales the same
              way from <code>ROTATION_STD_DEV_COEFFICIENT</code>, at 1.5.
              Doubling the distance multiplies the error bar by about 2.3. One
              tag at two meters gives about 0.77 m. Two tags, same distance,
              0.19 m.
            </p>
          </ProseBlock>
          <MarginNote label="Not a Mechanism">
            A camera drives nothing, so there is nothing for the scheduler to
            hand out. <code>registerAll</code> adds <code>update()</code> with{" "}
            <code>Scheduler.getDefault().addPeriodic(...)</code> instead.
          </MarginNote>
        </Split>

        <Box variant="concept" title="The heading MegaTag2 returns">
          <p>
            MegaTag2 solved that pose from the heading you gave the camera two
            lines earlier. Feeding it back as a measurement would be the robot
            agreeing with itself, growing more confident every loop. So MegaTag2
            estimates go in with <code>IGNORE_VISION_HEADING</code>, set to{" "}
            <code>9_999_999</code>, which the estimator reads as infinity.
            MegaTag1 heading is a real observation, and gets a real weight.
          </p>
        </Box>

        <p>
          The measurement goes in with <code>estimate.timestampSeconds</code>,
          not the current time. The picture was taken, processed, and sent
          before your code saw it, so the robot has already moved.
        </p>

        <p>
          All of it lives in{" "}
          <code>src/main/java/frc/robot/subsystems/Limelight.java</code>, about
          eighty lines. Create that file, then register the camera with one line
          in <code>Robot</code>&apos;s constructor:{" "}
          <code>Limelight.registerAll(drivetrain, &quot;limelight&quot;)</code>,
          plus <code>import frc.robot.subsystems.Limelight;</code>. Not in an
          OpMode: those bindings are torn down on a mode switch, and vision has
          to keep correcting in every mode. A second camera is a second string.
        </p>
      </LessonSection>

      <LessonSection id="did-it-work" title="Check your work">
        <p>
          Deploy, put the robot on the floor with a tag in view, and watch{" "}
          <code>Drivetrain/Pose</code> in NetworkTables.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Park about two meters from a tag and note the pose. Cover the camera
            and push the robot a meter sideways. The pose follows the wheels.
          </li>
          <li>
            Uncover the camera. The pose settles toward where the tag says the
            robot is, over a second rather than in one frame.
          </li>
          <li>
            Back away past four meters, then close in again. Line up on two
            tags, then on one.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <p>
            The pose walks back to the truth once a tag comes into view, rather
            than jumping there. Corrections stop past four meters and resume
            when you close in. With one tag in view, the position moves and the
            heading does not budge.
          </p>
        </Box>

        <p>
          Three things go wrong here. A pose that never moves is almost always
          the name: the string in <code>registerAll</code> must match the
          camera&apos;s NetworkTables table exactly. A pose that jumps somewhere
          impossible means the offsets are wrong. If it lands on the far side of
          the field, a red-origin pose is going into a blue-origin estimator.
          That is why the class asks for <code>_wpiBlue</code>. Position that
          corrects on two tags and goes strange on one is the MegaTag2 path, so
          seed the gyro. Not with <code>seedFieldCentric()</code>, which only
          changes which way the sticks call forward:{" "}
          <strong>Swerve Calibration</strong> has the three kinds of zeroing.
        </p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "The camera has exactly one AprilTag in frame. Which solver does Limelight.java end up using, and why?",
            options: [
              "MegaTag2, because one tag cannot pin down heading reliably, so the code hands the camera the gyro heading instead",
              "Neither: a single-tag estimate is rejected",
              "Both, and it averages them",
              "MegaTag1, because it is always more accurate",
            ],
            correctAnswer: 0,
            explanation:
              "The code asks for MegaTag1 first. If that estimate is valid and tagCount == 1, it re-fetches as MegaTag2. MegaTag1 solves heading from the tags themselves, which is shaky off a single tag; MegaTag2 takes your heading as given and solves only position.",
          },
          {
            id: 2,
            question:
              "How many conditions make update() return without sending anything to the drivetrain, and what are they?",
            options: [
              "One: the pose is outside the field perimeter",
              "None: every estimate is passed on and the standard deviations sort it out",
              "Five: field boundary, ambiguity, Z-height, distance and tag count",
              "Two: the estimate is not valid (no tag in frame), or avgTagDist is greater than MAX_TAG_DISTANCE_METERS = 4.0",
            ],
            correctAnswer: 3,
            explanation:
              "validPoseEstimate has to pass, and avgTagDist has to be inside 4.0 m. Weighting handles everything else rather than rejection: a poor sighting gets a large error bar instead of being discarded.",
          },
          {
            id: 3,
            question:
              "A camera is powered off, but the code still runs. What does validPoseEstimate see?",
            options: [
              "A null PoseEstimate, which throws when the code reads pose.tagCount",
              "A default PoseEstimate at the field origin with an empty rawFiducials array, which the gate rejects",
              "The last pose the camera published before it lost power",
              "An estimate with tagCount of zero but a valid pose, which gets fused",
            ],
            correctAnswer: 1,
            explanation:
              "With no data to read, LimelightHelpers hands back a default PoseEstimate sitting at the field origin with no fiducials. The gate exists to throw that reading away, so a missing or misnamed camera produces silence instead of a robot that believes it is parked in the corner.",
          },
          {
            id: 4,
            question:
              "The robot sees two tags at 2 m instead of one tag at 2 m. What happens to the position standard deviation?",
            options: [
              "It drops to a quarter, because the divisor is tagCount squared",
              "It stays the same: only distance affects it",
              "It doubles, because more tags means more disagreement",
              "It halves, because tagCount doubles",
            ],
            correctAnswer: 0,
            explanation:
              "The divisor is tagCount squared, so two tags divide by 4 and three tags divide by 9. One tag at 2 m gives about 0.77 m; two tags at the same distance give about 0.19 m. This is why camera aiming matters so much.",
          },
          {
            id: 5,
            question:
              "Why does the measurement go in with estimate.timestampSeconds instead of the current time?",
            options: [
              "It keeps the camera and the robot controller clocks in sync",
              "It is only used for logging",
              "The picture was taken before the code saw it, and the estimator has to fold the measurement in at the moment the robot was there",
              "The pose estimator rejects measurements without a timestamp field",
            ],
            correctAnswer: 2,
            explanation:
              "Capture, processing and network transport all take time, so by the time your code holds the pose the robot has moved. The Limelight's own timestamp is passed straight through, already corrected for the camera's reported latency.",
          },
        ]}
      />
    </PageTemplate>
  );
}
