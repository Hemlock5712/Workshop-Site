// Physics simulation for the WaypointPlanner
// Ported from the original JavaScript implementation

import {
  RobotConfig,
  Speeds,
  SimulationPose,
  Waypoint,
  LinkedWaypointData,
  Obstacle,
} from "./types";
import { checkCollision } from "./collision";
import { degToRad, normalizeAngle } from "./transforms";

/**
 * Motor physics model (matches Motor.java)
 */
export class Motor {
  constructor(private config: RobotConfig) {}

  /**
   * Torque constant Kt = stallTorque / stallCurrent
   */
  get kt(): number {
    return this.config.motorStallTorque / this.config.motorStallCurrent;
  }

  /**
   * Linear torque-speed relationship (matches Motor.getTorqueAtRpm)
   */
  getTorqueAtRpm(rpm: number, currentLimitAmps: number = Infinity): number {
    rpm = Math.abs(rpm);
    if (rpm >= this.config.motorFreeSpeedRpm) return 0.0;

    const torqueFromCurve =
      this.config.motorStallTorque *
      (1.0 - rpm / this.config.motorFreeSpeedRpm);
    const torqueFromCurrentLimit = this.kt * currentLimitAmps;
    return Math.min(torqueFromCurve, torqueFromCurrentLimit);
  }

  /**
   * Max acceleration at given wheel speed (matches Motor.getMaxAcceleration)
   */
  getMaxAcceleration(wheelSpeedMps: number): number {
    // Convert wheel speed to motor RPM
    const wheelRadPerSec = wheelSpeedMps / this.config.wheelRadius;
    const motorRadPerSec = wheelRadPerSec * this.config.gearRatio;
    const motorRpm = (motorRadPerSec * 60.0) / (2.0 * Math.PI);

    // Look up torque at this speed WITH current limit
    const motorTorque = this.getTorqueAtRpm(
      motorRpm,
      this.config.statorCurrentLimit
    );

    // Calculate force: F = (T * gearRatio) / wheelRadius
    const wheelTorque = motorTorque * this.config.gearRatio;
    const forcePerWheel = wheelTorque / this.config.wheelRadius;
    const totalForce = forcePerWheel * this.config.numDriveMotors;

    // Newton's second law: a = F / m
    return totalForce / this.config.robotMass;
  }
}

/**
 * Physics calculations for path planning
 */
export class Physics {
  private motor: Motor;
  private maxFrictionAccel: number;

  constructor(private config: RobotConfig) {
    this.motor = new Motor(config);
    this.maxFrictionAccel = config.maxFriction * 9.81;
  }

  /**
   * Calculate target angular velocity (matches DriveToPointUtils.calculateTargetOmega)
   */
  calculateTargetOmega(
    angleError: number,
    distance: number,
    currentSpeed: number,
    currentOmega: number,
    reactionBuffer: number = 0.03
  ): number {
    const STOPPING_OMEGA_FACTOR =
      (2.0 * this.maxFrictionAccel) / this.config.driveBaseRadius;
    const HARDWARE_MAX_OMEGA =
      this.config.maxVelocity / this.config.driveBaseRadius;

    const absAngle = Math.abs(angleError);
    const bufferedAngle = Math.max(
      0,
      absAngle - Math.abs(currentOmega) * reactionBuffer
    );
    const maxStoppingOmega = Math.sqrt(STOPPING_OMEGA_FACTOR * bufferedAngle);

    const effectiveDistance = Math.max(
      0,
      distance - currentSpeed * reactionBuffer
    );
    const brakingTime = Math.sqrt(
      (2.0 * effectiveDistance) / this.maxFrictionAccel
    );
    const cruiseTime =
      currentSpeed > 0 ? effectiveDistance / currentSpeed : brakingTime;
    const driveTime = Math.max(brakingTime, cruiseTime);

    const timeBasedOmega = driveTime > 0 ? (2.0 * absAngle) / driveTime : 0;

    const target = Math.min(
      maxStoppingOmega,
      Math.min(timeBasedOmega, HARDWARE_MAX_OMEGA)
    );
    return Math.sign(angleError) * target;
  }

