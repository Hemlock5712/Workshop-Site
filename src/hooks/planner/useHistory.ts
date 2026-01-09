"use client";

import { useCallback, useRef } from "react";
import { PlannerState } from "@/lib/planner/types";

interface HistorySnapshot {
  paths: PlannerState["paths"];
  linkedWaypoints: PlannerState["linkedWaypoints"];
  obstacles: PlannerState["obstacles"];
}

interface UseHistoryOptions {
  maxHistory?: number;
}

export function useHistory(options: UseHistoryOptions = {}) {
  const { maxHistory = 100 } = options;

  const historyRef = useRef<string[]>([]);
  const historyStepRef = useRef(-1);

  /**
   * Create a snapshot of the current state for history
   */
  const createSnapshot = useCallback((state: PlannerState): string => {
    const snapshot: HistorySnapshot = {
      paths: state.paths,
      linkedWaypoints: state.linkedWaypoints,
      obstacles: state.obstacles,
    };
    return JSON.stringify(snapshot);
  }, []);

  /**
   * Parse a snapshot back into state
   */
  const parseSnapshot = useCallback((snapshot: string): HistorySnapshot => {
    return JSON.parse(snapshot);
  }, []);

  /**
   * Save the current state to history
   */
  const saveHistory = useCallback(
    (state: PlannerState) => {
      const snapshot = createSnapshot(state);

      // If we're not at the end of history, truncate future states
      if (historyStepRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(
          0,
          historyStepRef.current + 1
        );
      }

      // Add new snapshot
      historyRef.current.push(snapshot);
      historyStepRef.current = historyRef.current.length - 1;

      // Trim history if it exceeds max
      if (historyRef.current.length > maxHistory) {
        historyRef.current = historyRef.current.slice(-maxHistory);
        historyStepRef.current = historyRef.current.length - 1;
      }
    },
    [createSnapshot, maxHistory]
  );

  /**
   * Undo to previous state
   * Returns the previous state snapshot or null if at beginning
   */
  const undo = useCallback((): HistorySnapshot | null => {
    if (historyStepRef.current > 0) {
      historyStepRef.current--;
      return parseSnapshot(historyRef.current[historyStepRef.current]);
    }
    return null;
  }, [parseSnapshot]);

  /**
   * Redo to next state
   * Returns the next state snapshot or null if at end
   */
  const redo = useCallback((): HistorySnapshot | null => {
    if (historyStepRef.current < historyRef.current.length - 1) {
      historyStepRef.current++;
      return parseSnapshot(historyRef.current[historyStepRef.current]);
    }
    return null;
  }, [parseSnapshot]);

  /**
   * Check if undo is available
   */
  const canUndo = useCallback(() => {
    return historyStepRef.current > 0;
  }, []);

  /**
   * Check if redo is available
   */
  const canRedo = useCallback(() => {
    return historyStepRef.current < historyRef.current.length - 1;
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    historyRef.current = [];
    historyStepRef.current = -1;
  }, []);

  /**
   * Get current history position info
   */
  const getHistoryInfo = useCallback(() => {
    return {
      current: historyStepRef.current,
      total: historyRef.current.length,
    };
  }, []);

  return {
    saveHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getHistoryInfo,
  };
}
