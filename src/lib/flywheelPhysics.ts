/**
 * Flywheel velocity-control physics for the Flywheel Playground.
 *
 * Models a single DC motor coupled to a flywheel inertia (no gravity, no
 * gear-reduction details — just a spinning disc). Units follow CTRE
 * Phoenix 6 / WPILib conventions:
 *  - Velocity: rotations / second (rps)
 *  - Controller output: volts (clamped to ±12 V)
 *  - Gains:
 *      kP : V·s / rotation        (volts per rps of velocity error)
 *      kI : V / rotation          (volts per rotation of integrated error)
 *      kD : V·s² / rotation       (volts per (rps/s) of error rate)
 *      kS : V                     (static friction breakaway)
 *      kV : V·s / rotation        (back-EMF compensation per rps of setpoint)
 *
 * Motor model is back-EMF aware:
 *   τ = K_T · (V − K_B · ω)
 *
 * Two-phase setpoint, mirroring the arm playground so the same tuning
 * habits transfer:
 *   t < HOLD_PHASE_SEC → target velocity is 0 rps (wheel idle)
 *   t ≥ HOLD_PHASE_SEC → target velocity steps to the user-selected value
 *
 * Integration is fixed 1 ms dt; the controller updates every 5 ms (200 Hz).
 */

const TWO_PI = 2 * Math.PI;

export interface FlywheelMotorParams {
  vMax: number; // V
  stallTorque: number; // N·m at vMax, ω = 0
  freeSpeedRps: number; // rps at vMax, τ = 0
}

export interface FlywheelPhysicsParams {
  inertia: number; // kg·m²
  viscousDrag: number; // N·m·s/rad
  staticFriction: number; // N·m
  kineticFriction: number; // N·m
  motor: FlywheelMotorParams;
  targetRps: number; // rps — commanded after the hold phase
  durationSec: number;
}

export interface FlywheelGains {
  kP: number;
  kI: number;
  kD: number;
  kS: number;
  kV: number;
}

export const FLY_MOTOR_DEFAULT: FlywheelMotorParams = {
  vMax: 12,
  stallTorque: 4, // N·m (modest — gives meaningful spin-up time)
  freeSpeedRps: 80, // ≈ 4800 RPM unloaded
};

const FLY_BASE: Omit<FlywheelPhysicsParams, "targetRps"> = {
  inertia: 0.01,
  viscousDrag: 0.001,
  staticFriction: 0.05,
  kineticFriction: 0.04,
  motor: FLY_MOTOR_DEFAULT,
  durationSec: 5,
};

export const FLY_HOLD_PHASE_SEC = 1.0;

export const DEFAULT_FLY_GAINS: FlywheelGains = {
  kP: 0,
  kI: 0,
  kD: 0,
  kS: 0,
  kV: 0,
};

export const DEFAULT_FLY_TARGET_RPM = 1800; // 30 rps

export const FLY_SLIDER_RANGES = {
  kP: { min: 0, max: 1, step: 0.005, precision: 3, unit: "V·s/rot" },
  kI: { min: 0, max: 0.5, step: 0.005, precision: 3, unit: "V/rot" },
  kD: { min: 0, max: 0.05, step: 0.001, precision: 3, unit: "V·s²/rot" },
  kS: { min: 0, max: 2, step: 0.05, precision: 2, unit: "V" },
  kV: { min: 0, max: 0.3, step: 0.005, precision: 3, unit: "V·s/rot" },
} as const;

export const FLY_TARGET_RANGE_RPM = {
  min: 0,
  max: 4500,
  step: 25,
} as const;

export type FlyRegime = "stable" | "oscillating" | "drifting";

export interface FlywheelResponseMetrics {
  regime: FlyRegime;
  /** Max absolute deviation from the time-varying setpoint, in rpm. */
  maxDeviationRpm: number;
  settlingTime: number | null;
  /** Final |error| vs the commanded target, in rpm. */
  steadyStateErrorRpm: number;
  peakVoltage: number;
}

export interface FlywheelResponse {
  t: Float64Array;
  velocityRpm: Float64Array;
  targetRpm: Float64Array;
  voltage: Float64Array;
  /** Cumulative angle (rad) so the visualization can rotate a disk. */
  angleRad: Float64Array;
  metrics: FlywheelResponseMetrics;
}

const INTEGRAL_CLAMP_V_SEC = 2;
const ERROR_DEADBAND_RPS = 0.05;
const STICK_VEL_RAD = 0.5;

export function flywheelPhysicsFor(targetRpm: number): FlywheelPhysicsParams {
  return {
    ...FLY_BASE,
    targetRps: targetRpm / 60,
  };
}

