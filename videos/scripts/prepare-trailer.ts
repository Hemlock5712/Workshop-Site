// Trailer audio pipeline — replaces the old two-step tts/render dance.
//
//   pnpm trailer:audio               # prepare every trailer
//   pnpm trailer:audio PidTrailer    # prepare one
//
// For each beat it hashes (voice + spoken text). Cache hit → nothing happens.
// Cache miss → Kokoro TTS renders a WAV, sentence boundaries fall out of the
// chunk stream, word timings are estimated (and refined with whisper.cpp when
// `pnpm whisper:setup` has been run). The assembled timeline JSON lands in
// public/trailer-audio/<id>.timeline.json, which the composition fetches via
// calculateMetadata — so `pnpm studio` / `pnpm render` always agree with it.

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { applyPronunciations } from "./pronunciations";
import { decodePcm16Wav, encodePcm16Wav, synthWhoosh } from "./lib/wav";
import {
  refineWordTimings,
  whisperAvailable,
  WHISPER_DIR_NAME,
} from "./lib/whisper";
import { contentHash } from "../src/trailer/lib/hash";
import { TRAILERS } from "../src/trailer/registry";
import { brand } from "../src/lib/brand";
import type {
  TimedWord,
  TimelineBeat,
  TrailerScript,
  TrailerTimeline,
} from "../src/trailer/lib/types";

type KokoroVoice = keyof KokoroTTS["voices"];

interface RawAudioChunk {
  audio: Float32Array;
  sampling_rate: number;
}

interface CachedClip {
  durationSec: number;
  words: { text: string; startSec: number; endSec: number }[];
  refined: boolean;
}

const ROOT = resolve(__dirname, "..");
const AUDIO_DIR = join(ROOT, "public", "trailer-audio");
const CACHE_DIR = join(AUDIO_DIR, "cache");
const WHISPER_DIR = join(ROOT, WHISPER_DIR_NAME);
const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const DEFAULT_HOLD_SEC = 0.4;

async function main() {
  const filterId = process.argv[2];
  const scripts = filterId
    ? TRAILERS.filter((s) => s.id === filterId)
    : TRAILERS;
  if (filterId && scripts.length === 0) {
    console.error(
      `No trailer with id "${filterId}". Available: ${TRAILERS.map((s) => s.id).join(", ")}`
    );
    process.exit(1);
  }

  await mkdir(CACHE_DIR, { recursive: true });
  const whooshFile = await ensureWhoosh();

  let tts: KokoroTTS | null = null;
  const loadTts = async () => {
    if (!tts) {
      console.log(`Loading Kokoro TTS (${MODEL_ID})...`);
      tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "q8",
        device: "cpu",
      });
    }
    return tts;
  };

  for (const script of scripts) {
    await prepareTrailer(script, loadTts, whooshFile);
  }
}

