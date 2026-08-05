/**
 * Builds the site search index.
 *
 * Run by `pnpm generate-search`, and by `pnpm build` before `next build`.
 * Output is `public/search-index.json` — a serialized MiniSearch index the
 * browser fetches once and hands straight to `MiniSearch.loadJSON`. Nothing
 * about search lives in the JS bundle any more.
 *
 * Two things make this different from the regex scraper it replaced:
 *
 * 1. It parses each page with the TypeScript compiler instead of running
 *    regexes over the source. Regexes could not tell a sentence from a
 *    `className`, so the old index contained CSS fragments, anchor slugs, and
 *    every wrong answer in every `<Quiz>`. An AST walk knows which positions
 *    hold prose, so junk is excluded by construction rather than by filter.
 *
 * 2. It emits one document per `<LessonSection>` rather than one per page.
 *    The site has 29 lessons but well over 200 sections, each with a stable
 *    `id` that is already a scroll anchor. Indexing at that grain is what lets
 *    a result link to `/motion-magic#picking-a-cruise-velocity` instead of
 *    dropping the reader at the top of a 20,000-character page.
 *
 * All lesson metadata is read from `src/data/lessons.ts`. There is no second
 * copy of the lesson list here — the old `routeMap` had already drifted from
 * it (`/ai-coding-assistant` filed under the wrong group, `/video` titled
 * "video"), so `assertRoutesMatchLessons` below now fails the build on drift
 * rather than letting it ship.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

import type { Route } from "next";
import MiniSearch from "minisearch";
import * as ts from "typescript-6";

import {
  LESSONS,
  SECTIONS,
  getLessonNumber,
  getSectionOf,
} from "../src/data/lessons";
import { searchIndexOptions, type SearchDoc } from "../src/lib/searchSchema";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_DIR = path.join(ROOT, "src", "app");
const OUT_FILE = path.join(ROOT, "public", "search-index.json");

/* ── what counts as text ──────────────────────────────────────────────── */

/**
 * Props whose value is prose meant for a reader. Anything not on this list is
 * ignored, which is the whole trick: `className`, `style`, `variant`, `id`,
 * `href` and the entire SVG geometry vocabulary need no exclusion rule
 * because they were never eligible in the first place.
 */
const TEXT_PROPS = new Set([
  "title",
  "outlineLabel",
  "lede",
  "emphasis",
  "description",
  "concept",
  "subtitle",
  "sectionTitle",
  "caption",
  "label",
  "term",
  "definition",
  "tag",
  "alt",
  "aria-label",
  "time",
  "needs",
]);

/**
 * Props holding identifiers rather than prose — Java symbols, file names,
 * branch names. Indexed into the low-boost `code` field so that searching
 * `MotionMagicVoltage` or `4-MotionMagic` works without letting a symbol that
 * appears in a dozen snippets outrank the section that teaches the concept.
 */
const CODE_PROPS = new Set(["code", "filename", "filePath", "branch", "uses"]);

/**
 * Subtrees dropped whole.
 *
 * `Quiz` is the important one. Its `questions` prop carries every distractor
 * and every answer explanation, so the old index let a student search a
 * deliberately wrong answer and get a hit on it.
 *
 * The rest are interactive canvases and 3D viewers with no readable content.
 */
const SKIP_ELEMENTS = new Set([
  "Quiz",
  "ModelViewer",
  "ModelViewerRef",
  "WaypointPlanner",
  "MechanismPlayground",
  "InteractivePidPlayground",
  "InteractiveFlywheelPlayground",
  "InteractiveElevatorPlayground",
  "iframe",
]);

/** Decoded entities. JSX text keeps them raw; a search index should not. */
const ENTITIES: ReadonlyArray<[RegExp, string]> = [
  [/&quot;/g, '"'],
  [/&apos;/g, "'"],
  [/&amp;/g, "&"],
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&nbsp;/g, " "],
  [/&mdash;/g, "—"],
  [/&ndash;/g, "–"],
  [/&hellip;/g, "…"],
  [/&rarr;/g, "→"],
  [/&deg;/g, "°"],
  [/&times;/g, "×"],
];

function clean(text: string): string {
  let out = text;
  for (const [pattern, replacement] of ENTITIES) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s+/g, " ").trim();
}

/* ── routes that are not lessons ──────────────────────────────────────── */

interface ExtraRoute {
  title: string;
  section: string;
  /** Used as content when the page renders entirely from a component. */
  blurb?: string;
}

const EXTRA_ROUTES: Record<string, ExtraRoute> = {
  "/": {
    title: "Gray Matter Coding Workshop",
    section: "Home",
  },
  "/privacy": {
    title: "Privacy Policy",
    section: "Reference",
  },
  "/video": {
    title: "Workshop Trailers",
    section: "Reference",
  },
  "/planner": {
    title: "Waypoint Planner",
    section: "Reference",
    blurb:
      "Plot field waypoints and read off the poses to paste into an autonomous routine. Interactive tool, no lesson attached.",
  },
};

