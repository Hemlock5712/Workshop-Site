"use client";

import { ReactNode } from "react";
import GitHubContent from "@/components/GitHubContent";
import CodeWalkthrough from "@/components/CodeWalkthrough";
import ComparisonTable from "@/components/ComparisonTable";

/**
 * Implementation panel pattern: Before / After comparison, the live PR
 * diff from GitHub, and a two-column walkthrough explaining the change.
 *
 * Used standalone for any "here's the workshop's implementation" section.
 * `MechanismTabs` wraps two of these in a tab pair (arm + flywheel).
 */
export interface ImplementationContent {
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
  /** Optional callout rendered above the comparison (e.g. a Box alert). */
  caution?: ReactNode;
}

interface ComparisonWithCodeWalkthroughProps {
  content: ImplementationContent;
  /** Defaults to `p-6 space-y-6`; override for tighter / wider panels. */
  className?: string;
}

export default function ComparisonWithCodeWalkthrough({
  content,
  className = "p-6 space-y-6",
}: ComparisonWithCodeWalkthroughProps) {
  return (
    <div className={className}>
      {content.caution && <div>{content.caution}</div>}

      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Before &amp; After: Implementation
        </h3>
        <ComparisonTable
          leftTitle="Before"
          leftItems={content.beforeItems}
          rightTitle="After"
          rightItems={content.afterItems}
          leftBlockClassName="before-block"
          rightBlockClassName="after-block"
          leftTitleClassName="before-title"
          rightTitleClassName="after-title"
        />
      </div>

      <GitHubContent
        repository={content.repository}
        filePath={content.filePath}
        branch={content.branch}
        pr={{
          number: content.pullRequestNumber,
          focusFile: content.focusFile,
        }}
      />

      <CodeWalkthrough
        leftSection={{
          title: content.walkthrough.leftTitle,
          items: content.walkthrough.leftItems,
        }}
        rightSection={{
          title: content.walkthrough.rightTitle,
          items: content.walkthrough.rightItems,
        }}
        nextStepText={content.nextStepText}
      />
    </div>
  );
}
