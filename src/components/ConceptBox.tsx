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
    <div className="bg-learn-100 dark:bg-learn-900/20 rounded-lg p-6 border border-learn-200 dark:border-learn-800">
      <h4 className="text-lg font-bold text-learn-700 dark:text-learn-300 mb-3">{title}</h4>
      {subtitle && (
        <p className="text-learn-800 dark:text-learn-300 text-sm mb-3">{subtitle}</p>
      )}
      <div className="text-learn-800 dark:text-learn-300 text-sm mb-3">
        {children}
      </div>
      {code && (
        <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs">{code}</div>
      )}
    </div>
  );
}
