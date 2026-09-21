import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import ImageBlock from "@/components/ImageBlock";
import DocumentationButton from "@/components/DocumentationButton";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { BookOpen } from "lucide-react";

/**
 * Rewritten September 2026 for LimelightLib 2, and split: the bench half now
 * lives at `/vision-hardware`, restored from the January 2026 `/vision-options`
 * page. This page is the code.
 *
 * The install step changed shape, and the API changed with it. LimelightLib 2
 * (`2.0.0-beta2`, `wpilibYear: 2027_alpha5`) ships as a real vendordep from
 * https://limelightvision.github.io/limelightlib-public/LimelightLib.json, and
 * there is no `LimelightHelpers` class in the jar at all. Everything is
 * `com.limelightvision.Limelight` plus its nested types. So the old lesson's
 * "copy this file into src/main/java/frc/robot" step is gone, and with it
 * `getBotPoseEstimate_wpiBlue`, `SetRobotOrientation_NoFlush`, `Flush()` and
 * `validPoseEstimate`.
 *
 * API verified by reading the shipped jar, not from memory:
 *   new Limelight(String)                       ctor applies defaultMT1/MT2
 *   camera.setUseSharedOrientation(boolean)
 *   Limelight.setSharedRobotOrientation(double) static, reaches every camera
 *   camera.readResultsQueue() -> LimelightResults[]
 *   camera.getPoseEstimate(LimelightResults, PoseEstimateType)
 *   LimelightResults.botPoseTagCount
 *   PoseEstimate.pose / .timestampSeconds / .fieldedTagCount
 *                .avgTagDistanceMeters / .rejectionFlags / .isMegaTag2()
 *   PoseEstimateConfig.describeRejection(int)
 *
 * WATCH OUT: Workshop-Code `3-Limelight` still carries the copied
 * `LimelightHelpers.java` and a subsystem named `Limelight`. This page is
 * ahead of it deliberately, so `branch` is not set. Set it again once the
 * swerve chain is rebuilt. The class here is `Vision` rather than `Limelight`
 * because the library now owns that name.
 */
