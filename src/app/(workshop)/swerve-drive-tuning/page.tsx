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
 * then the drive gains. Owner's call, November 2026: every drive request is
 * `DriveRequestType.Velocity`. CTRE's generator emits `OpenLoopVoltage` for
 * the teleop request; every swerve branch changes it in `Robot.java`, so the
 * page says so once and the student tunes the gains that loop uses.
 *
 * Every `TunerConstants` snippet matches `swerve-project`'s generated file.
 * The gains shown are the generator's defaults, not ours. It publishes
 * Drivetrain/* through Telemetry but never starts DataLogManager, so every
 * measurement here is read off a live AdvantageScope plot.
 *
 * Owner's review, November 2026 (Recording 13): slip current is found with the
 * controller, not Tuner X Voltage Out, and the limit goes slightly below the
 * reading. The wall stays, from CTRE's own procedure: a robot driving freely
 * never loads the tire enough to slip. The deadband is read off the driver
 * station's stick display instead of halved until ModuleTargets twitch.
 * `Inches.of(2.167)` was checked against CTRE's Phoenix6-Examples on `main`
 * and `2027_alpha7`: it is the generator's value, not ours, so it stays.
 *
 * November 2026, the swerve chain rebuild: `1-Swerve` is now `swerve-project`
 * and its packages moved to `first.robot`, so every `filename` changed.
 * `DriveMechanism` was folded into `CommandSwerveDrivetrain`, which is the
 * class that publishes Drivetrain/* now. The snippets were re-read against
 * the new `TunerConstants.java` and none of their lines changed. Two
 * sentences that repeated a neighbour were cut for the budget: the slip
 * current lead-in that restated its own step 3, and a second "surface you
 * compete on".
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
        <>Phoenix Tuner X, the driver station, and six meters of carpet.</>,
        <>A tape measure, and a wall you may push against.</>,
      ]}
      time="14 minutes"
    >
      <LessonSection id="steer-gains" title="Tune the steer gains">
        <p>
          A steering motor holds an angle. That is a position loop with no
          gravity to fight, so skip kG and start at kS. Adjust the
          generator&apos;s numbers rather than starting from zero.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/generated/TunerConstants.java"
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
          <code>CommandSwerveDrivetrain</code> publishes{" "}
          <code>Drivetrain/ModuleStates</code> and{" "}
          <code>Drivetrain/ModuleTargets</code>. Put the angle from both on one
          AdvantageScope plot and flick the right stick. Tuned looks like two
          traces on top of each other.
        </p>
      </LessonSection>

      <LessonSection id="measure-the-drivetrain" title="Wheel radius">
        <p>
          The generator asked for your wheel size, so <code>kWheelRadius</code>{" "}
          is already close. Measure it only if you changed wheels, or if
          odometry reads long or short against a tape measure.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/generated/TunerConstants.java"
          code={`private static final Distance kWheelRadius = Inches.of(2.167);`}
        />
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Tape the floor at the robot&apos;s front edge. Restart the code so{" "}
            <code>Drivetrain/Pose</code> reads (0, 0).
          </li>
          <li>Drive straight forward, slowly, about five meters.</li>
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
          <code>kSpeedAt12Volts</code> is the speed at 12 volts applied, and
          full stick asks the velocity loop for exactly that speed. Use six
          meters of clear floor on the surface you compete on.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Full stick forward. Hold until the speed stops climbing, then let go
            well before the wall.
          </li>
          <li>
            Plot <code>Drivetrain/TranslationSpeedMps</code> and read the
            plateau, not the spike. If it sits right on{" "}
            <code>kSpeedAt12Volts</code>, the loop is holding your number, not
            the robot&apos;s limit. Raise the number and run again until the
            plateau falls short of it.
          </li>
        </ol>
        <p>
          We can also use a stator current limit to keep a wheel from slipping
          when the robot accelerates hard.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Drive the robot up to a wall on carpet and square it up so all four
            wheels point into the wall.
          </li>
          <li>
            In Tuner X, open one drive motor and plot its stator current and its
            velocity.
          </li>
          <li>
            Push the stick forward slowly, a little at a time, and watch both
            traces.
          </li>
        </ol>
        <p>
          Current climbs while velocity sits at zero. When the velocity goes up,
          the tire has let go, and the stator current at that moment is your
          slip current. Set <code>kSlipCurrent</code> slightly below it. If the
          trace flattens at the shipped 120 A and the wheel never breaks loose,
          raise the constant and try again.
        </p>
        <Box variant="alert-danger" title="Stalled motors get hot fast">
          <p>
            Keep each push short and let go of the stick between attempts. One
            person on the disable, somebody else on the laptop.
          </p>
        </Box>
        <p>Both numbers go in the same file.</p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/generated/TunerConstants.java"
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
          Every drive request in this course is{" "}
          <code>DriveRequestType.Velocity</code>: the drive motors hold a wheel
          speed with the drive gains below. CTRE&apos;s generator writes{" "}
          <code>OpenLoopVoltage</code>, which sends the stick straight to volts
          and ignores those gains. The workshop project already changes it in{" "}
          <code>Robot.java</code>.
        </p>
        <p>
          On a velocity loop the feedforward does nearly all of the work.{" "}
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
          filename="src/main/java/first/robot/generated/TunerConstants.java"
          code={`private static final Slot0Configs driveGains =
    new Slot0Configs().withKP(0.2).withKI(0).withKD(0).withKS(0).withKV(0.124);`}
        />
        <p>
          The request has no deadband of its own, because Phoenix&apos;s version
          cuts off every speed under it. The controller ignores the bottom 10%
          of each stick instead and stretches the rest back over the full range.
        </p>
        <p>
          To find your own deadband, open the driver station, take your hands
          off the controller, and look at what each stick axis reads. Flick each
          stick and let it snap back a few times. Take the largest reading you
          see at rest, ignoring its sign, and add a little to it. That keeps the
          robot from driving when the driver is not touching the stick. Set it
          in the <code>Robot</code> constructor.
        </p>
        <CodeBlock
          language="java"
          filename="src/main/java/first/robot/Robot.java"
          code={`// In the Robot constructor, above setDefaultCommand
driver.getController().setLeftXDeadband(0.05);
driver.getController().setLeftYDeadband(0.05);
driver.getController().setRightXDeadband(0.05);`}
        />
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Tape a start mark, restart the code so <code>Drivetrain/Pose</code>{" "}
          reads (0, 0), and drive a square: three meters forward, three left,
          three back, three right.
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
              "The joystick request uses DriveRequestType.Velocity. What does that change compared with CTRE's generated OpenLoopVoltage?",
            options: [
              "Nothing. Phoenix picks the closed-loop version once the gains are non-zero.",
              "The drive motors hold a wheel speed using the drive gains, instead of sending the stick straight to volts",
              "Only the steer motors change; the drive motors still run on volts",
              "It turns off the deadband",
            ],
            correctAnswer: 1,
            explanation:
              "OpenLoopVoltage turns the stick into volts and never reads driveGains. Velocity asks each drive motor for a wheel speed and closes the loop with driveGains.",
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
              "newRadius = (actualDistance / reportedDistance) × currentRadius. The robot went less far than it reported, so the radius in the file is too big and goes down.",
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
              "The steer loop's job is to put the wheel where the drivetrain asked. Raise kP until it oscillates and back off, then add kD until just before it jitters.",
          },
          {
            id: 4,
            question:
              "Against the wall, current climbs while velocity sits at zero, then the velocity goes up. What goes in kSlipCurrent?",
            options: [
              "The stator current well after the jump, with the wheel spinning",
              "The velocity at the jump",
              "A value slightly below the stator current at the moment the velocity went up",
              "70 A, the supply limit driveInitialConfigs already sets",
            ],
            correctAnswer: 2,
            explanation:
              "While the tire grips, velocity stays at zero and current keeps climbing. The velocity going up is the tire letting go. A limit slightly below that current keeps the wheel from slipping.",
          },
          {
            id: 5,
            question:
              "Why does the course put the stick deadband on the controller instead of on the FieldCentric request?",
            options: [
              "The request's deadband only works with OpenLoopVoltage",
              "The controller stretches the travel past its deadband back over the full range, so the slowest speeds are still reachable",
              "The controller's deadband stops a worn stick from drifting, and the request's does not",
              "The request ignores its deadband once the drive gains are tuned",
            ],
            correctAnswer: 1,
            explanation:
              "Both stop drift. The request's deadband cuts off every speed under it. The controller maps 10% of stick to zero and full stick to full, so every speed in between is still there.",
          },
        ]}
      />
    </PageTemplate>
  );
}
