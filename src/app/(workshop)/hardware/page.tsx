import PageTemplate from "@/components/PageTemplate";
import { MarginNote, Split } from "@/components/lesson/Prose";
import LessonSection from "@/components/lesson/LessonSection";
import ImageBlock from "@/components/ImageBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import ContentCard from "@/components/ContentCard";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import GlossaryTerm from "@/components/GlossaryTerm";
import { Target, Wrench, Smartphone, Zap } from "lucide-react";

export default function Hardware() {
  return (
    <PageTemplate
      title="Wire it, name it, and make sure it answers"
      emphasis="make sure it answers"
      lede="Before any code, every device on the bus needs power, a unique CAN ID, current firmware, and a name you chose. Phoenix Tuner X does all four, and this is the page that owns the CANivore-USB toggle every later lesson refers back to."
      needs={[
        <>
          The mechanism assembled and wired, with a charged battery — see{" "}
          <strong>Mechanism CAD</strong> if you are building one.
        </>,
        <>
          Phoenix Tuner X installed, from <strong>Prerequisites</strong>, and a
          USB cable to the CANivore.
        </>,
        <>
          <strong>The real hardware.</strong> There is no simulator path through
          this page — it is the page where you confirm the devices exist.
        </>,
      ]}
      time="About 45 minutes, longer if firmware needs updating"
    >
      {/* Introduction. The beginner floor is in the rail beside it rather
          than in the column: the room is mixed, and a second-year student does
          not need to be told what a motor is before being told what to wire. */}
      <Split>
        <KeyConceptSection
          title="Hardware Setup: Building the Foundation"
          description="Overview of the motors, sensors, and controllers you'll connect for this workshop."
          concept="Solid hardware configuration enables precise and reliable robot control."
        />
        <MarginNote label="IF THIS IS NEW">
          Think of your robot like a remote control car, but much smarter. Just
          like a car, it needs <GlossaryTerm term="motor">motors</GlossaryTerm>{" "}
          — the wheels that make it move;{" "}
          <GlossaryTerm term="motor controller">controllers</GlossaryTerm> — the
          remote control that tells motors what to do;{" "}
          <GlossaryTerm term="sensor">sensors</GlossaryTerm> — a speedometer
          that tells you how fast you are going; and a brain, the electronics
          inside that process everything. If terms like{" "}
          <GlossaryTerm term="can bus">CAN bus</GlossaryTerm> or{" "}
          <GlossaryTerm term="encoder">encoder</GlossaryTerm> are new to you,
          that is fine — this page explains each one as it comes up.
        </MarginNote>
      </Split>

      <LessonSection id="hardware-components" title="Hardware Components">
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          <ContentCard>
            <ImageBlock
              src="/images/hardware/Kraken44x.png"
              alt="Kraken Motor"
              width={250}
              height={200}
              className="mb-4"
            />
            <h3 className="display m-0 mb-3 text-lede">
              <a
                href="https://store.ctr-electronics.com/products/kraken-x44"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:text-[var(--accent)] underline"
              >
                Kraken X44 Brushless Motor
              </a>
            </h3>
            <p className="text-[var(--tx2)] mb-3">
              <strong>{"What it is: "}</strong> A{" "}
              <GlossaryTerm term="motor">motor</GlossaryTerm> with a built-in
              &quot;brain&quot; (
              <GlossaryTerm term="motor controller">controller</GlossaryTerm>).
              Instead of just spinning when you apply power, it can precisely
              control how fast it spins and exactly where it stops.
            </p>
            <p className="text-[var(--tx2)] mb-3">
              <strong>Why it&apos;s special:</strong> Most motors need a
              separate controller box. The Kraken has the controller built right
              in, making wiring simpler and saving space on your robot.
            </p>
            <div className="bg-[var(--bg2)] p-3 rounded-lg">
              <p className="text-note text-[var(--tx2)] mb-2">
                <strong>What you need to know:</strong>
              </p>
              <ul className="text-note text-[var(--tx2)] list-disc list-inside space-y-1">
                <li>Strong enough to lift heavy arms and spin flywheels</li>
                <li>Spins up to about 125 times per second</li>
                <li>
                  Has built-in position sensing so it knows exactly where it is
                </li>
                <li>
                  Communicates with your code through a wire called{" "}
                  <GlossaryTerm term="can bus">CAN bus</GlossaryTerm>
                </li>
              </ul>
            </div>
          </ContentCard>

          <ContentCard>
            <ImageBlock
              src="/images/hardware/Encoder.png"
              alt="CANcoder"
              width={250}
              height={200}
              className="mb-4"
            />
            <h3 className="display m-0 mb-3 text-lede">
              <a
                href="https://store.ctr-electronics.com/products/wcp-throughbore-encoder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:text-[var(--accent)] underline"
              >
                WCP ThroughBore Encoder (CANcoder) – Position Sensor
              </a>
            </h3>
            <p className="text-[var(--tx2)] mb-3">
              <strong>{"What it is: "}</strong> A{" "}
              <GlossaryTerm term="sensor">sensor</GlossaryTerm> that measures
              exactly where a rotating part is positioned. It can tell you
              &quot;the arm is at 45 degrees.&quot; (The part on the parts list
              is the WCP ThroughBore; it&apos;s a CANcoder inside, so the code
              calls it a CANcoder.)
            </p>
            <p className="text-[var(--tx2)] mb-3">
              <strong>{"Why you need it: "}</strong> The{" "}
              <GlossaryTerm term="encoder">encoder</GlossaryTerm> built into
              your motor gets set to 0 degrees every time it powers on, which
              causes problems if the arm doesn&apos;t start in the same position
              every time. The CANcoder uses a magnet, so it remembers its
              position.
            </p>
            <div className="bg-[var(--bg2)] p-3 rounded-lg">
              <p className="text-note text-[var(--tx2)] mb-2">
                <strong>What you need to know:</strong>
              </p>
              <ul className="text-note text-[var(--tx2)] list-disc list-inside space-y-1">
                <li>
                  Remembers position even when the robot is turned off (absolute
                  position)
                </li>
                <li>Mounts directly on rotating shafts</li>
                <li>
                  Connects through{" "}
                  <GlossaryTerm term="can bus">CAN bus</GlossaryTerm> like the
                  Kraken motor
                </li>
                <li>Works with hex shafts commonly used in FRC</li>
              </ul>
            </div>
          </ContentCard>

          <ContentCard>
            <ImageBlock
              src="/images/hardware/CANivore.png"
              alt="CANivore"
              width={250}
              height={200}
              className="mb-4"
            />
            <h3 className="display m-0 mb-3 text-lede">
              <a
                href="https://store.ctr-electronics.com/canivore/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:text-[var(--accent)] underline"
              >
                CANivore – Communication Hub
              </a>
            </h3>
            <p className="text-[var(--tx2)] mb-3">
              <strong>{"What it is: "}</strong> A device that creates a
              high-speed &quot;conversation network&quot; for all your robot
              parts. Think of it like a Wi-Fi router, but instead of connecting
              phones and laptops, it connects motors and sensors.
            </p>
            <p className="text-[var(--tx2)] mb-3">
              <strong>{"Why you need it: "}</strong> Just like you can&apos;t
              have 10 people all talking at once in a small room, robot parts
              need an organized way to communicate. The CANivore runs{" "}
              <strong>CAN FD</strong> (a faster version of the CAN network with
              room for much more data) so everything can talk without getting
              confused. Swerve drivetrains often need one because the robot
              controller&apos;s built-in network would be overwhelmed with data.
            </p>
            <div className="bg-[var(--bg2)] p-3 rounded-lg">
              <p className="text-note text-[var(--tx2)] mb-2">
                <strong>What you need to know:</strong>
              </p>
              <ul className="text-note text-[var(--tx2)] list-disc list-inside space-y-1">
                <li>Connects to your computer via USB cable</li>
                <li>
                  All motors and sensors plug into this with{" "}
                  <GlossaryTerm term="can bus">CAN</GlossaryTerm> wires
                </li>
                <li>
                  Has LED lights that show if everything is working correctly
                </li>
                <li>
                  Faster communication (CAN FD) than the robot controller&apos;s
                  built-in CAN network, on SystemCore or the older{" "}
                  <GlossaryTerm term="roborio">roboRIO</GlossaryTerm>
                </li>
              </ul>
            </div>
          </ContentCard>
        </div>
      </LessonSection>

      <LessonSection
        id="why-we-choose-ctre-hardware"
        title="Why We Choose CTRE Hardware"
      >
        <div className="bg-[var(--bg2)] rounded-lg p-8 border border-[var(--rule)]">
          <h3 className="display m-0 mb-4 flex items-center gap-2 text-lede">
            <Target className="w-5 h-5" />
            CTRE&apos;s Unique Advantages
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-[var(--bg2)] p-4 rounded-lg border border-[var(--rule)]">
              <h4
                className="display m-0 mb-2 text-aside"
                style={{ color: "var(--accent)" }}
              >
                Full <GlossaryTerm term="pid">PID</GlossaryTerm> Control
              </h4>
              <p className="text-note text-[var(--tx2)]">
                Complete <GlossaryTerm term="pid">PID</GlossaryTerm>{" "}
                implementation with kP, kI, kD, and advanced filtering options
                that other vendors don&apos;t provide.
              </p>
            </div>
            <div className="bg-[var(--bg2)] p-4 rounded-lg border border-[var(--rule)]">
              <h4 className="display m-0 mb-2 text-aside">
                <GlossaryTerm term="feedforward">Feedforward (FF)</GlossaryTerm>
              </h4>
              <p className="text-note text-[var(--tx2)]">
                Built-in{" "}
                <GlossaryTerm term="feedforward">feedforward</GlossaryTerm>{" "}
                control for gravity compensation and velocity control that
                competitors lack.
              </p>
            </div>
            <div className="bg-[var(--bg2)] p-4 rounded-lg border border-[var(--rule)]">
              <h4
                className="display m-0 mb-2 text-aside"
                style={{ color: "var(--ok)" }}
              >
                <GlossaryTerm term="motion magic">
                  Motion Profiling
                </GlossaryTerm>
              </h4>
              <p className="text-note text-[var(--tx2)]">
                <GlossaryTerm term="motion magic">Motion Magic</GlossaryTerm>{" "}
                and motion profiling for smooth, controlled movements.
              </p>
            </div>
            <div className="bg-[var(--bg2)] p-4 rounded-lg border border-[var(--rule)]">
              <h4
                className="display m-0 mb-2 text-aside"
                style={{ color: "var(--accent)" }}
              >
                Rotations Units
              </h4>
              <p className="text-note text-[var(--tx2)]">
                Motor positions measured in rotations instead of encoder ticks
                or radians.
              </p>
            </div>
          </div>

          {/* Phoenix Software Resources - moved inside CTRE advantages */}
          <div className="mt-8">
            <h4 className="display m-0 mb-4 flex items-center gap-2 text-lede">
              <Wrench className="w-5 h-5" />
              Phoenix Software Resources
            </h4>
            <div className="bg-[var(--bg2)] rounded-lg p-6 border border-[var(--rule)]">
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="https://v6.docs.ctr-electronics.com/en/stable/docs/canivore/canivore-intro.html"
                  className="block text-[var(--accent)] underline hover:no-underline hover:text-[var(--accent)] hover:text-[var(--accent)] font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → CANivore Introduction
                </a>
                <a
                  href="https://v6.docs.ctr-electronics.com/"
                  className="block text-[var(--accent)] underline hover:no-underline hover:text-[var(--accent)] hover:text-[var(--accent)] font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Phoenix 6 Documentation
                </a>
                <a
                  href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/"
                  className="block text-[var(--accent)] underline hover:no-underline hover:text-[var(--accent)] hover:text-[var(--accent)] font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Phoenix 6 API Reference
                </a>
                <a
                  href="https://v6.docs.ctr-electronics.com/en/stable/docs/tuner/"
                  className="block text-[var(--accent)] underline hover:no-underline hover:text-[var(--accent)] hover:text-[var(--accent)] font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Phoenix Tuner X Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </LessonSection>

      <LessonSection
        id="connecting-to-your-device"
        title="Connecting to Your Device"
      >
        <Box variant="alert-warning" title="Important Setup Steps">
          <ol className="list-decimal list-inside space-y-2">
            <li>Plug the computer into the CANivore</li>
            <li>
              Make sure &quot;CANivore USB&quot; is checked. It is one toggle
              with two positions, and you will flip it back later — the full
              rule is on{" "}
              <a
                href="/mechanism-setup#canivore-usb"
                className="underline font-medium"
              >
                Mechanism Setup
              </a>
              .
            </li>
            <li>Change &quot;Team # or IP&quot; to &quot;localhost&quot;</li>
            <li>Your CANivore should now appear in Phoenix Tuner</li>
            <li>
              For this workshop, please name your CANivore &quot;canivore&quot;
            </li>
          </ol>
        </Box>
      </LessonSection>

      <LessonSection
        id="updating-your-ctre-products"
        title="Updating Your CTRE Products"
      >
        <ContentCard>
          <h3 className="display m-0 mb-4 text-lede">Using Phoenix Tuner</h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
                ✓
              </span>
              <div>
                <p className="font-medium">
                  Open Phoenix Tuner and connect to your robot
                </p>
                <p className="text-[var(--tx2)] text-note">
                  If you have issues connecting to your robot,
                  <a
                    href="https://v6.docs.ctr-electronics.com/en/stable/docs/tuner/connecting.html#connecting-tuner"
                    className="text-[var(--accent)] underline hover:no-underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view this guide
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
                ✓
              </span>
              <div>
                <p className="font-medium">
                  Batch update all products of the same model
                </p>
                <p className="text-[var(--tx2)] text-note">
                  Select one of the devices and then click the batch update
                  icons
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="bg-[var(--accent)] text-[var(--accent-ink)] rounded-full w-6 h-6 flex items-center justify-center text-note font-bold">
                ✓
              </span>
              <div>
                <p className="font-medium">Verify Updates</p>
                <p className="text-[var(--tx2)] text-note">
                  The device cards will be green if the firmware is the latest
                </p>
              </div>
            </div>
          </div>
        </ContentCard>
      </LessonSection>

      <LessonSection
        id="motor-update-process-status-colors"
        title="Motor Update Process & Status Colors"
      >
        <div>
          <ContentCard className="mx-auto flex flex-col gap-4">
            <h3 className="display m-0 flex items-center gap-2 text-lede">
              <Smartphone className="w-5 h-5" />
              How to Update Motors
            </h3>

            <iframe
              src="https://www.youtube.com/embed/aktcCtcrEyY"
              title="Motor Update Process"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full aspect-video rounded-lg"
            />

            <p className="text-[var(--tx2)] text-note">
              Use Phoenix Tuner to update your motor firmware. Select devices
              and use batch update to get every motor on the latest firmware.
            </p>
          </ContentCard>
        </div>

        <Box variant="alert-info" title="Card Colors">
          <p className="mb-3">
            The color of the device cards is a quick visual indicator of device
            state. The meaning of the card color is also shown as text
            underneath the device title.
          </p>

          <div className="bg-[var(--bg2)] rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--rule)]">
                    <th className="py-2 px-3 font-semibold text-[var(--tx)] w-32">
                      Color
                    </th>
                    <th className="py-2 px-3 font-semibold text-[var(--tx)]">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="text-note">
                  <tr className="border-b border-[var(--rule-soft)]">
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-[var(--bg2)] rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-[var(--ok)]">Green</strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[var(--tx2)] align-top">
                      Device has latest firmware.
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--rule-soft)]">
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-[var(--bg2)] rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-[var(--accent)]">Purple</strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[var(--tx2)] align-top">
                      Device has an unexpected/beta firmware version.
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--rule-soft)]">
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-[var(--bg2)] rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-[var(--accent)]">Yellow</strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[var(--tx2)] align-top">
                      A new firmware version is available.
                    </td>
                  </tr>
                  <tr className="border-b border-[var(--rule-soft)]">
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-[var(--bg2)] rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-[var(--err)]">Red</strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[var(--tx2)] align-top">
                      Device has a duplicate ID.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-[var(--bg2)] rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-[var(--accent)]">Blue</strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[var(--tx2)] align-top">
                      Failed to retrieve list of available firmware.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Box variant="alert-tip" title="Tip" className="mt-4">
            Always update all motors to the same firmware version for
            consistency, and use batch update to save time when updating
            multiple devices.
          </Box>
        </Box>
      </LessonSection>

      <LessonSection id="having-issues" title="Having Issues?">
        <p className="text-[var(--tx2)]">
          If you are having issues connecting to your CANivore or other devices,
          make sure to update your CANivore firmware.
        </p>

        <iframe
          src="https://www.youtube.com/embed/TkScJADvD-Y"
          title="CANivore Setup"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video rounded-lg"
        />
      </LessonSection>

      <LessonSection id="let-s-run-some-motors" title="Let's Run Some Motors">
        <div className="module" style={{ borderColor: "var(--accent)" }}>
          <h3
            className="display m-0 mb-4 text-aside"
            style={{ color: "var(--accent)" }}
          >
            Testing Motor Movement
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="display m-0 mb-3 text-aside">Quick Test Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-[var(--tx)]">
                <li>Open up your motor in Phoenix Tuner</li>
                <li>
                  Click <strong>Config</strong>
                </li>
                <li>Click the three dots</li>
                <li>
                  Click <strong>Factory Default</strong>
                </li>
                <li>
                  Set the drop-down to <strong>Voltage Out</strong>
                </li>
                <li>
                  Click <strong>DISABLED</strong> to enable
                </li>
                <li>Apply voltage to test the motor</li>
              </ol>
            </div>

            <div className="bg-[var(--bg2)] p-4 rounded-lg border border-[var(--rule)]">
              <h4 className="display m-0 mb-2 flex items-center gap-2 text-aside">
                <Zap className="w-4 h-4" />
                Safety First
              </h4>
              <p className="text-note text-[var(--tx2)]">
                Always start with low voltage values when testing motors. Make
                sure your mechanism can move freely and won&apos;t cause damage.
              </p>
            </div>
          </div>
        </div>

        <iframe
          src="https://www.youtube.com/embed/cDWF3bj1Juk"
          title="Motor Test"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video rounded-lg"
        />
      </LessonSection>

      <Quiz
        questions={[
          {
            id: 1,
            question:
              "What makes CTRE hardware unique compared to other motor controllers?",
            options: [
              "It's cheaper than all other motor controllers",
              "Full PID control, feedforward, motion profiling, and rotations units",
              "It only works with specific robot designs",
              "It requires less power than other controllers",
            ],
            correctAnswer: 1,
            explanation:
              "CTRE hardware offers a complete PID implementation with kP, kI, kD, built-in feedforward control for gravity and velocity compensation, advanced Motion Magic profiling, and intuitive rotation units instead of encoder ticks or radians.",
          },
          {
            id: 2,
            question:
              "What is the purpose of the CANivore in your robot's hardware setup?",
            options: [
              "It provides power to all motors",
              "It's a backup robot controller",
              "It's a USB device that adds a fast CAN FD network for motors and sensors",
              "It stores robot code and configuration files",
            ],
            correctAnswer: 2,
            explanation:
              "CANivore plugs into a USB port and creates a CAN FD network (the faster version of CAN) so all the motors and sensors get a quick, reliable connection. It's also how this workshop runs real hardware from a laptop, without a robot controller.",
          },
          {
            id: 3,
            question:
              "What does a GREEN device card in Phoenix Tuner indicate?",
            options: [
              "The device needs a firmware update",
              "The device has a duplicate ID",
              "The device has the latest firmware",
              "Failed to retrieve firmware information",
            ],
            correctAnswer: 2,
            explanation:
              "A green device card indicates that the device has the latest firmware installed and is ready for use.",
          },
          {
            id: 4,
            question:
              "What are the three main hardware components used in this workshop?",
            options: [
              "roboRIO, battery, and radio",
              "Kraken X44 motor, WCP ThroughBore Encoder, and CANivore",
              "Pneumatic hub, compressor, and solenoid",
              "Power distribution hub, motor, and joystick",
            ],
            correctAnswer: 1,
            explanation:
              "The workshop uses Kraken X44 brushless motors (with integrated Talon FX controller), WCP ThroughBore Encoders (for absolute position sensing), and CANivore (for CAN FD communication).",
          },
          {
            id: 5,
            question:
              "When connecting to your CANivore for the first time, what should you set the 'Team # or IP' field to?",
            options: [
              "Your team number",
              "192.168.1.1",
              "localhost",
              "10.0.0.1",
            ],
            correctAnswer: 2,
            explanation:
              "When connecting to your CANivore via USB, you should set the 'Team # or IP' field to 'localhost' and ensure 'CANivore USB' is checked in Phoenix Tuner X.",
          },
        ]}
      />
    </PageTemplate>
  );
}
