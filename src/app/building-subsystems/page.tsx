import GithubPageWithPR from "@/components/GithubPageWithPR";
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
      <div className="bg-primary-50 dark:bg-primary-950/30 text-[var(--foreground)] rounded-lg p-8 border border-[var(--border)]">
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
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-primary-600 mb-4">📦 Basic Subsystem Structure</h3>
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
          <div className="bg-learn-100 dark:bg-learn-900/20 rounded-lg p-6 border border-learn-200 dark:border-learn-800">
            <h4 className="text-lg font-bold text-learn-700 dark:text-learn-300 mb-3">🔧 Hardware Instantiation</h4>
            <p className="text-learn-800 dark:text-learn-300 text-sm mb-3">
              Motors, sensors, and other hardware objects are declared as private fields at the top of the class.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
              <code>private final TalonFX motor = new TalonFX(1);</code>
            </div>
          </div>

          <div className="bg-learn-100 dark:bg-learn-900/20 rounded-lg p-6 border border-learn-200 dark:border-learn-800">
            <h4 className="text-lg font-bold text-learn-700 dark:text-learn-300 mb-3">⚙️ Configuration Location</h4>
            <p className="text-learn-800 dark:text-learn-300 text-sm mb-3">
              Motor configurations, current limits, and mode settings go in the constructor to run once at startup.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
              <code>motor.getConfigurator().apply(config);</code>
            </div>
          </div>

          <div className="bg-learn-100 dark:bg-learn-900/20 rounded-lg p-6 border border-learn-200 dark:border-learn-800">
            <h4 className="text-lg font-bold text-learn-700 dark:text-learn-300 mb-3">🔄 Periodic Method</h4>
            <p className="text-learn-800 dark:text-learn-300 text-sm mb-3">
              Runs every 20ms (50Hz). Use for telemetry, monitoring, and updating dashboard values - not for control!
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
              <code>SmartDashboard.putNumber(&quot;Value&quot;, sensor.get());</code>
            </div>
          </div>
        </div>

      </section>

      {/* Before/After Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Workshop Implementation: Arm Subsystem
        </h2>

        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            🔄 Before → After: Implementation
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="before-block">
              <h4 className="before-title">📋 Before (Empty Project)</h4>
              <ul className="text-sm space-y-1">
                <li>• Basic WPILib project structure</li>
                <li>• No hardware integration</li>
                <li>• No subsystem implementation</li>
              </ul>
            </div>

            <div className="after-block">
              <h4 className="after-title">✅ After</h4>
              <ul className="text-sm space-y-1">
                <li>• Complete Arm subsystem class</li>
                <li>• TalonFX motor (ID: 31) configured</li>
                <li>• CANCoder sensor (ID: 22) integrated</li>
                <li>• Basic voltage control methods</li>
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

        <div className="bg-learn-100 dark:bg-learn-900/20 border border-learn-200 dark:border-learn-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-learn-900 dark:text-learn-300 mb-4">🔍 Code Walkthrough</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-learn-800 dark:text-learn-200 mb-2">Hardware Setup:</h4>
              <ul className="text-sm text-learn-700 dark:text-learn-300 space-y-1">
                <li>• <strong>TalonFX Motor:</strong> Main drive motor with integrated controller</li>
                <li>• <strong>CANCoder:</strong> Absolute position feedback sensor</li>
                <li>• <strong>Remote Sensor:</strong> CANCoder connected as remote feedback</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-learn-800 dark:text-learn-200 mb-2">Key Methods:</h4>
              <ul className="text-sm text-learn-700 dark:text-learn-300 space-y-1">
                <li>• <strong>setVoltage():</strong> Direct voltage control for basic movement</li>
                <li>• <strong>stop():</strong> Safe motor stop with neutral output</li>
                <li>• <strong>periodic():</strong> Understand that periodic runs every robot loop</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded mt-4">
            <p className="text-indigo-800 dark:text-indigo-300 text-sm">
              <strong>💡 Next Step:</strong> This subsystem is ready for command integration! 
              Next, we&apos;ll add commands to control this Arm subsystem through user input.
            </p>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}