"use client";

import { useState } from "react";
import GitHubPage from "./GitHubPage";
import GitHubPR from "./GitHubPR";

interface GithubPageWithPRProps {
  repository: string;
  filePath: string;
  branch?: string;
  pullRequestNumber: number;
  focusFile: string;
}

export default function GithubPageWithPR({
  repository,
  filePath,
  branch,
  pullRequestNumber,
  focusFile,
}: GithubPageWithPRProps) {
  const [activeTab, setActiveTab] = useState<"ide" | "diff">("ide");

  return (
    <div className="card">
      <div className="border-b border-[var(--border)]">
        <div className="flex">
          <button
            onClick={() => setActiveTab("ide")}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === "ide"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            💻 Final Implementation
          </button>
          <button
            onClick={() => setActiveTab("diff")}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === "diff"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            🔄 GitHub Changes
          </button>
        </div>
      </div>
      <div className="p-0">
        {activeTab === "ide" ? (
          <div>
            <GitHubPage
              repository={repository}
              filePath={filePath}
              branch={branch}
              className="m-0"
            />
          </div>
        ) : (
          <div>
            <GitHubPR
              repository={repository}
              pullRequestNumber={pullRequestNumber}
              focusFile={focusFile}
              className="m-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
