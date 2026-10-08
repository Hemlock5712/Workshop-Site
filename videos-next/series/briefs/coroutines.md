# Brief: /coroutines, "Coroutines" (Workshop 4)

Branch **`mech-5-Coroutines`** (page sets `branch`). Diff from `mech-4-ReadingState` adds one file: `src/main/java/first/robot/opmode/RaiseAndShootOpMode.java` (78 lines). The page's step code matches the branch line for line. 15 minutes. The page already ships an interactive **`CoroutineTimeline`** (`src/components/lesson/CoroutineTimeline.tsx`): main flow down the left, each `fork` peels off a lane, solid border = executing, dashed = waiting, `--ok` only on a condition flip; clock dwell values 0.50 / 0.60 / 1.00 s from the bench. The video should match its vocabulary.

## 1. Teaches (page order)

- **Two reasons for a coroutine**: a hold must span several steps, or the logic needs a real loop/branch. A sequence is already a coroutine awaiting each member and stays the default.
- **The core five**: `waitUntil(cond, timeout)` + `.timedOut()`; `fork` (start a hold, keep going); `await` (run a step, wait for it); `wait(Seconds.of(1.0))`; `yield()` inside your own `while`. `WaitResult` lives in `Coroutine`; `ForkResult` can be ignored.
- **House rules**: routine across mechanisms = `Command.noRequirements(coroutine -> body(coroutine)).named(...)` with a private body method; **fork holds, await steps**; waits are `coroutine.waitUntil`; every autonomous wait has a timeout (~2x measured); **every exit stops what it started** (fork `flywheel.stop()` before each `return`; arm needs none, its position request holds).
- **Build the routine** in four steps: shell with `start()`/`end()` scheduling and cancelling; fork the arm (alone, it "barely twitches" because the routine ends and cancels its forks); bounded wait with `if (...timedOut()) return;`; fork flywheel, bounded wait, shoot wait, fork stop.

## 2. The concept that needs motion

**Forked work keeps running while the routine's own line is paused.** That is unintelligible as static code read top to bottom: the eye reads `fork`, then `waitUntil`, and assumes the arm stops being driven. In motion: the code panel's highlight parks on the dashed `waitUntil` line while the arm lane keeps scrolling and the arm keeps holding. Second: **ending the routine cancels every fork at once**, so the step-2 "barely twitches" result and the `return` paths are visible as all lanes cut on the same frame. Third: the `timedOut()` branch as a fork in the road on the timeline.

## 3. Student knows already / sets up

