import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEntryPoint("./src/index.ts");
Config.setDelayRenderTimeoutInMilliseconds(120000);

// Remotion's own default here is round(min(8, cores / 2)) — 8 on a 16-thread
// box. The old value of 2 was leaving most of the machine idle. Tune with:
//   npx remotion benchmark src/index.ts PidTrailer CommandsLesson \
//     --runs=3 --concurrencies=2,4,8,12 --frames=0-599
// and pick the knee of the curve, not the max: each unit is a 1080p Chromium
// tab at roughly 0.6-0.9 GB.
Config.setConcurrency(8);

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