/** `/search` returning itself as a result helps nobody. */
const EXCLUDED_ROUTES = new Set(["/search"]);

/* ── the extractor ────────────────────────────────────────────────────── */

interface Chunk {
  anchor: string;
  heading: string;
  prose: string[];
  code: string[];
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

/** Literal value of an attribute, when it is a plain string. */
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

/** Flatten an attribute's value to plain text, following nested JSX. */
function attrText(attr: ts.JsxAttribute): string {
  const value = attr.initializer;
  if (!value) return "";
  if (ts.isStringLiteral(value)) return value.text;
  if (!ts.isJsxExpression(value) || !value.expression) return "";
  return literalTextOf(value.expression);
}

/**
 * Every string literal and JSX text node reachable from an expression, in
 * source order. Identifiers, property names and numbers are skipped — only
 * things that were authored as readable text come back.
 */
function literalTextOf(node: ts.Node): string {
  const parts: string[] = [];

  const walk = (current: ts.Node): void => {
    if (
      (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) &&
      SKIP_ELEMENTS.has(jsxTagName(current))
    ) {
      return;
    }
    if (ts.isJsxText(current)) {
      parts.push(current.text);
      return;
    }
    if (
      ts.isStringLiteral(current) ||
      ts.isNoSubstitutionTemplateLiteral(current)
    ) {
      parts.push(current.text);
      return;
    }
    // Skip attributes wholesale here: an attribute reached from inside an
    // expression is still a `className` or a `style` most of the time, and
    // the ones that carry prose are handled by the main walk.
    if (ts.isJsxAttributes(current)) {
      for (const attr of current.properties) {
        if (ts.isJsxAttribute(attr) && TEXT_PROPS.has(attr.name.getText())) {
          parts.push(attrText(attr));
        }
      }
      return;
    }
    current.forEachChild(walk);
  };

  walk(node);
  return clean(parts.join(" "));
}

/**
 * Walk one page into chunks. The first chunk is the page opening — the
 * `PageTemplate` title, lede and prerequisites, which is real teaching text
 * and belongs in the index even though it sits above any section.
 */
function extractChunks(source: ts.SourceFile): Chunk[] {
  const intro: Chunk = { anchor: "", heading: "", prose: [], code: [] };
  const chunks: Chunk[] = [intro];

  const visit = (node: ts.Node, sink: Chunk): void => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = jsxTagName(node);

      if (SKIP_ELEMENTS.has(tag)) return;

      // An <svg> has no readable children, but its aria-label is written for
      // a screen reader and describes the figure in full sentences.
      if (tag === "svg") {
        const label = stringAttr(node, "aria-label");
        if (label) sink.prose.push(clean(label));
        return;
      }

      // A new section starts a new document.
      if (tag === "LessonSection" && ts.isJsxElement(node)) {
        const anchor = stringAttr(node, "id");
        if (anchor) {
          const heading =
            stringAttr(node, "outlineLabel") ??
            literalTextOf(node.openingElement.attributes);
          const chunk: Chunk = { anchor, heading, prose: [], code: [] };
          chunks.push(chunk);
          node.children.forEach((child) => visit(child, chunk));
          return;
        }
      }

      for (const attr of jsxAttributes(node).properties) {
        if (!ts.isJsxAttribute(attr)) continue;
        const name = attr.name.getText();
        if (CODE_PROPS.has(name)) {
          const value = attrText(attr);
          if (value) sink.code.push(value);
        } else if (TEXT_PROPS.has(name)) {
          const value = attrText(attr);
          if (value) sink.prose.push(value);
        }
      }

      if (ts.isJsxElement(node)) {
        node.children.forEach((child) => visit(child, sink));
      }
      return;
    }

    if (ts.isJsxText(node)) {
      const text = clean(node.text);
      if (text) sink.prose.push(text);
      return;
    }

    if (ts.isJsxExpression(node)) {
      if (node.expression) visit(node.expression, sink);
      return;
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const text = clean(node.text);
      // Bare literals inside expressions are usually punctuation glue that
      // Prettier inserted ({" "}), or a URL. Neither is worth indexing.
      if (text.length > 2 && !/^[/#]|^https?:/.test(text)) {
        sink.prose.push(text);
      }
      return;
    }

    node.forEachChild((child) => visit(child, sink));
  };

  visit(source, intro);
  return chunks;
}

/* ── page discovery ───────────────────────────────────────────────────── */

interface PageFile {
  route: string;
  filePath: string;
}

function findPages(dir: string, route = ""): PageFile[] {
  const found: PageFile[] = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const next = path.join(dir, item.name);
    if (item.isDirectory()) {
      found.push(
        ...findPages(next, route ? `${route}/${item.name}` : item.name)
      );
    } else if (item.name === "page.tsx") {
      // Strip Next.js route groups: "(workshop)/hardware" -> "hardware".
      const clean = route.replace(/\([^)]+\)\/?/g, "");
      found.push({
        route: `/${clean}`.replace(/\/$/, "") || "/",
        filePath: next,
      });
    }
  }
  return found;
}

