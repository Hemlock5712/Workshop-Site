// Deterministic flywheel simulation for the FlywheelLab artifact — the
// velocity-control half of the workshop. Internally rotations-per-second
// (Phoenix units, so kV/kS/kP read like real Slot0 values); the scope
// displays RPM.
//
// Motor model: first-order DC motor — steady-state speed proportional to
// voltage (100 rps at 12 V), with static friction that holds the wheel still
// under ~0.5 V. Feeding a game piece drains speed instantly.

export interface FlywheelSimEvent {
  frame: number;
  kP?: number;
  /** Static feedforward, volts — overcomes friction before anything moves. */
  kS?: number;
  /** Velocity feedforward, volts per rps — the cruise voltage. */
  kV?: number;
  targetRps?: number;
  /** A game piece through the wheel: instant speed drop. */
  feed?: boolean;
}

export interface FlywheelSimResult {
  /** Wheel speed per frame, rps. */
  speeds: Float32Array;
  /** Active target per frame, rps; NaN before one is set. */
  targets: Float32Array;
  /** Commanded voltage per frame (0..12 — shooters spin one way). */
  volts: Float32Array;
  /** Frames at which a feed event fired (for the ball animation). */
  feedFrames: number[];
}

export const FLYWHEEL_SIM = {
  /** Steady-state rps per volt (100 rps free speed at 12 V). */
  rpsPerVolt: 100 / 12,
  /** First-order time constant, seconds (how fast the wheel spins up). */
  timeConstant: 0.7,
  /** Below this voltage a stationary wheel stays stuck. */
  staticVolts: 0.5,
  /** Instant speed drop when a game piece is fed, rps. */
  feedDropRps: 9,
  maxVolts: 12,
  substeps: 4,
} as const;

export function simulateFlywheel(options: {
  fps: number;
  totalFrames: number;
  events: FlywheelSimEvent[];
}): FlywheelSimResult {
  const { fps, totalFrames, events } = options;
  const sorted = [...events].sort((a, b) => a.frame - b.frame);

  const speeds = new Float32Array(totalFrames);
  const targets = new Float32Array(totalFrames);
  const volts = new Float32Array(totalFrames);
  const feedFrames: number[] = [];

  let speed = 0;
  let kP = 0;
  let kS = 0;
  let kV = 0;
  let target = NaN;
  let nextEvent = 0;
  const dt = 1 / (fps * FLYWHEEL_SIM.substeps);

  for (let frame = 0; frame < totalFrames; frame++) {
    while (nextEvent < sorted.length && sorted[nextEvent].frame <= frame) {
      const e = sorted[nextEvent++];
      if (e.kP !== undefined) kP = e.kP;
      if (e.kS !== undefined) kS = e.kS;
      if (e.kV !== undefined) kV = e.kV;
      if (e.targetRps !== undefined) target = e.targetRps;
      if (e.feed) {
        speed = Math.max(0, speed - FLYWHEEL_SIM.feedDropRps);
        feedFrames.push(frame);
      }
    }

    let commanded = 0;
    for (let step = 0; step < FLYWHEEL_SIM.substeps; step++) {
      const error = Number.isNaN(target) ? 0 : target - speed;
      commanded = Number.isNaN(target)
        ? 0
        : Math.max(
            0,
            Math.min(
              FLYWHEEL_SIM.maxVolts,
              kS * Math.sign(target) + kV * target + kP * error
            )
          );

      // Stiction: a stopped wheel needs real voltage to break free.
      if (speed < 0.3 && commanded < FLYWHEEL_SIM.staticVolts) {
        // stuck — no motion
      } else {
        const steadyState = commanded * FLYWHEEL_SIM.rpsPerVolt;
        speed += ((steadyState - speed) / FLYWHEEL_SIM.timeConstant) * dt;
        if (speed < 0) speed = 0;
      }
    }

    speeds[frame] = speed;
    targets[frame] = target;
    volts[frame] = commanded;
  }

  return { speeds, targets, volts, feedFrames };
}
