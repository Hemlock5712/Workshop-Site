"use client";

import clsx from "clsx";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { create } from "zustand";

export const useThemeStore = create<{
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}>((set) => ({
  theme: "light",
  setTheme: (theme: "light" | "dark") => {
    set({ theme });
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  },
}));

export default function ThemePicker() {
  const { theme, setTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme or default to system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Use system preference as default
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const defaultTheme = systemDark ? "dark" : "light";
      setTheme(defaultTheme);
      document.documentElement.setAttribute("data-theme", "system");
    }
  }, [setTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 align-self-end justify-self-center">
      <button
        onClick={() => setTheme("light")}
        className={clsx(
          "cursor-pointer text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded",
          theme === "light" && "text-[var(--primary)]"
        )}
        title="Light mode"
      >
        <SunIcon size={20} />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={clsx(
          "cursor-pointer text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded",
          theme === "dark" && "text-[var(--primary)]"
        )}
        title="Dark mode"
      >
        <MoonIcon size={20} />
      </button>
    </div>
  );
}
