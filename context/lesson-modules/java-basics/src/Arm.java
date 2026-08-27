/**
 * The same Arm you will meet on branch mech-1-Mechanisms, with the hardware taken out.
 *
 * <p>Read it top to bottom. Fields, then a constructor, then methods, then a method that returns
 * code instead of a number. That order is the lesson.
 */
public class Arm {
  // Fields. Created once, when the Arm is created, and they last as long as it does.
  private final Motor motor = new Motor("arm");
  private static final double SLOW_VOLTAGE = 1.0;
  private static final double FAST_VOLTAGE = 3.0;

  // The constructor. Runs once, when someone writes `new Arm()`. Setup goes here.
  public Arm() {
    System.out.println("Arm created. Motor is at rest.");
  }

  // A method. Runs every time someone calls it, and only then.
  public void setVoltage(double voltage) {
    motor.setVoltage(voltage);
  }

  public void stop() {
    motor.stopMotor();
  }

  /**
   * Code as a value. This returns a Runnable, which is a piece of code that has not run yet.
   * Calling runFast() does not move the arm. Calling .run() on what it hands back does.
   *
   * <p>On the robot this returns a Command instead of a Runnable, and the scheduler is what calls
   * it. The idea is identical.
   */
  public Runnable runFast() {
    return () -> setVoltage(FAST_VOLTAGE);
  }

  public Runnable runSlow() {
    return () -> setVoltage(SLOW_VOLTAGE);
  }
}
