"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  ChevronRight,
  Share2,
  CalendarPlus,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui";
import { SaveButton } from "@/components/save-button";

interface NavSection {
  id: string;
  label: string;
}

const TEMPLE_SECTIONS: NavSection[] = [
  { id: "arrival-mode", label: "Arrival Mode" },
  { id: "before-you-visit", label: "Before You Visit" },
  { id: "command-center", label: "Command Center" },
  { id: "intelligence", label: "Live Intel" },
  { id: "access-points", label: "Access & Gates" },
  { id: "logistics", label: "Logistics" },
  { id: "architecture", label: "Architecture" },
  { id: "gallery", label: "Media Gallery" },
  { id: "overview", label: "Overview" },
  { id: "nearby-map", label: "Surroundings Map" },
  { id: "extend-your-yatra", label: "300 km Yatra" },
  { id: "explore-around", label: "Famous Nearby" },
  { id: "ask-ai", label: "Ask AI" },
];

interface TempleTopBarProps {
  templeSlug: string;
  templeName: string;
  stateName: string;
  stateCode: string;
}

export function TempleTopBar({
  templeSlug,
  templeName,
  stateName,
  stateCode,
}: TempleTopBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("command-center");
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for active section highlight
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the topmost intersecting entry
      const intersecting = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (intersecting.length > 0) {
        startTransition(() => {
          setActiveSection(intersecting[0].target.id);
        });
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-90px 0px -60% 0px",
      threshold: [0, 0.2, 0.5],
    });

    TEMPLE_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleCopyLink = async () => {
    if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToSection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 110;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* State A: Floating Sub-header over Hero */}
      <div
        className={cn(
          "transition-opacity duration-300",
          isScrolled ? "pointer-events-none opacity-0" : "opacity-100"
        )}
      >
        <Container className="pt-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ivory-dim/80">
            <Link
              href="/"
              className="flex items-center gap-1 transition-colors hover:text-gold-bright"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Atlas Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-gold/40" />
            <Link
              href={`/states/${stateCode.toLowerCase()}`}
              className="transition-colors hover:text-gold-bright"
            >
              {stateName}
            </Link>
            <ChevronRight className="h-3 w-3 text-gold/40" />
            <span className="text-gold-bright font-medium truncate max-w-[200px] sm:max-w-none">
              {templeName}
            </span>
          </nav>
        </Container>
      </div>

      {/* State B: Sticky Morphing Bar */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          isScrolled
            ? "translate-y-0 opacity-100 bg-obsidian-2/95 backdrop-blur-md border-gold/20 shadow-2xl shadow-obsidian/80"
            : "-translate-y-full opacity-0 pointer-events-none border-transparent"
        )}
      >
        <Container className="flex items-center justify-between gap-4 py-2.5">
          {/* Left: Brand + Temple Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-gold-bright font-display tracking-wider text-sm font-semibold shrink-0"
              title="Return to Sacred Atlas"
            >
              <Compass className="h-4 w-4 text-gold animate-spin-slow" />
              <span>TEMPLEORA</span>
            </Link>

            <span className="hidden sm:inline-block h-4 w-px bg-gold/25" />

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ivory truncate max-w-[160px] sm:max-w-[240px] md:max-w-[320px]">
                {templeName}
              </h2>
              <p className="hidden md:flex items-center gap-1 text-[11px] text-ivory-dim">
                <MapPin className="h-3 w-3 text-gold" />
                <span>{stateName}</span>
              </p>
            </div>
          </div>

          {/* Center: Section Navigator Rail */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[50%] py-1">
            {TEMPLE_SECTIONS.map(({ id, label }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={(e) => scrollToSection(id, e)}
                  className={cn(
                    "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    active
                      ? "bg-gold/15 text-gold-bright border border-gold/40 shadow-sm shadow-gold/20"
                      : "text-ivory-dim hover:text-ivory hover:bg-white/[0.04]"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-obsidian text-ivory-dim hover:text-gold-bright hover:border-gold/40 transition-colors"
              title="Share destination"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            </button>

            <SaveButton slug={templeSlug} className="h-8 w-8 rounded-lg" />

            <Link
              href={`/journey?add=${encodeURIComponent(templeSlug)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold via-gold-bright to-saffron text-obsidian text-xs font-semibold shadow-md shadow-gold/20 hover:brightness-110 transition-all"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add to Journey</span>
              <span className="sm:hidden">Journey</span>
            </Link>
          </div>
        </Container>

        {/* Mobile Section Nav Sub-bar */}
        <div className="lg:hidden border-t border-line/60 bg-obsidian-2/95 px-4 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {TEMPLE_SECTIONS.map(({ id, label }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={(e) => scrollToSection(id, e)}
                className={cn(
                  "shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap",
                  active
                    ? "bg-gold/20 text-gold-bright border border-gold/40"
                    : "text-ivory-dim hover:text-ivory"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
