import { describe, expect, it } from "vitest";
import {
  ELEV_SLIDER_RANGES,
  ELEV_TARGET_RANGE_M,
  elevatorPhysicsFor,
  simulateElevatorResponse,
  type ElevatorGains,
} from "./elevatorPhysics";

/** kG ≈ m·g·r / (Kₜ·R) ≈ 0.22 V for the 8 kg carriage on a 15:1 X60. */
const TUNED: ElevatorGains = {
  kP: 20,
  kI: 0,
  kD: 0,
  kS: 0.1,
  kV: 0,
  kG: 0.22,
};

function allFinite(...arrays: Float64Array[]) {
  return arrays.every((a) => a.every((x) => Number.isFinite(x)));
}

function corners(): ElevatorGains[] {
  const keys = Object.keys(ELEV_SLIDER_RANGES) as (keyof ElevatorGains)[];
  return [
    Object.fromEntries(keys.map((k) => [k, ELEV_SLIDER_RANGES[k].min])),
    Object.fromEntries(keys.map((k) => [k, ELEV_SLIDER_RANGES[k].max])),
  ] as unknown as ElevatorGains[];
}

describe("elevator step response", () => {
  it("settles near the target with sane gains", () => {
    const { metrics } = simulateElevatorResponse(elevatorPhysicsFor(1), TUNED);
    expect(metrics.regime).toBe("stable");
    expect(metrics.settlingTime).not.toBeNull();
    expect(metrics.settlingTime!).toBeLessThan(4);
    expect(metrics.steadyStateErrorM).toBeLessThan(0.005);
    expect(metrics.overshootM).toBeLessThan(0.01);
  });

  it("stops short of the target when kP is too low to beat friction", () => {
    const { metrics } = simulateElevatorResponse(elevatorPhysicsFor(1), {
      ...TUNED,
      kP: 5,
    });
    expect(metrics.regime).toBe("drifting");
    expect(metrics.steadyStateErrorM).toBeGreaterThan(0.1);
  });

  it("shrinks steady-state error as kP rises", () => {
    const sse = [5, 10, 20].map(
      (kP) =>
        simulateElevatorResponse(elevatorPhysicsFor(1), { ...TUNED, kP })
          .metrics.steadyStateErrorM
    );
    expect(sse[1]).toBeLessThan(sse[0]!);
    expect(sse[2]).toBeLessThan(sse[1]!);
  });

  it("overshoots more as kI rises", () => {
    const overshoot = [0, 5, 20].map(
      (kI) =>
        simulateElevatorResponse(elevatorPhysicsFor(1), { ...TUNED, kI })
          .metrics.overshootM
    );
    expect(overshoot[1]).toBeGreaterThan(overshoot[0]!);
    expect(overshoot[2]).toBeGreaterThan(overshoot[1]!);
  });

  it("stays finite at every slider extreme", () => {
    for (const gains of corners()) {
      for (const m of [ELEV_TARGET_RANGE_M.min, ELEV_TARGET_RANGE_M.max]) {
        const r = simulateElevatorResponse(elevatorPhysicsFor(m), gains);
        expect(allFinite(r.t, r.positionM, r.targetM, r.voltage)).toBe(true);
        expect(Number.isFinite(r.metrics.overshootM)).toBe(true);
        expect(Number.isFinite(r.metrics.steadyStateErrorM)).toBe(true);
      }
    }
  });
});
