# Brief: /opmodes (Workshop 3, "OpModes")

Page: `src/app/(workshop)/opmodes/page.tsx`, branch `mech-2-Commands`, 7 minutes. It comes right after `/adding-commands` and right before `/running-program` (the finished "Latched Request" video). The page owns the binding words `whileTrue` and `whileFalse`.

## 1. Teaches (page order)

- Each way the robot runs is its own class marked with an annotation. The generated `MyTeleop` carries `@Teleop`, and that annotation is the whole registration: the framework finds it and the driver station lists it. There's no RobotContainer.
- **Edit the generated file, don't add a second one.** The five empty generated methods aren't needed. `MyAuto` (`@Autonomous`) waits until Coroutines in Workshop 4.
- **Bind the buttons**: a controller on port 0. The constructor receives the one `Robot` and reaches `robot.arm` and `robot.flywheel`.
- `whileTrue` schedules on press and cancels on release. `whileFalse` schedules on release. Every hold has a `whileFalse` behind it. The right trigger falls back to `runSlow`, not to zero.
- Bindings made in the constructor belong to that OpMode, and the framework removes them on a mode change. Bind in the constructor, but never drive a motor from it.

## 2. The concept that needs motion

**A button has two edges, and each edge is a binding.** On the page it's two sentences. On screen: the left trigger goes down, `runFast` lights in the code panel and appears as "running on Arm", and the TalonFX card shows 6 V. The trigger comes up, `runFast` is cancelled and `stop` is scheduled in the same instant, and the card shows the stop. Do the right trigger next and the fallback is `runSlow` at 3 V, not zero. That contrast is the point: the release edge picks what happens next. A timeline strip under the controller (press ▼ … release ▲, with a command bar on each side) makes the two-edge idea concrete.

**Second idea: bindings belong to the mode.** Switch the driver-station mode from Teleop to My Auto and the binding lines in the code panel fade out together. Press the trigger and nothing lights. Switch back and the framework builds `MyTeleop` again and the bindings return. That shows "no cleanup to write" without saying it twice.

Don't demo what happens with no `whileFalse`. That's the reference video's job. Close with a one-line pointer to it.

## 3. Student knows already / Sets up

- **Knows**: `runSlow`, `runFast` and `stop` on each mechanism, built with `runRepeatedly(...).named("... (hold)")`, holds that never finish (`/adding-commands`). The `robot.arm` and `robot.flywheel` fields (`/mechanisms`). OpModes are found by package (`/project-structure`). The scheduler runs every loop (`/command-framework`).
- **Sets up**: `/running-program` runs these exact bindings in simulation and deletes a `whileFalse` to show the latched request. `/coroutines` writes the first real `@Autonomous`.

## 4. Code on screen

Before, generated (`main`, `src/main/java/first/robot/opmode/MyTeleop.java`, trimmed):

```java
@Teleop
public class MyTeleop extends PeriodicOpMode {
  private final Robot robot;

  public MyTeleop(Robot robot) {
    this.robot = robot;
  }

  @Override
  public void disabledPeriodic() { ... }
  @Override
  public void start() { ... }
  @Override
  public void periodic() { ... }
  @Override
  public void end() { ... }
  @Override
  public void close() { ... }
}
```

After (`mech-2-Commands`, same path; imports are `first.robot.Robot`, `org.wpilib.command3.button.CommandNiDsXboxController`, `org.wpilib.opmode.PeriodicOpMode` and `org.wpilib.opmode.Teleop`):

```java
@Teleop(name = "Teleop")
public class MyTeleop extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public MyTeleop(Robot robot) {
    // Left trigger: push the arm up while held, stop when released.
    driver.leftTrigger().whileTrue(robot.arm.runFast()).whileFalse(robot.arm.stop());

    // Right trigger: spin fast while held, drop back to the slow voltage when released.
    driver.rightTrigger().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.runSlow());

    // A: spin fast while held, stop when released.
    driver.a().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.stop());
  }
}
```

The commands being bound (`mech-2-Commands`, `Arm.java`; Flywheel is identical with the 3.0 / 6.0 voltages):

```java
public Command runFast() {
  return runRepeatedly(() -> setVoltage(6.0)).named("runFast (hold)");
}
public Command stop() {
  return runRepeatedly(() -> stopMotor()).named("stop (hold)");
}
```

Generated sibling (`main`, `MyAuto.java`): `@Autonomous(name = "My Auto", group = "Group 1")`.

## 5. Misconceptions / failure modes

- A second `@Teleop` class: "puts two teleops on the driver station". Picking the generated empty one means nothing moves (Quiz Q2).
- Expecting the right-trigger release to stop the flywheel. It drops to `runSlow` (Quiz Q1).
- `cannot find symbol: variable flywheel` when only one mechanism is built: delete those binding lines, don't rename them to the arm (Quiz Q3).
- Thinking bindings outlive the mode, or need cleanup in `end()` (Quiz Q4).
- "Bind in the constructor, but never drive a motor from it, because the robot can still be disabled when that code runs."

## 6. Interactive moment

**Pick the release.** The narration pauses with the right trigger held and the flywheel spinning at 6 V. A three-way chip sits on the `whileFalse(...)` slot: `stop`, `runSlow`, `runFast`. The student picks one and releases the trigger, and the wheel spins down to zero, settles at 3 V, or keeps going. Then the narration resumes: "The release is yours to choose. On the left trigger we chose stop." If the student keeps `runFast`, it plays as a tease for the Hardware Simulation video, not as a full latched demo.

A simpler fallback: the student presses and releases the controller freely while the timeline strip records each edge and the command it scheduled.

## 7. Visual pieces needed beyond the kit

- A driver-station mode picker (Teleop / My Auto) with Enable, so mode switches can be shown. A short list populated by the annotation scan.
- A press/release edge timeline under the controller, with command bars labelled by `.named` names ("runFast (hold)", "stop (hold)").
- A "Scheduled on: Arm / Flywheel" readout. It can be a strip on each mechanism.
- The flywheel visual (the kit has the arm on its stand; this lesson binds both).
- A collapsing-code transition from the generated five-method file to the three-binding file.
- A chip selector on a code token for the interactive moment.

## 8. Draft beat outline

1. Name it: "An OpMode is one way the robot can run, and it's its own class."
2. Connect: the project creator already made one. Open the generated teleop: one annotation, five empty methods. The annotation puts it on the driver-station list.
3. Edit, don't add: a ghost second teleop appears on the list, then gets struck off.
4. The empty methods collapse and three binding lines type in. Port 0 lights on the controller.
5. Press the left trigger: the run-fast line lights, the arm request card shows 6 V, and the arm rises.
6. Release: run-fast is cancelled and stop is scheduled in the same instant. Two edges, two bindings.
7. Right trigger: the release lands on run-slow, not zero, and the wheel settles at 3 V.
8. Your turn: pick what the release does, then let go.
9. Switch the mode to My Auto: the bindings fade and the trigger does nothing. Switch back and they return. No cleanup.
10. One rule: bind in the constructor, never drive a motor from it.
11. Takeaway: "Every hold needs a release, and the next video shows what happens when it's missing."
