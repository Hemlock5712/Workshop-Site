/**
 * Run this file with the Run button above main().
 *
 * <p>Watch the order the lines print in. It is not the order they appear in the source, and that
 * difference is the whole lesson.
 */
public class Main {
  public static void main(String[] args) {
    System.out.println("1. before the Arm exists");

    Arm arm = new Arm();

    System.out.println("2. asking for the runFast code");
    Runnable fast = arm.runFast();

    System.out.println("3. the arm has not moved yet");

    System.out.println("4. now running it");
    fast.run();
    fast.run();

    arm.stop();
    System.out.println("5. done");
  }
}
