import type { Rect, TrailerScript } from "../lib/types";

// Full-length PID lesson (~4.5 min). Everything the 90s trailer cut: why P
// sags, why it rings, over-damped D, the I term and its windup (and why the
// workshop skips it), disturbance recovery, the actual tuning procedure, and
// tolerance via the at-target check (holds never finish; chains use .until).

const TITLE: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
const LAB: Rect = { x: 2560, y: 140, width: 2200, height: 1150 };
const TUNING: Rect = { x: 5480, y: 160, width: 2200, height: 1100 };
const CODE: Rect = { x: 8440, y: 220, width: 1620, height: 960 };
const END: Rect = { x: 10800, y: 60, width: 1920, height: 1080 };
const ARM_CLOSEUP: Rect = { x: 2600, y: 200, width: 980, height: 1050 };
const SCOPE_CLOSEUP: Rect = { x: 3600, y: 200, width: 1120, height: 1040 };

const GOTO_CODE = `// "There" is never exact — pick a tolerance the game allows.
private static final double TARGET = 30.0; // degrees
private static final double TOLERANCE = 2.0; // degrees

public Command goToTarget() {
  return runRepeatedly(() -> setPosition(TARGET)).named("target (hold)");
}

public boolean isAtTarget() {
  return Math.abs(TARGET - positionDegrees()) < TOLERANCE;
}

// chains move on with: arm.goToTarget().until(arm::isAtTarget)`;

