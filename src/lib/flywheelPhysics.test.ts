import { describe, expect, it } from "vitest";
import {
  FLY_SLIDER_RANGES,
  FLY_TARGET_RANGE_RPM,
  flywheelPhysicsFor,
  simulateFlywheelResponse,
  type FlywheelGains,
} from "./flywheelPhysics";

/** kV a little above the motor's 0.093 V·s/rot covers the wheel's drag. */
const TUNED: FlywheelGains = { kP: 0.3, kI: 0, kD: 0, kS: 0.3, kV: 0.11 };

function allFinite(...arrays: Float64Array[]) {
  return arrays.every((a) => a.every((x) => Number.isFinite(x)));
}

function corners(): FlywheelGains[] {
  const keys = Object.keys(FLY_SLIDER_RANGES) as (keyof FlywheelGains)[];
  return [
    Object.fromEntries(keys.map((k) => [k, FLY_SLIDER_RANGES[k].min])),
    Object.fromEntries(keys.map((k) => [k, FLY_SLIDER_RANGES[k].max])),
  ] as unknown as FlywheelGains[];
}

describe("flywheel velocity response", () => {
  it("settles near the target with sane gains", () => {
    const { metrics } = simulateFlywheelResponse(
      flywheelPhysicsFor(1800),
      TUNED
    );
    expect(metrics.regime).toBe("stable");
    expect(metrics.settlingTime).not.toBeNull();
    expect(metrics.settlingTime!).toBeLessThan(3);
    expect(metrics.steadyStateErrorRpm).toBeLessThan(10);
  });

  it("falls short on feedback alone with too little kV", () => {
    const { metrics } = simulateFlywheelResponse(flywheelPhysicsFor(1800), {
      ...TUNED,
      kP: 0.05,
      kS: 0,
      kV: 0.093,
    });
    expect(metrics.regime).toBe("drifting");
    expect(metrics.steadyStateErrorRpm).toBeGreaterThan(100);
  });

  it("reaches speed sooner as kP rises", () => {
    const settle = [0.1, 0.3, 0.6].map(
      (kP) =>
        simulateFlywheelResponse(flywheelPhysicsFor(1800), { ...TUNED, kP })
          .metrics.settlingTime!
    );
    expect(settle[1]).toBeLessThan(settle[0]!);
    expect(settle[2]).toBeLessThan(settle[1]!);
  });

  it("overshoots more as kI rises", () => {
    const overshoot = [0.1, 0.3, 0.5].map(
      (kI) =>
        simulateFlywheelResponse(flywheelPhysicsFor(1800), {
          ...TUNED,
          kV: 0.1,
          kI,
        }).metrics.overshootRpm
    );
    expect(overshoot[1]).toBeGreaterThan(overshoot[0]!);
    expect(overshoot[2]).toBeGreaterThan(overshoot[1]!);
  });

  it("stays finite at every slider extreme", () => {
    for (const gains of corners()) {
      for (const rpm of [FLY_TARGET_RANGE_RPM.min, FLY_TARGET_RANGE_RPM.max]) {
        const r = simulateFlywheelResponse(flywheelPhysicsFor(rpm), gains);
        expect(allFinite(r.t, r.velocityRpm, r.voltage, r.angleRad)).toBe(true);
        expect(Number.isFinite(r.metrics.overshootRpm)).toBe(true);
        expect(Number.isFinite(r.metrics.steadyStateErrorRpm)).toBe(true);
      }
    }
  });
});
