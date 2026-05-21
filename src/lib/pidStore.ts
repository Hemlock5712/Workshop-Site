/**
 * Local store for the PID Playground.
 *
 * Lives separately from React state so we can hand the same gains to a future
 * 3D arm coupling (Phase 2) and a possible Web Worker (Phase 3) without
 * threading props through every consumer. For v0.5 it backs the six gain
 * sliders on /pid-control.
 */

import { create } from "zustand";
import { DEFAULT_GAINS, type ControllerGains } from "@/lib/pidPhysics";

interface PidStoreState extends ControllerGains {
  setKP: (v: number) => void;
  setKI: (v: number) => void;
  setKD: (v: number) => void;
  setKS: (v: number) => void;
  setKV: (v: number) => void;
  setKG: (v: number) => void;
  setGains: (g: Partial<ControllerGains>) => void;
  reset: () => void;
}

export const usePidStore = create<PidStoreState>((set) => ({
  ...DEFAULT_GAINS,
  setKP: (v) => set({ kP: v }),
  setKI: (v) => set({ kI: v }),
  setKD: (v) => set({ kD: v }),
  setKS: (v) => set({ kS: v }),
  setKV: (v) => set({ kV: v }),
  setKG: (v) => set({ kG: v }),
  setGains: (g) => set(g),
  reset: () => set({ ...DEFAULT_GAINS }),
}));
