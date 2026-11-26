import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
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
 *
 * The install section went the same month: `1-Swerve` ships the LimelightLib
 * vendordep, so the pinned URL above now matters to whoever maintains that
 * branch, not to a student.
 *
 * Owner's review, November 2026 (Recording 13): `Vision` is built up in six
 * steps instead of pasted whole, with the explanation beside each step and the
 * long bullet list gone. The trust numbers moved out of constants and into
 * `addFrame`, the heading ternary became an `if`, and `addFrame` logs
 * `Vision/Accepted`, `Vision/TagCount` and `Vision/Pose` through Telemetry
 * (not AdvantageKit, which the course does not use), so Check your work reads
 * the log.
 *
 * Same review, the owner's follow-up: nobody knew where the old 0.333, 1.5 and
 * 1.2 power came from, so the formula was replaced by one a student can reason
 * about, `0.5 * distance / tagCount`. The share-per-picture rule on the page,
 * 0.1 / (0.1 + stdDev), is WPILib's closed-form gain with Phoenix's default
 * 0.1 odometry standard deviation, and it was measured on `swerve-vision` in
 * simulation: one `addVisionMeasurement` a meter away moved the pose 0.100 at
 * 0.9, 0.500 at 0.1, 0.167 at 0.5 and 0.048 at 2.0. The 0.5 and 1.0 starting
 * points are not tuned on a robot.
 *
 * November 2026, the fold: `DriveMechanism` is gone from the swerve chain and
 * `CommandSwerveDrivetrain` is the mechanism, so `Vision`'s field and
 * constructor take that class. `getPose()` is the project's own method on it,
 * and `addVisionMeasurement` is the Phoenix drivetrain's, called directly.
 * Packages moved: `Vision` and the drivetrain are both in
 * `first.robot.mechanisms`, so `Vision` needs no import for it. Nothing else
 * in `Vision` changed. The MegaTag2 comment in two blocks was also re-wrapped
 * to match the branch, which it had not.
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
          None of this runs in the simulator, because there is no camera. Check
          this page on the real robot.
        </p>
      </Box>

      <LessonSection id="the-vision-class" title="The Vision class">
        <p>
          The swerve project comes with LimelightLib installed, the same way it
          comes with Phoenix 6 and BLine. It gives you{" "}
          <code>com.limelightvision.Limelight</code>, one object per camera.
        </p>
        <DocumentationButton
          href="https://docs.limelightvision.io/docs/docs-limelight/apis/limelight-lib"
          title="Limelight: LimelightLib"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <p>
          Create <code>src/main/java/first/robot/mechanisms/Vision.java</code>.
          We will build it up a few lines at a time. Start with a class that
          remembers the drivetrain and makes one <code>Limelight</code> object
          per camera name.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/mechanisms/Vision.java"
          code={`package first.robot.mechanisms;

import com.limelightvision.Limelight;
import java.util.ArrayList;
import java.util.List;

public class Vision {
  private final CommandSwerveDrivetrain drivetrain;
  private final List<Limelight> cameras = new ArrayList<>();

  public Vision(CommandSwerveDrivetrain drivetrain, String... cameraNames) {
    this.drivetrain = drivetrain;
    for (String name : cameraNames) {
      Limelight camera = new Limelight(name);
      cameras.add(camera);
    }
  }
}`}
        />

        <p>
          Next, add an <code>update()</code> method that runs every loop. A
          camera drives nothing, so <code>Vision</code> is not a mechanism. The
          constructor hands <code>update()</code> to the scheduler instead.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/mechanisms/Vision.java"
          highlightLines={[5, 6, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]}
          code={`  public Vision(CommandSwerveDrivetrain drivetrain, String... cameraNames) {
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
  }`}
        />
        <p>
          <code>update()</code> first tells every camera which way the robot is
          facing. Then it walks <code>readResultsQueue()</code>, which hands
          back every frame that arrived since the last call, and passes each one
          to <code>addFrame</code>. We will write <code>addFrame</code> next, in
          four pieces.
        </p>

        <p>
          The camera can solve a frame two ways. MegaTag1 solves position and
          heading from the tags alone, and needs two or more tags to do it well.
          MegaTag2 takes the heading you shared as given and solves only
          position, so one tag is enough.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/mechanisms/Vision.java"
          code={`  private void addFrame(Limelight camera, LimelightResults frame) {
    // MegaTag1 solves position and heading from the tags alone. It needs two tags to do it well.
    PoseEstimate estimate = camera.getPoseEstimate(frame, PoseEstimateType.MT1_WPIBLUE);
    if (estimate.fieldedTagCount < 2) {
      // With one tag, ask again as MegaTag2. It takes our heading as given and solves only
      // position.
      estimate = camera.getPoseEstimate(frame, PoseEstimateType.MT2_WPIBLUE);
    }
  }`}
        />

        <p>
          Not every frame is worth using. <code>rejectionFlags</code> is the
          library&apos;s own verdict, and zero means it found nothing wrong. We
          also skip any frame whose tags average more than 4 meters away. Log
          the result so you can watch it, then stop if the frame was not
          accepted.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/mechanisms/Vision.java"
          code={`    // ... inside addFrame, under the if

    // Zero flags means the library found nothing wrong with the frame. Past 4 meters a tag is too
    // small in the picture to trust.
    boolean accepted = estimate.rejectionFlags == 0 && estimate.avgTagDistanceMeters <= 4.0;

    // Watch these in AdvantageScope. Pose is where the camera says the robot is.
    TelemetryTable table = Telemetry.getTable("Vision");
    table.log("Accepted", accepted);
    table.log("TagCount", estimate.fieldedTagCount);
    if (!accepted) {
      return;
    }
    table.log("Pose", estimate.pose);`}
        />

        <p>
          Each sighting goes in with a standard deviation, which says how far
          off it might be. That number decides how far one picture moves the
          pose toward where the camera says the robot is. The drivetrain trusts
          its own wheels to 0.1, so the share is 0.1 / (0.1 + standard
          deviation).
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>0.1 moves the pose halfway to the camera&apos;s answer.</li>
          <li>0.5 moves it a sixth of the way.</li>
          <li>0.9 moves it a tenth of the way.</li>
        </ul>
        <p>
          A small number makes the pose jump around with every noisy picture,
          and a big one keeps it calm but slow to correct. We start at 0.5 for
          one tag one meter away. The number grows with distance, because a far
          tag is a worse measurement. More tags shrink it, because several tags
          agree with each other. If the pose jumps around on your robot, raise
          the 0.5.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/mechanisms/Vision.java"
          code={`    // A standard deviation says how far off a sighting might be, and it sets how far each picture
    // moves the pose toward where the camera says the robot is. That share is 0.1 / (0.1 + stdDev):
    // 0.1 moves it halfway, 0.5 a sixth of the way, 0.9 a tenth. Bigger means calmer.
    // Start at 0.5 for one tag one meter away. Trust a far tag less and several tags more.
    double xyStdDev = 0.5 * estimate.avgTagDistanceMeters / estimate.fieldedTagCount; // meters
    double headingStdDev =
        1.0 * estimate.avgTagDistanceMeters / estimate.fieldedTagCount; // radians
    if (estimate.isMT2()) {
      // MegaTag2 solved from our own heading, so its heading is not a new measurement. A huge
      // number tells the estimator to ignore it.
      headingStdDev = 9_999_999;
    }`}
        />

        <p>
          Last, hand the sighting to the drivetrain. It takes{" "}
          <code>estimate.timestampSeconds</code>, not the current time, because
          the picture was taken before your code saw it.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/mechanisms/Vision.java"
          code={`    // The picture's own timestamp: the estimator winds back to when it was taken.
    drivetrain.addVisionMeasurement(
        estimate.pose,
        estimate.timestampSeconds,
        VecBuilder.fill(xyStdDev, xyStdDev, headingStdDev));
  }
}`}
        />

        <p>The finished file, with its imports:</p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/mechanisms/Vision.java"
          title="Vision.java"
          collapsed
          code={`package first.robot.mechanisms;

import com.limelightvision.Limelight;
import com.limelightvision.LimelightResults;
import com.limelightvision.PoseEstimate;
import com.limelightvision.PoseEstimateType;
import java.util.ArrayList;
import java.util.List;
import org.wpilib.command3.Scheduler;
import org.wpilib.math.linalg.VecBuilder;
import org.wpilib.telemetry.Telemetry;
import org.wpilib.telemetry.TelemetryTable;

/**
 * Feeds AprilTag sightings from every Limelight on the robot into the drivetrain's pose estimator,
 * so the camera pulls odometry back toward the truth.
 *
 * <p>A camera drives nothing, so this is not a {@code Mechanism}. It runs from the scheduler's
 * periodic list instead, every loop and in every mode.
 */
public class Vision {
  private final CommandSwerveDrivetrain drivetrain;
  private final List<Limelight> cameras = new ArrayList<>();

  /**
   * @param drivetrain the drivetrain whose pose estimate the cameras correct
   * @param cameraNames each camera's NetworkTables name, exactly as set in its web interface
   */
  public Vision(CommandSwerveDrivetrain drivetrain, String... cameraNames) {
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
    // MegaTag1 solves position and heading from the tags alone. It needs two tags to do it well.
    PoseEstimate estimate = camera.getPoseEstimate(frame, PoseEstimateType.MT1_WPIBLUE);
    if (estimate.fieldedTagCount < 2) {
      // With one tag, ask again as MegaTag2. It takes our heading as given and solves only
      // position.
      estimate = camera.getPoseEstimate(frame, PoseEstimateType.MT2_WPIBLUE);
    }

    // Zero flags means the library found nothing wrong with the frame. Past 4 meters a tag is too
    // small in the picture to trust.
    boolean accepted = estimate.rejectionFlags == 0 && estimate.avgTagDistanceMeters <= 4.0;

    // Watch these in AdvantageScope. Pose is where the camera says the robot is.
    TelemetryTable table = Telemetry.getTable("Vision");
    table.log("Accepted", accepted);
    table.log("TagCount", estimate.fieldedTagCount);
    if (!accepted) {
      return;
    }
    table.log("Pose", estimate.pose);

    // A standard deviation says how far off a sighting might be, and it sets how far each picture
    // moves the pose toward where the camera says the robot is. That share is 0.1 / (0.1 + stdDev):
    // 0.1 moves it halfway, 0.5 a sixth of the way, 0.9 a tenth. Bigger means calmer.
    // Start at 0.5 for one tag one meter away. Trust a far tag less and several tags more.
    double xyStdDev = 0.5 * estimate.avgTagDistanceMeters / estimate.fieldedTagCount; // meters
    double headingStdDev =
        1.0 * estimate.avgTagDistanceMeters / estimate.fieldedTagCount; // radians
    if (estimate.isMT2()) {
      // MegaTag2 solved from our own heading, so its heading is not a new measurement. A huge
      // number tells the estimator to ignore it.
      headingStdDev = 9_999_999;
    }

    // The picture's own timestamp: the estimator winds back to when it was taken.
    drivetrain.addVisionMeasurement(
        estimate.pose,
        estimate.timestampSeconds,
        VecBuilder.fill(xyStdDev, xyStdDev, headingStdDev));
  }
}`}
        />
      </LessonSection>

      <LessonSection id="start-it-in-robot" title="Start it in Robot">
        <p>
          Add one field to <code>Robot</code>, under the drivetrain. An OpMode
          is thrown away on every mode switch, and vision has to keep correcting
          in every mode.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/Robot.java"
          highlightLines={[2, 8, 9]}
          code={`import first.robot.mechanisms.CommandSwerveDrivetrain;
import first.robot.mechanisms.Vision;

// ... the other imports, unchanged

public class Robot extends OpModeRobot {
  public final CommandSwerveDrivetrain drivetrain = TunerConstants.createDrivetrain();
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
          Deploy, put the robot on the floor with a tag in view, and open
          AdvantageScope. Put <code>Drivetrain/Pose</code> and{" "}
          <code>Vision/Pose</code> on the 2D field, and watch{" "}
          <code>Vision/Accepted</code> and <code>Vision/TagCount</code>.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>Park about two meters from a tag.</li>
          <li>Back away past four meters, then close in again.</li>
        </ol>

        <Box variant="alert-success" title="You should see">
          <p>
            Near the tag, <code>Accepted</code> true and the two poses on top of
            each other. Past four meters <code>Accepted</code> goes false and{" "}
            <code>Vision/Pose</code> stops updating, then both come back when
            you close in.
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
              "The code asks MegaTag1 first and reads fieldedTagCount off the answer. Below two tags it asks the same frame again as MegaTag2, which takes your heading as given and solves only position.",
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
              "Camera frames and robot loops do not line up. Some loops see no new frame and some see two. The queue hands you exactly what arrived.",
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
              "Zero means no gate fired. The defaults reject a lone tag past three meters or with ambiguity over 0.7. When a flag is set, PoseEstimateConfig.describeRejection names the reason.",
          },
          {
            id: 4,
            question:
              "Why does addVisionMeasurement take estimate.timestampSeconds instead of the current time?",
            options: [
              "The current time is not available inside a periodic method",
              "The estimator rejects any measurement stamped with the current time",
              "The timestamp tells the estimator which camera sent the frame",
              "The picture was taken before your code saw it, so the sighting belongs to that earlier moment",
            ],
            correctAnswer: 3,
            explanation:
              "A frame takes time to process and arrive, and the robot keeps moving. The estimator needs to know when the picture was taken to place the sighting correctly.",
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
              "MegaTag2 is handed your gyro heading and solves only position. Its reported heading is your own heading coming back, so a huge deviation tells the estimator to ignore it.",
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
              "Each OpMode is built when its mode is picked and thrown away when the mode changes. Odometry drifts in every mode, so Vision lives on Robot, which lasts through all of them.",
          },
        ]}
      />
    </PageTemplate>
  );
}
