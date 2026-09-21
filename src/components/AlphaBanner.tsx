"use client";

import { AlertTriangle } from "lucide-react";
import { usePathname } from "next/navigation";
import { getSectionOf } from "@/data/lessons";

/**
 * Notice under the breadcrumb bar, in one of two states.
 *
 * The standing state is a hairline strip: the content tracks an in-progress
 * alpha, which is true of the whole site and always will be until the season
 * opens. It scrolls away on purpose. A permanent coloured bar trains people to
 * stop seeing coloured bars, including the ones that matter.
 *
 * The second state is the one that matters. A workshop carrying `unfinished`
 * in `lessons.ts` has not been read by a human yet, and a student cannot tell
 * a reviewed lesson from a first draft by looking at it. Those pages get the
 * strip in `--err`, which is exactly the "second hue earns its keep" case
 * globals.css describes. It is keyed off the section rather than a per-page
 * prop so that finishing a review is one edit in `lessons.ts`, not thirteen.
 *
 * This is why the banner is a client component: it needs the route to know
 * which workshop it is sitting in.
 */
export default function AlphaBanner() {
  const pathname = usePathname();
  const unreviewed = Boolean(getSectionOf(pathname)?.unfinished);

  return (
    <div
      className="flex items-center justify-center gap-2.5 px-6 py-2 text-center lg:px-10"
      role="status"
      style={{
        background: "var(--bg2)",
        borderBottom: unreviewed
          ? "1px solid var(--err)"
          : "1px solid var(--rule-soft)",
      }}
    >
      <AlertTriangle
        className="h-3.5 w-3.5 shrink-0"
        aria-hidden="true"
        style={{ color: unreviewed ? "var(--err)" : "var(--accent)" }}
      />
      <span
        className="mono"
        style={{
          fontSize: "var(--text-micro)",
          letterSpacing: "0.08em",
          color: unreviewed ? "var(--err)" : "var(--tx3)",
        }}
      >
        {unreviewed
          ? "Rough draft: nobody has reviewed this lesson yet, and it may not be how things are done this season."
          : "WPILib 2027 is still in alpha: these pages change as the APIs settle."}
      </span>
    </div>
  );
}
