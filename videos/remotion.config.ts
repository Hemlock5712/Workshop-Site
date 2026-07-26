import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./src/index.ts");
Config.setDelayRenderTimeoutInMilliseconds(120000);

// MEASURED on this box (Ryzen 7 5800H, 8C/16T, 16 GB), full 3262-frame
// PidTrailer render, wall clock:
//
//                         concurrency 2   concurrency 12
//   moving feGaussianBlur      318s            266s
//   static gradients           185s            144s
//
// Two things to take from that, because they are the opposite of what you would
// guess. First, concurrency is the SMALL lever here: 2 -> 12 buys 1.28x, not
// the 4x its thread ratio suggests, because ~50s of a 144s render is encode,
// audio mixing and browser launch, none of which parallelize, and 12 tabs
// contend on 8 physical cores. Second, the per-frame paint cost dominated
// everything: removing the animated full-frame SVG blur from
// src/components/AnimatedBackground.tsx was worth 1.85x on its own, nearly 3x
// more than the concurrency change. Look at what each frame paints before
// reaching for more threads.
//
// 12 measured fastest and completed without OOM, but it makes the machine
// unresponsive while rendering; drop to 8 (about 10% slower) if you need to use
// the box. Re-measure after any change to what a frame paints:
//   SECONDS=0; npx remotion render src/index.ts PidTrailer out/t.mp4 \
//     --concurrency=12 --log=error; echo ${SECONDS}s
Config.setConcurrency(12);

// The intermediate JPEGs are transient (deleted after stitching), so quality
// here is nearly free and q80 was visibly quantizing the thin saturated code
// glyphs on near-black. Note this does NOT remove the intermediate 4:2:0
// chroma decimation — only setVideoImageFormat("png") does, and that is slower.
Config.setJpegQuality(95);

// Narration is mono Kokoro TTS; the 320k stereo default was spending ~150 MB
// across the 27-video set on nothing. 96k AAC-LC is transparent for speech.
Config.setAudioCodec("aac");
Config.setAudioBitrate("96k");
Config.setEnforceAudioTrack(true);

// Deliberately NOT set yet — both are real wins but need measurement first:
//   Config.setCrf(21);              // ~-25-30% size, but validate with VMAF
//   Config.setX264Preset("slow");   // ~-5-10% more; only cheap while cores idle
// Do not reach for setHardwareAcceleration: at 4.0.469 every hardware encoder
// is gated on macOS (see renderer get-codec-name.js), so it is a no-op here.
