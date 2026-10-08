# Brief: /motion-magic, "Motion Magic in Tuner X" (Workshop 1, last lesson)

Page: `src/app/(workshop)/motion-magic/page.tsx`, 7 minutes, no branch. Written once, read twice. Pairs with `/motion-magic-code`. Follows `/pid-control`; next is Workshop 2.

## 1. Teaches (page order)

- **Motion Magic sits in front of the loop and moves the target for it**, one small step at a time, from where the mechanism is to where you asked. Slot 0 gains carry over unchanged.
- **Two numbers describe the route**: cruise velocity caps speed, acceleration caps how fast speed changes. Jerk rounds the corners and stays `0` (a plain trapezoid).
- **Arm vs flywheel**: arm = position profile, both limits apply, it plans its own stop. Flywheel = velocity profile, _only acceleration_ applies; cruise velocity is ignored by `MotionMagicVelocityVoltage`.
- **Set the first limits**: **Control** → `MotionMagicVoltage` (arm) / `MotionMagicVelocityVoltage` (flywheel). **Motion Magic** config: arm cruise `0.5` rps, acceleration `1` rps²; flywheel acceleration `20` rps², and the speed `100` rps goes on the request. Jerk `0`. Apply with the download button. Run it.
- **Raise the limits**: acceleration one step at a time (watch the ramp), arm cruise (watch the flat), longest and shortest moves; then back off to about 80%.
- **Check**: five runs from standstill whose traces sit on top of each other; current peaks during acceleration and settles.

## 2. Format: hybrid

The trapezoid is the whole lesson, and it's a shape in time: speed rises, holds, falls, while position slides smoothly to the target. That needs animation (the existing playgrounds step the setpoint and draw no profile at all). The configuration is a short Tuner X procedure: recorded. About 50/50.

**Shot list** (Tuner X 2026.4.1.0; arm shots need the arm build):

1. Plot from `/pid-control` still open: reference and position in one group. Zoom: the plot.
2. Configs → **Motion Magic** section: `Motion Magic Cruise Velocity` `0.5`, `Motion Magic Acceleration` `1`, `Motion Magic Jerk` `0` (match `public/images/setup/motion-magic-constants.png`). Flywheel: acceleration `20` only. Zoom: each field. The Expo_kV/Expo_kA fields sit nearby with values; don't zoom on them, don't edit them.
3. Download (apply) icon. Zoom: icon.
4. Controls pane: **Control** drop-down → `MotionMagicVoltage` / `MotionMagicVelocityVoltage`, Slot 0, target `0.25` (arm, straight up) / velocity `100` (flywheel). Zoom: drop-down, then the target.
5. DISABLED → ENABLED. Plot: reference ramps up, flattens, ramps down; position follows. Bench PiP: the arm rises smoothly and stops. Zoom: the plot's ramp-cruise-ramp, then PiP.
6. Target back to `0`, run again. Five runs, traces overlay. Zoom: the overlay.
7. Raise acceleration a step; ramp steepens. Raise until the measurement lags; back off. Zoom: the gap.
8. A short move (`0.05`): triangle, no cruise (quiz 4). Zoom: the peak.
9. Optional: add a current signal; it peaks on the ramps and settles.

The arm's Slot 0 gains are in view in the Configs tab; mask them.

## 3. The concept that needs motion

**The moving target.** Three stacked, synced panels with one playhead: (a) the arm with a ghost setpoint arm leading the real one, (b) velocity vs time, the trapezoid, labelled **speed up, cruise, slow down**, (c) position vs time, an S-curve ending flat on the target. Then contrast with `/pid-control`'s step: the whole move at once vs a target walked there. Then the flywheel: velocity panel only, a ramp up to a flat line, and the cruise-velocity field greyed with "not read".

Also **the triangle**: shrink the move and the trapezoid loses its top, because the profile must start braking before it reaches cruise.

## 4. Student knows already / Sets up

- **Knows** (`/pid-control`): Slot 0 gains tuned and applied, the plot with target and measured, failure shapes, the Control drop-down. (`/mechanism-setup`): positions in rotations, `0.25` = straight up.
- **Sets up**: `/motion-magic-code` swaps `VoltageOut` for `MotionMagicVoltage` with the callback "**In Tuner X, you picked Motion Magic, gave it a position, and watched the arm speed up, cruise, and slow down into place.**" That line refers to shots 4–5 of this video: Control drop-down → `MotionMagicVoltage`, a position target, and the plot's ramp-cruise-ramp. The narration here should use those exact words ("speed up, cruise, slow down") so the callback lands. It also sets up `/mechanisms`' **Generate Code** paste, which carries the Motion Magic block into Java (see mismatches).

