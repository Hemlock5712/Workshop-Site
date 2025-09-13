"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Define the page sequence for navigation
const PAGE_SEQUENCE = [
  "/",
  "/introduction",
  "/prerequisites",
  "/hardware",
  "/project-setup",
  "/command-framework",
  "/building-subsystems",
  "/adding-commands",
  "/running-program",
  "/mechanism-setup",
  "/pid-control",
  "/motion-magic",
];

// Define search bar focus function type
type SearchFocusFunction = () => void;

interface UseKeyboardNavigationProps {
  onSearchFocus?: SearchFocusFunction;
  onSearchClose?: () => void;
}

export function useKeyboardNavigation({
  onSearchFocus,
  onSearchClose,
}: UseKeyboardNavigationProps = {}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        // Exception: Allow Escape key to work even in inputs
        if (event.key === "Escape") {
          target.blur(); // Remove focus from input
          onSearchClose?.();
        }
        return;
      }

      const currentIndex = PAGE_SEQUENCE.indexOf(pathname);

      switch (event.key) {
        case "ArrowLeft":
          // Only prevent default if we can actually navigate
          if (currentIndex > 0) {
            event.preventDefault();
            const previousPage = PAGE_SEQUENCE[currentIndex - 1];
            router.push(previousPage);
          }
          break;

        case "ArrowRight":
          // Only prevent default if we can actually navigate
          if (currentIndex >= 0 && currentIndex < PAGE_SEQUENCE.length - 1) {
            event.preventDefault();
            const nextPage = PAGE_SEQUENCE[currentIndex + 1];
            router.push(nextPage);
          }
          break;

        case "/":
          event.preventDefault();
          onSearchFocus?.();
          break;

        case "Escape":
          event.preventDefault();
          onSearchClose?.();
          break;

        case "Home":
          event.preventDefault();
          router.push("/");
          break;

        case "End":
          event.preventDefault();
          const lastPage = PAGE_SEQUENCE[PAGE_SEQUENCE.length - 1];
          router.push(lastPage);
          break;
      }

      // Handle Ctrl+K for search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        onSearchFocus?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, pathname, onSearchFocus, onSearchClose]);

  // Return current page info for potential use by components
  return {
    currentIndex: PAGE_SEQUENCE.indexOf(pathname),
    totalPages: PAGE_SEQUENCE.length,
    isFirstPage: PAGE_SEQUENCE.indexOf(pathname) === 0,
    isLastPage: PAGE_SEQUENCE.indexOf(pathname) === PAGE_SEQUENCE.length - 1,
  };
}
