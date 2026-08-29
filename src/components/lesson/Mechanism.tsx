import type { ReactNode } from "react";
import {
  MECHANISM_IDS,
  MECHANISMS,
  type MechanismId,
  type MechanismSlot,
} from "@/data/mechanisms";

/**
 * The two pieces a lesson uses to be about one mechanism at a time.
 *
 *   <M k="file" />              an inline slot — "Arm.java" or "Flywheel.java"
 *   <Mech for="arm">…</Mech>    a block that only one mechanism reads
 *
 * Both are server components, and that is deliberate. Every variant is in the
 * HTML; CSS hides the one the reader did not pick, keyed off
 * `data-mechanism` on `<html>`. Three things fall out of that, and all three
 * are the reason it is not a client component holding state:
 *
 *  - `CodeBlock` is an async server component running Shiki. A client-side
 *    swap could not render one, so the choice would have to become a prop
 *    threaded from the page, and the page would have to become a client
 *    component with no highlighter.
 *  - The attribute is set by an inline script before first paint, so a
 *    flywheel student never sees a frame of the arm. No hydration flash, and
 *    no wrong content in a screenshot.
 *  - Both readings are in the server HTML, so the search index and a visitor
 *    with no JavaScript see the whole lesson.
 *
 * `display: none` keeps the hidden branch out of the accessibility tree, out
 * of Ctrl+F, and out of anything the reader copies.
 */

/**
 * One word from the mechanism profile, dropped into a sentence.
 *
 * Use this whenever the sentence is the same for both mechanisms. It renders
 * both words and shows one, which reads as a single word and cannot fall out
 * of sync with the other mechanism's copy of the sentence, because there is no
 * other copy.
 *
 * Renders bare text with no wrapper of its own beyond the two spans, so it is
 * safe inside `<code>`, `<strong>`, a heading, or a `title` prop.
 */
export function M({ k }: { k: MechanismSlot }) {
  return (
    <>
      {MECHANISM_IDS.map((id) => (
        <span key={id} data-mech-slot={id}>
          {MECHANISMS[id][k]}
        </span>
      ))}
    </>
  );
}

/**
 * Content only one mechanism reads: a code block, a paragraph, an aside, a
 * step in a list.
 *
 * The default wrapper is a `<span>` with `display: contents`, so it adds no
 * box of its own — a `<Mech>` around a code block leaves the block a direct
 * child of the lesson's flex stack, and a `<Mech>` inside a paragraph is valid
 * inline markup. Nothing about the layout changes because a fork is there.
 *
 * `as` replaces that wrapper where the parent's content model will not take a
 * span. A step that only the arm performs is `<Mech for="arm" as="li">`, not a
 * span wrapped around an `<li>`: a list may only contain list items, and the
 * span form leaves an ordered list numbering children it is not supposed to
 * have.
 *
 * Reach for this only when the content is genuinely different. A sentence that
 * differs by one word is an `<M>`, not two `<Mech>` blocks — see the note at
 * the top of `src/data/mechanisms.ts`.
 */
export function Mech({
  for: only,
  as: Tag = "span",
  className,
  children,
}: {
  for: MechanismId;
  /** Wrapper element. `li` inside a list, `div` inside a flex stack. */
  as?: "span" | "div" | "li" | "p";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag data-mech={only} className={className}>
      {children}
    </Tag>
  );
}
