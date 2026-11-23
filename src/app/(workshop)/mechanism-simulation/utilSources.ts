/**
 * The two `utils/` files from the `mech-sim` branch, whole, so a student can
 * copy them into their own project from the lesson. Copied from the branch,
 * not typed. When the branch moves, replace each string with the output of:
 *
 *   git -C reference/work/Workshop-Code show mech-sim:src/main/java/first/robot/utils/SimUtil.java
 */
export const SIM_UTIL_JAVA = `// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package first.robot.utils;

import com.ctre.phoenix6.configs.MagnetSensorConfigs;
import com.ctre.phoenix6.hardware.CANcoder;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.signals.AppliedRotorPolarityValue;
import com.ctre.phoenix6.signals.SensorDirectionValue;
import com.ctre.phoenix6.sim.ChassisReference;
import java.util.HashMap;
import java.util.Map;
import org.wpilib.command3.Scheduler;

/**
 * The CTRE plumbing a mechanism simulation needs, so the {@code ...Sim} classes can stay about the
 * physics.
 */
public final class SimUtil {
  private SimUtil() {}

  /**
   * Which way the motor is mounted, for its {@code SimState.Orientation}. CTRE's own swerve
   * simulation uses Clockwise_Positive when the motor is inverted. This reads the direction the
   * Talon reports it is applying, which follows the Inverted config.
   */
  public static ChassisReference orientationOf(TalonFX motor) {
    return motor.getAppliedRotorPolarity().getValue()
            == AppliedRotorPolarityValue.PositiveIsClockwise
        ? ChassisReference.Clockwise_Positive
        : ChassisReference.CounterClockwise_Positive;
  }

  /**
   * Copies a CANcoder's sensor direction and magnet offset onto its {@code SimState}, the way
   * CTRE's own swerve simulation does, so the simulated CANcoder reports the true angle. Reading a
   * config can time out while the simulator is still starting, so call this every loop until it
   * returns true.
   */
  public static boolean matchCANcoderConfig(CANcoder encoder) {
    var magnet = new MagnetSensorConfigs();
    if (!encoder.getConfigurator().refresh(magnet, 0.05).isOK()) {
      return false;
    }
    var encoderSim = encoder.getSimState();
    encoderSim.Orientation =
        magnet.SensorDirection == SensorDirectionValue.Clockwise_Positive
            ? ChassisReference.Clockwise_Positive
            : ChassisReference.CounterClockwise_Positive;
    encoderSim.SensorOffset = magnet.MagnetOffset;
    return true;
  }

  // The newest simulation for each motor. Building a mechanism twice (every JUnit test does)
  // retires the old simulation instead of running two against the same device.
  private static final Map<String, Runnable> newest = new HashMap<>();

  /**
   * Runs {@code step} once every robot loop, for as long as it is the newest simulation of this
   * motor. Call it from a constructor that runs before any OpMode: started inside an OpMode or a
   * command, the scheduler stops it when that OpMode or command ends.
   */
  public static void everyLoop(TalonFX motor, Runnable step) {
    String device = motor.getNetwork().getName() + ":" + motor.getDeviceID();
    newest.put(device, step);
    Scheduler.getDefault()
        .sideload(
            coroutine -> {
              while (newest.get(device) == step) {
                step.run();
                coroutine.yield();
              }
            });
  }
}`;

