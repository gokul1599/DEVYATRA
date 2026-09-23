"use client";

import { type ReactNode } from "react";
import { type SectionTheme, getSectionTheme } from "@/lib/theme/cinematic-tokens";
import { cn } from "@/lib/cn";

interface SectionShellProps {
  id?: string;
  theme?: SectionTheme;
  sectionId?: SectionTheme;
  children: ReactNode;
  className?: string;
  hasTopDivider?: boolean;
  hasBottomDivider?: boolean;
  withAtmosphere?: boolean;
}

export function SectionShell({
  id,
  theme,
  sectionId,
  children,
  className,
  hasTopDivider = false,
  hasBottomDivider = false,
  withAtmosphere = true,
}: SectionShellProps) {
  const activeTheme = theme ?? sectionId ?? "hero";
  const config = getSectionTheme(activeTheme);

  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden transition-colors duration-700",
        config.bgClass,
        hasTopDivider && "border-t border-line/60",
        hasBottomDivider && "border-b border-line/60",
        className
      )}
    >
      {/* Cinematic atmospheric light glow */}
      {withAtmosphere && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-70 transition-opacity duration-1000"
          style={{ background: config.gradientOverlay }}
          aria-hidden="true"
        />
      )}

      {/* Subtle architectural depth lines */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(242,236,225,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(242,236,225,0.7) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </section>
  );
}
