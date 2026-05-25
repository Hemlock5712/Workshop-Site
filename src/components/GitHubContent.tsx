"use client";

import { useState, useEffect } from "react";
import { DiffEditor } from "@monaco-editor/react";
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
import CodeBlock from "@/components/CodeBlock";
import {
  GitHubFileContentSchema,
  GitHubFilesArraySchema,
  GitHubPRDataSchema,
  GitHubSchemaError,
  parseGitHub,
  type GitHubFile,
  type GitHubPRData,
} from "@/lib/githubSchemas";

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
    <div className="card p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-[var(--muted-foreground)]">{label}</p>
    </div>
  );
}

function ErrorCard({
  heading,
  message,
  context,
}: {
  heading: string;
  message: string;
  context: string;
}) {
  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6">
      <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2">
        {heading}
      </h3>
      <p className="text-red-600 dark:text-red-400 text-sm">{message}</p>
      <p className="text-red-600 dark:text-red-400 text-sm mt-2">{context}</p>
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
        {title && (
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-[var(--muted-foreground)]">{description}</p>
        )}
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
        <div className="border-b border-[var(--border)]">
          <div className="flex">
            <button
              onClick={() => setActiveTab("ide")}
              className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${
                activeTab === "ide"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Code className="w-4 h-4" />
              Final Implementation
            </button>
            <button
              onClick={() => setActiveTab("diff")}
              className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${
                activeTab === "diff"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
  const [error, setError] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        const endpoint = `https://api.github.com/repos/${repository}/contents/${filePath}?ref=${branch}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const data = parseGitHub(
          GitHubFileContentSchema,
          endpoint,
          await response.json()
        );
        setFileSize(data.size);
        setFileContent(atob(data.content));
      } catch (err) {
        if (err instanceof GitHubSchemaError) {
          setError(
            `GitHub returned an unexpected response shape (${err.message})`
          );
        } else {
          setError(err instanceof Error ? err.message : "Failed to fetch file");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [repository, filePath, branch]);

  if (loading) {
    return (
      <div className={className}>
        <LoadingCard label="Loading file..." />
      </div>
    );
  }

  if (error || !fileContent) {
    return (
      <div className={className}>
        <ErrorCard
          heading="Failed to Load File"
          message={error || "File not found"}
          context={`Repository: ${repository}, File: ${filePath}`}
        />
      </div>
    );
  }

  const filename = filePath.split("/").pop() || filePath;
  const language = getLanguage(filename);

  return (
    <div className={className}>
      <div className="card mb-6 overflow-hidden">
        <div className="border-b border-[var(--border)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-lg font-medium text-[var(--foreground)]">
                {filename}
              </span>
              <span className="px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded text-xs font-medium">
                {language.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-[var(--muted-foreground)]">
              {fileSize !== undefined && (
                <span>{formatFileSize(fileSize)}</span>
              )}
              <a
                href={`https://github.com/${repository}/blob/${branch}/${filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[var(--muted)] text-[var(--foreground)] px-3 py-1 rounded hover:bg-[var(--border)] transition-colors text-sm font-medium flex items-center gap-1"
              >
                View on GitHub <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-2 text-sm text-[var(--muted-foreground)]">
            {repository} / {filePath.replace(filename, "").replace(/\/$/, "")}
          </div>
        </div>

        <div className="p-0">
          <CodeBlock
            code={fileContent}
            filename={filename}
            language={language}
            className="border-0 rounded-none"
            hideControls={true}
          />
        </div>
      </div>

      <div className="bg-[var(--card)] text-[var(--foreground)] rounded-lg p-6">
        <h5 className="font-semibold mb-3 flex items-center gap-2">
          <Folder className="w-5 h-5" /> Live from GitHub
        </h5>
        <p className="text-[var(--muted-foreground)] text-sm">
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
  const [error, setError] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

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
              const originalUrl = `https://api.github.com/repos/${repo}/contents/${file.filename}?ref=${prData.base.sha}`;
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
              const modifiedUrl = `https://api.github.com/repos/${repo}/contents/${file.filename}?ref=${prData.head.sha}`;
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

        const prUrl = `https://api.github.com/repos/${repository}/pulls/${pullRequestNumber}`;
        const prResponse = await fetch(prUrl);
        if (!prResponse.ok) {
          throw new Error(`Failed to fetch PR: ${prResponse.statusText}`);
        }
        const prResult = parseGitHub(
          GitHubPRDataSchema,
          prUrl,
          await prResponse.json()
        );
        setPRData(prResult);

        const filesUrl = `https://api.github.com/repos/${repository}/pulls/${pullRequestNumber}/files`;
        const filesResponse = await fetch(filesUrl);
        if (!filesResponse.ok) {
          throw new Error(
            `Failed to fetch PR files: ${filesResponse.statusText}`
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
        if (err instanceof GitHubSchemaError) {
          setError(
            `GitHub returned an unexpected response shape (${err.message})`
          );
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to fetch PR data"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPR();
  }, [repository, pullRequestNumber, focusFile]);

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

  if (error || !prData) {
    return (
      <div className={`my-8 ${className}`}>
        <ErrorCard
          heading="Failed to Load Pull Request"
          message={error || "PR not found"}
          context={`Repository: ${repository}`}
        />
      </div>
    );
  }

  return (
    <div className={`my-8 ${className}`}>
      <div className="card mb-6">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    prData.merged_at
                      ? "bg-[var(--muted)] text-[var(--foreground)]"
                      : prData.state === "closed"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
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
                <span className="text-[var(--muted-foreground)] text-sm">
                  #{prData.number}
                </span>
              </div>

              <h4 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                {prData.title}
              </h4>

              <div className="flex items-center space-x-4 text-sm text-[var(--muted-foreground)]">
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
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-1"
            >
              View on GitHub <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-[var(--foreground)]">
              {focusFile ? `${focusFile} Changes` : "Files Changed"}
            </h5>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-green-600 dark:text-green-400">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                +{files.reduce((sum, file) => sum + file.additions, 0)}{" "}
                additions
              </span>
              <span className="flex items-center text-red-600 dark:text-red-400">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>-
                {files.reduce((sum, file) => sum + file.deletions, 0)} deletions
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
                className="border border-[var(--border)] rounded-lg overflow-hidden mb-4 last:mb-0"
              >
                <div className="bg-white dark:bg-[#2d2d30] px-4 py-3 border-b border-gray-600 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">
                      {file.filename}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        file.status === "added"
                          ? "bg-green-600 text-white"
                          : file.status === "removed"
                            ? "bg-red-600 text-white"
                            : "bg-primary-600 text-white"
                      }`}
                    >
                      {file.status}
                    </span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded font-medium">
                      {language.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    {file.additions > 0 && (
                      <span className="text-green-400 font-medium">
                        +{file.additions}
                      </span>
                    )}
                    {file.deletions > 0 && (
                      <span className="text-red-400 font-medium">
                        -{file.deletions}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-[#1e1e1e]">
                  {isLoadingContent ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
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
                        <div className="flex items-center justify-center h-32 bg-[#1e1e1e]">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      }
                    />
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                      Unable to load file content
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[var(--card)] text-[var(--foreground)] rounded-lg p-6">
        <h5 className="font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <GraduationCap className="w-5 h-5" /> Workshop Learning
        </h5>
        <p className="text-[var(--muted-foreground)] text-sm">
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
