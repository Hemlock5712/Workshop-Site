import MechanismTabs from "@/components/MechanismTabs";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";
import KeyConceptSection from "@/components/KeyConceptSection";
import CollapsibleSection from "@/components/CollapsibleSection";
import DocumentationButton from "@/components/DocumentationButton";

export default function MotionMagic() {
  return (
    <PageTemplate
      title="Motion Magic"
      previousPage={{ href: "/pid-control", title: "PID Control" }}
      nextPage={{ href: "/", title: "Home" }}
    >
      {/* Introduction */}
      <KeyConceptSection
        title="Motion Magic - Profiled Motion Control"
        description="Motion Magic builds on PID control by adding smooth acceleration and deceleration profiles. This prevents jerky movements and reduces mechanical stress while maintaining precise positioning."
        concept="Motion Magic automatically generates smooth velocity profiles to reach target positions with controlled acceleration."
      />

      {/* Motion Magic Theory */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Understanding Motion Magic Profiles
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">📈 Trapezoidal Profile</h3>
            <p className="text-[var(--foreground)] mb-4 text-sm">
              Motion Magic creates a trapezoidal velocity profile with three phases:
            </p>
            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <strong className="text-[var(--foreground)]">1. Acceleration:</strong>
                <span className="text-[var(--muted-foreground)] text-sm"> Ramp up to cruise velocity</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <strong className="text-[var(--foreground)]">2. Cruise:</strong>
                <span className="text-[var(--muted-foreground)] text-sm"> Maintain constant max velocity</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <strong className="text-[var(--foreground)]">3. Deceleration:</strong>
                <span className="text-[var(--muted-foreground)] text-sm"> Smoothly brake to target</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">⚙️ Key Parameters</h3>
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <h4 className="font-bold text-[var(--foreground)]">Motion Magic Cruise Velocity</h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Maximum velocity during cruise phase (rotations/second)
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <h4 className="font-bold text-[var(--foreground)]">Motion Magic Acceleration</h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Rate of acceleration/deceleration (rotations/second²)
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                <h4 className="font-bold text-[var(--foreground)]">Motion Magic Jerk</h4>
                <p className="text-[var(--muted-foreground)] text-sm">
                  Rate of change of acceleration (rotations/second³)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">📚 Official Motion Magic Documentation</h3>
          <p className="text-[var(--foreground)] mb-4">
            For complete Motion Magic reference, configuration examples, and advanced tuning techniques:
          </p>
          <DocumentationButton
            href="https://v6.docs.ctr-electronics.com/en/latest/docs/api-reference/device-specific/talonfx/motion-magic.html"
            title="CTRE Motion Magic API Reference"
            icon="📖"
          />
        </div>
      </section>

      {/* Code Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Motion Magic Implementation in Code
        </h2>

        <CollapsibleSection title="🔧 Motion Magic Configuration Example">
          <CodeBlock
            language="java"
            title="Motion Magic Setup in Subsystem Constructor"
            code={`// In your subsystem constructor
public ArmSubsystem() {
    TalonFXConfiguration config = new TalonFXConfiguration();

    // PID Configuration (same as before)
    Slot0Configs slot0 = config.Slot0;
    slot0.kP = 24.0;    // Proportional gain
    slot0.kI = 0.0;     // Integral gain
    slot0.kD = 0.1;     // Derivative gain

    // Feedforward gains
    slot0.kS = 0.25;    // Static friction compensation
    slot0.kG = 0.12;    // Gravity compensation
    slot0.kV = 0.12;    // Velocity feedforward
    slot0.kA = 0.01;    // Acceleration feedforward

    // Motion Magic Configuration
    MotionMagicConfigs motionMagic = config.MotionMagic;
    motionMagic.MotionMagicCruiseVelocity = 2.0;    // 2 rot/s max velocity
    motionMagic.MotionMagicAcceleration = 8.0;      // 8 rot/s² acceleration
    motionMagic.MotionMagicJerk = 80.0;             // 80 rot/s³ jerk limit

    motor.getConfigurator().apply(config);
}

// Method to set target position with Motion Magic
public void setTargetPosition(double positionRotations) {
    motor.setControl(motionMagicRequest.withPosition(positionRotations));
}

`}
          />
        </CollapsibleSection>

        {/* Mechanism Implementation Tabs */}
        <MechanismTabs
          sectionTitle="Workshop Implementation: Motion Magic"
          armContent={{
            beforeItems: [
              "• PID position control with PositionVoltage",
              "• Instant acceleration to target",
              "• Potential mechanical stress from jerky movements",
              "• No velocity planning or profiling",
              "• Abrupt start/stop motions"
            ],
            afterItems: [
              "• Motion Magic profiled motion with MotionMagicVoltage",
              "• Smooth acceleration and deceleration curves",
              "• Reduced mechanical stress and wear",
              "• Configurable cruise velocity and acceleration",
              "• Professional, smooth motion profiles"
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Arm.java",
            branch: "4-MotionMagic",
            pullRequestNumber: 4,
            focusFile: "Arm.java",
            walkthrough: {
              leftTitle: "Motion Magic Parameters",
              leftItems: [
                "• <strong>Cruise Velocity (2.0):</strong> Maximum speed during motion",
                "• <strong>Acceleration (8.0):</strong> How quickly to reach cruise speed",
                "• <strong>Jerk (80.0):</strong> Smoothness of acceleration changes",
                "• <strong>MotionMagicVoltage:</strong> Replaces PositionVoltage for profiled control"
              ],
              rightTitle: "Enhanced Features",
              rightItems: [
                "• <strong>Setpoint Detection:</strong> Checks both position AND velocity",
                "• <strong>Smooth Motion:</strong> Eliminates jerky arm movements",
                "• <strong>Mechanical Safety:</strong> Reduces stress on gearboxes",
                "• <strong>Predictable Timing:</strong> Known motion duration"
              ]
            },
            nextStepText: "Motion Magic gives us professional-grade position control! Next, we'll explore tuning methods to get optimal performance from our control algorithms."
          }}
          flywheelContent={{
            beforeItems: [
              "• PID velocity control with VelocityVoltage",
              "• Instant acceleration to target speed",
              "• Potential mechanical stress from sudden velocity changes",
              "• No velocity planning or profiling",
              "• Abrupt start/stop motions"
            ],
            afterItems: [
              "• Motion Magic profiled velocity with MotionMagicVelocity",
              "• Smooth acceleration and deceleration curves",
              "• Reduced mechanical stress and wear",
              "• Configurable acceleration and jerk for velocity changes",
              "• Professional, smooth velocity transitions"
            ],
            repository: "Hemlock5712/Workshop-Code",
            filePath: "src/main/java/frc/robot/subsystems/Flywheel.java",
            branch: "4-MotionMagic",
            pullRequestNumber: 4,
            focusFile: "Flywheel.java",
            walkthrough: {
              leftTitle: "Motion Magic Parameters",
              leftItems: [
                "• <strong>Acceleration:</strong> How quickly to reach target velocity",
                "• <strong>Jerk:</strong> Smoothness of acceleration changes",
                "• <strong>MotionMagicVelocity:</strong> Replaces VelocityVoltage for profiled control",
                "• <strong>Velocity Targeting:</strong> Precise speed control with smooth ramping"
              ],
              rightTitle: "Enhanced Features",
              rightItems: [
                "• <strong>Setpoint Detection:</strong> Checks both velocity AND acceleration",
                "• <strong>Smooth Motion:</strong> Eliminates sudden flywheel speed changes",
                "• <strong>Mechanical Safety:</strong> Reduces stress on motors and mechanisms",
                "• <strong>Predictable Timing:</strong> Known velocity change duration"
              ]
            },
            nextStepText: "Motion Magic gives us professional-grade velocity control! Next, we'll explore tuning methods to get optimal performance from our flywheel control algorithms."
          }}
        />

        {/* Motion Magic vs PID Comparison */}
        <CollapsibleSection title="⚖️ Motion Magic vs Basic PID" variant="warning">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">When to Use Basic PID:</h4>
              <ul className="text-sm text-[var(--foreground)] space-y-1 list-disc list-inside">
                <li>Simple positioning tasks</li>
                <li>Continuous control (like maintaining angle)</li>
                <li>When speed of response is critical</li>
                <li>Mechanisms with very low inertia</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">When to Use Motion Magic:</h4>
              <ul className="text-sm text-[var(--foreground)] space-y-1 list-disc list-inside">
                <li>Large, heavy mechanisms (arms, elevators)</li>
                <li>When smooth motion is important</li>
                <li>Preventing mechanical stress</li>
                <li>Predictable motion timing needed</li>
              </ul>
            </div>
          </div>
        </CollapsibleSection>

        {/* Motion Magic Tuning Steps */}
        <CollapsibleSection title="⚙️ Motion Magic Tuning Steps" variant="info">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">1. Find Maximum Velocity:</h4>
              <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                <li>Plot velocity <strong>without Motion Magic</strong></li>
                <li>Move mechanism the maximum distance it will travel</li>
                <li>Record the maximum velocity it reaches</li>
                <li>Store this value in your code as a constant</li>
                <li><code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">MAX_VELOCITY = 8.5; // rps from plot</code></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--foreground)] mb-2">2. Set Motion Magic Parameters:</h4>
              <ul className="text-sm text-[var(--foreground)] space-y-2 list-disc list-inside">
                <li><strong>Cruise Velocity:</strong> Use 80% of max velocity</li>
                <li><code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">cruiseVel = MAX_VELOCITY * 0.8</code></li>
                <li><strong>Acceleration:</strong> Use 4x cruise velocity for smooth motion</li>
                <li><strong>Acceleration:</strong> Use 10x cruise velocity for quicker motion</li>
                <li><code className="bg-slate-50 dark:bg-slate-800 px-1 rounded">acceleration = cruiseVel * 4.0</code></li>
              </ul>
            </div>
          </div>

          <div className="bg-[var(--muted)] p-4 rounded mt-4 border-l-4 border-[var(--border)]">
            <h4 className="font-semibold text-[var(--foreground)] mb-2">💡 Why This Method Works:</h4>
            <p className="text-[var(--foreground)] text-sm">
              By measuring actual mechanism performance first, you set realistic motion limits that prevent
              oscillation and ensure smooth, achievable motion profiles. The 80% cruise velocity provides
              headroom for control corrections while maintaining good performance.
            </p>
          </div>
        </CollapsibleSection>
      </section>
    </PageTemplate>
  );
}