- **Knows:** `isAtTarget()`, `.until`, timeouts, and the unbounded Y-button coroutine with `fork`/`waitUntil`/`await` named once each (/finish-conditions); sequence-as-await-loop (/chaining-commands); `@Autonomous`, `PeriodicOpMode` (/opmodes); latched requests (/running-program#latched, link only).
- **Sets up:** /logging-implementation (reading back a routine nobody watched); /testing; Workshop 5 /autonomous and /drive-to-tag-inline (the `while` + `yield` loop).

## 4. Code on screen

`mech-5-Coroutines`, `src/main/java/first/robot/opmode/RaiseAndShootOpMode.java`, trimmed:

```java
@Autonomous(name = "Raise And Shoot")
public class RaiseAndShootOpMode extends PeriodicOpMode {
  public RaiseAndShootOpMode(Robot robot) {
    this.robot = robot;
    routine =
        Command.noRequirements(coroutine -> raiseAndShoot(coroutine)).named("Raise And Shoot");
  }

  private void raiseAndShoot(Coroutine coroutine) {
    coroutine.fork(robot.arm.vertical());

    if (coroutine.waitUntil(() -> robot.arm.isAtTarget(), Seconds.of(3.0)).timedOut()) {
      return;
    }

    coroutine.fork(robot.flywheel.runFast());

    if (coroutine.waitUntil(() -> robot.flywheel.isAtTarget(), Seconds.of(3.0)).timedOut()) {
      coroutine.fork(robot.flywheel.stop());
      return;
    }

    coroutine.wait(Seconds.of(1.0)); // shoot

    coroutine.fork(robot.flywheel.stop());
  }

  @Override public void start() { Scheduler.getDefault().schedule(routine); }
  @Override public void end() { Scheduler.getDefault().cancel(routine); }
}
```

Core-five page block (only `yield` loop is not on the branch):

```java
while (!robot.arm.isAtTarget()) {
  coroutine.yield();
}
```

Verified in `commandsv3-java-2027.0.0-alpha-7-sources.jar` (`Coroutine.java`): `fork(Command...)` → `ForkResult`, `await(Command)`, `wait(Time)`, `waitUntil(BooleanSupplier)` and `waitUntil(BooleanSupplier, Time)` → `WaitResult` with `timedOut()`, `yield()`; `Command.noRequirements(Consumer<Coroutine>)`. Also verified (`Scheduler.evictConflictingRunningCommands`): a forked `stop()` evicts its sibling `runFast()` because they share the flywheel, which is why the stop line replaces the spin.

## 5. Misconceptions / failure modes

- `await` on a hold: "The arm moves and nothing else ever happens." Fork holds, await steps.
- Ignoring the `WaitResult` (quiz 3): "The timeout ends the wait, not the routine." The robot shoots "at an angle nobody checked."
- No timeout in auto: a jam eats the whole period (quiz 2).
- Ending the routine stops the motors (quiz 4, 6): it cancels the forks, nothing sends a zero; flywheel stays at 75 RPS without the forked `stop()`.
- Gains ship at `0.0`: "Three seconds, then the routine ends. The arm never gets there." Tune first.
- Spotless strips an unused `Seconds` import.
- Overuse (quiz 5): two independent legs in order is a sequence, not a coroutine.
- Don't use `park`, `awaitAll`, `awaitAny`, `StateMachine`, or `Command.waitUntil(...).withTimeout(...)` on screen.

## 6. Interactive moment

**"fork or await?"** At the first line, the code panel shows a two-way chip `coroutine.___(robot.arm.vertical())`. The viewer picks. `await`: the highlight sits on line 1 forever, the arm lane holds, nothing else lights, a 15 s autonomous clock drains. `fork`: the highlight drops to the dashed `waitUntil` while the arm lane keeps running. Mirrors check step 4.

Second candidate (if time): a "jam the arm" button mid-run; the 3 s wait times out and the `return` branch lights, all lanes cut, flywheel never starts. Contrast with the `if` deleted: robot shoots anyway.

## 7. Visual pieces needed beyond the kit

- **Fork-lane timeline** matching `CoroutineTimeline`: main flow column, peel-off lanes for Arm and Flywheel, solid vs dashed, a robot clock, a "routine ended, all lanes cut" frame.
- **Branch indicator** for `timedOut()` (two exits from a wait: arrived / gave up).
- **Autonomous clock** (15 s) instead of a held button; the controller is idle in this video, which itself makes the point.
- Flywheel sim with RPS readout and a TalonFX card showing the `stop` request landing before the routine ends, then coast-down.
- Driver Station auto picker showing "Raise And Shoot" (the `@Autonomous` string, not the class name).

## 8. Draft beat outline

1. **Name it.** "A coroutine is a routine written as ordinary Java that can pause on a line."
2. **Connect.** The Y button from last lesson, but autonomous: no button, nobody to let go.
3. **Why not a sequence.** The arm hold has to span every step after it; a list can't do that.
4. **Fork.** Line 1 runs; an arm lane peels off. Run it alone: routine ends, lane cut, arm twitches.
5. **Your turn.** fork or await. Await: frozen. Fork: carries on.
6. **Bounded wait.** `waitUntil(..., 3 s)` goes dashed while the arm lane keeps moving; condition flips green at ~0.5 s.
7. **Gave up.** Jam the arm; timeout fires, `return` branch, everything cut, flywheel never started.
8. **Flywheel and shot.** Second fork, second bounded wait, one-second wait for the shot, two lanes live.
9. **Every exit stops what it started.** Final fork of `stop()`: flywheel card switches to a zero, then the routine ends. Without it, the card still says 75 (link to /running-program, no re-teach).
10. **Takeaway.** "Fork the holds, await the steps, put a limit on every wait, and stop what you started before you leave."
