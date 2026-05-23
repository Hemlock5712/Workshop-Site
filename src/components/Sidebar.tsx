"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useSidebar } from "@/contexts/SidebarContext";
import { useProgress } from "@/lib/useProgress";
import {
  SECTIONS,
  LESSONS,
  getLessonsBySection,
  getSidebarLabel,
  type Lesson,
  type LessonSection,
  type SectionMeta,
} from "@/data/lessons";
import { SECTION_ICONS } from "@/data/lessonIcons";

// ── Utility nav (non-lesson links) ───────────────────────────────────────

interface UtilityLink {
  href: string;
  label: string;
}

const UTILITY_LINKS: ReadonlyArray<UtilityLink> = [
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/glossary", label: "Glossary" },
];

// Section-index labels shown in the sidebar. Sections live in
// `lessons.ts` with friendly titles ("Workshop #1"); the engineering
// reskin wants mono "NN · TITLE" headers. We map here rather than
// editing the data source — those titles are used elsewhere.
const SECTION_LABEL: Record<LessonSection, string> = {
  main: "00 · GETTING STARTED",
  workshop1: "01 · CONTROL FUNDAMENTALS",
  workshop2: "02 · DRIVE & PERCEPTION",
  advanced: "03 · ADVANCED TOPICS",
};

// ── Status dot ───────────────────────────────────────────────────────────

type ItemStatus = "done" | "current" | "todo";

function StatusDot({ status }: { status: ItemStatus }) {
  const isCurrent = status === "current";
  const fill =
    status === "done"
      ? "var(--ok)"
      : isCurrent
        ? "var(--accent)"
        : "transparent";
  return (
    <span
      aria-hidden
      className="shrink-0"
      style={{
        position: "relative",
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: fill,
        border: status === "todo" ? "1px solid var(--line)" : "none",
        boxShadow: isCurrent ? "0 0 0 3px var(--accent-soft)" : "none",
      }}
    />
  );
}

// ── Brand mark + header ──────────────────────────────────────────────────

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex items-center justify-center rounded-[4px]"
        style={{
          width: 28,
          height: 28,
          border: "1.5px solid var(--accent)",
        }}
        aria-hidden
      >
        <div
          style={{
            width: 10,
            height: 10,
            background: "var(--accent)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: -4,
            border: "1px dashed var(--line)",
            borderRadius: 6,
          }}
        />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">Gray Matter</div>
        <div className="micro" style={{ fontSize: 9.5, marginTop: 2 }}>
          CODING WORKSHOP
        </div>
      </div>
    </div>
  );
}

function ProgressMeter() {
  const { completed, clearAll } = useProgress();
  const total = LESSONS.length;
  const done = completed.size;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="px-1">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="micro" title="Lessons you've marked complete">
          COMPLETED
        </span>
        <button
          type="button"
          onClick={() => {
            if (done === 0) return;
            // Confirm before clearing so users don't lose progress by mis-click.
            const ok =
              typeof window === "undefined"
                ? true
                : window.confirm("Clear all marked-complete lessons?");
            if (ok) clearAll();
          }}
          className="mono tabular cursor-pointer border-0 bg-transparent p-0"
          style={{ color: "var(--fg)", fontSize: 11 }}
          title={done > 0 ? "Reset progress" : "No progress yet"}
        >
          {String(done).padStart(2, "0")}/{total}
        </button>
      </div>
      <div
        className="relative overflow-hidden rounded-sm"
        style={{ height: 4, background: "var(--line)" }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--accent)",
            transition: "width 0.4s",
          }}
        />
      </div>
    </div>
  );
}

// ── Item link ────────────────────────────────────────────────────────────

interface ItemLinkProps {
  href: string;
  label: string;
  status: ItemStatus;
  expanded: boolean;
  onNavigate?: () => void;
}

