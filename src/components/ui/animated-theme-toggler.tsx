"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

declare global {
  interface Document {
    startViewTransition?: (callback: () => void | Promise<void>) => {
      ready: Promise<void>;
    };
  }
}

interface AnimatedThemeTogglerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

const storageKey = "theme";

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const animateTransition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
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
  }, [duration]);

  const applyTheme = useCallback((nextTheme: "light" | "dark") => {
    flushSync(() => {
      setIsDark(nextTheme === "dark");
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // Ignore storage errors (e.g., SSR or privacy mode)
      }
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    const button = buttonRef.current;
    if (!button) return;

    const nextTheme = isDark ? "light" : "dark";
    const startViewTransition = document.startViewTransition?.bind(document);

    if (startViewTransition) {
      const transition = startViewTransition(() => {
        applyTheme(nextTheme);
      });
      await transition.ready;
      animateTransition();
    } else {
      applyTheme(nextTheme);
      animateTransition();
    }
  }, [animateTransition, applyTheme, isDark]);

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      type="button"
      aria-pressed={isDark}
      className={cn(className)}
      {...props}
    >
      {isDark ? <Sun /> : <Moon />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
