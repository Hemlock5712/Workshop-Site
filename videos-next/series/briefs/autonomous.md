# Brief: /autonomous, "Autonomous" (Workshop 5, second-to-last lesson)

Branch `swerve-autonomous` (one commit on `1-Swerve`, adds `opmodes/LeaveStartAuto.java`). Page `time="30 minutes"`. Followed by /pathplanner, which replaces the timer with a drawn path and holds it against this lesson's three measured runs.

## 1. Teaches (page order)

- **Two layers**: the `@Autonomous` class is _lifecycle_ (name on the driver station, `Robot` in the constructor, schedule in `start()`, cancel in `end()`); the routine command is _behavior_ (which way, how long, how it stops). Keep controllers, match clock and mode names out of the command.
- **Build the routine**: built in the constructor (sends no output, safe while disabled), held in a field so `end()` can cancel it. `RobotCentric().withVelocityX(1.0)`, `coroutine.wait(Seconds.of(1.5))`, then `stopped`. Two names: the annotation is what the driver reads, `.named(...)` is what the scheduler shows.
- **The stop is sent twice**: last line of the coroutine covers a finished run; `whenCanceled` covers a cancel, which skips that line. No default command, so nothing else zeroes the drivetrain.
- **Four test passes**: on blocks, on the floor once, measured three times (tape vs `Drivetrain/Pose`), disabled partway.
- **Three failure shapes**: nothing moves (a wait with no timeout), never stops (latched request), wrong place (robot-centric heading, tired battery).
- **Check**: three runs within about 10 cm; write down distance, end pose and wait for /pathplanner.

## 2. Format

**Hybrid, mostly animated.** The ideas are a timeline and a top-down field: a mode boundary, a coroutine stepping through three lines, and a robot that keeps rolling when the zero is missing. No tool procedure here a recording explains better. One short recorded insert at the end (optional, 8 to 10 s): AdvantageScope's 2D field with `Drivetrain/Pose` showing three end poses landing on top of each other. Shot list if recorded: AdvantageScope open on a log or live NT → drag `NT:/Drivetrain/Pose` onto a 2D Field tab → zoom to the robot outline at the end of the run → scrub to show the end pose value in the sidebar.

## 3. The concept that needs motion

**Two exits from one coroutine.** The routine has a normal exit (the last line runs) and a cancel exit (disable mid-wait; the coroutine stops where it is and the last line never runs). A playhead stepping through the three coroutine lines, synced to a top-down robot, shows both: in one run the playhead reaches `setControl(stopped)` and the robot stops; in the other, disable lands mid-`wait`, the playhead jumps to `whenCanceled`, and that is what stops it. Then delete the last line and the robot keeps rolling off the field. Prose says "sent twice"; motion shows _why_ twice.

Second, briefly: **robot-centric X follows the bumper.** Same routine from two starting headings, two different directions.

## 4. Student knows already / sets up

