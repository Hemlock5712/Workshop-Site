// Deterministic arm simulation that drives the PidLab artifact.
//
// The whole trajectory is integrated once per render (useMemo) from frame 0,
// so any frame can be sampled independently — a hard requirement in Remotion.
// Units are degrees so the on-screen gains read like the workshop's code.

export interface SimEvent {
  frame: number;
  kP?: number;
  kD?: number;
  /** Gravity feedforward, volts at horizontal — applied as kG·cos(angle). */
  kG?: number;
  targetDeg?: number;
  /**
   * Enable Motion Magic-style target profiling. Once set, later targetDeg
   * events glide there along a trapezoid profile instead of stepping.
   */
  profile?: { cruiseDegPerSec: number; accelDegPerSec2: number };
}

export interface SimResult {
  /** Arm angle per frame, degrees. */
  angles: Float32Array;
  /** Active target per frame, degrees; NaN before a target is set. */
  targets: Float32Array;
  /** Commanded voltage per frame (clamped ±12 V). */
  volts: Float32Array;
}

export const SIM = {
  /** deg/s² of arm acceleration per commanded volt. */
  torquePerVolt: 90,
  /** Gravity accel at horizontal, deg/s² (≈3.9 V just to hold level). */
  gravity: 350,
  /** Viscous friction, per second. */
  friction: 0.7,
  maxVolts: 12,
  substeps: 8,
} as const;

export function simulateArm(options: {
  fps: number;
  totalFrames: number;
  startDeg: number;
  hardStopDeg: number;
  ceilingDeg?: number;
  events: SimEvent[];
}): SimResult {
  const { fps, totalFrames, startDeg, hardStopDeg, events } = options;
  const ceilingDeg = options.ceilingDeg ?? 100;
  const sorted = [...events].sort((a, b) => a.frame - b.frame);

  const angles = new Float32Array(totalFrames);
  const targets = new Float32Array(totalFrames);
  const volts = new Float32Array(totalFrames);

  let angle = startDeg;
  let velocity = 0;
  let kP = 0;
  let kD = 0;
  let kG = 0;
  let target = NaN;
  let nextEvent = 0;
  // Motion Magic state: when a profile is configured, `target` becomes the
  // instantaneous (moving) setpoint gliding toward `goal`.
  let profileParams: {
    cruiseDegPerSec: number;
    accelDegPerSec2: number;
  } | null = null;
  let profileVel = 0;
  let goal = NaN;
  const dt = 1 / (fps * SIM.substeps);

  for (let frame = 0; frame < totalFrames; frame++) {
    while (nextEvent < sorted.length && sorted[nextEvent].frame <= frame) {
      const e = sorted[nextEvent++];
      if (e.kP !== undefined) kP = e.kP;
      if (e.kD !== undefined) kD = e.kD;
      if (e.kG !== undefined) kG = e.kG;
      if (e.profile !== undefined) {
        profileParams = e.profile;
        profileVel = 0;
        goal = NaN;
      }
      if (e.targetDeg !== undefined) {
        if (profileParams) {
          goal = e.targetDeg;
          // Profile glides from wherever the setpoint currently is.
          if (Number.isNaN(target)) target = angle;
        } else {
          target = e.targetDeg;
        }
      }
    }

    let commanded = 0;
    for (let step = 0; step < SIM.substeps; step++) {
      if (profileParams && !Number.isNaN(goal) && target !== goal) {
        const { cruiseDegPerSec, accelDegPerSec2 } = profileParams;
        const dist = goal - target;
        const dir = Math.sign(dist);
        // Fastest velocity that can still stop at the goal, capped at cruise.
        const desired =
          dir *
          Math.min(
            cruiseDegPerSec,
            Math.sqrt(2 * accelDegPerSec2 * Math.abs(dist))
          );
        if (profileVel < desired) {
          profileVel = Math.min(desired, profileVel + accelDegPerSec2 * dt);
        } else {
          profileVel = Math.max(desired, profileVel - accelDegPerSec2 * dt);
        }
        target += profileVel * dt;
        if ((dir > 0 && target >= goal) || (dir < 0 && target <= goal)) {
          target = goal;
          profileVel = 0;
        }
      }

      const gravityFF = kG * Math.cos((angle * Math.PI) / 180);
      const error = Number.isNaN(target) ? 0 : target - angle;
      commanded = Number.isNaN(target)
        ? 0
        : Math.max(
            -SIM.maxVolts,
            Math.min(SIM.maxVolts, kP * error - kD * velocity + gravityFF)
          );

      const accel =
        commanded * SIM.torquePerVolt -
        SIM.gravity * Math.cos((angle * Math.PI) / 180) -
        SIM.friction * velocity;

      velocity += accel * dt;
      angle += velocity * dt;

      if (angle <= hardStopDeg) {
        angle = hardStopDeg;
        if (velocity < 0) velocity = 0;
      }
      if (angle >= ceilingDeg) {
        angle = ceilingDeg;
        if (velocity > 0) velocity = 0;
      }
    }

    angles[frame] = angle;
    targets[frame] = target;
    volts[frame] = commanded;
  }

  return { angles, targets, volts };
}
