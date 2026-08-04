"use client";

import { useEffect } from "react";
import { useShell } from "@/contexts/ShellContext";

/**
 * Hands the keyboard the scroller.
 *
 * `<main>` is the scroll container here, not the window — the shell is a fixed
 * 100vh frame with an inner scroller — so the arrow keys and Page Down do
 * nothing at all until focus is somewhere inside it. On a fresh load focus sits
 * on `<body>`, which scrolls a document that cannot scroll. That is why `<main>`
 * carries `tabIndex={-1}` and why this exists: without it a reader has to click
 * the page before they can read it with the keyboard.
 *
 * It only moves focus when nothing has claimed it yet (`<body>`, the document
 * element, or nothing). If the reader has already tabbed to the skip link,
 * clicked a lesson link or opened the palette, the focus is theirs — taking it
 * silently is worse than the click it saves. Runs straight through in the
 * effect rather than on a guessed 100ms timer: the ref is attached by commit
 * time, so there is nothing to wait for.
 */
export default function AutoFocusMain() {
  const { mainRef } = useShell();

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const active = document.activeElement;
    const unclaimed =
      active === null ||
      active === document.body ||
      active === document.documentElement;

    if (unclaimed) main.focus({ preventScroll: true });
  }, [mainRef]);

  return null;
}
