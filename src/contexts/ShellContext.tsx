"use client";

/**
 * Shell state — the three things the chrome shares.
 *
 *   navOpen     the curriculum drawer behind the rail's MENU button
 *   searchOpen  the ⌘K palette
 *   scrollPct   how far down the scroll container the reader is, 0..1
 *
 * `scrollPct` lives here rather than inside the rail because two pieces of
 * chrome draw it — the vertical progress spine and (on lesson pages) nothing
 * else today, but the outline rail wants it next. Measuring once and sharing
 * beats two scroll listeners racing each other.
 *
 * The scroll container is `<main>`, not the window: the shell is a fixed
 * 100vh frame with an inner scroller, so `window.scrollY` is always 0.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

interface ShellApi {
  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  toggleNav: () => void;

  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  /** Scroll progress through the current page, 0 at the top, 1 at the end. */
  scrollPct: number;
  /** Attach to the scrolling `<main>`. */
  mainRef: RefObject<HTMLElement | null>;
}

const ShellContext = createContext<ShellApi | undefined>(undefined);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const mainRef = useRef<HTMLElement | null>(null);

  const openNav = useCallback(() => {
    setNavOpen(true);
    setSearchOpen(false);
  }, []);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const toggleNav = useCallback(() => {
    setNavOpen((p) => !p);
    setSearchOpen(false);
  }, []);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
    setNavOpen(false);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Scroll progress. rAF-coalesced so a fast wheel spin schedules one state
  // update per frame instead of one per scroll event, and gated on a 0.4%
  // delta so a pixel of rubber-banding doesn't re-render the rail.
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = el.scrollHeight - el.clientHeight;
      const pct = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      setScrollPct((prev) => (Math.abs(pct - prev) > 0.004 ? pct : prev));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });

    // A page whose content grows after mount (Monaco resolving, a GitHub
    // embed landing) changes the denominator without ever firing `scroll`.
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  // Global keys: ⌘K / Ctrl-K opens search anywhere, Escape closes whichever
  // overlay is up. Both overlays also handle Escape themselves; this is the
  // path for when focus has escaped them.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => {
          if (!prev) setNavOpen(false);
          return !prev;
        });
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // An open overlay owns the viewport. Without this the page behind it
  // scrolls under the drawer when you flick on a trackpad.
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const locked = navOpen || searchOpen;
    el.style.overflowY = locked ? "hidden" : "auto";
    return () => {
      el.style.overflowY = "auto";
    };
  }, [navOpen, searchOpen]);

  return (
    <ShellContext.Provider
      value={{
        navOpen,
        openNav,
        closeNav,
        toggleNav,
        searchOpen,
        openSearch,
        closeSearch,
        scrollPct,
        mainRef,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell(): ShellApi {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within a ShellProvider");
  return ctx;
}
