interface ComparisonTableProps {
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  className?: string;
  /**
   * Tone of each side. Defaults are the before/after pair — `err` for the old
   * way, `ok` for the new. Pass explicit tones for comparisons that aren't
   * a correction.
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

/**
 * Two columns, side by side, separated by a rule.
 *
 * Each side is a mono heading over a list, with a marker character carrying
 * the tone. The markers do the work the old coloured card backgrounds did,
 * and they survive being printed, screenshotted, or read by someone who can't
 * tell the red panel from the green one.
 */
const toneMap: Record<
  ComparisonTone,
  { label: string; bullet: string; rule: string }
> = {
  ok: { label: "var(--ok)", bullet: "+", rule: "var(--ok)" },
  err: { label: "var(--err)", bullet: "−", rule: "var(--err)" },
  info: { label: "var(--accent)", bullet: "·", rule: "var(--rule)" },
  warn: { label: "var(--accent)", bullet: "!", rule: "var(--accent)" },
  neutral: { label: "var(--tx3)", bullet: "·", rule: "var(--rule)" },
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

  return (
    <div
      className={hasLegacyClasses ? blockClass : "pt-3"}
      style={
        hasLegacyClasses ? undefined : { borderTop: `2px solid ${t.rule}` }
      }
    >
      <h4
        className={titleClass || "mono mb-3"}
        style={
          titleClass
            ? undefined
            : {
                color: t.label,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: 9.5,
              }
        }
      >
        {title}
      </h4>
      <ul
        className={listClass || ""}
        style={
          listClass
            ? undefined
            : {
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                lineHeight: 1.5,
                color: "var(--tx2)",
              }
        }
      >
        {items.map((item, index) => (
          <li
            key={index}
            style={
              listClass
                ? undefined
                : { display: "flex", gap: 10, alignItems: "baseline" }
            }
          >
            {!listClass && (
              <span
                aria-hidden="true"
                className="mono shrink-0"
                style={{ color: t.label, fontSize: 13 }}
              >
                {t.bullet}
              </span>
            )}
            <span
              className="lesson-prose"
              dangerouslySetInnerHTML={{ __html: item }}
            />
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
    <div
      className={`measure-wide grid gap-8 md:grid-cols-2 md:gap-10 ${className}`.trim()}
    >
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
