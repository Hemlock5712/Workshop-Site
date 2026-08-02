"use client";

import dynamic from "next/dynamic";

/**
 * Thin wrapper that keeps Monaco out of the initial bundle. Every page imports
 * this; the ~3 MB editor only loads once a code block is actually on screen.
 *
 * The placeholder matches the real card's border and surface so the page
 * doesn't reflow or flash a lighter box when the editor resolves.
 */
const CodeBlockClient = dynamic(() => import("./CodeBlockClient"), {
  ssr: false,
  loading: () => (
    <div
      className="overflow-hidden"
      style={{
        background: "#030718",
        border: "1px solid var(--rule)",
        borderRadius: 3,
      }}
    >
      <div
        className="mono flex h-24 items-center justify-center"
        style={{ fontSize: 10, letterSpacing: "0.1em", color: "#464d5b" }}
      >
        loading…
      </div>
    </div>
  ),
});

export default CodeBlockClient;