export const MECHANISM_VIEWS_JAVA = `// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package first.robot.utils;

import static org.wpilib.units.Units.Meters;

import com.ctre.phoenix6.BaseStatusSignal;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.signals.ControlModeValue;
import org.wpilib.command3.Scheduler;
import org.wpilib.smartdashboard.Mechanism2d;
import org.wpilib.smartdashboard.MechanismLigament2d;
import org.wpilib.smartdashboard.MechanismRoot2d;
import org.wpilib.telemetry.Telemetry;
import org.wpilib.units.measure.Distance;
import org.wpilib.util.Color;
import org.wpilib.util.Color8Bit;

/**
 * Mechanism2d pictures of a mechanism, drawn from what its motor reports. They run everywhere: on a
 * SystemCore, in Hardware Sim and in Simulate Robot Code, so the picture always shows the real (or
 * simulated) mechanism and the target its closed loop is chasing.
 *
 * <p>Open them in the Sim GUI or AdvantageScope under the name you give.
 */
public final class MechanismViews {
  private MechanismViews() {}

  /**
   * An arm: a thick orange line where the motor says the arm is, and a thin grey line at its
   * position target while a position loop (such as Motion Magic) is running. Angles are the motor's
   * own: 0 points right, 0.25 rotations straight up.
   */
  public static void arm(String name, TalonFX motor, Distance length) {
    double lengthMeters = length.in(Meters);
    double size = lengthMeters * 2.4;
    var view = new Mechanism2d(size, size);
    MechanismRoot2d pivot = view.getRoot("pivot", size / 2, size / 2);
    // The target goes first so the arm draws over it.
    MechanismLigament2d target =
        pivot.append(new MechanismLigament2d("target", 0, 0, 3, new Color8Bit(Color.GRAY)));
    MechanismLigament2d arm =
        pivot.append(
            new MechanismLigament2d("arm", lengthMeters, 0, 8, new Color8Bit(Color.ORANGE)));

    // Grabbed once and refreshed together every loop, quietly: a missing motor just stops the
    // picture instead of printing an error 50 times a second.
    var position = motor.getPosition(false);
    var mode = motor.getControlMode(false);
    var reference = motor.getClosedLoopReference(false);

    Scheduler.getDefault()
        .addPeriodic(
            () -> {
              if (!BaseStatusSignal.refreshAll(position, mode, reference).isOK()) {
                return;
              }
              arm.setAngle(position.getValueAsDouble() * 360);
              if (isPositionControl(mode.getValue())) {
                target.setLength(lengthMeters);
                target.setAngle(reference.getValueAsDouble() * 360);
              } else {
                target.setLength(0);
              }
              Telemetry.log(name, view);
            });
  }

  /**
   * A flywheel, as a speed gauge: a wheel at 75 rotations per second can't be drawn turning when
   * the picture updates 50 times a second. A thick orange bar for how fast it is spinning, and a
   * thin grey bar for its target speed while a velocity loop is running. A full bar is {@code
   * fullScaleRps}.
   */
  public static void flywheel(String name, TalonFX motor, double fullScaleRps) {
    var view = new Mechanism2d(1.2, 0.5);
    MechanismRoot2d targetRoot = view.getRoot("target", 0.1, 0.3);
    MechanismRoot2d speedRoot = view.getRoot("speed", 0.1, 0.2);
    MechanismLigament2d target =
        targetRoot.append(new MechanismLigament2d("target", 0, 0, 3, new Color8Bit(Color.GRAY)));
    MechanismLigament2d speed =
        speedRoot.append(new MechanismLigament2d("speed", 0, 0, 12, new Color8Bit(Color.ORANGE)));

    // Grabbed once and refreshed together every loop, quietly, as in arm().
    var velocity = motor.getVelocity(false);
    var mode = motor.getControlMode(false);
    var reference = motor.getClosedLoopReference(false);

    Scheduler.getDefault()
        .addPeriodic(
            () -> {
              if (!BaseStatusSignal.refreshAll(velocity, mode, reference).isOK()) {
                return;
              }
              speed.setLength(gauge(velocity.getValueAsDouble(), fullScaleRps));
              if (mode.getValue().toString().contains("Velocity")) {
                target.setLength(gauge(reference.getValueAsDouble(), fullScaleRps));
              } else {
                target.setLength(0);
              }
              Telemetry.log(name, view);
            });
  }

  /** True while the motor runs a position loop, so its closed-loop reference is an angle. */
  private static boolean isPositionControl(ControlModeValue mode) {
    String name = mode.toString();
    return name.contains("Position")
        || (name.contains("MotionMagic") && !name.contains("Velocity"));
  }

  /** A speed as a bar length, 0 to 1 m. Reverse is drawn the same as forward. */
  private static double gauge(double rps, double fullScaleRps) {
    return Math.min(Math.abs(rps) / fullScaleRps, 1.0);
  }
}`;