export function simulateFlywheelResponse(
  params: FlywheelPhysicsParams,
  gains: FlywheelGains,
): FlywheelResponse {
  const dt = 0.001;
  const N = Math.round(params.durationSec / dt);
  const controllerEvery = 5;

  const I = params.inertia;
  const { vMax, stallTorque, freeSpeedRps } = params.motor;
  const K_T = stallTorque / vMax;
  const K_B_RAD = vMax / (freeSpeedRps * TWO_PI);

  const t = new Float64Array(N);
  const velocityRpm = new Float64Array(N);
  const targetRpm = new Float64Array(N);
  const voltage = new Float64Array(N);
  const angleRad = new Float64Array(N);

  let omega = 0; // rad/s
  let theta = 0; // rad (cumulative for viz)
  let integral = 0;
  let prevErrorRps = 0;
  let outV = 0;
  let peakVoltage = 0;

  for (let i = 0; i < N; i++) {
    const time = i * dt;
    const setpointRps =
      time < FLY_HOLD_PHASE_SEC ? 0 : params.targetRps;

    if (i % controllerEvery === 0) {
      const dtC = dt * controllerEvery;
      const omegaRps = omega / TWO_PI;
      const errorRps = setpointRps - omegaRps;
      integral += errorRps * dtC;
      if (integral > INTEGRAL_CLAMP_V_SEC) integral = INTEGRAL_CLAMP_V_SEC;
      else if (integral < -INTEGRAL_CLAMP_V_SEC) integral = -INTEGRAL_CLAMP_V_SEC;
      const dErrorRps = (errorRps - prevErrorRps) / dtC;

      const pidV =
        gains.kP * errorRps + gains.kI * integral + gains.kD * dErrorRps;

      // Feedforward:
      // kV·setpoint  — predicts the back-EMF voltage needed to hold target ω
      // kS·sign(err) — overcomes static friction in the direction the
      //                controller is trying to push the wheel (sleeps inside
      //                a small deadband to avoid chatter on a perfect hold)
      const ksign =
        Math.abs(errorRps) > ERROR_DEADBAND_RPS ? Math.sign(errorRps) : 0;
      const ffV = gains.kS * ksign + gains.kV * setpointRps;

      outV = pidV + ffV;
      if (outV > vMax) outV = vMax;
      else if (outV < -vMax) outV = -vMax;
      prevErrorRps = errorRps;

      if (Math.abs(outV) > peakVoltage) peakVoltage = Math.abs(outV);
    }

    const tauMotor = K_T * (outV - K_B_RAD * omega);
    const tauVisc = -params.viscousDrag * omega;
    const tauNonFric = tauMotor + tauVisc;

    let tauFric: number;
    if (Math.abs(omega) > STICK_VEL_RAD) {
      tauFric = -params.kineticFriction * Math.sign(omega);
    } else if (Math.abs(tauNonFric) <= params.staticFriction) {
      tauFric = -tauNonFric;
      omega = 0;
    } else {
      tauFric = -params.staticFriction * Math.sign(tauNonFric);
    }

    const alpha = (tauNonFric + tauFric) / I;
    omega += alpha * dt;
    theta += omega * dt;

    t[i] = time;
    velocityRpm[i] = (omega / TWO_PI) * 60;
    targetRpm[i] = setpointRps * 60;
    voltage[i] = outV;
    angleRad[i] = theta;
  }

  // ── Metrics ────────────────────────────────────────────────────────────
  let maxDeviationRpm = 0;
  for (let i = 0; i < N; i++) {
    const dev = Math.abs(velocityRpm[i] - targetRpm[i]);
    if (dev > maxDeviationRpm) maxDeviationRpm = dev;
  }

  // ±2 % of the commanded target rpm, with a minimum 30 rpm band.
  const SETTLE_BAND_RPM = Math.max(30, params.targetRps * 60 * 0.02);
  const stepStartIdx = Math.round(FLY_HOLD_PHASE_SEC / dt);
  let settlingTime: number | null = null;
  let settled = false;
  for (let i = stepStartIdx; i < N; i++) {
    if (Math.abs(velocityRpm[i] - targetRpm[i]) <= SETTLE_BAND_RPM && !settled) {
      settled = true;
      settlingTime = t[i];
    } else if (
      Math.abs(velocityRpm[i] - targetRpm[i]) > SETTLE_BAND_RPM &&
      settled
    ) {
      settled = false;
      settlingTime = null;
    }
  }

  const finalRpm = velocityRpm[N - 1] ?? 0;
  const steadyStateErrorRpm = Math.abs(params.targetRps * 60 - finalRpm);

  let regime: FlyRegime;
  if (steadyStateErrorRpm > Math.max(50, params.targetRps * 60 * 0.03))
    regime = "drifting";
  else if (maxDeviationRpm > Math.max(50, params.targetRps * 60 * 0.05))
    regime = "oscillating";
  else regime = "stable";

  return {
    t,
    velocityRpm,
    targetRpm,
    voltage,
    angleRad,
    metrics: {
      regime,
      maxDeviationRpm,
      settlingTime,
      steadyStateErrorRpm,
      peakVoltage,
    },
  };
}
