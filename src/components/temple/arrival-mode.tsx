"use client";

import React, { useState, useEffect } from "react";
import {
  Navigation2,
  Compass,
  MapPin,
  CheckCircle2,
  Car,
  Utensils,
  Shirt,
  Phone,
  Clock,
  Radio,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Temple } from "@/lib/types";
import { haversineDistance } from "@/lib/importer/deduplicate";
import { FreshnessBadge } from "@/components/trust/badges";
import { cn } from "@/lib/cn";

interface ArrivalModeProps {
  temple: Temple;
  onMarkVisited?: () => void;
  isVisited?: boolean;
}

export function ArrivalMode({ temple, onMarkVisited, isVisited = false }: ArrivalModeProps) {
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [visitedState, setVisitedState] = useState(isVisited);
  const [showComplexMap, setShowComplexMap] = useState(false);

  // Attempt real GPS geolocation on mount or click
  const requestLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserCoords(coords);
        const dist = haversineDistance(coords.latitude, coords.longitude, temple.latitude, temple.longitude);
        setDistanceKm(Math.round(dist * 10) / 10);
        setLocating(false);
      },
      (err) => {
        console.warn("[ArrivalMode] Geolocation denied or unavailable:", err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, [temple.latitude, temple.longitude]);

  const handleMarkVisited = async () => {
    setVisitedState(true);
    if (onMarkVisited) onMarkVisited();

    // Call API to persist visited record in PostgreSQL
    try {
      await fetch("/api/journeys/visited", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId: temple.id,
          templeSlug: temple.slug,
          templeName: temple.name,
        }),
      });
    } catch (e) {
      console.warn("Failed to persist visited record:", e);
    }
  };

  const isNearby = distanceKm !== null && distanceKm <= 5.0;
  const isInside = distanceKm !== null && distanceKm <= 0.3;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-br from-[#1E1712] via-[#14100C] to-obsidian p-6 sm:p-8 shadow-2xl">
      {/* Background Sacred Glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold border border-gold/30">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-gold">
                Live Yatra Arrival Mode
              </span>
              <FreshnessBadge status="LIVE" label="GPS Track" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ivory">
              {temple.name}
            </h3>
          </div>
        </div>

        {/* Distance Status */}
        <div className="flex items-center gap-3">
          {distanceKm !== null ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-right">
              <span className="text-[10px] uppercase text-ivory/50 block font-mono">Distance</span>
              <span className="font-mono text-lg font-bold text-emerald-400">
                {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm} km`}
              </span>
            </div>
          ) : (
            <button
              onClick={requestLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-ivory hover:bg-white/10 cursor-pointer"
            >
              <Navigation2 className="h-3.5 w-3.5 text-gold" />
              {locating ? "Locating..." : "Calibrate GPS"}
            </button>
          )}

          {/* Mark Visited Button */}
          <button
            onClick={handleMarkVisited}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow transition-all cursor-pointer",
              visitedState
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-gold text-obsidian hover:bg-gold-bright shadow-gold/20"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            {visitedState ? "Marked as Visited" : "Mark Visited"}
          </button>
        </div>
      </div>

      {/* Live Proximity Context Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-2 text-gold mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-semibold text-ivory">Sanctum Status</span>
          </div>
          <p className="text-xs text-ivory/80 font-medium">
            {temple.timings && temple.timings.slots.length > 0
              ? temple.timings.slots[0].opening && temple.timings.slots[0].closing
                ? `${temple.timings.slots[0].label}: ${temple.timings.slots[0].opening} – ${temple.timings.slots[0].closing}`
                : temple.timings.slots[0].label
              : "Open for Daily Darshan"}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Verified Protocol</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-2 text-gold mb-1">
            <Shirt className="h-4 w-4" />
            <span className="text-xs font-semibold text-ivory">Attire Advisory</span>
          </div>
          <p className="text-xs text-ivory/80">Modest / Traditional</p>
          <span className="text-[10px] text-amber-300/80 font-mono mt-1 block">Footwear counter outside entrance</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-2 text-gold mb-1">
            <Car className="h-4 w-4" />
            <span className="text-xs font-semibold text-ivory">Arrival Parking</span>
          </div>
          <p className="text-xs text-ivory/80">Trust / Municipal Bays</p>
          <span className="text-[10px] text-ivory/50 font-mono mt-1 block">Inquire at approach road</span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-2 text-gold mb-1">
            <Utensils className="h-4 w-4" />
            <span className="text-xs font-semibold text-ivory">Prasadam / Food</span>
          </div>
          <p className="text-xs text-ivory/80">Devasthanam Counter</p>
          <span className="text-[10px] text-ivory/50 font-mono mt-1 block">Subject to daily temple schedule</span>
        </div>
      </div>

      {/* Micro-Map / Navigation Actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-xs font-medium text-ivory hover:bg-white/15 transition-colors"
          >
            <Navigation2 className="h-3.5 w-3.5 text-gold" />
            Start Turn-by-Turn Navigation
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          {(temple as unknown as { officialPhone?: string }).officialPhone && (
            <a
              href={`tel:${(temple as unknown as { officialPhone?: string }).officialPhone}`}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs font-medium text-ivory hover:bg-white/10"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              Call Devasthanam: {(temple as unknown as { officialPhone?: string }).officialPhone}
            </a>
          )}

          <button
            onClick={() => setShowComplexMap(!showComplexMap)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-ivory/80 hover:bg-white/10"
          >
            <Compass className="h-3.5 w-3.5 text-gold" />
            {showComplexMap ? "Hide Complex Layout" : "Temple Complex Micro-Guide"}
          </button>
        </div>

        {isInside && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            You are currently at {temple.name}
          </span>
        )}
      </div>

      {/* Temple Complex Micro-Map / Layout Guide (Phase 7) */}
      {showComplexMap && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-6 animate-in fade-in duration-300">
          <h4 className="font-serif text-sm font-semibold text-ivory mb-2 flex items-center gap-2">
            <Compass className="h-4 w-4 text-gold" />
            Temple Sacred Complex Micro-Directory
          </h4>
          <p className="text-xs text-ivory/60 mb-4">
            Directional pilgrim layout across concentric courtyards (Prakarams). Follow clockwise pradakshina order.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { point: "Raja Gopuram (Main Gate)", detail: "Footwear deposit, security check, electronic lockers" },
              { point: "Flagstaff (Dwajasthambham)", detail: "First prostration point, pradakshina origin" },
              { point: "Ticket & Special Darshan Counter", detail: "Official trust counter for seva tokens & prasadam laddus" },
              { point: "Ardha Mandapa & Antarala", detail: "Queue convergence point before inner sanctum" },
              { point: "Garbhagriha (Moola Vigraha)", detail: "Sacred inner sanctum. Silence & prayer observed" },
              { point: "Annadana Mandapam & Theertham", detail: "Prasadam hall, holy water distribution, rest corridors" },
            ].map((spot, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/5 p-3.5">
                <span className="text-[10px] font-mono font-bold text-gold">Zone 0{i + 1}</span>
                <h5 className="text-xs font-semibold text-ivory mt-0.5">{spot.point}</h5>
                <p className="text-[11px] text-ivory/60 mt-1 leading-relaxed">{spot.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
