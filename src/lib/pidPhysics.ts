/**
 * 1-DOF rotational arm physics for the PID + Feedforward Playground.
 *
 * Units match how an FRC programmer actually wires this on Phoenix 6 / WPILib:
 *  - Position: rotations
 *  - Velocity: rotations / second
 *  - Controller output: volts (clamped to ±12 V — TalonFX standard)
 *  - Gains in CTRE shape:
 *      kP : V / rotation
 *      kI : V / (rotation · second)
 *      kD : V · s / rotation         (a.k.a. V / (rotation/second))
 *      kS : V                        (static friction breakaway)
 *      kV : V · s / rotation         (per unit setpoint velocity)
 *      kG : V                        (gravity comp; multiplied by cos(angle_from_horizontal))
 *
 * Internally we still integrate in radians (cleaner sin/cos), but every gain
 * the user touches is in the same units they'd type into Phoenix Tuner.
 *
 * Motor model is back-EMF aware:
 *   τ = K_T · (V − K_B · ω)
 * where K_T = τ_stall / V_max and K_B = V_max / ω_free.
 *
 * Two scenarios:
 *  - "step"  — arm sits at 0° (gravity-aligned), profile commands it to 90°
 *              (horizontal). Demonstrates the full PID + FF tuning loop.
 *  - "hold"  — arm starts at 90° (horizontal), profile target is also 90°.
 *              No motion is commanded; the only thing that can keep the arm
 *              up is kG (gravity feedforward). This is the kG-in-isolation
 *              demo: with no gains set, gravity wins and the arm falls.
 *
 * Integration is fixed 1 ms dt; the controller updates every 5 ms (200 Hz),
 * matching a typical TalonFX closed-loop on the robot side.
 */

const TWO_PI = 2 * Math.PI;

export interface MotorParams {
  vMax: number; // V — supply voltage cap (12 V for FRC)
  stallTorque: number; // N·m at vMax, ω = 0
  freeSpeed: number; // rad/s at vMax, τ = 0
}

export interface PhysicsParams {
  mass: number; // kg
  length: number; // m (point-mass approximation)
  gravity: number; // m/s²
  friction: number; // N·m·s/rad (viscous, on the load side)
  motor: MotorParams;
  initialAngle: number; // rad
  target: number; // rad — final commanded position
  durationSec: number;
  profileMaxVel: number; // rotations/sec — trapezoidal motion-profile cap
  profileMaxAccel: number; // rotations/sec²
}

export interface PidGains {
  kP: number;
  kI: number;
  kD: number;
}

export interface FfGains {
  kS: number;
  kV: number;
  kG: number;
}

export interface ControllerGains extends PidGains, FfGains {}

export const MOTOR_DEFAULT: MotorParams = {
  vMax: 12,
  stallTorque: 30, // generous so kP can actually drive overshoot
  freeSpeed: 15, // rad/s ≈ 2.39 rotations/sec (~143 RPM at the arm)
};

const PHYSICS_BASE: Omit<PhysicsParams, "initialAngle" | "target"> = {
  mass: 2,
  length: 0.4,
  gravity: 9.81,
  friction: 0.5,
  motor: MOTOR_DEFAULT,
  durationSec: 3,
  profileMaxVel: 2, // rotations/sec
  profileMaxAccel: 15, // rotations/sec²
};

/**
 * Build the PhysicsParams for the hold scenario: arm starts at the target
 * angle and the controller has to keep it there against gravity + friction.
 * Setting target=0 puts the arm hanging straight down (the resting position
 * gravity already supports — no FF needed); target=90° is horizontal (max
 * gravity torque); negative targets reach below the pivot.
 */
export function physicsFor(targetRad: number): PhysicsParams {
  return {
    ...PHYSICS_BASE,
    initialAngle: targetRad,
    target: targetRad,
    durationSec: 2,
  };
}

export const DEFAULT_TARGET_DEG = 90;

export const DEFAULT_GAINS: ControllerGains = {
  kP: 0,
  kI: 0,
  kD: 0,
  kS: 0,
  kV: 0,
  kG: 0,
};