/**
 * Fail the build when the lesson list and the filesystem disagree.
 *
 * This is the guard the old generator lacked. Its hardcoded route table
 * silently fell back to `{ title: route }` for anything it did not know
 * about, which is how `/video` ended up in the index titled "video" and
 * `/planner` never made it in at all.
 */
function assertRoutesMatchLessons(pages: PageFile[]): void {
  const onDisk = new Set(pages.map((p) => p.route));
  const problems: string[] = [];

  for (const lesson of LESSONS) {
    if (!onDisk.has(lesson.slug)) {
      problems.push(`lessons.ts lists ${lesson.slug}, but no page.tsx exists`);
    }
  }
  for (const { route } of pages) {
    if (EXCLUDED_ROUTES.has(route)) continue;
    const known =
      LESSONS.some((l) => l.slug === route) || route in EXTRA_ROUTES;
    if (!known) {
      problems.push(
        `${route} has a page but is in neither lessons.ts nor EXTRA_ROUTES ` +
          `(add it to one, or to EXCLUDED_ROUTES)`
      );
    }
  }

  if (problems.length) {
    throw new Error(
      `Search index is out of step with the routes:\n  - ${problems.join("\n  - ")}`
    );
  }
}

/* ── assembly ─────────────────────────────────────────────────────────── */

function excerptOf(content: string, limit = 220): string {
  if (content.length <= limit) return content;
  const cut = content.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit)}…`;
}

function metaFor(route: string): {
  title: string;
  section: string;
  sectionNum: string;
  lessonNum: string;
} {
  const lesson = LESSONS.find((l) => l.slug === route);
  if (lesson) {
    const section = getSectionOf(route);
    return {
      title: lesson.title,
      section: section?.title ?? "",
      sectionNum: section?.num ?? "",
      lessonNum: getLessonNumber(route) ?? "",
    };
  }
  const extra = EXTRA_ROUTES[route];
  return {
    title: extra.title,
    section: extra.section,
    sectionNum: "",
    lessonNum: "",
  };
}

function build(): void {
  const pages = findPages(APP_DIR).sort((a, b) =>
    a.route.localeCompare(b.route)
  );
  assertRoutesMatchLessons(pages);

  const docs: SearchDoc[] = [];
  let skippedThin = 0;

  for (const { route, filePath } of pages) {
    if (EXCLUDED_ROUTES.has(route)) continue;

    const source = ts.createSourceFile(
      filePath,
      fs.readFileSync(filePath, "utf8"),
      ts.ScriptTarget.Latest,
      /* setParentNodes */ true,
      ts.ScriptKind.TSX
    );

    const meta = metaFor(route);
    const chunks = extractChunks(source);
    const blurb = EXTRA_ROUTES[route]?.blurb;

    for (const chunk of chunks) {
      let content = clean(chunk.prose.join(" "));
      if (!content && !chunk.anchor && blurb) content = blurb;

      // A section with almost no prose is a divider or a bare figure. It
      // would only ever match noise.
      if (content.length < 40) {
        skippedThin += 1;
        continue;
      }

      // `route` is built from the directory name, so it is a string as far as
      // the compiler is concerned. It is a real route as far as everything
      // else is concerned: assertRoutesMatchLessons has already thrown above
      // if any page on disk is absent from lessons.ts or vice versa, which is
      // a stronger check than `Route` performs. Assert once, here, rather than
      // widening SearchDoc and losing the guarantee at every consumer.
      const url = (chunk.anchor ? `${route}#${chunk.anchor}` : route) as Route;
      docs.push({
        id: url,
        title: meta.title,
        heading: chunk.heading,
        slug: route as Route,
        anchor: chunk.anchor,
        url,
        content,
        code: clean(chunk.code.join(" ")),
        excerpt: excerptOf(content),
        lessonNum: meta.lessonNum,
        section: meta.section,
        sectionNum: meta.sectionNum,
      });
    }
  }

  const index = new MiniSearch<SearchDoc>(searchIndexOptions);
  index.addAll(docs);

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(index), "utf8");

  const bytes = fs.statSync(OUT_FILE).size;
  const pageCount = new Set(docs.map((d) => d.slug)).size;
  const deepLinkable = docs.filter((d) => d.anchor).length;

  console.log(
    `Search index: ${docs.length} documents across ${pageCount} pages ` +
      `(${deepLinkable} deep-linkable sections, ${skippedThin} thin blocks skipped)`
  );
  console.log(
    `Wrote ${path.relative(ROOT, OUT_FILE)} — ${(bytes / 1024).toFixed(0)} KB`
  );

  // Cheap correctness check: every lesson group should be represented, and a
  // lesson that yielded only an intro doc usually means the walk missed its
  // sections.
  for (const section of SECTIONS) {
    const count = docs.filter((d) => d.section === section.title).length;
    if (count === 0) {
      console.warn(`  warning: no documents for section "${section.title}"`);
    }
  }
}

build();
