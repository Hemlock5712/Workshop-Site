import GithubPageWithPR from "@/components/GithubPageWithPR";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";

export default function BuildingSubsystems() {
  return (
    <PageTemplate
      title="Building Subsystems (PR #1)"
      previousPage={{ href: "/project-setup", title: "Project Setup" }}
      nextPage={{ href: "/adding-commands", title: "Adding Commands (PR #2)" }}
    >
      {/* Introduction */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Understanding Subsystems
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Subsystems are the foundation of command-based programming. They represent physical hardware components 
          and provide methods to control them safely and effectively.
        </p>
        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
          <p className="text-blue-800 dark:text-blue-300 font-medium">
            🎯 Key Concept: One subsystem per mechanism - each subsystem manages its own hardware and state
          </p>
        </div>
      </div>

      {/* Code Examples */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Subsystem Structure & Code Examples
        </h2>

        {/* Subsystem Example */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-green-600 mb-4">📦 Basic Subsystem Structure</h3>
          <CodeBlock
            language="java"
            title="ExampleSubsystem.java"
            code={`package frc.robot.subsystems;

import edu.wpi.first.wpilibj2.command.SubsystemBase;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.configs.TalonFXConfiguration;
import com.ctre.phoenix6.controls.VoltageOut;

public class ExampleSubsystem extends SubsystemBase {
    // 🔧 MOTORS GO HERE - Hardware instantiation
    private final TalonFX motor = new TalonFX(1); // Device ID 1
    
    // Control requests
    private final VoltageOut voltageOut = new VoltageOut(0);

    // 🔧 MOTOR CONFIGURATIONS GO IN CONSTRUCTOR
    public ExampleSubsystem() {
        TalonFXConfiguration config = new TalonFXConfiguration();
        
        // Configure motor settings
        config.CurrentLimits.SupplyCurrentLimit = 40.0;
        config.CurrentLimits.SupplyCurrentLimitEnable = true;
        
        motor.getConfigurator().apply(config);
        motor.setNeutralMode(NeutralModeValue.Brake);
    }
    
    // 🔄 PERIODIC() RUNS EVERY 20ms - for telemetry/monitoring
    @Override
    public void periodic() {
        // Update dashboard with current values
        SmartDashboard.putNumber("Motor Position", 
            motor.getPosition().getValueAsDouble());
        SmartDashboard.putNumber("Motor Velocity", 
            motor.getVelocity().getValueAsDouble());
        SmartDashboard.putNumber("Motor Current", 
            motor.getSupplyCurrent().getValueAsDouble());
    }
    
    // Control methods
    public void setVoltage(double volts) {
        motor.setControl(voltageOut.withOutput(volts));
    }
    
    public void stop() {
        motor.setControl(new NeutralOut());
    }
    
    public double getPosition() {
        return motor.getPosition().getValueAsDouble();
    }
}`}
          />
        </div>

        {/* Key Concepts Explanation */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-900">
            <h4 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-3">🔧 Hardware Instantiation</h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm mb-3">
              Motors, sensors, and other hardware objects are declared as private fields at the top of the class.
            </p>
            <div className="bg-white dark:bg-gray-900 p-3 rounded text-xs">
              <code>private final TalonFX motor = new TalonFX(1);</code>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-6 border border-green-200 dark:border-green-900">
            <h4 className="text-lg font-bold text-green-700 dark:text-green-300 mb-3">⚙️ Configuration Location</h4>
            <p className="text-green-800 dark:text-green-300 text-sm mb-3">
              Motor configurations, current limits, and mode settings go in the constructor to run once at startup.
            </p>
            <div className="bg-white dark:bg-gray-900 p-3 rounded text-xs">
              <code>motor.getConfigurator().apply(config);</code>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-6 border border-purple-200 dark:border-purple-900">
            <h4 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-3">🔄 Periodic Method</h4>
            <p className="text-purple-800 dark:text-purple-300 text-sm mb-3">
              Runs every 20ms (50Hz). Use for telemetry, monitoring, and updating dashboard values - not for control!
            </p>
            <div className="bg-white dark:bg-gray-900 p-3 rounded text-xs">
              <code>SmartDashboard.putNumber(&quot;Value&quot;, sensor.get());</code>
            </div>
          </div>
        </div>

        {/* Command Pattern Intro */}
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-4">🎮 Commands vs Direct Control</h3>
          <p className="text-yellow-800 dark:text-yellow-300 mb-4">
            Notice we don&apos;t call subsystem methods directly from periodic() or other places. Instead, we use Commands 
            to coordinate actions and ensure only one command uses a subsystem at a time.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded">
              <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">❌ Don&apos;t Do This</h4>
              <code className="text-xs">subsystem.setVoltage(5.0); // Direct call</code>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded">
              <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">✅ Do This Instead</h4>
              <code className="text-xs">new MoveCommand(subsystem).schedule(); // Command</code>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Workshop Implementation: ARM Subsystem
        </h2>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔄 Before → After: PR #1 Implementation
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900">
              <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">📋 Before (Empty Project)</h4>
              <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                <li>• Basic WPILib project structure</li>
                <li>• No hardware integration</li>
                <li>• No subsystem implementation</li>
                <li>• Robot.java with empty methods</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">✅ After (PR #1)</h4>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                <li>• Complete ARM subsystem class</li>
                <li>• TalonFX motor (ID: 31) configured</li>
                <li>• CANCoder sensor (ID: 22) integrated</li>
                <li>• Basic voltage control methods</li>
                <li>• Telemetry and monitoring setup</li>
              </ul>
            </div>
          </div>
        </div>

        <GithubPageWithPR 
          repository="Hemlock5712/Workshop-Code" 
          filePath="src/main/java/frc/robot/subsystems/Arm.java" 
          branch="1-Subsystem" 
          pullRequestNumber={1} 
          focusFile="Arm.java" 
        />

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">🔍 Code Walkthrough</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Hardware Setup:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>TalonFX Motor:</strong> Main drive motor with integrated controller</li>
                <li>• <strong>CANCoder:</strong> Absolute position feedback sensor</li>
                <li>• <strong>Remote Sensor:</strong> CANCoder connected as remote feedback</li>
                <li>• <strong>Current Limits:</strong> 40A supply current limit for protection</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Key Methods:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>setVoltage():</strong> Direct voltage control for basic movement</li>
                <li>• <strong>stop():</strong> Safe motor stop with neutral output</li>
                <li>• <strong>getPosition():</strong> Current arm angle from encoder</li>
                <li>• <strong>periodic():</strong> Dashboard telemetry updates</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded mt-4">
            <p className="text-indigo-800 dark:text-indigo-300 text-sm">
              <strong>💡 Next Step:</strong> This subsystem is ready for command integration! 
              In PR #2, we&apos;ll add commands to control this ARM subsystem through user input.
            </p>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}