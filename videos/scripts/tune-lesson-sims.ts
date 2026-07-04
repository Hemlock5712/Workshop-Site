// Dev tool: verify the full-lesson sim stories (PID lesson + flywheel lab).
//   npx tsx scripts/tune-lesson-sims.ts

import { simulateArm } from "../src/trailer/lib/pidSim";
import { simulateFlywheel } from "../src/trailer/lib/flywheelSim";

const FPS = 30;

// --- PID lesson arc --------------------------------------------------------
const arm = simulateArm({
  fps: FPS,
  totalFrames: 5900,
  startDeg: -45,
  hardStopDeg: -45,
  events: [
    { frame: 420, targetDeg: 30 },
    { frame: 840, kP: 0.2, kD: 0 }, // p-concept: sag
    { frame: 1680, kP: 2.5, kD: 0 }, // p-crank: ring
    { frame: 2520, kP: 2.5, kD: 0.2 },
    { frame: 2540, targetDeg: 60 }, // d-term: lands
    { frame: 2940, kP: 2.5, kD: 2.8 },
    { frame: 2960, targetDeg: 10 }, // d-overdone: crawl
    { frame: 3360, kP: 2.5, kD: 0.2 },
    { frame: 3380, targetDeg: 45 }, // d-right: crisp
    { frame: 3780, kP: 0.35, kD: 0.15 },
    { frame: 3800, targetDeg: 20 }, // i-intro: sag again
    { frame: 4200, kI: 1.2, kP: 0.35, kD: 0.05 }, // i-demo: windup
    { frame: 5040, kP: 2.5, kD: 0.2, kI: 0 },
    { frame: 5100, impulseDegPerSec: -140 }, // bump
  ],
});
const at = (f: number) => arm.angles[f].toFixed(1);
const range = (a: number, b: number) => {
  const s = Array.from(arm.angles.slice(a, b));
  return `${Math.min(...s).toFixed(1)}..${Math.max(...s).toFixed(1)}`;
};
console.log(
  "p-sag settle (f1600):        ",
  at(1600),
  "→ want ~11 (19 short of 30)"
);
console.log(
  "d-overdone approach (f2960-3360):",
  range(2960, 3360),
  "→ slow crawl toward 10, no ring"
);
console.log(
  "d-overdone at +2s (f3020):   ",
  at(3020),
  "→ still far from 10 (sluggish)"
);
console.log("d-right settle (f3500):      ", at(3500), "→ ~45 fast");
console.log(
  "i-intro sag (f4150):         ",
  at(4150),
  "→ ~9-12 (stuck under 20)"
);
console.log(
  "i-demo overshoot (f4200-5040):",
  range(4200, 5040),
  "→ want max > 23 (windup overshoot)"
);
console.log(
  "i-demo settle (f4950):       ",
  at(4950),
  "→ ~20 (integral closes the gap)"
);
console.log(
  "bump dip (f5100-5160):       ",
  range(5100, 5160),
  "→ dips well below 45"
);
console.log(
  "bump recovered (f5220):      ",
  at(5220),
  "→ back at ~45 within ~1s"
);

// --- Flywheel story (for FF lesson) ----------------------------------------
const fly = simulateFlywheel({
  fps: FPS,
  totalFrames: 2200,
  events: [
    { frame: 100, kP: 0.15, kS: 0, kV: 0 },
    { frame: 130, targetRps: 60 }, // P-only: sags hard
    { frame: 800, kP: 0.15, kS: 0.5, kV: 0.115 }, // + kS/kV: nails it
    { frame: 1400, feed: true },
    { frame: 1520, feed: true },
    { frame: 1640, feed: true }, // rapid fire
  ],
});
const rpm = (f: number) => (fly.speeds[f] * 60).toFixed(0);
let minAfterFeeds = Infinity;
for (let f = 1400; f < 1800; f++)
  minAfterFeeds = Math.min(minAfterFeeds, fly.speeds[f] * 60);
console.log(
  "\nfly P-only settle (f700):    ",
  rpm(700),
  "rpm → want ~1900-2200 (sags far below 3600)"
);
console.log(
  "fly with kV (f1300):         ",
  rpm(1300),
  "rpm → want ~3550-3650 (on target)"
);
console.log(
  "fly dip during feeds:        ",
  minAfterFeeds.toFixed(0),
  "rpm → visible dip below 3600"
);
console.log("fly recovered (f1900):       ", rpm(1900), "rpm → back at ~3600");
