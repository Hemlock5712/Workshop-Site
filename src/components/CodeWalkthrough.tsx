import { ArrowRightCircle, FileCode } from "lucide-react";
import ComparisonTable from "@/components/ComparisonTable";

interface WalkthroughItem {
  title: string;
  items: string[];
}

interface CodeWalkthroughProps {
  leftSection: WalkthroughItem;
  rightSection: WalkthroughItem;
  nextStepText: string;
  className?: string;
}

export default function CodeWalkthrough({
  leftSection,
  rightSection,
  nextStepText,
  className = "",
}: CodeWalkthroughProps) {
  return (
    <div
      className={`bg-[var(--bg2)] border border-[var(--ok)] rounded-lg p-6 ${className}`}
    >
      <h3 className="display m-0 mb-4 flex items-center gap-2 text-lede">
        <FileCode className="w-5 h-5" aria-hidden="true" />
        <span>Code Walkthrough</span>
      </h3>

      <ComparisonTable
        leftTitle={`${leftSection.title}:`}
        leftItems={leftSection.items}
        rightTitle={`${rightSection.title}:`}
        rightItems={rightSection.items}
        leftBlockClassName="text-[var(--tx2)]"
        rightBlockClassName="text-[var(--tx2)]"
        leftTitleClassName="font-semibold text-[var(--tx)] mb-2"
        rightTitleClassName="font-semibold text-[var(--tx)] mb-2"
      />

      <div className="bg-[var(--bg2)] p-4 rounded mt-4">
        <p className="flex items-center gap-2 text-note text-[var(--tx)]">
          <ArrowRightCircle className="w-4 h-4 text-[var(--accent)]" />
          <span>{nextStepText}</span>
        </p>
      </div>
    </div>
  );
}
