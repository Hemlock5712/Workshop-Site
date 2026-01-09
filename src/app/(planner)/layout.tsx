import Link from "next/link";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WaypointPlanner - Gray Matter Workshop",
  description: "Interactive FRC path planning tool with physics simulation",
};

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Minimal header */}
      <header className="flex-shrink-0 h-14 bg-[var(--card)] border-b border-[var(--border)] px-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">Back to Workshop</span>
          </Link>
          <div className="h-6 w-px bg-[var(--border)]" />
          <span className="font-bold text-[var(--card-foreground)]">
            WaypointPlanner
          </span>
        </div>
        <AnimatedThemeToggler />
      </header>

      {/* Full-width content area */}
      <main className="flex-1 overflow-hidden bg-[var(--background)]">
        {children}
      </main>
    </div>
  );
}
