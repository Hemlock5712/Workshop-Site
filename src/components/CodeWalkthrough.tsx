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

/**
 * The explanation half of an implementation section.
 *
 * No frame of its own. It used to be a `bg-[var(--bg2)]` panel bordered in
 * `--ok` sitting inside a `.card` that is also `--bg2`: the background was
 * invisible, the border spent a signal colour on something that signals
 * nothing (a walkthrough is not a success), and the `p-6` was a second inset
 * on top of the parent's — the pixel that put this heading one to the right of
 * its sibling. The enclosing block owns the inset; this owns the content.
 */
export default function CodeWalkthrough({
  leftSection,
  rightSection,
  nextStepText,
  className = "",
}: CodeWalkthroughProps) {
  return (
    <div className={`min-w-0 ${className}`.trim()}>
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

      {/* The next step. No size class at all now, so it takes the reading
          treatment the `.lesson-body` default gives every other paragraph:
          this is a full sentence of teaching copy, and `text-note` had it at
          13px Newsreader across the whole measure — the caption rung doing a
          paragraph's job. The panel it used to sit in was `--bg2` on `--bg2`,
          invisible, and one more inset. */}
      <div className="mt-flow">
        <p className="flex items-start gap-2">
          <ArrowRightCircle
            className="mt-1 w-4 h-4 shrink-0 text-[var(--accent)]"
            aria-hidden="true"
          />
          <span>{nextStepText}</span>
        </p>
      </div>
    </div>
  );
}
