# Lesson videos

Moved out of CLAUDE.md in November 2026. Read this before touching
`videos-next/` or `/video`.

## Lesson videos (`videos-next/`)

One narrated video per lesson in `src/data/lessons.ts`, 27 of them, about 53
minutes. **A video is the lesson page, filmed.** Playwright opens the real page
at 1920x1080 and a short cue file says what is on screen for each narration
line: which block to frame, which code lines to light, what to click on an
interactive. There is no hand-drawn scene. This replaced the canvas scenes
(a 1,100-line `scene.js` per lesson) in November 2026, because every edit to a
lesson left its video stale and redrawing one cost more than rewriting the
lesson. The canvas scenes, the local player and their build contract are in
git at the tag `archive/canvas-videos-2026-11`; don't bring them back.

**No lesson page links or embeds the videos** until the owner has watched them
all and says so. `/video` (noindex, not in the drawer) plays them from the
`video-series` pre-release, one `<slug>.mp4` per lesson. The page builds its
list from `lessons.ts`, so it needs no edit when a lesson is added or renamed,
only an upload. The old Remotion trailers (`videos/`, the `video-previews`
release) were retired in October 2026; don't reinstate them.

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
  hand-offs and narration lines, one entry per lesson, in lesson order.
  `series/PAGE-BUILD.md` is the build contract: the script rules, the cue
  format, the checks. Read it before writing a script or a cue file.
  `series/AGENT-BRIEF.md` is the brief for handing one lesson to a subagent.
  `context/narration-voice.md` is how the narration sounds.
- **Layout**: `lessons/<id>/` holds `script.json` (emitted from
  `series.json`), `page.json` (the cue file) and `voice.json` (when every line
  and word is spoken). `tools/`: `page-map.mjs` lists a page's blocks with a
  selector for each, `render-page.mjs` checks a cue file and films it,
  `voice.mjs` voices a script, `align.py` places each word, `sheet-mp4.mjs`
  cuts a contact sheet from a finished MP4. `engine/core.js` draws captions and
  cards; `engine/kit.js` is kept for cutaways (`engine/cutaways/`, none yet).
- **A cue file fails loudly.** A selector that matches nothing, a code line
  range that no longer exists, a phrase that was edited off the page, or a
  target too big for the frame stops `render-page.mjs --dry` with a list, in
  text. That is the check that a page edit has not broken its video. Paragraph
  and list selectors use `:has-text("opening words")`, never `nth-child`.
- **The narration is the owner's own voice, cloned with Chatterbox Turbo**
  (`tools/tts_chatterbox.py`, venv in `voice-bakeoff/`, reference in
  `voices/joe/`). The reference, the venv and every generated clip
  (`lessons/*/voice/`) are gitignored. **Never commit or upload them.**
- **Word times are forced-aligned**, not estimated: `align.py` runs wav2vec2
  over each take against its known text, so a cue on a word lands on the word.
  The letter-count estimate it replaced was off by 0.15 s on average and up to
  0.8 s.
- **Changing a video**, in order. The dev server must be running; the tools
  never start one.
  1. Edit the line in `series.json`, then `node tools/series.mjs --emit <id>`.
  2. `node tools/render-page.mjs lessons/<id> --draft --dry`: cues are checked
     against the page on estimated timings, before anything is voiced.
  3. `node tools/voice.mjs lessons/<id>`: only changed lines regenerate.
  4. `node tools/render-page.mjs lessons/<id> --mp4 out/<id>.mp4`, about
     six minutes, then `node tools/sheet-mp4.mjs lessons/<id> out/<id>.mp4
out/<id>-final.png` and look at it once.
     Add `--gpu` for a page with a 3D model (`mechanism-cad`): without it the
     model is drawn on the CPU and the render takes over an hour.
  5. `gh release upload video-series out/<id>.mp4 --clobber -R Hemlock5712/Workshop-Site`.
- **A lesson page changed but its script did not**: run step 2 without
  `--draft`. If it says `dry run ok`, re-render (step 4) and the video is
  current. If it lists problems, fix those cues.
- **No tuned gain on screen.** A cue never frames a block that shows one. The
  BLine and Align to Tag pages print path-controller gains in a code card, so
  their videos frame the paragraphs around it.
- **Cutaways are for motion the page cannot show**, 5 to 15 seconds, two a
  video at most, and the renderer enforces both. None has been needed. Where a
  lesson wants an animation, build it on the page as a component, so readers
  get it too and the video films it.
- **Screen recordings of real tools** (`tools/record-window.ps1`, `ui.ps1`,
  `capture-edit.mjs`, `engine/clip.js`) are parked and not wired into the
  page-driven renderer. `captures/` and `clips/` are gitignored, because raw
  footage can show gains: mask every gain in the edit. At the bench, never
  Factory Default, flash firmware or enable a motor without the owner, and the
  CANivore stays named `canivore`.
