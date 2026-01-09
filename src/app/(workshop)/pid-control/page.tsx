import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import Box from "@/components/Box";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentationButton from "@/components/DocumentationButton";
import Quiz from "@/components/Quiz";
import { Book } from "lucide-react";

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
          <div className="bg-[var(--muted)] dark:bg-slate-700/20 rounded-lg p-6 border-l-4 border-red-500">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
              P - Proportional
            </h3>
            <p className="text-[var(--foreground)] mb-4 text-sm">
              <strong>Definition:</strong> &quot;The amount of output to apply
              per unit of error in the system&quot;
            </p>
            <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-4 rounded mb-3">
              <code className="text-xs">Error = Target - Current</code>
              <br />
              <code className="text-xs">P_Output = kP × Error</code>
            </div>
            <p className="text-[var(--foreground)] text-sm">
              <strong>Behavior:</strong> Larger error = stronger correction.
              Provides immediate response but may cause oscillation.
            </p>
          </div>

          <div className="bg-[var(--muted)] dark:bg-slate-700/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
              I - Integral
            </h3>
            <p className="text-[var(--foreground)] mb-4 text-sm">
              <strong>Definition:</strong> &quot;The amount of output to apply
              per unit of error for every second of that error&quot;
            </p>
            <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-4 rounded mb-3">
              <code className="text-xs">Accumulated_Error += Error × dt</code>
              <br />
              <code className="text-xs">I_Output = kI × Accumulated_Error</code>
            </div>
            <p className="text-[var(--foreground)] text-sm mb-3">
              <strong>Behavior:</strong> Eliminates steady-state error by
              accumulating past errors over time.
            </p>
            <p className="text-[var(--foreground)] text-sm">
              <strong>Note:</strong> The integral term can lead to
              &quot;windup,&quot; which may make your mechanism unstable. In
              most FRC applications, you can leave the integral term at zero.
            </p>
          </div>

          <div className="bg-[var(--muted)] dark:bg-slate-700/20 rounded-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
              D - Derivative
            </h3>
            <p className="text-[var(--foreground)] mb-4 text-sm">
              <strong>Definition:</strong> &quot;The amount of output to apply
              per change in error over time&quot;
            </p>
            <div className="bg-[var(--muted)] text-[var(--muted-foreground)] p-4 rounded mb-3">
              <code className="text-xs">
                Error_Rate = (Error - Last_Error) / dt
              </code>
              <br />
              <code className="text-xs">D_Output = kD × Error_Rate</code>
            </div>
            <p className="text-[var(--foreground)] text-sm">
              <strong>Behavior:</strong> Reduces overshoot by predicting future
              error trends and dampening response.
            </p>
          </div>
        </div>

        {/* Feedforward Components */}
        <Box variant="alert-info" title="⚡ Feedforward Gains">
          <p className="mb-4">
            Feedforward gains help the system by predicting the required output
            based on the target, rather than reacting to error.
          </p>

          <div className="grid md:grid-cols-4 gap-4">
            <Box variant="concept" title="kS - Static" uses="Always">
              Constant output to overcome friction and get the mechanism moving.
            </Box>
            <Box variant="concept" title="kG - Gravity" uses="Arms/Elevators">
              Compensates for gravitational forces acting on the mechanism.
            </Box>
            <Box
              variant="concept"
              title="kV - Velocity"
              uses="Flywheels/Intakes"
            >
              Output applied per target velocity to maintain smooth motion.
            </Box>
            <Box
              variant="concept"
              title="kA - Acceleration"
              uses="High Inertia Mechanisms"
            >
              Output applied per target acceleration for responsive movement.
            </Box>
          </div>
        </Box>

        {/* Documentation Link */}
        <Box variant="alert-info" title="📚 Complete PID Tuning Guide">
          <p className="mb-4">
            For detailed PID tuning instructions, step-by-step processes, and
            mechanism-specific guidance:
          </p>
          <DocumentationButton
            href="https://phoenixpro-documentation--161.org.readthedocs.build/en/161/docs/application-notes/manual-pid-tuning.html"
            title="CTRE Manual PID Tuning Guide"
            icon={<Book className="w-5 h-5" />}
          />
        </Box>

        {/* PID Tuning Video */}
        <section className="flex flex-col gap-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            📹 PID and Feedforward Tuning Tutorial
          </h3>
          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
            <p className="text-[var(--foreground)] mb-4">
              Watch this comprehensive tutorial on PID and feedforward tuning
              techniques, practical tuning steps, and optimization strategies:
            </p>
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/Pt7SBFfl3oM"
                title="PID and Feedforward Tuning Tutorial"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </section>
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
              "• Manual voltage adjustment needed",
            ],
            afterItems: [
              "• PID position control with PositionVoltage",
              "• Automatic target position reaching",
              "• Precise, repeatable movements",
              "• Feedforward compensation for gravity",
              '• Tolerance checking for "at target"',
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
                "• <strong>Target Setting:</strong> setTargetPosition() method for precise control",
              ],
              rightTitle: "Gain Values Used",
              rightItems: [
                "• <strong>kP = 24.0:</strong> Strong proportional response",
                "• <strong>kD = 0.1:</strong> Small derivative for damping",
                "• <strong>kS = 0.25:</strong> Static friction compensation",
                "• <strong>kG = 0.12:</strong> Gravity feedforward for Arm",
              ],
            },
            nextStepText:
              "PID gives us precise position control! In the next section, we'll upgrade to Motion Magic for smooth, profiled movements with controlled acceleration.",
          }}
          flywheelContent={{
            beforeItems: [
              "• Commands control Flywheel with voltage",
              "• No velocity feedback control",
              "• Inconsistent speed control",
              "• No automatic velocity targeting",
              "• Manual voltage adjustment needed",
            ],
            afterItems: [
              "• PID velocity control with VelocityVoltage",
              "• Automatic target velocity reaching",
              "• Consistent, repeatable speeds",
              "• Feedforward compensation for friction",
              '• Velocity tolerance checking for "at target"',
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
                "• <strong>Target Setting:</strong> setTargetVelocity() method for precise speed control",
              ],
              rightTitle: "Gain Values Used",
              rightItems: [
                "• <strong>kP:</strong> Proportional response for velocity error",
                "• <strong>kI:</strong> Integral gain to eliminate steady-state velocity error",
                "• <strong>kS:</strong> Static friction compensation for startup",
                "• <strong>kV:</strong> Velocity feedforward for smooth operation",
              ],
            },
            nextStepText:
              "PID gives us precise velocity control! In the next section, we'll upgrade to Motion Magic for smooth, profiled velocity changes with controlled acceleration.",
          }}
        />
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8">
        <Quiz
          title="Knowledge Check"
          questions={[
            {
              id: 1,
              question:
                "What does the 'P' (Proportional) term in PID control do?",
              options: [
                "It accumulates error over time",
                "It applies output proportional to the current error",
                "It predicts future error trends",
                "It eliminates steady-state error",
              ],
              correctAnswer: 1,
              explanation:
                "The Proportional term applies output proportional to the current error (Target - Current). Larger error results in stronger correction, providing immediate response to changes.",
            },
            {
              id: 2,
              question:
                "What is the primary purpose of the 'I' (Integral) term in PID control?",
              options: [
                "To provide immediate response to error",
                "To reduce overshoot and oscillation",
                "To eliminate steady-state error by accumulating past errors",
                "To predict future system behavior",
              ],
              correctAnswer: 2,
              explanation:
                "The Integral term accumulates error over time, helping eliminate steady-state error where the system settles close to but not exactly at the target. However, it can cause 'windup' and is often left at zero in FRC applications.",
            },
            {
              id: 3,
              question:
                "What does the 'D' (Derivative) term help prevent in PID control?",
              options: [
                "Steady-state error",
                "Slow response time",
                "Overshoot and oscillation",
                "Motor overheating",
              ],
              correctAnswer: 2,
              explanation:
                "The Derivative term responds to the rate of change of error, helping reduce overshoot by dampening the response as the system approaches the target.",
            },
            {
              id: 4,
              question:
                "Which feedforward gain is used to overcome static friction?",
              options: [
                "kV - Velocity",
                "kG - Gravity",
                "kS - Static",
                "kA - Acceleration",
              ],
              correctAnswer: 2,
              explanation:
                "kS (Static) is a constant output applied to overcome static friction and get the mechanism moving. It's the minimum voltage needed to break the mechanism free.",
            },
            {
              id: 5,
              question:
                "Which feedforward gain is specifically used for arms and elevators to compensate for gravitational forces?",
              options: [
                "kS - Static",
                "kG - Gravity",
                "kV - Velocity",
                "kA - Acceleration",
              ],
              correctAnswer: 1,
              explanation:
                "kG (Gravity) compensates for gravitational forces acting on the mechanism. This is essential for arms and elevators that fight gravity at different positions.",
            },
            {
              id: 6,
              question:
                "What does PID control use to automatically adjust motor output?",
              options: [
                "Time-based scheduling",
                "Sensor feedback to measure error",
                "Random voltage adjustments",
                "Manual driver input only",
              ],
              correctAnswer: 1,
              explanation:
                "PID control uses sensor feedback (encoders, velocity measurements) to calculate the error between target and current position/velocity, then automatically adjusts motor output to minimize that error.",
            },
          ]}
        />
      </section>
    </PageTemplate>
  );
}
