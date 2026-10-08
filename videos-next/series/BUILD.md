# Building a lesson video

Working guide for building `lessons/<id>/scene.js`. The bar is **good enough**: clear,
correct, consistent with the rest of the series. It doesn't need to be perfect.
`lessons/motion-magic-code/` is the reference. Match its quality and copy its patterns.

## Read first

1. `series/series.json`: your video's entry (title, opensFrom, handsTo, gate, visuals, lines). The narration is **approved and already voiced**. Don't edit `script.json`, `voice/` or `voice.json`.
2. `series/briefs/<id>.md`: the research. It has the exact code on screen (branch + path), misconceptions, gate idea and visuals.
3. `lessons/<id>/voice.json`: every line's and word's start time, plus the gate's `t0`/`t1`.
4. `engine/core.js` (time, easing, camera, text, captions), `engine/kit.js` (controller, arm, stand, target mark, motor card, code panel helpers, flywheel, scheduler timeline), `engine/player.js` (how gates and controls work).
5. `lessons/motion-magic-code/scene.js` (reference) and `lessons/latched/scene.js`.

## The contract

```js
export function createScene(VOICE) {
  return {
    draw(ctx, t, live),     // paint 1920x1080 for time t. live = gate state while a student drives it
    gate,                   // VOICE.gates[0]
    liveGate(),             // { state, prompt(), input(k, v), step(dt) -> true when done, pointer?(type, x, y) }
    gatePromptAt(t),        // the scripted gate's one-line prompt, so the MP4 tells the same story
    gateControls: [ ... ],  // see player.js: { k, label, key, kind: "hold" | "press" | "range", min, max, step, value }
  };
}
```

- **Deterministic.** `draw` is a pure function of `t`. No `Math.random()`, no `Date.now()`, no state carried between frames that `t` can't rebuild. Simulate the whole timeline once up front, sample it at 120 Hz, and look samples up by `t` (see `simulate()` in the reference).
- **The narration is the clock.** Cue everything with `cues(VOICE)`: `L(id).t0/.t1`, `W(id, word)`, `G("try")`. `W` throws if the word isn't in that line (punctuation is ignored). The gate's time window is fixed; the video plays a **scripted version** of it (`events` + `gatePromptAt`), and a live student drives `liveGate()` instead.
- **Live mode.** `draw(ctx, live.state.time, live.state)` must draw the full bench at the FULL camera with no full-screen cards. The live gate ends itself (`step` returns true) about 1.5–2 s after the student has seen the point. They can always Skip.
- **index.html:** copy `lessons/motion-magic-code/index.html` and change the `<title>` and the one-line note.

## Look and layout

- 1920×1080. Captions draw in screen space at the bottom (from about y 940). Keep anything that matters above that **after** the camera transform.
- Colours are the tokens in `C` only. One accent (`C.accent`) for whatever is active or important. `C.err` only for failure, canceled or disabled. No other hues.
- Type: `MONO` for code and readouts, `SANS` for labels, `SERIF` for title and closing cards. Nothing under 16 px at 1080p, and body readouts 20 px or more.
- Reuse the kit so the series looks like one thing: the same controller, arm, motor card, code panel style (`panel`, `codeLine`, `runBar`), flywheel and timeline. **Don't edit `engine/`.** If you need a helper, write it in your own `scene.js`. If you think the kit itself needs a change, say so in your report.
- Every video gets a **title card** (micro kicker "Workshop N · <page title>" + serif title, like the reference) and a **closing card** with the takeaway line.
- Camera: shots that push in on the code or the part being talked about, and the FULL view for demos. 1.0–1.6 zoom. Keep it calm.

## Accuracy, non-negotiable

- On-screen code is copied **exactly** from the branch or page named in your brief. Reformatting long lines is fine; changing the API isn't. Never invent an API.
- WPILib 2027 / Commands v3: `org.wpilib.command3`; `Mechanism` is an interface; commands are `run(coroutine -> ...)` / `runRepeatedly(...)` plus `.named("...")`; there is **no implicit default command**; lambdas are always `() -> foo()`; no enums; never mention Commands v2 or "the old way".
- A canceled command sends nothing. The motor keeps its last request until something replaces it. Don't animate a motor stopping just because a command ended (the arm keeps its latched position request, for example).
- **No tuned gains on screen.** Gains show as `0.0` or as hatched "yours" blocks (see `drawGains` in the reference). Students must not be able to copy our numbers.
- Logging is `DataLogManager` / WPILib `Telemetry` only. Never AdvantageKit.

## Check your work (required)

```
node tools/render.mjs lessons/<id> --sheet out/<id>-a.png --every 6
node tools/render.mjs lessons/<id> --sheet out/<id>-b.png --times 12.5,30,44.2   # beats you care about
node tools/gate-test.mjs lessons/<id> "down:Space,wait:700,up:Space,wait:2500,shot" out/<id>-gate.png
```

