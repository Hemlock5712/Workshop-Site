import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import FigureGrid from "@/components/lesson/FigureGrid";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";

export default function MechanismSetup() {
  return (
    <PageTemplate
      title="Motor Setup & CAN IDs"
      lede="You will set every CAN ID in Tuner X, check which way the arm's sensor counts, and record its zero. Get any of that wrong and the next lesson tunes against the wrong sign. No Java yet."
      needs={[
        <>The mechanism assembled, bolted to the bench, and powered.</>,
        <>
          Phoenix Tuner X connected to the CANivore over USB, firmware current.
        </>,
        <>No robot program running. Tuner X owns the bus here.</>,
        <>One person on the power switch who is not driving the laptop.</>,
      ]}
      time="14 minutes"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            A control request goes to a CAN ID. It does not go to the sticker on
            the motor, or to the row you have highlighted in your notes. Almost
            everything in this lesson exists to make the ID and the metal agree.
          </p>
          <p>
            Turn <strong>CANivore USB</strong> on before you start. One program
            owns the bus at a time, so close any robot code and any second Tuner
            window first.
          </p>
          <p>
            Check the device cards again before you change anything. Yellow
            means a newer firmware version is available. A device left on the
            old one answers you, then refuses the configuration you apply, so
            clear the yellow cards first.
          </p>
        </div>
        <MarginNote label="What you leave with">
          Four devices with IDs you picked. An arm whose motor and encoder agree
          on positive. A zero written down, and two flywheel motors checked one
          at a time. Workshop 2 types all of it into robot code.
        </MarginNote>
      </Split>

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
            body: "The robot program owns the bus. Stop it before coming back to Tuner X.",
          },
        ]}
      />

      <LessonSection id="assign-can-ids" title="Assign every CAN ID">
        <p>
          Blink a device before you change its ID. The one that flashes is the
          one you are about to edit. If two flash together they share an ID:
          disconnect one of them from the bus, give the other its own number,
          then reconnect.
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
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Blink one device from the list. If nothing on the bench flashes, you
            are looking at the wrong bus.
          </li>
          <li>
            Give it the ID from the table and a name that says which mechanism
            it drives.
          </li>
          <li>
            Apply the change, refresh the device list, and blink it again.
          </li>
          <li>
            Repeat until every device has its own ID and Tuner X reports no
            duplicates.
          </li>
        </ol>
        <Box variant="alert-danger" title="Blink it before you energize it">
          <p>
            Voltage goes to the CAN ID, not to the device you meant. Blink it,
            watch it flash, then enable. Start at <code>1 V</code>, give the arm
            room to swing, and enable for about a second at a time.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="verify-the-arm-sensor"
        title="Arm encoder direction and zero"
      >
        <p>
          The encoder is what everything downstream trusts. Test it by hand,
          with the motor unpowered, before any request is sent.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Power the motor off. Facing the device side of the arm, turn it
            counterclockwise by hand.
          </li>
          <li>
            Watch CANcoder 32. Position must increase. If it decreases, flip the
            sensor direction, apply, and repeat the hand test.
          </li>
          <li>
            If the reading never moves, the magnet is out of range or you are
            watching a different device.
          </li>
          <li>
            Put the arm on its reference mark and set that position to{" "}
            <code>0</code> rotations.
          </li>
          <li>
            Turn it 90 degrees counterclockwise. Expect about <code>0.25</code>{" "}
            rotations. A full turn reads <code>1.0</code>.
          </li>
        </ol>
        <p>
          Choose the reference with whoever built the arm, then mark it on the
          metal. A replaced CANcoder comes back with no direction and no offset,
          so somebody will run this procedure again in March.
        </p>
      </LessonSection>

      <LessonSection
        id="verify-motor-direction"
        title="Match motor output to sensor"
      >
        <p>
          The hand test settled which way is positive. The motor has to agree
          with it, and the motor is the only thing allowed to change from here.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>Select arm TalonFX 31 and choose a voltage output request.</li>
          <li>
            Enter <code>1 V</code>. Enable it for about a second, then disable.
          </li>
          <li>
            The arm should move counterclockwise and CANcoder 32 should count
            up.
          </li>
          <li>
            If it moves the other way, invert the motor output, apply, and run
            the same test again.
          </li>
          <li>
            Once <code>1 V</code> is right, repeat at <code>3 V</code>. Only the
            speed should change.
          </li>
        </ol>
        <p>
          An arm that will not budge at <code>1 V</code> is usually fighting
          friction or gravity rather than bad wiring. Raise the request half a
          volt at a time and keep an eye on the current.
        </p>
      </LessonSection>

      <LessonSection
        id="verify-the-flywheel"
        title="Test each flywheel motor alone"
      >
        <p>
          The two wheels face each other. Their shafts turn opposite ways while
          both surfaces push the game piece the same direction, so the two
          inversions will not match. Nothing is following anything yet, so test
          them separately.
        </p>
        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Mark an arrow on the frame for the direction the game piece should
            travel.
          </li>
          <li>
            Apply a brief positive voltage to CAN 21 and note which way its
            wheel surface moves.
          </li>
          <li>Stop it, then do the same on CAN 22.</li>
          <li>
            Record the inversion each motor needs so both surfaces drive with
            the arrow.
          </li>
          <li>
            With power off, spin each wheel by hand and feel for rubbing,
            binding, or a loose hub.
          </li>
        </ol>
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Power the bench down, bring it back up, and walk these checks in
          order. A setup that only passes on the second attempt has something
          loose in it.
        </p>
        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>Blinking any ID flashes the device you expected.</li>
            <li>
              Tuner X lists all four devices, each with its own ID and a name.
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
            <li>
              Both flywheel surfaces drive the game piece along the arrow.
            </li>
          </ul>
        </Box>
        <p>
          Write down the four IDs, both flywheel inversions, the sensor
          direction, and the CANcoder offset. Save the Tuner X configuration to
          a file. PID tuning starts on the next page and assumes these numbers
          hold.
        </p>
        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/latest/docs/tuner/index.html"
          title="CTRE: Phoenix Tuner X"
          icon={<BookOpen className="h-5 w-5" />}
        />
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
              "The arm CANcoder card is yellow. Why deal with that before you set its ID and sensor direction?",
            options: [
              "A yellow card keeps the device off the list until it is updated",
              "Old firmware still connects and answers, then refuses the configuration you apply",
              "Yellow marks a duplicate ID, so the ID you set would land on another device",
              "Firmware only matters once a robot program owns the bus",
            ],
            correctAnswer: 1,
            explanation:
              "Tuner X and device firmware are versioned together. A device behind on firmware shows up and answers, then refuses a configuration or reports a signal your Phoenix version cannot read. Yellow means a newer version exists, and red is the duplicate ID card. Put every device on the same version before you change any setting.",
          },
          {
            id: 3,
            question:
              "Motor off, facing the device side of the arm, you turn it counterclockwise by hand. What should CANcoder 32 do?",
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
            id: 4,
            question: "What does setting the arm's zero do?",
            options: [
              "Limits how far the arm may travel either side of the reference mark",
              "Names one physical spot as 0 rotations, and the motor measures every position after that from it",
              "Calibrates the motor's top speed",
              "Returns the CANcoder to factory defaults, sensor direction included",
            ],
            correctAnswer: 1,
            explanation:
              "Zero picks the spot on the metal that reads 0 rotations. The motor measures every position target after that from it. A zero set half a turn off shifts all of them by half a turn, so put the reference on the metal and agree it with whoever built the arm.",
          },
          {
            id: 5,
            question:
              "Why record a separate inversion for CAN 21 and CAN 22 on the flywheel?",
            options: [
              "Tuner X refuses to hold the same inversion setting on two TalonFX devices at once",
              "The follower link is already set up, so CAN 22 mirrors CAN 21 on the bench",
              "Each motor sits on a different power rail, so their outputs read backwards",
              "The wheels face each other, so identical inversions send their surfaces opposite ways",
            ],
            correctAnswer: 3,
            explanation:
              "The two wheels sit either side of the game piece. Their shafts turn opposite ways while both surfaces push the piece along your arrow, so the two inversions will not match. Nothing is following anything on this page, so each motor gets its own brief voltage request and its own line in your notes.",
          },
          {
            id: 6,
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
