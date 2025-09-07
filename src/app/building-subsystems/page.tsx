import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";

export default function BuildingSubsystems() {
  return (
    <PageTemplate
      title="Subsystems"
      previousPage={{ href: "/command-framework", title: "Command-Based Framework" }}
      nextPage={{ href: "/adding-commands", title: "Commands" }}
    >
      {/* Introduction */}
      <div className="bg-focus-50 dark:bg-focus-900/20 text-[var(--foreground)] rounded-lg p-8 border border-focus-200 dark:border-focus-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Subsystems - Understanding the Foundation</h2>
        <p className="mb-4">
          Subsystems are the foundation of command-based programming. They represent physical hardware components and provide
          methods to control them safely and effectively.
        </p>
        <div className="bg-learn-100 dark:bg-learn-900/30 p-4 rounded-lg">
          <p className="text-learn-800 dark:text-learn-300 font-medium">
            🎯 Key Concept: One subsystem per mechanism. Each subsystem manages its own hardware and state.
          </p>
        </div>
      </div>

      {/* Code Examples */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Subsystem Structure & Code Examples
        </h2>

        {/* Subsystem Example */}
        <details className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <summary className="text-xl font-bold text-primary-600 mb-4 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300">
            📦 Basic Subsystem Example
          </summary>
          <div className="mt-4">
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
        config.MotorOutput.NeutralMode = NeutralModeValue.Coast;
        motor.getConfigurator().apply(config);
    }
    
    // 🔄 PERIODIC() RUNS EVERY 20ms - for telemetry/monitoring. 
    // This we can leave blank as we can use TunerX.
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
        motor.stopMotor();
    }
    
    public double getPosition() {
        return motor.getPosition().getValueAsDouble();
    }
}`}
          />
          </div>
        </details>

        {/* Key Concepts Explanation */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-learn-100 dark:bg-learn-900/20 rounded-lg p-6 border border-learn-200 dark:border-learn-800">
            <h4 className="text-lg font-bold text-learn-700 dark:text-learn-300 mb-3">🔧 Hardware Instantiation</h4>
            <p className="text-learn-800 dark:text-learn-300 text-sm mb-3">
              Motors, sensors, and other hardware objects are declared as private fields at the top of the class.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
              <code>TalonFX motor = new TalonFX(1);</code>
            </div>
          </div>

          <div className="bg-learn-100 dark:bg-learn-900/20 rounded-lg p-6 border border-learn-200 dark:border-learn-800">
            <h4 className="text-lg font-bold text-learn-700 dark:text-learn-300 mb-3">⚙️ Configuration Location</h4>
            <p className="text-learn-800 dark:text-learn-300 text-sm mb-3">
              Motor configurations, current limits, and mode settings go in the constructor to run once at startup.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
              <code>motor.getConfigurator()<br/>&nbsp;&nbsp;&nbsp;&nbsp;.apply(config);</code>
            </div>
          </div>

          <div className="bg-learn-100 dark:bg-learn-900/20 rounded-lg p-6 border border-learn-200 dark:border-learn-800">
            <h4 className="text-lg font-bold text-learn-700 dark:text-learn-300 mb-3">🔄 Periodic Method</h4>
            <p className="text-learn-800 dark:text-learn-300 text-sm mb-3">
              Runs every 20ms (50Hz). Use for telemetry, monitoring, and updating dashboard values - not for control!
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
              <code>SmartDashboard.putNumber(<br/>&nbsp;&nbsp;&nbsp;&nbsp;&quot;Value&quot;, sensor.get());</code>
            </div>
          </div>
        </div>

      </section>

      {/* Mechanism Implementation Tabs */}
      <MechanismTabs
        sectionTitle="Workshop Implementation"
        armContent={{
          beforeItems: [
            "• Basic WPILib project structure",
            "• No hardware integration", 
            "• No subsystem implementation"
          ],
          afterItems: [
            "• Complete Arm subsystem class",
            "• TalonFX motor (ID: 31) configured",
            "• CANCoder sensor (ID: 22) integrated", 
            "• Basic voltage control methods"
          ],
          repository: "Hemlock5712/Workshop-Code",
          filePath: "src/main/java/frc/robot/subsystems/Arm.java",
          branch: "1-Subsystem",
          pullRequestNumber: 1,
          focusFile: "Arm.java",
          walkthrough: {
            leftTitle: "Hardware Setup",
            leftItems: [
              "• <strong>TalonFX Motor:</strong> Main drive motor with integrated controller",
              "• <strong>CANCoder:</strong> Absolute position feedback sensor",
              "• <strong>Remote Sensor:</strong> CANCoder connected as remote feedback"
            ],
            rightTitle: "Key Methods", 
            rightItems: [
              "• <strong>setVoltage():</strong> Direct voltage control for basic movement",
              "• <strong>stop():</strong> Safe motor stop with neutral output",
              "• <strong>periodic():</strong> Understand that periodic runs every robot loop"
            ]
          },
          nextStepText: "This subsystem is ready for command integration! Next, we'll add commands to control this Arm subsystem through user input."
        }}
        flywheelContent={{
          beforeItems: [
            "• Basic WPILib project structure",
            "• No hardware integration",
            "• No subsystem implementation"
          ],
          afterItems: [
            "• Complete Flywheel subsystem class", 
            "• Dual TalonFX motors (IDs: 21, 22) configured",
            "• Leader/follower motor setup",
            "• Basic voltage control methods"
          ],
          repository: "Hemlock5712/Workshop-Code",
          filePath: "src/main/java/frc/robot/subsystems/Flywheel.java", 
          branch: "1-Subsystem",
          pullRequestNumber: 1,
          focusFile: "Flywheel.java",
          walkthrough: {
            leftTitle: "Hardware Setup",
            leftItems: [
              "• <strong>Leader Motor:</strong> TalonFX controlling the flywheel mechanism",
              "• <strong>Follower Motor:</strong> Second TalonFX following the leader",
              "• <strong>CANivore Bus:</strong> High-speed CAN bus for motor communication"
            ],
            rightTitle: "Key Methods",
            rightItems: [
              "• <strong>setVoltage():</strong> Direct voltage control for flywheel speed",
              "• <strong>stop():</strong> Safe motor stop with neutral output", 
              "• <strong>periodic():</strong> Understand that periodic runs every robot loop"
            ]
          },
          nextStepText: "This flywheel subsystem is ready for command integration! Next, we'll add commands to control this Flywheel subsystem through user input."
        }}
      />
    </PageTemplate>
  );
}