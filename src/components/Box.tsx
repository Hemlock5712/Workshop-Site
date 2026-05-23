import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Only the variants actually used in the codebase
export type BoxVariant =
  | "concept" // Concept explanation boxes with left border
  | "alert-warning" // Amber warning alerts
  | "alert-info" // Sky blue informational alerts
  | "alert-tip" // Indigo tip/suggestion alerts
  | "alert-success"; // Green summary / "got it" callouts

interface BoxProps {
  variant: BoxVariant;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  // Concept variant specific props
  code?: ReactNode;
  uses?: ReactNode;
}

/**
 * Alert variants are styled as a neutral card with a colored 3-pixel left
 * stripe — the redesign brief's "calmness sweep" replaces the previous
 * tinted-wash backgrounds. Color lives only in the stripe and the icon
 * tint; the body sits on `--card` so text contrast doesn't depend on the
 * tint at every breakpoint and theme.
 */
const alertAccent: Record<
  "alert-warning" | "alert-info" | "alert-tip" | "alert-success",
  { stripe: string; icon: string }
> = {
  "alert-warning": {
    stripe: "border-l-amber-500 dark:border-l-amber-400",
    icon: "text-amber-600 dark:text-amber-400",
  },
  "alert-info": {
    stripe: "border-l-sky-500 dark:border-l-sky-400",
    icon: "text-sky-600 dark:text-sky-400",
  },
  "alert-tip": {
    stripe: "border-l-indigo-500 dark:border-l-indigo-400",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
  "alert-success": {
    stripe: "border-l-emerald-500 dark:border-l-emerald-400",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
};

const conceptStyles = {
  container: "bg-[var(--muted)] border-[var(--border)]",
  title: "text-lg font-bold text-[var(--foreground)]",
  text: "text-[var(--foreground)] text-sm",
};

export default function Box({
  variant,
  title,
  subtitle,
  children,
  icon,
  className,
  code,
  uses,
}: BoxProps) {
  // Alert rendering (warning, info, tip)
  if (variant !== "concept") {
    const accent = alertAccent[variant];
    return (
      <div
        className={cn(
          "rounded-lg border border-[var(--border)] border-l-[3px] bg-[var(--card)] p-4",
          accent.stripe,
          className
        )}
        role="note"
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div className={cn("mt-0.5 shrink-0", accent.icon)}>{icon}</div>
          )}
          <div className="space-y-1 text-sm text-[var(--foreground)]">
            {title && <p className="font-semibold">{title}</p>}
            <div className="text-[var(--muted-foreground)]">{children}</div>
          </div>
        </div>
      </div>
    );
  }

  // Concept rendering — kept as-is (this variant was already an
  // accent-stripe-on-neutral design)
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg p-6 border-l-4",
        conceptStyles.container,
        className
      )}
    >
      {title && <h4 className={conceptStyles.title}>{title}</h4>}
      {subtitle && (
        <p className="text-[var(--foreground)] text-sm font-semibold">
          {subtitle}
        </p>
      )}
      <div className={cn(conceptStyles.text, "flex-1")}>{children}</div>
      {code && (
        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
          {code}
        </div>
      )}
      {uses && (
        <div className="text-[var(--foreground)] text-sm">
          <strong>When to use:</strong>
          <br />
          {uses}
        </div>
      )}
    </div>
  );
}
