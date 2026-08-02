"use client";

/**
 * The "on this page" rail.
 *
 * Reads the section list out of the DOM rather than taking it as a prop: every
 * `<LessonSection>` stamps `data-sec` and `data-sec-label`, and this scans for
 * them after mount. That means a page can never have an outline that disagrees
 * with its own headings, which is the failure mode of a hand-maintained list.
 *
 * The tick beside each entry grows when that section is the one you're in —
 * a position indicator that costs no colour and no extra text.
 */

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Entry {
  id: string;
  label: string;
}

export default function LessonOutline({
  branch,
  time,
}: {
  branch?: string;
  time?: string;
}) {
  const pathname = usePathname();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState<string>("");

  // Collect sections. Re-runs per route so client navigation rebuilds it.
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-sec]")
    );
    const found = nodes.map((n) => ({
      id: n.dataset.sec ?? "",
      label: n.dataset.secLabel ?? "",
    }));
    setEntries(found.filter((e) => e.id && e.label));
    setActive(found[0]?.id ?? "");
  }, [pathname]);

  // Active section = the last one whose top has passed under the sticky bar.
  // Scroll position, not intersection ratio: with sections of wildly different
  // heights (a 3-paragraph one above a 400-line code embed) "most visible"
  // picks the wrong answer constantly.
  useEffect(() => {
    if (!entries.length) return;
    const scroller = document.getElementById("main-content");
    if (!scroller) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      let current = entries[0]?.id ?? "";
      for (const entry of entries) {
        const el = document.getElementById(entry.id);
        if (el && el.getBoundingClientRect().top < 220) current = entry.id;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [entries]);

  const hasMeta = Boolean(branch || time);
  if (!entries.length && !hasMeta) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 hidden h-max self-start pt-2 min-[1240px]:block"
    >
      {entries.length > 0 && (
        <>
          <div className="micro mb-3.5">On this page</div>
          <div className="flex flex-col gap-0.5">
            {entries.map((entry) => {
              const on = active === entry.id;
              return (
                <a
                  key={entry.id}
                  href={`#${entry.id}`}
                  aria-current={on ? "true" : undefined}
                  className="flex items-center gap-2.5 py-[5px] text-[13px] leading-[1.35]"
                  style={{ color: on ? "var(--tx)" : "var(--tx3)" }}
                >
                  <span
                    aria-hidden="true"
                    className="block h-[1.5px] shrink-0"
                    style={{
                      width: on ? 16 : 8,
                      background: on ? "var(--accent)" : "var(--rule)",
                      transition: "width 0.25s",
                    }}
                  />
                  <span>{entry.label}</span>
                </a>
              );
            })}
          </div>
        </>
      )}

      {hasMeta && (
        <div
          className={entries.length ? "mt-[26px] pt-4" : "pt-0"}
          style={
            entries.length
              ? { borderTop: "1px solid var(--rule-soft)" }
              : undefined
          }
        >
          {branch && (
            <>
              <div className="micro mb-2">Branch</div>
              <div
                className="mono"
                style={{ fontSize: 12, color: "var(--accent)" }}
              >
                {branch}
              </div>
            </>
          )}
          {time && (
            <div
              className="mt-2.5"
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--tx3)",
              }}
            >
              {time}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
