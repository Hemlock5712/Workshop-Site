/**
 * Local store for the Flywheel Playground.
 *
 * Five velocity-control gains + the commanded target RPM. Lives in its own
 * Zustand store so the user can flip back and forth between the arm and
 * flywheel playgrounds without their gains colliding.
 */

import { create } from "zustand";
import {
  DEFAULT_FLY_GAINS,
  DEFAULT_FLY_TARGET_RPM,
  type FlywheelGains,
} from "@/lib/flywheelPhysics";

interface FlywheelStoreState extends FlywheelGains {
  targetRpm: number;
  setKP: (v: number) => void;
  setKI: (v: number) => void;
  setKD: (v: number) => void;
  setKS: (v: number) => void;
  setKV: (v: number) => void;
  setGains: (g: Partial<FlywheelGains>) => void;
  setTargetRpm: (rpm: number) => void;
  reset: () => void;
}

export const useFlywheelStore = create<FlywheelStoreState>((set) => ({
  ...DEFAULT_FLY_GAINS,
  targetRpm: DEFAULT_FLY_TARGET_RPM,
  setKP: (v) => set({ kP: v }),
  setKI: (v) => set({ kI: v }),
  setKD: (v) => set({ kD: v }),
  setKS: (v) => set({ kS: v }),
  setKV: (v) => set({ kV: v }),
  setGains: (g) => set(g),
  setTargetRpm: (targetRpm) => set({ targetRpm }),
  reset: () =>
    set({
      ...DEFAULT_FLY_GAINS,
      targetRpm: DEFAULT_FLY_TARGET_RPM,
    }),
}));

/**
 * Which mechanism the playground is currently showing.
 * Persisted across the session so the user lands back where they were.
 */
interface MechanismToggleState {
  mechanism: "arm" | "flywheel";
  setMechanism: (m: "arm" | "flywheel") => void;
}

export const useMechanismToggle = create<MechanismToggleState>((set) => ({
  mechanism: "arm",
  setMechanism: (mechanism) => set({ mechanism }),
}));
