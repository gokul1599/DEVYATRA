"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Play, Compass, ChevronDown, MapPin, Sparkles, Navigation } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SearchBar } from "@/components/search-bar";
import { registerCinematicHeroScrub } from "@/lib/motion/gsap-scroll";
import { WatchJourneyModal } from "./watch-journey-modal";

const QUICK = [
  { label: "తిరుపతి (Tirupati)", href: "/temples/andhra-pradesh/sri-venkateswara-temple" },
  { label: "काशी (Kashi)", href: "/temples/uttar-pradesh/kashi-vishwanath-temple" },
  { label: "மீனாட்சி (Madurai)", href: "/temples/tamil-nadu/meenakshi-amman-temple" },
  { label: "Puri Jagannath", href: "/temples/odisha/jagannath-temple-puri" },
  { label: "Kedarnath", href: "/temples/uttarakhand/kedarnath-temple" },
  { label: "Somnath", href: "/temples/gujarat/somnath-temple" },
];

function NearMeButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const go = () => {
    if (!("geolocation" in navigator)) {
      router.push("/explore");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        router.push(`/nearby?lat=${pos.coords.latitude.toFixed(4)}&lng=${pos.coords.longitude.toFixed(4)}`);
      },
      () => {
        setBusy(false);
        router.push("/explore");
      },
      { timeout: 8000 }
    );
  };

  return (
    <motion.button
      type="button"
      onClick={go}
      whileHover={reduced ? {} : { scale: 1.02 }}
      whileTap={reduced ? {} : { scale: 0.98 }}
      className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-4 py-2.5 text-[12.5px] font-medium text-stone-200 backdrop-blur-md transition-colors hover:border-[#C8A24B]/60 hover:text-[#F2ECE1]"
    >
      {busy ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#C8A24B]/30 border-t-[#C8A24B]" />
      ) : (
        <Navigation className="h-3.5 w-3.5 text-[#C8A24B]" />
      )}
      Near me
    </motion.button>
  );
}

interface HeroStats {
  states: string;
  isLive: boolean;
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const templeGlowRef = useRef<HTMLDivElement>(null);

  const [journeyOpen, setJourneyOpen] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const [stats, setStats] = useState<HeroStats>({
    states: "36",
    isLive: false,
  });

