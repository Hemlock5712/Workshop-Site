import { Mark } from "@/components/lesson/Prose";

interface KeyConceptSectionProps {
  /**
   * Optional. Most lessons now promote this sentence to the page's `<h1>` via
   * `PageTemplate`'s `title`, which leaves this component rendering the
   * opening paragraphs only — one heading per lesson opening, not two.
   */
  title?: string;
  description: string | string[];
  /** The one sentence to remember. Rendered highlighted, at the end. */
  concept: string;
  children?: React.ReactNode;
}

/**
 * The opening passage of a lesson: what this is about, in a few sentences,
 * ending on the one line worth carrying forward.
 *
 * No frame and no tag corner. It sits directly in the prose column because it
 * *is* prose — boxing the first thing on the page taught students that the
 * first thing on the page was skippable chrome.
 *
 * The takeaway gets the highlighter rather than a bordered strip. One marked
 * sentence per page reads as someone's pen; a striped panel reads as a
 * component.
 */
export default function KeyConceptSection({
  title,
  description,
  concept,
  children,
}: KeyConceptSectionProps) {
  const lines = Array.isArray(description) ? description : [description];

  return (
    <div className="measure mb-4 flex flex-col gap-[22px]">
      {title && (
        <h2
          className="display m-0"
          style={{
            fontSize: "clamp(24px, 3vw, 32px)",
            lineHeight: 1.12,
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h2>
      )}

      {lines.map((line, i) => (
        <p key={i} className="prose-body m-0">
          {line}
        </p>
      ))}

      <p className="prose-body m-0">
        <Mark>{concept}</Mark>
      </p>

      {children}
    </div>
  );
}
