"use client";

import { useState, ReactNode } from "react";
import GithubPageWithPR from "./GithubPageWithPR";
import CodeWalkthrough from "./CodeWalkthrough";
import ComparisonTable from "./ComparisonTable";

interface MechanismContent {
  beforeItems: string[];
  afterItems: string[];
  repository: string;
  filePath: string;
  branch: string;
  pullRequestNumber: number;
  focusFile: string;
  walkthrough: {
    leftTitle: string;
    leftItems: string[];
    rightTitle: string;
    rightItems: string[];
  };
  nextStepText: string;
  caution?: ReactNode;
}

interface MechanismTabsProps {
  armContent: MechanismContent;
  flywheelContent: MechanismContent;
  sectionTitle: string;
}

export default function MechanismTabs({
  armContent,
  flywheelContent,
  sectionTitle
}: MechanismTabsProps) {
  const [activeTab, setActiveTab] = useState<"arm" | "flywheel">("arm");

  const currentContent = activeTab === "arm" ? armContent : flywheelContent;

  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        {sectionTitle}
      </h2>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-[var(--border)]">
          <div className="flex">
            <button
              onClick={() => setActiveTab("arm")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "arm"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              🦾 Arm Mechanism
            </button>
            <button
              onClick={() => setActiveTab("flywheel")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "flywheel"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              ⚡ Flywheel Mechanism
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {currentContent.caution && (
            <div className="mb-6">{currentContent.caution}</div>
          )}
          {/* Before/After Implementation */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              🔄 Before → After: Implementation
            </h3>
            <ComparisonTable
              leftTitle="📋 Before"
              leftItems={currentContent.beforeItems}
              rightTitle="✅ After"
              rightItems={currentContent.afterItems}
              leftBlockClassName="before-block"
              rightBlockClassName="after-block"
              leftTitleClassName="before-title"
              rightTitleClassName="after-title"
            />
          </div>

          {/* GitHub Component */}
          <div className="mb-6">
            <GithubPageWithPR 
              repository={currentContent.repository}
              filePath={currentContent.filePath}
              branch={currentContent.branch}
              pullRequestNumber={currentContent.pullRequestNumber}
              focusFile={currentContent.focusFile}
            />
          </div>

          {/* Code Walkthrough */}
          <CodeWalkthrough 
            leftSection={{
              title: currentContent.walkthrough.leftTitle,
              items: currentContent.walkthrough.leftItems
            }}
            rightSection={{
              title: currentContent.walkthrough.rightTitle,
              items: currentContent.walkthrough.rightItems
            }}
            nextStepText={currentContent.nextStepText}
          />
        </div>
      </div>
    </section>
  );
}