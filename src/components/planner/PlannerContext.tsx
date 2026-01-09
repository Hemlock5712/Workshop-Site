"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  useRef,
} from "react";
import {
  PlannerState,
  INITIAL_STATE,
  SimulationPose,
} from "@/lib/planner/types";
import {
  usePlannerState,
  PlannerActions,
} from "@/hooks/planner/usePlannerState";
import { useHistory } from "@/hooks/planner/useHistory";
import { useLocalStorage } from "@/hooks/planner/useLocalStorage";
import { runSimulation, getPoseAtTime } from "@/lib/planner/physics";

interface PlannerContextValue {
  state: PlannerState;
  actions: PlannerActions;
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveToHistory: () => void;
  // Persistence
  exportProject: () => void;
  importProject: (file: File) => Promise<void>;
  loadFieldImage: (file: File) => Promise<void>;
  // Playback
  playbackTime: number;
  setPlaybackTime: (time: number) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  ghostPose: SimulationPose | null;
  // Simulation
  runSimulationNow: () => void;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function usePlannerContext() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error("usePlannerContext must be used within a PlannerProvider");
  }
  return context;
}

interface PlannerProviderProps {
  children: React.ReactNode;
}

export function PlannerProvider({ children }: PlannerProviderProps) {
  const { state, actions } = usePlannerState(INITIAL_STATE);
  const history = useHistory();
  const storage = useLocalStorage();

  // Playback state
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastTimestampRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Track if initial load has happened
  const initialLoadRef = useRef(false);

  // Load saved state on mount
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const savedState = storage.loadState();
    if (savedState) {
      actions.setState(savedState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run simulation when waypoints, obstacles, or config change
  const runSimulationNow = useCallback(() => {
    const currentPath = state.paths[state.currentPathId];
    if (!currentPath || currentPath.points.length < 2) {
      actions.setSimulationResults({
        simulationPath: [],
        collisionDetected: false,
        collisionPoint: null,
        totalDuration: 0,
        pathLength: 0,
      });
      return;
    }

    const result = runSimulation(
      currentPath.points,
      state.linkedWaypoints,
      state.obstacles,
      state.config
    );

    actions.setSimulationResults({
      simulationPath: result.path,
      collisionDetected: result.collisionDetected,
      collisionPoint: result.collisionPoint,
      totalDuration: result.totalDuration,
      pathLength: result.pathLength,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.paths,
    state.currentPathId,
    state.linkedWaypoints,
    state.obstacles,
    state.config,
  ]);

  // Run simulation on relevant state changes
  useEffect(() => {
    runSimulationNow();
  }, [runSimulationNow]);

  // Save to localStorage on state changes
  useEffect(() => {
    if (initialLoadRef.current) {
      storage.saveState(state);
    }
  }, [state, storage]);

  // Ghost pose for playback
  const ghostPose = getPoseAtTime(state.simulationPath, playbackTime);

  // Playback animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }

      const dt = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setPlaybackTime((prev) => {
        const next = prev + dt;
        if (next > state.totalDuration) {
          return 0; // Loop
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimestampRef.current = 0;
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, state.totalDuration]);

  // Reset playback time when path changes
  useEffect(() => {
    setPlaybackTime(0);
    setIsPlaying(false);
  }, [state.currentPathId]);

  // History management
  const saveToHistory = useCallback(() => {
    history.saveHistory(state);
    storage.saveState(state, true);
  }, [history, state, storage]);

  const undo = useCallback(() => {
    const snapshot = history.undo();
    if (snapshot) {
      actions.setState({
        paths: snapshot.paths,
        linkedWaypoints: snapshot.linkedWaypoints,
        obstacles: snapshot.obstacles,
        selectedWaypointIndex: -1,
        selectedObstacleIndex: -1,
      });
    }
  }, [history, actions]);

  const redo = useCallback(() => {
    const snapshot = history.redo();
    if (snapshot) {
      actions.setState({
        paths: snapshot.paths,
        linkedWaypoints: snapshot.linkedWaypoints,
        obstacles: snapshot.obstacles,
        selectedWaypointIndex: -1,
        selectedObstacleIndex: -1,
      });
    }
  }, [history, actions]);

  // Export/import
  const exportProject = useCallback(() => {
    storage.exportProject(state);
  }, [storage, state]);

  const importProject = useCallback(
    async (file: File) => {
      const loadedState = await storage.importProject(file);
      actions.setState(loadedState);
      history.clearHistory();
      history.saveHistory({ ...state, ...loadedState } as PlannerState);
    },
    [storage, actions, history, state]
  );

  const loadFieldImage = useCallback(
    async (file: File) => {
      const dataUrl = await storage.loadFieldImage(file);
      actions.setFieldImage(dataUrl);
      saveToHistory();
    },
    [storage, actions, saveToHistory]
  );

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const value: PlannerContextValue = {
    state,
    actions,
    undo,
    redo,
    canUndo: history.canUndo(),
    canRedo: history.canRedo(),
    saveToHistory,
    exportProject,
    importProject,
    loadFieldImage,
    playbackTime,
    setPlaybackTime,
    isPlaying,
    togglePlay,
    ghostPose,
    runSimulationNow,
  };

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}
