#!/usr/bin/env node
// Turn a raw tool recording into one clip per rec beat, timed to the narration.
//
//   node tools/capture-edit.mjs <raw.mp4> --lesson lessons/<id> --beat <lineId>
//        [--log <ui.jsonl>] [--from <mark>] [--to <mark>] [--mask x,y,w,h[@t0-t1]]...
//        [--shift <ms>] [--zoom 1.8] [--keep <s>]
//
// Inputs, both written while recording:
//   <raw.mp4>.json   from tools/record-window.ps1: { start: unix ms of frame 0, x, y, w, h }
//   <ui.jsonl>       from tools/ui.ps1 with $env:UI_LOG set; defaults to <raw.mp4>.log.jsonl
//
// The beat's footage runs from the log's `mark beat:<lineId>` (or --from <label>) to the
// next mark (or --to <label>). Inside it:
//   - every click, scroll and typing run is kept, from 0.6 s before to 1.2 s after;
//   - the waits between them are sped up, not cut, so the screen never jumps;
//   - the result is fitted to the narration line, from its start to the next line's
//     start: sped up evenly if long, holding its last frame if short;
//   - masks are painted over solid before anything else, so gains never reach the clip.
//     Mask coordinates are window pixels (the raw video's own pixels), with an optional
//     time range in raw-recording seconds.
//
// Writes lessons/<id>/clips/<lineId>.webm (VP9, keyframe every half second so export
// seeks are cheap) and adds the beat to lessons/<id>/clips/clips.json, which
// engine/clip.js reads: per beat the clip's size, duration, the click events and the
// zoom targets, all in clip seconds. The zoom itself is drawn at render time.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const raw = path.resolve(argv[0] ?? "");
const opt = (k, d) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : d;
};
const all = (k) => argv.flatMap((a, i) => (a === k ? [argv[i + 1]] : []));
if (!fs.existsSync(raw) || !opt("--lesson") || !opt("--beat")) {
  console.error("usage: capture-edit.mjs <raw.mp4> --lesson lessons/<id> --beat <lineId> [--log f] [--from m] [--to m] [--mask x,y,w,h[@t0-t1]] [--shift ms]");
  process.exit(1);
}
const lessonDir = path.resolve(opt("--lesson"));
const beat = opt("--beat");
const rec = JSON.parse(fs.readFileSync(`${raw}.json`, "utf8").replace(/^﻿/, ""));
const logFile = opt("--log", `${raw}.log.jsonl`);
const log = fs
  .readFileSync(logFile, "utf8")
  .replace(/^﻿/, "")
  .split(/\r?\n/)
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l.replace(/^﻿/, "")));
const shift = Number(opt("--shift", 0)) / 1000;
// log time -> raw-recording seconds, positions -> window pixels
const ev = log.map((e) => ({ ...e, s: (e.t - rec.start) / 1000 + shift, wx: e.x - rec.x, wy: e.y - rec.y }));
const rawDur = Number(probe(raw, "format=duration"));

// ---- the beat's span in the raw recording ---------------------------------------------
const marks = ev.filter((e) => e.a === "mark");
const fromLabel = opt("--from", `beat:${beat}`);
const from = marks.find((m) => m.label === fromLabel);
if (!from) fail(`no mark "${fromLabel}" in ${logFile}`);
const to = opt("--to") ? marks.find((m) => m.label === opt("--to")) : marks.find((m) => m.s > from.s);
const s0 = Math.max(0, from.s);
const s1 = Math.min(rawDur, to ? to.s : rawDur);
const acts = ev.filter((e) => e.s >= s0 && e.s <= s1 && ["click", "press", "type", "scroll"].includes(e.a));

// ---- the narration line it sits under ---------------------------------------------------
const voice = JSON.parse(fs.readFileSync(path.join(lessonDir, "voice.json"), "utf8"));
const li = voice.lines.findIndex((l) => l.id === beat);
if (li < 0) fail(`no line "${beat}" in ${lessonDir}/voice.json`);
const line = voice.lines[li];
const next = voice.lines[li + 1];
const D = +((next ? next.t0 : voice.duration) - line.t0).toFixed(3);

// ---- keep / speed up ---------------------------------------------------------------------
const PRE = 0.6;
const POST = Number(opt("--keep", 1.2));
const GAP = 0.35; // a wait plays back in about this long
let keep = acts.map((e) => {
  const end = e.a === "type" ? (ev.find((x) => x.a === "typed" && x.s >= e.s)?.s ?? e.s) : e.s;
  return [Math.max(s0, e.s - PRE), Math.min(s1, end + POST)];
});
if (!keep.length) keep = [[s0, Math.min(s1, s0 + D)]];
keep.sort((a, b) => a[0] - b[0]);
const merged = [];
for (const k of keep) {
  const last = merged.at(-1);
  if (last && k[0] <= last[1] + GAP) last[1] = Math.max(last[1], k[1]);
  else merged.push([...k]);
}
// segments [a, b, speed]; the lead-in before the first action and every gap play fast
const segs = [];
const fast = (a, b) => {
  if (b - a > 0.05) segs.push([a, b, Math.min(24, Math.max(1, (b - a) / GAP))]);
};
fast(s0, merged[0][0]);
merged.forEach((m, i) => {
  segs.push([m[0], m[1], 1]);
  if (merged[i + 1]) fast(m[1], merged[i + 1][0]);
});
let L = segs.reduce((n, [a, b, v]) => n + (b - a) / v, 0);
// fit: speed up evenly when long (the line is the clock), hold the end when short
const k = L > D ? L / D : 1;
for (const sg of segs) sg[2] *= k;
L = segs.reduce((n, [a, b, v]) => n + (b - a) / v, 0);
const hold = Math.max(0, D - L);

