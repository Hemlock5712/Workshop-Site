import LiveSimPanel from "@/components/sim/LiveSimPanel";

/**
 * Feature flag for the in-browser simulation spike. Renders nothing unless the
 * build sets `NEXT_PUBLIC_SIM_SPIKE=1`; the route behind it checks its own
 * server-side `SIM_SPIKE`, so turning on one without the other does nothing.
 */
export default function SimSpike({ branch }: { branch: string }) {
  if (process.env.NEXT_PUBLIC_SIM_SPIKE !== "1") return null;
  return <LiveSimPanel branch={branch} />;
}