export const SLIDER_RANGES = {
  kP: { min: 0, max: 100, step: 1, precision: 0, unit: "V/rot" },
  kI: { min: 0, max: 30, step: 0.1, precision: 1, unit: "V/(rot·s)" },
  kD: { min: 0, max: 10, step: 0.05, precision: 2, unit: "V·s/rot" },
  kS: { min: 0, max: 2, step: 0.05, precision: 2, unit: "V" },
  kV: { min: 0, max: 15, step: 0.1, precision: 1, unit: "V·s/rot" },
  kG: { min: 0, max: 8, step: 0.05, precision: 2, unit: "V" },
} as const;

export const TARGET_RANGE_DEG = {
  min: -90,
  max: 180,
  step: 1,
} as const;

export type Regime = "stable" | "oscillating" | "drifting";

export interface StepResponseMetrics {
  regime: Regime;
  /** Hold mode: max absolute deviation from the target, in degrees. */
  maxDeviationDeg: number;
  /** Time inside the ±2° settling band (or null if it never settles). */
  settlingTime: number | null;
  /** Absolute error between the final pose and the target. */
  steadyStateErrorDeg: number;
  /** Peak |V| applied by the controller. */
  peakVoltage: number;
}

export interface StepResponse {
  t: Float64Array;
  theta: Float64Array;
  target: Float64Array;
  setpoint: Float64Array;
  voltage: Float64Array;
  metrics: StepResponseMetrics;
}

const INTEGRAL_CLAMP_V_SEC = 1.5;
const STATIC_DEADBAND_ROTPS = 0.005;

interface ProfileSample {
  thetaRot: number;
  omegaRotPs: number;
}

function trapezoidalProfile(
  t: number,
  startRot: number,
  targetRot: number,
  vMax: number,
  aMax: number,
): ProfileSample {
  const span = targetRot - startRot;
  const dir = Math.sign(span) || 1;
  const dist = Math.abs(span);
  if (dist === 0) return { thetaRot: targetRot, omegaRotPs: 0 };

  const tAccel = vMax / aMax;
  const distAccel = 0.5 * aMax * tAccel * tAccel;

  if (2 * distAccel >= dist) {
    const peakV = Math.sqrt(dist * aMax);
    const tPeak = peakV / aMax;
    if (t <= 0) return { thetaRot: startRot, omegaRotPs: 0 };
    if (t < tPeak) {
      return {
        thetaRot: startRot + dir * 0.5 * aMax * t * t,
        omegaRotPs: dir * aMax * t,
      };
    }
    const tTotal = 2 * tPeak;
    if (t < tTotal) {
      const dt = t - tPeak;
      return {
        thetaRot:
          startRot + dir * (0.5 * dist + peakV * dt - 0.5 * aMax * dt * dt),
        omegaRotPs: dir * Math.max(0, peakV - aMax * dt),
      };
    }
    return { thetaRot: targetRot, omegaRotPs: 0 };
  }

  const tCruise = (dist - 2 * distAccel) / vMax;
  if (t <= 0) return { thetaRot: startRot, omegaRotPs: 0 };
  if (t < tAccel) {
    return {
      thetaRot: startRot + dir * 0.5 * aMax * t * t,
      omegaRotPs: dir * aMax * t,
    };
  }
  if (t < tAccel + tCruise) {
    const dt = t - tAccel;
    return {
      thetaRot: startRot + dir * (distAccel + vMax * dt),
      omegaRotPs: dir * vMax,
    };
  }
  const tTotal = 2 * tAccel + tCruise;
  if (t < tTotal) {
    const dt = t - (tAccel + tCruise);
    return {
      thetaRot:
        startRot +
        dir *
          (distAccel + vMax * tCruise + vMax * dt - 0.5 * aMax * dt * dt),
      omegaRotPs: dir * Math.max(0, vMax - aMax * dt),
    };
  }
  return { thetaRot: targetRot, omegaRotPs: 0 };
}

