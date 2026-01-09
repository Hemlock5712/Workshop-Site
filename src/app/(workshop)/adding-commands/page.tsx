import Link from "next/link";
import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import Box from "@/components/Box";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import Quiz from "@/components/Quiz";

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
          <summary className="text-xl font-bold text-primary-600 mb-4 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300">
            Inline Command Methods Example
          </summary>
          <div className="mt-4">
            <CodeBlock
              language="java"
              title="Subsystem Command Methods"
              code={`// In your Arm subsystem - add these command methods:

public Command moveUp() {
    return runOnce(() -> setVoltage(6));
}

public Command moveDown() {
    return runOnce(() -> setVoltage(-6));
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
          <Box
            variant="concept"
            title="Command Methods"
            code={<code>return runOnce(() -&gt; action);</code>}
          >
            Create commands using factory methods like runOnce() to execute
            actions once when the command is triggered.
          </Box>

          <Box
            variant="concept"
            title="Command Requirements"
            code={<code>addRequirements(subsystem);</code>}
          >
            Commands must declare which subsystems they use to prevent conflicts
            and ensure proper scheduling.
          </Box>

          <Box
            variant="concept"
            title="Command Lifecycle"
            code={<code>initialize() &rarr; execute() &rarr; end()</code>}
          >
            Commands have a clear lifecycle: start, run continuously, then clean
            up when finished.
          </Box>
        </div>
      </section>

      {/* Mechanism Implementation Tabs */}
      <MechanismTabs
        sectionTitle="Workshop Implementation"
        armContent={{
          beforeItems: [
            "Arm subsystem with basic voltage control",
            "No user input integration",
            "No commands to coordinate actions",
            "Manual method calls only",
          ],
          afterItems: [
            "Enhanced Arm subsystem methods",
            "Commands for moveUp(), moveDown()",
            "Ready for user input integration",
          ],
          repository: "Hemlock5712/Workshop-Code",
          filePath: "src/main/java/frc/robot/subsystems/Arm.java",
          branch: "2-Commands",
          pullRequestNumber: 2,
          focusFile: "Arm.java",
          walkthrough: {
            leftTitle: "New Subsystem Methods",
            leftItems: [
              "<strong>moveUp():</strong> Positive voltage for upward movement",
              "<strong>moveDown():</strong> Negative voltage for downward movement",
            ],
            rightTitle: "Command Benefits",
            rightItems: [
              "<strong>Encapsulation:</strong> Actions wrapped in reusable commands",
              "<strong>Safety:</strong> Automatic stop when command ends",
              "<strong>Flexibility:</strong> Ready for trigger integration",
            ],
          },
          nextStepText:
            "Enhanced Arm subsystem with command methods! Next, we'll learn about Triggers to bind user input before verifying mechanism setup.",
        }}
        flywheelContent={{
          beforeItems: [
            "Flywheel subsystem with basic voltage control",
            "No user input integration",
            "No commands to coordinate actions",
            "Manual method calls only",
          ],
          afterItems: [
            "Enhanced Flywheel subsystem methods",
            "Commands for runSlow(), runFast()",
            "Ready for user input integration",
          ],
          repository: "Hemlock5712/Workshop-Code",
          filePath: "src/main/java/frc/robot/subsystems/Flywheel.java",
          branch: "2-Commands",
          pullRequestNumber: 2,
          focusFile: "Flywheel.java",
          walkthrough: {
            leftTitle: "New Subsystem Methods",
            leftItems: [
              "<strong>runSlow():</strong> Low voltage (3V) for testing",
              "<strong>runFast():</strong> High voltage (6V) for shooting",
            ],
            rightTitle: "Command Benefits",
            rightItems: [
              "<strong>Encapsulation:</strong> Actions wrapped in reusable commands",
              "<strong>Safety:</strong> Automatic stop when command ends",
              "<strong>Flexibility:</strong> Ready for trigger integration",
            ],
          },
          nextStepText:
            "Enhanced Flywheel subsystem with command methods! Next, we'll learn about Triggers to bind user input before verifying mechanism setup.",
        }}
      />

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What is the primary purpose of commands in command-based programming?",
              options: [
                "To configure motor hardware settings",
                "To coordinate robot actions using subsystems",
                "To read sensor data",
                "To manage network communications",
              ],
              correctAnswer: 1,
              explanation:
                "Commands are the actions that your robot performs. They use subsystems to accomplish tasks and can be triggered by user input, sensors, or automated sequences.",
            },
            {
              id: 2,
              question: "What does the runOnce() factory method do?",
              options: [
                "Runs a command continuously until stopped",
                "Executes an action once when the command is triggered",
                "Schedules a command to run at a specific time",
                "Repeats a command exactly once per second",
              ],
              correctAnswer: 1,
              explanation:
                "The runOnce() factory method creates a command that executes the specified action once when triggered, then immediately finishes.",
            },
            {
              id: 3,
              question:
                "Why must commands declare which subsystems they use with addRequirements()?",
              options: [
                "To improve code performance",
                "To prevent conflicts and ensure proper scheduling",
                "To enable telemetry logging",
                "To configure motor parameters",
              ],
              correctAnswer: 1,
              explanation:
                "Commands must declare their subsystem requirements to prevent conflicts (two commands trying to control the same subsystem) and ensure the command scheduler properly manages command execution.",
            },
            {
              id: 4,
              question: "What is the correct order of the command lifecycle?",
              options: [
                "execute() &rarr; initialize() &rarr; end()",
                "end() &rarr; initialize() &rarr; execute()",
                "initialize() &rarr; execute() &rarr; end()",
                "initialize() &rarr; end() &rarr; execute()",
              ],
              correctAnswer: 2,
              explanation:
                "Commands follow the lifecycle: initialize() (called once at start) &rarr; execute() (called repeatedly) &rarr; end() (called once when finished). This provides clear start, run, and cleanup phases.",
            },
          ]}
        />
      </section>
      <section className="flex flex-col gap-6 bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Next Steps
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          You now have reusable command factories on each mechanism. Before
          moving on, confirm that every command declares its subsystem
          requirements and stops motors safely in <code>end()</code>.
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>Bind new commands to controller inputs in a sandbox branch.</li>
          <li>
            Verify telemetry shows commands interrupting each other safely.
          </li>
          <li>Document command naming conventions in your team codebase.</li>
        </ul>
        <Link
          href="/triggers"
          className="inline-flex items-center gap-2 self-start bg-primary-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Continue to Triggers
        </Link>
      </section>
    </PageTemplate>
  );
}
