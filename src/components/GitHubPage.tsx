"use client";

import { useState, useEffect } from "react";
import CodeBlock from "./CodeBlock";

/**
 * GitHub file display component
 * Features:
 * - Fetches live file content from GitHub API
 * - IDE-style presentation with professional syntax highlighting
 * - File metadata (size, language, repository path)
 * - Direct links to GitHub for editing/viewing
 * - Automatic language detection from file extension
 * - Educational context for understanding code evolution
 */
interface GitHubPageProps {
  repository: string; // e.g., "Hemlock5712/2025-Workshop"
  filePath: string; // e.g., "src/main/java/frc/robot/subsystems/Arm.java"
  branch?: string; // defaults to "main"
  title?: string;
  description?: string;
  className?: string;
}

export default function GitHubPage({
  repository,
  filePath,
  branch = "main",
  title,
  description,
  className = "",
}: GitHubPageProps) {
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    size?: number;
    content: string;
  } | null>(null);

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        setLoading(true);

        // Fetch file content from GitHub API
        const response = await fetch(
          `https://api.github.com/repos/${repository}/contents/${filePath}?ref=${branch}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const data = await response.json();
        setFileInfo(data);

        // Decode base64 content
        const content = atob(data.content);
        setFileContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch file");
      } finally {
        setLoading(false);
      }
    };

    fetchFileData();
  }, [repository, filePath, branch]);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !fileContent) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6">
          <h3 className="text-red-800 dark:text-red-300 font-semibold mb-2">
            Failed to Load File
          </h3>
          <p className="text-red-600 dark:text-red-400 text-sm">
            {error || "File not found"}
          </p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">
            Repository: {repository}, File: {filePath}
          </p>
        </div>
      </div>
    );
  }

  const getLanguageFromExtension = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "java":
        return "java";
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "py":
        return "python";
      case "cpp":
      case "cc":
      case "cxx":
        return "cpp";
      case "c":
        return "c";
      case "h":
      case "hpp":
        return "cpp";
      case "json":
        return "json";
      case "xml":
        return "xml";
      case "yaml":
      case "yml":
        return "yaml";
      case "md":
        return "markdown";
      case "sh":
        return "bash";
      default:
        return "text";
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filename = filePath.split("/").pop() || filePath;
  const language = getLanguageFromExtension(filename);

  return (
    <div className={`${className}`}>
      {title && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
          )}
        </div>
      )}

      {/* File Header */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm mb-6 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-lg font-medium text-slate-900 dark:text-slate-100">
                {filename}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-medium">
                {language.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {fileInfo?.size && <span>{formatFileSize(fileInfo.size)}</span>}
              <a
                href={`https://github.com/${repository}/blob/${branch}/${filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                View on GitHub →
              </a>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {repository} / {filePath.replace(filename, "").replace(/\/$/, "")}
          </div>
        </div>

        {/* File Content */}
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

      {/* GitHub Context */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-6">
        <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          📁 Live from GitHub
        </h5>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          This file is displayed directly from the GitHub repository. Click
          &quot;View on GitHub&quot; to see the file in its repository context,
          view history, blame information, and make edits.
        </p>
      </div>
    </div>
  );
}
