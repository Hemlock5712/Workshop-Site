import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { Book } from "lucide-react";

export default function MotionMagic() {
  return (
    <PageTemplate
      title="Stop the arm lunging at its target"
      emphasis="lunging"
      lede="The PID controller you built last page steers straight at the target. From a standing start that means full correction on the very first loop, so the arm snaps away, then has to fight itself to stop. It works, and it is hard on the gearbox."
      needs={[
        <>
          The closed-loop arm and flywheel from <strong>PID Control</strong> —{" "}
          <code>vertical()</code>, <code>horizontal()</code>,{" "}
          <code>runSlow()</code>, <code>runFast()</code>, <code>stop()</code>,
          and the <code>Slot0</code> gains in each constructor.
        </>,
        <>
          The simulator running, from <strong>Running Your Code</strong>. You
          need to be able to press a button and watch the mechanism move.
        </>,
      ]}
      branch="4-MotionMagic"
      time="Roughly 40 minutes"
    >
      <KeyConceptSection
        description={[
          "Motion Magic puts a plan in between. Instead of handing the PID loop the final angle, the motor hands it a moving target that speeds up, holds a steady speed, and slows down again. The PID loop still does the pushing — it is now chasing something reachable.",
        ]}
        concept="Motion Magic does not replace your PID gains. It changes what the gains are aiming at, one loop at a time."
      />

      <Box variant="alert-info" tag="WHAT YOU'LL BUILD">
        <p className="mt-3">
          <strong>What you&apos;ll build:</strong> three small edits to{" "}
          <code>Arm.java</code> plus one line to delete, the same three edits to{" "}
          <code>Flywheel.java</code>, and two numbers you pick yourself for the
          arm. <strong>Roughly 40 minutes</strong>, most of it on those two
          numbers.
        </p>
        <p className="mt-3">
          <strong>Reference branch:</strong> <code>4-MotionMagic</code> in
          Workshop-Code. The whole lesson is two files and about thirty changed
          lines.
        </p>
      </Box>

      {/* ── what a profile is ────────────────────────────────────────── */}
      <LessonSection
        id="what-a-motion-profile-actually-is"
        title="What a motion profile actually is"
      >
        <p>
          A motion profile is a graph of speed against time, worked out before
          the move starts. The motor follows the graph. The usual shape is a
          trapezoid: speed up at a fixed rate, hold a steady speed, slow down at
          the same fixed rate.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div
            className="rounded-md border p-4"
            style={{
              borderColor: "var(--line)",
              background: "var(--bg-elev)",
            }}
          >
            <svg
              role="img"
              aria-label="Velocity plotted against time for a long move. Speed rises at a constant slope, flattens out at the cruise velocity, then falls back to zero at the same slope, making a trapezoid."
              viewBox="0 0 320 200"
              className="h-auto w-full"
            >
              <path
                d="M40 160 L100 60 L220 60 L280 160 Z"
                fill="var(--accent)"
                fillOpacity="0.12"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <line
                x1="40"
                y1="60"
                x2="292"
                y2="60"
                stroke="var(--line)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <line
                x1="100"
                y1="60"
                x2="100"
                y2="160"
                stroke="var(--line)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <line
                x1="220"
                y1="60"
                x2="220"
                y2="160"
                stroke="var(--line)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <line
                x1="40"
                y1="22"
                x2="40"
                y2="160"
                stroke="var(--fg-mute)"
                strokeWidth="1.5"
              />
              <line
                x1="40"
                y1="160"
                x2="300"
                y2="160"
                stroke="var(--fg-mute)"
                strokeWidth="1.5"
              />
              <text x="46" y="52" fontSize="10" fill="var(--fg-mute)">
                cruise velocity
              </text>
              <text x="106" y="112" fontSize="10" fill="var(--fg-mute)">
                slope = acceleration
              </text>
              <text
                x="70"
                y="176"
                fontSize="10"
                fill="var(--fg-mute)"
                textAnchor="middle"
              >
                speed up
              </text>
              <text
                x="160"
                y="176"
                fontSize="10"
                fill="var(--fg-mute)"
                textAnchor="middle"
              >
                cruise
              </text>
              <text
                x="250"
                y="176"
                fontSize="10"
                fill="var(--fg-mute)"
                textAnchor="middle"
              >
                slow down
              </text>
              <text
                x="170"
                y="194"
                fontSize="10"
                fill="var(--fg-mute)"
                textAnchor="middle"
              >
                time
              </text>
              <text
                x="14"
                y="91"
                fontSize="10"
                fill="var(--fg-mute)"
                textAnchor="middle"
                transform="rotate(-90 14 91)"
              >
                velocity
              </text>
            </svg>
            <p className="mt-2">
              <strong>A long move.</strong> There is enough distance to reach
              cruise velocity and sit there for a while.
            </p>
          </div>

          <div
            className="rounded-md border p-4"
            style={{
              borderColor: "var(--line)",
              background: "var(--bg-elev)",
            }}
          >
            <svg
              role="img"
              aria-label="Velocity plotted against time for a short move. Speed rises at the same slope as before but turns around before reaching the cruise velocity line, making a small triangle."
              viewBox="0 0 320 200"
              className="h-auto w-full"
            >
              <path
                d="M40 160 L70 110 L100 160 Z"
                fill="var(--accent)"
                fillOpacity="0.12"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <line
                x1="40"
                y1="60"
                x2="292"
                y2="60"
                stroke="var(--line)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <line
                x1="40"
                y1="22"
                x2="40"
                y2="160"
                stroke="var(--fg-mute)"
                strokeWidth="1.5"
              />
              <line
                x1="40"
                y1="160"
                x2="300"
                y2="160"
                stroke="var(--fg-mute)"
                strokeWidth="1.5"
              />
              <text x="46" y="52" fontSize="10" fill="var(--fg-mute)">
                cruise velocity — never reached
              </text>
              <text x="112" y="128" fontSize="10" fill="var(--fg-mute)">
                same slope, shorter trip
              </text>
              <text
                x="170"
                y="194"
                fontSize="10"
                fill="var(--fg-mute)"
                textAnchor="middle"
              >
                time
              </text>
              <text
                x="14"
                y="91"
                fontSize="10"
                fill="var(--fg-mute)"
                textAnchor="middle"
                transform="rotate(-90 14 91)"
              >
                velocity
              </text>
            </svg>
            <p className="mt-2">
              <strong>A short move.</strong> The motor has to start slowing down
              before it ever gets up to cruise, so the trapezoid collapses into
              a triangle.
            </p>
          </div>
        </div>

        <p>
          Which of those two shapes you get is not something you configure. It
          falls out of the distance. That matters more than it sounds like it
          does, and there is a worked example further down where the workshop
          arm turns out to be the triangle.
        </p>
      </LessonSection>

      {/* ── the two numbers ──────────────────────────────────────────── */}
      <LessonSection
        id="two-numbers-and-what-a-quot"
        title='Two numbers, and what a "rotation" means in each one'
      >
        <p>
          Both files on <code>4-MotionMagic</code> set exactly two Motion Magic
          values, and nothing else:
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Box
            variant="concept"
            tag="ROT/S"
            title="MotionMagicCruiseVelocity"
            code="config.MotionMagic.MotionMagicCruiseVelocity"
          >
            The flat top of the trapezoid. The fastest the profile is ever
            allowed to go, in rotations per second.
          </Box>
          <Box
            variant="concept"
            tag="ROT/S²"
            title="MotionMagicAcceleration"
            code="config.MotionMagic.MotionMagicAcceleration"
          >
            The slope of both sloped sides. How many rotations per second the
            profile is allowed to gain — or lose — every second.
          </Box>
        </div>

        <Box
          variant="alert-warning"
          tag="WATCH OUT · UNITS"
          title="A rotation of what?"
        >
          <p>
            &quot;Rotations per second&quot; is not the same measurement on the
            two mechanisms, and the difference comes from one line in each
            constructor.
          </p>
          <p className="mt-3">
            <code>Arm.java</code> ends its config with{" "}
            <code>config.Feedback.withRemoteCANcoder(encoder)</code>, and the
            file&apos;s own comment on the target constants reads{" "}
            <em>&quot;rotations, 1.0 = one full turn&quot;</em> with{" "}
            <code>VERTICAL_POSITION = 0.25; // 90°</code>. So a rotation on the
            arm is a rotation of <strong>the arm</strong>. The gearbox is on the
            other side of the sensor and never enters these two numbers.
          </p>
          <p className="mt-3">
            <code>Flywheel.java</code> has no CANcoder and never touches{" "}
            <code>config.Feedback</code> at all. There is no other sensor in the
            file, so the wheel&apos;s speed is measured by{" "}
            <strong>the motor itself</strong>. Its numbers are motor rotations.
          </p>
          <p className="mt-3">
            Copying a cruise velocity from one mechanism to another is therefore
            meaningless. 100 is a sensible number on one of these files and an
            absurd one on the other.
          </p>
        </Box>

        <Box
          variant="alert-info"
          tag="NOTE · JERK"
          title="There is a third setting. The workshop code does not use it."
        >
          <p>
            Phoenix 6 also has <code>MotionMagicJerk</code>, which limits how
            fast the acceleration itself is allowed to change — it rounds off
            the corners of the trapezoid. CTRE&apos;s reference lists it as
            optional and notes that jerk limiting makes every move take longer.
          </p>
          <p className="mt-3">
            <strong>
              No file on <code>4-MotionMagic</code> sets it.
            </strong>{" "}
            Neither does the robot template. Leave it alone. Two numbers is the
            whole configuration for this lesson, and adding a third one you have
            not measured makes the arm slower without making it smoother.
          </p>
        </Box>
      </LessonSection>

      {/* ── the edits ────────────────────────────────────────────────── */}
      <LessonSection
        id="swap-the-control-request"
        title={
          <>
            Step 1 — swap the control request in <code>Arm.java</code>
          </>
        }
        outlineLabel="swap the control request in Arm.java"
      >
        <p>
          Three edits, all in <code>Arm.java</code>, plus one line that goes
          away — covered just below. The type changes from{" "}
          <code>PositionVoltage</code> to <code>MotionMagicVoltage</code>, two
          constants appear, and two lines join the constructor.
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — the three edits"
          filename="src/main/java/frc/robot/subsystems/Arm.java"
          code={`// Top of the file. This import replaces the PositionVoltage one.
import com.ctre.phoenix6.controls.MotionMagicVoltage;

// With the other constants, above the hardware fields:
  // Motion Magic speed limits: how fast the arm may move and how quickly it may speed up.
  // TODO: CRITICAL - set these before running the arm. Good starting values:
  // cruise=2 rot/s, accel=4 rot/s².
  private static final double MOTION_MAGIC_CRUISE_VELOCITY = 0.0; // NEEDS SETTING - max rot/s
  private static final double MOTION_MAGIC_ACCELERATION = 0.0; // NEEDS SETTING - max rot/s²

// With the other fields. Same variable name, new type:
  private final MotionMagicVoltage positionOut = new MotionMagicVoltage(0);

// Inside the constructor, after the four Slot0 gains:
    config.MotionMagic.MotionMagicCruiseVelocity = MOTION_MAGIC_CRUISE_VELOCITY;
    config.MotionMagic.MotionMagicAcceleration = MOTION_MAGIC_ACCELERATION;`}
        />

        <p>
          <strong>Visible result:</strong> the project compiles. Nothing else in
          the file has to change for that — there is one line to delete as well,
          below, but the build does not depend on it. The setter and both
          commands are byte-for-byte what they were on <code>3-PID</code> —{" "}
          <code>withPosition(...)</code> reads the same on both request types.
        </p>

        <CodeBlock
          language="java"
          title="Unchanged — you do not edit any of this"
          code={`  /** Move to the vertical (stowed) position and hold it. Never finishes. See the rule above. */
  public Command vertical() {
    return runRepeatedly(() -> setPosition(VERTICAL_POSITION)).named("vertical (hold)");
  }

  private void setPosition(double rotations) {
    motor.setControl(positionOut.withPosition(rotations));
  }`}
        />

        <p>
          The rule that javadoc points at is the comment block above the
          commands in <code>Arm.java</code>: every command here is a hold, and a
          hold never finishes. That is unchanged too.
        </p>

        <Box
          variant="alert-info"
          tag="IF YOU ARE READING THE DIFF"
          title="One line disappears as well"
        >
          <p>
            The <code>3-PID</code> constructor had{" "}
            <code>
              config.Slot0.StaticFeedforwardSign =
              StaticFeedforwardSignValue.UseClosedLoopSign;
            </code>
            , and its import. Both are gone on this branch. That setting lives
            under <code>Slot0</code>, not under <code>MotionMagic</code> — it is
            a feedforward detail, not part of the two numbers this lesson is
            about. Delete it along with the import and move on.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="the-same-three-edits"
        title={
          <>
            Step 2 — the same three edits in <code>Flywheel.java</code>
          </>
        }
        outlineLabel="the same three edits in Flywheel.java"
      >
        <p>
          Identical shape, different type name, and — this is the interesting
          part — real numbers instead of placeholders.
        </p>

        <CodeBlock
          language="java"
          title="Flywheel.java — the three edits"
          filename="src/main/java/frc/robot/subsystems/Flywheel.java"
          code={`// Top of the file. This import replaces the VelocityVoltage one.
import com.ctre.phoenix6.controls.MotionMagicVelocityVoltage;

// With the other constants:
  // Motion Magic limits: how fast the wheel may spin and how quickly it may speed up.
  private static final double MOTION_MAGIC_CRUISE_VELOCITY = 100.0; // top speed (rot/s)
  private static final double MOTION_MAGIC_ACCELERATION = 1000.0; // ramp rate (rot/s²)

// With the other fields:
  private final MotionMagicVelocityVoltage velocityOut = new MotionMagicVelocityVoltage(0);

// Inside the constructor, after the three Slot0 gains:
    config.MotionMagic.MotionMagicCruiseVelocity = MOTION_MAGIC_CRUISE_VELOCITY;
    config.MotionMagic.MotionMagicAcceleration = MOTION_MAGIC_ACCELERATION;`}
        />

        <p>
          <strong>Visible result:</strong> still compiling, and you do not have
          to pick either number — those two are the ones the branch ships. The
          gains are a separate question, and they are not all filled in:{" "}
          <code>kV = 0.125</code> is a real measured value, but <code>kS</code>{" "}
          and <code>kP</code> are both still <code>0.0</code> on this branch, so
          the wheel runs on feedforward alone with no proportional correction.
          The arm&apos;s two Motion Magic numbers are blank as well. That
          difference is the next section.
        </p>
      </LessonSection>

      {/* ── tuned vs untuned ─────────────────────────────────────────── */}
      <LessonSection
        id="the-branch-fills-in-the-flywheel"
        title="The branch fills in the flywheel's numbers and leaves the
          arm's blank"
      >
        <p>
          Put the two constant blocks next to each other. This is not an
          oversight in the workshop code — it is the honest state of a real
          robot project, and it is worth understanding before you type anything.
        </p>

        <CodeBlock
          language="java"
          title="Side by side, verbatim from 4-MotionMagic"
          code={`// Arm.java — placeholders. You have to fill these in.
  // TODO: CRITICAL - set these before running the arm. Good starting values:
  // cruise=2 rot/s, accel=4 rot/s².
  private static final double MOTION_MAGIC_CRUISE_VELOCITY = 0.0; // NEEDS SETTING - max rot/s
  private static final double MOTION_MAGIC_ACCELERATION = 0.0; // NEEDS SETTING - max rot/s²


// Flywheel.java — real, shipped values.
  private static final double MOTION_MAGIC_CRUISE_VELOCITY = 100.0; // top speed (rot/s)
  private static final double MOTION_MAGIC_ACCELERATION = 1000.0; // ramp rate (rot/s²)`}
        />

        <Box
          variant="alert-danger"
          tag="DON'T"
          title="0.0 is a placeholder, not a gentle setting"
        >
          <p>
            <code>NEEDS SETTING</code> means nobody has measured this arm yet.
            It does not mean &quot;no limit, but slowly.&quot; Never power an
            arm with those two constants left at <code>0.0</code>, and never
            assume a zero somewhere else in the file is safe either — the four
            gains in this same class ship as <code>0.0 // NEEDS TUNING</code>{" "}
            too.
          </p>
          <p className="mt-3">
            Motion Magic decides <em>where the arm should be</em> at each
            instant. The <code>Slot0</code> gains are what actually push it
            there. Zeros in either place and the arm sits still; wrong numbers
            in either place and the arm hurts itself. Get your gains from{" "}
            <strong>PID Control</strong> before you use this page.
          </p>
        </Box>

        <p>
          Why is one filled in and the other not? A flywheel has one job, it
          cannot crash into anything, and nothing hanging off it changes from
          one copy of the mechanism to the next — so its numbers travel. An arm
          has weight on a lever, a hard stop at each end, and whatever you
          bolted to it. Nobody can hand you those two numbers from a different
          building.
        </p>
      </LessonSection>

      {/* ── picking the arm's numbers ────────────────────────────────── */}
      <LessonSection id="pick-the-arm-s" title="pick the arm's two numbers">
        <p>Work out the ceiling first, then start well under it.</p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            <strong>Find the motor&apos;s free speed.</strong> Free speed is how
            fast a motor spins with nothing attached to it. CTRE&apos;s
            published dyno data for the Kraken X44 gives 7758 RPM under
            trapezoidal commutation, which is about{" "}
            <strong>129 rotations per second</strong>. That is the motor, in
            perfect conditions, doing no work at all. Anything you measure on a
            real mechanism will be lower, so treat it as a ceiling and not a
            target.
          </li>
          <li>
            <strong>Divide by your gearbox reduction.</strong> The arm sits on
            the far side of a gearbox that trades speed for strength, and the
            CANcoder measures that far side. The workshop arm uses the two-stage
            WCP rotation gearbox on the bill of materials, built with the gears
            the BOM pins: an 8t motor gear into a 60t, then a 16t into a second
            60t. That is 7.5 × 3.75, so <strong>28.125:1</strong>, and 129 rot/s
            at the motor becomes about <strong>4.6 rot/s at the arm</strong>.
            Build the kit with different gears and the number changes — work out
            yours and write it down.
          </li>
          <li>
            <strong>Take a number well under it.</strong> The free-speed figure
            assumes no load and your arm has weight on it, so expect to raise
            this later rather than lower it. <code>Arm.java</code>&apos;s own
            TODO recommends starting at <strong>2 rot/s</strong>.
          </li>
          <li>
            <strong>Set acceleration to twice the cruise velocity.</strong> That
            is what the same TODO recommends: <strong>4 rot/s²</strong>. Cruise
            velocity divided by acceleration is how long the ramp takes, so 2 ÷
            4 is half a second up to speed and another half a second back down.
          </li>
        </ol>

        <CodeBlock
          language="java"
          title="Arm.java — the numbers to start with"
          code={`  // The values Arm.java's own TODO recommends. A starting point, not an answer.
  private static final double MOTION_MAGIC_CRUISE_VELOCITY = 2.0; // rot/s
  private static final double MOTION_MAGIC_ACCELERATION = 4.0; // rot/s²`}
        />

        <Box
          variant="concept"
          title="Run the arithmetic before you run the arm"
        >
          <p>
            At 4 rot/s², reaching 2 rot/s takes half a second — and in that half
            second the arm has already turned half a rotation, 180°.
          </p>
          <p className="mt-3">
            Now look at where the arm is going.{" "}
            <code>VERTICAL_POSITION = 0.25</code> and{" "}
            <code>HORIZONTAL_POSITION = 0.5</code>, so the whole trip between
            them is a quarter rotation — 90°. The arm has to start braking long
            before it reaches 2 rot/s.
          </p>
          <p className="mt-3">
            So on this mechanism, with these numbers, you get the{" "}
            <strong>triangle</strong> from the second chart. Cruise velocity is
            doing nothing at all, and acceleration is the only number deciding
            how the move feels. Turning cruise velocity up will change nothing
            you can see. This is the single most common confusion with Motion
            Magic, and one subtraction catches it.
          </p>
        </Box>

        <p>
          From there, tune by feel, and change one number at a time. Raise
          acceleration until the arm slams into position or the gearbox makes a
          noise you do not like, then back it off until that stops. Raise cruise
          velocity only once your moves are long enough for the flat top to
          exist.
        </p>
      </LessonSection>

      {/* ── the flywheel's numbers ───────────────────────────────────── */}
      <LessonSection
        id="read-the-flywheel-s"
        title="read the flywheel's numbers and check them"
      >
        <p>
          You do not have to pick these, but you should be able to say why they
          are what they are. Four numbers from the file, all measured at the
          motor:
        </p>

        <ul className="ml-5 list-disc space-y-2">
          <li>
            <code>SLOW_SPEED_RPS = 25.0</code> and{" "}
            <code>FAST_SPEED_RPS = 75.0</code> — the two speeds the commands ask
            for.
          </li>
          <li>
            <code>MOTION_MAGIC_CRUISE_VELOCITY = 100.0</code> — a ceiling above
            both of them, and comfortably under the 129 rot/s the motor can
            manage unloaded.
          </li>
          <li>
            <code>MOTION_MAGIC_ACCELERATION = 1000.0</code> — ten times the
            cruise velocity. The arm&apos;s suggested ratio was two.
          </li>
        </ul>

        <p>
          Do the same division as before: 75 rot/s at 1000 rot/s² is{" "}
          <strong>0.075 seconds</strong> from stopped to full speed.
          Seventy-five thousandths of a second. You will not see that ramp by
          eye, and that is fine. A flywheel wants to be at speed and stay there.
          The ramp is there so the motor is never asked for an instant jump in
          speed, not so the move looks gentle. A heavy arm wants the opposite.
        </p>

        <Box variant="concept" title="Why the flywheel sets a cruise velocity">
          <p>
            CTRE&apos;s Motion Magic reference lists cruise velocity for
            position control, and lists only acceleration — plus optional jerk —
            for Motion Magic <em>Velocity</em>. The velocity you are ramping
            toward comes from the request, not from the config, so the number
            shaping this flywheel&apos;s spin-up is the acceleration.
          </p>
          <p className="mt-3">
            The branch sets a cruise velocity anyway. It costs nothing, it
            documents the ceiling this wheel is designed around, and it is there
            if the mechanism is ever changed to position control.
          </p>
        </Box>
      </LessonSection>

      {/* ── bindings ─────────────────────────────────────────────────── */}
      <LessonSection
        id="nothing-about-your-bindings-changes"
        title="Nothing about your bindings changes"
      >
        <p>
          Motion Magic is entirely inside the mechanism. From outside,{" "}
          <code>arm.vertical()</code> is the same hold it was last page, and you
          bind it the way <strong>Chaining Commands</strong> established.
        </p>

        <CodeBlock
          language="java"
          title="TeleopOpMode.java — unchanged behavior, current dialect"
          code={`// The arm has no stop command on this branch, so there is nothing to pair.
driver.leftTrigger().whileTrue(arm.vertical());

// The flywheel does, so pair it — canceling a command does not stop a motor.
driver.a().whileTrue(flywheel.runFast()).whileFalse(flywheel.stop());`}
        />

        <p>
          The <code>TeleopOpMode.java</code> on <code>4-MotionMagic</code> still
          shows the older <code>onTrue</code> / <code>onFalse</code> pairs it
          was given back on branch <code>2-Commands</code>, because no branch
          since has touched that file. Either spelling lets you watch the
          profile run.
        </p>
      </LessonSection>

      {/* ── branch embed ─────────────────────────────────────────────── */}
      <MechanismTabs
        sectionTitle="The branch: 4-MotionMagic"
        armContent={{
          beforeItems: [
            "• PositionVoltage — the loop steers straight at the target",
            "• Full correction on the very first loop",
            "• No speed limit, no acceleration limit",
            "• Slot0 gains ship as 0.0 // NEEDS TUNING",
            "• Position read from the remote CANcoder",
          ],
          afterItems: [
            "• MotionMagicVoltage — the loop chases a planned ramp",
            "• MOTION_MAGIC_CRUISE_VELOCITY and MOTION_MAGIC_ACCELERATION added",
            "• Both ship as 0.0 // NEEDS SETTING — you fill them in",
            "• The file's TODO suggests cruise 2 rot/s, accel 4 rot/s²",
            "• Same four Slot0 gains, still 0.0 // NEEDS TUNING",
          ],
          repository: "Hemlock5712/Workshop-Code",
          filePath: "src/main/java/frc/robot/subsystems/Arm.java",
          branch: "4-MotionMagic",
          pullRequestNumber: 4,
          focusFile: "Arm.java",
          walkthrough: {
            leftTitle: "What the diff changes",
            leftItems: [
              "• <strong>Import:</strong> PositionVoltage becomes MotionMagicVoltage",
              "• <strong>Field:</strong> new MotionMagicVoltage(0), same variable name",
              "• <strong>Constructor:</strong> two new config.MotionMagic lines",
              "• <strong>Removed:</strong> config.Slot0.StaticFeedforwardSign and its import",
              "• <strong>Untouched:</strong> vertical(), horizontal(), setPosition(), all four gains",
            ],
            rightTitle: "The numbers on this branch",
            rightItems: [
              "• <strong>MOTION_MAGIC_CRUISE_VELOCITY = 0.0:</strong> marked NEEDS SETTING",
              "• <strong>MOTION_MAGIC_ACCELERATION = 0.0:</strong> marked NEEDS SETTING",
              "• <strong>File TODO:</strong> suggests cruise 2, accel 4 — a 2x ratio",
              "• <strong>VERTICAL_POSITION = 0.25 (90°):</strong> so a rotation here is a rotation of the arm",
              "• <strong>No jerk:</strong> nothing on this branch sets MotionMagicJerk",
            ],
          },
          nextStepText:
            "Once you have given it two real numbers, the arm eases into position instead of lunging. Next, on Finish Lines, it learns to report where it is, so a routine can wait for the arm instead of guessing with a stopwatch.",
        }}
        flywheelContent={{
          beforeItems: [
            "• VelocityVoltage — the loop jumps at the target speed",
            "• No limit on how fast the speed may change",
            "• SLOW_SPEED_RPS = 25.0, FAST_SPEED_RPS = 75.0",
            "• kS = 0.0, kV = 0.125, kP = 0.0",
            "• Leader CAN 21, follower CAN 22 spinning Opposed",
          ],
          afterItems: [
            "• MotionMagicVelocityVoltage — the speed ramps to the target",
            "• MOTION_MAGIC_ACCELERATION = 1000.0 rot/s²",
            "• MOTION_MAGIC_CRUISE_VELOCITY = 100.0 rot/s",
            "• Both shipped filled in — no NEEDS SETTING on this file",
            "• Same speeds, same gains, same two motors",
          ],
          repository: "Hemlock5712/Workshop-Code",
          filePath: "src/main/java/frc/robot/subsystems/Flywheel.java",
          branch: "4-MotionMagic",
          pullRequestNumber: 4,
          focusFile: "Flywheel.java",
          walkthrough: {
            leftTitle: "What the diff changes",
            leftItems: [
              "• <strong>Import:</strong> VelocityVoltage becomes MotionMagicVelocityVoltage",
              "• <strong>Field:</strong> new MotionMagicVelocityVoltage(0)",
              "• <strong>Constructor:</strong> two new config.MotionMagic lines",
              "• <strong>Untouched:</strong> runSlow(), runFast(), stop(), setVelocity(), the Follower line",
            ],
            rightTitle: "The numbers on this branch",
            rightItems: [
              "• <strong>Acceleration 1000 rot/s²:</strong> 75 rot/s reached in 0.075 s",
              "• <strong>Cruise 100 rot/s:</strong> a ceiling under the motor's ~129 rot/s free speed",
              "• <strong>Ratio 10x:</strong> accel is ten times cruise; the arm's suggestion is 2x",
              "• <strong>No config.Feedback anywhere in the file:</strong> these are motor rotations, not arm rotations",
            ],
          },
          nextStepText:
            "The flywheel now ramps between speeds instead of slamming. Next, on Finish Lines, it gains an isAtTarget() so a routine can wait for it to be up to speed.",
        }}
      />

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Build the project. It should compile clean. If it does not, the
            import is the usual cause — see below.
          </li>
          <li>
            Check that the arm has real numbers in all six places: cruise
            velocity, acceleration, and the four <code>Slot0</code> gains. Any{" "}
            <code>0.0</code> still sitting there and the rest of these steps do
            nothing.
          </li>
          <li>
            Start the simulator and click Enable, the way{" "}
            <strong>Running Your Code</strong> showed you. Move the arm by hand
            to roughly horizontal so it has somewhere to travel from.
          </li>
          <li>
            Hold the left trigger. <strong>You should see:</strong> the arm
            leave gently, arrive gently, and settle without bouncing. The
            difference from the PID lesson is loudest at the very start of the
            move, where the arm used to snap.
          </li>
          <li>
            <strong>Make the profile obvious.</strong> Set cruise velocity to{" "}
            <code>0.25</code> and acceleration to <code>0.5</code>, redeploy,
            and hold the trigger again. <strong>You should see:</strong> the
            same 90° move take about a second and a half instead of about half a
            second — and this time the arm visibly holds one steady speed
            through the middle before slowing down. That flat middle is the
            cruise phase. At 2 and 4 there was no room for it. Nothing about the
            gains changed.
          </li>
          <li>
            Release the trigger mid-move. <strong>You should see:</strong> the
            arm keep going to the vertical target and hold there, exactly as if
            you had never let go. That surprises people, and it is worth
            understanding. The request you sent was{" "}
            <code>withPosition(VERTICAL_POSITION)</code> — the <em>final</em>{" "}
            target, not the next step along the way. Motion Magic builds the
            ramp <em>on the motor controller</em>. Canceling the command stops
            your code re-sending the request; it does not reach into the
            controller and cancel a profile already in progress, and{" "}
            <code>idle()</code> sends nothing, so the last request stands. This
            is the same reason <code>flywheel.stop()</code> has to be paired
            with <code>whileFalse</code> two sections above: stopping a
            mechanism takes a command that says stop.
          </li>
          <li>
            Put the arm&apos;s numbers back to 2 and 4, then hold A for the
            flywheel. <strong>You should see:</strong> essentially an instant
            spin-up. At 1000 rot/s², the ramp is 0.075 seconds long.
          </li>
          <li>
            <strong>Make that one visible too.</strong> Set the flywheel&apos;s
            acceleration to <code>50.0</code> and hold A.{" "}
            <strong>You should see:</strong> a spin-up you can watch and hear,
            taking about a second and a half — 75 divided by 50. Put it back to{" "}
            <code>1000.0</code>.
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
                It will not compile, and the error names{" "}
                <code>PositionVoltage</code> or <code>MotionMagicVoltage</code>.
              </strong>{" "}
              You changed the field&apos;s type but not the import, or the
              import but not the field. Both have to move together. The error
              points at the field declaration rather than at{" "}
              <code>setPosition</code>, because <code>withPosition(...)</code>{" "}
              reads identically on both types.
            </li>
            <li>
              <strong>The arm does not move at all, and nothing errors.</strong>{" "}
              Something is still <code>0.0</code>. With every <code>Slot0</code>{" "}
              gain at zero the controller commands zero volts no matter how good
              the profile is, and with cruise velocity and acceleration at zero
              there is no profile to follow. Fix the numbers, not the code.
            </li>
            <li>
              <strong>
                The arm moves smoothly, then overshoots and hunts around the
                target.
              </strong>{" "}
              That is the gains, not the profile. Motion Magic hands the loop a
              gentler target; it does not make a badly tuned loop track it. Go
              back to <strong>PID Control</strong> — <code>kD</code> is usually
              the one that settles hunting, and a profiled mechanism can often
              take more <code>kP</code> than one without a profile.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── video + docs ─────────────────────────────────────────────── */}
      <LessonSection
        id="watch-someone-else-do-it"
        title="Watch someone else do it"
      >
        <p>Motion Magic tuning, walked through end to end.</p>

        <div className="aspect-video overflow-hidden rounded-lg">
          <iframe
            src="https://www.youtube.com/embed/7I7r9p1RBZI"
            title="Motion Magic Tuning"
            className="h-full w-full"
            allowFullScreen
          />
        </div>

        <p>
          CTRE&apos;s own reference is the place to check what a setting does,
          including the jerk field this lesson leaves alone and the Motion Magic
          Expo variant it never uses.
        </p>

        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/api-reference/device-specific/talonfx/motion-magic.html"
          title="Phoenix 6: Motion Magic reference"
          icon={<Book className="w-5 h-5" />}
        />
      </LessonSection>

      {/* ── what's next ──────────────────────────────────────────────── */}
      <LessonSection id="what-this-sets-up" title="What this sets up">
        <p>
          The arm now has a target and a sensible way of getting to it. What it
          still cannot do is <em>tell you</em> it arrived — there is no{" "}
          <code>isAtTarget()</code> anywhere in <code>Arm.java</code> on this
          branch, so every routine you write still has to guess with a
          stopwatch. <strong>Finish Lines</strong> is where that changes, and it
          is where the tuning you did here starts paying off: a profile that
          settles cleanly is a profile something can wait on.
        </p>
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "What does Motion Magic change about the PID loop you built last page?",
            options: [
              "It replaces the PID gains with its own",
              "It changes what the loop is aiming at each cycle, feeding it a target that ramps up and down instead of the final one",
              "It removes the need for feedforward gains",
              "It makes the motor spin faster than its free speed",
            ],
            correctAnswer: 1,
            explanation:
              "The gains are untouched by this lesson — the diff does not change kG, kS, kP or kD on the arm, or kS, kV or kP on the flywheel. Motion Magic plans a speed-against-time profile and hands the loop a moving target. The loop still does the pushing.",
          },
          {
            id: 2,
            question:
              "How many Motion Magic settings do Arm.java and Flywheel.java configure on the 4-MotionMagic branch?",
            options: [
              "Three: cruise velocity, acceleration and jerk",
              "Two: cruise velocity and acceleration",
              "One: acceleration",
              "Four: cruise velocity, acceleration, jerk and snap",
            ],
            correctAnswer: 1,
            explanation:
              "Both files set MotionMagicCruiseVelocity and MotionMagicAcceleration, and nothing else. MotionMagicJerk is a real Phoenix 6 setting — CTRE documents it as optional and warns it lengthens every move — but no file on this branch, and no file in the robot template, sets it.",
          },
          {
            id: 3,
            question:
              "What does Arm.java on 4-MotionMagic ship MOTION_MAGIC_CRUISE_VELOCITY as?",
            options: [
              "2.0, the tuned value for the workshop arm",
              "8.0, calculated from the gear ratio",
              "0.0, marked NEEDS SETTING, with a TODO suggesting you start at 2 rot/s",
              "100.0, the same as the flywheel",
            ],
            correctAnswer: 2,
            explanation:
              "Both Motion Magic constants in Arm.java are 0.0 // NEEDS SETTING. The file's TODO recommends starting at cruise 2 rot/s and accel 4 rot/s² — a suggestion to begin from, not a measured answer. The flywheel on the same branch does ship real values, which is what makes the contrast worth noticing.",
          },
          {
            id: 4,
            question:
              "The flywheel's FAST_SPEED_RPS is 75.0 and its MOTION_MAGIC_ACCELERATION is 1000.0. Roughly how long does the profile take to get from stopped to full speed?",
            options: [
              "About 13 seconds",
              "About 0.075 seconds",
              "About 1.3 seconds",
              "It depends on the cruise velocity, so you cannot tell",
            ],
            correctAnswer: 1,
            explanation:
              "Divide the speed you want by the acceleration: 75 ÷ 1000 = 0.075 seconds. That is far too quick to see, which is fine — the profile is there to protect the hardware, not to look gentle. Drop the acceleration to 50 and the same spin-up takes 1.5 seconds and becomes obvious.",
          },
          {
            id: 5,
            question:
              "Why is a cruise velocity of 2 rot/s on the arm not the same kind of number as 100 rot/s on the flywheel?",
            options: [
              "The arm is slower, so it uses different units",
              "Arm.java sets the CANcoder as its feedback source, so its rotations are arm rotations; Flywheel.java sets no feedback source at all, so its rotations are motor rotations",
              "Cruise velocity means rotations per minute on position mechanisms",
              "They are the same kind of number — 2 is only a safer value",
            ],
            correctAnswer: 1,
            explanation:
              "config.Feedback.withRemoteCANcoder(encoder) in the arm's constructor is the line that decides it, and the constants confirm it: VERTICAL_POSITION = 0.25 is commented 90°, so one rotation is one turn of the arm. Flywheel.java has no CANcoder and never touches config.Feedback, so its speed is measured at the motor. Never copy a cruise velocity between the two.",
          },
          {
            id: 6,
            question:
              "Your arm travels from VERTICAL_POSITION (0.25) to HORIZONTAL_POSITION (0.5) with cruise 2 rot/s and acceleration 4 rot/s². What shape is the profile?",
            options: [
              "A trapezoid — it reaches 2 rot/s and holds it for most of the trip",
              "A triangle — reaching 2 rot/s would take half a rotation of travel, and the whole move is only a quarter rotation",
              "A square — Motion Magic runs at cruise velocity the entire time",
              "There is no profile until you also set jerk",
            ],
            correctAnswer: 1,
            explanation:
              "Accelerating at 4 rot/s² takes half a second to reach 2 rot/s, and covers half a rotation doing it. The move is only 0.25 rotations, so the arm brakes before it ever gets up to speed. On short moves the cruise velocity does nothing and acceleration is the only number that changes how the move feels.",
          },
        ]}
      />
    </PageTemplate>
  );
}
