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
    desc: "1-DOF arm with gravity — position control",
  },
  {
    value: "flywheel",
    label: "Flywheel",
    icon: <Disc3 className="h-3.5 w-3.5" aria-hidden />,
    desc: "Spinning wheel with inertia — velocity control",
  },
  {
    value: "elevator",
    label: "Elevator",
    icon: <ArrowUpDown className="h-3.5 w-3.5" aria-hidden />,
    desc: "Carriage on a vertical rail — position control with constant gravity",
  },
];

/**
 * Three playgrounds (arm position, flywheel velocity, elevator position) sit
 * behind one segmented toggle. Each playground has its own Zustand store, so
 * each mechanism remembers its own gains as the user flips between them.
 */
export default function MechanismPlayground() {
  const mechanism = useMechanismToggle((s) => s.mechanism);
  const setMechanism = useMechanismToggle((s) => s.setMechanism);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <div
          role="radiogroup"
          aria-label="Choose mechanism"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--muted)] p-0.5 text-[12px] font-medium"
        >
          {OPTIONS.map((opt) => {
            const active = mechanism === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                title={opt.desc}
                onClick={() => setMechanism(opt.value)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 ${
                  active
                    ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {mechanism === "arm" && <InteractivePidPlayground />}
      {mechanism === "flywheel" && <InteractiveFlywheelPlayground />}
      {mechanism === "elevator" && <InteractiveElevatorPlayground />}
    </div>
  );
}
