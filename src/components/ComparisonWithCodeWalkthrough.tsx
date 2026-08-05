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
  /**
   * Defaults to `p-pad space-y-step`. This block owns the *only* inset in its
   * subtree — see the note on the component below — so an override should
   * change the rhythm, not the padding.
   */
  className?: string;
}

/**
 * One inset, not three.
 *
 * This used to be a `p-6` wrapper around three `p-6` panels, each of them
 * `bg-[var(--bg2)]` — the same colour as the `.card` MechanismTabs wraps them
 * in. So the panels were invisible as panels and the only thing their padding
 * did was indent the content a second time. Two of them differed from the
 * third by a 1px border, which is where /pid-control's 447 / 448 / 449 heading
 * edges came from: three sibling headings a pixel apart, which nobody chose.
 *
 * Now the wrapper carries `--spacing-pad` once and the three blocks below are
 * plain content, separated by the stack rhythm. Their headings share one left
 * edge with every other panel heading on the site.
 */
export default function ComparisonWithCodeWalkthrough({
  content,
  className = "p-pad space-y-step",
}: ComparisonWithCodeWalkthroughProps) {
  return (
    <div className={className}>
      {content.caution && <div>{content.caution}</div>}

      <div className="min-w-0">
        <h3 className="display m-0 mb-4 text-lede">
          Before &amp; After: Implementation
        </h3>
        {/* No className overrides: the default err/ok tones are exactly the
            before/after pair, and the overrides pinned this to the old tinted
            red and blue panels. */}
        <ComparisonTable
          leftTitle="Before"
          leftItems={content.beforeItems}
          rightTitle="After"
          rightItems={content.afterItems}
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
