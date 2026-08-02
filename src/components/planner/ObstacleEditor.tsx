"use client";

import React from "react";
import { usePlannerContext } from "@/components/planner/PlannerContext";
import { Trash2 } from "lucide-react";

export function ObstacleEditor() {
  const { state, actions, saveToHistory } = usePlannerContext();

  const obstacle = state.obstacles[state.selectedObstacleIndex];

  if (!obstacle) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.updateObstacle(state.selectedObstacleIndex, {
      name: e.target.value,
    });
  };

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    actions.moveObstacle(state.selectedObstacleIndex, value, obstacle.y);
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    actions.moveObstacle(state.selectedObstacleIndex, obstacle.x, value);
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (obstacle.type === "rectangle") {
      actions.updateObstacle(state.selectedObstacleIndex, {
        w: parseFloat(e.target.value) || 0,
      });
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (obstacle.type === "rectangle") {
      actions.updateObstacle(state.selectedObstacleIndex, {
        h: parseFloat(e.target.value) || 0,
      });
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (obstacle.type === "circle") {
      actions.updateObstacle(state.selectedObstacleIndex, {
        r: parseFloat(e.target.value) || 0,
      });
    }
  };

  const handleDelete = () => {
    actions.deleteObstacle(state.selectedObstacleIndex);
    saveToHistory();
  };

  return (
    <div className="bg-[var(--muted)] p-3 rounded-lg space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[var(--foreground)]">
          Obstacle Settings
        </span>
        <span className="text-xs text-[var(--muted-foreground)] capitalize">
          {obstacle.type}
        </span>
      </div>

      {/* Name Input */}
      <input
        type="text"
        value={obstacle.name}
        onChange={handleNameChange}
        placeholder="Name"
        className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />

      {/* Position Inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-[var(--muted-foreground)] block mb-1">
            X (m)
          </label>
          <input
            type="number"
            value={obstacle.x.toFixed(2)}
            onChange={handleXChange}
            step="0.05"
            className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted-foreground)] block mb-1">
            Y (m)
          </label>
          <input
            type="number"
            value={obstacle.y.toFixed(2)}
            onChange={handleYChange}
            step="0.05"
            className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      {/* Rectangle-specific inputs */}
      {obstacle.type === "rectangle" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[var(--muted-foreground)] block mb-1">
              Width (m)
            </label>
            <input
              type="number"
              value={obstacle.w.toFixed(2)}
              onChange={handleWidthChange}
              step="0.05"
              className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--muted-foreground)] block mb-1">
              Height (m)
            </label>
            <input
              type="number"
              value={obstacle.h.toFixed(2)}
              onChange={handleHeightChange}
              step="0.05"
              className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>
      )}

      {/* Circle-specific inputs */}
      {obstacle.type === "circle" && (
        <div>
          <label className="text-xs text-[var(--muted-foreground)] block mb-1">
            Radius (m)
          </label>
          <input
            type="number"
            value={obstacle.r.toFixed(2)}
            onChange={handleRadiusChange}
            step="0.05"
            className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      )}

      {/* Polygon info */}
      {obstacle.type === "polygon" && (
        <div className="text-xs text-[var(--muted-foreground)]">
          {obstacle.points?.length || 0} points - Drag to move
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="w-full flex items-center justify-center gap-2 bg-[color-mix(in_oklch,var(--bg2)_20%,transparent)] hover:bg-[color-mix(in_oklch,var(--bg2)_30%,transparent)] text-[var(--err)] px-3 py-2 rounded-md text-sm transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Obstacle
      </button>
    </div>
  );
}
