/**
 * Local store for the PID Playground.
 *
 * Six controller gains + the chosen target angle for the hold scenario.
 * Lives outside React state so future Phase 2 / Phase 3 consumers (3D arm
 * coupling, a Web Worker physics tick) can read the same data without prop
 * drilling.
 */

import { create } from "zustand";
import {
  DEFAULT_GAINS,
  DEFAULT_TARGET_DEG,
  type ControllerGains,
} from "@/lib/pidPhysics";

interface PidStoreState extends ControllerGains {
  targetDeg: number;
  setKP: (v: number) => void;
  setKI: (v: number) => void;
  setKD: (v: number) => void;
  setKS: (v: number) => void;
  setKV: (v: number) => void;
  setKG: (v: number) => void;
  setGains: (g: Partial<ControllerGains>) => void;
  setTargetDeg: (d: number) => void;
  reset: () => void;
}

export const usePidStore = create<PidStoreState>((set) => ({
  ...DEFAULT_GAINS,
  targetDeg: DEFAULT_TARGET_DEG,
  setKP: (v) => set({ kP: v }),
  setKI: (v) => set({ kI: v }),
  setKD: (v) => set({ kD: v }),
  setKS: (v) => set({ kS: v }),
  setKV: (v) => set({ kV: v }),
  setKG: (v) => set({ kG: v }),
  setGains: (g) => set(g),
  setTargetDeg: (targetDeg) => set({ targetDeg }),
  reset: () =>
    set({
      ...DEFAULT_GAINS,
      targetDeg: DEFAULT_TARGET_DEG,
    }),
}));
