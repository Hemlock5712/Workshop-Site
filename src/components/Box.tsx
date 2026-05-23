import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Only the variants actually used in the codebase
export type BoxVariant =
  | "concept" // Concept explanation boxes with left border
  | "alert-warning" // Amber warning alerts
  | "alert-info" // Sky blue informational alerts
  | "alert-tip" // Indigo tip/suggestion alerts
  | "alert-success" // Green summary / "got it" callouts
  | "alert-danger"; // Red "don't do this" / error callouts

interface BoxProps {
  variant: BoxVariant;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  /**
   * Optional mono "module-tag"-style micro-label rendered above the
   * title. Used to give a callout a category label like
   * "NOTE · GRAVITY" or "WATCH OUT · WINDUP". Free-form string.
   */
  tag?: string;
  // Concept variant specific props
  code?: ReactNode;
  uses?: ReactNode;
}

/**
 * Alert variants render as a neutral card with a 3-pixel left stripe
 * coloured by signal hue (--accent / --info / --ok / --err / --primary-lifted).
 * Body sits on --bg-elev so contrast doesn't depend on tinted backgrounds
 * at any breakpoint or theme.
 */
const alertAccent: Record<
  | "alert-warning"
  | "alert-info"
  | "alert-tip"
  | "alert-success"
  | "alert-danger",
  { stripe: string; iconColor: string }
> = {
  "alert-warning": {
    stripe: "var(--accent)",
    iconColor: "var(--accent)",
  },
  "alert-info": {
    stripe: "var(--info)",
    iconColor: "var(--info)",
  },
  "alert-tip": {
    stripe: "var(--primary-lifted)",
    iconColor: "var(--primary-lifted)",
  },
  "alert-success": {
    stripe: "var(--ok)",
    iconColor: "var(--ok)",
  },
  "alert-danger": {
    stripe: "var(--err)",
    iconColor: "var(--err)",
  },
};

const conceptStyles = {
  container: "bg-[var(--bg-elev)] border-[var(--line)]",
  title: "text-lg font-bold text-[var(--fg)]",
  text: "text-[var(--fg-mute)] text-sm",
};

export default function Box({
  variant,
  title,
  subtitle,
  children,
  icon,
  className,
  tag,
  code,
  uses,
}: BoxProps) {
  // Alert rendering (warning, info, tip, success, danger)
  if (variant !== "concept") {
    const accent = alertAccent[variant];
    return (
      <div
        className={cn(
          "rounded-md border p-4",
          "border-[var(--line)] bg-[var(--bg-elev)]",
          className
        )}
        style={{
          borderLeftWidth: 3,
          borderLeftColor: accent.stripe,
        }}
        role="note"
      >
        <div className="flex items-start gap-3">
          {icon && (
            <div
              className="mt-0.5 shrink-0"
              style={{ color: accent.iconColor }}
            >
              {icon}
            </div>
          )}
          <div className="space-y-1 text-sm" style={{ color: "var(--fg)" }}>
            {tag && (
              <div
                className="font-mono"
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: accent.iconColor,
                  marginBottom: 2,
                }}
              >
                {tag}
              </div>
            )}
            {title && (
              <p className="font-semibold" style={{ color: "var(--fg)" }}>
                {title}
              </p>
            )}
            <div style={{ color: "var(--fg-mute)" }}>{children}</div>
          </div>
        </div>
      </div>
    );
  }

  // Concept rendering — neutral card with thicker accent stripe + content blocks
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border p-6",
        conceptStyles.container,
        className
      )}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: "var(--accent)",
      }}
    >
      {tag && (
        <div
          className="font-mono"
          style={{
            fontSize: 10.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--accent)",
          }}
        >
          {tag}
        </div>
      )}
      {title && <h4 className={conceptStyles.title}>{title}</h4>}
      {subtitle && (
        <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
          {subtitle}
        </p>
      )}
      <div className={cn(conceptStyles.text, "flex-1")}>{children}</div>
      {code && (
        <div
          className="rounded p-3 text-xs"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--line-soft)",
            fontFamily: "var(--font-mono)",
            color: "var(--fg-mute)",
          }}
        >
          {code}
        </div>
      )}
      {uses && (
        <div className="text-sm" style={{ color: "var(--fg)" }}>
          <strong>When to use:</strong>
          <br />
          <span style={{ color: "var(--fg-mute)" }}>{uses}</span>
        </div>
      )}
    </div>
  );
}
