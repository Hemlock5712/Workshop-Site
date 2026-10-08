# Brief: /project-structure (Workshop 3, "Project Structure")

Page: `src/app/(workshop)/project-structure/page.tsx`. Sits between `/project-setup` and `/git-workflow`, before `/mechanisms`. 9 minutes, no code typed.

## 1. Teaches (page order)

- **The tree**: what the New Project Creator made, plus what Workshop 3 adds. Three things you leave alone: `Main.java`, `build/`, the `gradle/wrapper` files.
- **Three kinds of Java file**: `Robot.java` owns the mechanisms as `public final` fields and runs the scheduler once per loop. A **mechanism class** is one physical thing, with private hardware and public methods that return a `Command` or answer a question. An **OpMode class** is one entry on the driver station list, and its constructor binds buttons.
- OpModes are found only in `first.robot` or a package under it.
- **Where numbers live**: there's no Constants file. CAN IDs go where the device is made, gains go in the pasted config, setpoints go in the command, tolerances are a private field.
- **Where new code goes**: ask what the code talks to (motor/sensor, one mechanism's action, a button, two mechanisms together, a vendor library, a deploy file).
- Failure mode: the `package` line has to match the folder.

## 2. The concept that needs motion

Mostly this page is a **file-tree tour**, and a tree tour doesn't need animating. A 20-second VS Code screen recording expanding `src/main/java/first` does the job better than a rebuilt tree.

The one idea worth animating is **who builds whom at runtime**, because a static tree hides it:
`Main` starts `Robot` → `Robot` builds `arm` and `flywheel` once → the driver station picks a mode → the framework builds that OpMode and hands it the one `Robot` → the OpMode reaches `robot.arm`. Shown as objects popping into existence in order, it explains in one sweep why the mechanisms are fields on Robot, why OpModes take `Robot robot` in the constructor, and why buttons don't go in a mechanism.

The secondary idea, "ask what the code talks to", works best as a **sorting game**. It's the page's own check: the quiz is a sort exercise.

Recommendation: keep it short (about 60 s), or fold the runtime build-order sequence into the start of the `/mechanisms` or `/opmodes` video and use a screen recording for the tree.

## 3. Student knows already / Sets up

- **Knows**: the project was generated with the OpMode Robot template, and Commands v3 plus Phoenix 6 are installed (`/project-setup`). From `/command-framework`, `robotPeriodic()` runs `Scheduler.getDefault().run()` every loop. Fields, constructors and methods come from `/java-basics`.
- **Sets up**: `/mechanisms` creates the `mechanisms` folder and the first class. The student needs to know it goes beside `Robot.java`, in package `first.robot.mechanisms`.

## 4. Code on screen

`main`, `src/main/java/first/Main.java` (the line that matters; never edited):

```java
RobotBase.startRobot(first.robot.Robot::new);
```

`mech-1-Mechanisms` and later, `src/main/java/first/robot/Robot.java`:

```java
public class Robot extends OpModeRobot {
  // The robot's mechanisms. Public so OpModes can use them.
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  public Robot() {}

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}
```

The generated `Robot.java` comment on `main` is the source of the discovery rule:

> OpMode classes anywhere in the package (or sub-packages) where this class is located are automatically registered to display in the Driver Station.

`mech-2-Commands`, `opmode/MyTeleop.java` (the shape of an OpMode):

```java
@Teleop(name = "Teleop")
public class MyTeleop extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public MyTeleop(Robot robot) {
    driver.leftTrigger().whileTrue(robot.arm.runFast()).whileFalse(robot.arm.stop());
    ...
  }
}
```

Where numbers live, all verified: `new TalonFX(21, canivore)` (Flywheel, mech-1). `runRepeatedly(() -> setVelocity(75.0)).named("runFast (hold)")` (Flywheel, mech-3 onward). `isAtTarget()` (mech-4 onward). `RaiseAndShootOpMode` (mech-5, `@Autonomous(name = "Raise And Shoot")`).

## 5. Misconceptions / failure modes

- "Put the file one level up and VS Code marks that line red: the declared package does not match the expected package. Move the file, not the line."
- An OpMode in `first.auto` builds but doesn't appear: "first.auto is beside first.robot rather than under it."
- Wrong home for code: a Constants file, a button in Robot when it belongs to one mode, a mechanism reading a controller, a two-mechanism routine inside one mechanism.
- Editing `build/` ("an edit there disappears") or `Main.java`.

## 6. Interactive moment

**Sort it.** The narration pauses. Four cards appear: "CAN ID of a new motor", "B lowers the arm in teleop", "raise arm then spin flywheel", "a new auto in `first/auto`". The student drags each onto the tree (`Flywheel.java`, `MyTeleop`, the OpMode, or outside `first.robot`). A wrong drop shakes and states the rule in one line. The `first/auto` card lands but greys out on the driver-station list, which shows the discovery rule.

## 7. Visual pieces needed beyond the kit

- A file-tree panel with folders that expand and a highlight per file.
- An "object graph" layer: boxes for Main, Robot, Arm, Flywheel and MyTeleop that appear in build order, with arrows for "builds" and "is handed".
- A driver-station OpMode list (Teleop / My Auto) that fills itself by scanning the package.
- Drag-and-drop cards for the sort.

## 8. Draft beat outline

1. Name it: "Every piece of robot code has one place it goes, and the folders tell you where."
2. Connect: "You made this project in Project Setup. Here's what's inside." Short tree reveal; the three files you leave alone dim out.
3. Power on: Main starts Robot. Robot builds the arm and the flywheel, once.
4. The driver station scans the robot folder and lists Teleop and My Auto.
5. Pick Teleop: the framework builds it and hands it the robot, and an arrow runs from a button to `robot.arm`.
6. Three kinds of file, each lit in turn: the owner, the thing, the mode.
7. Numbers sit next to the line that uses them. There's no Constants file.
8. Your turn: the sort game, four cards.
9. Package line versus folder: a file dragged up a level, and its first line goes red.
10. Takeaway: "Ask what the code talks to, and that's the file it goes in."
