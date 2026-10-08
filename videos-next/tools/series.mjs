#!/usr/bin/env node
// Render series/series.json as a review page: every video's script in order,
// with what it picks up from the last one and hands to the next.
//   node tools/series.mjs            -> series/index.html
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const S = JSON.parse(fs.readFileSync(path.join(ROOT, "series", "series.json"), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const words = (v) => v.lines.reduce((n, l) => n + l[1].split(/\s+/).length, 0);

// --emit <id>: write lessons/<id>/script.json from the approved lines
const emit = process.argv.indexOf("--emit");
if (emit > 0) {
  const id = process.argv[emit + 1];
  const v = S.videos.find((x) => x.id === id);
  if (!v) throw new Error(`no video ${id}`);
  const dir = path.join(ROOT, "lessons", id);
  fs.mkdirSync(dir, { recursive: true });
  const script = {
    title: v.title,
    voice: { engine: "chatterbox", id: "joe", ref: "voices/joe/reference.wav" },
    lead: 3.4,
    tail: 2.6,
    lines: v.lines.map(([lid, text, flag]) => ({ id: lid, text, after: flag === "gate" ? 0.3 : 0.6, ...(flag === "gate" ? { gate: { id: "try", seconds: 8 } } : {}), ...(flag === "rec" ? { rec: true } : {}) })),
  };
  fs.writeFileSync(path.join(dir, "script.json"), JSON.stringify(script, null, 2) + "\n");
  console.log(`lessons/${id}/script.json: ${script.lines.length} lines`);
  process.exit(0);
}

const toc = S.videos.map((v, i) => `<li><a href="#${v.id}">${i + 1}. ${esc(v.title)}</a> <span>${esc(v.page)}</span></li>`).join("");
const owners = S.owners.map(([c, id]) => `<tr><td>${esc(c)}</td><td><a href="#${id}">${esc(S.videos.find((v) => v.id === id).title)}</a></td></tr>`).join("");
const cards = S.videos
  .map((v, i) => {
    const secs = Math.round((words(v) / 165) * 60 + v.lines.length * 0.7 + 6);
    const lines = v.lines
      .map(([id, text, flag]) => `<li class="${flag ?? ""}"><code>${esc(id)}</code><p>${esc(text)}${flag === "gate" ? "<em>narration pauses: your turn</em>" : flag === "rec" ? "<em>over recorded tool footage</em>" : ""}</p></li>`)
      .join("");
    return `<section id="${v.id}" class="${v.status ?? ""}">
  <p class="kick">${i + 1} · ${esc(v.workshop)} · ${esc(v.page)}${v.status ? " · " + esc(v.status) : ` · ~${secs} s`}</p>
  <h2>${esc(v.title)}</h2>
  <dl>${v.format ? `<dt>Format</dt><dd>${esc(v.format)}</dd>` : ""}<dt>Picks up</dt><dd>${esc(v.opensFrom)}</dd><dt>Hands on</dt><dd>${esc(v.handsTo)}</dd><dt>Your turn</dt><dd>${esc(v.gate)}</dd><dt>On screen</dt><dd>${esc(v.visuals)}</dd></dl>
  <ol>${lines}</ol>
</section>`;
  })
  .join("\n");
const skipped = S.notOnTheList.map(([p, why]) => `<li><code>${esc(p)}</code> ${esc(why)}</li>`).join("");

fs.writeFileSync(
  path.join(ROOT, "series", "index.html"),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Video Series Scripts</title>
<style>
:root{--bg:#0d1424;--bg2:#151d31;--tx:#f1ede4;--tx2:#c2c6d3;--tx3:#8a93a8;--rule:#2a3350;--accent:#f0a04b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:17px/1.6 system-ui,sans-serif}
main{max-width:860px;margin:0 auto;padding:32px 16px 80px}h1{font:500 40px Georgia,serif;margin:0}
.lede{color:var(--tx2)}a{color:var(--accent)}code{font:13px Consolas,monospace;color:var(--tx3)}
nav ol{columns:2;padding-left:20px}nav li span{color:var(--tx3);font-size:13px}
table{border-collapse:collapse;width:100%;font-size:15px}td{border-top:1px solid var(--rule);padding:6px 8px;vertical-align:top}
section{border-top:1px solid var(--rule);margin-top:40px;padding-top:24px}section.built{opacity:.7}
.kick{font:12px Consolas,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin:0}
h2{font:500 30px Georgia,serif;margin:4px 0 12px}dl{display:grid;grid-template-columns:110px 1fr;gap:4px 12px;font-size:15px;color:var(--tx2);background:var(--bg2);padding:14px 16px;border-radius:3px}
dt{color:var(--tx3);font:12px Consolas,monospace;text-transform:uppercase;letter-spacing:.08em;padding-top:3px}dd{margin:0}
ol.l,section ol{list-style:none;padding:0}section ol li{display:grid;grid-template-columns:90px 1fr;gap:12px;padding:8px 0;border-bottom:1px solid var(--rule)}
section ol li p{margin:0;font-size:19px}li.gate p{color:var(--accent)}li.rec p{color:var(--tx2)}li.rec em,li.gate em{display:block;font:12px Consolas,monospace;color:var(--tx3);font-style:normal;margin-top:4px}
@media(max-width:600px){nav ol{columns:1}section ol li{grid-template-columns:1fr;gap:0}dl{grid-template-columns:1fr}}
</style></head><body><main>
<h1>The video series</h1>
<p class="lede">${S.videos.length} videos, one per lesson, written as one script so each picks up where the last one stopped. Every concept is taught by exactly one video; anywhere else it's a one-line callback. Read it top to bottom the way a student will hear it.</p>
<nav><ol>${toc}</ol></nav>
<h3>Who teaches what</h3><table>${owners}</table>
${cards}
<section><h2>Not getting an animated video</h2><ul>${skipped}</ul></section>
</main></body></html>`,
);
console.log(`series/index.html: ${S.videos.length} videos, ${S.videos.reduce((n, v) => n + words(v), 0)} narrated words`);
