# Brief: /command-framework (The Command Framework, Workshop 2, 10 min page)

## 1. Teaches

- **The triad**: Triggers (When), Mechanisms (What, a class that `implements Mechanism`), Commands (How, named actions; almost all are holds).
- **The scheduler loop**: `robotPeriodic()` runs every 20 ms, **50 times a second**; the one call `Scheduler.getDefault().run()` checks every trigger, starts and cancels commands, runs background code.
- **One command per mechanism**: a command declares the mechanisms it needs and **owns** them while it runs. Equal priority means the newcomer wins and the running one is canceled. Default commands exist only if you set one with `setDefaultCommand(...)`; otherwise an unclaimed mechanism sends nothing, and Phoenix keeps the last request ("Canceling is not stopping", links to `/running-program#latched`).
- **Where bindings live**: mechanisms are `public final` fields on `Robot`; each mode is a class marked `@Teleop` / `@Autonomous` / `@Utility`, bindings in its **constructor**, thrown away on a mode switch.
- **Commands with no finish condition**: `runRepeatedly(...)` runs its body every loop; nothing inside decides when to stop. `whileTrue` cancels on release, `whileFalse` schedules `arm.stop()`. The `(hold)` suffix promises "this command has no ending".
- Check your work: who owns the arm before the press, while held, after release.

## 2. The concept that needs motion

**The scheduler tick and ownership over time.** The page's own check asks the student to write down who owns the arm at three moments, which is a timeline problem described in prose. Animate it as a 50 Hz loop: each tick sweeps triggers, then hands a turn to whichever command owns each mechanism. Press the trigger and `runFast (hold)` takes the arm's slot; release and `whileTrue` cancels it in the same tick that `whileFalse` puts `stop (hold)` in. An ownership lane per mechanism (arm, flywheel) with named command blocks makes "one command per mechanism" and "newcomer wins at equal priority" obvious in a way the static three-card figure can't.

Do **not** make canceling-is-not-stopping the centrepiece. CLAUDE.md says latched requests are taught once, at `/running-program#latched`, and that is the finished reference video. Here it gets at most a one-line forward pointer.

## 3. Student knows already / Sets up

- **Knows**: `/java-basics`: lambda is code handed over and "something else runs that command later" (this video names the something: the scheduler); `runSlow` / `runRepeatedly` / `implements Mechanism`; constructor runs once. Workshop 1 (`/mechanism-setup`, `/pid-control`): Voltage Out in Tuner X, TalonFX 31 is the arm.
- **Sets up**: `/project-setup` and `/project-structure` (the files `Robot.java`, `opmode/MyTeleop.java`, `mechanisms/`); `/mechanisms` (the `public final` fields); `/adding-commands` (the three holds); `/opmodes` (bindings in the constructor); `/running-program` (the latched-request demo this page defers to); `/chaining-commands` and `/finish-conditions` (giving a hold an ending).

## 4. Code on screen

All from branch `mech-2-Commands`; the page blocks match the branch.

`src/main/java/first/robot/Robot.java` (trimmed: empty `public Robot() {}` dropped, as on the page):

```java
public class Robot extends OpModeRobot {
  // The robot's mechanisms. Public so OpModes can use them.
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}
```

`src/main/java/first/robot/opmode/MyTeleop.java` (page shows only the first binding; branch also has these two):

```java
@Teleop(name = "Teleop")
public class MyTeleop extends PeriodicOpMode {
  private final CommandNiDsXboxController driver = new CommandNiDsXboxController(0);

  public MyTeleop(Robot robot) {
    // Left trigger: push the arm up while held, stop when released.
    driver.leftTrigger().whileTrue(robot.arm.runFast()).whileFalse(robot.arm.stop());

    // Right trigger: spin fast while held, drop back to the slow voltage when released.
    driver.rightTrigger().whileTrue(robot.flywheel.runFast()).whileFalse(robot.flywheel.runSlow());
  }
}
```

