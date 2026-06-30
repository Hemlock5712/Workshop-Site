// Verify generated audio matches the script prompt by running ASR over each
// segment WAV and checking word coverage. Kokoro can silently drop sentences
// past a certain input length; this script catches that automatically so we
// don't have to listen to every render to find out.
//
// Usage:
//   pnpm verify                         # check all scripts
//   pnpm verify Vision                  # check a single script
//   pnpm verify Vision filtering        # check a single segment
//
// Exit code 1 if any segment's coverage falls below COVERAGE_THRESHOLD.

import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pipeline } from "@huggingface/transformers";
import { applyPronunciations } from "./pronunciations";

import { IntroductionScript } from "../src/compositions/Introduction.script";
import { PrerequisitesScript } from "../src/compositions/Prerequisites.script";
import { HardwareScript } from "../src/compositions/Hardware.script";
import { MechanismSelectionScript } from "../src/compositions/MechanismSelection.script";
import { LoggingScript } from "../src/compositions/Logging.script";
import { VisionScript } from "../src/compositions/Vision.script";
import { CommandFrameworkScript } from "../src/compositions/CommandFramework.script";
import { AddingCommandsScript } from "../src/compositions/AddingCommands.script";
import { LoggingImplementationScript } from "../src/compositions/LoggingImplementation.script";
import { VisionImplementationScript } from "../src/compositions/VisionImplementation.script";
import type { VideoScript } from "../src/lib/types";

const SCRIPTS: VideoScript[] = [
  IntroductionScript,
  PrerequisitesScript,
  HardwareScript,
  MechanismSelectionScript,
  LoggingScript,
  VisionScript,
  CommandFrameworkScript,
  AddingCommandsScript,
  LoggingImplementationScript,
  VisionImplementationScript,
];

// Tunables -------------------------------------------------------------------
const ASR_MODEL = "Xenova/whisper-tiny.en";
// Per-segment coverage threshold. Below this we treat the segment as broken.
// 0.85 = at most 15% of expected words may be missing from the transcript.
const COVERAGE_THRESHOLD = 0.85;
// Whisper sometimes misses short connector words ("a", "the", "of"); ignore
// those so a few missed function words don't drag coverage below threshold.
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "at",
  "is",
  "it",
  "and",
  "or",
  "but",
  "for",
  "with",
  "as",
  "be",
  "are",
  "was",
  "were",
]);
// ---------------------------------------------------------------------------

const ROOT = resolve(__dirname, "..");

