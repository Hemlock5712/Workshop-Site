"use client";

/**
 * The whole curriculum, on demand. Opens from the rail's MENU button.
 *
 * Shows every lesson grouped by section, numbered in course order, with a
 * DONE flag on the ones already finished and the current lesson in accent.
 * The point is that a student can always answer "where am I in this?" without
 * that question costing screen space while they read.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useShell } from "@/contexts/ShellContext";
import { useProgress } from "@/lib/useProgress";
import { getLessonGroups, getSidebarLabel, LESSON_COUNT } from "@/data/lessons";

export default function CurriculumDrawer() {
  const { navOpen, closeNav } = useShell();
  const pathname = usePathname();
  const { completed } = useProgress();
  const panelRef = useRef<HTMLDivElement>(null);
  const returnToRef = useRef<HTMLElement | null>(null);
  const groups = getLessonGroups();

  const doneCount = completed.size;
  const donePct = Math.round((doneCount / LESSON_COUNT) * 100);

  // Move focus into the panel on open so the first Tab lands inside the drawer
  // rather than back on the page behind it — and hand it back to whatever
  // opened the drawer on close. Closing a trap without returning focus drops
  // the reader on `<body>`, which here means losing both their place in the
  // tab order and the ability to arrow-scroll at all.
  useEffect(() => {
    if (navOpen) {
      returnToRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      panelRef.current?.focus();
      return;
    }

    const returnTo = returnToRef.current;
    returnToRef.current = null;
    // The trigger can be gone: the drawer closes on navigation too, and the
    // page it was rendered on may no longer exist.
    if (returnTo?.isConnected) returnTo.focus();
  }, [navOpen]);

  // Keep focus in the panel while it's open. A drawer that covers the page but
  // lets Tab walk into the hidden content behind it is unusable on a keyboard.
  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  if (!navOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <button
        type="button"
        onClick={closeNav}
        aria-label="Close curriculum menu"
        className="absolute inset-0 cursor-default"
        style={{
          background: "oklch(0.1 0.03 265 / 0.62)",
          backdropFilter: "blur(3px)",
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Curriculum"
        tabIndex={-1}
        className="relative h-full w-[min(560px,86vw)] overflow-y-auto px-6 py-[34px] focus:outline-none sm:px-10"
        style={{
          background: "var(--bg2)",
          borderRight: "1px solid var(--rule)",
          animation: "rise 0.24s ease-out",
        }}
      >
        <div className="mb-[26px] flex items-baseline justify-between gap-4">
          <span className="flex min-w-0 items-center gap-3.5">
            <span
              className="mono whitespace-nowrap"
              style={{
                fontSize: "var(--text-micro)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--tx3)",
              }}
            >
              Curriculum
            </span>
            <span
              className="hidden h-[3px] w-[90px] overflow-hidden rounded-sm sm:block"
              style={{ background: "var(--rule-soft)" }}
              aria-hidden="true"
            >
              {/* `scaleX` rather than `width`: animating width relayouts the
                  fill on every frame, and this one runs while the drawer is
                  opening. The transform is composited, and on a plain bar the
                  result is pixel-identical. */}
              <span
                className="block h-full w-full origin-left"
                style={{
                  transform: `scaleX(${donePct / 100})`,
                  background: "var(--accent)",
                  transition: "transform 0.45s cubic-bezier(0.2,0.7,0.3,1)",
                }}
              />
            </span>
            <span
              className="mono whitespace-nowrap"
              style={{
                fontSize: "var(--text-micro)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              {String(doneCount).padStart(2, "0")} / {LESSON_COUNT} done
            </span>
          </span>
          {/* The label is 11px mono with no padding, which made the control
              itself ~55×17px — under the 24px floor, on the primary dismiss
              for a full-screen overlay, on a phone. The backdrop behind it is
              also a close button and does meet the size, so this was never a
              hard failure, but it is the affordance a reader aims at. Padding
              and a 44px floor below `sm`; the label is unchanged. */}
          <button
            type="button"
            onClick={closeNav}
            className="mono -mr-2.5 flex min-h-11 shrink-0 cursor-pointer items-center border-0 bg-transparent px-2.5 sm:min-h-0 sm:py-1"
            style={{
              fontSize: "var(--text-meta)",
              letterSpacing: "0.1em",
              color: "var(--tx3)",
            }}
          >
            CLOSE ✕
          </button>
        </div>

        <Link
          href="/"
          onClick={closeNav}
          className="mx-[-14px] mb-6 flex items-center gap-3 rounded-[4px] px-3.5 py-3 text-note font-semibold transition-colors"
          style={{
            border: "1px solid var(--rule)",
            background: "var(--bg3)",
            color: "var(--tx)",
          }}
        >
          <Image
            src="/images/gray-matter-logo.jpg"
            alt=""
            width={26}
            height={26}
            quality={95}
            className="h-[26px] w-[26px] rounded-[5px]"
          />
          Home
          <span
            className="mono ml-auto hidden font-normal sm:inline"
            style={{
              fontSize: "var(--text-micro)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--tx3)",
            }}
          >
            Workshop overview
          </span>
        </Link>

        {groups.map((group) => (
          <div key={group.id} className="mb-[30px]">
            <div
              className="mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-2"
              style={{ borderBottom: "1px solid var(--rule-soft)" }}
            >
              <span
                className="mono"
                style={{
                  fontSize: "var(--text-micro)",
                  letterSpacing: "0.12em",
                  color: "var(--accent)",
                }}
              >
                {group.num}
              </span>
              <span
                className="display"
                style={{
                  fontSize: "var(--text-title)",
                  lineHeight: 1,
                  color: "var(--tx)",
                }}
              >
                {group.title}
              </span>
              {group.unfinished && (
                <span
                  className="mono whitespace-nowrap rounded-[3px] px-1.5 py-0.5"
                  style={{
                    fontSize: "var(--text-micro)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--tx3)",
                    border: "1px solid var(--rule)",
                  }}
                >
                  In progress
                </span>
              )}
              <span
                className="mono ml-auto whitespace-nowrap"
                style={{ fontSize: "var(--text-micro)", color: "var(--tx3)" }}
              >
                {String(group.lessons.length).padStart(2, "0")} lessons
              </span>
            </div>

            {/* The pages stay open. This is the label that stops a student
                treating a half-written workshop as finished material. It is a
                mono line and a hairline chip, not a colour: `--warn` does not
                exist here on purpose. */}
            {group.unfinished && (
              <p
                className="mb-2.5"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--text-note)",
                  lineHeight: 1.45,
                  color: "var(--tx3)",
                }}
              >
                {group.unfinished}
              </p>
            )}

            <div className="flex flex-col">
              {group.lessons.map((lesson) => {
                const current = pathname === lesson.slug;
                const done = completed.has(lesson.slug);
                return (
                  <Link
                    key={lesson.slug}
                    href={lesson.slug}
                    onClick={closeNav}
                    aria-current={current ? "page" : undefined}
                    // `min-h-11` below `sm`. These are 29 rows of tap target
                    // stacked on a phone, and at `py-[7px]` they were ~39px —
                    // close enough to be hit, close enough to mis-hit the one
                    // above. Desktop keeps the tighter rhythm.
                    className="-mx-2.5 flex min-h-11 items-center gap-3 rounded-[3px] px-2.5 py-[7px] transition-colors hover:bg-[var(--accent-soft)] sm:min-h-0 sm:items-baseline"
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "var(--text-aside)",
                      color: current ? "var(--accent)" : "var(--tx2)",
                    }}
                  >
                    <span
                      className="mono tabular w-[22px] shrink-0"
                      style={{
                        fontSize: "var(--text-micro)",
                        color: current ? "var(--accent)" : "var(--tx3)",
                      }}
                    >
                      {lesson.num}
                    </span>
                    <span className="min-w-0">
                      {getSidebarLabel(lesson)}
                      {lesson.optional && (
                        <span
                          className="mono ml-2"
                          style={{
                            fontSize: "var(--text-micro)",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--tx3)",
                          }}
                        >
                          optional
                        </span>
                      )}
                    </span>
                    {done && (
                      <span
                        className="mono ml-auto shrink-0"
                        style={{
                          fontSize: "var(--text-micro)",
                          letterSpacing: "0.1em",
                          color: "var(--accent)",
                        }}
                      >
                        DONE
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
