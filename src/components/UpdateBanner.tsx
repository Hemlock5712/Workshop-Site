import { AlertTriangle } from "lucide-react";

/**
 * Site-wide notice that the workshop is mid-migration to the WPILib 2027
 * stack (Commands v3 / OpModes). Mounted under the header on every workshop
 * page so visitors know some pages may be incomplete or still show older
 * (Commands v2) code while the update is in progress. Remove this component
 * from the layout once the migration is finished.
 */
export default function UpdateBanner() {
  return (
    <div
      role="status"
      className="flex flex-shrink-0 items-center justify-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-xs font-medium text-amber-900 sm:text-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden />
      <span>
        Heads up — this site is being updated for{" "}
        <strong>WPILib 2027 (Commands v3)</strong>. Some pages may be incomplete
        or still show older (Commands v2) code while we migrate.
      </span>
    </div>
  );
}