async function main() {
  const scriptFilter = process.argv[2];
  const segmentFilter = process.argv[3];

  const targetScripts = scriptFilter
    ? SCRIPTS.filter((s) => s.id === scriptFilter)
    : SCRIPTS;

  if (scriptFilter && targetScripts.length === 0) {
    console.error(
      `No script found with id "${scriptFilter}". Available: ${SCRIPTS.map((s) => s.id).join(", ")}`
    );
    process.exit(1);
  }

  console.log(`Loading ASR model (${ASR_MODEL}). First run downloads ~75 MB.`);
  const asr = await pipeline("automatic-speech-recognition", ASR_MODEL, {
    dtype: "q8",
  });
  console.log("Model loaded.\n");

  let totalFailures = 0;

  for (const script of targetScripts) {
    const segments = segmentFilter
      ? script.segments.filter((s) => s.id === segmentFilter)
      : script.segments;
    if (segments.length === 0) continue;

    console.log(`-> ${script.id} (${segments.length} segments)`);

    for (const segment of segments) {
      const wavPath = join(
        ROOT,
        "public",
        "audio",
        script.id,
        `${segment.id}.wav`
      );
      let samples: Float32Array;
      try {
        const bytes = await readFile(wavPath);
        samples = readWavFloat32Mono(bytes);
      } catch (err) {
        console.error(
          `   ${segment.id}  MISSING WAV (${(err as Error).message})`
        );
        totalFailures += 1;
        continue;
      }

      // transformers.js' built-in chunking is unreliable — at multiple option
      // combinations it stops transcribing 15-20 seconds into long audio. We
      // sidestep that by manually slicing the audio into ~15 s windows and
      // transcribing each, then concatenating the partial transcripts.
      const SAMPLE_RATE = 16000; // we resampled the WAV to 16 kHz above
      const WINDOW_S = 15;
      const STRIDE_S = 13; // 2 s overlap so a word straddling a boundary survives
      const windowSamples = WINDOW_S * SAMPLE_RATE;
      const strideSamples = STRIDE_S * SAMPLE_RATE;
      const partials: string[] = [];
      for (let start = 0; start < samples.length; start += strideSamples) {
        const end = Math.min(start + windowSamples, samples.length);
        const slice = samples.subarray(start, end);
        if (slice.length < SAMPLE_RATE) break; // ignore <1 s tails
        const chunkResult = (await asr(slice)) as { text: string };
        partials.push(chunkResult.text);
      }
      const transcript = partials.join(" ");

      // Detect silence padding: if the last 25% of audio is near-zero RMS,
      // the file is duration-correct but speech-truncated. That signals a TTS
      // bug rather than just a Whisper-ASR limitation.
      const tail = samples.subarray(Math.floor(samples.length * 0.75));
      let sumSq = 0;
      for (let i = 0; i < tail.length; i++) sumSq += tail[i] * tail[i];
      const tailRms = Math.sqrt(sumSq / tail.length);

      const expectedWords = normalizeWords(applyPronunciations(segment.text));
      const actualWords = new Set(normalizeWords(transcript));

      const coverage = wordCoverage(expectedWords, actualWords);
      const missingWords = expectedWords.filter(
        (w) => !STOPWORDS.has(w) && !actualWords.has(w)
      );

      const ok = coverage >= COVERAGE_THRESHOLD;
      const pct = (coverage * 100).toFixed(1);
      const marker = ok ? "  ok " : " FAIL";
      const silenceTag = tailRms < 0.001 ? "  [tail-silent!]" : "";
      console.log(
        `  ${marker} ${segment.id.padEnd(22)} coverage=${pct}%  tail-rms=${tailRms.toFixed(4)}${silenceTag}`
      );

      if (!ok) {
        totalFailures += 1;
        const sample = missingWords.slice(0, 20).join(", ");
        const extra =
          missingWords.length > 20
            ? `  (+${missingWords.length - 20} more)`
            : "";
        console.log(`        missing words: ${sample}${extra}`);
        console.log(`        --- transcript ---`);
        console.log(`        ${transcript.trim()}`);
        console.log(`        --- expected ---`);
        console.log(`        ${applyPronunciations(segment.text)}`);
        console.log("");
      }
    }
    console.log("");
  }

  if (totalFailures > 0) {
    console.error(
      `\n${totalFailures} segment(s) below coverage threshold ${COVERAGE_THRESHOLD}.`
    );
    process.exit(1);
  }
  console.log("All segments above coverage threshold.");
}

// ─── WAV reader (24 kHz 32-bit float mono, Kokoro's output format) ──────────

function readWavFloat32Mono(bytes: Buffer): Float32Array {
  if (
    bytes.toString("utf8", 0, 4) !== "RIFF" ||
    bytes.toString("utf8", 8, 12) !== "WAVE"
  ) {
    throw new Error("Not a RIFF/WAVE file");
  }
  // Walk chunks looking for "fmt " and "data".
  let cursor = 12;
  let formatCode = 0;
  let channels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let dataStart = -1;
  let dataLength = 0;
  while (cursor + 8 <= bytes.length) {
    const id = bytes.toString("utf8", cursor, cursor + 4);
    const size = bytes.readUInt32LE(cursor + 4);
    const body = cursor + 8;
    if (id === "fmt ") {
      formatCode = bytes.readUInt16LE(body);
      channels = bytes.readUInt16LE(body + 2);
      sampleRate = bytes.readUInt32LE(body + 4);
      bitsPerSample = bytes.readUInt16LE(body + 14);
    } else if (id === "data") {
      dataStart = body;
      dataLength = size;
      break;
    }
    cursor = body + size + (size % 2); // chunks are word-aligned
  }
  if (dataStart < 0) throw new Error("No data chunk found");
  if (channels !== 1)
    throw new Error(`Expected mono, got ${channels} channels`);
  if (formatCode !== 3 || bitsPerSample !== 32) {
    throw new Error(
      `Expected 32-bit float (format 3), got format=${formatCode} bits=${bitsPerSample}`
    );
  }
  const sampleCount = dataLength / 4;
  // Resample to 16 kHz which Whisper expects, using simple linear interpolation.
  const sourceRate = sampleRate;
  const source = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    source[i] = bytes.readFloatLE(dataStart + i * 4);
  }
  if (sourceRate === 16000) return source;
  const targetRate = 16000;
  const targetLength = Math.floor((sampleCount * targetRate) / sourceRate);
  const out = new Float32Array(targetLength);
  const step = sourceRate / targetRate;
  for (let i = 0; i < targetLength; i++) {
    const idx = i * step;
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, sampleCount - 1);
    const t = idx - lo;
    out[i] = source[lo] * (1 - t) + source[hi] * t;
  }
  return out;
}