  // Mouse Parallax for Desktop
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (reduced || isTouchDevice.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
    const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1
    setMousePos({ x, y });
  }, [reduced]);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: { totalStates?: number; states?: number; isLive?: boolean }) => {
        if (data && (data.totalStates || data.states)) {
          setStats({
            states: String(data.totalStates || data.states || 36),
            isLive: !!data.isLive,
          });
        }
      })
      .catch(() => {});
  }, []);

  // GSAP ScrollTrigger Integration for Hero Chapter Transition
  useEffect(() => {
    const cleanup = registerCinematicHeroScrub(
      heroRef.current,
      backdropRef.current,
      contentRef.current
    );
    return cleanup;
  }, []);

  // Smooth mouse parallax interpolation
  const bgTranslateX = mousePos.x * -6; // moves -6px to +6px
  const bgTranslateY = mousePos.y * -4;
  const glowTranslateX = mousePos.x * 10; // moves +10px
  const glowTranslateY = mousePos.y * 6;

  return (
    <>
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative isolate flex min-h-[94svh] md:min-h-screen flex-col justify-between overflow-hidden bg-[#0A0806] pt-24 pb-4"
      >
        {/* ========================================================================= */}
        {/* 1. CINEMATIC FULL-BLEED SACRED BACKDROP                                   */}
        {/* ========================================================================= */}
        <div
          ref={backdropRef}
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden will-change-transform"
          aria-hidden="true"
        >
          {/* Main Full-Bleed Temple Photograph (Supplied Official Visual) */}
          <div
            style={{
              transform: `translate3d(${bgTranslateX}px, ${bgTranslateY}px, 0)`,
              transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
            className="absolute inset-0 h-full w-full"
          >
            <Image
              src="/images/templeora-hero.png"
              alt="Templeora — Majestic Hindu Temple Sanctuary Overlooking Sacred Lake at Sunset"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[72%_center] sm:object-[68%_center] lg:object-[62%_center] brightness-[0.92] contrast-[1.04]"
            />
          </div>

          {/* Layered Sunset Light Flare & Temple Prominence (0.9s - 1.8s) */}
          <motion.div
            ref={templeGlowRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
            style={{
              transform: `translate3d(${glowTranslateX}px, ${glowTranslateY}px, 0)`,
              transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
            className="pointer-events-none absolute right-0 top-0 h-[80%] w-[65%] bg-radial from-[#F5A623]/15 via-transparent to-transparent blur-3xl"
          />

          {/* Subtle Ambient Vignettes & Editorial Contrast Gradients (Never Opaque!) */}
          {/* Desktop Left Editorial Scrim: Preserves the temple & sunset on the right while giving text contrast */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#0A0806]/85 via-[#0A0806]/35 to-transparent hidden sm:block" />
          {/* Mobile bottom-up gradient for text legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0806]/95 via-[#0A0806]/40 via-55% to-transparent sm:hidden" />
          {/* Top subtle bar scrim for navigation clarity */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0A0806]/70 to-transparent" />
          {/* Bottom gentle gradient merging into chapter I */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0A0806] via-[#0A0806]/60 to-transparent" />
        </div>

        {/* ========================================================================= */}
        {/* 2. CHOREOGRAPHED NARRATIVE CONTENT                                       */}
        {/* ========================================================================= */}
        <div
          ref={contentRef}
          className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 sm:px-10 lg:px-12 py-8"
        >
          <div className="max-w-2xl lg:max-w-3xl">
            {/* Eyebrow: INDIA'S SACRED ATLAS (1.2s - 2.0s with letter-spacing animation) */}
            <motion.div
              initial={{ opacity: 0, y: 12, letterSpacing: "0.15em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.28em" }}
              transition={{ duration: 1.1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-mono uppercase text-[#E4BE72]"
            >
              <Compass className="h-3.5 w-3.5 text-[#C8A24B]" />
              <span>India&apos;s Sacred Atlas</span>
            </motion.div>

            {/* Headline Line-by-Line Reveal (1.5s - 2.7s) */}
            <h1 className="font-serif text-[42px] sm:text-[64px] lg:text-[76px] font-normal leading-[1.05] tracking-tight text-[#F2ECE1]">
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: "115%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.85, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="block"
                >
                  Discover
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: "115%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.85, delay: 1.75, ease: [0.16, 1, 0.3, 1] }}
                  className="block bg-gradient-to-r from-[#F2ECE1] via-[#E4BE72] to-[#C8A24B] bg-clip-text text-transparent"
                >
                  Timeless Temples
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: "115%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.85, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
                  className="block text-[#F2ECE1]"
                >
                  of India
                </motion.span>
              </span>
            </h1>

            {/* Supporting Editorial Paragraph (2.3s - 3.1s) */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 2.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-xl font-sans text-sm sm:text-base leading-relaxed text-stone-300 md:text-[17px]"
            >
              Explore sacred places, ancient living traditions, and pilgrimage corridors — mapped with geographic precision and archival fidelity.
            </motion.p>

            {/* Primary Action Buttons (2.6s - 3.4s) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 2.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <Link
                href="/temples"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#C8A24B] px-7 py-3.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#0C0907] shadow-xl shadow-[#C8A24B]/20 transition-all duration-300 hover:bg-[#E4BE72] hover:scale-[1.02] hover:shadow-[#C8A24B]/35"
              >
                <span>Explore Temples</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() => setJourneyOpen(true)}
                className="group inline-flex items-center gap-2.5 rounded-full border border-stone-700/80 bg-stone-900/60 px-6 py-3.5 text-xs font-mono uppercase tracking-wider text-[#F2ECE1] backdrop-blur-md transition-all duration-300 hover:border-[#C8A24B] hover:bg-stone-800/80"
              >
                <Play className="h-3.5 w-3.5 fill-[#C8A24B] text-[#C8A24B] transition-transform duration-300 group-hover:scale-110" />
                <span>Watch Journey</span>
              </button>

              <NearMeButton />
            </motion.div>

            {/* Integrated Search Bar with Curated Shrines */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 2.85, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-xl"
            >
              <SearchBar size="lg" />

              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-stone-400">
                <span className="font-mono text-stone-500 uppercase tracking-wider text-[10px]">Pilgrimage Shrines:</span>
                {QUICK.slice(0, 5).map((q) => (
                  <Link
                    key={q.label}
                    href={q.href}
                    className="rounded-full border border-stone-800/80 bg-stone-950/60 px-2.5 py-0.5 font-sans transition-colors hover:border-[#C8A24B]/60 hover:text-[#E4BE72] backdrop-blur-sm"
                  >
                    {q.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SIGNATURE BOTTOM INFORMATION STRIP (3.0s - 3.8s)                       */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 3.0, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 border-t border-stone-800/70 bg-[#0A0806]/85 backdrop-blur-xl"
        >
          <div className="mx-auto flex w-full max-w-[1400px] flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12 text-stone-400">
            {/* Signature Pillars Ticker */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-[11px] sm:text-xs font-mono tracking-wider uppercase">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#F2ECE1]">{stats.states}</span>
                <span>States &amp; UTs</span>
              </div>
              <span className="text-stone-700 hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-stone-300">Verified Information</span>
              </div>
              <span className="text-stone-700 hidden sm:inline">|</span>

              <Link
                href="/map"
                className="flex items-center gap-1.5 text-stone-300 hover:text-[#E4BE72] transition-colors"
              >
                <MapPin className="h-3 w-3 text-[#C8A24B]" />
                <span>Real Maps</span>
              </Link>
              <span className="text-stone-700 hidden sm:inline">|</span>

              <Link
                href="/plan"
                className="flex items-center gap-1.5 text-stone-300 hover:text-[#E4BE72] transition-colors"
              >
                <Sparkles className="h-3 w-3 text-[#C8A24B]" />
                <span>AI Travel Planner</span>
              </Link>
            </div>

            {/* Explore India Link & Minimal Cinematic Scroll Indicator */}
            <div className="flex items-center gap-6">
              <Link
                href="/explore"
                className="group flex items-center gap-1.5 text-xs font-mono font-medium uppercase tracking-wider text-[#C8A24B] hover:text-[#E4BE72] transition-colors"
              >
                <span>Explore India</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href="#explore-india"
                aria-label="Scroll to explore"
                className="hidden md:flex flex-col items-center gap-1 text-[10px] font-mono uppercase tracking-[0.25em] text-stone-500 hover:text-stone-300 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <ChevronDown className="h-3.5 w-3.5 animate-bounce text-[#C8A24B]/70" />
                  <span>Scroll to explore</span>
                </div>
                <span className="h-[1px] w-12 bg-stone-700/60" />
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Watch Journey Cinematic Modal */}
      <WatchJourneyModal
        open={journeyOpen}
        onClose={() => setJourneyOpen(false)}
      />
    </>
  );
}