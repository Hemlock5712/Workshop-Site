interface ComparisonTableProps {
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  className?: string;
  /**
   * Tone of each side. Defaults pick natural before/after coloring —
   * `err` (red) for the "old way", `ok` (green) for the "new way".
   * Pass explicit tones for non-before/after comparisons.
   */
  leftTone?: ComparisonTone;
  rightTone?: ComparisonTone;
  // Legacy per-side className escape hatches — kept for back-compat.
  leftBlockClassName?: string;
  rightBlockClassName?: string;
  leftTitleClassName?: string;
  rightTitleClassName?: string;
  leftListClassName?: string;
  rightListClassName?: string;
}

type ComparisonTone = "ok" | "err" | "info" | "warn" | "neutral";

const toneMap: Record<
  ComparisonTone,
  { stripe: string; label: string; bullet: string }
> = {
  ok: { stripe: "var(--ok)", label: "var(--ok)", bullet: "+" },
  err: { stripe: "var(--err)", label: "var(--err)", bullet: "−" },
  info: { stripe: "var(--info)", label: "var(--info)", bullet: "·" },
  warn: { stripe: "var(--accent)", label: "var(--accent)", bullet: "!" },
  neutral: {
    stripe: "var(--line)",
    label: "var(--fg-dim)",
    bullet: "·",
  },
};

function Side({
  title,
  items,
  tone,
  blockClass,
  titleClass,
  listClass,
}: {
  title: string;
  items: string[];
  tone: ComparisonTone;
  blockClass: string;
  titleClass: string;
  listClass: string;
}) {
  const t = toneMap[tone];
  const hasLegacyClasses = Boolean(
    blockClass.length || titleClass.length || listClass.length
  );
  // Respect any legacy override classes pages still pass in. Otherwise
  // use the new module + stripe styling.
  return (
    <div
      className={hasLegacyClasses ? blockClass : "rounded-md p-4"}
      style={
        hasLegacyClasses
          ? undefined
          : {
              background: "var(--bg-elev)",
              border: "1px solid var(--line)",
              borderLeftWidth: 3,
              borderLeftColor: t.stripe,
            }
      }
    >
      <h4
        className={titleClass || "mb-2 text-sm font-semibold"}
        style={
          titleClass
            ? undefined
            : {
                color: t.label,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: 11,
              }
        }
      >
        {title}
      </h4>
      <ul
        className={`text-sm ${listClass || ""}`}
        style={
          listClass
            ? undefined
            : {
                color: "var(--fg-mute)",
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }
        }
      >
        {items.map((item, index) => (
          <li
            key={index}
            style={
              listClass
                ? undefined
                : {
                    display: "flex",
                    gap: 8,
                    alignItems: "baseline",
                  }
            }
          >
            {!listClass && (
              <span
                aria-hidden
                style={{ color: t.label, flexShrink: 0, fontWeight: 600 }}
              >
                {t.bullet}
              </span>
            )}
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ComparisonTable({
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
  className = "",
  leftTone = "err",
  rightTone = "ok",
  leftBlockClassName = "",
  rightBlockClassName = "",
  leftTitleClassName = "",
  rightTitleClassName = "",
  leftListClassName = "",
  rightListClassName = "",
}: ComparisonTableProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
      <Side
        title={leftTitle}
        items={leftItems}
        tone={leftTone}
        blockClass={leftBlockClassName}
        titleClass={leftTitleClassName}
        listClass={leftListClassName}
      />
      <Side
        title={rightTitle}
        items={rightItems}
        tone={rightTone}
        blockClass={rightBlockClassName}
        titleClass={rightTitleClassName}
        listClass={rightListClassName}
      />
    </div>
  );
}