// raw seconds -> clip seconds
const toClip = (s) => {
  let out = 0;
  for (const [a, b, v] of segs) {
    if (s <= a) return out;
    if (s < b) return out + (s - a) / v;
    out += (b - a) / v;
  }
  return out;
};

// ---- zoom targets: one per cluster of nearby actions --------------------------------------
const Z = Number(opt("--zoom", 1.8));
const events = acts.map((e) => ({ t: +toClip(e.s).toFixed(3), x: e.wx, y: e.wy, a: e.a }));
const targets = [];
for (const e of events) {
  const last = targets.at(-1);
  const near = last && e.t - last.t1 < 1.6 && Math.abs(e.x - last.cx) < rec.w / 3 && Math.abs(e.y - last.cy) < rec.h / 3;
  if (near) {
    last.pts.push(e);
    last.t1 = e.t + 1.4;
  } else targets.push({ t0: Math.max(0, e.t - 0.5), t1: e.t + 1.4, pts: [e] });
}
for (const g of targets) {
  const xs = g.pts.map((p) => p.x);
  const ys = g.pts.map((p) => p.y);
  g.cx = Math.round((Math.min(...xs) + Math.max(...xs)) / 2);
  g.cy = Math.round((Math.min(...ys) + Math.max(...ys)) / 2);
  // wide enough to hold every point in the cluster with room around it
  g.z = +Math.max(1, Math.min(Z, rec.w / (Math.max(...xs) - Math.min(...xs) + rec.w / 3), rec.h / (Math.max(...ys) - Math.min(...ys) + rec.h / 3))).toFixed(2);
  g.t0 = +g.t0.toFixed(3);
  g.t1 = +Math.min(D, g.t1).toFixed(3);
  delete g.pts;
}

// ---- masks --------------------------------------------------------------------------------
const masks = all("--mask").map((m) => {
  const [box, span] = m.split("@");
  const [x, y, w, h] = box.split(",").map(Number);
  const [a, b] = span ? span.split("-").map(Number) : [0, rawDur];
  return { x, y, w, h, a, b };
});

// ---- render ---------------------------------------------------------------------------------
const outDir = path.join(lessonDir, "clips");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${beat}.webm`);
const chain = [];
let src = "[0:v]";
masks.forEach((m, i) => {
  chain.push(`${src}drawbox=x=${m.x}:y=${m.y}:w=${m.w}:h=${m.h}:color=0x1a1d24@1:t=fill:enable='between(t,${m.a},${m.b})'[m${i}]`);
  src = `[m${i}]`;
});
chain.push(`${src}split=${segs.length}${segs.map((_, i) => `[i${i}]`).join("")}`);
segs.forEach(([a, b, v], i) => chain.push(`[i${i}]trim=start=${a.toFixed(3)}:end=${b.toFixed(3)},setpts=(PTS-STARTPTS)/${v.toFixed(4)}[s${i}]`));
chain.push(`${segs.map((_, i) => `[s${i}]`).join("")}concat=n=${segs.length}:v=1:a=0,fps=30,tpad=stop_mode=clone:stop_duration=${(hold + 0.1).toFixed(3)},trim=duration=${D}[v]`);
const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-filter_complex", chain.join(";"), "-map", "[v]", "-an", "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-g", "15", "-pix_fmt", "yuv420p", out], { stdio: "inherit" });
if (r.status) fail("ffmpeg failed");

const manPath = path.join(outDir, "clips.json");
const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, "utf8")) : {};
man[beat] = { file: `${beat}.webm`, w: rec.w, h: rec.h, duration: D, events, targets, masks: masks.map((m) => ({ x: m.x, y: m.y, w: m.w, h: m.h, t0: +toClip(m.a).toFixed(3), t1: +toClip(m.b).toFixed(3) })) };
fs.writeFileSync(manPath, JSON.stringify(man, null, 2) + "\n");
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`${beat}: raw ${s0.toFixed(1)}-${s1.toFixed(1)} s, ${acts.length} actions, ${segs.length} segments, ${L.toFixed(1)} s + hold ${hold.toFixed(1)} s = ${D} s, ${targets.length} zooms, ${masks.length} masks -> ${path.relative(process.cwd(), out)} (${kb} KB)`);

function probe(f, what) {
  return spawnSync("ffprobe", ["-v", "error", "-show_entries", what, "-of", "csv=p=0", f], { encoding: "utf8" }).stdout.trim();
}
function fail(m) {
  console.error(m);
  process.exit(1);
}
