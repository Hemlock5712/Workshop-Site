#!/usr/bin/env node
// Narration is the clock. This turns a lesson's script.json into one voice
// track plus the time of every line, word and gate, and the scenes cue off
// those times rather than off frame numbers. Re-voice a line and everything
// cued to it moves with it.
//
//   node tools/voice.mjs lessons/<name> [--engine kokoro|sapi|files] [--voice af_heart] [--force]
//
// Engines are swappable on purpose: the voice is not chosen yet.
//   kokoro  local, free (kokoro-js, already installed under ../videos)
//   sapi    Windows' built-in voice. Timing only, never ship it
//   files   takes you supply, voice/<id>.wav|mp3, e.g. ElevenLabs downloads
//   chatterbox  Chatterbox Turbo cloned from voice.ref (a 20 s recording), on the GPU
//
// Writes <lesson>/voice/voice.wav and <lesson>/voice.json:
//   { duration, lines: [{ id, text, t0, t1, words: [{ w, t0, t1 }] }], gates: [{ id, line, t0, t1 }] }
// Word times are estimated from letter counts inside each line. Lines are short,
// so the estimate lands within a word or two; swap in forced alignment later.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => {
  const i = argv.indexOf(k);
  return i >= 0 ? argv[i + 1] : d;
};
if (!argv[0] || argv[0].startsWith("--")) {
  console.error("usage: node tools/voice.mjs lessons/<name> [--engine kokoro|sapi|files] [--voice id] [--force]");
  process.exit(2);
}

const ROOT = path.resolve(argv[0]);
const VDIR = path.join(ROOT, "voice");
const SR = 48000;
const S = JSON.parse(fs.readFileSync(path.join(ROOT, "script.json"), "utf8"));
const engine = opt("--engine", S.voice?.engine ?? "kokoro");
const voiceId = opt("--voice", S.voice?.id ?? "af_heart");
const force = argv.includes("--force");
fs.mkdirSync(VDIR, { recursive: true });

// ---- engines ---------------------------------------------------------------

let kokoro = null;
async function sayKokoro(text, out) {
  if (!kokoro) {
    const req = createRequire(path.join(HERE, "..", "..", "videos", "package.json"));
    const { KokoroTTS } = await import(pathToFileURL(req.resolve("kokoro-js")).href);
    console.log("loading Kokoro...");
    kokoro = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
  }
  const audio = await kokoro.generate(text, { voice: voiceId });
  await audio.save(out);
}

function saySapi(text, out) {
  const ps = `Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.SetOutputToWaveFile($env:VO_OUT); $s.Speak($env:VO_TEXT); $s.Dispose()`;
  const r = spawnSync("powershell", ["-NoProfile", "-Command", ps], { env: { ...process.env, VO_TEXT: text, VO_OUT: out } });
  if (r.status !== 0) throw new Error("SAPI failed: " + r.stderr);
}

// ---- audio helpers ---------------------------------------------------------

// decode to 48 kHz mono s16, trimmed of the silence either side
function decode(file) {
  const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03";
  const r = spawnSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-af", `${trim},areverse,${trim},areverse`, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-"],
    { maxBuffer: 1 << 30 },
  );
  if (r.status !== 0) throw new Error(`could not decode ${file}: ${r.stderr}`);
  return r.stdout;
}

function wav(pcm) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// ---- word times ------------------------------------------------------------

// Spread a line's duration over its caption words by letter count, with a
// little extra weight after commas and full stops where the voice breathes.
function estimateWords(text, t0, t1) {
  const words = text.split(/\s+/).filter(Boolean);
  const weight = words.map((w) => w.replace(/[^\w]/g, "").length + 1.5 + (/[,;]$/.test(w) ? 2.5 : 0) + (/[.?!]$/.test(w) ? 4 : 0));
  const total = weight.reduce((a, b) => a + b, 0);
  let t = t0;
  return words.map((w, i) => {
    const d = ((t1 - t0) * weight[i]) / total;
    const out = { w, t0: +t.toFixed(3), t1: +(t + d).toFixed(3) };
    t += d;
    return out;
  });
}

