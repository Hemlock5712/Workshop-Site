import PageTemplate from "@/components/PageTemplate";
import ImageBlock from "@/components/ImageBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import ContentCard from "@/components/ContentCard";
import AlertBox from "@/components/AlertBox";

export default function Hardware() {
  return (
    <PageTemplate
      title="Hardware Setup"
      previousPage={{ href: "/mechanism-cad", title: "Mechanism CAD" }}
      nextPage={{ href: "/project-setup", title: "Project Setup" }}
    >
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
                Kraken X44 Brushless Motor Powered by Talon FX™
              </a>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              Compact brushless motor with integrated Talon FX™ controller.
              Delivers 823W peak power.
            </p>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
              <p className="text-sm text-primary-800 dark:text-primary-300">
                <strong>Key Features:</strong> 4.05Nm stall torque, 85% max
                efficiency, 125.5 RPS max speed, SplineXS shaft, FOC
                commutation, 1kHz PID control, compact 44mm design.
              </p>
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
                WCP ThroughBore Encoder – CAN Bus Position Sensor
              </a>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              Through bore rotary sensor using innovative off-axis magnet
              technology. Eliminates mechanical coupling for precise shaft
              position measurement.
            </p>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
              <p className="text-sm text-primary-800 dark:text-primary-300">
                <strong>Key Features:</strong> 1/2&quot; hex shaft compatible,
                through bore design, absolute/relative position, CAN bus
                connectivity, versatile mounting options.
              </p>
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
                CANivore™ – CAN FD Bus Expansion
              </a>
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-3">
              USB-to-CAN FD interface that adds new CAN FD network to PC or
              roboRIO. Enables precise control of CTRE devices with Phoenix Pro
              and hardware-attached simulation.
            </p>
            <div className="bg-primary-100 dark:bg-primary-900/20 p-3 rounded-lg">
              <p className="text-sm text-primary-800 dark:text-primary-300">
                <strong>Key Features:</strong> CAN FD technology (2X-8X better
                bus utilization), wireless configuration, ESP32 integration,
                multi-color status LEDs, USB Type-C support.
              </p>
            </div>
          </ContentCard>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Why We Choose CTRE Hardware
        </h2>

        <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            🎯 CTRE&apos;s Unique Advantages
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-2">
                Full PID Control
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Complete PID implementation with kP, kI, kD, and advanced
                filtering options that other vendors don&apos;t provide.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-[var(--foreground)] mb-2">
                Feedforward (FF)
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Built-in feedforward control for gravity compensation and
                velocity control that competitors lack.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">
                Motion Profiling
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Advanced Motion Magic and motion profiling capabilities for
                smooth, controlled movements.
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
            <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              🔧 Phoenix Software Resources
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

        <AlertBox variant="warning" title="⚠️ Important Setup Steps">
          <ol className="list-decimal list-inside space-y-2">
            <li>Plug the computer into CANivore</li>
            <li>Make sure the &quot;CANivore USB&quot; is checked</li>
            <li>Change &quot;Team # or IP&quot; to &quot;localhost&quot;</li>
            <li>Your CANivore should now appear in Phoenix Tuner</li>
            <li>
              For this workshop, please name your CANivore: &quot;canivore&quot;
            </li>
          </ol>
        </AlertBox>
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
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              📱 How to Update Motors
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

        <AlertBox variant="info" title="🎨 Card Colors">
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

          <AlertBox variant="tip" title="💡 Tip" className="mt-4">
            Always update all motors to the same firmware version for
            consistency and use batch update to save time when updating multiple
            devices.
          </AlertBox>
        </AlertBox>
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
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                ⚡ Safety First
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
    </PageTemplate>
  );
}
