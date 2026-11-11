import PageTemplate from "@/components/PageTemplate";
import { ProseBlock } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import ImageBlock from "@/components/ImageBlock";
import DocumentationButton from "@/components/DocumentationButton";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { BookOpen } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/vision-implementation");

/**
 * Rewritten September 2026 for LimelightLib 2, and split: the bench half now
 * lives at `/vision-hardware`, restored from the January 2026 `/vision-options`
 * page. This page is the code.
 *
 * The install step changed shape, and the API changed with it. LimelightLib 2
 * ships as a real vendordep, and there is no `LimelightHelpers` class in the
 * jar at all. Everything is `com.limelightvision.*`. So the old lesson's "copy
 * this file into src/main/java/frc/robot" step is gone, and with it
 * `getBotPoseEstimate_wpiBlue`, `SetRobotOrientation_NoFlush`, `Flush()` and
 * `validPoseEstimate`.
 *
 * PIN THE ALPHA. The vendordep is published per WPILib alpha, and the file is
 * NOT called `LimelightLib.json`:
 *   .../limelightlib-public/LimelightLib-alpha7.json    2.0.0-beta9-alpha7
 *   .../limelightlib-public/LimelightLib-alpha5-6.json  older
 * A bare `LimelightLib.json` 404s, as does the whole Pages root, so a wrong
 * URL here is a lesson a student cannot start. Re-check the filename when the
 * alpha moves.
 *
 * API verified against the alpha7 jar, not from memory. Note that alpha7
 * FLATTENED the nested types: `Limelight.PoseEstimate` and friends are now
 * top-level `com.limelightvision.PoseEstimate`, `LimelightResults`,
 * `PoseEstimateType`. Two more renames came with it, so beta2 sample code does
 * not compile here.
 *   new Limelight(String)                       ctor applies defaultMT1/MT2
 *   camera.setUseSharedOrientation(boolean)
 *   Limelight.setSharedRobotOrientation(double) static, reaches every camera
 *   camera.readResultsQueue() -> LimelightResults[]
 *   camera.getPoseEstimate(LimelightResults, PoseEstimateType)
 *   PoseEstimate.pose / .timestampSeconds / .fieldedTagCount
 *                .avgTagDistanceMeters / .rejectionFlags / .isMT2()
 *   PoseEstimateConfig.describeRejection(int)
 * Gone since beta2: `LimelightResults.botPoseTagCount` (pick the solver off
 * `fieldedTagCount` instead) and `PoseEstimate.isMegaTag2()` (now `isMT2()`).
 * `defaultMT1()` still gates a lone tag at 3.0 m and 0.7 ambiguity.
 *
 * November 2026: the page has a branch again, `swerve-vision`, one commit on
 * `swerve-bline`. `3-Limelight` still carries the copied `LimelightHelpers.java`
 * and is no longer the parent of anything taught. `Vision` is a field on
 * `Robot` rather than a static `registerAll`, because `/align-to-tag` asks it
 * where a tag is. The class is `Vision` rather than `Limelight` because the
 * library now owns that name.
 */
