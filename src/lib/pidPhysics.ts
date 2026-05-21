/**
 * 1-DOF rotational arm physics for the PID + Feedforward Playground.
 *
 * Angle convention matches WPILib's `GravityTypeValue.Arm_Cosine`
 * (and Phoenix 6's ArmFeedforward):
 *   theta = 0      → arm sticking STRAIGHT OUT (horizontal)
 *   theta = +π/2   → arm pointing UP
 *   theta = -π/2   → arm pointing DOWN
 * Gravity torque on the arm is proportional to `cos(theta)`: maximum at
 * horizontal, zero when vertical. The gravity feedforward term is
 * `kG · cos(theta)` — same shape, equal and opposite.
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
 *      kG : V                        (gravity comp; multiplied by cos(theta))
 *
 * Internally we still integrate in radians (cleaner cos/sin), but every gain
 * the user touches is in the same units they'd type into Phoenix Tuner.
 *
 * Motor model is back-EMF aware:
 *   τ = K_T · (V − K_B · ω)
 * where K_T = τ_stall / V_max and K_B = V_max / ω_free.
 *
 * One scenario: hold-at-target. The arm starts at `targetRad` and the
 * controller has to keep it there against gravity. With every gain at zero,
 * the arm falls under gravity (visible in the plot). Raising kG cancels the
 * gravity term; adding kP and kD then makes the loop reject disturbances.
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
  /** Viscous friction (∝ ω). */
  friction: number; // N·m·s/rad
  /** Coulomb static friction the system has to break before moving. */
  staticFriction: number; // N·m
  /** Coulomb kinetic friction while moving. */
  kineticFriction: number; // N·m
  motor: MotorParams;
  initialAngle: number; // rad
  target: number; // rad — final commanded position
  durationSec: number;
  profileMaxVel: number; // rotations/sec — trapezoidal motion-profile cap
  profileMaxAccel: number; // rotations/sec²
  /** Soft mechanical limits. The arm can't rotate past these. */
  limitRad: number;
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
  friction: 0.3,
  // Static friction creates a small holding "deadband" — kG inside this band
  // doesn't need to be exact, but kS becomes the gain that snaps the last bit
  // of error closed.
  staticFriction: 0.5, // N·m
  kineticFriction: 0.4, // N·m
  motor: MOTOR_DEFAULT,
  durationSec: 3,
  profileMaxVel: 2, // rotations/sec
  profileMaxAccel: 15, // rotations/sec²
  limitRad: (135 * Math.PI) / 180, // arm pegs ±135° from horizontal
};

/**
 * Build the PhysicsParams for the hold scenario: arm starts at the target
 * angle and the controller has to keep it there against gravity + friction.
 *
 *   target =   0°  →  arm horizontal — max gravity torque
 *   target = +90°  →  arm straight up — no gravity torque
 *   target = -90°  →  arm straight down — no gravity torque
 */
export function physicsFor(targetRad: number): PhysicsParams {
  return {
    ...PHYSICS_BASE,
    initialAngle: targetRad,
    target: targetRad,
    durationSec: 2,
  };
}

export const DEFAULT_TARGET_DEG = 0;

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
  max: 90,
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
const ERROR_DEADBAND_ROT = 0.002; // ~0.72° — kS sleeps inside this band
const STICK_VEL_RAD = 0.02; // below this we're treated as stuck

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

      // ── Feedforward ──────────────────────────────────────────────
      // kG: arm-cosine gravity feedforward driven by the SETPOINT angle, not
      //     the measured one. That keeps kG a true predictive term — at the
      //     commanded position it provides the constant voltage that should
      //     balance gravity. (Same magnitude at +θ and −θ; zero at vertical.)
      // kV: velocity feedforward on the profile velocity (zero during a pure
      //     hold, but kept so motion-profiled scenarios reuse this block).
      // kS: static-friction breakaway in the direction needed to reduce the
      //     current position error. Sleeps inside a small deadband so we don't
      //     chatter on top of a perfect hold.
      const ksign =
        Math.abs(errorRot) > ERROR_DEADBAND_ROT ? Math.sign(errorRot) : 0;
      const ffV =
        gains.kS * ksign +
        gains.kV * sp.omegaRotPs +
        gains.kG * Math.cos(params.target);

      voltage = pidV + ffV;
      if (voltage > vMax) voltage = vMax;
      else if (voltage < -vMax) voltage = -vMax;
      prevErrorRot = errorRot;

      if (Math.abs(voltage) > peakVoltage) peakVoltage = Math.abs(voltage);
    }

    const tauMotor = K_T * (voltage - K_B * om);
    // Gravity torque about the pivot with theta = 0 horizontal:
    //   τ_g = -m·g·L·cos(theta) — peaks at horizontal, zero when vertical.
    const tauGravity =
      -params.mass * params.gravity * params.length * Math.cos(th);
    const tauNonFric = tauMotor + tauGravity;

    // Coulomb stick-slip friction:
    //   moving  → kinetic friction opposes ω, plus viscous drag
    //   nearly stopped → static friction matches the net applied torque
    //                    (up to μ_static); if everything else exceeds the
    //                    static limit, friction caps at ±μ_static and the
    //                    arm breaks free.
    let tauFriction: number;
    if (Math.abs(om) > STICK_VEL_RAD) {
      tauFriction =
        -params.friction * om - params.kineticFriction * Math.sign(om);
    } else if (Math.abs(tauNonFric) <= params.staticFriction) {
      // Stuck — static friction perfectly cancels the rest.
      tauFriction = -tauNonFric;
      om = 0;
    } else {
      tauFriction = -params.staticFriction * Math.sign(tauNonFric);
    }

    const alpha = (tauNonFric + tauFriction) / I;
    om += alpha * dt;
    th += om * dt;

    // Soft mechanical limits — arm physically can't rotate past these.
    if (th > params.limitRad) {
      th = params.limitRad;
      if (om > 0) om = 0;
    } else if (th < -params.limitRad) {
      th = -params.limitRad;
      if (om < 0) om = 0;
    }

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
