# Brief: /pid-control, "PID Tuning in Tuner X" (Workshop 1)

Page: `src/app/(workshop)/pid-control/page.tsx`, 14 minutes, no branch. The reference implementation for lesson shape. Pairs with `/motion-magic-code`. Follows `/mechanism-setup`, precedes `/motion-magic`.

## 1. Teaches (page order)

- **The TalonFX runs the loop itself.** Tuner X sends the setpoint, plots the response, and saves the gains onto the motor. The procedure is CTRE's, in volts (CTRE tunes in amps with `TorqueCurrentFOC`, so its numbers don't carry over).
- **Play with the gains first** (the site's `MechanismPlayground`, below).
- **Units**: a gain is output per unit of input. `...Voltage` requests output volts; input is mechanism rotations, never degrees. Arm `kP` looks big because 0.01 rotation is 3.6°. Arm needs **Gravity Type** `Arm_Cosine`, which expects 0 = horizontal.
- **Tune**: power cycle; **Signal & Control** (page term), add the TalonFX, plot target and measured in one group. Pick a voltage position (arm) or velocity (flywheel) request, **Slot 0**, small target (0.1 rot / 10 rps). Every Slot 0 gain to zero. Arm: `kG` min/max that hold it level, `kG` = midpoint, `kS` = half the gap. Flywheel: `kS` until it just turns, `kV` until speed meets target with `kP` zero. Then double `kP` until it overshoots, halve; arm adds `kD` until overshoot stops; `kI` stays zero. Apply with the **download** button.
- **Three failure shapes**: runs away (wrong direction), buzzes (too much gain, cut `kP` first), falls short (constant gap, more `kP`). "Read the plot, not the mechanism."

## 2. Format: hybrid

The _why_ of each gain is motion: gravity pulling an arm harder at horizontal than near vertical, `kG` cancelling exactly that, `kP` too low (sag/falls short) vs too high (overshoot, ringing, buzz). Prose and a table can't show a cosine-shaped pull or a ringing trace. The _how_ is a Tuner X procedure: recorded. Split about 40% animated, 60% recording.

**Shot list** (Tuner X 2026.4.1.0; the arm steps need the arm and its CANcoder on the bench):

1. Power cycle the bench (camera, 2 s).
2. Open the plot view (page: **Signal & Control**; CTRE docs: "Multi-device Plot & Control"), add the TalonFX. Zoom: the add control.
3. Add two signals, the closed-loop reference and the position (velocity for flywheel), drag both into one group with the **Plus** icon. Zoom: the right-side signal menu, then the group.
4. Controls pane: **Control** drop-down → the voltage position request (arm) / voltage velocity request (flywheel). Set **Slot 0**. Enter `0.1` (arm) / `10` (flywheel). Zoom: drop-down, slot field, target field.
5. Configs → **Slot 0**: set every gain to `0`, **Gravity Type** `Arm_Cosine` (arm), apply with the download icon. Zoom: the Slot 0 block, Gravity Type.
6. Enable (DISABLED → ENABLED). The plot shows target line, measured flat: nothing moves. Zoom: the flat trace. (Quiz 1's point: zero gains, zero volts.)
7. Raise `kG` in steps, enable each time, bench PiP shows the arm holding level. **Blur or hatch every gain value** in post. Zoom: the field, but the number is masked.
8. Raise `kP` in doublings; the plot shows sag, then overshoot, then ringing. Zoom: the plot, not the field.
9. Add `kD`; overshoot goes. Zoom: plot.
10. Targets in both directions; apply with the download icon. Zoom: download icon.
11. Power cycle, reopen Configs, gains still there (masked). Zoom: Slot 0 block.

Flywheel variant: 7 becomes `kS` then `kV` on a velocity trace.

## 3. The concept that needs motion

- **Gravity's pull follows the cosine.** Arm sweeping from horizontal to vertical, a weight arrow shrinking to nothing at the top. `kG · cos(angle)` drawn as an opposing arrow that matches it at every angle. This is quiz 2 (holds at 90°, sags at 30°: kG or gravity type).
- **The three `kP` shapes on one target**: too low (falls short, settles below), right (one motion and then silence), too high (overshoot, ringing, buzz at rest). Show the arm and its trace together, then strip the arm away: "read the plot, not the mechanism."
- **Order matters**: feedforward covers the steady cost, feedback fixes what's left. Stacked output bar: `kG` slab first, `kP` sliver on top.

## 4. Existing interactive explainers (don't duplicate)

`MechanismPlayground` (`src/components/MechanismPlayground.tsx`) switches between three simulators, each with sliders, a live SVG mechanism, a uPlot response, a **STABLE / OSCILLATING / DRIFTING** chip, and overshoot / final error / settle / peak V metrics:

- **Arm** (`InteractivePidPlayground.tsx`, `lib/pidPhysics.ts`): sliders `kP kI kD kS kV kG`, target angle in degrees (also shown in rotations). A competition-size arm (2 kg, 0.4 m, Kraken X44 at 28:1, `kG` ≈ 0.81 V). The arm holds at 0° (horizontal) for one second, then the setpoint **steps** to the target. The hint teaches `kG → kS → kP → kD`.
- **Flywheel** (`InteractiveFlywheelPlayground.tsx`): `kP kI kD kS kV`, target in **RPM**, a step after a 1 s hold.
- **Elevator** (`InteractiveElevatorPlayground.tsx`): constant-gravity carriage with `kG`.

So the site already lets a student find too-much-`kP` by dragging. The video should **not** be a slider tour. It should give what the playground can't: why gravity varies with angle (the cosine arrow), what each shape _feels and sounds like_ on the real arm ("one motion and then silence"), and the Tuner X procedure on real hardware. End with "now try it in the playground below" as the handoff.

## 5. Student knows already / Sets up

- **Knows** (`/mechanism-setup`): IDs, encoder direction and zero, Feedback linked, Voltage Out, the DISABLED button, CCW positive, rotations.
- **Sets up**: `/motion-magic` keeps these Slot 0 gains unchanged. `/mechanisms` and `/motion-magic-code` paste them via Generate Code ("If the device holds your gains from Workshop 1, they come along"). `/motion-magic-code`'s failure line "If it overshoots and hunts, retune in Tuner X" points here.

## 6. Settings on screen

Slot 0: `kP kI kD kS kV kA kG`, all `0` at the start. **Gravity Type** `Arm_Cosine`. Target `0.1` rotations (arm) / `10` rps (flywheel). CTRE example numbers from the units table (2.4, 0.11, 0.1, 0.12, 0.01) may appear _only_ as "CTRE's example, in amps vs volts" contrast. **No tuned gain from our bench, ever.** Mask them in the recording.

## 7. Misconceptions / failure modes

- Zero gains, nothing moves: intended (quiz 1).
- "A gain copied from a guide written for another request means nothing."
- Buzz: "Cut `kP` before reaching for `kD`. Damping will not fix a loop that is too stiff."
- "The request and the gains must both be on Slot 0."
- A tired battery or a current limit looks like too little gain.
- "Gains that were never applied are lost."
- Runaway: direction changed since Motor Setup; disable and go back.

## 8. Interactive moment idea

"Find the hold." Arm at horizontal with only `kG` exposed; viewer drags until it stops sagging _and_ stops drifting up, then the gate rotates the target to 30° and 80° to show the same `kG` holds everywhere because of the cosine. Different from the playground, which steps a target and shows a trace.

## 9. Visual pieces needed beyond the kit

- **Gravity arrow + kG counter-arrow** on the arm, both scaled by cos(angle).
- **Response plot** (target dashed, measured solid) in three variants: sag, good, ring.
- **Stacked output bar** (feedforward slab + feedback sliver).
- **Slot 0 strip** with hatched "yours" values, same as `motion-magic-code`'s `drawGains`.
- Sound cue for "buzz" vs "silence" if the pipeline supports audio.

## 10. Draft beat outline

1. **Name it.** "The motor runs its own control loop. Tuner X just sends it a target and draws what happens."
2. **Zero.** Every gain at zero, enable: nothing moves. "That's right. Zero gains mean zero volts."
3. **Gravity.** Cosine arrow animation: heaviest at horizontal, nothing straight up.
4. **kG.** Counter-arrow cancels it at every angle. Recording: raise kG until the arm holds level (masked).
5. **kS.** Half the gap between the smallest and largest kG that hold.
6. **kP.** Doublings: falls short, then overshoot. Back to half.
7. **kD.** Overshoot goes. "Too much, and it buzzes."
8. **Three shapes.** Runs away, buzzes, falls short. "Read the plot, not the mechanism."
9. **Apply.** Download icon. Power cycle; the gains are still there.
10. **Takeaway.** "Feedforward pays for holding; feedback fixes what's left. A tuned arm is one motion and then silence."
11. **Handoff.** "Try the shapes yourself in the playground below."

## 11. Site/branch mismatches

- **"Signal & Control"** isn't a name in CTRE's Tuner X docs (they say "Multi-device Plot & Control"). Confirm the 2026.4.1.0 label and fix the page or narration.
- The page never names the request: "a voltage-based position or velocity request". Tuner X lists `PositionVoltage` / `VelocityVoltage`; naming them would set up `/motion-magic`'s `MotionMagicVoltage` and the request-name grid in `/mechanisms`.
- Plot step says "the target and the measured position" without the Tuner X signal names (closed-loop reference, position). Name them after capture.
- The **flywheel playground uses RPM**; the page and every Tuner X field use rps. Flywheel `kV` in the playground is therefore in a different unit from the page's table.
- The arm playground's legend says **"profile setpoint"**, but `pidPhysics.ts` steps it instantly ("this isn't a profile, it's a step"). The label will confuse students once `/motion-magic` introduces real profiles.
- The playground arm is competition size (2 kg, 28:1); the page says so, but the bench arm is "mostly kS". Video must say which arm it shows.
- The arm step list has `kG`/`kS` then `kP` then `kD`; the flywheel list has no `kD` step, though the failure grid says "likely followed by a kD". Fine, but narration should say flywheels usually skip `kD`.