`src/main/java/first/robot/mechanisms/Arm.java`:

```java
public Command runFast() {
  return runRepeatedly(() -> setVoltage(6.0)).named("runFast (hold)");
}

public Command stop() {
  return runRepeatedly(() -> stopMotor()).named("stop (hold)");
}
```

Flywheel (TalonFX 21) has identical `runSlow` 3 V / `runFast` 6 V / `stop` holds.

## 5. Misconceptions / failure modes

- Deleting the scheduler line: "Without it, a built command is inert." (quiz 1)
- Thinking a running command can't be taken: "ties go to the newcomer" (quiz 2).
- Thinking a hold will finish: "A hold has no ending by design, so anything waiting on one waits forever" (quiz 3).
- Thinking an unclaimed mechanism is off: "Nothing commanding the motor is not the same as the motor being off" (quiz 4; defer to the latched video).
- Implicit: bindings from auto firing in teleop. They don't; the mode's bindings are thrown away on a switch.

## 6. Interactive moment idea

Pause on the check-your-work question. The student holds and releases the **left trigger** (and, optionally, the right) while the scheduler lanes run. They should see: before press, arm lane empty ("unclaimed"); held, `runFast (hold)` block in the arm lane with the `whileTrue` line highlighted and the tick counter running; on release, `runFast` drops out with a "canceled" mark and `stop (hold)` slides in on the same tick, `whileFalse` line highlighted. Pressing the right trigger at the same time shows the flywheel lane change independently: two mechanisms, two owners. Gate on one full press-release.

Stretch: a second button bound to another arm command, so pressing it mid-hold shows the newcomer taking the arm (quiz 2). Note: that binding isn't on the branch, so label it hypothetical or skip it.

## 7. Visual pieces needed

- **Scheduler loop**: a 20 ms tick clock / sweep with a "50 per second" label, each tick visibly polling triggers then running owners.
- **Ownership lanes**: one horizontal lane per mechanism (Arm, Flywheel) on a scrolling time axis; named command blocks with a "(hold)" tail that never closes on its own; canceled and started marks.
- **Trigger-to-command wiring**: lines from controller buttons to `whileTrue` / `whileFalse` slots, lighting when they fire.
- **Triad cards** (When / What / How) for the opening, can be static.
- **Flywheel** drawable (second mechanism lane needs a body).
- Optional: **OpMode frame** that wraps the bindings and disappears on a mode switch.
- Existing: controller, code panel with live highlight, TalonFX card, arm.

## 8. Draft beat outline

1. Name it: robot code is three things: triggers say when, mechanisms are what, commands are how.
2. Callback: last lesson, a command was a parcel waiting for something to run it. That something is the scheduler.
3. Show `robotPeriodic` and the one call. Tick clock starts: fifty times a second it checks every trigger and runs what's scheduled.
4. Show the arm and flywheel as fields on the robot, then the Teleop class and its left-trigger binding.
5. Demo press: the trigger lights, `runFast` takes the arm's lane. It owns the arm now; nothing else can touch that motor.
6. It's a hold: the body runs every tick and nothing inside it ever says stop. Ending it is the trigger's job.
7. Demo release: in one tick, `runFast` is canceled and `stop` takes its place.
8. Your turn: hold and release the trigger, then try both triggers at once; each mechanism has its own owner.
9. One line on the empty lane before the first press: nothing is running there, and that's not the same as off. Pointer to the latched video.
10. Bindings live in the mode's constructor and vanish when you switch modes.
11. Takeaway: every twentieth of a second the scheduler decides which one command owns each mechanism.

Notes for the parent:

- The page says "Priorities are new in Commands v3", which implies a v2 to compare against. Don't carry that phrasing into narration; just say equal priority means the newcomer wins.
- The `MarginNote` shows `runRepeatedly` as `run(coroutine -> { while (true) { body; coroutine.yield(); } })`. Accurate to the page, but leave it out of a 90 s video; Coroutines owns it.
