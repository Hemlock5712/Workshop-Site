import PageTemplate from "@/components/PageTemplate";
import GitHubPage from "@/components/GitHubPage";
import Image from "next/image";

export default function Programming() {
  return (
    <PageTemplate
      title="Programming ARM"
      previousPage={{ href: "/motion-magic", title: "Motion Magic" }}
      nextPage={undefined}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Programming ARM</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          In this section, we&apos;ll program common FRC mechanisms starting with our ARM subsystem.
          We&apos;ll build upon this initial implementation throughout the workshop.
        </p>

        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">What You&apos;ll Learn:</h3>
          <ul className="list-disc list-inside text-green-800 dark:text-green-300 space-y-1">
            {/* <li>Setting up subsystems for Arm and Flywheel</li> */}
            <li>Setting up ARM subsystem</li>
            <li>Creating motor and sensor configurations</li>
            <li>Implementing control methods</li>
            <li>Command creation and deployment</li>
            <li>Iterative development and testing</li>
          </ul>
        </div>
      </div>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Workshop Development Approach</h2>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-4">🔄 Iterative Development</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We&apos;ll start with basic motor control and progressively add advanced features.
                Each step builds upon the previous implementation.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Start with voltage control</li>
                <li>• Add position feedback</li>
                <li>• Implement PID control</li>
                <li>• Add feedforward compensation</li>
                <li>• Include safety limits</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">🎯 Real-World Focus</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Each modification addresses real competition challenges and follows
                FRC best practices used by successful teams.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Competition-tested patterns</li>
                <li>• Robust error handling</li>
                <li>• Performance optimization</li>
                <li>• Maintainable code structure</li>
                <li>• Team collaboration friendly</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Initial ARM Subsystem</h2>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📋 Starting Point</h3>
          <p className="text-blue-800 dark:text-blue-300">
            This is our initial Arm implementation. Throughout the workshop, we&apos;ll enhance this code by adding:
            PID control, feedforward, position control, safety limits, and more sophisticated commands.
          </p>
        </div>

        <iframe
          src="https://www.youtube.com/embed/Qi94fcIfop0"
          title="Project Setup Tutorial"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video rounded-lg"
        />

        <GitHubPage
          repository="Hemlock5712/Workshop-Code"
          filePath="src/main/java/frc/robot/subsystems/Arm.java"
          branch="1-Subsystem"
          title="Initial ARM Subsystem Implementation"
          description="This is our starting point for the workshop. We&apos;ll progressively enhance this code throughout the learning process."
        />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">🔧 Key Components</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>TalonFX (ID: 31):</strong> Main motor controller</li>
              <li><strong>CANCoder (ID: 22):</strong> Position feedback sensor</li>
              <li><strong>VoltageOut:</strong> Control mode for direct voltage output</li>
              <li><strong>Brake Mode:</strong> Motor holds position when stopped</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">🎯 Current Capabilities</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>setVoltage():</strong> Apply raw voltage to motor</li>
              <li><strong>stop():</strong> Stop motor movement</li>
              <li><strong>Remote Encoder:</strong> CANCoder feedback configured</li>
              <li><strong>Basic Safety:</strong> Brake mode prevents drift</li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">
            🎯 Step 1: Basic Subsystem (PR #1)
          </h3>
          <p className="text-blue-800 dark:text-blue-300 mb-4">
            Our first step creates a foundational ARM subsystem with basic motor control and sensor feedback.
          </p>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Implementation Details:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• <strong>TalonFX Motor:</strong> Configured with device ID 31</li>
              <li>• <strong>CANCoder Sensor:</strong> Remote feedback sensor (ID 22)</li>
              <li>• <strong>Voltage Control:</strong> Direct voltage output for basic movement</li>
              <li>• <strong>Brake Mode:</strong> Holds position when motor is stopped</li>
              <li>• <strong>Basic Methods:</strong> setVoltage() and stop() for control</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded">
            <p className="text-green-800 dark:text-green-300 text-sm">
              <strong>Key Learning:</strong> This establishes the foundation - hardware configuration, 
              basic control, and sensor integration. Every subsystem needs these core elements.
            </p>
          </div>
        </div>

        <iframe
          src="https://www.youtube.com/embed/ykvIJx-4RhU"
          title="Subsystem with Commands"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video rounded-lg"
        />

        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">
            🎮 Step 2: Commands Integration (PR #2)
          </h3>
          <p className="text-green-800 dark:text-green-300 mb-4">
            Now we add command-based control, allowing user input to control our ARM mechanism.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">New Subsystem Methods:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <strong>moveUp():</strong> Move arm upward</li>
                <li>• <strong>moveDown():</strong> Move arm downward</li>
                <li>• <strong>getPosition():</strong> Get current angle</li>
                <li>• <strong>atSetpoint():</strong> Check if at target</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Command Integration:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• <strong>RobotContainer:</strong> Binds controls to commands</li>
                <li>• <strong>Controller Input:</strong> Joystick triggers arm movement</li>
                <li>• <strong>Default Command:</strong> Stops arm when no input</li>
                <li>• <strong>Safety:</strong> Commands require the arm subsystem</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded">
            <p className="text-purple-800 dark:text-purple-300 text-sm">
              <strong>Key Learning:</strong> Commands separate &quot;what to do&quot; from &quot;how to do it.&quot; 
              This makes code modular, testable, and easy to modify for different control schemes.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Step 3: Precise Control with PID
        </h2>

        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-purple-900 dark:text-purple-300 mb-4">
            🎯 Step 3: PID Control (PR #3)
          </h3>
          <p className="text-purple-800 dark:text-purple-300 mb-4">
            Replace voltage control with precise PID position control for accurate, repeatable movements.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-red-600 mb-2">P - Proportional</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Responds to current error. Larger error = stronger correction.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-600 mb-2">I - Integral</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Eliminates steady-state error by accumulating past errors.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
              <h4 className="font-semibold text-blue-600 mb-2">D - Derivative</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Reduces overshoot by predicting future error trends.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">PID Implementation Changes:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• <strong>PositionVoltage:</strong> Replace VoltageOut with PID control request</li>
              <li>• <strong>PID Constants:</strong> kP, kI, kD values for tuning</li>
              <li>• <strong>Target Positions:</strong> Set precise angle targets</li>
              <li>• <strong>Tolerance:</strong> Define &quot;close enough&quot; for position checking</li>
            </ul>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded">
            <p className="text-orange-800 dark:text-orange-300 text-sm">
              <strong>Key Learning:</strong> PID control transforms imprecise voltage commands into 
              accurate position control. This is essential for mechanisms that need to hit specific targets.
            </p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8 bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Running with Hardware Sim
        </h2>

        <p>WPILib provides a powerful tool called Hardware Simulation. This allows you to run your code in the simulator, while also running motors that are connected to the CANivore.</p>
        <p>This prevents the need to run a full RoboRIO for testing, while still allowing you to test your code on real hardware.</p>

        <iframe
          src="https://www.youtube.com/embed/xsR7m6ToUFE"
          title="Hardware Simulation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video rounded-lg"
        />
      </section>

      <section className="flex flex-col gap-8 bg-white dark:bg-gray-900 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Verifying Motor Setup
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <p className="col-span-2">You&apos;ll want to make sure your motor is spinning in the expected direction. If the motor is getting positive voltage, it should be spinning counterclockwise. You can check this through tuner, with the device facing your like the following picture.</p>

          <div className="flex w-full">
            <Image src="/images/mechanisms/arm.jpg" alt="Arm" width={300} height={200} className="rounded-lg" />
          </div>
        </div>

        <iframe
          src="https://www.youtube.com/embed/iQqR1Wxptzg"
          title="Motor Testing"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full aspect-video rounded-lg"
        />
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Workshop Progression</h2>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">🚀 What We&apos;ll Build Next</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Enhanced Control</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Position-based control</li>
                <li>• PID feedback loops</li>
                <li>• Feedforward compensation</li>
                <li>• Motion Magic profiles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Advanced Features</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Safety limits and bounds</li>
                <li>• Encoder calibration</li>
                <li>• Dashboard integration</li>
                <li>• Command-based control</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}