export default function VisionImplementation() {
  return (
    <PageTemplate
      title="Vision"
      lede="Wheel odometry adds up wheel turns, and it drifts. An AprilTag sighting is absolute, occasional, and noisy. This lesson feeds sightings into the pose estimator so the camera pulls odometry back toward the truth."
      needs={[
        <>
          A camera mounted, wired and calibrated in{" "}
          <strong>Vision Hardware</strong>, and its name written down.
        </>,
        <>
          Odometry you trust, from <strong>Swerve Calibration</strong>. Vision
          corrects drift, not a wrong wheel radius.
        </>,
        <>The swerve project, with logging.</>,
        <>An AprilTag. A printed one on a wall works.</>,
      ]}
      time="14 minutes"
    >
      <Box variant="alert-warning" title="No camera in simulation">
        <p>
          None of this runs in the simulator. There is no camera, so nothing
          publishes to NetworkTables, the frame queue comes back empty, and the
          update method returns every loop. Check this page on the real robot.
        </p>
      </Box>

      <LessonSection id="install-the-library" title="Install the library">
        <Split>
          <ProseBlock>
            <p>
              LimelightLib used to be a single file you copied into your project
              and re-copied whenever it changed. It is a vendor dependency now,
              the same kind of thing as Phoenix 6, so VS Code fetches it and
              Gradle keeps it.
            </p>
            <p>
              Open the <strong>WPILib Vendor Dependencies</strong> view from the
              activity bar on the left. Expand <strong>INSTALL FROM URL</strong>
              , paste the URL below into the box, and press{" "}
              <strong>Install</strong>.
            </p>
          </ProseBlock>
          <MarginNote label="Delete the old file">
            If your project already holds a copied{" "}
            <code>LimelightHelpers.java</code>, delete it. The vendordep does
            not provide that class, nothing on this page calls it, and leaving
            it behind gives you two readers of the same camera.
          </MarginNote>
        </Split>

        <CodeBlock
          language="text"
          title="Vendor dependency URL"
          code={`https://limelightvision.github.io/limelightlib-public/LimelightLib.json`}
        />

        <ImageBlock
          src="/images/vision/install-from-url.png"
          alt="The WPILib Vendor Dependencies panel in VS Code, with the INSTALL FROM URL section expanded and the Install button circled"
          title="Install from URL"
          caption="The panel lives behind the code icon at the bottom of the activity bar. Paste the URL, press Install, and it appears under INSTALLED DEPENDENCIES."
          width={499}
          height={412}
        />

        <p>
          Build once so Gradle pulls the jar. You now have{" "}
          <code>com.limelightvision.Limelight</code>, which is one class per
          camera with everything the camera publishes hanging off it.
        </p>

        <DocumentationButton
          href="https://docs.limelightvision.io/docs/docs-limelight/apis/limelight-lib"
          title="Limelight: LimelightLib"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <LessonSection id="megatag1-and-megatag2" title="MegaTag1 and MegaTag2">
        <Split>
          <ProseBlock>
            <p>
              The camera solves the same frame two ways, and you pick which
              answer to believe.
            </p>
            <p>
              MegaTag1 solves position and heading from the geometry of the tags
              in frame. Two or more tags spread across the image constrain that
              geometry well. One tag does not. A small error in the measured
              corners swings the solved heading, and the position follows it.
            </p>
            <p>
              MegaTag2 takes your heading as given and solves only for position.
              One tag is enough. The heading goes in uncorrected, so a gyro ten
              degrees out returns a position that is wrong and looks fine.
            </p>
          </ProseBlock>
          <MarginNote label="Heading first">
            MegaTag2 cannot answer without a heading, so the class below sends
            one every loop before it reads anything back.
          </MarginNote>
        </Split>
      </LessonSection>

      <LessonSection id="one-frame-at-a-time" title="One frame at a time">
        <p>
          Create <code>src/main/java/frc/robot/subsystems/Vision.java</code>. It
          is called <code>Vision</code> and not <code>Limelight</code> because
          the library owns that name now.
        </p>

        <CodeBlock
          language="java"
          title="Vision.java: setup"
          code={`private static final double XY_STD_DEV_COEFFICIENT = 0.333;
private static final double ROTATION_STD_DEV_COEFFICIENT = 1.5;
private static final double MAX_TAG_DISTANCE_METERS = 4.0;
private static final double IGNORE_VISION_HEADING = 9_999_999;
private static final int MIN_TAGS_FOR_MEGATAG1 = 2;

private final Limelight camera;
private final DriveMechanism drivetrain;

private Vision(String name, DriveMechanism drivetrain) {
  this.camera = new Limelight(name);
  this.drivetrain = drivetrain;
  camera.setUseSharedOrientation(true);
}

public static void registerAll(DriveMechanism drivetrain, String... cameraNames) {
  Scheduler.getDefault()
      .addPeriodic(
          () ->
              Limelight.setSharedRobotOrientation(
                  drivetrain.getPose().getRotation().getDegrees()));

  for (String name : cameraNames) {
    Vision vision = new Vision(name, drivetrain);
    Scheduler.getDefault().addPeriodic(() -> vision.update());
  }
}`}
        />

        <Split>
          <ProseBlock>
            <p>
              One heading write serves every camera on the robot.{" "}
              <code>setUseSharedOrientation(true)</code> tells a camera to read
              the shared topic, and the static{" "}
              <code>setSharedRobotOrientation</code> writes it once per loop.
              Two cameras cost one write, not two.
            </p>
            <p>
              Now the read. <code>readResultsQueue()</code> hands back every
              frame that arrived since the last call, which is usually one and
              is sometimes none or two. Working the queue rather than asking for
              the latest value means no frame is skipped. It also means one
              frame never goes into the estimator twice.
            </p>
          </ProseBlock>
          <MarginNote label="Not a Mechanism">
            A camera drives nothing, so there is nothing for the scheduler to
            hand out. <code>addPeriodic</code> runs the update every loop
            instead.
          </MarginNote>
        </Split>

        <CodeBlock
          language="java"
          title="Vision.java: update"
          code={`private void update() {
  for (LimelightResults frame : camera.readResultsQueue()) {
    PoseEstimate estimate =
        camera.getPoseEstimate(
            frame,
            frame.botPoseTagCount >= MIN_TAGS_FOR_MEGATAG1
                ? PoseEstimateType.MT1_WPIBLUE
                : PoseEstimateType.MT2_WPIBLUE);

    if (estimate.rejectionFlags != 0
        || estimate.avgTagDistanceMeters > MAX_TAG_DISTANCE_METERS) {
      continue;
    }

    double distanceFactor = Math.pow(estimate.avgTagDistanceMeters, 1.2);
    double tagFactor = estimate.fieldedTagCount * estimate.fieldedTagCount;
    double xyStdDev = XY_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;
    double headingStdDev =
        estimate.isMegaTag2()
            ? IGNORE_VISION_HEADING
            : ROTATION_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;

    drivetrain.addVisionMeasurement(
        estimate.pose,
        estimate.timestampSeconds,
        VecBuilder.fill(xyStdDev, xyStdDev, headingStdDev));
  }
}`}
        />

        <p>
          <code>rejectionFlags</code> is the library&apos;s own verdict on the
          frame, and zero means it found nothing wrong. A fresh{" "}
          <code>new Limelight(name)</code> already carries sensible gates. It
          throws out a single tag past three meters, a single tag whose
          ambiguity is over 0.7, and any solve with no fielded tag. That last
          gate is why <code>tagFactor</code> can never be zero. When a frame
          does get rejected,{" "}
          <code>PoseEstimateConfig.describeRejection(flags)</code> names the
          reason.
        </p>
      </LessonSection>

      <LessonSection id="the-trust-weighting" title="The trust weighting">
        <Split>
          <ProseBlock>
            <p>
              Every sighting goes into the estimator with a standard deviation:
              how far off it might be, in meters and radians. Bigger means trust
              it less, and the estimator blends the sighting against the wheels
              in that proportion.
            </p>
            <p>
              Distance hurts gently and tag count helps hard. Doubling the
              distance multiplies the error bar by about 2.3, while a second tag
              divides it by four. One tag at two meters gives about 0.77 m. Two
              tags at the same distance give about 0.19 m. That ratio is the
              argument for the mounting rule on the last page.
            </p>
          </ProseBlock>
          <MarginNote label="The library will do this">
            <code>PoseEstimateConfig</code> can compute standard deviations for
            you, and <code>estimate.stdDevs</code> carries them. Writing the
            formula here keeps the numbers somewhere you can tune them.
          </MarginNote>
        </Split>

        <Box variant="concept" title="The heading MegaTag2 returns">
          <p>
            MegaTag2 solved that pose from the heading you handed the camera a
            few lines earlier. Feeding it back as a measurement would be the
            robot agreeing with itself, growing more confident every loop. So
            MegaTag2 estimates go in with <code>IGNORE_VISION_HEADING</code>,
            which the estimator reads as infinity. MegaTag1 heading is a real
            observation, and it gets a real weight.
          </p>
        </Box>

        <p>
          The measurement goes in with <code>estimate.timestampSeconds</code>,
          not the current time. The picture was taken, processed and sent before
          your code saw it, so the robot has already moved. The estimator winds
          its history back to that moment, folds the sighting in there, and
          replays forward.
        </p>

        <p>
          One line in <code>Robot</code>&apos;s constructor starts it:{" "}
          <code>Vision.registerAll(drivetrain, &quot;limelight&quot;)</code>,
          plus <code>import frc.robot.subsystems.Vision;</code>. Not in an
          OpMode. Those bindings are torn down on a mode switch, and vision has
          to keep correcting in every mode. A second camera is a second string.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
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
            when you close in. With one tag in view the position moves and the
            heading does not budge.
          </p>
        </Box>

        <p>
          Three things go wrong here. A pose that never moves is almost always
          the name: the string in <code>registerAll</code> has to match the
          camera&apos;s NetworkTables table exactly. A pose that jumps somewhere
          impossible means the offsets are wrong. If it lands on the far side of
          the field, a red-origin pose is going into a blue-origin estimator.
          That is why the code asks for <code>MT1_WPIBLUE</code>. Position that
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
              "The camera has exactly one AprilTag in frame. Which solver does Vision.java ask for, and why?",
            options: [
              "MegaTag2, because one tag cannot pin down heading reliably, so the code hands the camera the gyro heading instead",
              "Neither: a single-tag frame is skipped before a solver is chosen",
              "Both, and it averages the two answers",
              "MegaTag1, because it is more accurate at every tag count",
            ],
            correctAnswer: 0,
            explanation:
              "The frame carries botPoseTagCount, and the code picks the solver from it before asking for an estimate. Below two tags it asks for MT2_WPIBLUE. MegaTag1 solves heading from the tag corners themselves, which is shaky off a single tag; MegaTag2 takes your heading as given and solves only position.",
          },
          {
            id: 2,
            question:
              "Why does the code walk readResultsQueue() instead of reading the camera's latest result?",
            options: [
              "The latest result is only available in simulation",
              "The queue is the only call that returns a timestamp",
              "The queue holds every frame since the last call, so no frame is dropped and no frame is fused twice",
              "Reading the latest result forces a NetworkTables flush",
            ],
            correctAnswer: 2,
            explanation:
              "Camera frames and robot loops do not line up. Some loops see no new frame and some see two. The queue hands you exactly what arrived, so a fast camera does not lose sightings and a slow one does not get the same sighting added to the estimator twice.",
          },
          {
            id: 3,
            question:
              "What does a rejectionFlags value of zero tell you about a pose estimate?",
            options: [
              "That no tags were in frame",
              "That the library's own gates found nothing wrong with the frame",
              "That the estimate came from MegaTag1 rather than MegaTag2",
              "That the standard deviations have not been computed yet",
            ],
            correctAnswer: 1,
            explanation:
              "Zero means no gate fired. A fresh Limelight starts with defaults that reject a lone tag past three meters, a lone tag with ambiguity over 0.7, and a solve with no fielded tags. When a flag is set, PoseEstimateConfig.describeRejection turns it into a name you can read.",
          },
          {
            id: 4,
            question:
              "The robot sees two tags at 2 m instead of one tag at 2 m. What happens to the position standard deviation?",
            options: [
              "It stays the same, because only distance affects it",
              "It halves, because tagCount doubles",
              "It doubles, because more tags means more disagreement",
              "It drops to a quarter, because the divisor is tagCount squared",
            ],
            correctAnswer: 3,
            explanation:
              "The divisor is fieldedTagCount squared, so two tags divide by 4 and three divide by 9. One tag at 2 m gives about 0.77 m; two tags at the same distance give about 0.19 m. This is the whole argument for aiming a camera at where two tags will be.",
          },
          {
            id: 5,
            question:
              "Why does a MegaTag2 estimate go in with a heading standard deviation of 9,999,999?",
            options: [
              "MegaTag2 does not report a heading at all, so the value is a placeholder",
              "It is a debugging value left in from tuning",
              "MegaTag2 solved from the heading you sent it, so feeding that heading back would be the robot confirming itself",
              "The estimator rejects any measurement whose heading deviation is below one",
            ],
            correctAnswer: 2,
            explanation:
              "MegaTag2 is handed your gyro heading and solves only position. Its reported heading is therefore your own heading coming back, and treating it as an independent observation would make the estimator more confident in a number it already had. A huge deviation tells the estimator to ignore that axis.",
          },
          {
            id: 6,
            question:
              "Why does registerAll get called from Robot's constructor rather than from an OpMode?",
            options: [
              "OpMode constructors run before the drivetrain exists",
              "Bindings made in an OpMode are torn down on a mode switch, and odometry has to keep being corrected in every mode",
              "The scheduler refuses addPeriodic calls made from an OpMode",
              "Vision only matters during autonomous, which Robot owns",
            ],
            correctAnswer: 1,
            explanation:
              "Each OpMode sets up its own bindings and loses them when the mode changes. Vision is not a mode-specific behaviour: the pose estimator drifts in teleop, autonomous and disabled alike, so the update has to live where it survives all three.",
          },
        ]}
      />
    </PageTemplate>
  );
}
