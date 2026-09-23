"use client";

import {
  Check,
  X,
  HelpCircle,
  Shield,
  Camera,
  Smartphone,
  Luggage,
  Sparkles,
  Info,
} from "lucide-react";
import type { VisitLogistics, FacilityStatus } from "@/lib/intelligence/destination-intelligence";
import { cn } from "@/lib/cn";

interface VisitLogisticsPanelProps {
  logistics: VisitLogistics;
  templeName: string;
}

export function VisitLogisticsPanel({ logistics, templeName }: VisitLogisticsPanelProps) {
  const facilityItems = [
    logistics.queueEntry,
    logistics.ticketCounter,
    logistics.cloakroom,
    logistics.footwearCounter,
    logistics.lockers,
    logistics.drinkingWater,
    logistics.toilets,
    logistics.washrooms,
    logistics.changingFacilities,
    logistics.waitingArea,
    logistics.seating,
    logistics.prasadam,
    logistics.donationCounter,
    logistics.atm,
  ];

  return (
    <div className="rounded-3xl border border-line bg-obsidian-2 p-6 sm:p-8">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
            <Shield className="h-3.5 w-3.5" />
            Verified Pilgrim Amenities
          </div>
          <h3 className="mt-2.5 font-display text-xl font-medium text-ivory sm:text-2xl">
            Visit Logistics
          </h3>
          <p className="mt-1 text-[13px] text-ivory-dim">
            Grounded facility audit for {templeName}. Missing information is strictly labeled as Unknown — never assumed.
          </p>
        </div>
      </div>

      {/* Facilities Matrix Grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {facilityItems.map((item) => {
          return (
            <div
              key={item.key}
              className={cn(
                "flex flex-col justify-between rounded-2xl border p-4 transition",
                item.status === "AVAILABLE"
                  ? "border-emerald-500/20 bg-emerald-950/10"
                  : item.status === "UNAVAILABLE"
                  ? "border-red-500/20 bg-red-950/10"
                  : "border-line/60 bg-obsidian/40"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-medium text-ivory">{item.label}</span>
                  <StatusBadge status={item.status} />
                </div>
                {item.details && (
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ivory-dim">
                    {item.details}
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line/40 pt-2 text-[10.5px] text-ivory-dim/60">
                <span>Source: {item.source}</span>
                {item.lastVerifiedAt && <span>{item.lastVerifiedAt}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sanctum Rules & Protocol Section */}
      <div className="mt-8 rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/5 via-obsidian-3 to-obsidian-3 p-5">
        <h4 className="flex items-center gap-2 font-display text-[15px] font-medium text-ivory">
          <Sparkles className="h-4 w-4 text-gold" />
          Sanctum Courtyard Protocol & Entry Rules
        </h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line/50 bg-obsidian/70 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
              <Luggage className="h-3.5 w-3.5" /> Luggage
            </span>
            <p className="mt-1 text-[12px] text-ivory-dim">{logistics.rules.luggagePolicy}</p>
          </div>

          <div className="rounded-xl border border-line/50 bg-obsidian/70 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
              <Camera className="h-3.5 w-3.5" /> Photography
            </span>
            <p className="mt-1 text-[12px] text-ivory-dim">{logistics.rules.photographyPolicy}</p>
          </div>

          <div className="rounded-xl border border-line/50 bg-obsidian/70 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
              <Smartphone className="h-3.5 w-3.5" /> Mobile Phones
            </span>
            <p className="mt-1 text-[12px] text-ivory-dim">{logistics.rules.mobilePolicy}</p>
          </div>

          <div className="rounded-xl border border-line/50 bg-obsidian/70 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
              <Info className="h-3.5 w-3.5" /> Footwear & Dress
            </span>
            <p className="mt-1 text-[12px] text-ivory-dim">{logistics.rules.footwearPolicy}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: FacilityStatus }) {
  if (status === "AVAILABLE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-400">
        <Check className="h-3 w-3" /> Available
      </span>
    );
  }
  if (status === "UNAVAILABLE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-red-400">
        <X className="h-3 w-3" /> Unavailable
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[10.5px] font-medium text-ivory-dim">
      <HelpCircle className="h-3 w-3 text-gold/70" /> Unknown
    </span>
  );
}