// ─── Text comparison ────────────────────────────────────────────────────────

// Words Kokoro speaks one way and Whisper transcribes another — collapse both
// sides to the same canonical form before comparing. Without this, valid audio
// fails just because Whisper merges "Mega Tag two" into "Megatag 2" or spells
// digits ("50") that Kokoro speaks as words ("fifty").
function normalizeWords(text: string): string[] {
  let t = text.toLowerCase();
  // Number ↔ word: both directions, since either side could use either form.
  t = t
    .replace(/\b0\.3\b/g, "zero point three")
    .replace(/\b5\.5\b/g, "five and a half")
    .replace(/\b1\.2\b/g, "one point two")
    .replace(/\bfifty\b/g, "50")
    // Spelled-out → digit so transcript "50" and expected "fifty" both become "50".
    .replace(/\bzero\b/g, "0");
  // Multi-word pronunciations: collapse to single tokens so "mega tag" and
  // "megatag" both become "megatag" regardless of which side produced which.
  t = t.replace(/[^a-z0-9' ]/g, " ");
  const collapsed: Array<[RegExp, string]> = [
    [/\bmega tag one\b/g, "megatag1"],
    [/\bmega tag two\b/g, "megatag2"],
    [/\bmega tag\b/g, "megatag"],
    [/\bmegatag one\b/g, "megatag1"],
    [/\bmegatag two\b/g, "megatag2"],
    [/\bmegatag 1\b/g, "megatag1"],
    [/\bmegatag 2\b/g, "megatag2"],
    [/\bf r c\b/g, "frc"],
    [/\bc t r e\b/g, "ctre"],
    [/\bv s code\b/g, "vscode"],
    [/\bn i game tools\b/g, "nigametools"],
    [/\bw p i log\b/g, "wpilog"],
    [/\bwhipp lib\b/g, "wpilib"],
    [/\bpath planner\b/g, "pathplanner"],
    [/\bphoton vision\b/g, "photonvision"],
    [/\blimelight helpers\b/g, "limelighthelpers"],
    [/\badvantage scope\b/g, "advantagescope"],
    [/\badvantage kit\b/g, "advantagekit"],
    [/\bsignal logger\b/g, "signallogger"],
    [/\bdata log manager\b/g, "datalogmanager"],
    [/\bnetwork tables\b/g, "networktables"],
    [/\bsmart dashboard\b/g, "smartdashboard"],
    [/\brobot container\b/g, "robotcontainer"],
    [/\bdrive train\b/g, "drivetrain"],
    [/\bdriven train\b/g, "drivetrain"], // Whisper sometimes mishears "drivetrain"
    [/\bperspective n point\b/g, "pnp"],
    [/\bperspective endpoint\b/g, "pnp"], // Whisper hears "N point" as "endpoint"
    [/\bend point\b/g, "endpoint"],
    [/\bp n p\b/g, "pnp"],
    [/\bm t one\b/g, "mt1"],
    [/\bm t two\b/g, "mt2"],
    [/\bmt 1\b/g, "mt1"],
    [/\bmt 2\b/g, "mt2"],
    [/\bcan iv ore\b/g, "canivore"],
    [/\bcan coder\b/g, "cancoder"],
    [/\btalon f x\b/g, "talonfx"],
    [/\bphoenix six\b/g, "phoenix6"],
    [/\bphoenix 6\b/g, "phoenix6"],
  ];
  for (const [pattern, replacement] of collapsed) {
    t = t.replace(pattern, replacement);
  }
  return t.split(/\s+/).filter((w) => w.length > 0);
}

function wordCoverage(expected: string[], actual: Set<string>): number {
  const meaningful = expected.filter((w) => !STOPWORDS.has(w));
  if (meaningful.length === 0) return 1;
  let matches = 0;
  for (const w of meaningful) if (actual.has(w)) matches += 1;
  return matches / meaningful.length;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
