/**
 * The prose linter.
 *
 * Enforces the mechanical subset of `context/lesson-budget.md`: the reading
 * budget, the ban on em dashes, sentence length, title and heading length, the
 * aside budget, and the list of constructions that read as machine-written.
 *
 * It parses each page with the TypeScript compiler rather than running regexes
 * over the source, for the same reason `generate-search-data.ts` does: a regex
 * cannot tell a sentence from a `className`, and half the "prose" it finds is
 * Tailwind. An AST walk knows which positions hold text a student reads.
 *
 * Run with `pnpm prose`. Flags:
 *
 *   --only=pid-control   check one page (a bare `pid-control` works too)
 *   --sentences          print every over-length sentence in full, for fixing
 *   --json               machine-readable output
 *
 * Exit code is non-zero when any page has a finding that is not advisory. A
 * page sitting between the 12-minute target and the 15-minute cap is advisory:
 * /pid-control is deliberately 15 because it carries a simulation and a quiz.
 *
 * The reading model charges for structure as well as words, because a lesson is
 * not a wall of prose: a numbered step is a round trip to the hardware, a
 * bullet is prose in list form, a code block is a diff against the student's
 * editor, and a quiz and a simulation are minutes nobody was counting. Getting
 * those weights wrong is how six pages came to claim "12 minutes" while
 * carrying fourteen.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import * as ts from "typescript-6";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PAGES_DIR = path.join(ROOT, "src/app/(workshop)");

/* ── the budget ───────────────────────────────────────────────────────── */

/**
 * Reading speed for a student who is following along on hardware, not
 * skimming. 180 words a minute is the low end of adult silent reading and the
 * right end for a 13-year-old reading something they have to act on.
 */
const WORDS_PER_MINUTE = 180;

/**
 * What a code block or a live GitHub embed costs. A student stops reading and
 * starts matching the snippet against their editor. 45 seconds is measured
 * from watching students do it, and it is generous for a four-line excerpt and
 * mean for a whole file.
 */
const MINUTES_PER_CODE_BLOCK = 0.75;

/**
 * What a numbered or bulleted step costs beyond its own words. A student does
 * not read "Open Configs and set SensorToMechanismRatio" at 180 words a
 * minute. They read it, go and do it, and come back. 15 seconds is the floor
 * for that round trip and it is why a five-step procedure is a bigger piece of
 * a lesson than the same words written as a paragraph.
 */
const MINUTES_PER_STEP = 0.25;

/**
 * What a bullet costs. Much less than a numbered step, and the distinction is
 * real: an `<ol>` says "go and do these in order" and each item is a round trip
 * to the hardware, while a `<ul>` is nearly always prose set as a list ("you
 * should see: this, this and this"). Charging both at 15 seconds priced a
 * four-item explanatory list on /ai-coding-assistant as a full minute of bench
 * work, and pushed the page up a minute for turning one sentence into the list
 * it always was.
 */
const MINUTES_PER_BULLET = 0.1;

/** A table is scanned row by row against the hardware, not read. */
const MINUTES_PER_TABLE = 0.5;

/**
 * An end-of-lesson quiz. Six questions with explanations is a real two minutes,
 * and it is the last thing a student does rather than something they skim.
 */
const MINUTES_PER_QUIZ = 2;

/**
 * An interactive simulation. A student drags a gain, watches the plot, and
 * drags it back. Nobody spends less than a couple of minutes in one, and the
 * whole point of putting it before the bench work is that they spend longer.
 */
const MINUTES_PER_PLAYGROUND = 2.5;

/** Target. Every lesson should land here. */
const TARGET_MINUTES = 12;

/** Hard cap. Over this and the lesson gets split, not tightened. */
const MAX_MINUTES = 15;

/**
 * Floor. A lesson under this is not concise, it is missing something: usually
 * what a good result looks like, and what to do when you don't get one.
 * Workshop 1 is where this bites, because it carries the whole course now and
 * several of its lessons were written as four-minute stubs.
 */
const MIN_MINUTES = 6;

const MAX_TITLE_WORDS = 5;
const MAX_HEADING_WORDS = 6;
const MAX_SENTENCE_WORDS = 25;
const MAX_SECTIONS = 6;
const MAX_ASIDES = 3;

/** `--sentences` prints every over-length sentence in full, for fixing them. */
const SHOW_SENTENCES = process.argv.includes("--sentences");

/* ── extraction, shared in spirit with generate-search-data.ts ────────── */

const TEXT_PROPS = new Set([
  "title",
  "outlineLabel",
  "lede",
  "description",
  "concept",
  "subtitle",
  "sectionTitle",
  "caption",
  "label",
  "term",
  "definition",
  "alt",
  "aria-label",
  "needs",
]);

