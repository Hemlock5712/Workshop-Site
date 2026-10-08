# Brief: /testing (Testing, Workshop 4, 15 min page, branch `mech-6-Testing`)

## 1. Teaches

- **Two halves catch different mistakes**: a person at the robot catches "a motor wired backwards or a loose CANcoder"; an automated test catches "a teammate's edit that quietly changed a setpoint three weeks before an event."
- **On the robot**: a two-minute pre-enable list (battery above 12.5 V, CAN IDs 31/32/21 in Tuner X, code from main, say "enabling" out loud, one binding at a time, watch the mechanism not the screen). Write what you pressed in the PR.
- **A test file**: `src/test/java/first/robot/mechanisms/ArmTest.java`, JUnit 5 already in the generated build. `@BeforeEach` starts the sim HAL and builds a fresh `Arm`; the test schedules a command, calls `scheduler.run()` once ("one robot loop"), and asserts the target; `@AfterEach` calls `cancelAll()`.
- **Fake a sensor**: a second `TalonFX` on CAN 21 reaches the same simulated motor; set `Orientation` to match the inversion, `setRotorVelocity(...)`, `Timer.delay(0.1)`, assert. Test both sides of the tolerance: 74.8 counts, 70 doesn't.
- **Testable code**: put a decision in a method that returns the answer; keep hardware `private`. "A test can only check a value it can read."
- **Check your work**: run **WPILib: Test Robot Code**, widen the tolerance to 10 rps, watch one test fail, put it back.

## 2. The concept that needs motion