async function prepareTrailer(
  script: TrailerScript,
  loadTts: () => Promise<KokoroTTS>,
  whooshFile: string
) {
  console.log(
    `-> ${script.id} (${script.beats.length} beats, voice="${script.voice}")`
  );
  const beats: TimelineBeat[] = [];
  let totalFrames = 0;

  for (const beat of script.beats) {
    const spoken = applyPronunciations(beat.text);
    const key = contentHash(`${script.voice}|${spoken}`);
    const wavPath = join(CACHE_DIR, `${key}.wav`);
    const metaPath = join(CACHE_DIR, `${key}.json`);

    let clip: CachedClip;
    if (existsSync(wavPath) && existsSync(metaPath)) {
      clip = JSON.parse(await readFile(metaPath, "utf8")) as CachedClip;
      // Whisper installed after this clip was cached? Upgrade its timings.
      if (!clip.refined && whisperAvailable(WHISPER_DIR)) {
        const { samples, sampleRate } = decodePcm16Wav(await readFile(wavPath));
        const displayWords = beat.text.split(/\s+/).filter((w) => w.length > 0);
        const aligned = await refineWordTimings({
          whisperDir: WHISPER_DIR,
          tempDir: CACHE_DIR,
          cacheKey: key,
          audio: samples,
          sampleRate,
          displayWords,
          durationSec: clip.durationSec,
        });
        if (aligned) {
          clip = {
            ...clip,
            refined: true,
            words: displayWords.map((text, i) => ({
              text,
              startSec: aligned[i].startSec,
              endSec: aligned[i].endSec,
            })),
          };
          await writeFile(metaPath, JSON.stringify(clip), "utf8");
        }
      }
      console.log(
        `   ${beat.id}: cached (${clip.durationSec.toFixed(2)}s)${clip.refined ? " (whisper-aligned)" : ""}`
      );
    } else if (existsSync(wavPath)) {
      // WAV exists but timings don't — e.g. a human-recorded take dropped
      // into the cache. Time the existing audio instead of re-synthesizing.
      clip = await timeExistingClip(beat.text, key, wavPath);
      await writeFile(metaPath, JSON.stringify(clip), "utf8");
      console.log(
        `   ${beat.id}: timed existing take (${clip.durationSec.toFixed(2)}s)${clip.refined ? " (whisper-aligned)" : ""}`
      );
    } else {
      clip = await synthesizeBeat(
        await loadTts(),
        script.voice,
        beat.text,
        spoken,
        key,
        wavPath
      );
      await writeFile(metaPath, JSON.stringify(clip), "utf8");
      console.log(
        `   ${beat.id}: ${clip.durationSec.toFixed(2)}s${clip.refined ? " (whisper-aligned)" : ""}`
      );
    }

    const audioFrames = Math.ceil(clip.durationSec * brand.fps);
    const holdFrames = Math.round(
      (beat.holdAfter ?? DEFAULT_HOLD_SEC) * brand.fps
    );
    const words: TimedWord[] = clip.words.map((w) => ({
      text: w.text,
      startFrame: Math.round(w.startSec * brand.fps),
      endFrame: Math.round(w.endSec * brand.fps),
    }));

    beats.push({
      id: beat.id,
      textHash: contentHash(beat.text),
      audioFile: `trailer-audio/cache/${key}.wav`,
      audioFrames,
      durationInFrames: audioFrames + holdFrames,
      words,
      refined: clip.refined,
    });
    totalFrames += audioFrames + holdFrames;
  }

  const musicPath = join(ROOT, "public", "music", "bed.mp3");
  const timeline: TrailerTimeline = {
    id: script.id,
    fps: brand.fps,
    beats,
    totalDurationInFrames: totalFrames,
    musicFile: existsSync(musicPath) ? "music/bed.mp3" : null,
    whooshFile,
  };

  const outPath = join(AUDIO_DIR, `${script.id}.timeline.json`);
  await writeFile(outPath, JSON.stringify(timeline, null, 2), "utf8");
  console.log(
    `   wrote ${outPath} (${(totalFrames / brand.fps).toFixed(1)}s total)\n`
  );
}

