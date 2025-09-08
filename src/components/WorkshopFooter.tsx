import Link from "next/link";

interface NextInfo {
  href: string;
  title: string;
  description: string;
}

interface RelatedLink {
  href: string;
  label: string;
}

interface WorkshopFooterProps {
  next: NextInfo;
  relatedLinks: RelatedLink[];
}

export default function WorkshopFooter({ next, relatedLinks }: WorkshopFooterProps) {
  return (
    <section className="flex flex-col gap-8 mt-12">
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-3">
          🚧 Common Mistakes
        </h3>
        <ul className="list-disc list-inside space-y-2 text-red-800 dark:text-red-300">
          <li>Skipping required setup steps.</li>
          <li>Using outdated or mismatched firmware versions.</li>
        </ul>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Troubleshooting
        </h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>Review wiring and connections before testing.</li>
          <li>Check console logs for error messages.</li>
          <li>Consult the documentation when unexpected behavior occurs.</li>
        </ul>
      </div>

      <div className="bg-primary-50 dark:bg-primary-950/30 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
          What&apos;s Next?
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">{next.description}</p>
        <Link
          href={next.href}
          className="text-primary-600 underline hover:no-underline dark:text-primary-400"
        >
          Continue to {next.title} →
        </Link>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Related Concepts
        </h3>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          {relatedLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-primary-600 underline hover:no-underline dark:text-primary-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
