"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findLessonBySlug, type LessonSectionId } from "@/data/lessons";

const SECTION_LABEL: Record<LessonSectionId, string> = {
  main: "00 · GETTING STARTED",
  workshop1: "01 · CONTROL FUNDAMENTALS",
  workshop2: "02 · DRIVE & PERCEPTION",
  advanced: "03 · ADVANCED TOPICS",
};

/**
 * Top-of-page breadcrumb in the engineering aesthetic — mono, uppercase,
 * wide-tracked. Derives the current lesson from the route so individual
 * pages don't have to thread it manually. Falls back to nothing for
 * routes that aren't lessons (e.g. /search, /privacy).
 */
export default function LessonBreadcrumb() {
  const pathname = usePathname() ?? "";
  const lesson = findLessonBySlug(pathname);
  if (!lesson) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex flex-wrap items-center gap-2 font-mono"
      style={{
        fontSize: 11,
        color: "var(--fg-dim)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      <Link
        href="/"
        className="transition-colors hover:text-[var(--fg)]"
        style={{ color: "var(--fg-dim)" }}
      >
        WORKSHOP
      </Link>
      <span aria-hidden>/</span>
      <span>{SECTION_LABEL[lesson.section]}</span>
      <span aria-hidden>/</span>
      <span style={{ color: "var(--fg)" }}>{lesson.title}</span>
    </nav>
  );
}
