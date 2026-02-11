"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Page transition hook using View Transitions API
 * Provides smooth fade transitions between pages
 * Falls back gracefully for unsupported browsers
 */
export function usePageTransitions() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if View Transitions API is supported
    if ("startViewTransition" in document) {
      // Trigger view transition on route change
      // This works with Next.js client-side navigation
      const handleTransition = () => {
        (document as any).startViewTransition?.(() => {
          // The transition will happen automatically
        });
      };

      // Small delay to ensure DOM is ready
      const timer = setTimeout(handleTransition, 10);
      return () => clearTimeout(timer);
    }
  }, [pathname]);
}

/**
 * Manual page transition trigger for programmatic navigation
 * Use this when you need to trigger a transition manually
 */
export function triggerPageTransition(callback: () => void) {
  if ("startViewTransition" in document) {
    (document as any).startViewTransition?.(callback);
  } else {
    // Fallback: just execute the callback
    callback();
  }
}
