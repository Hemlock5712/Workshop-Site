import PageTemplate from "@/components/PageTemplate";
import ImageBlock from "@/components/ImageBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import ContentCard from "@/components/ContentCard";
import Box from "@/components/Box";
import Quiz from "@/components/Quiz";
import GlossaryTerm from "@/components/GlossaryTerm";
import {
  AlertTriangle,
  Palette,
  Lightbulb,
  Bot,
  Target,
  Wrench,
  Smartphone,
  Zap,
} from "lucide-react";

export default function Hardware() {
  return (
    <PageTemplate
      title="Hardware Setup"
      previousPage={{ href: "/mechanism-cad", title: "Mechanism CAD" }}
      nextPage={{ href: "/project-setup", title: "Project Setup" }}
    >
      {/* Beginner-Friendly Introduction */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-400 dark:border-blue-900 p-6 mb-8">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
          <Bot className="w-5 h-5" />
          New to Robot Hardware? Start Here!
        </h3>
        <p className="text-blue-800 dark:text-blue-300 mb-3">
          Think of your robot like a remote control car, but much smarter. Just
          like a car needs:
        </p>
        <ul className="list-disc list-inside text-blue-800 dark:text-blue-300 space-y-2 mb-3">
          <li>
            <strong>
              <GlossaryTerm term="motor">Motors</GlossaryTerm>
            </strong>{" "}
            - like the wheels that make it move
          </li>
          <li>
            <strong>
              <GlossaryTerm term="motor controller">Controllers</GlossaryTerm>
            </strong>{" "}
            - like the remote control that tells motors what to do
          </li>
          <li>
            <strong>
              <GlossaryTerm term="sensor">Sensors</GlossaryTerm>
            </strong>{" "}
            - like a speedometer that tells you how fast you&apos;re going
          </li>
          <li>
            <strong>A brain</strong> - like the electronics inside that process
            everything
          </li>
        </ul>
        <p className="text-blue-800 dark:text-blue-300">
          This page explains the specific robot parts you&apos;ll use in this
          workshop and what each one does. Don&apos;t worry if terms like &quot;
          <GlossaryTerm term="can bus">CAN bus</GlossaryTerm>&quot; or &quot;
          <GlossaryTerm term="encoder">encoder</GlossaryTerm>&quot; sound
          confusing - we&apos;ll explain everything in simple terms!
        </p>
      </div>

      {/* Introduction */}
      <KeyConceptSection
        title="Hardware Setup - Building the Foundation"
        description="Overview of the motors, sensors, and controllers you'll connect for this workshop."
        concept="Solid hardware configuration enables precise and reliable robot control."
      />

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Hardware Components
        </h2>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          <ContentCard>
            <ImageBlock
              src="/images/hardware/Kraken44x.png"
              alt="Kraken Motor"
              width={250}
              height={200}
              className="mb-4"
            />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              <a
                href="https://store.ctr-electronics.com/products/kraken-x44"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 underline dark:text-primary-400 dark:hover:text-primary-300"
              >
                Kraken X44 Brushless Motor
              </a>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              <strong>What it is:</strong> A powerful{" "}
              <GlossaryTerm term="motor">motor</GlossaryTerm> with a built-in
              &quot;brain&quot; (
              <GlossaryTerm term="motor controller">controller</GlossaryTerm>)
              that makes it smart. Instead of just spinning when you apply
              power, it can precisely control how fast it spins and exactly
              where it stops.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              <strong>Why it&apos;s special:</strong> Most motors need a
              separate controller box. The Kraken has the controller built right
              in, making wiring simpler and saving space on your robot.
            </p>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
              <p className="text-sm text-primary-800 dark:text-primary-300 mb-2">
                <strong>What you need to know:</strong>
              </p>
              <ul className="text-sm text-primary-800 dark:text-primary-300 list-disc list-inside space-y-1">
                <li>Strong enough to lift heavy arms and spin flywheels</li>
                <li>Spins up to 100 times per second (very fast!)</li>
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
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              <a
                href="https://store.ctr-electronics.com/products/wcp-throughbore-encoder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 underline dark:text-primary-400 dark:hover:text-primary-300"
              >
                CANcoder – Position Sensor
              </a>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              <strong>What it is:</strong> A{" "}
              <GlossaryTerm term="sensor">sensor</GlossaryTerm> that measures
              exactly where a rotating part is positioned. It can tell you
              &quot;the arm is at 45 degrees&quot; with high precision.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              <strong>Why you need it:</strong> The{" "}
              <GlossaryTerm term="encoder">encoder</GlossaryTerm> built into
              your motor gets set to 0 degrees when it is turned on. This can
              cause issues if you don&apos;t start the arm in the same position.
              However, the CANcoder uses a magnet and is able to remember its
              position.
            </p>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
              <p className="text-sm text-primary-800 dark:text-primary-300 mb-2">
                <strong>What you need to know:</strong>
              </p>
              <ul className="text-sm text-primary-800 dark:text-primary-300 list-disc list-inside space-y-1">
                <li>
                  Remembers position even when robot is turned off (absolute
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
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              <a
                href="https://store.ctr-electronics.com/canivore/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 underline dark:text-primary-400 dark:hover:text-primary-300"
              >
                CANivore – Communication Hub
              </a>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              <strong>What it is:</strong> A device that creates a high-speed
              &quot;conversation network&quot; for all your robot parts. Think
              of it like a Wi-Fi router, but instead of connecting phones and
              laptops, it connects motors and sensors.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              <strong>Why you need it:</strong> Just like you can&apos;t have 10
              people all talking at once in a small room, robot parts need an
              organized way to communicate. The CANivore gives them a fast,
              reliable connection so they can all talk to your computer without
              getting confused. Often times needed with swerve as roboRIO would
              be overwhelmed with data.
            </p>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
              <p className="text-sm text-primary-800 dark:text-primary-300 mb-2">
                <strong>What you need to know:</strong>
              </p>
              <ul className="text-sm text-primary-800 dark:text-primary-300 list-disc list-inside space-y-1">
                <li>Connects to your computer via USB cable</li>
                <li>
                  All motors and sensors plug into this with{" "}
                  <GlossaryTerm term="can bus">CAN</GlossaryTerm> wires
                </li>
                <li>
                  Has LED lights that show if everything is working correctly
                </li>
                <li>
                  Allows for faster communication than{" "}
                  <GlossaryTerm term="roborio">roboRIO</GlossaryTerm>
                </li>
              </ul>
            </div>
          </ContentCard>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Why We Choose CTRE Hardware
        </h2>

        <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            CTRE&apos;s Unique Advantages
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-2">
                Full <GlossaryTerm term="pid">PID</GlossaryTerm> Control
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Complete <GlossaryTerm term="pid">PID</GlossaryTerm>{" "}
                implementation with kP, kI, kD, and advanced filtering options
                that other vendors don&apos;t provide.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-[var(--foreground)] mb-2">
                <GlossaryTerm term="feedforward">Feedforward (FF)</GlossaryTerm>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Built-in{" "}
                <GlossaryTerm term="feedforward">feedforward</GlossaryTerm>{" "}
                control for gravity compensation and velocity control that
                competitors lack.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">
                <GlossaryTerm term="motion magic">
                  Motion Profiling
                </GlossaryTerm>
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Advanced{" "}
                <GlossaryTerm term="motion magic">Motion Magic</GlossaryTerm>{" "}
                and motion profiling capabilities for smooth, controlled
                movements.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-2">
                Rotations Units
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Motor positions measured in intuitive rotations instead of
                confusing encoder ticks or radians.
              </p>
            </div>
          </div>

          {/* Phoenix Software Resources - moved inside CTRE advantages */}
          <div className="mt-8">
            <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Phoenix Software Resources
            </h4>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="https://v6.docs.ctr-electronics.com/en/stable/docs/canivore/canivore-intro.html"
                  className="block text-primary-600 underline hover:no-underline hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → CANivore Introduction
                </a>
                <a
                  href="https://v6.docs.ctr-electronics.com/"
                  className="block text-primary-600 underline hover:no-underline hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Phoenix 6 Documentation
                </a>
                <a
                  href="https://v6.docs.ctr-electronics.com/en/stable/docs/api-reference/"
                  className="block text-primary-600 underline hover:no-underline hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Phoenix 6 API Reference
                </a>
                <a
                  href="https://v6.docs.ctr-electronics.com/en/stable/docs/tuner/"
                  className="block text-primary-600 underline hover:no-underline hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  → Phoenix Tuner X Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Connecting to Your Device
        </h2>

        <Box
          variant="alert-warning"
          title="Important Setup Steps"
          icon={<AlertTriangle className="w-5 h-5" />}
        >
          <ol className="list-decimal list-inside space-y-2">
            <li>Plug the computer into CANivore</li>
            <li>Make sure the &quot;CANivore USB&quot; is checked</li>
            <li>Change &quot;Team # or IP&quot; to &quot;localhost&quot;</li>
            <li>Your CANivore should now appear in Phoenix Tuner</li>
            <li>
              For this workshop, please name your CANivore: &quot;canivore&quot;
            </li>
          </ol>
        </Box>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Updating Your CTRE Products
        </h2>

        <ContentCard className="p-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Using Phoenix Tuner
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                ✓
              </span>
              <div>
                <p className="font-medium">
                  Open Phoenix Tuner and connect to your robot
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  If you have issues connecting to your robot,
                  <a
                    href="https://v6.docs.ctr-electronics.com/en/stable/docs/tuner/connecting.html#connecting-tuner"
                    className="text-primary-600 underline hover:no-underline dark:text-primary-400 ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    view this guide
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                ✓
              </span>
              <div>
                <p className="font-medium">
                  Batch update all products of the same model
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Select one of the devices and then click the batch update
                  icons
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                ✓
              </span>
              <div>
                <p className="font-medium">Verify Updates</p>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  The device cards will be green if the firmware is the latest
                </p>
              </div>
            </div>
          </div>
        </ContentCard>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Motor Update Process & Status Colors
        </h2>

        <div>
          <ContentCard className="mx-auto flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
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

            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Use Phoenix Tuner to update your motor firmware. Select devices
              and use the batch update feature to ensure all motors are running
              the latest firmware version.
            </p>
          </ContentCard>
        </div>

        <Box
          variant="alert-info"
          title="Card Colors"
          icon={<Palette className="w-5 h-5" />}
        >
          <p className="mb-3">
            The color of the device cards is helpful as a visual indicator of
            device state. The meaning of the card color is also shown as text
            underneath the device title.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 w-32">
                      Color
                    </th>
                    <th className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-green-700 dark:text-green-400">
                          Green
                        </strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 align-top">
                      Device has latest firmware.
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-purple-500 rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-purple-700 dark:text-purple-400">
                          Purple
                        </strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 align-top">
                      Device has an unexpected/beta firmware version.
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-yellow-700 dark:text-yellow-400">
                          Yellow
                        </strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 align-top">
                      A new firmware version is available.
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-red-500 rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-red-700 dark:text-red-400">
                          Red
                        </strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 align-top">
                      Device has a duplicate ID.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 align-top">
                      <div className="flex items-center whitespace-nowrap">
                        <span className="inline-block w-4 h-4 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        <strong className="text-blue-700 dark:text-primary-400">
                          Blue
                        </strong>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 align-top">
                      Failed to retrieve list of available firmware.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Box
            variant="alert-tip"
            title="Tip"
            icon={<Lightbulb className="w-5 h-5" />}
            className="mt-4"
          >
            Always update all motors to the same firmware version for
            consistency and use batch update to save time when updating multiple
            devices.
          </Box>
        </Box>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Having Issues?
        </h2>

        <p className="text-slate-600 dark:text-slate-300">
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
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Let&apos;s Run Some Motors!
        </h2>

        <div className="bg-primary-100 dark:bg-primary-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-300 mb-4">
            Testing Motor Movement
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-3">
                Quick Test Steps:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-[var(--foreground)]">
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

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-[var(--border)]">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Safety First
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
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
      </section>

      <Quiz
        title="Knowledge Check"
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
              "CTRE hardware offers complete PID implementation with kP, kI, kD, built-in feedforward control for gravity and velocity compensation, advanced Motion Magic profiling, and uses intuitive rotation units instead of encoder ticks or radians.",
          },
          {
            id: 2,
            question:
              "What is the purpose of the CANivore in your robot's hardware setup?",
            options: [
              "It provides power to all motors",
              "It's a backup controller for the roboRIO",
              "It's a USB-to-CAN FD interface that adds a new CAN FD network",
              "It stores robot code and configuration files",
            ],
            correctAnswer: 2,
            explanation:
              "CANivore is a USB-to-CAN FD interface that adds a new CAN FD network to your PC or roboRIO, enabling precise control of CTRE devices with better bus utilization (2X-8X) and supporting hardware-attached simulation.",
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
