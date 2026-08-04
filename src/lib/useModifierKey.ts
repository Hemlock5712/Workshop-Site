"use client";

/**
 * The command-palette shortcut, spelled the way the reader's own keyboard
 * spells it. Three places advertise it — the topbar's search button, the 404,
 * and the shortcuts dialog — and all three used to say "Ctrl K" to everyone,
 * including the Mac users for whom that combination does nothing.
 *
 * The server has no `navigator`, so this renders the PC spelling first — the
 * majority case, and a stable one — then corrects itself after mount. Guessing
 * during SSR would trade a wrong label for a hydration mismatch, which is the
 * worse of the two bugs.
 */

import { useEffect, useState } from "react";

interface ModifierKey {
  /** The modifier on its own: `⌘` or `Ctrl`. */
  mod: string;
  /** The whole hint as one label: `⌘K` or `Ctrl K`. */
  palette: string;
}

export function useModifierKey(): ModifierKey {
  const [apple, setApple] = useState(false);

  useEffect(() => {
    const ua = navigator.platform || navigator.userAgent || "";
    setApple(/mac|ipad|iphone|ipod/i.test(ua));
  }, []);

  return {
    mod: apple ? "⌘" : "Ctrl",
    palette: apple ? "⌘K" : "Ctrl K",
  };
}
