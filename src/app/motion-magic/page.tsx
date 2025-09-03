import GithubPageWithPR from "@/components/GithubPageWithPR";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";

export default function MotionMagic() {
  return (
    <PageTemplate
      title="Motion Magic"
      previousPage={{ href: "/pid-control", title: "PID Control" }}
      nextPage={{ href: "/programming", title: "Programming" }}
    >
      {/* Introduction */}
      <div className="bg-[var(--card)] text-[var(--foreground)] rounded-lg p-8 border border-[var(--border)]">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
          Motion Magic - Profiled Motion Control
        </h2>
        <p className="text-[var(--foreground)] mb-4">
          Motion Magic builds on PID control by adding smooth acceleration and deceleration profiles.
          This prevents jerky movements and reduces mechanical stress while maintaining precise positioning.
        </p>
        <div className="bg-[var(--muted)] p-4 rounded-lg border-l-4 border-[var(--border)]">
          <p className="text-[var(--foreground)] font-medium">
            🚀 Key Concept: Motion Magic automatically generates smooth velocity profiles to reach target positions with controlled acceleration
          </p>
        </div>
      </div>

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
          <a 
            href="https://v6.docs.ctr-electronics.com/en/latest/docs/api-reference/device-specific/talonfx/motion-magic.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            📖 CTRE Motion Magic API Reference
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      {/* Code Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Motion Magic Implementation in Code
        </h2>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-primary-600 mb-4">🔧 Motion Magic Configuration Example</h3>
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
    
    // Create Motion Magic control request
    motionMagicRequest = new MotionMagicVoltage(0).withSlot(0);
}

// Method to set target position with Motion Magic
public void setTargetPosition(double positionRotations) {
    motor.setControl(motionMagicRequest.withPosition(positionRotations));
}

`}
          />
        </div>

        {/* Before/After Implementation */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            🔄 Before → After: Implementation
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="before-block">
              <h4 className="before-title">📋 Before</h4>
              <ul className="text-sm space-y-1">
                <li>• PID position control with PositionVoltage</li>
                <li>• Instant acceleration to target</li>
                <li>• Potential mechanical stress from jerky movements</li>
                <li>• No velocity planning or profiling</li>
                <li>• Abrupt start/stop motions</li>
              </ul>
            </div>

            <div className="after-block">
              <h4 className="after-title">✅ After</h4>
              <ul className="text-sm space-y-1">
                <li>• Motion Magic profiled motion with MotionMagicVoltage</li>
                <li>• Smooth acceleration and deceleration curves</li>
                <li>• Reduced mechanical stress and wear</li>
                <li>• Configurable cruise velocity and acceleration</li>
                <li>• Professional, smooth motion profiles</li>
              </ul>
            </div>
          </div>
        </div>

        <GithubPageWithPR 
          repository="Hemlock5712/Workshop-Code" 
          filePath="src/main/java/frc/robot/subsystems/Arm.java" 
          branch="4-MotionMagic" 
          pullRequestNumber={4} 
          focusFile="Arm.java" 
        />

        <div className="bg-learn-100 dark:bg-learn-900/20 border border-learn-200 dark:border-learn-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-learn-900 dark:text-learn-300 mb-4">🔍 Code Walkthrough</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-learn-800 dark:text-learn-200 mb-2">Motion Magic Parameters:</h4>
              <ul className="text-sm text-learn-700 dark:text-learn-300 space-y-1">
                <li>• <strong>Cruise Velocity (2.0):</strong> Maximum speed during motion</li>
                <li>• <strong>Acceleration (8.0):</strong> How quickly to reach cruise speed</li>
                <li>• <strong>Jerk (80.0):</strong> Smoothness of acceleration changes</li>
                <li>• <strong>MotionMagicVoltage:</strong> Replaces PositionVoltage for profiled control</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-learn-800 dark:text-learn-200 mb-2">Enhanced Features:</h4>
              <ul className="text-sm text-learn-700 dark:text-learn-300 space-y-1">
                <li>• <strong>Setpoint Detection:</strong> Checks both position AND velocity</li>
                <li>• <strong>Smooth Motion:</strong> Eliminates jerky arm movements</li>
                <li>• <strong>Mechanical Safety:</strong> Reduces stress on gearboxes</li>
                <li>• <strong>Predictable Timing:</strong> Known motion duration</li>
              </ul>
            </div>
          </div>

          <div className="bg-teal-50 dark:bg-teal-950/30 p-4 rounded mt-4">
            <p className="text-teal-800 dark:text-teal-300 text-sm">
              <strong>💡 Next Step:</strong> Motion Magic gives us professional-grade motion control! 
              Next, we&apos;ll explore tuning methods to get optimal performance from our control algorithms.
            </p>
          </div>
        </div>

        {/* Motion Magic vs PID Comparison */}
        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-yellow-500">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">⚖️ Motion Magic vs Basic PID</h3>
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
        </div>

        {/* Motion Magic Tuning Steps */}
        <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">⚙️ Motion Magic Tuning Steps</h3>
          
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
        </div>
      </section>
    </PageTemplate>
  );
}