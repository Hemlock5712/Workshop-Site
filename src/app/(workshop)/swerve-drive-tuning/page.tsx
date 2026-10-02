import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { Book } from "lucide-react";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/swerve-drive-tuning");

/**
 * The second half of the old `/swerve-calibration`, split in October 2026 when
 * that page ran 14.9 minutes across 18 steps. The seam is the floor: the first
 * half happens with the robot square on a bench and Tuner X reading sensors,
 * this half happens on six meters of carpet with a tape measure and a log.
 *
 * Moved here unchanged in substance: the three carpet measurements (wheel
 * radius, top speed, slip current), every number they carry (2.167 in, 4.54
 * m/s, 120 A stator, 70 A supply, driveGains kP 0.2 / kV 0.124, the 10%
 * deadband and the 0.45 m/s it costs), the stall-heat safety on the wall push,
 * the CTRE wheel-slip reference, closing the drive loop, the square check and
 * its three failure shapes, and five of the six old quiz questions. The sixth,
 * on `seedFieldCentric()`, duplicated `/swerve-drive-project` Q5 and is gone.
 *
 * "The robot template" is not cited here: 2027-Template is not a source for
 * this site. What ships open loop is `1-Swerve`, `2-Logging`, and the project
 * the Tuner X generator writes.
 */
export default function SwerveDriveTuning() {
  return (
    <PageTemplate
      title="Swerve Drive Tuning"
      lede="Three measurements on carpet replace the drive numbers the generator guessed: wheel radius, top speed, and the current where a tire lets go. Then the drive motors get a real velocity loop."
      needs={[
        <>
          Modules zeroed and steer gains tuned, from{" "}
          <strong>Swerve Calibration</strong>.
        </>,
        <>
          Logging on. Two of the measurements come out of a <code>.wpilog</code>
          .
        </>,
        <>Phoenix Tuner X, and six meters of clear carpet.</>,
        <>A tape measure, and a wall you may push against.</>,
      ]}
      time="15 minutes"
    >
      <LessonSection id="measure-the-drivetrain" title="Wheel radius">
        <p>
          Measure the radius and the top speed while the drive request is still
          open-loop voltage: <code>kSpeedAt12Volts</code> means the speed at 12
          volts applied.
        </p>
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
      </LessonSection>

      <LessonSection id="top-speed-and-slip" title="Top speed and slip current">
        <p>
          Do the radius first, because this speed is wheel rotations times that
          radius. Find six meters of clear floor on the surface you compete on.
          Carpet and a shop floor give different answers.
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
          robot. The driver cap is <code>maxSpeed</code> in{" "}
          <code>TeleopOpMode</code>, which reads it straight back. Expect a
          plateau near the 4.54 the file shipped with. Wildly off means the
          file: check the radius, then check <code>kDriveGearRatio</code>{" "}
          against your modules.
        </p>

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
          load, and gains found there will not hold a speed under a robot. Plot
          the same two signals as the steer gains, speed this time. A constant
          gap is kV. A gap only at low speed is kS. A slow recovery after a
          change of direction is kP.
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
          No branch makes this edit for you. <code>1-Swerve</code>,{" "}
          <code>2-Logging</code> and the project the Tuner X generator writes
          all ship open loop. Make it last. If the robot drives worse than it
          did on volts, go back to the gains.
        </p>

        <h4 className="display m-0 text-ui">The deadband</h4>
        <p>
          The same request line sets <code>withDeadband(maxSpeed * 0.1)</code>{" "}
          and <code>withRotationalDeadband(maxAngularRate * 0.1)</code>,
          throwing away the bottom 10% of both sticks. At 4.54 m/s that is
          everything under about 0.45 m/s, which open-loop driving could not
          hold anyway. A tuned velocity loop can, so the deadband now discards
          control you paid for. Shrink it rather than deleting it: the deadband
          keeps a worn stick&apos;s drift from creeping the robot across the
          field.
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
            <code>Drivetrain/ModuleTargets</code> flat at zero.
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
                  and no radius correction fixes a heading error. Go back to{" "}
                  <strong>Swerve Calibration</strong> and re-save the zeros.
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
                  Workshop 6.
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
              "It depends whether you generated the project in Tuner X or downloaded it",
            ],
            correctAnswer: 1,
            explanation:
              "1-Swerve, 2-Logging and the project the Tuner X generator writes all ship DriveRequestType.OpenLoopVoltage. You make the change yourself, and you make it after the drive gains are tuned. Velocity with untuned gains chases a speed the motor cannot hold, which drives worse than plain voltage.",
          },
          {
            id: 2,
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
            id: 3,
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
              "While the tire grips, the wheel cannot turn: velocity stays at zero and current keeps climbing with torque. The jump is the tire letting go, and the peak just before it is the slip point. If the trace flattens at 120 A and the wheel never breaks loose, you are reading the shipped stator limit rather than your carpet. Raise the constant and ramp again.",
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
              "At 4.54 m/s, 10% throws away everything under about 0.45 m/s, and a tuned velocity loop holds speeds that low. Zero deadband hands the robot every bit of a worn stick's drift instead. Halve it with the robot on blocks and your hands off the controller until the speed component of Drivetrain/ModuleTargets starts twitching, then go back one value.",
          },
        ]}
      />
    </PageTemplate>
  );
}
