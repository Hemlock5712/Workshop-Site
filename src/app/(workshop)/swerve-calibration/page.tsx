import PageTemplate from "@/components/PageTemplate";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import { Book } from "lucide-react";

export default function SwerveCalibration() {
  return (
    <PageTemplate
      title="Make the robot's idea of where it is match reality"
      emphasis="match reality"
      lede="The swerve project you generated came with a TunerConstants.java full of placeholder numbers. DriveMechanism.java says so where it builds the drivetrain: the checked-in file is an EXAMPLE with fake device IDs and gains. This page is where you replace the ones that matter with measurements off your actual robot."
      needs={[
        <>
          A swerve robot you can drive, from{" "}
          <strong>Creating a Swerve Drive Project</strong> — modules turning,
          sticks working.
        </>,
        <>
          Logging turned on, from <strong>Logging</strong>. Two of the steps
          below read a number out of a <code>.wpilog</code> in AdvantageScope.
        </>,
        <>
          Phoenix Tuner X, and the robot on carpet with about six meters of
          clear floor.
        </>,
        <>
          A tape measure, a straight edge (a long piece of aluminum or a 2x4),
          and a wall you are allowed to push against.
        </>,
      ]}
      time="Budget an afternoon"
    >
      <Split>
        <KeyConceptSection
          description={[
            "There is almost no code on this page. What you produce is a set of measured numbers and one changed word — and an odometry reading you are willing to trust, which is what every page after this one is built on.",
          ]}
          concept="Calibration is measuring your robot and writing the measurements into TunerConstants.java."
        />
        <MarginNote label="WHAT YOU'LL PRODUCE">
          Four CANcoder offset constants; measured values for{" "}
          <code>kWheelRadius</code>, <code>kSpeedAt12Volts</code> and{" "}
          <code>kSlipCurrent</code>; tuned <code>steerGains</code> and{" "}
          <code>driveGains</code>, which are several numbers each; plus one
          changed word and a smaller deadband in <code>TeleopOpMode.java</code>.
          Steps 3, 4 and 5 each need the floor and a robot somebody is driving,
          which is what makes this an afternoon.
        </MarginNote>
      </Split>

      {/* ── WHY HERE ─────────────────────────────────────────────────── */}
      <LessonSection
        id="why-this-page-sits-between-logging"
        title="Why calibration comes before paths and vision"
      >
        <p>
          Everything from here on reads <code>drivetrain.getPose()</code>. Path
          planning uses it as a start, autonomous logs it, vision corrects it,
          and Drive to Point steers from it. If the pose is wrong, all of those
          behaviors inherit the same error.
        </p>

        <p>
          It sits <em>after</em> Logging because two of the steps below work by
          driving the robot, stopping, and reading a number out of the log
          afterward. You cannot do that with a robot that is not logging.
        </p>

        <Box variant="concept" title="The order for the whole robot">
          <p>
            Calibration is not one afternoon, it is a sequence, and only part of
            it can happen before the game is announced:
          </p>
          <ol className="ml-4 mt-3 list-decimal space-y-1">
            <li>
              Steer and drive motor gains, wheel radius, top speed, slip current
              — <strong>this page</strong>.
            </li>
            <li>
              Route geometry and a first routine — <strong>PathPlanner</strong>{" "}
              and <strong>Autonomous</strong>, later in this workshop.
            </li>
            <li>
              Camera mounting offsets and AprilTag trust —{" "}
              <strong>Vision</strong> in Workshop #4.
            </li>
            <li>
              Driving to a point, then profiling that drive — the Drive to Point
              pages later in Workshop #4.
            </li>
          </ol>
          <p className="mt-3">
            Game-specific autonomous routes still wait for kickoff, but the
            OpMode and command structure can be tested now with a simple open
            field route.
          </p>
        </Box>
      </LessonSection>

      {/* ── SEEDING ──────────────────────────────────────────────────── */}
      {/* The id below is a stable link target for the three-way "zeroing"
          distinction, so other pages can point here instead of restating it.
          Do not rename. */}
      <LessonSection
        id="three-things-that-all-sound-like"
        title='Three things that all sound like "zeroing"'
      >
        <p>
          This trips up nearly everybody, so it gets its own section before the
          steps. The swerve code has three separate operations that all get
          described as resetting or seeding, and they do different jobs. Mixing
          them up produces a robot that drives beautifully and has no idea where
          it is.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-note">
            <thead>
              <tr>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--rule)", color: "var(--tx)" }}
                >
                  Operation
                </th>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--rule)", color: "var(--tx)" }}
                >
                  What it changes
                </th>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--rule)", color: "var(--tx)" }}
                >
                  What it does <em>not</em> change
                </th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  <code>seedFieldCentric()</code>
                  <div className="mt-1 text-note">left bumper, on demand</div>
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  Which way the driver&apos;s sticks call &quot;forward.&quot;
                  Whatever direction the robot is facing right now becomes
                  forward.
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  Where the robot is. It never supplies an x or a y.
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  <code>applyOperatorPerspective()</code>
                  <div className="mt-1 text-note">every loop, automatic</div>
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  The same &quot;forward,&quot; but from the alliance color: 0°
                  on blue, 180° on red, so the sticks feel the same from either
                  driver station.
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  Where the robot is. Also never an x or a y.
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  <code>resetPose(Pose2d)</code>
                  <div className="mt-1 text-note">
                    the one nothing calls yet
                  </div>
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  Where the robot thinks it is: a real x, y and heading on the
                  field, in meters from the blue corner.
                </td>
                <td
                  className="border-b px-3 py-3 align-top"
                  style={{ borderColor: "var(--rule-soft)" }}
                >
                  Anything about the sticks.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          The first two are heading references — a heading, and only a heading.
          The <code>DriveMechanism</code> you have wraps{" "}
          <code>seedFieldCentric()</code> with the comment{" "}
          <em>
            &quot;Resets the field-centric heading so &apos;forward&apos;
            matches the driver&apos;s current facing,&quot;
          </em>{" "}
          and <code>TeleopOpMode</code> binds it like this:
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — the only seeding on the branch"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          code={`// Left bumper: make the robot's current facing the new "forward".
driver.leftBumper().onTrue(drivetrain.seedFieldCentric());`}
        />

        <p>
          Press it and the robot drives correctly again from the driver&apos;s
          point of view. Press it and <code>Drivetrain/Pose</code> still says
          the robot is wherever odometry has been quietly accumulating since
          power-on — which, unless something told it otherwise, is (0, 0).
        </p>

        <Box
          variant="alert-warning"
          tag="THE HONEST VERSION"
          title="Nothing on these branches ever sets an absolute field pose"
        >
          <p>
            <code>resetPose(Pose2d)</code> is a real Phoenix 6 method on the
            drivetrain, and the pose you hand it belongs in the same frame{" "}
            <code>getPose()</code> in <code>DriveMechanism</code> already
            describes:{" "}
            <em>
              &quot;(0, 0) is always the blue alliance corner. It does not flip
              when you are on red.&quot;
            </em>
          </p>
          <p className="mt-3">
            But <code>DriveMechanism</code> does not expose it, and no file in
            the workshop code or the robot template calls it. The
            template&apos;s <code>AutonomousOpMode</code> even says in a comment
            that it{" "}
            <em>
              &quot;assumes odometry has been seeded to the starting pose&quot;
            </em>{" "}
            — and then nothing seeds it. That is a real gap, not a thing you
            missed.
          </p>
          <p className="mt-3">
            So on the code you have, the only thing that ever gives odometry an
            absolute field position is <strong>vision</strong>, which is the
            Vision in Workshop #4. Until then, treat{" "}
            <code>Drivetrain/Pose</code> as &quot;distance and direction
            traveled since boot,&quot; which is exactly what steps 3 and 4 below
            use it for. If you want a real pose reset, you add a wrapper next to{" "}
            <code>setControl</code> and <code>getPose</code> that forwards to{" "}
            <code>drivetrain.resetPose(pose)</code>.
          </p>
        </Box>

        <p>
          One consequence worth carrying to the Vision lesson: with a single tag
          in view the camera code switches to MegaTag2, which trusts the gyro
          heading instead of solving for it. Its own comment says{" "}
          <em>
            &quot;so seed the gyro, or single-tag results will be off.&quot;
          </em>{" "}
          A heading that is ten degrees out produces a position that is
          confidently wrong — and pressing the left bumper is not what fixes it.
        </p>
      </LessonSection>

      {/* ── THE STEPS ────────────────────────────────────────────────── */}
      <LessonSection
        id="seven-steps-in-this-order"
        title="Seven steps, in this order"
      >
        <p>
          The order is not arbitrary. Each step measures something the steps
          after it depend on. Do them out of order and you will measure a
          correct number for a robot that no longer exists by the time you use
          it.
        </p>

        <Box
          variant="alert-info"
          tag="ABOUT TUNER X"
          title="No screenshots — look for the state, not the button"
        >
          <p>
            Several of these steps drive Phoenix Tuner X, and there are no
            pictures of it on this page. Tuner X moves its buttons around
            between releases; what does not move is the state you are looking
            for. Every step below tells you what the plot or the number should
            be doing when you have got it right, so you can find the control
            yourself and still know whether it worked.
          </p>
        </Box>

        <CodeBlock
          language="java"
          title="What TunerConstants.java ships with"
          filename="src/main/java/frc/robot/generated/TunerConstants.java"
          code={`// Both sets of gains need to be tuned to your individual robot.
