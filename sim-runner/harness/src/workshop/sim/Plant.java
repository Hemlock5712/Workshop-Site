package workshop.sim;

import com.ctre.phoenix6.BaseStatusSignal;
import com.ctre.phoenix6.CANBus;
import com.ctre.phoenix6.StatusSignal;
import com.ctre.phoenix6.hardware.CANcoder;
import com.ctre.phoenix6.hardware.TalonFX;
import com.ctre.phoenix6.sim.CANcoderSimState;
import com.ctre.phoenix6.sim.ChassisReference;
import com.ctre.phoenix6.sim.TalonFXSimState;
import org.wpilib.hardware.hal.OpModeOption;
import org.wpilib.hardware.hal.RobotMode;
import org.wpilib.hardware.hal.SimDevice;
import org.wpilib.hardware.hal.SimDouble;
import org.wpilib.math.system.DCMotor;
import org.wpilib.math.system.Models;
import org.wpilib.simulation.DriverStationSim;
import org.wpilib.simulation.FlywheelSim;
import org.wpilib.simulation.SingleJointedArmSim;

/**
 * Physics for the workshop's bench arm and flywheel, wired to the Phoenix 6 simulated devices the
 * student's {@code Arm} and {@code Flywheel} create.
 *
 * <p>Phoenix keys a simulated device by bus and CAN ID, so this class opens its own handles to
 * TalonFX 31, CANcoder 32 and TalonFX 21 on "canivore" and drives their sim state. Each step it
 * reads the voltage the student's control request produced, feeds it to a WPILib physics model,
 * and writes the resulting position and velocity back as sensor readings. The student's code is
 * the only thing deciding that voltage.
 *
 * <p>The numbers are the bench hardware's, the same ones {@code src/lib/pidPhysics.ts} and
 * {@code src/lib/flywheelPhysics.ts} use on the site: a Kraken X44 on a 28.125:1 gearbox swinging
 * 2 kg at 0.4 m, and a Kraken X44 direct to a 0.01 kg·m² wheel.
 *
 * <p>Angles: the arm's CANcoder reads 0.25 rotations straight up and 0.5 lying flat on the
 * intake side, so the physics angle is {@code 2π × rotations} with 0 horizontal and gravity
 * pulling toward π. It rests on a hard stop at π (the floor) and may swing past vertical to π/4.
 */
final class Plant {
  static final double DT_SECONDS = 0.005;

  private static final double ARM_GEARING = 28.125;
  private static final double ARM_LENGTH_M = 0.4;
  private static final double ARM_MASS_KG = 2.0;
  private static final double ARM_MIN_RAD = Math.PI / 4;
  private static final double ARM_MAX_RAD = Math.PI;
  private static final double FLYWHEEL_MOI = 0.01;
  private static final double BATTERY_VOLTS = 12.0;
  /** Telemetry goes out every fourth step, 50 Hz, which is the robot loop rate. */
  private static final int PUBLISH_EVERY = 4;

  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX armMotor = new TalonFX(31, canivore);
  private final CANcoder armEncoder = new CANcoder(32, canivore);
  private final TalonFX flywheelMotor = new TalonFX(21, canivore);

  private final TalonFXSimState armMotorSim = armMotor.getSimState();
  private final CANcoderSimState armEncoderSim = armEncoder.getSimState();
  private final TalonFXSimState flywheelMotorSim = flywheelMotor.getSimState();

  private final SingleJointedArmSim armPhysics =
      new SingleJointedArmSim(
          DCMotor.getKrakenX44(1),
          ARM_GEARING,
          ARM_MASS_KG * ARM_LENGTH_M * ARM_LENGTH_M,
          ARM_LENGTH_M,
          ARM_MIN_RAD,
          ARM_MAX_RAD,
          true,
          ARM_MAX_RAD);

  private final FlywheelSim flywheelPhysics =
      new FlywheelSim(
          Models.flywheelFromPhysicalConstants(DCMotor.getKrakenX44(1), FLYWHEEL_MOI, 1.0),
          DCMotor.getKrakenX44(1));

  private final StatusSignal<Double> armReference = armMotor.getClosedLoopReference();
  private final StatusSignal<Double> flywheelReference = flywheelMotor.getClosedLoopReference();

