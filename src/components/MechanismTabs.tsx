"use client";

import { ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import GitHubPageWithPR from "@/components/GitHubPageWithPR";
import CodeWalkthrough from "@/components/CodeWalkthrough";
import ComparisonTable from "@/components/ComparisonTable";

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

function MechanismPanel({ content }: { content: MechanismContent }) {
  return (
    <div className="p-6 space-y-6">
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

      <GitHubPageWithPR
        repository={content.repository}
        filePath={content.filePath}
        branch={content.branch}
        pullRequestNumber={content.pullRequestNumber}
        focusFile={content.focusFile}
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

export default function MechanismTabs({
  armContent,
  flywheelContent,
  sectionTitle,
}: MechanismTabsProps) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        {sectionTitle}
      </h2>

      <Tabs.Root defaultValue="arm" className="card">
        <Tabs.List className="flex border-b border-[var(--border)]">
          <Tabs.Trigger
            value="arm"
            className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 transition-colors"
          >
            Arm Mechanism
          </Tabs.Trigger>
          <Tabs.Trigger
            value="flywheel"
            className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 transition-colors"
          >
            Flywheel Mechanism
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="arm">
          <MechanismPanel content={armContent} />
        </Tabs.Content>
        <Tabs.Content value="flywheel">
          <MechanismPanel content={flywheelContent} />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
