#!/usr/bin/env node
// Film the real lesson page instead of redrawing it. PROOF OF CONCEPT.
//
//   node tools/render-page.mjs lessons/<id> --dry                         text check, no frames
//   node tools/render-page.mjs lessons/<id> --sheet out/<id>-page.png [--every 4 | --times 3,9.5]
//   node tools/render-page.mjs lessons/<id> --mp4 out/<id>.mp4 [--fps 30]
//   --base http://localhost:3000    the running Next server (this tool never starts one)
//
// Reads lessons/<id>/page.json (what to show for each narration line) and
// lessons/<id>/voice.json (when each line and word is spoken). The cue file
// holds no times: a cue happens at its line's start, or at a word in it.
//
// page.json
//   pages    { name: "/route" }            the first one is the default page
//   targets  { name: "selector" }          Playwright selectors; "page: selector" for a non-default page
//   open     [cue]                         on screen before the first line
//   lines    { lineId: [cue] }
// cue (one of show / code / click / hold per cue)
//   show   "@target"                       frame that element; holds until the next show or code
//   code   "@target", lines [from, to]     frame those lines of a code card and dim the rest
//   zoom   number                          optional; default fits the target to the frame
//   click  "@target"                       the drawn cursor travels there and clicks
//   hold   "@target", until <time>         press, keep down, release
//   at     <time>                          default: the line's start
// <time>   "word" | "word#2" | "line:word" | "line:start" | "end" | "gate:40%"
//
// A target must match exactly one visible element, and a line range must exist,
// or the run stops with the list of what broke. That is the point: a page edit
// that breaks a video fails here, in text, with no frame to look at.
import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(HERE, "..", "..", "package.json"));
const { chromium } = require("playwright");
const CORE = path.join(HERE, "..", "engine", "core.js");
const { cues: voiceCues, W, H } = await import(pathToFileURL(CORE).href);

const SAFE_H = 930; // captions own everything below this
const MARGIN = 70;
const MAX_ZOOM = 2.2;
const LEAD = 0.4; // the camera starts moving this long before the line
const MOVE = 1.0;
const DIP = 0.3; // fade through the background when the page changes
// Site chrome that has no place in a video. A leading "?" marks one that may be absent.
const CHROME = [
  'div.fixed:has(button[aria-label="Open curriculum menu"])', // the rail
  "#main-content > div.sticky", // the topbar
  '?nav[aria-label="On this page"]',
  '?#main-content div[role="status"]:has(> span.mono)', // the alpha / rough-draft banner: a site status, not lesson content
  "?.skip-link",
  '?button[aria-label="Copy code"]',
  '?section[aria-label="Analytics consent"]',
  "?nextjs-portal",
];