- **Knows:** `@Autonomous` class and `start()`/`end()` from /coroutines (Raise And Shoot, `@Autonomous(name = "Raise And Shoot")` on `mech-5-Coroutines`); `run(coroutine -> ...)`, `coroutine.wait(...)`; the latched request (/running-program, the series' "latched" video, callback only); resource rule (/command-framework); `Drivetrain/Pose` and a trusted pose from /swerve-drive-tuning; robot vs field frame from /swerve-prerequisites.
- **Sets up:** /pathplanner. "A wait is the only finish line available here." The three numbers become the yardstick for a drawn path, and the one-class-per-routine shape is folded into one Auto OpMode with a drop-down.

## 5. Code on screen

`swerve-autonomous`, `src/main/java/frc/robot/opmodes/LeaveStartAuto.java` (matches the page block exactly):

```java
@Autonomous(name = "Leave Start")
public class LeaveStartAuto extends PeriodicOpMode {
  private final Command routine;

  public LeaveStartAuto(Robot robot) {
    final var forward = new SwerveRequest.RobotCentric().withVelocityX(1.0); // meters per second
    final var stopped = new SwerveRequest.RobotCentric(); // every speed is zero

    routine =
        robot.drivetrain
            .run(
                coroutine -> {
                  robot.drivetrain.setControl(forward);
                  coroutine.wait(Seconds.of(1.5));
                  robot.drivetrain.setControl(stopped);
                })
            .whenCanceled(() -> robot.drivetrain.setControl(stopped))
            .named("Leave Start");
  }

  @Override
  public void start() { Scheduler.getDefault().schedule(routine); }

  @Override
  public void end() { Scheduler.getDefault().cancel(routine); }
}
```

Highlight in turn: the annotation string, the two `final var` requests, the three coroutine lines, `whenCanceled`, `start`/`end`.

## 6. Misconceptions / failure modes

- Expecting the command ending to stop the wheels (quiz 1): "ending a command sends nothing to the motors. This OpMode sets no default." Callback to the latched video, one line; do not re-teach it.
- Thinking the routine drives "down the field" (quiz 2): "Robot-centric X follows the starting heading."
- Registering a second routine in `Robot` (quiz 3): "A second routine is a second file... Nothing registers it."
- Re-enabling after a disable without re-picking the mode (quiz 4): "Re-select the mode from the list... picking a mode builds the OpMode fresh."
- "Nothing moves": "A wait with no time limit holds the routine there forever."
- Trusting the arithmetic: "Battery voltage and carpet move that number on every run."
- Safety: "Nobody in front of the robot... one person the driver station, with a thumb near disable."

## 7. Interactive moment idea

**"Hit disable."** The routine plays on the top-down field with the coroutine panel beside it. A big DISABLE key is live the whole run. Press it during the 1.5 s wait: the playhead jumps out of `wait` into `whenCanceled`, the zero request card flashes, robot stops. Don't press it: the playhead reaches the last line and the robot stops there. Then a toggle strikes through `setControl(stopped)`; with it off, letting the wait finish sends the robot coasting off the edge, and only disable stops it.

## 8. Visual pieces needed beyond the kit

- **Top-down field + swerve robot drawable** (needed by all Workshop 5/6 videos). Must show: field outline with a corner origin marker labelled (0, 0) at the blue corner and +X/+Y axes; a square robot with bumpers in two colours and a clear **front-bumper marker** (a notch or arrow) so heading is legible; four module wheels whose angles can be animated; a **tape mark** on the carpet; a fading **trail**; a **ghost/estimated pose** outline that can sit apart from the true robot (used later by vision); a pose readout chip (x, y, θ). Should support a velocity arrow on the robot.
- **Coroutine panel with playhead**: the three lines plus a `whenCanceled` line, a progress bar on `wait(1.5 s)`.
- **Driver station mode list**: a dropdown with "Leave Start" (and later "Auto"), an Enable/Disable pair.
- **Swerve request card** (drivetrain analogue of the TalonFX card): shows `RobotCentric vx 1.0` vs `RobotCentric 0`, latched.
- **Tape-measure overlay** and three stacked end-pose dots for the "measured, three times" pass.

## 9. Draft beat outline

1. **Callback.** "You've built an `@Autonomous` class once: Raise And Shoot ran the arm with nobody on the sticks. This one drives the whole robot."
2. **Two layers.** Class card (name, `start`, `end`) beside command card (drive, wait, stop). "The class is what you can't test without a driver station. Keep everything else out of it."
3. **Build it.** Two requests appear: forward at 1 m/s, and all zeros. Three coroutine lines type in.
4. **Run it.** Mode list → Leave Start → Enable. Robot leaves the tape mark, playhead walks the wait, last line stops it.
5. **Delete the stop.** Robot keeps rolling. One-line callback: "The last request stays applied, and this mode sets no default."
6. **Disable midway.** Playhead freezes in `wait`; the last line never runs. `whenCanceled` sends the same zero. "That's why it's sent twice."
7. **Your turn.** Hit disable whenever you like.
8. **Heading sets direction.** Same routine, robot rotated on the tape mark, drives toward the side wall.
9. **Test in layers.** Blocks, floor, measured three times, disabled partway. Three end-pose dots cluster within about ten centimetres.
10. **Three failure shapes.** Sits still (unbounded wait), never stops (no zero), wrong place (heading, battery).
11. **Hand-off.** "Write down the distance, the end pose, and the wait. Next, a drawn path that knows where it ends replaces the timer."

## 10. Site/branch mismatches

- Page code matches `swerve-autonomous` `LeaveStartAuto.java` line for line (branch adds two comments and two javadocs). No API issue.
- Page `time="30 minutes"` exceeds the 15-minute hard cap in CLAUDE.md's Writing section. Same on /pathplanner. Either the field is floor time rather than reading time, or the pages are over budget; worth a decision.
- The failure card says "Every `coroutine.waitUntil(...)` in a routine takes a timeout," but this routine uses `coroutine.wait(...)` only, so "Nothing moves" never applies to the code on the page. Fine as general advice; the video should present it as a rule for later routines, not a bug in this one.
