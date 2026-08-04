"use client";

import { Bot, Disc3, ArrowUpDown } from "lucide-react";
import InteractivePidPlayground from "@/components/InteractivePidPlayground";
import InteractiveFlywheelPlayground from "@/components/InteractiveFlywheelPlayground";
import InteractiveElevatorPlayground from "@/components/InteractiveElevatorPlayground";
import { useMechanismToggle, type Mechanism } from "@/lib/flywheelStore";

const OPTIONS: ReadonlyArray<{
  value: Mechanism;
  label: string;
  icon: React.ReactNode;
  desc: string;
}> = [
  {
    value: "arm",
    label: "Arm",
    icon: <Bot className="h-3.5 w-3.5" aria-hidden />,
    desc: "1-DOF arm with gravity (position control)",
  },
  {
    value: "flywheel",
    label: "Flywheel",
    icon: <Disc3 className="h-3.5 w-3.5" aria-hidden />,
    desc: "Spinning wheel with inertia (velocity control)",
  },
  {
    value: "elevator",
    label: "Elevator",
    icon: <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />,
    desc: "Carriage on a vertical rail (position control with constant gravity)",
  },
];

/**
 * Three playgrounds (arm position, flywheel velocity, elevator position) sit
 * behind one segmented toggle. Each playground has its own Zustand store, so
 * each mechanism remembers its own gains as the user flips between them.
 *
 * The toggle is native radios hidden behind their labels — the same pattern
 * `Quiz` uses, and it reuses that pattern's two classes. It was three
 * `<button role="radio">` in a `role="radiogroup"`, which announces a radio
 * group and then behaves like three unrelated buttons: three tab stops, no
 * arrow keys, and nothing telling assistive tech the group has one value.
 */
export default function MechanismPlayground() {
  const mechanism = useMechanismToggle((s) => s.mechanism);
  const setMechanism = useMechanismToggle((s) => s.setMechanism);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <fieldset
          className="m-0 inline-flex gap-px border p-0.5 text-meta"
          style={{
            background: "var(--bg2)",
            borderColor: "var(--rule)",
            borderRadius: 3,
          }}
        >
          <legend className="sr-only">Choose mechanism</legend>
          {OPTIONS.map((opt) => {
            const active = mechanism === opt.value;
            return (
              <label
                key={opt.value}
                title={opt.desc}
                className="quiz-option inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 transition-colors"
                style={{
                  borderRadius: 2,
                  background: active ? "var(--accent-soft)" : "transparent",
                  color: active ? "var(--tx)" : "var(--tx3)",
                }}
              >
                <input
                  type="radio"
                  className="quiz-radio"
                  name="mechanism-playground"
                  value={opt.value}
                  checked={active}
                  onChange={() => setMechanism(opt.value)}
                />
                {opt.icon}
                {opt.label}
              </label>
            );
          })}
        </fieldset>
      </div>

      {mechanism === "arm" && <InteractivePidPlayground />}
      {mechanism === "flywheel" && <InteractiveFlywheelPlayground />}
      {mechanism === "elevator" && <InteractiveElevatorPlayground />}
    </div>
  );
}
