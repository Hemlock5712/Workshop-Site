import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import ContentCard from "@/components/ContentCard";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
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

      {/* Pre-Season vs In-Season Timeline Visualization */}
      <div className="w-full my-8 space-y-6">
        {/* Pre-Season Section */}
        <div className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/50 dark:via-slate-900 dark:to-teal-950/50 p-6 shadow-lg shadow-emerald-500/10">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-md">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
                Before the Season
              </h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Can be done now with any robot
              </p>
            </div>
          </div>

          {/* Pre-Season Tasks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[
              {
                num: 1,
                label: "Drive/Steer Motor Tuning",
                icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
              },
              {
                num: 2,
                label: "Wheel Radius Calibration",
                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                num: 3,
                label: "Drivetrain Odometry",
                icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
              },
              {
                num: 4,
                label: "Camera Calibration",
                icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z",
              },
              {
                num: 5,
                label: "AprilTag Tuning",
                icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
              },
              {
                num: 6,
                label: "Robot Localization Fusion",
                icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
              },
              {
                num: 7,
                label: "Drive to Point",
                icon: "M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
              >
                <div className="bg-emerald-500 text-white rounded-lg w-7 h-7 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {item.num}
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Season Kickoff Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 rounded-full" />
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center gap-2 flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Season Kickoff
          </div>
          <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 rounded-full" />
        </div>

        {/* In-Season Section */}
        <div className="rounded-2xl border-2 border-rose-300 dark:border-rose-700 bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/50 dark:via-slate-900 dark:to-pink-950/50 p-6 shadow-lg shadow-rose-500/10">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white p-2.5 rounded-xl shadow-md">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-rose-800 dark:text-rose-300">
                After the Season Begins
              </h3>
              <p className="text-sm text-rose-600 dark:text-rose-400">
                Requires game-specific knowledge
              </p>
            </div>
          </div>

          {/* In-Season Tasks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600 transition-colors">
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-lg p-1.5 flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                  Autonomous Programming
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Field layout dependent
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-rose-200 dark:border-rose-800 hover:border-rose-400 dark:hover:border-rose-600 transition-colors">
              <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-lg p-1.5 flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                  Mechanism Programming
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Game piece dependent
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
