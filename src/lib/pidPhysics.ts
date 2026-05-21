/**
 * 1-DOF rotational arm physics for the PID + Feedforward Playground.
 *
 * Coordinate convention: theta = 0 → arm hanging straight down (gravity-aligned),
 * theta = +π/2 → arm horizontal. Gravity torque = -m*g*L*sin(theta), peaking at
 * the horizontal target.
 *
 * The controller couples a trapezoidal motion profile (the "setpoint generator")
 * with PID feedback tracking the profile AND a separate feedforward block that
 * predicts the torque needed from the profile's velocity, sign(velocity), and
 * the arm's current angle vs gravity. This matches how WPILib's
 * ProfiledPIDController + ArmFeedforward is typically wired on FRC robots.
 *
 * Step response is recomputed synchronously on every gain change. Integration
 * runs at 1 ms dt; PID + FF update every 5 ms (200 Hz), matching the loop rate
 * of a typical TalonFX closed-loop on the robot side.
 */

export interface PhysicsParams {
  mass: number; // kg
  length: number; // m (point-mass approximation)
  gravity: number; // m/s²
  friction: number; // N·m·s/rad (viscous)
  maxTorque: number; // N·m clamp on actuator output
  target: number; // rad — final step target
  initialAngle: number; // rad
  durationSec: number;
  profileMaxVel: number; // rad/s
  profileMaxAccel: number; // rad/s²
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

export const DEFAULT_PHYSICS: PhysicsParams = {
  mass: 2,
  length: 0.4,
  gravity: 9.81,
  friction: 0.5,
  // Picked so kP changes are visible: the profile demands more accel than the
  // PID-only loop can comfortably deliver, so kP increases (along with kD/kI)
  // visibly change overshoot, settle time, and steady-state error.
  maxTorque: 60,
  target: Math.PI / 2,
  initialAngle: 0,
  durationSec: 3,
  profileMaxVel: 10,
  profileMaxAccel: 80,
};

export const DEFAULT_GAINS: ControllerGains = {
  kP: 50,
  kI: 0,
  kD: 2,
  kS: 0,
  kV: 0,
  kG: 0,
};

export const SLIDER_RANGES = {
  kP: { min: 0, max: 200, step: 1, precision: 0 },
  kI: { min: 0, max: 30, step: 0.1, precision: 1 },
  kD: { min: 0, max: 20, step: 0.1, precision: 1 },
  kS: { min: 0, max: 5, step: 0.05, precision: 2 },
  kV: { min: 0, max: 3, step: 0.05, precision: 2 },
  kG: { min: 0, max: 15, step: 0.1, precision: 1 },
} as const;

export type Regime = "underdamped" | "critically damped" | "overdamped";

export interface StepResponseMetrics {
  regime: Regime;
  overshootPct: number;
  riseTime: number | null;
  settlingTime: number | null;
  steadyStateErrorDeg: number;
}

export interface StepResponse {
  t: Float64Array;
  theta: Float64Array;
  target: Float64Array;
  setpoint: Float64Array;
  metrics: StepResponseMetrics;
}

const INTEGRAL_CLAMP = 12; // N·m·s — anti-windup
const STATIC_DEADBAND = 0.01; // rad/s — below this, kS sign is undefined

interface ProfileSample {
  theta: number;
  omega: number;
}

function trapezoidalProfile(
  t: number,
  start: number,
  target: number,
  vMax: number,
  aMax: number,
): ProfileSample {
  const span = target - start;
  const dir = Math.sign(span) || 1;
  const dist = Math.abs(span);
  if (dist === 0) return { theta: target, omega: 0 };

  const tAccel = vMax / aMax;
  const distAccel = 0.5 * aMax * tAccel * tAccel;

  if (2 * distAccel >= dist) {
    // Triangular — never reach vMax
    const peakV = Math.sqrt(dist * aMax);
    const tPeak = peakV / aMax;
    if (t <= 0) return { theta: start, omega: 0 };
    if (t < tPeak) {
      const omega = aMax * t;
      const theta = start + dir * 0.5 * aMax * t * t;
      return { theta, omega: dir * omega };
    }
    const tTotal = 2 * tPeak;
    if (t < tTotal) {
      const dt = t - tPeak;
      const omega = peakV - aMax * dt;
      const theta =
        start + dir * (0.5 * dist + peakV * dt - 0.5 * aMax * dt * dt);
      return { theta, omega: dir * Math.max(0, omega) };
    }
    return { theta: target, omega: 0 };
  }

  // Trapezoidal
  const tCruise = (dist - 2 * distAccel) / vMax;
  if (t <= 0) return { theta: start, omega: 0 };
  if (t < tAccel) {
    const omega = aMax * t;
    const theta = start + dir * 0.5 * aMax * t * t;
    return { theta, omega: dir * omega };
  }
  if (t < tAccel + tCruise) {
    const dt = t - tAccel;
    const theta = start + dir * (distAccel + vMax * dt);
    return { theta, omega: dir * vMax };
  }
  const tTotal = 2 * tAccel + tCruise;
  if (t < tTotal) {
    const dt = t - (tAccel + tCruise);
    const omega = vMax - aMax * dt;
    const theta =
      start +
      dir *
        (distAccel + vMax * tCruise + vMax * dt - 0.5 * aMax * dt * dt);
    return { theta, omega: dir * Math.max(0, omega) };
  }
  return { theta: target, omega: 0 };
}

export function simulateStepResponse(
  params: PhysicsParams,
  gains: ControllerGains,
): StepResponse {
  const dt = 0.001;
  const N = Math.round(params.durationSec / dt);
  const controllerEvery = 5; // 200 Hz on a 1 kHz integrator

  const I = params.mass * params.length * params.length;
  const t = new Float64Array(N);
  const theta = new Float64Array(N);
  const targetArr = new Float64Array(N);
  const setpointArr = new Float64Array(N);

  let th = params.initialAngle;
  let om = 0;
  let integral = 0;
  let trackingErrorPrev = 0;
  let totalOut = 0;

  const targetDeg = (params.target * 180) / Math.PI;

  for (let i = 0; i < N; i++) {
    const time = i * dt;

    // Motion profile setpoint (controller's tracking target)
    const sp = trapezoidalProfile(
      time,
      params.initialAngle,
      params.target,
      params.profileMaxVel,
      params.profileMaxAccel,
    );

    if (i % controllerEvery === 0) {
      const dtC = dt * controllerEvery;
      const trackingError = sp.theta - th;
      integral += trackingError * dtC;
      if (integral > INTEGRAL_CLAMP) integral = INTEGRAL_CLAMP;
      else if (integral < -INTEGRAL_CLAMP) integral = -INTEGRAL_CLAMP;
      const derivative = (trackingError - trackingErrorPrev) / dtC;

      const pid =
        gains.kP * trackingError +
        gains.kI * integral +
        gains.kD * derivative;

      // Feedforward, WPILib ArmFeedforward shape:
      //   kS*sign(ω_sp) + kV*ω_sp + kG*cos(angle_from_horizontal)
      // In our convention horizontal = π/2, so cos(theta - π/2) = sin(theta).
      const ksign = Math.abs(sp.omega) > STATIC_DEADBAND ? Math.sign(sp.omega) : 0;
      const ff =
        gains.kS * ksign +
        gains.kV * sp.omega +
        gains.kG * Math.sin(th);

      totalOut = pid + ff;
      if (totalOut > params.maxTorque) totalOut = params.maxTorque;
      else if (totalOut < -params.maxTorque) totalOut = -params.maxTorque;
      trackingErrorPrev = trackingError;
    }

    const tauGravity =
      -params.mass * params.gravity * params.length * Math.sin(th);
    const tauFriction = -params.friction * om;
    const alpha = (totalOut + tauGravity + tauFriction) / I;

    // Semi-implicit Euler
    om += alpha * dt;
    th += om * dt;

    t[i] = time;
    theta[i] = (th * 180) / Math.PI;
    targetArr[i] = targetDeg;
    setpointArr[i] = (sp.theta * 180) / Math.PI;
  }

  // ── Metrics ────────────────────────────────────────────────────────────
  const initialDeg = (params.initialAngle * 180) / Math.PI;
  const span = targetDeg - initialDeg;
  const absSpan = Math.abs(span) || 1;

  let peakSigned = -Infinity;
  for (let i = 0; i < N; i++) {
    const advance = (theta[i] - initialDeg) * Math.sign(span);
    if (advance > peakSigned) peakSigned = advance;
  }
  const overshootRaw = peakSigned - absSpan;
  const overshootPct = Math.max(0, (overshootRaw / absSpan) * 100);

  // Rise time: 10 → 90 % of the commanded step
  let t10 = -1;
  let t90 = -1;
  for (let i = 0; i < N; i++) {
    const advance = (theta[i] - initialDeg) * Math.sign(span);
    if (t10 < 0 && advance >= 0.1 * absSpan) {
      t10 = t[i];
    }
    if (t10 >= 0 && t90 < 0 && advance >= 0.9 * absSpan) {
      t90 = t[i];
      break;
    }
  }
  const riseTime = t10 >= 0 && t90 >= 0 ? t90 - t10 : null;

  // Settling time: last moment we're outside ±2 % of the step
  const band = 0.02 * absSpan;
  let settlingTime: number | null = null;
  for (let i = N - 1; i >= 0; i--) {
    if (Math.abs(theta[i] - targetDeg) > band) {
      settlingTime = t[i];
      break;
    }
  }
  if (settlingTime === null) settlingTime = 0;

  const finalTheta = theta[N - 1] ?? targetDeg;
  const steadyStateErrorDeg = Math.abs(targetDeg - finalTheta);

  let regime: Regime;
  if (overshootPct > 2) regime = "underdamped";
  else if (overshootPct > 0.1) regime = "critically damped";
  else regime = "overdamped";

  return {
    t,
    theta,
    target: targetArr,
    setpoint: setpointArr,
    metrics: {
      regime,
      overshootPct,
      riseTime,
      settlingTime,
      steadyStateErrorDeg,
    },
  };
}