/**
 * Not prose. `tag` is a mono micro-label ("WATCH OUT"), `branch` is a git ref,
 * `code` is Java. None of it is read as sentences, so none of it should be
 * counted against a reading budget or checked for sentence length.
 */
const SKIP_PROPS = new Set([
  "code",
  "filename",
  "filePath",
  "branch",
  "uses",
  "tag",
  "href",
  "src",
  "id",
  "className",
  "style",
  "variant",
]);

const SKIP_ELEMENTS = new Set([
  "Quiz",
  "ModelViewer",
  "ModelViewerRef",
  "MechanismPlayground",
  "InteractivePidPlayground",
  "InteractiveFlywheelPlayground",
  "InteractiveElevatorPlayground",
  "CodeBlock",
  "CodeBlockLive",
  "GitHubContent",
  "MechanismTabs",
  "iframe",
  "code",
  "pre",
]);

const ENTITIES: ReadonlyArray<[RegExp, string]> = [
  [/&quot;/g, '"'],
  [/&apos;/g, "'"],
  [/&rsquo;/g, "'"],
  [/&lsquo;/g, "'"],
  [/&ldquo;/g, '"'],
  [/&rdquo;/g, '"'],
  [/&amp;/g, "&"],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&nbsp;/g, " "],
  [/&mdash;/g, "—"],
  [/&ndash;/g, "–"],
  [/&hellip;/g, "…"],
];

function clean(text: string): string {
  let out = text;
  for (const [pattern, replacement] of ENTITIES)
    out = out.replace(pattern, replacement);
  return out.replace(/\s+/g, " ").trim();
}

function jsxTagName(node: ts.JsxElement | ts.JsxSelfClosingElement): string {
  const opening = ts.isJsxElement(node) ? node.openingElement : node;
  return opening.tagName.getText();
}

function jsxAttributes(
  node: ts.JsxElement | ts.JsxSelfClosingElement
): ts.JsxAttributes {
  return ts.isJsxElement(node)
    ? node.openingElement.attributes
    : node.attributes;
}

function stringAttr(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  name: string
): string | null {
  for (const attr of jsxAttributes(node).properties) {
    if (!ts.isJsxAttribute(attr) || attr.name.getText() !== name) continue;
    const value = attr.initializer;
    if (!value) return null;
    if (ts.isStringLiteral(value)) return value.text;
    if (
      ts.isJsxExpression(value) &&
      value.expression &&
      (ts.isStringLiteral(value.expression) ||
        ts.isNoSubstitutionTemplateLiteral(value.expression))
    ) {
      return value.expression.text;
    }
    return null;
  }
  return null;
}

interface Extracted {
  /** Every run of readable text, in source order. */
  prose: string[];
  /** The page title, from `PageTemplate`. */
  title: string | null;
  /** `<LessonSection>` headings. */
  headings: string[];
  /** The `time` prop on `PageTemplate`, as authored. */
  time: string | null;
  codeBlocks: number;
  asides: number;
  sections: number;
  /** `<li>` inside an `<ol>`, plus `FigureGrid` items: a thing to go and do. */
  steps: number;
  /** `<li>` inside a `<ul>`: prose set as a list, not a procedure. */
  bullets: number;
  tables: number;
  quizzes: number;
  playgrounds: number;
}

