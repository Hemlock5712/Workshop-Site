"use client";

/**
 * The bypass. First focusable thing in the shell, on every route.
 *
 * Without it, reaching a lesson from the address bar costs a walk through the
 * rail's controls and the topbar's search button — on all 29 pages, every time.
 *
 * It targets the article, not `<main>`. Aiming at `#main-content` looked right
 * and skipped almost nothing: the outline rail's `<nav>` renders *inside* that
 * element, so focus arrived above it and Tab then walked all nine section
 * links before reaching the first line of the lesson. Measured on
 * /pid-control, that put the first piece of content at tab stop 12. The
 * article is still inside `<main>`, so the arrow keys scroll exactly as before.
 *
 * `#main-content` stays the fallback for the handful of routes that render
 * outside PageTemplate and so have no article to aim at.
 */

import type { MouseEvent } from "react";
import { useShell } from "@/contexts/ShellContext";

export default function SkipLink() {
  const { mainRef } = useShell();

  const jump = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("lesson-article") ?? mainRef.current;
    if (!target) return;
    e.preventDefault();
    target.focus();
    target.scrollIntoView({ block: "start" });
  };

  return (
    <a href="#lesson-article" onClick={jump} className="skip-link">
      Skip to the lesson
    </a>
  );
}