Open the sheets and look at them. Fix overlaps, cut-off text, anything sitting under the captions, empty stretches, and anything that contradicts the narration. Iterate until a frame from every beat reads clearly. The gate test has to print `gate passed` with no page errors; adapt the actions to your controls (see the usage at the top of `tools/gate-test.mjs`). **Don't render the MP4**; the parent does that. Don't run `tools/voice.mjs`.

## Report back

Keep it short: one line per beat saying what's on screen, the gate test output, the files you touched, and the weakest beat or anything you'd fix with more time.

## Workshops 1, 5 and 6 (added October 2026)

**New kit pieces** (`engine/kit.js`, see `out/kit-preview/index.html` for each in use):

- `drawField(ctx, R, { view })` returns `{ X, Y, P, s }`, mapping field meters to pixels. The origin is the blue corner, X runs down the field, Y to the left. Use `view: { x0, y0, x1, y1 }` to zoom: a whole-field robot is ~55 px across, too small to read wheels, so zoom for any beat about the modules.
- `swerveModules(vx, vy, omega)` turns robot-relative velocities into four module states. `drawSwerveRobot(ctx, F, pose, { modules, ghost, label })` draws the robot, with `ghost: true` for an estimate, setpoint or goal. `drawPoseReadout`.
- `drawController(..., { left, right, lb, rb, y })` now has sticks (`{x, y}` in -1..1), bumpers and Y.
- `drawToolWindow(ctx, R, { app, title, rows, buttons })` is a schematic of a desktop tool's panel. `drawPlot(ctx, R, { series, playhead })` is a time plot.

**Recorded beats.** A line in `script.json` with `"rec": true` is narrated over real tool footage (Tuner X, PathPlanner, the Limelight page, AdvantageScope, VS Code). That footage isn't captured yet, so for now draw that beat with `drawToolWindow` and friends:

- Use the **real control names** from your brief's shot list, and highlight the control being used as the narration names it (`hot`). Values come from the page (e.g. Voltage Out 1 V, cruise 0.5).
- Never put tuned gains on screen: show gains as hatched "yours" cells, like `drawGains` in the reference.
- No logos, no fake branding, no invented UI. A plain panel of labels and values is right. It will be swapped for real footage later, so keep each rec beat's drawing self-contained (one function per rec beat) to make the swap easy.

**No gate.** `hardware` and `swerve-drive-project` have no "your turn" line, so `G("try")` returns undefined. Return `gate: undefined` and `gatePromptAt: () => null`, and leave out `liveGate`/`gateControls`. Skip the gate test for those two and say so in your report.

**Kickers**: "Workshop 1 · <page title>", "Workshop 5 · <page title>", "Workshop 6 · <page title>". Page titles are in `src/data/lessons.ts`.

**Continuity**: each video's `opensFrom` and `handsTo` in `series.json` say what it picks up and passes on. Reuse the earlier videos' visuals where they call back. Copy from the existing lesson scenes rather than redrawing:

- the Motion Magic trapezoid: `lessons/motion-magic-code`
- the PID shapes on the arm, the latched-request picture: `lessons/latched`
- the scheduler lanes: `lessons/command-framework`, `lessons/chaining-commands`
- the coroutine loop: `lessons/coroutines`

## Real footage for rec beats (October 2026)

A rec beat's schematic is replaced by footage without touching its `scene.js`: the
player looks for `lessons/<id>/clips/clips.json` and draws `engine/clip.js` over any
line it lists, crossfading with the scene at each end. No clip, no change.

1. Record the tool window: `powershell -File tools/record-window.ps1 -Process <proc> -Out captures/<id>/raw.mp4`
   (stop early with `New-Item captures/<id>/raw.mp4.stop`). It writes `raw.mp4.json`
   with the first frame's wall-clock time and the window rectangle.
2. Drive it with `tools/ui.ps1` and `$env:UI_LOG = "captures/<id>/raw.mp4.log.jsonl"`
   (`$env:UI_APP` = the process to focus). Before each beat's actions,
   `ui.ps1 mark beat:<lineId>`; finish with `ui.ps1 mark end`.
3. Cut each beat: `node tools/capture-edit.mjs captures/<id>/raw.mp4 --lesson lessons/<id> --beat <lineId> [--mask x,y,w,h]`.
   It keeps every action, speeds up the waits, fits the clip to the line (start to the
   next line's start), paints masks over solid, and writes the zoom track. Mask every
   gain; mask coordinates are the raw video's pixels.
4. Sheet the beat, check it, then render the MP4 as usual. `render.mjs` awaits the
   clip seek on every frame, so export stays deterministic.

Clips are WebM (VP9): Playwright's Chromium has no H.264 decoder. `captures/` and
`lessons/*/clips/` are gitignored; raw captures may show gains.
