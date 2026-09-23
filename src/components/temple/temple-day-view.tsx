"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  Navigation,
  Compass,
  FileDown,
  Users,
  Flag,
  Share2,
  Check,
  AlertTriangle,
  Flame,
  Ticket,
  ExternalLink,
} from "lucide-react";
import type { Temple } from "@/lib/types";

interface TempleDayViewProps {
  temple: Temple;
}

export function TempleDayView({ temple }: TempleDayViewProps) {
  const [copied, setCopied] = useState(false);

  // Compute operational status & next slot from temple timings
  const slots = temple.timings?.slots || [];
  const primarySlot = slots[0];
  const nextSlotLabel = primarySlot ? primarySlot.label : "General Darshan";
  const nextSlotTime = primarySlot && primarySlot.opening && primarySlot.closing
    ? `${primarySlot.opening} – ${primarySlot.closing}`
    : "Sunrise to Sunset (Verify locally)";

  const bookingNotice = temple.booking.bookingMode === "online" && temple.booking.bookingUrl
    ? "Online Special Entry Available"
    : temple.entryFee.generalDarshan === "free"
    ? "Free General Darshan Queue"
    : "Verify Entry Fee at Devasthanam Counter";

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${temple.name} · Devyatra`,
          text: `Plan your darshan at ${temple.name}. Verified timings and ground intelligence.`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrintRoadbook = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="rounded-3xl border border-gold/40 bg-gradient-to-b from-obsidian-2 via-obsidian-2 to-obsidian-3 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      {/* Top Banner / Operational Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Live Temple Day Status
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-medium text-ivory sm:text-3xl">
            Today at {temple.name}
          </h2>
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-ivory-dim transition-colors hover:border-gold/40 hover:text-gold-bright"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          <span>{copied ? "Link Copied" : "Share Temple"}</span>
        </button>
      </div>

      {/* 4 Essential Real-Time Operational Signals */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Signal 1: Next Darshan Window */}
        <div className="rounded-2xl border border-line bg-obsidian-3 p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            <Clock className="h-3.5 w-3.5 text-gold" />
            <span>Darshan Window</span>
          </div>
          <p className="mt-2 font-display text-lg font-medium text-ivory">{nextSlotLabel}</p>
          <p className="mt-0.5 text-xs text-gold-bright font-medium">{nextSlotTime}</p>
        </div>

        {/* Signal 2: Next Aarti / Puja */}
        <div className="rounded-2xl border border-line bg-obsidian-3 p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>Aarti & Seva</span>
          </div>
          <p className="mt-2 font-display text-lg font-medium text-ivory">Nitya Archana</p>
          <p className="mt-0.5 text-xs text-amber-300/90">Daily morning & evening pradakshina</p>
        </div>

        {/* Signal 3: Booking Requirement */}
        <div className="rounded-2xl border border-line bg-obsidian-3 p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            <Ticket className="h-3.5 w-3.5 text-sky-400" />
            <span>Booking & Entry</span>
          </div>
          <p className="mt-2 font-display text-base font-medium text-ivory leading-snug">{bookingNotice}</p>
          {temple.booking.bookingUrl && (
            <a
              href={temple.booking.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-sky-300 hover:underline"
            >
              Official portal <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Signal 4: Arrival Buffer */}
        <div className="rounded-2xl border border-line bg-obsidian-3 p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Arrival Buffer</span>
          </div>
          <p className="mt-2 font-display text-lg font-medium text-ivory">30–45 Mins Prior</p>
          <p className="mt-0.5 text-xs text-emerald-300/90">For footwear deposit & security</p>
        </div>
      </div>

      {/* Transparent Crowd Pattern Notice */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-obsidian-3/60 px-4 py-3 flex items-start gap-3 text-xs text-ivory-dim">
        <AlertTriangle className="h-4 w-4 shrink-0 text-gold-dim mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-ivory">Crowd Intelligence: </span>
          Historical pattern estimate — live queue data subject to on-ground temple trust operations, auspicious tithis, and festival influx.
        </p>
      </div>

      {/* 6 Primary Action Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {/* 1. Navigate */}
        <div className="relative group">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full flex-col items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 p-3 text-center transition-all hover:bg-gold hover:text-obsidian group-hover:border-gold"
          >
            <Navigation className="h-5 w-5 text-gold group-hover:text-obsidian transition-colors mb-1.5" />
            <span className="text-[12px] font-semibold text-ivory group-hover:text-obsidian">Navigate</span>
            <span className="text-[10px] text-ivory-dim group-hover:text-obsidian/80">Turn-by-turn</span>
          </a>
        </div>

        {/* 2. Add to Journey */}
        <Link
          href={`/journey`}
          className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center transition-all hover:border-gold/40 hover:bg-white/[0.05]"
        >
          <Compass className="h-5 w-5 text-gold mb-1.5" />
          <span className="text-[12px] font-semibold text-ivory">My Journey</span>
          <span className="text-[10px] text-ivory-dim">Saved & planned</span>
        </Link>

        {/* 3. Live Companion */}
        <a
          href="#ask-ai"
          className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center transition-all hover:border-gold/40 hover:bg-white/[0.05]"
        >
          <Sparkles className="h-5 w-5 text-gold mb-1.5" />
          <span className="text-[12px] font-semibold text-ivory">Companion</span>
          <span className="text-[10px] text-ivory-dim">Ask anything</span>
        </a>

        {/* 4. Offline Roadbook */}
        <button
          onClick={handlePrintRoadbook}
          className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center transition-all hover:border-gold/40 hover:bg-white/[0.05]"
        >
          <FileDown className="h-5 w-5 text-gold mb-1.5" />
          <span className="text-[12px] font-semibold text-ivory">Roadbook</span>
          <span className="text-[10px] text-ivory-dim">Print / Save offline</span>
        </button>

        {/* 5. Senior & Family Ease */}
        <a
          href="#accessibility"
          className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center transition-all hover:border-gold/40 hover:bg-white/[0.05]"
        >
          <Users className="h-5 w-5 text-gold mb-1.5" />
          <span className="text-[12px] font-semibold text-ivory">Accessibility</span>
          <span className="text-[10px] text-ivory-dim">Senior & family ease</span>
        </a>

        {/* 6. Report Ground Update */}
        <Link
          href="/report"
          className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-center transition-all hover:border-gold/40 hover:bg-white/[0.05]"
        >
          <Flag className="h-5 w-5 text-gold mb-1.5" />
          <span className="text-[12px] font-semibold text-ivory">Report</span>
          <span className="text-[10px] text-ivory-dim">Ground update</span>
        </Link>
      </div>
    </div>
  );
}
