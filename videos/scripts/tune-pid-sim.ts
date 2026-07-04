// Dev tool: sanity-check that the PidLab physics tells the story the trailer
// narrates — sag with low P, ringing with high P, clean landing with P+D.
//
//   pnpm --filter @gray-matter/videos exec tsx scripts/tune-pid-sim.ts

import { simulateArm } from "../src/trailer/lib/pidSim";

const FPS = 30;
const sim = simulateArm({
  fps: FPS,
  totalFrames: 2100,
  startDeg: -45,
  hardStopDeg: -45,
  events: [
    { frame: 400, targetDeg: 30 },
    { frame: 750, kP: 0.2, kD: 0 },
    { frame: 1100, kP: 2.5, kD: 0 },
    { frame: 1500, kP: 2.5, kD: 0.2, targetDeg: 60 },
  ],
});

function window(from: number, to: number) {
  const slice = Array.from(sim.angles.slice(from, to));
  return {
    min: Math.min(...slice).toFixed(1),
    max: Math.max(...slice).toFixed(1),
    last: slice[slice.length - 1].toFixed(1),
  };
}

function crossings(from: number, to: number, level: number): number {
  let count = 0;
  for (let f = from + 1; f < to; f++) {
    const a = sim.angles[f - 1] - level;
    const b = sim.angles[f] - level;
    if (a * b < 0) count++;
  }
  return count;
}

console.log("rest (f0-400):        ", window(0, 400));
console.log(
  "low P settle (f1000-1100):",
  window(1000, 1100),
  "→ want ~9-14° (sag well below 30)"
);
console.log(
  "high P peak (f1100-1500): ",
  window(1100, 1500),
  "→ want peak ≥ ~37 (visible overshoot)"
);
console.log(
  "high P crossings of 30°:  ",
  crossings(1100, 1500, 30),
  "→ want 15+ (dramatic ringing)"
);
console.log("high P last (pre-D):      ", window(1450, 1500));
console.log(
  "P+D to 60 (f1500-1650):   ",
  window(1500, 1650),
  "→ want peak ≤ ~68, settle at 60"
);
console.log("P+D settled (f1650-1750): ", window(1650, 1750));
