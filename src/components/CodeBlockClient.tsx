"use client";

import { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Professional VSCode-style code block component using Monaco Editor
 * Features:
 * - Full VS Code editor experience with syntax highlighting
 * - Read-only view by default
 * - Copy to clipboard functionality
 * - Line numbers
 * - Language badge
 * - Automatic height calculation based on content
 */
interface CodeBlockProps {
  code: string;
  title?: string;
  filename?: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  hideControls?: boolean;
}

// Map common language names to Monaco language identifiers
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

export default function CodeBlock({
  code,
  title,
  filename,
  language = "java",
  className = "",
  showLineNumbers = true,
  hideControls = false,
}: CodeBlockProps) {
  const theme = useTheme();

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Calculate editor height based on number of lines
  const editorHeight = useMemo(() => {
    const lineCount = code.split("\n").length;
    const lineHeight = 19; // Monaco default line height
    const padding = 16; // Top and bottom padding
    const minHeight = 100;
    const maxHeight = 800;
    const calculatedHeight = lineCount * lineHeight + padding;
    return Math.min(Math.max(calculatedHeight, minHeight), maxHeight);
  }, [code]);

  // Get Monaco language identifier
  const monacoLanguage = languageMap[language.toLowerCase()] || "plaintext";

  return (
    <div
      className={`bg-[#1e1e1e] rounded-lg overflow-hidden shadow-lg border border-gray-700 ${className}`}
    >
      {(title || filename) && (
        <div className="bg-white dark:bg-[#2d2d30] px-4 py-3 border-b border-gray-600 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {filename && !hideControls && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {title && (
                <span className="text-gray-800 dark:text-gray-400 font-medium">
                  {title}
                </span>
              )}
              {filename && (
                <span className="text-gray-800 dark:text-gray-400 text-sm font-mono px-2 py-1 rounded">
                  {filename}
                </span>
              )}
              {language && (
                <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded font-medium">
                  {language.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            aria-label={copied ? "Copied" : "Copy code"}
            className="text-gray-400 hover:text-gray-200 transition-colors px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm font-medium flex items-center gap-1"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy
              </>
            )}
          </button>
        </div>
      )}

      <div className="relative">
        <Editor
          height={editorHeight}
          language={monacoLanguage}
          value={code}
          theme={theme.resolvedTheme === "dark" ? "vs-dark" : "vs"}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: showLineNumbers ? "on" : "off",
            renderLineHighlight: "none",
            folding: true,
            fontSize: 14,
            fontFamily:
              "'Fira Code', 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
            fontLigatures: true,
            padding: { top: 8, bottom: 8 },
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            contextmenu: false,
            domReadOnly: true,
            wordWrap: "off",
          }}
          loading={
            <div className="flex items-center justify-center h-24 bg-[#1e1e1e]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          }
        />

        {!title && !filename && (
          <button
            type="button"
            onClick={copyToClipboard}
            aria-label={copied ? "Copied" : "Copy code"}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 rounded bg-gray-800 bg-opacity-90 text-xs font-medium z-10"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
