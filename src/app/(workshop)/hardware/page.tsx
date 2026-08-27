import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import ImageBlock from "@/components/ImageBlock";
import ContentCard from "@/components/ContentCard";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import GlossaryTerm from "@/components/GlossaryTerm";
import DocumentationButton from "@/components/DocumentationButton";
import { BookOpen } from "lucide-react";
import VideoEmbed from "@/components/VideoEmbed";

export default function Hardware() {
  return (
    <PageTemplate
      title="Hardware Setup"
      lede="Workshop 1 runs on CTRE hardware: a Kraken X44, a CANivore, and a CANcoder if your mechanism is the arm. This lesson powers them up, puts them on current firmware, and gets Phoenix Tuner X talking to every one of them. Nothing turns yet. No robot controller, and no code."
      needs={[
        <>
          The mechanism assembled and wired, with a charged battery. See{" "}
          <strong>Mechanism CAD</strong>.
        </>,
        <>
          Phoenix Tuner X installed, from <strong>Prerequisites</strong>, and a
          USB cable to the CANivore.
        </>,
        <>
          <strong>The real hardware.</strong> There is no simulator path through
          this lesson.
        </>,
      ]}
      time="About 15 minutes, longer if the firmware is old"
    >
      <Split>
        <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
          <p>
            Every mechanism here is three parts: a motor, a sensor that knows
            what the mechanism is doing, and a bus to your laptop. Tuner X is
            how you talk to all three.
          </p>
          <p>
            Get this wrong and nothing breaks today. It breaks four lessons
            later: a gain that will not save, a sensor stuck at zero, a motor
            answering to the wrong name.
          </p>
        </div>
        <MarginNote label="If this is new">
          A <GlossaryTerm term="motor">motor</GlossaryTerm> spins. A{" "}
          <GlossaryTerm term="motor controller">motor controller</GlossaryTerm>{" "}
          decides how fast and how far. A{" "}
          <GlossaryTerm term="sensor">sensor</GlossaryTerm> reports what the
          mechanism did. The <GlossaryTerm term="can bus">CAN bus</GlossaryTerm>{" "}
          is the wire all of them talk over. Read past a term you do not know
          yet; each one gets defined where it first matters.
        </MarginNote>
      </Split>

      <LessonSection id="hardware-components" title="The devices">
        <p>
          Find each one on the bench before you plug anything in. Two of them
          look like plain mechanical parts and are not.
        </p>

        <p>
          The arm uses all three. A flywheel has no CANcoder, because it is
          tuned for speed rather than angle, and the encoder inside the motor
          already measures speed. On a flywheel bench, read past the CANcoder
          wherever it comes up.
        </p>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          <ContentCard>
            <ImageBlock
              src="/images/hardware/Kraken44x.png"
              alt="Kraken X44 motor"
              width={250}
              height={200}
              className="mb-4"
            />
            <h3 className="display m-0 mb-3 text-lede">
              <a
                href="https://store.ctr-electronics.com/products/kraken-x44"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline hover:text-[var(--accent)]"
              >
                Kraken X44
              </a>
            </h3>
            <p className="mb-3 text-[var(--tx2)]">
              A brushless motor with its controller built into the back. The{" "}
              <GlossaryTerm term="talonfx">TalonFX</GlossaryTerm> inside runs
              position and velocity loops on the motor itself, a thousand times
              a second.
            </p>
            <p className="text-[var(--tx2)]">
              Free speed is about 125 rotations per second. It also reports its
              own position over the{" "}
              <GlossaryTerm term="can bus">CAN bus</GlossaryTerm>, so the motor
              is a sensor too.
            </p>
          </ContentCard>

          <ContentCard>
            <ImageBlock
              src="/images/hardware/Encoder.png"
              alt="WCP ThroughBore encoder"
              width={250}
              height={200}
              className="mb-4"
            />
            <span className="micro mb-1 block">Arm only</span>
            <h3 className="display m-0 mb-3 text-lede">
              <a
                href="https://store.ctr-electronics.com/products/wcp-throughbore-encoder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline hover:text-[var(--accent)]"
              >
                WCP ThroughBore Encoder
              </a>
            </h3>
            <p className="mb-3 text-[var(--tx2)]">
              An absolute position{" "}
              <GlossaryTerm term="sensor">sensor</GlossaryTerm> that mounts on a
              rotating shaft and reads a magnet. It still knows the arm angle
              after the power has been off all week.
            </p>
            <p className="text-[var(--tx2)]">
              The <GlossaryTerm term="encoder">encoder</GlossaryTerm> inside the
              motor does not. It reads zero wherever it happens to sit at boot.
              The parts list says ThroughBore. The part is a{" "}
              <GlossaryTerm term="cancoder">CANcoder</GlossaryTerm> inside, and
              CANcoder is what the code calls it.
            </p>
          </ContentCard>

          <ContentCard>
            <ImageBlock
              src="/images/hardware/CANivore.png"
              alt="CANivore USB to CAN FD adapter"
              width={250}
              height={200}
              className="mb-4"
            />
            <h3 className="display m-0 mb-3 text-lede">
              <a
                href="https://store.ctr-electronics.com/canivore/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline hover:text-[var(--accent)]"
              >
                CANivore
              </a>
            </h3>
            <p className="mb-3 text-[var(--tx2)]">
              A USB adapter that gives your devices their own CAN FD bus. It
              carries far more data per second than the bus built into the robot
              controller. Swerve drivetrains fill that one up, so they get a
              CANivore.
            </p>
            <p className="text-[var(--tx2)]">
              It is also why Workshop 1 needs no robot. The laptop plugs into
              the CANivore, and the CANivore talks to the devices.
            </p>
          </ContentCard>
        </div>
      </LessonSection>

      <LessonSection id="connecting-to-your-device" title="Connect Tuner X">
        <Split>
          <div className="measure flex flex-col gap-pad [&>p]:m-0 [&>p]:prose-body">
            <p>
              Power the mechanism first, then run USB from the laptop to the
              CANivore. There is no team number to type and no robot to find.
            </p>
          </div>
          <MarginNote label="One toggle, two positions">
            Only one program owns the bus at a time. CANivore USB stays checked
            for the whole of Workshop 1, because the laptop owns it here. It
            comes back off in <strong>Hardware Simulation</strong>, the first
            lesson where your own code drives the devices.
          </MarginNote>
        </Split>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Open{" "}
            <GlossaryTerm term="phoenix tuner x">Phoenix Tuner X</GlossaryTerm>{" "}
            and check <strong>CANivore USB</strong>.
          </li>
          <li>
            Set <strong>Team # or IP</strong> to <code>localhost</code>.
          </li>
          <li>
            The CANivore should appear in the device list within a second.
          </li>
          <li>
            Rename it to <code>canivore</code>. Every later lesson and every
            code sample uses that name.
          </li>
          <li>
            Open it and confirm the motor is listed under it, along with the
            CANcoder if you built the arm.
          </li>
        </ol>

        <p>
          A CANivore that never shows up is usually running firmware older than
          the Tuner X you installed. Updating it is the next section.
        </p>

        <VideoEmbed id="TkScJADvD-Y" title="CANivore setup" />
      </LessonSection>

      <LessonSection
        id="updating-your-ctre-products"
        title="Update the firmware"
      >
        <p>
          Tuner X and device firmware are versioned together. A device on old
          firmware still connects and still answers. It then refuses a
          configuration, or reports a signal your Phoenix version cannot read.
        </p>

        <ol className="ml-5 list-decimal space-y-3">
          <li>
            Select one device, then use the batch update icon to flash every
            device of that model at once.
          </li>
          <li>Update the CANivore itself the same way.</li>
          <li>
            Put every device on the same version. Mixed versions on one bus give
            you failures that come and go.
          </li>
          <li>Check the card colours once the flashing finishes.</li>
        </ol>

        <p>
          Card colour is the fastest read on the screen. The same meaning is
          printed under the device name, in words.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse text-note">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rule)" }}>
                <th className="px-3 py-2 text-left">Card</th>
                <th className="px-3 py-2 text-left">Meaning</th>
              </tr>
            </thead>
            <tbody style={{ color: "var(--tx2)" }}>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <strong style={{ color: "var(--ok)" }}>Green</strong>
                </td>
                <td className="px-3 py-2">Device has the latest firmware.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <strong style={{ color: "var(--tuner-yellow)" }}>
                    Yellow
                  </strong>
                </td>
                <td className="px-3 py-2">A newer version is available.</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <strong style={{ color: "var(--tuner-purple)" }}>
                    Purple
                  </strong>
                </td>
                <td className="px-3 py-2">
                  Unexpected or beta firmware version.
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--rule-soft)" }}>
                <td className="px-3 py-2">
                  <strong style={{ color: "var(--err)" }}>Red</strong>
                </td>
                <td className="px-3 py-2">
                  Duplicate ID. Two devices answer to the same number, and{" "}
                  <a href="/mechanism-setup" className="underline">
                    Motor Setup
                  </a>{" "}
                  sorts that out.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">
                  <strong style={{ color: "var(--tuner-blue)" }}>Blue</strong>
                </td>
                <td className="px-3 py-2">
                  Tuner X could not download the list of firmware versions.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <VideoEmbed id="aktcCtcrEyY" title="Motor update process" />
      </LessonSection>

      <LessonSection id="check-your-work" title="Check your work">
        <p>
          Power cycle the bench: battery off, USB out, then both back on. The
          firmware and the CANivore name are stored on the devices themselves,
          so none of it should need doing twice.
        </p>

        <Box variant="alert-success" title="You should see">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              The CANivore reconnects as <code>canivore</code>, with Tuner X
              still pointed at <code>localhost</code>.
            </li>
            <li>
              The motor is listed under it, and the CANcoder too on the arm.
            </li>
            <li>Every device card is green.</li>
            <li>
              On the arm, turning the mechanism by hand changes the CANcoder
              position in Tuner X.
            </li>
          </ul>
        </Box>

        <p>
          A red card here is expected on the flywheel bench. Both motors ship on
          the same factory ID, so both answer to it, and neither can be
          addressed on its own until you split them. That is the first thing{" "}
          <a href="/mechanism-setup" className="underline">
            Motor Setup &amp; CAN IDs
          </a>{" "}
          does, and it is why nothing has been asked to turn yet.
        </p>

        <p>
          Write down which device is which while you can still tell them apart
          by where they are bolted. Motor Setup begins by giving each one a
          number, and that goes faster when nobody is guessing.
        </p>

        <DocumentationButton
          href="https://v6.docs.ctr-electronics.com/en/stable/docs/tuner/"
          title="CTRE: Phoenix Tuner X"
          icon={<BookOpen className="h-5 w-5" />}
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question: "Which devices does the arm build use in this workshop?",
            options: [
              "Power distribution hub, motor, and joystick",
              "roboRIO, battery, and radio",
              "Kraken X44 motor, WCP ThroughBore encoder, and CANivore",
              "Pneumatic hub, compressor, and solenoid",
            ],
            correctAnswer: 2,
            explanation:
              "A Kraken X44 with its TalonFX controller built in, a WCP ThroughBore encoder for absolute position, and a CANivore for the CAN FD bus.",
          },
          {
            id: 2,
            question: "What does the CANivore do?",
            options: [
              "It is a USB adapter that gives motors and sensors a CAN FD bus",
              "It stores robot code and configuration files",
              "It provides power to all motors",
              "It is a backup robot controller",
            ],
            correctAnswer: 0,
            explanation:
              "The CANivore plugs into USB and runs a CAN FD bus for the motors and sensors. It is also how this workshop drives real hardware from a laptop, with no robot controller.",
          },
          {
            id: 3,
            question: "What does a green device card in Tuner X mean?",
            options: [
              "Tuner X could not read the firmware list",
              "The device needs a firmware update",
              "The device has a duplicate ID",
              "The device has the latest firmware",
            ],
            correctAnswer: 3,
            explanation:
              "Green means the device is on the latest firmware. Yellow means an update is available, and red means two devices share an ID.",
          },
        ]}
      />
    </PageTemplate>
  );
}
