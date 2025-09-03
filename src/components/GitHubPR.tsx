"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/**
 * GitHub API response types for pull request data
 */
interface GitHubFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}

interface GitHubPR {
  number: number;
  title: string;
  body: string;
  html_url: string;
  state: string;
  created_at: string;
  merged_at: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    sha: string;
  };
  base: {
    sha: string;
  };
}

/**
 * GitHub Pull Request display component
 * Features:
 * - Fetches live PR data from GitHub API
 * - Shows PR metadata (title, author, dates, status)
 * - Displays file changes with GitHub-style diff visualization
 * - Filters to focus on specific files (e.g., Arm.java)
 * - Educational context for learning git workflow
 */
interface GitHubPRProps {
  repository: string; // e.g., "Hemlock5712/2025-Workshop"
  pullRequestNumber: number;
  title?: string;
  description?: string;
  focusFile?: string; // e.g., "src/main/java/frc/robot/subsystems/Arm.java"
  className?: string;
}

export default function GitHubPR({
  repository,
  pullRequestNumber,
  title,
  description,
  focusFile,
  className = "",
}: GitHubPRProps) {
  const [pr, setPR] = useState<GitHubPR | null>(null);
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPRData = async () => {
      try {
        setLoading(true);

        // Fetch PR details
        const prResponse = await fetch(
          `https://api.github.com/repos/${repository}/pulls/${pullRequestNumber}`
        );
        if (!prResponse.ok) {
          throw new Error(`Failed to fetch PR: ${prResponse.statusText}`);
        }
        const prData = await prResponse.json();
        setPR(prData);

        // Fetch PR files
        const filesResponse = await fetch(
          `https://api.github.com/repos/${repository}/pulls/${pullRequestNumber}/files`
        );
        if (!filesResponse.ok) {
          throw new Error(
            `Failed to fetch PR files: ${filesResponse.statusText}`
          );
        }
        const filesData = await filesResponse.json();

        // Filter to focus file if specified
        const filteredFiles = focusFile
          ? filesData.filter(
              (file: GitHubFile) =>
                file.filename.includes(focusFile) ||
                file.filename.endsWith("Arm.java")
            )
          : filesData;
        setFiles(filteredFiles);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch PR data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPRData();
  }, [repository, pullRequestNumber, focusFile]);

  if (loading) {
    return (
      <div className={`my-8 ${className}`}>
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-[var(--muted-foreground)]">
            Loading pull request...
          </p>
        </div>
      </div>
    );
  }

  if (error || !pr) {
    return (
      <div className={`my-8 ${className}`}>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6">
          <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2">
            Failed to Load Pull Request
          </h3>
          <p className="text-red-600 dark:text-red-400 text-sm">
            {error || "PR not found"}
          </p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">
            Repository: {repository}, PR #{pullRequestNumber}
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderDiff = (patch: string) => {
    const lines = patch.split("\n");
    let oldLineNum = 0;
    let newLineNum = 0;

    // Parse hunk headers to get starting line numbers
    const hunkHeaderRegex = /^@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/;

    return (
      <div className="card font-mono text-sm overflow-x-auto">
        {lines.map((line, index) => {
          // Handle hunk headers
          if (line.startsWith("@@")) {
            const match = line.match(hunkHeaderRegex);
            if (match) {
              oldLineNum = parseInt(match[1]) - 1;
              newLineNum = parseInt(match[2]) - 1;
            }
            return (
              <div
                key={index}
                className="bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300 px-4 py-1 border-b border-[var(--border)]"
              >
                {line}
              </div>
            );
          }

          // Handle diff content
          const lineType = line[0];
          const content = line.slice(1);

          let bgClass = "";
          let textClass = "";
          let prefix = "";
          let lineNumbers = "";

          if (lineType === "+") {
            bgClass = "bg-green-50 dark:bg-green-950/30";
            textClass = "text-green-800 dark:text-green-300";
            prefix = "+";
            newLineNum++;
            lineNumbers = `    ${newLineNum}`;
          } else if (lineType === "-") {
            bgClass = "bg-red-50 dark:bg-red-950/30";
            textClass = "text-red-800 dark:text-red-300";
            prefix = "-";
            oldLineNum++;
            lineNumbers = `${oldLineNum}    `;
          } else if (lineType === " ") {
            bgClass = "bg-[var(--card)]";
            textClass = "text-[var(--foreground)]";
            prefix = " ";
            oldLineNum++;
            newLineNum++;
            lineNumbers = `${oldLineNum} ${newLineNum}`;
          } else {
            // Context lines or other
            return null;
          }

          return (
            <div
              key={index}
              className={`flex ${bgClass} border-b border-[var(--border)]`}
            >
              <div className="text-[var(--muted-foreground)] text-xs px-2 py-1 w-16 text-right bg-[var(--muted)] border-r border-[var(--border)] select-none">
                {lineNumbers}
              </div>
              <div className={`flex-1 px-2 py-1 ${textClass}`}>
                <span className="select-none w-4 inline-block">{prefix}</span>
                <span>{content}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`my-8 ${className}`}>
      {title && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-[var(--muted-foreground)]">{description}</p>
          )}
        </div>
      )}

      {/* PR Header */}
      <div className="card mb-6">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pr.state === "merged"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      : pr.state === "closed"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  }`}
                >
                  {pr.state === "merged"
                    ? "🔀 Merged"
                    : pr.state === "closed"
                    ? "❌ Closed"
                    : "🔄 Open"}
                </span>
                <span className="text-[var(--muted-foreground)] text-sm">
                  #{pr.number}
                </span>
              </div>

              <h4 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                {pr.title}
              </h4>

              <div className="flex items-center space-x-4 text-sm text-[var(--muted-foreground)]">
                <div className="flex items-center space-x-2">
                  <Image
                    src={pr.user.avatar_url}
                    alt={pr.user.login}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{pr.user.login}</span>
                </div>
                <span>created {formatDate(pr.created_at)}</span>
                {pr.merged_at && <span>merged {formatDate(pr.merged_at)}</span>}
              </div>
            </div>

            <a
              href={pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              View on GitHub →
            </a>
          </div>
        </div>

        {/* GitHub Diff View */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-[var(--foreground)]">
              {focusFile ? "Arm.java Changes" : "Files Changed"}
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

          {files.map((file, index) => (
            <div
              key={index}
              className="border border-[var(--border)] rounded-lg overflow-hidden"
            >
              <div className="bg-[var(--muted)] px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-medium text-[var(--foreground)]">
                    {file.filename}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      file.status === "added"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : file.status === "removed"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                    }`}
                  >
                    {file.status}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  {file.additions > 0 && (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      +{file.additions}
                    </span>
                  )}
                  {file.deletions > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      -{file.deletions}
                    </span>
                  )}
                </div>
              </div>

              {/* GitHub-style diff */}
              {file.patch && (
                <div className="overflow-x-auto">{renderDiff(file.patch)}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Workshop Context */}
      <div className="bg-gradient-to-r from-primary-50 to-concept-50 dark:from-primary-900/20 dark:to-concept-900/20 rounded-lg p-6">
        <h5 className="font-semibold text-[var(--foreground)] mb-3">
          🎓 Workshop Learning
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
