import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import Box from "@/components/Box";
import ImageBlock from "@/components/ImageBlock";
import Quiz from "@/components/Quiz";
import DocumentationButton from "@/components/DocumentationButton";
import { MarginNote, ProseBlock, Split } from "@/components/lesson/Prose";
import { BookOpen } from "lucide-react";
import VideoEmbed from "@/components/VideoEmbed";
import MechanismSelector from "@/components/lesson/MechanismSelector";
import { M, Mech } from "@/components/lesson/Mechanism";
import Link from "next/link";
import { lessonMetadata } from "@/lib/lessonMetadata";

export const metadata = lessonMetadata("/mechanism-setup");

/**
 * Written once, read twice — see `src/data/mechanisms.ts`.
 *
 * The asymmetry here is real and it is the reason this page needed the fork
 * more than any other. An arm has a CANcoder, so it gets a hand test, a zero,
 * and a link to the motor: three sections a flywheel has no hardware for. A
 * flywheel bench has one check, which is that its motor turns the way the
 * code will assume.
 *
 * Before the fork a flywheel student read two full sections of CANcoder
 * procedure for a sensor they do not own, and the page half-knew it: the motor
 * section ended "on a flywheel bench there is no arm to run, so the first
 * movement is the section below", pointing at a section that did not exist.
 * That sentence is gone because the section it wanted now does.
 *
 * The CAN ID table stays shared. It is the bench's numbering convention, and a
 * student setting up either mechanism should see where the other one's IDs
 * sit.
 */

