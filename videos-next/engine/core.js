// The engine's whole contract: a scene is a pure function of time.
// draw(ctx, t) must paint the same frame for the same t, every time, whether
// the page is playing, scrubbing, or being exported frame by frame. No
// Math.random(), no Date.now(), no state carried between frames that t
// cannot rebuild.

export const W = 1920;
export const H = 1080;

// The site's tokens (src/app/globals.css, dark theme). Canvas takes oklch().
export const C = {
  bg: "oklch(0.155 0.038 265)",
  bg2: "oklch(0.196 0.042 265)",
  bg3: "oklch(0.243 0.045 265)",
  tx: "oklch(0.955 0.012 85)",
  tx2: "oklch(0.795 0.016 260)",
  tx3: "oklch(0.615 0.022 260)",
  rule: "oklch(0.325 0.032 265)",
  ruleSoft: "oklch(0.245 0.03 265)",
  accent: "oklch(0.755 0.155 55)",
  accentInk: "oklch(0.19 0.06 55)",
  accentSoft: "oklch(0.755 0.155 55 / 0.14)",
  ok: "oklch(0.78 0.13 155)",
  err: "oklch(0.71 0.17 27)",
};
export const alpha = (color, a) => color.replace(")", ` / ${a})`);

export const SANS = '"Instrument Sans", system-ui, sans-serif';
export const MONO = '"JetBrains Mono", Consolas, monospace';
export const SERIF = '"Newsreader", Georgia, serif';

// ---- numbers -----------------------------------------------------------------

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const easeOut = (k) => 1 - (1 - k) ** 3;
export const easeInOut = (k) =>
  k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
// on for [t0, t1), with eased edges of length e
export const window_ = (t, t0, t1, e = 0.35) =>
  easeOut(ramp(t, t0, e)) * (1 - easeInOut(ramp(t, t1 - e, e)));

// Closed-form damped spring from 0 to 1, started at t0. Deterministic.
export function spring(t, t0, { freq = 2.2, damp = 0.55 } = {}) {
  const x = t - t0;
  if (x <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const wd = w * Math.sqrt(1 - damp * damp);
  return (
    1 -
    Math.exp(-damp * w * x) *
      (Math.cos(wd * x) + ((damp * w) / wd) * Math.sin(wd * x))
  );
}

// ---- narration cues ------------------------------------------------------------

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function cues(VOICE) {
  const byId = Object.fromEntries(VOICE.lines.map((l) => [l.id, l]));
  const L = (id) => {
    const l = byId[id];
    if (!l) throw new Error(`no line "${id}"`);
    return l;
  };
  // when the n-th occurrence of `word` in line `id` starts
  const Wd = (id, word, n = 1) => {
    const hits = L(id).words.filter((w) => norm(w.w) === norm(word));
    if (!hits[n - 1])
      throw new Error(`no word "${word}" #${n} in line "${id}"`);
    return hits[n - 1].t0;
  };
  const G = (id) => VOICE.gates.find((g) => g.id === id);
  return { L, W: Wd, G };
}

// ---- camera --------------------------------------------------------------------

// shots: [{ t, x, y, z, d }] — at time t start moving to centre (x, y) at zoom z over d seconds.
export function camera(shots, t) {
  let cur = { x: W / 2, y: H / 2, z: 1 };
  for (const s of shots) {
    if (t < s.t) break;
    const k = easeInOut(ramp(t, s.t, s.d ?? 1.2));
    cur = {
      x: lerp(cur.x, s.x, k),
      y: lerp(cur.y, s.y, k),
      z: lerp(cur.z, s.z, k),
    };
  }
  return cur;
}
export function applyCamera(ctx, cam) {
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.x, -cam.y);
}

// ---- drawing -------------------------------------------------------------------

export function rrect(ctx, x, y, w, h, r = 6) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function text(
  ctx,
  s,
  x,
  y,
  {
    font = SANS,
    size = 28,
    weight = 500,
    color = C.tx,
    align = "left",
    base = "alphabetic",
    a = 1,
    spacing = 0,
  } = {}
) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  if (spacing) ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(s, x, y);
  ctx.restore();
}

// The site's mono micro-label: small, tracked, uppercase.
export function micro(ctx, s, x, y, opts = {}) {
  text(ctx, s.toUpperCase(), x, y, {
    font: MONO,
    size: 19,
    weight: 500,
    color: C.tx3,
    spacing: 2.5,
    ...opts,
  });
}

export function background(ctx) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  // engineering-paper grid, faint
  ctx.strokeStyle = alpha(C.ruleSoft, 0.55);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 48) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, H);
  }
  for (let y = 0; y <= H; y += 48) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(W, y + 0.5);
  }
  ctx.stroke();
}

export function vignette(ctx) {
  const g = ctx.createRadialGradient(
    W / 2,
    H / 2,
    H * 0.35,
    W / 2,
    H / 2,
    H * 0.95
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Captions in screen space: the spoken line, the current word lit.
export function captions(
  ctx,
  VOICE,
  t,
  { y = 1010, size = 38, maxW = 1380 } = {}
) {
  const line = VOICE.lines.find((l) => t >= l.t0 - 0.15 && t <= l.t1 + 0.6);
  if (!line) return;
  const a = window_(t, line.t0 - 0.15, line.t1 + 0.6, 0.2);
  ctx.save();
  ctx.font = `500 ${size}px ${SANS}`;
  // wrap into rows
  const rows = [[]];
  let wRow = 0;
  const space = ctx.measureText(" ").width;
  for (const w of line.words) {
    const ww = ctx.measureText(w.w).width;
    if (wRow + ww > maxW && rows.at(-1).length) {
      rows.push([]);
      wRow = 0;
    }
    rows.at(-1).push({ ...w, ww });
    wRow += ww + space;
  }
  const lh = size * 1.32;
  const top = y - (rows.length - 1) * lh;
  const widest = Math.max(
    ...rows.map((r) => r.reduce((s, w) => s + w.ww + space, -space))
  );
  ctx.globalAlpha = a;
  ctx.fillStyle = "rgba(6, 9, 20, 0.62)";
  rrect(
    ctx,
    W / 2 - widest / 2 - 28,
    top - size - 12,
    widest + 56,
    rows.length * lh + 22,
    4
  );
  ctx.fill();
  rows.forEach((r, i) => {
    const rw = r.reduce((s, w) => s + w.ww + space, -space);
    let x = W / 2 - rw / 2;
    for (const w of r) {
      const said = t >= w.t0;
      const now = t >= w.t0 && t < w.t1 + 0.05;
      ctx.fillStyle = now ? C.accent : said ? C.tx : C.tx3;
      ctx.fillText(w.w, x, top + i * lh);
      x += w.ww + space;
    }
  });
  ctx.restore();
}