  // One HAL SimDevice carries everything the browser draws. halsim_ws publishes it as a
  // "SimDevice" message with "<"-prefixed keys, because every value is an output.
  private final SimDevice telemetry = SimDevice.create("Workshop");
  private final SimDouble armRotations = output("armRotations");
  private final SimDouble armReferenceRotations = output("armReferenceRotations");
  private final SimDouble armVolts = output("armVolts");
  private final SimDouble flywheelRps = output("flywheelRps");
  private final SimDouble flywheelReferenceRps = output("flywheelReferenceRps");
  private final SimDouble flywheelVolts = output("flywheelVolts");
  private final SimDouble simSeconds = output("simSeconds");

  private int steps = 0;
  private boolean teleopSelected = false;

  Plant() {
    armMotorSim.setMotorType(TalonFXSimState.MotorType.KrakenX44);
    flywheelMotorSim.setMotorType(TalonFXSimState.MotorType.KrakenX44);
    // The flywheel config sets Inverted to Clockwise_Positive. Phoenix's sim state has to be
    // told the same thing, or positive output would spin the simulated wheel backward.
    flywheelMotorSim.Orientation = ChassisReference.Clockwise_Positive;
  }

  void step() {
    if (!teleopSelected) {
      teleopSelected = selectTeleop();
    }
    // The halsim_ws Joystick provider writes axes and buttons but does not raise the driver
    // station's new-data event, so the robot would never see a trigger pull without this.
    DriverStationSim.notifyNewData();

    armMotorSim.setSupplyVoltage(BATTERY_VOLTS);
    armEncoderSim.setSupplyVoltage(BATTERY_VOLTS);
    flywheelMotorSim.setSupplyVoltage(BATTERY_VOLTS);

    armPhysics.setInputVoltage(armMotorSim.getMotorVoltage());
    armPhysics.update(DT_SECONDS);
    double armRot = armPhysics.getAngle() / (2 * Math.PI);
    double armRps = armPhysics.getVelocity() / (2 * Math.PI);
    armEncoderSim.setRawPosition(armRot);
    armEncoderSim.setVelocity(armRps);
    armMotorSim.setRawRotorPosition(armRot * ARM_GEARING);
    armMotorSim.setRotorVelocity(armRps * ARM_GEARING);

    flywheelPhysics.setInputVoltage(flywheelMotorSim.getMotorVoltage());
    flywheelPhysics.update(DT_SECONDS);
    double wheelRps = flywheelPhysics.getAngularVelocity() / (2 * Math.PI);
    flywheelMotorSim.setRotorVelocity(wheelRps);
    flywheelMotorSim.addRotorPosition(wheelRps * DT_SECONDS);

    if (++steps % PUBLISH_EVERY == 0) {
      BaseStatusSignal.refreshAll(armReference, flywheelReference);
      armRotations.set(armRot);
      armReferenceRotations.set(armReference.getValue());
      armVolts.set(armMotorSim.getMotorVoltage());
      flywheelRps.set(wheelRps);
      flywheelReferenceRps.set(flywheelReference.getValue());
      flywheelVolts.set(flywheelMotorSim.getMotorVoltage());
      simSeconds.set(steps * DT_SECONDS);
    }
  }

  /**
   * Attach a driver station, pick the Teleop OpMode, and enable, the way a student would on the
   * Driver Station. Returns false until the robot has published its OpModes.
   */
  private boolean selectTeleop() {
    for (OpModeOption option : DriverStationSim.getOpModeOptions()) {
      if (option.getMode() == RobotMode.TELEOPERATED) {
        DriverStationSim.setDsAttached(true);
        DriverStationSim.setRobotMode(RobotMode.TELEOPERATED);
        DriverStationSim.setOpMode(option.id);
        DriverStationSim.setEnabled(true);
        DriverStationSim.notifyNewData();
        System.out.println("@@enabled " + option.name);
        return true;
      }
    }
    return false;
  }

  private SimDouble output(String name) {
    return telemetry.createDouble(name, SimDevice.Direction.OUTPUT, 0.0);
  }
}
