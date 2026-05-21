"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current || !mounted) return;

    // Check if browser supports View Transitions API
    if (!("startViewTransition" in document)) {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      return;
    }

    await (
      document as Document & {
        startViewTransition: (callback: () => void) => { ready: Promise<void> };
      }
    ).startViewTransition(() => {
      flushSync(() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      });
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }, [resolvedTheme, setTheme, mounted, duration]);

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          className={cn(
            "cursor-pointer text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-2 rounded",
            className
          )}
          disabled
          aria-label="Loading theme toggle"
        >
          <MoonIcon size={20} />
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        ref={buttonRef}
        onClick={toggleTheme}
        className={cn(
          "cursor-pointer text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-2 rounded",
          !isDark && "text-[var(--primary)]",
          className
        )}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        {...props}
      >
        {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
};
