# Gray Matter Workshop Videos

Programmatic video pipeline for workshop explainers. Everything runs locally and is free:

- **[Remotion](https://www.remotion.dev/)** — React components rendered to MP4
- **[Kokoro TTS](https://github.com/hexgrad/kokoro)** via [`kokoro-js`](https://www.npmjs.com/package/kokoro-js) — high-quality voiceover, no API keys, runs on CPU

## One-time setup

From the repo root:

```bash
pnpm install
```

This installs Remotion, `kokoro-js`, and the Kokoro ONNX model is fetched lazily on the first `pnpm tts` run (~80MB, cached after).

## Authoring a video

Each video is described by a **script** file under `src/compositions/<Name>.script.ts`. A script is a list of segments — each has a paragraph of narration and the slide that should appear while it plays.

```ts
// src/compositions/Introduction.script.ts
export const IntroductionScript: VideoScript = {
  id: "Introduction",
  voice: "af_heart",
  segments: [
    {
      id: "title",
      text: "Welcome to the Gray Matter Workshop...",
      slide: {
        kind: "title",
        title: "Gray Matter Workshop",
        subtitle: "FRC Programming",
      },
    },
    // ...more segments
  ],
};
```

## Two-step build

```bash
# 1. Generate voiceover audio for every segment + the duration manifest
pnpm --filter @gray-matter/videos tts

# 2. Render the MP4
pnpm --filter @gray-matter/videos render:intro
```

The output lands at `videos/out/introduction.mp4`. Generated audio in `videos/public/audio/<ScriptId>/` and the rendered MP4 are gitignored.

## Previewing live

```bash
pnpm --filter @gray-matter/videos studio
```

Opens the Remotion Studio at <http://localhost:3000> with hot-reload for the compositions.

## Adding a new video

1. Create `src/compositions/MyVideo.script.ts` (copy `Introduction.script.ts`)
2. Create `src/compositions/MyVideo.tsx` (copy `Introduction.tsx`)
3. Register it in `src/Root.tsx` with a new `<Composition>`
4. Add the script to the `SCRIPTS` array in `scripts/generate-audio.ts`
5. Add a stub manifest at `src/manifests/MyVideo.manifest.ts` (copy the stub)
6. Run `pnpm tts MyVideo` then `pnpm render MyVideo out/my-video.mp4`

## Fixing mispronunciations

Edit [`scripts/pronunciations.ts`](scripts/pronunciations.ts) and add an entry to the `pronunciationOverrides` map. The TTS step applies these substitutions to narration text before Kokoro sees it — slide text stays unchanged, so what you see on screen still reads correctly.

```ts
// scripts/pronunciations.ts
export const pronunciationOverrides: Record<string, string> = {
  CTRE: "C T R E",
  WPILib: "Whipp lib",
  "Kraken X44": "Kraken X 44",
};
```

After editing, rerun `pnpm tts <ScriptId>` and `pnpm render <ScriptId> out/<name>.mp4` to hear the change. The seed map already covers common FRC/CTRE terms — extend it as you spot issues.

## Voices

Kokoro ships a handful of expressive English voices. Some popular ones:

| Voice ID     | Description                    |
| ------------ | ------------------------------ |
| `af_heart`   | Warm female, narration default |
| `af_bella`   | Confident female               |
| `am_michael` | Calm male                      |
| `am_adam`    | Energetic male                 |

Set `voice` per script. Full list and samples at <https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX>.

## Upgrading the voice later

If Kokoro quality isn't good enough for a particular video, swap in ElevenLabs (or any cloud TTS) by replacing the `tts.generate(...)` call in `scripts/generate-audio.ts` — the rest of the pipeline doesn't care where the WAV came from.

## Why not ElevenLabs out of the box?

ElevenLabs free tier disallows commercial use and has no API access. Kokoro is fully open-weight (Apache 2.0) and runs offline. If you upgrade, the integration point is one function.
