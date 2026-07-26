// Narration style linter for the trailer scripts.
//
//   pnpm --filter @gray-matter/videos narration:lint
//   pnpm --filter @gray-matter/videos narration:lint --baseline   # re-record counts
//   pnpm --filter @gray-matter/videos narration:lint PidTrailer   # one script
//
// Three prose passes (542f19f, 501c462, e344223, e6a3a6e) ran with no automated
// check, and each one introduced the tics the next had to clean up. The prose
// rules themselves live in context/narration-voice.md; this file enforces only
// the mechanically detectable subset.
//
// It imports the real script objects rather than regexing source, so the checks
// see resolved narration and can cross-reference each beat's camera rect against
// the artifacts actually on screen. The trailer modules are pure data (their only
// imports are type-only), so no runtime dependency is needed.
//
// Counts ratchet: narration-style.json records today's violation count per check,
// and the linter fails only when a count goes UP. Lower a number when you fix
// things; never raise one without saying why.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { TRAILERS } from "../src/trailer/registry";
import { pronunciationOverrides } from "./pronunciations";
import type {
  ArtifactDef,
  Rect,
  TrailerScript,
} from "../src/trailer/lib/types";

const ROOT = resolve(__dirname, "..");
const CONFIG_PATH = join(ROOT, "narration-style.json");
const TRAILER_DIR = join(ROOT, "src", "trailer", "trailers");

interface Config {
  /** Max violations per check before the linter fails. */
  baseline: Record<string, number>;
  /** Sentences allowed to appear in more than one script (deliberate refrain). */
  allowDuplicateSentences: string[];
  budgets: { trailerWords: number; lessonWords: number };
  rhythm: { minCv: number; minLongSentenceWords: number };
}

const DEFAULT_CONFIG: Config = {
  baseline: {},
  allowDuplicateSentences: [],
  budgets: { trailerWords: 45, lessonWords: 55 },
  rhythm: { minCv: 0.55, minLongSentenceWords: 18 },
};

type Severity = "error" | "warn";

interface Violation {
  check: string;
  severity: Severity;
  scriptId: string;
  beatId?: string;
  line?: number;
  message: string;
}

// ---------------------------------------------------------------------------
// Text helpers. `normalizeWord` matches resolveTimeline's anchor matching
// (src/trailer/lib/timeline.ts) exactly, so the anchor check agrees with the
// runtime.
// ---------------------------------------------------------------------------

const normalizeWord = (word: string) =>
  word.toLowerCase().replace(/[^a-z0-9]/g, "");

const words = (text: string) => text.split(/\s+/).filter((w) => w.length > 0);

const sentences = (text: string) =>
  (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);

const normalizedTokens = (text: string) =>
  words(text)
    .map(normalizeWord)
    .filter((w) => w.length > 0);

function ngrams(text: string, n: number): Set<string> {
  const toks = normalizedTokens(text);
  const out = new Set<string>();
  for (let i = 0; i + n <= toks.length; i++) {
    out.add(toks.slice(i, i + n).join(" "));
  }
  return out;
}

const rectsOverlap = (a: Rect, b: Rect) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

/** Every human-readable string an artifact puts on screen. */
function artifactText(def: ArtifactDef): string[] {
  const out: string[] = [];
  if ("title" in def && def.title) out.push(def.title);
  if ("subtitle" in def && def.subtitle) out.push(def.subtitle);
  if ("caption" in def && def.caption) out.push(def.caption);
  if (def.kind === "code") {
    // Only comments — narrating an API name is fine and often required, but
    // reading the panel's own prose aloud is the thing worth catching.
    for (const state of def.states) {
      for (const m of state.matchAll(/\/\/\s*(.+)$/gm)) out.push(m[1]);
    }
  }
  if (def.kind === "diagram") {
    for (const node of def.nodes) {
      out.push(node.label);
      if (node.sublabel) out.push(node.sublabel);
    }
    for (const edge of def.edges) if (edge.label) out.push(edge.label);
  }
  return out;
}

const isLesson = (scriptId: string) => /Lesson$/.test(scriptId);

/** Best-effort source line for a beat, for clickable output. */
function beatLines(scriptId: string): Map<string, number> {
  const path = join(TRAILER_DIR, `${scriptId}.ts`);
  const map = new Map<string, number>();
  if (!existsSync(path)) return map;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = line.match(/^\s*id:\s*"([^"]+)"/);
    if (m && !map.has(m[1])) map.set(m[1], i + 1);
  });
  return map;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

