"use client";

import { useState, useMemo, useCallback } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";

/**
 * A code card.
 *
 * Chrome across the top: the file this goes in, the Workshop-Code branch it
 * comes from, and copy. Naming the file is not decoration — "where does this
 * go?" is the single most common way a student gets stuck, and a snippet
 * floating without a filename is the reason.
 *
 * The editor keeps its own dark surface in both themes. A code block is a
 * terminal; inverting a dozen of them on every theme switch makes a long
 * lesson strobe, and the light-theme page reads fine with dark code on it.
 */
interface CodeBlockProps {
  code: string;
  /** What this file is called. Shown top-left. */
  title?: string;
  /** Alias for `title`, kept for the pages that already use it. */
  filename?: string;
  /** Workshop-Code branch, e.g. `3-PID`. Rendered as the accent chip. */
  branch?: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  /** Suppress the header entirely — used inside tabbed embeds. */
  hideControls?: boolean;
}

const languageMap: Record<string, string> = {
  java: "java",
  javascript: "javascript",
  js: "javascript",
  jsx: "javascript",
  typescript: "typescript",
  ts: "typescript",
  tsx: "typescript",
  python: "python",
  py: "python",
  cpp: "cpp",
  "c++": "cpp",
  c: "c",
  csharp: "csharp",
  "c#": "csharp",
  json: "json",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  markdown: "markdown",
  md: "markdown",
  bash: "shell",
  shell: "shell",
  sh: "shell",
  html: "html",
  css: "css",
  sql: "sql",
  text: "plaintext",
};

/**
 * Monaco theme built from the design's code palette. Hex rather than OKLCH
 * because Monaco's theme API only accepts hex — these are the sRGB values of
 * the same tokens the rest of the page uses.
 */
const THEME_NAME = "gray-matter";

const THEME = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "", foreground: "dadee5" },
    { token: "keyword", foreground: "c3a5f9" },
    { token: "keyword.control", foreground: "c3a5f9" },
    { token: "type", foreground: "6ed9d2" },
    { token: "type.identifier", foreground: "6ed9d2" },
    { token: "identifier", foreground: "dadee5" },
    { token: "entity.name.function", foreground: "efd369" },
    { token: "number", foreground: "a5e0a5" },
    { token: "number.float", foreground: "a5e0a5" },
    { token: "string", foreground: "fda293" },
    { token: "comment", foreground: "697284", fontStyle: "italic" },
    { token: "annotation", foreground: "f99242" },
    { token: "delimiter", foreground: "9aa3b2" },
  ],
  colors: {
    "editor.background": "#030718",
    "editor.foreground": "#dadee5",
    "editorLineNumber.foreground": "#464d5b",
    "editorLineNumber.activeForeground": "#7f8793",
    "editor.selectionBackground": "#1d2842",
    "editor.inactiveSelectionBackground": "#1d2842",
    "editorIndentGuide.background1": "#1a2032",
    "editorIndentGuide.activeBackground1": "#2c3445",
    "scrollbarSlider.background": "#2c344588",
    "scrollbarSlider.hoverBackground": "#2c3445cc",
    "scrollbarSlider.activeBackground": "#464d5b",
    "editorWidget.background": "#0a0f22",
    "editorGutter.background": "#030718",
  },
};

export default function CodeBlock({
  code,
  title,
  filename,
  branch,
  language = "java",
  className = "",
  showLineNumbers = true,
  hideControls = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const label = title ?? filename;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Height follows the content: a 5-line snippet gets a 5-line box. Capped so
  // a 400-line embed scrolls internally instead of running the page off-screen.
  const editorHeight = useMemo(() => {
    const lineCount = code.split("\n").length;
    return Math.min(Math.max(lineCount * 22 + 36, 76), 720);
  }, [code]);

  const monacoLanguage = languageMap[language.toLowerCase()] || "plaintext";

  const beforeMount = useCallback((monaco: Monaco) => {
    monaco.editor.defineTheme(THEME_NAME, THEME);
  }, []);

  return (
    <div
      className={`overflow-hidden ${className}`.trim()}
      style={{
        border: "1px solid var(--rule)",
        borderRadius: 3,
        background: "#030718",
      }}
    >
      {!hideControls && (
        <div
          className="flex items-center gap-3 px-3.5 py-[9px]"
          style={{ borderBottom: "1px solid var(--rule)" }}
        >
          <span
            className="mono truncate"
            style={{ fontSize: 11.5, color: "#c9ced6" }}
          >
            {label ?? monacoLanguage}
          </span>
          {branch && (
            <span
              className="mono shrink-0 whitespace-nowrap"
              style={{
                fontSize: 9,
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
          <button
            type="button"
            onClick={copyToClipboard}
            aria-label={copied ? "Copied" : "Copy code"}
            className="mono ml-auto shrink-0 cursor-pointer border-0 bg-transparent transition-colors hover:text-[var(--accent)]"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7f8793",
            }}
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
      )}

      <div className="relative">
        <Editor
          height={editorHeight}
          language={monacoLanguage}
          value={code}
          theme={THEME_NAME}
          beforeMount={beforeMount}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: showLineNumbers ? "on" : "off",
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 12,
            renderLineHighlight: "none",
            folding: false,
            fontSize: 13,
            lineHeight: 22,
            fontFamily:
              "var(--font-mono), 'JetBrains Mono', ui-monospace, Consolas, monospace",
            fontLigatures: true,
            padding: { top: 14, bottom: 14 },
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 9,
              horizontalScrollbarSize: 9,
            },
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            contextmenu: false,
            domReadOnly: true,
            wordWrap: "off",
            guides: { indentation: false },
          }}
          loading={
            <div
              className="mono flex h-20 items-center justify-center"
              style={{ background: "#030718", fontSize: 10, color: "#464d5b" }}
            >
              loading…
            </div>
          }
        />

        {hideControls && (
          <button
            type="button"
            onClick={copyToClipboard}
            aria-label={copied ? "Copied" : "Copy code"}
            className="mono absolute right-3 top-3 z-10 cursor-pointer rounded-sm px-2 py-1 transition-colors hover:text-[var(--accent)]"
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7f8793",
              background: "#0a0f22",
              border: "1px solid var(--rule)",
            }}
          >
            {copied ? "copied" : "copy"}
          </button>
        )}
      </div>
    </div>
  );
}
