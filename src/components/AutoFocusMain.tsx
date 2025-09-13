"use client";

import { useEffect } from "react";

/**
 * Component that automatically focuses the main content area
 * This ensures arrow keys work for scrolling without requiring a click
 */
export default function AutoFocusMain() {
  useEffect(() => {
    // Focus the main element on page load with a small delay
    const timer = setTimeout(() => {
      const mainElement = document.querySelector("main");
      if (mainElement) {
        mainElement.focus({ preventScroll: true });
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