  /**
   * Calculate braking target speed (matches DriveToPointUtils.calculateBrakingTargetSpeed)
   */
  calculateBrakingTargetSpeed(
    distance: number,
    currentSpeed: number,
    reactionBuffer: number,
    targetOmega: number,
    angleError: number,
    targetEndSpeed: number
  ): number {
    const MAX_FRICTION_ACCEL_SQ = this.maxFrictionAccel * this.maxFrictionAccel;
    const MAX_ANGULAR_DECEL =
      this.maxFrictionAccel / this.config.driveBaseRadius;
    const ANGLE_EPSILON = 1e-9;

    const absAngleError = Math.abs(angleError);

    // Angular deceleration needed (capped at physical max)
    const angularDecel =
      absAngleError > ANGLE_EPSILON
        ? Math.min(
            (targetOmega * targetOmega) / (2.0 * absAngleError),
            MAX_ANGULAR_DECEL
          )
        : 0;

    // Friction budget used by angular deceleration
    const angularAccelContribution = angularDecel * this.config.driveBaseRadius;
    const availableLinearAccel = Math.sqrt(
      Math.max(
        0,
        MAX_FRICTION_ACCEL_SQ -
          angularAccelContribution * angularAccelContribution
      )
    );

    // Account for reaction time
    const bufferedDistance = Math.max(
      0,
      distance - currentSpeed * reactionBuffer
    );

    // Target speed using kinematic equation
    const targetEndSpeedSq = targetEndSpeed * targetEndSpeed;
    const bufferedTargetSpeed = Math.min(
      Math.sqrt(
        targetEndSpeedSq + 2.0 * availableLinearAccel * bufferedDistance
      ),
      this.config.maxVelocity
    );

    // Conservative vs aggressive logic (matches Java)
    if (bufferedTargetSpeed < currentSpeed) {
      // Decelerating - use conservative buffered value
      return bufferedTargetSpeed;
    } else {
      // Accelerating - use full distance
      return Math.min(
        Math.sqrt(targetEndSpeedSq + 2.0 * availableLinearAccel * distance),
        this.config.maxVelocity
      );
    }
  }

  /**
   * Integrate velocities with motor and friction limits (matches AccelerationLimiter.integrateVelocity)
   */
  integrate(currentSpeeds: Speeds, targetSpeeds: Speeds, dt: number): Speeds {
    // Calculate desired acceleration
    let accelX = (targetSpeeds.vx - currentSpeeds.vx) / dt;
    let accelY = (targetSpeeds.vy - currentSpeeds.vy) / dt;
    let accelOmega = (targetSpeeds.omega - currentSpeeds.omega) / dt;

    // Step 1: Apply motor torque limit (only for acceleration, not braking)
    let limitedAccelX = accelX;
    let limitedAccelY = accelY;
    let limitedAccelOmega = accelOmega;

    // Check if braking (acceleration opposes velocity)
    const linearBraking =
      accelX * currentSpeeds.vx + accelY * currentSpeeds.vy < 0;
    const angularBraking = accelOmega * currentSpeeds.omega < 0;

    // Motor limit only applies when accelerating
    if (!(linearBraking && angularBraking)) {
      const linearAccelMag = Math.hypot(accelX, accelY);
      const linearContrib = linearBraking ? 0 : linearAccelMag;
      const angularContrib = angularBraking
        ? 0
        : Math.abs(accelOmega) * this.config.driveBaseRadius;
      const combinedAccel = Math.hypot(linearContrib, angularContrib);

      // Estimate worst-case module speed for torque lookup
      const linearVelMag = Math.hypot(currentSpeeds.vx, currentSpeeds.vy);
      const moduleSpeed =
        linearVelMag +
        Math.abs(currentSpeeds.omega) * this.config.driveBaseRadius;
      const maxMotorAccel = this.motor.getMaxAcceleration(moduleSpeed);

      // Scale if exceeds motor limit
      if (combinedAccel > maxMotorAccel && combinedAccel > 0) {
        const scale = maxMotorAccel / combinedAccel;
        const linearScale = linearBraking ? 1.0 : scale;
        const angularScale = angularBraking ? 1.0 : scale;
        limitedAccelX = accelX * linearScale;
        limitedAccelY = accelY * linearScale;
        limitedAccelOmega = accelOmega * angularScale;
      }
    }

    // Step 2: Apply friction limit
    const linearMag = Math.hypot(limitedAccelX, limitedAccelY);
    const angularContribution =
      Math.abs(limitedAccelOmega) * this.config.driveBaseRadius;
    const combinedFrictionAccel = Math.hypot(linearMag, angularContribution);

    if (combinedFrictionAccel > this.maxFrictionAccel) {
      const scale = this.maxFrictionAccel / combinedFrictionAccel;
      limitedAccelX *= scale;
      limitedAccelY *= scale;
      limitedAccelOmega *= scale;
    }

    // Integrate to get next velocity
    return {
      vx: currentSpeeds.vx + limitedAccelX * dt,
      vy: currentSpeeds.vy + limitedAccelY * dt,
      omega: currentSpeeds.omega + limitedAccelOmega * dt,
    };
  }

