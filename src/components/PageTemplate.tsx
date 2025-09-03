import Link from "next/link";

/**
 * Consistent page layout template for workshop content
 * Features:
 * - Standardized spacing and typography
 * - Previous/Next navigation
 * - Responsive design
 * - Content structure consistency across all workshop pages
 */
interface PageTemplateProps {
  title: string;
  previousPage?: { href: string; title: string };
  nextPage?: { href: string; title: string };
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
      {previousPage && (
        <div className="mb-8">
          <Link
            href={previousPage.href}
            className="text-primary-600 hover:text-primary-800 font-medium dark:text-primary-400 dark:hover:text-primary-300"
          >
            ← Back to {previousPage.title}
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-8 prose prose-lg max-w-none dark:prose-invert">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">
          {title}
        </h1>

        {children}

        <div className="flex justify-between items-center pt-8 border-t border-[var(--border)]">
          {previousPage ? (
            <Link
              href={previousPage.href}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium"
            >
              ← Previous: {previousPage.title}
            </Link>
          ) : (
            <div></div>
          )}

          {nextPage && (
            <Link
              href={nextPage.href}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Next: {nextPage.title} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
