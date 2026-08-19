"use client";

/**
 * Error boundary for every workshop route. It renders inside
 * `(workshop)/layout.tsx`, so the rail and the breadcrumb bar are already
 * there and the reader keeps a way out of the failure.
 *
 * `error.message` is deliberately not on screen. In production Next replaces
 * it with a digest anyway, and in development it is a React stack trace — a
 * student reading it would reasonably conclude they had broken something in
 * their own project. The real detail goes to the console, which is where
 * someone who can act on it will look.
 */

import { useEffect } from "react";
import Link from "next/link";

export default function WorkshopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workshop page failed to render:", error);
  }, [error]);

  return (
    <div className="px-6 pb-24 pt-14 md:px-12 lg:px-[76px]">
      <div className="max-w-[660px]">
        <span className="micro">error</span>

        <h1
          className="display mt-4"
          style={{
            fontSize: "clamp(30px, 4.4vw, 46px)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            textWrap: "balance",
            color: "var(--err)",
          }}
        >
          This page stopped rendering.
        </h1>

        <p
          className="mt-7"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-body)",
            lineHeight: 1.62,
            color: "var(--tx2)",
          }}
        >
          Something on the page threw on its way to the screen. That is a fault
          on this site, not in your robot project or in anything you installed:
          try it again, and if it keeps happening the rest of the workshop is
          still fine.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap px-[22px] py-[13px] text-note font-semibold transition-opacity hover:opacity-90"
            style={{
              borderRadius: 2,
              background: "var(--accent)",
              color: "var(--accent-ink)",
            }}
          >
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2.5 whitespace-nowrap px-[18px] py-[13px] text-note transition-colors hover:border-[var(--accent)] hover:text-[var(--tx)]"
            style={{
              borderRadius: 2,
              border: "1px solid var(--rule)",
              background: "var(--bg2)",
              color: "var(--tx2)",
            }}
          >
            Back to the workshop
          </Link>
        </div>
      </div>
    </div>
  );
}
