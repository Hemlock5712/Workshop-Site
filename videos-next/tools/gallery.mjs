#!/usr/bin/env node
// The front page of videos-next: every video in course order, with its MP4 and its
// interactive version.   node tools/gallery.mjs  ->  index.html
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const S = JSON.parse(fs.readFileSync(path.join(ROOT, "series", "series.json"), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

let total = 0;
const rows = S.videos
  .map((v, i) => {
    const vj = path.join(ROOT, "lessons", v.id, "voice.json");
    const dur = fs.existsSync(vj) ? JSON.parse(fs.readFileSync(vj, "utf8")).duration : 0;
    total += dur;
    const mp4 = fs.existsSync(path.join(ROOT, "out", `${v.id}.mp4`));
    return `<li>
  <span class="n">${String(i + 1).padStart(2, "0")}</span>
  <div><p class="kick">${esc(v.workshop)} · ${esc(v.page)}</p><h2>${esc(v.title)}</h2><p class="gate">Your turn: ${esc(v.gate)}</p></div>
  <span class="dur">${fmt(dur)}</span>
  <span class="links">${mp4 ? `<a href="out/${v.id}.mp4">Video</a>` : "<em>rendering</em>"}<a href="lessons/${v.id}/">Interactive</a></span>
</li>`;
  })
  .join("\n");

fs.writeFileSync(
  path.join(ROOT, "index.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Workshop Videos</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400..600&family=Newsreader:opsz,wght@6..72,400..600&display=swap" rel="stylesheet">
<style>
:root{--bg:oklch(0.155 0.038 265);--bg2:oklch(0.196 0.042 265);--tx:oklch(0.955 0.012 85);--tx2:oklch(0.795 0.016 260);--tx3:oklch(0.615 0.022 260);--rule:oklch(0.325 0.032 265);--accent:oklch(0.755 0.155 55)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.55 "Instrument Sans",system-ui,sans-serif}
main{max-width:980px;margin:0 auto;padding:40px 16px 80px}h1{font:500 44px Newsreader,Georgia,serif;margin:0 0 6px}
.lede{color:var(--tx2);margin:0 0 28px}ol{list-style:none;padding:0;margin:0}
li{display:grid;grid-template-columns:44px 1fr auto auto;gap:18px;align-items:center;padding:18px 0;border-top:1px solid var(--rule)}
.n{font:14px "JetBrains Mono",monospace;color:var(--tx3)}.kick{font:12px "JetBrains Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin:0}
h2{font:500 26px Newsreader,Georgia,serif;margin:2px 0}.gate{margin:0;color:var(--tx3);font-size:14px}
.dur{font:14px "JetBrains Mono",monospace;color:var(--tx2)}.links{display:flex;gap:8px}
.links a{font:600 14px "Instrument Sans",sans-serif;color:var(--tx);text-decoration:none;border:1px solid var(--rule);border-radius:3px;padding:8px 12px;white-space:nowrap}
.links a:first-child{border-color:var(--accent)}.links a:hover{background:var(--bg2)}em{color:var(--tx3);font-size:13px}
@media(max-width:700px){li{grid-template-columns:32px 1fr}.dur,.links{grid-column:2}}
</style></head><body><main>
<h1>Workshops 2–4, on video</h1>
<p class="lede">${S.videos.length} videos, ${fmt(total)} in total, in course order. Each one is a coded animation narrated in a cloned voice. The interactive version pauses at "your turn" so you can drive it yourself.</p>
<ol>${rows}</ol></main></body></html>`,
);
console.log(`index.html: ${S.videos.length} videos, ${fmt(total)}`);
