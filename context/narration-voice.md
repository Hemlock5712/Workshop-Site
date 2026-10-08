# Narration Voice

How the lesson videos sound. The narration lives in
`videos-next/series/series.json` (one entry per lesson, `lines` as
`[id, text, flag]`), is copied into `lessons/<id>/script.json` by
`node tools/series.mjs --emit <id>`, and is voiced with
`node tools/voice.mjs lessons/<id>`. This file covers the judgement no tool
makes. The cadence findings below apply to the website's prose too.

## Who is listening

A student following the course in order, 11 to 18, often with a mechanism on
the bench beside them. By the time a video plays they have read that lesson's
page or are about to. They know what the earlier lessons taught, and nothing
after.

## Spoken, not written

Narration is heard once, at speaking pace, with no way to reread.

- Contractions, the way a mentor at the bench talks. "It's", "you'll", "don't".
- **Never read a code identifier aloud.** Say what it does: "every loop, it
  sends the motor a new request", not "run fast". The identifier belongs on
  screen, in the code panel.
- Each idea once. A video that says the same thing twice in different words
  reads as padding to anyone who watches carefully, and students do.
- The order the owner set: name the concept once, connect it to what the
  student already did (Tuner X in Workshop 1, for example), show their code,
  demo cause and effect, then the fix.

## What went wrong once

The first trailers (a Remotion pipeline, retired October 2026) went through
plain-language passes that fixed the vocabulary and broke the rhythm, by
turning every idea into a short declarative sentence with an inline gloss.
Measured across those 27 scripts:

- mean sentence length **7.50 words**, coefficient of variation **0.44**
- **73.8%** of sentences were 9 words or shorter
- **zero** sentences exceeded 19 words
- **120 of 237** beats ended on a button of 8 words or fewer
- **36** sentences appeared word for word in two different scripts

None of that is word choice. It is cadence, and cadence is what a listener
detects before they parse a word. That is what reads as machine-written.

## The moves

**Vary sentence length.** The single highest-value change, and the trap is
doing it by adding words. Take them from the second gloss in a line and from
numbers already on screen.

**Define by use, not by apposition.** If a term needs defining, put the
definition on screen, where it costs no narration time.

**Never narrate what the frame already says.** If the code panel shows the
value and the caption shows the sentence, the voice says why it matters, not
what it is. When voice, caption and picture all carry the same sentence,
nothing on screen is new and the viewer stops looking.

**One rhetorical question per video, at most.** Never answer it in the next
breath with a sentence that reuses its keyword.

**No tidy triples.** "Feedback corrects. Feedforward predicts. Motion Magic
plans." is a recap, not a thought.

**The closing line is one only that lesson could have.** No URLs, no
"see you next time".

**Let a sentence be dry or incomplete.** A mentor at a workbench does not speak
in matched pairs.

## Mechanical rules

**Scenes cue off words.** A scene's `W(lineId, word)` throws if the word is no
longer in that line, so the page shows an error instead of a video. After
editing a line in `series.json`, emit it, then render a contact sheet for the
lesson (`node tools/render.mjs lessons/<id> --sheet out/<id>.png --every 6`)
before voicing anything.

**Pronunciation is not spelling.** The caption shows `text`. If the voice
mispronounces something, give that line in `script.json` a `say` field with
the respelling; `voice.mjs` speaks `say` and the caption keeps `text`. Writing
"k P" into `text` puts it in the caption, where it is wrong next to a code
panel showing `kP`. Note that `series.mjs --emit` rewrites `script.json` and
drops `say`, so re-add it after an emit.

**Re-voicing is incremental.** `voice.mjs` hashes each line's spoken text and
regenerates only lines that changed. The voice is the owner's, cloned with
Chatterbox; the reference recording and every generated clip are gitignored
and must never be committed or uploaded.

## Content rules still bind

Everything in `CLAUDE.md` applies to narration: WPILib 2027 and Commands v3
only, OpModes rather than `RobotContainer`, no invented APIs, no AdvantageKit,
no enums, and no mention of Commands v2 or "the old way". PathPlanner is the
team's Commands v3 build, as on the site. Run `pnpm spell` after any pass.
