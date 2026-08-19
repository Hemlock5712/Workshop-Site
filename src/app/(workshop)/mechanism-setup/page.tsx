import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

export default function MechanismSetup() {
  return (
    <PageTemplate
      title="Give every device an identity, a direction, and a zero"
      emphasis="an identity, a direction, and a zero"
      lede="Before tuning anything, prove that Tuner X is talking to the intended hardware and that positive motion means the same thing to the motor and sensor."
      needs={[
        <>The mechanism assembled, restrained, and powered.</>,
        <>
          The CANivore connected over USB and every device visible in Phoenix
          Tuner X with current firmware.
        </>,
        <>
          No robot program running; Tuner X owns the CAN bus for this workshop.
        </>,
      ]}
      time="About 30 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "A CAN ID answers which device. Direction answers which way is positive. Zero answers where position measurements begin. Closed-loop control needs all three to be unambiguous.",
          ]}
          concept="Identify first, test direction second, zero last. Do not tune around a setup error."
        />
        <MarginNote label="WHAT YOU'LL FINISH">
          Four uniquely identified devices, an arm whose motor and encoder agree
          on positive motion, a recorded zero, and two flywheel motors verified
          one at a time.
        </MarginNote>
      </Split>

      <LessonSection id="canivore-usb" title="Let Tuner X own the CANivore">
        <p>
          Turn <strong>CANivore USB</strong> on while Tuner X is reading and
          controlling devices directly. Only one program can own the bus. If a
          robot program or another control window is open, stop it before
          continuing.
        </p>
        <FigureGrid
          cols={2}
          items={[
            {
              label: "Workshop 1",
              term: "CANivore USB on",
              body: "Tuner X identifies devices, changes configuration, sends control requests, and plots signals.",
            },
            {
              label: "Workshop 2 onward",
              term: "CANivore USB off",
              body: "The robot program owns the bus. Return to Tuner X only after stopping that program.",
            },
          ]}
        />
      </LessonSection>

      <LessonSection
        id="assign-can-ids"
        title="Identify and assign every CAN ID"
      >
        <p>
          Use Tuner X&apos;s blink or identify action before changing an ID. The
          physical device that responds must match the row you are editing.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="py-2 pr-4">Device</th>
                <th className="py-2 pr-4">CAN ID</th>
                <th className="py-2">Bench label</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">Arm TalonFX</td>
                <td className="py-2 pr-4">
                  <code>31</code>
                </td>
                <td className="py-2">Arm motor</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">Arm CANcoder</td>
                <td className="py-2 pr-4">
                  <code>32</code>
                </td>
                <td className="py-2">Arm encoder</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="py-2 pr-4">Flywheel TalonFX</td>
                <td className="py-2 pr-4">
                  <code>21</code>
                </td>
                <td className="py-2">Flywheel leader</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Flywheel TalonFX</td>
                <td className="py-2 pr-4">
                  <code>22</code>
                </td>
                <td className="py-2">Flywheel follower</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Identify one device and disconnect or isolate it if the response is
            ambiguous.
          </li>
          <li>Assign the listed ID and a descriptive name.</li>
          <li>
            Apply the change, refresh the device list, and identify it again.
          </li>
          <li>Repeat until Tuner X reports no duplicate IDs.</li>
        </ol>
        <Box
          variant="alert-warning"
          tag="WATCH OUT"
          title="Never guess which motor is selected"
        >
          <p>
            A control request goes to the CAN ID, not to the label on your
            table. Blink or identify the device again immediately before
            applying voltage.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="verify-the-arm-sensor"
        title="Set the arm encoder direction and zero"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Power the motor off. Turn the arm counterclockwise by hand while
            facing the device side of the mechanism.
          </li>
          <li>
            Watch CANcoder 32 in Tuner X. Its position must increase. If it
            decreases, change the sensor direction, apply the configuration, and
            repeat the hand test.
          </li>
          <li>
            Put the arm at the team&apos;s chosen reference position. Use Tuner
            X to set that physical position to <code>0</code> rotations.
          </li>
          <li>
            Move the arm 90 degrees counterclockwise. The reading should be near
            <code>0.25</code> rotations; a full turn is <code>1.0</code>.
          </li>
        </ol>
        <Box
          variant="concept"
          title="Zero belongs to the mechanism, not the lesson"
        >
          <p>
            Confirm the reference position with the person who built the arm and
            mark it physically. Replacing the CANcoder erases its stored
            direction and offset, so this procedure must be repeatable.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="verify-motor-direction"
        title="Make positive motor output agree with the sensor"
      >
        <ol className="ml-5 list-decimal space-y-3">
          <li>Select arm TalonFX 31 and choose a voltage output request.</li>
          <li>
            Start at <code>1 V</code>. Briefly enable it with one person at the
            power switch.
          </li>
          <li>
            Positive voltage must move the arm counterclockwise and make
            CANcoder 32 increase.
          </li>
          <li>
            If the motor moves the other way, invert the motor output in Tuner
            X, apply, and repeat. Do not change the sensor after its hand test
            passed.
          </li>
          <li>
            Repeat at <code>3 V</code> only after the low-voltage direction is
            correct.
          </li>
        </ol>
      </LessonSection>

      <LessonSection
        id="verify-the-flywheel"
        title="Test both flywheel motors separately"
      >
        <p>
          The two wheels face each other, so their shafts turn opposite ways
          while both wheel surfaces move the game piece in the same direction.
          With no follower relationship active, test each TalonFX independently.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>Mark the intended game-piece direction on the frame.</li>
          <li>
            Apply a brief positive voltage to CAN 21 and record which way its
            wheel surface moves.
          </li>
          <li>Stop it, then repeat on CAN 22.</li>
          <li>
            Choose and record the inversion for each motor so both wheel
            surfaces agree with the arrow.
          </li>
          <li>
            Spin each by hand with power off and check for rubbing, binding, or
            loose hardware.
          </li>
        </ol>
      </LessonSection>

      <LessonSection
        id="bench-check"
        title="Do not continue until all six checks pass"
      >
        <ul className="ml-5 list-disc space-y-2">
          <li>Every device has a unique CAN ID and a useful name.</li>
          <li>
            Identifying an ID always flashes the expected physical device.
          </li>
          <li>Counterclockwise arm motion increases CANcoder position.</li>
          <li>
            The marked arm reference reads about zero and 90 degrees reads about{" "}
            <code>0.25</code>.
          </li>
          <li>
            Positive arm voltage moves in the same direction as positive sensor
            motion.
          </li>
          <li>
            Both flywheel surfaces move the game piece in the intended
            direction.
          </li>
        </ul>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/index.html"
          title="CTRE — Phoenix Tuner X"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>
    </PageTemplate>
  );
}
