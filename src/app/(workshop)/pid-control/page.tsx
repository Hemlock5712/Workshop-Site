import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import AlphaStatusNote from "@/components/AlphaStatusNote";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import MechanismPlayground from "@/components/MechanismPlayground";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { Book } from "lucide-react";

export default function PIDControl() {
  return (
    <PageTemplate
      title="Tell the arm where to go, not how hard to push"
      emphasis="where to go"
      lede="Every arm command you have written so far pushes a fixed voltage. Six volts moves the arm — until a game piece adds weight, or the battery sags, or the arm swings past the point where gravity was helping and starts fighting it instead. A voltage is not a position."
      needs={[
        <>
          The <code>Arm</code> and <code>Flywheel</code> from{" "}
          <strong>Commands</strong>, the bindings from <strong>Triggers</strong>
          , and the simulator from <strong>Running Your Code</strong>.
        </>,
        <>
          The routine you built on <strong>Chaining Commands</strong>. You will
          re-point it, because this branch renames the arm&apos;s commands.
        </>,
        <>
          <strong>The real arm, on the bench, powered.</strong> Two of the four
          gains are physical measurements of your arm. They cannot be found in a
          simulator and nobody can hand them to you.
        </>,
        <>
          Phoenix Tuner X connected, with the CANivore-USB toggle set the way{" "}
          <strong>Hardware Setup</strong> describes, and the CANcoder zeroed the
          way <strong>{"Mechanism Setup "}</strong> describes.
        </>,
      ]}
      branch="3-PID"
      time="about 20 minutes of typing"
    >
      <Split>
        <KeyConceptSection
          description={[
            "On this page the motor takes over. You hand it a target angle — the number you ask the motor to reach is called the setpoint. It reads the CANcoder, compares that reading to the setpoint, and works out its own voltage — over and over, inside the TalonFX itself rather than in your code. That is a closed loop: the motor reads a sensor and adjusts, instead of blindly pushing. That is PID.",
            "Then you tune it. Four numbers, measured on your actual arm, in a fixed order. The 3-PID branch ships all four as 0.0 on purpose — finding them is the lesson.",
          ]}
          concept="PID turns the gap between where the arm is and where you asked it to be into motor output. Feedforward adds the output you already know it will need, before any gap shows up."
        />
        <MarginNote label="WHAT YOU'LL BUILD">
          An arm that drives to an angle and holds it, and a flywheel that holds
          a speed under load. The typing is the short part. Tuning takes as long
          as it takes — plan on an hour the first time, and expect to redeploy a
          dozen times.
        </MarginNote>
      </Split>

      {/* ── the rename ───────────────────────────────────────────────── */}
      <LessonSection
        id="first-the-arm-s-commands-change"
        title="First: the arm's commands change names"
      >
        <p>
          On <code>2-Commands</code> the arm offered <code>runSlow()</code>,{" "}
          <code>runFast()</code> and <code>stop()</code> — three voltages. On{" "}
          <code>3-PID</code> those are gone. In their place are two{" "}
          <em>position presets</em>:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-note">
            <thead>
              <tr>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                >
                  On <code>2-Commands</code>
                </th>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                >
                  On <code>3-PID</code>
                </th>
                <th
                  className="border-b px-3 py-2 text-left font-semibold"
                  style={{ borderColor: "var(--line)", color: "var(--fg)" }}
                >
                  What it means now
                </th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  <code>arm.runSlow()</code> / <code>arm.runFast()</code>
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  <code>arm.vertical()</code> / <code>arm.horizontal()</code>
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  Angles, not voltages. <code>0.25</code> rotations (90°) and{" "}
                  <code>0.5</code> rotations (180°).
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  <code>arm.stop()</code>
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  <strong>deleted</strong>
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  A canceled position hold leaves the arm parked at its target.
                  Nothing to stop. See the box below.
                </td>
              </tr>
              <tr>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  <code>flywheel.runSlow()</code> / <code>runFast()</code> /{" "}
                  <code>stop()</code>
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  same three names
                </td>
                <td
                  className="border-b px-3 py-2 align-top"
                  style={{ borderColor: "var(--line-soft)" }}
                >
                  Same names, new meaning: <code>25.0</code> and{" "}
                  <code>75.0</code> rotations per second instead of 3 V and 6 V.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          So the routine from Chaining Commands does not compile any more. One
          identifier changes:
        </p>

        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
          title="TeleopOpMode.java — the same routine, re-pointed"
          code={`driver
    .y()
    .whileTrue(
        Command.sequence(
                // Was arm.runFast(). The arm now drives to an angle.
                arm.vertical().withTimeout(Seconds.of(1.0)),
                flywheel.runFast())
            .named("Lift Then Spin (hold)"))
    .whileFalse(flywheel.stop());`}
        />

        <p>
          <code>Seconds.of(1.0)</code> still needs the static import you added
          on <strong>Chaining Commands</strong>:{" "}
          <code>import static org.wpilib.units.Units.Seconds;</code> at the top
          of the file.
        </p>

        <p>
          The timeout is still a guess at how long the arm needs. The arm still
          cannot tell you when it has arrived — that arrives on{" "}
          <strong>{"Finish Lines "}</strong>, two lessons from here, and it is
          where this exact line becomes <code>.until(arm::isAtTarget)</code>.
        </p>

        <Box
          variant="concept"
          title="Why the arm lost stop() and the flywheel kept it"
        >
          <p>
            Canceling a command does not stop a motor. The mechanism falls back
            to <code>idle()</code>, which sends nothing at all and does not
            cancel the last request Phoenix received — so the motor keeps doing
            whatever it was last told.
          </p>
          <p className="mt-3">
            On <code>2-Commands</code> that was a hazard: the last thing the arm
            was told was &quot;push 6 volts,&quot; and it kept pushing. Now the
            last thing it was told is &quot;hold 0.25 rotations,&quot; so it
            parks there and stays. That is why <code>3-PID</code> deletes{" "}
            <code>arm.stop()</code>. The branch javadoc puts it this way:
            &quot;there is no stop command anymore. A Mechanism with nothing
            commanding it runs an idle default command on its own, so we
            don&apos;t have to write one.&quot;
          </p>
          <p className="mt-3">
            The flywheel keeps <code>stop()</code> because &quot;hold 75
            rotations per second&quot; does not become harmless when nobody is
            watching. It keeps spinning until something tells it not to.
          </p>
        </Box>
      </LessonSection>

      {/* ── playground ───────────────────────────────────────────────── */}
      <LessonSection
        id="play-with-the-gains-first"
        title="Play with the gains first"
      >
        <p>
          Drag a gain and watch what the mechanism does. Get a feel for what
          &quot;too much kP&quot; looks like before you type a number into a
          file and send it to a real motor. These are simulations, not your
          robot — the workshop robot has an arm and a flywheel, and the elevator
          is here because it is the other gravity case (a constant pull instead
          of one that changes with angle).
        </p>

        <MechanismPlayground />
      </LessonSection>

      {/* ── the six gains ────────────────────────────────────────────── */}
      <LessonSection
        id="the-six-numbers-and-what-each"
        title="The six numbers, and what each one is measured in"
      >
        <p>
          Phoenix computes each term, adds them together, and sends the total to
          the motor as volts. Every gain below is therefore &quot;volts per
          something&quot; — and knowing the <em>something</em> is what makes a
          number like <code>160</code> stop looking absurd.
        </p>

        <h3 className="display measure m-0 text-title">
          Feedback: the three that react to error
        </h3>

        <div className="grid gap-6 md:grid-cols-3">
          <Box variant="concept" title="kP — Proportional" uses="Always">
            <p>
              Output per unit of error, right now.{" "}
              <code>error = target − measured</code>, and{" "}
              <code>P = kP × error</code>. Bigger gap, harder push.
            </p>
            <p className="mt-2">
              <strong>Units on the arm:</strong> volts per{" "}
              <em>{"rotation "}</em> of error. An arm error is a small number —
              a 27° miss is only 0.075 rotations — so kP has to be large to
              produce a useful voltage.
            </p>
            <p className="mt-2">
              <strong>Too little:</strong> the arm stops short and sits there.{" "}
              <strong>Too much:</strong> it overshoots and oscillates.
            </p>
          </Box>

          <Box
            variant="concept"
            title="kI — Integral"
            uses="Almost never on this stack"
          >
            <p>
              Output per unit of error <em>piled up over time</em>. It exists to
              erase a small gap that refuses to close.
            </p>
            <p className="mt-2">
              <strong>Units on the arm:</strong> volts per rotation-second of
              accumulated error.
            </p>
            <p className="mt-2">
              <strong>{"On this branch: "}</strong> never set. Phoenix&apos;s
              default is 0 and it stays 0. The gap kI would erase is the gap kG
              and kS are already handling on an arm, and a wound-up integral
              term turns a mechanism unpredictable.
            </p>
          </Box>

          <Box
            variant="concept"
            title="kD — Derivative"
            uses="Whenever kP overshoots"
          >
            <p>
              Output per unit of <em>how fast the error is changing</em>. When
              the arm is closing on the target quickly, kD pushes back — the
              brakes on kP.
            </p>
            <p className="mt-2">
              <strong>Units on the arm:</strong> volts per rotation-per-second
              of error change.
            </p>
            <p className="mt-2">
              <strong>Too little:</strong> overshoot stays.{" "}
              <strong>Too much:</strong> the motor gets loud and jittery.
            </p>
          </Box>
        </div>

        <h3 className="display measure m-0 text-title">
          Feedforward: the three that do not wait for error
        </h3>

        <p>
          Feedback is reactive — nothing happens until the arm is already in the
          wrong place. Feedforward is the opposite: output you add because you
          already know it will be needed. On an arm that is most of the work,
          and PID only has to clean up what is left.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <Box
            variant="concept"
            title="kS — Static"
            uses="Both mechanisms here"
          >
            <p>
              A flat number of volts added to break static friction. Its sign
              follows the direction of travel, because friction always opposes
              motion.
            </p>
            <p className="mt-2">
              <strong>Units:</strong> volts. <strong>On this branch:</strong>{" "}
              <code>0.0</code> on both mechanisms.
            </p>
          </Box>

          <Box
            variant="concept"
            title="kG — Gravity"
            uses="Arms and elevators only"
          >
            <p>
              Volts added to hold the mechanism up. On an arm, Phoenix scales it
              by the arm&apos;s angle — the next section is entirely about how.
            </p>
            <p className="mt-2">
              <strong>Units:</strong> volts. <strong>On this branch:</strong>{" "}
              <code>0.0</code>, marked <code>NEEDS TUNING</code>. The flywheel
              sets no gravity type at all, because gravity does not slow a
              spinning wheel.
            </p>
          </Box>

          <Box
            variant="concept"
            title="kV — Velocity"
            uses="Velocity loops — the flywheel"
          >
            <p>
              Volts per unit of <em>requested speed</em>. Ask for 75 rotations
              per second, and kV supplies most of the voltage that speed needs
              before PID has seen a single error.
            </p>
            <p className="mt-2">
              <strong>Units:</strong> volts per rotation-per-second.{" "}
              <strong>On this branch:</strong> the flywheel ships{" "}
              <code>kV = 0.125</code> — the one gain in either file that is a
              real, set value.
            </p>
          </Box>
        </div>

        <p>
          There is a seventh, <code>kA</code> — volts per unit of requested{" "}
          <em>acceleration</em>. Neither file sets it. It only earns its place
          once a motion profile is asking for specific accelerations, which is
          the next lesson&apos;s territory.
        </p>
      </LessonSection>

      {/* ── kG and Arm_Cosine ────────────────────────────────────────── */}
      <LessonSection
        id="why-an-arm-needs-kg-and"
        title="Why an arm needs kG, and why it is a cosine"
      >
        <p>
          Hold your own arm straight out to the side. Now raise it straight up.
          Straight out is the hard one — the full weight of your arm is hanging
          off your shoulder. Straight up, gravity pulls down the length of your
          arm instead of across it, and the effort nearly vanishes.
        </p>

        <p>
          A robot arm behaves the same way, so the voltage needed to hold still
          is different at every angle. A single fixed number cannot cover that.
          One config line tells Phoenix to handle it:
        </p>

        <CodeBlock
          language="java"
          title="Arm.java — in the constructor"
          code={`config.Slot0.GravityType = GravityTypeValue.Arm_Cosine; // fights gravity automatically`}
        />

        <p>
          With <code>Arm_Cosine</code>, Phoenix multiplies kG by the cosine of
          the angle between the arm and horizontal. Straight out, the cosine is
          1 and the full kG is applied. Straight up, the cosine is 0 and the
          gravity term disappears. Past vertical the cosine goes negative and
          the term flips direction on its own, which is exactly what the far
          side needs.
        </p>

        <Box
          variant="alert-warning"
          tag="WATCH OUT · ZERO"
          title="Arm_Cosine only works if zero is horizontal"
        >
          <p>
            Phoenix has no idea which way your arm is pointing except through
            the sensor. CTRE&apos;s requirement, word for word: &quot;the sensor
            offset must be configured such that a position of 0 represents the
            arm being held <strong>horizontally forward</strong>.&quot; Zero it
            anywhere else and kG is scaled by the cosine of the wrong angle at
            every position.
          </p>
          <p className="mt-3">
            <strong>Forward is the half of that sentence people drop.</strong>{" "}
            An arm is horizontal in two places — pointing forward and pointing
            backward — and only the forward one is the zero. Pick the backward
            one and every cosine comes out with the wrong sign.
          </p>
          <p className="mt-3">
            That is what the CANcoder zeroing step on{" "}
            <strong>{"Mechanism Setup "}</strong> is for, and why the arm reads
            its position from the CANcoder rather than the motor&apos;s rotor:
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`// Use the CANcoder for position, so PID works on the arm's real angle.
config.Feedback.withRemoteCANcoder(encoder);`}
            />
          </div>
          <p className="mt-3">
            The branch&apos;s two targets are measured from that zero:{" "}
            <code>VERTICAL_POSITION = 0.25</code> is 90° — straight up, where
            the gravity term is zero — and{" "}
            <code>HORIZONTAL_POSITION = 0.5</code> is 180°, horizontal again but
            pointing backward, where the cosine is −1 and kG pushes the other
            way. That 180° position is a <em>target</em>. It is not the zero,
            and zeroing there instead is the mistake this box exists to prevent.
          </p>
        </Box>

        {/* TODO(verify): which physical direction the workshop arm's zero
            points, and whether the CANcoder magnet offset has been set on the
            bench units. CTRE requires zero == arm horizontal for Arm_Cosine;
            ia-audit.md §8 flags the physical zero as unconfirmed with the
            hardware lead. Confirm before adding a photo or a fixed number. */}

        <Box
          variant="alert-info"
          tag="NOTE · SIGN"
          title="Why this branch sets StaticFeedforwardSign"
        >
          <p>
            kS has to push against friction, so its sign has to match the
            direction the mechanism is travelling. Normally Phoenix reads that
            sign off the velocity setpoint — but a plain{" "}
            <code>PositionVoltage</code> request has no velocity setpoint. You
            gave it an angle and said nothing about speed.
          </p>
          <div className="mt-3">
            <CodeBlock
              language="java"
              hideControls
              code={`config.Slot0.StaticFeedforwardSign = StaticFeedforwardSignValue.UseClosedLoopSign;`}
            />
          </div>
          <p className="mt-3">
            That line tells Phoenix to take the sign from the position error
            instead. CTRE recommends it for exactly this case — a position loop
            with no motion profile behind it — and pairs it with a warning: keep
            kS <strong>small</strong>, or the output dithers when the error is
            near zero. A buzzing arm sitting on target is that warning coming
            true.
          </p>
          <p className="mt-3">
            The next lesson deletes this line. Motion Magic generates a velocity
            setpoint, so the default sign rule becomes the right one again.
          </p>
        </Box>
      </LessonSection>

      {/* ── the code ─────────────────────────────────────────────────── */}
      <LessonSection id="write-it-three-steps" title="Write it: three steps">
        {/* Step 1 */}
        <div className="flex flex-col gap-4">
          <h3 className="display measure m-0 text-title">
            1. Swap the arm from <code>VoltageOut</code> to{" "}
            <code>PositionVoltage</code>
          </h3>

          <p>
            <code>VoltageOut</code> carries a voltage.{" "}
            <code>PositionVoltage</code> carries a target position and lets the
            motor pick the voltage. Everything else on the page follows from
            that one substitution.
          </p>

          <p>
            That is the line between the two halves of this workshop.{" "}
            <code>VoltageOut</code> is <strong>open-loop</strong>: no sensor
            takes part in the decision, so the request goes out and nothing
            checks the result. <code>PositionVoltage</code> is{" "}
            <strong>closed-loop</strong>: the motor reads the CANcoder, compares
            it to the setpoint, and decides. Every branch up to{" "}
            <code>2-Commands</code> was open-loop. <code>3-PID</code> is where
            that changes.
          </p>

          <CodeBlock
            language="java"
            filename="src/main/java/frc/robot/subsystems/Arm.java"
            title="Constants and fields"
            code={`// Target positions (rotations, 1.0 = one full turn).
private static final double VERTICAL_POSITION = 0.25; // 90°  - stowed / safe transport
private static final double HORIZONTAL_POSITION = 0.5; // 180° - ground intake

// PID + feedforward gains.
// TODO: CRITICAL - tune on the real robot before driving the arm under power.
// Safe starting values: kG=0.2 (fights gravity), kS=0.2 (overcomes friction),
//                       kP=160 (correction strength), kD=30 (smoothness).
// If the arm jerks or moves too fast, make these smaller.
private static final double kG = 0.0; // NEEDS TUNING - gravity feedforward
private static final double kS = 0.0; // NEEDS TUNING - static friction feedforward
private static final double kP = 0.0; // NEEDS TUNING - proportional gain
private static final double kD = 0.0; // NEEDS TUNING - derivative gain

private final CANBus canivore = new CANBus("canivore");
private final TalonFX motor = new TalonFX(31, canivore);
private final CANcoder encoder = new CANcoder(32, canivore);

// Asks the motor's PID to move the arm to a target angle and hold it.
private final PositionVoltage positionOut = new PositionVoltage(0);`}
          />

          <Split>
            <ProseBlock>
              <p>
                Those four zeros are not a typo. The branch ships{" "}
                <code>kG</code>, <code>kS</code>, <code>kP</code> and{" "}
                <code>kD</code> at <code>0.0</code>, each marked{" "}
                <code>NEEDS TUNING</code>. Deploy this and the arm will not move
                — every term multiplies out to zero volts. That is the correct
                starting state, and finding the four real numbers is the second
                half of this page.
              </p>
            </ProseBlock>
            <MarginNote label="NOT AN ANSWER KEY">
              The <code>0.2 / 0.2 / 160 / 30</code> in the TODO are the
              file&apos;s own suggested starting points, not measured values for
              your arm. Treat them as a sanity check on the numbers you find,
              not as an answer to copy.
            </MarginNote>
          </Split>

          <CodeBlock
            language="java"
            filename="src/main/java/frc/robot/subsystems/Arm.java"
            title="The constructor"
            code={`public Arm() {
  TalonFXConfiguration config = new TalonFXConfiguration();
  config.MotorOutput.NeutralMode = NeutralModeValue.Coast; // easy to move by hand
  config.MotorOutput.Inverted = InvertedValue.CounterClockwise_Positive;
  config.Slot0.GravityType = GravityTypeValue.Arm_Cosine; // fights gravity automatically
  config.Slot0.StaticFeedforwardSign = StaticFeedforwardSignValue.UseClosedLoopSign;

  config.Slot0.kG = kG;
  config.Slot0.kS = kS;
  config.Slot0.kP = kP;
  config.Slot0.kD = kD;

  // Use the CANcoder for position, so PID works on the arm's real angle.
  config.Feedback.withRemoteCANcoder(encoder);

  TalonFXUtil.applyConfigWithRetries(motor, config);
}`}
          />

          <CodeBlock
            language="java"
            filename="src/main/java/frc/robot/subsystems/Arm.java"
            title="The two commands and the private setter"
            code={`/** Move to the vertical (stowed) position and hold it. Never finishes. */
public Command vertical() {
  return runRepeatedly(() -> setPosition(VERTICAL_POSITION)).named("vertical (hold)");
}

/** Move to the horizontal (ground intake) position and hold it. Never finishes. */
public Command horizontal() {
  return runRepeatedly(() -> setPosition(HORIZONTAL_POSITION)).named("horizontal (hold)");
}

private void setPosition(double rotations) {
  motor.setControl(positionOut.withPosition(rotations));
}`}
          />

          <p>
            The shape is identical to <code>2-Commands</code>: a private setter,
            two <code>runRepeatedly</code> factories, a <code>(hold)</code> in
            each name. Only the request type changed. And these are still holds
            — <code>runRepeatedly</code> re-sends the position request every
            loop, which is also what restores it if a motor controller reboots
            mid-match.
          </p>

          <p>
            <strong>{"You should see: "}</strong> the project compiles. Deploy
            it and press the left trigger and nothing moves. Correct — all four
            gains are zero.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col gap-4">
          <h3 className="display measure m-0 text-title">
            2. Swap the flywheel from <code>VoltageOut</code> to{" "}
            <code>VelocityVoltage</code>
          </h3>

          <p>
            Same substitution, different quantity. The flywheel targets a speed
            in rotations per second, and it keeps that speed when a game piece
            drags on the wheel — which a fixed voltage cannot do.
          </p>

          <CodeBlock
            language="java"
            filename="src/main/java/frc/robot/subsystems/Flywheel.java"
            title="Speeds, gains, and the velocity request"
            code={`// Shooting speeds (rotations per second).
private static final double SLOW_SPEED_RPS = 25.0;
private static final double FAST_SPEED_RPS = 75.0;

// PID + feedforward gains.
private static final double kS = 0.0; // overcomes friction
private static final double kV = 0.125; // volts per rotation-per-second
private static final double kP = 0.0; // correction strength

// Asks the motor's PID to hold a target speed.
private final VelocityVoltage velocityOut = new VelocityVoltage(0);

private void setVelocity(double rps) {
  leader.setControl(velocityOut.withVelocity(RotationsPerSecond.of(rps)));
}`}
          />

          <p>
            <code>withVelocity(...)</code> takes a WPILib unit type, the same
            way <code>.withTimeout(...)</code> takes a <code>Time</code>, so the
            file converts the plain <code>double</code> at the last moment. Like{" "}
            <code>Seconds</code> above, that needs a static import at the top:{" "}
            <code>
              import static org.wpilib.units.Units.RotationsPerSecond;
            </code>
            .
          </p>

          <p>
            The leader/follower pair is untouched — CAN 22 still mirrors CAN 21
            with <code>MotorAlignmentValue.Opposed</code>, spinning the opposite
            direction. The config goes to the leader. The follower is never
            configured in code; it copies the leader&apos;s output over the CAN
            bus.
          </p>

          <p>
            <strong>{"You should see: "}</strong> press A and the flywheel spins
            up and holds a roughly steady speed. That is <code>kV</code> doing
            all the work by itself — 0.125 volts per rotation-per-second times a
            75 rps request is about 9.4 volts, sent before any error exists.
            With <code>kP</code> at zero, nothing corrects whatever that misses
            by.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col gap-4">
          <h3 className="display measure m-0 text-title">
            3. Bind the two arm targets and the two flywheel speeds
          </h3>

          <p>
            Here is what the branch actually ships. It was written before the
            chaining lesson, so it still uses the <code>onTrue</code> /{" "}
            <code>onFalse</code> pairs from <strong>Triggers</strong>, and it
            never binds <code>arm.horizontal()</code> at all:
          </p>

          <CodeBlock
            language="java"
            filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
            title="3-PID, verbatim"
            code={`// Hold the left trigger to drive the arm to its vertical position (and hold it there).
driver.leftTrigger().onTrue(arm.vertical());

// Right trigger: spin fast while held, drop back to the slow hold speed when released.
driver.rightTrigger().onTrue(flywheel.runFast()).onFalse(flywheel.runSlow());

// A: spin fast while held, stop when released.
driver.a().onTrue(flywheel.runFast()).onFalse(flywheel.stop());`}
          />

          <Split>
            <ProseBlock>
              <p>
                Use this version instead. Three things change. The{" "}
                <code>onTrue</code> / <code>onFalse</code> pairs become{" "}
                <code>whileTrue</code> / <code>whileFalse</code>, the dialect
                from Chaining Commands. B picks up <code>arm.horizontal()</code>
                , because you need two places to send the arm before you can
                tune anything. And the right trigger drops to the slow flywheel
                speed instead of the fast one, so both speeds are reachable when
                you tune kV.
              </p>
            </ProseBlock>
            <MarginNote label="ONE HONEST DIFFERENCE">
              With <code>onTrue</code> the command stays scheduled after you let
              go, so <code>runRepeatedly</code> keeps re-sending the position
              request forever. With <code>whileTrue</code>, releasing cancels
              the command and the re-sending stops — but Phoenix is still
              holding the last request it got, so the arm still holds its angle.
              It does not go limp either way. That is why the arm needs no{" "}
              <code>whileFalse</code> partner and the flywheel does.
            </MarginNote>
          </Split>

          <CodeBlock
            language="java"
            filename="src/main/java/frc/robot/opmodes/TeleopOpMode.java"
            title="The same three buttons, chaining dialect, plus B"
            code={`// Hold the left trigger: drive the arm to vertical and hold there.
driver.leftTrigger().whileTrue(arm.vertical());

// Hold B: drive the arm to horizontal instead. B is unbound on this branch.
driver.b().whileTrue(arm.horizontal());

// Hold the right trigger: spin the flywheel at the slow speed (25 rps).
driver.rightTrigger().whileTrue(flywheel.runSlow()).whileFalse(flywheel.stop());

// Hold A: spin the flywheel fast (75 rps).
driver.a().whileTrue(flywheel.runFast()).whileFalse(flywheel.stop());`}
          />

          <Box
            variant="alert-warning"
            tag="WATCH OUT"
            title="One flywheel button at a time"
          >
            <p>
              Both flywheel buttons end in{" "}
              <code>whileFalse(flywheel.stop())</code>, and both{" "}
              <code>stop()</code> and <code>runFast()</code> need the same
              mechanism. Release the right trigger while you are still holding A
              and the <code>stop()</code> that release schedules takes the
              flywheel away from <code>runFast()</code> — the wheel winds down
              even though A is still down. Press one, release it, then press the
              other.
            </p>
          </Box>

          <p>
            <strong>{"You should see: "}</strong> the flywheel responds to A and
            to the right trigger, and the arm does nothing at all. Two buttons
            that command two angles and produce zero motion is precisely where
            the tuning procedure starts.
          </p>
        </div>
      </LessonSection>

      {/* ── TUNING ───────────────────────────────────────────────────── */}
      {/* The ids below are link targets. Other pages deep-link to
          #tuning, #tune-kg, #tune-ks, #tune-kp, #tune-kd and #tune-flywheel
          instead of restating the procedure — do not rename them. */}
      <LessonSection
        id="tuning-finding-the-four-numbers"
        title="Tuning: finding the four numbers"
      >
        <p>
          Nobody can give you these gains. They depend on your arm&apos;s mass,
          its length, its gear ratio, how much friction is in the gearbox, and
          how the CANcoder is mounted. Change the arm and the numbers change.
          What can be handed to you is the <strong>order</strong>, and the order
          matters: each gain is measured with the ones below it still at zero,
          so a gain measured out of order is measuring the wrong thing.
        </p>

        <Box
          variant="alert-danger"
          tag="SAFETY"
          title="Read this before you power the arm"
        >
          <ul className="ml-4 list-disc space-y-1">
            <li>
              This arm is configured <code>NeutralModeValue.Coast</code>. When
              the robot is disabled it will swing down under its own weight.
              Support it, or work with it low.
            </li>
            <li>
              Keep a hand on the driver station and know where Disable is before
              you press anything.
            </li>
            <li>
              Change <strong>one</strong> number per deploy. Two changes at once
              and you cannot tell which one did what.
            </li>
            <li>
              Approach every gain from below. Halve it and try again the moment
              the arm does something you did not expect.
            </li>
          </ul>
        </Box>

        <p>
          The four numbers live as <code>private static final double</code>{" "}
          constants at the top of <code>Arm.java</code>. Each attempt is: edit
          the constant, save, redeploy, test. That loop is slow, which is the
          real reason to change one thing at a time.
        </p>

        {/* Step 0 */}
        <div className="flex flex-col gap-3">
          <h3 id="tune-zero" className="display measure m-0 text-title">
            Step 0 — start from all zeros
          </h3>
          <p>The branch already is. Deploy, enable, hold the left trigger.</p>
          <p>
            <strong>{"You should see: "}</strong> nothing. Not a twitch. Every
            term is multiplied by zero, so the motor is being sent 0 volts. If
            the arm moves here, something else is commanding that motor and you
            need to find it before you tune anything.
          </p>
        </div>

        {/* Step 1 kG */}
        <div className="flex flex-col gap-3">
          <h3 id="tune-kg" className="display measure m-0 text-title">
            Step 1 — kG, by measuring it in Tuner X
          </h3>
          <p>
            kG is the output needed to hold the arm horizontally forward. That
            is a thing you can go and measure directly, with no PID involved at
            all.
          </p>
          <ol className="ml-5 list-decimal space-y-2">
            <li>
              Open the arm motor in Phoenix Tuner X and set the control
              drop-down to <strong>Voltage Out</strong>, the same way Hardware
              Setup showed.
            </li>
            <li>
              Hold the arm horizontal and forward — parallel to the ground, the
              position that reads 0 on the CANcoder.
            </li>
            <li>
              Enable, then raise the voltage from 0 in small increments, letting
              go of the arm at each one.
            </li>
            <li>
              Stop at the voltage where the arm neither sags nor climbs. It
              hangs there, holding itself. Write that voltage down.
            </li>
          </ol>
          <p>
            <strong>That voltage is kG.</strong> It works out that cleanly
            because the cosine at horizontal is exactly 1, so the gravity term
            at that position <em>is</em> kG. Put it in the file and redeploy.
          </p>
          <p>
            <strong>{"You should see: "}</strong> hold the left trigger so the
            closed loop is running. With kP still at zero the arm will not
            travel anywhere — but it stops falling. Lift it by hand, let go, and
            it stays roughly where you left it, at any angle. That is the cosine
            working.
          </p>
          <p>
            <strong>Too low:</strong> the arm still sags, worst near horizontal.{" "}
            <strong>Too high:</strong> the arm creeps upward on its own. On a
            counterbalanced arm kG can legitimately be negative; Phoenix accepts
            values down to −128. The file suggests 0.2 for this arm — if your
            measurement is nowhere near that, re-check that the CANcoder zero is
            really horizontal before trusting either number.
          </p>
        </div>

        {/* Step 2 kS */}
        <div className="flex flex-col gap-3">
          <h3 id="tune-ks" className="display measure m-0 text-title">
            Step 2 — kS, the smallest push that breaks friction
          </h3>
          <p>
            Measure this one in Tuner X too, but with the arm{" "}
            <strong>vertical</strong> — straight up, 0.25 rotations. The cosine
            there is 0, so gravity is neither helping nor hindering, and
            anything that moves the arm is fighting friction alone. Vertical is
            a balance point, so steady the arm with a hand before you start
            raising the voltage.
          </p>
          <p>
            Raise Voltage Out from 0 until the arm first starts to creep, then
            back off to the last value where it did not move. That is kS.
            CTRE&apos;s own instruction for this step reads: &quot;Increase kS
            until just before the motor moves.&quot;
          </p>
          <p>
            <strong>{"You should see: "}</strong> back in the robot code, no
            visible change at all. kS is small and the arm is still not being
            driven anywhere. That is expected.
          </p>
          <p>
            <strong>Too high:</strong> once kP is in, the arm buzzes or shivers
            when it is sitting on target. That is the dithering CTRE warns about
            with <code>UseClosedLoopSign</code> — the sign of kS flips back and
            forth as the tiny error flips back and forth. If you see it, kS is
            the first suspect, not kP. The file suggests 0.2.
          </p>
        </div>

        {/* Step 3 kP */}
        <div className="flex flex-col gap-3">
          <h3 id="tune-kp" className="display measure m-0 text-title">
            Step 3 — kP, until it oscillates, then back off
          </h3>
          <p>
            Now the buttons start doing something. Put the arm somewhere away
            from vertical, hold the left trigger, and watch it try to get to
            0.25 rotations.
          </p>
          <ol className="ml-5 list-decimal space-y-2">
            <li>
              Start kP small — small enough that the arm barely drifts toward
              the target — and roughly double it each redeploy.
            </li>
            <li>
              Keep going until the arm reaches the target and then{" "}
              <em>oscillates around it</em>: overshoot, come back, overshoot the
              other way.
            </li>
            <li>
              Back off from there until the oscillation stops. Whatever
              overshoot is left is kD&apos;s job, not kP&apos;s.
            </li>
          </ol>
          <p>
            <strong>{"You should see: "}</strong> holding the left trigger
            drives the arm to vertical; holding B drives it to horizontal;
            releasing leaves it parked wherever it was last commanded.
          </p>
          <Split>
            <ProseBlock>
              <p>
                <strong>Too low:</strong> the arm creeps toward the target and
                stops short, sitting at a permanent small offset. (That leftover
                gap is what kI would erase — resist. kG and kS are the right fix
                for it on an arm.) <strong>Too high:</strong> the arm slams into
                the target and bounces, or hums continuously.
              </p>
            </ProseBlock>
            <MarginNote label="WHY 160 IS NOT ABSURD">
              kP is volts per <em>{"rotation "}</em> of error, and the arm turns
              in fractions of a rotation. At the file&apos;s suggested 160, an
              error of 0.075 rotations — 27° — already asks for the full 12
              volts. The flywheel&apos;s kP will look tiny by comparison because
              its error is measured in rotations <em>per second</em>, and a
              flywheel misses by whole rotations per second routinely. Different
              units, not different physics.
            </MarginNote>
          </Split>
        </div>

        {/* Step 4 kD */}
        <div className="flex flex-col gap-3">
          <h3 id="tune-kd" className="display measure m-0 text-title">
            Step 4 — kD, as much as you can get without jitter
          </h3>
          <p>
            kD pushes back against fast changes in error, so it damps the
            overshoot kP leaves behind. Raise it as far as it will go before the
            motor starts jittering — CTRE&apos;s wording is &quot;as much as
            possible without introducing jittering to the response.&quot;
          </p>
          <p>
            <strong>{"You should see: "}</strong> the arm arrives at the target
            and settles, instead of arriving and bouncing.
          </p>
          <p>
            <strong>Too low:</strong> the bounce is still there.{" "}
            <strong>Too high:</strong> the motor gets audibly rough and the arm
            feels sticky leaving a stop, because kD is fighting the very motion
            you asked for. The file suggests 30.
          </p>
        </div>

        {/* Step 5 kI */}
        <div className="flex flex-col gap-3">
          <h3 id="tune-ki" className="display measure m-0 text-title">
            Step 5 — kI: leave it alone
          </h3>
          <p>
            <code>Arm.java</code> never mentions kI. Phoenix&apos;s default is
            0, and 0 is where it stays. An integral term accumulates every
            fraction of error the loop has ever seen, which on a mechanism that
            can be blocked or held turns into a stored-up shove that arrives
            later. The steady offset it exists to fix is the one kG and kS have
            already removed on this arm.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="display measure m-0 text-title">When to stop</h3>
          <Split>
            <ProseBlock>
              <p>
                The arm goes where you send it, does not bounce past the target
                more than once, and sits still when it arrives — no buzz, no
                creep, no noise from the motor. That is tuned. There is no score
                to maximize, and a mechanism that behaves the same way every
                time beats one that is 2% faster and occasionally surprising.
              </p>
            </ProseBlock>
            <MarginNote label="KEEP THE NUMBERS">
              Write the four down somewhere outside the code as well. You will
              re-tune after any mechanical change, and having last season&apos;s
              starting point saves a session.
            </MarginNote>
          </Split>
        </div>

        {/* Flywheel tuning */}
        <div className="flex flex-col gap-3">
          <h3 id="tune-flywheel" className="display measure m-0 text-title">
            The flywheel is a different order: kV first
          </h3>
          <p>
            A velocity loop has something a position loop does not — a
            feedforward that can do nearly the whole job on its own. So the
            order changes.
          </p>
          <ol className="ml-5 list-decimal space-y-2">
            <li>
              <strong>kV.</strong> With kS and kP at zero, hold the right
              trigger for the slow speed and compare the velocity Tuner X
              reports for the leader against the <code>25.0</code> you asked
              for. Raise kV if the wheel runs slow, lower it if it runs fast,
              until the measured speed lands on the requested speed. The branch
              already ships <code>kV = 0.125</code>, which is the whole reason
              the flywheel does something on this branch and the arm does not.
            </li>
            <li>
              <strong>kS.</strong> Raise it until the wheel breaks away from a
              dead stop reliably, and no further.
            </li>
            <li>
              <strong>kP.</strong> Raise it until the wheel recovers quickly
              after you load it, and back off before it starts hunting above and
              below the target speed.
            </li>
          </ol>
          <p>
            <code>Flywheel.java</code> sets only kS, kV and kP — there is no kD
            line in the file, and no gravity type. Two of the three ship at 0.0.
          </p>
        </div>

        {/* `concept`, not `alert-info`: this is the panel a student scrolls
            back to mid-tune, which is what the framed variant is for. An
            alert label here would have been the page's fifth. */}
        <Box
          variant="concept"
          tag="THE GENERAL RECIPE"
          title="CTRE's manual tuning order, in one list"
        >
          <ol className="ml-4 list-decimal space-y-1">
            <li>Set all gains to zero.</li>
            <li>Determine kG, if it is an arm or an elevator.</li>
            <li>Pick the right static feedforward sign for your loop type.</li>
            <li>Increase kS to the point right before the motor moves.</li>
            <li>
              If you are commanding velocity, increase kV until the measured
              velocity matches the requested velocity.
            </li>
            <li>
              Increase kP until the output oscillates around the setpoint.
            </li>
            <li>
              Increase kD as much as possible without introducing jittering.
            </li>
          </ol>
          <p className="mt-3">
            That is CTRE&apos;s process, not a workshop invention. Everything
            above is that list applied to this specific arm and this specific
            flywheel.
          </p>
        </Box>

        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/closed-loop-requests.html"
          title="CTRE — Closed-Loop Requests, Gravity Feedforward and Static Feedforward Sign"
          icon={<Book className="w-5 h-5" />}
        />

        <div className="flex flex-col gap-4">
          <h3 className="display measure m-0 text-title">
            Watch someone do it
          </h3>
          <p>
            The team&apos;s own walkthrough of the same procedure, on hardware:
          </p>
          <div className="aspect-video overflow-hidden rounded-lg">
            <iframe
              src="https://www.youtube.com/embed/Pt7SBFfl3oM"
              title="Tuning Feedback (PID) and Feedforward"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </div>
      </LessonSection>

      {/* ── did it work ──────────────────────────────────────────────── */}
      <LessonSection id="did-it-work" title="Did it work?">
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Deploy with all four gains at <code>0.0</code> and hold the left
            trigger. <strong>{"You should see: "}</strong> no motion at all.
          </li>
          <li>
            Put your measured kG in and redeploy. Hold the left trigger, then
            lift the arm by hand to horizontal and let go.{" "}
            <strong>{"You should see: "}</strong> it holds itself up instead of
            falling.
          </li>
          <li>
            Add kS and redeploy. <strong>{"You should see: "}</strong> no
            visible change. If the arm buzzes at rest later on, come back and
            halve this.
          </li>
          <li>
            Add kP and redeploy. Hold the left trigger.{" "}
            <strong>{"You should see: "}</strong> the arm actually travels to
            vertical.
          </li>
          <li>
            Add kD and redeploy. <strong>{"You should see: "}</strong> the arm
            arrives and settles instead of bouncing.
          </li>
          <li>
            Hold B. <strong>{"You should see: "}</strong> the arm swings to
            horizontal. Release. <strong>{"You should see: "}</strong> it stays
            there — it does not go limp, because Phoenix is still holding the
            last position request.
          </li>
          <li>
            Hold A. <strong>{"You should see: "}</strong> the flywheel spins up
            and holds a steady speed. Release and it stops, because{" "}
            <code>whileFalse(flywheel.stop())</code> takes over.
          </li>
          <li>
            Let A go, then hold the right trigger.{" "}
            <strong>{"You should see: "}</strong> the same wheel running
            noticeably slower — <code>25.0</code> rotations per second instead
            of <code>75.0</code>. That is the speed you compare against in Tuner
            X when you tune kV.
          </li>
          <li>
            Re-point your chaining routine to <code>arm.vertical()</code> and
            hold Y. <strong>{"You should see: "}</strong> the arm drives to
            vertical for one second, <em>then</em> the flywheel starts.
          </li>
        </ol>

        <Box
          variant="alert-warning"
          tag="IF IT DIDN'T WORK"
          title="Dead arm, buzzing arm, runaway arm, sagging arm"
        >
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>Nothing moves, whatever you press.</strong> The gains are
              still zero — that is the branch default and it is the single most
              common cause. If they are not zero, check the CANcoder: the loop
              runs on <code>withRemoteCANcoder(encoder)</code>, so a CANcoder
              missing from the bus is a control loop with no measurement. Both
              device 31 and device 32 should be green in Tuner X.
            </li>
            <li>
              <strong>
                The arm slams to the target and buzzes when it gets there.
              </strong>{" "}
              If it buzzes while <em>moving</em>, halve kP. If it buzzes while
              sitting <em>still on target</em>, that is kS — the sign is
              flipping with the error, exactly as CTRE warns for{" "}
              <code>UseClosedLoopSign</code>. Halve kS.
            </li>
            <li>
              <strong>
                The arm takes off toward a hard stop the instant you press a
                button.
              </strong>{" "}
              Disable immediately. The CANcoder counts the opposite way to the
              motor, so error grows instead of shrinking and PID pushes harder.
              Re-check encoder direction the way Mechanism Setup describes, and
              check <code>InvertedValue.CounterClockwise_Positive</code> against
              how your gearbox is built.
            </li>
            <li>
              <strong>
                The arm holds fine near vertical and sags near horizontal.
              </strong>{" "}
              The cosine is being computed from the wrong zero. Re-zero the
              CANcoder with the arm horizontal and pointing forward, then
              measure kG again — kG is only meaningful relative to that zero.
            </li>
          </ul>
        </Box>
      </LessonSection>

      {/* ── the reference implementation ─────────────────────────────── */}
      <section className="flex flex-col gap-8">
        <CollapsibleSection title="The whole Slot0 block in one place">
          <CodeBlock
            language="java"
            filename="src/main/java/frc/robot/subsystems/Arm.java"
            title="Everything this lesson adds to the config"
            code={`// Behavior switches - set once, not tuned.
config.Slot0.GravityType = GravityTypeValue.Arm_Cosine;
config.Slot0.StaticFeedforwardSign = StaticFeedforwardSignValue.UseClosedLoopSign;

// The four numbers you measure. All 0.0 on the branch.
config.Slot0.kG = kG; // volts, at horizontal
config.Slot0.kS = kS; // volts, to break friction
config.Slot0.kP = kP; // volts per rotation of error
config.Slot0.kD = kD; // volts per rotation-per-second of error change

// kI is never set. Phoenix's default is 0 and this arm does not need it.

// The loop measures the arm, not the rotor.
config.Feedback.withRemoteCANcoder(encoder);`}
          />
        </CollapsibleSection>

        <MechanismTabs
          sectionTitle="Workshop Implementation: PID Control"
          armContent={{
            beforeItems: [
              "• runSlow() and runFast() push 3 V and 6 V at the motor",
              "• Where the arm ends up depends on gravity and friction",
              "• The CANcoder is in the config, but no control loop reads it",
              "• arm.stop() exists, because a voltage hold keeps pushing",
            ],
            afterItems: [
              "• PositionVoltage: the target is an angle, and the motor picks the voltage",
              "• vertical() = 0.25 rotations (90°), horizontal() = 0.5 rotations (180°)",
              "• GravityTypeValue.Arm_Cosine scales kG by the arm's angle",
              "• All four arm gains ship as 0.0, each marked NEEDS TUNING",
              "• arm.stop() is deleted — a canceled position hold stays parked",
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Arm.java",
            branch: "3-PID",
            pullRequestNumber: 3,
            focusFile: "Arm.java",
            walkthrough: {
              leftTitle: "What changed in Arm.java",
              leftItems: [
                "• <strong>PositionVoltage:</strong> replaces VoltageOut — carries a target angle, not a voltage",
                "• <strong>private setPosition(double rotations):</strong> the only route in is vertical() or horizontal()",
                "• <strong>Arm_Cosine:</strong> kG is scaled by the cosine of the angle from horizontal",
                "• <strong>UseClosedLoopSign:</strong> kS takes its sign from position error, since there is no velocity setpoint",
                "• <strong>withRemoteCANcoder(encoder):</strong> the loop runs on the arm's real angle",
              ],
              rightTitle: "Gains the branch actually ships",
              rightItems: [
                "• <strong>kG = 0.0</strong> — NEEDS TUNING · volts, measured at horizontal",
                "• <strong>kS = 0.0</strong> — NEEDS TUNING · volts, to break friction",
                "• <strong>kP = 0.0</strong> — NEEDS TUNING · volts per rotation of error",
                "• <strong>kD = 0.0</strong> — NEEDS TUNING · volts per rotation-per-second",
                "• <strong>kI</strong> — not set anywhere in the file",
                "• The file's TODO suggests kG 0.2, kS 0.2, kP 160, kD 30 as <em>starting points</em>, not tuned values",
              ],
            },
            nextStepText:
              "Every arm gain is a zero until you measure it on your own arm. Work the procedure above, then go on to Motion Magic, which keeps these same gains and adds a speed ramp so the arm stops lunging at its target.",
          }}
          flywheelContent={{
            beforeItems: [
              "• runSlow() and runFast() push 3 V and 6 V at the leader",
              "• A game piece drags on the wheel and nothing pushes back",
              "• The speed you get depends on how charged the battery is",
            ],
            afterItems: [
              "• VelocityVoltage: the target is a speed in rotations per second",
              "• SLOW_SPEED_RPS = 25.0, FAST_SPEED_RPS = 75.0",
              "• kV = 0.125 — the one gain on this branch with a real value",
              "• kS and kP ship at 0.0",
              "• stop() stays, because a spinning wheel does not stop on its own",
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Flywheel.java",
            branch: "3-PID",
            pullRequestNumber: 3,
            focusFile: "Flywheel.java",
            walkthrough: {
              leftTitle: "What changed in Flywheel.java",
              leftItems: [
                "• <strong>VelocityVoltage:</strong> replaces VoltageOut — carries a target speed",
                "• <strong>private setVelocity(double rps):</strong> wraps the double in RotationsPerSecond.of(rps)",
                "• <strong>No gravity type:</strong> gravity does not slow a spinning wheel",
                "• <strong>Follower untouched:</strong> CAN 22 still mirrors CAN 21 with MotorAlignmentValue.Opposed",
              ],
              rightTitle: "Gains the branch actually ships",
              rightItems: [
                "• <strong>kV = 0.125</strong> — volts per rotation-per-second, a real set value",
                "• <strong>kS = 0.0</strong> — volts, to overcome friction",
                "• <strong>kP = 0.0</strong> — volts per rotation-per-second of error",
                "• <strong>kD</strong> — the file does not set it at all",
                "• With kV alone the wheel gets close to speed, and nothing corrects the rest",
              ],
            },
            nextStepText:
              "kV alone gets the wheel near its target speed and corrects nothing when it misses. Add kS, then kP, and the wheel recovers its speed after every shot instead of drifting down.",
          }}
        />
      </section>

      {/* ── what's next ──────────────────────────────────────────────── */}
      <LessonSection id="what-comes-next" title="What's next">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Motion Magic</strong> keeps every gain you measured here and
            adds a speed limit and a ramp on top, so the arm eases into its
            target instead of lunging at it. It also drops the{" "}
            <code>StaticFeedforwardSign</code> line, because a profile hands the
            loop a velocity setpoint and the default sign rule becomes correct
            again.
          </li>
          <li>
            <strong>{"Finish Lines "}</strong> is where the arm learns to answer
            &quot;am I there yet?&quot; Right now nothing in your code can ask.
            That is why your chaining routine still guesses with{" "}
            <code>.withTimeout(Seconds.of(1.0))</code>, and it is the last thing
            standing between you and <code>.until(arm::isAtTarget)</code>.
          </li>
        </ul>
      </LessonSection>

      <AlphaStatusNote />

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You check out 3-PID, deploy it without changing anything, and hold the left trigger. What happens to the arm?",
            options: [
              "It drives to 0.25 rotations and holds there",
              "Nothing — kG, kS, kP and kD all ship as 0.0, so every term is zero volts",
              "It drifts slowly upward from the gravity feedforward",
              "It pushes 6 volts, the same as the previous branch",
            ],
            correctAnswer: 1,
            explanation:
              "3-PID ships kG = 0.0, kS = 0.0, kP = 0.0 and kD = 0.0, each marked NEEDS TUNING. Multiply anything by zero and you get zero volts. That is the intended starting state: the branch gives you the structure, and you measure the four numbers on your own arm.",
          },
          {
            id: 2,
            question:
              "config.Slot0.GravityType = GravityTypeValue.Arm_Cosine. Where must the sensor read zero for that to work?",
            options: [
              "Wherever the arm rests when the robot is disabled",
              "Straight up, so the gravity term is zero at the stowed position",
              "With the arm horizontal and pointing forward, parallel to the ground",
              "It does not matter — Phoenix calibrates the offset on boot",
            ],
            correctAnswer: 2,
            explanation:
              "CTRE's wording is that the sensor offset must be configured such that a position of 0 represents the arm being held horizontally forward. Forward is the part people drop: the arm is horizontal in two places, and only the forward one is the zero. On this branch the backward horizontal is 0.5 rotations — a target, not the zero. Offset it anywhere else and the gravity term is scaled by the cosine of the wrong angle at every position.",
          },
          {
            id: 3,
            question: "What is the correct order to tune the arm's four gains?",
            options: [
              "kP, then kI, then kD, then the feedforwards",
              "kG, then kS, then kP, then kD",
              "All four together, raising them in proportion",
              "kD first for safety, then kP, then kG and kS",
            ],
            correctAnswer: 1,
            explanation:
              "CTRE's manual tuning process is: all gains to zero, find kG, pick the static feedforward sign, raise kS to the point right before the motor moves, raise kP until it oscillates, then raise kD as far as you can without jitter. Each gain is measured with the ones after it still at zero, so out of order you are measuring the wrong thing.",
          },
          {
            id: 4,
            question:
              "Your arm reaches its target and then sits there buzzing, even though it is not moving. Which gain do you suspect first?",
            options: [
              "kP — the correction is too strong",
              "kD — it is fighting the motion",
              "kS — with UseClosedLoopSign its sign flips as the tiny error flips",
              "kG — it is over-holding against gravity",
            ],
            correctAnswer: 2,
            explanation:
              "This branch sets StaticFeedforwardSign to UseClosedLoopSign, so kS takes its sign from the position error. Near the target that error keeps crossing zero, so a kS that is too large flips direction repeatedly and the output dithers. CTRE warns about exactly this. Halve kS. A buzz while the arm is still moving is a kP problem instead.",
          },
          {
            id: 5,
            question:
              "Which gain on branch 3-PID is a real, set value rather than a placeholder zero?",
            options: [
              "The arm's kP, at 160",
              "The arm's kG, at 0.2",
              "The flywheel's kV, at 0.125 volts per rotation-per-second",
              "The arm's kD, at 30",
            ],
            correctAnswer: 2,
            explanation:
              "Flywheel.java ships kV = 0.125 with the comment 'volts per rotation-per-second'. Its kS and kP are 0.0, and every arm gain is 0.0. The 0.2 / 0.2 / 160 / 30 figures are suggestions written in Arm.java's TODO comment, not values the branch applies.",
          },
          {
            id: 6,
            question:
              "3-PID deletes arm.stop() but keeps flywheel.stop(). Why?",
            options: [
              "The arm has a brake mode and the flywheel does not",
              "Canceling a command leaves Phoenix holding the last request — for the arm that means parking at its target, for the flywheel it means spinning forever",
              "The arm's idle() default command zeroes the motor output",
              "It is an oversight on the branch",
            ],
            correctAnswer: 1,
            explanation:
              "An unclaimed mechanism runs idle(), which sends no output and does not cancel the last request Phoenix received. The arm's last request is 'hold this angle', so it parks — harmless, and stop() is redundant. The flywheel's last request is 'hold 75 rotations per second', so it keeps spinning until something replaces that request. Both mechanisms are Coast, so brake mode is not the difference.",
          },
        ]}
      />
    </PageTemplate>
  );
}
