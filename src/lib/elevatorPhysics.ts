/**
 * Linear elevator physics for the Elevator Playground.
 *
 * Models a carriage on a winch: Kraken X60 → gearbox → spool → cable →
 * carriage. Units are SI on the mechanism side (meters, m/s, volts) so the
 * gains map to a Phoenix 6 Slot0Configs with `SensorToMechanismRatio` set to
 * convert motor rotations into meters of travel.
 *
 *  Position: meters of carriage travel above the ground
 *  Velocity: m/s
 *  Output:   volts (clamped to ±12 V)
 *  Gains:
 *    kP : V / m        (volts per meter of position error)
 *    kI : V / (m·s)
 *    kD : V·s / m
 *    kS : V            (static-friction breakaway)
 *    kV : V·s / m      (back-EMF compensation per m/s of setpoint velocity)
 *    kG : V            (gravity comp — constant, since gravity on the
 *                      carriage doesn't depend on position)
 *
 * Motor on the mechanism side becomes a *force* model:
 *   F_cable = K_F · (V − K_BE · v)
 *   K_F  = K_T_motor · R / r_spool         (N per volt at stall)
 *   K_BE = K_B_motor · R / r_spool         (V·s/m of back-EMF)
 *
 * Same hold-then-step setpoint as the arm: arm sits at 0 m for 1 s, then
 * the setpoint steps to the user-selected target.
 */

const TWO_PI = 2 * Math.PI;

export interface ElevatorMotorParams {
  vMax: number;
  stallTorque: number; // N·m (motor side)
  freeSpeedRad: number; // rad/s (motor side)
  gearRatio: number;
}

export interface ElevatorPhysicsParams {
  carriageMass: number; // kg
  spoolRadius: number; // m
  gravity: number; // m/s²
  /** Viscous drag (∝ v). */
  viscousDrag: number; // N·s/m
  /** Static (Coulomb) friction the carriage breaks before it moves. */
  staticFriction: number; // N
  /** Kinetic Coulomb friction while moving. */
  kineticFriction: number; // N
  motor: ElevatorMotorParams;
  targetMeters: number;
  durationSec: number;
  minMeters: number;
  maxMeters: number;
}

export interface ElevatorGains {
  kP: number;
  kI: number;
  kD: number;
  kS: number;
  kV: number;
  kG: number;
}

export const ELEV_MOTOR_DEFAULT: ElevatorMotorParams = {
  vMax: 12,
  // Kraken X60 + 15:1 reduction.
  stallTorque: 7.09,
  freeSpeedRad: (6000 * TWO_PI) / 60,
  gearRatio: 15,
};

const ELEV_BASE: Omit<ElevatorPhysicsParams, "targetMeters"> = {
  carriageMass: 8,
  spoolRadius: 0.025, // 2-inch-diameter spool (1" radius)
  gravity: 9.81,
  viscousDrag: 5,
  staticFriction: 10,
  kineticFriction: 8,
  motor: ELEV_MOTOR_DEFAULT,
  durationSec: 5,
  minMeters: 0,
  maxMeters: 1.5,
};

export const ELEV_HOLD_PHASE_SEC = 1.0;

export const DEFAULT_ELEV_GAINS: ElevatorGains = {
  kP: 0,
  kI: 0,
  kD: 0,
  kS: 0,
  kV: 0,
  kG: 0,
};

export const DEFAULT_ELEV_TARGET_M = 1.0;

export const ELEV_SLIDER_RANGES = {
  kP: { min: 0, max: 30, step: 0.5, precision: 1, unit: "V/m" },
  kI: { min: 0, max: 20, step: 0.2, precision: 1, unit: "V/(m·s)" },
  kD: { min: 0, max: 3, step: 0.025, precision: 3, unit: "V·s/m" },
  kS: { min: 0, max: 2, step: 0.02, precision: 2, unit: "V" },
  kV: { min: 0, max: 20, step: 0.1, precision: 1, unit: "V·s/m" },
  kG: { min: 0, max: 1, step: 0.01, precision: 2, unit: "V" },
} as const;

export const ELEV_TARGET_RANGE_M = {
  min: 0,
  max: 1.5,
  step: 0.01,
} as const;

export type ElevRegime = "stable" | "oscillating" | "drifting";

export interface ElevatorResponseMetrics {
  regime: ElevRegime;
  maxDeviationM: number;
  settlingTime: number | null;
  steadyStateErrorM: number;
  peakVoltage: number;
}

export interface ElevatorResponse {
  t: Float64Array;
  positionM: Float64Array;
  targetM: Float64Array;
  voltage: Float64Array;
  metrics: ElevatorResponseMetrics;
}

const INTEGRAL_CLAMP_V_SEC = 1;
const ERROR_DEADBAND_M = 0.005;
const STICK_VEL_MPS = 0.005;

export function elevatorPhysicsFor(targetMeters: number): ElevatorPhysicsParams {
  return { ...ELEV_BASE, targetMeters };
}

