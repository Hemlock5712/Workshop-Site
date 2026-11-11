import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { Book } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/swerve-drive-tuning");

/**
 * Everything you tune in the generated `TunerConstants.java` after exporting
 * it. Owner's review, November 2026 (Recording 11): `/swerve-calibration` was
 * deleted and its steer-gain section moved here as the first step. Its module
 * zeroing and "three kinds of zeroing" went with it: the generator's own
 * encoder calibration sets the offsets, and seedFieldCentric is explained on
 * `/swerve-drive-project`. `/swerve-calibration` 308s here.
 *
 * Order: steer gains, then wheel radius (low priority, only if the wheels
 * differ from what the generator was told), then top speed and slip current,
 * then the drive gains and the switch from `OpenLoopVoltage` to `Velocity`.
 * The owner wanted the voltage default stated plainly: CTRE's generated teleop
 * request is open loop, and nothing on the drive motors is a velocity loop
 * until you change it.
 *
 * Every `TunerConstants` snippet matches `1-Swerve`'s generated file. The
 * gains shown are the generator's defaults, not ours. 1-Swerve publishes
 * Drivetrain/* through Telemetry but never starts DataLogManager, so every
 * measurement here is read off a live AdvantageScope plot.
 */
export default function SwerveDriveTuning() {
  return (
    <PageTemplate
      title="Swerve Drive Tuning"
      lede="The generator gave you a TunerConstants.java with guessed gains and measurements. This lesson tunes the steer motors, checks the wheel radius, measures top speed and slip current, then closes the drive loop."
      needs={[
        <>
          A swerve robot you can drive, from{" "}
          <strong>Swerve Project Generator</strong>.
        </>,
        <>AdvantageScope connected to the robot, for live plots.</>,
        <>Phoenix Tuner X, and six meters of clear carpet.</>,
        <>A tape measure, and a wall you may push against.</>,
      ]}
      time="12 minutes"
    >
      <LessonSection id="steer-gains" title="Tune the steer gains">
        <p>
          A steering motor holds an angle. That is a position loop with no
          gravity to fight, so skip kG and start at kS. The generator gave you
          real numbers. Adjust them rather than starting from zero.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/generated/TunerConstants.java"
          code={`private static final Slot0Configs steerGains =
    new Slot0Configs()
        .withKP(100)
        .withKI(0)
        .withKD(0.5)
        .withKS(0.1)
        .withKV(1.91)
        .withKA(0)
        .withStaticFeedforwardSign(StaticFeedforwardSignValue.UseClosedLoopSign);`}
        />
        <p>
          Follow{" "}
          <a
            href="/pid-control#feedforward-first"
            className="font-semibold underline decoration-1 underline-offset-2"
            style={{ color: "var(--accent)" }}
          >
            the order from the PID page
          </a>
          . kS is the smallest output that breaks the module loose. Raise kP
          until it oscillates, then back off. Add kD, as much as you can get
          without jitter. Change one number per test, and redeploy after each.
        </p>
        <p>
          <code>DriveMechanism</code> publishes{" "}
          <code>Drivetrain/ModuleStates</code> and{" "}
          <code>Drivetrain/ModuleTargets</code>. Put the angle from both on one
          AdvantageScope plot and flick the right stick. Tuned looks like two
          traces on top of each other. Untuned lags, overshoots, or buzzes.
        </p>
      </LessonSection>

      <LessonSection id="measure-the-drivetrain" title="Wheel radius">
        <p>
          The generator asked for your wheel size, so if your modules use the
          wheels you told it about, <code>kWheelRadius</code> is already close
          enough. Measure it only if you changed wheels, or if odometry reads
          long or short against a tape measure.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/generated/TunerConstants.java"
          code={`private static final Distance kWheelRadius = Inches.of(2.167);`}
        />
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
                tape 4.80 m, odometry 5.00 m, file 2.167 in: (4.80 / 5.00)
                &times; 2.167 = 2.080 in
              </div>
            </>
          }
        >
          <p className="m-0">
            Run it three times in each direction and average. Put the result in{" "}
            <code>kWheelRadius</code>, redeploy, and repeat until tape and
            odometry agree.
          </p>
        </Box>
      </LessonSection>

      <LessonSection id="top-speed-and-slip" title="Top speed and slip current">
        <p>
          Measure these while the drive request is still open-loop voltage:{" "}
          <code>kSpeedAt12Volts</code> means the speed at 12 volts applied. Use
          six meters of clear floor on the surface you compete on.
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
          Stator current is proportional to torque, so a stator limit caps how
          hard a wheel twists. Set it where the tire loses grip.
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
          the current at the top of the climb, just before the drop. The shipped
          120 A is itself a stator limit. If the trace flattens there and the
          wheel never breaks loose, raise the constant for now and ramp again.
        </p>
        <Box variant="alert-danger" title="Stalled motors get hot fast">
          <p>
            A drive motor pushing a wall it cannot move is a stalled motor. Keep
            each ramp short and back off to zero between attempts. One person on
            the disable, somebody else on the laptop.
          </p>
        </Box>
        <p>Both numbers go in the same file:</p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/generated/TunerConstants.java"
          code={`private static final Current kSlipCurrent = Amps.of(120);

// ...

public static final LinearVelocity kSpeedAt12Volts = MetersPerSecond.of(4.54);`}
        />
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/hardware-reference/talonfx/improving-performance-with-current-limits.html#preventing-wheel-slip"
          title="CTRE: Preventing Wheel Slip with Current Limits"
          icon={<Book className="w-5 h-5" />}
        />
      </LessonSection>

      <LessonSection id="close-the-drive-loop" title="Close the drive loop">
        <p>
          CTRE&apos;s generated teleop request drives with{" "}
          <code>DriveRequestType.OpenLoopVoltage</code>, not velocity. The stick
          position goes straight to volts, and the drive gains below do nothing
          until you switch it.
        </p>
        <p>
          Tune the drive gains first. A drive motor holds a speed, and on a
          velocity loop the feedforward does nearly all of the work.{" "}
          <a
            href="/pid-control#feedforward-first"
            className="font-semibold underline decoration-1 underline-offset-2"
            style={{ color: "var(--accent)" }}
          >
            The order
          </a>{" "}
          is kV, then kS, then kP. Tune on the ground, not on blocks: a wheel in
          the air carries no load.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/generated/TunerConstants.java"
          code={`private static final Slot0Configs driveGains =
    new Slot0Configs().withKP(0.2).withKI(0).withKD(0).withKS(0).withKV(0.124);`}
        />
        <p>
          Then switch the request. Find the{" "}
          <code>SwerveRequest.FieldCentric</code> that the joystick drive
          default command uses, and change its last line. If the robot drives
          worse than it did on volts, go back to the gains.
        </p>
        <CodeBlock
          language="java"
          title="The joystick drive request"
          code={`private final SwerveRequest.FieldCentric drive =
    new SwerveRequest.FieldCentric()
        .withDeadband(maxSpeed * 0.1)
        .withRotationalDeadband(maxAngularRate * 0.1) // ignore the sticks' bottom 10%
        .withDriveRequestType(DriveRequestType.Velocity); // was OpenLoopVoltage`}
          highlightLines={[5]}
        />
        <p>
          The same request throws away the bottom 10% of both sticks. At 4.54
          m/s that is everything under about 0.45 m/s, which a tuned velocity
          loop can hold. Shrink the deadband rather than deleting it, because it
          keeps a worn stick&apos;s drift from creeping the robot across the
          field. Put the robot on blocks, take your hands off the controller,
          and watch the speed component of <code>Drivetrain/ModuleTargets</code>
          . Halve the deadband and redeploy until those targets start twitching,
          then go back one value.
        </p>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Use the surface you compete on. Tape a start mark, restart the code so{" "}
          <code>Drivetrain/Pose</code> reads (0, 0), and drive a square: three
          meters forward, three left, three back, three right.
        </p>
        <Box variant="alert-success" title="You should see">
          <p>
            The robot back on the tape, and <code>Drivetrain/Pose</code> near
            (0, 0). Commanded and measured module angles on top of each other
            through all four corners.
          </p>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "What drive request type does CTRE's generated teleop request use before you edit it?",
            options: [
              "DriveRequestType.Velocity, so the drive gains are active from the start",
              "DriveRequestType.OpenLoopVoltage, and switching it is the last edit on this page",
              "Nothing. Phoenix picks the closed-loop version once the gains are non-zero.",
              "It depends whether you generated the project in Tuner X or downloaded it",
            ],
            correctAnswer: 1,
            explanation:
              "The generated request is open-loop voltage: the stick goes straight to volts and driveGains does nothing. You switch it to Velocity yourself, after the drive gains are tuned. Velocity with untuned gains chases a speed the motor cannot hold, which drives worse than plain voltage.",
          },
          {
            id: 2,
            question:
              "Tape says 4.80 m, odometry says 5.00 m, and kWheelRadius is 2.167 in. What goes in the file?",
            options: [
              "2.167 in, and lower kSlipCurrent, because the wheels must be slipping",
              "2.257 in, from (5.00 / 4.80) × 2.167",
              "2.167 in, and raise kP on driveGains until odometry matches the tape",
              "2.080 in, from (4.80 / 5.00) × 2.167",
            ],
            correctAnswer: 3,
            explanation:
              "newRadius = (actualDistance / reportedDistance) × currentRadius. The robot went less far than it reported, so the radius in the file is too big and goes down. The run is slow so the gap is the radius, not wheel slip.",
          },
          {
            id: 3,
            question:
              "You flick the right stick and plot commanded against measured module angle. What does a tuned steer loop look like?",
            options: [
              "Two traces on top of each other",
              "The measured trace a steady few degrees behind the command",
              "The measured trace overshooting and settling within a second",
              "A flat measured trace, since the module should resist the command",
            ],
            correctAnswer: 0,
            explanation:
              "The steer loop's job is to put the wheel where the drivetrain asked, immediately. Lag, overshoot and buzz are the three ways it falls short. Raise kP until it oscillates and back off, then add kD until just before it jitters.",
          },
          {
            id: 4,
            question:
              "Current climbs while velocity sits at zero, then velocity jumps and current drops. What goes in kSlipCurrent?",
            options: [
              "The stator current after the drop, with the wheel spinning",
              "The velocity at the jump",
              "The stator current at the top of the climb, the instant before the drop",
              "70 A, the supply limit driveInitialConfigs already sets",
            ],
            correctAnswer: 2,
            explanation:
              "While the tire grips, the wheel cannot turn: velocity stays at zero and current keeps climbing with torque. The jump is the tire letting go, and the peak just before it is the slip point.",
          },
          {
            id: 5,
            question:
              "With the drive loop closed, why shrink the 10% deadband instead of deleting it?",
            options: [
              "Below 10% the velocity loop cannot hold a speed anyway",
              "A worn controller's stick drift would creep the robot across the field with nobody touching it",
              "The rotational deadband has to stay larger than the translational one",
              "kSpeedAt12Volts would have to be measured again",
            ],
            correctAnswer: 1,
            explanation:
              "A tuned velocity loop holds speeds under 0.45 m/s, so 10% throws away real control. Zero deadband hands the robot every bit of a worn stick's drift instead.",
          },
        ]}
      />
    </PageTemplate>
  );
}
