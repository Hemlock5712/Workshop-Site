import type { Rect, TrailerScript } from "../lib/types";

// Full-length feedforward lesson (~4.5 min). Everything the 90s trailer cut:
// the whole SVA+G family. kG on the arm (condensed recap), then kS, kV, and
// kA on a shooter flywheel, how to measure kV instead of guessing it, and the
// Phoenix 6 code for both mechanisms.

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const ARM_LAB: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const FLY_LAB: Rect = { x: 5480, y: 140, width: 2200, height: 1150 };
const ARM_CODE: Rect = { x: 8440, y: 220, width: 1560, height: 960 };
const FLY_CODE: Rect = { x: 10640, y: 220, width: 1620, height: 960 };
const END: Rect = { x: 13000, y: 60, width: 1920, height: 1080 };
const ARM_CLOSEUP: Rect = { x: 2600, y: 200, width: 980, height: 1050 };
const ARM_SCOPE_CLOSEUP: Rect = { x: 3600, y: 200, width: 1120, height: 1040 };
const WHEEL_CLOSEUP: Rect = { x: 5520, y: 200, width: 980, height: 1050 };
const FLY_SCOPE_CLOSEUP: Rect = { x: 6520, y: 200, width: 1120, height: 1040 };

const ARM_CODE_FEEDBACK_ONLY = `var slot0 = new Slot0Configs();
slot0.kP = 0.6;   // gentle feedback — the cleanup crew
slot0.kD = 0.15;

motor.getConfigurator().apply(slot0);
motor.setControl(positionVoltage.withPosition(target));`;

const ARM_CODE_WITH_KG = `var slot0 = new Slot0Configs();
slot0.kP = 0.6;   // gentle feedback — the cleanup crew
slot0.kD = 0.15;
slot0.kG = 3.9;   // feedforward: volts to hold the arm level

motor.getConfigurator().apply(slot0);
motor.setControl(positionVoltage.withPosition(target));`;

const FLY_CODE_FEEDBACK_ONLY = `var slot0 = new Slot0Configs();
slot0.kP = 0.15;   // feedback trims the leftovers

motor.getConfigurator().apply(slot0);
motor.setControl(velocityVoltage.withVelocity(targetRps));`;

const FLY_CODE_WITH_FF = `var slot0 = new Slot0Configs();
slot0.kS = 0.5;    // volts to overcome friction
slot0.kV = 0.115;  // volts per rotation-per-second
slot0.kP = 0.15;   // feedback trims the leftovers

motor.getConfigurator().apply(slot0);
motor.setControl(velocityVoltage.withVelocity(targetRps));`;

