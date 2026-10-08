# Brief: /finish-conditions, "Finish Conditions" (Workshop 4)

Branch **`mech-4-ReadingState`** (page sets `branch`). Diff from `mech-3-MotionMagic` adds `getPosition`/`getTargetPosition`/`isAtTarget` + `tolerance` to `Arm`, the velocity equivalents to `Flywheel`, and a coroutine Y button + `robot` field in `MyTeleop`. The `.until(...)`/`.withTimeout` steps (`raiseArm`, `spinUp`) are **page code only**, not on the branch. 15 minutes. Arm/Flywheel forked page; arm reading is the default.

## 1. Teaches (page order)

- `.until(...)` ends a command the first loop a **`BooleanSupplier`** comes back true; the scheduler asks ~50 times a second. Pass `() -> robot.arm.isAtTarget()`; drop the `() ->` and you pass "one frozen answer" (`boolean cannot be converted to BooleanSupplier`). `.until` returns a builder, `.named` closes it.
- **The arrival question** lives in the mechanism: `isAtTarget()` = `getPosition().isNear(getTargetPosition(), tolerance)`. Never `==`: "Ask for 0.25 rotations and you read 0.2497, then 0.2503."
- **Both endings on one step**: condition is the ending you want, timeout the ending you get when a sensor dies. `.withTimeout` goes after `.named`. "What a timeout proves: that the waiting is over, and nothing else."
- **One button, both mechanisms**: first coroutine. `fork` the arm hold, `waitUntil` arrival, `await` the flywheel. `Command.noRequirements` claims nothing; each fork claims its own mechanism only while it runs. Unbounded waits are OK only because a driver holds Y.
- **Conditions that never come true**: tolerance too tight, dead sensor (timeout covers both), true too early / passing through (timeout can't help; debounce behind `isAtTarget()`).

## 2. The concept that needs motion

**A condition is a question asked every loop, not an answer taken once.** Motion: each scheduler tick, the lambda pulses, a reading ticks on the arm's angle gauge, a tolerance band sits around the target, and the step ends on the tick the needle enters the band. The frozen-boolean mistake is the same scene with one snapshot value that never updates.

Second: **the stopwatch vs the sensor**. On the timeline, the step's bar is a race between a condition bar and a 2 s timeout bar. Healthy run: the condition wins at ~0.5 s. Tolerance 0.001: the needle hovers just outside the band, the timeout wins at exactly 2.0 s, and the next step starts with the arm short. That is the whole lesson in one visual. (Verified: `until` is `ParallelGroupBuilder().optional(this, Command.waitUntil(cond))`, and `withTimeout` is `race(this, waitFor(timeout))`, so both endings really are race members.)

## 3. Student knows already / sets up

- **Knows:** steps, `withTimeout`, `Command.sequence`, `.named` closing builders (/chaining-commands); lambdas (/java-basics); `MotionMagicVoltage`/velocity requests, the request objects `positionOut`/`velocityOut` (/motion-magic-code); latched requests (/running-program).
- **Sets up:** /coroutines owns `fork`/`await`/`waitUntil(cond, timeout)` properly and puts this routine in autonomous with a timeout on every wait. Student writes down settle time and doubles it; /coroutines asks for that number.

## 4. Code on screen

`mech-4-ReadingState`, `src/main/java/first/robot/mechanisms/Arm.java`:

```java
private final Angle tolerance = Degrees.of(1.0);

public boolean isAtTarget() {
  return getPosition().isNear(getTargetPosition(), tolerance);
}
public Angle getPosition() { return encoder.getPosition().getValue(); }
public Angle getTargetPosition() { return positionOut.getPositionMeasure(); }
```

(Flywheel: `RotationsPerSecond.of(0.5)`, `motor.getVelocity().getValue()`, `velocityOut.getVelocityMeasure()`.)

Page code block:

```java
Command raiseArm =
    robot.arm.vertical()
        .until(() -> robot.arm.isAtTarget())
        .named("vertical until at target")
        .withTimeout(Seconds.of(2.0));
```

`mech-4-ReadingState`, `src/main/java/first/robot/opmode/MyTeleop.java`:

```java
driver.y().whileTrue(
        Command.noRequirements(coroutine -> spinUpWhenReady(coroutine))
            .named("Spin Up When Ready (hold)"))
    .whileFalse(robot.flywheel.stop());

private void spinUpWhenReady(Coroutine coroutine) {
  coroutine.fork(robot.arm.vertical());
  coroutine.waitUntil(() -> robot.arm.isAtTarget());
  coroutine.await(robot.flywheel.runFast());
}
```

## 5. Misconceptions / failure modes

- Frozen boolean: `.until(robot.arm.isAtTarget())`, compile error.
- `position == target`, "false forever, so a step waiting on one never ends."
- Missing `.named` after `.until` (quiz 3); `.withTimeout` before `.named` won't compile.
- Reading a timeout as success (quiz 4): "Nothing. The timeout tells you the waiting is over, not where the arm is."
- The three never-true shapes (grid).
- **Caveat for the coroutine segment:** do not animate a sequence version with the arm dropping when its step ends. The latched position request keeps the sim arm at vertical either way. The page's real argument (quiz 7) is ownership: `SequentialGroup` holds the union of its members' requirements for the whole run (verified in `SequentialGroup.java`). Show that as claim shading on lanes, not as arm physics.

## 6. Interactive moment

**Tolerance slider.** The viewer drags the tolerance band from 1° down to 0.001°. Replay: the needle settles just outside the band, the condition bar never finishes, the 2 s timeout bar wins, the step ends with "timed out" on the card. Then a toggle "remove timeout": the bar runs off the edge. Mirrors check steps 2–4 exactly.

## 7. Visual pieces needed beyond the kit

- **Arm angle gauge** with target tick and shaded tolerance band; reading with jitter in the third decimal.
- **Scheduler timeline** from /chaining-commands, with a two-member race rendering (condition bar vs stopwatch bar, winner highlighted).
- **"Question" pulse**: the lambda in the code panel blinking once per loop, with a true/false chip.
- **Claim shading** on lanes (who owns the mechanism) for the sequence-vs-coroutine comparison.
- Flywheel + second TalonFX card for the last segment.

## 8. Draft beat outline

1. **Name it.** "A finish condition ends a step when the mechanism says it arrived."
2. **Connect.** Last lesson ended the arm step on a one-second stopwatch. That number was a guess.
3. **The question.** `isAtTarget()` in `Arm`: gauge, band, `isNear`. "Never exactly equal" jitter shot.
4. **Asked every loop.** `.until(() -> ...)` line pulses each tick; the step ends on the tick the needle enters the band. Contrast: no arrow, one frozen answer.
5. **Two endings.** Add `.withTimeout`; timeline shows condition vs stopwatch. Healthy run: condition wins.
6. **Your turn.** Tolerance slider to 0.001; the stopwatch wins at 2.0 s.
7. **What a timeout proves.** Arm short of target, next step begins anyway. "The waiting is over. That's all."
8. **One button, both.** Y coroutine: fork lights the arm lane, waitUntil goes dashed, flywheel lane starts when the band is hit. Routine bar claims no lane.
9. **Never-true shapes** quick triptych: too tight, dead sensor, passing through.
10. **Takeaway.** "End on the sensor, back it with a timer, and don't trust the timer's ending as arrival."
