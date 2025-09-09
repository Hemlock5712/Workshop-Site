import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import ConceptBox from "@/components/ConceptBox";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";

export default function AddingCommands() {
  return (
    <PageTemplate
      title="Commands"
      previousPage={{ href: "/building-subsystems", title: "Subsystems" }}
      nextPage={{ href: "/triggers", title: "Triggers" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="Commands - Coordinating Robot Actions"
        description="Commands are the actions that your robot performs. They use subsystems to accomplish tasks and can be triggered by user input, sensors, or automated sequences."
        concept="Commands tell subsystems what action to run."
      />

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


        {/* Key Concepts */}
        <div className="grid md:grid-cols-3 gap-6">
          <ConceptBox
            title="⚡ Command Methods"
            code={<code>return startEnd(() -&gt; action, () -&gt; stop);</code>}
          >
            Create commands using factory methods like startEnd(), runOnce(), and run() for different behaviors.
          </ConceptBox>

          <ConceptBox
            title="🔗 Command Requirements"
            code={<code>addRequirements(subsystem);</code>}
          >
            Commands must declare which subsystems they use to prevent conflicts and ensure proper scheduling.
          </ConceptBox>

          <ConceptBox
            title="🔄 Command Lifecycle"
            code={<code>initialize() → execute() → end()</code>}
          >
            Commands have a clear lifecycle: start, run continuously, then clean up when finished.
          </ConceptBox>
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
            "• Commands for moveUp(), moveDown()",
            "• Ready for user input integration"
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
            rightTitle: "Command Benefits",
            rightItems: [
              "• <strong>Encapsulation:</strong> Actions wrapped in reusable commands",
              "• <strong>Safety:</strong> Automatic stop when command ends",
              "• <strong>Flexibility:</strong> Ready for trigger integration"
            ]
          },
          nextStepText: "Enhanced Arm subsystem with command methods! Next, we'll learn about Triggers to bind user input before verifying mechanism setup."
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
            "• Commands for runSlow(), runFast()",
            "• Ready for user input integration"
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
            rightTitle: "Command Benefits", 
            rightItems: [
              "• <strong>Encapsulation:</strong> Actions wrapped in reusable commands",
              "• <strong>Safety:</strong> Automatic stop when command ends",
              "• <strong>Flexibility:</strong> Ready for trigger integration"
            ]
          },
          nextStepText: "Enhanced Flywheel subsystem with command methods! Next, we'll learn about Triggers to bind user input before verifying mechanism setup."
        }}
      />

    </PageTemplate>
  );
}