export default function MechanismSetup() {
  return (
    <PageTemplate
      title="Motor Setup & CAN IDs"
      lede="Now set up each device. Every device needs its own CAN ID and the correct configuration, so the software matches the hardware. You prove it by applying a volt or two and checking that the mechanism moves the correct direction. Get this wrong and tuning in the next lessons is impossible."
      needs={[
        <>The mechanism assembled and powered.</>,
        <>
          Phoenix Tuner X connected to the CANivore over USB, firmware current.
        </>,
        <>No robot program running. Tuner X owns the bus here.</>,
      ]}
      time="14 minutes"
    >
      <MechanismSelector />

      <LessonSection id="assign-can-ids" title="Assign every CAN ID">
        <p>
          Factory Default resets inversion and every other setting, but it does
          not reset the CAN ID. If two devices flash together on a blink, they
          share an ID. Change one to any unused ID, give the other its number
          from the table, then come back to the first.
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
              <tr>
                <td className="py-2 pr-4">Flywheel TalonFX</td>
                <td className="py-2 pr-4">
                  <code>21</code>
                </td>
                <td className="py-2">Flywheel motor</td>
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
            Press <strong>Clear Faults</strong>. This clears whatever the last
            session left behind.
          </li>
          <li>
            Click the <strong>Blink</strong> button on the left panel. The
            device that flashes is the one you are about to edit.
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
        <ImageBlock
          src="/images/setup/clear-faults.png"
          alt="Screenshot of the Self Test tab with the Clear Faults button circled."
          caption="Clear Faults is on the Self Test tab, next to Refresh."
        />
        <p>
          A config change does nothing until you press <strong>Apply</strong>,
          the arrow icon above the config list. Its tooltip says &quot;Apply and
          flash configs&quot;. That saves the configs onto the device. It does
          not touch the firmware.
        </p>
        <ImageBlock
          src="/images/setup/apply-configs.png"
          alt="Screenshot of the config panel with the Apply arrow icon circled and its tooltip showing."
          caption="Apply is the arrow icon above the config list."
        />
      </LessonSection>

      <Mech for="arm">
        <LessonSection id="arm-motor-direction" title="Arm motor direction">
          <p>
            Get the motor right first, by hand, before the encoder or any power.
            Factory Default reset its inversion, so you set it here.
          </p>
          <ol className="ml-5 list-decimal space-y-3">
            <li>
              Select the arm TalonFX on <code>31</code> and plot its position.
            </li>
            <li>
              With the motor facing you, turn the arm counterclockwise by hand.
            </li>
            <li>
              The motor&apos;s position must go up. If it goes down, change{" "}
              <code>Inverted</code> in the <strong>Motor Output</strong> config,
              press <strong>Apply</strong>, and repeat the hand test.
            </li>
          </ol>
          <p>
            A motor and an encoder linked while they count in opposite
            directions break every lesson after this one. Do not move on until
            both go up together.
          </p>
        </LessonSection>
      </Mech>

      <Mech for="arm">
        <LessonSection
          id="verify-the-arm-sensor"
          title="Arm encoder direction and zero"
        >
          <p>
            With the motor right, check the encoder the same way. It is what
            every downstream lesson uses.
          </p>
          <VideoEmbed id="mjGn3y19eUc" title="Calibrate and zero the encoder" />
          <ol className="ml-5 list-decimal space-y-3">
            <li>Open the CANcoder device in Tuner X and plot the position.</li>
            <li>
              With the motor facing you, turn the arm counterclockwise by hand.
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
              Turn it 90 degrees counterclockwise. Expect about{" "}
              <code>0.25</code> rotations. A full turn reads <code>1.0</code>.
            </li>
          </ol>
          <p>
            Positions are measured in <strong>rotations</strong>, not degrees.
            One full turn is <code>1.0</code>. Counterclockwise with the motor
            facing you is positive, and every position target from here to
            Motion Magic is written that way. Every photo on this site is taken
            from that side, so your directions match ours.
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
              alt="Arrow showing the counterclockwise rotation direction with the motor facing you"
              width={340}
              height={255}
            />
          </div>

          <p>
            Choose the reference with whoever builds the arm, and mark it if you
            can. If a CANcoder is ever replaced, redo this section on the new
            one.
          </p>
        </LessonSection>
      </Mech>

      <Mech for="arm">
        <LessonSection id="link-the-encoder" title="Link the Encoder">
          <p>
            The motor and the encoder have each been checked on their own. Now
            link them.
          </p>
          <ol className="ml-5 list-decimal space-y-3">
            <li>
              Select the arm motor and scroll down in the config section to the{" "}
              <strong>Feedback</strong> section.
            </li>
            <li>
              Set the <code>Feedback Remote Sensor ID</code> to match your
              CANcoder ID.
            </li>
            <li>
              Set the <code>Feedback Sensor Source</code> to{" "}
              <code>RemoteCANcoder</code>.
            </li>
            <li>
              Press <strong>Apply</strong>. You should hear it chime.
            </li>
          </ol>
          <p>
            Turn the arm counterclockwise by hand. The arm motor&apos;s position
            should now go up along with the CANcoder.
          </p>
          <ImageBlock
            src="/images/setup/link-the-encoder.png"
            alt="Screenshot highlighting the Feedback section of the arm TalonFX configuration."
            caption="In Tuner X, link the encoder to the motor by setting the Feedback Remote Sensor ID."
          />
          <p>
            Leave <code>Sensor To Mechanism Ratio</code> at 1. The CANcoder sits
            on the output shaft, so it already reads the arm. With a Pro license
            you could pick <code>FusedCANcoder</code> or{" "}
            <code>SyncCANcoder</code> instead, and then{" "}
            <code>Rotor To Sensor Ratio</code> must be the gear reduction. If
            you ever change a ratio, do it before you tune, because it changes
            what every gain means. It is saved on the device, so Generate Code
            includes it.
          </p>
        </LessonSection>
      </Mech>

      <LessonSection id="verify-motor-direction" title="Direction under power">
        <p>
          This is the first time anything moves under power. Voltage Out sends a
          fixed voltage and nothing else: no target and no stopping at the end
          of travel.
        </p>
        <Mech for="arm" as="p">
          You have checked the motor, the encoder and the link by hand. Now
          prove it under power: positive voltage has to turn the arm
          counterclockwise.
        </Mech>
        <Mech for="flywheel" as="div">
          <Split>
            <ProseBlock>
              <p>
                A flywheel has no sensor to agree with, so nothing on the bench
                decides which way positive goes. You decide, and then the motor
                has to match. The rule on this robot is that positive runs a
                game piece the way it is meant to travel, so on the shooter
                positive shoots. Seen from the motor side, that is clockwise.
                The motor is the only thing allowed to change from here.
              </p>
            </ProseBlock>
            <MarginNote label="Either way works">
              The wheel does not care which way you call positive, and the code
              would be just as correct with the sign flipped. What costs you is
              having no rule, because then every mechanism that touches a game
              piece has its own sign to remember. An arm gets no such choice:
              counterclockwise is positive.
            </MarginNote>
          </Split>
        </Mech>

        <Box variant="alert-warning" title="Before you enable anything">
          <p>
            Make sure the mechanism is clear of obstacles. Blink the device
            first: voltage goes to a CAN ID, not to the one you meant. Start at
            1 volt and enable for about a second at a time. A Voltage Out
            request runs until you stop it.
          </p>
        </Box>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Select the{" "}
            <Mech for="arm">
              arm TalonFX on <code>31</code>
            </Mech>
            <Mech for="flywheel">
              flywheel TalonFX on <code>21</code>
            </Mech>{" "}
            and set <strong>Control Mode</strong> to <code>VoltageOut</code>,
            the same request your code sends in{" "}
            <Link
              href="/mechanisms#configs-and-requests"
              className="underline font-medium"
            >
              Mechanisms
            </Link>
            .
          </li>
          <li>
            Enter <code>1 V</code> under <strong>Output (Volts)</strong>, click{" "}
            <strong>DISABLED</strong> to enable the device, then disable after
            about a second. Watch the mechanism.
          </li>
          <Mech for="arm" as="li">
            With the motor facing you, the arm should move counterclockwise, and
            the motor&apos;s position should go up.
          </Mech>
          <Mech for="flywheel" as="li">
            The wheel should spin the way it shoots, which is clockwise seen
            from the motor side.
          </Mech>
        </ol>

        <ImageBlock
          src="/images/setup/voltage-out.png"
          maxWidth={420}
          alt="Screenshot of the Control tab with the DISABLED button, the VoltageOut control mode and the Output (Volts) field circled."
          caption="Control tab: VoltageOut, the Output (Volts) field, and the DISABLED button that enables the device."
        />
        <Mech for="arm" as="p">
          If it turns clockwise, stop. Do not fix it here. One of the hand tests
          above was skipped or not applied, so go back and redo them.
        </Mech>
        <Mech for="flywheel" as="p">
          If positive voltage turns it the other way, the motor is configured
          wrong. Fix <code>Inverted</code> in the motor&apos;s{" "}
          <strong>Motor Output</strong> config, apply, and test again.
        </Mech>

        <p>
          Once <code>1 V</code> is right, repeat at <code>3 V</code>. Only the
          speed should change.
          <Mech for="arm">
            {" "}
            An arm that will not budge at <code>1 V</code> is usually fighting
            friction or gravity rather than bad wiring. Climb in single volts
            until it creeps, then stop.
          </Mech>
          <Mech for="flywheel">
            {" "}
            A wheel takes a moment to come up and coasts for a while after you
            disable, so give it time before you call the direction.
          </Mech>{" "}
          You are checking which way it goes, not how fast.
        </p>
        <Mech for="flywheel" as="p">
          The flywheel reads the motor&apos;s own sensor, so its positions and
          speeds are motor rotations. Setting{" "}
          <code>Sensor To Mechanism Ratio</code> in the Feedback configs to the
          gear reduction would make them, and the gains, read at the wheel. This
          course leaves it at 1 to keep things simple. If you do set it, set it
          before you tune, because it changes what every gain means. It is saved
          on the device, so Generate Code includes it.
        </Mech>

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
            <Mech for="arm" as="li">
              The arm reference reads about zero, and a quarter turn reads{" "}
              <code>0.25</code>.
            </Mech>
            <Mech for="arm" as="li">
              Turning the arm counterclockwise by hand raises both the motor and
              the CANcoder readings, and positive voltage on TalonFX 31 drives
              it the same way.
            </Mech>
            <Mech for="flywheel" as="li">
              Positive voltage on TalonFX 21 spins the wheel the way it shoots,
              clockwise from the motor side, and it spins down on its own once
              you disable.
            </Mech>
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
              "Blink goes out to a CAN ID, so two devices flashing means two devices hold that number. Change one to an unused ID, give the other its number from the table, then come back to the first. Tuner X marks a duplicate with a red device card.",
          },
          {
            id: 2,
            only: "arm",
            question:
              "With the motor facing you, you turn the arm counterclockwise by hand. What should CANcoder do?",
            options: [
              "Hold its reading until the motor is powered",
              "Count down",
              "Count up",
              "Snap back to zero",
            ],
            correctAnswer: 2,
            explanation:
              "Counterclockwise is positive on this arm, so the position climbs. A falling reading means the sensor direction is backwards: flip it, apply, and run the hand test again.",
          },
          {
            id: 3,
            only: "arm",
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
            only: "arm",
            question:
              "A CANcoder fails and somebody fits a new one. What has to happen?",
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
          {
            id: 8,
            only: "arm",
            question:
              "The motor and encoder are linked, and at 1 volt the arm turns clockwise. What do you do?",
            options: [
              "Change Inverted on the motor and run it again",
              "Flip the CANcoder's sensor direction",
              "Stop, and redo the motor and encoder hand tests before linking",
              "Enter a negative voltage from here on",
            ],
            correctAnswer: 2,
            explanation:
              "Under power is the last check, not the place to fix direction. Flipping one setting after the link leaves the motor and the encoder counting against each other. Clockwise here means a hand test was skipped or not applied, so redo both and confirm they go up together.",
          },
          {
            id: 5,
            only: "flywheel",
            question:
              "At 1 volt the wheel spins counterclockwise, seen from the motor side. What do you change?",
            options: [
              "Swap the two motor leads at the controller",
              "Invert the motor output, apply, and run the same test again",
              "Enter a negative voltage from here on",
              "Set the sensor direction so the reading agrees with the motor",
            ],
            correctAnswer: 1,
            explanation:
              "Positive has to spin the wheel the way it shoots, and on this shooter that is clockwise from the motor side. The motor output is the only thing you may change to get there. A flywheel has no separate sensor, so there is no sensor direction to set. Entering a negative voltage instead would hide the problem inside every request you write later.",
          },
          {
            id: 6,
            only: "flywheel",
            question:
              "You enable at 1 volt for a second, and the wheel is still turning after you disable. What does that tell you?",
            options: [
              "The neutral mode is wrong and has to be set to brake",
              "The Voltage Out request kept running past the disable",
              "Nothing is wrong. A wheel coasts, so give it time before you call the direction",
              "The motor output is inverted",
            ],
            correctAnswer: 2,
            explanation:
              "A wheel takes a moment to come up and coasts for a while after you disable. Watch it long enough to be sure which way it went. Calling the direction from the first half second is the common mistake here, and it ends with the motor inverted twice.",
          },
          {
            id: 7,
            only: "flywheel",
            question: "Why blink the device before sending it any voltage?",
            options: [
              "Blinking wakes the controller so it will accept a request",
              "Blinking applies the configuration you saved",
              "It returns the motor to its factory defaults first",
              "Voltage goes to a CAN ID, so blinking proves which device is about to move",
            ],
            correctAnswer: 3,
            explanation:
              "A Voltage Out request goes to a CAN ID, not to the mechanism you had in mind. Blinking first is what tells you the ID on screen is the device on the bench. The request also runs until you stop it. A second of checking costs less than a mechanism moving when you did not expect it.",
          },
        ]}
      />
    </PageTemplate>
  );
}
