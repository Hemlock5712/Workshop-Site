"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { usePlannerContext } from "@/components/planner/PlannerContext";
import { useCanvasInteraction } from "@/hooks/planner/useCanvasInteraction";
import {
  fieldToScreen,
  getPixelsPerMeter,
  TransformContext,
} from "@/lib/planner/transforms";
import { resolveWaypointData } from "@/lib/planner/physics";
import { useTheme } from "next-themes";

export function PlannerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldImageRef = useRef<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const { state, actions, ghostPose, saveToHistory, playbackTime } =
    usePlannerContext();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Interaction handlers
  const interaction = useCanvasInteraction({
    state,
    imageSize,
    onAddWaypoint: actions.addWaypoint,
    onSelectWaypoint: actions.selectWaypoint,
    onSelectObstacle: actions.selectObstacle,
    onMoveWaypoint: actions.moveWaypoint,
    onRotateWaypoint: actions.rotateWaypoint,
    onMoveObstacle: actions.moveObstacle,
    onUpdateView: actions.updateView,
    onAddPolygonPoint: actions.addPolygonPoint,
    onFinishPolygon: actions.finishPolygon,
    onSaveHistory: saveToHistory,
  });

  // Load field image
  useEffect(() => {
    const img = new Image();
    img.src = state.fieldImageSrc;
    img.onload = () => {
      fieldImageRef.current = img;
      setImageSize({ width: img.width, height: img.height });

      // Set initial view to fit image
      const canvas = canvasRef.current;
      if (canvas) {
        const scale =
          Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
        actions.updateView({
          scale,
          offset: {
            x: (canvas.width - img.width * scale) / 2,
            y: (canvas.height - img.height * scale) / 2,
          },
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fieldImageSrc]);

  // Resize canvas to fit container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get transform context for drawing
  const getCtx = useCallback((): TransformContext | null => {
    if (!imageSize) return null;
    return {
      fieldWidth: state.fieldWidth,
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      view: state.view,
      grid: state.grid,
    };
  }, [state.fieldWidth, state.view, state.grid, imageSize]);

  // Helper function to draw robot (moved before draw callback)
  const drawRobot = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      pos: { x: number; y: number },
      rot: number,
      color: string,
      isSelected: boolean,
      pxPerMeter: number,
      isLinked: boolean
    ) => {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate((-rot * Math.PI) / 180);
      const w = state.config.robotLength * pxPerMeter;
      const h = state.config.robotWidth * pxPerMeter;

      if (isSelected) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = isLinked ? "#f1c40f" : "white";
        ctx.strokeStyle = isLinked ? "#f1c40f" : "white";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 10);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 10);
      ctx.stroke();

      // Robot center dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Linked icon
      if (isLinked) {
        ctx.fillStyle = "#f1c40f";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u{1F517}", 0, -h / 2 - 15);
      }

      // Rotation handle (only if selected)
      if (isSelected) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w / 2 + 25, 0);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(w / 2 + 25, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    },
    [state.config.robotLength, state.config.robotWidth]
  );

  // Draw the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = fieldImageRef.current;
    const transformCtx = getCtx();

    if (!canvas || !ctx || !img || !transformCtx) return;

    // Clear canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = isDark ? "#111" : "#e5e5e5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw field image
    ctx.drawImage(
      img,
      state.view.offset.x,
      state.view.offset.y,
      img.width * state.view.scale,
      img.height * state.view.scale
    );

    const pxPerMeter = getPixelsPerMeter(transformCtx);
    const currentPath = state.paths[state.currentPathId];
    const pts = currentPath?.points || [];

    // Draw grid
    if (state.grid.enabled) {
      ctx.save();
      ctx.strokeStyle = isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1;
      const fieldH = (img.height * state.view.scale) / pxPerMeter;

      for (let x = 0; x <= state.fieldWidth; x += state.grid.size) {
        const s = fieldToScreen(x, 0, transformCtx);
        const e = fieldToScreen(x, fieldH, transformCtx);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
      }
      for (let y = 0; y <= fieldH; y += state.grid.size) {
        const s = fieldToScreen(0, y, transformCtx);
        const e = fieldToScreen(state.fieldWidth, y, transformCtx);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw obstacles
    state.obstacles.forEach((obs, i) => {
      ctx.save();
      const isSelected = i === state.selectedObstacleIndex;
      ctx.fillStyle = isSelected
        ? "rgba(255, 100, 100, 0.4)"
        : "rgba(100, 100, 100, 0.6)";
      ctx.strokeStyle = isSelected ? "#ff4444" : "#444";
      ctx.lineWidth = 2;

      if (obs.type === "rectangle") {
        const s = fieldToScreen(obs.x, obs.y, transformCtx);
        const w = obs.w * pxPerMeter;
        const h = obs.h * pxPerMeter;

        ctx.translate(s.x, s.y);
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);

        if (isSelected) {
          ctx.strokeStyle = "#fff";
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
        }

        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obs.name, 0, 0);
      } else if (obs.type === "circle") {
        const s = fieldToScreen(obs.x, obs.y, transformCtx);
        const r = obs.r * pxPerMeter;

        ctx.translate(s.x, s.y);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (isSelected) {
          ctx.strokeStyle = "#fff";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, r + 2, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obs.name, 0, 0);
      } else if (
        obs.type === "polygon" &&
        obs.points &&
        obs.points.length > 0
      ) {
        ctx.beginPath();
        const first = fieldToScreen(
          obs.points[0].x,
          obs.points[0].y,
          transformCtx
        );
        ctx.moveTo(first.x, first.y);
        for (let k = 1; k < obs.points.length; k++) {
          const p = fieldToScreen(
            obs.points[k].x,
            obs.points[k].y,
            transformCtx
          );
          ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (isSelected) {
          ctx.strokeStyle = "#fff";
          obs.points.forEach((pt) => {
            const sc = fieldToScreen(pt.x, pt.y, transformCtx);
            ctx.beginPath();
            ctx.arc(sc.x, sc.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
          });
        }

        const s = fieldToScreen(obs.x, obs.y, transformCtx);
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obs.name, s.x, s.y);
      }
      ctx.restore();
    });

    // Draw temp polygon (when drawing)
    if (state.isDrawingPolygon && state.tempPolygonPoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = "#f1c40f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const start = fieldToScreen(
        state.tempPolygonPoints[0].x,
        state.tempPolygonPoints[0].y,
        transformCtx
      );
      ctx.moveTo(start.x, start.y);
      for (let k = 1; k < state.tempPolygonPoints.length; k++) {
        const p = fieldToScreen(
          state.tempPolygonPoints[k].x,
          state.tempPolygonPoints[k].y,
          transformCtx
        );
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      state.tempPolygonPoints.forEach((pt) => {
        const sc = fieldToScreen(pt.x, pt.y, transformCtx);
        ctx.beginPath();
        ctx.arc(sc.x, sc.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#f1c40f";
        ctx.fill();
      });
      ctx.restore();
    }

    // Draw simulation path
    if (state.simulationPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = state.collisionDetected ? "#ff4444" : "#4caf50";
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);

      const start = fieldToScreen(
        state.simulationPath[0].x,
        state.simulationPath[0].y,
        transformCtx
      );
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < state.simulationPath.length; i += 5) {
        const p = fieldToScreen(
          state.simulationPath[i].x,
          state.simulationPath[i].y,
          transformCtx
        );
        ctx.lineTo(p.x, p.y);
      }
      const end = fieldToScreen(
        state.simulationPath[state.simulationPath.length - 1].x,
        state.simulationPath[state.simulationPath.length - 1].y,
        transformCtx
      );
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw ghost robot at playback time
      if (ghostPose) {
        const ghostScreen = fieldToScreen(
          ghostPose.x,
          ghostPose.y,
          transformCtx
        );
        drawRobot(
          ctx,
          ghostScreen,
          (ghostPose.rot * 180) / Math.PI,
          "rgba(0, 200, 255, 0.7)",
          false,
          pxPerMeter,
          false
        );
      }

      // Draw collision point
      if (state.collisionPoint) {
        const p = fieldToScreen(
          state.collisionPoint.x,
          state.collisionPoint.y,
          transformCtx
        );
        ctx.fillStyle = "#ff4444";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "left";
        ctx.fillText("⚠️ COLLISION", p.x + 15, p.y);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw path lines
    if (pts.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 4;

      const startData = resolveWaypointData(pts[0], state.linkedWaypoints);
      const start = fieldToScreen(startData.x, startData.y, transformCtx);
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < pts.length; i++) {
        const pData = resolveWaypointData(pts[i], state.linkedWaypoints);
        const p = fieldToScreen(pData.x, pData.y, transformCtx);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Draw waypoints
    pts.forEach((wp, i) => {
      const data = resolveWaypointData(wp, state.linkedWaypoints);
      const pos = fieldToScreen(data.x, data.y, transformCtx);
      const color =
        i === 0 ? "#4caf50" : i === pts.length - 1 ? "#d94444" : "#ccc";
      const isSelected = i === state.selectedWaypointIndex;

      if (i === 0 || i === pts.length - 1 || isSelected) {
        drawRobot(
          ctx,
          pos,
          data.rot,
          color,
          isSelected,
          pxPerMeter,
          wp.isLinked
        );
      } else {
        ctx.beginPath();
        ctx.fillStyle = wp.isLinked ? "#f1c40f" : "#aaa";
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [state, getCtx, isDark, ghostPose, drawRobot]);

  // Redraw on state changes
  useEffect(() => {
    draw();
  }, [draw, playbackTime]);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelEvent = (e: WheelEvent) =>
      interaction.handleWheel(e, canvas);
    const handleMouseDownEvent = (e: MouseEvent) =>
      interaction.handleMouseDown(e, canvas);
    const handleMouseMoveEvent = (e: MouseEvent) =>
      interaction.handleMouseMove(e, canvas);

    canvas.addEventListener("wheel", handleWheelEvent, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDownEvent);
    window.addEventListener("mousemove", handleMouseMoveEvent);
    window.addEventListener("mouseup", interaction.handleMouseUp);
    window.addEventListener("contextmenu", interaction.handleContextMenu);

    return () => {
      canvas.removeEventListener("wheel", handleWheelEvent);
      canvas.removeEventListener("mousedown", handleMouseDownEvent);
      window.removeEventListener("mousemove", handleMouseMoveEvent);
      window.removeEventListener("mouseup", interaction.handleMouseUp);
      window.removeEventListener("contextmenu", interaction.handleContextMenu);
    };
  }, [interaction]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="block cursor-crosshair"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}
