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
      className="fixed bottom-0 left-0 top-0 z-40 flex w-[70px] flex-col items-center justify-between py-[18px]"
      style={{
        background: "var(--bg)",
        borderRight: "1px solid var(--rule-soft)",
      }}
    >
      <div className="flex flex-col items-center gap-[18px]">
        <Link
          href="/"
          title="Back to the workshop home"
          aria-label="Back to the workshop home"
          className="block rounded-lg opacity-90 transition-opacity hover:opacity-100"
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
          className="group flex w-11 cursor-pointer flex-col items-center gap-[5px] rounded-[9px] pb-[7px] pt-2 transition-colors"
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
          lesson reads as a loading indicator. */}
      <div
        className="flex w-full flex-1 flex-col items-center justify-center gap-[14px] py-6"
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
        className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-lg bg-transparent transition-colors"
        style={{ border: "1px solid var(--rule)", color: "var(--tx2)" }}
      />
    </div>
  );
}
