// Real tool footage for rec beats. tools/capture-edit.mjs writes, per lesson,
// clips/<lineId>.webm plus clips/clips.json; this draws a clip over its narration line
// in place of the scene's schematic, Screen-Studio style: the app window framed on the
// series background, the camera easing in on each cluster of clicks, a ring on every
// click, and a hatched "yours" block over every masked gain.
//
// Lessons without a clips/ folder, or beats without a clip, draw the scene unchanged.
// draw() is a pure function of t once prepare(t) has seeked the video, which is what
// export does for every frame; live playback lets the video play and nudges it back
// when it drifts.

import {
  C,
  W,
  alpha,
  background,
  clamp,
  easeInOut,
  micro,
  rrect,
} from "./core.js";

const FRAME = { x: 96, y: 56, w: W - 192, h: 852 }; // stays clear of the captions (y 940)
const FADE = 0.3; // crossfade with the scene at each end of a beat

export async function loadClips(baseUrl, VOICE) {
  let man = {};
  try {
    const r = await fetch(new URL("clips.json", baseUrl), {
      cache: "no-store",
    });
    if (r.ok) man = await r.json();
  } catch {
    // no clips for this lesson
  }
  const beats = [];
  for (const [id, m] of Object.entries(man)) {
    const i = VOICE.lines.findIndex((l) => l.id === id);
    if (i < 0) continue;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = new URL(m.file, baseUrl).href;
    const ok = await new Promise((res) => {
      video.addEventListener("loadeddata", () => res(true), { once: true });
      video.addEventListener("error", () => res(false), { once: true });
    });
    if (!ok) {
      console.warn(`clip ${id}: ${m.file} did not load; drawing the schematic`);
      continue;
    }
    const t0 = VOICE.lines[i].t0;
    beats.push({ id, m, video, t0, t1: t0 + m.duration, cam: cameraTrack(m) });
  }

  const at = (t) => beats.find((b) => t >= b.t0 && t < b.t1);
  let lastT = -1;

  return {
    count: beats.length,

    // export: put every visible clip on the right frame before draw
    async prepare(t) {
      const b = at(t);
      if (!b) return;
      b.video.pause();
      const want = clamp(t - b.t0, 0, b.video.duration - 0.001);
      if (
        Math.abs(b.video.currentTime - want) < 0.001 &&
        b.video.readyState >= 2
      )
        return;
      await new Promise((res) => {
        b.video.addEventListener("seeked", res, { once: true });
        b.video.currentTime = want;
      });
    },

    // draws the clip if t is inside a beat with one, and reports whether it did.
    // drawScene paints what the clip fades in from and out to.
    draw(ctx, t, drawScene, { exporting = false } = {}) {
      const b = at(t);
      for (const o of beats) if (o !== b && !o.video.paused) o.video.pause();
      if (!b) {
        lastT = t;
        return false;
      }
      const local = t - b.t0;
      if (!exporting) sync(b.video, local, t - lastT);
      lastT = t;

      const k = Math.min(clamp(local / FADE), clamp((b.t1 - t) / FADE));
      if (k < 1) {
        drawScene();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.save();
      ctx.globalAlpha = easeInOut(k);
      drawBeat(ctx, b, local);
      ctx.restore();
      return true;
    },
  };
}

// live playback: let the video run with the narration, re-seek only on a real drift
function sync(video, local, dt) {
  const running = dt > 0 && dt < 0.1;
  if (Math.abs(video.currentTime - local) > 0.25 || !running)
    video.currentTime = local;
  if (running && video.paused) video.play().catch(() => {});
  if (!running && !video.paused) video.pause();
}

function drawBeat(ctx, b, t) {
  const { m, video } = b;
  background(ctx);

  // the window, fitted into the frame
  const s = Math.min(FRAME.w / m.w, FRAME.h / m.h);
  const dw = m.w * s;
  const dh = m.h * s;
  const dx = FRAME.x + (FRAME.w - dw) / 2;
  const dy = FRAME.y + (FRAME.h - dh) / 2;

  // camera: a source rectangle of the window, 1/z of it, centred on the cluster
  const c = sample(b.cam, t);
  const sw = m.w / c.z;
  const sh = m.h / c.z;
  const sx = clamp(c.cx - sw / 2, 0, m.w - sw);
  const sy = clamp(c.cy - sh / 2, 0, m.h - sh);
  const map = (x, y) => [dx + ((x - sx) / sw) * dw, dy + ((y - sy) / sh) * dh];

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 16;
  rrect(ctx, dx, dy, dw, dh, 10);
  ctx.fillStyle = C.bg2;
  ctx.fill();
  ctx.restore();

  ctx.save();
  rrect(ctx, dx, dy, dw, dh, 10);
  ctx.clip();
  ctx.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh);

  // masked gains: the clip already has them painted out; this makes them read as "yours"
  for (const mk of m.masks ?? []) {
    if (t < mk.t0 || t > mk.t1) continue;
    const [x0, y0] = map(mk.x, mk.y);
    const [x1, y1] = map(mk.x + mk.w, mk.y + mk.h);
    hatch(ctx, x0, y0, x1 - x0, y1 - y0);
  }

  // a ring on each click, expanding over half a second
  for (const e of m.events) {
    if (e.a !== "click") continue;
    const age = t - e.t;
    if (age < 0 || age > 0.6) continue;
    const [x, y] = map(e.x, e.y);
    const k = age / 0.6;
    ctx.beginPath();
    ctx.arc(x, y, 14 + 34 * k, 0, Math.PI * 2);
    ctx.strokeStyle = alpha(C.accent, 0.9 * (1 - k));
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  ctx.restore();

  rrect(ctx, dx, dy, dw, dh, 10);
  ctx.strokeStyle = C.rule;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function hatch(ctx, x, y, w, h) {
  ctx.save();
  rrect(ctx, x, y, w, h, 3);
  ctx.clip();
  ctx.fillStyle = C.bg2;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = alpha(C.accent, 0.18);
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = alpha(C.accent, 0.55);
  ctx.lineWidth = 2;
  for (let hx = x - h; hx < x + w; hx += 10) {
    ctx.beginPath();
    ctx.moveTo(hx, y + h);
    ctx.lineTo(hx + h, y);
    ctx.stroke();
  }
  if (w > 90 && h > 26)
    micro(ctx, "yours", x + w / 2, y + h / 2 + 7, {
      align: "center",
      color: C.accent,
      size: 16,
    });
  ctx.restore();
}

// The camera, simulated once at 60 Hz: a critically damped follow of piecewise-constant
// targets (the whole window between clusters), so every frame is a lookup.
function cameraTrack(m) {
  const full = { cx: m.w / 2, cy: m.h / 2, z: 1 };
  const goal = (t) => m.targets.find((g) => t >= g.t0 && t < g.t1) ?? full;
  const n = Math.ceil(m.duration * 60) + 2;
  const out = [];
  let p = { ...full };
  let v = { cx: 0, cy: 0, z: 0 };
  const w = 2 * Math.PI * 1.1; // ~0.45 s to settle
  for (let i = 0; i < n; i++) {
    const g = goal(i / 60);
    for (const key of ["cx", "cy", "z"]) {
      const a = w * w * (g[key] - p[key]) - 2 * w * v[key];
      v[key] += a / 60;
      p[key] += v[key] / 60;
    }
    out.push({ ...p });
  }
  return out;
}

function sample(track, t) {
  const f = clamp(t * 60, 0, track.length - 1);
  const i = Math.floor(f);
  const j = Math.min(track.length - 1, i + 1);
  const k = f - i;
  return {
    cx: track[i].cx + (track[j].cx - track[i].cx) * k,
    cy: track[i].cy + (track[j].cy - track[i].cy) * k,
    z: track[i].z + (track[j].z - track[i].z) * k,
  };
}
