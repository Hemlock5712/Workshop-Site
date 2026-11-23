# Building a page-driven lesson video

A video is the lesson page, filmed. The narration walks the page top to bottom
and the camera shows the block being talked about. There is no `scene.js`.
A lesson is two small files:

- the lesson's entry in `series/series.json` (the script). An agent working on
  one lesson beside others writes it to `series/drafts/<id>.json` instead, and
  the entry is merged in afterwards.
- `lessons/<id>/page.json` the cue file: what is on screen for each narration line

`<id>` is the page slug without the slash (`pid-control` for `/pid-control`).

## Read first

1. `context/narration-voice.md`. It is short and it binds every line you write.
2. The lesson page, `src/app/(workshop)/<id>/page.tsx`, start to finish.
3. `node tools/page-map.mjs <id>`: every block on the page with a selector that
   matches exactly one visible element. Use those selectors as printed.
4. The old entry for this lesson in `series/series.json`, if there is one, for
   its `opensFrom` / `handsTo` continuity and any line worth keeping. Much of
   the old narration describes drawings that no longer exist, and some is
   factually stale. The page is right when they disagree.
5. `lessons/running-program/page.json` as a worked cue file with a scripted
   demo, and `lessons/pid-control/page.json` for one that drives sliders.

## The script

```json
{
  "id": "pid-control",
  "workshop": "Workshop 1 · Hardware & CTRE",
  "title": "PID Tuning in Tuner X",
  "page": "/pid-control",
  "opensFrom": "one sentence: what the previous lesson left the student with",
  "handsTo": "one sentence: what the next lesson picks up",
  "lines": [
    ["intro", "First spoken line."],
    ["gains", "Second."],
    ["tryit", "Your turn line.", "gate"]
  ]
}
```

- **Title** is the lesson's title from `src/data/lessons.ts`. The old video
  titles are retired.
- Rewrite `opensFrom` and `handsTo` from the lessons either side as they are
  today (`src/data/lessons.ts` gives the order). The old entry's are often stale.
- **8 to 14 lines, 60 to 150 seconds.** A line is one to three sentences, 12 to
  40 words. Line ids are short lowercase words, unique in the video.
- **Follow the page's order.** The video is a guided first look at this page.
  Every line talks about something that is on the page at that moment, and the
  camera only moves down the page, apart from one return to a code block or
  diagram already shown.
- **Do not read the page aloud.** The page's sentence is on screen. The voice
  says why it matters, what to look at, or what goes wrong. Skip sections that
  need no comment: the quiz, link lists, "you'll need".
- **Not every section gets a line.** Pick the three to five things a student
  must not miss and give them room.
- Say nothing the page does not support. No invented APIs, numbers, steps or
  failure stories. Never say a tuned gain value.
- Never read a code identifier aloud. Contractions. Vary sentence length. No
  em dashes. No "in this video", no "let's dive in", no sign-off.
- First line: connect to what the student did last (`opensFrom`). Last line:
  the one thing only this lesson could say, pointing at the next (`handsTo`).
- A line flagged `"gate"` adds an 8 second pause after it for a scripted demo
  of an interactive on the page. Use at most one, and only when the page has an
  interactive worth driving (a diagram with buttons, a playground with sliders).

## The cue file

```json
{
  "pages": { "lesson": "/pid-control" },
  "targets": {
    "lede": "#main-content header .lesson-lede",
    "play": "#play-with-the-gains-first section.module"
  },
  "open": [
    {
      "card": "PID Tuning in Tuner X",
      "kicker": "Workshop 1 · Hardware & CTRE"
    }
  ],
  "lines": {
    "intro": [{ "show": "#main-content header" }],
    "gains": [
      { "show": "@play" },
      {
        "at": "kP",
        "note": "too much: it overshoots",
        "on": "@play",
        "side": "top"
      }
    ]
  }
}
```