private static final Slot0Configs steerGains =
    new Slot0Configs()
        .withKP(100)
        .withKI(0)
        .withKD(0.5)
        .withKS(0.1)
        .withKV(1.91)
        .withKA(0)
        .withStaticFeedforwardSign(StaticFeedforwardSignValue.UseClosedLoopSign);

private static final Slot0Configs driveGains =
    new Slot0Configs().withKP(0.2).withKI(0).withKD(0).withKS(0).withKV(0.124);

// The stator current at which the wheels start to slip;
// This needs to be tuned to your individual robot
private static final Current kSlipCurrent = Amps.of(120);

private static final Distance kWheelRadius = Inches.of(2.167);

// Measured robot speed (m/s) at 12 V applied output;
// This is NOT the desired max robot speed - see maxSpeed in TeleopOpMode instead;
// This needs to be tuned to your individual robot
public static final LinearVelocity kSpeedAt12Volts = MetersPerSecond.of(4.54);`}
        />

        <p>
          Those are the numbers you are replacing. They are not nonsense — they
          are a plausible robot that is not yours. Each step below says which
          line it edits.
        </p>

        {/* Step 1 */}
        <div className="flex flex-col gap-3">
          <h3 className="display measure m-0 text-title">
            Step 1 — Zero the modules
          </h3>
          <p>
            Each module has a CANcoder measuring which way the wheel is pointed,
            and an offset saying what reading counts as straight ahead. Those
            offsets are per-robot. In your generated file they are the four{" "}
            <code>kFrontLeftEncoderOffset</code> /{" "}
            <code>kFrontRightEncoderOffset</code> /{" "}
            <code>kBackLeftEncoderOffset</code> /{" "}
            <code>kBackRightEncoderOffset</code> constants, and the ones checked
            in are from somebody else&apos;s robot.
          </p>
          <ol className="ml-5 list-decimal space-y-2">
            <li>
              Disable the robot. Nothing should be commanding the modules while
              you are setting them.
            </li>
            <li>
              Press a straight edge flat along one side of the robot so both
              wheels on that side sit against it. Do the other side too. By eye
              is not close enough: half a degree of steering error walks the
              robot about 5 cm sideways over six meters, and four modules
              disagreeing by half a degree each fight one another the whole way.
            </li>
            <li>
              With the wheels straight, check which way each module is facing.
              CTRE marks this one important: every module&apos;s bevel gear has
              to face the vertical center of the robot. A module that is
              straight but flipped calibrates to a zero that is 180° off, and
              the drive verification tests fail later without telling you why.
            </li>
            <li>
              With the wheels held straight, run the Tuner X swerve
              generator&apos;s calibration step. It reads all four CANcoders
              where they sit and writes the four offset constants for you — you
              do not work out the numbers by hand.
            </li>
          </ol>
          <p>
            <strong>{"You should see: "}</strong> re-enable, push the left stick
            straight forward, and the robot goes straight down the carpet. Sight
            along a seam or a tape line. If it curves consistently to one side,
            a module is zeroed wrong; if it wanders, come back to this after
            step 2.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col gap-3">
          <h3 className="display measure m-0 text-title">
            Step 2 — Tune <code>steerGains</code>
          </h3>
          <p>
            A steering motor holds an angle. That is the same job the arm does
            on the PID Control page: a <strong>position loop</strong>, tuned in
            the same order, with one difference — an arm fights gravity and a
            steering module does not. There is no kG here. Skip that step and
            start at kS.
          </p>
          <p>
            One other difference from the arm. The arm shipped with every gain
            at zero, so you had no choice but to start from nothing. The
            generator gave your steering modules real numbers — kP 100, kD 0.5,
            kS 0.1, kV 1.91 — because a swerve module is a fairly standard piece
            of hardware. Start from those and adjust, rather than zeroing them
            and beginning again. They are often close.
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <a
                href="/pid-control#tune-feedforward"
                className="font-semibold underline decoration-1 underline-offset-2"
                style={{ color: "var(--accent)" }}
              >
                kS — the smallest output that breaks it loose
              </a>
            </li>
            <li>
              <a
                href="/pid-control#tune-feedback"
                className="font-semibold underline decoration-1 underline-offset-2"
                style={{ color: "var(--accent)" }}
              >
                kP — raise until it oscillates, then back off
              </a>
            </li>
            <li>
              <a
                href="/pid-control#tune-feedback"
                className="font-semibold underline decoration-1 underline-offset-2"
                style={{ color: "var(--accent)" }}
              >
                kD — as much as you can get without jitter
              </a>
            </li>
          </ul>
          <p>
            Same rules as that page: change one number per test, approach every
            gain from below, and reduce it the moment the module does something
            you did not expect.
          </p>
          <p>
            <strong>{"You should see: "}</strong> the verification loop is
            already built. <code>Telemetry.java</code> publishes{" "}
            <code>Drivetrain/ModuleStates</code> (what the modules are actually
            doing) and <code>Drivetrain/ModuleTargets</code> (what they were
            asked to do). Put the angle from both on the same AdvantageScope
            plot and flick the right stick. Tuned looks like two traces on top
            of each other. Untuned looks like the measured trace lagging behind,
            overshooting, or buzzing around the target.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col gap-3">
          <h3 className="display measure m-0 text-title">
            Step 3 — Measure <code>kWheelRadius</code>
          </h3>
          <p>
            Odometry counts wheel rotations and multiplies by a radius to get
            distance. The radius in the file is what the wheel measures on a
            bench. The radius you want is the <em>{"effective "}</em> one: the
            wheel squashed under the robot&apos;s weight, sinking into carpet,
            with however much tread is left on it. It usually comes out a little
            smaller than the bench number, and it drifts as the tread wears — so
            this is a measurement to repeat late in the season, not once.
          </p>
          <ol className="ml-5 list-decimal space-y-2">
            <li>
              Put a piece of tape on the floor at the robot&apos;s front edge.
              Note the current <code>Drivetrain/Pose</code>, or restart the code
              so it reads (0, 0).
            </li>
            <li>
              Drive straight forward, <strong>slowly</strong>, about five
              meters. Slow matters: a wheel that slips travels distance the
              encoder never sees, and that is the error you are trying to
              measure out, not add in.
            </li>
            <li>
              Tape the floor again at the front edge. Measure between the two
              tape marks. That is your actual distance.
            </li>
            <li>
              Open the <code>.wpilog</code> in AdvantageScope and read{" "}
              <code>Drivetrain/Pose</code> at the end of the run. That is the
              reported distance.
            </li>
            <li>Do it three times and average, in both directions.</li>
          </ol>
          <CodeBlock
            language="text"
            title="The correction"
            hideControls
            code={`newRadius = (actualDistance / reportedDistance) * currentRadius

