# Brief: /chaining-commands, "Command Composition" (Workshop 4)

**No branch.** The page sets no `branch` prop and hand-writes every block; `mech-4-ReadingState` jumps straight from `mech-3-MotionMagic` to a coroutine Y button, so no commit contains this page's `Command.sequence`. **The page's code blocks are ground truth.** 12 minutes. Order: /motion-magic-code → **/chaining-commands** → /finish-conditions → /coroutines.

## 1. Teaches (page order)

- Every command so far is a **hold**: `runRepeatedly(...)` re-sends its request every loop and never ends. A list containing a hold stops there: "Nothing errors and nothing logs, so the routine looks frozen."
- `.withTimeout(Seconds.of(1.0))` turns a hold into a **step** (beginning and end). Takes a `Time`, hence `import static org.wpilib.units.Units.Seconds`.
- `Command.sequence(a, b, c)` runs each until it finishes, then the next. Returns a builder; `.named("...")` finishes it. A group ending on a hold is a hold, so its name ends `(hold)`. A sequence is a small coroutine awaiting each member (sets up /coroutines).
- `Command.race(...)` starts all members at once and cancels the rest when one finishes. "A hold can never win a race." No `Command.deadline`.
- Bind the group with `whileTrue`; release cancels, cancel sends nothing (link /running-program#latched), so `.whileFalse(robot.flywheel.stop())`. "The last member decides whether a group ends at all."

## 2. The concept that needs motion

**Time.** A sequence is "this, then that"; a race is "this while that"; a hold is a bar with no right edge. On the page these are three code blocks that look nearly identical. On a **scheduler timeline** (one lane per mechanism, commands as bars, a playhead moving at robot time) the difference is instant: a step is a bar that ends and hands the playhead to the next bar; a bare hold is a bar that runs off the right edge and the next bar never appears. That is the "looks frozen" failure made visible. The timeline is the right new visual for this whole workshop; build it here and reuse it.

Verified detail worth drawing: `withTimeout` is itself a race (`race(this, waitFor(timeout))` in `Command.java`), so the step's bar can be shown as a hold racing a stopwatch bar. Optional, but it makes race and timeout one idea.

## 3. Student knows already / sets up

- **Knows:** holds, `runRepeatedly`, `.named` finishing a builder (/adding-commands); `whileTrue`/`whileFalse` (/opmodes); latched requests (/running-program); `vertical()` = position 0.25 rot, `horizontal()` = 0.5, `runFast()` = 75 RPS, `runSlow()` = 25, `stop()` (all `(hold)`, /motion-magic-code).
- **Sets up:** /finish-conditions replaces the stopwatch with `isAtTarget()`; /coroutines reveals the sequence as an await loop (`SequentialGroup.run()` is literally `coroutine.await(command)` per member); Workshop 5 /autonomous uses the shape.

## 4. Code on screen (page code blocks)

```java
// A hold. Drives to vertical and keeps holding it, never finishes.
robot.arm.vertical()

// A step. Holds vertical for one second, then ends.
robot.arm.vertical().withTimeout(Seconds.of(1.0))
```

```java
Command spinUpWhenReady =
    Command.sequence(
            robot.arm.vertical().withTimeout(Seconds.of(1.0)),
            robot.flywheel.runFast())
        .named("Spin Up When Ready (hold)");
```

```java
Command spinWhileHolding =
    Command.race(
            robot.flywheel.runFast().withTimeout(Seconds.of(2.0)),
            robot.arm.horizontal())
        .named("Spin While Holding Arm");
```

```java
driver.y().whileTrue(spinUpWhenReady).whileFalse(robot.flywheel.stop());
```

APIs verified in `commandsv3-java-2027.0.0-alpha-7-sources.jar`: `Command.sequence`, `Command.race`, `withTimeout(Time)` (a `Command` default method), builders needing `.named`.

## 5. Misconceptions / failure modes

- "A bare hold in the middle": "the sequence sticks there for the rest of the match." The page's three-row grid: arm moves, flywheel never starts (member with no ending); won't compile (no `.named`, or `.named` on a finished command); both move together (`race` where `sequence` was meant).
- Quiz 2: thinking the group ends when the steps do, when the hold at the end makes the group a hold.
- Check step 5: `runFast().withTimeout(1s)` alone ends, "the flywheel stays at 75 rotations per second, because nothing claimed it". Link, don't re-teach.
- Physics caveat for the animator: when the arm's step ends, its position request stays latched, so the **simulated arm stays vertical** after its bar ends. Show the bar ending and the arm still up. Don't animate the arm dropping.

## 6. Interactive moment

"Delete the timeout." The viewer clicks the `.withTimeout(...)` chip off the first member (mirrors check step 4). Hold Y replays: the arm bar stretches past the right edge, the playhead keeps moving, the flywheel lane stays empty, the TalonFX card for the flywheel shows no request. Prompt: "Why didn't the flywheel start?" Then the chip snaps back on.

Alternative: drag-sort `sequence` ↔ `race` on the same two members and watch the bars go from end-to-end to stacked.

## 7. Visual pieces needed beyond the kit

- **Scheduler timeline** (new, central): lanes for Arm and Flywheel, labeled bars by command name (`vertical (hold)`, `runFast (hold)`), a playhead in seconds, a group bracket spanning its members, and a "no right edge" treatment (fade/arrow) for holds.
- **Stopwatch chip** for `.withTimeout` attached to a bar's end.
- **Flywheel** sim with a speed readout in RPS, beside the arm.
- Second TalonFX card (flywheel, velocity request), or one card that switches.
- Y button lit on the controller (kit).

## 8. Draft beat outline

1. **Name it.** "A routine is a list of commands, run in order." Timeline appears empty.
2. **Connect.** Every command you've written is a hold: hold the left trigger, the arm bar grows and never ends.
3. **The problem.** Put a hold first in a list; the playhead passes, the second bar never arrives. "Nothing errors. It just looks frozen."
4. **Step.** Attach the one-second stopwatch; the bar gets a right edge. Show `withTimeout` code line lit.
5. **Sequence.** Show `spinUpWhenReady`; press Y; arm bar 0–1 s, flywheel bar starts at 1 s, arm stays up (latched, no comment).
6. **Last member.** Flywheel bar has no edge, so the group bracket has none: the group is a hold, named `(hold)`. Release Y: bracket cut, `whileFalse` stop bar appears on the flywheel lane.
7. **Your turn.** Remove the timeout chip; predict; replay; flywheel never starts.
8. **Race.** Same two lanes, bars stacked: the flywheel's two-second step finishes, the arm hold is cut at the same instant. "A hold can never win a race."
9. **Takeaway.** "Give every step an ending, then list them; the last one decides whether the list ends."
