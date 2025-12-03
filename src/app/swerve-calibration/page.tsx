import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import ContentCard from "@/components/ContentCard";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import ImageBlock from "@/components/ImageBlock";
import { Book, Settings, Lightbulb, AlertTriangle } from "lucide-react";

export default function OdometryCalibration() {
  return (
    <PageTemplate
      title="Swerve Calibration"
      previousPage={{
        href: "/pathplanner",
        title: "Adding PathPlanner",
      }}
      nextPage={{ href: "/logging-options", title: "Logging Options" }}
    >
      <KeyConceptSection
        title="Swerve Calibration"
        description="Proper calibration is the foundation of accurate autonomous performance. This includes tuning swerve motor gains, configuring drive request types, preventing wheel slip, finding effective wheel radius, configuring camera positions, and tuning PID controllers for path following."
        concept="Calibration transforms theoretical parameters into real-world accuracy."
      />

      <p className="text-slate-600 dark:text-slate-300 text-center -mt-4">
        Accurate calibration ensures your robot knows exactly where it is on the
        field, enabling precise autonomous movement and vision integration.
        Below is a graphic showing the order we follow when setting up a robot.
      </p>

      <ImageBlock
        src="/images/odometry-setup/Robot Flowchart.png"
        alt="Odometry calibration setup showing measurement procedure"
      />

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Motor Calibration & Tuning
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Follow these steps in order to properly tune your swerve drive motors
          and configure optimal drive performance. Each step builds on the
          previous one to ensure accurate odometry and reliable autonomous
          operation.
        </p>

        {/* Step 1: Tune steerGains */}
        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-primary-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Tune steerGains (TunerConstants.java)
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Before diving into code, ensure your hardware is ready. We
                strongly recommend following the{" "}
                <a
                  href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/tuner-swerve/index.html"
                  className="text-primary-600 underline hover:no-underline dark:text-primary-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official CTRE Swerve Setup Guide
                </a>{" "}
                for the initial configuration using Phoenix Tuner X.
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Configure PID gains for your swerve module steering motors to
                ensure accurate module angle control.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Tuning Procedure:
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                Use the <strong>Turret tuning instructions</strong> from the{" "}
                <a
                  href="/pid-control"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                >
                  PID Control page
                </a>{" "}
                to tune your steer gains. The steering motors behave like a
                rotational mechanism (similar to a turret) and require
                position-based PID tuning.
              </p>
            </div>

            <Box
              variant="alert-info"
              title="Reference: Turret PID Tuning"
              icon={<Book className="w-5 h-5" />}
            >
              <p>
                The Turret section on the{" "}
                <a
                  href="/pid-control"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                >
                  PID Control page
                </a>{" "}
                provides detailed examples of position-based PID tuning.
              </p>
            </Box>
          </div>
        </ContentCard>

        {/* Step 2: Tune driveGains */}
        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Tune driveGains (TunerConstants.java)
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Configure velocity PID gains for your drive motors to ensure
                accurate speed control.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Two-Phase Tuning Approach:
              </h4>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Phase 1: Initial Tuning (Wheels Off Ground)
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Use the <strong>Flywheel tuning instructions</strong> from
                    the{" "}
                    <a
                      href="/pid-control"
                      className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                    >
                      PID Control page
                    </a>
                    . Start with the robot&apos;s wheels off the ground to tune
                    velocity control without friction interference.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <li>
                      Set up velocity control using VelocityVoltage control
                      request
                    </li>
                    <li>
                      Tune kP, kI, and kD values to achieve smooth velocity
                      tracking
                    </li>
                    <li>
                      Configure feedforward gains (kV for velocity, kS for
                      static friction)
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Phase 2: Fine-Tuning kP (On the Ground)
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    Once basic velocity control works, place the robot on the
                    ground and fine-tune kP to account for real-world friction
                    and load:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <li>
                      Test velocity tracking while driving on carpet/competition
                      surface
                    </li>
                    <li>
                      Adjust kP if you observe steady-state velocity errors
                    </li>
                    <li>
                      Verify smooth acceleration and deceleration without
                      oscillation
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Box
              variant="alert-info"
              title="Reference: Flywheel PID Tuning"
              icon={<Book className="w-5 h-5" />}
            >
              <p>
                The Flywheel section on the{" "}
                <a
                  href="/pid-control"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
                >
                  PID Control page
                </a>{" "}
                provides detailed examples of velocity-based PID tuning with
                VelocityVoltage control requests.
              </p>
            </Box>
          </div>
        </ContentCard>

        {/* Step 3: Update DriveRequestType */}
        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-primary-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Update DriveRequestType (RobotContainer.java)
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Configure the drive system to use velocity-based control for
                more precise speed tracking.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Configuration Changes (done if using our example code on last
                page):
              </h4>
              <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>1. Change drive request type:</strong> Modify{" "}
                  <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    .withDriveRequestType()
                  </code>{" "}
                  to use{" "}
                  <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    DriveRequestType.Velocity
                  </code>
                </li>
                <li>
                  <strong>2. Remove deadband:</strong> Remove CTR deadband. The
                  current implementation they have elements small input values,
                  which hinders precise low-speed control.
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                <strong>Example code change:</strong>
              </p>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto">
                {`// Before
.withDriveRequestType(DriveRequestType.OpenLoopVoltage)
.withDeadband(MaxSpeed * 0.1)

// After
.withDriveRequestType(DriveRequestType.Velocity)
// Deadband removed for precise control`}
              </pre>
            </div>
          </div>
        </ContentCard>

        {/* Step 4: Find kSlipCurrent */}
        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Find kSlipCurrent (RobotContainer.java)
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Determine the stator current limit that prevents wheel slip
                while maximizing traction and power transfer.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                How Stator Current Limits Prevent Wheel Slip:
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                Stator current is the output current of the motor and is
                directly proportional to torque. By restricting stator current,
                you cap the torque output, which prevents wheels from spinning
                faster than the friction between tire and floor can support.
                This maximizes traction and power transfer to the ground.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Step-by-Step Procedure:
              </h4>
              <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex gap-3">
                  <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <strong>Position the robot:</strong> Place your robot up
                    against a wall on carpet (to simulate match conditions)
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <strong>Open Phoenix Tuner X:</strong> Begin plotting both
                    velocity and stator current in real-time
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="bg-orange-700 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <strong>Gradually increase voltage:</strong> Slowly increase
                    voltage output until velocity becomes non-zero (wheels start
                    slipping) and stator current drops noticeably
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="bg-orange-800 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <strong>Record the slip threshold:</strong> The stator
                    current value where wheels begin slipping (velocity spikes)
                    represents your threshold
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="bg-orange-900 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0 text-xs">
                    5
                  </span>
                  <div>
                    <strong>Set the limit:</strong> Configure your stator
                    current limit to a value slightly below this observed value
                    for a safety margin
                  </div>
                </li>
              </ol>
            </div>

            <Box
              variant="alert-warning"
              title="Important Considerations"
              icon={<AlertTriangle className="w-5 h-5" />}
            >
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Testing environment matters:</strong> Always test on
                  carpet against a wall to accurately simulate match conditions
                </li>
                <li>
                  <strong>Conservative tuning:</strong> Set limits below the
                  slip point to maintain a safety margin
                </li>
                <li>
                  <strong>Performance tradeoff:</strong> Stator limits restrict
                  acceleration. Setting limits too low degrades responsiveness
                </li>
                <li>
                  <strong>Monitor during testing:</strong> Watch for the
                  characteristic velocity spike that indicates slip occurrence
                </li>
              </ul>
            </Box>

            <DocumentationButton
              href="https://v6.docs.ctr-electronics.com/en/stable/docs/hardware-reference/talonfx/improving-performance-with-current-limits.html#preventing-wheel-slip"
              title="CTRE: Preventing Wheel Slip Documentation"
              icon={<Book className="w-5 h-5" />}
            />
          </div>
        </ContentCard>

        {/* Step 5: Tune kWheelRadius */}
        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Tune kWheelRadius (TunerConstants.java)
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Find the effective wheel radius by comparing actual distance
                traveled vs. what the robot reports.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Quick Calibration Procedure:
              </h4>
              <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>1. Drive slowly forward:</strong> Command the robot to
                  drive straight at low speed (to minimize slip)
                </li>
                <li>
                  <strong>2. Measure actual distance:</strong> Use a tape
                  measure to record how far the robot actually moved
                </li>
                <li>
                  <strong>3. Read reported distance:</strong> Check the distance
                  the robot thinks it traveled from odometry
                </li>
                <li>
                  <strong>4. Calculate new radius:</strong> Use the formula:{" "}
                  <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    kWheelRadius = (actualDistance / reportedDistance) *
                    currentRadius
                  </code>
                </li>
              </ol>
            </div>
          </div>
        </ContentCard>

        {/* Step 6: Find kSpeedAt12Volts */}
        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              6
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Find kSpeedAt12Volts (TunerConstants.java)
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Measure your robot&apos;s maximum velocity to configure accurate
                feedforward gains.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Measurement Procedure:
              </h4>
              <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>1. Drive at maximum speed:</strong> Command the robot
                  to drive straight at full throttle
                </li>
                <li>
                  <strong>2. Record peak velocity:</strong> Log the maximum
                  velocity achieved from odometry (in meters/second)
                </li>
                <li>
                  <strong>3. Update TunerConstants:</strong> Set{" "}
                  <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    kSpeedAt12Volts
                  </code>{" "}
                  to this measured value
                </li>
              </ol>
            </div>

            <Box
              variant="alert-info"
              title="Testing Conditions"
              icon={<Settings className="w-5 h-5" />}
            >
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Preferred:</strong> Test on the ground (carpet or
                  competition surface) for most accurate results
                </li>
                <li>
                  <strong>Alternative:</strong> Testing in the air (wheels off
                  ground) is acceptable for initial testing, but may yield
                  slightly different results
                </li>
                <li>Use the on-ground measurement for final competition</li>
              </ul>
            </Box>

            <Box variant="alert-warning" title="Zeroing Procedure">
              <p>
                Zeroing your modules is critical for straight driving. We
                recommend using a <strong>straight edge</strong> (like a long
                piece of metal or 2x4) pressed against the wheel modules to
                physically align them perfectly straight before saving the zero
                positions in Tuner X.
              </p>
            </Box>
          </div>
        </ContentCard>

        <Box
          variant="alert-tip"
          title="Encoder Security"
          icon={<Lightbulb className="w-5 h-5" />}
        >
          <p>
            <strong>Highly Recommended:</strong> Glue your drive encoders in
            place to prevent them from shifting during impacts or aggressive
            movements. Even small encoder shifts can cause significant odometry
            drift.
          </p>
        </Box>
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What is the first step in the odometry calibration process?",
              options: [
                "Measure wheel diameter with calipers",
                "Tune drive and turning motors",
                "Calibrate the camera",
                "Create PathPlanner paths",
              ],
              correctAnswer: 1,
              explanation:
                "The calibration flowchart shows that tuning drive and turning motors is the first step. This ensures motors respond correctly to commands and maintain accurate position tracking before proceeding with other calibrations.",
            },
            {
              id: 2,
              question:
                "Why is effective wheel radius different from the nominal wheel diameter?",
              options: [
                "Manufacturing tolerances in the wheels",
                "Wheel compression, tread wear, and carpet interaction",
                "Temperature changes during operation",
                "Motor gear ratios affect the measurement",
              ],
              correctAnswer: 1,
              explanation:
                "The effective wheel radius accounts for real-world factors like wheel compression under robot weight, tread wear over time, and how the wheel interacts with carpet surfaces. These factors cause the actual distance traveled to differ from theoretical calculations.",
            },
            {
              id: 3,
              question:
                "How do you calculate the effective wheel radius from a drive test?",
              options: [
                "Divide sensor distance by actual distance",
                "Multiply (actual distance / sensor distance) by current radius",
                "Add the difference to the nominal radius",
                "Average multiple wheel diameter measurements",
              ],
              correctAnswer: 1,
              explanation:
                "The formula is: effectiveRadius = (actualDistance / sensorDistance) * currentRadius. This ratio corrects your theoretical radius based on how far the robot actually moved compared to what the sensors reported.",
            },
            {
              id: 4,
              question:
                "Why is it recommended to glue drive encoders in place?",
              options: [
                "To protect them from water damage",
                "To prevent them from shifting during impacts, which causes odometry drift",
                "To improve their accuracy",
                "To reduce electrical noise",
              ],
              correctAnswer: 1,
              explanation:
                "Even small encoder shifts caused by impacts or aggressive movements can cause significant odometry drift. Gluing encoders in place ensures they maintain their position and continue to provide accurate measurements throughout competition.",
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          What&apos;s Next?
        </h2>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-l-4 border-green-500">
          <h3 className="text-xl font-semibold text-green-900 dark:text-green-300 mb-4">
            Up Next: Logging Options
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            With your swerve drive fully calibrated, you&apos;re ready to
            explore data logging strategies. You&apos;ll learn about different
            logging frameworks, what data to log, and how to use logs for
            debugging and performance analysis.
          </p>
        </div>
      </section>
    </PageTemplate>
  );
}
