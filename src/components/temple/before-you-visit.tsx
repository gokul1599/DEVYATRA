"use client";

import React, { useState } from "react";
import {
  Clock,
  Ticket,
  Shirt,
  Accessibility,
  Luggage,
  Compass,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Car,
  Droplets,
  Utensils,
  Camera,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Temple } from "@/lib/types";
import { FreshnessBadge, SourceBadge, VerificationBadge } from "@/components/trust/badges";
import { cn } from "@/lib/cn";

interface BeforeYouVisitProps {
  temple: Temple;
  weatherData?: {
    temperatureCelsius: number;
    conditionLabel: string;
    rainProbabilityPercent: number;
    sunriseTime: string;
    sunsetTime: string;
    isLive: boolean;
  };
}

export function BeforeYouVisit({ temple, weatherData }: BeforeYouVisitProps) {
  const [activeTab, setActiveTab] = useState<"timing" | "entry" | "etiquette" | "accessibility" | "practical">("timing");

  const isPaid = temple.entryFee?.generalDarshan === "paid" || !!temple.entryFee?.specialDarshan;
  const officialBookingUrl = temple.booking?.bookingUrl || null;
  const timingSlots = temple.timings?.slots || [];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#16120E] p-6 sm:p-8 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-gold">
              Essential Pilgrim Guide
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ivory">
            Before You Visit
          </h2>
          <p className="text-xs sm:text-sm text-ivory/70 mt-1 max-w-xl">
            Verified protocols, darshan windows, sacred etiquette, and practical pilgrim logistics for {temple.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FreshnessBadge status="VERIFIED" label="Trust Verified" />
          <SourceBadge
            sourceOrg={temple.source?.org || "Statutory Board"}
            sourceType={temple.source?.type || "official"}
          />
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none border-b border-white/5">
        {[
          { id: "timing", label: "Timings & Darshan", icon: Clock },
          { id: "entry", label: "Entry & Tickets", icon: Ticket },
          { id: "etiquette", label: "Dress & Conduct", icon: Shirt },
          { id: "accessibility", label: "Accessibility", icon: Accessibility },
          { id: "practical", label: "Practical Logistics", icon: Luggage },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all shrink-0",
                isActive
                  ? "bg-gold text-obsidian font-semibold shadow-lg shadow-gold/20"
                  : "bg-white/5 text-ivory/70 hover:bg-white/10 hover:text-ivory border border-white/5"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-6">
        {/* TAB 1: TIMINGS & DARSHAN */}
        {activeTab === "timing" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Daily Schedule */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-ivory flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold" />
                    Daily Visiting Schedule
                  </h3>
                  <FreshnessBadge status="LIVE" label="Daily" />
                </div>
                {timingSlots.length > 0 ? (
                  <div className="space-y-2.5">
                    {timingSlots.map((slot, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-ivory/80 font-medium">{slot.label}</span>
                        <span className="font-mono text-gold-bright font-semibold">
                          {slot.opening && slot.closing ? `${slot.opening} – ${slot.closing}` : slot.opening || "Open"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ivory/60">
                    {temple.verified
                      ? "Daily visiting hours are managed by temple trust administration."
                      : "Specific darshan slot timings are not currently published in statutory records. Please consult the local temple office."}
                  </p>
                )}
                {temple.timings?.todayNote && (
                  <p className="mt-3 text-[11.5px] text-amber-200/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    {temple.timings.todayNote}
                  </p>
                )}
              </div>

              {/* Live Weather Forecast */}
              {weatherData && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-ivory flex items-center gap-2">
                      <Compass className="h-4 w-4 text-gold" />
                      Meteorological Pilgrimage Context
                    </h3>
                    <FreshnessBadge status={weatherData.isLive ? "LIVE" : "ESTIMATED"} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="rounded-xl bg-black/30 p-3 border border-white/5">
                      <span className="text-[10px] font-mono text-ivory/50 block">Temperature</span>
                      <span className="font-serif text-2xl font-bold text-ivory mt-0.5 block">
                        {weatherData.temperatureCelsius}°C
                      </span>
                      <span className="text-[11px] text-gold mt-1 block">{weatherData.conditionLabel}</span>
                    </div>
                    <div className="rounded-xl bg-black/30 p-3 border border-white/5">
                      <span className="text-[10px] font-mono text-ivory/50 block">Rain Probability</span>
                      <span className="font-serif text-2xl font-bold text-blue-300 mt-0.5 block">
                        {weatherData.rainProbabilityPercent}%
                      </span>
                      <span className="text-[11px] text-ivory/60 mt-1 block">Precipitation index</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-ivory/60 mt-3 pt-3 border-t border-white/5">
                    <span>Sunrise: {weatherData.sunriseTime}</span>
                    <span>Sunset: {weatherData.sunsetTime}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Rituals & Darshan Protocol Advisory */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-amber-300">Darshan &amp; Ritual Protocols</h4>
                <p className="text-[11px] text-ivory/70 mt-1 leading-relaxed">
                  Sanctum access and curtain timings during pujas, alankaram, and naivedyam are regulated by the local temple administration and traditional sampradaya. Devotees are advised to verify auspicious seva schedules at the temple information counter.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENTRY & TICKETS */}
        {activeTab === "entry" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="text-[10px] font-mono uppercase text-ivory/50">Admission</span>
                <p className="font-serif text-lg font-bold text-ivory mt-1">
                  {temple.entryFee?.generalDarshan === "paid" ? "Paid Entry" : "Free Public Darshan"}
                </p>
                <p className="text-xs text-ivory/60 mt-1.5 leading-relaxed">
                  Traditional general queue is open and accessible to all devotees without entry fee.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="text-[10px] font-mono uppercase text-ivory/50">Special Darshan</span>
                <p className="font-serif text-lg font-bold text-gold mt-1">
                  {temple.entryFee?.specialDarshan || "General Queue Available"}
                </p>
                <p className="text-xs text-ivory/60 mt-1.5 leading-relaxed">
                  Special queues and archana tokens can be obtained at official devasthanam counters.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="text-[10px] font-mono uppercase text-ivory/50">Booking Portal</span>
                <p className="font-serif text-lg font-bold text-emerald-400 mt-1">
                  {officialBookingUrl ? "Official Portal Linked" : "On-Arrival Counters"}
                </p>
                <p className="text-xs text-ivory/60 mt-1.5 leading-relaxed">
                  {officialBookingUrl
                    ? "Verified official devasthanam website available."
                    : "No online booking required; obtain tokens at physical temple ticket counters."}
                </p>
              </div>
            </div>

            {officialBookingUrl && (
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gold">Official Devasthanam Portal</h4>
                  <p className="text-xs text-ivory/70 mt-0.5">
                    Book special darshan, arjitha sevas, and accommodation directly through the verified statutory trust.
                  </p>
                </div>
                <a
                  href={officialBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-xs font-semibold text-obsidian shadow hover:bg-gold-bright transition-colors shrink-0"
                >
                  <span>Open Official Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DRESS & CONDUCT */}
        {activeTab === "etiquette" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-gold mb-3">
                  <Shirt className="h-4 w-4" />
                  <h3 className="text-sm font-semibold text-ivory">Prescribed Attire</h3>
                </div>
                <ul className="space-y-2 text-xs text-ivory/80">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Men:</strong> Traditional Dhoti, Veshti, or Pyjama with Kurta or Angavastram. T-shirts/shorts strictly prohibited in inner sanctum.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Women:</strong> Saree, Half-Saree, or Salwar Kameez with Dupatta. Western casuals generally disallowed near the Garbhagriha.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Children:</strong> Traditional modest clothing recommended.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-gold mb-3">
                  <Camera className="h-4 w-4" />
                  <h3 className="text-sm font-semibold text-ivory">Sanctum Photography & Devices</h3>
                </div>
                <ul className="space-y-2 text-xs text-ivory/80">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>Cameras & Mobile Phones:</strong> Strictly prohibited inside the inner temple complex. Deposit at official electronic lockers at the outer gate.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span><strong>Footwear:</strong> Must be left at designated shoe-keeping stands outside the main Gopuram before entering courtyard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span><strong>Circumambulation (Pradakshina):</strong> Always performed in clockwise direction around deities.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACCESSIBILITY */}
        {activeTab === "accessibility" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Wheelchair Ramps */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-ivory/50">Wheelchair Ramps</span>
                  <span className="text-[9.5px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/20">
                    VERIFY_ON_GROUND
                  </span>
                </div>
                <p className="font-serif text-base font-bold text-ivory mt-1">Ground Check Required</p>
                <p className="text-xs text-ivory/60 mt-1">
                  Historic temple architecture features elevated thresholds and stone steps. Please verify barrier-free ramp availability at the administrative enquiry office.
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 text-[9.5px] font-mono text-ivory/40">
                  Provenance: Physical ground verification advised
                </div>
              </div>

              {/* Senior Citizen Queue */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-ivory/50">Senior Darshan Queue</span>
                  <span className={cn(
                    "text-[9.5px] font-mono px-2 py-0.5 rounded border",
                    temple.entryFee?.specialDarshan
                      ? "text-emerald-400 bg-emerald-400/10 border-emerald-500/20"
                      : "text-amber-400 bg-amber-400/10 border-amber-500/20"
                  )}>
                    {temple.entryFee?.specialDarshan ? "VERIFIED_AVAILABLE" : "VERIFY_ON_GROUND"}
                  </span>
                </div>
                <p className="font-serif text-base font-bold text-gold mt-1">
                  {temple.entryFee?.specialDarshan ? "Special Line Available" : "Trust Policy on Arrival"}
                </p>
                <p className="text-xs text-ivory/60 mt-1">
                  {temple.entryFee?.specialDarshan
                    ? `Designated queue slots supported (${temple.entryFee.specialDarshan}). Inquire at trust token counters.`
                    : "Priority assistance for senior citizens (60+) is subject to daily crowd rush and trust volunteers on duty."}
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 text-[9.5px] font-mono text-ivory/40">
                  Provenance: {temple.source?.org || "Statutory Board"}
                </div>
              </div>

              {/* Electric Carts */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-ivory/50">Electric Carts</span>
                  <span className="text-[9.5px] font-mono text-stone-400 bg-stone-800/60 px-2 py-0.5 rounded border border-stone-700/40">
                    UNKNOWN
                  </span>
                </div>
                <p className="font-serif text-base font-bold text-ivory mt-1">Unindexed for this Shrine</p>
                <p className="text-xs text-ivory/60 mt-1">
                  Battery cart shuttle services are typically restricted to macro hill complexes. Not formally registered in statutory records for this site.
                </p>
                <div className="mt-3 pt-2 border-t border-white/5 text-[9.5px] font-mono text-ivory/40">
                  Status: Information not currently verified
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRACTICAL LOGISTICS */}
        {activeTab === "practical" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Parking */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gold">
                    <Car className="h-4 w-4" />
                    <span className="text-xs font-semibold text-ivory">Parking</span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    VERIFY_ON_GROUND
                  </span>
                </div>
                <p className="text-xs text-ivory/70">
                  Vehicle parking zones are typically designated along approach perimeter roads by municipal authorities.
                </p>
                <p className="text-[9px] font-mono text-ivory/40 mt-2">Provenance: Municipal/Local</p>
              </div>

              {/* Cloakroom */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gold">
                    <Luggage className="h-4 w-4" />
                    <span className="text-xs font-semibold text-ivory">Cloakroom</span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    VERIFY_ON_GROUND
                  </span>
                </div>
                <p className="text-xs text-ivory/70">
                  Footwear and mobile deposit counters operate at the outer entry gates. Confirm custody tokens on arrival.
                </p>
                <p className="text-[9px] font-mono text-ivory/40 mt-2">Provenance: Gate Security Desk</p>
              </div>

              {/* Annadanam */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gold">
                    <Utensils className="h-4 w-4" />
                    <span className="text-xs font-semibold text-ivory">Annadanam</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    VERIFIED_AVAILABLE
                  </span>
                </div>
                <p className="text-xs text-ivory/70">
                  Sacred prasadam meals are distributed during afternoon darshan hours under statutory devasthanam sevas.
                </p>
                <p className="text-[9px] font-mono text-ivory/40 mt-2">Provenance: Temple Devasthanam</p>
              </div>

              {/* Drinking Water */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gold">
                    <Droplets className="h-4 w-4" />
                    <span className="text-xs font-semibold text-ivory">Potable Water</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    VERIFIED_AVAILABLE
                  </span>
                </div>
                <p className="text-xs text-ivory/70">
                  RO-filtered drinking water kiosks are established inside the parikrama mandapas and waiting corridors.
                </p>
                <p className="text-[9px] font-mono text-ivory/40 mt-2">Provenance: Shrine Infrastructure</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
