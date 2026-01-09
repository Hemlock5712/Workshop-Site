"use client";

import { useReducer, useCallback } from "react";
import {
  PlannerState,
  PlannerAction,
  INITIAL_STATE,
  Waypoint,
  Obstacle,
  DEFAULT_CONFIG,
  MOTOR_PRESETS,
} from "@/lib/planner/types";

function plannerReducer(
  state: PlannerState,
  action: PlannerAction
): PlannerState {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, ...action.payload };

    case "RESTORE_STATE":
      return action.payload;

    case "ADD_WAYPOINT": {
      const { x, y } = action.payload;
      const currentPath = state.paths[state.currentPathId];
      const newWaypoint: Waypoint = {
        name: `WP_${currentPath.points.length + 1}`,
        x,
        y,
        rot: 0,
        isLinked: false,
      };
      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            points: [...currentPath.points, newWaypoint],
          },
        },
        selectedWaypointIndex: currentPath.points.length,
        selectedObstacleIndex: -1,
      };
    }

    case "UPDATE_WAYPOINT": {
      const { index, updates } = action.payload;
      const currentPath = state.paths[state.currentPathId];
      const waypoint = currentPath.points[index];
      if (!waypoint) return state;

      // Handle linked waypoint updates
      let newLinkedWaypoints = state.linkedWaypoints;
      if (waypoint.isLinked && state.linkedWaypoints[waypoint.name]) {
        // Update the linked waypoint data
        if (
          updates.x !== undefined ||
          updates.y !== undefined ||
          updates.rot !== undefined
        ) {
          newLinkedWaypoints = {
            ...state.linkedWaypoints,
            [waypoint.name]: {
              ...state.linkedWaypoints[waypoint.name],
              ...(updates.x !== undefined ? { x: updates.x } : {}),
              ...(updates.y !== undefined ? { y: updates.y } : {}),
              ...(updates.rot !== undefined ? { rot: updates.rot } : {}),
            },
          };
        }
        // Handle name change for linked waypoint
        if (updates.name !== undefined && updates.name !== waypoint.name) {
          const oldName = waypoint.name;
          const newName = updates.name;
          const linkedData = newLinkedWaypoints[oldName];
          delete newLinkedWaypoints[oldName];
          newLinkedWaypoints[newName] = linkedData;

          // Update all references to this linked waypoint across all paths
          const newPaths = { ...state.paths };
          Object.keys(newPaths).forEach((pathId) => {
            newPaths[pathId] = {
              ...newPaths[pathId],
              points: newPaths[pathId].points.map((p) =>
                p.isLinked && p.name === oldName ? { ...p, name: newName } : p
              ),
            };
          });
          return {
            ...state,
            paths: newPaths,
            linkedWaypoints: newLinkedWaypoints,
          };
        }
      }

      const newPoints = [...currentPath.points];
      newPoints[index] = { ...waypoint, ...updates };

      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            points: newPoints,
          },
        },
        linkedWaypoints: newLinkedWaypoints,
      };
    }

    case "DELETE_WAYPOINT": {
      const { index } = action.payload;
      const currentPath = state.paths[state.currentPathId];
      const newPoints = currentPath.points.filter((_, i) => i !== index);
      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            points: newPoints,
          },
        },
        selectedWaypointIndex: -1,
      };
    }

    case "SELECT_WAYPOINT":
      return {
        ...state,
        selectedWaypointIndex: action.payload.index,
        selectedObstacleIndex: -1,
        isDrawingPolygon: false,
      };

    case "INSERT_WAYPOINT_AFTER": {
      const { index } = action.payload;
      const currentPath = state.paths[state.currentPathId];
      const pts = currentPath.points;
      if (index < 0 || index >= pts.length) return state;

      const curr = pts[index];
      const currData =
        curr.isLinked && state.linkedWaypoints[curr.name]
          ? state.linkedWaypoints[curr.name]
          : curr;

      let nextData = { x: currData.x + 0.5, y: currData.y, rot: currData.rot };
      if (index + 1 < pts.length) {
        const next = pts[index + 1];
        nextData =
          next.isLinked && state.linkedWaypoints[next.name]
            ? state.linkedWaypoints[next.name]
            : next;
      }

      const newWaypoint: Waypoint = {
        name: `WP_${Date.now().toString().slice(-4)}`,
        x: (currData.x + nextData.x) / 2,
        y: (currData.y + nextData.y) / 2,
        rot: currData.rot,
        isLinked: false,
      };

      const newPoints = [...pts];
      newPoints.splice(index + 1, 0, newWaypoint);

      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            points: newPoints,
          },
        },
        selectedWaypointIndex: index + 1,
      };
    }

    case "TOGGLE_WAYPOINT_LINK": {
      const { index } = action.payload;
      const currentPath = state.paths[state.currentPathId];
      const waypoint = currentPath.points[index];
      if (!waypoint) return state;

      const newIsLinked = !waypoint.isLinked;
      let newLinkedWaypoints = { ...state.linkedWaypoints };

      if (newIsLinked && !newLinkedWaypoints[waypoint.name]) {
        newLinkedWaypoints[waypoint.name] = {
          x: waypoint.x,
          y: waypoint.y,
          rot: waypoint.rot,
        };
      }

      const newPoints = [...currentPath.points];
      newPoints[index] = { ...waypoint, isLinked: newIsLinked };

      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            points: newPoints,
          },
        },
        linkedWaypoints: newLinkedWaypoints,
      };
    }

    case "APPLY_EXISTING_LINK": {
      const { index, linkName } = action.payload;
      const currentPath = state.paths[state.currentPathId];
      if (!state.linkedWaypoints[linkName]) return state;

      const newPoints = [...currentPath.points];
      newPoints[index] = {
        ...newPoints[index],
        name: linkName,
        isLinked: true,
      };

      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            points: newPoints,
          },
        },
      };
    }

    case "ADD_OBSTACLE": {
      const { type } = action.payload;
      const name = `Obs ${state.obstacles.length + 1}`;
      let newObstacle: Obstacle;

      if (type === "rectangle") {
        newObstacle = { type: "rectangle", name, x: 4, y: 4, w: 1, h: 1 };
      } else if (type === "circle") {
        newObstacle = { type: "circle", name, x: 4, y: 4, r: 0.5 };
      } else {
        // Polygon - start with empty points, will be filled by polygon drawing
        newObstacle = { type: "polygon", name, x: 4, y: 4, points: [] };
      }

      return {
        ...state,
        obstacles: [...state.obstacles, newObstacle],
        selectedObstacleIndex: state.obstacles.length,
        selectedWaypointIndex: -1,
      };
    }

    case "UPDATE_OBSTACLE": {
      const { index, updates } = action.payload;
      const newObstacles = [...state.obstacles];
      newObstacles[index] = { ...newObstacles[index], ...updates } as Obstacle;
      return { ...state, obstacles: newObstacles };
    }

    case "DELETE_OBSTACLE": {
      const { index } = action.payload;
      return {
        ...state,
        obstacles: state.obstacles.filter((_, i) => i !== index),
        selectedObstacleIndex: -1,
      };
    }

    case "SELECT_OBSTACLE":
      return {
        ...state,
        selectedObstacleIndex: action.payload.index,
        selectedWaypointIndex: -1,
        isDrawingPolygon: false,
      };

    case "START_POLYGON_DRAWING":
      return {
        ...state,
        isDrawingPolygon: true,
        tempPolygonPoints: [],
        selectedWaypointIndex: -1,
        selectedObstacleIndex: -1,
      };

    case "ADD_POLYGON_POINT":
      return {
        ...state,
        tempPolygonPoints: [...state.tempPolygonPoints, action.payload],
      };

    case "FINISH_POLYGON": {
      if (state.tempPolygonPoints.length < 3) {
        return {
          ...state,
          isDrawingPolygon: false,
          tempPolygonPoints: [],
        };
      }

      // Calculate centroid
      let cx = 0,
        cy = 0;
      state.tempPolygonPoints.forEach((p) => {
        cx += p.x;
        cy += p.y;
      });
      cx /= state.tempPolygonPoints.length;
      cy /= state.tempPolygonPoints.length;

      const newObstacle: Obstacle = {
        type: "polygon",
        name: `Poly ${state.obstacles.length + 1}`,
        x: cx,
        y: cy,
        points: [...state.tempPolygonPoints],
      };

      return {
        ...state,
        obstacles: [...state.obstacles, newObstacle],
        selectedObstacleIndex: state.obstacles.length,
        isDrawingPolygon: false,
        tempPolygonPoints: [],
      };
    }

    case "CANCEL_POLYGON":
      return {
        ...state,
        isDrawingPolygon: false,
        tempPolygonPoints: [],
      };

    case "CREATE_PATH": {
      const newId = `p${Date.now()}`;
      return {
        ...state,
        paths: {
          ...state.paths,
          [newId]: { name: "New Path", points: [] },
        },
        currentPathId: newId,
        selectedWaypointIndex: -1,
        selectedObstacleIndex: -1,
      };
    }

    case "DELETE_PATH": {
      const pathKeys = Object.keys(state.paths);
      if (pathKeys.length === 0) return state;

      const newPaths = { ...state.paths };
      delete newPaths[state.currentPathId];

      let newCurrentPathId: string;
      if (Object.keys(newPaths).length === 0) {
        const newId = `p${Date.now()}`;
        newPaths[newId] = { name: "New Path", points: [] };
        newCurrentPathId = newId;
      } else {
        newCurrentPathId = Object.keys(newPaths)[0];
      }

      return {
        ...state,
        paths: newPaths,
        currentPathId: newCurrentPathId,
        selectedWaypointIndex: -1,
        selectedObstacleIndex: -1,
      };
    }

    case "DUPLICATE_PATH": {
      const sourcePath = state.paths[state.currentPathId];
      const newId = `p${Date.now()}`;
      return {
        ...state,
        paths: {
          ...state.paths,
          [newId]: {
            name: `${sourcePath.name} (Copy)`,
            points: sourcePath.points.map((wp) => ({ ...wp })),
          },
        },
        currentPathId: newId,
        selectedWaypointIndex: -1,
      };
    }

    case "REVERSE_PATH": {
      const currentPath = state.paths[state.currentPathId];
      if (currentPath.points.length < 2) return state;

      const reversedPoints = [...currentPath.points].reverse().map((wp, i) => ({
        ...wp,
        name: wp.name.startsWith("WP_") ? `WP_${i + 1}` : wp.name,
      }));

      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            points: reversedPoints,
          },
        },
        selectedWaypointIndex: -1,
      };
    }

    case "SWITCH_PATH":
      if (!state.paths[action.payload.pathId]) return state;
      return {
        ...state,
        currentPathId: action.payload.pathId,
        selectedWaypointIndex: -1,
        selectedObstacleIndex: -1,
        isDrawingPolygon: false,
      };

    case "RENAME_PATH": {
      const currentPath = state.paths[state.currentPathId];
      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            name: action.payload.name,
          },
        },
      };
    }

    case "UPDATE_CONFIG":
      return {
        ...state,
        config: { ...state.config, ...action.payload },
      };

    case "SET_MOTOR_PRESET": {
      const preset = MOTOR_PRESETS[action.payload.preset];
      if (!preset) return state;
      return {
        ...state,
        config: {
          ...state.config,
          motorStallTorque: preset.stallTorque,
          motorFreeSpeedRpm: preset.freeSpeedRpm,
          motorStallCurrent: preset.stallCurrent,
        },
      };
    }

    case "UPDATE_VIEW":
      return {
        ...state,
        view: { ...state.view, ...action.payload },
      };

    case "UPDATE_GRID":
      return {
        ...state,
        grid: { ...state.grid, ...action.payload },
      };

    case "SET_FIELD_WIDTH":
      return {
        ...state,
        fieldWidth: action.payload.width,
      };

    case "SET_FIELD_IMAGE":
      return {
        ...state,
        fieldImageSrc: action.payload.src,
      };

    case "SET_SIMULATION_RESULTS":
      return {
        ...state,
        simulationPath: action.payload.simulationPath,
        collisionDetected: action.payload.collisionDetected,
        collisionPoint: action.payload.collisionPoint,
        totalDuration: action.payload.totalDuration,
        pathLength: action.payload.pathLength,
      };

    case "MOVE_WAYPOINT": {
      const { index, x, y } = action.payload;
      const currentPath = state.paths[state.currentPathId];
      const waypoint = currentPath.points[index];
      if (!waypoint) return state;

      if (waypoint.isLinked && state.linkedWaypoints[waypoint.name]) {
        return {
          ...state,
          linkedWaypoints: {
            ...state.linkedWaypoints,
            [waypoint.name]: {
              ...state.linkedWaypoints[waypoint.name],
              x,
              y,
            },
          },
        };
      }

      const newPoints = [...currentPath.points];
      newPoints[index] = { ...waypoint, x, y };
      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            points: newPoints,
          },
        },
      };
    }

    case "ROTATE_WAYPOINT": {
      const { index, rot } = action.payload;
      const currentPath = state.paths[state.currentPathId];
      const waypoint = currentPath.points[index];
      if (!waypoint) return state;

      if (waypoint.isLinked && state.linkedWaypoints[waypoint.name]) {
        return {
          ...state,
          linkedWaypoints: {
            ...state.linkedWaypoints,
            [waypoint.name]: {
              ...state.linkedWaypoints[waypoint.name],
              rot,
            },
          },
        };
      }

      const newPoints = [...currentPath.points];
      newPoints[index] = { ...waypoint, rot };
      return {
        ...state,
        paths: {
          ...state.paths,
          [state.currentPathId]: {
            ...currentPath,
            points: newPoints,
          },
        },
      };
    }

    case "MOVE_OBSTACLE": {
      const { index, x, y } = action.payload;
      const obstacle = state.obstacles[index];
      if (!obstacle) return state;

      const newObstacles = [...state.obstacles];

      if (obstacle.type === "polygon" && obstacle.points) {
        const dx = x - obstacle.x;
        const dy = y - obstacle.y;
        newObstacles[index] = {
          ...obstacle,
          x,
          y,
          points: obstacle.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
        };
      } else {
        newObstacles[index] = { ...obstacle, x, y } as Obstacle;
      }

      return { ...state, obstacles: newObstacles };
    }

    case "CLEAR_SELECTION":
      return {
        ...state,
        selectedWaypointIndex: -1,
        selectedObstacleIndex: -1,
      };

    default:
      return state;
  }
}

