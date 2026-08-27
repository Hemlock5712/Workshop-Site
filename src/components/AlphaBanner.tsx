import { AlertTriangle } from "lucide-react";

/**
 * Site-wide notice that the content tracks the in-progress WPILib 2027 alpha.
 *
 * A hairline strip under the breadcrumb bar rather than a tinted band across
 * the top. It scrolls away with the page on purpose: it is a standing caveat,
 * not a per-page warning, and a permanent coloured bar trains people to stop
 * seeing coloured bars — including the ones that matter.
 */
export default function AlphaBanner() {
  return (
    <div
      className="flex items-center justify-center gap-2.5 px-6 py-2 text-center lg:px-10"
      role="status"
      style={{
        background: "var(--bg2)",
        borderBottom: "1px solid var(--rule-soft)",
      }}
    >
      <AlertTriangle
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden="true"
        style={{ color: "var(--accent)" }}
      />
      <span
        className="mono"
        style={{
          fontSize: "var(--text-micro)",
          letterSpacing: "0.08em",
          color: "var(--tx3)",
        }}
      >
        WPILib 2027 is still in alpha: these pages change as the APIs settle.
      </span>
    </div>
  );
}