async function synthesizeBeat(
  tts: KokoroTTS,
  voice: string,
  displayText: string,
  spokenText: string,
  cacheKey: string,
  wavPath: string
): Promise<CachedClip> {
  // Kokoro truncates long single generate() calls; TextSplitterStream splits
  // on sentences. Each yielded chunk maps 1:1 to a spoken sentence, which
  // gives us sentence-level timing for free.
  const splitter = new TextSplitterStream();
  splitter.push(spokenText);
  splitter.close();

  const chunks: RawAudioChunk[] = [];
  for await (const chunk of tts.stream(splitter, {
    voice: voice as KokoroVoice,
  })) {
    chunks.push(chunk.audio);
    process.stdout.write(".");
  }
  if (chunks.length === 0) {
    throw new Error(
      `No audio produced for beat text: ${displayText.slice(0, 60)}...`
    );
  }

  const sampleRate = chunks[0].sampling_rate;
  const totalLength = chunks.reduce((sum, c) => sum + c.audio.length, 0);
  const merged = new Float32Array(totalLength);
  const sentenceBounds: { startSec: number; endSec: number }[] = [];
  let offset = 0;
  for (const chunk of chunks) {
    sentenceBounds.push({
      startSec: offset / sampleRate,
      endSec: (offset + chunk.audio.length) / sampleRate,
    });
    merged.set(chunk.audio, offset);
    offset += chunk.audio.length;
  }
  const durationSec = totalLength / sampleRate;
  await writeFile(wavPath, encodePcm16Wav(merged, sampleRate));

  const displayWords = displayText.split(/\s+/).filter((w) => w.length > 0);
  let words = estimateWordTimings(
    displayText,
    displayWords,
    sentenceBounds,
    durationSec
  );
  let refined = false;

  const aligned = await refineWordTimings({
    whisperDir: WHISPER_DIR,
    tempDir: CACHE_DIR,
    cacheKey,
    audio: merged,
    sampleRate,
    displayWords,
    durationSec,
  });
  if (aligned) {
    words = displayWords.map((text, i) => ({
      text,
      startSec: aligned[i].startSec,
      endSec: aligned[i].endSec,
    }));
    refined = true;
  }

  return { durationSec, words, refined };
}

/** Word timings for a WAV we didn't synthesize (human take): estimate, then refine. */
async function timeExistingClip(
  displayText: string,
  cacheKey: string,
  wavPath: string
): Promise<CachedClip> {
  const { samples, sampleRate } = decodePcm16Wav(await readFile(wavPath));
  const durationSec = samples.length / sampleRate;
  const displayWords = displayText.split(/\s+/).filter((w) => w.length > 0);

  let words = estimateWordTimings(displayText, displayWords, [], durationSec);
  let refined = false;
  const aligned = await refineWordTimings({
    whisperDir: WHISPER_DIR,
    tempDir: CACHE_DIR,
    cacheKey,
    audio: samples,
    sampleRate,
    displayWords,
    durationSec,
  });
  if (aligned) {
    words = displayWords.map((text, i) => ({
      text,
      startSec: aligned[i].startSec,
      endSec: aligned[i].endSec,
    }));
    refined = true;
  }
  return { durationSec, words, refined };
}

/**
 * Estimate word timings without whisper: split the display text into sentences
 * with the same boundaries Kokoro's splitter uses, map each to its audio chunk,
 * then distribute words inside the chunk by character weight (a comma or dash
 * buys a little extra pause).
 */
function estimateWordTimings(
  displayText: string,
  displayWords: string[],
  sentenceBounds: { startSec: number; endSec: number }[],
  durationSec: number
): CachedClip["words"] {
  const sentences = displayText
    .match(/[^.!?]+[.!?]*/g)
    ?.map((s) => s.trim()) ?? [displayText];
  const groups =
    sentences.length === sentenceBounds.length
      ? sentences.map((s, i) => ({
          words: s.split(/\s+/).filter((w) => w.length > 0),
          ...sentenceBounds[i],
        }))
      : [{ words: displayWords, startSec: 0, endSec: durationSec }];

  const result: CachedClip["words"] = [];
  for (const group of groups) {
    const weights = group.words.map(
      (w) => w.length + 1.5 + (/[,;—–-]$/.test(w) ? 2.5 : 0)
    );
    const total = weights.reduce((s, w) => s + w, 0);
    let cursor = group.startSec;
    const span = group.endSec - group.startSec;
    group.words.forEach((text, i) => {
      const slice = (span * weights[i]) / total;
      result.push({ text, startSec: cursor, endSec: cursor + slice });
      cursor += slice;
    });
  }
  return result;
}

async function ensureWhoosh(): Promise<string> {
  const rel = "trailer-audio/whoosh.wav";
  const path = join(ROOT, "public", rel);
  if (!existsSync(path)) {
    await writeFile(path, encodePcm16Wav(synthWhoosh(), 24000));
    console.log("Synthesized whoosh SFX.");
  }
  return rel;
}

process.on("unhandledRejection", (reason) => {
  console.error("\nUnhandled rejection:", reason);
  process.exit(1);
});

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
