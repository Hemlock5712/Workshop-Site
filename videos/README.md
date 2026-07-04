# Gray Matter Workshop Trailers

Programmatic ~90-second trailer videos for every workshop topic. Everything
runs locally and is free:

- **[Remotion](https://www.remotion.dev/)** — React components rendered to MP4
- **[Kokoro TTS](https://github.com/hexgrad/kokoro)** via [`kokoro-js`](https://www.npmjs.com/package/kokoro-js) — voiceover, no API keys, runs on CPU
- **[whisper.cpp](https://github.com/ggerganov/whisper.cpp)** (optional) — word-level timestamps for frame-accurate captions and event sync

A trailer is one continuous world: artifacts (title card, physics lab, code
panels, diagrams, images, end card) placed on a large canvas, with a camera
that moves between them. Narration is split into short **beats**; each beat
frames a region of the world and can fire **events** — gain changes, code
edits, diagram reveals — anchored to the exact spoken word
(`at: { word: "crank" }`).

## One-time setup

From the repo root:

```bash
pnpm install
pnpm --filter @gray-matter/videos whisper:setup   # optional, ~150MB, all local
```

The Kokoro ONNX model (~80MB) downloads lazily on the first `trailer:audio`
run and is cached. Without whisper, word timings are estimated from Kokoro's
sentence chunks — fine for captions, slightly loose for word-anchored events.

## Build & render

```bash
# 1. Generate/refresh voiceover + word timings. Content-hash cached — only
#    changed narration is re-synthesized; unchanged runs are instant.
pnpm --filter @gray-matter/videos trailer:audio              # all trailers
pnpm --filter @gray-matter/videos trailer:audio PidTrailer   # just one

# 2. Render
pnpm --filter @gray-matter/videos render PidTrailer out/pid-trailer.mp4
```

There are no manifest files to keep in sync: each composition reads
`public/trailer-audio/<Id>.timeline.json` via `calculateMetadata`, and Studio
shows a banner if narration changed since audio was generated.

## Previewing live

```bash
pnpm --filter @gray-matter/videos studio
```

Remotion Studio at <http://localhost:3000> lists every trailer with
hot-reload. A trailer without generated audio shows a "run trailer:audio"
slate instead of breaking.

## Adding a trailer

1. Create `src/trailer/trailers/MyTopicTrailer.ts` (copy `PidTrailer.ts` for a
   physics/code video, `CommandFrameworkTrailer.ts` for a diagram video)
2. Add it to `TRAILERS` in `src/trailer/registry.ts`
3. `pnpm trailer:audio MyTopicTrailer`, then preview in Studio

## Artifact kinds

| Kind      | What it is                                                             |
| --------- | ---------------------------------------------------------------------- |
| `title`   | Opening card — gradient headline, kicker, underline sweep              |
| `end`     | CTA card with the page URL                                             |
| `code`    | Code panel; successive `states` animate as typed diffs                 |
| `diagram` | Node/edge graph; nodes reveal by `step` events, ghosts until revealed  |
| `image`   | Framed photo/render with a slow Ken Burns push                         |
| `pid-lab` | Live arm physics sim: gains, gravity feedforward, Motion Magic profile |

## Fixing mispronunciations

Add an entry to [`scripts/pronunciations.ts`](scripts/pronunciations.ts) and
rerun `trailer:audio` — substitutions apply to narration audio only; captions
show the original text.

## Music bed

Drop a `public/music/bed.mp3` and rerun `trailer:audio` — it mixes under the
narration automatically (quiet, faded in/out). Camera-move whoosh SFX are
synthesized automatically.

## Swapping in a human voice

Replace the cached WAV for a beat (`public/trailer-audio/cache/<hash>.wav`)
with a recorded take (mono PCM16 WAV), delete its `<hash>.json` sidecar, and
rerun `trailer:audio`. The pipeline times the existing take instead of
re-synthesizing it, and whisper re-aligns word timings against the recording —
so captions and event anchors still land.

## Voices

Kokoro ships several expressive English voices (`af_heart` is the default
narration voice). Set `voice` per trailer script. Full list and samples at
<https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX>.
