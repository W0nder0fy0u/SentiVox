"use client";

import { usePageTransitions } from "@/lib/transitions";

/**
 * Client-side layout wrapper for page transitions
 * This component enables smooth View Transitions API navigation
 */
export function LayoutClient({ children }: { children: React.ReactNode }) {
    usePageTransitions();
    return <>{children}</>;
}
