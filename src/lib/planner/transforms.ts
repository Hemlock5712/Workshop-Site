// Coordinate transformation utilities for the WaypointPlanner

import { Point, ViewState, GridSettings } from "@/lib/planner/types";

export interface TransformContext {
  fieldWidth: number;
  imageWidth: number;
  imageHeight: number;
  view: ViewState;
  grid: GridSettings;
}

/**
 * Convert screen coordinates to field coordinates (meters)
 */
export function screenToField(
  screenX: number,
  screenY: number,
  ctx: TransformContext
): Point {
  const pxPerMeter = (ctx.imageWidth * ctx.view.scale) / ctx.fieldWidth;

  let fx = (screenX - ctx.view.offset.x) / pxPerMeter;
  let fy =
    (ctx.imageHeight * ctx.view.scale - (screenY - ctx.view.offset.y)) /
    pxPerMeter;

  // Apply grid snapping if enabled
  if (ctx.grid.snapEnabled && ctx.grid.size > 0) {
    fx = Math.round(fx / ctx.grid.size) * ctx.grid.size;
    fy = Math.round(fy / ctx.grid.size) * ctx.grid.size;
  }

  return { x: fx, y: fy };
}

/**
 * Convert field coordinates (meters) to screen coordinates
 */
export function fieldToScreen(
  fieldX: number,
  fieldY: number,
  ctx: TransformContext
): Point {
  const pxPerMeter = (ctx.imageWidth * ctx.view.scale) / ctx.fieldWidth;

  return {
    x: fieldX * pxPerMeter + ctx.view.offset.x,
    y:
      ctx.imageHeight * ctx.view.scale -
      fieldY * pxPerMeter +
      ctx.view.offset.y,
  };
}

/**
 * Get pixels per meter at current zoom level
 */
export function getPixelsPerMeter(ctx: TransformContext): number {
  return (ctx.imageWidth * ctx.view.scale) / ctx.fieldWidth;
}

/**
 * Calculate field height in meters based on image aspect ratio
 */
export function getFieldHeight(ctx: TransformContext): number {
  const pxPerMeter = getPixelsPerMeter(ctx);
  return (ctx.imageHeight * ctx.view.scale) / pxPerMeter;
}

/**
 * Get mouse position relative to canvas
 */
export function getMousePos(
  event: MouseEvent | React.MouseEvent,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Normalize an angle to [-PI, PI]
 */
export function normalizeAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Calculate zoom factor and new offset to maintain mouse position
 */
export function calculateZoom(
  currentView: ViewState,
  mousePos: Point,
  deltaY: number,
  ctx: Omit<TransformContext, "view">
): ViewState {
  const factor = Math.pow(1.1, -deltaY / 150);
  const newScale = currentView.scale * factor;

  // Convert mouse position to field coordinates at current scale
  const fullCtx: TransformContext = { ...ctx, view: currentView };
  const worldPos = screenToField(mousePos.x, mousePos.y, fullCtx);

  // Calculate where that point would be at the new scale
  const newCtx: TransformContext = {
    ...ctx,
    view: { ...currentView, scale: newScale },
  };
  const newScreenPos = fieldToScreen(worldPos.x, worldPos.y, newCtx);

  // Adjust offset to keep the world point under the mouse
  return {
    scale: newScale,
    offset: {
      x: currentView.offset.x + (mousePos.x - newScreenPos.x),
      y: currentView.offset.y + (mousePos.y - newScreenPos.y),
    },
  };
}

/**
 * Calculate initial view to fit field in canvas with some padding
 */
export function calculateInitialView(
  canvasWidth: number,
  canvasHeight: number,
  imageWidth: number,
  imageHeight: number
): ViewState {
  const scale =
    Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight) * 0.9;
  return {
    scale,
    offset: {
      x: (canvasWidth - imageWidth * scale) / 2,
      y: (canvasHeight - imageHeight * scale) / 2,
    },
  };
}
