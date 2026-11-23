#!/usr/bin/env node
// A contact sheet cut from a finished MP4: one frame late in every narration
// line and two in each gate, so the check is of the file a student will watch.
//   node tools/sheet-mp4.mjs lessons/<id> out/<id>.mp4 out/<id>-final.png [--w 640]
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [dir, mp4, out] = process.argv.slice(2);
if (!dir || !mp4 || !out) {
  console.error("usage: node tools/sheet-mp4.mjs lessons/<id> in.mp4 out.png [--w 640]");
  process.exit(2);
}
const w = Number(process.argv.includes("--w") ? process.argv[process.argv.indexOf("--w") + 1] : 640);
const V = JSON.parse(fs.readFileSync(path.join(dir, "voice.json"), "utf8"));
const times = [...V.lines.map((l) => l.t0 + 0.65 * (l.t1 - l.t0)), ...(V.gates ?? []).flatMap((g) => [g.t0 + 0.5 * (g.t1 - g.t0), g.t0 + 0.92 * (g.t1 - g.t0)])].sort((a, b) => a - b);
const cols = 4;
const h = Math.round((w * 9) / 16);
const inputs = times.flatMap((t) => ["-ss", t.toFixed(2), "-i", mp4]);
const scale = times.map((_, i) => `[${i}:v]scale=${w}:${h}[v${i}]`).join(";");
const layout = times.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join("|");
const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${scale};${times.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${times.length}:layout=${layout}:fill=black`, "-frames:v", "1", out], { stdio: "inherit" });
console.log(r.status === 0 ? `sheet: ${times.length} frames -> ${out}` : "ffmpeg failed");
process.exit(r.status ?? 1);