export function simulateStepResponse(
  params: PhysicsParams,
  gains: ControllerGains,
): StepResponse {
  const dt = 0.001;
  const N = Math.round(params.durationSec / dt);
  const controllerEvery = 5;

  const I = params.mass * params.length * params.length;
  const { vMax, stallTorque, freeSpeed } = params.motor;
  const K_T = stallTorque / vMax;
  const K_B = vMax / freeSpeed;

  const startRot = params.initialAngle / TWO_PI;
  const targetRot = params.target / TWO_PI;

  const t = new Float64Array(N);
  const theta = new Float64Array(N);
  const targetArr = new Float64Array(N);
  const setpointArr = new Float64Array(N);
  const voltageArr = new Float64Array(N);

  let th = params.initialAngle;
  let om = 0; // rad/s
  let integral = 0; // V·s (integral of error_rot · dt times kI is already V…)
  let prevErrorRot = 0;
  let voltage = 0;
  let peakVoltage = 0;

  const targetDeg = (params.target * 180) / Math.PI;

  for (let i = 0; i < N; i++) {
    const time = i * dt;

    const sp = trapezoidalProfile(
      time,
      startRot,
      targetRot,
      params.profileMaxVel,
      params.profileMaxAccel,
    );

    if (i % controllerEvery === 0) {
      const dtC = dt * controllerEvery;
      const thRot = th / TWO_PI;
      const errorRot = sp.thetaRot - thRot;
      integral += errorRot * dtC;
      if (integral > INTEGRAL_CLAMP_V_SEC) integral = INTEGRAL_CLAMP_V_SEC;
      else if (integral < -INTEGRAL_CLAMP_V_SEC) integral = -INTEGRAL_CLAMP_V_SEC;
      const dErrorRot = (errorRot - prevErrorRot) / dtC;

      const pidV =
        gains.kP * errorRot + gains.kI * integral + gains.kD * dErrorRot;

      const ksign =
        Math.abs(sp.omegaRotPs) > STATIC_DEADBAND_ROTPS
          ? Math.sign(sp.omegaRotPs)
          : 0;
      const ffV =
        gains.kS * ksign + gains.kV * sp.omegaRotPs + gains.kG * Math.sin(th);

      voltage = pidV + ffV;
      if (voltage > vMax) voltage = vMax;
      else if (voltage < -vMax) voltage = -vMax;
      prevErrorRot = errorRot;

      if (Math.abs(voltage) > peakVoltage) peakVoltage = Math.abs(voltage);
    }

    const tauMotor = K_T * (voltage - K_B * om);
    const tauGravity =
      -params.mass * params.gravity * params.length * Math.sin(th);
    const tauFriction = -params.friction * om;
    const alpha = (tauMotor + tauGravity + tauFriction) / I;

    om += alpha * dt;
    th += om * dt;

    t[i] = time;
    theta[i] = (th * 180) / Math.PI;
    targetArr[i] = targetDeg;
    setpointArr[i] = (sp.thetaRot * 360);
    voltageArr[i] = voltage;
  }

  // ── Metrics ────────────────────────────────────────────────────────────
  let maxDeviationDeg = 0;
  for (let i = 0; i < N; i++) {
    const dev = Math.abs(theta[i] - targetDeg);
    if (dev > maxDeviationDeg) maxDeviationDeg = dev;
  }

  // Time the last sample inside the ±2° band; null if never settles.
  const SETTLE_BAND_DEG = 2;
  let settlingTime: number | null = null;
  let settled = false;
  for (let i = 0; i < N; i++) {
    if (Math.abs(theta[i] - targetDeg) <= SETTLE_BAND_DEG && !settled) {
      settled = true;
      settlingTime = t[i];
    } else if (Math.abs(theta[i] - targetDeg) > SETTLE_BAND_DEG && settled) {
      settled = false;
      settlingTime = null;
    }
  }

  const finalTheta = theta[N - 1] ?? targetDeg;
  const steadyStateErrorDeg = Math.abs(targetDeg - finalTheta);

  // Hold-only regime: how does the arm behave around the target?
  //  • stable      — final pose close to target with no excessive ringing
  //  • oscillating — bouncing around target (kP too high or kD too low)
  //  • drifting    — never reaches/holds target (insufficient FF or PID)
  let regime: Regime;
  if (steadyStateErrorDeg > 5) regime = "drifting";
  else if (maxDeviationDeg > 5) regime = "oscillating";
  else regime = "stable";

  return {
    t,
    theta,
    target: targetArr,
    setpoint: setpointArr,
    voltage: voltageArr,
    metrics: {
      regime,
      maxDeviationDeg,
      settlingTime,
      steadyStateErrorDeg,
      peakVoltage,
    },
  };
}
