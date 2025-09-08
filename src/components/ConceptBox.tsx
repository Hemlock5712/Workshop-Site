import { ReactNode } from "react";

interface ConceptBoxProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  code?: ReactNode;
}

export default function ConceptBox({
  title,
  subtitle,
  children,
  code,
}: ConceptBoxProps) {
  return (
    <div className="bg-[var(--muted)] rounded-lg p-6 border-l-4 border-[var(--border)]">
      <h4 className="text-lg font-bold text-[var(--foreground)] mb-3">{title}</h4>
      {subtitle && (
        <p className="text-[var(--foreground)] text-sm font-semibold mb-3">{subtitle}</p>
      )}
      <div className="text-[var(--foreground)] text-sm mb-3">{children}</div>
      {code && (
        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">{code}</div>
      )}
    </div>
  );
}
