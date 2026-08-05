"use client";

/**
 * The 70px rail down the left edge. It holds the four things that are true on
 * every page: where home is, how to open the curriculum, how far through this
 * page you are, and which theme you're in.
 *
 * Deliberately not a nav tree. The old sidebar showed 29 links at all times,
 * which meant a student reading lesson 15 spent a fifth of the viewport on
 * links to lessons they had already done. The tree still exists — it is one
 * click away behind MENU — but the default state is reading.
 *
 * Below 640px it is 48px and holds only the two controls plus the toggle. The
 * argument against the old sidebar applies to the rail's own furniture: 70px is
 * 18% of a 390px screen, and everything the progress spine occupied was
 * `aria-hidden` ornament — a vertical PROGRESS label, an empty track and a `00`
 * readout — while the reading column underneath it was 272px, about 37
 * characters a line. The spine is a desk affordance and it goes at phone
 * sizes; the three controls stay, at 44px targets, because the curriculum is
 * only reachable through MENU.
 */

import Image from "next/image";
import Link from "next/link";
import { useShell } from "@/contexts/ShellContext";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function AppRail() {
  const { navOpen, toggleNav, scrollPct } = useShell();
  const pct = Math.round(scrollPct * 100);

  return (
    <div
      className="fixed bottom-0 left-0 top-0 z-40 flex w-12 flex-col items-center justify-between py-[18px] sm:w-[70px]"
      style={{
        background: "var(--bg)",
        borderRight: "1px solid var(--rule-soft)",
      }}
    >
      <div className="flex flex-col items-center gap-[18px]">
        {/* The hit box is 44px on a phone and 36px — the mark's own size — from
            `sm` up, where there is a cursor. The mark never changes size; only
            the target around it does. */}
        <Link
          href="/"
          title="Back to the workshop home"
          aria-label="Back to the workshop home"
          className="flex h-11 w-11 items-center justify-center rounded-lg opacity-90 transition-opacity hover:opacity-100 sm:h-9 sm:w-9"
        >
          <Image
            src="/images/gray-matter-logo.jpg"
            alt="Gray Matter"
            width={36}
            height={36}
            quality={95}
            className="block h-9 w-9 rounded-lg"
          />
        </Link>

        <button
          type="button"
          onClick={toggleNav}
          aria-label="Open curriculum menu"
          aria-expanded={navOpen}
          className="group flex min-h-11 w-11 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-[9px] pb-[7px] pt-2 transition-colors sm:min-h-0 sm:justify-start"
          style={{
            border: "1px solid var(--rule)",
            background: navOpen ? "var(--accent-soft)" : "var(--bg2)",
            color: navOpen ? "var(--accent)" : "var(--tx2)",
          }}
        >
          {/* Three rules, the last one short and accent-coloured — the same
              "you are partway down a list" idea as the progress spine. */}
          <span className="flex w-4 flex-col items-start gap-[3.5px]">
            <span className="block h-[1.6px] w-4 rounded-sm bg-current" />
            <span className="block h-[1.6px] w-4 rounded-sm bg-current" />
            <span
              className="block h-[1.6px] w-[10px] rounded-sm"
              style={{ background: "var(--accent)" }}
            />
          </span>
          <span
            className="mono"
            style={{ fontSize: 7.5, letterSpacing: "0.13em", lineHeight: 1 }}
          >
            MENU
          </span>
        </button>
      </div>

      {/* Scroll progress through the current page. Vertical because the rail
          is vertical, and because a horizontal bar at the top of a long
          lesson reads as a loading indicator.

          Gone below 640px. It is the whole reason the rail was 70px wide, it
          is `aria-hidden` so it was never reaching a screen reader either, and
          on a phone the page's own scrollbar already says this. */}
      <div
        className="hidden w-full flex-1 flex-col items-center justify-center gap-[14px] py-6 sm:flex"
        data-progress-spine
        aria-hidden="true"
      >
        <span
          className="mono"
          style={{
            fontSize: "var(--text-micro)",
            letterSpacing: "0.16em",
            color: "var(--tx3)",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          PROGRESS
        </span>
        <div
          className="relative w-[2px] flex-1 overflow-hidden rounded-sm"
          style={{ maxHeight: 260, background: "var(--rule-soft)" }}
        >
          <div
            className="absolute left-0 right-0 top-0"
            style={{
              height: `${pct}%`,
              background: "var(--accent)",
              transition: "height 0.1s linear",
            }}
          />
        </div>
        <span
          className="mono tabular"
          style={{
            fontSize: "var(--text-micro)",
            letterSpacing: "0.06em",
            color: "var(--tx2)",
          }}
        >
          {String(pct).padStart(2, "0")}
        </span>
      </div>

      <AnimatedThemeToggler
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-transparent transition-colors sm:h-[34px] sm:w-[34px]"
        style={{ border: "1px solid var(--rule)", color: "var(--tx2)" }}
      />
    </div>
  );
}
