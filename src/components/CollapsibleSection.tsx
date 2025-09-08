import { ReactNode } from "react";

type CollapsibleSectionVariant = "default" | "warning" | "info";

interface CollapsibleSectionProps {
  title: ReactNode;
  children: ReactNode;
  variant?: CollapsibleSectionVariant;
  className?: string;
}

const containerStyles = {
  default: "bg-slate-50 dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800",
  warning: "bg-[var(--muted)] border-l-4 border-yellow-500",
  info: "bg-[var(--muted)] border-l-4 border-blue-500",
};

const summaryStyles = {
  default: "text-primary-600 hover:text-primary-700 dark:hover:text-primary-300",
  warning: "text-[var(--foreground)] hover:text-[var(--foreground)] dark:hover:text-[var(--foreground)]",
  info: "text-[var(--foreground)] hover:text-[var(--foreground)] dark:hover:text-[var(--foreground)]",
};

export default function CollapsibleSection({
  title,
  children,
  variant = "default",
  className = "",
}: CollapsibleSectionProps) {
  const container = containerStyles[variant];
  const summary = summaryStyles[variant];

  return (
    <details className={`rounded-lg p-6 ${container} ${className}`}>
      <summary className={`text-xl font-bold mb-4 cursor-pointer ${summary}`}>
        {title}
      </summary>
      <div className="mt-4">
        {children}
      </div>
    </details>
  );
}
