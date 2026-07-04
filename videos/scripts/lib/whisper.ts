// Optional word-timing refinement via whisper.cpp (all local, all free).
//
// If `pnpm whisper:setup` has been run, the prepare pipeline feeds each
// generated WAV back through whisper with token-level timestamps and aligns
// the recognized words against the display text. If whisper isn't installed
// (or anything fails), the caller keeps its estimated timings — the pipeline
// never hard-depends on this.

import { existsSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const WHISPER_DIR_NAME = ".whisper";
export const WHISPER_VERSION = "1.5.5";
export const WHISPER_MODEL = "base.en";

export interface AlignedWord {
  startSec: number;
  endSec: number;
}

export function whisperAvailable(whisperDir: string): boolean {
  return (
    existsSync(whisperDir) &&
    existsSync(join(whisperDir, `ggml-${WHISPER_MODEL}.bin`))
  );
}

const normalize = (word: string) =>
  word.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Refine word timings for one narration clip.
 *
 * @param audio       Raw float samples of the clip as saved to disk.
 * @param sampleRate  Sample rate of `audio` (Kokoro emits 24 kHz).
 * @param displayWords The words of the on-screen text, in order.
 * @returns per-word timings (seconds), or null if whisper is unavailable/fails.
 */
export async function refineWordTimings(options: {
  whisperDir: string;
  tempDir: string;
  cacheKey: string;
  audio: Float32Array;
  sampleRate?: number;
  displayWords: string[];
  durationSec: number;
}): Promise<AlignedWord[] | null> {
  const { whisperDir, tempDir, cacheKey, audio, displayWords, durationSec } =
    options;
  const sampleRate = options.sampleRate ?? 24000;
  if (!whisperAvailable(whisperDir)) return null;

  const tempWav = join(tempDir, `${cacheKey}.16k.wav`);
  try {
    const { transcribe, toCaptions } =
      await import("@remotion/install-whisper-cpp");
    const { encodePcm16Wav, linearResample } = await import("./wav");

    await writeFile(
      tempWav,
      encodePcm16Wav(linearResample(audio, sampleRate, 16000), 16000)
    );

    const whisperCppOutput = await transcribe({
      inputPath: tempWav,
      whisperPath: whisperDir,
      whisperCppVersion: WHISPER_VERSION,
      model: WHISPER_MODEL,
      tokenLevelTimestamps: true,
      printOutput: false,
    });
    const { captions } = toCaptions({ whisperCppOutput });

    const hypothesis = captions
      .map((c) => ({
        norm: normalize(c.text),
        startSec: c.startMs / 1000,
        endSec: (c.endMs ?? c.startMs) / 1000,
      }))
      .filter((c) => c.norm.length > 0);

    return alignToDisplayWords(displayWords, hypothesis, durationSec);
  } catch (err) {
    console.warn(
      `   whisper refinement failed (${(err as Error).message}) — using estimates.`
    );
    return null;
  } finally {
    await unlink(tempWav).catch(() => {});
  }
}

/**
 * Greedy two-pointer alignment with a small lookahead window. TTS reads the
 * script nearly verbatim, so most words match 1:1 — but whisper often splits
 * one written word into several tokens ("kP" → "K"+"p", "TalonFX" →
 * "Tal"+"on"+"FX"), so each display word may match a RUN of up to 4 merged
 * hypothesis tokens. Unmatched display words are interpolated afterwards.
 */
function alignToDisplayWords(
  displayWords: string[],
  hypothesis: { norm: string; startSec: number; endSec: number }[],
  durationSec: number
): AlignedWord[] | null {
  const LOOKAHEAD = 4;
  const MAX_MERGE = 4;
  const matched: (AlignedWord | null)[] = new Array(displayWords.length).fill(
    null
  );
  let j = 0;

  for (let i = 0; i < displayWords.length && j < hypothesis.length; i++) {
    const want = normalize(displayWords[i]);
    if (want.length === 0) continue;

    let foundStart = -1;
    let foundEnd = -1;
    outer: for (
      let k = j;
      k < Math.min(j + LOOKAHEAD, hypothesis.length);
      k++
    ) {
      let merged = "";
      for (let m = k; m < Math.min(k + MAX_MERGE, hypothesis.length); m++) {
        merged += hypothesis[m].norm;
        if (merged === want) {
          foundStart = k;
          foundEnd = m;
          break outer;
        }
        if (merged.length >= want.length) break;
      }
    }
    if (foundStart >= 0) {
      matched[i] = {
        startSec: hypothesis[foundStart].startSec,
        endSec: hypothesis[foundEnd].endSec,
      };
      j = foundEnd + 1;
    }
  }

  const matchCount = matched.filter(Boolean).length;
  if (matchCount < displayWords.length * 0.6) return null; // recognition went sideways

  // Interpolate gaps between matched anchors.
  const result: AlignedWord[] = new Array(displayWords.length);
  let prevEnd = 0;
  let i = 0;
  while (i < displayWords.length) {
    if (matched[i]) {
      result[i] = matched[i]!;
      prevEnd = matched[i]!.endSec;
      i++;
      continue;
    }
    let next = i;
    while (next < displayWords.length && !matched[next]) next++;
    const gapEnd =
      next < displayWords.length ? matched[next]!.startSec : durationSec;
    const count = next - i;
    const weights: number[] = [];
    for (let k = i; k < next; k++) weights.push(displayWords[k].length + 1.5);
    const total = weights.reduce((s, w) => s + w, 0);
    let cursor = prevEnd;
    for (let k = 0; k < count; k++) {
      const span = ((gapEnd - prevEnd) * weights[k]) / total;
      result[i + k] = { startSec: cursor, endSec: cursor + span };
      cursor += span;
    }
    prevEnd = gapEnd;
    i = next;
  }
  return result;
}
