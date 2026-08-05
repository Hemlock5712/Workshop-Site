"use client";

/**
 * The frame every workshop route renders inside.
 *
 * Fixed 100vh: the rail and the topbar never move, and `<main>` is the only
 * thing that scrolls. That is what makes the rail's progress spine mean
 * something — it is measuring one element, not guessing at document height.
 *
 * The rail is 70px and the main column is inset by exactly that much. Below
 * 640px the rail is still there — it is the only way to reach the curriculum —
 * but it drops its progress spine and collapses to 48px, and the inset here
 * has to follow it or `<main>` overhangs the viewport and every page scrolls
 * sideways. The two numbers are a pair; change one and change the other.
 */

import { type ReactNode } from "react";
import { ShellProvider, useShell } from "@/contexts/ShellContext";
import AnalyticsBanner from "@/components/AnalyticsBanner";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import AppRail from "./AppRail";
import CurriculumDrawer from "./CurriculumDrawer";
import SearchPalette from "./SearchPalette";
import SkipLink from "./SkipLink";
import Topbar from "./Topbar";

function ShellFrame({ children }: { children: ReactNode }) {
  const { mainRef } = useShell();

  return (
    <>
      <SkipLink />
      <AppRail />
      <CurriculumDrawer />
      <SearchPalette />
      <main
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        className="ml-12 h-screen overflow-y-auto focus:outline-none sm:ml-[70px]"
        style={{ background: "var(--bg)", color: "var(--tx)" }}
      >
        <Topbar />
        {children}
      </main>

      {/* Viewport-fixed overlays live OUTSIDE <main>. Inside it they still
          counted toward its scrollable overflow, and since main is inset 70px
          by the rail while these span `left-0 right-0`, they added exactly
          that 70px — every page reported a horizontal scroll that no visible
          element accounted for. */}
      <AnalyticsBanner />
      <KeyboardShortcutsHelp />
    </>
  );
}

export default function WorkshopShell({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <ShellFrame>{children}</ShellFrame>
    </ShellProvider>
  );
}
