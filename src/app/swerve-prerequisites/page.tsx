import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import ContentCard from "@/components/ContentCard";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { Book, MapPin, Lightbulb } from "lucide-react";
import Image from "next/image";

export default function SwervePrerequisites() {
  return (
    <PageTemplate
      title="Swerve Drive Prerequisites"
      previousPage={{ href: "/motion-magic", title: "Motion Magic" }}
      nextPage={{
        href: "/swerve-drive-project",
        title: "Creating a Swerve Drive Project",
      }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="Understanding Swerve Drive Fundamentals"
        description="Before diving into swerve drive implementation, it's essential to understand the core concepts, hardware components, and control systems that make swerve drive possible. This foundation will prepare you for successfully creating and tuning your swerve drivetrain."
        concept="Master the fundamentals of swerve drive: holonomic motion, coordinate systems, module anatomy, and field-centric control."
      />

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Swerve Module Anatomy
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Each swerve module consists of three key components that work together
          to provide independent wheel control:
        </p>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          <ContentCard>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-4 rounded-lg mb-4">
              <h3 className="text-xl font-bold text-primary-900 dark:text-primary-300">
                Drive Motor
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Controls the wheel speed and provides forward/backward motion for
              the module. Typically a high-power motor like Kraken X60 or Falcon
              500.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>Purpose:</strong> Translational velocity control
                <br />
                <strong>Control:</strong> Velocity PID or voltage control
                <br />
                <strong>Sensor:</strong> Integrated encoder for speed feedback
              </p>
            </div>
          </ContentCard>

          <ContentCard>
            <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg mb-4">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-300">
                Turning Motor
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Steers the module by rotating the wheel to the desired angle.
              Requires precise position control with absolute encoder feedback.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>Purpose:</strong> Wheel direction control
                <br />
                <strong>Control:</strong> Position PID with Motion Magic
                <br />
                <strong>Sensor:</strong> Absolute encoder (CANcoder) for angle
              </p>
            </div>
          </ContentCard>

          <ContentCard>
            <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-lg mb-4">
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-300">
                CANcoder
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Absolute position sensor that tracks the steering angle. Critical
              for module zeroing and maintaining accurate wheel orientation.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <strong>Purpose:</strong> Absolute angle measurement
                <br />
                <strong>Type:</strong> WCP ThroughBore or CANcoder V2
                <br />
                <strong>Units:</strong> Rotations (0 to 1.0)
              </p>
            </div>
          </ContentCard>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Hardware Setup & Wiring
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Proper wiring and CAN ID configuration are essential for a reliable
          swerve drive. We recommend the following standard configuration for
          all our robots.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <ContentCard>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Recommended CAN ID Scheme
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Drive Motors:</strong> 1, 3, 5, 7 (FL, FR, BL, BR)
                </li>
                <li>
                  <strong>Steer Motors:</strong> 2, 4, 6, 8 (FL, FR, BL, BR)
                </li>
                <li>
                  <strong>CANcoders:</strong> 9, 10, 11, 12 (FL, FR, BL, BR)
                </li>
                <li>
                  <strong>Pigeon 2 Gyro:</strong> 13
                </li>
              </ul>
            </div>
          </ContentCard>
        </div>

        <Box variant="alert-tip" title="Why Use a CANivore?">
          <p className="mb-2">
            A <strong>CANivore</strong> is a USB-to-CAN adapter that creates a
            separate, high-speed CAN FD bus.
          </p>
          <p>
            <strong>Benefit:</strong> It allows you to run your swerve motors at
            a much higher refresh rate (250Hz vs 50Hz on the native RIO bus).
            This significantly improves the responsiveness and smoothness of
            your swerve drive control loop.
          </p>
        </Box>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Coordinate Systems &amp; Reference Frames
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Understanding coordinate systems is crucial for swerve drive control.
          You need to know whether movements are relative to the robot or the
          field.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <ContentCard>
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">
              Robot-Centric (Robot Frame)
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              All movements are relative to the robot&apos;s current
              orientation. Forward is always toward the front of the robot.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Forward:</strong> Robot moves in the direction
                  it&apos;s facing
                </li>
                <li>
                  <strong>Strafe Right:</strong> Robot moves to its right side
                </li>
                <li>
                  <strong>Use Case:</strong> Precise maneuvering, driver
                  preference
                </li>
                <li>
                  <strong>Control:</strong> More intuitive for beginners
                </li>
              </ul>
            </div>
          </ContentCard>

          <ContentCard>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">
              Field-Centric (Field Frame)
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              All movements are relative to the field. Forward is always away
              from your driver station, regardless of robot orientation.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Forward:</strong> Robot moves away from driver station
                </li>
                <li>
                  <strong>Strafe Right:</strong> Robot moves right on the field
                </li>
                <li>
                  <strong>Use Case:</strong> Competition driving, intuitive
                  control
                </li>
                <li>
                  <strong>Requirement:</strong> Needs gyro for robot heading
                </li>
              </ul>
            </div>
          </ContentCard>
        </div>

        <Box variant="alert-info" title="Gyro Requirement for Field-Centric">
          <p className="mb-3">
            Field-centric control requires a gyroscope (IMU) to track the
            robot&apos;s heading. Without an accurate heading, the robot cannot
            determine which direction is &quot;forward&quot; relative to the
            field.
          </p>
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p className="mb-2">
              <strong>Common gyros in FRC:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pigeon 2 (CTRE) - CAN-based, highly accurate</li>
              <li>NavX (Kauai Labs) - USB/SPI, popular choice</li>
              <li>ADIS16470 (Analog Devices) - SPI, WPILib support</li>
            </ul>
          </div>
        </Box>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Swerve Kinematics &amp; Control
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Kinematics is the mathematical relationship between the desired robot
          motion (velocities in X, Y, and rotation) and the individual wheel
          states (speed and angle) needed to achieve that motion.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <ContentCard>
            <h3 className="text-xl font-bold text-primary-900 dark:text-primary-300 mb-4">
              📐 Forward Kinematics
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Converts individual wheel states into overall robot velocity. Used
              for odometry and determining where the robot is moving.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <code className="text-xs text-slate-700 dark:text-slate-300">
                Given: [FL, FR, BL, BR] module states
                <br />
                Calculate: Robot velocity (Vx, Vy, omega)
              </code>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-4">
              <strong>Example:</strong> If all modules point forward at the same
              speed, the robot is moving straight forward with no rotation.
            </p>
          </ContentCard>

          <ContentCard>
            <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">
              📐 Inverse Kinematics
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Converts desired robot velocity into individual wheel states. Used
              for teleop driving and autonomous path following.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <code className="text-xs text-slate-700 dark:text-slate-300">
                Given: Robot velocity (Vx, Vy, omega)
                <br />
                Calculate: [FL, FR, BL, BR] module states
              </code>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-4">
              <strong>Example:</strong> To strafe right while rotating, inverse
              kinematics calculates the unique angle and speed for each module.
            </p>
          </ContentCard>
        </div>

        <Box
          variant="alert-info"
          title="🔧 CTRE Handles Kinematics Automatically"
        >
          <p className="mb-3">
            The good news: CTRE&apos;s swerve implementation handles all
            kinematics calculations internally. You don&apos;t need to manually
            compute wheel states!
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            The <code>CommandSwerveDrivetrain</code> class uses Phoenix 6&apos;s
            built-in kinematics to convert your desired chassis speeds (Vx, Vy,
            omega) into the appropriate module states automatically.
          </p>
        </Box>

        <CollapsibleSection title="🎮 Understanding Chassis Speeds">
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300">
              Chassis speeds represent the desired velocity of the robot as a
              whole:
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">
                  Vx (Forward/Back)
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Linear velocity in the X direction. Positive = forward,
                  Negative = backward. Units: meters per second.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">
                  Vy (Left/Right)
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Linear velocity in the Y direction. Positive = left, Negative
                  = right. Units: meters per second.
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2">
                  Omega (Rotation)
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Angular velocity (rotation rate). Positive =
                  counter-clockwise, Negative = clockwise. Units: radians per
                  second.
                </p>
              </div>
            </div>

            <CodeBlock
              language="java"
              title="Creating Chassis Speeds for Control"
              code={`// Example: Drive forward at 2 m/s while rotating CCW at 1 rad/s
ChassisSpeeds speeds = new ChassisSpeeds(
    2.0,  // Vx: forward velocity (m/s)
    0.0,  // Vy: left velocity (m/s)
    1.0   // Omega: rotation rate (rad/s)
);

// For field-centric control, transform based on robot heading
ChassisSpeeds fieldRelative = ChassisSpeeds.fromFieldRelativeSpeeds(
    joystickX,     // Field X velocity
    joystickY,     // Field Y velocity
    joystickOmega, // Rotation rate
    robotHeading   // Current robot angle (Rotation2d)
);

// Apply to swerve drivetrain
drivetrain.setControl(
    new SwerveRequest.FieldCentric()
        .withVelocityX(fieldRelative.vxMetersPerSecond)
        .withVelocityY(fieldRelative.vyMetersPerSecond)
        .withRotationalRate(fieldRelative.omegaRadiansPerSecond)
);`}
            />
          </div>
        </CollapsibleSection>
      </section>

      {/* Section 5: Odometry & Pose Estimation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Odometry &amp; Pose Estimation
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Odometry is the process of tracking the robot&apos;s position and
          orientation on the field by integrating wheel movements over time.
          Accurate odometry is essential for autonomous navigation and
          field-aware control.
        </p>

        <div className="flex justify-center my-8">
          <Image
            src="/images/drive-to-point-field.png"
            alt="FRC field coordinate system showing X and Y axes with blue and red alliance robots"
            width={1024}
            height={463}
            className="rounded-lg shadow-lg border border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
            🗺️ Pose2d: Robot Position on the Field
          </h3>

          <p className="text-slate-600 dark:text-slate-300 mb-4">
            The robot&apos;s pose consists of three components:
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-2">
                X Position
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Distance along the field length. X increases as you move away
                from the driver station. Units: meters.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-2">
                Y Position
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Distance along the field width. Y increases as you move to the
                left. Units: meters.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-2">
                Rotation
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Robot heading (which direction the robot is facing). Represented
                as Rotation2d. 0° = field forward.
              </p>
            </div>
          </div>

          <Box
            variant="alert-tip"
            title="Field Coordinate System"
            icon={<Lightbulb className="w-5 h-5" />}
          >
            <p>
              The field coordinate system origin (0, 0) is at the right corner
              on the blue side of the field. X increases as you move away from
              the driver station, Y increases as you move to the left, and
              rotation is counter-clockwise positive.
            </p>
          </Box>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            How Odometry Works
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <ContentCard>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                📊 Wheel Odometry
              </h4>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Primary odometry source using encoder readings from swerve
                modules.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Inputs:</strong> Module positions (distance traveled +
                  angle)
                </li>
                <li>
                  <strong>Process:</strong> Forward kinematics converts module
                  deltas to robot motion
                </li>
                <li>
                  <strong>Integration:</strong> Accumulates motion over time to
                  track pose
                </li>
                <li>
                  <strong>Accuracy:</strong> Drifts over time due to wheel slip
                  and measurement errors
                </li>
              </ul>
            </ContentCard>

            <ContentCard>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                📸 Vision Odometry
              </h4>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Secondary odometry source using camera and AprilTag vision
                targets.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>
                  <strong>Inputs:</strong> Detected AprilTags with known field
                  positions
                </li>
                <li>
                  <strong>Process:</strong> Camera calculates robot pose from
                  tag positions
                </li>
                <li>
                  <strong>Integration:</strong> Fused with wheel odometry for
                  drift correction
                </li>
                <li>
                  <strong>Accuracy:</strong> More accurate but only works when
                  tags are visible
                </li>
              </ul>
            </ContentCard>
          </div>

          <Box
            variant="alert-info"
            title="🔀 Pose Estimation with Sensor Fusion"
          >
            <p className="mb-3">
              CTRE&apos;s <code>CommandSwerveDrivetrain</code> includes built-in
              pose estimation that fuses wheel odometry with vision measurements
              using a Kalman filter approach.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This provides more accurate position tracking than wheel odometry
              alone, automatically correcting for drift when vision targets are
              visible.
            </p>
          </Box>
        </div>

        <CollapsibleSection title="📝 Odometry Code Examples">
          <div className="space-y-6">
            <CodeBlock
              language="java"
              title="Getting Current Robot Pose"
              code={`// In your subsystem or command
Pose2d currentPose = drivetrain.getState().Pose;

// Extract components
double xPosition = currentPose.getX();          // meters
double yPosition = currentPose.getY();          // meters
Rotation2d heading = currentPose.getRotation(); // robot orientation

// Display on dashboard
SmartDashboard.putNumber("Robot X", xPosition);
SmartDashboard.putNumber("Robot Y", yPosition);
SmartDashboard.putNumber("Robot Heading", heading.getDegrees());`}
            />
          </div>
        </CollapsibleSection>

        <div className="grid md:grid-cols-2 gap-4">
          <DocumentationButton
            href="https://docs.wpilib.org/en/stable/docs/software/kinematics-and-odometry/swerve-drive-odometry.html"
            title="WPILib Swerve Drive Odometry Documentation"
            icon={<Book className="w-5 h-5" />}
          />
          <DocumentationButton
            href="https://docs.wpilib.org/en/stable/docs/software/advanced-controls/state-space/state-space-pose-estimators.html"
            title="WPILib Pose Estimators"
            icon={<MapPin className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question: "What are the three key components of a swerve module?",
              options: [
                "Drive motor, turning motor, and gyroscope",
                "Drive motor, turning motor, and CANcoder",
                "Two drive motors and a CANcoder",
                "Drive motor, brake, and CANcoder",
              ],
              correctAnswer: 1,
              explanation:
                "Each swerve module consists of a drive motor (for speed), turning motor (for steering), and CANcoder (for absolute position sensing).",
            },
            {
              id: 2,
              question:
                "What is the main difference between robot-centric and field-centric control?",
              options: [
                "Robot-centric is faster than field-centric",
                "Robot-centric uses relative movement to the robot, field-centric uses movement relative to the field",
                "Field-centric doesn't require encoders",
                "Robot-centric only works with tank drive",
              ],
              correctAnswer: 1,
              explanation:
                "Robot-centric control moves relative to the robot's orientation (forward is always the robot's front), while field-centric moves relative to the field (forward is always away from the driver station).",
            },
            {
              id: 3,
              question:
                "What sensor is required for field-centric swerve drive control?",
              options: [
                "Ultrasonic sensor",
                "Camera",
                "Gyroscope (IMU)",
                "Accelerometer only",
              ],
              correctAnswer: 2,
              explanation:
                "A gyroscope (IMU) is required for field-centric control to track the robot's heading and determine which direction is 'forward' relative to the field.",
            },
            {
              id: 4,
              question:
                "What does inverse kinematics calculate in swerve drive?",
              options: [
                "Robot velocity from wheel states",
                "Individual wheel states from desired robot velocity",
                "Motor temperatures from current usage",
                "Battery voltage from power consumption",
              ],
              correctAnswer: 1,
              explanation:
                "Inverse kinematics converts desired robot velocity (Vx, Vy, omega) into the individual wheel speeds and angles needed to achieve that motion.",
            },
            {
              id: 5,
              question:
                "What are the three components of chassis speeds in swerve drive?",
              options: [
                "Left speed, right speed, rotation",
                "Forward speed, backward speed, turning speed",
                "Vx (forward/back), Vy (left/right), Omega (rotation)",
                "Motor speed, wheel speed, encoder speed",
              ],
              correctAnswer: 2,
              explanation:
                "Chassis speeds consist of Vx (linear velocity in X direction), Vy (linear velocity in Y direction), and Omega (angular velocity for rotation).",
            },
            {
              id: 6,
              question:
                "What is the primary purpose of odometry in swerve drive?",
              options: [
                "To control motor speeds",
                "To track the robot's position and orientation on the field",
                "To communicate with other robots",
                "To measure battery voltage",
              ],
              correctAnswer: 1,
              explanation:
                "Odometry tracks the robot's position (X, Y) and orientation (heading) on the field by integrating wheel movements over time, essential for autonomous navigation.",
            },
            {
              id: 7,
              question:
                "Which component provides absolute angle measurement for the steering system?",
              options: [
                "Drive motor encoder",
                "Turning motor internal encoder",
                "CANcoder",
                "Gyroscope",
              ],
              correctAnswer: 2,
              explanation:
                "The CANcoder provides absolute position sensing for the steering angle, which is critical for module zeroing and maintaining accurate wheel orientation.",
            },
            {
              id: 8,
              question:
                "What does CTRE's CommandSwerveDrivetrain handle automatically?",
              options: [
                "Only motor control",
                "Kinematics calculations and pose estimation",
                "Only sensor readings",
                "Only path planning",
              ],
              correctAnswer: 1,
              explanation:
                "CTRE's CommandSwerveDrivetrain handles kinematics calculations (converting chassis speeds to module states), pose estimation with sensor fusion, and provides built-in swerve control functionality.",
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
            Ready for Implementation
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            You now understand the fundamental concepts needed for swerve drive:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>Holonomic motion and independent module control</li>
            <li>Module anatomy: drive motor, azimuth motor, CANcoder</li>
            <li>Coordinate systems: robot-centric vs field-centric</li>
            <li>Gyro requirements for field-centric control</li>
            <li>Critical safety practices and zeroing procedures</li>
            <li>Swerve kinematics and control</li>
            <li>Odometry</li>
            <li>Pose estimation</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-300 mt-4">
            Next, you&apos;ll learn how to use Phoenix Tuner X to generate a
            complete swerve project and bring up your drivetrain.
          </p>
        </div>
      </section>
    </PageTemplate>
  );
}
