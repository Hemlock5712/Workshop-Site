"use client";

import { useCallback, useRef, useState } from "react";
import { Point, PlannerState, Obstacle } from "@/lib/planner/types";
import {
  screenToField,
  fieldToScreen,
  getMousePos,
  calculateZoom,
  TransformContext,
} from "@/lib/planner/transforms";
import {
  isNearPoint,
  isInsideRectangle,
  isInsideCircle,
  isPointInPolygon,
} from "@/lib/planner/collision";
import { resolveWaypointData } from "@/lib/planner/physics";

type InteractionMode = "none" | "panning" | "dragging" | "rotating";

interface HitTestResult {
  type: "waypoint" | "obstacle" | "rotationHandle" | "none";
  index: number;
}

interface UseCanvasInteractionOptions {
  state: PlannerState;
  imageSize: { width: number; height: number } | null;
  onAddWaypoint: (x: number, y: number) => void;
  onSelectWaypoint: (index: number) => void;
  onSelectObstacle: (index: number) => void;
  onMoveWaypoint: (index: number, x: number, y: number) => void;
  onRotateWaypoint: (index: number, rot: number) => void;
  onMoveObstacle: (index: number, x: number, y: number) => void;
  onUpdateView: (updates: Partial<PlannerState["view"]>) => void;
  onAddPolygonPoint: (point: Point) => void;
  onFinishPolygon: () => void;
  onSaveHistory: () => void;
}

