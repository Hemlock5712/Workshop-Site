import { ReactNode } from "react";

type ContentCardVariant = "default" | "primary" | "concept" | "learn" | "focus";

interface ContentCardProps {
  children: ReactNode;
  variant?: ContentCardVariant;
  className?: string;
}

const variantStyles = {
  default: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
  primary: "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800",
  concept: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  learn: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  focus: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
};

export default function ContentCard({ 
  children, 
  variant = "default", 
  className = "" 
}: ContentCardProps) {
  const baseStyles = "rounded-lg p-6 shadow-lg border";
  const variantStyle = variantStyles[variant];
  
  return (
    <div className={`${baseStyles} ${variantStyle} ${className}`}>
      {children}
    </div>
  );
}