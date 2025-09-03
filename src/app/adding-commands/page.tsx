import GitHubPageWithPR from "@/components/GitHubPageWithPR";
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
      <div className="bg-gradient-to-r from-concept-50 to-practice-50 dark:from-concept-950/30 dark:to-practice-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Command-Based Programming
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Commands are the &quot;actions&quot; that your robot performs. They use subsystems to accomplish tasks 
          and can be triggered by user input, sensors, or automated sequences.
        </p>
        <div className="bg-learn-100 dark:bg-learn-900/30 p-4 rounded-lg">
          <p className="text-learn-800 dark:text-learn-300 font-medium">
            🎯 Key Concept: Commands coordinate subsystem actions while ensuring only one command uses a subsystem at a time
          </p>
        </div>
      </div>

      {/* Command Examples */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Command Structure & Examples
        </h2>

        {/* Inline Command Examples */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-concept-600 mb-4">🎮 Inline Command Methods</h3>
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
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-primary-600 mb-4">🎯 Trigger Examples - Binding Input to Commands</h3>
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
    }
}`}
          />
        </div>

        {/* Key Concepts */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-concept-100 dark:bg-concept-900/20 rounded-lg p-6 border border-concept-200 dark:border-concept-800">
            <h4 className="text-lg font-bold text-concept-700 dark:text-concept-300 mb-3">🏠 Default Commands</h4>
            <p className="text-concept-800 dark:text-concept-300 text-sm mb-3">
              Default commands run when no other command is using the subsystem. They are set in the subsystem constructor.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
              <code>setDefaultCommand(stopCommand());</code>
            </div>
          </div>

          <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-6 border border-primary-200 dark:border-primary-900">
            <h4 className="text-lg font-bold text-primary-700 dark:text-primary-300 mb-3">🎮 Trigger Types</h4>
            <p className="text-primary-800 dark:text-primary-300 text-sm mb-3">
              Different trigger types for different behaviors: onTrue (once), whileTrue (continuous), toggleOnTrue (toggle).
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
              <code>controller.a().whileTrue(command);</code>
            </div>
          </div>

          <div className="bg-learn-100 dark:bg-learn-900/20 rounded-lg p-6 border border-learn-200 dark:border-learn-900">
            <h4 className="text-lg font-bold text-learn-700 dark:text-learn-300 mb-3">🚀 Motor Configuration</h4>
            <p className="text-learn-800 dark:text-learn-300 text-sm mb-3">
              Motor configuration code should be wrapped properly to fit in configuration sections.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
              <code>motor.getConfigurator()<br/>&nbsp;&nbsp;&nbsp;&nbsp;.apply(config);</code>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Workshop Implementation: Adding Commands to ARM
        </h2>

        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
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

            <div className="bg-learn-100 dark:bg-learn-900/20 p-4 rounded-lg border border-learn-200 dark:border-learn-900">
              <h4 className="font-bold text-learn-700 dark:text-learn-300 mb-2">✅ After</h4>
              <ul className="text-sm text-learn-800 dark:text-learn-300 space-y-1">
                <li>• Enhanced ARM subsystem methods</li>
                <li>• Xbox controller integration</li>
                <li>• Commands for moveUp(), moveDown()</li>
                <li>• RobotContainer with proper binding</li>
                <li>• Default command for safety</li>
              </ul>
            </div>
          </div>
        </div>

        <GitHubPageWithPR 
          repository="Hemlock5712/Workshop-Code" 
          filePath="src/main/java/frc/robot/subsystems/Arm.java" 
          branch="2-Commands" 
          pullRequestNumber={2} 
          focusFile="Arm.java" 
        />

        {/* RobotContainer Implementation */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-practice-600 mb-4">🤖 RobotContainer Implementation</h3>
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
        // Button bindings for Arm control
        controller.a().whileTrue(armSubsystem.moveUp());
        controller.b().whileTrue(armSubsystem.moveDown());
    }
}`}
          />
        </div>

        <div className="bg-learn-100 dark:bg-learn-900/20 border border-learn-200 dark:border-learn-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-learn-900 dark:text-learn-300 mb-4">🔍 Code Walkthrough</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-learn-800 dark:text-learn-200 mb-2">New Subsystem Methods:</h4>
              <ul className="text-sm text-learn-700 dark:text-learn-300 space-y-1">
                <li>• <strong>moveUp():</strong> Positive voltage for upward movement</li>
                <li>• <strong>moveDown():</strong> Negative voltage for downward movement</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-learn-800 dark:text-learn-200 mb-2">Command Integration:</h4>
              <ul className="text-sm text-learn-700 dark:text-learn-300 space-y-1">
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