"use client";

import * as Tabs from "@radix-ui/react-tabs";
import ComparisonWithCodeWalkthrough, {
  type ImplementationContent,
} from "@/components/ComparisonWithCodeWalkthrough";

interface MechanismTabsProps {
  armContent: ImplementationContent;
  flywheelContent: ImplementationContent;
  sectionTitle: string;
}

/**
 * Tab pair (Arm / Flywheel) over the standard ComparisonWithCodeWalkthrough
 * panel. Used by every "Workshop Implementation" section in the codebase.
 * For single-mechanism implementations, use ComparisonWithCodeWalkthrough
 * directly without the tabs.
 */
export default function MechanismTabs({
  armContent,
  flywheelContent,
  sectionTitle,
}: MechanismTabsProps) {
  return (
    <section className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold text-[var(--tx)]">{sectionTitle}</h2>

      <Tabs.Root defaultValue="arm" className="card">
        <Tabs.List className="flex border-b border-[var(--border)]">
          <Tabs.Trigger
            value="arm"
            className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] data-[state=active]:border-[var(--accent)] data-[state=active]:text-[var(--tx2)] transition-colors"
          >
            Arm Mechanism
          </Tabs.Trigger>
          <Tabs.Trigger
            value="flywheel"
            className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] data-[state=active]:border-[var(--accent)] data-[state=active]:text-[var(--tx2)] transition-colors"
          >
            Flywheel Mechanism
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="arm">
          <ComparisonWithCodeWalkthrough content={armContent} />
        </Tabs.Content>
        <Tabs.Content value="flywheel">
          <ComparisonWithCodeWalkthrough content={flywheelContent} />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
