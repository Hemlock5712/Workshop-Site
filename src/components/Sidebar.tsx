"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ThemePicker from "./ThemePicker";

/**
 * Main navigation items (Home, Introduction, Prerequisites)
 * These are always visible at the top of the sidebar
 */

const navigationItems = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: "/introduction",
    label: "Introduction",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    href: "/prerequisites",
    label: "Prerequisites",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

/**
 * Workshop #1 navigation items
 * These appear in a collapsible section under the main navigation
 */
const workshop1Items = [
  {
    href: "/hardware",
    label: "Hardware Setup",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    href: "/project-setup",
    label: "Project Setup",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    href: "/command-framework",
    label: "Command-Based Framework",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 4.5V2.25M15 4.5V2.25M9 21.75V19.5M15 21.75V19.5M4.5 9H2.25M4.5 15H2.25M21.75 9H19.5M21.75 15H19.5M7.5 7.5h9v9h-9v-9z"
        />
      </svg>
    ),
  },
  {
    href: "/building-subsystems",
    label: "Subsystems",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25A2.25 2.25 0 018.25 10.5H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
    ),
  },
  {
    href: "/adding-commands",
    label: "Commands",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    href: "/triggers",
    label: "Triggers",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8M4 8h16"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 12h2m6 0h2"
        />
        <circle cx="8" cy="8" r="1" fill="currentColor" />
        <circle cx="16" cy="8" r="1" fill="currentColor" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 4L5 2M18 4l1-2"
        />
      </svg>
    ),
  },
  {
    href: "/running-program",
    label: "Running Program",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.752 11.168l-5.197-3.031A1 1 0 008 9.031v5.938a1 1 0 001.555.832l5.197-3.031a1 1 0 000-1.664z"
        />
      </svg>
    ),
  },
  {
    href: "/mechanism-setup",
    label: "Mechanism Setup",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    href: "/pid-control",
    label: "PID Control",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    href: "/motion-magic",
    label: "Motion Magic",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m14 7 3 3"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 6v4"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14v4"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 2v2"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 8H3"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 16h-4"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 3H9"
        />
      </svg>
    ),
  },
];

/**
 * Workshop #2 navigation items
 * These appear in a collapsible section under Workshop #1
 */
const workshop2Items = [
  {
    href: "/swerve-drive-project",
    label: "Creating a Swerve Drive Project",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
  },
  {
    href: "/pathplanner",
    label: "Adding PathPlanner",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    href: "/vision-options",
    label: "Vision Options",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    ),
  },
  {
    href: "/vision-implementation",
    label: "Implementing Vision",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
    ),
  },
  {
    href: "/logging-options",
    label: "Logging Options",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    href: "/logging-implementation",
    label: "Implementing Logging",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    href: "/vision-shooting",
    label: "Vision-Based Shooting",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        />
      </svg>
    ),
  },
];