export function usePlannerState(initialState: PlannerState = INITIAL_STATE) {
  const [state, dispatch] = useReducer(plannerReducer, initialState);

  const actions = {
    setState: useCallback(
      (payload: Partial<PlannerState>) =>
        dispatch({ type: "SET_STATE", payload }),
      []
    ),
    restoreState: useCallback(
      (payload: PlannerState) => dispatch({ type: "RESTORE_STATE", payload }),
      []
    ),
    addWaypoint: useCallback(
      (x: number, y: number) =>
        dispatch({ type: "ADD_WAYPOINT", payload: { x, y } }),
      []
    ),
    updateWaypoint: useCallback(
      (index: number, updates: Partial<Waypoint>) =>
        dispatch({ type: "UPDATE_WAYPOINT", payload: { index, updates } }),
      []
    ),
    deleteWaypoint: useCallback(
      (index: number) =>
        dispatch({ type: "DELETE_WAYPOINT", payload: { index } }),
      []
    ),
    selectWaypoint: useCallback(
      (index: number) =>
        dispatch({ type: "SELECT_WAYPOINT", payload: { index } }),
      []
    ),
    insertWaypointAfter: useCallback(
      (index: number) =>
        dispatch({ type: "INSERT_WAYPOINT_AFTER", payload: { index } }),
      []
    ),
    toggleWaypointLink: useCallback(
      (index: number) =>
        dispatch({ type: "TOGGLE_WAYPOINT_LINK", payload: { index } }),
      []
    ),
    applyExistingLink: useCallback(
      (index: number, linkName: string) =>
        dispatch({ type: "APPLY_EXISTING_LINK", payload: { index, linkName } }),
      []
    ),
    addObstacle: useCallback(
      (type: "rectangle" | "circle" | "polygon") =>
        dispatch({ type: "ADD_OBSTACLE", payload: { type } }),
      []
    ),
    updateObstacle: useCallback(
      (index: number, updates: Partial<Obstacle>) =>
        dispatch({ type: "UPDATE_OBSTACLE", payload: { index, updates } }),
      []
    ),
    deleteObstacle: useCallback(
      (index: number) =>
        dispatch({ type: "DELETE_OBSTACLE", payload: { index } }),
      []
    ),
    selectObstacle: useCallback(
      (index: number) =>
        dispatch({ type: "SELECT_OBSTACLE", payload: { index } }),
      []
    ),
    startPolygonDrawing: useCallback(
      () => dispatch({ type: "START_POLYGON_DRAWING" }),
      []
    ),
    addPolygonPoint: useCallback(
      (point: { x: number; y: number }) =>
        dispatch({ type: "ADD_POLYGON_POINT", payload: point }),
      []
    ),
    finishPolygon: useCallback(() => dispatch({ type: "FINISH_POLYGON" }), []),
    cancelPolygon: useCallback(() => dispatch({ type: "CANCEL_POLYGON" }), []),
    createPath: useCallback(() => dispatch({ type: "CREATE_PATH" }), []),
    deletePath: useCallback(() => dispatch({ type: "DELETE_PATH" }), []),
    duplicatePath: useCallback(() => dispatch({ type: "DUPLICATE_PATH" }), []),
    reversePath: useCallback(() => dispatch({ type: "REVERSE_PATH" }), []),
    switchPath: useCallback(
      (pathId: string) =>
        dispatch({ type: "SWITCH_PATH", payload: { pathId } }),
      []
    ),
    renamePath: useCallback(
      (name: string) => dispatch({ type: "RENAME_PATH", payload: { name } }),
      []
    ),
    updateConfig: useCallback(
      (updates: Partial<typeof DEFAULT_CONFIG>) =>
        dispatch({ type: "UPDATE_CONFIG", payload: updates }),
      []
    ),
    setMotorPreset: useCallback(
      (preset: string) =>
        dispatch({ type: "SET_MOTOR_PRESET", payload: { preset } }),
      []
    ),
    updateView: useCallback(
      (updates: Partial<PlannerState["view"]>) =>
        dispatch({ type: "UPDATE_VIEW", payload: updates }),
      []
    ),
    updateGrid: useCallback(
      (updates: Partial<PlannerState["grid"]>) =>
        dispatch({ type: "UPDATE_GRID", payload: updates }),
      []
    ),
    setFieldWidth: useCallback(
      (width: number) =>
        dispatch({ type: "SET_FIELD_WIDTH", payload: { width } }),
      []
    ),
    setFieldImage: useCallback(
      (src: string) => dispatch({ type: "SET_FIELD_IMAGE", payload: { src } }),
      []
    ),
    setSimulationResults: useCallback(
      (results: {
        simulationPath: PlannerState["simulationPath"];
        collisionDetected: boolean;
        collisionPoint: PlannerState["collisionPoint"];
        totalDuration: number;
        pathLength: number;
      }) => dispatch({ type: "SET_SIMULATION_RESULTS", payload: results }),
      []
    ),
    moveWaypoint: useCallback(
      (index: number, x: number, y: number) =>
        dispatch({ type: "MOVE_WAYPOINT", payload: { index, x, y } }),
      []
    ),
    rotateWaypoint: useCallback(
      (index: number, rot: number) =>
        dispatch({ type: "ROTATE_WAYPOINT", payload: { index, rot } }),
      []
    ),
    moveObstacle: useCallback(
      (index: number, x: number, y: number) =>
        dispatch({ type: "MOVE_OBSTACLE", payload: { index, x, y } }),
      []
    ),
    clearSelection: useCallback(
      () => dispatch({ type: "CLEAR_SELECTION" }),
      []
    ),
  };

  return { state, dispatch, actions };
}

export type PlannerActions = ReturnType<typeof usePlannerState>["actions"];
