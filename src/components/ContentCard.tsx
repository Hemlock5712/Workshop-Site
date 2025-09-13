import { ReactNode } from "react";

type ContentCardVariant = "default" | "primary" | "concept";

interface ContentCardProps {
  children: ReactNode;
  variant?: ContentCardVariant;
  className?: string;
}

const variantStyles: Record<ContentCardVariant, string> = {
  default:
    "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
  primary:
    "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800",
  concept:
    "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
};

export default function ContentCard({
  children,
  variant = "default",
  className = "",
}: ContentCardProps) {
  const baseStyles = "rounded-lg p-6 shadow-lg border";
  const variantStyle = variantStyles[variant];

  return (
    <div className={`${baseStyles} ${variantStyle} ${className}`}>
      {children}
    </div>
  );
}
