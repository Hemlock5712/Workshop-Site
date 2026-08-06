"use client";

/**
 * Resolved plot colours, read from the design tokens.
 *
 * The three playgrounds draw their response curve on a canvas, and canvas
 * `strokeStyle` cannot read `var(--accent)` — it needs a value. So the roles
 * are declared in globals.css (see the `── Plot ──` block) and resolved here
 * at paint time.
 *
 * Reading the stylesheet rather than branching on `resolvedTheme` also fixes
 * the flash these components used to have. `isDark` was `mounted &&
 * resolvedTheme === "dark"`, false until hydration, so the first paint of
 * /pid-control drew the whole plot and mechanism in the *light* palette on a
 * site whose default theme is dark, then swapped. `getComputedStyle` on
 * `<html>` is right on the first call, because the class is already there —
 * next-themes sets it in a blocking script.
 */

export interface PlotTheme {
  /** Axis labels and tick text. */
  ink: string;
  /** Grid lines. Already carries its own alpha. */
  grid: string;
  /** Where you asked the mechanism to go. Drawn dashed. */
  target: string;
  /** Where the motion profile says it should be right now. */
  setpoint: string;
  /** Where it actually is. The line the whole playground is about. */
  actual: string;
  /** Top and bottom stops of the fill under `actual`. */
  actualFill: string;
  actualFade: string;
}

const ROLES = {
  ink: "--plot-ink",
  grid: "--plot-grid",
  target: "--plot-target",
  setpoint: "--plot-setpoint",
  actual: "--plot-actual",
  actualFill: "--plot-actual-fill",
  actualFade: "--plot-actual-fade",
} as const;

/**
 * Server-side and pre-hydration fallback. These are the dark-theme values,
 * because dark is `:root` and the site's default — the same choice the
 * stylesheet makes. Nothing should ever paint with these; they exist so the
 * type is total.
 */
const FALLBACK: PlotTheme = {
  ink: "oklch(0.615 0.022 260)",
  grid: "oklch(0.615 0.022 260 / 0.16)",
  target: "oklch(0.615 0.022 260)",
  setpoint: "oklch(0.76 0.12 262)",
  actual: "oklch(0.755 0.155 55)",
  actualFill: "oklch(0.755 0.155 55 / 0.26)",
  actualFade: "oklch(0.755 0.155 55 / 0)",
};

export function readPlotTheme(): PlotTheme {
  if (typeof window === "undefined") return FALLBACK;
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  return {
    ink: read(ROLES.ink, FALLBACK.ink),
    grid: read(ROLES.grid, FALLBACK.grid),
    target: read(ROLES.target, FALLBACK.target),
    setpoint: read(ROLES.setpoint, FALLBACK.setpoint),
    actual: read(ROLES.actual, FALLBACK.actual),
    actualFill: read(ROLES.actualFill, FALLBACK.actualFill),
    actualFade: read(ROLES.actualFade, FALLBACK.actualFade),
  };
}
