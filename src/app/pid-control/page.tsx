import GithubPageWithPR from "@/components/GithubPageWithPR";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";

export default function PIDControl() {
  return (
    <PageTemplate
      title="PID Control"
      previousPage={{ href: "/mechanism-setup", title: "Mechanism Setup" }}
      nextPage={{ href: "/motion-magic", title: "Motion Magic" }}
    >
      {/* Introduction */}
      <div className="bg-gradient-to-r from-red-50 to-yellow-50 dark:from-red-950/30 dark:to-yellow-950/30 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          PID Control - Precise Position Control
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          PID (Proportional-Integral-Derivative) control replaces imprecise voltage commands with accurate, 
          feedback-driven position control. Essential for mechanisms that need to hit specific targets.
        </p>
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg">
          <p className="text-red-800 dark:text-red-300 font-medium">
            🎯 Key Concept: PID uses sensor feedback to automatically adjust motor output to reach and maintain target positions
          </p>
        </div>
      </div>

      {/* PID Theory */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Understanding PID Components
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-6 border border-red-200 dark:border-red-900">
            <h3 className="text-xl font-bold text-focus-700 dark:text-focus-300 mb-4">🔴 P - Proportional</h3>
            <p className="text-red-800 dark:text-red-300 mb-4 text-sm">
              <strong>Definition:</strong> &quot;The amount of output to apply per unit of error in the system&quot;
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded mb-3">
              <code className="text-xs">Error = Target - Current</code><br/>
              <code className="text-xs">P_Output = kP × Error</code>
            </div>
            <p className="text-focus-700 dark:text-focus-300 text-sm">
              <strong>Behavior:</strong> Larger error = stronger correction. Provides immediate response but may cause oscillation.
            </p>
          </div>

          <div className="bg-focus-50 dark:bg-focus-950/30 rounded-lg p-6 border border-focus-200 dark:border-focus-900">
            <h3 className="text-xl font-bold text-focus-700 dark:text-focus-300 mb-4">🟡 I - Integral</h3>
            <p className="text-focus-800 dark:text-focus-300 mb-4 text-sm">
              <strong>Definition:</strong> &quot;The amount of output to apply per unit of error for every second of that error&quot;
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded mb-3">
              <code className="text-xs">Accumulated_Error += Error × dt</code><br/>
              <code className="text-xs">I_Output = kI × Accumulated_Error</code>
            </div>
            <p className="text-focus-700 dark:text-focus-300 text-sm">
              <strong>Behavior:</strong> Eliminates steady-state error by accumulating past errors over time.
            </p>
          </div>

          <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-900">
            <h3 className="text-xl font-bold text-primary-700 dark:text-primary-300 mb-4">🔵 D - Derivative</h3>
            <p className="text-primary-800 dark:text-primary-300 mb-4 text-sm">
              <strong>Definition:</strong> &quot;The amount of output to apply per change in error over time&quot;
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded mb-3">
              <code className="text-xs">Error_Rate = (Error - Last_Error) / dt</code><br/>
              <code className="text-xs">D_Output = kD × Error_Rate</code>
            </div>
            <p className="text-primary-700 dark:text-primary-300 text-sm">
              <strong>Behavior:</strong> Reduces overshoot by predicting future error trends and dampening response.
            </p>
          </div>
        </div>

        {/* Feedforward Components */}
        <div className="bg-concept-50 dark:bg-concept-950/30 border border-concept-200 dark:border-concept-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-concept-700 dark:text-concept-300 mb-4">⚡ Feedforward Gains</h3>
          <p className="text-concept-800 dark:text-concept-300 mb-4">
            Feedforward gains help the system by predicting the required output based on the target, rather than reacting to error.
          </p>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded">
              <h4 className="font-bold text-concept-700 dark:text-concept-300 mb-2">kS - Static</h4>
              <p className="text-sm text-concept-600 dark:text-concept-400">
                Constant output to overcome friction and get the mechanism moving.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded">
              <h4 className="font-bold text-concept-700 dark:text-concept-300 mb-2">kG - Gravity</h4>
              <p className="text-sm text-concept-600 dark:text-concept-400">
                Compensates for gravitational forces acting on the mechanism.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded">
              <h4 className="font-bold text-concept-700 dark:text-concept-300 mb-2">kV - Velocity</h4>
              <p className="text-sm text-concept-600 dark:text-concept-400">
                Output applied per target velocity to maintain smooth motion.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded">
              <h4 className="font-bold text-concept-700 dark:text-concept-300 mb-2">kA - Acceleration</h4>
              <p className="text-sm text-concept-600 dark:text-concept-400">
                Output applied per target acceleration for responsive movement.
              </p>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-primary-700 dark:text-primary-300 mb-4">📚 Complete PID Tuning Guide</h3>
          <p className="text-indigo-800 dark:text-indigo-300 mb-4">
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

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-learn-600 mb-4">🔧 PID Configuration Example</h3>
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
        </div>

        {/* Before/After Implementation */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            🔄 Before → After: PID Control Implementation
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900">
              <h4 className="font-bold text-focus-700 dark:text-focus-300 mb-2">📋 Before</h4>
              <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                <li>• Commands control ARM with voltage</li>
                <li>• No position feedback control</li>
                <li>• Imprecise, inconsistent movement</li>
                <li>• No automatic target reaching</li>
                <li>• Manual voltage adjustment needed</li>
              </ul>
            </div>

            <div className="bg-learn-50 dark:bg-learn-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <h4 className="font-bold text-learn-700 dark:text-learn-300 mb-2">✅ After</h4>
              <ul className="text-sm text-learn-800 dark:text-learn-300 space-y-1">
                <li>• PID position control with PositionVoltage</li>
                <li>• Automatic target position reaching</li>
                <li>• Precise, repeatable movements</li>
                <li>• Feedforward compensation for gravity</li>
                <li>• Tolerance checking for &quot;at target&quot;</li>
              </ul>
            </div>
          </div>
        </div>

        <GithubPageWithPR 
          repository="Hemlock5712/Workshop-Code" 
          filePath="src/main/java/frc/robot/subsystems/Arm.java" 
          branch="3-PID" 
          pullRequestNumber={3} 
          focusFile="Arm.java" 
        />

        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-learn-700 dark:text-learn-300 mb-4">🔍 Code Walkthrough</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">PID Implementation:</h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• <strong>PositionVoltage:</strong> Replaces VoltageOut for closed-loop control</li>
                <li>• <strong>Slot0 Config:</strong> PID and feedforward gains configuration</li>
                <li>• <strong>Target Setting:</strong> setTargetPosition() method for precise control</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Gain Values Used:</h4>
              <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                <li>• <strong>kP = 24.0:</strong> Strong proportional response</li>
                <li>• <strong>kD = 0.1:</strong> Small derivative for damping</li>
                <li>• <strong>kS = 0.25:</strong> Static friction compensation</li>
                <li>• <strong>kG = 0.12:</strong> Gravity feedforward for ARM</li>
              </ul>
            </div>
          </div>

          <div className="bg-teal-50 dark:bg-teal-950/30 p-4 rounded mt-4">
            <p className="text-teal-800 dark:text-teal-300 text-sm">
              <strong>💡 Next Step:</strong> PID gives us precise control! 
              In the next section, we&apos;ll upgrade to Motion Magic for smooth, profiled movements with controlled acceleration.
            </p>
          </div>
        </div>

      </section>
    </PageTemplate>
  );
}