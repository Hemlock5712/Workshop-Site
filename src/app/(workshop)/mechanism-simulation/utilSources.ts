/**
 * The two `utils/` files from the `mech-sim` branch, whole, so a student can
 * copy them into their own project from the lesson. Copied from the branch,
 * not typed. When the branch moves, replace each string with the output of:
 *
 *   git -C reference/work/Workshop-Code show mech-sim:src/main/java/first/robot/utils/SimUtil.java
 *
 * November 2026: `MechanismViews` replaced from the rebuilt branch. Its views
 * take the mechanism's own getters instead of the `TalonFX`, and the grey
 * target is always drawn. `SimUtil` is unchanged.
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

import static org.wpilib.units.Units.Degrees;
import static org.wpilib.units.Units.Meters;
import static org.wpilib.units.Units.RotationsPerSecond;

import java.util.function.Supplier;
import org.wpilib.command3.Scheduler;
import org.wpilib.smartdashboard.Mechanism2d;
import org.wpilib.smartdashboard.MechanismLigament2d;
import org.wpilib.smartdashboard.MechanismRoot2d;
import org.wpilib.telemetry.Telemetry;
import org.wpilib.units.measure.Angle;
import org.wpilib.units.measure.AngularVelocity;
import org.wpilib.units.measure.Distance;
import org.wpilib.util.Color;
import org.wpilib.util.Color8Bit;

/**
 * Mechanism2d pictures of a mechanism, drawn from the mechanism's own getters. They run everywhere:
 * on a SystemCore, in Hardware Sim and in Simulate Robot Code, so the picture always shows the real
 * (or simulated) mechanism and the target it was asked for.
 *
 * <p>Open them in the Sim GUI or AdvantageScope under the name you give.
 */
public final class MechanismViews {
  private MechanismViews() {}

  /**
   * An arm: a thick orange line where the arm is, and a thin grey line where it was last asked to
   * go. Angles are the mechanism's own: 0 points right, 0.25 rotations straight up.
   *
   * @param name the picture's name on the dashboard
   * @param position where the arm is, such as {@code () -> getPosition()}
   * @param target where the arm was asked to go, such as {@code () -> getTargetPosition()}
   * @param length the arm's length, pivot to tip
   */
  public static void arm(
      String name, Supplier<Angle> position, Supplier<Angle> target, Distance length) {
    double lengthMeters = length.in(Meters);
    double size = lengthMeters * 2.4;
    var view = new Mechanism2d(size, size);
    MechanismRoot2d pivot = view.getRoot("pivot", size / 2, size / 2);
    // The target goes first so the arm draws over it.
    MechanismLigament2d targetLine =
        pivot.append(
            new MechanismLigament2d("target", lengthMeters, 0, 3, new Color8Bit(Color.GRAY)));
    MechanismLigament2d armLine =
        pivot.append(
            new MechanismLigament2d("arm", lengthMeters, 0, 8, new Color8Bit(Color.ORANGE)));

    Scheduler.getDefault()
        .addPeriodic(
            () -> {
              armLine.setAngle(position.get().in(Degrees));
              targetLine.setAngle(target.get().in(Degrees));
              Telemetry.log(name, view);
            });
  }

  /**
   * A flywheel, as a speed gauge: a wheel at 75 rotations per second can't be drawn turning when
   * the picture updates 50 times a second. A thick orange bar for how fast it is spinning, and a
   * thin grey bar for the speed it was last asked for. A full bar is {@code fullScaleRps}.
   *
   * @param name the picture's name on the dashboard
   * @param velocity how fast the wheel is spinning, such as {@code () -> getVelocity()}
   * @param target the speed it was asked for, such as {@code () -> getTargetVelocity()}
   * @param fullScaleRps the speed that fills the bar, in rotations per second
   */
  public static void flywheel(
      String name,
      Supplier<AngularVelocity> velocity,
      Supplier<AngularVelocity> target,
      double fullScaleRps) {
    var view = new Mechanism2d(1.2, 0.5);
    MechanismRoot2d targetRoot = view.getRoot("target", 0.1, 0.3);
    MechanismRoot2d speedRoot = view.getRoot("speed", 0.1, 0.2);
    MechanismLigament2d targetBar =
        targetRoot.append(new MechanismLigament2d("target", 0, 0, 3, new Color8Bit(Color.GRAY)));
    MechanismLigament2d speedBar =
        speedRoot.append(new MechanismLigament2d("speed", 0, 0, 12, new Color8Bit(Color.ORANGE)));

    Scheduler.getDefault()
        .addPeriodic(
            () -> {
              speedBar.setLength(gauge(velocity.get().in(RotationsPerSecond), fullScaleRps));
              targetBar.setLength(gauge(target.get().in(RotationsPerSecond), fullScaleRps));
              Telemetry.log(name, view);
            });
  }

  /** A speed as a bar length, 0 to 1 m. Reverse is drawn the same as forward. */
  private static double gauge(double rps, double fullScaleRps) {
    return Math.min(Math.abs(rps) / fullScaleRps, 1.0);
  }
}`;
