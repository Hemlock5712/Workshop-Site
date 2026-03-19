"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  PlannerProvider,
  usePlannerContext,
} from "@/components/planner/PlannerContext";
import { PlannerCanvas } from "@/components/planner/PlannerCanvas";
import { PlannerSidebar } from "@/components/planner/PlannerSidebar";
import { PlaybackBar } from "@/components/planner/PlaybackBar";
import { SettingsModal } from "@/components/planner/SettingsModal";
import { CodeExportModal } from "@/components/planner/CodeExportModal";

function WaypointPlannerContent() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const {
    state,
    actions,
    undo,
    redo,
    togglePlay,
    saveToHistory,
    exportProject,
  } = usePlannerContext();

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Escape - cancel polygon drawing or clear selection
      if (e.key === "Escape") {
        if (state.isDrawingPolygon) {
          actions.cancelPolygon();
        } else {
          actions.clearSelection();
        }
        return;
      }

      // Delete/Backspace - delete selected
      if (e.key === "Delete" || e.key === "Backspace") {
        if (state.selectedWaypointIndex !== -1) {
          actions.deleteWaypoint(state.selectedWaypointIndex);
          saveToHistory();
        } else if (state.selectedObstacleIndex !== -1) {
          actions.deleteObstacle(state.selectedObstacleIndex);
          saveToHistory();
        }
        return;
      }

      // Space - toggle play
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
        return;
      }

      // Ctrl+S - save project
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        exportProject();
        return;
      }

      // Ctrl+Z - undo
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y - redo
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }
    },
    [state, actions, undo, redo, togglePlay, saveToHistory, exportProject]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <PlannerSidebar
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenExport={() => setExportOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <PlannerCanvas />

          {/* Polygon drawing hint */}
          {state.isDrawingPolygon && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-black px-4 py-2 rounded-lg font-medium text-sm shadow-lg">
              Click to add points. Right-click or press Escape to finish.
            </div>
          )}
        </div>

        {/* Playback Bar */}
        <PlaybackBar />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <CodeExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </div>
  );
}

export function WaypointPlanner() {
  return (
    <PlannerProvider>
      <WaypointPlannerContent />
    </PlannerProvider>
  );
}
