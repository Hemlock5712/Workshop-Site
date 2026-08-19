"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Code,
  ExternalLink,
  Folder,
  GitMerge,
  GitPullRequest,
  GraduationCap,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import CodeBlockLive from "@/components/CodeBlockLive";
import {
  GitHubFileContentSchema,
  GitHubFilesArraySchema,
  GitHubPRDataSchema,
  GitHubSchemaError,
  parseGitHub,
  type GitHubFile,
  type GitHubPRData,
} from "@/lib/githubSchemas";

/**
 * Every request in this file goes through `/api/github`, never straight to
 * `api.github.com`. The reason is in that route's own header comment: GitHub's
 * anonymous limit is per IP, and a classroom is one IP. The proxy is a shared
 * CDN cache in front of the same data, so the room costs one request instead
 * of one per student.
 */
const api = (params: Record<string, string | number>) =>
  `/api/github?${new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString()}`;

interface PRRef {
  number: number;
  focusFile?: string;
}

interface GitHubContentProps {
  repository: string;
  filePath: string;
  branch?: string;
  pr?: PRRef;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * The loading state, in the one form this design has for it.
 *
 * There were two vocabularies in this file: a mono micro-label reading
 * "loading diff…" on the Monaco chunk, and three rotating rings — the site's
 * only `animate-spin`, built from `rounded-full` plus `border-b-2`, which is
 * also what the design detector kept flagging. A spinner is not an idiom this
 * design uses anywhere else, and the label already says more than the ring
 * did. So the label won, and it is now one component.
 *
 * `onCode` switches to `--code-tx2` for the fixed `#1e1e1e` Monaco panel,
 * which stays dark in both themes and so cannot use `--tx3` (that inverts and
 * goes near-black on paper). The hand-picked `#464d5b` that used to stand in
 * measured 1.96:1 there — the one thing on screen during a 3 MB download, and
 * effectively invisible. `--code-tx2` measures 6.2:1 on the same panel.
 *
 * `aria-live` because a sighted student watches the label appear and a
 * screen-reader user otherwise gets silence until the file lands.
 */
function LoadingLabel({
  label,
  onCode = false,
  className = "flex h-32 items-center justify-center",
}: {
  label: string;
  onCode?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`mono ${className}`}
      style={{
        fontSize: "var(--text-micro)",
        letterSpacing: "0.1em",
        color: onCode ? "var(--code-tx2)" : "var(--tx3)",
      }}
      aria-live="polite"
    >
      {label}
    </div>
  );
}

/**
 * Monaco, kept for exactly one job: the side-by-side PR diff.
 *
 * Everything else on the site moved to Shiki, which highlights server-side and
 * ships no JavaScript — but Shiki has no diff engine, and a real two-pane diff
 * with aligned gutters is what makes the "GitHub Changes" tab worth having.
 *
 * Dynamically imported so the ~3 MB only downloads when a student actually
 * opens that tab. Most never do; before this it was a static import and rode
 * along on all sixteen pages carrying an embed.
 */
const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.DiffEditor),
  {
    ssr: false,
    loading: () => <LoadingLabel label="loading diff…" onCode />,
  }
);

const LANGUAGE_MAP: Record<string, string> = {
  java: "java",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  c: "c",
  h: "cpp",
  hpp: "cpp",
  cs: "csharp",
  json: "json",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  sh: "bash",
  bash: "bash",
  html: "html",
  css: "css",
  sql: "sql",
};

function getLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  return LANGUAGE_MAP[ext ?? ""] ?? "plaintext";
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div className="module">
      <LoadingLabel label={label} className="" />
    </div>
  );
}

/**
 * What a student sees when an embed cannot reach GitHub.
 *
 * It used to print the raw failure — "Failed to Load File" over "Failed to
 * fetch file: Not Found" and a repo/path line — which reads as though
 * something in *their* project is wrong. It is not: these files are fetched
 * from a public repo through `/api/github` while the page renders. So the copy
 * says whose fault it is, offers the two things that actually help (retry, or
 * read it on GitHub), and leaves the technical detail in the console.
 *
 * It used to name GitHub's anonymous rate limit as the likely cause, because
 * it was — the embeds called `api.github.com` from the browser and a classroom
 * shares one IP. The proxy's shared cache took that failure mode away, so the
 * copy no longer explains it.
 *
 * `--err` colours the heading only. A whole card washed in the error colour
 * made a rate-limited embed look like a broken robot.
 */
