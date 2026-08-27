import type { ReactNode } from "react";

export interface FigureItem {
  /** Mono micro-label above the term — "Phase 1", "Region 2 · Constructor". */
  label?: string;
  /** The name of the thing. */
  term: ReactNode;
  /** Optional single line of code, set in the code panel's ink. */
  code?: string;
  /** The description. */
  body: ReactNode;
}

/**
 * Two or three parts of one thing, side by side.
 *
 * This exists because the pages kept reaching for `Box` to do it. Three phases
 * of a trapezoid, three regions of a mechanism file, two positions of one
 * switch, two spellings of a transition — each was a row of framed panels or,
 * worse, a row of tinted alerts, so a figure legend spent the page's whole
 * aside budget and a genuine warning had nothing left to stand out against.
 *
 * A definition list is what this is. The hairline above each column is the only
 * decoration, the label carries the ordering, and nothing here reads as a
 * warning because nothing here is one.
 *
 * `min-w-0` on every column for the reason spelled out on `.lesson-stack > *`:
 * grid children default to `min-width: auto`, and a `code` line like
 * `config.MotionMagic.MotionMagicCruiseVelocity` is one unbreakable token wider
 * than a phone.
 */
export default function FigureGrid({
  items,
  cols = 3,
}: {
  items: FigureItem[];
  cols?: 2 | 3;
}) {
  return (
    <dl
      className={`measure-wide m-0 grid gap-6 ${
        cols === 2 ? "sm:grid-cols-2" : "md:grid-cols-3"
      }`}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="min-w-0 pt-2.5"
          style={{ borderTop: "1px solid var(--rule)" }}
        >
          {item.label && <div className="micro mb-1.5">{item.label}</div>}
          <dt
            className="display m-0 mb-2 text-ui"
            style={{ color: "var(--tx)" }}
          >
            {item.term}
          </dt>
          <dd className="m-0">
            {item.code && (
              <div
                className="mono mb-2 p-2 text-meta"
                style={{
                  background: "#030718",
                  border: "1px solid var(--rule)",
                  borderRadius: 2,
                  color: "#dadee5",
                  overflowX: "auto",
                }}
              >
                {item.code}
              </div>
            )}
            <div
              className="text-aside"
              style={{
                fontFamily: "var(--font-serif)",
                lineHeight: 1.6,
                color: "var(--tx2)",
              }}
            >
              {item.body}
            </div>
          </dd>
        </div>
      ))}
    </dl>
  );
}