export function simulateElevatorResponse(
  params: ElevatorPhysicsParams,
  gains: ElevatorGains,
): ElevatorResponse {
  const dt = 0.001;
  const N = Math.round(params.durationSec / dt);
  const controllerEvery = 5;

  const m = params.carriageMass;
  const { vMax, stallTorque, freeSpeedRad, gearRatio } = params.motor;
  const K_T_motor = stallTorque / vMax;
  const K_B_motor = vMax / freeSpeedRad;
  const K_F = (K_T_motor * gearRatio) / params.spoolRadius;
  const K_BE = (K_B_motor * gearRatio) / params.spoolRadius;

  const t = new Float64Array(N);
  const positionM = new Float64Array(N);
  const targetM = new Float64Array(N);
  const voltage = new Float64Array(N);

  let pos = 0;
  let vel = 0;
  let integral = 0;
  let prevErrorM = 0;
  let outV = 0;
  let peakVoltage = 0;

  for (let i = 0; i < N; i++) {
    const time = i * dt;
    const setpointM = time < ELEV_HOLD_PHASE_SEC ? 0 : params.targetMeters;

    if (i % controllerEvery === 0) {
      const dtC = dt * controllerEvery;
      const errorM = setpointM - pos;
      integral += errorM * dtC;
      if (integral > INTEGRAL_CLAMP_V_SEC) integral = INTEGRAL_CLAMP_V_SEC;
      else if (integral < -INTEGRAL_CLAMP_V_SEC) integral = -INTEGRAL_CLAMP_V_SEC;
      const dErrorM = (errorM - prevErrorM) / dtC;

      const pidV =
        gains.kP * errorM + gains.kI * integral + gains.kD * dErrorM;

      // Feedforward:
      // kG  — constant gravity comp (no cos term: gravity always pulls down)
      // kV  — back-EMF prediction for the commanded velocity (zero during
      //       a pure step, kept for motion-profiled scenarios)
      // kS  — static-friction breakaway in the direction of error
      const ksign =
        Math.abs(errorM) > ERROR_DEADBAND_M ? Math.sign(errorM) : 0;
      const ffV = gains.kS * ksign + gains.kV * 0 + gains.kG;

      outV = pidV + ffV;
      if (outV > vMax) outV = vMax;
      else if (outV < -vMax) outV = -vMax;
      prevErrorM = errorM;

      if (Math.abs(outV) > peakVoltage) peakVoltage = Math.abs(outV);
    }

    const F_motor = K_F * (outV - K_BE * vel);
    const F_gravity = -m * params.gravity;
    const F_viscous = -params.viscousDrag * vel;
    const F_nonFric = F_motor + F_gravity + F_viscous;

    let F_fric: number;
    if (Math.abs(vel) > STICK_VEL_MPS) {
      F_fric = -params.kineticFriction * Math.sign(vel);
    } else if (Math.abs(F_nonFric) <= params.staticFriction) {
      F_fric = -F_nonFric;
      vel = 0;
    } else {
      F_fric = -params.staticFriction * Math.sign(F_nonFric);
    }

    const accel = (F_nonFric + F_fric) / m;
    vel += accel * dt;
    pos += vel * dt;

    if (pos > params.maxMeters) {
      pos = params.maxMeters;
      if (vel > 0) vel = 0;
    } else if (pos < params.minMeters) {
      pos = params.minMeters;
      if (vel < 0) vel = 0;
    }

    t[i] = time;
    positionM[i] = pos;
    targetM[i] = setpointM;
    voltage[i] = outV;
  }

  // ── Metrics ────────────────────────────────────────────────────────────
  let maxDeviationM = 0;
  for (let i = 0; i < N; i++) {
    const dev = Math.abs(positionM[i] - targetM[i]);
    if (dev > maxDeviationM) maxDeviationM = dev;
  }

  // ±2 % of target (with a 1 cm floor)
  const SETTLE_BAND_M = Math.max(0.01, params.targetMeters * 0.02);
  const stepStartIdx = Math.round(ELEV_HOLD_PHASE_SEC / dt);
  let settlingTime: number | null = null;
  let settled = false;
  for (let i = stepStartIdx; i < N; i++) {
    if (Math.abs(positionM[i] - params.targetMeters) <= SETTLE_BAND_M && !settled) {
      settled = true;
      settlingTime = t[i];
    } else if (
      Math.abs(positionM[i] - params.targetMeters) > SETTLE_BAND_M &&
      settled
    ) {
      settled = false;
      settlingTime = null;
    }
  }

  const finalM = positionM[N - 1] ?? 0;
  const steadyStateErrorM = Math.abs(params.targetMeters - finalM);

  let regime: ElevRegime;
  if (steadyStateErrorM > Math.max(0.02, params.targetMeters * 0.03))
    regime = "drifting";
  else if (maxDeviationM > Math.max(0.05, params.targetMeters * 0.05))
    regime = "oscillating";
  else regime = "stable";

  return {
    t,
    positionM,
    targetM,
    voltage,
    metrics: {
      regime,
      maxDeviationM,
      settlingTime,
      steadyStateErrorM,
      peakVoltage,
    },
  };
}
