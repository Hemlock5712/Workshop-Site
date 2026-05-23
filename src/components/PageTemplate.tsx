import NavFooter, { NavBreadcrumb } from "@/components/NavFooter";

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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <NavBreadcrumb previousPage={previousPage} />

      <div className="flex flex-col gap-8 max-w-none dark:prose-invert">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">{title}</h1>

        {children}

        <NavFooter previousPage={previousPage} nextPage={nextPage} />
      </div>
    </div>
  );
}
