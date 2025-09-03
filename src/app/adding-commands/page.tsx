import GithubPageWithPR from "@/components/GithubPageWithPR";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";

export default function AddingCommands() {
  return (
    <PageTemplate
      title="Adding Commands (PR #2)"
      previousPage={{ href: "/building-subsystems", title: "Building Subsystems (PR #1)" }}
      nextPage={{ href: "/pid-control", title: "PID Control (PR #3)" }}
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

        {/* Basic Command Example */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-purple-600 mb-4">🎮 Basic Command Structure</h3>
          <CodeBlock
            language="java"
            title="ExampleCommand.java"
          >
{`package frc.robot.commands;

import edu.wpi.first.wpilibj2.command.Command;
import frc.robot.subsystems.ExampleSubsystem;

public class ExampleCommand extends Command {
    private final ExampleSubsystem subsystem;
    
    public ExampleCommand(ExampleSubsystem subsystem) {
        this.subsystem = subsystem;
        // 🔒 REQUIREMENT: This command requires the subsystem
        addRequirements(subsystem);
    }
    
    // Called when the command is initially scheduled
    @Override
    public void initialize() {
        System.out.println("ExampleCommand started");
    }
    
    // Called every 20ms while the command is scheduled
    @Override
    public void execute() {
        subsystem.setVoltage(5.0); // Move at 5 volts
    }
    
    // Called when the command ends
    @Override
    public void end(boolean interrupted) {
        subsystem.stop(); // Stop the motor
        if (interrupted) {
            System.out.println("ExampleCommand interrupted");
        } else {
            System.out.println("ExampleCommand finished");
        }
    }
    
    // Returns true when the command should end
    @Override
    public boolean isFinished() {
        return false; // Runs until interrupted
    }
}`}
          </CodeBlock>
        </div>

        {/* Instant Command Example */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-orange-600 mb-4">⚡ Instant Command Example</h3>
          <CodeBlock
            language="java"
            title="Quick Actions with InstantCommand"
          >
{`// For simple, one-time actions
public static Command stopArm(ExampleSubsystem subsystem) {
    return new InstantCommand(
        () -> subsystem.stop(), // Action to perform
        subsystem               // Required subsystem
    );
}

// Using lambda syntax for concise commands
public static Command setArmVoltage(ExampleSubsystem subsystem, double voltage) {
    return new RunCommand(
        () -> subsystem.setVoltage(voltage), // Continuous action
        subsystem
    );
}`}
          </CodeBlock>
        </div>

        {/* Trigger Examples */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-blue-600 mb-4">🎯 Trigger Examples - Binding Input to Commands</h3>
          <CodeBlock
            language="java"
            title="RobotContainer.java - configureBindings()"
          >
{`package frc.robot;

import edu.wpi.first.wpilibj2.command.button.CommandXboxController;
import frc.robot.subsystems.ExampleSubsystem;
import frc.robot.commands.ExampleCommand;

public class RobotContainer {
    // Hardware - controllers and subsystems
    private final CommandXboxController controller = new CommandXboxController(0);
    private final ExampleSubsystem exampleSubsystem = new ExampleSubsystem();
    
    public RobotContainer() {
        configureBindings();
    }
    
    private void configureBindings() {
        // 🎮 BUTTON TRIGGERS - Run command while button is held
        controller.a().whileTrue(
            new ExampleCommand(exampleSubsystem)
        );
        
        // 🔄 TOGGLE TRIGGERS - Start command on press, stop on press again  
        controller.b().toggleOnTrue(
            new RunCommand(() -> exampleSubsystem.setVoltage(3.0), exampleSubsystem)
        );
        
        // ⚡ ONE-SHOT TRIGGERS - Run once when pressed
        controller.x().onTrue(
            new InstantCommand(() -> exampleSubsystem.stop(), exampleSubsystem)
        );
        
        // 🚀 CONDITIONAL TRIGGERS - Only if condition is true
        controller.y().and(() -> exampleSubsystem.getPosition() > 45.0)
                      .onTrue(new InstantCommand(() -> System.out.println("Arm is high!")));
                      
        // 🔂 DEFAULT COMMAND - Runs when no other commands are using subsystem
        exampleSubsystem.setDefaultCommand(
            new RunCommand(() -> exampleSubsystem.setVoltage(0), exampleSubsystem)
        );
    }
}`}
          </CodeBlock>
        </div>

        {/* Key Concepts */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-6 border border-purple-200 dark:border-purple-900">
            <h4 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-3">🔒 Requirements</h4>
            <p className="text-purple-800 dark:text-purple-300 text-sm mb-3">
              Commands must &quot;require&quot; their subsystems. This prevents conflicts and ensures only one command controls a subsystem.
            </p>
            <div className="bg-white dark:bg-gray-900 p-3 rounded text-xs">
              <code>addRequirements(subsystem);</code>
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
            <h4 className="text-lg font-bold text-green-700 dark:text-green-300 mb-3">🔂 Default Commands</h4>
            <p className="text-green-800 dark:text-green-300 text-sm mb-3">
              Default commands run when no other command is using the subsystem. Perfect for idle behavior.
            </p>
            <div className="bg-white dark:bg-gray-900 p-3 rounded text-xs">
              <code>subsystem.setDefaultCommand(cmd);</code>
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
            🔄 Before → After: PR #2 Implementation
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900">
              <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">📋 Before (PR #1)</h4>
              <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                <li>• ARM subsystem with basic voltage control</li>
                <li>• No user input integration</li>
                <li>• No commands to coordinate actions</li>
                <li>• Manual method calls only</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">✅ After (PR #2)</h4>
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

        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-4">🔍 Code Walkthrough</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">New Subsystem Methods:</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• <strong>moveUp():</strong> Positive voltage for upward movement</li>
                <li>• <strong>moveDown():</strong> Negative voltage for downward movement</li>
                <li>• <strong>getPosition():</strong> Current arm angle from CANCoder</li>
                <li>• <strong>atSetpoint():</strong> Check if arm is at target position</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Command Integration:</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• <strong>RobotContainer:</strong> Xbox controller instantiation</li>
                <li>• <strong>Button Bindings:</strong> A/B buttons control arm direction</li>
                <li>• <strong>Default Command:</strong> Stop arm when no input</li>
                <li>• <strong>Requirements:</strong> Commands properly require ARM subsystem</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded mt-4">
            <p className="text-indigo-800 dark:text-indigo-300 text-sm">
              <strong>💡 Next Step:</strong> Our ARM now responds to user input! 
              In PR #3, we&apos;ll replace voltage control with precise PID position control for accurate movement.
            </p>
          </div>
        </div>

        {/* Command Lifecycle */}
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-4">🔄 Command Lifecycle</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-700 dark:text-blue-300 font-bold">1</span>
              </div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">initialize()</h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Called once when command starts</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <span className="text-green-700 dark:text-green-300 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">execute()</h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Called every 20ms while running</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <span className="text-orange-700 dark:text-orange-300 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">isFinished()</h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Checked each cycle to see if done</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <span className="text-red-700 dark:text-red-300 font-bold">4</span>
              </div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">end()</h4>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">Cleanup when command finishes</p>
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}