// ---- build -----------------------------------------------------------------

const cachePath = path.join(VDIR, "cache.json");
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};

// Chatterbox loads once for every missing line, so it runs as a batch up front.
if (engine === "chatterbox") {
  const jobs = [];
  for (const L of S.lines) {
    const spoken = L.say ?? L.text;
    const key = createHash("sha1").update(`${engine}|${voiceId}|${spoken}`).digest("hex").slice(0, 12);
    const file = path.join(VDIR, `${L.id}.${engine}.wav`);
    if (force || cache[L.id] !== key || !fs.existsSync(file)) {
      jobs.push({ text: spoken, out: file });
      cache[L.id] = key;
    }
  }
  if (jobs.length) {
    console.log(`chatterbox: ${jobs.length} line(s)...`);
    const jobFile = path.join(VDIR, "jobs.json");
    fs.writeFileSync(jobFile, JSON.stringify(jobs));
    const py = path.join(HERE, "..", "voice-bakeoff", ".venvs", "chatterbox", "Scripts", "python.exe");
    const ref = path.resolve(HERE, "..", S.voice.ref);
    const r = spawnSync(py, [path.join(HERE, "tts_chatterbox.py"), jobFile, ref], { stdio: ["ignore", "inherit", "pipe"], env: { ...process.env, PYTHONUTF8: "1" } });
    fs.rmSync(jobFile);
    if (r.status !== 0) throw new Error("chatterbox failed:\n" + r.stderr.toString().slice(-2000));
  }
}

const parts = [];
const lines = [];
const gates = [];
let t = S.lead ?? 1.0;

for (const L of S.lines) {
  const spoken = L.say ?? L.text;
  const key = createHash("sha1").update(`${engine}|${voiceId}|${spoken}`).digest("hex").slice(0, 12);
  let file;
  if (engine === "files") {
    file = [".wav", ".mp3", ".m4a"].map((e) => path.join(VDIR, L.id + e)).find((f) => fs.existsSync(f));
    if (!file) throw new Error(`missing take voice/${L.id}.wav|mp3`);
  } else {
    file = path.join(VDIR, `${L.id}.${engine}.wav`);
    if (engine !== "chatterbox" && (force || cache[L.id] !== key || !fs.existsSync(file))) {
      process.stdout.write(`  ${L.id}: generating... `);
      const t0 = Date.now();
      if (engine === "kokoro") await sayKokoro(spoken, file);
      else if (engine === "sapi") saySapi(spoken, file);
      else throw new Error(`unknown engine ${engine}`);
      cache[L.id] = key;
      console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
  }
  const pcm = decode(file);
  const dur = pcm.length / 2 / SR;
  lines.push({ id: L.id, text: L.text, t0: +t.toFixed(3), t1: +(t + dur).toFixed(3), words: estimateWords(L.text, t, t + dur) });
  parts.push([Math.round(t * SR), pcm]);
  t += dur + (L.after ?? 0.4);
  if (L.gate) {
    gates.push({ id: L.gate.id, line: L.id, t0: +t.toFixed(3), t1: +(t + L.gate.seconds).toFixed(3) });
    t += L.gate.seconds;
  }
}

const duration = +(lines.at(-1).t1 + (S.tail ?? 1.5)).toFixed(3);
const pcm = Buffer.alloc(Math.ceil(duration * SR) * 2);
for (const [s0, p] of parts) p.copy(pcm, s0 * 2);
fs.writeFileSync(path.join(VDIR, "voice.wav"), wav(pcm));
fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));

const out = { engine, voice: voiceId, duration, lines, gates };
fs.writeFileSync(path.join(ROOT, "voice.json"), JSON.stringify(out, null, 2));
// also as a script so the page works without fetch()
fs.writeFileSync(path.join(ROOT, "voice.js"), `window.VOICE = ${JSON.stringify(out)};\n`);
console.log(`voice: ${lines.length} lines, ${gates.length} gate(s), ${duration.toFixed(1)}s -> ${path.relative(process.cwd(), VDIR)}`);
