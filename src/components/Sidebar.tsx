"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  BookOpen,
  X,
} from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useSidebar } from "@/contexts/SidebarContext";
import { useProgress } from "@/lib/useProgress";
import {
  SECTIONS,
  getLessonsBySection,
  getSidebarLabel,
  type Lesson,
  type LessonSection,
  type SectionMeta,
} from "@/data/lessons";
import { LESSON_ICONS, SECTION_ICONS } from "@/data/lessonIcons";

// ── Utility nav (extra links that aren't workshop lessons) ───────────────

interface UtilityLink {
  href: string;
  label: string;
  icon: ReactNode;
}

const UTILITY_LINKS: ReadonlyArray<UtilityLink> = [
  {
    href: "/ai-assistant",
    label: "AI Assistant",
    icon: <Sparkles className="w-5 h-5" aria-hidden />,
  },
  {
    href: "/glossary",
    label: "Glossary",
    icon: <BookOpen className="w-5 h-5" aria-hidden />,
  },
];

// ── Small primitives ─────────────────────────────────────────────────────

function ProgressIndicator({
  done,
  expanded,
}: {
  done: boolean;
  expanded: boolean;
}) {
  if (!done) return null;
  if (expanded) {
    return (
      <Check
        className="ml-auto h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
        aria-label="Completed"
      />
    );
  }
  return (
    <span
      aria-label="Completed"
      className="absolute right-1.5 top-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
    />
  );
}

