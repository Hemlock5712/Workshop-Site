import NavFooter from "@/components/NavFooter";
import LessonBreadcrumb from "@/components/LessonBreadcrumb";

interface NavOverride {
  href: string;
  title: string;
}

interface PageTemplateProps {
  title: string;
  /**
   * Optional explicit Previous link. Omit to auto-derive from
   * `src/data/lessons.ts` based on the current pathname. Pass `null`
   * to suppress the link entirely (e.g. on the landing page).
   */
  previousPage?: NavOverride | null;
  /**
   * Optional explicit Next link — same auto-derivation rules as
   * `previousPage`.
   */
  nextPage?: NavOverride | null;
  children: React.ReactNode;
}

export default function PageTemplate({
  title,
  previousPage,
  nextPage,
  children,
}: PageTemplateProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <LessonBreadcrumb />

      {/* H1 — serif, navy (--primary) per the design.
          Lesson section subtitle (serif italic, muted) lives in
          individual pages when they need it; this stays minimal. */}
      <h1
        className="mb-10 font-semibold"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2.25rem, 4vw, 2.75rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          color: "var(--primary)",
        }}
      >
        {title}
      </h1>

      <div className="flex max-w-none flex-col gap-8 dark:prose-invert">
        {children}

        <NavFooter previousPage={previousPage} nextPage={nextPage} />
      </div>
    </div>
  );
}
