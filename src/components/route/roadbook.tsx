"use client";

import { useState } from "react";
import {
  Compass,
  Fuel,
  Zap,
  Utensils,
  Mountain,
  AlertCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import type { SacredItineraryStop } from "@/lib/ai/planner2";

export interface RoadbookProps {
  title?: string;
  subtitle?: string;
  origin?: string;
  stops: SacredItineraryStop[];
  totalDistanceKm?: number;
  totalDurationHours?: number;
  terrainType?: "plain" | "ghat" | "coastal" | "mountain";
}

export function SacredRoadbook({
  title = "Sacred Corridor Roadbook",
  subtitle = "Turn-by-turn waypoint schedule, driving conditions, and pilgrim logistics",
  origin = "Starting Point",
  stops,
  totalDistanceKm = 0,
  totalDurationHours = 0,
  terrainType = "plain",
}: RoadbookProps) {
  const [expandedStop, setExpandedStop] = useState<number | null>(null);

  const toggleStop = (index: number) => {
    setExpandedStop(expandedStop === index ? null : index);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="rounded-3xl border border-line bg-obsidian-2 p-6 sm:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-bright">
            <Compass className="h-4 w-4" />
            <span>Route Lab · Tactical Pilgrimage Roadbook</span>
          </div>
          <h3 className="mt-1 font-display text-2xl font-medium text-ivory">
            {title}
          </h3>
          <p className="mt-1 text-xs text-ivory-dim">{subtitle}</p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-ivory transition-colors hover:border-gold/40 hover:text-gold-bright"
        >
          <Printer className="h-4 w-4 text-gold" />
          <span>Print / PDF Roadbook</span>
        </button>
      </div>

      {/* Corridor Key Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-3.5">
          <span className="text-[10.5px] uppercase tracking-wider text-ivory-dim">Origin</span>
          <p className="mt-1 truncate font-medium text-xs text-ivory">{origin}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-3.5">
          <span className="text-[10.5px] uppercase tracking-wider text-ivory-dim">Total Corridor</span>
          <p className="mt-1 font-display text-base font-semibold text-gold-bright">
            {totalDistanceKm > 0 ? `${totalDistanceKm.toFixed(0)} km` : `${stops.length} Waypoints`}
          </p>
        </div>
        <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-3.5">
          <span className="text-[10.5px] uppercase tracking-wider text-ivory-dim">Terrain & Elevation</span>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-300">
            <Mountain className="h-3.5 w-3.5 text-emerald-400" />
            <span className="capitalize">{terrainType} Corridor</span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-3.5">
          <span className="text-[10.5px] uppercase tracking-wider text-ivory-dim">Corridor Duration</span>
          <p className="mt-1 font-display text-base font-semibold text-ivory">
            {totalDurationHours > 0 ? `${totalDurationHours} hrs` : `${stops.length} Stops`}
          </p>
        </div>
      </div>

      {/* Corridor Logistics Bar: Satvik Dining, Fuel & EV */}
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-gold/20 bg-gold/[0.02] p-4 text-xs text-ivory-dim">
        <div className="flex items-center gap-1.5 text-ivory">
          <Utensils className="h-4 w-4 text-gold" />
          <span>Pure Satvik Bhojanalayas</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5 text-ivory">
          <Fuel className="h-4 w-4 text-sky-400" />
          <span>Fuel Stations &lt;15km</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5 text-ivory">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span>Highway EV Fast Chargers</span>
        </div>
      </div>

      {/* Waypoint Timeline */}
      <div className="mt-8 space-y-4">
        {stops.map((stop, idx) => {
          const isExpanded = expandedStop === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/[0.06] bg-obsidian-3/80 p-4 transition-all hover:border-gold/30"
            >
              <div
                onClick={() => toggleStop(idx)}
                className="flex cursor-pointer items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold-bright">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-semibold text-ivory">
                        {stop.place}
                      </span>
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10.5px] font-medium text-gold-bright">
                        {stop.time}
                      </span>
                      {stop.type && (
                        <span className="rounded-full bg-obsidian px-2 py-0.5 text-[10px] uppercase text-ivory-dim">
                          {stop.type}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ivory-dim">{stop.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-ivory-dim">
                    {stop.durationMinutes} min
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-ivory-dim" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-ivory-dim" />
                  )}
                </div>
              </div>

              {/* Expanded Waypoint Details */}
              {isExpanded && (
                <div className="mt-4 border-t border-white/[0.06] pt-3 text-xs space-y-2 text-ivory-dim">
                  {stop.dressCodeNotice && (
                    <div className="flex items-center gap-2 text-amber-300/90">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{stop.dressCodeNotice}</span>
                    </div>
                  )}
                  {stop.accessibilityNotice && (
                    <div className="flex items-center gap-2 text-sky-300">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{stop.accessibilityNotice}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-ivory-dim/70 pt-1">
                    <span>Source: {stop.source}</span>
                    <span>Day {stop.day} Stop</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
