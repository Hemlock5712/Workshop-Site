export const brand = {
  fps: 30,
  width: 1920,
  height: 1080,

  colors: {
    background: "#0d233f",
    backgroundDeep: "#081829",
    surface: "#264060",
    text: "#fafbfc",
    textMuted: "#c1d4e7",
    accent: "#9fbcd9",
    learn: "#86efac",
  },

  accents: {
    blue: { primary: "#9fbcd9", glow: "rgba(159, 188, 217, 0.35)" },
    amber: { primary: "#fbbf24", glow: "rgba(251, 191, 36, 0.35)" },
    mint: { primary: "#86efac", glow: "rgba(134, 239, 172, 0.35)" },
    purple: { primary: "#c4b5fd", glow: "rgba(196, 181, 253, 0.4)" },
    teal: { primary: "#5eead4", glow: "rgba(94, 234, 212, 0.35)" },
  },

  code: {
    background: "#0a1a2e",
    border: "rgba(159, 188, 217, 0.18)",
    plain: "#e6edf3",
    comment: "#8b949e",
    keyword: "#ff7b72",
    type: "#ffa657",
    string: "#a5d6ff",
    number: "#79c0ff",
    function: "#d2a8ff",
    annotation: "#d2a8ff",
    lineNumber: "rgba(159, 188, 217, 0.35)",
    highlight: "rgba(251, 191, 36, 0.15)",
    highlightBorder: "#fbbf24",
  },

  fonts: {
    sans: '"Geist Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: '"Geist Mono", ui-monospace, "Cascadia Code", monospace',
  },
} as const;
