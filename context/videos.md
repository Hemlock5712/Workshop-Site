# Lesson videos

Moved out of CLAUDE.md in November 2026. Read this before touching
`videos-next/` or `/video`.

## Lesson videos (`videos-next/`)

One narrated video per lesson, 28 of them (Workshops 1 to 6, about 39
minutes), drawn on a canvas rather than edited. Each lesson is a `scene.js`
whose `draw(ctx, t)` is a pure function of time, cued off the narration's
word timings, with an optional "your turn" gate a student drives live in the
local player. The MP4s are assets on the `video-series` pre-release of this
repo, and `/video` (noindex, not in the drawer) plays them from there.
**No lesson page links or embeds them** until the owner says so. The old
Remotion trailers (`videos/`, the `video-previews` release) were retired in
October 2026; don't reinstate them.

- **`/video` plays through `/api/video/[file]`, never from the release URL.**
  GitHub serves a release download as `application/octet-stream` with
  `Content-Disposition: attachment`, both pinned in the signed redirect, and
  no iPhone browser will play that. Chrome sniffs past it, so the bug only
  shows on iOS. The route fetches the asset itself, forwards `Range`, and
  answers `video/mp4`. Every byte then goes through a Vercel Function, which
  is fine for an unlinked preview. Before the videos go on lesson pages, move
  them to a host that serves `video/mp4` itself, such as Vercel Blob, and
  delete the route.

- **`series/series.json` is the single source** for every video's title,
  hand-offs and narration lines. `series/BUILD.md` is the build contract
  (accuracy rules, layout, the kit, real footage); read it before touching a
  scene. `series/briefs/<id>.md` holds each lesson's research and shot list.
  `context/narration-voice.md` is how the narration sounds.
- **Layout**: `engine/` (`core.js` time, camera, captions; `kit.js` shared
  visuals; `player.js` player and gates; `clip.js` real footage),
  `lessons/<id>/` (`scene.js`, `script.json`, `voice.json`/`voice.js` timings,
  `index.html`), `tools/`.
- **The narration is the owner's own voice, cloned with Chatterbox Turbo**
  (`tools/tts_chatterbox.py`, venv in `voice-bakeoff/`, reference in
  `voices/joe/`). The reference, the venv and every generated clip
  (`lessons/*/voice/`) are gitignored. **Never commit or upload them.**
- **Changing a video**, in order:
  1. Edit the line in `series.json`, then `node tools/series.mjs --emit <id>`
     (rewrites `lessons/<id>/script.json`).
  2. `node tools/render.mjs lessons/<id> --sheet out/<id>.png --every 6` and
     look at it; a scene's `W(line, word)` cue throws if its word was edited out.
  3. `node tools/voice.mjs lessons/<id>`: only changed lines regenerate.
  4. `node tools/render.mjs lessons/<id> --mp4 out/<id>.mp4`, then
     `node tools/gate-test.mjs lessons/<id> "<actions>" out/<id>-gate.png` for a
     lesson with a gate.
  5. `gh release upload video-series out/<id>.mp4 --clobber -R Hemlock5712/Workshop-Site`.
- **Real tool footage for `"rec": true` lines** replaces a beat's drawn
  schematic without editing the scene: record with `tools/record-window.ps1`,
  drive the app with `tools/ui.ps1` logging to `$env:UI_LOG`, cut a beat with
  `tools/capture-edit.mjs`, and the player draws `lessons/<id>/clips/` over
  that line. Recipe in `BUILD.md`. `captures/` and `clips/` are gitignored,
  because raw footage can show gains: mask every gain in the edit. At the
  bench, never Factory Default, flash firmware or enable a motor without the
  owner, and the CANivore stays named `canivore`.
- `node tools/serve.mjs` serves the folder for the local player
  (`http://localhost:5180/lessons/<id>/`). It is not a Next server and does
  not touch `.next`.
