import PageTemplate from "@/components/PageTemplate";

interface ComingSoonPageProps {
  title: string;
  description?: string;
  previousPage?: { href: string; title: string };
  nextPage?: { href: string; title: string };
}

export default function ComingSoonPage({
  title,
  description,
  previousPage,
  nextPage,
}: ComingSoonPageProps) {
  return (
    <PageTemplate title={title} previousPage={previousPage} nextPage={nextPage}>
      <div className="text-center py-12">
        <div className="mb-8">
          <svg
            className="mx-auto h-24 w-24 text-slate-400 dark:text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Coming Soon
        </h2>

        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          {description ||
            `The ${title} content is currently being developed and will be available soon.`}
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            💡 <strong>In the meantime:</strong> Check out Workshop #1 content
            or explore the mechanism CAD files to get started with the
            fundamentals.
          </p>
        </div>
      </div>
    </PageTemplate>
  );
}
