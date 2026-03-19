"use client";

import React from "react";
import { usePlannerContext } from "@/components/planner/PlannerContext";
import { resolveWaypointData } from "@/lib/planner/physics";
import { Link2, Plus, Trash2 } from "lucide-react";

export function WaypointEditor() {
  const { state, actions, saveToHistory } = usePlannerContext();

  const currentPath = state.paths[state.currentPathId];
  const waypoint = currentPath?.points[state.selectedWaypointIndex];

  if (!waypoint) return null;

  const data = resolveWaypointData(waypoint, state.linkedWaypoints);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.updateWaypoint(state.selectedWaypointIndex, {
      name: e.target.value,
    });
  };

  const handleXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    actions.moveWaypoint(state.selectedWaypointIndex, value, data.y);
  };

  const handleYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    actions.moveWaypoint(state.selectedWaypointIndex, data.x, value);
  };

  const handleRotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    actions.rotateWaypoint(state.selectedWaypointIndex, value);
  };

  const handleEndSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.value === "" ? undefined : parseFloat(e.target.value);
    actions.updateWaypoint(state.selectedWaypointIndex, { endSpeed: value });
  };

  const handleToggleLink = () => {
    actions.toggleWaypointLink(state.selectedWaypointIndex);
    saveToHistory();
  };

  const handleSelectLink = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      actions.applyExistingLink(state.selectedWaypointIndex, e.target.value);
      saveToHistory();
    }
  };

  const handleInsertAfter = () => {
    actions.insertWaypointAfter(state.selectedWaypointIndex);
    saveToHistory();
  };

  const handleDelete = () => {
    actions.deleteWaypoint(state.selectedWaypointIndex);
    saveToHistory();
  };

  const linkedNames = Object.keys(state.linkedWaypoints);

  return (
    <div className="bg-[var(--muted)] p-3 rounded-lg space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-[var(--foreground)]">
          Waypoint Settings
        </span>
        <button
          onClick={handleToggleLink}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
            waypoint.isLinked
              ? "bg-yellow-500/20 text-yellow-500"
              : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Link2 className="w-3 h-3" />
          {waypoint.isLinked ? "Linked" : "Link Point"}
        </button>
      </div>

      {/* Name Input */}
      <input
        type="text"
        value={waypoint.name}
        onChange={handleNameChange}
        placeholder="Name"
        className={`w-full bg-[var(--background)] border text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          waypoint.isLinked ? "border-yellow-500" : "border-[var(--border)]"
        }`}
      />

      {/* Link Dropdown (only if not already linked) */}
      {!waypoint.isLinked && linkedNames.length > 0 && (
        <div>
          <label className="text-xs text-[var(--muted-foreground)] block mb-1">
            Link to Existing
          </label>
          <select
            value=""
            onChange={handleSelectLink}
            className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- Select to Link --</option>
            {linkedNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Position Inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-[var(--muted-foreground)] block mb-1">
            X (m)
          </label>
          <input
            type="number"
            value={data.x.toFixed(2)}
            onChange={handleXChange}
            step="0.01"
            className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted-foreground)] block mb-1">
            Y (m)
          </label>
          <input
            type="number"
            value={data.y.toFixed(2)}
            onChange={handleYChange}
            step="0.01"
            className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Rotation Input */}
      <div>
        <label className="text-xs text-[var(--muted-foreground)] block mb-1">
          Rotation (deg)
        </label>
        <input
          type="number"
          value={Math.round(data.rot)}
          onChange={handleRotChange}
          className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* End Speed Input */}
      <div>
        <label className="text-xs text-[var(--muted-foreground)] block mb-1">
          End Speed (m/s)
        </label>
        <input
          type="number"
          value={waypoint.endSpeed ?? ""}
          onChange={handleEndSpeedChange}
          placeholder="Auto"
          min="0"
          max={state.config.maxVelocity}
          step="0.1"
          className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleInsertAfter}
          className="flex items-center justify-center gap-1 bg-[var(--background)] hover:bg-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Insert After
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-2 rounded-md text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
