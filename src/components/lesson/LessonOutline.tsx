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
  initialEntries = [],
}: {
  branch?: string;
  time?: string;
  /**
   * The sections as `PageTemplate` reads them off its own children, so the rail
   * is in the HTML the server sends. Scanning the DOM is still the source of
   * truth once mounted — this only removes the window before that happens.
   *
   * That window was not theoretical. On /pid-control and /drive-to-tag-inline,
   * the two heaviest pages, hydration takes 3-4 seconds on this dev server, and
   * for all of it the rail rendered nothing while the column beside it sat
   * empty except for the time estimate. It read as a broken page, and it was
   * the first thing the site's owner reported. It also meant the outline
   * vanished completely wherever JS failed.
   */
  initialEntries?: Entry[];
}) {
  const pathname = usePathname();
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [active, setActive] = useState<string>(initialEntries[0]?.id ?? "");

  // Collect sections. Re-runs per route so client navigation rebuilds it.
  useEffect(() => {
    // A mechanism lesson ships both readings and hides one, so the DOM holds
    // sections the reader cannot see. `offsetParent` is null for anything
    // under a `display: none` ancestor, which is exactly the test: a section
    // with no box is a section that is not on this page, and listing it in the
    // rail would offer a link that scrolls nowhere.
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-sec]")
    ).filter((n) => n.offsetParent !== null);
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
                  className="flex items-center gap-2.5 py-[5px] text-note leading-[1.35]"
                  style={{ color: on ? "var(--tx)" : "var(--tx3)" }}
                >
                  {/* The tick grows by transform, not by width: the third of
                      the site's three animated indicators, and the same
                      reasoning as the two progress fills in the shell. Fixed
                      16px box, scaled down to 8px when inactive, so the row's
                      layout never depends on which section you are in. */}
                  <span
                    aria-hidden="true"
                    className="block h-[1.5px] w-4 shrink-0 origin-left"
                    style={{
                      transform: on ? "scaleX(1)" : "scaleX(0.5)",
                      background: on ? "var(--accent)" : "var(--rule)",
                      transition: "transform 0.25s",
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
                style={{ fontSize: "var(--text-meta)", color: "var(--accent)" }}
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
                fontSize: "var(--text-note)",
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
