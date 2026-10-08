import { describe, expect, it } from "vitest";
import {
  SLIDER_RANGES,
  TARGET_RANGE_DEG,
  physicsFor,
  simulateStepResponse,
  type ControllerGains,
} from "./pidPhysics";

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Feedforward a student would land on for the bench arm: kG ≈ mgL / (Kₜ·R). */
const TUNED: ControllerGains = {
  kP: 20,
  kI: 0,
  kD: 0,
  kS: 0.1,
  kV: 0,
  kG: 0.8,
};

function allFinite(...arrays: Float64Array[]) {
  return arrays.every((a) => a.every((x) => Number.isFinite(x)));
}

function corners(): ControllerGains[] {
  const keys = Object.keys(SLIDER_RANGES) as (keyof ControllerGains)[];
  return [
    Object.fromEntries(keys.map((k) => [k, SLIDER_RANGES[k].min])),
    Object.fromEntries(keys.map((k) => [k, SLIDER_RANGES[k].max])),
  ] as unknown as ControllerGains[];
}

describe("arm step response", () => {
  it("settles near the target with sane gains", () => {
    const { metrics } = simulateStepResponse(physicsFor(rad(45)), TUNED);
    expect(metrics.regime).toBe("stable");
    expect(metrics.settlingTime).not.toBeNull();
    expect(metrics.settlingTime!).toBeLessThan(2);
    expect(metrics.steadyStateErrorDeg).toBeLessThan(0.5);
    expect(metrics.overshootDeg).toBeLessThan(3);
  });

  it("overshoots more as kP rises", () => {
    const overshoot = [20, 40, 80, 150].map(
      (kP) =>
        simulateStepResponse(physicsFor(rad(45)), { ...TUNED, kP }).metrics
          .overshootDeg
    );
    for (let i = 1; i < overshoot.length; i++) {
      expect(overshoot[i]).toBeGreaterThan(overshoot[i - 1]!);
    }
    expect(
      simulateStepResponse(physicsFor(rad(45)), { ...TUNED, kP: 80 }).metrics
        .regime
    ).toBe("oscillating");
  });

  it("damps overshoot as kD rises", () => {
    const at = (kD: number) =>
      simulateStepResponse(physicsFor(rad(45)), { ...TUNED, kP: 40, kD })
        .metrics.overshootDeg;
    expect(at(1)).toBeLessThan(at(0));
  });

  it("never commands more than the supply voltage", () => {
    const { voltage } = simulateStepResponse(physicsFor(rad(90)), {
      ...TUNED,
      kP: SLIDER_RANGES.kP.max,
    });
    expect(Math.max(...voltage.map(Math.abs))).toBeLessThanOrEqual(12);
  });

  it("stays finite at every slider extreme", () => {
    for (const gains of corners()) {
      for (const deg of [TARGET_RANGE_DEG.min, 0, TARGET_RANGE_DEG.max]) {
        const r = simulateStepResponse(physicsFor(rad(deg)), gains);
        expect(allFinite(r.t, r.theta, r.setpoint, r.voltage)).toBe(true);
        expect(Number.isFinite(r.metrics.overshootDeg)).toBe(true);
        expect(Number.isFinite(r.metrics.steadyStateErrorDeg)).toBe(true);
      }
    }
  });
});