export const PidLesson: TrailerScript = {
  id: "PidLesson",
  voice: "af_heart",
  world: [
    {
      kind: "title",
      id: "title",
      rect: TITLE,
      title: "PID Control",
      subtitle:
        "The full lesson — sag, ring, damping, and how to actually tune",
      accent: "purple",
    },
    {
      kind: "pid-lab",
      id: "lab",
      rect: LAB,
      startDeg: -45,
      hardStopDeg: -45,
      chips: ["kP", "kI", "kD", "target"],
    },
    {
      kind: "diagram",
      id: "tuning",
      rect: TUNING,
      title: "The tuning procedure",
      nodes: [
        {
          id: "start",
          label: "Start kP small",
          sublabel: "so small it barely moves",
          x: 80,
          y: 150,
          width: 460,
          height: 220,
          accent: "blue",
          step: 1,
        },
        {
          id: "double",
          label: "Double kP",
          sublabel: "until it overshoots and rings",
          x: 880,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 2,
        },
        {
          id: "backoff",
          label: "Back off ~30%",
          sublabel: "just below the ringing point",
          x: 1680,
          y: 150,
          width: 460,
          height: 220,
          accent: "amber",
          step: 3,
        },
        {
          id: "addd",
          label: "Add kD",
          sublabel: "until the landing is crisp",
          x: 880,
          y: 720,
          width: 460,
          height: 220,
          accent: "purple",
          step: 4,
        },
        {
          id: "verify",
          label: "Verify",
          sublabel: "big steps, small steps, bumps",
          x: 1680,
          y: 720,
          width: 460,
          height: 220,
          accent: "mint",
          step: 5,
        },
      ],
      edges: [
        { from: "start", to: "double" },
        { from: "double", to: "backoff" },
        { from: "backoff", to: "addd", step: 4 },
        { from: "addd", to: "verify", step: 5 },
      ],
    },
    {
      kind: "code",
      id: "goto-code",
      rect: CODE,
      fileName: "Arm.java",
      language: "java",
      states: ["", GOTO_CODE],
    },
    {
      kind: "end",
      id: "end",
      rect: END,
      title: "Tuned. Now stop fighting gravity.",
      subtitle:
        "Next lesson: feedforward — kS, kV, and kG carry the load so PID only trims",
      url: "frc5712.com/pid-control",
    },
  ],
  beats: [
    {
      id: "hook",
      text: "This is the full PID lesson. You'll learn why an arm sags. Why it shakes. What each number in the controller really does. And the exact steps to tune a mechanism without breaking it.",
      camera: TITLE,
      holdAfter: 0.5,
    },
    {
      id: "setup",
      text: "Here is our test rig. An arm on a motor, resting at negative forty-five degrees. We want it at positive thirty. That target angle is called the setpoint. The gap between the arm and the setpoint is called the error. Every part of PID works off the error.",
      camera: ARM_CLOSEUP,
      events: [{ type: "target", deg: 30, at: { word: "thirty" } }],
    },
    {
      id: "p-concept",
      text: "P stands for proportional. The voltage it sends is k P times the error. k P is just a number we pick, called a gain. Big error, big push. Small error, small push. Now watch a small gain. The arm rises, slows, and then stops climbing.",
      camera: LAB,
      events: [{ type: "gains", kP: 0.2, kD: 0, at: { word: "proportional" } }],
    },
    {
      id: "p-sag",
      text: "It stalls about nineteen degrees short. Here is why. At that angle, k P times the error makes just enough voltage to balance gravity. The push and gravity cancel out. But the arm is still below the target. P needs an error to make any voltage. So it keeps some error forever.",
      camera: SCOPE_CLOSEUP,
    },
    {
      id: "p-crank",
      text: "The obvious fix? Crank k P way up. Now even a small error makes serious voltage. The arm gets much closer. But look how it arrives. It blasts through thirty at full speed. Then it swings back and forth around the setpoint. We call that ringing.",
      camera: LAB,
      events: [{ type: "gains", kP: 2.5, kD: 0, at: { word: "crank" } }],
    },
    {
      id: "why-ring",
      text: "The ringing is not random. It is physics. P only looks at where you are. It never looks at how fast you are moving. So the arm arrives at the target carrying speed. Nothing tells it to slow down. Past the target, the push flips direction. And that repeats, over and over.",
      camera: SCOPE_CLOSEUP,
    },
    {
      id: "d-term",
      text: "That's the D term's job. D stands for derivative. It watches how fast you are approaching. Then it brakes against that speed. Faster approach, harder brake. Keep the same k P and add a touch of k D. Send it to sixty degrees. It lands like it's on rails.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, at: { word: "derivative" } },
        { type: "target", deg: 60, at: { word: "sixty" } },
      ],
    },
    {
      id: "d-overdone",
      text: "But D can fail too. Raise k D way too far. Now the brake overpowers the push. Send the arm back down to ten degrees. It crawls, cautious and slow. Smooth is good. Timid loses matches.",
      camera: SCOPE_CLOSEUP,
      events: [
        { type: "gains", kP: 2.5, kD: 2.8, at: { word: "raise" } },
        { type: "target", deg: 10, at: { word: "ten" } },
      ],
    },
    {
      id: "d-right",
      text: "Now back k D off until the landing is crisp. Fast approach. One clean settle. No bounce. That balance, quick but calm, is what a tuned mechanism feels like. Send it up to forty-five again, just to prove it.",
      camera: LAB,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, at: { word: "off" } },
        { type: "target", deg: 45, at: { word: "forty-five" } },
      ],
    },
    {
      id: "i-intro",
      text: "So what is the I for? I stands for integral. It is the controller's memory. It adds up the error over time. If the arm sits short of the target, that error piles up. The bigger the pile, the harder it pushes. It keeps pushing until the gap closes.",
      camera: ARM_CLOSEUP,
      events: [
        { type: "gains", kP: 0.35, kD: 0.15, at: { word: "Integral" } },
        { type: "target", deg: 20, at: { word: "short" } },
      ],
    },
    {
      id: "i-demo",
      text: "Here is the sag again, with a weak P. The arm is stuck below twenty. Now add k I and watch the memory work. The error piles up. The push grows. The arm grinds its way onto the target. But notice the cost. It stored up so much push that it overshoots first.",
      camera: SCOPE_CLOSEUP,
      events: [
        { type: "gains", kP: 0.35, kD: 0.05, kI: 1.2, at: { word: "add" } },
      ],
    },
    {
      id: "i-verdict",
      text: "That overshoot has a name: integral windup. It is why this workshop skips the I term. I is a slow guess at a force you could just calculate. Gravity is not a mystery. The next lesson replaces the whole I term with feedforward. Feedforward adds that force right away, no memory needed.",
      camera: LAB,
      holdAfter: 0.6,
    },
    {
      id: "bump",
      text: "One more thing a controller must survive: the real world. We are back on our tuned gains. Now bump the arm hard, like a collision. P sees the new error instantly. D catches the speed. The arm is back on target in under a second. Tuning is about staying there, not just arriving.",
      camera: ARM_CLOSEUP,
      events: [
        { type: "gains", kP: 2.5, kD: 0.2, kI: 0, at: { word: "tuned" } },
        { type: "impulse", degPerSec: -140, at: { word: "bump" } },
      ],
    },
    {
      id: "procedure-1",
      text: "Now the tuning procedure. You run it the same way every time. Always in simulation first. Step one: start k P so small the mechanism barely moves. Step two: double k P, and double it again, until you see overshoot and ringing.",
      camera: { x: 5500, y: 120, width: 2160, height: 560 },
      events: [
        { type: "diagram", artifact: "tuning", step: 1, at: { word: "one" } },
        {
          type: "diagram",
          artifact: "tuning",
          step: 2,
          at: { word: "double" },
        },
      ],
    },
    {
      id: "procedure-2",
      text: "Step three: back k P off about thirty percent, just under the ringing point. Step four: add k D in small steps until the landing is crisp. Then verify like a skeptic. Try big steps, small steps, and a few bumps.",
      camera: TUNING,
      events: [
        { type: "diagram", artifact: "tuning", step: 3, at: { word: "three" } },
        { type: "diagram", artifact: "tuning", step: 4, at: { word: "four" } },
        {
          type: "diagram",
          artifact: "tuning",
          step: 5,
          at: { word: "verify" },
        },
      ],
    },
    {
      id: "tolerance",
      text: "Last piece: when is the arm officially there? Never exactly. A real arm jitters by fractions of a degree forever. So we pick a tolerance. That is how much error still counts as close enough. The go to target hold never finishes. It just keeps holding. A chain moves on by checking is at target with until. Pick the tolerance your game needs, not the tiniest number that feels precise.",
      camera: CODE,
      events: [
        {
          type: "code-state",
          artifact: "goto-code",
          state: 1,
          at: { progress: 0.03 },
        },
      ],
      holdAfter: 1.4,
    },
    {
      id: "cta",
      text: "That's real PID. P gives the push. D keeps it calm. Tolerance decides when you're close enough. And the procedure works on any mechanism. Next lesson: feedforward, where gravity stops being P's problem. All of it is at frc5712.com.",
      camera: END,
      holdAfter: 1.2,
    },
  ],
};
