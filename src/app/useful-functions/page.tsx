import GithubPageWithPR from "@/components/GithubPageWithPR";
import PageTemplate from "@/components/PageTemplate";
import CodeBlock from "@/components/CodeBlock";

export default function UsefulFunctions() {
  return (
    <PageTemplate
      title="Useful Functions (PR #5)"
      previousPage={{ href: "/motion-magic", title: "Motion Magic (PR #4)" }}
      nextPage={{ href: "/control-systems", title: "Control Systems" }}
    >
      {/* Introduction */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Useful Functions &amp; Utilities
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Beyond basic control, robots need utility functions for safety, monitoring, and enhanced operation. 
          These helper functions make your code more robust and easier to debug.
        </p>
        <div className="bg-teal-100 dark:bg-teal-900/30 p-4 rounded-lg">
          <p className="text-teal-800 dark:text-teal-300 font-medium">
            🛠️ Key Concept: Utility functions provide safety checks, diagnostic information, and convenient operations for better robot control
          </p>
        </div>
      </div>

      {/* Safety Functions */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Safety &amp; Limit Functions
        </h2>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-red-600 mb-4">🔒 Safety Limit Checks</h3>
          <CodeBlock
            language="java"
            title="Position and Safety Limits"
          >
{`// Safety limit checking
public boolean isAtUpperLimit() {
    return getPosition() >= UPPER_LIMIT_ROTATIONS;
}

public boolean isAtLowerLimit() {
    return getPosition() <= LOWER_LIMIT_ROTATIONS;
}

public boolean isWithinSafeLimits() {
    double position = getPosition();
    return position >= LOWER_LIMIT_ROTATIONS && position <= UPPER_LIMIT_ROTATIONS;
}

// Safe voltage control with limit checking
public void setVoltageWithLimits(double voltage) {
    // Don't move up if already at upper limit
    if (voltage > 0 && isAtUpperLimit()) {
        stop();
        return;
    }
    
    // Don't move down if already at lower limit
    if (voltage < 0 && isAtLowerLimit()) {
        stop();
        return;
    }
    
    // Safe to apply voltage
    setVoltage(voltage);
}

// Emergency stop function
public void emergencyStop() {
    motor.setControl(new NeutralOut());
    System.err.println("EMERGENCY STOP: ARM subsystem halted!");
}`}
          </CodeBlock>
        </div>

        {/* Diagnostic Functions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-blue-600 mb-4">🔍 Diagnostic &amp; Monitoring Functions</h3>
          <CodeBlock
            language="java"
            title="System Health and Diagnostics"
          >
{`// Motor health diagnostics
public boolean isMotorHealthy() {
    double current = motor.getSupplyCurrent().getValueAsDouble();
    double temperature = motor.getDeviceTemp().getValueAsDouble();
    
    return current < MAX_SAFE_CURRENT && temperature < MAX_SAFE_TEMP;
}

public void checkMotorHealth() {
    if (!isMotorHealthy()) {
        System.err.println("ARM MOTOR WARNING: High current or temperature!");
        SmartDashboard.putBoolean("Arm Motor Healthy", false);
    } else {
        SmartDashboard.putBoolean("Arm Motor Healthy", true);
    }
}

// Comprehensive status reporting
public void reportStatus() {
    SmartDashboard.putNumber("Arm Position (deg)", Units.rotationsToDegrees(getPosition()));
    SmartDashboard.putNumber("Arm Velocity (rpm)", getVelocity() * 60);
    SmartDashboard.putNumber("Arm Current (A)", motor.getSupplyCurrent().getValueAsDouble());
    SmartDashboard.putNumber("Arm Temperature (C)", motor.getDeviceTemp().getValueAsDouble());
    SmartDashboard.putBoolean("Arm At Upper Limit", isAtUpperLimit());
    SmartDashboard.putBoolean("Arm At Lower Limit", isAtLowerLimit());
    SmartDashboard.putBoolean("Arm At Setpoint", atSetpoint());
}

// Connection status check
public boolean isMotorConnected() {
    // Check if we're getting valid sensor data
    StatusSignal<Double> positionSignal = motor.getPosition();
    return positionSignal.getStatus() == StatusCode.OK;
}`}
          </CodeBlock>
        </div>

        {/* Convenience Functions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-green-600 mb-4">⚙️ Convenience &amp; Helper Functions</h3>
          <CodeBlock
            language="java"
            title="Useful Helper Methods"
          >
{`// Preset positions for common arm angles
public void moveToStowPosition() {
    setTargetPosition(STOW_POSITION_ROTATIONS);
}

public void moveToPickupPosition() {
    setTargetPosition(PICKUP_POSITION_ROTATIONS);
}

public void moveToScoringPosition() {
    setTargetPosition(SCORING_POSITION_ROTATIONS);
}

// Unit conversion helpers
public double getPositionDegrees() {
    return Units.rotationsToDegrees(getPosition());
}

public double getVelocityRPM() {
    return getVelocity() * 60.0; // Convert rot/s to RPM
}

// Smart movement functions
public void moveToPositionSafely(double targetRotations) {
    // Clamp target to safe limits
    double clampedTarget = MathUtil.clamp(
        targetRotations, 
        LOWER_LIMIT_ROTATIONS, 
        UPPER_LIMIT_ROTATIONS
    );
    
    if (clampedTarget != targetRotations) {
        System.out.println("Target position clamped to safe limits");
    }
    
    setTargetPosition(clampedTarget);
}

// Reset functions
public void resetEncoder() {
    motor.setPosition(0.0);
    System.out.println("Arm encoder reset to zero");
}

public void calibrateToKnownPosition(double knownPositionRotations) {
    motor.setPosition(knownPositionRotations);
    System.out.println("Arm calibrated to: " + knownPositionRotations + " rotations");
}`}
          </CodeBlock>
        </div>
      </section>

      {/* Command Integration */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Utility Commands &amp; Integration
        </h2>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-purple-600 mb-4">🎮 Utility Commands</h3>
          <CodeBlock
            language="java"
            title="Commands Using Utility Functions"
          >
{`// Command to move to preset positions
public static Command moveToStow(ArmSubsystem arm) {
    return new InstantCommand(() -> arm.moveToStowPosition(), arm)
        .andThen(new WaitUntilCommand(() -> arm.atSetpoint()))
        .withName("Move Arm to Stow");
}

public static Command moveToPickup(ArmSubsystem arm) {
    return new InstantCommand(() -> arm.moveToPickupPosition(), arm)
        .andThen(new WaitUntilCommand(() -> arm.atSetpoint()))
        .withName("Move Arm to Pickup");
}

// Emergency stop command
public static Command emergencyStop(ArmSubsystem arm) {
    return new InstantCommand(() -> arm.emergencyStop(), arm)
        .ignoringDisable(true) // Works even when robot is disabled
        .withName("Emergency Stop Arm");
}

// Calibration command sequence
public static Command calibrateArm(ArmSubsystem arm) {
    return new SequentialCommandGroup(
        new InstantCommand(() -> System.out.println("Starting arm calibration...")),
        new InstantCommand(() -> arm.setVoltage(-2.0), arm), // Move slowly down
        new WaitUntilCommand(() -> arm.isAtLowerLimit()), // Until limit hit
        new InstantCommand(() -> arm.stop(), arm), // Stop motor
        new InstantCommand(() -> arm.calibrateToKnownPosition(0.0), arm), // Reset encoder
        new InstantCommand(() -> arm.moveToStowPosition(), arm), // Move to safe position
        new WaitUntilCommand(() -> arm.atSetpoint()),
        new InstantCommand(() -> System.out.println("Arm calibration complete!"))
    ).withName("Calibrate Arm");
}

// Smart joystick control with limits
public static Command joystickControlWithLimits(ArmSubsystem arm, DoubleSupplier joystickInput) {
    return new RunCommand(() -> {
        double input = MathUtil.applyDeadband(joystickInput.getAsDouble(), 0.1);
        double voltage = input * 8.0; // Scale to ±8 volts
        arm.setVoltageWithLimits(voltage);
    }, arm).withName("Joystick Control with Limits");
}`}
          </CodeBlock>
        </div>

        {/* RobotContainer Integration */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-orange-600 mb-4">🎯 Enhanced Controller Bindings</h3>
          <CodeBlock
            language="java"
            title="RobotContainer with Utility Functions"
          >
{`private void configureBindings() {
    // Basic movement with safety limits
    controller.leftBumper().whileTrue(
        ArmCommands.joystickControlWithLimits(armSubsystem, () -> controller.getLeftY())
    );
    
    // Preset position commands
    controller.a().onTrue(ArmCommands.moveToStow(armSubsystem));
    controller.b().onTrue(ArmCommands.moveToPickup(armSubsystem));
    controller.y().onTrue(ArmCommands.moveToScoring(armSubsystem));
    
    // Emergency stop (multiple triggers for safety)
    controller.start().and(controller.back()).onTrue(
        ArmCommands.emergencyStop(armSubsystem)
    );
    
    // Calibration command (hold both bumpers + start)
    controller.leftBumper().and(controller.rightBumper()).and(controller.start())
        .onTrue(ArmCommands.calibrateArm(armSubsystem));
    
    // Default command with built-in safety
    armSubsystem.setDefaultCommand(
        new RunCommand(() -> {
            // Continuously check safety and report status
            armSubsystem.checkMotorHealth();
            if (!armSubsystem.isWithinSafeLimits()) {
                armSubsystem.emergencyStop();
            }
        }, armSubsystem).withName("Arm Safety Monitor")
    );
}`}
          </CodeBlock>
        </div>
      </section>

      {/* Before/After Implementation */}
      <section className="flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Workshop Implementation: Complete ARM System
        </h2>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🔄 Before → After: PR #5 Implementation
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900">
              <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">📋 Before (PR #4)</h4>
              <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                <li>• Motion Magic profiled control</li>
                <li>• Basic position targeting</li>
                <li>• Limited safety checking</li>
                <li>• Manual position entry required</li>
                <li>• Basic diagnostic information</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <h4 className="font-bold text-green-700 dark:text-green-300 mb-2">✅ After (PR #5)</h4>
              <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                <li>• Comprehensive safety limit checking</li>
                <li>• Preset position commands for common poses</li>
                <li>• Motor health monitoring and diagnostics</li>
                <li>• Automatic calibration sequences</li>
                <li>• Enhanced controller integration with safety</li>
              </ul>
            </div>
          </div>
        </div>

        <GithubPageWithPR 
          repository="Hemlock5712/Workshop-Code" 
          filePath="src/main/java/frc/robot/subsystems/Arm.java" 
          branch="5-Utilities" 
          pullRequestNumber={5} 
          focusFile="Arm.java" 
        />

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">🔍 Code Walkthrough</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Safety Features:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Limit Checking:</strong> Prevents movement beyond safe bounds</li>
                <li>• <strong>Motor Health:</strong> Monitors current and temperature</li>
                <li>• <strong>Emergency Stop:</strong> Immediate halt capability</li>
                <li>• <strong>Connection Status:</strong> Detects communication issues</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Convenience Features:</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Preset Positions:</strong> One-command movement to common poses</li>
                <li>• <strong>Unit Conversion:</strong> Degrees, RPM, and other useful units</li>
                <li>• <strong>Smart Clamping:</strong> Automatic limit enforcement</li>
                <li>• <strong>Auto Calibration:</strong> Sensor zeroing sequences</li>
              </ul>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded mt-4">
            <p className="text-indigo-800 dark:text-indigo-300 text-sm">
              <strong>🎉 Complete System:</strong> Your ARM subsystem now has professional-grade safety, 
              diagnostics, and convenience features! This represents a production-ready mechanism implementation.
            </p>
          </div>
        </div>

        {/* Best Practices Summary */}
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-4">✅ Best Practices Summary</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Safety First:</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                <li>Always check limits before movement</li>
                <li>Monitor motor health continuously</li>
                <li>Implement emergency stops</li>
                <li>Use safe voltage limits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">User Experience:</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                <li>Provide preset positions</li>
                <li>Clear diagnostic information</li>
                <li>Intuitive control schemes</li>
                <li>Helpful error messages</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Code Quality:</h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                <li>Descriptive function names</li>
                <li>Comprehensive error handling</li>
                <li>Modular, reusable functions</li>
                <li>Good documentation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageTemplate>
  );
}