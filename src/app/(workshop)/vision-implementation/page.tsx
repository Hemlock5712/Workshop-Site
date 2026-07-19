import PageTemplate from "@/components/PageTemplate";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import GitHubContent from "@/components/GitHubContent";
import DocumentationButton from "@/components/DocumentationButton";
import ContentCard from "@/components/ContentCard";
import CodeBlock from "@/components/CodeBlock";
import Quiz from "@/components/Quiz";
import { Link, Tag, Camera } from "lucide-react";

export default function VisionImplementation() {
  return (
    <PageTemplate title="Implementing Vision">
      <KeyConceptSection
        title="Integrating Vision into Robot Code"
        description="Vision integration means reading NetworkTables data, feeding AprilTag measurements into odometry, and using vision feedback for control."
        concept="Vision-corrected odometry is what makes accurate autonomous and teleop assists possible."
      />

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Vision Implementation Strategy
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Four steps get Limelight data into your robot&apos;s odometry without
          letting bad readings wreck the pose estimate.
        </p>

        <div className="grid md:grid-cols-1 gap-6">
          <ContentCard>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
              🚀 Implementation Sequence
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-950/20 rounded-lg">
                <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-primary-700 dark:text-primary-300">
                    LimelightHelpers Library
                  </h4>
                  <p className="text-primary-600 dark:text-primary-400 text-sm">
                    First, import the Limelight helper library available on
                    GitHub. It contains pre-built NetworkTables wrappers that
                    provide clean access to vision data without manual
                    NetworkTables subscriptions.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-primary-800 dark:text-primary-200">
                    Limelight Subsystem
                  </h4>
                  <p className="text-primary-700 dark:text-primary-300 text-sm">
                    Next, create a new subsystem to pull values using the
                    Limelight helper tool. The pose estimator needs three things
                    from it: pose, timestamp, and standard deviation (how much
                    we trust the reading). Pose and timestamp come straight from
                    LimelightHelpers; the trust formula we have to write
                    ourselves.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary-200 dark:bg-primary-800/40 rounded-lg">
                <div className="bg-primary-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-primary-900 dark:text-primary-100">
                    CTRE Pose Estimator
                  </h4>
                  <p className="text-primary-800 dark:text-primary-200 text-sm">
                    Once we have those three values, pass them into the CTRE
                    pose estimator, which has built-in methods for exactly this.
                    The vision subsystem needs a reference to the pose estimator
                    so it can add measurements.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-primary-300 dark:bg-primary-700/50 rounded-lg">
                <div className="bg-primary-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-primary-950 dark:text-white">
                    Wire it up in Robot
                  </h4>
                  <p className="text-primary-900 dark:text-primary-100 text-sm">
                    The drivetrain owns the pose estimator. In the OpMode model
                    you wire the camera up once in <code>Robot</code>&apos;s
                    constructor (e.g.{" "}
                    <code>
                      Limelight.registerAll(drivetrain, &quot;limelight&quot;)
                    </code>
                    ), passing it the drivetrain so it can add measurements.
                  </p>
                </div>
              </div>
            </div>
          </ContentCard>
        </div>

        <Box variant="alert-info" title="Why This Approach?">
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>
              <strong>Library First:</strong> LimelightHelpers abstracts
              NetworkTables complexity.
            </li>
            <li>
              <strong>Validation Layer:</strong> The Limelight subsystem filters
              bad measurements before they make it to your pose estimate
            </li>
            <li>
              <strong>Dynamic Trust:</strong> Standard deviations adjust based
              on measurement quality, preventing bad data from degrading
              odometry
            </li>
          </ul>
        </Box>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Standard Deviation & Filtering
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Trusting vision data correctly is just as important as receiving it.
          We use dynamic standard deviations plus a few filters so only good
          measurements reach the odometry.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <ContentCard>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Formula for Workshop
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
              We use a simple formula based on tag count and distance. As the
              robot gets further from tags, the standard deviation increases
              (trust decreases). More tags visible decreases the standard
              deviation (trust increases).
            </p>
            <CodeBlock
              language="java"
              title="Standard Deviation Formula"
              code={`double xyStandardDev = 0.5 * Math.pow(poseEstimate.avgTagDist, 2.0) / poseEstimate.tagCount;
double rotationStandardDev = 5.0 * Math.pow(poseEstimate.avgTagDist, 2.0) / poseEstimate.tagCount;`}
            />
          </ContentCard>

          <ContentCard>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Suggested Filtering Strategies
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm">
              Beyond the formula, we apply several filters to reject bad data
              entirely:
            </p>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary-600">•</span>
                <span>
                  <strong>Field Boundary Check:</strong> Reject poses that are
                  outside the field perimeter.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary-600">•</span>
                <span>
                  <strong>Ambiguity Filter:</strong> For single-tag detections,
                  reject if the ambiguity score is too high (indicating the tag
                  might be flipped).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary-600">•</span>
                <span>
                  <strong>Z-Height Check:</strong> Reject poses where the robot
                  is calculated to be flying or underground.
                </span>
              </li>
            </ul>
          </ContentCard>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Camera Setup & Calibration
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Calibration matters: if the camera&apos;s mounting offsets or lens
          distortion are wrong, every pose it reports is wrong too.
        </p>

        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Limelight Camera Configuration
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Set up your Limelight camera with proper positioning, focus, and
                calibration.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-950/20 rounded-lg">
                <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-primary-700 dark:text-primary-300">
                    Change Pipeline to AprilTag
                  </h4>
                  <p className="text-primary-600 dark:text-primary-400 text-sm">
                    Access the Limelight web interface and switch the active
                    pipeline to AprilTag mode. This enables 3D pose estimation
                    using AprilTags for accurate robot localization.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <div className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-primary-800 dark:text-primary-200">
                    Adjust Exposure
                  </h4>
                  <p className="text-primary-700 dark:text-primary-300 text-sm">
                    In the camera settings, reduce the exposure as low as
                    possible while still reliably detecting AprilTags. Lower
                    exposure reduces motion blur and improves tag detection
                    accuracy during fast robot movement.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-primary-200 dark:bg-primary-800/40 rounded-lg">
                <div className="bg-primary-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-primary-900 dark:text-primary-100">
                    Set Camera Offsets
                  </h4>
                  <p className="text-primary-800 dark:text-primary-200 text-sm">
                    Accurately measure and enter your camera&apos;s position and
                    angle relative to the robot&apos;s center. This transform is
                    critical for converting camera detections into accurate
                    field-relative robot poses. Follow the{" "}
                    <a
                      href="https://docs.limelightvision.io/docs/docs-limelight/pipeline-apriltag/apriltag-3d#full-3d-tracking"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      Limelight documentation
                    </a>{" "}
                    for detailed instructions.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-primary-300 dark:bg-primary-700/50 rounded-lg">
                <div className="bg-primary-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-primary-950 dark:text-white">
                    Camera Calibration
                  </h4>
                  <p className="text-primary-900 dark:text-primary-100 text-sm">
                    Use a Limelight calibration board to calibrate your camera.
                    This corrects for lens distortion and improves pose
                    accuracy, especially at the edges of the field of view.
                    Follow the{" "}
                    <a
                      href="https://docs.limelightvision.io/docs/docs-limelight/getting-started/performing-charuco-camera-calibration"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      Limelight Calibration Guide
                    </a>{" "}
                    for detailed instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Reading Limelight Data
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Limelight publishes vision data to NetworkTables. The LimelightHelpers
          library (published by Limelight on GitHub) gives you a clean API for
          reading this data without direct NetworkTables access. Limelight
          distributes it against the current-season WPILib packages, so the
          workshop repo carries a copy migrated to the 2027{" "}
          <code>org.wpilib.*</code> packages — that copy is what the code below
          uses.
        </p>

        <CollapsibleSection title="LimelightHelpers.java">
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="3-Limelight"
            filePath="src/main/java/frc/robot/LimelightHelpers.java"
            title="LimelightHelpers"
            description="The workshop's copy of LimelightHelpers, migrated to the WPILib 2027 packages. This is the exact file the Limelight subsystem below uses to retrieve pose estimates and raw vision measurements."
          />
        </CollapsibleSection>

        <CollapsibleSection title="Limelight.java">
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="3-Limelight"
            filePath="src/main/java/frc/robot/subsystems/Limelight.java"
            title="Limelight Code"
            description="Subsystem that pulls robot pose from LimelightHelpers, validates the estimate, models measurement noise from tag distance/count, and feeds pose+timestamp+std devs to a consumer (e.g., your drivetrain pose estimator). Caches the last valid estimate and exposes getters for logging."
          />
        </CollapsibleSection>
        <CollapsibleSection title="Robot.java (vision wiring)">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Vision is wired up once in <code>Robot</code>&apos;s constructor:{" "}
            <code>Limelight.registerAll(drivetrain, ...)</code> creates each
            camera and registers its per-loop <code>update()</code> on the
            scheduler. Shared subsystems like the drivetrain live on{" "}
            <code>Robot</code> as <code>public final</code> fields, and each
            OpMode reaches them through the <code>Robot</code> reference it is
            constructed with.
          </p>
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            branch="3-Limelight"
            filePath="src/main/java/frc/robot/Robot.java"
            pr={{ number: 9, focusFile: "Robot.java" }}
          />
        </CollapsibleSection>

        <Box
          variant="alert-info"
          tag="NOTE · VISION ARCHITECTURE"
          title="The camera isn't a Mechanism"
        >
          <p>
            The Limelight owns no actuators, so it isn&apos;t a{" "}
            <code>Mechanism</code> — it&apos;s a plain class whose{" "}
            <code>update()</code> is registered on the scheduler with{" "}
            <code>Scheduler.getDefault().addPeriodic(camera::update)</code>,
            wired up once from <code>Robot</code>&apos;s constructor via{" "}
            <code>Limelight.registerAll(drivetrain, ...)</code>. Its job is to
            read <code>LimelightHelpers</code> / NetworkTables, validate the
            pose estimate, model the measurement noise (std devs) from tag
            distance and count, and feed{" "}
            <code>
              drivetrain.addVisionMeasurement(pose, timestamp, stdDevs)
            </code>
            .
          </p>
          <p style={{ marginTop: 8 }}>
            <code>Utils.fpgaToCurrentTime(...)</code> was removed (Phoenix 6 now
            shares the WPILib timebase), so vision timestamps go straight to the
            pose estimator without any conversion. The team&apos;s reference
            implementation is{" "}
            <a
              href="https://github.com/Hemlock5712/2027-Template/blob/2027-dev/src/main/java/frc/robot/subsystems/vision/Limelight.java"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Limelight.java in the 2027-Template
            </a>
            .
          </p>
        </Box>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Workshop Code Implementation
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Everything above comes straight from the <code>3-Limelight</code>{" "}
          branch of the Workshop-Code repository, which integrates the Limelight
          with the swerve drive and odometry. Reference the full working project
          and adapt it for your own robot.
        </p>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Vision Best Practices
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Box variant="alert-success" title="Do">
            <ul className="list-disc list-inside space-y-2">
              <li>Validate vision data before using it</li>
              <li>Account for latency (automatically done)</li>
              <li>Use appropriate standard deviations</li>
              <li>Test different exposures (lower is better)</li>
              <li>Log vision data for debugging</li>
            </ul>
          </Box>

          <Box variant="alert-danger" title="Don&rsquo;t">
            <ul className="list-disc list-inside space-y-2">
              <li>Trust vision measurements blindly</li>
              <li>Ignore latency compensation</li>
              <li>Use vision as only odometry source</li>
              <li>Forget to tune camera settings</li>
              <li>Skip testing in match conditions</li>
            </ul>
          </Box>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Additional Resources
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <DocumentationButton
            href="https://docs.limelightvision.io/docs/docs-limelight/apis/complete-networktables-api"
            title="Limelight NetworkTables API"
            icon={<Link className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://docs.wpilib.org/en/stable/docs/software/vision-processing/apriltag/apriltag-intro.html"
            title="WPILib AprilTag Guide"
            icon={<Tag className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <AlphaStatusNote />

        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What is the primary purpose of the LimelightHelpers library?",
              options: [
                "To control motor speeds",
                "To provide clean NetworkTables access for vision data without manual subscriptions",
                "To generate camera calibration files",
                "To replace the gyroscope",
              ],
              correctAnswer: 1,
              explanation:
                "LimelightHelpers abstracts NetworkTables complexity by providing pre-built wrappers that give clean access to vision data without requiring manual NetworkTables subscriptions.",
            },
            {
              id: 2,
              question:
                "What three values are needed to add vision measurements to the pose estimator?",
              options: [
                "X position, Y position, rotation",
                "Pose, timestamp, and standard deviation",
                "Distance, angle, and velocity",
                "Camera height, tilt angle, and exposure",
              ],
              correctAnswer: 1,
              explanation:
                "To add vision measurements to the pose estimator, you need: the pose (robot position from vision), the timestamp (when the measurement was taken), and standard deviation (how much to trust the reading).",
            },
            {
              id: 3,
              question:
                "Why is standard deviation important when integrating vision data?",
              options: [
                "It determines camera resolution",
                "It controls how much to trust vision measurements, preventing bad data from degrading odometry",
                "It sets the camera exposure time",
                "It adjusts motor PID gains",
              ],
              correctAnswer: 1,
              explanation:
                "Standard deviation determines how much the pose estimator should trust a vision measurement. Dynamic standard deviations based on tag count and distance prevent bad measurements from corrupting the robot's position estimate.",
            },
            {
              id: 4,
              question:
                "What does the Limelight subsystem do before passing data to the pose estimator?",
              options: [
                "It increases camera exposure",
                "It validates and filters bad measurements",
                "It resets the gyroscope",
                "It adjusts motor speeds",
              ],
              correctAnswer: 1,
              explanation:
                "The Limelight subsystem acts as a validation layer that filters bad measurements (poor quality, incorrect data) before they reach the pose estimator, protecting odometry accuracy.",
            },
            {
              id: 5,
              question:
                "How should standard deviation typically change with tag distance and count?",
              options: [
                "Standard deviation stays constant regardless of conditions",
                "Standard deviation increases with distance and decreases with more tags visible",
                "Standard deviation decreases with distance",
                "Standard deviation only depends on camera exposure",
              ],
              correctAnswer: 1,
              explanation:
                "Standard deviation should increase with distance (farther tags = less accurate) and decrease with more tags visible (more tags = more confident measurement). This models measurement uncertainty appropriately.",
            },
            {
              id: 6,
              question:
                "What should you do after properly focusing a Limelight camera lens?",
              options: [
                "Leave it as-is for future adjustments",
                "Glue the lens in place to prevent shifting",
                "Cover it with tape for protection",
                "Record the focus setting in your code",
              ],
              correctAnswer: 1,
              explanation:
                "Once the Limelight lens is properly focused for your AprilTag detection distance, you should glue the lens in place to prevent it from shifting due to robot vibrations during competition, which would ruin your calibration.",
            },
          ]}
        />
      </section>

      {/* What's Next Section */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What&apos;s Next?
        </h2>

        <Box variant="alert-success" title="Up Next: Dynamic Flywheel">
          With vision integrated into your odometry, you&apos;re ready to
          implement dynamic flywheel control using vision-based distance
          measurements to shoot accurately from anywhere on the field.
        </Box>
      </section>
    </PageTemplate>
  );
}