const argv = process.argv.slice(2);
const has = (k) => argv.includes(k);
const opt = (k, d) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
if (!argv[0] || argv[0].startsWith("--")) {
  console.error("usage: node tools/render-page.mjs lessons/<id> --dry | --sheet out.png | --mp4 out.mp4");
  process.exit(2);
}
const dir = path.resolve(argv[0]);
const base = opt("--base", "http://localhost:3000").replace(/\/$/, "");
const CUE = JSON.parse(fs.readFileSync(path.join(dir, "page.json"), "utf8"));
const SCRIPT = fs.existsSync(path.join(dir, "script.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "script.json"), "utf8")) : null;
const DRAFT = has("--draft");
function draftVoice(S) {
  let t = S.lead ?? 3.4;
  const lines = [];
  const gates = [];
  for (const l of S.lines) {
    const ws = l.text.split(/\s+/).filter(Boolean);
    const weight = ws.map((w) => w.replace(/[^\w]/g, "").length + 1.5 + (/[,;]$/.test(w) ? 2.5 : 0) + (/[.?!]$/.test(w) ? 4 : 0));
    const total = weight.reduce((a, b) => a + b, 0);
    const t0 = t;
    const t1 = t0 + total / 15.5; // about 165 words a minute
    let c = t0;
    const words = ws.map((w, i) => {
      const d = ((t1 - t0) * weight[i]) / total;
      const o = { w, t0: +c.toFixed(3), t1: +(c + d).toFixed(3) };
      c += d;
      return o;
    });
    lines.push({ id: l.id, text: l.text, t0: +t0.toFixed(3), t1: +t1.toFixed(3), words });
    t = t1 + (l.after ?? 0.6);
    if (l.gate) {
      gates.push({ id: l.gate.id, line: l.id, t0: +t.toFixed(3), t1: +(t + l.gate.seconds).toFixed(3) });
      t += l.gate.seconds;
    }
  }
  return { duration: +(t + (S.tail ?? 2.6)).toFixed(3), lines, gates, draft: true };
}
if (DRAFT && !SCRIPT) throw new Error("--draft needs lessons/<id>/script.json");
if (DRAFT && has("--mp4")) throw new Error("--draft is for --dry and --sheet; voice the lesson before --mp4");
const VOICE = DRAFT ? draftVoice(SCRIPT) : JSON.parse(fs.readFileSync(path.join(dir, "voice.json"), "utf8"));
if (!DRAFT && SCRIPT) {
  const stale = SCRIPT.lines.filter((l, i) => VOICE.lines[i]?.id !== l.id || VOICE.lines[i]?.text !== l.text).map((l) => l.id);
  if (stale.length || SCRIPT.lines.length !== VOICE.lines.length) {
    console.error(`voice.json does not match script.json (${stale.join(", ") || "line count"}). Run tools/voice.mjs, or pass --draft.`);
    process.exit(1);
  }
}

// ---- the timeline: pure text, no browser ---------------------------------------

const problems = [];
const { L, W: wordAt } = voiceCues(VOICE);
const pageNames = Object.keys(CUE.pages);
const lineIds = new Set(VOICE.lines.map((l) => l.id));

function timeOf(ref, line) {
  if (ref == null || ref === "start") return line.t0;
  if (ref === "end") return line.t1;
  let m = /^gate:(\d+(?:\.\d+)?)%$/.exec(ref);
  if (m) {
    const g = (VOICE.gates ?? []).find((g) => g.line === line.id);
    if (!g) throw new Error(`"${ref}": line "${line.id}" has no gate`);
    return g.t0 + ((g.t1 - g.t0) * Number(m[1])) / 100;
  }
  let word = ref;
  m = /^([\w-]+):(.*)$/.exec(ref);
  if (m && lineIds.has(m[1])) {
    line = L(m[1]);
    word = m[2];
  }
  if (word === "" || word === "start") return line.t0;
  if (word === "end") return line.t1;
  const [w, n] = word.split("#");
  return wordAt(line.id, w, Number(n ?? 1));
}

function target(ref) {
  let raw = ref;
  if (ref.startsWith("@")) {
    raw = CUE.targets?.[ref.slice(1)];
    if (!raw) throw new Error(`no target "${ref}" in targets`);
  }
  const m = /^([\w-]+):\s+(.*)$/.exec(raw);
  if (m && CUE.pages[m[1]]) return { name: ref, page: m[1], sel: m[2] };
  return { name: ref, page: pageNames[0], sel: raw };
}

const VIEW = ["show", "code", "cut", "card"]; // what the frame is
const OVER = ["spot", "note", "mark", "ask"]; // drawn over the page while a view holds
const PTR = ["click", "hold", "set"]; // the cursor does something
const KINDS = [...VIEW, ...OVER, ...PTR];
const CUTS = path.join(HERE, "..", "engine", "cutaways");
const entries = [];
function add(lineId, cue, line) {
  try {
    const kind = KINDS.filter((k) => k in cue);
    if (kind.length !== 1) throw new Error(`a cue needs exactly one of ${KINDS.join(", ")}: ${JSON.stringify(cue)}`);
    const k = kind[0];
    const view = VIEW.includes(k);
    const t = line ? timeOf(cue.at, line) - (view && cue.at == null ? LEAD : 0) : 0;
    const e = { line: lineId, kind: k, t: Math.max(0, t), zoom: cue.zoom };
    if (cue.until != null && k !== "hold") {
      if (!line) throw new Error(`"until" needs a narration line`);
      e.tEnd = timeOf(cue.until, line);
      if (e.tEnd <= e.t) throw new Error(`${k} ends at ${e.tEnd.toFixed(2)}s, before it starts at ${e.t.toFixed(2)}s`);
    }
    if (k === "cut") {
      // a full-screen animation from engine/cutaways/<name>.js
      if (!fs.existsSync(path.join(CUTS, `${cue.cut}.js`))) throw new Error(`no cutaway engine/cutaways/${cue.cut}.js`);
      Object.assign(e, { name: `cut:${cue.cut}`, cut: cue.cut, params: cue.params ?? {} });
    } else if (k === "card") {
      // a title or closing card: { card: "Title", kicker: "Workshop 3 · Mechanisms" }
      Object.assign(e, { name: "card", title: String(cue.card), kicker: cue.kicker ?? "" });
    } else if (k === "ask") {
      // a question held on screen: { ask: "What happens when you let go?" }
      Object.assign(e, { name: "ask", text: String(cue.ask), place: cue.place ?? "top" });
    } else if (k === "note") {
      // two or three words beside an element: { note: "runs every loop", on: "@target", side: "right" }
      if (!cue.on) throw new Error(`note needs "on": the element it points at`);
      Object.assign(e, target(cue.on), { text: String(cue.note), side: cue.side ?? "right" });
    } else if (k === "show" && Array.isArray(cue.show)) {
      // several elements framed together
      const ts = cue.show.map(target);
      if (new Set(ts.map((x) => x.page)).size > 1) throw new Error(`show: the targets are on different pages`);
      Object.assign(e, ts[0], { name: cue.show.join("+"), more: ts.slice(1).map((x) => x.sel) });
    } else Object.assign(e, target(cue[k]));
    if (k === "mark") {
      // underline a phrase inside a paragraph: { mark: "@para", text: "last request" }
      if (!cue.text) throw new Error(`mark needs "text": the phrase to underline`);
      e.text = String(cue.text);
    }
    if (k === "set") {
      // move a slider or pick an option: { set: "@slider", value: 0.5, over: 1.2 }
      if (cue.value == null) throw new Error(`set needs "value"`);
      e.value = cue.value;
      e.tUp = e.t + (cue.over ?? 1.0);
    }
    if (k === "code") {
      if (!Array.isArray(cue.lines) || cue.lines.length !== 2) throw new Error(`code cue needs "lines": [from, to]`);
      [e.from, e.to] = cue.lines;
    }
    if (k === "hold") {
      if (!cue.until) throw new Error(`hold cue needs "until"`);
      e.tUp = timeOf(cue.until, line);
      if (e.tUp <= e.t) throw new Error(`hold releases at ${e.tUp.toFixed(2)}s, before it presses at ${e.t.toFixed(2)}s`);
    }
    entries.push(e);
  } catch (err) {
    problems.push(`${lineId}: ${err.message}`);
  }
}
for (const c of CUE.open ?? []) add("(open)", c, null);
for (const [id, list] of Object.entries(CUE.lines)) {
  if (!lineIds.has(id)) {
    problems.push(`${id}: no such narration line in voice.json`);
    continue;
  }
  for (const c of list) add(id, c, L(id));
}
entries.sort((a, b) => a.t - b.t);
entries.forEach((e, i) => (e.id = `e${i}`));

const full = (e) => e.kind === "cut" || e.kind === "card";
let views = entries.filter((e) => VIEW.includes(e.kind));
// a cutaway or card with "until" hands the frame back to the view it interrupted
for (const v of [...views]) {
  if (!full(v) || v.tEnd == null) continue;
  const back = views.findLast((p) => p.t < v.t && !full(p));
  const next = views.find((p) => p.t > v.t);
  if (back && !(next && next.t <= v.tEnd + 0.01)) {
    const again = { ...back, t: v.tEnd, line: v.line, again: true };
    entries.push(again);
    views.push(again);
    views.sort((a, b) => a.t - b.t);
  }
}
entries.sort((a, b) => a.t - b.t);
entries.forEach((e, i) => (e.id = `e${i}`));
views = entries.filter((e) => VIEW.includes(e.kind));
let lastPage = pageNames[0];
for (const v of views) {
  if (full(v)) v.page = lastPage; // a full-screen view is drawn over whichever page is up
  else lastPage = v.page;
}
views.forEach((v, i) => {
  v.d = i === 0 || views[i - 1].page !== v.page ? 0 : MOVE;
  v.t1 = views[i + 1]?.t ?? VOICE.duration;
});
const switches = views.filter((v, i) => i > 0 && views[i - 1].page !== v.page).map((v) => v.t);
const pageAt = (t) => views.findLast((v) => v.t <= t)?.page ?? views[0]?.page ?? pageNames[0];
const overlays = entries.filter((e) => OVER.includes(e.kind));
for (const o of overlays) {
  // an overlay with no "until" lasts as long as the view it sits on
  o.t1 = o.tEnd ?? views.findLast((v) => v.t <= o.t)?.t1 ?? VOICE.duration;
  o.page ??= pageAt(o.t);
  if (o.sel && pageAt(o.t) !== o.page) problems.push(`${o.line}: ${o.kind} ${o.name} at ${o.t.toFixed(2)}s is on page "${o.page}" while "${pageAt(o.t)}" is on screen`);
}
// one spotlight at a time: a new one takes over from the last
const spots = overlays.filter((o) => o.kind === "spot");
spots.forEach((o, i) => {
  if (spots[i + 1] && spots[i + 1].t < o.t1) o.t1 = spots[i + 1].t + 0.3;
});
const cutLen = views.filter((v) => v.kind === "cut").map((v) => [v, v.t1 - v.t]);
for (const [v, d] of cutLen) if (d > 16) problems.push(`${v.line}: cutaway ${v.cut} runs ${d.toFixed(1)}s. Keep a cutaway to 5 to 15 s and one idea.`);
if (cutLen.length > 2) problems.push(`${cutLen.length} cutaways in one video. Two at most: the page is the lesson.`);
const pointer = entries.filter((e) => PTR.includes(e.kind));
for (const p of pointer) {
  for (const t of p.kind === "click" ? [p.t] : [p.t, p.tUp])
    if (pageAt(t) !== p.page) problems.push(`${p.line}: ${p.kind} ${p.name} at ${t.toFixed(2)}s is on page "${p.page}" while "${pageAt(t)}" is on screen`);
}
if (!views.some((v) => !full(v))) problems.push("no show or code cue: nothing to film");
const silent = VOICE.lines.filter((l) => !CUE.lines[l.id]?.length).map((l) => l.id);

// ---- the browser -----------------------------------------------------------------

// Runs inside the lesson page. Everything it paints is a function of t and of
// the page's own state, so the same run always films the same frames.
async function runtime({ voice, chrome, W, H, SAFE_H, MARGIN, MAX_ZOOM, cutNames }) {
  const core = await import("/__vk/core.js");
  const kit = await import("/__vk/kit.js");
  const { easeInOut, easeOut, ramp, lerp, window_: win, captions, C, SANS, SERIF, MONO } = core;
  const cuts = {};
  for (const n of cutNames) {
    cuts[n] = await import(`/__vk/cutaways/${n}.js`);
    if (typeof cuts[n].draw !== "function") throw new Error(`engine/cutaways/${n}.js exports no draw(ctx, s, dur, params, lib)`);
  }
  const main = document.querySelector("#main-content");
  if (!main) throw new Error("no #main-content on this page");

  const missing = chrome.filter((s) => !s.startsWith("?") && !document.querySelector(s));
  const sels = chrome.map((s) => s.replace(/^\?/, ""));
  const style = document.createElement("style");
  style.textContent = `
    html, body { overflow: hidden !important; background: var(--bg) !important; scroll-behavior: auto !important; }
    *, *::before, *::after { transition: none !important; animation: none !important; }
    ${sels.join(", ")} { display: none !important; }
    #main-content { margin: 0 !important; width: ${W}px !important; height: auto !important; overflow: visible !important; transform-origin: 0 0 !important; }
  `;
  document.head.append(style);
  // the caption face, loaded the way lessons/<id>/index.html loads it
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&display=block";
  await new Promise((r) => {
    link.onload = link.onerror = r;
    document.head.append(link);
  });
  await document.fonts.load('500 38px "Instrument Sans"').catch(() => {});
  const fontOk = document.fonts.check('500 38px "Instrument Sans"');
  for (const img of document.images) img.loading = "eager";
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  cv.style.cssText = `position:fixed;left:0;top:0;width:${W}px;height:${H}px;z-index:2147483647;pointer-events:none`;
  document.documentElement.append(cv);
  const ctx = cv.getContext("2d");

  const els = {};
  const more = {}; // id -> the other elements a multi-target show frames
  const rows = (el) => [...el.querySelectorAll("pre code > div")];
  const one = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  };
  const union = (rs) => {
    const x = Math.min(...rs.map((r) => r.x));
    const y = Math.min(...rs.map((r) => r.y));
    return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
  };
  const box = (el) => one(el);
  const boxOf = (id) => union([els[id], ...(more[id] ?? [])].map(one));
  // the rectangles a phrase occupies inside an element, one per line it wraps onto
  function phrase(id, text) {
    const el = els[id];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let all = "";
    for (let n; (n = walker.nextNode()); ) {
      nodes.push({ n, at: all.length });
      all += n.data;
    }
    const i = all.indexOf(text);
    if (i < 0) return null;
    const at = (k) => {
      const e = nodes.findLast((x) => x.at <= k);
      return [e.n, k - e.at];
    };
    const r = document.createRange();
    r.setStart(...at(i));
    const [en, eo] = at(i + text.length - 1);
    r.setEnd(en, eo + 1);
    return [...r.getClientRects()].filter((q) => q.width > 1).map((q) => ({ x: q.left, y: q.top, w: q.width, h: q.height }));
  }
  // a range input or select, set the way React hears it
  function setValue(id, v) {
    const el = els[id];
    const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const valueOf = (id) => els[id].value;
  const settable = (id) => els[id] instanceof HTMLSelectElement || (els[id] instanceof HTMLInputElement && ["range", "number", "text"].includes(els[id].type));
  // where a shot wants the camera, in the page's own untransformed pixels
  function goal(s) {
    let r = boxOf(s.id);
    if (s.kind === "code") {
      const lines = rows(els[s.id]).slice(s.from - 1, s.to);
      const pre = box(els[s.id].querySelector("pre"));
      const tops = lines.map((l) => l.lastElementChild.getBoundingClientRect());
      const y0 = Math.max(r.y, tops[0].top - 66);
      const y1 = Math.min(r.y + r.h, tops.at(-1).bottom + 66);
      r = { x: pre.x, y: y0, w: pre.w, h: y1 - y0 };
    }
    const fit = Math.min((W - 2 * MARGIN) / r.w, (SAFE_H - 2 * MARGIN) / r.h);
    const z = s.zoom ?? Math.min(fit, MAX_ZOOM);
    return { x: r.x + r.w / 2, y: r.y + r.h / 2, z, w: r.w * z, h: r.h * z };
  }
  const still = () => {
    window.scrollTo(0, 0);
    main.style.transform = "none";
  };
  // where the cursor lands: off a wide control's label, dead centre on a small one
  const centre = (id) => {
    const r = els[id].getBoundingClientRect();
    const wide = r.width > 60;
    return { x: r.left + r.width * (wide ? 0.8 : 0.5), y: r.top + r.height * (wide ? 0.68 : 0.5) };
  };

  function frame({ t, shots, pointer, down, veil, stamp, overlays = [] }) {
    still();
    let cur = null;
    let on = null;
    for (const s of shots) {
      if (t < s.t) break;
      if (s.kind === "cut" || s.kind === "card") {
        on = null;
        continue;
      }
      const g = goal(s);
      const k = s.d > 0 ? easeInOut(ramp(t, s.t, s.d)) : 1;
      cur = cur ? { x: lerp(cur.x, g.x, k), y: lerp(cur.y, g.y, k), z: lerp(cur.z, g.z, k) } : g;
      on = { id: s.id, settled: t >= s.t + s.d, fits: g.w <= W && g.h <= SAFE_H, w: g.w, h: g.h };
    }
    cur ??= { x: W / 2, y: SAFE_H / 2, z: 1 };
    main.style.transform = `translate(${Math.round(W / 2 - cur.z * cur.x)}px, ${Math.round(SAFE_H / 2 - cur.z * cur.y)}px) scale(${cur.z})`;

    // code: light the named lines, dim the others
    const lit = new Map();
    for (const s of shots) {
      if (s.kind !== "code") continue;
      const a = win(t, s.t, s.t1, 0.35);
      const m = lit.get(els[s.id]) ?? rows(els[s.id]).map(() => ({ dim: 0, lit: 0 }));
      m.forEach((r, i) => {
        const inside = i + 1 >= s.from && i + 1 <= s.to;
        if (inside) r.lit = Math.max(r.lit, a);
        else r.dim = Math.max(r.dim, a);
      });
      lit.set(els[s.id], m);
    }
    for (const [el, m] of lit)
      rows(el).forEach((row, i) => {
        for (const span of row.children) span.style.opacity = String(1 - 0.72 * m[i].dim * (1 - m[i].lit));
        row.lastElementChild.style.background = m[i].lit ? `oklch(0.755 0.155 55 / ${0.16 * m[i].lit})` : "";
      });

    ctx.clearRect(0, 0, W, H);
    // the page fades out under the caption band, so no lesson text sits behind a caption
    const band = ctx.createLinearGradient(0, SAFE_H - 50, 0, SAFE_H + 10);
    band.addColorStop(0, core.alpha(C.bg, 0));
    band.addColorStop(1, C.bg);
    ctx.fillStyle = band;
    ctx.fillRect(0, SAFE_H - 50, W, H - SAFE_H + 50);
    if (veil > 0) {
      ctx.globalAlpha = veil;
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    // signals drawn over the page: one thing lit, everything else quieter
    for (const o of overlays) {
      const a = win(t, o.t, o.t1, 0.3);
      if (a <= 0) continue;
      ctx.save();
      if (o.kind === "spot") {
        const r = boxOf(o.id);
        const p = 16;
        ctx.globalAlpha = 0.66 * a;
        ctx.fillStyle = C.bg;
        ctx.beginPath();
        ctx.rect(0, 0, W, SAFE_H + 10);
        ctx.roundRect(r.x - p, r.y - p, r.w + 2 * p, r.h + 2 * p, 6);
        ctx.fill("evenodd");
        ctx.globalAlpha = 0.8 * a;
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(r.x - p, r.y - p, r.w + 2 * p, r.h + 2 * p, 6);
        ctx.stroke();
      } else if (o.kind === "mark") {
        const rs = phrase(o.id, o.text) ?? [];
        const k = easeOut(ramp(t, o.t, 0.45));
        const total = rs.reduce((n, r) => n + r.w, 0);
        let left = total * k;
        ctx.globalAlpha = a;
        for (const r of rs) {
          const w = Math.max(0, Math.min(r.w, left));
          ctx.fillStyle = core.alpha(C.accent, 0.3);
          ctx.fillRect(r.x - 2, r.y + r.h * 0.08, w + 4, r.h * 0.9);
          ctx.fillStyle = C.accent;
          ctx.fillRect(r.x - 2, r.y + r.h * 0.98, w + 4, 3);
          left -= r.w;
        }
      } else if (o.kind === "note") {
        const r = boxOf(o.id);
        ctx.font = `600 30px ${SANS}`;
        const tw = ctx.measureText(o.text).width;
        const bw = tw + 44;
        const bh = 58;
        const gap = 56;
        let bx, by, ax, ay;
        if (o.side === "left") [bx, by, ax, ay] = [r.x - gap - bw, r.y + r.h / 2 - bh / 2, r.x - 8, r.y + r.h / 2];
        else if (o.side === "top") [bx, by, ax, ay] = [r.x + r.w / 2 - bw / 2, r.y - gap - bh, r.x + r.w / 2, r.y - 8];
        else if (o.side === "bottom") [bx, by, ax, ay] = [r.x + r.w / 2 - bw / 2, r.y + r.h + gap, r.x + r.w / 2, r.y + r.h + 8];
        else [bx, by, ax, ay] = [r.x + r.w + gap, r.y + r.h / 2 - bh / 2, r.x + r.w + 8, r.y + r.h / 2];
        bx = Math.max(24, Math.min(W - bw - 24, bx));
        by = Math.max(24, Math.min(SAFE_H - bh - 30, by));
        const lx = Math.max(bx, Math.min(bx + bw, ax));
        const ly = Math.max(by, Math.min(by + bh, ay));
        const k = easeOut(ramp(t, o.t, 0.35));
        ctx.globalAlpha = a;
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lerp(lx, ax, k), lerp(ly, ay, k));
        ctx.stroke();
        ctx.fillStyle = C.accent;
        ctx.beginPath();
        ctx.arc(lerp(lx, ax, k), lerp(ly, ay, k), 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 4);
        ctx.fillStyle = C.accent;
        ctx.fill();
        ctx.fillStyle = C.accentInk;
        ctx.textBaseline = "middle";
        ctx.fillText(o.text, bx + 22, by + bh / 2 + 2);
      } else if (o.kind === "ask") {
        ctx.font = `500 44px ${SERIF}`;
        const tw = ctx.measureText(o.text).width;
        const bw = tw + 96;
        const bx = W / 2 - bw / 2;
        const by = o.place === "bottom" ? SAFE_H - 190 : 54;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, 118, 6);
        ctx.fillStyle = C.bg2;
        ctx.fill();
        ctx.strokeStyle = C.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = `500 17px ${MONO}`;
        ctx.fillStyle = C.accent;
        ctx.letterSpacing = "2.5px";
        ctx.fillText("YOUR TURN", bx + 48, by + 38);
        ctx.letterSpacing = "0px";
        ctx.font = `500 44px ${SERIF}`;
        ctx.fillStyle = C.tx;
        ctx.fillText(o.text, bx + 48, by + 88);
      }
      ctx.restore();
    }
    // full-screen views: a title or closing card, or a cutaway animation
    for (const s of shots) {
      if (s.kind !== "cut" && s.kind !== "card") continue;
      const a = win(t, s.t, s.t1, 0.35);
      if (a <= 0) continue;
      ctx.save();
      ctx.globalAlpha = a;
      core.background(ctx);
      if (s.kind === "card") {
        if (s.kicker) core.micro(ctx, s.kicker, W / 2, 432, { align: "center", color: C.accent, size: 22 });
        ctx.font = `500 92px ${SERIF}`;
        const rowsT = [""];
        for (const w of s.title.split(" ")) {
          const tryRow = (rowsT.at(-1) + " " + w).trim();
          if (ctx.measureText(tryRow).width > 1500 && rowsT.at(-1)) rowsT.push(w);
          else rowsT[rowsT.length - 1] = tryRow;
        }
        rowsT.forEach((row, i) => core.text(ctx, row, W / 2, 560 + i * 108 - (rowsT.length - 1) * 40, { font: SERIF, size: 92, align: "center" }));
      } else {
        cuts[s.cut].draw(ctx, Math.max(0, t - s.t), s.t1 - s.t, s.params, { core, kit });
        core.vignette(ctx);
      }
      ctx.restore();
    }

    // the cursor: a screenshot has none, so it is drawn, and it travels to each action
    if (pointer.length) {
      const ni = pointer.findIndex((e) => e.t > t);
      const prev = ni === -1 ? pointer.at(-1) : pointer[ni - 1];
      const next = ni === -1 ? null : pointer[ni];
      let p = prev ? centre(prev.id) : { x: W * 0.62, y: H + 40 };
      if (next) {
        const start = Math.max(prev ? prev.t + 0.1 : -1e9, next.t - 0.8);
        const k = easeInOut(ramp(t, start, Math.max(0.05, next.t - 0.08 - start)));
        const to = centre(next.id);
        p = { x: lerp(p.x, to.x, k), y: lerp(p.y, to.y, k) };
      }
      const a = down ? 1 : Math.max(prev ? 1 - ramp(t, prev.t + 1.0, 0.4) : 0, next ? ramp(t, next.t - 0.9, 0.2) : 0);
      if (a > 0) {
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(p.x, p.y);
        if (down) {
          ctx.strokeStyle = C.accent;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.scale(1.7, 1.7);
        ctx.beginPath();
        for (const [i, [x, y]] of [[0, 0], [0, 21], [5.5, 16.5], [9.5, 25], [13, 23.5], [9, 15], [16, 15]].entries()) i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        ctx.closePath();
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.6;
        ctx.lineJoin = "round";
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    captions(ctx, voice, t);
    if (stamp) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, 210, 64);
      ctx.fillStyle = "#fff";
      ctx.font = "600 40px Consolas, monospace";
      ctx.fillText(t.toFixed(1) + "s", 18, 46);
    }
    return on;
  }

  window.__vk = {
    els,
    frame,
    centre,
    probe: (s) => (still(), goal(s)),
    more,
    phrase,
    setValue,
    valueOf,
    settable,
    lineCount: (id) => rows(els[id]).length,
    hydrated: (id) => Object.keys(els[id]).some((k) => k.startsWith("__reactProps")),
    // let React commit whatever the last timer tick or input set
    flush: () =>
      new Promise((r) => {
        const a = new MessageChannel();
        a.port1.onmessage = () => {
          const b = new MessageChannel();
          b.port1.onmessage = r;
          b.port2.postMessage(0);
        };
        a.port2.postMessage(0);
      }),
  };
  return { missing, fontOk };
}

const report = [];
const row = (t, line, what, status) => report.push([t.toFixed(2).padStart(6) + "s", line.padEnd(10), what.padEnd(46), status]);

// --gpu: draw WebGL on the real graphics card. Headless Chromium otherwise
// rasterises a 3D model on the CPU, about a second a frame.
const launchArgs = has("--gpu") ? ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] : [];
const browser = await chromium.launch({ args: launchArgs }).catch(() => {
  // This Playwright's own Chromium build is not downloaded. Use the newest
  // headless shell that is, rather than fetch one.
  const root = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  const builds = fs.existsSync(root) ? fs.readdirSync(root).filter((d) => d.startsWith("chromium_headless_shell-")).sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1])) : [];
  for (const b of builds) {
    const exe = path.join(root, b, "chrome-headless-shell-win64", "chrome-headless-shell.exe");
    if (fs.existsSync(exe)) {
      console.log(`note: Playwright's own Chromium is not installed, using ${b}`);
      return chromium.launch({ executablePath: exe, args: launchArgs });
    }
  }
  throw new Error("no Chromium for Playwright: run `npx playwright install chromium`");
});
let code = 0;
try {
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, colorScheme: "dark", reducedMotion: "no-preference" });
  await context.route("**/__vk/**", (r) => {
    const rel = new URL(r.request().url()).pathname.split("/__vk/")[1];
    const file = path.join(HERE, "..", "engine", rel);
    if (!file.startsWith(path.join(HERE, "..", "engine")) || !fs.existsSync(file)) return r.fulfill({ status: 404, body: "" });
    return r.fulfill({ contentType: "text/javascript", body: fs.readFileSync(file) });
  });
  const pages = {};
  for (const [name, route] of Object.entries(CUE.pages)) {
    const page = (pages[name] = await context.newPage());
    page.on("pageerror", (e) => console.error(`page error (${name}):`, e.message));
    await page.clock.install();
    let res;
    try {
      res = await page.goto(base + route, { waitUntil: "load", timeout: 180000 });
    } catch (e) {
      throw new Error(`cannot open ${base + route}. Is the Next server running? (${e.message.split("\n")[0]})`);
    }
    if (!res.ok()) throw new Error(`${base + route} answered ${res.status()}`);
    await page.waitForFunction(() => Object.keys(document.querySelector("#main-content") ?? {}).some((k) => k.startsWith("__react")), null, { timeout: 120000 });
    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
    await page.waitForFunction(() => !/loading [a-z ]+…/i.test(document.querySelector("#main-content").textContent), null, { timeout: 20000 }).catch(() => {});
    const { missing, fontOk } = await page.evaluate(runtime, { voice: VOICE, chrome: CHROME, W, H, SAFE_H, MARGIN, MAX_ZOOM, cutNames: [...new Set(entries.filter((e) => e.kind === "cut").map((e) => e.cut))] });
    for (const s of missing) problems.push(`page "${name}": chrome selector matches nothing, so it would be filmed: ${s}`);
    if (!fontOk) problems.push(`page "${name}": the caption font did not load (offline?)`);
  }

  // every target: exactly one visible element
  for (const e of entries) {
    if (e.again) continue;
    if (!e.sel) {
      const what = e.kind === "cut" ? `cut ${e.cut} for ${((views.find((v) => v.id === e.id)?.t1 ?? e.t) - e.t).toFixed(1)}s` : `${e.kind} "${e.title ?? e.text}"`;
      row(e.t, e.line, what, "ok");
      continue;
    }
    const page = pages[e.page];
    const loc = page.locator(e.sel);
    const n = await loc.count();
    const vis = [];
    for (let i = 0; i < n; i++) if (await loc.nth(i).isVisible()) vis.push(i);
    const what = `${e.kind} ${e.kind === "note" ? `"${e.text}" on ` : ""}${e.name}${e.kind === "code" ? ` lines ${e.from}-${e.to}` : ""}${e.kind === "hold" ? ` until ${e.tUp.toFixed(2)}s` : ""}${e.kind === "mark" ? ` "${e.text}"` : ""}${e.kind === "set" ? ` to ${e.value}` : ""}`;
    if (vis.length !== 1) {
      const why = n === 0 ? "matches nothing" : vis.length === 0 ? `matches ${n}, none visible` : `matches ${vis.length} visible elements, need one`;
      problems.push(`${e.line}: ${e.name} ${why} on ${CUE.pages[e.page]}  [${e.sel}]`);
      row(e.t, e.line, what, `MISSING: ${why}`);
      e.bad = true;
      continue;
    }
    await loc.nth(vis[0]).evaluate((el, id) => (window.__vk.els[id] = el), e.id);
    let status = "found";
    let lost = false;
    for (const sel of e.more ?? []) {
      const l2 = page.locator(sel);
      const v2 = [];
      for (let i = 0; i < (await l2.count()); i++) if (await l2.nth(i).isVisible()) v2.push(i);
      if (v2.length !== 1) {
        problems.push(`${e.line}: ${e.name}: [${sel}] matches ${v2.length} visible elements, need one`);
        lost = true;
      } else await l2.nth(v2[0]).evaluate((el, id) => (window.__vk.more[id] ??= []).push(el), e.id);
    }
    if (e.kind === "mark" && !(await page.evaluate(([id, text]) => window.__vk.phrase(id, text)?.length, [e.id, e.text]))) {
      problems.push(`${e.line}: mark: the phrase "${e.text}" is not in ${e.name}`);
      lost = true;
    }
    if (e.kind === "set" && !(await page.evaluate((id) => window.__vk.settable(id), e.id))) {
      problems.push(`${e.line}: set: ${e.name} is not a slider, text input or select`);
      lost = true;
    }
    if (lost) {
      row(e.t, e.line, what, "MISSING");
      e.bad = true;
      continue;
    }
    if (e.kind === "code") {
      const count = await page.evaluate((id) => window.__vk.lineCount(id), e.id);
      if (!(e.from >= 1 && e.to >= e.from && e.to <= count)) {
        problems.push(`${e.line}: ${e.name} has ${count} lines, cue asks for ${e.from}-${e.to}`);
        row(e.t, e.line, what, `MISSING: block has ${count} lines`);
        e.bad = true;
        continue;
      }
    }
    if (OVER.includes(e.kind)) {
      row(e.t, e.line, what, `found, until ${e.t1.toFixed(2)}s`);
      continue;
    }
    if (e.kind === "show" || e.kind === "code") {
      const g = await page.evaluate((s) => window.__vk.probe(s), e);
      status += `, zoom ${g.z.toFixed(2)}, ${Math.round(g.w)}x${Math.round(g.h)} on screen`;
      if (g.w > W || g.h > SAFE_H) {
        status += " CUT OFF";
        problems.push(`${e.line}: ${e.name} is ${Math.round(g.w)}x${Math.round(g.h)} at zoom ${g.z.toFixed(2)}, larger than the ${W}x${SAFE_H} above the captions`);
      }
    } else {
      const ok = await page.waitForFunction((id) => window.__vk.hydrated(id), e.id, { timeout: 30000 }).then(() => true, () => false);
      if (!ok) problems.push(`${e.line}: ${e.name} never hydrated, a ${e.kind} would do nothing`);
      status += ok ? ", interactive" : " NOT INTERACTIVE";
    }
    row(e.t, e.line, what, status);
  }

  console.log(`${path.basename(dir)}: ${VOICE.duration}s, ${VOICE.lines.length} lines, ${entries.length} cues, pages ${Object.values(CUE.pages).join(" ")}`);
  for (const r of report) console.log("  " + r.join("  "));
  if (silent.length) console.log(`  lines with no cue of their own (the picture holds): ${silent.join(", ")}`);
  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const p of problems) console.error("  x " + p);
    throw new Error("cue file does not match the page");
  }
  if (has("--dry")) console.log("dry run ok");

  const sheet = opt("--sheet");
  const mp4 = opt("--mp4");
  if (sheet || mp4) {
    const fps = Number(opt("--fps", 30));
    const n = Math.ceil(VOICE.duration * fps);
    const beats = [...VOICE.lines.map((l) => l.t0 + 0.65 * (l.t1 - l.t0)), ...(VOICE.gates ?? []).flatMap((g) => [g.t0 + 0.5 * (g.t1 - g.t0), g.t0 + 0.92 * (g.t1 - g.t0)])].sort((a, b) => a - b).map((x) => +x.toFixed(2));
    const sampleTimes = sheet ? (opt("--times") ? opt("--times").split(",").map(Number) : !has("--every") ? beats : Array.from({ length: Math.floor(VOICE.duration / Number(opt("--every", 4))) }, (_, i) => (i + 0.5) * Number(opt("--every", 4)))) : [];
    const sampleFrames = new Map(sampleTimes.map((t, i) => [Math.round(t * fps), i]));

    const cdp = {};
    for (const [name, page] of Object.entries(pages)) {
      cdp[name] = await context.newCDPSession(page);
      await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 5000);
    }
    const shots = Object.fromEntries(pageNames.map((p) => [p, views.filter((v) => v.page === p)]));
    const over = Object.fromEntries(pageNames.map((p) => [p, overlays.filter((o) => o.page === p)]));
    const sets = pointer.filter((e) => e.kind === "set");
    const from = new Map();
    const ptr = Object.fromEntries(pageNames.map((p) => [p, pointer.filter((e) => e.page === p).flatMap((e) => (e.kind === "set" ? [{ t: e.t, id: e.id, act: "move" }] : e.kind === "hold" ? [{ t: e.t, id: e.id, act: "down" }, { t: e.tUp, id: e.id, act: "up" }] : [{ t: e.t, id: e.id, act: "click" }])).sort((a, b) => a.t - b.t)]));
    const fired = new Set();
    const down = {};
    const cut = new Map();
    const grab = async (name) => Buffer.from((await cdp[name].send("Page.captureScreenshot", { format: "jpeg", quality: 92 })).data, "base64");

    let ff, tmp;
    if (mp4) {
      const voice = path.join(dir, "voice", "voice.wav");
      // mjpeg frames in, H.264 and AAC out
      ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-", "-i", voice, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", path.resolve(mp4)], { stdio: ["pipe", "inherit", "inherit"] });
    }
    if (sheet) tmp = fs.mkdtempSync(path.join(path.dirname(path.resolve(sheet)), ".sheet-"));

    const t0 = Date.now();
    const pend = {};
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      const step = Math.round(((i + 1) * 1000) / fps) - Math.round((i * 1000) / fps);
      const active = pageAt(t);
      const veil = Math.max(0, ...switches.map((s) => 1 - Math.abs(t - s) / DIP));
      for (const [name, page] of Object.entries(pages)) {
        pend[name] = (pend[name] ?? 0) + (i ? step : 0);
        // a contact sheet only needs the frames it samples: let the page's clock run on between them
        const busy = ptr[name].some((e) => e.t <= t && !fired.has(e)) || sets.some((e) => e.page === name && t >= e.t && !e.done);
        if (!ff && !sampleFrames.has(i) && !busy) continue;
        if (pend[name]) await page.clock.runFor(pend[name]);
        pend[name] = 0;
        const due = ptr[name].filter((e) => e.t <= t && !fired.has(e));
        const arg = { t, shots: shots[name], pointer: ptr[name], down: !!down[name], veil, stamp: false, overlays: over[name] };
        // a slider travels from where it was to its value while the cursor holds it
        for (const e of sets) {
          if (e.page !== name || t < e.t || e.done) continue;
          if (!from.has(e)) from.set(e, await page.evaluate((id) => window.__vk.valueOf(id), e.id));
          const k = Math.min(1, (t - e.t) / (e.tUp - e.t));
          const a0 = Number(from.get(e));
          const v = typeof e.value === "number" && Number.isFinite(a0) ? a0 + (e.value - a0) * (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2) : e.value;
          await page.evaluate(([id, v]) => window.__vk.setValue(id, v), [e.id, v]);
          down[name] = k < 1;
          if (k >= 1) e.done = true;
        }
        if (due.length) {
          await page.evaluate((a) => window.__vk.frame(a), arg);
          for (const e of due) {
            fired.add(e);
            const p = await page.evaluate((id) => window.__vk.centre(id), e.id);
            await page.mouse.move(p.x, p.y);
            if (e.act === "move") continue;
            if (e.act !== "up") await page.mouse.down();
            if (e.act !== "down") await page.mouse.up();
            down[name] = e.act === "down";
          }
          arg.down = !!down[name];
        }
        if (name !== active) continue;
        await page.evaluate(() => window.__vk.flush());
        const wantSheet = sampleFrames.has(i);
        const on = await page.evaluate((a) => window.__vk.frame(a), arg);
        if (on?.settled && !on.fits) cut.set(on.id, on);
        if (ff) {
          const buf = await grab(name);
          if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
        }
        if (wantSheet) {
          await page.evaluate((a) => window.__vk.frame(a), { ...arg, stamp: true });
          fs.writeFileSync(path.join(tmp, `${String(sampleFrames.get(i)).padStart(3, "0")}.jpg`), await grab(name));
        }
      }
      if (i % (fps * 5) === 0) process.stdout.write(`\r  frame ${i}/${n}`);
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    if (ff) {
      ff.stdin.end();
      await new Promise((r) => ff.on("close", r));
      console.log(`\rmp4: ${n} frames in ${secs}s -> ${mp4}`);
    }
    if (sheet) {
      const k = sampleTimes.length;
      const cols = Math.min(4, k);
      const draw = sampleTimes.map((_, i) => `[${i}:v]scale=640:-1[v${i}]`).join(";");
      const layout = sampleTimes.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join("|");
      const inputs = sampleTimes.flatMap((_, i) => ["-i", path.join(tmp, `${String(i).padStart(3, "0")}.jpg`)]);
      const filter = k > 1 ? `${draw};${sampleTimes.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${k}:layout=${layout}:fill=black` : draw.replace("[v0]", "");
      await run("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filter, "-frames:v", "1", path.resolve(sheet)]);
      fs.rmSync(tmp, { recursive: true });
      console.log(`\rsheet: ${k} frames (${cols}x${Math.ceil(k / cols)}) in ${secs}s -> ${sheet}`);
    }
    // layout can change with the page's state, so the fit is checked on every frame too
    for (const [id, on] of cut) {
      const e = entries.find((e) => e.id === id);
      console.error(`  x ${e.line}: ${e.name} grew to ${Math.round(on.w)}x${Math.round(on.h)} while on screen, larger than ${W}x${SAFE_H}`);
      code = 1;
    }
  }
} catch (e) {
  console.error("\n" + e.message);
  code = 1;
} finally {
  await browser.close();
}
process.exit(code);

function run(cmd, args) {
  return new Promise((res, rej) => spawn(cmd, args, { stdio: "inherit" }).on("close", (c) => (c ? rej(new Error(`${cmd} exited ${c}`)) : res())));
}
