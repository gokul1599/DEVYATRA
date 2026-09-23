/**
 * DEVYATRA / TEMPLEORA — CINEMATIC MOTION & SCROLL CONTROLLER
 *
 * Provides smooth, accessible GSAP ScrollTrigger and Motion integration
 * for chapter transitions, masked reveals, and parallax depth.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let initialized = false;

export function initGsapScroll() {
  if (typeof window === "undefined" || initialized) return;

  // Respect reduced motion preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  initialized = true;
}

export function registerCinematicHeroScrub(
  heroElement: HTMLElement | null,
  backdropElement: HTMLElement | null,
  contentElement: HTMLElement | null
) {
  if (!heroElement || typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  initGsapScroll();

  const ctx = gsap.context(() => {
    if (backdropElement) {
      gsap.to(backdropElement, {
        scale: 1.08,
        yPercent: 12,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: heroElement,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });
    }

    if (contentElement) {
      gsap.to(contentElement, {
        yPercent: -18,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: heroElement,
          start: "top top",
          end: "85% top",
          scrub: 1,
        },
      });
    }
  }, heroElement);

  return () => ctx.revert();
}