export const FeedforwardLesson: TrailerScript = {
  id: "FeedforwardLesson",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "Feedforward",
      subtitle:
        "The full lesson — kS, kV, kA, and kG: predict the force, then correct",
      accent: "mint",
    },
    {
      kind: "pid-lab",
      id: "lab",
      rect: ARM_LAB,
      startDeg: -45,
      hardStopDeg: -45,
      chips: ["kP", "kD", "kG", "target"],
    },
    {
      kind: "flywheel-lab",
      id: "fly",
      rect: FLY_LAB,
      chips: ["kP", "kS", "kV", "target"],
    },
    {
      kind: "code",
      id: "arm-code",
      rect: ARM_CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", ARM_CODE_FEEDBACK_ONLY, ARM_CODE_WITH_KG],
    },
    {
      kind: "code",
      id: "fly-code",
      rect: FLY_CODE,
      fileName: "Flywheel.java",
      language: "java",
      states: ["", FLY_CODE_FEEDBACK_ONLY, FLY_CODE_WITH_FF],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Predict, then correct",
      subtitle:
        "Next lesson: Motion Magic — plan the whole path and let feedforward follow it",
      url: "frc5712.com/pid-control",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "Every team that tunes an arm does this: crank kP until the sag goes away, then spend the night fighting the oscillation you just bought. That trade exists because feedback only works from error. Feedforward works from physics, and it gets there first. Today you measure four gains instead of guessing them.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "recap-sag",
      text: "Start on the arm, gains still gentle from last lesson. Ask for forty-five degrees. It rises, slows, and parks a few degrees short, and it will sit there all day. That leftover error is the arm's paycheck. Feedback can only turn error into voltage, so it has to keep some.",
      camera: ARM_LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, at: { word: "gentle" } },
        { type: "target", deg: 45, at: { word: "forty-five" } },
      ],
    },
    {
      id: "gravity",
      text: "Gravity's torque on that arm follows the cosine of the angle: worst at horizontal, gone at vertical. Feedback can't see any of it coming. It learns the arm is falling only after the arm has fallen. And that's the trap. Close the gap, and you kill the voltage that was holding it.",
      camera: ARM_CLOSEUP,
    },
    {
      id: "kg",
      text: "So stop asking feedback to solve a problem you can just calculate. Cancel it. kG is a constant handed to the motor before any error exists, scaled down as the arm swings up toward vertical where gravity stops mattering. Now feedback wakes up already at the setpoint with nothing left to hold.",
      camera: ARM_LAB,
      events: [
        { type: "gains", kP: 0.6, kD: 0.15, kG: 3.9, at: { word: "cancel" } },
      ],
    },
    {
      id: "kg-proof",
      text: "Push it further. Seventy-five degrees, and the gains are untouched. On the scope the trace rises once, meets the setpoint, and stays: no sag underneath, no ringing on top. What changed is who is doing the work. Feedforward carries the weight; feedback corrects a robot that's nearly right already.",
      camera: ARM_SCOPE_CLOSEUP,
      events: [{ type: "target", deg: 75, at: { word: "seventy-five" } }],
    },
    {
      id: "family",
      text: "kG has a family, and one rule: any cost you can predict gets its own gain. Friction gets kS, holding a speed gets kV, and changing that speed gets kA. These are measurements, not settings you nudge until the robot looks happy. To meet them we need a rig that spins.",
      camera: ARM_LAB,
      holdAfter: 0.5,
    },
    {
      id: "ks",
      text: "New hardware: a shooter flywheel. Feed it a tenth of a volt. Nothing. Two tenths. Still nothing. Friction keeps the wheel clamped until roughly half a volt, and none of that half volt turns into motion. Call it the entry fee. kS covers it, and below kS your commands do nothing.",
      camera: WHEEL_CLOSEUP,
    },
    {
      id: "velocity-problem",
      text: "Now velocity control: we want a speed held, not a position hit. Proportional feedback only, same as before. Target, thirty-six hundred RPM. The wheel screams up, flattens out around two thousand, and then sits there. Forty percent short, and perfectly stable about it.",
      camera: FLY_LAB,
      events: [
        { type: "gains", kP: 0.15, kD: 0, at: { word: "proportional" } },
        { type: "rpm", value: 3600, at: { word: "thirty-six" } },
      ],
    },
    {
      id: "sag-explain",
      text: "Sixteen hundred RPM missing, and the controller thinks it is done. Same disease as the arm, different costume. Holding a flywheel at speed costs steady voltage forever, and proportional control can only mint voltage out of error. So it hangs on to a giant error on purpose.",
      camera: FLY_SCOPE_CLOSEUP,
    },
    {
      id: "kv",
      text: "Cruise voltage is predictable too, and linear: kV is the volts per rotation per second. Measure it once, pay it up front. Stack kS on top to break friction. Add both, and the wheel walks straight up to target and holds. Feedback is left trimming a couple of RPM.",
      camera: FLY_LAB,
      events: [
        {
          type: "gains",
          kP: 0.15,
          kD: 0,
          kS: 0.5,
          kV: 0.115,
          at: { word: "add" },
        },
      ],
    },
    {
      id: "feed",
      text: "Now the part that decides matches: game pieces. Every ball through the shooter drags speed off that wheel. One. Two. Three. The dips are over four hundred RPM each, and they are gone before the next ball arrives, because feedforward never stopped paying the cruise voltage. Proportional-only would still be climbing.",
      camera: FLY_LAB,
      events: [
        { type: "feed", at: { word: "one" } },
        { type: "feed", at: { word: "two" } },
        { type: "feed", at: { word: "three" } },
      ],
    },
    {
      id: "ka",
      text: "kA is the last relative, and the rarest. Getting a wheel from stopped to thirty-six hundred takes voltage beyond cruising, and kA is what pays for that spike. On a flywheel you can usually skip it, since nobody cares whether spin-up took a second or two. Next lesson cares a lot.",
      camera: WHEEL_CLOSEUP,
    },
    {
      id: "characterize",
      text: "Don't guess. Hold the wheel at a known voltage, say six volts, wait for the speed to stop changing, then divide volts by speed. That quotient is kV. For kS, creep the voltage up until the wheel first budges. Ten minutes, and the numbers are yours instead of a forum post's.",
      camera: FLY_LAB,
    },
    {
      id: "code-arm",
      text: "The arm's slot config, unchanged from the PID lesson except for a single line. kP and kD are still there. kG holds the weight. Gravity type set to arm cosine tells Phoenix to scale it by measured position, so you get the full push at horizontal and almost none pointing straight up.",
      camera: ARM_CODE,
      events: [
        {
          type: "code-state",
          artifact: "arm-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "arm-code",
          state: 2,
          at: { word: "holds" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "code-fly",
      text: "The flywheel wants two extra lines. kS covers friction, kV covers cruise, and kP shrinks to a fraction of what PID needed. The request changes too: velocity voltage instead of position voltage, and the target goes in as rotations per second, not RPM, which is the unit mistake everyone makes exactly once.",
      camera: FLY_CODE,
      events: [
        {
          type: "code-state",
          artifact: "fly-code",
          state: 1,
          at: { progress: 0.03 },
        },
        {
          type: "code-state",
          artifact: "fly-code",
          state: 2,
          at: { word: "covers" },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "recipe",
      text: "Zoom out and the family collapses into one habit: anything you can work out ahead of time, you pay for ahead of time, and feedback gets whatever is left over. Friction, gravity, cruise, acceleration. kP stops being a lever you crank and starts being a safety net.",
      camera: FLY_LAB,
      holdAfter: 0.5,
    },
    {
      id: "cta",
      text: "Right now we still hand the arm a target and expect it to teleport, which is why the first instant of every move is a voltage spike. Motion Magic fixes the ask itself, and the gains you just measured are what make the plan believable. Bring your numbers.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
