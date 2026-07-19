import PageTemplate from "@/components/PageTemplate";
import KeyConceptSection from "@/components/KeyConceptSection";
import ContentCard from "@/components/ContentCard";
import CodeBlock from "@/components/CodeBlock";
import CollapsibleSection from "@/components/CollapsibleSection";
import GitHubContent from "@/components/GitHubContent";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";

export default function AdvancedDriveToPoint() {
  return (
    <PageTemplate title="Advanced: Profiled Drive to Point">
      {/* Introduction */}
      <KeyConceptSection
        title="Profiled Path Following with Feedforward Control"
        description="The advanced DriveToPoint command combines motion profiling with feedforward control to achieve smooth, predictable autonomous movement. Instead of relying solely on PID feedback, this approach plans a velocity profile and proactively applies the forces needed to follow it."
        concept="Feedforward control anticipates what forces are needed based on the planned trajectory, while feedback (PID) handles small corrections for disturbances. Together, they create smooth, accurate autonomous navigation."
      />

      {/* Motion Profiling Fundamentals */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Motion Profiling Fundamentals
        </h2>

        <ContentCard>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            What is Motion Profiling?
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            Motion profiling generates smooth trajectories that respect your
            robot&apos;s physical capabilities. Instead of jerky movements from
            instant velocity changes, profiled paths smoothly accelerate, cruise
            at maximum speed, then decelerate to the target.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h4 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">
                ⚡ Acceleration Phase
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Ramps up from current velocity to maximum velocity using
                controlled acceleration (4 m/s²)
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h4 className="text-lg font-bold text-green-900 dark:text-green-300 mb-3">
                🚀 Cruise Phase
              </h4>
              <p className="text-green-800 dark:text-green-200 text-sm">
                Maintains maximum velocity (4.3 m/s) for the bulk of the journey
                when possible
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
              <h4 className="text-lg font-bold text-orange-900 dark:text-orange-300 mb-3">
                🎯 Deceleration Phase
              </h4>
              <p className="text-orange-800 dark:text-orange-200 text-sm">
                Smoothly brakes to reach the target position with zero velocity
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              Key Constraints
            </h4>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Max Velocity:</strong> 4.3 m/s (translation), π rad/s
                (rotation)
              </li>
              <li>
                <strong>Max Acceleration:</strong> 4 m/s² (translation), 2π
                rad/s² (rotation)
              </li>
              <li>
                <strong>Benefits:</strong> Prevents wheel slip, reduces
                mechanical stress, more predictable behavior
              </li>
            </ul>
          </div>
        </ContentCard>
      </section>

      {/* Tuning Max Velocity and Acceleration */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Tuning Max Velocity and Acceleration
        </h2>

        <ContentCard>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Finding the Right Constraints
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            Your velocity and acceleration constraints need to be conservative
            enough that the robot can actually track them, but fast enough to
            stay competitive.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h4 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">
                🏎️ Maximum Velocity (kMaxV)
              </h4>
              <div className="space-y-3 text-blue-800 dark:text-blue-200 text-sm">
                <p>
                  <strong>
                    Set to ~90% of your robot&apos;s maximum speed
                  </strong>
                </p>
                <p>
                  Why not 100%? This headroom allows your feedback controller to
                  &quot;catch up&quot; if the robot falls behind the planned
                  trajectory. Without this margin, you can&apos;t correct
                  tracking errors.
                </p>
                <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded mt-3">
                  <p className="font-mono text-xs">
                    Example: If max speed is 4.8 m/s
                    <br />
                    Set kMaxV = 4.3 m/s (90%)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h4 className="text-lg font-bold text-green-900 dark:text-green-300 mb-3">
                ⚡ Maximum Acceleration (kMaxAccel)
              </h4>
              <div className="space-y-3 text-green-800 dark:text-green-200 text-sm">
                <p>
                  <strong>
                    Set to a value that gets you close to max speed in ~1 second
                  </strong>
                </p>
                <p>
                  Start with kMaxV as your initial guess, then tune by graphing
                  actual velocity against target velocity. Reduce if your robot
                  can&apos;t track the trajectory.
                </p>
                <div className="bg-green-100 dark:bg-green-950 p-3 rounded mt-3">
                  <p className="font-mono text-xs">
                    Example: kMaxV = 4.3 m/s
                    <br />
                    Start with kMaxAccel = 4.0 m/s²
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h4 className="text-lg font-bold text-yellow-900 dark:text-yellow-300 mb-3">
              📊 Validation Method: Graph Velocity Tracking
            </h4>
            <div className="space-y-3 text-yellow-800 dark:text-yellow-200 text-sm">
              <p>
                The best way to validate your constraints is to log and graph
                your robot&apos;s actual velocity against the planned trajectory
                velocity:
              </p>
              <ol className="list-decimal ml-6 space-y-2">
                <li>
                  Enable logging for both <code>setpoint.velocity</code>{" "}
                  (planned) and the robot&apos;s actual chassis velocity
                </li>
                <li>
                  Run your DriveToPoint command and capture data using
                  AdvantageScope
                </li>
                <li>
                  Graph both velocities over time - they should track closely
                </li>
                <li>
                  If actual velocity lags significantly behind planned velocity,
                  reduce kMaxAccel
                </li>
                <li>
                  If actual velocity consistently exceeds planned velocity, you
                  have headroom to increase constraints
                </li>
              </ol>
              <p className="mt-3 font-semibold">
                Goal: Actual velocity should closely follow planned velocity
                with minimal lag
              </p>
            </div>
          </div>
        </ContentCard>
      </section>

      {/* Feedforward vs Feedback Control */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Feedforward vs Feedback Control
        </h2>

        <ContentCard>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Understanding the Dual Control Strategy
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            The basic DriveToPoint command uses only{" "}
            <strong>feedback control</strong> (PID) - it measures error and
            reacts to it. The advanced version adds{" "}
            <strong>feedforward control</strong> - it anticipates what forces
            are needed before errors occur.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-200 dark:bg-slate-700">
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-left">
                    Aspect
                  </th>
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-left">
                    Basic (Feedback Only)
                  </th>
                  <th className="border border-slate-300 dark:border-slate-600 px-4 py-3 text-left">
                    Advanced (Feedforward + Feedback)
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 font-semibold">
                    Control Type
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    Reactive - responds after error occurs
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    Proactive + Reactive - anticipates needs and corrects
                    disturbances
                  </td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 font-semibold">
                    Path Planning
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    None - direct to target
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    Generates smooth trajectory with velocity profiles
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 font-semibold">
                    PID Target
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    Final target position (large errors)
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    Moving setpoint on trajectory (small errors)
                  </td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 font-semibold">
                    Force Application
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    Only from PID corrections
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    Planned forces + PID corrections
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 font-semibold">
                    Motion Quality
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    Can be jerky, oscillation prone
                  </td>
                  <td className="border border-slate-300 dark:border-slate-600 px-4 py-3">
                    Smooth, predictable, minimal oscillation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">
              🚗 Car Driving Analogy
            </h4>
            <div className="space-y-3 text-blue-800 dark:text-blue-200 text-sm">
              <p>
                <strong>Feedback Only:</strong> Like driving by only looking at
                lane lines and correcting when you drift. You&apos;re always
                reacting to errors after they happen.
              </p>
              <p>
                <strong>Feedforward:</strong> Like knowing you need to turn the
                steering wheel before the curve based on the road ahead.
                You&apos;re anticipating what&apos;s needed.
              </p>
              <p>
                <strong>Combined Approach:</strong> You plan your steering based
                on the road ahead (feedforward), but still make small
                corrections if wind pushes you off course (feedback).
              </p>
            </div>
          </div>
        </ContentCard>
      </section>

      {/* Setpoint Tracking */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Setpoint Tracking
        </h2>

        <ContentCard>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Following a Trajectory vs Targeting an Endpoint
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            The big change in the advanced approach is using{" "}
            <strong>moving setpoints</strong> from the trajectory instead of
            just the final target position.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h4 className="text-lg font-bold text-red-900 dark:text-red-300 mb-3">
                ❌ Basic Approach
              </h4>
              <CodeBlock
                code={`// PID compares current to FINAL target
double xError = targetX - currentX;
double yError = targetY - currentY;

// Large errors throughout journey
// More oscillation and overshoot`}
                language="java"
              />
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h4 className="text-lg font-bold text-green-900 dark:text-green-300 mb-3">
                ✅ Advanced Approach
              </h4>
              <CodeBlock
                code={`// Sample CTRE's LinearPath for the moving setpoint at elapsed time t.
LinearPath.State setpoint = path.calculate(t, startState, goal);

// Compare to the moving setpoint's pose, not the final target.
// (Was: targetX - currentX / targetY - currentY)
double xError = setpoint.pose.getX() - currentX;
double yError = setpoint.pose.getY() - currentY;

// Small errors (just track the path) — smoother, less oscillation`}
                language="java"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              Why This Matters
            </h4>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li>
                ✅ <strong>Smaller Errors:</strong> PID only keeps the robot on
                the planned path instead of correcting the entire distance to
                the target
              </li>
              <li>
                ✅ <strong>Smoother Control:</strong> the setpoint moves
                gradually along the trajectory, so corrections stay gentle and
                overshoot mostly disappears
              </li>
              <li>
                ✅ <strong>Predictable Behavior:</strong> the robot follows a
                planned path instead of whatever route PID happens to take
              </li>
            </ul>
          </div>
        </ContentCard>
      </section>

      {/* Wheel Force Calculations */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Wheel Force Feedforwards
        </h2>

        <ContentCard>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Understanding Force-Based Control
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            The advanced DriveToPoint calculates specific forces to apply to
            each swerve module. This allows the robot to anticipate and execute
            the accelerations needed to follow the planned trajectory.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">
              What are Wheel Forces?
            </h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
              When you command a swerve drivetrain to accelerate or turn, each
              individual wheel module needs to apply specific forces. The
              WheelForceCalculator determines exactly how much force each wheel
              should generate based on:
            </p>
            <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm ml-4">
              <li>• The desired change in velocity (from trajectory)</li>
              <li>• Robot&apos;s mass and moment of inertia (MOI)</li>
              <li>• Each wheel&apos;s position relative to robot center</li>
              <li>• Required acceleration to stay on trajectory</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                How It Works
              </h4>
              <ol className="space-y-3 text-slate-700 dark:text-slate-300 text-sm list-decimal ml-4">
                <li>
                  Calculate velocity change needed (current setpoint - previous
                  setpoint)
                </li>
                <li>Divide by time step (dt) to get required acceleration</li>
                <li>
                  Account for robot mass and moment of inertia (MOI parameter)
                </li>
                <li>Distribute forces across all wheel modules</li>
                <li>Return X and Y force arrays for each wheel</li>
              </ol>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                Phoenix 6 Integration
              </h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm mb-3">
                CTRE&apos;s Phoenix 6 API accepts force feedforwards directly:
              </p>
              <CodeBlock
                code={`driveRequest
  .withVelocity(correctedVelocities)     // ChassisVelocities via ApplyFieldVelocity.withVelocity(...)
  .withWheelForceFeedforwardsX(forces.x) // Phoenix 6 force feedforwards
  .withWheelForceFeedforwardsY(forces.y)`}
                language="java"
              />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h4 className="text-lg font-bold text-green-900 dark:text-green-300 mb-3">
              💡 Tuning: The MOI Parameter
            </h4>
            <p className="text-green-800 dark:text-green-200 text-sm mb-3">
              The moment of inertia (MOI) parameter represents your robot&apos;s
              resistance to rotation. Higher MOI means more force is needed for
              rotational changes.
            </p>
            <p className="text-green-800 dark:text-green-200 text-sm">
              A reasonable starting estimate is{" "}
              <code>MOI ≈ mass × (trackwidth / 2) × (wheelbase / 2)</code> —
              treat the robot as a uniform box and refine from there. For a
              measured value, CTRE&apos;s{" "}
              <a
                href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/mechanisms/swerve/swerve-builder-api.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-600 dark:hover:text-green-400"
              >
                swerve API documentation
              </a>{" "}
              covers characterizing the drivetrain, and a spin-in-place SysId
              test against the Pigeon 2 yaw gives you the rotational constants
              to back it out.
            </p>
          </div>
        </ContentCard>
      </section>

      {/* Workshop Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Workshop Implementation
        </h2>

        <ContentCard>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Profiled DriveToPoint Code
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-6">
            View the complete implementation in the workshop code repository.
            The pull request shows the profiled path following with feedforward
            control.
          </p>
          <GitHubContent
            repository="Hemlock5712/Workshop-Code"
            filePath="src/main/java/frc/robot/commands/DriveToPoint.java"
            branch="6-ProfiledToPoint"
            pr={{ number: 12, focusFile: "DriveToPoint.java" }}
          />
        </ContentCard>

        <Box variant="alert-info" tag="NOTE" title="The profiled command shape">
          <p>
            The profiled loop lives in a command that{" "}
            <code>extends ClassicCommand</code>, which gives you the explicit
            initialize / execute / isFinished / end lifecycle — the same shape
            the template&apos;s own <code>DriveToPose</code> uses. CTRE&apos;s
            straight-line profile generator is <code>LinearPath</code>, sampled
            each loop with <code>path.calculate(t, startState, goal)</code>, and
            the field-relative velocity request is{" "}
            <code>SwerveRequest.ApplyFieldVelocity</code> taking a{" "}
            <code>ChassisVelocities</code>.
          </p>
          <CodeBlock
            language="java"
            title="Profiled DriveToPoint (sketch, mirrors the template's DriveToPose)"
            code={`public class ProfiledDriveToPoint extends ClassicCommand {
  private final DriveMechanism drivetrain;
  private final Pose2d goal;

  // CTRE's straight-line profile generator: translation + rotation constraints.
  private final LinearPath path =
      new LinearPath(
          new TrapezoidProfile.Constraints(MAX_V, MAX_A),
          new TrapezoidProfile.Constraints(Math.PI, 2.0 * Math.PI));

  // Field-relative velocity request in the blue-origin frame (same frame as odometry).
  private final SwerveRequest.ApplyFieldVelocity driveRequest =
      new SwerveRequest.ApplyFieldVelocity()
          .withForwardPerspective(SwerveRequest.ForwardPerspectiveValue.BlueAlliance);

  private LinearPath.State startState = new LinearPath.State();
  private LinearPath.State prev = new LinearPath.State();
  private double startTime;

  public ProfiledDriveToPoint(DriveMechanism drivetrain, Pose2d goal) {
    super("ProfiledDriveToPoint", drivetrain); // name + requirement
    this.drivetrain = drivetrain;
    this.goal = goal;
  }

  @Override protected void initialize() {
    // Capture the start pose + field velocity the trajectory is generated from.
    startState = new LinearPath.State(drivetrain.getPose(), drivetrain.getFieldVelocity());
    startTime = Utils.getCurrentTimeSeconds();
    prev = startState;
  }

  @Override protected void execute() {
    double t = Utils.getCurrentTimeSeconds() - startTime;
    LinearPath.State setpoint = path.calculate(t, startState, goal);

    // Feedback (PID) trims measured pose back onto the profiled pose...
    ChassisVelocities corrected = applyPidCorrections(setpoint, drivetrain.getPose());
    // ...and the optional wheel-force feedforward anticipates the accel.
    WheelForces forces = wheelForceCalculator.compute(prev, setpoint, DT);

    drivetrain.setControl(
        driveRequest
            .withVelocity(corrected)
            .withWheelForceFeedforwardsX(forces.x)
            .withWheelForceFeedforwardsY(forces.y));
    prev = setpoint;
  }

  @Override protected boolean isFinished() {
    return path.isFinished(Utils.getCurrentTimeSeconds() - startTime);
  }

  @Override protected void end(boolean interrupted) {
    drivetrain.setControl(new SwerveRequest.Idle()); // runs on finish and cancel
  }
}`}
          />
        </Box>
      </section>

      {/* Practical Applications */}
      <CollapsibleSection title="🎯 When to Use Profiled Paths" variant="info">
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">
              ✅ Best Use Cases
            </h4>
            <ul className="space-y-2 text-green-800 dark:text-green-200 text-sm">
              <li>
                • <strong>Autonomous Routines:</strong> Smooth, predictable
                movement without overshoot
              </li>
              <li>
                • <strong>High-Speed Navigation:</strong> Safely reach maximum
                velocity without wheel slip
              </li>
              <li>
                • <strong>Precise Positioning:</strong> Minimal oscillation when
                reaching scoring positions
              </li>
              <li>
                • <strong>Teleop Assists:</strong> Drive-to-position helpers
                that feel smooth to drivers
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-bold text-yellow-900 dark:text-yellow-300 mb-2">
              ⚠️ When Basic Might Be Enough
            </h4>
            <ul className="space-y-2 text-yellow-800 dark:text-yellow-200 text-sm">
              <li>
                • <strong>Short Distances:</strong> Quick corrections where
                acceleration phase is minimal
              </li>
              <li>
                • <strong>Learning/Testing:</strong> Understanding PID
                fundamentals before adding complexity
              </li>
              <li>
                • <strong>Simple Teleop Assists:</strong> Driver-controlled
                movements with minimal autonomy
              </li>
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      {/* Quiz */}
      <Quiz
        title="Test Your Understanding"
        questions={[
          {
            id: 1,
            question:
              "What are the three phases of a trapezoidal motion profile?",
            options: [
              "Acceleration, cruise, deceleration",
              "Start, middle, end",
              "Fast, slow, stop",
              "Forward, turn, backward",
            ],
            correctAnswer: 0,
            explanation:
              "Trapezoidal profiles have three phases: acceleration (ramp up to max velocity), cruise (maintain max velocity), and deceleration (smooth brake to target).",
          },
          {
            id: 2,
            question:
              "What is the main difference between feedforward and feedback control?",
            options: [
              "Feedforward is faster than feedback",
              "Feedforward anticipates needed forces, feedback reacts to errors",
              "Feedforward only works with swerve drives",
              "Feedback is more accurate than feedforward",
            ],
            correctAnswer: 1,
            explanation:
              "Feedforward control is proactive - it anticipates what forces are needed based on the planned trajectory. Feedback control is reactive - it responds to errors after they occur. The best systems combine both approaches.",
          },
          {
            id: 3,
            question:
              "In the advanced DriveToPoint, what does the PID controller compare against?",
            options: [
              "The final target position",
              "The starting position",
              "The current setpoint from the trajectory",
              "The previous position",
            ],
            correctAnswer: 2,
            explanation:
              "The advanced version uses setpoint tracking - PID compares the current position to the moving setpoint on the planned trajectory, not the final target. This creates smaller errors and smoother control.",
          },
          {
            id: 4,
            question: "What does the WheelForceCalculator determine?",
            options: [
              "How fast the wheels should spin",
              "The specific forces each wheel module should apply",
              "The trajectory path to follow",
              "The PID controller gains",
            ],
            correctAnswer: 1,
            explanation:
              "WheelForceCalculator determines the specific X and Y forces that each swerve module should apply to execute the planned trajectory. It accounts for robot mass, moment of inertia, and required accelerations.",
          },
          {
            id: 5,
            question:
              "Why does the advanced DriveToPoint create smoother motion?",
            options: [
              "It uses faster PID loops",
              "It plans a trajectory with velocity constraints and uses feedforward",
              "It has more powerful motors",
              "It only works at slow speeds",
            ],
            correctAnswer: 1,
            explanation:
              "The advanced version creates smooth motion by planning a trajectory that respects velocity and acceleration constraints, then proactively applying the forces needed to follow it (feedforward) while making small corrections for disturbances (feedback).",
          },
          {
            id: 6,
            question: "What is the moment of inertia (MOI) parameter used for?",
            options: [
              "Controlling maximum velocity",
              "Determining how much force is needed for rotational changes",
              "Setting the PID gains",
              "Calculating the trajectory path",
            ],
            correctAnswer: 1,
            explanation:
              "The MOI parameter represents the robot's resistance to rotation. It's used to calculate how much force is needed to achieve desired rotational accelerations. Higher MOI means more force is required to rotate the robot.",
          },
          {
            id: 7,
            question: "How does the advanced DriveToPoint know when to finish?",
            options: [
              "It runs indefinitely like the basic version",
              "It checks if the trajectory elapsed time indicates completion",
              "It waits for the driver to press a button",
              "It stops after 5 seconds",
            ],
            correctAnswer: 1,
            explanation:
              "The advanced version uses path.isFinished(elapsedTime) to check if the planned trajectory has completed. The trajectory knows its own duration based on the distance, max velocity, and acceleration constraints.",
          },
        ]}
      />
    </PageTemplate>
  );
}
