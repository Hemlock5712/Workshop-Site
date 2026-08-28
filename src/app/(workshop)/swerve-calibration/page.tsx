import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { Book } from "lucide-react";

/**
 * Rewritten against `context/lesson-budget.md`, down from 36.8 minutes.
 *
 * What went: the "why this page sits between Logging and PathPlanner" roadmap
 * section, the "what's next" section, the alpha stamp, and all five code
 * embeds. The two-line `seedFieldCentric()` binding said nothing the prose
 * beside it did not; the open-loop "before" block and the closed-loop "after"
 * block differed by one word, which is a thing prose says in six. The
 * `TunerConstants.java` listing went last, once every number it carried was
 * named in the prose of the step that measures it.
 *
 * What stayed: all seven calibration steps in order, every measured number
 * (2.167 in, 4.54 m/s, 120 A stator, 70 A supply, kP 100 / kD 0.5 / kS 0.1 /
 * kV 1.91, driveGains kP 0.2 / kV 0.124, the 10% deadband and the 0.45 m/s it
 * costs), the stall-heat safety on the wall push, the CTRE wheel-slip
 * reference, and the three failure shapes at the end.
 *
 * The "Check yourself" was deleted in that pass and is back. It is charged 2
 * minutes, so it was paid for the way the style guide says to pay: prose,
 * duplication, and two containers that were charging for something they do
 * not hold. The zeroing table's three rows are a term and a sentence each, so
 * they are three sentences now (a table is charged 0.5 min for being scanned
 * row by row against hardware; nobody scans this one). The radius correction
 * was a `language="text"` CodeBlock holding arithmetic rather than a file, and
 * the code charge exists for the round trip of matching a snippet against your
 * editor, so it is a concept panel now with the formula in the mono slot. Two
 * numbers moved into prose and none were lost.
 *
 * Also fixed here: the note claiming `/swerve-drive-project` links to
 * `#seeding` was stale. That page links to `/swerve-calibration` with no
 * fragment, and no page anywhere links to a fragment on this one. And "a
 * slipping wheel travels distance the encoder never sees" had the physics
 * backwards in both this draft and the original: a wheel that spins counts
 * distance the *robot* never travels, which is why the log over-reports.
 *
 * Still over the 12 min target. This is two lessons; nothing load-bearing was
 * cut to get the number down. See the split proposal in the handoff.
 *
 * August 2026, after the sentence-run bug in `lint-prose.ts` was fixed: two
 * welded sentences came back over 25 words and the page measured 15.1. The
 * `seedFieldCentric()` pair now opens its second sentence on "Every loop" so
 * the splitter sees the two sentences a reader already saw, and the
 * `kSlipCurrent` colon is a period. The 15 min cap was paid out of prose and
 * duplication: the "If you want one" margin note (a `resetPose` wrapper recipe
 * on a page whose lede says almost no Java), the new-driver scaling aside on
 * `maxSpeed`, the second mention of the PID page's tuning order inside the
 * steer section, and four words off the intro. No step, number, gain, safety
 * aside or quiz question was touched.
 *
 * Not covered by `pnpm check-embeds`: the file paths quoted in prose here
 * (`TunerConstants.java`, `TeleopOpMode.java` on `1-Swerve`) are strings in
 * headings, not `GitHubContent` embeds, and there is no `branch` prop. If
 * those files move on the branch, nothing fails.
 */
