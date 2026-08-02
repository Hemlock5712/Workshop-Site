"use client";

/**
 * The frame every workshop route renders inside.
 *
 * Fixed 100vh: the rail and the topbar never move, and `<main>` is the only
 * thing that scrolls. That is what makes the rail's progress spine mean
 * something — it is measuring one element, not guessing at document height.
 *
 * The rail is 70px and the main column is inset by exactly that much. Below
 * 640px the rail keeps its width (it is the only way to reach the curriculum),
 * but the topbar and page padding tighten around it.
 */

import { type ReactNode } from "react";
import { ShellProvider, useShell } from "@/contexts/ShellContext";
import AppRail from "./AppRail";
import CurriculumDrawer from "./CurriculumDrawer";
import SearchPalette from "./SearchPalette";
import Topbar from "./Topbar";

function ShellFrame({ children }: { children: ReactNode }) {
  const { mainRef } = useShell();

  return (
    <>
      <AppRail />
      <CurriculumDrawer />
      <SearchPalette />
      <main
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        className="ml-[70px] h-screen overflow-y-auto focus:outline-none"
        style={{ background: "var(--bg)", color: "var(--tx)" }}
      >
        <Topbar />
        {children}
      </main>
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
