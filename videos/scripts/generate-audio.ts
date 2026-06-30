// Generates voiceover WAV files for each video script using Kokoro TTS (free, local).
//
// Usage:
//   pnpm tts                # process all scripts
//   pnpm tts Introduction   # process a single script by id
//
// Output:
//   public/audio/<ScriptId>/<SegmentId>.wav
//   src/manifests/<ScriptId>.manifest.ts

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { applyPronunciations } from "./pronunciations";

type KokoroVoice = keyof KokoroTTS["voices"];

// RawAudio is what KokoroTTS.stream() yields under `chunk.audio`. The class
// is not re-exported from kokoro-js (it's a transitive dep), so we mirror the
// shape we use here. Mutating `audio` on the instance keeps save()/toWav()
// working without needing the constructor.
interface RawAudioChunk {
  audio: Float32Array;
  sampling_rate: number;
  save(path: string): Promise<void>;
}

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
import { brand } from "../src/lib/brand";
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
const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const ROOT = resolve(__dirname, "..");

async function main() {
  const filterId = process.argv[2];
  const scripts = filterId ? SCRIPTS.filter((s) => s.id === filterId) : SCRIPTS;

  if (filterId && scripts.length === 0) {
    console.error(
      `No script found with id "${filterId}". Available: ${SCRIPTS.map((s) => s.id).join(", ")}`
    );
    process.exit(1);
  }

  // GPU (DirectML/WebGPU) tested but Kokoro's ConvTranspose ops fail on DML
  // and WebGPU isn't available in onnxruntime-node. CPU it is — ~2 min for a
  // 3 min video, acceptable.
  console.log(
    `Loading Kokoro TTS model (${MODEL_ID}). First run downloads ~80MB and caches it.`
  );
  const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
    dtype: "q8",
    device: "cpu",
  });
  console.log("Model loaded.\n");

  for (const script of scripts) {
    await renderScript(script, tts);
  }
}

async function renderScript(script: VideoScript, tts: KokoroTTS) {
  console.log(
    `-> ${script.id} (${script.segments.length} segments, voice="${script.voice}")`
  );
  const outDir = join(ROOT, "public", "audio", script.id);
  await mkdir(outDir, { recursive: true });

  const rendered = [];
  let totalFrames = 0;

  for (const segment of script.segments) {
    process.stdout.write(`   ${segment.id} ... `);
    const spokenText = applyPronunciations(segment.text);

    // Stream-then-concat: Kokoro silently truncates single generate() calls
    // past ~100 words. stream() auto-splits on sentence boundaries, so each
    // chunk stays well inside the safe range and we glue them back together.
    // Kokoro's stream() with a plain string wraps the entire input as a single
    // element — no sentence splitting happens unless you go through a
    // TextSplitterStream. The TextSplitterStream's _process() method handles
    // sentence boundaries itself; push the whole text and close().
    const splitter = new TextSplitterStream();
    splitter.push(spokenText);
    splitter.close();

    const chunks: RawAudioChunk[] = [];
    for await (const chunk of tts.stream(splitter, {
      voice: script.voice as KokoroVoice,
    })) {
      chunks.push(chunk.audio);
      process.stdout.write(".");
    }
    if (chunks.length === 0) {
      throw new Error(`No audio produced for ${script.id}/${segment.id}`);
    }
    process.stdout.write(` (${chunks.length} chunks) `);
    const audio = concatRawAudio(chunks);

    const fileName = `${segment.id}.wav`;
    const filePath = join(outDir, fileName);
    await audio.save(filePath);

    const audioSeconds = audio.audio.length / audio.sampling_rate;
    const padSeconds = padForSlide(segment.slide.kind);
    const paddedSeconds = audioSeconds + padSeconds;
    const durationInFrames = Math.ceil(paddedSeconds * brand.fps);
    totalFrames += durationInFrames;

    rendered.push({
      id: segment.id,
      audioFile: `${script.id}/${fileName}`,
      durationInSeconds: paddedSeconds,
      durationInFrames,
    });
    console.log(`${audioSeconds.toFixed(2)}s (+${padSeconds.toFixed(1)}s pad)`);
  }

  const manifestPath = join(
    ROOT,
    "src",
    "manifests",
    `${script.id}.manifest.ts`
  );
  const manifestSrc = `// AUTOGENERATED by \`pnpm tts\`. Edit ${script.id}.script.ts and rerun, not this file.
import type { AudioManifest } from "../lib/types";

export const manifest: AudioManifest = ${JSON.stringify(
    {
      id: script.id,
      fps: brand.fps,
      segments: rendered,
      totalDurationInFrames: totalFrames,
    },
    null,
    2
  )};
`;
  await writeFile(manifestPath, manifestSrc, "utf8");

  const totalSeconds = (totalFrames / brand.fps).toFixed(1);
  console.log(`   wrote ${manifestPath} (${totalSeconds}s total)\n`);
}

function concatRawAudio(chunks: RawAudioChunk[]): RawAudioChunk {
  if (chunks.length === 1) return chunks[0];
  const totalLength = chunks.reduce((sum, c) => sum + c.audio.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk.audio, offset);
    offset += chunk.audio.length;
  }
  // Mutate the first chunk so we can reuse its save()/toWav() methods without
  // pulling RawAudio in as a direct import (it's transitive via kokoro-js).
  chunks[0].audio = merged;
  return chunks[0];
}

function padForSlide(
  kind: VideoScript["segments"][number]["slide"]["kind"]
): number {
  // Hold code slides longer so the audience can read past the narration.
  // Image slides hold so the Ken Burns motion lands.
  switch (kind) {
    case "code":
      return 2.5;
    case "image":
      return 1.2;
    default:
      return 0.4;
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("\nUnhandled rejection:", reason);
  process.exit(1);
});

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
