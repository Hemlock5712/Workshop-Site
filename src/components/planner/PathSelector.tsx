"use client";

import React from "react";
import { usePlannerContext } from "./PlannerContext";
import { Plus, Copy, RotateCcw, Trash2 } from "lucide-react";

export function PathSelector() {
  const { state, actions, saveToHistory } = usePlannerContext();

  const handlePathChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    actions.switchPath(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.renamePath(e.target.value);
  };

  const handleCreatePath = () => {
    actions.createPath();
    saveToHistory();
  };

  const handleDuplicatePath = () => {
    actions.duplicatePath();
    saveToHistory();
  };

  const handleReversePath = () => {
    actions.reversePath();
    saveToHistory();
  };

  const handleDeletePath = () => {
    const currentName =
      state.paths[state.currentPathId]?.name || "Current Path";
    if (confirm(`Delete path "${currentName}"?`)) {
      actions.deletePath();
      saveToHistory();
    }
  };

  const currentPath = state.paths[state.currentPathId];

  return (
    <div className="bg-[var(--muted)] p-3 rounded-lg space-y-2">
      {/* Path Dropdown */}
      <select
        value={state.currentPathId}
        onChange={handlePathChange}
        className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {Object.entries(state.paths).map(([id, path]) => (
          <option key={id} value={id}>
            {path.name}
          </option>
        ))}
      </select>

      {/* Path Name Edit */}
      <input
        type="text"
        value={currentPath?.name || ""}
        onChange={handleNameChange}
        placeholder="Path Name"
        className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      {/* Path Stats */}
      <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
        <span>
          Length:{" "}
          <span className="text-[var(--foreground)]">
            {state.pathLength.toFixed(2)}m
          </span>
        </span>
        <span>
          Time:{" "}
          <span className="text-[var(--foreground)]">
            {state.totalDuration.toFixed(2)}s
          </span>
        </span>
      </div>

      {/* Path Actions */}
      <button
        onClick={handleCreatePath}
        className="w-full flex items-center justify-center gap-2 bg-[var(--background)] hover:bg-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Path
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDuplicatePath}
          className="flex items-center justify-center gap-1 bg-[var(--background)] hover:bg-[var(--border)] text-[var(--foreground)] px-2 py-1.5 rounded-md text-xs transition-colors"
          title="Duplicate Path"
        >
          <Copy className="w-3 h-3" />
          Duplicate
        </button>
        <button
          onClick={handleReversePath}
          className="flex items-center justify-center gap-1 bg-[var(--background)] hover:bg-[var(--border)] text-[var(--foreground)] px-2 py-1.5 rounded-md text-xs transition-colors"
          title="Reverse Path"
        >
          <RotateCcw className="w-3 h-3" />
          Reverse
        </button>
      </div>

      <button
        onClick={handleDeletePath}
        className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 px-3 py-2 rounded-md text-sm transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete Path
      </button>
    </div>
  );
}
