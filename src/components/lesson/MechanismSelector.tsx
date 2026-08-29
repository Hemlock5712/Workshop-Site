"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  DEFAULT_MECHANISM,
  MECHANISM_IDS,
  MECHANISM_STORAGE_KEY,
  MECHANISMS,
  type MechanismId,
} from "@/data/mechanisms";

/**
 * The question at the top of every mechanism lesson: which one are you
 * building today?
 *
 * It writes `data-mechanism` onto `<html>` and remembers the answer in
 * `localStorage`, so a student answers it once and the rest of the course
 * follows them. The inline script in the root layout replays it before first
 * paint on the next page.
 *
 * ## Why the selected state is styled in CSS and not from this component's state
 *
 * The attribute is already on `<html>` when the server HTML paints, and the
 * content under it is already correct. If the ring around the chosen box came
 * from React state it would be wrong for one frame on every page load — the
 * lesson would read "Flywheel" while the box said Arm. So the ring is an
 * attribute selector in `globals.css`, and this component's state exists only
 * to carry `aria-checked`, which cannot be set from CSS. Screen reader
 * semantics catch up on mount; the visible answer is never wrong.
 *
 * A radiogroup rather than two buttons or a tab list: this is one question with
 * two answers, exactly one of which is true, and that is what a student is
 * being asked.
 */
export default function MechanismSelector() {
  const [choice, setChoice] = useState<MechanismId>(DEFAULT_MECHANISM);

  useEffect(() => {
    const current = document.documentElement.dataset.mechanism;
    if (current === "arm" || current === "flywheel") setChoice(current);
  }, []);

  const pick = (id: MechanismId) => {
    const root = document.documentElement;
    root.dataset.mechanism = id;
    setChoice(id);
    try {
      window.localStorage.setItem(MECHANISM_STORAGE_KEY, id);
    } catch {
      // Private browsing, or storage turned off. The choice still holds for
      // this page; it just will not follow the student to the next one.
    }

    // The swap animation is opt-in per switch rather than a standing rule, or
    // every block on the page would animate itself in on first load and the
    // lesson would arrive in pieces. Cleared on a timer rather than on
    // `animationend`, because a dozen elements each fire that event and only
    // the last one means anything.
    root.dataset.mechAnim = "";
    window.clearTimeout(clearAnim);
    clearAnim = window.setTimeout(() => {
      delete root.dataset.mechAnim;
    }, 420);
  };

  return (
    <section
      className="measure"
      aria-labelledby="mechanism-question"
      data-mech-selector
    >
      <h2
        id="mechanism-question"
        className="m-0 mb-flow"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-lede)",
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          color: "var(--tx)",
        }}
      >
        What mechanism are you working on?
      </h2>

      <div
        role="radiogroup"
        aria-labelledby="mechanism-question"
        className="grid gap-flow sm:grid-cols-2"
      >
        {MECHANISM_IDS.map((id) => {
          const m = MECHANISMS[id];
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={choice === id}
              data-mech-choice={id}
              onClick={() => pick(id)}
              className="mech-choice"
            >
              <span className="mech-choice-name">{m.name}</span>
              {/* Last in the DOM as well as on the right, so a screen reader
                  reaches the name first and never has to step over the
                  picture. `aria-hidden`, and no alt text worth reading: the
                  render is here to be recognised at a glance, and the button
                  has already said which mechanism it is. "The single-jointed
                  arm on its bench mount, Arm" reads the answer twice. */}
              <span className="mech-choice-avatar" aria-hidden="true">
                <Image
                  src={m.image}
                  alt=""
                  width={144}
                  height={144}
                  sizes="72px"
                />
              </span>
            </button>
          );
        })}
      </div>

      <p className="mech-choice-foot">
        The lesson below is written for the one you pick. Switch back any time
        to read it for the other.
      </p>
    </section>
  );
}

/** Module-scope so a fast double switch cancels the first timer, not a stale one. */
let clearAnim = 0;