function ErrorCard({
  heading,
  detail,
  href,
  onRetry,
}: {
  heading: string;
  detail: string;
  href: string;
  onRetry: () => void;
}) {
  return (
    <div className="module">
      <h3
        className="display m-0 mb-2 text-lede"
        style={{ color: "var(--err)" }}
      >
        {heading}
      </h3>
      <p
        className="max-w-[62ch]"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-aside)",
          lineHeight: 1.55,
          color: "var(--tx2)",
        }}
      >
        {detail}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="mono cursor-pointer rounded-[3px] px-3.5 py-2 transition-colors hover:border-[var(--accent)] hover:text-[var(--tx)]"
          style={{
            fontSize: "var(--text-micro)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            border: "1px solid var(--rule)",
            background: "var(--bg3)",
            color: "var(--tx2)",
          }}
        >
          Try again
        </button>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mono inline-flex items-center gap-1.5 rounded-[3px] px-3.5 py-2 transition-colors hover:border-[var(--accent)] hover:text-[var(--tx)]"
          style={{
            fontSize: "var(--text-micro)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            border: "1px solid var(--rule)",
            color: "var(--tx2)",
          }}
        >
          Open on GitHub
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export default function GitHubContent({
  repository,
  filePath,
  branch = "main",
  pr,
  title,
  description,
  className = "",
}: GitHubContentProps) {
  const [activeTab, setActiveTab] = useState<"ide" | "diff">("ide");

  const header =
    title || description ? (
      <div className="mb-6">
        {title && <h3 className="display m-0 mb-2 text-title">{title}</h3>}
        {description && <p className="text-[var(--tx2)]">{description}</p>}
      </div>
    ) : null;

  if (!pr) {
    return (
      <div className={className}>
        {header}
        <FileView repository={repository} filePath={filePath} branch={branch} />
      </div>
    );
  }

  return (
    <div className={className}>
      {header}
      <div className="card">
        <div className="border-b border-[var(--rule)]">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab("ide")}
              className={`px-4 sm:px-6 py-3 text-note font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === "ide"
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--tx2)] hover:text-[var(--tx)]"
              }`}
            >
              <Code className="w-4 h-4" />
              Final Implementation
            </button>
            <button
              onClick={() => setActiveTab("diff")}
              className={`px-4 sm:px-6 py-3 text-note font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === "diff"
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--tx2)] hover:text-[var(--tx)]"
              }`}
            >
              <GitPullRequest className="w-4 h-4" />
              GitHub Changes
            </button>
          </div>
        </div>
        <div className="p-0">
          {activeTab === "ide" ? (
            <FileView
              repository={repository}
              filePath={filePath}
              branch={branch}
              className="m-0"
            />
          ) : (
            <PRView
              repository={repository}
              pullRequestNumber={pr.number}
              focusFile={pr.focusFile}
              className="m-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FileView({
  repository,
  filePath,
  branch,
  className = "",
}: {
  repository: string;
  filePath: string;
  branch: string;
  className?: string;
}) {
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  // Bumping this re-runs the effect, which is the whole retry mechanism.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        setFailed(false);
        const endpoint = api({
          resource: "file",
          repo: repository,
          path: filePath,
          ref: branch,
        });
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(
            `GitHub returned ${response.status} ${response.statusText}`
          );
        }
        const data = parseGitHub(
          GitHubFileContentSchema,
          endpoint,
          await response.json()
        );
        setFileSize(data.size);
        setFileContent(atob(data.content));
      } catch (err) {
        // Not rendered. The reader gets human copy; whoever can fix it gets
        // the status code, the path and the branch.
        console.error(
          `GitHub embed failed: ${repository}/${filePath} @ ${branch}`,
          err instanceof GitHubSchemaError
            ? `unexpected response shape: ${err.message}`
            : err
        );
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [repository, filePath, branch, attempt]);

  if (loading) {
    return (
      <div className={className}>
        <LoadingCard label="Loading file..." />
      </div>
    );
  }

  if (failed || !fileContent) {
    return (
      <div className={className}>
        <ErrorCard
          heading="This code embed didn’t load"
          detail={`The file is pulled from GitHub while you read, and that request failed. Nothing is wrong with your project or your install. This is usually a brief outage between this site and GitHub, and retrying clears it. You can also read ${filePath.split("/").pop() || filePath} on GitHub directly.`}
          href={`https://github.com/${repository}/blob/${branch}/${filePath}`}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      </div>
    );
  }

  const filename = filePath.split("/").pop() || filePath;
  const language = getLanguage(filename);

  return (
    <div className={className}>
      <div className="card mb-6 overflow-hidden">
        <div className="border-b border-[var(--rule)] p-pad">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-aside font-medium text-[var(--tx)]">
                {filename}
              </span>
              <span className="px-2 py-1 bg-[var(--bg2)] text-[var(--accent)] rounded text-meta font-medium">
                {language.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-note text-[var(--tx2)]">
              {fileSize !== undefined && (
                <span>{formatFileSize(fileSize)}</span>
              )}
              <a
                href={`https://github.com/${repository}/blob/${branch}/${filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--bg2)] text-[var(--tx)] px-3 py-1 rounded hover:bg-[var(--rule)] transition-colors text-note font-medium flex items-center gap-1"
              >
                View on GitHub <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-2 text-note text-[var(--tx2)]">
            {repository} / {filePath.replace(filename, "").replace(/\/$/, "")}
          </div>
        </div>

        <div className="p-0">
          <CodeBlockLive
            code={fileContent}
            filename={filename}
            language={language}
            className="border-0 rounded-none"
            hideControls={true}
          />
        </div>
      </div>

      {/* Not a panel. It was `--bg2` on `--bg2` — invisible wherever this embed
          sits inside a card — and its `p-6` was a second inset that put this
          heading a couple of pixels off every other heading in the block. It
          is a note about the viewer above it, so it sits on the same left edge
          as the viewer. */}
      <div className="text-[var(--tx)]">
        <h5 className="display m-0 mb-3 flex items-center gap-2 text-aside">
          <Folder className="w-5 h-5" aria-hidden="true" /> Live from GitHub
        </h5>
        <p className="max-w-[70ch] text-note text-[var(--tx2)]">
          This file is displayed directly from the GitHub repository. Click
          &quot;View on GitHub&quot; to see the file in its repository context,
          view history, blame information, and make edits.
        </p>
      </div>
    </div>
  );
}

interface FileContent {
  original: string;
  modified: string;
}

function PRView({
  repository,
  pullRequestNumber,
  focusFile,
  className = "",
}: {
  repository: string;
  pullRequestNumber: number;
  focusFile?: string;
  className?: string;
}) {
  const theme = useTheme();
  const [prData, setPRData] = useState<GitHubPRData | null>(null);
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, FileContent>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());
  // Bumping this re-runs the effect, which is the whole retry mechanism.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const fetchFileContents = async (
      files: GitHubFile[],
      prData: GitHubPRData,
      repo: string
    ) => {
      const contents: Record<string, FileContent> = {};

      for (const file of files) {
        setLoadingFiles((prev) => new Set(prev).add(file.filename));

        try {
          let originalContent = "";
          let modifiedContent = "";

          if (file.status !== "added") {
            try {
              const originalUrl = api({
                resource: "file",
                repo,
                path: file.filename,
                ref: prData.base.sha,
              });
              const originalResponse = await fetch(originalUrl);
              if (originalResponse.ok) {
                const originalData = parseGitHub(
                  GitHubFileContentSchema,
                  originalUrl,
                  await originalResponse.json()
                );
                originalContent = atob(originalData.content);
              }
            } catch {
              originalContent = "";
            }
          }

          if (file.status !== "removed") {
            try {
              const modifiedUrl = api({
                resource: "file",
                repo,
                path: file.filename,
                ref: prData.head.sha,
              });
              const modifiedResponse = await fetch(modifiedUrl);
              if (modifiedResponse.ok) {
                const modifiedData = parseGitHub(
                  GitHubFileContentSchema,
                  modifiedUrl,
                  await modifiedResponse.json()
                );
                modifiedContent = atob(modifiedData.content);
              }
            } catch {
              modifiedContent = "";
            }
          }

          contents[file.filename] = {
            original: originalContent,
            modified: modifiedContent,
          };
        } catch (err) {
          console.error(`Failed to fetch content for ${file.filename}:`, err);
          contents[file.filename] = { original: "", modified: "" };
        }

        setLoadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(file.filename);
          return next;
        });
      }

      setFileContents(contents);
    };

    const fetchPR = async () => {
      try {
        setLoading(true);
        setFailed(false);

        const prUrl = api({
          resource: "pr",
          repo: repository,
          number: pullRequestNumber,
        });
        const prResponse = await fetch(prUrl);
        if (!prResponse.ok) {
          throw new Error(
            `GitHub returned ${prResponse.status} ${prResponse.statusText} for the pull request`
          );
        }
        const prResult = parseGitHub(
          GitHubPRDataSchema,
          prUrl,
          await prResponse.json()
        );
        setPRData(prResult);

        const filesUrl = api({
          resource: "pr-files",
          repo: repository,
          number: pullRequestNumber,
        });
        const filesResponse = await fetch(filesUrl);
        if (!filesResponse.ok) {
          throw new Error(
            `GitHub returned ${filesResponse.status} ${filesResponse.statusText} for the changed-file list`
          );
        }
        const filesResult = parseGitHub(
          GitHubFilesArraySchema,
          filesUrl,
          await filesResponse.json()
        );

        const filteredFiles = focusFile
          ? filesResult.filter((file) => file.filename.includes(focusFile))
          : filesResult;
        setFiles(filteredFiles);

        await fetchFileContents(filteredFiles, prResult, repository);
      } catch (err) {
        // See the note in FileView: detail to the console, copy to the reader.
        console.error(
          `GitHub PR embed failed: ${repository}#${pullRequestNumber}`,
          err instanceof GitHubSchemaError
            ? `unexpected response shape: ${err.message}`
            : err
        );
        setFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPR();
  }, [repository, pullRequestNumber, focusFile, attempt]);

  const calculateEditorHeight = (content: FileContent) => {
    const maxLines = Math.max(
      content.original.split("\n").length,
      content.modified.split("\n").length
    );
    const lineHeight = 19;
    const padding = 20;
    const minHeight = 150;
    const maxHeight = 600;
    return Math.min(
      Math.max(maxLines * lineHeight + padding, minHeight),
      maxHeight
    );
  };

  if (loading) {
    return (
      <div className={`my-8 ${className}`}>
        <LoadingCard label="Loading pull request..." />
      </div>
    );
  }

  if (failed || !prData) {
    return (
      <div className={`my-8 ${className}`}>
        <ErrorCard
          heading="This diff didn’t load"
          detail="The changed files are pulled from GitHub while you read, and that request failed. Nothing is wrong with your project or your install. This is usually a brief outage between this site and GitHub, and retrying clears it. You can also read the pull request on GitHub directly."
          href={`https://github.com/${repository}/pull/${pullRequestNumber}`}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      </div>
    );
  }

  return (
    <div className={`my-8 ${className}`}>
      <div className="card mb-6">
        <div className="p-pad border-b border-[var(--rule)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-meta font-medium flex items-center gap-1 ${
                    prData.merged_at
                      ? "bg-[var(--bg2)] text-[var(--tx)]"
                      : prData.state === "closed"
                        ? "bg-[var(--bg2)] text-[var(--err)] text-[var(--err)]"
                        : "bg-[var(--bg2)] text-[var(--ok)] text-[var(--ok)]"
                  }`}
                >
                  {prData.merged_at ? (
                    <>
                      <GitMerge className="w-3 h-3" /> Merged
                    </>
                  ) : prData.state === "closed" ? (
                    <>
                      <X className="w-3 h-3" /> Closed
                    </>
                  ) : (
                    <>
                      <GitPullRequest className="w-3 h-3" /> Open
                    </>
                  )}
                </span>
                <span className="text-[var(--tx2)] text-note">
                  #{prData.number}
                </span>
              </div>

              <h4 className="display m-0 mb-3 text-lede">{prData.title}</h4>

              <div className="flex items-center space-x-4 text-note text-[var(--tx2)]">
                <span>created {formatDate(prData.created_at)}</span>
                {prData.merged_at && (
                  <span>merged {formatDate(prData.merged_at)}</span>
                )}
              </div>
            </div>

            <a
              href={prData.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--accent)] text-[var(--accent-ink)] px-4 py-2 rounded-lg hover:bg-[var(--bg2)] transition-colors text-note font-medium flex items-center gap-1"
            >
              View on GitHub <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="p-pad">
          <div className="flex items-center justify-between mb-4">
            <h5 className="display m-0 text-aside">
              {focusFile ? `${focusFile} Changes` : "Files Changed"}
            </h5>
            <div className="flex items-center space-x-4 text-note">
              <span className="flex items-center text-[var(--ok)]">
                <span className="w-3 h-3 bg-[var(--bg2)] rounded-full mr-2"></span>
                +{files.reduce((sum, file) => sum + file.additions, 0)}{" "}
                additions
              </span>
              <span className="flex items-center text-[var(--err)]">
                <span className="w-3 h-3 bg-[var(--bg2)] rounded-full mr-2"></span>
                -{files.reduce((sum, file) => sum + file.deletions, 0)}{" "}
                deletions
              </span>
            </div>
          </div>

          {files.map((file, index) => {
            const content = fileContents[file.filename];
            const isLoadingContent = loadingFiles.has(file.filename);
            const language = getLanguage(file.filename);

            return (
              <div
                key={index}
                className="border border-[var(--rule)] rounded-lg overflow-hidden mb-4 last:mb-0"
              >
                <div className="bg-[var(--bg2)] dark:bg-[#2d2d30] px-4 py-3 border-b border-[var(--rule)] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-note font-medium text-[var(--tx)]">
                      {file.filename}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-meta ${
                        file.status === "added"
                          ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                          : file.status === "removed"
                            ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                            : "bg-[var(--accent)] text-[var(--accent-ink)]"
                      }`}
                    >
                      {file.status}
                    </span>
                    <span className="text-meta bg-[var(--bg3)] text-[var(--tx3)] px-2 py-1 rounded font-medium">
                      {language.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-note">
                    {file.additions > 0 && (
                      <span className="text-[var(--ok)] font-medium">
                        +{file.additions}
                      </span>
                    )}
                    {file.deletions > 0 && (
                      <span className="text-[var(--err)] font-medium">
                        -{file.deletions}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-[#1e1e1e]">
                  {isLoadingContent ? (
                    <LoadingLabel label="loading diff…" onCode />
                  ) : content ? (
                    <DiffEditor
                      height={calculateEditorHeight(content)}
                      language={language}
                      original={content.original}
                      modified={content.modified}
                      theme={theme.resolvedTheme === "dark" ? "vs-dark" : "vs"}
                      options={{
                        readOnly: true,
                        renderSideBySide: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        renderLineHighlight: "none",
                        // Monaco's own option, not a CSS style — it takes a
                        // number and cannot read a custom property. 13 is
                        // `--text-note`, kept in sync by hand.
                        fontSize: 13,
                        fontFamily:
                          "'Fira Code', 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
                        fontLigatures: true,
                        scrollbar: {
                          vertical: "auto",
                          horizontal: "auto",
                          verticalScrollbarSize: 10,
                          horizontalScrollbarSize: 10,
                        },
                        overviewRulerBorder: false,
                        contextmenu: false,
                        enableSplitViewResizing: true,
                        renderOverviewRuler: false,
                        diffWordWrap: "off",
                      }}
                      loading={
                        <LoadingLabel
                          label="loading diff…"
                          onCode
                          className="flex h-32 items-center justify-center bg-[#1e1e1e]"
                        />
                      }
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 text-[var(--tx3)]">
                      Unable to load file content
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Same as the note under FileView: a note, not a panel. */}
      <div className="text-[var(--tx)]">
        <h5 className="display m-0 mb-3 flex items-center gap-2 text-aside">
          <GraduationCap className="w-5 h-5" aria-hidden="true" /> Workshop
          Learning
        </h5>
        <p className="max-w-[70ch] text-note text-[var(--tx2)]">
          This pull request demonstrates real-world development practices.
          Students can explore the actual code changes, commit history, and
          review comments that led to the implementation improvements. Click
          &quot;View on GitHub&quot; to see the full development discussion and
          review process.
        </p>
      </div>
    </div>
  );
}
