/**
 * Local store for the Elevator Playground. Mirrors the arm / flywheel stores
 * so each mechanism remembers its own gains when the user switches between
 * them.
 */

import { create } from "zustand";
import {
  DEFAULT_ELEV_GAINS,
  DEFAULT_ELEV_TARGET_M,
  type ElevatorGains,
} from "@/lib/elevatorPhysics";

interface ElevatorStoreState extends ElevatorGains {
  targetM: number;
  setKP: (v: number) => void;
  setKI: (v: number) => void;
  setKD: (v: number) => void;
  setKS: (v: number) => void;
  setKV: (v: number) => void;
  setKG: (v: number) => void;
  setGains: (g: Partial<ElevatorGains>) => void;
  setTargetM: (m: number) => void;
  reset: () => void;
}

export const useElevatorStore = create<ElevatorStoreState>((set) => ({
  ...DEFAULT_ELEV_GAINS,
  targetM: DEFAULT_ELEV_TARGET_M,
  setKP: (v) => set({ kP: v }),
  setKI: (v) => set({ kI: v }),
  setKD: (v) => set({ kD: v }),
  setKS: (v) => set({ kS: v }),
  setKV: (v) => set({ kV: v }),
  setKG: (v) => set({ kG: v }),
  setGains: (g) => set(g),
  setTargetM: (targetM) => set({ targetM }),
  reset: () =>
    set({
      ...DEFAULT_ELEV_GAINS,
      targetM: DEFAULT_ELEV_TARGET_M,
    }),
}));
