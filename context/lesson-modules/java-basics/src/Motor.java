/**
 * A stand-in for a real motor. It prints instead of spinning.
 *
 * <p>On the robot this is a TalonFX and the voltage reaches a real arm. Here it reaches
 * System.out. Nothing else about the shape of the code changes, which is the point: what you
 * learn on this file is what you will read on the real Arm.
 */
public class Motor {
  private final String name;
  private double voltage = 0.0;

  public Motor(String name) {
    this.name = name;
  }

  public void setVoltage(double volts) {
    voltage = volts;
    System.out.printf("%s -> %.1f V%n", name, voltage);
  }

  public void stopMotor() {
    setVoltage(0.0);
  }

  public double getVoltage() {
    return voltage;
  }
}
