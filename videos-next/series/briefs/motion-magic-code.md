# Brief: /motion-magic-code, "Motion Magic in Code" (Workshop 3, last lesson)

Branch `mech-3-MotionMagic`, 10 minutes. Comes right after /running-program (The Latched Request). Pairs with /motion-magic (`PairedLesson kind="tuner"`).

## 1. Teaches (page order)

- **The request from Tuner X**: the Control drop-down picked a **control request**; the Java class has the same name. Swap the `VoltageOut` field for `MotionMagicVoltage` (arm) / `MotionMagicVelocityVoltage` (flywheel); delete the `VoltageOut` import.
- **Paste your tuned config**: the request names a target, the **gains** decide how hard the motor works to reach it. The branch ships `0.0` gains so a fresh clone holds still; Generate Code in Tuner X and paste over the whole `talonFXCfg` statement.
- **Name targets, not volts**: arm drops `runSlow`/`runFast`/`stop`/`setVoltage`/`stopMotor` for `vertical()`, `horizontal()`, `setPosition`. Flywheel keeps its three commands; numbers become rotations per second.
- **Update the bindings**: arm loses `whileFalse(robot.arm.stop())`. The latched request, a hazard on voltage, is now the feature: the arm holds the target against gravity. Flywheel keeps its `whileFalse`.
- **Check**: arm drives to vertical and stays on release; doesn't move = still `0.0` gains; overshoot and hunting = retune in Tuner X and paste again.

## 2. The concept that needs motion

**A request that names a voltage vs one that names a target.** The same release gesture from the latched video gets the opposite outcome: 6 V latched = runaway; "be at 0.25 rotations" latched = the arm goes there and stays. That reversal only lands if it is seen side by side with the previous video.

Second: **the trapezoid playing out.** The motor doesn't jump to the target; Motion Magic walks a moving setpoint from here to there (accelerate, cruise, decelerate). A ghost arm leading the real arm, synced to a velocity-vs-time trapezoid with a playhead, shows that the target in code is the endpoint and the profile is the TalonFX's job. Quiz 3's twist (release halfway, it still finishes to vertical) needs this motion to make sense.

## 3. Student knows already / sets up

- **Knows:** ran Motion Magic from Tuner X's Control drop-down, set cruise velocity and acceleration, saw the profile (/motion-magic); tuned kG/kS/kP/kD in Slot 0 and the three failure shapes (/pid-control); what a control request is (/mechanisms#configs-and-requests); commands as holds (/adding-commands); bindings (/opmodes); requests stay latched (/running-program).
- **Sets up:** `horizontal()` is unbound until Workshop 4 (/chaining-commands); `mech-4-ReadingState` reads position back.

## 4. Code on screen

`mech-3-MotionMagic`, `src/main/java/first/robot/mechanisms/Arm.java`:

```java
  // Moves the arm to a target angle along a smooth Motion Magic ramp.
  private final MotionMagicVoltage positionOut = new MotionMagicVoltage(0);
```

Config, trimmed to what changed (shape only, every gain `0.0`):

```java
    // Pasted from Tuner X. Every gain is 0.0 until you paste yours over it.
            .withSlot0(
                new Slot0Configs()
                    .withKG(0.0)
                    .withKS(0.0)
                    .withKP(0.0)
                    .withKD(0.0)
                    .withGravityType(GravityTypeValue.Arm_Cosine))
            .withMotionMagic(
                new MotionMagicConfigs()
                    .withMotionMagicCruiseVelocity(RotationsPerSecond.of(0.0))
                    .withMotionMagicAcceleration(RotationsPerSecondPerSecond.of(0.0))
```

(The real paste also carries the Expo kV/kA defaults and the RemoteCANcoder feedback block; leave them off screen or greyed, never deleted.)

```java
  public Command vertical() {
    return runRepeatedly(() -> setPosition(0.25)).named("vertical (hold)");
  }

  public Command horizontal() {
    return runRepeatedly(() -> setPosition(0.5)).named("horizontal (hold)");
  }

  private void setPosition(double rotations) {
    motor.setControl(positionOut.withPosition(rotations));
  }
```

`src/main/java/first/robot/opmode/MyTeleop.java`, before → after:

```java
    driver.leftTrigger().whileTrue(robot.arm.runFast()).whileFalse(robot.arm.stop());
```

```java
    driver.leftTrigger().whileTrue(robot.arm.vertical());
```

