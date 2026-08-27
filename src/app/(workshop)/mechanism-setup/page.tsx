import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import ImageBlock from "@/components/ImageBlock";
import Quiz from "@/components/Quiz";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";
import VideoEmbed from "@/components/VideoEmbed";

export default function MechanismSetup() {
  return (
    <PageTemplate
      title="Motor Setup & CAN IDs"
      lede="Every device gets its own CAN ID, and then the mechanism turns under power for the first time. You will check which way the arm's sensor counts, record its zero, and prove the motor drives the same way. Get any of that wrong and the next lesson tunes against the wrong sign."
      needs={[
        <>The mechanism assembled and powered.</>,
        <>
          Phoenix Tuner X connected to the CANivore over USB, firmware current.
        </>,
        <>No robot program running. Tuner X owns the bus here.</>,
      ]}
      time="15 minutes"
    >
      <LessonSection id="assign-can-ids" title="Assign every CAN ID">
        <p>
          Factory default each device before you number it. That clears whatever
          last season left behind. It also resets the CAN ID and the inversions.
        </p>
        <p>
          Then blink. The device that flashes is the one you are about to edit.
          If two flash together they share an ID: take one off the bus, number
          the other, then reconnect.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="py-2 pr-4">Device</th>
                <th className="py-2 pr-4">CAN ID</th>
                <th className="py-2">Device label</th>
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
        <ImageBlock
          src="/images/setup/factory-default.png"
          alt="Screenshot highlighting the Factory Default button in the device configuration screen."
          caption="In Tuner X, open the device, then the three dots, then Factory Default."
        />
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open a device, click the three dots, then{" "}
            <strong>Factory Default</strong>.
          </li>
          <li>
            Click the <strong>Blink</strong> button on the left panel. This will
            flash the lights on the device that you have selected.
          </li>
          <li>
            Give it the ID from the table and a name that says which mechanism
            it drives.
          </li>
          <li>
            Repeat until every device has its own ID and Tuner X reports no
            duplicates.
          </li>
        </ol>
      </LessonSection>

      <LessonSection
        id="verify-the-arm-sensor"
        title="Arm encoder direction and zero"
      >
        <p>
          The encoder is what everything downstream trusts. Test it by hand
          before any request is sent.
        </p>
        <VideoEmbed id="mjGn3y19eUc" title="Calibrate and zero the encoder" />
        <ol className="ml-5 list-decimal space-y-3">
          <li>Open the CANcoder device in Tuner X and plot the position.</li>
          <li>
            Facing the motor side of the arm, turn it counterclockwise by hand.
          </li>
          <li>
            The CANcoder position must increase. If it decreases, flip the
            sensor direction, apply, and repeat the hand test.
          </li>
          <li>
            Put the arm to 0, based on the Unit Circle, then zero the CANcoder
            position.
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 120 120"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Circle with lines cut out at top, right, and bottom"
              className="inline-block ml-2"
            >
              {/* Rotate so the path starts on the left. Equal gaps of 5
                    sit fully on the top, right, and bottom; none wrap the seam. */}
              <circle
                cx="60"
                cy="60"
                r="56"
                fill="none"
                stroke="#1e293b"
                strokeWidth="20"
                pathLength="100"
                strokeDasharray="22.5 5 20 5 20 5 22.5"
                transform="rotate(180 60 60)"
              />
            </svg>
          </li>
          <li>
            Turn it 90 degrees counterclockwise. Expect about <code>0.25</code>{" "}
            rotations. A full turn reads <code>1.0</code>.
          </li>
        </ol>
        <p>
          Positions are measured in <strong>rotations</strong>, not degrees. One
          full turn is <code>1.0</code>. Counterclockwise with the device facing
          you is positive, and every position target from here to Motion Magic
          is written that way.
        </p>

        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
          <ImageBlock
            src="/images/setup/unit_circle_degrees_rotations_decimal.png"
            alt="Unit circle showing the same angles written as degrees and as decimal rotations, with counterclockwise as the positive direction"
            width={340}
            height={340}
          />
          <ImageBlock
            src="/images/setup/counter-clockwise.png"
            alt="Arrow showing the counterclockwise rotation direction with the device facing you"
            width={340}
            height={255}
          />
        </div>

        <p>
          Choose the reference with whoever built the arm, then mark it on the
          metal. A replaced CANcoder comes back with no direction and no offset,
          so somebody will run this procedure again in March.
        </p>
      </LessonSection>

      <LessonSection id="link-the-encoder" title="Link the Encoder">
        <p>
          Now that you have verified the encoder direction and zero, you can
          link it to the motor.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Select the arm TalonFX and scroll down in the config section to the{" "}
            <strong>Feedback</strong> section.
          </li>
          <li>
            Set the <code>Feedback Remote Sensor ID</code> to match your
            CANcoder ID.
          </li>
          <li>
            Set the <code>Feedback Sensor Source</code> to{" "}
            <code>RemoteCANcoder</code>
          </li>
        </ol>
        <ImageBlock
          src="/images/setup/link-the-encoder.png"
          alt="Screenshot highlighting the Feedback section of the arm TalonFX configuration."
          caption="In Tuner X, link the encoder to the motor by setting the Feedback Remote Sensor ID."
        />
      </LessonSection>

      <LessonSection
        id="verify-motor-direction"
        title="Run the motor, match the sensor"
      >
        <p>
          This is the first time anything moves under power. Voltage Out sends a
          fixed voltage and nothing else: no target, no soft limits, no stopping
          at the end of travel. The hand test settled which way is positive, and
          the motor is the only thing allowed to change from here.
        </p>

        <Box variant="alert-warning" title="Before you enable anything">
          <p>
            Make sure the mechanism is clear of obstacles. Blink the device
            first: voltage goes to a CAN ID, not to the one you meant. Start at
            1 volt and enable for about a second at a time. A Voltage Out
            request runs until you stop it, into the hard stop if that is where
            the mechanism is pointed.
          </p>
        </Box>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Select the arm TalonFX and set the control drop-down to{" "}
            <strong>Voltage Out</strong>.
          </li>
          <li>
            Enter <code>1 V</code>, click <strong>DISABLED</strong> to enable
            the device, then disable after about a second. Watch the mechanism,
            not the screen.
          </li>
          <li>
            The arm should move counterclockwise and CANcoder <code>32</code>{" "}
            should count up.
          </li>
          <li>
            If it moves the other way, invert the motor output, apply, and run
            the same test again.
          </li>
        </ol>

        <p>
          Once <code>1 V</code> is right, repeat at <code>3 V</code>. Only the
          speed should change. An arm that will not budge at <code>1 V</code> is
          usually fighting friction or gravity rather than bad wiring. Climb in
          single volts until it creeps, then stop. You are checking which way it
          goes, not how fast. On a flywheel bench there is no arm to run, so the
          first movement is the section below.
        </p>

        <VideoEmbed id="cDWF3bj1Juk" title="Motor test" />
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Power the bench down, bring it back up, and walk these checks in
          order.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>Blinking any ID flashes the device you expected.</li>
            <li>A volt or two moves the mechanism, and disabling stops it.</li>
            <li>
              Tuner X lists all devices on your mechanism, each with its own ID
              and a name.
            </li>
            <li>
              The arm reference reads about zero, and a quarter turn reads{" "}
              <code>0.25</code>.
            </li>
            <li>
              Turning the arm counterclockwise by hand raises the CANcoder
              reading, and positive voltage on TalonFX 31 drives it the same
              way.
            </li>
          </ul>
        </Box>
        <p>PID tuning starts on the next page!</p>
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "You blink one device from the Tuner X list and two devices on the bench flash together. What have you found?",
            options: [
              "Two devices answering to the same CAN ID",
              "A CAN bus wired in the wrong order",
              "One device running older firmware than the other",
              "A Tuner X setting that blinks the whole bus at once",
            ],
            correctAnswer: 0,
            explanation:
              "Blink goes out to a CAN ID, so two devices flashing means two devices hold that number. Take one of them off the bus, give the other its own ID, then reconnect and blink again. Tuner X marks a duplicate with a red device card.",
          },
          {
            id: 2,
            question:
              "Facing the device side of the arm, you turn it counterclockwise by hand. What should CANcoder do?",
            options: [
              "Hold its reading until the motor is powered",
              "Count down",
              "Count up",
              "Snap back to zero",
            ],
            correctAnswer: 2,
            explanation:
              "Counterclockwise is positive on this arm, so the position climbs. A falling reading means the sensor direction is backwards: flip it, apply, and run the hand test again. A reading that never moves is a different fault, usually a magnet out of range or the wrong device selected.",
          },
          {
            id: 3,
            question: "What does setting the arm's zero do?",
            options: [
              "Limits how far the arm may travel either side of the reference mark",
              "Names one physical spot as 0 rotations, and the encoder measures every position after that from it",
              "Calibrates the motor's top speed",
              "Returns the CANcoder to factory defaults, sensor direction included",
            ],
            correctAnswer: 1,
            explanation:
              "Zero picks the spot on the metal that reads 0 rotations. The motor measures every position target after that from it. A zero set half a turn off shifts all of them by half a turn, so put the reference on the metal and agree it with whoever built the arm.",
          },
          {
            id: 4,
            question:
              "A CANcoder fails in March and somebody fits a new one. What has to happen?",
            options: [
              "Nothing, because the direction and the zero travel with the mechanism rather than the device",
              "Set its CAN ID and its name, and the two sensor settings carry over",
              "Set its ID, then redo the direction check and the zero, because both live on the encoder",
              "Redo the zero only, because sensor direction is a wiring property",
            ],
            correctAnswer: 2,
            explanation:
              "Sensor direction and the magnet offset are configs on the CANcoder itself, so a replacement arrives at a factory ID with both back at their defaults. Set the ID, run the hand test, and set the zero on the same reference mark. Put the arm back on that mark afterwards: it should read about 0 rotations again.",
          },
        ]}
      />
    </PageTemplate>
  );
}
