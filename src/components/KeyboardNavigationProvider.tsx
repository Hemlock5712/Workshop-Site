"use client";

import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

/**
 * Client component that provides keyboard navigation functionality
 * This ensures the hook is initialized at the app level
 */
export default function KeyboardNavigationProvider() {
  // Initialize keyboard navigation without search handling
  // (Search handling is done in SearchBar component)
  useKeyboardNavigation();
  
  // This component doesn't render anything visible
  return null;
}