  /**
   * Normalize speeds to not exceed max module speed
   */
  normalizeSpeeds(speeds: Speeds): Speeds {
    const translationSpeed = Math.hypot(speeds.vx, speeds.vy);
    const maxModuleSpeed =
      translationSpeed + Math.abs(speeds.omega) * this.config.driveBaseRadius;

    if (maxModuleSpeed > this.config.maxVelocity) {
      const scale = this.config.maxVelocity / maxModuleSpeed;
      return {
        vx: speeds.vx * scale,
        vy: speeds.vy * scale,
        omega: speeds.omega * scale,
      };
    }
    return speeds;
  }
}

/**
 * Resolve waypoint data (handles linked waypoints)
 */
export function resolveWaypointData(
  waypoint: Waypoint,
  linkedWaypoints: Record<string, LinkedWaypointData>
): { x: number; y: number; rot: number } {
  if (waypoint.isLinked && linkedWaypoints[waypoint.name]) {
    return linkedWaypoints[waypoint.name];
  }
  return { x: waypoint.x, y: waypoint.y, rot: waypoint.rot };
}

export interface SimulationResult {
  path: SimulationPose[];
  collisionDetected: boolean;
  collisionPoint: SimulationPose | null;
  totalDuration: number;
  pathLength: number;
}

/**
 * Run the full path simulation
 */
