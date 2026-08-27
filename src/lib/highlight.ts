import "server-only";

import {
  createHighlighter,
  type Highlighter,
  type BundledLanguage,
} from "shiki";

/**
 * Syntax highlighting, server-side.
 *
 * Shiki is VS Code's highlighter: the same TextMate grammars, run through the
 * same Oniguruma regex engine, with GitHub's own published themes. That means
 * Java is tokenized by the grammar Microsoft and GitHub maintain rather than
 * by anything hand-written here — which is the whole reason for the swap. The
 * previous setup ran Monaco, a full ~3 MB IDE, as a read-only viewer, and its
 * simplified Java grammar lumped every class name, method name and field into
 * one `identifier` token, so a page of code rendered as near-uniform white.
 *
 * This module is server-only. Highlighting happens once, at build time, and
 * ships as plain HTML — no JavaScript reaches the browser for the ~23 static
 * code blocks on the site. `CodeBlockLive` handles the one client-side case.
 */

/**
 * The languages the site actually uses. Loading the full bundle would pull
 * every grammar Shiki ships; this list is what appears in `language=` props
 * across the workshop pages.
 */
const LANGS = [
  "java",
  "javascript",
  "typescript",
  "json",
  "xml",
  "yaml",
  "markdown",
  "shell",
  "python",
  "cpp",
  "csharp",
  "html",
  "css",
  "sql",
] as const satisfies readonly BundledLanguage[];

const LANG_ALIASES: Record<string, (typeof LANGS)[number]> = {
  java: "java",
  js: "javascript",
  jsx: "javascript",
  javascript: "javascript",
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  json: "json",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  markdown: "markdown",
  bash: "shell",
  sh: "shell",
  shell: "shell",
  py: "python",
  python: "python",
  cpp: "cpp",
  "c++": "cpp",
  c: "cpp",
  csharp: "csharp",
  "c#": "csharp",
  html: "html",
  css: "css",
  sql: "sql",
};

/** Resolve a page's `language` prop onto a grammar we actually loaded. */
export function resolveLang(language: string): (typeof LANGS)[number] | "text" {
  return LANG_ALIASES[language.toLowerCase()] ?? "text";
}

// One highlighter for the whole build. Creating one per code block would load
// and compile the grammars ~200 times over a full `next build`.
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      // github-dark in both site themes. A code block is a terminal; the
      // design keeps it dark on the light page rather than inverting a dozen
      // of them every time someone flips the toggle.
      themes: ["github-dark-default"],
      langs: [...LANGS],
    });
  }
  return highlighterPromise;
}

/**
 * Highlight `code` and return the inner HTML of one line per array entry.
 *
 * Per-line rather than one blob so the caller can render a real gutter: line
 * numbers in their own column that stays put when a long line scrolls, and
 * that never lands in a copy-paste.
 *
 * Shiki emits exactly `<span class="line">…</span>` per line, newline-
 * separated, inside a single `<code>`. Splitting on the newline is reliable
 * because a source line cannot itself contain one.
 */
export async function highlightLines(
  code: string,
  language: string
): Promise<string[]> {
  const lang = resolveLang(language);
  const highlighter = await getHighlighter();

  const html = highlighter.codeToHtml(code.replace(/\s+$/, ""), {
    lang,
    theme: "github-dark-default",
  });

  const start = html.indexOf("<code>");
  const end = html.lastIndexOf("</code>");
  if (start === -1 || end === -1) return [];

  return html
    .slice(start + "<code>".length, end)
    .split("\n")
    .map((line) =>
      line.replace(/^<span class="line">/, "").replace(/<\/span>$/, "")
    );
}
