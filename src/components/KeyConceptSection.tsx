/**
 * Top-of-lesson "key concept" intro panel. Rebuilt on the module pattern:
 * a bordered container with a "KEY CONCEPT" tag corner label, a serif
 * heading, descriptive body copy, and an amber-striped takeaway line at
 * the bottom that names the concept itself.
 */
interface KeyConceptSectionProps {
  title: string;
  description: string | string[];
  concept: string;
  children?: React.ReactNode;
}

export default function KeyConceptSection({
  title,
  description,
  concept,
  children,
}: KeyConceptSectionProps) {
  const lines = Array.isArray(description) ? description : [description];

  return (
    <div
      className="module ticked relative"
      style={{ padding: "44px 24px 24px" }}
    >
      <span className="module-tag">KEY CONCEPT</span>

      <h2
        className="mb-3 text-2xl font-semibold leading-tight"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--fg)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>

      <div className="flex flex-col gap-3">
        {lines.map((line, i) => (
          <p
            key={i}
            className="text-[15px] leading-relaxed"
            style={{ color: "var(--fg-mute)", margin: 0 }}
          >
            {line}
          </p>
        ))}
      </div>

      <div
        className="mt-5 flex items-start gap-3 rounded-md p-4"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--line-soft)",
          borderLeft: "3px solid var(--accent)",
        }}
      >
        <span
          className="mono shrink-0"
          style={{
            color: "var(--accent)",
            fontSize: 10.5,
            letterSpacing: "0.08em",
            marginTop: 3,
          }}
        >
          ↳ TAKEAWAY
        </span>
        <p
          className="text-[14px] leading-relaxed"
          style={{ color: "var(--fg)", margin: 0 }}
        >
          {concept}
        </p>
      </div>

      {children}
    </div>
  );
}
