"use client";

import { useState } from "react";

/**
 * The only interactive part of a code card, and therefore the only part that
 * ships JavaScript. Everything else — highlighting, line numbers, the gutter —
 * is server-rendered HTML.
 */
export default function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      className="mono ml-auto shrink-0 cursor-pointer border-0 bg-transparent transition-colors hover:text-[var(--accent)]"
      style={{
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#7f8793",
      }}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
