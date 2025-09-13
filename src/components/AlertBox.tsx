import { ReactNode } from "react";
import clsx from "clsx";

export type AlertVariant = "warning" | "info" | "success" | "tip";

interface AlertBoxProps {
  variant: AlertVariant;
  title?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; text: string }> =
  {
    warning: {
      container:
        "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-800 dark:text-yellow-300",
    },
    info: {
      container:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
    },
    success: {
      container:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
    },
    tip: {
      container:
        "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-800 dark:text-indigo-300",
    },
  };

export default function AlertBox({
  variant,
  title,
  icon,
  children,
  className,
}: AlertBoxProps) {
  const styles = variantStyles[variant];
  return (
    <div className={clsx("border rounded-lg p-4", styles.container, className)}>
      <div className="flex items-start gap-3">
        {icon && <div className={clsx("mt-0.5", styles.text)}>{icon}</div>}
        <div className={clsx("space-y-1 text-sm", styles.text)}>
          {title && <p className="font-semibold">{title}</p>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