export function useCanvasInteraction(options: UseCanvasInteractionOptions) {
  const {
    state,
    imageSize,
    onAddWaypoint,
    onSelectWaypoint,
    onSelectObstacle,
    onMoveWaypoint,
    onRotateWaypoint,
    onMoveObstacle,
    onUpdateView,
    onAddPolygonPoint,
    onFinishPolygon,
    onSaveHistory,
  } = options;

  const [mode, setMode] = useState<InteractionMode>("none");
  const lastMouseRef = useRef<Point>({ x: 0, y: 0 });
  const dragTargetRef = useRef<{
    type: "waypoint" | "obstacle";
    index: number;
  } | null>(null);

  const getTransformContext = useCallback((): TransformContext | null => {
    if (!imageSize) return null;
    return {
      fieldWidth: state.fieldWidth,
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      view: state.view,
      grid: state.grid,
    };
  }, [state.fieldWidth, state.view, state.grid, imageSize]);

  /**
   * Hit test to find what's under the mouse
   */
  const hitTest = useCallback(
    (mousePos: Point): HitTestResult => {
      const ctx = getTransformContext();
      if (!ctx) return { type: "none", index: -1 };

      const currentPath = state.paths[state.currentPathId];
      const pts = currentPath?.points || [];
      const pxPerMeter = (ctx.imageWidth * ctx.view.scale) / ctx.fieldWidth;

      // Check rotation handle first (only if a waypoint is selected)
      if (
        state.selectedWaypointIndex !== -1 &&
        pts[state.selectedWaypointIndex]
      ) {
        const wp = pts[state.selectedWaypointIndex];
        const data = resolveWaypointData(wp, state.linkedWaypoints);
        const pos = fieldToScreen(data.x, data.y, ctx);
        const handleDist = (state.config.robotLength * pxPerMeter) / 2 + 25;
        const handleX =
          pos.x + Math.cos((-data.rot * Math.PI) / 180) * handleDist;
        const handleY =
          pos.y + Math.sin((-data.rot * Math.PI) / 180) * handleDist;

        if (Math.hypot(mousePos.x - handleX, mousePos.y - handleY) < 20) {
          return { type: "rotationHandle", index: state.selectedWaypointIndex };
        }
      }

      // Check waypoints
      for (let i = 0; i < pts.length; i++) {
        const wp = pts[i];
        const data = resolveWaypointData(wp, state.linkedWaypoints);
        const screenPos = fieldToScreen(data.x, data.y, ctx);
        if (
          Math.hypot(mousePos.x - screenPos.x, mousePos.y - screenPos.y) < 25
        ) {
          return { type: "waypoint", index: i };
        }
      }

      // Check obstacles
      for (let i = 0; i < state.obstacles.length; i++) {
        const obs = state.obstacles[i];
        const screenPos = fieldToScreen(obs.x, obs.y, ctx);

        if (obs.type === "rectangle") {
          const w = obs.w * pxPerMeter;
          const h = obs.h * pxPerMeter;
          if (
            Math.abs(mousePos.x - screenPos.x) < w / 2 &&
            Math.abs(mousePos.y - screenPos.y) < h / 2
          ) {
            return { type: "obstacle", index: i };
          }
        } else if (obs.type === "circle") {
          const r = obs.r * pxPerMeter;
          if (
            Math.hypot(mousePos.x - screenPos.x, mousePos.y - screenPos.y) < r
          ) {
            return { type: "obstacle", index: i };
          }
        } else if (obs.type === "polygon" && obs.points) {
          const fieldPos = screenToField(mousePos.x, mousePos.y, {
            ...ctx,
            grid: { ...ctx.grid, snapEnabled: false },
          });
          if (isPointInPolygon(fieldPos, obs.points)) {
            return { type: "obstacle", index: i };
          }
        }
      }

      return { type: "none", index: -1 };
    },
    [getTransformContext, state]
  );

  /**
   * Handle mouse wheel for zoom
   */
  const handleWheel = useCallback(
    (e: WheelEvent, canvas: HTMLCanvasElement) => {
      e.preventDefault();
      const ctx = getTransformContext();
      if (!ctx) return;

      const mousePos = getMousePos(e, canvas);
      const newView = calculateZoom(state.view, mousePos, e.deltaY, ctx);
      onUpdateView(newView);
    },
    [getTransformContext, state.view, onUpdateView]
  );

  /**
   * Handle mouse down
   */
  const handleMouseDown = useCallback(
    (e: MouseEvent, canvas: HTMLCanvasElement) => {
      const mousePos = getMousePos(e, canvas);
      lastMouseRef.current = mousePos;

      const ctx = getTransformContext();
      if (!ctx) return;

      // Polygon drawing mode
      if (state.isDrawingPolygon) {
        if (e.button === 2) {
          // Right click to finish
          onFinishPolygon();
          return;
        }
        const fieldPos = screenToField(mousePos.x, mousePos.y, ctx);
        onAddPolygonPoint(fieldPos);
        return;
      }

      // Middle click for pan
      if (e.button === 1) {
        setMode("panning");
        return;
      }

      // Hit test
      const hit = hitTest(mousePos);

      if (hit.type === "rotationHandle") {
        setMode("rotating");
        dragTargetRef.current = { type: "waypoint", index: hit.index };
        return;
      }

      if (hit.type === "waypoint") {
        onSelectWaypoint(hit.index);
        setMode("dragging");
        dragTargetRef.current = { type: "waypoint", index: hit.index };
        return;
      }

      if (hit.type === "obstacle") {
        onSelectObstacle(hit.index);
        setMode("dragging");
        dragTargetRef.current = { type: "obstacle", index: hit.index };
        return;
      }

      // Left click on empty space - add waypoint
      if (e.button === 0) {
        const fieldPos = screenToField(mousePos.x, mousePos.y, ctx);
        onAddWaypoint(fieldPos.x, fieldPos.y);
        setMode("dragging");
        // The new waypoint will be selected and at the end of the list
        const currentPath = state.paths[state.currentPathId];
        dragTargetRef.current = {
          type: "waypoint",
          index: currentPath.points.length, // Will be the new index
        };
        onSaveHistory();
      }
    },
    [
      getTransformContext,
      state,
      hitTest,
      onAddWaypoint,
      onSelectWaypoint,
      onSelectObstacle,
      onAddPolygonPoint,
      onFinishPolygon,
      onSaveHistory,
    ]
  );

  /**
   * Handle mouse move
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent, canvas: HTMLCanvasElement) => {
      const mousePos = getMousePos(e, canvas);
      const ctx = getTransformContext();

      if (mode === "panning") {
        const dx = mousePos.x - lastMouseRef.current.x;
        const dy = mousePos.y - lastMouseRef.current.y;
        onUpdateView({
          offset: {
            x: state.view.offset.x + dx,
            y: state.view.offset.y + dy,
          },
        });
      } else if (mode === "dragging" && dragTargetRef.current && ctx) {
        const fieldPos = screenToField(mousePos.x, mousePos.y, ctx);

        if (dragTargetRef.current.type === "waypoint") {
          onMoveWaypoint(dragTargetRef.current.index, fieldPos.x, fieldPos.y);
        } else {
          onMoveObstacle(dragTargetRef.current.index, fieldPos.x, fieldPos.y);
        }
      } else if (mode === "rotating" && dragTargetRef.current && ctx) {
        const wp =
          state.paths[state.currentPathId]?.points[dragTargetRef.current.index];
        if (wp) {
          const data = resolveWaypointData(wp, state.linkedWaypoints);
          const pos = fieldToScreen(data.x, data.y, ctx);
          const rot =
            (-Math.atan2(mousePos.y - pos.y, mousePos.x - pos.x) * 180) /
            Math.PI;
          onRotateWaypoint(dragTargetRef.current.index, rot);
        }
      }

      lastMouseRef.current = mousePos;
    },
    [
      mode,
      getTransformContext,
      state,
      onUpdateView,
      onMoveWaypoint,
      onMoveObstacle,
      onRotateWaypoint,
    ]
  );

  /**
   * Handle mouse up
   */
  const handleMouseUp = useCallback(() => {
    if (mode === "dragging" || mode === "rotating") {
      onSaveHistory();
    }
    setMode("none");
    dragTargetRef.current = null;
  }, [mode, onSaveHistory]);

  /**
   * Handle context menu (prevent default for right-click)
   */
  const handleContextMenu = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleContextMenu,
    mode,
  };
}
