import { ReactNode } from "react";

interface StepListProps {
  steps: ReactNode[];
  variant?: "numbered" | "checkmark";
  className?: string;
}

export default function StepList({
  steps,
  variant = "numbered",
  className = "",
}: StepListProps) {
  if (variant === "checkmark") {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              ✓
            </span>
            <div>{step}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ol className={`list-decimal list-inside space-y-2 ${className}`}>
      {steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  );
}