export default function VisionImplementation() {
  return (
    <PageTemplate
      title="Vision"
      lede="This lesson feeds AprilTag sightings into the pose estimator so the camera pulls odometry back toward the truth."
      needs={[
        <>
          A camera mounted, wired and calibrated in{" "}
          <strong>Vision Hardware</strong>, and its name written down.
        </>,
        <>
          Odometry you trust, from <strong>Swerve Drive Tuning</strong>. Vision
          corrects drift, not a wrong wheel radius.
        </>,
        <>The swerve project.</>,
        <>An AprilTag. A printed one on a wall works.</>,
      ]}
      branch="swerve-vision"
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
        <ProseBlock>
          <p>
            LimelightLib is a vendor dependency, the same kind of thing as
            Phoenix 6.
          </p>
          <p>
            Open the <strong>WPILib Vendor Dependencies</strong> view from the
            activity bar on the left. Expand <strong>INSTALL FROM URL</strong>,
            paste the URL below into the box, and press <strong>Install</strong>
            .
          </p>
        </ProseBlock>

        <CodeBlock
          language="text"
          title="Vendor dependency URL"
          code={`https://limelightvision.github.io/limelightlib-public/LimelightLib-alpha7.json`}
        />

        <ImageBlock
          src="/images/vision/install-from-url.png"
          alt="The WPILib Vendor Dependencies panel in VS Code, with the INSTALL FROM URL section expanded and the Install button circled"
          title="Install from URL"
          caption="Paste the URL, press Install, and it appears under INSTALLED DEPENDENCIES."
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
        <ProseBlock>
          <p>
            The camera solves the same frame two ways, and you pick which answer
            to believe.
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
      </LessonSection>

      <LessonSection id="the-vision-class" title="The Vision class">
        <p>
          Create <code>src/main/java/frc/robot/subsystems/Vision.java</code> and
          paste the whole class. It is called <code>Vision</code> and not{" "}
          <code>Limelight</code> because the library owns that name.
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/subsystems/Vision.java"
          code={`package frc.robot.subsystems;

import com.limelightvision.Limelight;
import com.limelightvision.LimelightResults;
import com.limelightvision.PoseEstimate;
import com.limelightvision.PoseEstimateType;
import java.util.ArrayList;
import java.util.List;
import org.wpilib.command3.Scheduler;
import org.wpilib.math.linalg.VecBuilder;

/**
 * Feeds AprilTag sightings from every Limelight on the robot into the drivetrain's pose estimator,
 * so the camera pulls odometry back toward the truth.
 *
 * <p>A camera drives nothing, so this is not a {@code Mechanism}. It runs from the scheduler's
 * periodic list instead, every loop and in every mode.
 */
public class Vision {
  // Trust weighting. A sighting's error bar grows with distance and shrinks with tag count.
  private static final double XY_STD_DEV_COEFFICIENT = 0.333;
  private static final double ROTATION_STD_DEV_COEFFICIENT = 1.5;
  private static final double MAX_TAG_DISTANCE_METERS = 4.0;
  // MegaTag2 solved from our own heading, so its heading is not a new measurement.
  private static final double IGNORE_VISION_HEADING = 9_999_999;
  private static final int MIN_TAGS_FOR_MEGATAG1 = 2;

  private final DriveMechanism drivetrain;
  private final List<Limelight> cameras = new ArrayList<>();

  /**
   * @param drivetrain the drivetrain whose pose estimate the cameras correct
   * @param cameraNames each camera's NetworkTables name, exactly as set in its web interface
   */
  public Vision(DriveMechanism drivetrain, String... cameraNames) {
    this.drivetrain = drivetrain;
    for (String name : cameraNames) {
      Limelight camera = new Limelight(name);
      // Read the heading that update() shares, for MegaTag2.
      camera.setUseSharedOrientation(true);
      cameras.add(camera);
    }
    Scheduler.getDefault().addPeriodic(() -> update());
  }

  private void update() {
    // One write reaches every camera that reads the shared heading.
    Limelight.setSharedRobotOrientation(drivetrain.getPose().getRotation().getDegrees());

    for (Limelight camera : cameras) {
      // Every frame since the last loop, so none is skipped and none is used twice.
      for (LimelightResults frame : camera.readResultsQueue()) {
        addFrame(camera, frame);
      }
    }
  }

  private void addFrame(Limelight camera, LimelightResults frame) {
    PoseEstimate estimate = camera.getPoseEstimate(frame, PoseEstimateType.MT1_WPIBLUE);
    if (estimate.fieldedTagCount < MIN_TAGS_FOR_MEGATAG1) {
      estimate = camera.getPoseEstimate(frame, PoseEstimateType.MT2_WPIBLUE);
    }

    // Zero means the library's own gates found nothing wrong with the frame.
    if (estimate.rejectionFlags != 0 || estimate.avgTagDistanceMeters > MAX_TAG_DISTANCE_METERS) {
      return;
    }

    double distanceFactor = Math.pow(estimate.avgTagDistanceMeters, 1.2);
    double tagFactor = estimate.fieldedTagCount * estimate.fieldedTagCount;
    double xyStdDev = XY_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;
    double headingStdDev =
        estimate.isMT2()
            ? IGNORE_VISION_HEADING
            : ROTATION_STD_DEV_COEFFICIENT * distanceFactor / tagFactor;

    // The picture's own timestamp: the estimator winds back to when it was taken.
    drivetrain.addVisionMeasurement(
        estimate.pose,
        estimate.timestampSeconds,
        VecBuilder.fill(xyStdDev, xyStdDev, headingStdDev));
  }
}`}
        />

        <ul className="ml-5 list-disc space-y-3">
          <li>
            A camera drives nothing, so <code>Vision</code> is not a mechanism.
            The constructor hands <code>update()</code> to{" "}
            <code>Scheduler.getDefault().addPeriodic</code>, which runs it every
            loop.
          </li>
          <li>
            <code>setUseSharedOrientation(true)</code> tells each camera to read
            a shared heading topic, and the static{" "}
            <code>Limelight.setSharedRobotOrientation</code> writes it once per
            loop for every camera. MegaTag2 needs that heading.
          </li>
          <li>
            <code>readResultsQueue()</code> hands back every frame that arrived
            since the last call, so no frame is skipped and none goes into the
            estimator twice.
          </li>
          <li>
            <code>addFrame</code> asks MegaTag1 first, then reads{" "}
            <code>fieldedTagCount</code> off the answer. Under two tags, it asks
            the same frame again as MegaTag2.
          </li>
          <li>
            <code>rejectionFlags</code> is the library&apos;s own verdict on the
            frame, and zero means it found nothing wrong. A fresh{" "}
            <code>new Limelight(name)</code> already has gates. It rejects a
            single tag past three meters or with ambiguity over 0.7, and a solve
            with no fielded tag. So <code>tagFactor</code> is never zero.{" "}
            <code>PoseEstimateConfig.describeRejection(flags)</code> names the
            reason for a rejected frame.
          </li>
          <li>
            <code>addVisionMeasurement</code> takes{" "}
            <code>estimate.timestampSeconds</code>, not the current time. The
            picture was taken before your code saw it. The estimator winds its
            history back to that moment and folds the sighting in there.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="the-trust-weighting" title="The trust weighting">
        <p>
          Every sighting goes into the estimator with a standard deviation: how
          far off it might be, in meters and radians. Bigger means trust it
          less, and the estimator blends the sighting against the wheels in that
          proportion.
        </p>
        <p>
          Distance hurts gently and tag count helps hard. Doubling the distance
          multiplies the error bar by about 2.3, while a second tag divides it
          by four. One tag at two meters gives about 0.77 m. Two tags at the
          same distance give about 0.19 m.
        </p>
        <p>
          MegaTag2 solved its pose from the heading you handed the camera.
          Feeding that heading back as a measurement would be the robot agreeing
          with itself. So MegaTag2 estimates go in with{" "}
          <code>IGNORE_VISION_HEADING</code>, which the estimator reads as
          infinity. MegaTag1 heading is a real observation, and it gets a real
          weight.
        </p>
      </LessonSection>

      <LessonSection id="start-it-in-robot" title="Start it in Robot">
        <p>
          Add one field to <code>Robot</code>, under the drivetrain. Not in an
          OpMode: an OpMode is thrown away on every mode switch, and vision has
          to keep correcting in every mode.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/Robot.java"
          highlightLines={[2, 8, 9]}
          code={`import frc.robot.subsystems.DriveMechanism;
import frc.robot.subsystems.Vision;

// ... the other imports, unchanged

public class Robot extends OpModeRobot {
  public final DriveMechanism drivetrain = new DriveMechanism();
  // Every camera on the robot, by its NetworkTables name. A second camera is a second string.
  public final Vision vision = new Vision(drivetrain, "limelight");

  // ... the constructor and robotPeriodic, unchanged
}`}
        />
        <p>
          The string has to match the camera&apos;s NetworkTables name exactly,
          the one you wrote down in <strong>Vision Hardware</strong>.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Deploy, put the robot on the floor with a tag in view, and watch{" "}
          <code>Telemetry/Drivetrain/Pose</code> in NetworkTables.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Park about two meters from a tag and note the pose. Cover the camera
            and push the robot a meter sideways. The pose follows the wheels.
          </li>
          <li>
            Uncover the camera. The pose settles toward where the tag says the
            robot is.
          </li>
          <li>
            Back away past four meters, then close in again. Line up on two
            tags, then on one.
          </li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <p>
            Corrections stop past four meters and resume when you close in. With
            one tag in view the position moves and the heading does not.
          </p>
        </Box>
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
              "The code asks MegaTag1 first and reads fieldedTagCount off the answer. Below two tags it re-asks the same frame as MT2_WPIBLUE. MegaTag1 solves heading from the tag corners themselves, which is shaky off a single tag; MegaTag2 takes your heading as given and solves only position.",
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
              "The divisor is fieldedTagCount squared, so two tags divide by 4 and three divide by 9. One tag at 2 m gives about 0.77 m; two tags at the same distance give about 0.19 m.",
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
              "Why is Vision a field on Robot rather than something an OpMode creates?",
            options: [
              "OpMode constructors run before the drivetrain exists",
              "An OpMode is thrown away on a mode switch, and odometry has to keep being corrected in every mode",
              "Only Robot is allowed to construct a Limelight",
              "Vision only matters during autonomous, which Robot owns",
            ],
            correctAnswer: 1,
            explanation:
              "Each OpMode is built when its mode is picked and loses everything it set up when the mode changes. Vision is not a mode-specific behaviour: the pose estimator drifts in teleop, autonomous and disabled alike, so the update has to live where it survives all three.",
          },
        ]}
      />
    </PageTemplate>
  );
}
