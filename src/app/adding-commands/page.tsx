import MechanismTabs from "@/components/MechanismTabs";
import GitHubPage from "@/components/GitHubPage";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";

export default function AddingCommands() {
  return (
    <PageTemplate
      title="Commands"
      previousPage={{ href: "/building-subsystems", title: "Subsystems" }}
      nextPage={{ href: "/running-program", title: "Running Program" }}
    >
      {/* Introduction */}
      <div className="bg-focus-50 dark:bg-focus-900/20 text-[var(--foreground)] rounded-lg p-8 border border-focus-200 dark:border-focus-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Commands - Coordinating Robot Actions</h2>
        <p className="text-[var(--muted-foreground)] mb-4">
          Commands are the &quot;actions&quot; that your robot performs. They use subsystems to accomplish tasks and can be triggered
          by user input, sensors, or automated sequences.
        </p>
        <div className="bg-learn-100 dark:bg-learn-900/30 p-4 rounded-lg">
          <p className="text-learn-800 dark:text-learn-300 font-medium">
            🎯 Key Concept: Commands tell subsystems what action to run.
          </p>
        </div>
      </div>

      {/* Command Examples */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Command Structure & Examples
        </h2>

          {/* Inline Command Examples */}
          <details className="card p-6">
          <summary className="text-xl font-bold text-primary-600 mb-4 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300">🎮 Inline Command Methods Example</summary>
          <div className="mt-4">
          <CodeBlock
            language="java"
            title="Subsystem Command Methods"
            code={`// In your Arm subsystem - add these command methods:

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
        </details>

          {/* Trigger Examples */}
          <details className="card p-6">
          <summary className="text-xl font-bold text-primary-600 mb-4 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300">🎯 Trigger Examples - Binding Input to Commands</summary>
          <div className="mt-4">
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
        </details>

        {/* Key Concepts */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-concept-100 dark:bg-concept-900/20 rounded-lg p-6 border border-concept-200 dark:border-concept-800">
            <h4 className="text-lg font-bold text-concept-700 dark:text-concept-300 mb-3">🏠 Default Commands</h4>
            <p className="text-concept-800 dark:text-concept-300 text-sm mb-3">
              Default commands run when no other command is using the subsystem. They are set in the subsystem constructor.
            </p>
              <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-3 rounded text-xs">
              <code>setDefaultCommand(stopCommand());</code>
            </div>
          </div>

          <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-6 border border-primary-200 dark:border-primary-900">
            <h4 className="text-lg font-bold text-primary-700 dark:text-primary-300 mb-3">🎮 Trigger Types</h4>
            <p className="text-primary-800 dark:text-primary-300 text-sm mb-3">
              Different trigger types for different behaviors: onTrue (once), whileTrue (continuous), toggleOnTrue (toggle).
            </p>
              <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-3 rounded text-xs">
              <code>controller.a().whileTrue(command);</code>
            </div>
          </div>

          <div className="bg-learn-100 dark:bg-learn-900/20 rounded-lg p-6 border border-learn-200 dark:border-learn-900">
            <h4 className="text-lg font-bold text-learn-700 dark:text-learn-300 mb-3">🚀 Motor Configuration</h4>
            <p className="text-learn-800 dark:text-learn-300 text-sm mb-3">
              Motor configuration code should be wrapped properly to fit in configuration sections.
            </p>
              <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-3 rounded text-xs">
              <code>motor.getConfigurator()<br/>&nbsp;&nbsp;&nbsp;&nbsp;.apply(config);</code>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism Implementation Tabs */}
      <MechanismTabs
        sectionTitle="Workshop Implementation"
        armContent={{
          beforeItems: [
            "• Arm subsystem with basic voltage control",
            "• No user input integration",
            "• No commands to coordinate actions",
            "• Manual method calls only"
          ],
          afterItems: [
            "• Enhanced Arm subsystem methods",
            "• Xbox controller integration", 
            "• Commands for moveUp(), moveDown()",
            "• RobotContainer with proper binding",
            "• Default command for safety"
          ],
          repository: "Hemlock5712/Workshop-Code",
          filePath: "src/main/java/frc/robot/subsystems/Arm.java",
          branch: "2-Commands",
          pullRequestNumber: 2,
          focusFile: "Arm.java",
          walkthrough: {
            leftTitle: "New Subsystem Methods",
            leftItems: [
              "• <strong>moveUp():</strong> Positive voltage for upward movement",
              "• <strong>moveDown():</strong> Negative voltage for downward movement"
            ],
            rightTitle: "Command Integration",
            rightItems: [
              "• <strong>RobotContainer:</strong> Xbox controller instantiation",
              "• <strong>Button Bindings:</strong> A/B buttons control arm direction", 
              "• <strong>Default Command:</strong> Stop arm when no input"
            ]
          },
          nextStepText: "Our Arm now responds to user input! Next, we'll verify mechanism setup before implementing precise PID position control."
        }}
        flywheelContent={{
          beforeItems: [
            "• Flywheel subsystem with basic voltage control",
            "• No user input integration",
            "• No commands to coordinate actions", 
            "• Manual method calls only"
          ],
          afterItems: [
            "• Enhanced Flywheel subsystem methods",
            "• Xbox controller integration",
            "• Commands for runSlow(), runFast()",
            "• RobotContainer with proper binding",
            "• Default command for safety"
          ],
          repository: "Hemlock5712/Workshop-Code",
          filePath: "src/main/java/frc/robot/subsystems/Flywheel.java",
          branch: "2-Commands", 
          pullRequestNumber: 2,
          focusFile: "Flywheel.java",
          walkthrough: {
            leftTitle: "New Subsystem Methods",
            leftItems: [
              "• <strong>runSlow():</strong> Low voltage (3V) for testing",
              "• <strong>runFast():</strong> High voltage (6V) for shooting"
            ],
            rightTitle: "Command Integration", 
            rightItems: [
              "• <strong>RobotContainer:</strong> Xbox controller instantiation",
              "• <strong>Button Bindings:</strong> X/Y buttons control flywheel speed",
              "• <strong>Default Command:</strong> Stop flywheel when no input"
            ]
          },
          nextStepText: "Our Flywheel now responds to user input! Next, we'll verify mechanism setup before implementing precise velocity PID control."
        }}
      />

      {/* RobotContainer Implementation from GitHub */}
      <section className="flex flex-col gap-8">
        <details className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <summary className="text-xl font-bold text-primary-600 mb-4 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300">
            🤖 RobotContainer Implementation
          </summary>
          <div className="mt-4">
            <GitHubPage
              repository="Hemlock5712/Workshop-Code"
              filePath="src/main/java/frc/robot/RobotContainer.java"
              branch="2-Commands"
              className="m-0"
            />
          </div>
        </details>
      </section>
    </PageTemplate>
  );
}