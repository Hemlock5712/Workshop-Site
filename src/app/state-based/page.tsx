import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function StateBased() {
  return (
    <PageTemplate
      title="State-Based Control"
      previousPage={{ href: "/motion-magic", title: "Motion Magic" }}
      nextPage={{ href: "/", title: "Home" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="State-Based Control - Structured Subsystem Management"
        description="State-based control organizes subsystem behavior into discrete, well-defined states. Each state encapsulates target positions, tolerances, and specific configurations, making robot code more organized and maintainable."
        concept="Instead of manually setting positions and tolerances everywhere, define states that encapsulate all the information needed for each subsystem configuration."
      />

      {/* State-Based Theory */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Understanding State-Based Architecture
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
              🏗️ State Pattern Benefits
            </h3>
            <p className="text-[var(--foreground)] mb-4 text-sm">
              State-based control provides structure and predictability to
              subsystem behavior:
            </p>
            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <strong className="text-[var(--foreground)]">
                  Encapsulation:
                </strong>
                <span className="text-[var(--muted-foreground)] text-sm">
                  {" "}
                  Each state contains its target and tolerance
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <strong className="text-[var(--foreground)]">
                  Maintainability:
                </strong>
                <span className="text-[var(--muted-foreground)] text-sm">
                  {" "}
                  Easy to add new states and modify existing ones
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <strong className="text-[var(--foreground)]">
                  Readability:
                </strong>
                <span className="text-[var(--muted-foreground)] text-sm">
                  {" "}
                  Code clearly shows subsystem intentions
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
              ⚙️ State Components
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <h4 className="font-bold text-[var(--foreground)]">
                  State Enum
                </h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Defines all possible subsystem states with targets
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <h4 className="font-bold text-[var(--foreground)]">
                  Current State
                </h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Tracks which state the subsystem is currently in
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <h4 className="font-bold text-[var(--foreground)]">
                  setState() Method
                </h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Changes state and applies the new configuration
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          State-Based Implementation in Code
        </h2>

        <CollapsibleSection title="🔧 State-Based Configuration Example">
          <CodeBlock
            language="java"
            title="State Enum and Implementation"
            code={`// Define possible states with targets and tolerances
public enum ArmState {
    LOW(Degrees.of(0), Degrees.of(1)),           // Ground pickup
    HIGH(Rotations.of(0.25), Degrees.of(2)),     // High scoring
    BACKWARD(Degrees.of(180), Degrees.of(3));    // Defense position

    private final Measure<Angle> targetPosition;
    private final Measure<Angle> tolerance;

    ArmState(Measure<Angle> targetPosition, Measure<Angle> tolerance) {
        this.targetPosition = targetPosition;
        this.tolerance = tolerance;
    }

    public Measure<Angle> getTargetPosition() { return targetPosition; }
    public Measure<Angle> getTolerance() { return tolerance; }
}

// In your subsystem class
private ArmState currentState = ArmState.LOW;

public void setState(ArmState state) {
    currentState = state;
    setPosition(state.getTargetPosition());
}

public boolean atState() {
    return Math.abs(getPosition().in(Degrees) -
                   currentState.getTargetPosition().in(Degrees))
           < currentState.getTolerance().in(Degrees);
}

public ArmState getCurrentState() {
    return currentState;
}
`}
          />
        </CollapsibleSection>

        {/* Mechanism Implementation Tabs */}
        <MechanismTabs
          sectionTitle="Workshop Implementation: State-Based Control"
          armContent={{
            beforeItems: [
              "• Manual position and tolerance management",
              "• Hard-coded values scattered throughout code",
              "• Difficult to add new arm positions",
              "• No clear organization of arm configurations",
              "• Tolerance values repeated in multiple places",
            ],
            afterItems: [
              "• Well-defined states: LOW, HIGH, BACKWARD",
              "• Each state encapsulates target position and tolerance",
              "• Easy to add new states by extending the enum",
              "• Clear, readable code with semantic state names",
              "• Centralized configuration management",
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Arm.java",
            branch: "6-StateBased",
            pullRequestNumber: 6,
            focusFile: "Arm.java",
            walkthrough: {
              leftTitle: "State-Based Architecture",
              leftItems: [
                "• <strong>ArmState Enum:</strong> Defines LOW, HIGH, and BACKWARD states",
                "• <strong>Encapsulated Targets:</strong> Each state contains its target position",
                "• <strong>State-Specific Tolerances:</strong> Different tolerance for each position",
                "• <strong>Current State Tracking:</strong> Always know which state the arm is in",
              ],
              rightTitle: "Enhanced Features",
              rightItems: [
                "• <strong>setState() Method:</strong> Simple way to change arm configuration",
                "• <strong>atState() Check:</strong> Easy validation using state-specific tolerance",
                "• <strong>Semantic Names:</strong> Code clearly shows intent (HIGH vs 0.25 rotations)",
                "• <strong>Extensible Design:</strong> Add new states without changing existing code",
              ],
            },
            nextStepText:
              "State-based control makes our arm subsystem much more organized and maintainable! This pattern scales well as we add more complex behaviors.",
          }}
          flywheelContent={{
            beforeItems: [
              "• Manual velocity and tolerance management",
              "• Hard-coded RPM values throughout the code",
              "• Difficult to add new shooting modes",
              "• No clear organization of flywheel configurations",
              "• Tolerance values scattered in multiple places",
            ],
            afterItems: [
              "• Well-defined states: IDLE, SHOOTING, INTAKE",
              "• Each state encapsulates target velocity and tolerance",
              "• Easy to add new shooting modes by extending enum",
              "• Clear, readable code with semantic state names",
              "• Centralized flywheel configuration management",
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Flywheel.java",
            branch: "6-StateBased",
            pullRequestNumber: 6,
            focusFile: "Flywheel.java",
            walkthrough: {
              leftTitle: "State-Based Architecture",
              leftItems: [
                "• <strong>FlywheelState Enum:</strong> Defines IDLE, SHOOTING, and INTAKE states",
                "• <strong>Encapsulated Targets:</strong> Each state contains its target velocity",
                "• <strong>State-Specific Tolerances:</strong> Different tolerance for each mode",
                "• <strong>Current State Tracking:</strong> Always know flywheel operating mode",
              ],
              rightTitle: "Enhanced Features",
              rightItems: [
                "• <strong>setState() Method:</strong> Simple way to change flywheel mode",
                "• <strong>atState() Check:</strong> Easy validation using state-specific tolerance",
                "• <strong>Semantic Names:</strong> Code clearly shows intent (SHOOTING vs 3000 RPM)",
                "• <strong>Extensible Design:</strong> Add new modes without changing existing code",
              ],
            },
            nextStepText:
              "State-based control makes our flywheel subsystem much more organized and maintainable! This pattern is essential for complex shooting systems.",
          }}
        />

        {/* State-Based vs Manual Comparison */}
        <CollapsibleSection
          title="⚖️ State-Based vs Manual Control"
          variant="warning"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">
                Manual Control Issues:
              </h4>
              <ul className="text-sm text-[var(--foreground)] space-y-1 list-disc list-inside">
                <li>Hard-coded values scattered everywhere</li>
                <li>Difficult to maintain and modify</li>
                <li>No clear organization of configurations</li>
                <li>Prone to inconsistencies and bugs</li>
                <li>Hard to understand code intent</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">
                State-Based Benefits:
              </h4>
              <ul className="text-sm text-[var(--foreground)] space-y-1 list-disc list-inside">
                <li>Centralized configuration management</li>
                <li>Easy to add and modify states</li>
                <li>Clear, semantic code that shows intent</li>
                <li>Consistent tolerance and target handling</li>
                <li>Scales well with complex behaviors</li>
              </ul>
            </div>
          </div>
        </CollapsibleSection>

        {/* State Design Best Practices */}
        <CollapsibleSection
          title="💡 State Design Best Practices"
          variant="info"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* State Naming */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                🏷️ State Naming Guidelines
              </h4>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-[var(--foreground)] mb-2">
                    Use Descriptive Names:
                  </h5>
                  <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                    <li>
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        HIGH
                      </code>{" "}
                      instead of{" "}
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        STATE_1
                      </code>
                    </li>
                    <li>
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        SHOOTING
                      </code>{" "}
                      instead of{" "}
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        FAST
                      </code>
                    </li>
                    <li>
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        STARTING_POSITION
                      </code>{" "}
                      instead of{" "}
                      <code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">
                        STATE_2
                      </code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-[var(--foreground)] mb-2">
                    Group Related States:
                  </h5>
                  <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                    <li>Arm: LOW, HIGH, MIDDLE, BACKWARD</li>
                    <li>Flywheel: STARTING_POSITION, MID_FIELD, FULL_FIELD</li>
                    <li>Elevator: INTAKE, HAND_OFF, LEVEL_4</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* State Organization */}
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                📋 State Organization Tips
              </h4>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-[var(--foreground)] mb-2">
                    Include All Necessary Data:
                  </h5>
                  <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                    <li>Target position/velocity</li>
                    <li>State-specific tolerance</li>
                    <li>Optional: timing constraints</li>
                    <li>Optional: safety limits</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold text-[var(--foreground)] mb-2">
                    Design for Extensibility:
                  </h5>
                  <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                    <li>Start with basic states, add complexity later</li>
                    <li>Use constructor parameters for flexibility</li>
                    <li>Consider state transitions and validation</li>
                    <li>Plan for debugging and telemetry</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--muted)] p-4 rounded mt-4 border-l-4 border-[var(--border)]">
            <h4 className="font-semibold text-[var(--foreground)] mb-2">
              🎯 Why This Approach Works:
            </h4>
            <p className="text-[var(--foreground)] text-sm">
              State-based control provides a clean separation between
              configuration (what the states are) and behavior (how to reach
              them). This makes code easier to understand, test, and maintain as
              your robot becomes more complex.
            </p>
          </div>
        </CollapsibleSection>
      </section>
    </PageTemplate>
  );
}