function SectionProgressChip({
  section,
  isCompleted,
}: {
  section: LessonSection;
  isCompleted: (slug: string) => boolean;
}) {
  const lessons = getLessonsBySection(section);
  const done = lessons.filter((l) => isCompleted(l.slug)).length;
  if (done === 0) return null;
  const total = lessons.length;
  const full = done === total;
  return (
    <span
      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
        full
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
      }`}
      aria-label={`${done} of ${total} lessons complete`}
    >
      {done}/{total}
    </span>
  );
}

// ── Link rendering ───────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
  expanded: boolean;
  active: boolean;
  done?: boolean;
  /** Indent inside a collapsible section. */
  nested?: boolean;
  onNavigate?: () => void;
}

function NavLink({
  href,
  label,
  icon,
  expanded,
  active,
  done = false,
  nested = false,
  onNavigate,
}: NavLinkProps) {
  const base =
    "relative flex items-center rounded-md text-sm font-medium transition-colors";
  const padding = expanded
    ? nested
      ? "pl-8 pr-4 py-2 gap-3"
      : "px-4 py-3 gap-3"
    : "px-3 py-3 justify-center";
  const colour = active
    ? "bg-primary-200 text-primary-800 dark:bg-primary-800/40 dark:text-primary-200"
    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]";

  return (
    <div className="relative group">
      <Link
        href={href}
        onClick={onNavigate}
        className={`${base} ${padding} ${colour}`}
        aria-current={active ? "page" : undefined}
      >
        <span className="flex-shrink-0">{icon}</span>
        {expanded && <span className="truncate">{label}</span>}
        <ProgressIndicator done={done} expanded={expanded} />
      </Link>
      {!expanded && (
        <div
          role="tooltip"
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[var(--foreground)] text-[var(--background)] text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
        >
          {label}
        </div>
      )}
    </div>
  );
}

// ── Collapsible section ─────────────────────────────────────────────────

interface SectionGroupProps {
  meta: SectionMeta;
  lessons: ReadonlyArray<Lesson>;
  expanded: boolean;
  isOpen: boolean;
  isCompleted: (slug: string) => boolean;
  pathname: string;
  onSectionToggle: () => void;
  onItemNavigate: () => void;
  /** Expand the sidebar when the user clicks a collapsed section's icon. */
  onCollapsedHeaderClick: () => void;
}

function SectionGroup({
  meta,
  lessons,
  expanded,
  isOpen,
  isCompleted,
  pathname,
  onSectionToggle,
  onItemNavigate,
  onCollapsedHeaderClick,
}: SectionGroupProps) {
  // Collapsed sidebar: render the section as a single icon button that
  // expands the whole sidebar and opens this section.
  if (!expanded) {
    return (
      <div className="relative group">
        <button
          type="button"
          onClick={onCollapsedHeaderClick}
          className="flex w-full items-center justify-center px-3 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
          aria-label={`Open ${meta.title}`}
        >
          {SECTION_ICONS[meta.id]}
        </button>
        <div
          role="tooltip"
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[var(--foreground)] text-[var(--background)] text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
        >
          {meta.title}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={onSectionToggle}
          aria-expanded={isOpen}
          className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
        >
          <div className="flex items-center gap-2">
            {SECTION_ICONS[meta.id]}
            <span>{meta.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <SectionProgressChip section={meta.id} isCompleted={isCompleted} />
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
              aria-hidden
            />
          </div>
        </button>

        {isOpen && (
          <div className="mt-2 space-y-1">
            {lessons.map((lesson) => (
              <NavLink
                key={lesson.slug}
                href={lesson.slug}
                label={getSidebarLabel(lesson)}
                icon={
                  LESSON_ICONS[lesson.slug] ?? SECTION_ICONS[lesson.section]
                }
                expanded
                nested
                active={pathname === lesson.slug}
                done={isCompleted(lesson.slug)}
                onNavigate={onItemNavigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { isOpen, setIsOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname() ?? "";
  const { isCompleted } = useProgress();

  // Each collapsible section keeps its own open/closed state.
  const collapsibleSections = SECTIONS.filter((s) => s.collapsible);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(collapsibleSections.map((s) => [s.id, false]))
  );

  // Auto-open the section containing the current page on mount / route change.
  const lastPathnameRef = useRef<string>("");
  useEffect(() => {
    if (pathname === lastPathnameRef.current) return;
    lastPathnameRef.current = pathname;
    const match = SECTIONS.find((s) =>
      getLessonsBySection(s.id).some((l) => l.slug === pathname)
    );
    if (match && match.collapsible) {
      setOpenSections((prev) =>
        prev[match.id] ? prev : { ...prev, [match.id]: true }
      );
    }
  }, [pathname]);

  const closeOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const openSectionAfterExpand = (id: LessonSection) => {
    setIsOpen(true);
    setOpenSections((prev) => ({ ...prev, [id]: true }));
  };

  const mainLessons = getLessonsBySection("main");

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      {/* Desktop expand/collapse rail toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        className={`hidden md:flex fixed top-20 z-50 p-2 m-1 bg-[var(--card)] rounded-md shadow-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-all duration-300 ${
          isOpen ? "left-60 sm:left-64" : "left-4 md:left-20"
        }`}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <ChevronsLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronsRight className="w-5 h-5 text-[var(--muted-foreground)]" />
        )}
      </button>

      {/* Sidebar shell */}
      <div
        className={`fixed flex flex-col md:relative top-0 left-0 h-full bg-[var(--card)] text-[var(--card-foreground)] shadow-lg border-r border-[var(--border)] z-[70] transform transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0 w-full md:w-60 lg:w-64"
            : "-translate-x-full md:translate-x-0 md:w-16"
        }`}
      >
        {/* Mobile close header */}
        {isOpen && (
          <div className="flex md:hidden justify-end p-4 border-b border-[var(--border)]">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="p-2 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div
          className={`p-4 flex-grow ${isOpen ? "px-6 overflow-y-auto" : "px-2 overflow-hidden"}`}
        >
          <nav className="space-y-2" aria-label="Workshop navigation">
            {/* Main section (always visible, no collapsible header) */}
            {mainLessons.map((lesson) => (
              <NavLink
                key={lesson.slug}
                href={lesson.slug}
                label={getSidebarLabel(lesson)}
                icon={LESSON_ICONS[lesson.slug] ?? SECTION_ICONS.main}
                expanded={isOpen}
                active={pathname === lesson.slug}
                done={isCompleted(lesson.slug)}
                onNavigate={closeOnMobile}
              />
            ))}

            {/* Collapsible sections (Workshop #1, Workshop #2, Advanced) */}
            {collapsibleSections.map((meta) => (
              <SectionGroup
                key={meta.id}
                meta={meta}
                lessons={getLessonsBySection(meta.id)}
                expanded={isOpen}
                isOpen={!!openSections[meta.id]}
                isCompleted={isCompleted}
                pathname={pathname}
                onSectionToggle={() =>
                  setOpenSections((prev) => ({
                    ...prev,
                    [meta.id]: !prev[meta.id],
                  }))
                }
                onItemNavigate={closeOnMobile}
                onCollapsedHeaderClick={() => openSectionAfterExpand(meta.id)}
              />
            ))}

            {/* Utility links (AI Assistant, Glossary) */}
            <div className="pt-4 space-y-2">
              {UTILITY_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  expanded={isOpen}
                  active={pathname === link.href}
                  onNavigate={closeOnMobile}
                />
              ))}
            </div>
          </nav>
        </div>

        <div className="p-4">
          <AnimatedThemeToggler />
        </div>
      </div>
    </>
  );
}
