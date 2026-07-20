import { AlertTriangle } from "lucide-react";

/**
 * Site-wide notice that the content tracks the in-progress WPILib 2027
 * alpha. Shown above the header on every workshop page.
 */
export default function AlphaBanner() {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-center text-[13px] font-medium bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
      role="status"
    >
      <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>
        Heads up: WPILib 2027 is still in alpha. These pages are changing
        quickly and aren&apos;t stable or finished yet — expect edits as the
        APIs settle.
      </span>
    </div>
  );
}
