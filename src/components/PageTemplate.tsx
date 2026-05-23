import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MarkCompleteToggle from "@/components/MarkCompleteToggle";

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
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium dark:text-primary-400 dark:hover:text-primary-300"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to {previousPage.title}</span>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-8 max-w-none dark:prose-invert">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">{title}</h1>

        {children}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-[var(--border)]">
          {previousPage ? (
            <Link
              href={previousPage.href}
              className="inline-flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Previous: {previousPage.title}</span>
            </Link>
          ) : (
            <div />
          )}

          <MarkCompleteToggle />

          {nextPage ? (
            <Link
              href={nextPage.href}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <span>Next: {nextPage.title}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
