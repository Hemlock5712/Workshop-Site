"use client";

import React, { useRef } from "react";
import { usePlannerContext } from "./PlannerContext";
import { PathSelector } from "./PathSelector";
import { WaypointList } from "./WaypointList";
import { WaypointEditor } from "./WaypointEditor";
import { ObstacleEditor } from "./ObstacleEditor";
import {
  Undo2,
  Redo2,
  Save,
  Upload,
  Grid3X3,
  Settings,
  FileCode,
} from "lucide-react";

interface PlannerSidebarProps {
  onOpenSettings: () => void;
  onOpenExport: () => void;
}

export function PlannerSidebar({
  onOpenSettings,
  onOpenExport,
}: PlannerSidebarProps) {
  const {
    state,
    actions,
    undo,
    redo,
    canUndo,
    canRedo,
    exportProject,
    importProject,
    saveToHistory,
  } = usePlannerContext();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importProject(file);
      } catch (error) {
        alert("Failed to load project: " + (error as Error).message);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleToggleGrid = () => {
    actions.updateGrid({ enabled: !state.grid.enabled });
    saveToHistory();
  };

  const handleToggleSnap = () => {
    actions.updateGrid({ snapEnabled: !state.grid.snapEnabled });
    saveToHistory();
  };

  const handleGridSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.updateGrid({ size: parseFloat(e.target.value) || 1.0 });
    saveToHistory();
  };

  return (
    <div className="w-80 bg-[var(--card)] border-r border-[var(--border)] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--border)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-[var(--card-foreground)]">
            WaypointPlanner
          </h2>
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-[var(--muted)] rounded-md transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--muted)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--foreground)] px-3 py-2 rounded-md text-sm transition-colors"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--muted)] hover:bg-[var(--border)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--foreground)] px-3 py-2 rounded-md text-sm transition-colors"
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </button>
        </div>

        {/* Save/Load */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={exportProject}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--foreground)] px-3 py-2 rounded-md text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Load
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleLoadProject}
            className="hidden"
          />
        </div>

        {/* Grid Controls */}
        <div className="bg-[var(--muted)] p-2 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[var(--foreground)]">
              View
            </span>
            <button
              onClick={handleToggleGrid}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                state.grid.enabled
                  ? "bg-primary-500 text-white"
                  : "bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              <Grid3X3 className="w-3 h-3 inline mr-1" />
              Grid: {state.grid.enabled ? "On" : "Off"}
            </button>
          </div>

          {state.grid.enabled && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1 text-[var(--muted-foreground)]">
                <input
                  type="checkbox"
                  checked={state.grid.snapEnabled}
                  onChange={handleToggleSnap}
                  className="rounded"
                />
                Snap
              </label>
              <label className="flex items-center gap-1 text-[var(--muted-foreground)] ml-auto">
                Size:
                <input
                  type="number"
                  value={state.grid.size}
                  onChange={handleGridSizeChange}
                  step="0.5"
                  min="0.1"
                  className="w-14 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] px-1 py-0.5 rounded text-xs"
                />
                m
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Path Selector */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--border)]">
        <PathSelector />
      </div>

      {/* Waypoint List */}
      <div className="flex-1 min-h-0 p-4 overflow-hidden flex flex-col">
        <WaypointList />
      </div>

      {/* Editor Panel */}
      <div className="flex-shrink-0 p-4 border-t border-[var(--border)]">
        {state.selectedWaypointIndex !== -1 ? (
          <WaypointEditor />
        ) : state.selectedObstacleIndex !== -1 ? (
          <ObstacleEditor />
        ) : (
          <div className="text-center text-sm text-[var(--muted-foreground)] py-4">
            Select a waypoint or obstacle to edit
          </div>
        )}
      </div>

      {/* Export Button */}
      <div className="flex-shrink-0 p-4 border-t border-[var(--border)]">
        <button
          onClick={onOpenExport}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md font-medium transition-colors"
        >
          <FileCode className="w-5 h-5" />
          Export Java
        </button>
      </div>
    </div>
  );
}
