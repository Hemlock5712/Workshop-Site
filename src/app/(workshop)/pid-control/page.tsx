import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import MechanismPlayground from "@/components/MechanismPlayground";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";
import VideoEmbed from "@/components/VideoEmbed";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import PairedLesson from "@/components/lesson/PairedLesson";
import { Mech } from "@/components/lesson/Mechanism";
import Link from "next/link";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/pid-control");

/**
 * Reference implementation for `context/lesson-budget.md`.
 *
 * Six sections. A numbered procedure in each section that is a procedure, a
 * table where the content is a table, a three-column figure for the three
 * failure modes, and a closing check a student can actually perform. Two
 * asides on the whole page, both of them safety.
 *
 * The shape to copy: prose says why, and says what "good" looks like. The
 * numbered list says what to do. Neither repeats the other, and neither one
 * narrates the table sitting next to it.
 */
export default function PIDControl() {
  return (
    <PageTemplate
      title="PID Tuning in Tuner X"
      lede="The TalonFX runs the control loop itself. Tuner X sends the setpoint, plots the response, and saves the gains onto the motor."
      needs={[
        <>
          Motor, encoder direction, and mechanism zero verified in{" "}
          <strong>Motor Setup &amp; CAN IDs</strong>.
        </>,
        <>
          Tuner X connected to the CANivore, with <strong>CANivore USB</strong>{" "}
          on.
        </>,
        <>The mechanism, with a clear path to swing, and no obstacles.</>,
      ]}
      time="14 minutes"
    >
      <MechanismSelector />
      <PairedLesson kind="code" to="/motion-magic-code" />

      <LessonSection id="how-to-tune" title="How to tune">
        <p>
          CTRE has an excellent guide already that explains how to properly tune
          a PID loop. We strongly suggest following the steps in the guide.
        </p>
        <p>
          After you follow this guide, come back here and we&apos;ll explain how
          to implement it.
        </p>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/manual-pid-tuning.html"
          title="CTRE: Manual PID tuning"
          icon={<BookOpen className="h-5 w-5" />}
        />
        <p>
          CTRE tunes with a <code>TorqueCurrentFOC</code> request, so its gains
          are in amps. This course tunes with a voltage request, so the
          procedure carries over and their numbers do not.
        </p>
        <Mech for="arm" as="div">
          <DocumentationButton
            href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/manual-pid-tuning.html#arm-tuning-with-torquecurrentfoc"
            title="CTRE: Arm tuning"
            icon={<BookOpen className="h-5 w-5" />}
          />
        </Mech>
        <Mech for="flywheel" as="div">
          <DocumentationButton
            href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/device-specific/talonfx/manual-pid-tuning.html#flywheel-tuning-with-torquecurrentfoc"
            title="CTRE: Flywheel tuning"
            icon={<BookOpen className="h-5 w-5" />}
          />
        </Mech>
      </LessonSection>

      <LessonSection id="play-with-the-gains-first" title="Play with the gains">
        <p>
          Drag a gain and watch what happens. Find out what too much{" "}
          <code>kP</code> looks like here, where it costs nothing, rather than
          on a real gearbox.
        </p>
        <p>
          Switch between the three. The arm holds an angle, and gravity pulls on
          it everywhere except straight up and down. This arm is competition
          size, so it needs a real <code>kG</code> to hold. The 9 inch bench arm
          is light enough to need very little, so its feedforward is mostly{" "}
          <code>kS</code>. The flywheel holds a speed. Nothing drags it off
          target, but holding that speed costs output, and a game piece steals
          it at once. The elevator is the other gravity case, a constant pull.
        </p>
        <MechanismPlayground />
      </LessonSection>

      <LessonSection id="units-and-sizes" title="Units and sizes">
        <p>
          Every gain is output per unit of input. The request decides the
          output. A request ending in <code>Voltage</code> outputs volts, and
          one ending in <code>TorqueCurrentFOC</code> outputs amps.{" "}
          <code>DutyCycle</code> outputs a fraction of full power. CTRE&apos;s
          own examples put a position <code>kP</code> at 2.4 in volts and in the
          thousands in amps. A gain copied from a guide written for another
          request means nothing.
        </p>
        <p>
          The input is mechanism rotations, never degrees. On the arm that is
          the arm shaft, because the CANcoder reads it there. The flywheel reads
          the motor&apos;s own sensor with no ratio set, so its input is
          rotations of the motor.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="py-2 pr-4">Gain</th>
                <th className="py-2 pr-4">Volts per</th>
                <th className="py-2">CTRE example</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">
                  <code>kP</code>, position
                </td>
                <td className="py-2 pr-4">rotation of error</td>
                <td className="py-2">2.4</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">
                  <code>kP</code>, velocity
                </td>
                <td className="py-2 pr-4">rps of error</td>
                <td className="py-2">0.11</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">
                  <code>kD</code>, position
                </td>
                <td className="py-2 pr-4">rps the error changes by</td>
                <td className="py-2">0.1</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">
                  <code>kS</code>, <code>kG</code>
                </td>
                <td className="py-2 pr-4">nothing, a flat output</td>
                <td className="py-2">0.1, for kS</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">
                  <code>kV</code>
                </td>
                <td className="py-2 pr-4">rps of target velocity</td>
                <td className="py-2">0.12</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">
                  <code>kA</code>
                </td>
                <td className="py-2 pr-4">rps² of target acceleration</td>
                <td className="py-2">0.01</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Rotations are why an arm <code>kP</code> looks big. An error of 0.01
          rotations is 3.6 degrees, so a <code>kP</code> of 20 answers it with
          only 0.2 V. A geared arm in volts can land anywhere from about 1 to
          100. A Kraken X44 needs about 0.093 V per rps of its own speed, so a
          flywheel <code>kV</code> in motor rotations lands a little above that.
        </p>
        <p>
          <code>SensorToMechanismRatio</code> moves all of this. Set it to a
          gearbox&apos;s reduction and one rotation of input becomes one turn of
          the output. That multiplies <code>kP</code> and <code>kV</code> by
          roughly the reduction. Both bench builds leave it at 1, and{" "}
          <Mech for="arm">
            <Link
              href="/mechanism-setup#link-the-encoder"
              className="underline font-medium"
            >
              Motor Setup &amp; CAN IDs
            </Link>
          </Mech>
          <Mech for="flywheel">
            <Link
              href="/mechanism-setup#verify-motor-direction"
              className="underline font-medium"
            >
              Motor Setup &amp; CAN IDs
            </Link>
          </Mech>{" "}
          says when to change it.
          <Mech for="arm">
            {" "}
            Arm <code>kG</code> also needs the gravity type set to{" "}
            <code>Arm_Cosine</code>, which scales it by the cosine of the angle
            and expects 0 to be horizontal.
          </Mech>
        </p>
      </LessonSection>

      <LessonSection id="feedforward-first" title="Tune the gains">
        <p>
          Before running this, fully power cycle the CANivore and mechanism to
          prevent any old positions from being read.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open <strong>Signal &amp; Control</strong> and add the TalonFX you
            are tuning.
          </li>
          <li>
            Plot two signals: the target and the measured position (or velocity
            for flywheels). Put target and measurement in one group so you can
            read the gap between them.
          </li>
        </ol>
        <Box variant="alert-info" title="Before you tune">
          <p>
            In the control panel, pick a voltage-based position or velocity
            request and select Slot 0. Enter a small target: 0.1 rotations for
            position, 10 rps for velocity. The same requests come back in code
            in{" "}
            <Link
              href="/mechanisms#configs-and-requests"
              className="underline font-medium"
            >
              Mechanisms
            </Link>
            .
          </p>
        </Box>

        <p>
          Run these steps on your actual mechanism. They are the CTRE procedure,
          in volts.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Set every gain in Slot 0 to zero.
            <Mech for="arm">
              {" "}
              Set <strong>Gravity Type</strong> to <code>Arm_Cosine</code>.
            </Mech>
          </li>
          <Mech for="arm" as="li">
            Feedforward first. Raise <code>kG</code> to find the smallest and
            the largest values that hold the arm level. Set <code>kG</code> to
            the midpoint and <code>kS</code> to half the gap between them.
          </Mech>
          <Mech for="flywheel" as="li">
            Feedforward first. At a low target, raise <code>kS</code> until the
            wheel just turns. At a high target, raise <code>kV</code> until the
            measured speed meets the target with <code>kP</code> still at zero.
          </Mech>
          <li>
            Raise <code>kP</code>, doubling it each run, until the mechanism
            overshoots or oscillates. Then back off to about half of that value.
          </li>
          <Mech for="arm" as="li">
            Add <code>kD</code> in small steps until the overshoot stops. If the
            arm starts to buzz, you have gone too far.
          </Mech>
          <li>
            Leave <code>kI</code> at zero. Fix a steady gap with feedforward or{" "}
            <code>kP</code> first, and you will rarely need it.
          </li>
          <li>
            Try other targets in both directions, then apply the gains with the
            download button. A gain that was never applied never reaches the
            motor.
          </li>
        </ol>
        <p>
          A tuned arm sounds like one motion and then silence. If the motor is
          still working after the mechanism stopped, <code>kP</code> is too
          high.
        </p>

        <VideoEmbed
          id="Pt7SBFfl3oM"
          title="Tuning feedback (PID) and feedforward"
        />
      </LessonSection>

      <LessonSection id="failure-shapes" title="Three failure shapes">
        <p>
          Nearly everything that goes wrong on a mechanism looks like one of
          these. Read the plot, not the mechanism.
        </p>
        <FigureGrid
          cols={3}
          items={[
            {
              label: "Runs away",
              term: "Wrong direction",
              body: (
                <>
                  Error grows instead of shrinking and output pins. Disable now.
                  The sensor or the motor is inverted, so go back to Motor
                  Setup.
                </>
              ),
            },
            {
              label: "Buzzes",
              term: "Too much gain",
              body: (
                <>
                  Voltage chatters and the mechanism hums at rest. Cut{" "}
                  <code>kP</code> before reaching for <code>kD</code>. Damping
                  will not fix a loop that is too stiff.
                </>
              ),
            },
            {
              label: "Falls short",
              term: "Not enough output (position control)",
              body: (
                <>
                  Error settles at a constant gap. Increase your <code>kP</code>{" "}
                  to correct this, likely followed by a <code>kD</code> to
                  dampen the overshoot.
                </>
              ),
            },
          ]}
        />
        <p>
          When the plot looks like none of these, check the setup before the
          gains.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            The request and the gains must both be on Slot 0. Gains in another
            slot do nothing.
          </li>
          <li>
            A gain from an amps or duty cycle guide is meaningless in a voltage
            request.
          </li>
          <li>
            A tired battery cannot reach the voltage a fresh one can. Re-check
            your gains on a charged battery.
          </li>
          <li>
            A current limit that clips the output looks like too little gain.
            Watch for current sitting flat at the limit.
          </li>
          <li>
            A runaway means the sensor or motor direction changed since{" "}
            <strong>Motor Setup &amp; CAN IDs</strong>. Fix it there.
          </li>
          <li>
            Gains that were never applied are lost. Power cycle, reopen the
            config, and confirm the numbers are still there.
          </li>
        </ul>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Drive the mechanism to its target in both directions, from a
          standstill, three times. You are done when all three runs look alike.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>The measured trace meets the target and stays there.</li>
            <li>
              Closed-loop error settles near zero and does not drift back out.
            </li>
            <li>Voltage is steady at rest, not chattering.</li>
            <li>The same gains behave across the full range of travel.</li>
          </ul>
        </Box>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You set every gain to zero, send a position target, and enable. The arm does nothing. What is wrong?",
            options: [
              "Tuner X needs the control request enabled twice",
              "The CANcoder is not wired into the feedback loop",
              "Nothing. A zero gain scales its term to nothing, so the output is zero volts",
              "kP must never start at zero, or the loop cannot begin",
            ],
            correctAnswer: 2,
            explanation:
              "Zero gains mean zero output. That is the intended starting state, and it is why the procedure has you add one term at a time: whatever the mechanism does next, you know which number caused it.",
          },
          {
            id: 2,
            question:
              "Your arm holds its angle perfectly at 90 degrees and sags badly at 30. Which term is wrong?",
            options: [
              "kD, because the arm is moving more slowly there",
              "kG, or the gravity type, because the hold varies with angle",
              "kS, because friction is higher at low angles",
              "kP, because the error at 30 degrees is larger",
            ],
            correctAnswer: 1,
            explanation:
              "Gravity's pull on an arm changes with the cosine of its angle. A hold that works at one angle and fails at another is the gravity term, so check kG and confirm the gravity type is set to the arm setting rather than the static one.",
          },
          {
            id: 3,
            question: "What order do you tune an arm in?",
            options: [
              "All of them together, raised in proportion",
              "kD first for safety, then kP, then the feedforwards",
              "kP, then kI, then kD, then the feedforwards",
              "kS and kG first, then kP, then kD",
            ],
            correctAnswer: 3,
            explanation:
              "Feedforward before feedback. Each term is measured with the ones after it still at zero, so tuning out of order means measuring one gain while another is already covering for it.",
          },
          {
            id: 4,
            question:
              "The arm reaches its target and then buzzes, sitting still. What do you reach for first?",
            options: [
              "Raise kD to damp the buzz",
              "Add kI to settle the remaining error",
              "Lower kP, because the loop is too stiff",
              "Raise kS to push through the friction",
            ],
            correctAnswer: 2,
            explanation:
              "A buzz at rest is a loop correcting harder than the mechanism can answer. Cut kP first. Damping a loop that is already too stiff adds a second aggressive term to a problem caused by the first.",
          },
        ]}
      />
    </PageTemplate>
  );
}
