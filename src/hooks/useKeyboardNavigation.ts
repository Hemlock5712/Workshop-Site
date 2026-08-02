"use client";

/**
 * Keyboard navigation between lessons.
 *
 *   [  or  ArrowLeft   previous lesson
 *   ]  or  ArrowRight  next lesson
 *   Home               workshop home
 *   End                last lesson
 *
 * ⌘K / Ctrl-K and Escape are owned by `ShellContext`, not this hook — they
 * have to work whether or not a page mounted this hook, and two listeners
 * both calling `preventDefault` on ⌘K toggled the palette twice.
 *
 * The order comes from `src/data/lessons.ts`. It used to be a hand-maintained
 * twelve-slug array that had drifted so far it still described the lesson
 * order from before the IA audit — pressing ArrowRight on any lesson added or
 * moved since then did nothing at all.
 */

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getNextLesson, getPreviousLesson, LESSONS } from "@/data/lessons";

interface UseKeyboardNavigationProps {
  /** Lets a page bind `/` to focus its own search field. */
  onSearchFocus?: () => void;
  isSearchOpen?: boolean;
}

export function useKeyboardNavigation({
  onSearchFocus,
  isSearchOpen = false,
}: UseKeyboardNavigationProps = {}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Never hijack a key someone is using to type.
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (isSearchOpen) return;
      // A modifier means the key belongs to the browser or the shell.
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "ArrowLeft" || event.key === "[") {
        const prev = getPreviousLesson(pathname);
        if (prev) {
          event.preventDefault();
          router.push(prev.slug);
        }
        return;
      }

      if (event.key === "ArrowRight" || event.key === "]") {
        const next = getNextLesson(pathname);
        if (next) {
          event.preventDefault();
          router.push(next.slug);
        }
        return;
      }

      if (event.key === "/") {
        if (onSearchFocus) {
          event.preventDefault();
          onSearchFocus();
        }
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        router.push("/");
        return;
      }

      if (event.key === "End") {
        const last = LESSONS[LESSONS.length - 1];
        if (last) {
          event.preventDefault();
          router.push(last.slug);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router, pathname, onSearchFocus, isSearchOpen]);
}
