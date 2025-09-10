import { ReactNode } from "react";

interface ConceptBoxProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  code?: ReactNode;
  uses?: ReactNode;
}

export default function ConceptBox({
  title,
  subtitle,
  children,
  code,
  uses,
}: ConceptBoxProps) {
  return (
    <div className="flex flex-col gap-3 bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
      <h4 className="text-lg font-bold text-[var(--foreground)]">{title}</h4>
      {subtitle && (
        <p className="text-[var(--foreground)] text-sm font-semibold">
          {subtitle}
        </p>
      )}
      <div className="text-[var(--foreground)] text-sm flex-1">{children}</div>
      {code && (
        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">
          {code}
        </div>
      )}
      {uses && (
        <div className="text-[var(--foreground)] text-sm">
          <strong>When to use:</strong>
          <br />
          {uses}
        </div>
      )}
    </div>
  );
}
