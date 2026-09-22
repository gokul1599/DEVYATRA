"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, MapPin, ChevronDown, ArrowRight, Navigation } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SearchBar } from "@/components/search-bar";
import { DevyatraArt } from "@/components/devyatra-art";

import { SacredAmbient } from "@/components/sacred-ambient";

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
      whileHover={reduced ? {} : { scale: 1.03 }}
      whileTap={reduced ? {} : { scale: 0.97 }}
      className="inline-flex items-center gap-2 rounded-full border border-ivory/15 bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-ivory backdrop-blur transition-colors hover:border-gold/50 hover:text-gold-bright"
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

export function Hero() {
  const [ready, setReady] = useState(false);

  return (
    <section className="relative flex min-h-[92svh] flex-col overflow-hidden">
      {/* cinematic backdrop + restrained 3D sacred geometry ambient */}
      <div className="absolute inset-0" aria-hidden>
        <DevyatraArt seed="bharat-darshan-hero" variant="hero" className="h-full w-full opacity-60" />
        <SacredAmbient />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-5 pb-16 pt-36 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          onAnimationComplete={() => setReady(true)}
        >
          <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-bright">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            1,655 Verified Sanctuaries · 36 States & UTs · Guided by AI
          </p>

          <h1 className="max-w-4xl font-display text-[2.8rem] font-medium leading-[1.05] tracking-tight text-ivory sm:text-6xl md:text-7xl">
            Discover India&apos;s
            <span className="gold-text"> Sacred Landscape</span>
          </h1>

          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-ivory-dim sm:text-lg">
            Discover temples. Understand their stories. Plan your journey. Explore what lies around them — grounded in verified heritage sources and guided by pilgrimage AI.
          </p>

          <div className="mt-9 max-w-2xl">
            <SearchBar size="lg" />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[12.5px] text-ivory-dim">
            <span className="mr-1">Popular:</span>
            {QUICK.map((q) => (
              <a
                key={q.label}
                href={q.href}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 transition-colors hover:border-gold/40 hover:text-gold-bright"
              >
                {q.label}
              </a>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <NearMeButton />
            <a
              href="/plan"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-ivory-dim transition-colors hover:text-gold-bright"
            >
              Plan My Visit with AI
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* bottom stat rail + scroll cue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 20 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-10 border-t border-white/[0.07] bg-obsidian/50 backdrop-blur"
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Stat value="1,655" label="Temples" />
            <Stat value="36" label="States & UTs" />
            <Stat value="383" label="Districts" />
            <Stat value="100%" label="Source-tagged" className="hidden sm:flex" />
          <div className="hidden items-center gap-2 text-[12px] text-ivory-dim md:flex">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            Tirumala · Kashi · Puri · Amarnath
          </div>
          <div className="flex flex-col items-center gap-1 text-[10.5px] uppercase tracking-[0.2em] text-ivory-dim/60">
            Scroll
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Stat({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div className={className}>
      <p className="font-display text-xl font-semibold gold-text sm:text-2xl">{value}</p>
      <p className="text-[10.5px] uppercase tracking-[0.18em] text-ivory-dim">{label}</p>
    </div>
  );
}