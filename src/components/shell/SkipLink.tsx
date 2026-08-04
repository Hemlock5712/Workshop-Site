"use client";

/**
 * The bypass. First focusable thing in the shell, on every route.
 *
 * Without it, reaching a lesson from the address bar costs a walk through the
 * rail's five controls and the topbar's search button — on all 29 pages, every
 * time. The href alone is enough in every current browser (`<main>` carries
 * `tabindex="-1"`), but focus is also moved explicitly so the jump does not
 * depend on fragment-navigation quirks, and so it works when the hash is
 * already `#main-content` and the browser treats the click as a no-op.
 */

import type { MouseEvent } from "react";
import { useShell } from "@/contexts/ShellContext";

export default function SkipLink() {
  const { mainRef } = useShell();

  const jump = (e: MouseEvent<HTMLAnchorElement>) => {
    const main = mainRef.current;
    if (!main) return;
    e.preventDefault();
    main.focus();
  };

  return (
    <a href="#main-content" onClick={jump} className="skip-link">
      Skip to the lesson
    </a>
  );
}
