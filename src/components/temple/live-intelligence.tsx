"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  ShieldCheck,
  ExternalLink,
  AlertTriangle,
  Flame,
  Calendar,
  Users,
  Building,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { Temple } from "@/lib/types";
import {
  getLiveTempleTiming,
  getBookingIntelligence,
  getTempleFestivalsIntelligence,
  calculateFreshnessScore,
  getTodayPanchang,
} from "@/lib/intelligence";
import { cn } from "@/lib/cn";

export function LiveTempleIntelligence({ temple }: { temple: Temple }) {
  // Live state that refreshes every 30 seconds
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const timing = getLiveTempleTiming(temple, now);
  const booking = getBookingIntelligence(temple);
  const festivals = getTempleFestivalsIntelligence(temple, now);
  const freshness = calculateFreshnessScore(temple, now);
  const panchang = getTodayPanchang(now);

  const upcomingFestivals = festivals.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. Real-Time Status & Timing Banner */}
      <div className="overflow-hidden rounded-3xl border border-line bg-obsidian-2 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
              <Clock className="h-4 w-4" /> Live Darshan Telemetry
            </div>
            <h3 className="mt-1 font-display text-2xl font-medium text-ivory">
              Sanctum Operational Status
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold",
                timing.badgeClass
              )}
            >
              <span className="relative flex h-2.5 w-2.5">
                {timing.pulse && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                )}
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
              </span>
              {timing.label}
            </span>
            <span className="rounded-xl border border-line/80 bg-obsidian-3 px-3 py-1.5 font-mono text-xs font-medium text-ivory-dim">
              {timing.currentTimeIst}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
          {timing.detail}
        </p>

        {/* Darshan Slots Grid */}
        {timing.darshanSlots.length > 0 && (
          <div className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ivory-dim">
              General Darshan Schedule
            </h4>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {timing.darshanSlots.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-obsidian-3 px-4 py-3"
                >
                  <span className="text-xs font-medium text-ivory">{d.label}</span>
                  <span className="font-mono text-xs font-semibold text-gold-bright">
                    {d.opening} – {d.closing}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aarti & Pooja Schedule */}
        <div className="mt-6 border-t border-line/60 pt-5">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ivory-dim">
              <Flame className="h-3.5 w-3.5 text-saffron" /> Aarti & Ritual Timings
            </h4>
            <span className="text-[11px] text-ivory-dim/60">Asia/Kolkata (IST)</span>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {timing.aartis.map((a, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl border p-3.5 transition-colors",
                  a.isCurrent
                    ? "border-purple-500/50 bg-purple-500/10"
                    : "border-white/[0.05] bg-obsidian-3"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ivory">{a.name}</span>
                  <span
                    className={cn(
                      "font-mono text-xs font-bold",
                      a.isCurrent ? "text-purple-300" : "text-gold-bright"
                    )}
                  >
                    {a.time}
                  </span>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ivory-dim/80">
                  {a.description}
                </p>
                {a.isCurrent && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-purple-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> Ritual Ongoing
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Official Bookings & Anti-Fraud Security */}
      <div className="overflow-hidden rounded-3xl border border-line bg-obsidian-2 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Official Bookings & Ticketing
            </div>
            <h3 className="mt-1 font-display text-2xl font-medium text-ivory">
              {booking.modalityLabel}
            </h3>
          </div>

          <span
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium",
              booking.officialPortal.isVerified
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 bg-zinc-800 text-zinc-300"
            )}
          >
            {booking.officialPortal.trustBadge.replace(/_/g, " ")}
          </span>
        </div>

        {/* Special Darshan Passes */}
        {booking.specialDarshans.length > 0 && (
          <div className="mt-5 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ivory-dim">
              Verified Darshan Access Options
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {booking.specialDarshans.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.06] bg-obsidian-3 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold text-ivory">{s.name}</span>
                    <span className="rounded-md bg-gold/15 px-2.5 py-0.5 font-mono text-xs font-bold text-gold-bright">
                      {s.price}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ivory-dim">
                    {s.benefits}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-ivory-dim/70">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Booking Mode: {s.bookingMode.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Portal Call to Action */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-saffron/5 to-transparent p-5">
          <div>
            <p className="text-xs font-semibold text-gold-bright">
              Authoritative Temple Portal: {booking.officialPortal.trustName}
            </p>
            <p className="mt-0.5 text-xs text-ivory-dim">
              {booking.officialPortal.domain || "Direct temple counter ticketing"}
            </p>
          </div>

          {booking.officialPortal.url && (
            <a
              href={booking.officialPortal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-gold px-5 py-2.5 text-xs font-bold text-obsidian shadow-lg transition-transform hover:scale-[1.02]"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Book on Official Portal
            </a>
          )}
        </div>

        {/* Anti-Fraud Security Notice */}
        <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            {booking.fraudAlert.title}
          </div>
          <p className="mt-1.5 text-xs text-amber-200/80">
            {booking.fraudAlert.description}
          </p>
          <ul className="mt-2.5 space-y-1 text-xs text-amber-100/70">
            {booking.fraudAlert.cautions.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Accommodation Intelligence */}
        {booking.accommodation.available && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-obsidian-3 p-4 text-xs">
            <Building className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <span className="font-semibold text-ivory">
                Official Pilgrim Accommodation ({booking.accommodation.type.replace(/_/g, " ")})
              </span>
              <p className="mt-1 text-ivory-dim">
                {booking.accommodation.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Live Hindu Panchang & Festival Crowd Predictor */}
      <div className="overflow-hidden rounded-3xl border border-line bg-obsidian-2 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-gold">
              <Sparkles className="h-4 w-4 text-gold-bright" /> Astronomical Hindu Panchang Today
            </div>
            <h3 className="mt-1 font-display text-2xl font-medium text-ivory">
              {panchang.tithi} · {panchang.masa} Masa
            </h3>
          </div>

          <div className="rounded-xl border border-line/80 bg-obsidian-3 px-3.5 py-2 text-right">
            <p className="text-[11px] text-ivory-dim">Nakshatra</p>
            <p className="font-mono text-xs font-bold text-gold-bright">
              {panchang.nakshatra} (Samvat {panchang.samvat})
            </p>
          </div>
        </div>

        <p className="mt-3.5 text-xs text-gold-dim">
          ✨ {panchang.auspiciousRitualNote}
        </p>

        {/* Upcoming Festivals & Crowd Prediction */}
        {upcomingFestivals.length > 0 && (
          <div className="mt-6 border-t border-line/60 pt-5">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ivory-dim">
              <Calendar className="h-3.5 w-3.5 text-gold" /> Upcoming Major Festivals & Crowd Estimator
            </h4>

            <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
              {upcomingFestivals.map((f) => (
                <div
                  key={f.id}
                  className="rounded-2xl border border-white/[0.06] bg-obsidian-3 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-ivory">{f.name}</span>
                    <span className="shrink-0 rounded-md bg-gold/10 px-2 py-0.5 text-[11px] font-bold text-gold-bright">
                      {f.countdownText}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-ivory-dim/70">{f.dateLabel}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-line/40 pt-2.5">
                    <span className="flex items-center gap-1.5 text-xs text-ivory-dim">
                      <Users className="h-3.5 w-3.5 text-gold" /> Crowd Level:
                    </span>
                    <span
                      className={cn(
                        "rounded-md border px-2 py-0.5 text-[11px] font-bold",
                        f.crowdBadgeCls
                      )}
                    >
                      {f.crowdLevel}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-ivory-dim/60">
                    Est. Wait Time: {f.expectedWaitTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Data Freshness & Statutory Provenance Tier */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-obsidian-2 p-5 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-ivory">
              Statutory Provenance: {freshness.tierLabel} ({freshness.tier})
            </p>
            <p className="text-ivory-dim">
              {freshness.freshnessLabel} · Authority: {freshness.sourceOrg}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
            Freshness Score: {freshness.score}/100
          </span>
        </div>
      </div>
    </div>
  );
}
