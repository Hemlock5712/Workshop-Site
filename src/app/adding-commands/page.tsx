import GithubPageWithPR from "@/components/GithubPageWithPR";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";

export default function AddingCommands() {
  return (
    <PageTemplate
      title="Commands"
      previousPage={{ href: "/building-subsystems", title: "Subsystems" }}
      nextPage={{ href: "/mechanism-setup", title: "Mechanism Setup" }}
    >
      {/* Introduction */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Command-Based Programming
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Commands are the &quot;actions&quot; that your robot performs. They use subsystems to accomplish tasks 
          and can be triggered by user input, sensors, or automated sequences.
        </p>
        <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
          <p className="text-green-800 dark:text-green-300 font-medium">
            🎯 Key Concept: Commands coordinate subsystem actions while ensuring only one command uses a subsystem at a time
          </p>
        </div>
      </div>

      {/* Command Examples */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Command Structure & Examples
        </h2>

        {/* Inline Command Examples */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-purple-600 mb-4">🎮 Inline Command Methods</h3>
          <CodeBlock
            language="java"
            title="Subsystem Command Methods"
            code={`// In your ARM subsystem - add these command methods:

public Command moveUp() {
    return startEnd(() -> setVoltage(6), () -> stop());
}

public Command moveDown() {
    return startEnd(() -> setVoltage(-6), () -> stop());
}

public Command stopArm() {
    return runOnce(() -> stop());
}

`}
          />
        </div>

        {/* Trigger Examples */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-blue-600 mb-4">🎯 Trigger Examples - Binding Input to Commands</h3>
          <CodeBlock
            language="java"
            title="RobotContainer.java - configureBindings()"
            code={`package frc.robot;

import edu.wpi.first.wpilibj2.command.button.CommandXboxController;
import frc.robot.subsystems.Arm;

public class RobotContainer {
    // Hardware - controllers and subsystems
    private final CommandXboxController controller = new CommandXboxController(0);
    private final Arm armSubsystem = new Arm();
    
    public RobotContainer() {
        configureBindings();
    }
    
    private void configureBindings() {
        // 🎮 BUTTON TRIGGERS - Run command while button is held
        controller.a().whileTrue(armSubsystem.moveUp());
        
        // 🔄 BUTTON TRIGGERS - Run command while button is held
        controller.b().whileTrue(armSubsystem.moveDown());
        
        // ⚡ ONE-SHOT TRIGGERS - Run once when pressed
        controller.x().onTrue(armSubsystem.stopArm());
        
        
        // Default command is set in the subsystem constructor
    }
}`}
          />
        </div>

        {/* Key Concepts */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-6 border border-purple-200 dark:border-purple-900">
            <h4 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-3">🏠 Default Commands</h4>
            <p className="text-purple-800 dark:text-purple-300 text-sm mb-3">
              Default commands run when no other command is using the subsystem. They are set in the subsystem constructor.
            </p>
            <div className="bg-white dark:bg-gray-900 p-3 rounded text-xs">
              <code>setDefaultCommand(stopCommand());</code>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-900">
            <h4 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-3">🎮 Trigger Types</h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm mb-3">
              Different trigger types for different behaviors: onTrue (once), whileTrue (continuous), toggleOnTrue (toggle).
            </p>
            <div className="bg-white dark:bg-gray-900 p-3 rounded text-xs">
              <code>controller.a().whileTrue(command);</code>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-6 border border-green-200 dark:border-green-900">
            <h4 className="text-lg font-bold text-green-700 dark:text-green-300 mb-3">🚀 Motor Configuration</h4>
            <p className="text-green-800 dark:text-green-300 text-sm mb-3">
              Motor configuration code should be wrapped properly to fit in configuration sections.
            </p>
            <div className="bg-white dark:bg-gray-900 p-3 rounded text-xs">
              <code>motor.getConfigurator()<br/>&nbsp;&nbsp;&nbsp;&nbsp;.apply(config);</code>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Workshop Implementation: Adding Commands to ARM
        </h2>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔄 Before → After: Implementation
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900">
              <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">📋 Before</h4>
              <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                <li>• ARM subsystem with basic voltage control</li>
                <li>• No user input integration</li>
                <li>• No commands to coordinate actions</li>
                <li>• Manual method calls only</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">✅ After</h4>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                <li>• Enhanced ARM subsystem methods</li>
                <li>• Xbox controller integration</li>
                <li>• Commands for moveUp(), moveDown()</li>
                <li>• RobotContainer with proper binding</li>
                <li>• Default command for safety</li>
              </ul>
            </div>
          </div>
        </div>

        <GithubPageWithPR 
          repository="Hemlock5712/Workshop-Code" 
          filePath="src/main/java/frc/robot/subsystems/Arm.java" 
          branch="2-Commands" 
          pullRequestNumber={2} 
          focusFile="Arm.java" 
        />

        {/* RobotContainer Implementation */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-orange-600 mb-4">🤖 RobotContainer Implementation</h3>
          <CodeBlock
            language="java"
            title="Complete RobotContainer.java"
            code={`package frc.robot;

import edu.wpi.first.wpilibj2.command.button.CommandXboxController;
import frc.robot.subsystems.Arm;

public class RobotContainer {
    // Controllers
    private final CommandXboxController controller = new CommandXboxController(0);
    
    // Subsystems
    private final Arm armSubsystem = new Arm();
    
    public RobotContainer() {
        configureBindings();
    }
    
    private void configureBindings() {
        // Button bindings for ARM control
        controller.a().whileTrue(armSubsystem.moveUp());
        controller.b().whileTrue(armSubsystem.moveDown());
        controller.x().onTrue(armSubsystem.stopArm());
    }
    
    // Return subsystem for autonomous commands if needed
    public Arm getArmSubsystem() {
        return armSubsystem;
    }
}`}
          />
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">🔍 Code Walkthrough</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">New Subsystem Methods:</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• <strong>moveUp():</strong> Positive voltage for upward movement</li>
                <li>• <strong>moveDown():</strong> Negative voltage for downward movement</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Command Integration:</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• <strong>RobotContainer:</strong> Xbox controller instantiation</li>
                <li>• <strong>Button Bindings:</strong> A/B buttons control arm direction</li>
                <li>• <strong>Default Command:</strong> Stop arm when no input</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded mt-4">
            <p className="text-indigo-800 dark:text-indigo-300 text-sm">
              <strong>💡 Next Step:</strong> Our ARM now responds to user input! 
              Next, we&apos;ll verify mechanism setup before implementing precise PID position control.
            </p>
          </div>
        </div>

      </section>
    </PageTemplate>
  );
}