function extract(source: ts.SourceFile): Extracted {
  const out: Extracted = {
    prose: [],
    title: null,
    headings: [],
    time: null,
    codeBlocks: 0,
    asides: 0,
    sections: 0,
    steps: 0,
    bullets: 0,
    tables: 0,
    quizzes: 0,
    playgrounds: 0,
  };

  /**
   * A sentence does not end because the markup did.
   *
   * Text used to be pushed one JSX text node at a time, so
   * `Three jobs, once, when <code>Robot</code> builds the flywheel: …` arrived
   * as three separate runs of five, four and twelve words. Every sentence
   * containing an inline `<code>` therefore skipped the 25-word rule, which on
   * a robot-programming site is very nearly all of them: the rule was
   * under-enforcing across the whole course and a verifier caught it on
   * /vision-shooting.
   *
   * Text now accumulates into a buffer that flushes at block boundaries only.
   * Inline elements append to the run in progress; a skipped inline element
   * (`<code>` is both inline and in SKIP_ELEMENTS) drops its own contents but
   * leaves the sentence around it joined, which is what a reader sees.
   */
  const INLINE = new Set([
    "code",
    "strong",
    "em",
    "b",
    "i",
    "a",
    "span",
    "mark",
    "small",
    "sub",
    "sup",
    "abbr",
    "kbd",
    "GlossaryTerm",
    "Mark",
  ]);

  let buffer: string[] = [];
  /**
   * Depth of JSX nesting. Bare string literals only count as prose inside JSX.
   *
   * The joining pass made this necessary: with each literal pushed separately,
   * a module-scope `const cls = "flex min-h-11 …"` and an `import` specifier
   * were short junk runs that no rule ever tripped over. Joined, they became
   * one 27-word "sentence" of Tailwind classes and `@/components` paths on
   * /mechanism-cad. They were never prose; now they are excluded by position.
   */
  let jsxDepth = 0;
  /** Innermost enclosing list type, so an `<li>` can be priced by its parent. */
  const listStack: string[] = [];

  const flush = (): void => {
    if (buffer.length === 0) return;
    const value = clean(buffer.join(" "));
    buffer = [];
    if (value.length > 2 && !/^[/#]|^https?:/.test(value))
      out.prose.push(value);
  };

  const append = (text: string): void => {
    const value = clean(text);
    if (value) buffer.push(value);
  };

  /** A standalone run, e.g. a `lede` or `title` prop. Never joins its neighbours. */
  const push = (text: string): void => {
    flush();
    append(text);
    flush();
  };

  const visit = (node: ts.Node): void => {
    // An import specifier is a module path, not something a student reads.
    if (ts.isImportDeclaration(node)) return;

    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = jsxTagName(node);

      if (
        tag === "CodeBlock" ||
        tag === "CodeBlockLive" ||
        tag === "GitHubContent"
      ) {
        out.codeBlocks += 1;
      }
      if (tag === "MechanismTabs") out.codeBlocks += 2;
      if (tag === "Box") {
        const variant = stringAttr(node, "variant");
        if (variant && variant !== "concept") out.asides += 1;
      }
      if (tag === "WatchOut") out.asides += 1;
      if (tag === "ol" || tag === "ul") listStack.push(tag);
      if (tag === "li") {
        if (listStack[listStack.length - 1] === "ul") out.bullets += 1;
        else out.steps += 1;
      }
      if (tag === "table") out.tables += 1;
      // A quiz and a simulation are minutes of a student's lesson, and both
      // were invisible to the budget because they are in SKIP_ELEMENTS (their
      // text is distractors and control labels, not prose). Counting them is
      // what stops "restore the Check yourself" from silently pushing a page
      // to 16 minutes while the linter still reports 12.
      if (tag === "Quiz") out.quizzes += 1;
      if (
        tag === "MechanismPlayground" ||
        tag === "InteractivePidPlayground" ||
        tag === "InteractiveFlywheelPlayground" ||
        tag === "InteractiveElevatorPlayground"
      ) {
        out.playgrounds += 1;
      }
      // A FigureGrid column is a step's worth of scanning too, and its items
      // are a prop array rather than markup, so `li` never sees them.
      if (tag === "FigureGrid" || tag === "ComparisonTable") {
        for (const attr of jsxAttributes(node).properties) {
          if (!ts.isJsxAttribute(attr) || attr.name.getText() !== "items")
            continue;
          const value = attr.initializer;
          if (
            value &&
            ts.isJsxExpression(value) &&
            value.expression &&
            ts.isArrayLiteralExpression(value.expression)
          ) {
            out.steps += value.expression.elements.length;
          }
        }
      }

      if (tag === "PageTemplate") {
        const title = stringAttr(node, "title");
        if (title) out.title = title;
        const time = stringAttr(node, "time");
        if (time) out.time = time;
      }

      if (tag === "LessonSection") {
        out.sections += 1;
        const heading =
          stringAttr(node, "outlineLabel") ?? stringAttr(node, "title");
        if (heading) out.headings.push(heading);
      }

      const inline = INLINE.has(tag);

      if (SKIP_ELEMENTS.has(tag)) {
        // An inline `<code>` is part of the sentence a student reads, so drop
        // its subtree but keep its own text in the run. Dropping it outright
        // left `<code>DriveRequestType.OpenLoopVoltage</code> means no wheel
        // PID underneath yours.` as the orphan fragment "means no wheel PID
        // underneath yours.", which then welded onto the previous sentence and
        // reported as one 27-word false positive. An identifier has no spaces,
        // so it counts as the single word it reads as.
        if (inline && ts.isJsxElement(node)) {
          const own = node.children
            .filter((c) => ts.isJsxText(c))
            .map((c) => (c as ts.JsxText).text)
            .join(" ");
          append(own);
          return;
        }
        if (!inline) flush();
        return;
      }

      if (!inline) flush();

      for (const attr of jsxAttributes(node).properties) {
        if (!ts.isJsxAttribute(attr)) continue;
        const name = attr.name.getText();
        if (SKIP_PROPS.has(name)) continue;
        if (!TEXT_PROPS.has(name)) continue;
        const value = attr.initializer;
        if (!value) continue;
        if (ts.isStringLiteral(value)) push(value.text);
        else if (ts.isJsxExpression(value) && value.expression) {
          flush();
          // `needs={[…]}` and `description={[…]}` hold one run per element, so
          // flush between them. Without this the four `needs` bullets join into
          // a single 60-word "sentence" that no reader ever sees.
          if (ts.isArrayLiteralExpression(value.expression)) {
            for (const element of value.expression.elements) {
              visit(element);
              flush();
            }
          } else {
            visit(value.expression);
          }
          flush();
        }
      }

      if (ts.isJsxElement(node)) {
        jsxDepth += 1;
        node.children.forEach(visit);
        jsxDepth -= 1;
      }
      if (tag === "ol" || tag === "ul") listStack.pop();
      if (!inline) flush();
      return;
    }

    if (ts.isJsxText(node)) {
      append(node.text);
      return;
    }
    if (ts.isJsxExpression(node)) {
      if (node.expression) visit(node.expression);
      return;
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (jsxDepth === 0) return;
      // `append`, not `push`. Prettier emits `{" "}` as the glue between a
      // word and an inline element on the next line, and every one of those
      // reached `push`, which flushes first: the buffer was being cut at the
      // exact points the joining was added to bridge.
      append(node.text);
      return;
    }
    node.forEachChild(visit);
  };

  // Only walk the default export's JSX. Module-scope const tables (SPONSORS,
  // ROADMAP) are reached through it anyway when they are rendered.
  visit(source);
  flush();
  return out;
}

/* ── the rules ────────────────────────────────────────────────────────── */

/**
 * Constructions that read as machine-written. Every one of these was on the
 * site before the rewrite; the notes say where the habit came from.
 */
const BANNED: ReadonlyArray<{ pattern: RegExp; note: string }> = [
  { pattern: /—/g, note: "em dash: end the sentence or use a colon" },
  { pattern: /–/g, note: "en dash: write 'to' for a range" },
  {
    pattern:
      /\bis ?n[o']t (just |only |merely )?(about )?\w+[,.] it(?:'s| is)\b/gi,
    note: "the reversal: say the thing you mean once",
  },
  {
    pattern: /\bnot (just|only|merely) \w+ but\b/gi,
    note: "the reversal: say the thing you mean once",
  },
  {
    pattern: /\bwhich is (the whole|exactly|precisely|why)\b/gi,
    note: "the significance close",
  },
  {
    pattern: /\band that(?:'s| is) (what|the) (makes|whole|reason)\b/gi,
    note: "the significance close",
  },
  {
    pattern: /\bthe whole (reason|point|idea)\b/gi,
    note: "the significance close",
  },
  { pattern: /\bhere(?:'s| is) the thing\b/gi, note: "the knowing aside" },
  { pattern: /\bthink of (it|this) as\b/gi, note: "the knowing aside" },
  { pattern: /\bunder the hood\b/gi, note: "the knowing aside" },
  { pattern: /\bit turns out\b/gi, note: "the knowing aside" },
  { pattern: /\bthe trick is\b/gi, note: "the knowing aside" },
  { pattern: /\bthis is where it gets\b/gi, note: "manufactured suspense" },
  {
    pattern: /\byou(?:'ll| will) want to\b/gi,
    note: "hedged instruction: give the instruction",
  },
  { pattern: /\bsimply\b/gi, note: "filler adverb" },
  // Added after the Workshop 1 pass: a verifier caught "a frame that can
  // actually drive" surviving a clean lint run, because the spec bans these in
  // prose and the linter only knew about half of them.
  { pattern: /\bactually\b/gi, note: "filler adverb" },
  { pattern: /\bessentially\b/gi, note: "filler adverb" },
  { pattern: /\bjust really\b|\breally just\b/gi, note: "filler adverb" },
  { pattern: /\bseamlessl(y|ess)\b/gi, note: "filler" },
  {
    pattern: /\b(powerful|robust|elegant|comprehensive)\b/gi,
    note: "overselling",
  },
  { pattern: /\b(leverage|utilize)\b/gi, note: "say use" },
  { pattern: /\bdeep dive\b/gi, note: "filler" },
  { pattern: /\bbasically\b/gi, note: "filler adverb" },
  { pattern: /\bat the end of the day\b/gi, note: "filler" },

  /* ── unslop ──────────────────────────────────────────────────────────
   *
   * `.claude/skills/unslop/SKILL.md` replaced the voice half of the old
   * style guide in August 2026. Everything below is the mechanically
   * checkable subset of it. The judgement calls it also makes (say what a
   * thing does rather than how it feels, one idea per sentence, name the
   * actor) are not regex-shaped and stay a human job.
   *
   * What is deliberately NOT here, because this is a robotics site and the
   * plain reading of the word is the real one: `flywheel` is a shooter
   * wheel and appears 193 times, `surface` is the carpet you compete on,
   * `vector` and `primitive` are maths and Java, and a `harness` is a
   * bundle of wires. Banning those would train everyone to ignore the
   * linter. */

  // unslop 19. Straight quotes only. The codebase writes `&quot;`.
  { pattern: /[‘’“”]/g, note: "curly quote: use &quot;" },

  // unslop 7. AI vocabulary.
  {
    pattern:
      /\b(additionally|crucial|delve|enduring|garner|interplay|intricate|pivotal|showcase|testament|tapestry)\b/gi,
    note: "AI vocabulary: use the plain word",
  },
  // `underscore` is a character on a keyboard and `landscape` is an image
  // orientation, so both are banned only in their abstract use.
  {
    pattern: /\bunderscor(es|ed|ing) (the|how|why|that|a)\b/gi,
    note: "AI vocabulary: say what it shows",
  },
  {
    pattern: /\b(evolving|changing|shifting) landscape\b|\blandscape of\b/gi,
    note: "AI vocabulary: abstract landscape",
  },

  // unslop 8. Fancy ways to say "is".
  {
    pattern: /\b(serves as|stands as|boasts)\b/gi,
    note: "fancy 'is': say is or has",
  },

  // unslop 4. Promotional language.
  {
    pattern:
      /\b(nestled|breathtaking|groundbreaking|renowned|stunning|must-visit|vibrant)\b/gi,
    note: "promotional: describe it neutrally",
  },

  // unslop 1. Puffery.
  {
    pattern:
      /\b(pivotal moment|testament to|setting the stage for|indelible mark|deeply rooted)\b/gi,
    note: "puffery: state what happened",
  },

  // unslop 5. Vague attributions.
  {
    pattern:
      /\b(experts (believe|say|agree)|industry reports suggest|some critics argue|studies show)\b/gi,
    note: "vague attribution: name the source or cut it",
  },

  // unslop 23 and 31. Filler and the fancier synonym.
  {
    pattern:
      /\b(in order to|due to the fact that|it is important to note|it'?s worth noting|when it comes to|a wide (range|variety) of|in the event that)\b/gi,
    note: "filler: cut it or use the short form",
  },
  {
    pattern: /\b(facilitate|numerous|myriad|plethora)\b/gi,
    note: "say help, many",
  },

  // unslop 24. Stacked hedges.
  {
    pattern: /\b(could potentially|might possibly|may potentially)\b/gi,
    note: "stacked hedge: pick one",
  },

  // unslop 26. Abstract metaphor nouns that have a plainer concrete word.
  {
    pattern:
      /\b(substrate|nexus|bedrock|north star|gold-plating|paradigm|modality)\b/gi,
    note: "metaphor noun: pick the concrete word",
  },

  // unslop 20. Chatbot artifacts. These have never appeared on the site and
  // are here so that a page pasted out of a chat window fails the build.
  {
    pattern:
      /\b(i hope this helps|let me know if|great question|you'?re absolutely right)\b/gi,
    note: "chatbot phrasing",
  },

  // unslop 29. Active voice. Scoped to the one form that is never ambiguous:
  // a participle with its actor named right there in a `by` phrase. The
  // looser "is measured from" shape is left alone on purpose, because most
  // of those are correct ("the command is canceled" is how the scheduler
  // docs put it) and a rule that cries wolf fifty times gets switched off.
  {
    pattern: /\b(is|are|was|were|been|being) [a-z]+(ed|en|wn) by\b/gi,
    note: "passive with a named actor: put the actor first",
  },
];

/**
 * Answer-key patterning.
 *
 * A verifier found `/swerve-calibration` shipping `correctAnswer: 1` on all
 * five questions, and an audit then found ten more quizzes doing the same: a
 * student scores 100% by always picking option b, having read nothing. Option
 * d was used in four quizzes on the whole site, so the fourth option was
 * decoration.
 *
 * This reads the raw source rather than the AST because the indices sit in an
 * object literal inside a prop array, and `Quiz` is in `SKIP_ELEMENTS` so the
 * prose walk never descends into it.
 */
function quizAnswerFindings(source: string): Finding[] {
  if (!source.includes("<Quiz")) return [];
  const answers = [...source.matchAll(/correctAnswer:\s*(\d+)/g)].map((m) =>
    Number(m[1])
  );
  if (answers.length < 3) return [];

  const counts = [0, 0, 0, 0];
  for (const a of answers) if (a >= 0 && a < 4) counts[a] += 1;
  const distinct = counts.filter((c) => c > 0).length;
  const share = Math.max(...counts) / answers.length;
  const out: Finding[] = [];

  if (share >= 0.6) {
    const which = "abcd"[counts.indexOf(Math.max(...counts))];
    out.push({
      rule: "quiz",
      detail: `${Math.round(share * 100)}% of answers are option ${which} (${answers.join(", ")}). Shuffle the options so the key is not guessable.`,
    });
  } else if (distinct <= 2) {
    out.push({
      rule: "quiz",
      detail: `answers only ever use ${distinct} of the four options (${answers.join(", ")}). The unused options read as filler.`,
    });
  }
  return out;
}

/**
 * Banned constructions inside a `<Quiz>`.
 *
 * `Quiz` is in `SKIP_ELEMENTS`, so until this existed every question, option
 * and explanation on the site was unlinted prose a student reads. That is
 * roughly 6,000 words, and it is where the tells went to hide: the August
 * 2026 unslop pass found "simply" in a Motion Magic explanation and a
 * significance close in a Command Framework one, both of which had survived
 * every previous clean run of this linter.
 *
 * The words are deliberately not added to the reading budget: a quiz already
 * costs a flat `MINUTES_PER_QUIZ`, and counting its prose too would charge
 * for it twice.
 */
function quizProseFindings(source: ts.SourceFile): Finding[] {
  // Every string literal inside a `<Quiz>`, which is its questions, its
  // options and its explanations: all of it prose a student reads.
  //
  // This walks the AST rather than pairing quotes with a regex, for the
  // reason at the top of this file. Two regex attempts got it wrong first.
  // One used `[^"]`, which matches a line break, so it ran from a quote on
  // one line to a quote thirty lines below and swallowed the JSDoc comments
  // in between, reporting tells in files whose quizzes contain none. The
  // second fixed that and still mispaired, because a short option like
  // `"a"` or `"Raise kD"` fell under the length filter and flipped the
  // quote parity for every string after it, so explanations were read as
  // the gaps between strings instead of as strings.
  const parts: string[] = [];

  const collect = (node: ts.Node): void => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      // Short strings are ids, keys and one-word options, not prose.
      if (node.text.length >= 24) parts.push(node.text);
    }
    ts.forEachChild(node, collect);
  };

  const findQuiz = (node: ts.Node): void => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (jsxTagName(node) === "Quiz") {
        ts.forEachChild(node, collect);
        return;
      }
    }
    ts.forEachChild(node, findQuiz);
  };

  findQuiz(source);
  const text = parts.join("\n");
  if (!text) return [];

  const out: Finding[] = [];
  for (const { pattern, note } of BANNED) {
    const hits = [...text.matchAll(pattern)];
    if (hits.length === 0) continue;
    const sample = [...new Set(hits.map((h) => h[0]))].slice(0, 3).join(", ");
    out.push({
      rule: "quiz-prose",
      detail: `${hits.length}× ${note} (${sample})`,
    });
  }
  return out;
}

/** Split a run of prose into sentences, roughly. Good enough to find the long ones. */
function sentences(text: string): string[] {
  return (
    text
      // The closing-quote and closing-paren cases are load-bearing. A sentence
      // ending `a running answer to "where am I."` puts the quote after the
      // period, so a bare `(?<=[.!?])` lookbehind saw `"` and refused to split,
      // welding two sentences into one 48-word false positive.
      // A sentence here often opens on an identifier, because `<code>` text is
      // now part of the run: "…7.5 volts. kS and kP are zero", "…in front of
      // it. runRepeatedly(...) hands back". Both were welded onto the previous
      // sentence and reported as one long false positive.
      //
      // So allow a lowercase start when the token reads as code: it contains an
      // interior capital (`kS`, `runRepeatedly`) or opens a call (`wait(`).
      // Ordinary lowercase prose still does not split, which keeps "e.g. foo"
      // and "vs. the" whole.
      // `.` and `@` in the lookahead are for sentences that open on a chained
      // method or an annotation: ".named(...) belongs to the builder",
      // "@Autonomous names the mode". Both are ordinary sentence openers on this
      // site and neither was splitting, so each welded onto its predecessor and
      // reported as one long false positive.
      // `[a-z]\w*\.` is the last of these: a sentence opening on a dotted
      // lowercase token, like "this. means the field on this object" or
      // "arm.runFast() is a hold". An agent hit it on /drive-to-point and
      // reworded the prose to dodge it, which is the wrong place for the fix.
      .split(/(?<=[.!?]["'”’)\]]?)\s+(?=[A-Z(.@]|[a-z]\w*[A-Z]|[a-z]\w*[(.])/)
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w)).length;
}

interface Finding {
  rule: string;
  detail: string;
  /**
   * Advisory. Printed, but does not fail the run. Sitting between the 12 min
   * target and the 15 min cap is information, not a defect: /pid-control is
   * deliberately 15 because it carries a simulation and a quiz, and a lesson
   * like that should not fail CI for being what it is.
   */
  soft?: boolean;
}

interface PageReport {
  route: string;
  file: string;
  words: number;
  codeBlocks: number;
  sections: number;
  asides: number;
  steps: number;
  minutes: number;
  findings: Finding[];
}

function checkPage(route: string, file: string): PageReport {
  const raw = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(
    file,
    raw,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const x = extract(source);
  const text = x.prose.join(" ");
  const words = wordCount(text);
  const minutes =
    Math.round(
      (words / WORDS_PER_MINUTE +
        x.codeBlocks * MINUTES_PER_CODE_BLOCK +
        x.steps * MINUTES_PER_STEP +
        x.bullets * MINUTES_PER_BULLET +
        x.tables * MINUTES_PER_TABLE +
        x.quizzes * MINUTES_PER_QUIZ +
        x.playgrounds * MINUTES_PER_PLAYGROUND) *
        10
    ) / 10;

  const findings: Finding[] = [
    ...quizAnswerFindings(raw),
    ...quizProseFindings(source),
  ];

  if (minutes > MAX_MINUTES) {
    findings.push({
      rule: "budget",
      detail: `${minutes} min, over the ${MAX_MINUTES} min cap. Cut a section or split the lesson.`,
    });
  } else if (minutes > TARGET_MINUTES) {
    findings.push({
      rule: "budget",
      detail: `${minutes} min, over the ${TARGET_MINUTES} min target.`,
      soft: true,
    });
  } else if (minutes < MIN_MINUTES) {
    findings.push({
      rule: "thin",
      detail: `${minutes} min, under the ${MIN_MINUTES} min floor. Add the check, the failure modes, and what a good result looks like.`,
    });
  }

  if (x.title && wordCount(x.title) > MAX_TITLE_WORDS) {
    findings.push({
      rule: "title",
      detail: `"${x.title}" is ${wordCount(x.title)} words. A title is a name, ${MAX_TITLE_WORDS} words or fewer.`,
    });
  }

  for (const heading of x.headings) {
    if (wordCount(heading) > MAX_HEADING_WORDS) {
      findings.push({
        rule: "heading",
        detail: `"${heading}" is ${wordCount(heading)} words. ${MAX_HEADING_WORDS} or fewer.`,
      });
    }
    // A heading is a name or a bare imperative, never a claim. A copula or a
    // modal is what turns it into one: "The hardware is required", "This will
    // not compile". Both fit inside the word cap, so length alone let them
    // through the Workshop 1 pass. "Fix the units first" and "Three failure
    // shapes" have no finite verb and are unaffected.
    // Case-sensitive on purpose. The `i` flag made "Assign every CAN ID" fail
    // on the CAN bus, because `CAN` matched the modal `can`. Headings are
    // sentence case here, so a finite verb inside one is always lowercase; the
    // second test catches a heading that opens on one ("Is the arm level?").
    const FINITE =
      "is|are|was|were|isn't|aren't|can|will|should|must|does|do|has|have";
    if (
      new RegExp(`\\b(${FINITE})\\b`).test(heading) ||
      new RegExp(`^(${FINITE})\\b`, "i").test(heading)
    ) {
      findings.push({
        rule: "heading",
        detail: `"${heading}" reads as a sentence. A heading names the thing: noun phrase or bare imperative.`,
      });
    }
  }

  if (x.sections > MAX_SECTIONS) {
    findings.push({
      rule: "sections",
      detail: `${x.sections} sections. More than ${MAX_SECTIONS} is two lessons.`,
    });
  }

  if (x.asides > MAX_ASIDES) {
    findings.push({
      rule: "asides",
      detail: `${x.asides} asides. ${MAX_ASIDES} at the most, or none of them read as warnings.`,
    });
  }

  // The stated time may exceed the measured one, and often should: `time` is
  // wall-clock for the whole lesson, and /autonomous honestly needs 30 minutes
  // at a bench to run a routine whose page reads in six. What it may never do
  // is come in UNDER the measured content, which is what happened when the
  // model learned to charge for quizzes and steps and six pages went on saying
  // "12 minutes" while carrying fourteen. Under-promising is the only
  // direction that lies to a student deciding whether to start.
  if (x.time) {
    const stated = [...x.time.matchAll(/(\d+)/g)].map((m) => Number(m[1]));
    const largest = stated.length ? Math.max(...stated) : null;
    if (largest !== null && largest < minutes - 1) {
      findings.push({
        rule: "time",
        detail: `says "${x.time}" but the content measures ${minutes} min. A lesson may take longer than it reads, never less.`,
      });
    }
  }

  for (const { pattern, note } of BANNED) {
    const hits = [...text.matchAll(pattern)];
    if (hits.length === 0) continue;
    const sample = [...new Set(hits.map((h) => h[0]))].slice(0, 3).join(", ");
    findings.push({
      rule: "banned",
      detail: `${hits.length}× ${note} (${sample})`,
    });
  }

  const long = x.prose
    .flatMap(sentences)
    .filter((s) => wordCount(s) > MAX_SENTENCE_WORDS);
  if (long.length > 0) {
    findings.push({
      rule: "sentence",
      detail: SHOW_SENTENCES
        ? `${long.length} over ${MAX_SENTENCE_WORDS} words:\n` +
          long.map((s) => `             [${wordCount(s)}] ${s}`).join("\n")
        : `${long.length} over ${MAX_SENTENCE_WORDS} words. First: "${long[0]!.slice(0, 90)}…"`,
    });
  }

  return {
    route,
    file,
    words,
    codeBlocks: x.codeBlocks,
    sections: x.sections,
    asides: x.asides,
    steps: x.steps,
    minutes,
    findings,
  };
}

/* ── discovery and output ─────────────────────────────────────────────── */

function findPages(dir: string, route = ""): { route: string; file: string }[] {
  const found: { route: string; file: string }[] = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const next = path.join(dir, item.name);
    if (item.isDirectory()) {
      found.push(
        ...findPages(next, route ? `${route}/${item.name}` : item.name)
      );
    } else if (item.name === "page.tsx") {
      const stripped = route.replace(/\([^)]+\)\/?/g, "");
      found.push({
        route: `/${stripped}`.replace(/\/$/, "") || "/",
        file: next,
      });
    }
  }
  return found;
}

/** Utility routes with no teaching prose to budget. */
const NOT_LESSONS = new Set(["/", "/search", "/privacy", "/video"]);

const args = process.argv.slice(2);
const asJson = args.includes("--json");

/**
 * Route filter. Both `--only=pid-control` and a bare `pid-control` work, and
 * a leading slash is optional on purpose: Git Bash on Windows rewrites a bare
 * `/pid-control` argument into `C:/Program Files/Git/pid-control` before the
 * process ever sees it, so requiring the slash made the filter silently match
 * nothing and lint the whole site instead.
 */
const only = args
  .filter((a) => a !== "--json" && a !== "--sentences")
  .map((a) => a.replace(/^--only=/, ""))
  .map((a) => a.replace(/^.*[/\\]/, ""))
  .filter(Boolean)
  .map((a) => `/${a}`);

const pages = findPages(PAGES_DIR)
  .filter((p) =>
    only.length > 0 ? only.includes(p.route) : !NOT_LESSONS.has(p.route)
  )
  .sort((a, b) => a.route.localeCompare(b.route));

const reports = pages.map((p) => checkPage(p.route, p.file));

if (asJson) {
  console.log(JSON.stringify(reports, null, 2));
} else {
  const bad = reports.filter((r) => r.findings.length > 0);
  const failing = reports.filter((r) => r.findings.some((f) => !f.soft));
  const over = reports.filter((r) => r.minutes > MAX_MINUTES);

  const pad = (s: string, n: number) => s.padEnd(n);
  console.log(
    `\n${pad("route", 28)}${"min".padStart(6)}${"words".padStart(7)}${"code".padStart(6)}${"step".padStart(6)}${"sec".padStart(5)}${"aside".padStart(7)}  issues`
  );
  console.log("─".repeat(78));
  for (const r of [...reports].sort((a, b) => b.minutes - a.minutes)) {
    const flag =
      r.minutes > MAX_MINUTES ? "!" : r.minutes > TARGET_MINUTES ? "·" : " ";
    console.log(
      `${flag}${pad(r.route, 27)}${String(r.minutes).padStart(6)}${String(r.words).padStart(7)}${String(r.codeBlocks).padStart(6)}${String(r.steps).padStart(6)}${String(r.sections).padStart(5)}${String(r.asides).padStart(7)}  ${r.findings.length || ""}`
    );
  }

  for (const r of bad) {
    console.log(`\n${r.route}`);
    for (const f of r.findings)
      console.log(
        `  ${pad(f.rule, 10)}${f.soft ? " (advisory)" : ""} ${f.detail}`
      );
  }

  const totalWords = reports.reduce((a, b) => a + b.words, 0);
  const avg =
    Math.round(
      (reports.reduce((a, b) => a + b.minutes, 0) / reports.length) * 10
    ) / 10;
  console.log(
    `\n${reports.length} pages · ${totalWords.toLocaleString()} words · ${avg} min average · ${over.length} over the ${MAX_MINUTES} min cap`
  );
}

process.exit(reports.some((r) => r.findings.some((f) => !f.soft)) ? 1 : 0);
