"use client";

import { useState } from "react";
import GithubPageWithPR from "./GithubPageWithPR";

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
          {/* Before/After Implementation */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              🔄 Before → After: Implementation
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="before-block">
                <h4 className="before-title">📋 Before</h4>
                <ul className="text-sm space-y-1">
                  {currentContent.beforeItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="after-block">
                <h4 className="after-title">✅ After</h4>
                <ul className="text-sm space-y-1">
                  {currentContent.afterItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
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
          <div className="bg-learn-100 dark:bg-learn-900/20 border border-learn-200 dark:border-learn-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-learn-900 dark:text-learn-300 mb-4">🔍 Code Walkthrough</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-learn-800 dark:text-learn-200 mb-2">{currentContent.walkthrough.leftTitle}:</h4>
                <ul className="text-sm text-learn-700 dark:text-learn-300 space-y-1">
                  {currentContent.walkthrough.leftItems.map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-learn-800 dark:text-learn-200 mb-2">{currentContent.walkthrough.rightTitle}:</h4>
                <ul className="text-sm text-learn-700 dark:text-learn-300 space-y-1">
                  {currentContent.walkthrough.rightItems.map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded mt-4">
              <p className="text-indigo-800 dark:text-indigo-300 text-sm">
                <strong>💡 Next Step:</strong> {currentContent.nextStepText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}