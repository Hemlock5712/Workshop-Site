"use client";

import { useEffect, useMemo, useState } from "react";
import CodeCopyButton from "./CodeCopyButton";

/**
 * The client-side twin of `CodeBlock`.
 *
 * `GitHubContent` fetches file contents from the GitHub API in the browser, so
 * there is nothing to highlight until after the request lands — it cannot use
 * the server component. This loads Shiki's web bundle on demand and highlights
 * in the page.
 *
 * That is a real cost (~200 KB, once, shared across every embed on a page) but
 * an order of magnitude below the ~3 MB Monaco it replaces, and it is only
 * paid on pages carrying a live GitHub embed. Until the highlighter resolves
 * the code renders unhighlighted in the same layout, so nothing shifts.
 */
interface CodeBlockLiveProps {
  code: string;
  title?: string;
  filename?: string;
  branch?: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  hideControls?: boolean;
}

const LANG_ALIASES: Record<string, string> = {
  java: "java",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  bash: "shell",
  sh: "shell",
  py: "python",
  gradle: "java",
};

// Module-level so a page with three embeds builds one highlighter, not three.
let highlighterPromise: Promise<{
  codeToHtml: (code: string, opts: { lang: string; theme: string }) => string;
}> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then((shiki) =>
      shiki.createHighlighter({
        themes: ["github-dark-default"],
        langs: ["java", "javascript", "typescript", "json", "xml", "shell"],
      })
    );
  }
  return highlighterPromise;
}

export default function CodeBlockLive({
  code,
  title,
  filename,
  branch,
  language = "java",
  className = "",
  showLineNumbers = true,
  hideControls = false,
}: CodeBlockLiveProps) {
  const [lines, setLines] = useState<string[] | null>(null);
  const label = title ?? filename;

  const plainLines = useMemo(
    () => code.replace(/\s+$/, "").split("\n"),
    [code]
  );

  useEffect(() => {
    let cancelled = false;
    const lang = LANG_ALIASES[language.toLowerCase()] ?? language.toLowerCase();

    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return;
        const html = highlighter.codeToHtml(code.replace(/\s+$/, ""), {
          lang,
          theme: "github-dark-default",
        });
        const start = html.indexOf("<code>");
        const end = html.lastIndexOf("</code>");
        if (start === -1 || end === -1) return;
        setLines(
          html
            .slice(start + "<code>".length, end)
            .split("\n")
            .map((l) =>
              l.replace(/^<span class="line">/, "").replace(/<\/span>$/, "")
            )
        );
      })
      .catch(() => {
        // Grammar missing or the chunk failed — the unhighlighted fallback
        // below is already rendering, so there is nothing to recover.
      });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const rendered = lines ?? null;
  const count = rendered?.length ?? plainLines.length;
  const gutterWidth = `${Math.max(2, String(count).length)}ch`;

  return (
    <div
      className={`code-card overflow-hidden ${className}`.trim()}
      style={{
        border: "1px solid var(--rule)",
        borderRadius: 3,
        background: "var(--code-bg)",
      }}
    >
      {!hideControls && (
        <div
          className="flex items-center gap-3 px-3.5 py-[9px]"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <span
            className="mono truncate"
            style={{ fontSize: "var(--text-meta)", color: "#c9ced6" }}
          >
            {label ?? language}
          </span>
          {branch && (
            <span
              className="mono shrink-0 whitespace-nowrap"
              style={{
                fontSize: "var(--text-micro)",
                letterSpacing: "0.12em",
                color: "var(--accent)",
                border: "1px solid var(--accent)",
                borderRadius: 2,
                padding: "1px 5px",
              }}
            >
              {branch}
            </span>
          )}
          <CodeCopyButton code={code} />
        </div>
      )}

      <pre
        className="code-body m-0 overflow-x-auto py-3.5"
        style={{ background: "transparent" }}
        tabIndex={0}
      >
        <code
          className="grid"
          style={{
            gridTemplateColumns: showLineNumbers
              ? `calc(${gutterWidth} + 28px) minmax(0, max-content)`
              : "minmax(0, max-content)",
            // Explicitly transparent. The inline-code rule in globals.css
            // paints `code` with --bg2, which is near-white on the light
            // theme — it was landing on top of the dark card and putting
            // light-on-light code at 1.16:1.
            background: "transparent",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-note)",
            lineHeight: "22px",
            color: "#e6edf3",
          }}
        >
          {(rendered ?? plainLines).map((line, i) => (
            <div key={i} className="contents">
              {showLineNumbers && (
                <span
                  aria-hidden="true"
                  className="sticky left-0 select-none pr-3.5 text-right"
                  style={{
                    background: "var(--code-bg)",
                    color: "#7d8698",
                    borderRight: "1px solid #1a2032",
                    paddingLeft: 14,
                  }}
                >
                  {i + 1}
                </span>
              )}
              {rendered ? (
                <span
                  className="pl-3.5 pr-5"
                  dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                />
              ) : (
                <span className="pl-3.5 pr-5">{line || " "}</span>
              )}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