Flywheel (if it gets a beat): `MotionMagicVelocityVoltage velocityOut`, `setVelocity(25.0)` / `setVelocity(75.0)`, `motor.setControl(velocityOut.withVelocity(RotationsPerSecond.of(rps)))`. Recommend the video stays on the arm; the flywheel's request is velocity and its profile only uses acceleration, which is a second concept.

Do not show any non-zero Slot 0 gain anywhere, including in a TalonFX card readout.

## 5. Misconceptions / failure modes

- Doesn't move at all, clean build: "A mechanism that does not move at all still has `0.0` gains, so repeat the paste." Zero gains compute zero volts for any target; nothing errors.
- Build fails on `robot.arm.stop()` after deleting it: delete the `whileFalse`, don't put `stop()` back. Binding `horizontal()` there compiles but swings the arm every release.
- Expecting release to drop the arm or freeze it mid-move: "The TalonFX keeps following the last request it received, which names 0.25 rotations, so it finishes the profile and holds there."
- Fixing overshoot in code (changing the target, sending twice): "Overshoot is the gains... Fix them there with the PID tuning procedure, then paste the new config."
- Thinking the flywheel can drop its `whileFalse` too: "A wheel left on its last velocity request keeps spinning."

## 6. Interactive moment idea

"Let go halfway." Viewer holds the trigger; arm starts its trapezoid toward the 90° marker. They release whenever they like. The command chip goes grey, the binding line un-highlights, but the TalonFX card still reads Motion Magic, target 0.25, the playhead keeps walking the trapezoid, and the arm arrives and holds. Directly mirrors the latched video's "try it" so the contrast is felt.

## 7. Visual pieces needed beyond the kit

- **Target marker** on the arm stand: a tick at 90° (vertical) and a faint one at 180° (horizontal, unused).
- **Ghost setpoint arm**: translucent arm moving along the profile slightly ahead of the real one.
- **Velocity-vs-time trapezoid plot** with a playhead synced to the ghost; ramp/flat/ramp labelled accelerate, cruise, slow down. Axis labels only, no numbers.
- **TalonFX request card variants**: `VoltageOut 6 V` vs `MotionMagicVoltage → 0.25 rot`. Plus a Slot 0 strip that reads `0.0` in every slot, and shows "your gains" (blurred/hatched, never numerals) after the paste.
- **Tuner X Generate Code** mock: three-dot menu → Generate Code → a config block flying into the constructor.
- **Split-screen recall**: a small freeze of the latched-video ending (arm running away on 6 V) beside the new one.

## 8. Draft beat outline

1. **Name it.** "A request can name a voltage, or it can name a target."
2. **Connect.** "You did this in Tuner X: picked Motion Magic from the Control menu, gave it a target, watched the arm follow a smooth ramp." The drop-down morphs into the Java class name.
3. **Swap the field.** `VoltageOut` line replaced with `MotionMagicVoltage`; TalonFX card label changes.
4. **Gains come from the bench.** Slot 0 strip all zeros. "Out of the box, every gain is zero, so the arm won't move." Generate Code mock pastes the config over; strip fills with hatched "yours".
5. **Name targets.** `runSlow`/`runFast`/`stop` fade; `vertical()` types in; target marker appears at 90°.
6. **The binding.** `whileFalse(robot.arm.stop())` struck through. Brief recall of the latched runaway.
7. **Press.** Trigger lit, `vertical` line highlighted, card shows the target, ghost and trapezoid playhead lead the arm up: speed up, cruise, slow down, arrive.
8. **Release at the top.** Command ends, request stays, arm holds against gravity. "Last time, the request that stayed was the problem. This time it's what holds the arm up."
9. **Your turn.** Let go halfway; it still finishes the move.
10. **When it's wrong.** Two quick failure frames: doesn't move (zeros, paste again), overshoots and hunts (back to Tuner X, then paste again). Never fix it in code.
11. **Takeaway.** "Name where the arm should be, and the motor keeps it there after the command ends."

## Notes for the caller (discrepancies found)

- `MyTeleop.java` comment on the branch says "the position request stays applied, so the arm holds **where it is**." The page's quiz 3 (correct) says a mid-move release **carries on to vertical**. The video should follow the quiz; the branch comment is misleading.
- The page's flywheel paste shows `CruiseVelocity 0.0` / `Acceleration 0.0`; the branch ships `100.0` and `1000.0` for the flywheel (arm ships `0.0`). The flywheel ignores cruise velocity anyway.
