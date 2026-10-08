#!/usr/bin/env node
// Render a lesson without a person in the loop.
//   node tools/render.mjs lessons/<name> --sheet out.png [--times 3,9.5,20 | --every 4]   contact sheet
//   node tools/render.mjs lessons/<name> --mp4 out.mp4 [--fps 30]                      the video
// Both drive the page's window.renderAt(t), the exact function the player uses.
import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "./serve.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(HERE, "..", "..", "package.json"));
const { chromium } = require("playwright");

const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : d;
};
const lesson = path.relative(path.join(HERE, ".."), path.resolve(argv[0])).replace(/\\/g, "/");

const server = await serve();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on("pageerror", (e) => console.error("page error:", e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/${lesson}/index.html?export=1`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
const duration = await page.evaluate(() => window.lessonDuration);
const grab = async (t) => Buffer.from((await page.evaluate((t) => window.renderAt(t), t)).split(",")[1], "base64");

try {
  if (opt("--sheet")) {
    const times = opt("--times")
      ? opt("--times").split(",").map(Number)
      : Array.from({ length: Math.floor(duration / Number(opt("--every", 4))) }, (_, i) => (i + 0.5) * Number(opt("--every", 4)));
    const tmp = fs.mkdtempSync(path.join(path.dirname(path.resolve(opt("--sheet"))), ".sheet-"));
    for (const [i, t] of times.entries()) {
      const url = await page.evaluate(async (t) => {
        await window.renderAt(t);
        const c = document.querySelector("canvas").getContext("2d");
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.fillStyle = "rgba(0,0,0,0.7)";
        c.fillRect(0, 0, 210, 64);
        c.fillStyle = "#fff";
        c.font = "600 40px Consolas, monospace";
        c.fillText(t.toFixed(1) + "s", 18, 46);
        return document.querySelector("canvas").toDataURL("image/jpeg", 0.9);
      }, t);
      fs.writeFileSync(path.join(tmp, `${String(i).padStart(3, "0")}.jpg`), Buffer.from(url.split(",")[1], "base64"));
    }
    const cols = Math.min(4, times.length);
    const rows = Math.ceil(times.length / cols);
    const draw = times.map((t, i) => `[${i}:v]scale=640:-1[v${i}]`).join(";");
    const layout = times.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join("|");
    const inputs = times.flatMap((_, i) => ["-i", path.join(tmp, `${String(i).padStart(3, "0")}.jpg`)]);
    const filter = times.length > 1 ? `${draw};${times.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${times.length}:layout=${layout}:fill=black` : draw.replace("[v0]", "");
    await run("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", filter, "-frames:v", "1", path.resolve(opt("--sheet"))]);
    fs.rmSync(tmp, { recursive: true });
    console.log(`sheet: ${times.length} frames (${cols}x${rows}) -> ${opt("--sheet")}`);
  }

  if (opt("--mp4")) {
    const fps = Number(opt("--fps", 30));
    const n = Math.ceil(duration * fps);
    const voice = path.join(path.resolve(argv[0]), "voice", "voice.wav");
    const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-", "-i", voice, "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", path.resolve(opt("--mp4"))], { stdio: ["pipe", "inherit", "inherit"] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await grab(i / fps);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      if (i % (fps * 5) === 0) process.stdout.write(`\r  frame ${i}/${n}`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on("close", r));
    console.log(`\rmp4: ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${opt("--mp4")}`);
  }
} finally {
  await browser.close();
  server.close();
}

function run(cmd, args) {
  return new Promise((res, rej) => spawn(cmd, args, { stdio: "inherit" }).on("close", (c) => (c ? rej(new Error(`${cmd} exited ${c}`)) : res())));
}
