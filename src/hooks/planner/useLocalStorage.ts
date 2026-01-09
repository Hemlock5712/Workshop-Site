"use client";

import { useCallback, useEffect, useRef } from "react";
import { PlannerState, INITIAL_STATE } from "@/lib/planner/types";

const STORAGE_KEY = "waypointPlanner_autosave";

interface StoredData {
  paths: PlannerState["paths"];
  linkedWaypoints: PlannerState["linkedWaypoints"];
  obstacles: PlannerState["obstacles"];
  config: PlannerState["config"];
  fieldWidth: PlannerState["fieldWidth"];
  fieldImageSrc: PlannerState["fieldImageSrc"];
  grid: PlannerState["grid"];
}

export function useLocalStorage() {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load state from localStorage
   */
  const loadState = useCallback((): Partial<PlannerState> | null => {
    if (typeof window === "undefined") return null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const data: StoredData = JSON.parse(saved);

      return {
        paths: data.paths || INITIAL_STATE.paths,
        linkedWaypoints: data.linkedWaypoints || INITIAL_STATE.linkedWaypoints,
        obstacles: data.obstacles || INITIAL_STATE.obstacles,
        config: { ...INITIAL_STATE.config, ...(data.config || {}) },
        fieldWidth: data.fieldWidth ?? INITIAL_STATE.fieldWidth,
        fieldImageSrc: data.fieldImageSrc || INITIAL_STATE.fieldImageSrc,
        grid: { ...INITIAL_STATE.grid, ...(data.grid || {}) },
      };
    } catch (error) {
      console.error("Failed to load state from localStorage:", error);
      return null;
    }
  }, []);

  /**
   * Save state to localStorage (debounced)
   */
  const saveState = useCallback((state: PlannerState, immediate = false) => {
    if (typeof window === "undefined") return;

    const doSave = () => {
      try {
        const data: StoredData = {
          paths: state.paths,
          linkedWaypoints: state.linkedWaypoints,
          obstacles: state.obstacles,
          config: state.config,
          fieldWidth: state.fieldWidth,
          fieldImageSrc: state.fieldImageSrc,
          grid: state.grid,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save state to localStorage:", error);
      }
    };

    if (immediate) {
      doSave();
      return;
    }

    // Debounce saves to avoid excessive writes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(doSave, 500);
  }, []);

  /**
   * Clear saved state from localStorage
   */
  const clearState = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Export state as downloadable JSON file
   */
  const exportProject = useCallback((state: PlannerState) => {
    const data: StoredData = {
      paths: state.paths,
      linkedWaypoints: state.linkedWaypoints,
      obstacles: state.obstacles,
      config: state.config,
      fieldWidth: state.fieldWidth,
      fieldImageSrc: state.fieldImageSrc,
      grid: state.grid,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waypoint_project.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Import state from JSON file
   */
  const importProject = useCallback(
    (file: File): Promise<Partial<PlannerState>> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const result = e.target?.result;
            if (typeof result !== "string") {
              reject(new Error("Failed to read file"));
              return;
            }

            const data: StoredData = JSON.parse(result);

            resolve({
              paths: data.paths || INITIAL_STATE.paths,
              linkedWaypoints:
                data.linkedWaypoints || INITIAL_STATE.linkedWaypoints,
              obstacles: data.obstacles || INITIAL_STATE.obstacles,
              config: { ...INITIAL_STATE.config, ...(data.config || {}) },
              fieldWidth: data.fieldWidth ?? INITIAL_STATE.fieldWidth,
              fieldImageSrc: data.fieldImageSrc || INITIAL_STATE.fieldImageSrc,
              grid: { ...INITIAL_STATE.grid, ...(data.grid || {}) },
            });
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
    },
    []
  );

  /**
   * Load custom field image from file
   */
  const loadFieldImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Failed to read image"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });
  }, []);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    loadState,
    saveState,
    clearState,
    exportProject,
    importProject,
    loadFieldImage,
  };
}
