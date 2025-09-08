import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import ConceptBox from "@/components/ConceptBox";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function PIDControl() {
  return (
    <PageTemplate
      title="PID Control"
      previousPage={{ href: "/mechanism-setup", title: "Mechanism Setup" }}
      nextPage={{ href: "/motion-magic", title: "Motion Magic" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="PID Control - Precise Position Control"
        description="PID (Proportional-Integral-Derivative) control replaces imprecise voltage commands with accurate, feedback-driven position control. Essential for mechanisms that need to hit specific targets."
        concept="PID uses sensor feedback to automatically adjust motor output to reach and maintain target positions."
      />

      {/* PID Theory */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Understanding PID Components
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">P - Proportional</h3>
            <p className="text-[var(--foreground)] mb-4 text-sm">
              <strong>Definition:</strong> &quot;The amount of output to apply per unit of error in the system&quot;
            </p>
              <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-4 rounded mb-3">
              <code className="text-xs">Error = Target - Current</code><br/>
              <code className="text-xs">P_Output = kP × Error</code>
            </div>
            <p className="text-[var(--foreground)] text-sm">
              <strong>Behavior:</strong> Larger error = stronger correction. Provides immediate response but may cause oscillation.
            </p>
          </div>

          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">I - Integral</h3>
            <p className="text-[var(--foreground)] mb-4 text-sm">
              <strong>Definition:</strong> &quot;The amount of output to apply per unit of error for every second of that error&quot;
            </p>
              <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-4 rounded mb-3">
              <code className="text-xs">Accumulated_Error += Error × dt</code><br/>
              <code className="text-xs">I_Output = kI × Accumulated_Error</code>
            </div>
            <p className="text-[var(--foreground)] text-sm">
              <strong>Behavior:</strong> Eliminates steady-state error by accumulating past errors over time.
            </p>
          </div>

          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">D - Derivative</h3>
            <p className="text-[var(--foreground)] mb-4 text-sm">
              <strong>Definition:</strong> &quot;The amount of output to apply per change in error over time&quot;
            </p>
              <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-4 rounded mb-3">
              <code className="text-xs">Error_Rate = (Error - Last_Error) / dt</code><br/>
              <code className="text-xs">D_Output = kD × Error_Rate</code>
            </div>
            <p className="text-[var(--foreground)] text-sm">
              <strong>Behavior:</strong> Reduces overshoot by predicting future error trends and dampening response.
            </p>
          </div>
        </div>

        {/* Feedforward Components */}
        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">⚡ Feedforward Gains</h3>
          <p className="text-[var(--foreground)] mb-4">
            Feedforward gains help the system by predicting the required output based on the target, rather than reacting to error.
          </p>
          
            <div className="grid md:grid-cols-4 gap-4">
              <ConceptBox title="kS - Static">
                Constant output to overcome friction and get the mechanism moving.
              </ConceptBox>
              <ConceptBox title="kG - Gravity">
                Compensates for gravitational forces acting on the mechanism.
              </ConceptBox>
              <ConceptBox title="kV - Velocity">
                Output applied per target velocity to maintain smooth motion.
              </ConceptBox>
              <ConceptBox title="kA - Acceleration">
                Output applied per target acceleration for responsive movement.
              </ConceptBox>
            </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">📚 Complete PID Tuning Guide</h3>
          <p className="text-[var(--foreground)] mb-4">
            For detailed PID tuning instructions, step-by-step processes, and mechanism-specific guidance:
          </p>
          <a 
            href="https://phoenixpro-documentation--161.org.readthedocs.build/en/161/docs/application-notes/manual-pid-tuning.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            📖 CTRE Manual PID Tuning Guide
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      {/* Code Implementation */}
      <section className="flex flex-col gap-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          PID Implementation in Code
        </h2>

        <CollapsibleSection title="🔧 PID Configuration Example">
          <CodeBlock
            language="java"
            title="PID Setup in Subsystem Constructor"
            code={`// In your subsystem constructor
public ArmSubsystem() {
    TalonFXConfiguration config = new TalonFXConfiguration();

    // PID Configuration for Slot 0
    Slot0Configs slot0 = config.Slot0;
    slot0.kP = 24.0;    // Proportional gain
    slot0.kI = 0.0;     // Integral gain
    slot0.kD = 0.1;     // Derivative gain

    // Feedforward gains
    slot0.kS = 0.25;    // Static friction compensation
    slot0.kG = 0.12;    // Gravity compensation
    slot0.kV = 0.12;    // Velocity feedforward
    slot0.kA = 0.01;    // Acceleration feedforward

    motor.getConfigurator().apply(config);

    // Create PID control request
    positionRequest = new PositionVoltage(0).withSlot(0);
}

// Method to set target position
public void setTargetPosition(double positionRotations) {
    motor.setControl(positionRequest.withPosition(positionRotations));
}

`}
          />
        </CollapsibleSection>

        {/* Mechanism Implementation Tabs */}
        <MechanismTabs
          sectionTitle="Workshop Implementation: PID Control"
          armContent={{
            beforeItems: [
              "• Commands control Arm with voltage",
              "• No position feedback control",
              "• Imprecise, inconsistent movement",
              "• No automatic target reaching",
              "• Manual voltage adjustment needed"
            ],
            afterItems: [
              "• PID position control with PositionVoltage",
              "• Automatic target position reaching",
              "• Precise, repeatable movements",
              "• Feedforward compensation for gravity",
              "• Tolerance checking for \"at target\""
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Arm.java",
            branch: "3-PID",
            pullRequestNumber: 3,
            focusFile: "Arm.java",
            walkthrough: {
              leftTitle: "PID Implementation",
              leftItems: [
                "• <strong>PositionVoltage:</strong> Replaces VoltageOut for closed-loop control",
                "• <strong>Slot0 Config:</strong> PID and feedforward gains configuration",
                "• <strong>Target Setting:</strong> setTargetPosition() method for precise control"
              ],
              rightTitle: "Gain Values Used",
              rightItems: [
                "• <strong>kP = 24.0:</strong> Strong proportional response",
                "• <strong>kD = 0.1:</strong> Small derivative for damping",
                "• <strong>kS = 0.25:</strong> Static friction compensation",
                "• <strong>kG = 0.12:</strong> Gravity feedforward for Arm"
              ]
            },
            nextStepText: "PID gives us precise position control! In the next section, we'll upgrade to Motion Magic for smooth, profiled movements with controlled acceleration."
          }}
          flywheelContent={{
            beforeItems: [
              "• Commands control Flywheel with voltage",
              "• No velocity feedback control",
              "• Inconsistent speed control",
              "• No automatic velocity targeting", 
              "• Manual voltage adjustment needed"
            ],
            afterItems: [
              "• PID velocity control with VelocityVoltage",
              "• Automatic target velocity reaching",
              "• Consistent, repeatable speeds",
              "• Feedforward compensation for friction",
              "• Velocity tolerance checking for \"at target\""
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Flywheel.java",
            branch: "3-PID",
            pullRequestNumber: 3,
            focusFile: "Flywheel.java",
            walkthrough: {
              leftTitle: "PID Implementation",
              leftItems: [
                "• <strong>VelocityVoltage:</strong> Replaces VoltageOut for closed-loop velocity control",
                "• <strong>Slot0 Config:</strong> PID and feedforward gains configuration for velocity",
                "• <strong>Target Setting:</strong> setTargetVelocity() method for precise speed control"
              ],
              rightTitle: "Gain Values Used",
              rightItems: [
                "• <strong>kP:</strong> Proportional response for velocity error",
                "• <strong>kI:</strong> Integral gain to eliminate steady-state velocity error",
                "• <strong>kS:</strong> Static friction compensation for startup",
                "• <strong>kV:</strong> Velocity feedforward for smooth operation"
              ]
            },
            nextStepText: "PID gives us precise velocity control! In the next section, we'll upgrade to Motion Magic for smooth, profiled velocity changes with controlled acceleration."
          }}
        />

      </section>
    </PageTemplate>
  );
}