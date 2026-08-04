import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentationButton from "@/components/DocumentationButton";
import GitHubContent from "@/components/GitHubContent";
import Quiz from "@/components/Quiz";
import { GitBranch } from "lucide-react";

export default function ProfiledDriveToPoint() {
  return (
    <PageTemplate
      title="Plan the whole trip, then follow the plan"
      emphasis="follow the plan"
      lede="The Drive to Point command you have now points the robot at the goal and turns the distance remaining into speed. Far away it asks for an enormous speed. Close in it asks for almost none. The robot lurches off the line and then creeps in at the end."
      needs={[
        <>
          <strong>Drive to Point</strong> finished, so you have{" "}
          <code>commands/DriveToPoint.java</code> and{" "}
          <code>utils/ClassicCommand.java</code> on disk, and A and B bound in{" "}
          <code>TeleopOpMode</code>.
        </>,
        <>
          <strong>Logging</strong>, from earlier in Workshop #2. One of the
          checks at the bottom of this page is a graph of a NetworkTables value.
        </>,
        <>
          <strong>Swerve Calibration</strong>, so odometry is trustworthy. This
          command drives to an absolute field pose, and it can only be as
          accurate as the pose it is comparing against.
        </>,
      ]}
      branch="6-ProfiledToPoint"
      time="Roughly 45 minutes to read and make the change"
    >
      <KeyConceptSection
        description={[
          "This lesson changes one file. Before the robot moves, the command works out the entire trip — speed up, cruise, slow down — and then follows that plan. PID stops being the driver and becomes the small correction on top.",
        ]}
        concept="Feedforward is the speed the plan says you should be going right now. Feedback (PID) is the small nudge that covers the gap between the plan and where the robot actually is."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>Branch:</strong> <code>6-ProfiledToPoint</code>, one commit
          past <code>5-DriveToPoint</code> (PR #12). It touches{" "}
          <strong>one file</strong> —{" "}
          <code>src/main/java/frc/robot/commands/DriveToPoint.java</code>, which
          grows from 87 lines to 120. Nothing else on the branch changes, not
          even the button bindings.
        </p>
        <p className="mt-3">
          <strong>What you&apos;ll build:</strong> the same class, the same
          button, but the robot ramps up, cruises, slows down and stops on its
          own. <strong>Roughly 45 minutes</strong> to read and make the change.
          Tuning it on a real robot takes longer.
        </p>
      </Box>

      {/* ── the problem ──────────────────────────────────────────────── */}
      <LessonSection
        id="what-is-wrong-with-the-version"
        title="What is wrong with the version you have"
      >
        <p className="prose-body measure">
          Here is the whole control loop from <code>5-DriveToPoint</code>. Three
          controllers, three numbers, straight out to the drivetrain.
        </p>

        <CodeBlock
          language="java"
          title="5-DriveToPoint — DriveToPoint.java, the version you have now"
          code={`private final PIDController xController = new PIDController(10, 0, 0);
private final PIDController yController = new PIDController(10, 0, 0);
private final PIDController headingController = new PIDController(7, 0, 0);

@Override
protected void execute() {
  Pose2d currentPose = drivetrain.getPose();

  double vx = xController.calculate(currentPose.getX(), targetPose.getX());
  double vy = yController.calculate(currentPose.getY(), targetPose.getY());
  double omega =
      headingController.calculate(
          currentPose.getRotation().getRadians(), targetPose.getRotation().getRadians());

  drivetrain.setControl(driveRequest.withVelocity(new ChassisVelocities(vx, vy, omega)));
}`}
        />

        <p className="prose-body measure">
          With <code>kP = 10</code>, the speed this asks for is ten times the
          distance left. Three meters from the goal it asks for{" "}
          <strong>30 m/s</strong>. Nothing in that file limits it. The
          drivetrain in the checked-in <code>TunerConstants.java</code> is rated
          at <code>kSpeedAt12Volts = 4.54</code> m/s, so the request is pinned
          at full throttle for most of the trip and then falls off a cliff as
          the error shrinks. Two things follow from that:
        </p>

        <ul
          className="ml-5 list-disc space-y-2"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            <strong>The motion is ugly.</strong> Full power off the line, wheels
            near slipping, then a long slow crawl into the goal. The controller
            has no idea how fast the robot can actually go, so it never asks for
            something reachable.
          </li>
          <li>
            <strong>It never ends.</strong> <code>isFinished()</code> returns{" "}
            <code>false</code> on that branch. The command runs until the driver
            releases the button. A command that never finishes cannot be a step
            inside <code>Command.sequence(...)</code>, which is what an
            autonomous routine is made of.
          </li>
        </ul>
      </LessonSection>

      {/* ── the fix ──────────────────────────────────────────────────── */}
      <LessonSection
        id="the-fix-let-a-plan-decide"
        title="The fix: let a plan decide the speed"
      >
        <p className="prose-body measure">
          Phoenix 6 ships a straight-line trip planner called{" "}
          <code>LinearPath</code>. You hand it two sets of limits — how fast and
          how hard the robot may drive, and how fast and how hard it may turn.
          Then, every loop, you ask it one question:
        </p>

        <Box variant="concept" title="The only question you ask the plan">
          <p>
            &quot;It is <em>t</em> seconds into the trip. Where should the robot
            be right now, and how fast should it be going?&quot;
          </p>
          <p className="mt-3">
            The answer comes back as a <code>LinearPath.State</code>, which
            holds two things: a <code>pose</code> (where) and a{" "}
            <code>velocity</code> (how fast). That pair is the whole idea of
            this lesson.
          </p>
        </Box>

        <p className="prose-body measure">
          Plot that planned speed against time and you get a trapezoid, which is
          where the name <code>TrapezoidProfile</code> comes from. Using the
          branch&apos;s own driving limits — <strong>2.5 m/s</strong> top speed
          and <strong>3.0 m/s²</strong> acceleration:
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <Box variant="alert-info" tag="PHASE 1" title="Speed up">
            <p>
              Gain 3.0 m/s of speed every second. Reaching 2.5 m/s takes about{" "}
              <strong>0.83 s</strong> and covers about <strong>1.04 m</strong>.
            </p>
          </Box>
          <Box variant="alert-info" tag="PHASE 2" title="Cruise">
            <p>
              Hold 2.5 m/s for whatever distance is left in the middle. On a
              short trip there is no middle and this phase never happens.
            </p>
          </Box>
          <Box variant="alert-info" tag="PHASE 3" title="Slow down">
            <p>
              Shed 3.0 m/s of speed every second, timed so the robot arrives at
              the goal with a planned speed of zero.
            </p>
          </Box>
        </div>

        <p className="prose-body measure">
          Speeding up and slowing down each need about 1.04 m, so a trip has to
          be longer than roughly <strong>2.1 m</strong> before the robot ever
          touches 2.5 m/s. Anything shorter is a triangle: speed up, then
          straight into slowing down. The plan handles that on its own — there
          is no special case for you to write.
        </p>
      </LessonSection>

      {/* ── make the change ──────────────────────────────────────────── */}
      <LessonSection id="make-the-change" title="Make the change">
        <p className="prose-body measure">
          Everything below happens inside{" "}
          <code>src/main/java/frc/robot/commands/DriveToPoint.java</code>. The
          class keeps its name, keeps <code>extends ClassicCommand</code>, and
          keeps its four methods. One rename to know about before you start: the
          branch renames the field <code>targetPose</code> to <code>goal</code>,
          because the plan now has a start <em>and</em> a goal and{" "}
          &quot;target&quot; had become ambiguous. Step 4 makes that rename.
        </p>

        {/* step 1 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          1. Add three imports
        </h3>

        <CodeBlock
          language="java"
          title="Top of DriveToPoint.java — new lines only"
          code={`import com.ctre.phoenix6.Utils;                          // the robot's clock
import com.ctre.phoenix6.swerve.utility.LinearPath;      // the trip planner
import org.wpilib.math.trajectory.TrapezoidProfile;      // the shape of the plan`}
        />

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> none yet, and your editor will
          probably gray all three out as unused. That is expected until step 2.
        </p>

        {/* step 2 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          2. Add the plan as a field
        </h3>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — a new field, next to the controllers"
          code={`// The trip planner. First pair of limits: top speed (m/s) and acceleration (m/s²) for
// driving. Second pair: the same for turning (rad/s, rad/s²).
// TODO: tune to what your drivetrain can do.
private final LinearPath path =
    new LinearPath(
        new TrapezoidProfile.Constraints(2.5, 3.0),
        new TrapezoidProfile.Constraints(Math.PI, 2.0 * Math.PI));`}
        />

        <p className="prose-body measure">
          <code>Math</code> is a class Java ships with. You never build one —
          you call things on it by name. <code>Math.PI</code> is the constant
          3.14159…, which is half a turn in radians, so the turning limits read
          as half a turn per second and one full turn per second squared.
        </p>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> the project compiles again and the
          imports stop being grayed out. The robot behaves exactly as before —
          nothing reads <code>path</code> yet.
        </p>

        {/* step 3 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          3. Drop the PID gains
        </h3>

        <p className="prose-body measure">
          This is the step people skip, and it is the one that matters most. All
          three gains come down.
        </p>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — replace the three controllers"
          code={`// BEFORE (5-DriveToPoint): PID produced the entire commanded velocity.
private final PIDController xController = new PIDController(10, 0, 0);
private final PIDController yController = new PIDController(10, 0, 0);
private final PIDController headingController = new PIDController(7, 0, 0);

// AFTER (6-ProfiledToPoint): PID only trims drift off the plan. Raise kP if the robot
// lags the plan or stops short of the goal. Lower it (or add kD) if the robot wobbles.
// TODO: tune.
private final PIDController xController = new PIDController(3.0, 0.0, 0.0);
private final PIDController yController = new PIDController(3.0, 0.0, 0.0);
private final PIDController headingController = new PIDController(4.0, 0.0, 0.0);`}
        />

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> nothing good, yet. Run it now and the
          robot is <em>worse</em> — the X and Y gains are about a third of what
          they were, heading is roughly half, and nothing has replaced the speed
          they were producing. Steps 5 to 7 put the plan in charge. Do not stop
          here.
        </p>

        {/* step 4 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          4. Rename the field to <code>goal</code>
        </h3>

        <p className="prose-body measure">
          Four things change together: the field, the constructor parameter, the
          assignment and the <code>@param</code> line in the javadoc above the
          constructor. Your editor&apos;s rename refactor does all of them at
          once. The constructor is otherwise untouched — the{" "}
          <code>enableContinuousInput</code> call carries over from the last
          lesson, minus its comment.
        </p>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — the field and the constructor"
          code={`// BEFORE (5-DriveToPoint)
private final Pose2d targetPose;

public DriveToPoint(DriveMechanism drivetrain, Pose2d targetPose) {
  super("DriveToPoint", drivetrain); // command name + required mechanism
  this.drivetrain = drivetrain;
  this.targetPose = targetPose;

  // Wrap heading error to [-pi, pi] so the robot turns the short way around.
  headingController.enableContinuousInput(-Math.PI, Math.PI);
}

// AFTER (6-ProfiledToPoint)
private final Pose2d goal;

public DriveToPoint(DriveMechanism drivetrain, Pose2d goal) {
  super("DriveToPoint", drivetrain); // command name + required mechanism
  this.drivetrain = drivetrain;
  this.goal = goal;
  headingController.enableContinuousInput(-Math.PI, Math.PI);
}`}
        />

        <p className="prose-body measure">
          That is the second place <code>Math</code> turns up.{" "}
          <code>enableContinuousInput(-Math.PI, Math.PI)</code> tells the
          heading controller that its input wraps around at half a turn either
          way, so a robot at 179° asked to reach −179° turns 2° rather than
          358°.
        </p>

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> the project compiles and the robot
          behaves exactly as it did after step 3 — a rename refactor updates{" "}
          <code>execute()</code> for you. Miss it and step 6 will not compile,
          because the new <code>execute()</code> asks for <code>goal</code>.
        </p>

        {/* step 5 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          5. Take a snapshot when the command starts
        </h3>

        <p className="prose-body measure">
          The plan is generated once, from where the robot was and how fast it
          was moving at the moment the button went down. That snapshot and a
          start time are the two new fields.
        </p>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — two new fields, and initialize()"
          code={`// Where the robot was, and how fast it was moving, when the command started. The whole
// trip is planned from this one snapshot.
private LinearPath.State startState = new LinearPath.State();
// When the command started. (now - startTime) says how far into the trip we are.
private double startTime;

/** Takes the starting snapshot and starts the trip clock. */
@Override
protected void initialize() {
  startState = new LinearPath.State(drivetrain.getPose(), drivetrain.getFieldVelocity());
  startTime = Utils.getCurrentTimeSeconds();
  xController.reset();
  yController.reset();
  headingController.reset();
}`}
        />

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> still nothing on the robot, but{" "}
          <code>getFieldVelocity()</code> is worth noticing. Feeding the
          robot&apos;s current speed into the plan means the profile starts from
          whatever the robot is already doing, instead of assuming it is
          stopped.
        </p>

        {/* step 6 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          6. Rewrite <code>execute()</code>
        </h3>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — the new control loop"
          code={`/** Runs every robot loop while the command is active. */
@Override
protected void execute() {
  // Ask the plan where we should be, this many seconds into the trip.
  double t = Utils.getCurrentTimeSeconds() - startTime;
  LinearPath.State setpoint = path.calculate(t, startState, goal);

  Pose2d measuredPose = drivetrain.getPose();

  // The plan's velocity does the driving. Each PID call below adds a small correction that
  // pulls the measured pose back onto the planned pose.
  ChassisVelocities feedforward = setpoint.velocity;
  double vx = feedforward.vx + xController.calculate(measuredPose.getX(), setpoint.pose.getX());
  double vy = feedforward.vy + yController.calculate(measuredPose.getY(), setpoint.pose.getY());
  double omega =
      feedforward.omega
          + headingController.calculate(
              measuredPose.getRotation().getRadians(), setpoint.pose.getRotation().getRadians());

  drivetrain.setControl(driveRequest.withVelocity(new ChassisVelocities(vx, vy, omega)));
}`}
        />

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> hold B in the simulator and the robot
          now ramps smoothly instead of lurching. It will drive past the goal
          and keep going, because <code>isFinished()</code> still returns{" "}
          <code>false</code>. Step 7 fixes that.
        </p>

        {/* step 7 */}
        <h3 className="display m-0 text-aside" style={{ marginBottom: "-8px" }}>
          7. Give the command a finish line
        </h3>

        <CodeBlock
          language="java"
          title="DriveToPoint.java — isFinished()"
          code={`/**
 * Done when the planned trip time is up. The plan knows how long the whole trip takes, so
 * "am I done" is just a time check - no position tolerances needed.
 */
@Override
protected boolean isFinished() {
  return path.isFinished(Utils.getCurrentTimeSeconds() - startTime);
}`}
        />

        <p className="prose-body-sm measure">
          <strong>Visible result:</strong> the robot arrives and stops, without
          you releasing the button. <code>end(boolean)</code> is unchanged — it
          still sends <code>new SwerveRequest.Idle()</code>, and it runs whether
          the command finished on its own or was interrupted.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="This finish line is a clock, not a tape measure"
        >
          <p>
            <code>path.isFinished(t)</code> asks whether the <em>plan</em> is
            over, not whether the robot arrived. If the robot fell behind — the
            limits were too aggressive, or the gains are too low to close the
            gap — the command ends anyway, wherever the robot happens to be.
            That is the trade you are making for a finish line that never hangs.
          </p>
        </Box>
      </LessonSection>

      {/* ── the gains ────────────────────────────────────────────────── */}
      <LessonSection
        id="why-the-gains-had-to-come"
        title="Why the gains had to come down"
      >
        <p className="prose-body measure">
          A PID controller answers one question:{" "}
          <em>how far off am I, and what speed should that be worth?</em> What
          changed between the two branches is not the question — it is the error
          being fed in.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-note">
            <thead>
              <tr>
                <th
                  className="border px-3 py-2 text-left"
                  style={{
                    borderColor: "var(--line)",
                    color: "var(--fg)",
                    background: "var(--bg-elev)",
                  }}
                >
                  &nbsp;
                </th>
                <th
                  className="border px-3 py-2 text-left"
                  style={{
                    borderColor: "var(--line)",
                    color: "var(--fg)",
                    background: "var(--bg-elev)",
                  }}
                >
                  <code>5-DriveToPoint</code>
                </th>
                <th
                  className="border px-3 py-2 text-left"
                  style={{
                    borderColor: "var(--line)",
                    color: "var(--fg)",
                    background: "var(--bg-elev)",
                  }}
                >
                  <code>6-ProfiledToPoint</code>
                </th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--fg-mute)" }}>
              <tr>
                <td
                  className="border px-3 py-2 font-semibold"
                  style={{ borderColor: "var(--line)" }}
                >
                  PID compares against
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  the final goal pose
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  <code>setpoint.pose</code> — where the plan says the robot
                  should be <em>this loop</em>
                </td>
              </tr>
              <tr>
                <td
                  className="border px-3 py-2 font-semibold"
                  style={{ borderColor: "var(--line)" }}
                >
                  Typical error
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  meters, for most of the trip
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  centimeters, the whole trip
                </td>
              </tr>
              <tr>
                <td
                  className="border px-3 py-2 font-semibold"
                  style={{ borderColor: "var(--line)" }}
                >
                  PID&apos;s job
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  produce the entire commanded velocity
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  add a correction on top of <code>setpoint.velocity</code>
                </td>
              </tr>
              <tr>
                <td
                  className="border px-3 py-2 font-semibold"
                  style={{ borderColor: "var(--line)" }}
                >
                  X / Y / heading kP
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  10 / 10 / 7
                </td>
                <td
                  className="border px-3 py-2"
                  style={{ borderColor: "var(--line)" }}
                >
                  3.0 / 3.0 / 4.0
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="prose-body measure">
          Leave the gains at 10 and the correction stacks on top of a plan that
          was already asking for the right speed. Ten centimeters of drift buys
          a whole extra meter per second of command. The robot hunts around the
          planned path instead of settling onto it.
        </p>

        <Box
          variant="alert-warning"
          tag="NOTE · UNTUNED"
          title="3.0 / 3.0 / 4.0 are starting points, not answers"
        >
          <p>
            The branch marks both the gains and the limits{" "}
            <code>TODO: tune</code>. Its own comment says what to look for:{" "}
            <em>
              raise kP if the robot lags the plan or stops short of the goal;
              lower it, or add kD, if the robot wobbles.
            </em>{" "}
            These numbers are a place to start, not values anyone measured for
            your robot.
          </p>
          <p className="mt-3">
            The limits are deliberately timid for the same reason. A 2.5 m/s
            cruise is a little over half of the{" "}
            <code>kSpeedAt12Volts = 4.54</code> m/s in the checked-in{" "}
            <code>TunerConstants.java</code> — and that file is itself the
            generator&apos;s example, not a measurement of your drivetrain.
            Leaving headroom means the PID correction has somewhere to go when
            the robot falls behind. A plan that asks for the robot&apos;s
            absolute top speed leaves the correction nothing to add.
          </p>
        </Box>
      </LessonSection>

      {/* ── feedforward ──────────────────────────────────────────────── */}
      <LessonSection
        id="the-feedforward-is-one-line"
        title="The feedforward is one line"
      >
        <p className="prose-body measure">
          &quot;Feedforward&quot; sounds like it needs a model of the robot, its
          mass and its wheels. Here it does not. The plan already knows how fast
          the robot should be going, so the feedforward is that number, read
          straight off the setpoint:
        </p>

        <CodeBlock
          language="java"
          hideControls
          code={`ChassisVelocities feedforward = setpoint.velocity;`}
        />

        <p className="prose-body measure">
          <code>ChassisVelocities</code> carries three numbers: <code>vx</code>{" "}
          (meters per second across the field, away from the blue driver
          station), <code>vy</code> (meters per second to the left) and{" "}
          <code>omega</code> (radians per second, counter-clockwise). Each one
          gets its PID correction added to it, and the sum goes out as a single
          field-relative request.
        </p>

        <Box variant="concept" title="Two jobs, cleanly split">
          <p>
            <strong>
              Feedforward answers &quot;what should I be doing?&quot;
            </strong>{" "}
            It is open-loop: it does not look at the robot at all. On a perfect
            robot on a perfect floor, feedforward alone would drive the whole
            trip and PID would contribute zero.
          </p>
          <p className="mt-3">
            <strong>Feedback answers &quot;how far off am I?&quot;</strong> It
            covers everything the plan cannot know about — wheel slip, carpet, a
            nudge from another robot, odometry drift.
          </p>
        </Box>

        <p className="prose-body measure">
          One detail carried over unchanged from the previous lesson: the
          request is built with{" "}
          <code>.withDriveRequestType(DriveRequestType.OpenLoopVoltage)</code>,
          so the speeds you send are turned straight into motor voltage. There
          is no second PID loop on the wheels to tune underneath this one.
        </p>
      </LessonSection>

      {/* ── the file ─────────────────────────────────────────────────── */}
      <LessonSection id="the-whole-file" title="The whole file">
        <p className="prose-body measure">
          120 lines, and you have now seen every part that changed. The{" "}
          <strong>GitHub Changes</strong> tab is PR #12 — one file, one commit,
          59 lines added and 26 removed. Reading it side by side is the fastest
          way to check your own edit.
        </p>

        <GitHubContent
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/commands/DriveToPoint.java"
          branch="6-ProfiledToPoint"
          pr={{ number: 12, focusFile: "DriveToPoint.java" }}
        />
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <p className="prose-body measure">
          The bindings are already in <code>TeleopOpMode</code> from the last
          lesson, unchanged on this branch:
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — already there, nothing to add"
          code={`// Hold A or B to drive straight to a fixed spot on the field. Let go to stop.
driver.a().whileTrue(new DriveToPoint(drivetrain, Pose2d.kZero));
driver
    .b()
    .whileTrue(new DriveToPoint(drivetrain, new Pose2d(3, 2, Rotation2d.fromDegrees(180))));`}
        />

        <ol
          className="ml-5 list-decimal space-y-3"
          style={{ color: "var(--fg-mute)" }}
        >
          <li>
            Start the simulator and enable Teleop, the same way you have all
            course.
          </li>
          <li>
            Hold <strong>B</strong>. <strong>You should see:</strong> the robot
            eases away instead of snapping to full power, holds a steady speed
            through the middle, and eases off at the end. From the field origin
            the B goal is about 3.6 m away — comfortably past the 2.1 m needed
            to reach cruise speed, so all three phases happen.
          </li>
          <li>
            Keep holding <strong>B</strong> after it arrives.{" "}
            <strong>You should see:</strong> the robot stops and stays stopped.
            The command finished on its own; the button no longer matters. On{" "}
            <code>5-DriveToPoint</code> it would still be pushing.
          </li>
          <li>
            Open Glass or AdvantageScope and graph{" "}
            <code>Drivetrain/TranslationSpeedMps</code> — the key{" "}
            <code>Telemetry.java</code> publishes.{" "}
            <strong>You should see:</strong> a trapezoid. A ramp up, a flat top
            near 2.5, a ramp down to zero. That flat top is the proof the plan
            is in charge, and it is the shape the old version could never
            produce.
          </li>
          <li>
            Now graph <code>Drivetrain/Pose</code> for the same run.{" "}
            <strong>You should see:</strong> it settle close to (3, 2) with a
            heading near 180°. How close is the tuning conversation — see the
            failure list below.
          </li>
          <li>
            Hold <strong>A</strong> from where the robot stopped, sending it
            back to <code>Pose2d.kZero</code>. <strong>You should see:</strong>{" "}
            the same trapezoid in the other direction, and the robot turning
            back to 0° as it drives rather than spinning first and driving
            second. Keep holding until it stops on its own — a quick tap
            releases the button, and <code>whileTrue</code> cancels the command
            when the button comes up.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="Three things that go wrong here"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>
                The robot wobbles or weaves along the path instead of tracking
                it.
              </strong>{" "}
              You left the gains at 10 / 10 / 7. The plan is already supplying
              the speed, so the old correction is now piled on top of it. Go
              back to step 3. If they are already at 3.0 / 3.0 / 4.0 and it
              still wobbles, the branch&apos;s own advice is to lower kP further
              or add a little kD.
            </li>
            <li>
              <strong>
                The robot lunges off in the wrong direction the moment you press
                the button.
              </strong>{" "}
              The <code>startState</code> line is missing from{" "}
              <code>initialize()</code>, so the field is still the empty{" "}
              <code>new LinearPath.State()</code> it was given at declaration.
              The plan is being drawn from whatever that empty state holds
              instead of from where the robot is. Re-check step 5.
            </li>
            <li>
              <strong>
                The command ends but the robot is short of the goal.
              </strong>{" "}
              The finish line is the plan&apos;s clock, so the command stops
              when the plan says the trip is over. Either the robot could not
              keep up with the limits — lower 2.5 / 3.0 until it can — or the
              gains are too small to close the last of the gap. Graph{" "}
              <code>Drivetrain/TranslationSpeedMps</code> again: if the measured
              speed never reaches the flat top, the limits are the problem, not
              the gains.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── what's next ──────────────────────────────────────────────── */}
      <LessonSection
        id="what-you-can-do-now-that"
        title="What you can do now that it finishes"
      >
        <p className="prose-body measure">
          <code>isFinished()</code> returning something real is the quiet payoff
          of this lesson. A command with an ending is a <strong>step</strong>,
          and steps are what <code>Command.sequence(...)</code> takes. Two legs
          of a route now look like this:
        </p>

        <CodeBlock
          language="java"
          title="What the next lesson builds on"
          code={`Command.sequence(
        new DriveToPoint(drivetrain, new Pose2d(3, 2, Rotation2d.fromDegrees(180))),
        new DriveToPoint(drivetrain, Pose2d.kZero))
    .named("Out And Back")`}
        />

        <p className="prose-body measure">
          On <code>5-DriveToPoint</code> that sequence would stick on the first
          leg forever — THE ONE RULE, from Chaining Commands. The next lesson,{" "}
          <strong>Autonomous: Driving to a Pose</strong>, is where you turn that
          into a real <code>@Autonomous</code> OpMode and deal with seeding the
          robot&apos;s starting pose.
        </p>

        <CollapsibleSection title="One name you may run into: WheelForceCalculator">
          <p>
            Phoenix 6 also ships a <code>WheelForceCalculator</code>, which
            works out a force for each individual swerve module from the
            robot&apos;s mass and its moment of inertia, and feeds those forces
            to the drivetrain as a second kind of feedforward. It is a genuine
            class and a genuine technique.
          </p>
          <p className="mt-3">
            <strong>The workshop code does not use it,</strong> and you do not
            need it. The chassis-velocity feedforward on this page is what{" "}
            <code>6-ProfiledToPoint</code> does, and it is enough to make the
            motion smooth. It is named here only so you recognize it if you meet
            it in another team&apos;s code.
          </p>
        </CollapsibleSection>

        <DocumentationButton
          href="https://github.com/Hemlock5712/Workshop-Code/pull/12"
          title="PR #12 — Update Drive to point to use profiled PID"
          icon={<GitBranch className="w-5 h-5" />}
        />
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "6-ProfiledToPoint drops the PID gains from 10 / 10 / 7 to 3.0 / 3.0 / 4.0. Why?",
            options: [
              "Smaller gains are always safer, whatever the controller is doing",
              "PID no longer produces the driving velocity — it only corrects the small gap between the plan and the measured pose",
              "LinearPath requires gains below 5.0",
              "The lower gains make the robot reach the goal faster",
            ],
            correctAnswer: 1,
            explanation:
              "On 5-DriveToPoint, PID output WAS the commanded velocity, so it needed a big gain to move the robot at all. On 6-ProfiledToPoint, setpoint.velocity does the driving and PID only trims centimeters of drift. Leaving the gains at 10 stacks a large correction on a plan that was already correct, and the robot hunts.",
          },
          {
            id: 2,
            question:
              "What does path.calculate(t, startState, goal) hand back each loop?",
            options: [
              "The distance remaining to the goal",
              "A LinearPath.State — the pose the robot should be at right now, and the velocity it should be moving at",
              "A finished Command you can bind to a button",
              "The forces each swerve module should apply",
            ],
            correctAnswer: 1,
            explanation:
              "It returns a LinearPath.State with two parts: setpoint.pose (where the plan says you should be at time t) and setpoint.velocity (how fast). The pose becomes the PID target; the velocity becomes the feedforward.",
          },
          {
            id: 3,
            question: "In this command, what exactly is the feedforward?",
            options: [
              "A per-wheel force computed from the robot's mass and moment of inertia",
              "The planned chassis velocity, read straight off the setpoint: ChassisVelocities feedforward = setpoint.velocity",
              "The integral term of the three PID controllers",
              "The driver's joystick input, blended in",
            ],
            correctAnswer: 1,
            explanation:
              "One line. The plan already knows the speed the robot should be going, so that speed IS the feedforward. Each of its three components — vx, vy, omega — then gets its PID correction added before the sum is sent to the drivetrain.",
          },
          {
            id: 4,
            question:
              "The command's constraints are TrapezoidProfile.Constraints(2.5, 3.0) for driving. What do those two numbers mean?",
            options: [
              "2.5 seconds to accelerate, 3.0 seconds to decelerate",
              "A top speed of 2.5 m/s and an acceleration limit of 3.0 m/s²",
              "kP of 2.5 and kD of 3.0",
              "2.5 meters of travel at 3.0 volts",
            ],
            correctAnswer: 1,
            explanation:
              "First value is the cruise velocity (m/s), second is the acceleration (m/s²). The second Constraints in the same constructor — Math.PI and 2.0 * Math.PI — is the same pair for turning, in rad/s and rad/s². The branch marks all four TODO: tune.",
          },
          {
            id: 5,
            question: "How does isFinished() decide the command is done?",
            options: [
              "It checks whether the measured pose is within a tolerance of the goal",
              "It returns path.isFinished(elapsedTime) — the planned trip time is up",
              "It never finishes; the driver releases the button",
              "It waits for all three PID controllers to report atSetpoint()",
            ],
            correctAnswer: 1,
            explanation:
              "It is a clock check, not a distance check. The plan knows how long the trip takes, so no position tolerance is needed. The trade-off: if the robot fell behind the plan, the command still ends on schedule, wherever the robot actually is.",
          },
          {
            id: 6,
            question:
              "Why can a 6-ProfiledToPoint DriveToPoint sit inside Command.sequence(...) when the 5-DriveToPoint version could not?",
            options: [
              "Because it extends ClassicCommand and the old one did not",
              "Because it finishes on its own; the old version's isFinished() returned false, so a sequence would wait on it forever",
              "Because Command.sequence only accepts commands that use feedforward",
              "Because it requires the drivetrain and the old one did not",
            ],
            correctAnswer: 1,
            explanation:
              "THE ONE RULE from Chaining Commands: nothing may wait on a command that never ends. The old version ran until interrupted, so it would hang a sequence on its first leg. Giving it a real finish line is what makes autonomous routines possible in the next lesson.",
          },
        ]}
      />
    </PageTemplate>
  );
}
