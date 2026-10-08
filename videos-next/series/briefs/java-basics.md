# Brief: /java-basics (Java Basics, Workshop 2, 7 min page)

## 1. Teaches

- The page does not teach Java. It sends the student to Codecademy's free **Learn Java**, four modules only (Hello World, Variables, Object-Oriented Java, Conditionals and Control Flow), plus Loops before Coroutines in Workshop 4.
- **The six pieces** in robot code: class (`class Arm` is the drawing, `new Arm()` builds one), field (`private final TalonFX motor`), constructor (runs once, the instant `new Arm()` runs, never called by name), method (read the return type first; `void` hands nothing back), lambda (code written down and handed over rather than run; the `() ->` "makes it a parcel instead of a call"), the dot (what you may type after it depends on the type in front of it).
- `private` / `public`; `final` "locks the box and not the contents" (`motor.setControl(...)` still works, `motor = new TalonFX(...)` does not).
- `implements Mechanism` gives `Arm` everything `Mechanism` can do: `runRepeatedly(...)` is called in `Arm.java` but written nowhere in it.
- WatchOut: **writing a lambda runs nothing.**

## 2. The concept that needs motion

**The lambda as a parcel.** "Written down and handed over rather than run" is a timing claim, and timing is exactly what prose can't show. A picture can: calling `runSlow()` produces a sealed box with `setVoltage(3.0)` inside, the box travels to a Command, the motor stays at 0 V, and only later, once something runs the command, the box opens every 20 ms and the motor card lights. Without the `() ->`, the call fires on the spot and nothing is left to hand over. This is also the page's only WatchOut and quiz questions 1 and 2.

Secondary, only if time allows: `final` locks the box, not the contents (a field drawn as a labelled box with an arrow to a TalonFX; arrow can't be re-pointed, but the TalonFX's request can change). Everything else on the page (the Codecademy table, private/public, the dot) is a static lookup and not worth animating.

## 3. Student knows already / Sets up

- **Knows**: Workshop 1 is entirely Tuner X. In `/mechanism-setup` and `/pid-control` they picked **Voltage Out** from the control drop-down and watched the motor push; they know TalonFX 31 is the arm. They have never seen Java on this site.
- **Sets up**: `/command-framework` needs "class, field, method, constructor, lambda" and the idea that a command is built now and run later by something else (the scheduler). `/adding-commands` and `/finish-conditions` lean on lambdas; `/mechanisms` on fields, constructor, methods.

## 4. Code on screen

Page block, verbatim (matches branch `mech-2-Commands`, `src/main/java/first/robot/mechanisms/Arm.java`):

```java
/** Push the arm with a gentle voltage and keep pushing. Never finishes. */
public Command runSlow() {
  return runRepeatedly(() -> setVoltage(3.0)).named("runSlow (hold)");
}
```

For the "final" beat, the fields as they are on the branch (same file):

```java
public class Arm implements Mechanism {
  private final TalonFX motor = new TalonFX(31, canivore);
```

And the method the lambda calls (same file, private on the branch):

```java
private void setVoltage(double voltage) {
  motor.setControl(voltageOut.withOutput(voltage));
}
```

Contrast for the "without the arrow" beat is not real code (it doesn't compile); show it struck through or labelled "won't compile": `runRepeatedly(setVoltage(3.0))`.

## 5. Misconceptions / failure modes

- "Call `arm.runSlow()` and `setVoltage(3.0)` does not happen. The method builds a `Command` and hands it back with the lambda parked inside, and something else runs that command later."
- "This failure has no error message. The arm does not move, nothing logs, and nobody ever scheduled the command."
- Quiz 1 distractor: the body runs "Immediately, when runSlow() is called." Answer: "Every loop, for as long as the scheduler is running that command."
- `final` misread as "can't change the motor's output".
- Searching `Arm.java` for `runRepeatedly` and not finding it (implements).

## 6. Interactive moment idea

Two keys while narration waits: **[C] call `runSlow()`** and **[S] schedule it**. Press C: the method line highlights, a parcel appears and slides into a "Command" card; the TalonFX card stays at 0 V and the arm does not move (the silent failure). Press S: the parcel opens, the lambda line pulses every tick, TalonFX card reads Voltage Out 3 V, the arm creeps. If they press S first, nothing happens: there's no command to schedule yet. Gate on the arm having moved.

## 7. Visual pieces needed

- **Parcel/envelope** token that carries a line of code, sealed vs opened.
- **Command card**: a named box (`runSlow (hold)`) that holds a parcel, inert vs running.
- **Tick pulse** (20 ms heartbeat) to show "every loop" re-running the lambda. Can be a small metronome dot; reused by the command-framework video.
- Optional: **field-as-box** with a locked arrow to a TalonFX (for `final`).
- Existing kit: code panel, TalonFX request card, arm on stand. Controller not needed.

## 8. Draft beat outline

1. Name it: six pieces of Java cover this workshop, and one of them, the lambda, is the one the course doesn't teach.
2. Callback: in Tuner X you picked Voltage Out and the motor pushed the instant you enabled it. Code doesn't have to work that instantly.
3. Show `runSlow()`. Highlight `() -> setVoltage(3.0)`: this is code written down, not run.
4. Demo: call the method. A parcel goes into a command. Motor card: 0 V. Arm: still.
5. Say the failure plainly: no error, no log, the arm just sits there.
6. Something else runs the command (name it "the scheduler", next lesson). Parcel opens every loop; 3 V on the card; arm climbs.
7. Contrast: without the arrow, the call fires on the spot and hands back nothing, so there's nothing to give the command. It won't compile.
8. Your turn: call it, then schedule it. Watch which press moves the arm.
9. (Optional) `final`: the box always points at the same motor, but you can still change what that motor does.
10. Takeaway: a lambda is a set of instructions handed to someone else to run later.

Notes for the parent: the page's lambda table uses `() -> motor.stopMotor()` and quiz 2 asks about `() -> motor.stopMotor()` inside `runRepeatedly`, but the branch's `stop()` is `runRepeatedly(() -> stopMotor())` (private helper). Use the branch form or stay on `runSlow` to avoid the mismatch.
