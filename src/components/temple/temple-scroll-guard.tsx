"use client";

import { useEffect } from "react";

/**
 * TempleScrollGuard ensures deterministic initial scroll positioning.
 * Prevents unintended scroll jumps on page entry while respecting
 * explicit hash navigation (e.g., #timings, #booking).
 */
export function TempleScrollGuard() {
  useEffect(() => {
    // Prevent browser from restoring arbitrary scroll positions on fresh visits
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const hash = window.location.hash;
    if (!hash) {
      // Clean start at page top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } else {
      // Respect deliberate hash navigation with safe timeout for hydration
      const timer = setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}
