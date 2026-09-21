"use client";

import { type ReactNode, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";

export function useReduced() {
  return useReducedMotion();
}

const genDefaults = (y: number) => ({
  hidden: { opacity: 0, y, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
});

/** Fade + rise on scroll into view. Safe default for all sections. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduced = useReduced() ?? false;
  const v = genDefaults(reduced ? 0 : y) as Variants;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}
      variants={v}
    >
      {children}
    </motion.div>
  );
}

/** Staggered children reveal — wrap children in <Stagger.Item>. */
export function Stagger({
  children,
  className,
  gap = 0.06,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  y = 20,
  className,
}: {
  children: ReactNode;
  y?: number;
  className?: string;
}) {
  const reduced = useReduced() ?? false;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Hero parallax wrapper: content drifts and scales on scroll. */
export function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.15]);
  return (
    <div ref={ref} className="origin-top">
      <motion.div style={{ scale, y, opacity }}>{children}</motion.div>
    </div>
  );
}

/** Gentle hover lift for cards. */
export function Lift({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReduced() ?? false;
  return (
    <motion.div
      className={className}
      whileHover={reduced ? {} : { y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}

export const EASE = [0.22, 0.61, 0.36, 1] as const;