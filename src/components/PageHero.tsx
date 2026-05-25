import { Target } from "lucide-react";
import { ReactNode } from "react";

interface PageHeroProps {
  /**
   * Optional heading. Pages already inside PageTemplate (which renders its own
   * <h1>) can omit this and start with the description.
   */
  title?: string;
  description: string | string[];
  concept?: string;
  /**
   * Right-slot for interactive content (e.g. <InteractivePidPlayground />).
   * Stacks below the text on viewports below `lg`.
   */
  rightSlot?: ReactNode;
  children?: ReactNode;
}

export default function PageHero({
  title,
  description,
  concept,
  rightSlot,
  children,
}: PageHeroProps) {
  const renderDescription = () => {
    if (Array.isArray(description)) {
      return description.map((line, index) => (
        <p
          key={index}
          className="text-base leading-relaxed text-[var(--muted-foreground)]"
        >
          {line}
        </p>
      ));
    }
    return (
      <p className="text-base leading-relaxed text-[var(--muted-foreground)]">
        {description}
      </p>
    );
  };

  return (
    <section
      className={`grid gap-6 ${rightSlot ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8" : ""}`}
    >
      <div className="flex flex-col gap-4">
        {title && (
          <h1 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
            {title}
          </h1>
        )}
        <div className="flex flex-col gap-3">{renderDescription()}</div>
        {concept && (
          <div className="flex items-start gap-2 rounded-md border-l-2 border-[var(--primary)] bg-[var(--muted)] px-3 py-2">
            <Target
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]"
              aria-hidden
            />
            <p className="text-sm text-[var(--foreground)]">
              <span className="font-semibold">Key concept: </span>
              {concept}
            </p>
          </div>
        )}
        {children}
      </div>
      {rightSlot && <div className="min-w-0">{rightSlot}</div>}
    </section>
  );
}