// e.g. tape says 5.00 m, the log says 4.80 m, the file says 2.167 in:
//      (5.00 / 4.80) * 2.167 = 2.257 in`}
          />
          <p>
            <strong>{"You should see: "}</strong> put the new radius in{" "}
            <code>kWheelRadius</code>, redeploy, and run the same test again.
            The log and the tape measure should now agree, and the gap that is
            left should be small enough to argue about. If the correction made
            it worse, you inverted the ratio — the robot that <em>under</em>
            -reports needs a <em>bigger</em> radius.
          </p>
        </div>

        {/* Step 4 */}
        <div className="flex flex-col gap-3">
          <h3 className="display measure m-0 text-title">
            Step 4 — Measure <code>kSpeedAt12Volts</code>
          </h3>
          <p>
            This one comes after the wheel radius, and it has to. The speed you
            are about to read out of the log is computed from wheel rotations
            times that radius. Measure the speed first and you have measured it
            through the wrong radius.
          </p>
          <p>
            It also has to happen <em>{"before "}</em> step 7. The constant
            means &quot;how fast this robot goes with 12 volts applied to the
            drive motors,&quot; which is a question you can only ask while the
            drive request is still open-loop voltage. It is, right now.
          </p>
          <ol className="ml-5 list-decimal space-y-2">
            <li>
              Clear floor, at least six meters, on the surface you actually
              compete on. Carpet and shop floor give different answers.
            </li>
            <li>
              Full stick forward. Hold it until the speed stops climbing, then
              let go well before the wall.
            </li>
            <li>
              In the log, plot <code>Drivetrain/TranslationSpeedMps</code> and
              read the flat part at the top — not the spike, the plateau.
            </li>
            <li>
              Put that number in <code>kSpeedAt12Volts</code>.
            </li>
          </ol>
          <Split>
            <ProseBlock>
              <p>
                That number is not your speed limit. The generated file says so
                directly:{" "}
                <em>
                  &quot;This is NOT the desired max robot speed - see maxSpeed
                  in TeleopOpMode instead.&quot;
                </em>{" "}
                It is a measurement of what the robot can do, and the drivetrain
                uses it to work out how much of its ability a given stick
                position is asking for. Do not lie to{" "}
                <code>kSpeedAt12Volts</code> about what the robot can do — every
                closed-loop calculation downstream believes it.
              </p>
            </ProseBlock>
            <MarginNote label="CAPPING NEW DRIVERS">
              On the branch, <code>TeleopOpMode</code> happens to read it
              straight into <code>maxSpeed</code>, so full stick means full
              speed. If you want new drivers capped at something gentler, scale
              it there.
            </MarginNote>
          </Split>
          <p>
            <strong>{"You should see: "}</strong> a trace that ramps up and then
            goes flat, and a plateau somewhere near the 4.54 the file shipped
            with. If it comes out wildly higher or lower, suspect the file
            before you suspect the robot: check step 3 first, then check that{" "}
            <code>kDriveGearRatio</code> matches the gearing your modules are
            actually built with.
          </p>
        </div>

        {/* Step 5 */}
        <div className="flex flex-col gap-3">
          <h3 className="display measure m-0 text-title">
            Step 5 — Find <code>kSlipCurrent</code>
          </h3>
          <p>
            Current is how hard the motor is pushing. Stator current — the
            current in the motor windings — is directly proportional to torque,
            so a limit on stator current is a limit on how hard the wheel can
            twist. Set that limit at the point where the tire loses its grip and
            the wheel physically cannot spin itself loose. All the torque the
            motor is allowed to make ends up pushing the robot instead of
            polishing the carpet.
          </p>
          <ol className="ml-5 list-decimal space-y-2">
            <li>
              Drive the robot up against a wall on carpet and square it up so
              all four wheels point straight into the wall. The push is along
              the wheels, so nothing is trying to twist the modules sideways
              while you do this.
            </li>
            <li>
              In Tuner X, open one drive motor with the control set to{" "}
              <strong>Voltage Out</strong>, the same way Hardware Setup showed,
              and set up a live plot of two signals: its velocity and its stator
              current.
            </li>
            <li>
              Ramp the applied voltage up slowly from zero. Watch both traces.
              Keep each ramp short — a drive motor pushing a wall it cannot move
              is a stalled motor, and stalled motors get hot fast. Back off to
              zero between attempts and give it a minute.
            </li>
            <li>
              <strong>The state to look for:</strong> current climbing steadily
              while velocity sits at zero — the wheel is pushing and not
              turning. Then, at some voltage, velocity jumps off zero and
              current drops at the same instant. That is the tire letting go.
              Read the current at the very top of the climb, the instant before
              the drop.
            </li>
            <li>
              Put that number in <code>kSlipCurrent</code>. The file&apos;s own
              comment describes it as &quot;the stator current at which the
              wheels start to slip,&quot; which is exactly what you measured.
            </li>
          </ol>
          <Split>
            <ProseBlock>
              <p>
                You may be measuring the limit rather than the tire. The drive
                motors are already limited: the shipped{" "}
                <code>kSlipCurrent</code> of 120 A goes into the module factory
                as a stator limit, and <code>driveInitialConfigs</code> in the
                same file sets a 70 A supply limit, and Phoenix configs stay in
                the device after your code applies them. So if the current trace
                flattens at 120 A and the wheel never breaks loose, your
                robot&apos;s real slip point is above the limit and the plateau
                you are staring at is the limit itself. Raise{" "}
                <code>kSlipCurrent</code> temporarily, redeploy, and run the
                ramp again — then put the measured value in when you have one.
              </p>
            </ProseBlock>
            <MarginNote label="TOO LOW COSTS YOU ACCELERATION">
              This limit caps torque, and torque is acceleration. Set it well
              under the slip point and the robot is safe, predictable and slow
              off the line. Some teams shave a few amps off the measured value
              for margin; that is a judgment call about your carpet, not a rule.
              Measure first, then decide how much you are giving away.
            </MarginNote>
          </Split>
          <p>
            <strong>{"You should see: "}</strong> redeploy, then floor it from a
            dead stop on carpet. The robot should launch without the squeal and
            the little sideways hop that wheel spin gives you.
          </p>
          <DocumentationButton
            href="https://v6.docs.ctr-electronics.com/en/stable/docs/hardware-reference/talonfx/improving-performance-with-current-limits.html#preventing-wheel-slip"
            title="CTRE — Preventing Wheel Slip with Current Limits"
            icon={<Book className="w-5 h-5" />}
          />
        </div>

        {/* Step 6 */}
        <div className="flex flex-col gap-3">
          <h3 className="display measure m-0 text-title">
            Step 6 — Tune <code>driveGains</code>
          </h3>
          <p>
            A drive motor holds a <em>speed</em>, not an angle. That is the
            flywheel, not the arm, and a velocity loop is tuned in a different
            order — feedforward first, because on a velocity loop the
            feedforward can do nearly the whole job by itself:
          </p>
          <p>
            <a
              href="/pid-control#tune-feedforward"
              className="font-semibold underline decoration-1 underline-offset-2"
              style={{ color: "var(--accent)" }}
            >
              The velocity-loop order: kV, then kS, then kP
            </a>
          </p>
          <p>
            Do this on the ground, not on blocks. A wheel spinning in the air
            has no load on it, and the gains that hold a speed with nothing
            attached are not the gains that hold it with the weight of a robot
            pressing down. Blocks are fine for a first pass at kV if you want
            the robot to stay put while you find the rough number.
          </p>
          <p>
            <strong>{"You should see: "}</strong> the same two signals as step
            2, but the speed component this time —{" "}
            <code>Drivetrain/ModuleStates</code> against{" "}
            <code>Drivetrain/ModuleTargets</code>. Drive around, then look at
            the plot. Tuned means the measured speed sits on the commanded speed
            through changes of direction, not only in a straight line. A
            constant gap between them is kV; a gap that only appears at low
            speed is kS; a slow recovery after a change is kP.
          </p>
        </div>

        {/* Step 7 */}
        <div className="flex flex-col gap-3">
          <h3 className="display measure m-0 text-title">
            Step 7 — Switch the drive request to <code>Velocity</code>
          </h3>
          <p>
            Now the payoff. Up to this point the drivetrain has been open-loop:
            the stick position was converted straight into volts, and whatever
            speed that produced was whatever it produced. With the drive gains
            tuned, you can ask for a speed instead and have the motor go get it.
          </p>

          <Box
            variant="alert-danger"
            tag="THIS IS NOT DONE FOR YOU"
            title="Every reference file ships open-loop"
          >
            <p>
              Open <code>TeleopOpMode.java</code> on <code>1-Swerve</code>, on{" "}
              <code>2-Logging</code>, or in the robot template. All three read{" "}
              <code>DriveRequestType.OpenLoopVoltage</code>, and the template
              labels the line <code>{"// open-loop drive motors"}</code>. No
              branch has made this change for you and none of them ever did.
            </p>
            <p className="mt-3">
              It is an edit you make, and it belongs at the end rather than the
              start. Switching to <code>Velocity</code> before step 6 hands the
              driver a robot that is chasing speeds it has not been taught to
              hold, which is worse to drive than plain voltage.
            </p>
          </Box>

          <CodeBlock
            language="java"
            title="TeleopOpMode.java — before, exactly as the branch ships it"
            filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
            code={`private final SwerveRequest.FieldCentric drive =
    new SwerveRequest.FieldCentric()
        .withDeadband(maxSpeed * 0.1)
        .withRotationalDeadband(maxAngularRate * 0.1) // ignore the sticks' bottom 10%
        .withDriveRequestType(DriveRequestType.OpenLoopVoltage); // plain voltage, no wheel PID`}
          />

          <CodeBlock
            language="java"
            title="After — the last line, one word different"
            code={`private final SwerveRequest.FieldCentric drive =
    new SwerveRequest.FieldCentric()
        .withDeadband(maxSpeed * 0.1)
        .withRotationalDeadband(maxAngularRate * 0.1)
        .withDriveRequestType(DriveRequestType.Velocity); // closed loop on wheel speed`}
          />

          <p>
            <code>Velocity</code> comes from the same place as{" "}
            <code>OpenLoopVoltage</code>, so the import at the top of the file
            already covers it and nothing else changes. Redeploy and drive.
            Nothing should feel dramatically different — if it does, go back to
            step 6.
          </p>

          <h4 className="display m-0 text-ui">And now the deadband</h4>
          <p>
            A deadband throws away small stick inputs. The branch discards the
            bottom 10%, which is a lot: with the shipped top speed of 4.54 m/s,
            the slowest the robot will move at all is about 0.45 m/s. That is
            fine for open-loop driving, where small voltages do not produce
            reliable motion anyway. With a tuned velocity loop, they do — so the
            10% is now throwing away control you have paid for.
          </p>
          <p>
            Shrink it rather than deleting it. The deadband is also what stops a
            worn controller&apos;s stick drift from creeping the robot across
            the field while nobody is touching it. There is a test for how far
            you can go:
          </p>
          <ol className="ml-5 list-decimal space-y-2">
            <li>Put the robot on blocks so nothing can move it.</li>
            <li>Enable, and take your hands off the controller completely.</li>
            <li>
              Watch <code>Drivetrain/ModuleTargets</code>. The speed component
              should be flat zero. The angle component holds whatever the
              modules were last pointed at, so ignore it here.
            </li>
            <li>
              Halve the deadband, redeploy, repeat. When the targets start
              twitching with your hands off, you have gone one step too far — go
              back to the previous value.
            </li>
          </ol>
          <p>
            Do this per controller. A brand new controller will let you go far
            lower than the one that has been in the practice-field bin all
            season, and the deadband has to suit the worst one you will actually
            compete with.
          </p>
        </div>

        <Split>
          <ProseBlock>
            <p>One last mechanical thing: glue the module encoders down.</p>
          </ProseBlock>
          <MarginNote label="WHY GLUE THEM">
            Step 1&apos;s zeros are stored against a physical sensor position.
            If a CANcoder shifts a couple of degrees in its mount during a hard
            collision, every zero you saved is now wrong, and the robot drifts
            in a way that looks exactly like bad odometry. Re-check the zeros
            after any impact hard enough to make you look.
          </MarginNote>
        </Split>
      </LessonSection>

      {/* ── DID IT WORK ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <p>
          One run tells you whether the whole page landed. Do it on the surface
          you compete on, with logging on.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Tape a start mark on the floor and put the robot on it. Restart the
            robot code so <code>Drivetrain/Pose</code> starts at (0, 0).
          </li>
          <li>
            Drive a square: about three meters forward, three left, three back,
            three right, ending where you started. Take it at a normal driving
            pace, not creeping.
          </li>
          <li>
            Stop on the start mark. <strong>{"You should see: "}</strong> the
            robot physically back on the tape, and <code>Drivetrain/Pose</code>{" "}
            back near (0, 0) after twelve meters of driving. A drift of a meter
            means something above is not calibrated.
          </li>
          <li>
            <strong>{"You should see: "}</strong> pull the log up in
            AdvantageScope and put <code>Drivetrain/ModuleStates</code> and{" "}
            <code>Drivetrain/ModuleTargets</code> on one plot. Through all four
            corners the measured traces should sit on the commanded ones. That
            is steps 2 and 6 confirmed together.
          </li>
          <li>
            <strong>{"You should see: "}</strong> hands off the sticks at the
            end, the speed component of <code>Drivetrain/ModuleTargets</code>{" "}
            flat at zero. That is the deadband from step 7.
          </li>
          <li>
            Now check the seeding distinction is real. Turn the robot 90° in
            place and press the left bumper.{" "}
            <strong>{"You should see: "}</strong> pushing the stick forward now
            drives the robot in the new direction — and the x and y in{" "}
            <code>Drivetrain/Pose</code> did not jump when you pressed it. The
            bumper moved the driver&apos;s forward, not the robot&apos;s
            position.
          </li>
        </ol>

        <Box
          variant="alert-info"
          tag="IF IT DIDN'T WORK"
          title="A rotated square, a robot that got worse, or numbers in the wrong units"
        >
          <ul className="ml-4 list-disc space-y-3">
            <li>
              <strong>
                The square ends up rotated, or the robot pulls to one side the
                whole way.
              </strong>{" "}
              That is step 1, not step 3. A module zeroed a degree off steers
              the robot slightly sideways the entire time, and no amount of
              wheel radius correction fixes a heading error. Put the straight
              edge back on and re-save the zeros. If it only started after a
              match, check whether an encoder moved in its mount.
            </li>
            <li>
              <strong>
                The robot got noticeably worse to drive right after step 7.
              </strong>{" "}
              You switched to <code>Velocity</code> with drive gains that are
              not tuned, which means the motor is now chasing a speed it cannot
              hold. Sluggish or surging means kV is off; a hum or a vibration at
              constant speed means kP is too high. Put{" "}
              <code>OpenLoopVoltage</code> back for a moment to confirm the
              robot itself is fine, then finish step 6 properly.
            </li>
            <li>
              <strong>
                The pose ends up in the right place but the numbers look wrong —
                x and y are meters from where you expected.
              </strong>{" "}
              Nothing is broken. Odometry measures from wherever the code
              started, not from a point on the field, and nothing on these
              branches sets a field position. Read the seeding section again.
              The Vision lesson is what fixes it.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── QUIZ ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-8">
        <AlphaStatusNote />

        <Quiz
          questions={[
            {
              id: 1,
              question:
                "You open TeleopOpMode.java on the swerve branch. What does .withDriveRequestType(...) say before you touch it?",
              options: [
                "DriveRequestType.Velocity — the workshop code already made this change for you",
                "DriveRequestType.OpenLoopVoltage — every reference file ships open-loop, and you make the change yourself",
                "Nothing; if you leave it out Phoenix picks the right one",
                "It depends on whether you generated the project with Tuner X or copied the template",
              ],
              correctAnswer: 1,
              explanation:
                "TeleopOpMode.java on 1-Swerve, on 2-Logging and in the 2027 robot template all read DriveRequestType.OpenLoopVoltage. The template comments the line // open-loop drive motors. Switching to Velocity is step 7 of this page, and it is an edit you make after the drive gains are tuned.",
            },
            {
              id: 2,
              question:
                "You press the left bumper, which runs seedFieldCentric(). What changed?",
              options: [
                "Where the robot thinks it is on the field — its x and y are now zero",
                "What direction the driver's sticks call forward; it never supplies an x or a y",
                "The CANcoder offsets stored in TunerConstants.java",
                "The top speed the drivetrain is allowed to command",
              ],
              correctAnswer: 1,
              explanation:
                "seedFieldCentric() is a heading reference and nothing else. DriveMechanism's own comment calls it \"resets the field-centric heading so 'forward' matches the driver's current facing.\" Placing the robot at a real field position is resetPose(Pose2d), which nothing in the workshop code calls. Vision supplies an absolute pose in Workshop #4.",
            },
            {
              id: 3,
              question:
                "You taped a 5.00 m run, and the log says the robot traveled 4.80 m. The file has kWheelRadius = Inches.of(2.167). What now?",
              options: [
                "Raise kP on driveGains until the reported distance matches",
                "Set kWheelRadius to (5.00 / 4.80) × 2.167 = 2.257 in",
                "Set kWheelRadius to (4.80 / 5.00) × 2.167 = 2.080 in",
                "Lower kSlipCurrent, because the wheels must be slipping",
              ],
              correctAnswer: 1,
              explanation:
                "newRadius = (actualDistance / reportedDistance) × currentRadius. The robot went further than it reported, so the real wheel is bigger than the code believes and the radius goes up. The inverted version (option 3) makes the error worse, which is how you catch it.",
            },
            {
              id: 4,
              question:
                "Why does measuring kWheelRadius have to come before measuring kSpeedAt12Volts?",
              options: [
                "The log can only record one drivetrain signal per run",
                "The speed you read out of the log is computed from wheel rotations times the radius, so a wrong radius gives a wrong speed",
                "kSpeedAt12Volts has to be measured with the wheels off the ground",
                "The wheel radius has no effect on velocity, so the order is only a convention",
              ],
              correctAnswer: 1,
              explanation:
                "Drivetrain/TranslationSpeedMps is derived from the same wheel rotations and the same radius that odometry uses for distance. Measure the top speed first and you have measured it through a radius you are about to change. Both steps also have to happen before step 7, because kSpeedAt12Volts means the speed at 12 volts applied, which is a question you can only ask of an open-loop drive request.",
            },
            {
              id: 5,
              question:
                "Ramping voltage with the robot against a wall, you watch stator current climb while velocity stays at zero. Then velocity jumps up and current drops. What has happened, and what is the number you want?",
              options: [
                "The motor stalled; record the current after the drop",
                "The tire lost grip; record the current at the very top of the climb, the instant before the drop",
                "The current limit engaged; record the velocity at the jump",
                "The battery sagged; repeat with a fresh battery and record the peak velocity",
              ],
              correctAnswer: 1,
              explanation:
                'While the wheel is gripping it cannot turn, so velocity is zero and current keeps climbing as torque rises. The moment the tire breaks loose the wheel spins up, and a spinning motor pushes back against the voltage you applied, so current collapses. The peak current immediately before that is the slip point, and it goes in kSlipCurrent — whose own comment in the generated file calls it "the stator current at which the wheels start to slip."',
            },
          ]}
        />
      </section>

      {/* ── WHAT'S NEXT ──────────────────────────────────────────────── */}
      <LessonSection id="what-s-next" title="What's next">
        <p>
          Odometry now measures your robot correctly, and it still does not know
          where on the field it started. <strong>Vision</strong> closes that
          gap: a Limelight reads AprilTags, works out where the robot must be
          for that view to make sense, and feeds the answer into the pose you
          calibrated — with a trust weight, because a distant tag is worth less
          than a close one.
        </p>
        <p>
          The distinction from this page comes straight back. With a single tag
          in view the camera code leans on your gyro heading, so an uncalibrated
          heading turns a good camera into a confidently wrong position.
        </p>

        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/tuner-swerve/index.html"
          title="CTRE — Tuner X Swerve Project Generator"
          icon={<Book className="w-5 h-5" />}
        />
      </LessonSection>
    </PageTemplate>
  );
}