function ItemLink({
  href,
  label,
  status,
  expanded,
  onNavigate,
}: ItemLinkProps) {
  const isActive = status === "current";

  if (!expanded) {
    // Rail mode: render as a status dot button with hover tooltip. The
    // user clicks the dot to navigate; the section it lives under still
    // expands the sidebar on click of the section icon (handled below).
    return (
      <div className="group relative flex justify-center">
        <Link
          href={href}
          onClick={onNavigate}
          className="rounded-md p-2 transition-colors hover:bg-[var(--bg-elev)]"
          aria-current={isActive ? "page" : undefined}
          aria-label={label}
        >
          <StatusDot status={status} />
        </Link>
        <div
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background: "var(--fg)",
            color: "var(--bg)",
          }}
        >
          {label}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[13px] transition-colors"
      style={{
        background: isActive ? "var(--accent-soft)" : "transparent",
        borderLeft: `2px solid ${isActive ? "var(--accent)" : "transparent"}`,
        color: isActive ? "var(--fg)" : "var(--fg-mute)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--bg-elev)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      <StatusDot status={status} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ── Section group ───────────────────────────────────────────────────────

interface SectionGroupProps {
  meta: SectionMeta;
  lessons: ReadonlyArray<Lesson>;
  expanded: boolean;
  isOpen: boolean;
  isCompleted: (slug: string) => boolean;
  pathname: string;
  onSectionToggle: () => void;
  onItemNavigate: () => void;
  onCollapsedHeaderClick: () => void;
}

function statusFor(
  slug: string,
  pathname: string,
  isCompleted: (s: string) => boolean
): ItemStatus {
  if (pathname === slug) return "current";
  if (isCompleted(slug)) return "done";
  return "todo";
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
  if (!expanded) {
    // Rail: an icon button expands the sidebar + opens this section.
    return (
      <div className="group relative">
        <button
          type="button"
          onClick={onCollapsedHeaderClick}
          aria-label={`Open ${meta.title}`}
          className="flex w-full items-center justify-center rounded-md px-3 py-3 transition-colors hover:bg-[var(--bg-elev)]"
          style={{ color: "var(--fg-mute)" }}
        >
          {SECTION_ICONS[meta.id]}
        </button>
        <div
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: "var(--fg)", color: "var(--bg)" }}
        >
          {meta.title}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onSectionToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-3 py-2.5 transition-colors hover:text-[var(--fg)]"
        style={{ color: "var(--fg-dim)", background: "transparent" }}
      >
        <span
          className="mono"
          style={{ fontSize: 10, letterSpacing: "0.1em", fontWeight: 500 }}
        >
          {SECTION_LABEL[meta.id]}
        </span>
        <svg
          width={9}
          height={9}
          viewBox="0 0 12 12"
          style={{
            transform: isOpen ? "rotate(90deg)" : "rotate(0)",
            transition: "transform 0.15s",
          }}
          aria-hidden
        >
          <path
            d="M4 2 l4 4 l-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />
        </svg>
      </button>

      {isOpen && (
        <div className="pb-1">
          {lessons.map((lesson) => (
            <ItemLink
              key={lesson.slug}
              href={lesson.slug}
              label={getSidebarLabel(lesson)}
              status={statusFor(lesson.slug, pathname, isCompleted)}
              expanded
              onNavigate={onItemNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { isOpen, setIsOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname() ?? "";
  const { isCompleted } = useProgress();

  const collapsibleSections = SECTIONS.filter((s) => s.collapsible);
  // Workshop #1 is the most likely "current focus" — open it by default
  // so a first-time visitor sees nested items without an extra click.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        collapsibleSections.map((s) => [s.id, s.id === "workshop1"])
      )
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
          className="fixed inset-0 z-[60] bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      {/* Desktop expand/collapse rail toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
        className={`fixed top-20 z-50 m-1 hidden p-2 transition-all duration-300 md:flex ${
          isOpen ? "left-60 sm:left-64" : "left-4 md:left-20"
        }`}
        style={{
          background: "var(--bg-elev)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-sm)",
          boxShadow: "0 1px 2px rgb(0 0 0 / 0.25)",
        }}
      >
        {isOpen ? (
          <ChevronsLeft
            className="h-5 w-5"
            style={{ color: "var(--fg-mute)" }}
          />
        ) : (
          <ChevronsRight
            className="h-5 w-5"
            style={{ color: "var(--fg-mute)" }}
          />
        )}
      </button>

      {/* Sidebar shell */}
      <aside
        aria-label="Workshop navigation"
        className={`fixed top-0 left-0 z-[70] flex h-full transform flex-col transition-all duration-300 ease-in-out md:relative ${
          isOpen
            ? "w-full translate-x-0 md:w-60 lg:w-64"
            : "-translate-x-full md:w-16 md:translate-x-0"
        }`}
        style={{
          background: "var(--bg)",
          borderRight: "1px solid var(--line)",
        }}
      >
        {/* Mobile close header */}
        {isOpen && (
          <div
            className="flex justify-end p-4 md:hidden"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="rounded-md p-2 transition-colors hover:bg-[var(--bg-elev)]"
              style={{ color: "var(--fg-mute)" }}
              title="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Brand + progress meter (only shown when expanded) */}
        {isOpen && (
          <div
            className="flex flex-col gap-3.5 px-5 py-4"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <Link
              href="/"
              onClick={closeOnMobile}
              className="block no-underline"
              style={{ color: "var(--fg)" }}
            >
              <BrandMark />
            </Link>
            <ProgressMeter />
          </div>
        )}

        {/* Collapsed rail brand — just the mark, links home */}
        {!isOpen && (
          <div
            className="flex justify-center py-4"
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <Link
              href="/"
              onClick={closeOnMobile}
              aria-label="Workshop home"
              className="block"
            >
              <div
                className="relative flex items-center justify-center rounded-[4px]"
                style={{
                  width: 28,
                  height: 28,
                  border: "1.5px solid var(--accent)",
                }}
                aria-hidden
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    background: "var(--accent)",
                    borderRadius: 2,
                  }}
                />
              </div>
            </Link>
          </div>
        )}

        {/* Nav */}
        <nav
          className={`flex-1 ${isOpen ? "overflow-y-auto px-2 py-2" : "overflow-hidden px-1.5 py-2"}`}
        >
          {/* Main section — always-visible items at the top */}
          <div className="pb-1">
            {mainLessons.map((lesson) => (
              <ItemLink
                key={lesson.slug}
                href={lesson.slug}
                label={getSidebarLabel(lesson)}
                status={statusFor(lesson.slug, pathname, isCompleted)}
                expanded={isOpen}
                onNavigate={closeOnMobile}
              />
            ))}
          </div>

          {/* Workshop / Advanced collapsibles */}
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

          {/* Utility (AI Assistant, Glossary) — flat, no section header */}
          {isOpen && (
            <div
              className="mt-3 pt-2"
              style={{ borderTop: "1px solid var(--line-soft)" }}
            >
              <div className="micro mb-1 px-3" style={{ fontSize: 9.5 }}>
                TOOLS
              </div>
              {UTILITY_LINKS.map((link) => (
                <ItemLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  status={
                    pathname === link.href
                      ? "current"
                      : isCompleted(link.href)
                        ? "done"
                        : "todo"
                  }
                  expanded
                  onNavigate={closeOnMobile}
                />
              ))}
            </div>
          )}
        </nav>

        {/* Footer — theme toggler */}
        <div
          className="flex items-center justify-center p-3"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <AnimatedThemeToggler />
        </div>
      </aside>
    </>
  );
}
