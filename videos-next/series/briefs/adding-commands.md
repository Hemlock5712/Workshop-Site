# Brief: /adding-commands, "Writing Commands" (Workshop 3)

Branch `mech-2-Commands`, 7 minutes. Order: /mechanisms → **/adding-commands** → /opmodes → /running-program (The Latched Request) → /motion-magic-code.

## 1. Teaches (page order)

- The setter is `private`; a **command** is the only way in, so the scheduler hands the mechanism to one command at a time.
- One import: `org.wpilib.command3.Command`.
- Three commands, all alike: `runSlow`, `runFast`, `stop`. On each line: the **lambda** hands the call over rather than making it; `runRepeatedly` (from `Mechanism`) makes the call **every loop**; `.named(...)` finishes the command.
- Every name ends in `(hold)`: `runRepeatedly` has no exit. Even `stop()` sends zero every loop.
- **A hold never finishes**, so nothing should wait on one (a `Command.sequence` sticks). Add the ending where it is used: `.until(someCondition)`.
- Check: `BUILD SUCCESSFUL`; three errors (missing `.named`, builder method after `.named`, missing import).

Bindings are deliberately **not** on this page; /opmodes owns `whileTrue`/`whileFalse`.

## 2. The concept that needs motion

**A lambda is an instruction handed over, not a call made now, and `runRepeatedly` opens it every loop until someone else takes the mechanism.** On the page that is three bullets of static text. In motion: the scheduler ticks (50 times a second, already taught on /command-framework), and on each tick the `() -> setVoltage(3.0)` line flashes and a fresh 3 V request lands on the TalonFX card. It never reaches an end state. That makes the second idea visible for free: a hold has no finish line, so anything queued behind it waits forever.

Secondary motion: `runRepeatedly(...)` alone is a half-built piece that snaps into a `Command` only when `.named(...)` is attached (the most common build error).

## 3. Student knows already / sets up

- **Knows:** `private` and lambdas (/java-basics); ownership, "one command per mechanism", the scheduler's 50-per-second pass, and `runRepeatedly` as `run(coroutine -> { while (true) { body; coroutine.yield(); } })` (/command-framework); the private `setVoltage` / `stopMotor` and the request field (/mechanisms); Voltage Out in Tuner X (/pid-control, /motion-magic).
- **Sets up:** /opmodes binds these to triggers; /running-program shows why `stop()` exists (latched request; do NOT re-teach it here, one line pointing forward is enough); /chaining-commands and /finish-conditions use `.until(...)`.

## 4. Code on screen

`mech-2-Commands`, `src/main/java/first/robot/mechanisms/Arm.java` (Flywheel is identical apart from comments):

```java
import org.wpilib.command3.Command;
import org.wpilib.command3.Mechanism;
```

```java
  /** Push the arm at 3 volts and keep pushing. Never finishes. */
  public Command runSlow() {
    return runRepeatedly(() -> setVoltage(3.0)).named("runSlow (hold)");
  }

  /** Push the arm at 6 volts and keep pushing. Never finishes. */
  public Command runFast() {
    return runRepeatedly(() -> setVoltage(6.0)).named("runFast (hold)");
  }

  /** Stop the arm motor and keep it stopped. Never finishes. */
  public Command stop() {
    return runRepeatedly(() -> stopMotor()).named("stop (hold)");
  }

  private void setVoltage(double voltage) {
    motor.setControl(voltageOut.withOutput(voltage));
  }
```

`stopMotor()` (unchanged from mech-1) is `motor.stopMotor();`. The stuck-sequence and fix lines are page prose, not branch code:

```java
Command.sequence(robot.arm.runSlow(), robot.flywheel.runFast())   // sticks on runSlow
robot.arm.runSlow().until(someCondition)                          // the ending goes here
```

No gains on this branch; nothing to redact.

## 5. Misconceptions / failure modes

- Thinking the lambda calls `setVoltage` right there: "It does not call `setVoltage` here. It hands that call to `runRepeatedly`, which makes it for you every loop."
- Thinking `stop()` sends zero once: "Even `stop()` holds, sending zero every loop rather than once."
- Waiting on a hold: "A hold inside `Command.sequence` sticks there forever and the sequence never reaches its next step."
- Fixing that by writing a new method instead of `.until(...)` at the call site.
- Build errors: `NeedsNameBuilderStage cannot be converted to Command` (no `.named`); `cannot find symbol: method withPriority(int)` (builder method after `.named`); `cannot find symbol: class Command` (import).
- Calling `setVoltage` from outside the class: goes around the scheduler's bookkeeping (quiz 1).

## 6. Interactive moment idea

"Schedule one." Three chips under the code panel: runSlow, runFast, stop. Viewer taps any; the scheduler hands the arm to it, the old one is canceled (chip greys, line un-highlights), and the tick pulse starts re-sending that request. Gate ends after the viewer has swapped owners at least once or 7.5 s. No controller here: bindings are next lesson, so the chips stand in for "something schedules this". Alternative: the stuck sequence, viewer taps "next step" and nothing happens until they attach an `.until`.

## 7. Visual pieces needed beyond the kit

- **Scheduler tick lane**: a metronome strip of pulses (one per loop) with each pulse drawing a line from the highlighted lambda to the TalonFX card. Show maybe 5 per second visually and say "every loop", not a number.
- **Lambda as an envelope/card**: `() -> setVoltage(3.0)` lifts out of the code, travels into a `runRepeatedly` slot, and is "opened" on each tick. Contrast frame: a bare `setVoltage(3.0)` that fires once.
- **Builder snap**: `runRepeatedly(...)` piece rendered as an incomplete puzzle shape labelled "not a Command yet", `.named("runSlow (hold)")` snaps on and it becomes a Command chip.
- **Owner badge** on the arm ("owned by runSlow (hold)") reused from the scheduler chips in the latched video.
- **Sequence rail**: two boxes on a track, a progress marker parked in the first box with an infinite spinner, the second box never lighting. Then `.until(...)` appears as a finish flag on the first box and the marker moves on.

## 8. Draft beat outline

1. **Name it.** "A command is the only way to ask a mechanism for anything." Code panel: `private void setVoltage` with a lock icon.
2. **Connect.** "In the last lesson you made the setter private. Nothing outside the arm can call it." Outside call bounces off the lock.
3. **The import + first command.** One import line slides in; `runSlow` types out.
4. **The lambda is handed over.** Lambda lifts out as a card into the `runRepeatedly` slot. "This doesn't set the voltage. It hands that job over."
5. **Every loop.** Scheduler ticks start; each tick highlights the lambda and lands a 3 V request on the TalonFX card; arm creeps up. "Every loop, it sets three volts again."
6. **Naming finishes it.** Builder snap. "Until it has a name, it isn't a command yet, and the build will tell you so."
7. **Three alike.** `runFast` and `stop` appear; `stop` re-sends zero every tick. "Stop holds too. It sends zero every loop."
8. **Your turn.** Tap a chip, watch ownership swap and the request change.
9. **Holds don't end.** Every name ends in hold. Sequence rail: marker parks in runSlow forever; flywheel box never lights.
10. **The fix.** `.until(someCondition)` added at the call site; marker moves on. "Give it an ending where you use it, not in a new method."
11. **Takeaway.** "A command hands its action to the scheduler, and a hold runs it every loop until something else takes over."
