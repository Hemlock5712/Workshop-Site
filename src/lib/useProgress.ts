"use client";

/**
 * Local-storage-backed page-completion tracking.
 *
 * Storage key:    gmw:progress:v1
 * Storage shape:  JSON array of page slugs (route paths starting with `/`)
 *
 * SSR-safe: the hook always renders an empty set on the server and during
 * hydration, then loads from localStorage on mount. This means the
 * "complete" indicator pops in on first paint client-side — that's the
 * trade-off for not hard-coding an SSR fallback.
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "gmw:progress:v1";

function readStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((s): s is string => typeof s === "string"));
  } catch {
    return new Set();
  }
}

function writeStorage(set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // Storage quota or private-browsing mode — silently drop.
  }
}

/**
 * Module-level event target so multiple consumers of the hook stay in
 * sync within the tab (e.g. the page's "Mark complete" button and the
 * sidebar's check icons). Dispatch is deferred to the next macrotask so
 * sister components only run their `setState` after the current commit
 * phase finishes — otherwise React warns about updating Sidebar during
 * MarkCompleteToggle's render.
 */
const PROGRESS_EVENT = "gmw:progress-changed";
function broadcast(): void {
  if (typeof window === "undefined") return;
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  }, 0);
}

export interface UseProgressApi {
  completed: ReadonlySet<string>;
  isCompleted: (slug: string) => boolean;
  markComplete: (slug: string) => void;
  markIncomplete: (slug: string) => void;
  toggleComplete: (slug: string) => void;
  clearAll: () => void;
}

export function useProgress(): UseProgressApi {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());

  // Hydrate from storage + listen for cross-tab and in-tab updates.
  useEffect(() => {
    setCompleted(readStorage());
    const refresh = () => setCompleted(readStorage());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) refresh();
    };
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Apply the mutation and persist side effects in one place. Side effects
  // run synchronously here (this isn't a React updater), and the broadcast
  // itself is already deferred via setTimeout(0).
  const apply = useCallback((mut: (s: Set<string>) => Set<string> | null) => {
    setCompleted((prev) => {
      const next = mut(prev);
      if (!next) return prev;
      writeStorage(next);
      broadcast();
      return next;
    });
  }, []);

  const markComplete = useCallback(
    (slug: string) =>
      apply((prev) => {
        if (prev.has(slug)) return null;
        const next = new Set(prev);
        next.add(slug);
        return next;
      }),
    [apply]
  );

  const markIncomplete = useCallback(
    (slug: string) =>
      apply((prev) => {
        if (!prev.has(slug)) return null;
        const next = new Set(prev);
        next.delete(slug);
        return next;
      }),
    [apply]
  );

  const toggleComplete = useCallback(
    (slug: string) =>
      apply((prev) => {
        const next = new Set(prev);
        if (next.has(slug)) next.delete(slug);
        else next.add(slug);
        return next;
      }),
    [apply]
  );

  const isCompleted = useCallback(
    (slug: string) => completed.has(slug),
    [completed]
  );

  const clearAll = useCallback(() => apply(() => new Set()), [apply]);

  return {
    completed,
    isCompleted,
    markComplete,
    markIncomplete,
    toggleComplete,
    clearAll,
  };
}
