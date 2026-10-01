package workshop.sim;

import first.robot.Robot;
import org.wpilib.framework.RobotBase;

/**
 * Starts the student's {@link Robot} exactly as {@code first.Main} does, then adds the physics
 * the lesson branch leaves out.
 *
 * <p>The teaching branches have no simulation code, so a plain sim run holds every motor still:
 * nothing moves the simulated encoders. This class sits beside the project, not in it. It adds
 * one periodic callback that steps {@link Plant}, and it does not change a line of the code the
 * student edits.
 */
public final class SimHarness {
  private SimHarness() {}

  public static void main(String... args) {
    RobotBase.startRobot(
        () -> {
          Robot robot = new Robot();
          Plant plant = new Plant();
          robot.addPeriodic(() -> plant.step(), Plant.DT_SECONDS);
          return robot;
        });
  }
}
