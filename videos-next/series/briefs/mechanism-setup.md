# Brief: /mechanism-setup, "Motor Setup & CAN IDs" (Workshop 1)

Page: `src/app/(workshop)/mechanism-setup/page.tsx`, 12 minutes, no branch. Written once, read twice (Arm / Flywheel). Pairs with `/mechanisms`. Follows `/hardware`, precedes `/pid-control`.

## 1. Teaches (page order)

- **Assign every CAN ID**: open a device, three dots, **Factory Default** (clears last season, resets ID and inversions); **Blink** to prove which device you're editing; give it the ID and a name. Arm TalonFX `31`, arm CANcoder `32`, flywheel TalonFX `21`. Two devices flashing together = shared ID.
- **Arm only: encoder direction and zero**. Plot CANcoder position, turn the arm counterclockwise by hand, position must rise (else flip sensor direction). Put the arm at 0 on the unit circle (horizontal) and zero the CANcoder; a quarter turn CCW reads `0.25`. Units are **rotations**, CCW positive.
- **Arm only: link the encoder**. Arm TalonFX, **Feedback** section: `Feedback Remote Sensor ID` = 32, `Feedback Sensor Source` = `RemoteCANcoder`, `Sensor To Mechanism Ratio` stays 1.
- **Run the motor, check direction**: **Control** drop-down → **Voltage Out**, `1 V`, click **DISABLED** to enable, disable after about a second. Arm goes CCW and CANcoder 32 counts up; flywheel spins clockwise from the motor side (positive shoots). Wrong way: invert the motor output, apply, repeat. Then `3 V`: only the speed changes.
- Voltage Out "sends a fixed voltage and nothing else... A Voltage Out request runs until you stop it."

## 2. Format: screen recording, with a short animated insert

A procedure, so mostly recorded. One idea needs a picture: **Voltage Out has no target**. It pushes from the instant you enable until you disable, through the end of travel. That gets a 6–8 s animated insert: arm at 1 V sweeping round with no stopping point marked, ended only by a DISABLED click. It's also what two later videos call back to ("pushed the instant you enabled it", "kept running until you stopped it").

**Shot list** (Tuner X 2026.4.1.0; the bench is one TalonFX on `canivore`):

1. Device list under `canivore`. Click the TalonFX card. Zoom: card.
2. Three dots on the top bar → **Factory Default**, confirm. Zoom: the three-dot icon, then the menu item (match `public/images/setup/factory-default.png`).
3. **Blink** button on the left panel. Cut to bench camera: the TalonFX LEDs flash. Zoom: button, then a picture-in-picture of the LEDs.
4. Set the ID field to `31` (arm) or `21` (flywheel) and the name ("Arm motor" / "Flywheel motor"), apply. Zoom: ID field, then name.
5. _(Arm only, needs CANcoder 32 on the bench)_ CANcoder: plot Position, turn the arm CCW by hand (bench camera PiP), trace rises. Zero at horizontal. Turn 90° CCW, reads about `0.25`. Zoom: the plot readout.
6. _(Arm only)_ Arm TalonFX → Configs → scroll to **Feedback**. Set `Feedback Remote Sensor ID` to `32`, `Feedback Sensor Source` to `RemoteCANcoder`, leave `Sensor To Mechanism Ratio` at `1`, apply with the download icon. Zoom: each field in turn (match `link-the-encoder.png`).
7. Back to the TalonFX controls pane. Open the **Control** drop-down (below the DISABLED button), pick **Voltage Out**. Zoom: drop-down, then the chosen item.
8. Type `1` into the output entry. Zoom: the value.
9. Click **DISABLED** → it reads ENABLED. Bench camera PiP: the mechanism moves at once. About one second, click to disable. Zoom: the button both times; PiP large.
10. Wrong direction (stage it with inverted output if needed): Configs → Motor Output → invert, apply, repeat shot 9. Zoom: the Inverted field.
11. Repeat at `3 V`. Only the speed changes.
12. Power cycle and Blink again for the check.

If the bench has no CANcoder, shots 5 and 6 become stills from the page screenshots plus the unit-circle image, flagged as arm-only.

## 3. The concept that needs motion

**A request with no target.** On screen it's a number and a button. What students miss is that nothing in Voltage Out knows where the mechanism is: it pushes until told otherwise. Animate: enable at t=0, arm sweeps, a ghost "end of travel" stop it drives into, the only thing that ends it is DISABLED. Second, arm only: **CCW must count up on both devices** (hand turn: CANcoder rises; 1 V: same direction). Two arrows that have to agree.