## 5. Settings on screen

|                   | Arm                     | Flywheel                     |
| ----------------- | ----------------------- | ---------------------------- |
| Request (Control) | `MotionMagicVoltage`    | `MotionMagicVelocityVoltage` |
| Cruise velocity   | `0.5` rps (mechanism)   | ignored                      |
| Acceleration      | `1` rps²                | `20` rps² (motor rotations)  |
| Jerk              | `0`                     | `0`                          |
| Target            | a position, e.g. `0.25` | `100` rps on the request     |

These are the page's starting limits, not tuned gains, so they may appear. Slot 0 stays masked.

## 6. Misconceptions / failure modes

- "Motion Magic replaces the gains." No: quiz 1, "Slot 0 carries over untouched."
- Jerk `0` means no jerk limit, not no acceleration.
- Flywheel cruise velocity: "Tuner X shows a cruise velocity box for every mechanism and lets you set it. Motion Magic Velocity never reads it."
- Short move with no flat top is correct, not a fault (quiz 4).
- Sags through cruise with voltage headroom: raise `kV`, don't lower cruise (quiz 5).
- Lags from the first moment: lower acceleration before adding gain (quiz 6).
- Tuning to the last volt on a fresh battery; back off to about 80%.

## 7. Interactive moment idea

"Shape the route." Two sliders, cruise and acceleration, plus a distance slider. The trapezoid redraws and the ghost arm replays. Shrink the distance until the top disappears; the gate passes when the viewer has made a triangle. For the flywheel: the cruise slider is present but does nothing, which the viewer discovers.

## 8. Visual pieces needed beyond the kit

- **Velocity-time trapezoid with playhead** and three phase labels (shared with `motion-magic-code`; build once).
- **Position-time S-curve** synced to it.
- **Ghost setpoint arm** (also shared with `motion-magic-code`).
- **Step vs profile split** reusing the `/pid-control` step trace.
- **Greyed config field** "Cruise velocity: not read" for the flywheel beat.

## 9. Draft beat outline

1. **Name it.** "Last time, the target jumped all at once. Motion Magic walks it there instead."
2. **The route.** "Two numbers describe it: how fast it may go, and how fast it may speed up."
3. **Trapezoid.** Animated: speed up, cruise, slow down, arrive with no speed left.
4. **Same loop.** "Your Slot 0 gains don't change. Motion Magic just moves the target they chase."
5. **Set it.** Shot 2: cruise 0.5, acceleration 1, jerk 0. Apply.
6. **Run it.** Shots 4–5: Control drop-down, Motion Magic, a position, enable. The plot draws the trapezoid.
7. **Flywheel.** "A wheel isn't going anywhere, so there's no cruise. Only acceleration shapes the ramp."
8. **Short move.** The triangle: "That's correct. It never had room to cruise."
9. **Raise the limits.** Shot 7: steeper until it lags, then back off to about 80%.
10. **Check.** Five runs overlay.
11. **Takeaway.** "Name where it should end up. The motor plans the way there: speed up, cruise, slow down."

## 10. Site/branch mismatches

- **Generate Code is never taught in Workshop 1.** `series.json`'s `mechanisms` video says "In Tuner X, you set this motor up by hand, then used Generate Code to copy those settings out", and `/mechanisms` assumes it. No Workshop 1 page mentions Generate Code except as "Generate Code includes it" on `/mechanism-setup`. Either add a 10 s close to this video (three dots on the Configs top bar → **Generate Code** exists, "you'll paste this in Workshop 3", no Java shown) or reword the `mechanisms` callback.
- The page's Control step uses Java class names (`MotionMagicVoltage`); `/mechanism-setup` uses a display name ("Voltage Out"). Check how Tuner X 2026.4.1.0 lists them, and make the page consistent.
- `motion-magic-code` brief: the branch ships flywheel cruise `100.0` / acceleration `1000.0`, while this page sets flywheel acceleration `20`. Not wrong (the code paste overwrites), but the two numbers will look inconsistent to a student comparing.
- `pidPhysics.ts` already defines `profileMaxVel` / `profileMaxAccel` but never uses them. A profiled mode in the arm playground would give this page its own interactive, and the video's gate could mirror it.
- Flywheel `100` rps is close to the Kraken X44's ~125 rps free speed (`/hardware`). Worth a note that the target is near the ceiling.
