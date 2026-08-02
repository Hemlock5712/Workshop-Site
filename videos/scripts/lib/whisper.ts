// Optional word-timing refinement via whisper.cpp (all local, all free).
//
// If `pnpm whisper:setup` has been run, the prepare pipeline feeds each
// generated WAV back through whisper with token-level timestamps and aligns
// the recognized words against the display text. If whisper isn't installed
// (or anything fails), the caller keeps its estimated timings — the pipeline
// never hard-depends on this.
//
// Why this matters more than "captions look nicer": word-anchored events and
// camera shots (`at: { word: "crank" }`) resolve through these timings. Without
// refinement, `estimateWordTimings` distributes words by character weight
// *inside each sentence*, so anchor accuracy degrades with sentence length — a
// 45-word sentence places its anchors by guesswork across ~17s of audio. With
// refinement, they land on the syllable.
//
// !! DO NOT PARALLELIZE refineWordTimings ACROSS PROCESSES OR PROMISES !!
// @remotion/install-whisper-cpp's transcribe() builds its scratch path as
// `path.join(process.cwd(), 'tmp')` with no unique token (transcribe.js:166),
// reads `${that}.json`, then unlinks it. Two concurrent calls from the same cwd
// therefore read and delete each other's alignment JSON. The failure is silent:
// the >=60% match gate in alignToDisplayWords will often *accept* another beat's
// timings rather than erroring, so wrong word anchors ship looking fine. Making
// audio prep concurrent requires spawning the binary directly with a per-beat
// --output-file first.

import { existsSync } from "node:fs";
import { unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const WHISPER_DIR_NAME = ".whisper";
export const WHISPER_VERSION = "1.5.5";

/**
 * base.en is 148 MB. `tiny.en` (~75 MB) is worth trying: this is forced
 * alignment against text we already know, not transcription, and
 * alignToDisplayWords tolerates 40% unmatched words. Gate any switch on data —
 * log matchCount/displayWords.length per beat and compare before keeping it.
 */
export const WHISPER_MODEL = "base.en";

/**
 * whisper.cpp's own default is min(4, hardware_concurrency). Nothing about the
 * work is 4-thread-shaped; it was just the upstream default.
 */
const WHISPER_THREADS = 16;

export interface AlignedWord {
  startSec: number;
  endSec: number;
}

/**
 * Bump when the alignment maths changes, so cached sidecars written by an older
 * version get re-aligned instead of being trusted forever. prepare-trailer only
 * re-ran refinement when `refined` was false, which meant an improvement to this
 * file could never reach an already-refined clip.
 *
 * 2 = prefer DTW token timestamps over whisper's interpolated segment offsets.
 */
export const ALIGN_VERSION = 2;

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
      // whisper.cpp defaults to n_threads = min(4, hardware_concurrency), so on
      // a 16-thread box it uses a quarter of the machine for no reason. This is
      // safe while refinement runs sequentially, which it must — see the
      // concurrency warning in this file's header.
      additionalArgs: [["-t", String(WHISPER_THREADS)]],
    });
    const { captions } = toCaptions({ whisperCppOutput });

    // `tokenLevelTimestamps: true` makes transcribe() pass `--dtw <model>` and
    // `--max-len 1`, which is the whole reason to pay for token-level output:
    // DTW aligns tokens against the audio path. toCaptions surfaces that as
    // `timestampMs` (= t_dtw * 10, or null when DTW did not engage for a token),
    // alongside `startMs`/`endMs`, which are whisper's much coarser interpolated
    // *segment* offsets. This used to read the segment offsets and ignore
    // timestampMs entirely — computing the good number and discarding it.
    //
    // DTW gives a start only, so each token's end is the next DTW start; the
    // segment offsets remain the fallback wherever t_dtw came back -1.
    const raw = captions
      .map((c) => ({
        norm: normalize(c.text),
        dtwSec: c.timestampMs === null ? null : c.timestampMs / 1000,
        fallbackStart: c.startMs / 1000,
        fallbackEnd: (c.endMs ?? c.startMs) / 1000,
      }))
      .filter((c) => c.norm.length > 0);

    let dtwHits = 0;
    const hypothesis = raw.map((c, i) => {
      if (c.dtwSec === null) {
        return {
          norm: c.norm,
          startSec: c.fallbackStart,
          endSec: c.fallbackEnd,
        };
      }
      dtwHits++;
      const nextDtw = raw.slice(i + 1).find((n) => n.dtwSec !== null);
      return {
        norm: c.norm,
        startSec: c.dtwSec,
        endSec: nextDtw ? nextDtw.dtwSec! : Math.max(c.dtwSec, c.fallbackEnd),
      };
    });

    // If DTW never engaged, the `--dtw` flag is pure cost and the timings are no
    // better than the old segment-offset path. Say so rather than silently
    // paying for it on all 237 beats.
    if (raw.length > 0 && dtwHits === 0) {
      console.warn(
        "   whisper: no DTW timestamps returned — timings fell back to segment offsets."
      );
    }

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
