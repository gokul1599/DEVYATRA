"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Navigation,
  Compass,
  Sparkles,
  Share2,
  Check,
  ShieldCheck,
  Users,
  Footprints,
  Camera,
  Shirt,
  MapPin,
} from "lucide-react";
import type { Temple } from "@/lib/types";

interface VisitCommandCenterProps {
  temple: Temple;
}

export function VisitCommandCenter({ temple }: VisitCommandCenterProps) {
  const [copied, setCopied] = useState(false);
  const [showPersonas, setShowPersonas] = useState(false);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${temple.latitude},${temple.longitude}`;

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${temple.name} · Devyatra`,
          text: `Plan your visit to ${temple.name} in ${temple.location}, ${temple.district}. Verified timings, history & darshan intelligence.`,
          url,
        });
        return;
      } catch {
        // User cancelled or share failed, fallback to copy
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-obsidian-2 to-obsidian-3 p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-gold-bright">
            <Compass className="h-3 w-3" /> Visit Command Center
          </span>
          <h2 className="mt-2 font-display text-xl font-medium text-ivory">
            Plan Your Darshan
          </h2>
        </div>
        <button
          onClick={handleShare}
          title="Share temple card"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-ivory-dim transition-colors hover:border-gold/40 hover:text-gold-bright"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
        </button>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-ivory-dim">
        Verified coordinates: {temple.latitude.toFixed(4)}°N, {temple.longitude.toFixed(4)}°E.
        Always verify festival rush schedules with the temple devasthanam.
      </p>

      {/* Primary Action Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-obsidian shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Navigation className="h-3.5 w-3.5 fill-obsidian" />
          <span>Google Maps</span>
        </a>
        <a
          href={appleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-ivory transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <MapPin className="h-3.5 w-3.5 text-gold-dim" />
          <span>Apple Maps</span>
        </a>
      </div>

      {/* Plan AI Circuit */}
      <div className="mt-3">
        <Link
          href={`/plan?temple=${temple.slug}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-xs font-semibold text-gold-bright transition-colors hover:bg-gold/20"
        >
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span>Design Multi-Day Circuit with AI</span>
        </Link>
      </div>

      {/* Readiness / Persona Guidance */}
      <div className="mt-5 border-t border-white/[0.08] pt-4">
        <button
          onClick={() => setShowPersonas(!showPersonas)}
          className="flex w-full items-center justify-between text-left text-xs font-medium text-ivory transition-colors hover:text-gold-bright"
        >
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-gold" />
            <span>Family & Senior Visit Readiness</span>
          </span>
          <span className="text-[11px] text-gold-dim">{showPersonas ? "Hide details" : "Show details"}</span>
        </button>

        {showPersonas && (
          <div className="mt-3 space-y-2.5 text-[11.5px] text-ivory-dim">
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
              <p className="font-semibold text-ivory flex items-center gap-1.5">
                <Footprints className="h-3.5 w-3.5 text-gold" /> Senior Pilgrims & Mobility
              </p>
              <p className="mt-1 leading-relaxed">
                Ancient temple praharams frequently feature stone steps and granite thresholds.
                Wheelchair and special assistance availability: <span className="text-ivory font-medium">Information unavailable — verify at main Devasthanam office</span>.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
              <p className="font-semibold text-ivory flex items-center gap-1.5">
                <Shirt className="h-3.5 w-3.5 text-gold" /> Dress Code & Sanctum Etiquette
              </p>
              <p className="mt-1 leading-relaxed">
                Traditional conservative attire recommended (dhoti/kurta for men, saree/salwar for women).
                Leather items, belts, and footwear must be deposited at designated shoe counters before entry.
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
              <p className="font-semibold text-ivory flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-gold" /> Photography & Mobile Phones
              </p>
              <p className="mt-1 leading-relaxed">
                Photography strictly prohibited inside the inner sanctum (Garbhagriha).
                Mobiles should be switched off or deposited at temple lockers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Provenance Footnote */}
      <div className="mt-4 flex items-center gap-1.5 text-[10.5px] text-ivory-dim/70">
        <ShieldCheck className="h-3 w-3 text-emerald-400" />
        <span>Grounded in verified statutory records &amp; survey coordinates</span>
      </div>
    </div>
  );
}