const BANNED: { re: RegExp; hint: string }[] = [
  { re: /\bHere(?:'s| is| are)\b/g, hint: "cut the throat-clear" },
  { re: /\bMeet (?:the|a|an)\s/g, hint: "don't introduce props" },
  { re: /\b[Tt]hat(?:'s| is) the whole\b/g, hint: "no summary button" },
  {
    re: /waiting at frc5712\.com/g,
    hint: "13 scripts share this exact CTA; the URL is already on the EndCard",
  },
  { re: /\bjust means\b/g, hint: "condescending gloss" },
  {
    re: /\b[Dd]ot [a-z]/g,
    hint: "spoken code punctuation — put the respelling in scripts/pronunciations.ts and write the real API name",
  },
];

function checkBanned(script: TrailerScript, lines: Map<string, number>) {
  const out: Violation[] = [];
  for (const beat of script.beats) {
    for (const { re, hint } of BANNED) {
      for (const m of beat.text.matchAll(re)) {
        out.push({
          check: "banned-phrase",
          severity: "error",
          scriptId: script.id,
          beatId: beat.id,
          line: lines.get(beat.id),
          message: `"${m[0].trim()}" — ${hint}`,
        });
      }
    }
    // Letter-split gains. Gated on pronunciations.ts: if an override exists the
    // author should write `kG` and let it do the work; if it does NOT exist,
    // stripping the split would regress the audio, so demand the entry first.
    for (const m of beat.text.matchAll(/\bk ([A-Z])\b/g)) {
      const key = `k${m[1]}`;
      const covered = Object.hasOwn(pronunciationOverrides, key);
      out.push({
        check: "banned-phrase",
        severity: covered ? "error" : "warn",
        scriptId: script.id,
        beatId: beat.id,
        line: lines.get(beat.id),
        message: covered
          ? `"${m[0]}" — write "${key}"; pronunciations.ts already maps it to "${pronunciationOverrides[key]}"`
          : `"${m[0]}" — add ${key} to scripts/pronunciations.ts, THEN write "${key}" here (removing the split without the entry breaks the audio)`,
      });
    }
  }
  return out;
}

/**
 * The check the audit itself kept getting wrong. An events[].at.word that is not
 * in the narration does not throw — resolveTimeline warns and silently fires the
 * event at 30% of the beat (src/trailer/lib/timeline.ts), so two staged reveals
 * can collapse onto one frame and nobody notices until they watch the render.
 * Any narration rewrite must preserve its anchors, so this is an error.
 */
function checkAnchors(script: TrailerScript, lines: Map<string, number>) {
  const out: Violation[] = [];
  for (const beat of script.beats) {
    const toks = normalizedTokens(beat.text);
    for (const event of beat.events ?? []) {
      const at = event.at;
      if (!at || !("word" in at)) continue;
      const target = normalizeWord(at.word);
      const occurrences = toks.filter((t) => t === target).length;
      const needed = at.occurrence ?? 1;
      if (occurrences < needed) {
        out.push({
          check: "anchor-integrity",
          severity: "error",
          scriptId: script.id,
          beatId: beat.id,
          line: lines.get(beat.id),
          message:
            `${event.type} event anchored to "${at.word}"` +
            (at.occurrence ? ` (occurrence ${at.occurrence})` : "") +
            ` but the narration has ${occurrences} — it will fire at 30% of the beat instead`,
        });
      }
    }
  }
  return out;
}

function checkBeatLength(
  script: TrailerScript,
  lines: Map<string, number>,
  cfg: Config
) {
  const cap = isLesson(script.id)
    ? cfg.budgets.lessonWords
    : cfg.budgets.trailerWords;
  return script.beats
    .map((beat) => ({ beat, n: words(beat.text).length }))
    .filter(({ n }) => n > cap)
    .map(({ beat, n }) => ({
      check: "beat-too-long",
      severity: "error" as Severity,
      scriptId: script.id,
      beatId: beat.id,
      line: lines.get(beat.id),
      message: `${n} words, cap is ${cap} — split it, or cut a gloss`,
    }));
}

/**
 * Narration reading the screen aloud. When the voice, the burned-in caption and
 * the artifact all carry the same sentence, nothing on screen is new information
 * and the viewer stops looking at the picture.
 */
function checkScreenEcho(script: TrailerScript, lines: Map<string, number>) {
  const out: Violation[] = [];
  for (const beat of script.beats) {
    const visible = script.world.filter((def) =>
      rectsOverlap(def.rect, beat.camera)
    );
    const onScreen = new Set<string>();
    for (const def of visible) {
      for (const text of artifactText(def)) {
        for (const g of ngrams(text, 4)) onScreen.add(g);
      }
    }
    const hits = [...ngrams(beat.text, 4)].filter((g) => onScreen.has(g));
    for (const hit of hits) {
      out.push({
        check: "screen-echo",
        severity: "error",
        scriptId: script.id,
        beatId: beat.id,
        line: lines.get(beat.id),
        message: `"${hit}" is already on screen in this beat's camera rect — say why it matters, not what it says`,
      });
    }
  }
  return out;
}

function checkCta(script: TrailerScript, lines: Map<string, number>) {
  const last = script.beats.at(-1);
  if (!last) return [];
  const out: Violation[] = [];
  for (const re of [/the full/i, /waiting at/i, /frc5712\.com/i]) {
    if (re.test(last.text)) {
      out.push({
        check: "cta-template",
        severity: "error",
        scriptId: script.id,
        beatId: last.id,
        line: lines.get(last.id),
        message: `final beat matches ${re} — all 27 scripts close the same way; write a last line only this lesson could have`,
      });
    }
  }
  return out;
}

function checkRhythm(script: TrailerScript, cfg: Config) {
  const out: Violation[] = [];
  const lens = script.beats.flatMap((b) =>
    sentences(b.text).map((s) => words(s).length)
  );
  if (lens.length === 0) return out;
  const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
  const sd = Math.sqrt(
    lens.reduce((a, n) => a + (n - mean) ** 2, 0) / lens.length
  );
  const cv = sd / mean;
  if (cv < cfg.rhythm.minCv) {
    out.push({
      check: "rhythm",
      severity: "warn",
      scriptId: script.id,
      message: `sentence-length CV ${cv.toFixed(3)} < ${cfg.rhythm.minCv} (mean ${mean.toFixed(1)} words) — every sentence is the same size, which is what reads as machine-written. Redistribute words inside the existing budget; do NOT add any.`,
    });
  }
  const longest = Math.max(...lens);
  if (longest < cfg.rhythm.minLongSentenceWords) {
    out.push({
      check: "rhythm",
      severity: "warn",
      scriptId: script.id,
      message: `longest sentence is ${longest} words; wants one of ${cfg.rhythm.minLongSentenceWords}+. NOTE: without whisper installed, word timings are linearly interpolated inside each sentence, so long sentences degrade word-anchored events — run \`pnpm whisper:setup\` before leaning on this.`,
    });
  }
  return out;
}

function checkTics(script: TrailerScript, lines: Map<string, number>) {
  const out: Violation[] = [];
  const all = script.beats.map((b) => b.text).join(" ");
  const questions = (all.match(/\?/g) ?? []).length;
  if (questions > 1) {
    out.push({
      check: "tic-density",
      severity: "warn",
      scriptId: script.id,
      message: `${questions} question marks — rhetorical-question-then-immediate-answer is the quiz-show cadence; one per script is human, ${questions} is a tic`,
    });
  }
  const dashes = (all.match(/—/g) ?? []).length;
  if (dashes > 1) {
    out.push({
      check: "tic-density",
      severity: "warn",
      scriptId: script.id,
      message: `${dashes} em-dash appositives — move the definition into a DiagramNode sublabel or an ImageArtifact caption, where it costs zero narration seconds`,
    });
  }
  for (const beat of script.beats) {
    const glosses = (
      beat.text.match(/\b(?:is|are)\s+(?:a|an|the|just|simply)\b/g) ?? []
    ).length;
    if (glosses > 1) {
      out.push({
        check: "tic-density",
        severity: "warn",
        scriptId: script.id,
        beatId: beat.id,
        line: lines.get(beat.id),
        message: `${glosses} copula definitions in one beat — define by use, not by apposition`,
      });
    }
  }
  return out;
}

/** A long beat with nothing happening and a frozen camera is a slide. */
function checkStaticBeats(script: TrailerScript, lines: Map<string, number>) {
  const out: Violation[] = [];
  script.beats.forEach((beat, i) => {
    const n = words(beat.text).length;
    const prev = script.beats[i - 1];
    const frozen =
      prev && JSON.stringify(prev.camera) === JSON.stringify(beat.camera);
    if (n > 40 && (beat.events ?? []).length === 0 && frozen) {
      out.push({
        check: "static-beat",
        severity: "warn",
        scriptId: script.id,
        beatId: beat.id,
        line: lines.get(beat.id),
        message: `${n} words, zero events, same camera rect as "${prev.id}" — nothing on screen changes for the whole beat`,
      });
    }
  });
  return out;
}

/** Reading a value aloud that this beat's own event already pops on a HUD chip. */
const NUMBER_WORDS = new Map<string, number>([
  ["zero", 0],
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
  ["eleven", 11],
  ["twelve", 12],
  ["fifteen", 15],
  ["twenty", 20],
  ["thirty", 30],
  ["forty", 40],
  ["fifty", 50],
  ["sixty", 60],
  ["seventy", 70],
  ["eighty", 80],
  ["ninety", 90],
  ["hundred", 100],
]);

function checkSpokenNumbers(script: TrailerScript, lines: Map<string, number>) {
  const out: Violation[] = [];
  for (const beat of script.beats) {
    const spoken = new Set<number>();
    for (const tok of normalizedTokens(beat.text)) {
      const n = NUMBER_WORDS.get(tok);
      if (n !== undefined) spoken.add(n);
      if (/^\d+$/.test(tok)) spoken.add(Number(tok));
    }
    const rendered: number[] = [];
    for (const event of beat.events ?? []) {
      if (event.type === "gains") {
        for (const v of [
          event.kP,
          event.kD,
          event.kI,
          event.kG,
          event.kS,
          event.kV,
        ]) {
          if (typeof v === "number") rendered.push(v);
        }
      }
      if (event.type === "target") rendered.push(Math.abs(event.deg));
      if (event.type === "rpm") rendered.push(event.value);
      if (event.type === "profile") {
        rendered.push(event.cruiseDegPerSec, event.accelDegPerSec2);
      }
    }
    const dupes = rendered.filter((v) => spoken.has(Math.abs(v)));
    if (dupes.length > 0) {
      out.push({
        check: "spoken-number",
        severity: "warn",
        scriptId: script.id,
        beatId: beat.id,
        line: lines.get(beat.id),
        message: `narrates ${[...new Set(dupes)].join(", ")}, which this beat's own event already renders on a HUD chip — drop the numeral, keep the judgement (but KEEP any word an anchor points at)`,
      });
    }
  }
  return out;
}

function checkCrossFileDuplicates(scripts: TrailerScript[], cfg: Config) {
  const seen = new Map<string, { scriptId: string; beatId: string }[]>();
  const allowed = new Set(
    cfg.allowDuplicateSentences.map((s) => normalizedTokens(s).join(" "))
  );
  for (const script of scripts) {
    for (const beat of script.beats) {
      for (const sentence of sentences(beat.text)) {
        const toks = normalizedTokens(sentence);
        if (toks.length < 4) continue;
        const key = toks.join(" ");
        if (allowed.has(key)) continue;
        const list = seen.get(key) ?? [];
        // Repetition inside one script is a refrain; across scripts it is padding.
        if (!list.some((e) => e.scriptId === script.id)) {
          list.push({ scriptId: script.id, beatId: beat.id });
        }
        seen.set(key, list);
      }
    }
  }
  const out: Violation[] = [];
  for (const [key, where] of seen) {
    if (where.length < 2) continue;
    out.push({
      check: "cross-file-duplicate",
      severity: "error",
      scriptId: where.map((w) => w.scriptId).join(" + "),
      message: `"${key}" appears verbatim in ${where.length} scripts (${where
        .map((w) => `${w.scriptId}:${w.beatId}`)
        .join(
          ", "
        )}) — a Lesson may reuse a teaching point but must reach it from a different angle. Deliberate refrain? add it to narration-style.json → allowDuplicateSentences.`,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) return DEFAULT_CONFIG;
  const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as Partial<Config>;
  return {
    ...DEFAULT_CONFIG,
    ...raw,
    baseline: raw.baseline ?? {},
    allowDuplicateSentences: raw.allowDuplicateSentences ?? [],
    budgets: { ...DEFAULT_CONFIG.budgets, ...raw.budgets },
    rhythm: { ...DEFAULT_CONFIG.rhythm, ...raw.rhythm },
  };
}

function main() {
  const args = process.argv.slice(2);
  const rewriteBaseline = args.includes("--baseline");
  const only = args.find((a) => !a.startsWith("--"));
  const cfg = loadConfig();

  const scripts = only ? TRAILERS.filter((s) => s.id === only) : TRAILERS;
  if (only && scripts.length === 0) {
    console.error(`No trailer with id "${only}".`);
    process.exit(1);
  }

  const violations: Violation[] = [];
  for (const script of scripts) {
    const lines = beatLines(script.id);
    violations.push(
      ...checkAnchors(script, lines),
      ...checkBanned(script, lines),
      ...checkBeatLength(script, lines, cfg),
      ...checkScreenEcho(script, lines),
      ...checkCta(script, lines),
      ...checkRhythm(script, cfg),
      ...checkTics(script, lines),
      ...checkStaticBeats(script, lines),
      ...checkSpokenNumbers(script, lines)
    );
  }
  // Cross-file comparison only makes sense over the whole corpus.
  if (!only) violations.push(...checkCrossFileDuplicates(scripts, cfg));

  const counts: Record<string, number> = {};
  for (const v of violations) counts[v.check] = (counts[v.check] ?? 0) + 1;

  if (rewriteBaseline) {
    if (only) {
      console.error(
        "--baseline must run over the whole corpus, not one script."
      );
      process.exit(1);
    }
    writeFileSync(
      CONFIG_PATH,
      JSON.stringify({ ...cfg, baseline: counts }, null, 2) + "\n",
      "utf8"
    );
    console.log("Recorded baseline:");
    for (const [check, n] of Object.entries(counts).sort()) {
      console.log(`  ${check}: ${n}`);
    }
    return;
  }

  // Report, grouped by check, worst first.
  const byCheck = new Map<string, Violation[]>();
  for (const v of violations) {
    byCheck.set(v.check, [...(byCheck.get(v.check) ?? []), v]);
  }
  const order = [...byCheck.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );

  for (const [check, list] of order) {
    const sev = list.some((v) => v.severity === "error") ? "ERROR" : "warn";
    const base = cfg.baseline[check];
    const budget = base === undefined ? "" : `  [baseline ${base}]`;
    console.log(`\n${sev}  ${check} — ${list.length}${budget}`);
    for (const v of list.slice(0, 12)) {
      const loc = v.beatId
        ? `videos/src/trailer/trailers/${v.scriptId}.ts${v.line ? `:${v.line}` : ""} (${v.beatId})`
        : v.scriptId;
      console.log(`  ${loc}\n    ${v.message}`);
    }
    if (list.length > 12) console.log(`  ... and ${list.length - 12} more`);
  }

  // Ratchet: fail only where a count exceeds its recorded baseline.
  const regressions = Object.entries(counts).filter(
    ([check, n]) => n > (cfg.baseline[check] ?? 0)
  );
  const newBaselineNeeded = only && regressions.length > 0;

  console.log("\n" + "-".repeat(68));
  for (const [check, n] of Object.entries(counts).sort()) {
    const base = cfg.baseline[check] ?? 0;
    const delta = n - base;
    const mark = delta > 0 ? "WORSE" : delta < 0 ? "better" : "same";
    console.log(
      `  ${check.padEnd(22)} ${String(n).padStart(4)}  (baseline ${base}, ${mark}${delta !== 0 ? ` ${delta > 0 ? "+" : ""}${delta}` : ""})`
    );
  }

  if (only) {
    console.log(
      "\nSingle-script mode: counts are not compared to the corpus baseline."
    );
    return;
  }
  if (regressions.length > 0 && !newBaselineNeeded) {
    console.log("\nFAIL — these checks got worse:");
    for (const [check, n] of regressions) {
      console.log(`  ${check}: ${n} > baseline ${cfg.baseline[check] ?? 0}`);
    }
    console.log(
      "\nFix them, or if the increase is deliberate, re-record with --baseline and explain why in the commit."
    );
    process.exit(1);
  }
  console.log("\nOK — nothing regressed against the baseline.");
}

main();
