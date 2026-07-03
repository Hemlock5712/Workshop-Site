import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import ContentCard from "@/components/ContentCard";
import CollapsibleSection from "@/components/CollapsibleSection";
import CodeBlock from "@/components/CodeBlock";
import GitHubContent from "@/components/GitHubContent";
import Quiz from "@/components/Quiz";
import { Lightbulb, MapPin, Target } from "lucide-react";
import Image from "next/image";

export default function DriveToPoint() {
  return (
    <PageTemplate title="Drive to Point">
      <KeyConceptSection
        title="Autonomous Point Navigation with Odometry"
        description="Use your swerve drivetrain's odometry to autonomously navigate to specific field coordinates with PID control."
        concept="Combine odometry tracking with PID controllers to command your robot to drive to any (x, y, rotation) position on the field."
      />

      <p className="text-slate-600 dark:text-slate-300 text-center -mt-4">
        Drive to point moves the robot to a precise field position on its own.
        It&apos;s the building block behind autonomous routines and teleop
        assists.
      </p>

      {/* Understanding Field Coordinates */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Understanding Field Coordinates
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          The FRC field uses a coordinate system where positions are defined as{" "}
          <strong>Pose2d</strong> objects containing X position, Y position, and
          rotation (heading). Your swerve drivetrain&apos;s odometry
          continuously tracks the robot&apos;s current pose, so you can compare
          it against a target pose and close the gap with feedback control.
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

        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Pose2d Structure
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                A Pose2d represents a position and orientation on the field.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Pose2d Components:
            </h4>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex gap-4 items-start">
                <span className="font-mono font-bold text-primary-600 dark:text-primary-400 min-w-[80px]">
                  X (meters)
                </span>
                <span>
                  Distance along the field&apos;s length. X increases as you
                  move away from the driver station (0 to ~16.5m)
                </span>
              </div>
              <div className="flex gap-4 items-start">
                <span className="font-mono font-bold text-primary-600 dark:text-primary-400 min-w-[80px]">
                  Y (meters)
                </span>
                <span>
                  Distance along the field&apos;s width. Y increases as you move
                  to the left (0 to ~8.2m)
                </span>
              </div>
              <div className="flex gap-4 items-start">
                <span className="font-mono font-bold text-primary-600 dark:text-primary-400 min-w-[80px]">
                  Rotation
                </span>
                <span>
                  Robot heading as Rotation2d (0° = facing down the field)
                </span>
              </div>
            </div>
          </div>

          <CodeBlock
            language="java"
            title="Creating Target Poses"
            code={`// Drive to origin (0, 0) facing 0 degrees
Pose2d origin = Pose2d.kZero;

// Drive to (3, 2) facing 180 degrees
Pose2d targetPose = new Pose2d(3, 2, Rotation2d.fromDegrees(180));

// Get current robot position from odometry
Pose2d currentPose = drivetrain.getPose();`}
          />
        </ContentCard>
      </section>

      {/* PID Control for Position */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          PID Control for Position Tracking
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          To drive to a point, we use{" "}
          <strong>three separate PID controllers</strong>: one for X position,
          one for Y position, and one for rotation. Each controller calculates
          the required velocity by comparing the current value to the target
          value.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <Box variant="alert-info" title="X Controller">
            <p>Controls forward/backward velocity based on X position error</p>
            <div className="mt-3 p-2 bg-[var(--muted)] rounded font-mono text-xs text-[var(--foreground)]">
              xVelocity = kP × (target.X - current.X)
            </div>
          </Box>

          <Box variant="alert-success" title="Y Controller">
            <p>Controls left/right velocity based on Y position error</p>
            <div className="mt-3 p-2 bg-[var(--muted)] rounded font-mono text-xs text-[var(--foreground)]">
              yVelocity = kP × (target.Y - current.Y)
            </div>
          </Box>

          <Box variant="alert-tip" title="Theta Controller">
            <p>Controls rotation rate based on heading error</p>
            <div className="mt-3 p-2 bg-[var(--muted)] rounded font-mono text-xs text-[var(--foreground)]">
              rotation = kP × (target.θ - current.θ)
            </div>
          </Box>
        </div>

        <Box
          variant="alert-info"
          title="Why Three Controllers?"
          icon={<Lightbulb className="w-5 h-5" />}
        >
          <p>
            Swerve drivetrains can move in X, Y, and rotate independently. One
            PID controller per degree of freedom lets the robot drive to the
            target position and rotate to the target heading at the same time.
          </p>
        </Box>
      </section>

      {/* Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          DriveToPoint Command Implementation
        </h2>

        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Create PID Controllers
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Initialize three PID controllers with appropriate gains. The
                theta controller uses continuous input to handle angle wrapping.
              </p>
            </div>
          </div>

          <CodeBlock
            language="java"
            title="DriveToPoint Command Setup"
            code={`// ClassicCommand gives you the explicit
// initialize / execute / isFinished / end lifecycle (see the Commands lesson).
public class DriveToPoint extends ClassicCommand {
  private final DriveMechanism m_drivetrain;
  private final Pose2d m_targetPose;

  // Three PID controllers for X, Y, and rotation
  private final PIDController xController = new PIDController(10, 0, 0);
  private final PIDController yController = new PIDController(10, 0, 0);
  private final PIDController thetaController = new PIDController(7, 0, 0);

  // Field-relative velocity request in the blue-origin frame — the same frame
  // odometry uses — so the command isn't re-rotated by alliance perspective.
  private final SwerveRequest.ApplyFieldVelocity driveRequest =
      new SwerveRequest.ApplyFieldVelocity()
          .withForwardPerspective(SwerveRequest.ForwardPerspectiveValue.BlueAlliance);

  public DriveToPoint(DriveMechanism drivetrain, Pose2d targetPose) {
    super("DriveToPoint", drivetrain); // command name + the mechanism it requires
    m_drivetrain = drivetrain;
    m_targetPose = targetPose;

    // Enable continuous input for theta (-π to π)
    thetaController.enableContinuousInput(-Math.PI, Math.PI);
  }
}`}
          />

          <Box variant="alert-tip" title="Continuous Input">
            <p>
              <code>enableContinuousInput(-Math.PI, Math.PI)</code> tells the
              controller that angles wrap around, so the robot rotates via the
              shortest path (e.g., from 350° to 10° goes clockwise through 0°,
              not counterclockwise 340°).
            </p>
          </Box>
        </ContentCard>

        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Calculate Velocities in Execute
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Each execute cycle, get the current pose and calculate the
                required velocities to reach the target.
              </p>
            </div>
          </div>

          <CodeBlock
            language="java"
            title="Command Execute Method"
            code={`@Override
protected void execute() {
  Pose2d currentPose = m_drivetrain.getPose();

  // One PID per axis. Each one asks: "how fast should I move
  // this axis to close the gap between current and target?"
  double xVelocity = xController.calculate(currentPose.getX(), m_targetPose.getX());
  double yVelocity = yController.calculate(currentPose.getY(), m_targetPose.getY());
  // Theta is the same shape — just read the rotation in radians.
  double thetaVelocity = thetaController.calculate(
      currentPose.getRotation().getRadians(),
      m_targetPose.getRotation().getRadians());

  // Hand the field-relative velocities (blue-origin) to the drivetrain.
  m_drivetrain.setControl(
      driveRequest.withVelocity(new ChassisVelocities(xVelocity, yVelocity, thetaVelocity)));
}`}
          />

          <div className="bg-primary-50 dark:bg-primary-950/30 p-4 rounded-lg border-l-4 border-primary-400 dark:border-primary-900 mt-4">
            <h4 className="font-semibold text-primary-900 dark:text-primary-300 mb-2">
              <Target className="w-5 h-5 inline mr-2" />
              How It Works
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              The command runs continuously, recalculating velocities every 20ms
              (50Hz). As the robot gets closer to the target, the error
              decreases, and the PID controllers automatically reduce the
              velocity until the robot reaches the setpoint.
            </p>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Stop When Command Ends
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                When the command is interrupted or finished, stop the drivetrain
                to prevent unwanted movement.
              </p>
            </div>
          </div>

          <CodeBlock
            language="java"
            title="Command End Method"
            code={`@Override
protected void end(boolean interrupted) {
  // Stop the drivetrain when the command ends. ClassicCommand runs this on both
  // a natural finish and an interrupt, so it's the one place cleanup needs to be.
  m_drivetrain.setControl(new SwerveRequest.Idle());
}

@Override
protected boolean isFinished() {
  // This command runs until interrupted.
  // Could add tolerance checking to auto-finish (see Tuning Tips below).
  return false;
}`}
          />
        </ContentCard>

        <Box variant="alert-info" tag="NOTE" title="The ClassicCommand shape">
          <p>
            The command above <code>extends ClassicCommand</code>, which gives
            you the explicit{" "}
            <code>initialize / execute / isFinished / end</code> lifecycle on
            top of a coroutine. <code>super(name, drivetrain)</code> declares
            the command name and the mechanism it requires, and{" "}
            <code>end(interrupted)</code> runs on both a natural finish and a
            cancel, so it&apos;s the one place to put cleanup. If you&apos;d
            rather write it as one inline body, here&apos;s the coroutine-native
            version:
          </p>
          <CodeBlock
            language="java"
            title="DriveToPoint — inline coroutine version"
            code={`// A command factory on DriveMechanism. runRepeatedly loops the drive update
// every tick and never finishes on its own (set-and-hold), so it runs until
// something cancels it; whenCanceled idles the drivetrain.
public Command driveToPoint(Pose2d target) {
  PIDController xPid = new PIDController(10, 0, 0);
  PIDController yPid = new PIDController(10, 0, 0);
  PIDController thetaPid = new PIDController(7, 0, 0);
  thetaPid.enableContinuousInput(-Math.PI, Math.PI);

  var driveRequest =
      new SwerveRequest.ApplyFieldVelocity()
          .withForwardPerspective(SwerveRequest.ForwardPerspectiveValue.BlueAlliance);

  return runRepeatedly(() -> {
        Pose2d pose = getPose();
        setControl(driveRequest.withVelocity(new ChassisVelocities(
            xPid.calculate(pose.getX(), target.getX()),
            yPid.calculate(pose.getY(), target.getY()),
            thetaPid.calculate(
                pose.getRotation().getRadians(),
                target.getRotation().getRadians()))));
      })
      .whenCanceled(() -> setControl(new SwerveRequest.Idle()))
      .named("DriveToPoint:" + target);
}`}
          />
        </Box>
      </section>

      {/* Button Bindings */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Binding to Controller Buttons
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          Bind the DriveToPoint command to buttons for easy testing and teleop
          use. In the OpMode model these bindings live in the{" "}
          <strong>Teleop OpMode constructor</strong>, so they&apos;re scoped to
          teleop and removed automatically on a mode switch. Hold the button to
          drive to the point; release to stop.
        </p>

        <CodeBlock
          language="java"
          title="Teleop OpMode Button Bindings"
          code={`// Inside the @Teleop OpMode constructor — bindings are scoped to this OpMode.
public TeleopOpMode(Robot robot) {
  DriveMechanism drivetrain = robot.drivetrain;

  // Hold A: drive to origin (0, 0, 0°)
  driver.a().whileTrue(new DriveToPoint(drivetrain, Pose2d.kZero));

  // Hold B: drive to (3 m, 2 m, 180°)
  driver.b().whileTrue(
      new DriveToPoint(drivetrain, new Pose2d(3, 2, Rotation2d.fromDegrees(180))));
}`}
        />

        <Box
          variant="alert-warning"
          title="Testing Safety & Field Requirements"
        >
          <p className="mb-2">
            Start with conservative PID gains (kP = 1-2) and test in a clear
            area. The robot will move automatically when you press the button.
            Make sure you have a way to disable the robot quickly if needed.
          </p>
          <p>
            You don&apos;t need a full FRC field to test this. Pick any point;
            just remember the robot&apos;s starting position is the origin (0,
            0, 0°).
          </p>
        </Box>
      </section>

      {/* Code Example from GitHub */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Workshop Implementation: DriveToPoint
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
          See the complete implementation in the Workshop-Code repository. The{" "}
          <code>5-DriveToPoint</code> branch shows the full command structure
          and button bindings.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/commands/DriveToPoint.java"
          branch="5-DriveToPoint"
          pr={{ number: 11, focusFile: "DriveToPoint.java" }}
        />
      </section>

      {/* Practical Applications */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Practical Applications
        </h2>

        <CollapsibleSection title="🎮 Teleop Assists" variant="info">
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              Bind preset positions to buttons to help drivers quickly position
              the robot:
            </p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Amp scoring position:</strong> Drive to the precise
                  position for scoring in the amp
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Speaker shooting position:</strong> Auto-position for
                  optimal shooting angle
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Source pickup position:</strong> Navigate to game
                  piece source quickly
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Defensive positions:</strong> Move to strategic
                  blocking locations
                </span>
              </li>
            </ul>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="🤖 Autonomous Routines" variant="info">
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>Use DriveToPoint as building blocks for autonomous sequences:</p>
            <CodeBlock
              language="java"
              title="Example Auto Sequence"
              code={`// Sequential autonomous routine — Command.sequence runs these in order.
Command autoSequence = Command.sequence(
    new DriveToPoint(drivetrain, startPose),
    intake.intake(),
    new DriveToPoint(drivetrain, scoringPose),
    superstructure.score(),
    new DriveToPoint(drivetrain, nextGamePiecePose));`}
            />
            <p>
              This forms the foundation for more complex autonomous navigation
              before adding vision. (You&apos;d typically wrap a routine like
              this in an <code>@Autonomous</code> OpMode — see the Autonomous
              lesson.)
            </p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="⚙️ Tuning Tips" variant="warning">
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Start with low gains
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  The values provided (kP = 10) are just{" "}
                  <strong>starting points</strong>; every robot is different. If
                  the robot oscillates, reduce gains. If it&apos;s too slow,
                  increase gradually.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  <strong>Pro Tip:</strong> Graph the{" "}
                  <code>Target Position</code> vs <code>Actual Position</code>{" "}
                  in AdvantageScope to visualize how well your PID controller is
                  tracking.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="bg-primary-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Theta controller typically needs different gains
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Rotation usually requires different tuning than translation.
                  Start with kP around 5-7 for theta.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="bg-primary-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Add velocity limits for safety
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Clamp the output velocities to prevent the robot from moving
                  too fast:
                </p>
                <CodeBlock
                  language="java"
                  title="Velocity Limiting"
                  code={`double maxVelocity = 4.0; // m/s
xVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, xVelocity));
yVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, yVelocity));`}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <span className="bg-primary-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </span>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Consider adding tolerance checking
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Make the command finish automatically when close enough to the
                  target:
                </p>
                <CodeBlock
                  language="java"
                  title="isFinished with Tolerance"
                  code={`@Override
protected boolean isFinished() {
  Pose2d currentPose = m_drivetrain.getPose();
  double distanceError = currentPose.getTranslation()
      .getDistance(m_targetPose.getTranslation());
  double rotationError = Math.abs(
      currentPose.getRotation().getRadians() -
      m_targetPose.getRotation().getRadians()
  );

  return distanceError < 0.05 && rotationError < Math.toRadians(5);
}`}
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </section>

      {/* Quiz */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question: "What three values does a Pose2d contain?",
              options: [
                "X velocity, Y velocity, and angular velocity",
                "X position, Y position, and rotation",
                "Left encoder, right encoder, and gyro angle",
                "Red, green, and blue color values",
              ],
              correctAnswer: 1,
              explanation:
                "A Pose2d represents a position and orientation on the field, containing X position (meters), Y position (meters), and rotation (Rotation2d).",
            },
            {
              id: 2,
              question:
                "Why does the DriveToPoint command use three separate PID controllers?",
              options: [
                "To control three different motors on the drivetrain",
                "Because swerve drivetrains can move in X, Y, and rotate independently",
                "To make the code more complex and impressive",
                "One controller isn't powerful enough to control the robot",
              ],
              correctAnswer: 1,
              explanation:
                "Swerve drivetrains have three independent degrees of freedom (X translation, Y translation, and rotation). Using separate PID controllers for each allows the robot to simultaneously drive to a position while rotating to the target heading.",
            },
            {
              id: 3,
              question:
                "What does thetaController.enableContinuousInput(-Math.PI, Math.PI) do?",
              options: [
                "Makes the controller run continuously without stopping",
                "Tells the controller that angles wrap around, ensuring shortest rotation path",
                "Limits the maximum rotation speed to π radians per second",
                "Enables the controller to accept negative rotation values",
              ],
              correctAnswer: 1,
              explanation:
                "enableContinuousInput tells the controller that the input wraps around (angles are circular). This ensures the robot rotates via the shortest path—for example, from 350° to 10° goes through 0° (20° clockwise) rather than going backwards 340° counterclockwise.",
            },
            {
              id: 4,
              question:
                "In the execute() method, what does currentPose represent?",
              options: [
                "The target position we want to drive to",
                "The starting position when the command began",
                "The robot's current position from odometry",
                "The position of the nearest game piece",
              ],
              correctAnswer: 2,
              explanation:
                "currentPose is obtained from m_drivetrain.getPose() and represents the robot's current position as tracked by the swerve drivetrain's odometry system. This is compared against the target pose to calculate the error.",
            },
            {
              id: 5,
              question:
                "What happens when you use .whileTrue() to bind the DriveToPoint command?",
              options: [
                "The command runs once when the button is pressed",
                "The command runs continuously while the button is held",
                "The command runs until the robot reaches the target",
                "The command toggles on and off each time the button is pressed",
              ],
              correctAnswer: 1,
              explanation:
                "The .whileTrue() binding runs the command continuously while the button is held down. When you release the button, the command is interrupted and the robot stops (via the end() method).",
            },
            {
              id: 6,
              question:
                "If your PID controllers have gains that are too high, what will likely happen?",
              options: [
                "The robot will move too slowly",
                "The robot will oscillate or shake around the target",
                "The robot won't move at all",
                "The robot will drive backwards",
              ],
              correctAnswer: 1,
              explanation:
                "PID gains that are too high cause overshoot and oscillation. The robot will move past the target, then overcorrect back, repeatedly oscillating around the setpoint. Reducing the gains will dampen this oscillation.",
            },
            {
              id: 7,
              question:
                "What is a practical teleop application of DriveToPoint?",
              options: [
                "Replacing all driver control with autonomous movement",
                "Creating preset buttons to auto-position for scoring locations",
                "Automatically avoiding all obstacles on the field",
                "Controlling the robot's LED colors",
              ],
              correctAnswer: 1,
              explanation:
                "DriveToPoint is excellent for teleop assists where you bind preset field positions to buttons (e.g., amp scoring position, speaker position). This helps drivers quickly and accurately position the robot without manual driving.",
            },
          ]}
        />
      </section>
    </PageTemplate>
  );
}
