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

export default function GithubPageWithPR({ repository, filePath, branch, pullRequestNumber, focusFile }: GithubPageWithPRProps) {

  const [activeTab, setActiveTab] = useState<"ide" | "diff">("ide");

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab("ide")}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === "ide"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
          >
            💻 Final Implementation
          </button>
          <button
            onClick={() => setActiveTab("diff")}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === "diff"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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