## 4. Student knows already / Sets up

- **Knows** (`/hardware`): device list, `canivore`, card colours (red = duplicate ID), firmware current.
- **Sets up**: `/pid-control` tunes against these signs ("Get any of that wrong and the next lesson tunes against the wrong sign"). `/mechanisms` uses IDs 31/32/21, the `RemoteCANcoder` feedback block, and the Inverted value proven here. `/java-basics` and `/running-program` call back to Voltage Out. The Inverted direction is settled here and the code never treats it as a choice.

## 5. Settings on screen

| Device           | CAN ID | Name           |
| ---------------- | ------ | -------------- |
| Arm TalonFX      | `31`   | Arm motor      |
| Arm CANcoder     | `32`   | Arm encoder    |
| Flywheel TalonFX | `21`   | Flywheel motor |

Feedback: `Feedback Remote Sensor ID 32`, `Feedback Sensor Source RemoteCANcoder`, `Sensor To Mechanism Ratio 1`. Control: **Voltage Out**, `1 V`, then `3 V`.

## 6. Misconceptions / failure modes

- "Blink the device first: voltage goes to a CAN ID, not to the one you meant."
- "A Voltage Out request runs until you stop it. The bench arm keeps turning, and an arm with hard stops drives into one."
- Fixing direction with a negative voltage: "would hide the problem inside every request you write later." Invert the motor output instead.
- Arm doesn't budge at 1 V: friction or gravity, not wiring. "Climb in single volts until it creeps, then stop."
- Flywheel coasts after disable: "Calling the direction from the first half second... ends with the motor inverted twice."
- Replaced CANcoder in March: direction and offset live on the encoder, redo both.

## 7. Interactive moment idea

"Which way did it go?" Arm silhouette with a CANcoder readout; viewer presses Enable/Disable at 1 V and sees whether the reading climbs. Second run has the motor inverted, and the viewer picks the fix (invert output / negative voltage / flip sensor). Only "invert output" is accepted.

## 8. Visual pieces needed beyond the kit

- **Device card with a blinking LED** (kit motor card + LED state).
- **CCW arrow + rotations unit circle** (0, 0.25, 0.5, 0.75) on the arm stand. Reuse the page image's labels.
- **Ghost hard stop** at the end of travel for the no-target insert.
- **Tuner X-style DISABLED/ENABLED button** for animated beats, red/green per Tuner X; in the series palette use `C.err` for DISABLED and `C.accent` for ENABLED.

## 9. Draft beat outline

1. **Name it.** "Every device gets its own number, and then the mechanism moves under power for the first time."
2. **Factory default.** Shot 2: "Clear whatever last season left behind."
3. **Blink.** Shot 3 with PiP: "The one that flashes is the one you're editing. Two flash together? They share an ID."
4. **Number it.** Shot 4 + ID table.
5. **Arm: the encoder.** Shot 5: turn it CCW by hand, the number climbs. Zero at horizontal; a quarter turn reads 0.25.
6. **Arm: link it.** Shot 6: Feedback, 32, RemoteCANcoder.
7. **Voltage Out.** Shot 7: "It sends a fixed voltage and nothing else. No target, no stopping point."
8. **Enable.** Shot 9: 1 V, the mechanism moves the instant you click, and keeps going until you click again. Insert: no-target animation.
9. **Direction.** Arm: CCW, and CANcoder counts up. Flywheel: clockwise from the motor side.
10. **Wrong way.** Shot 10: invert the motor output. Don't type a negative voltage.
11. **Check.** 3 V, only speed changes; power cycle, Blink again.
12. **Takeaway.** "Positive means the same thing on every device before any code runs."

## 10. Site/branch mismatches

- **Viewing side contradicts itself.** Step 2 says "Facing the **motor side** of the arm, turn it counterclockwise"; the paragraph says "Counterclockwise with the **device facing you** is positive"; quiz 2 says "Facing the **device side** of the arm". Pick one before narration.
- The **Feedback** link step says "scroll down in the config section"; CTRE calls it the **Configs** tab. Use "Configs" in narration if 2026.4.1.0 agrees.
- The page never names where invert lives (Motor Output → Inverted). Recording should show it; page could name it.
- The CAN ID step says "Repeat until... Tuner X reports no duplicates" but doesn't say how (red card). One line linking back to `/hardware`'s colour table would help.
- Bench has one TalonFX. Arm-only shots need the CANcoder and the arm; confirm the bench build before capture.
- Inline unit-circle SVG uses hard-coded `stroke="#1e293b"`, which breaks the token rule and is near-invisible in dark mode.