export function runSimulation(
  waypoints: Waypoint[],
  linkedWaypoints: Record<string, LinkedWaypointData>,
  obstacles: Obstacle[],
  config: RobotConfig
): SimulationResult {
  if (waypoints.length < 2) {
    return {
      path: [],
      collisionDetected: false,
      collisionPoint: null,
      totalDuration: 0,
      pathLength: 0,
    };
  }

  const physics = new Physics(config);

  // Convert waypoints to poses (degrees to radians)
  const poses = waypoints.map((wp) => {
    const data = resolveWaypointData(wp, linkedWaypoints);
    return { x: data.x, y: data.y, rot: degToRad(data.rot) };
  });

  // Precompute segment lengths
  const segmentLengths: number[] = [];
  for (let i = 0; i < poses.length - 1; i++) {
    segmentLengths.push(
      Math.hypot(poses[i + 1].x - poses[i].x, poses[i + 1].y - poses[i].y)
    );
  }

  // Calculate total path length
  const pathLength = segmentLengths.reduce((sum, len) => sum + len, 0);

  let currentPose = { ...poses[0] };
  let currentSpeeds: Speeds = { vx: 0, vy: 0, omega: 0 };
  const dt = 0.02;

  const simulationPath: SimulationPose[] = [{ ...currentPose, t: 0 }];
  let collisionDetected = false;
  let collisionPoint: SimulationPose | null = null;

  let currentWaypointIndex = 0;
  let accumulatedTime = 0;

  for (let step = 0; step < 1000; step++) {
    let targetPose = poses[poses.length - 1];

    // Advance waypoint if close enough
    if (currentWaypointIndex < poses.length - 1) {
      targetPose = poses[currentWaypointIndex + 1];
      const dist = Math.hypot(
        targetPose.x - currentPose.x,
        targetPose.y - currentPose.y
      );
      if (
        dist < config.waypointTolerance &&
        currentWaypointIndex < poses.length - 2
      ) {
        currentWaypointIndex++;
        targetPose = poses[currentWaypointIndex + 1];
      }
    }

    const goalPose = poses[poses.length - 1];
    const dx = targetPose.x - currentPose.x;
    const dy = targetPose.y - currentPose.y;
    const distToTarget = Math.hypot(dx, dy);

    const angleDiff = goalPose.rot - currentPose.rot;
    const angleError = normalizeAngle(angleDiff);

    // Calculate remaining distance
    let remainingDist = distToTarget;
    for (let i = currentWaypointIndex; i < segmentLengths.length; i++) {
      remainingDist += segmentLengths[i];
    }

    const currentLinearSpeed = Math.hypot(currentSpeeds.vx, currentSpeeds.vy);
    const targetOmega = physics.calculateTargetOmega(
      angleError,
      remainingDist,
      currentLinearSpeed,
      currentSpeeds.omega,
      config.reactionTime
    );

    // Determine if at final destination
    const isAtFinalDestination = currentWaypointIndex + 1 >= poses.length - 1;

    let targetSpeed: number;
    if (isAtFinalDestination) {
      targetSpeed = physics.calculateBrakingTargetSpeed(
        distToTarget,
        currentLinearSpeed,
        config.reactionTime,
        targetOmega,
        angleError,
        0
      );
    } else {
      targetSpeed = config.maxVelocity;
    }
    targetSpeed = Math.min(targetSpeed, config.maxVelocity);

    const dirX =
      distToTarget > config.positionTolerance ? dx / distToTarget : 0;
    const dirY =
      distToTarget > config.positionTolerance ? dy / distToTarget : 0;

    const targetVx = dirX * targetSpeed;
    const targetVy = dirY * targetSpeed;

    let nextSpeeds = physics.integrate(
      currentSpeeds,
      { vx: targetVx, vy: targetVy, omega: targetOmega },
      dt
    );

    // Normalize speeds
    nextSpeeds = physics.normalizeSpeeds(nextSpeeds);

    // Update pose
    currentPose.x += nextSpeeds.vx * dt;
    currentPose.y += nextSpeeds.vy * dt;
    currentPose.rot = normalizeAngle(currentPose.rot + nextSpeeds.omega * dt);

    accumulatedTime += dt;
    currentSpeeds = nextSpeeds;
    simulationPath.push({ ...currentPose, t: accumulatedTime });

    // Check collision
    if (checkCollision(currentPose, obstacles, config)) {
      collisionDetected = true;
      collisionPoint = { ...currentPose, t: accumulatedTime };
      break;
    }

    // Check if reached goal
    const distToGoal = Math.hypot(
      goalPose.x - currentPose.x,
      goalPose.y - currentPose.y
    );
    if (
      distToGoal < config.positionTolerance &&
      Math.abs(angleError) < config.rotationTolerance
    ) {
      break;
    }
  }

  return {
    path: simulationPath,
    collisionDetected,
    collisionPoint,
    totalDuration: accumulatedTime,
    pathLength,
  };
}

/**
 * Get interpolated pose at a specific time
 */
export function getPoseAtTime(
  simulationPath: SimulationPose[],
  time: number
): SimulationPose | null {
  if (simulationPath.length === 0) return null;

  const idx = simulationPath.findIndex((p) => p.t >= time);
  if (idx === -1) return simulationPath[simulationPath.length - 1];
  if (idx === 0) return simulationPath[0];

  const p1 = simulationPath[idx - 1];
  const p2 = simulationPath[idx];
  const ratio = (time - p1.t) / (p2.t - p1.t);

  return {
    x: p1.x + (p2.x - p1.x) * ratio,
    y: p1.y + (p2.y - p1.y) * ratio,
    rot: p1.rot + (p2.rot - p1.rot) * ratio,
    t: time,
  };
}
