## What is here

```
src/main/java/first/
  Main.java                  starts the robot. You will not edit this.
  robot/Robot.java           extends OpModeRobot. Owns the mechanisms.
  robot/opmode/MyTeleop.java a @Teleop mode, empty
  robot/opmode/MyAuto.java   an @Autonomous mode, empty
```

`Robot` is not a mode. It is the thing every mode is handed in its constructor,
and it is where a mechanism gets created once and shared. Each OpMode is its
own class tagged `@Teleop` or `@Autonomous`, and the Driver Station lists
whatever it finds in `first.robot.opmode`. There is no `RobotContainer` in this
stack and no chooser to register a mode with.

## Steps

1. Open `src/main/java/first/robot/opmode/MyTeleop.java`.
2. Put a print in `start()`, which runs once when the robot is enabled:

   ```java
   @Override
   public void start() {
     System.out.println("Teleop started");
   }
   ```

3. Press **Start** on the Driver Station. The first build downloads WPILib 2027
   and Phoenix 6, so give it a few minutes. Later builds take seconds.
4. When the Driver Station shows the robot connected, pick **MyTeleop**, then
   **Enable**.

## Check yourself

`Teleop started` appears in the terminal at the moment you enable, and not
before. Disable and enable again and it prints a second time.

If it prints as soon as the program starts, the print is in the constructor
rather than in `start()`. That distinction is the whole file: the constructor
runs when the mode is selected, `start()` runs when the robot is enabled, and
`periodic()` runs about every 20 ms for as long as it stays enabled.

## Watch out

`MyAuto` and `MyTeleop` both hold a `robot` field that nothing reads yet. It is
not dead code. It is the handle every later lesson uses to reach a mechanism,
and deleting it means putting it back in the next module.