**A test is the robot loop run by hand, with no robot.** Everything a student has seen so far runs because the robot loops every 20 ms. In a test nothing loops unless the test says so: `schedule` only queues (the command card sits in a "waiting" slot), `scheduler.run()` is one tick (card moves to "running", the TalonFX card's request changes to MotionMagic 0.25), and the assertion reads that request back. Animating that single, manual tick is the whole lesson, and it's the page's top failure ("The target is still 0... Scheduling only queues it") and quiz 1.

Second motion: **faking the sensor and guarding both sides.** A speed dial on the flywheel card, a shaded tolerance band 74.5 to 75.5. The test sets 74.8 (inside, green), then 70 (outside, red). Then someone widens the band to 10: 70 falls inside, and only the second check notices. That's the check-your-work step and a strong cause-and-effect demo.

The **test runner output** (`PASSED` lines, `BUILD SUCCESSFUL`, the one `FAILED` at line 72) is best as a short screen recording of VS Code or a stylised terminal panel; it doesn't need custom animation. The **on-robot checklist** is a procedure; leave it on the page, give it one beat at most.

## 3. Student knows already / Sets up

- **Knows**: `/running-program` (Hardware Simulation runs the program against simulated devices, the same sim layer `HAL.initialize()` starts). `/adding-commands`: `vertical()` / `horizontal()` / `runFast()` as `runRepeatedly` holds; one command per mechanism, newer wins. `/motion-magic-code`: targets are `MotionMagicVoltage` / `MotionMagicVelocityVoltage` requests. `/finish-conditions`: `getTargetPosition()`, `getVelocity()`, `isAtTarget()` with the 0.5 rps flywheel tolerance. `/logging-implementation`: the after-the-fact check.
- **Sets up**: closes Workshop 4. The "keep decisions in methods that return a value" rule carries into Swerve and Vision.

## 4. Code on screen

All from branch `mech-6-Testing` (verified via `git diff mech-5-Coroutines mech-6-Testing`, which adds exactly these two files). APIs confirmed in alpha-7 jars (`Scheduler.schedule`, `run`, `isRunning`, `cancelAll`).

`src/test/java/first/robot/mechanisms/ArmTest.java` (trimmed):

```java
@BeforeEach
void setUp() {
  assertTrue(HAL.initialize());
  arm = new Arm();
}

@AfterEach
void tearDown() {
  scheduler.cancelAll();
}

@Test
void verticalAsksForAQuarterTurn() {
  scheduler.schedule(arm.vertical());
  scheduler.run();

  assertEquals(0.25, arm.getTargetPosition().in(Rotations), 1e-9);
}
```

Second arm test, same file, for a "newer command wins" beat if wanted:

```java
scheduler.schedule(vertical);
scheduler.run();
scheduler.schedule(horizontal);
scheduler.run();

assertFalse(scheduler.isRunning(vertical));
assertTrue(scheduler.isRunning(horizontal));
assertEquals(0.5, arm.getTargetPosition().in(Rotations), 1e-9);
```

`src/test/java/first/robot/mechanisms/FlywheelTest.java`, setUp then `atTargetOnlyWithinHalfARotationPerSecond`:

```java
motorSim = new TalonFX(21, new CANBus("canivore")).getSimState();
motorSim.Orientation = ChassisReference.Clockwise_Positive;

scheduler.schedule(flywheel.runFast());
scheduler.run();

motorSim.setRotorVelocity(74.8);
Timer.delay(0.1);
assertTrue(flywheel.isAtTarget());

motorSim.setRotorVelocity(70.0);
Timer.delay(0.1);
assertFalse(flywheel.isAtTarget());
```

Code under test, `src/main/java/first/robot/mechanisms/Flywheel.java` (same branch):

```java
private final AngularVelocity tolerance = RotationsPerSecond.of(0.5);

public boolean isAtTarget() {
  return getVelocity().isNear(getTargetVelocity(), tolerance);
}
```

and `Arm.java`: `runRepeatedly(() -> setPosition(0.25)).named("vertical (hold)")`.

## 5. Misconceptions / failure modes

- "**The target is still 0.** The test scheduled a command and never called `scheduler.run()`. Scheduling only queues it."
- "**A sensor reads the wrong value.** The `Timer.delay` is missing, or the sim orientation does not match the motor's inversion." Without `Clockwise_Positive`, "the sim reports the speed negated: -74.8 against a target of 75."
- "**A test passes alone and fails with the others.** A command from an earlier test is still scheduled. Keep `cancelAll()` in `tearDown`."
- One-sided tests: "A test with only the first half still passes when somebody widens the tolerance to 10."
- Over-trusting green: "These tests check what the code asks for. Whether the arm gets there is still the bench's job." Every gain is 0.0; nothing models a gearbox (quiz 4).
- Untestable shape: "A command that sets a motor and reports nothing can only be checked by watching it."

## 6. Interactive moment idea

**"Break it on purpose."** The tolerance line in `Flywheel.java` is editable: a slider from 0.5 to 10 rps. The tolerance band on the speed dial widens as it moves. The student presses Run Tests; the two assertion markers (74.8, 70) are checked live. At 0.5 both pass; past about 5 the 70 marker slides inside the band and the second assertion flips red with "FAILED, line 72". Teaches both "test both sides" and "the test catches the teammate's edit." Alternative: the student taps a "run one loop" button in the arm test and sees the assertion only goes green after the tick.

## 7. Visual pieces needed beyond the kit

- **Test card / runner panel**: test name, a Run button, per-assertion pass/fail lights, `PASSED` / `FAILED` / `BUILD SUCCESSFUL` footer.
- **Scheduler queue widget**: "scheduled" slot vs "running" slot, and a manual **loop tick** button/pulse that replaces the usual automatic 20 ms heartbeat (the kit's loop indicator, stopped and stepped by hand).
- **"No robot" framing**: the arm/flywheel drawn as a ghost or blueprint, with only the TalonFX card live, to make "checks what the code asks for, not what the mechanism does" visible.
- **Flywheel speed dial with tolerance band** (74.5 to 75.5 around 75), and a "sim handle" plug showing a second `TalonFX(21)` reaching the same device.
- No Xbox controller needed; its absence is the point. Optional brief checklist card for the on-robot half.

## 8. Draft beat outline

1. **Hook**: three weeks before an event, a teammate changes one number. The robot isn't on the bench. Who notices?
2. **Name it**: a test is a check you can repeat, and some of them the computer runs by itself every time the code changes.
3. **Connect**: Hardware Simulation already ran your program with no motors. A test uses the same sim, but there's no driver and no loop running.
4. **The arm test**: code panel, `setUp` lights (ghost arm appears, TalonFX card at rest). `schedule` lights: command lands in the waiting slot, request still 0.
5. **One tick**: `scheduler.run()` lights, the loop pulses once, command moves to running, TalonFX card shows MotionMagic 0.25. `assertEquals` goes green.
6. **Leave out the tick**: replay without `run()`; request stays 0, assertion red. "Scheduling only queues it."
7. **Fake a sensor**: flywheel test. A second handle on CAN 21 plugs into the same sim motor; set 74.8, wait a tenth of a second, inside the band, green. Set 70, outside, green because `assertFalse` expects it.
8. **Your turn**: drag the tolerance to 10 and run the tests.
9. **Reveal**: 70 slides into the band, second assertion fails, `FAILED` line 72. That's the teammate's edit, caught. Slide it back, all four pass.
10. **What it doesn't check**: the ghost arm stays a ghost. Zero gains, no gearbox: a test checks the request, the bench checks the motion. Quick flash of the on-robot checklist.
11. **Takeaway**: "Put decisions where a test can read them, and let the computer check them every time the code changes."
