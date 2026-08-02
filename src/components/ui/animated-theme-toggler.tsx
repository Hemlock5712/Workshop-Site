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

  // Renders the bare <button> — no wrapper. Callers place it (the rail wants
  // it as the last flex child of a column), so an extra centring div here
  // silently broke their layout.
  //
  // Until `mounted` we can't know the resolved theme, so we render the same
  // box with a neutral glyph rather than guessing and flipping on hydration.
  if (!mounted) {
    return (
      <button
        className={cn("cursor-pointer transition-colors", className)}
        disabled
        aria-label="Loading theme toggle"
        {...props}
      >
        <MoonIcon size={15} aria-hidden="true" />
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn("cursor-pointer transition-colors", className)}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      {...props}
    >
      {isDark ? (
        <SunIcon size={15} aria-hidden="true" />
      ) : (
        <MoonIcon size={15} aria-hidden="true" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
