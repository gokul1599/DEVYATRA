"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Navigation, Compass, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SearchBar } from "@/components/search-bar";
import { registerCinematicHeroScrub } from "@/lib/motion/gsap-scroll";

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
      onClick={go}
      whileHover={reduced ? {} : { scale: 1.02 }}
      whileTap={reduced ? {} : { scale: 0.98 }}
      className="inline-flex items-center gap-2 rounded-full border border-stone-700/70 bg-stone-900/60 px-5 py-3 text-[13px] font-medium text-ivory backdrop-blur-md transition-colors hover:border-gold/50 hover:text-gold-bright"
    >
      {busy ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
      ) : (
        <Navigation className="h-4 w-4 text-gold" />
      )}
      Explore near me
    </motion.button>
  );
}

interface PlatformStats {
  temples: number;
  districts: number;
  states: number;
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<PlatformStats>({
    temples: 2205,
    districts: 725,
    states: 36,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: PlatformStats) => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const cleanup = registerCinematicHeroScrub(
      heroRef.current,
      backdropRef.current,
      contentRef.current
    );
    return cleanup;
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[96svh] flex-col justify-between overflow-hidden bg-obsidian grain pt-28 pb-8"
    >
      {/* Full-Bleed Authentic Sacred Landscape Backdrop */}
      <div
        ref={backdropRef}
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden will-change-transform"
        aria-hidden="true"
      >
        <Image
          src="https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=2400&q=85"
          alt="Sacred Seshachalam Mountain Sanctuary"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.42] contrast-[1.08] saturate-[0.85]"
        />
        {/* Soft Vignettes & Light Temperature Gradients */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#0d0b09]/60 to-[#0d0b09]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b09] via-transparent to-[#0d0b09]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b09]/90 via-[#0d0b09]/30 to-transparent" />
      </div>

      {/* Main Narrative Content */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-center px-6 sm:px-10 lg:px-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          {/* Subtle Eyebrow */}
          <p className="mb-4 inline-flex items-center gap-2 text-[11.5px] font-medium tracking-[0.28em] uppercase text-gold-bright/90">
            <Compass className="h-3.5 w-3.5 text-gold" />
            A Living Digital Atlas of Sacred India
          </p>

          {/* Monumental Editorial Heading */}
          <h1 className="font-display-xl text-ivory tracking-tight">
            India&apos;s Sacred <span className="gold-text">Atlas</span>
          </h1>

          {/* Understated Narrative Body */}
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ivory-dim sm:text-[18px]">
            Ancient shrines, living traditions, and pilgrimage corridors — mapped with geographic precision and verified archival heritage.
          </p>

          {/* Integrated Search Bar */}
          <div className="mt-8 max-w-2xl">
            <SearchBar size="lg" />
          </div>

          {/* Popular Curated Shrines */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-ivory-dim/70">
            <span className="font-medium text-stone-400">Popular:</span>
            {QUICK.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className="rounded-full border border-stone-800 bg-stone-950/60 px-3 py-0.5 transition-colors hover:border-gold/50 hover:text-gold-bright backdrop-blur-sm"
              >
                {q.label}
              </Link>
            ))}
          </div>

          {/* Direct, Confident Action CTAs */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/temples"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-gold/90 via-gold-bright to-gold px-7 py-3 text-[13.5px] font-semibold text-stone-950 shadow-lg shadow-gold/20 transition-all duration-300 hover:brightness-110 hover:shadow-gold/35"
            >
              <span>Explore Temples</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <NearMeButton />

            <Link
              href="/plan"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ivory-dim/80 transition-colors hover:text-gold-bright ml-2"
            >
              <span>Plan with Pilgrimage AI</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-70" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Serene Bottom Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        className="relative z-10 border-t border-stone-800/60 bg-stone-950/60 backdrop-blur-md"
      >
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between px-6 py-4 sm:px-10 lg:px-12 text-stone-400">
          <div className="flex items-center gap-8 text-[12px] font-mono tracking-wider uppercase">
            <div>
              <span className="font-semibold text-ivory">{stats.temples.toLocaleString("en-IN")}</span> Sanctuaries
            </div>
            <div>
              <span className="font-semibold text-ivory">{stats.states}</span> States &amp; UTs
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-ivory">{stats.districts}</span> Districts
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Verified Coordinates
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-stone-500">
            <span>Scroll</span>
            <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}