# Narration Voice

Rules for `beats[].text` in `videos/src/trailer/trailers/*.ts`. The mechanically
checkable subset is enforced by `pnpm --filter @gray-matter/videos narration:lint`;
this file covers the judgement the linter can't make.

## Who is listening

A second-year FRC student who has deployed code to a robot and has never tuned a
control loop. They know what teleop is. They know what deploying means. They have
stood in a driver station. They have not seen a Motion Magic profile fail.

Write for that person. `IntroductionTrailer` and `PrerequisitesTrailer` are the
two exceptions where a genuine rookie floor is correct.

## What went wrong last time

Three plain-language passes (`542f19f`, `501c462`, `e344223`, `e6a3a6e`) fixed the
vocabulary and broke the rhythm. They did it by turning every idea into a short
declarative sentence with an inline gloss. Measured across the 27 scripts at the
time of the audit:

- mean sentence length **7.50 words**, coefficient of variation **0.44**
- **73.8%** of sentences were 9 words or shorter
- **zero** sentences in the entire corpus exceeded 19 words
- **120 of 237** beats ended on a button of 8 words or fewer
- **27 of 27** scripts closed on a `frc5712.com` CTA; **13** used the identical
  phrase "waiting at frc5712.com"
- **36** sentences appeared byte-identical in two different scripts

Nothing in that list is a word choice. It is all cadence, and cadence is what a
listener detects before they parse a single word. That is the thing that reads as
machine-written.

## The moves

**Vary sentence length inside the existing word budget.** This is the single
highest-value change, and the trap is that it is easy to do by _adding_ words.
Don't — trailers are capped at 45 words per beat and lessons at 55, and beats are
already over. Take the words from the CTA boilerplate, the second gloss in a beat,
and the numerals that are already on screen.

**Define by use, not by apposition.** One gloss per beat, two per script. If a
term genuinely needs defining on first use, put the definition on screen where it
costs zero narration seconds — `DiagramNode.sublabel` and `ImageArtifact.caption`
both already exist and are free.

**Never narrate what the frame already says.** If the diagram sublabel reads
"ramp speed up at a fixed rate," the voice does not get to say "speed ramps up at
a fixed rate." Same for a value the HUD chip is displaying and a comment the code
panel is typing out. When the voice, the burned-in caption and the artifact all
carry the same sentence, nothing on screen is new, so the viewer stops looking at
the picture. Say why it matters; let the frame say what it is.

**One rhetorical question per script, maximum.** And never answer it in the next
breath with a sentence that reuses its keyword. "How hard? A number called the P
gain decides." is the shape to avoid.

**No tidy triples.** "Feedback corrects. Feedforward predicts. Motion Magic
plans." is a recap, not a thought. Recap-triple-then-URL was the house closer in
16 beats.

**Every closing line should be one only that lesson could have.** The URL is on
the EndCard for the whole hold — `EndArtifact.url` renders it. Speaking it is pure
redundancy in all 27 scripts.

**A Lesson is a different genre from its Trailer, not an expansion of it.** It may
reuse a teaching point but must reach it from a different angle. The Feedforward
pair shared 16 verbatim sentences, which reads as padding to anyone who watches
both.

**Let a sentence be dry, or incomplete, or funny.** A real mentor at a workbench
does not speak in matched pairs.

## Two hard mechanical constraints

**Preserve `events[].at.word`.** An anchor word that a rewrite deletes does not
raise an error — `resolveTimeline` logs a warning and fires the event at 30% of
the beat, which can collapse two staged reveals onto one frame. The linter treats
this as an error and it is pinned at zero. If you need to drop an anchor word,
change the event to `at: { progress: n }` in the same edit.

**Run `pnpm --filter @gray-matter/videos whisper:setup` before writing long
sentences.** Without whisper, word timings are estimated by linear interpolation
_inside each sentence_, so anchor accuracy is inversely proportional to sentence
length. A 45-word sentence places its anchors by guesswork across ~17 seconds of
audio. Verify `refined: true` on every beat in the emitted
`public/trailer-audio/*.timeline.json` before relying on word-anchored events.

## Pronunciation, not spelling

Respellings belong in `videos/scripts/pronunciations.ts`, never in `beats[].text`
— `Beat.text` is documented as caption text with pronunciations applied for TTS
only. Writing "Command dot sequence" or "k P" in the narration puts it in the
burned-in caption, where it is simply wrong next to a code panel showing
`Command.sequence(` and `kP`.

If you remove a letter-split like `k G`, add the `kG` entry to
`pronunciations.ts` **in the same commit** — `kP`/`kI`/`kD` have entries but
`kG`/`kS`/`kV`/`kA` do not, and stripping the split without the entry regresses
the audio.

## Content rules still bind

Everything in `CLAUDE.md` applies to narration: WPILib 2027 / Commands v3 only,
`org.wpilib.*`, OpModes rather than `RobotContainer`, no invented v3 APIs, no
PathPlanner, no AdvantageKit, no enums in examples, and no `SendableChooser` —
including as the thing being replaced. Re-run `pnpm spell` after any pass;
cspell has caught this repo before (`2a8a695`).