`targets` names a selector once; cues refer to it as `@name`. A cue has exactly
one of the keys below. `at` says when (default: the line's start); `until` says
when an overlay or hold ends. Times are words, never numbers: `"word"`,
`"word#2"` (second occurrence), `"otherline:word"`, `"end"`, `"gate:40%"`.

What the frame is (holds until the next one):

| cue                                             | use                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `{ "show": "@t" }`                              | frame that element. `["@a", "@b"]` frames several together. Optional `"zoom"`.                    |
| `{ "code": "@card", "lines": [9, 12] }`         | frame those lines of a code card, dim the rest. Several in a row walk a block, one idea per step. |
| `{ "card": "Title", "kicker": "…" }`            | full-screen card. `open` starts with the title card. Give a card inside a line an `until`.        |
| `{ "cut": "name", "params": {}, "until": "…" }` | full-screen cutaway animation. See below; almost never needed.                                    |

Signals over the frame (last until the next `show`/`code`, or `until`):

| cue                                                             | use                                                                                                                                             |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ "spot": "@t" }`                                              | dim everything but that element. The default way to say "look here" inside a frame already on screen. Prefer it to zooming into a small part.   |
| `{ "note": "two or three words", "on": "@t", "side": "right" }` | an accent label with a leader line. `side`: right, left, top, bottom. Never a sentence, never the narration repeated.                           |
| `{ "mark": "@para", "text": "exact phrase" }`                   | underline a phrase inside a paragraph. The phrase must be on the page verbatim.                                                                 |
| `{ "ask": "Short question or instruction" }`                    | the "your turn" prompt. Put it on the gate line. `"place": "bottom"` moves it off the top of the frame when it would cover what the demo shows. |

The cursor:

| cue                                               | use                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| `{ "click": "@t" }`                               | click a button, checkbox, radio or tab.                                        |
| `{ "hold": "@t", "until": "…" }`                  | press and hold, release at `until`.                                            |
| `{ "set": "@slider", "value": 0.5, "over": 1.2 }` | drag a range input to a value over that many seconds, or pick a select option. |

Rules that keep it watchable:

- **Hold still.** One `show` or `code` per line is normal. Do not move the
  camera mid-sentence unless the sentence moves on to another block.
- **Signal on the word.** Put `at` on the word that names the thing, so the
  spotlight or note lands as it is said.
- **One signal at a time.** Do not stack a spot and a note on different things.
- A signal ends when its line's frame ends, so cue it on an early word. A note
  cued on a line's last word is on screen for under a second.
- When the frame holds several steps or paragraphs and the line is about one of
  them, `spot` that one. Pick list items with `li:has-text("opening words")`.
- **An interactive keeps its state.** A slider you moved stays moved in every
  later frame, and a playground starts wherever the page starts it, which may
  show nothing when you change one control (an arm already at its target does
  not move when a gain goes up). Before scripting a demo, render the gate with
  `--times` and look. Click the interactive's reset when the demo is over if
  its leftover state would show in a later frame.
- `set` with `over` runs for that many seconds from its `at`. Inside a gate,
  time demo steps with `"at": "gate:10%"`, `"gate:50%"` and so on.
- Controls: `page-map` prints each control's label. Build its selector from the
  label, for example `#sec input[type=range][aria-label^="Proportional gain"]`
  or `#sec button:has-text("Reset")`.
- Every narration line should have a cue or deliberately hold the previous
  frame. `--dry` lists the lines that hold.
- A frame must fit: `--dry` flags any target that is CUT OFF. Frame a smaller
  element or several lines of it. Tall figures and long lists do not fit whole;
  show the part being talked about.
- Selectors for paragraphs and list items use `:has-text("opening words")`,
  never `nth-child`, so an edited page breaks the cue loudly instead of silently
  showing the wrong block. Elements inside a hidden `<Mech>` variant do not
  count: the video films the arm reading.
- No tuned gain may appear. Do not frame a block that shows one.
- Cutaways (`engine/cutaways/<name>.js`) are for motion the page cannot show.
  None exist yet. Do not write one. If the lesson badly needs one, say so in
  your report with one sentence on what it would show.

## Facts that override older notes

`context/narration-voice.md` still mentions the old scene pipeline and calls
PathPlanner the team's path tool. Both are out of date: there are no scenes, and
paths are BLine. The root `CLAUDE.md` and `context/teaching-code.md` are right
when anything disagrees.

## Check your work

The dev server is already running on `http://localhost:3000`. **Do not start,
stop or restart a server, and do not edit anything under `src/`.**

```
node tools/series.mjs --emit <id>            # series.json -> lessons/<id>/script.json
node tools/series.mjs --emit-draft <id>      # the same, from series/drafts/<id>.json
node tools/render-page.mjs lessons/<id> --draft --dry
node tools/render-page.mjs lessons/<id> --draft --sheet out/<id>-page.png        # one frame per line, two per gate
node tools/render-page.mjs lessons/<id> --draft --sheet out/<id>-x.png --times 41,44.5,48   # frames you choose
```

`--draft` estimates timings from the script, so nothing needs voicing. `--dry`
must end with `dry run ok` and no problems. Then render the sheet and look at
it once: every frame should show the thing its caption is talking about, with
nothing important cut off. Fix and re-run until it does. Do not run
`tools/voice.mjs` and do not render an MP4.

## Report back

Under 150 words: the line count and estimated length, the dry-run's last line,
anything on the page that looked wrong or stale while you read it, any line you
are unsure is factually supported, and whether a cutaway is warranted.
