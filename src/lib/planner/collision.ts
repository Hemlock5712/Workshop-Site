// Collision detection utilities for the WaypointPlanner

import { Point, Obstacle, RobotConfig, SimulationPose } from "./types";

/**
 * Check if a point is inside a polygon using ray casting
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (!polygon || polygon.length < 3) return false;

  let isInside = false;
  let j = polygon.length - 1;

  for (let i = 0; i < polygon.length; j = i++) {
    if (
      polygon[i].y > point.y !== polygon[j].y > point.y &&
      point.x <
        ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
          (polygon[j].y - polygon[i].y) +
          polygon[i].x
    ) {
      isInside = !isInside;
    }
  }

  return isInside;
}

/**
 * Separating Axis Theorem (SAT) collision detection for convex polygons
 * Returns true if the polygons are colliding
 */
export function checkSAT(poly1: Point[], poly2: Point[]): boolean {
  const polys = [poly1, poly2];

  for (let i = 0; i < polys.length; i++) {
    const poly = polys[i];

    for (let j = 0; j < poly.length; j++) {
      const p1 = poly[j];
      const p2 = poly[(j + 1) % poly.length];

      // Calculate normal to this edge
      const normal = {
        x: -(p2.y - p1.y),
        y: p2.x - p1.x,
      };

      // Project poly1 onto the normal
      let min1 = Infinity;
      let max1 = -Infinity;
      for (const p of poly1) {
        const proj = p.x * normal.x + p.y * normal.y;
        min1 = Math.min(min1, proj);
        max1 = Math.max(max1, proj);
      }

      // Project poly2 onto the normal
      let min2 = Infinity;
      let max2 = -Infinity;
      for (const p of poly2) {
        const proj = p.x * normal.x + p.y * normal.y;
        min2 = Math.min(min2, proj);
        max2 = Math.max(max2, proj);
      }

      // Check for separation
      if (max1 < min2 || max2 < min1) {
        return false; // Separating axis found, no collision
      }
    }
  }

  return true; // No separating axis, polygons are colliding
}

/**
 * Get the corners of the robot as world coordinates
 */
export function getRobotCorners(
  pose: { x: number; y: number; rot: number },
  config: RobotConfig
): Point[] {
  const L = config.robotLength;
  const W = config.robotWidth;
  const c = Math.cos(pose.rot);
  const s = Math.sin(pose.rot);

  function transform(lx: number, ly: number): Point {
    return {
      x: pose.x + lx * c - ly * s,
      y: pose.y + lx * s + ly * c,
    };
  }

  return [
    transform(L / 2, W / 2),
    transform(L / 2, -W / 2),
    transform(-L / 2, -W / 2),
    transform(-L / 2, W / 2),
  ];
}

/**
 * Check if robot collides with a rectangle obstacle
 */
function checkRectangleCollision(
  robotCorners: Point[],
  pose: { x: number; y: number; rot: number },
  obstacle: { x: number; y: number; w: number; h: number },
  config: RobotConfig
): boolean {
  const minX = obstacle.x - obstacle.w / 2;
  const maxX = obstacle.x + obstacle.w / 2;
  const minY = obstacle.y - obstacle.h / 2;
  const maxY = obstacle.y + obstacle.h / 2;

  // Check if any robot corner is inside the obstacle
  for (const corner of robotCorners) {
    if (
      corner.x >= minX &&
      corner.x <= maxX &&
      corner.y >= minY &&
      corner.y <= maxY
    ) {
      return true;
    }
  }

  // Check if any obstacle corner is inside the robot
  const obsCorners = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];

  const c = Math.cos(pose.rot);
  const s = Math.sin(pose.rot);
  const L = config.robotLength;
  const W = config.robotWidth;

  for (const oc of obsCorners) {
    const dx = oc.x - pose.x;
    const dy = oc.y - pose.y;
    const localX = dx * c + dy * s;
    const localY = -dx * s + dy * c;
    if (Math.abs(localX) < L / 2 && Math.abs(localY) < W / 2) {
      return true;
    }
  }

  return false;
}

/**
 * Check if robot collides with a circle obstacle
 */
function checkCircleCollision(
  pose: { x: number; y: number; rot: number },
  obstacle: { x: number; y: number; r: number },
  config: RobotConfig
): boolean {
  const c = Math.cos(pose.rot);
  const s = Math.sin(pose.rot);
  const L = config.robotLength;
  const W = config.robotWidth;

  // Transform circle center to robot local coordinates
  const dx = obstacle.x - pose.x;
  const dy = obstacle.y - pose.y;
  const localX = dx * c + dy * s;
  const localY = -dx * s + dy * c;

  // Find closest point on robot rectangle to circle center
  const closestX = Math.max(-L / 2, Math.min(L / 2, localX));
  const closestY = Math.max(-W / 2, Math.min(W / 2, localY));

  // Check distance from closest point to circle center
  const distX = localX - closestX;
  const distY = localY - closestY;

  return distX * distX + distY * distY < obstacle.r * obstacle.r;
}

/**
 * Check if robot collides with a polygon obstacle
 */
function checkPolygonCollision(
  robotCorners: Point[],
  obstacle: { points: Point[] }
): boolean {
  if (!obstacle.points || obstacle.points.length < 3) {
    return false;
  }
  return checkSAT(obstacle.points, robotCorners);
}

/**
 * Check if robot at given pose collides with any obstacle
 */
export function checkCollision(
  pose: SimulationPose | { x: number; y: number; rot: number },
  obstacles: Obstacle[],
  config: RobotConfig
): boolean {
  if (obstacles.length === 0) return false;

  const robotCorners = getRobotCorners(pose, config);

  for (const obs of obstacles) {
    switch (obs.type) {
      case "rectangle":
        if (checkRectangleCollision(robotCorners, pose, obs, config)) {
          return true;
        }
        break;
      case "circle":
        if (checkCircleCollision(pose, obs, config)) {
          return true;
        }
        break;
      case "polygon":
        if (checkPolygonCollision(robotCorners, obs)) {
          return true;
        }
        break;
    }
  }

  return false;
}

/**
 * Check if a point is near a waypoint (for hit testing)
 */
export function isNearPoint(
  testPoint: Point,
  targetPoint: Point,
  threshold: number
): boolean {
  return (
    Math.hypot(testPoint.x - targetPoint.x, testPoint.y - targetPoint.y) <
    threshold
  );
}

/**
 * Check if a point is inside a rectangle (for hit testing obstacles)
 */
export function isInsideRectangle(
  point: Point,
  center: Point,
  width: number,
  height: number
): boolean {
  return (
    Math.abs(point.x - center.x) < width / 2 &&
    Math.abs(point.y - center.y) < height / 2
  );
}

/**
 * Check if a point is inside a circle (for hit testing obstacles)
 */
export function isInsideCircle(
  point: Point,
  center: Point,
  radius: number
): boolean {
  return Math.hypot(point.x - center.x, point.y - center.y) < radius;
}
