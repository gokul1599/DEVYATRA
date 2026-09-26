"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Compass, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WatchJourneyModalProps {
  open: boolean;
  onClose: () => void;
}

export function WatchJourneyModal({ open, onClose }: WatchJourneyModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/90 backdrop-blur-2xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl border border-stone-800 bg-[#0F0C0A] shadow-2xl shadow-black/80"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-stone-800/80 px-6 py-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-[#C8A24B]">
                <Compass className="h-3.5 w-3.5" />
                <span>The Sacred Pilgrimage Journey</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-800 text-stone-400 transition-colors hover:border-[#C8A24B] hover:text-[#F2ECE1]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video / Visual Feature Showcase */}
            <div className="relative aspect-video w-full overflow-hidden bg-stone-950">
              {/* Background ambient poster visual */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('/images/templeora-hero.png')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0C0A] via-black/40 to-black/20" />
              </div>

              {/* Center Play / Ambient Experience */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#C8A24B]/40 bg-black/60 px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest text-[#E4BE72] backdrop-blur-md">
                  <Sparkles className="h-3 w-3 text-[#C8A24B]" />
                  Cinematic Pilgrimage Experience
                </span>

                <h3 className="mt-4 font-serif text-2xl sm:text-4xl text-[#F2ECE1] max-w-xl font-normal leading-tight">
                  Where Sacred Geography Meets Timeless Devotion
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-stone-300 max-w-md leading-relaxed">
                  Journey through living sanctuaries, 6 sacred realms, and ancient river confluences mapped with archival fidelity.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/explore"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-6 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#0C0907] transition-all hover:bg-[#E4BE72] shadow-lg shadow-[#C8A24B]/25"
                  >
                    <span>Begin Sacred Atlas</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/map"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/60 px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-stone-200 transition-colors hover:border-[#C8A24B] hover:text-[#F2ECE1]"
                  >
                    <MapPin className="h-3.5 w-3.5 text-[#C8A24B]" />
                    <span>Open Live Map</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Corridors Quick Access */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-800/80 border-t border-stone-800/80 bg-stone-950/60">
              <Link
                href="/explore?region=south"
                onClick={onClose}
                className="group p-5 transition-colors hover:bg-white/[0.02]"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C8A24B]">Corridor I</span>
                <p className="font-serif text-sm text-[#F2ECE1] group-hover:text-[#E4BE72] mt-0.5">Peninsular Gopuram Route</p>
                <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">Madurai · Thanjavur · Rameswaram</p>
              </Link>

              <Link
                href="/explore?region=north"
                onClick={onClose}
                className="group p-5 transition-colors hover:bg-white/[0.02]"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C8A24B]">Corridor II</span>
                <p className="font-serif text-sm text-[#F2ECE1] group-hover:text-[#E4BE72] mt-0.5">Himalayan & Gangetic Realm</p>
                <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">Kashi · Kedarnath · Badrinath</p>
              </Link>

              <Link
                href="/plan"
                onClick={onClose}
                className="group p-5 transition-colors hover:bg-white/[0.02]"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C8A24B]">Smart Assistant</span>
                <p className="font-serif text-sm text-[#F2ECE1] group-hover:text-[#E4BE72] mt-0.5">Compose with Pilgrimage AI</p>
                <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">Personalized timings & sacred corridors</p>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