export default function SwerveCalibration() {
  return (
    <PageTemplate
      title="Swerve Calibration"
      lede="The project you generated came with somebody else's numbers in TunerConstants.java. This lesson replaces the ones that matter with measurements off your own robot, then closes the drive loop. Almost no Java."
      needs={[
        <>
          A swerve robot you can drive, from{" "}
          <strong>Swerve Project Generator</strong>.
        </>,
        <>
          Logging on. Two of the measurements come out of a <code>.wpilog</code>
          .
        </>,
        <>Phoenix Tuner X, and six meters of clear carpet.</>,
        <>
          A tape measure, a long straight edge, and a wall you may push against.
        </>,
      ]}
      time="15 minutes"
    >
      <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
        <p>
          Work in order: each step measures something the steps after it depend
          on.
        </p>
      </div>

      {/* The id is a link target for the three-way "zeroing" distinction, so
          other pages can point here instead of restating it. Do not rename. */}
      <LessonSection
        id="three-things-that-all-sound-like"
        title="Three kinds of zeroing"
      >
        <p>
          Three operations in the swerve code all get called resetting or
          seeding. Mix them up and you get a robot that drives beautifully and
          has no idea where it is.
        </p>
        <p>
          <code>seedFieldCentric()</code>, on the left bumper, changes which way
          the sticks call forward: whatever the robot faces now becomes forward.
          Every loop, <code>applyOperatorPerspective()</code> sets that same
          forward from alliance color: 0&deg; on blue and 180&deg; on red.
          Neither supplies an x or a y.
        </p>

        <p>
          <code>resetPose(Pose2d)</code> moves the pose itself: x, y and heading
          in meters from the blue corner. It exists on the Phoenix 6 drivetrain,
          but <code>DriveMechanism</code> does not expose it and nothing calls
          it. Until Workshop 4, read <code>Drivetrain/Pose</code> as distance
          traveled since boot.
        </p>
      </LessonSection>

      <LessonSection id="zero-the-modules" title="Zero the modules">
        <p>
          Each module has a CANcoder reading which way its wheel points, and an
          offset saying which reading counts as straight ahead. The four{" "}
          <code>k*EncoderOffset</code> constants in your file came off somebody
          else&apos;s robot.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Disable the robot. Nothing should be commanding a module while you
            set it.
          </li>
          <li>
            Press a straight edge flat along one side so both wheels on that
            side sit against it, then do the other side. By eye is not close
            enough: half a degree of steering error walks the robot 5 cm
            sideways over six meters.
          </li>
          <li>
            Check which way each module faces. CTRE marks this one important:
            every module&apos;s bevel gear has to face the vertical center of
            the robot. A module that is straight but flipped zeroes 180&deg;
            off, and the drive verification tests fail later without saying why.
          </li>
          <li>
            Holding the wheels straight, run the calibration step in the Tuner X
            swerve generator. It reads all four CANcoders where they sit and
            writes the offset constants for you.
          </li>
        </ol>
        <Split>
          <ProseBlock>
            <p>
              Re-enable, push the left stick forward, and sight along a carpet
              seam. A consistent curve to one side means a module is zeroed
              wrong. A wander that comes and goes is the steer gains.
            </p>
          </ProseBlock>
          <MarginNote label="Glue them down">
            These zeros are stored against a physical sensor position. A
            CANcoder that shifts two degrees in a collision makes all four
            wrong, and it looks like bad odometry.
          </MarginNote>
        </Split>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/tuner-swerve/index.html"
          title="CTRE: Tuner X Swerve Project Generator"
          icon={<Book className="w-5 h-5" />}
        />
      </LessonSection>

      <LessonSection id="steer-gains" title="Tune the steer gains">
        <p>
          A steering motor holds an angle: a position loop, and there is no
          gravity to fight here. Skip kG and start at kS.
        </p>
        <p>
          The generator gave you real numbers: kP 100, kD 0.5, kS 0.1, kV 1.91.
          They are often close, so adjust rather than starting from zero.
        </p>
        <p>
          <a
            href="/pid-control#feedforward-first"
            className="font-semibold underline decoration-1 underline-offset-2"
            style={{ color: "var(--accent)" }}
          >
            The order, from the PID page
          </a>
          . kS is the smallest output that breaks the module loose. Raise kP
          until it oscillates, then back off. Add kD, as much as you can get
          without jitter. One number per test.
        </p>
        <p>
          <code>Telemetry.java</code> publishes{" "}
          <code>Drivetrain/ModuleStates</code> and{" "}
          <code>Drivetrain/ModuleTargets</code>. Put the angle from both on one
          AdvantageScope plot and flick the right stick. Tuned looks like two
          traces on top of each other. Untuned lags, overshoots, or buzzes.
        </p>
      </LessonSection>

      <LessonSection
        id="measure-the-drivetrain"
        title="Three measurements on carpet"
      >
        <p>
          Measure the radius and the top speed while the drive request is still
          open-loop voltage: <code>kSpeedAt12Volts</code> means the speed at 12
          volts applied.
        </p>

        <h3 className="display measure m-0 text-title">Wheel radius</h3>
        <p>
          Odometry counts wheel rotations and multiplies by a radius. You want
          the effective one: the wheel squashed under the robot&apos;s weight
          and sunk into carpet. It shrinks as the tread wears, so repeat this
          late in the season.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Tape the floor at the robot&apos;s front edge. Restart the code so{" "}
            <code>Drivetrain/Pose</code> reads (0, 0).
          </li>
          <li>
            Drive straight forward, slowly, about five meters. A wheel that
            spins under hard acceleration counts distance the robot never
            travels.
          </li>
          <li>
            Tape the front edge again. The gap between marks is the actual
            distance, and <code>Drivetrain/Pose</code> at the end of the run is
            the reported one.
          </li>
        </ol>
        <Box
          variant="concept"
          tag="THE CORRECTION"
          code={
            <>
              <div>
                newRadius = (actualDistance / reportedDistance) &times;
                currentRadius
              </div>
              <div className="mt-2">
                tape 5.00 m, log 4.80 m, file 2.167 in: (5.00 / 4.80) &times;
                2.167 = 2.257 in
              </div>
            </>
          }
        >
          <p className="m-0">
            Run it three times in each direction and average. Put the result in{" "}
            <code>kWheelRadius</code>, redeploy, and repeat until tape and log
            agree.
          </p>
        </Box>
        <p>
          If it got worse, you inverted the ratio: a robot that under-reports
          needs a bigger radius.
        </p>

        <h3 className="display measure m-0 text-title">Top speed</h3>
        <p>
          Do the radius first: this speed is wheel rotations times that radius.
          Find six meters of clear floor on the surface you compete on: carpet
          and a shop floor give different answers.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Full stick forward. Hold until the speed stops climbing, then let go
            well before the wall.
          </li>
          <li>
            Plot <code>Drivetrain/TranslationSpeedMps</code> and read the
            plateau, not the spike.
          </li>
        </ol>
        <p>
          That number goes in <code>kSpeedAt12Volts</code>. It measures the
          robot; the driver cap is <code>maxSpeed</code> in{" "}
          <code>TeleopOpMode</code>, which reads it straight back. Expect a
          plateau near the 4.54 the file shipped with. Wildly off means the
          file: check the radius, then check <code>kDriveGearRatio</code>{" "}
          against your modules.
        </p>

        <h3 className="display measure m-0 text-title">Slip current</h3>
        <p>
          Stator current is proportional to torque, so a stator limit caps how
          hard a wheel twists. Set it where the tire loses grip. Torque above
          that point polishes carpet.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Drive the robot against a wall on carpet and square it up so all
            four wheels point into the wall.
          </li>
          <li>
            In Tuner X, open one drive motor on <strong>Voltage Out</strong> and
            plot its velocity and its stator current.
          </li>
          <li>Ramp the voltage up slowly from zero, watching both traces.</li>
        </ol>
        <p>
          Current climbs while velocity sits at zero. Then velocity jumps and
          current drops in the same instant. That is the tire letting go. Read
          the current at the top of the climb, just before the drop.
        </p>
        <Box variant="alert-danger" title="Stalled motors get hot fast">
          <p>
            A drive motor pushing a wall it cannot move is a stalled motor. Keep
            each ramp to a couple of seconds, back off to zero between attempts,
            and give the motor a minute. One person on the disable, somebody
            else on the laptop.
          </p>
        </Box>
        <Split>
          <ProseBlock>
            <p>
              That number goes in <code>kSlipCurrent</code>. You may be
              measuring the limit, not the tire. The shipped 120 A is itself a
              stator limit, and <code>driveInitialConfigs</code> sets 70 A on
              the supply. If the trace flattens at 120 A and the wheel never
              breaks loose, raise the constant temporarily and ramp again. Then
              redeploy and floor it from a dead stop. The robot should launch
              without the squeal and sideways hop of wheel spin.
            </p>
          </ProseBlock>
          <MarginNote label="Too low costs acceleration">
            This limit caps torque, and torque is acceleration. Set it well
            under the slip point and the robot is predictable and slow off the
            line.
          </MarginNote>
        </Split>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/hardware-reference/talonfx/improving-performance-with-current-limits.html#preventing-wheel-slip"
          title="CTRE: Preventing Wheel Slip with Current Limits"
          icon={<Book className="w-5 h-5" />}
        />
      </LessonSection>

      <LessonSection id="close-the-drive-loop" title="Close the drive loop">
        <p>
          A drive motor holds a speed. On a velocity loop the feedforward does
          nearly all of the work.{" "}
          <a
            href="/pid-control#feedforward-first"
            className="font-semibold underline decoration-1 underline-offset-2"
            style={{ color: "var(--accent)" }}
          >
            The order
          </a>{" "}
          is kV, then kS, then kP. The file starts you at kP 0.2 and kV 0.124.
        </p>
        <p>
          Tune it on the ground, not on blocks. A wheel in the air carries no
          load, and gains found there will not hold a speed under a robot.
        </p>
        <p>
          Plot the same two signals as the steer gains, speed this time. A
          constant gap is kV. A gap only at low speed is kS. A slow recovery
          after a change of direction is kP.
        </p>

        <h4 className="display m-0 text-ui">Switch the drive request</h4>
        <p>
          Up to here the stick position went straight to volts. In{" "}
          <code>TeleopOpMode.java</code>, change{" "}
          <code>DriveRequestType.OpenLoopVoltage</code> to{" "}
          <code>DriveRequestType.Velocity</code>. It comes from the same class,
          so the import already covers it.
        </p>
        <p>
          No branch makes this edit for you: <code>1-Swerve</code>,{" "}
          <code>2-Logging</code> and the robot template all ship open-loop. Make
          it last. If the robot drives worse than it did on volts, go back to
          the gains.
        </p>

        <h4 className="display m-0 text-ui">The deadband</h4>
        <p>
          The same request line sets <code>withDeadband(maxSpeed * 0.1)</code>{" "}
          and <code>withRotationalDeadband(maxAngularRate * 0.1)</code>,
          throwing away the bottom 10% of both sticks. At 4.54 m/s that is
          everything under about 0.45 m/s, which open-loop driving could not
          hold anyway. A tuned velocity loop can, so the deadband now discards
          control you paid for.
        </p>
        <p>
          Shrink it rather than deleting it. The deadband is what keeps a worn
          stick&apos;s drift from creeping the robot across the field.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Put the robot on blocks. Enable, and take your hands off the
            controller.
          </li>
          <li>
            Watch the speed component of <code>Drivetrain/ModuleTargets</code>.
            It should be flat zero.
          </li>
          <li>
            Halve the deadband, redeploy, repeat. When the targets start
            twitching, go back one value.
          </li>
        </ol>
        <p>Set it per controller, for the worst one you will compete with.</p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          One run tells you whether the page landed, on the surface you compete
          on. Tape a start mark, restart the code so{" "}
          <code>Drivetrain/Pose</code> reads (0, 0), and drive a square: three
          meters forward, three left, three back, three right.
        </p>
        <Box variant="alert-success" title="You should see">
          <p>
            The robot back on the tape, and <code>Drivetrain/Pose</code> near
            (0, 0) after twelve meters. In the log, measured module traces
            sitting on the commanded ones through all four corners. Hands off
            the sticks, the speed component of{" "}
            <code>Drivetrain/ModuleTargets</code> flat at zero. Turn 90&deg; in
            place and press the left bumper: forward moves, x and y do not.
          </p>
        </Box>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Square comes out rotated",
              term: "Module zeros",
              body: (
                <>
                  A module a degree off steers the robot sideways the whole way,
                  and no radius correction fixes a heading error. Straight edge
                  back on, re-save the zeros.
                </>
              ),
            },
            {
              label: "Worse right after the switch",
              term: "Drive gains",
              body: (
                <>
                  <code>Velocity</code> with untuned gains chases a speed the
                  motor cannot hold. Sluggish or surging is kV. A hum at
                  constant speed is kP too high.
                </>
              ),
            },
            {
              label: "Pose numbers look odd",
              term: "Nothing is broken",
              body: (
                <>
                  Odometry measures from where the code started, not from a
                  point on the field. Nothing here sets one. Vision fixes it in
                  Workshop 4.
                </>
              ),
            },
          ]}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "TeleopOpMode.java on 1-Swerve: what does the drive request read before you edit it?",
            options: [
              "DriveRequestType.Velocity, because the branch closed the loop for you",
              "DriveRequestType.OpenLoopVoltage, and switching it is the last edit on this page",
              "Nothing. Phoenix picks the closed-loop version once the gains are non-zero.",
              "It depends whether you generated the project in Tuner X or copied the template",
            ],
            correctAnswer: 1,
            explanation:
              "1-Swerve, 2-Logging and the robot template all ship DriveRequestType.OpenLoopVoltage. You make the change yourself, and you make it after the drive gains are tuned. Velocity with untuned gains chases a speed the motor cannot hold, which drives worse than plain voltage.",
          },
          {
            id: 2,
            question:
              "You press the left bumper, which runs seedFieldCentric(). What changed?",
            options: [
              "The four CANcoder offsets in TunerConstants.java",
              "Where the robot thinks it is: x and y are back to zero",
              "Which direction the sticks call forward, and nothing about position",
              "The top speed the drivetrain will command",
            ],
            correctAnswer: 2,
            explanation:
              "seedFieldCentric() is a heading reference: whatever the robot faces now becomes forward for the driver. It never supplies an x or a y. resetPose(Pose2d) is the one that moves the pose, and nothing in the workshop code calls it. Until vision arrives in Workshop 4, Drivetrain/Pose reads distance traveled since boot.",
          },
          {
            id: 3,
            question:
              "Tape says 5.00 m, the log says 4.80 m, and kWheelRadius is 2.167 in. What goes in the file?",
            options: [
              "2.167 in, and lower kSlipCurrent, because the wheels must be slipping",
              "2.080 in, from (4.80 / 5.00) × 2.167",
              "2.167 in, and raise kP on driveGains until the log matches the tape",
              "2.257 in, from (5.00 / 4.80) × 2.167",
            ],
            correctAnswer: 3,
            explanation:
              "newRadius = (actualDistance / reportedDistance) × currentRadius. The robot went further than it reported, so the real wheel is bigger than the number in the file and the radius goes up. Option b is the same ratio inverted: it widens the gap instead of closing it, and that is how you spot the error. Slipping wheels fail the other way: a spinning wheel counts distance the robot never travels, so the log would read high.",
          },
          {
            id: 4,
            question:
              "Why does the wheel radius get measured before top speed?",
            options: [
              "The speed in the log is wheel rotations times that radius, so a wrong radius gives a wrong speed",
              "The log can only record one drivetrain signal per run",
              "Top speed has to be measured with the wheels off the ground",
              "Order does not matter, because the radius affects distance and not speed",
            ],
            correctAnswer: 0,
            explanation:
              "Drivetrain/TranslationSpeedMps comes from the same wheel rotations and the same radius odometry uses for distance. Read the plateau first and you have measured it through a radius you are about to change. Both measurements also have to happen before the drive request becomes Velocity, because kSpeedAt12Volts means the speed at 12 volts applied.",
          },
          {
            id: 5,
            question:
              "Current climbs while velocity sits at zero, then velocity jumps and current drops. What goes in kSlipCurrent?",
            options: [
              "The stator current at the top of the climb, the instant before the drop",
              "The stator current after the drop, with the wheel spinning",
              "The velocity at the jump",
              "70 A, the supply limit driveInitialConfigs already sets",
            ],
            correctAnswer: 0,
            explanation:
              "While the tire grips, the wheel cannot turn: velocity stays at zero and current keeps climbing with torque. The jump is the tire letting go, and the peak just before it is the slip point. If the trace flattens at 120 A and the wheel never breaks loose, you are reading the shipped stator limit rather than your carpet. Raise the constant and ramp again.",
          },
          {
            id: 6,
            question:
              "With the drive loop closed, why shrink the 10% deadband instead of deleting it?",
            options: [
              "Below 10% the velocity loop cannot hold a speed anyway",
              "The rotational deadband has to stay larger than the translational one",
              "A worn controller's stick drift would creep the robot across the field with nobody touching it",
              "kSpeedAt12Volts would have to be measured again",
            ],
            correctAnswer: 2,
            explanation:
              "At 4.54 m/s, 10% throws away everything under about 0.45 m/s, and a tuned velocity loop holds speeds that low. Zero deadband hands the robot every bit of a worn stick's drift instead. Halve it with the robot on blocks and your hands off the controller until the speed component of Drivetrain/ModuleTargets starts twitching, then go back one value.",
          },
        ]}
      />
    </PageTemplate>
  );
}
