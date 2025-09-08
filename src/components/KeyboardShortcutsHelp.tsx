"use client";

import { useState, useEffect } from "react";

/**
 * Floating keyboard shortcuts help component
 * Shows available keyboard shortcuts in a togglable modal
 */
export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.stopPropagation(); // Prevent the global Escape handler from running
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const shortcuts = [
    {
      key: "←→",
      description: "Navigate between workshop pages"
    },
    {
      key: "/",
      description: "Focus search bar"
    },
    {
      key: "Ctrl+K",
      description: "Focus search bar"
    },
    {
      key: "Esc",
      description: "Close search/modals"
    },
    {
      key: "Home",
      description: "Go to homepage"
    },
    {
      key: "End",
      description: "Go to last workshop page"
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-[var(--card)] border border-[var(--border)] rounded-full shadow-lg hover:bg-[var(--muted)] transition-colors group"
        title="Show keyboard shortcuts"
      >
        <svg
          className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
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
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed bottom-4 right-4 z-50 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl p-6 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[var(--foreground)]">
            Keyboard Shortcuts
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <kbd className="px-2 py-1 text-sm bg-[var(--muted)] border border-[var(--border)] rounded font-mono">
                {shortcut.key}
              </kbd>
              <span className="text-sm text-[var(--muted-foreground)] ml-3 flex-1">
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted-foreground)]">
            Press <kbd className="px-1 py-0.5 bg-[var(--muted)] border border-[var(--border)] rounded text-xs">Esc</kbd> to close this dialog
          </p>
        </div>
      </div>
    </>
  );
}