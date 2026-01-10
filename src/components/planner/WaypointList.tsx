"use client";

import React from "react";
import { usePlannerContext } from "./PlannerContext";
import { resolveWaypointData } from "@/lib/planner/physics";
import { Link2 } from "lucide-react";

export function WaypointList() {
  const { state, actions } = usePlannerContext();
  const currentPath = state.paths[state.currentPathId];
  const pts = currentPath?.points || [];

  return (
    <div className="flex flex-col">
      <div className="text-xs font-medium text-[var(--muted-foreground)] px-2 py-1">
        Waypoints ({pts.length})
      </div>
      <div className="max-h-64 overflow-y-auto border border-[var(--border)] rounded-md bg-[var(--background)]">
        {pts.length === 0 ? (
          <div className="p-4 text-center text-sm text-[var(--muted-foreground)]">
            Click on the field to add waypoints
          </div>
        ) : (
          pts.map((wp, i) => {
            const data = resolveWaypointData(wp, state.linkedWaypoints);
            const isSelected = i === state.selectedWaypointIndex;

            return (
              <div
                key={i}
                onClick={() => actions.selectWaypoint(i)}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-[var(--border)] last:border-b-0 transition-colors text-sm ${
                  isSelected
                    ? "bg-primary-500/20 text-primary-500"
                    : "hover:bg-[var(--muted)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  {wp.isLinked && <Link2 className="w-3 h-3 text-yellow-500" />}
                  <span className={isSelected ? "font-medium" : ""}>
                    {i + 1}. {wp.name}
                  </span>
                </span>
                <span className="text-[var(--muted-foreground)]">
                  {data.x.toFixed(1)}m
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
