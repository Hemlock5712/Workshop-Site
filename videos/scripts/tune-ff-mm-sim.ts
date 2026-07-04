// Dev tool: verify the Feedforward and Motion Magic trailer stories.
//   npx tsx scripts/tune-ff-mm-sim.ts

import { simulateArm } from "../src/trailer/lib/pidSim";

const FPS = 30;

// --- Feedforward story ---------------------------------------------------
const ff = simulateArm({
  fps: FPS,
  totalFrames: 1500,
  startDeg: -45,
  hardStopDeg: -45,
  events: [
    { frame: 300, kP: 0.6, kD: 0.15 },
    { frame: 330, targetDeg: 45 },
    { frame: 700, kP: 0.6, kD: 0.15, kG: 3.9 },
    { frame: 1000, targetDeg: 75 },
  ],
});
const at = (arr: Float32Array, f: number) => arr[f].toFixed(1);
console.log(
  "FF sag before kG (f650-700):  ",
  at(ff.angles, 690),
  "→ want ~39-41 (visible gap below 45)"
);
console.log(
  "FF after kG (f950):           ",
  at(ff.angles, 950),
  "→ want ~45.0 (gap closed)"
);
console.log(
  "FF at 75 target (f1300):      ",
  at(ff.angles, 1300),
  "→ want ~75.0 (lands exactly)"
);

// --- Motion Magic story ---------------------------------------------------
const mm = simulateArm({
  fps: FPS,
  totalFrames: 2000,
  startDeg: -45,
  hardStopDeg: -45,
  events: [
    { frame: 300, kP: 2.5, kD: 0.2, kG: 3.9 },
    { frame: 330, targetDeg: 60 },
    { frame: 800, profile: { cruiseDegPerSec: 70, accelDegPerSec2: 140 } },
    { frame: 830, targetDeg: -20 },
    { frame: 1200, targetDeg: 55 },
  ],
});
let maxVStep = 0;
for (let f = 330; f < 500; f++)
  maxVStep = Math.max(maxVStep, Math.abs(mm.volts[f]));
let maxVProfiled = 0;
for (let f = 830; f < 1100; f++)
  maxVProfiled = Math.max(maxVProfiled, Math.abs(mm.volts[f]));
let maxTrackErr = 0;
for (let f = 1200; f < 1400; f++) {
  if (!Number.isNaN(mm.targets[f])) {
    maxTrackErr = Math.max(maxTrackErr, Math.abs(mm.targets[f] - mm.angles[f]));
  }
}
console.log(
  "MM step peak volts:           ",
  maxVStep.toFixed(1),
  "→ want 12.0 (slams the rail)"
);
console.log(
  "MM step peak angle (f330-800):",
  Math.max(...mm.angles.slice(330, 800)).toFixed(1),
  "→ overshoot past 60"
);
console.log(
  "MM profiled peak volts:       ",
  maxVProfiled.toFixed(1),
  "→ want well under 12"
);
console.log("MM profiled at -20 (f1150):   ", at(mm.angles, 1150));
console.log(
  "MM tracking err during glide: ",
  maxTrackErr.toFixed(1),
  "→ want < ~6° (hugs the moving target)"
);
console.log("MM settled at 55 (f1450):     ", at(mm.angles, 1450));