/**
 * Collapsible sidebar navigation component
 * Features:
 * - Responsive design (overlay on mobile, fixed on desktop)
 * - Collapsible state with smooth animations
 * - Workshop-based organization with expandable sections
 * - Tooltips when collapsed
 * - Active state highlighting based on current route
 */
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true); // Default open
  const [isWorkshop1Open, setIsWorkshop1Open] = useState(false); // Workshop 1 sections closed by default
  const [isWorkshop2Open, setIsWorkshop2Open] = useState(false); // Workshop 2 sections closed by default
  const pathname = usePathname();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar toggle button - always visible */}
      <button
        onClick={handleToggle}
        className={`fixed top-20 z-50 p-2 bg-[var(--card)] rounded-md shadow-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-all duration-300 ${
          isOpen ? "left-60" : "left-20"
        }`}
        title={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <svg
          className="w-5 h-5 text-[var(--muted-foreground)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={
              isOpen
                ? "M11 19l-7-7 7-7m8 14l-7-7 7-7"
                : "M13 5l7 7-7 7M5 5l7 7-7 7"
            }
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed flex flex-col md:relative top-0 left-0 h-full bg-[var(--card)] text-[var(--card-foreground)] shadow-lg border-r border-[var(--border)] z-40 transform transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:translate-x-0 md:w-16"
        }`}
      >
        <div
          className={`p-4 flex-grow ${isOpen ? "px-6 overflow-y-auto" : "px-2 overflow-hidden"}`}
        >
          {/* Navigation */}
          <nav className="space-y-2">
            {/* Main Navigation Items */}
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md text-sm font-medium transition-all duration-300 ${
                      isOpen
                        ? "px-4 py-3 space-x-3"
                        : "px-3 py-3 justify-center"
                    } ${
                      isActive
                        ? "bg-primary-200 text-primary-800 dark:bg-primary-800/40 dark:text-primary-200"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isOpen && <span className="truncate">{item.label}</span>}
                  </Link>

                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--foreground)] text-[var(--background)] text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mechanism CAD Item */}
            <div className="pt-2 relative group">
              <Link
                href="/mechanism-cad"
                className={`flex items-center rounded-md text-sm font-medium transition-all duration-300 ${
                  isOpen ? "px-4 py-3 space-x-3" : "px-3 py-3 justify-center"
                } ${
                  pathname === "/mechanism-cad"
                    ? "bg-primary-200 text-primary-800 dark:bg-primary-800/40 dark:text-primary-200"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
                onClick={() => {
                  // Only close on mobile
                  if (window.innerWidth < 768) {
                    setIsOpen(false);
                  }
                }}
              >
                <span className="flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </span>
                {isOpen && <span className="truncate">Mechanism CAD</span>}
              </Link>

              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--foreground)] text-[var(--background)] text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Mechanism CAD
                </div>
              )}
            </div>

            {/* Workshop #1 Section */}
            {isOpen && (
              <div className="pt-4">
                <div className="border-t border-[var(--border)] pt-4">
                  <button
                    onClick={() => setIsWorkshop1Open(!isWorkshop1Open)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                      <span>Workshop #1</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isWorkshop1Open ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Workshop #1 Items */}
                  <div
                    className={`mt-2 space-y-1 transition-all duration-300 ${
                      isWorkshop1Open ? "block" : "hidden"
                    }`}
                  >
                    {workshop1Items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center rounded-md text-sm font-medium transition-all duration-300 pl-8 pr-4 py-2 space-x-3 ${
                            isActive
                              ? "bg-primary-200 text-primary-800 dark:bg-primary-800/40 dark:text-primary-200"
                              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                          }`}
                          onClick={() => {
                            // Only close on mobile
                            if (window.innerWidth < 768) {
                              setIsOpen(false);
                            }
                          }}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Workshop #1 collapsed view */}
            {!isOpen && (
              <div className="relative group">
                <div className="flex items-center justify-center px-3 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>

                {/* Tooltip for collapsed workshop */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--foreground)] text-[var(--background)] text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Workshop #1
                </div>
              </div>
            )}

            {/* Workshop #2 Section */}
            {isOpen && (
              <div className="pt-4">
                <div className="border-t border-[var(--border)] pt-4">
                  <button
                    onClick={() => setIsWorkshop2Open(!isWorkshop2Open)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Workshop #2</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isWorkshop2Open ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Workshop #2 Items */}
                  <div
                    className={`mt-2 space-y-1 transition-all duration-300 ${
                      isWorkshop2Open ? "block" : "hidden"
                    }`}
                  >
                    {workshop2Items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center rounded-md text-sm font-medium transition-all duration-300 pl-8 pr-4 py-2 space-x-3 ${
                            isActive
                              ? "bg-primary-200 text-primary-800 dark:bg-primary-800/40 dark:text-primary-200"
                              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                          }`}
                          onClick={() => {
                            // Only close on mobile
                            if (window.innerWidth < 768) {
                              setIsOpen(false);
                            }
                          }}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Workshop #2 collapsed view */}
            {!isOpen && (
              <div className="relative group">
                <div className="flex items-center justify-center px-3 py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>

                {/* Tooltip for collapsed workshop */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--foreground)] text-[var(--background)] text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Workshop #2
                </div>
              </div>
            )}
          </nav>
        </div>
        <div className="p-4">
          <ThemePicker />
        </div>
      </div>
    </>
  );
}
