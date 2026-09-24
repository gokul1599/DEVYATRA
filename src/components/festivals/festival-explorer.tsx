"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Sparkles,
  Search,
  Compass,
  MapPin,
  Check,
} from "lucide-react";
import { cn } from "@/lib/cn";

export interface SerializedFestival {
  id: string;
  name: string;
  month: number;
  day: number;
  dateStr: string; // ISO date string
  formattedDate: string;
  daysRemaining: number;
  relativeLabel: string;
  dateLabel: string;
  description: string;
  specialDarshan?: boolean;
  temple: {
    id: string;
    slug: string;
    name: string;
    location: string;
    district: string;
    stateCode: string;
    stateName: string;
    mainDeity?: string;
  };
}

interface FestivalExplorerProps {
  festivals: SerializedFestival[];
  panchang: {
    tithi: string;
    paksha: string;
    masa: string;
    nakshatra: string;
    samvat: number;
    auspiciousRitualNote: string;
  };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function FestivalExplorer({ festivals, panchang }: FestivalExplorerProps) {
  const [viewMode, setViewMode] = useState<"chronological" | "monthly">("chronological");
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlySpecialDarshan, setOnlySpecialDarshan] = useState(false);

  // Filter & strictly sort festivals date-wise
  const filtered = useMemo(() => {
    return festivals.filter((f) => {
      if (onlySpecialDarshan && !f.specialDarshan) return false;
      if (selectedMonth !== "all" && f.month !== selectedMonth) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.temple.name.toLowerCase().includes(q) ||
        f.temple.stateName.toLowerCase().includes(q) ||
        f.temple.district.toLowerCase().includes(q) ||
        (f.temple.mainDeity && f.temple.mainDeity.toLowerCase().includes(q)) ||
        f.description.toLowerCase().includes(q)
      );
    });
  }, [festivals, selectedMonth, searchQuery, onlySpecialDarshan]);

  // Chronological stream (sorted strictly by upcoming date ascending)
  const chronologicalList = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
  }, [filtered]);

  // Grouped by month with festivals strictly sorted by day of month ascending
  const monthlyGroups = useMemo(() => {
    const map = new Map<number, SerializedFestival[]>();
    for (const f of filtered) {
      const arr = map.get(f.month) ?? [];
      arr.push(f);
      map.set(f.month, arr);
    }
    // Sort items within each month strictly by day ascending
    for (const items of map.values()) {
      items.sort((a, b) => a.day - b.day);
    }
    // Return sorted months 1 to 12
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([monthNum, items]) => ({
        monthNum,
        monthName: MONTH_NAMES[monthNum - 1],
        items,
      }));
  }, [filtered]);

  return (
    <div className="space-y-10">
      {/* 1. Hindu Panchang Live Status Banner */}
      <div className="rounded-3xl border border-stone-800/80 bg-stone-950/80 p-5 md:p-6 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-stone-800/80 pb-5 mb-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C8A24B]/15 text-[#E4BE72]">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C8A24B]">
                  Live Hindu Panchang
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                  IST Synced
                </span>
              </div>
              <h3 className="font-serif text-lg md:text-xl font-medium text-[#F2ECE1] mt-0.5">
                {panchang.tithi}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl border border-stone-800 bg-stone-900/60 px-3 py-1.5 font-mono text-xs text-stone-300">
              Masa: <strong className="text-[#E4BE72] font-normal">{panchang.masa}</strong>
            </span>
            <span className="rounded-xl border border-stone-800 bg-stone-900/60 px-3 py-1.5 font-mono text-xs text-stone-300">
              Nakshatra: <strong className="text-[#E4BE72] font-normal">{panchang.nakshatra}</strong>
            </span>
            <span className="rounded-xl border border-stone-800 bg-stone-900/60 px-3 py-1.5 font-mono text-xs text-stone-300">
              Vikram Samvat: <strong className="text-[#E4BE72] font-normal">{panchang.samvat}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <span className="text-[#C8A24B] font-semibold">Auspicious Significance:</span>
          <span>{panchang.auspiciousRitualNote}</span>
        </div>
      </div>

      {/* 2. Control & Search Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 rounded-3xl border border-stone-800/80 bg-stone-950/70 p-4 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search festivals, deities, temples, or regions..."
            className="w-full rounded-2xl border border-stone-800/80 bg-stone-900/60 py-2.5 pl-10 pr-4 text-xs font-sans text-[#F2ECE1] placeholder:text-stone-500 focus:border-[#C8A24B] focus:outline-none"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-2xl border border-stone-800 bg-stone-900/80 p-1">
            <button
              type="button"
              onClick={() => setViewMode("chronological")}
              className={cn(
                "rounded-xl px-4 py-1.5 text-xs font-mono transition-all",
                viewMode === "chronological"
                  ? "bg-[#C8A24B] text-[#0A0806] font-semibold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              Chronological Stream
            </button>
            <button
              type="button"
              onClick={() => setViewMode("monthly")}
              className={cn(
                "rounded-xl px-4 py-1.5 text-xs font-mono transition-all",
                viewMode === "monthly"
                  ? "bg-[#C8A24B] text-[#0A0806] font-semibold shadow-md"
                  : "text-stone-400 hover:text-stone-200"
              )}
            >
              Annual by Month
            </button>
          </div>

          {/* Special Darshan Filter */}
          <button
            type="button"
            onClick={() => setOnlySpecialDarshan(!onlySpecialDarshan)}
            className={cn(
              "flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs font-mono transition-colors",
              onlySpecialDarshan
                ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                : "border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700 hover:text-stone-200"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Special Darshan</span>
          </button>
        </div>
      </div>

      {/* 3. Month Filter Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setSelectedMonth("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-mono transition-all",
            selectedMonth === "all"
              ? "bg-[#C8A24B] text-[#0A0806] font-semibold shadow-sm"
              : "border border-stone-800/80 bg-stone-950/60 text-stone-400 hover:border-[#C8A24B]/40 hover:text-stone-200"
          )}
        >
          All 12 Months
        </button>

        {MONTH_SHORT.map((mShort, idx) => {
          const mNum = idx + 1;
          const isSelected = selectedMonth === mNum;
          return (
            <button
              key={mShort}
              type="button"
              onClick={() => setSelectedMonth(mNum)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-mono transition-all",
                isSelected
                  ? "bg-[#C8A24B] text-[#0A0806] font-semibold shadow-sm"
                  : "border border-stone-800/80 bg-stone-950/60 text-stone-400 hover:border-[#C8A24B]/40 hover:text-stone-200"
              )}
            >
              {mShort}
            </button>
          );
        })}
      </div>

      {/* 4. Display Content According to View Mode */}
      {viewMode === "chronological" ? (
        /* ================= Chronological Date-wise Stream ================= */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
            <div>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#C8A24B]">
                Ordered Chronologically From Today
              </span>
              <h3 className="font-serif text-2xl font-medium text-[#F2ECE1] mt-1">
                Upcoming Sacred Festivals ({chronologicalList.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-stone-400">
              Arranged Date-wise
            </span>
          </div>

          {chronologicalList.length === 0 ? (
            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/60 p-12 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-stone-600 mb-3" />
              <p className="font-serif text-lg text-stone-300">No festivals match your search.</p>
              <p className="mt-1 text-xs text-stone-500 font-mono">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {chronologicalList.map((f) => (
                <FestivalCard key={`${f.id}-${f.dateStr}`} festival={f} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= Annual Month-by-Month View ================= */
        <div className="space-y-12">
          {monthlyGroups.length === 0 ? (
            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/60 p-12 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-stone-600 mb-3" />
              <p className="font-serif text-lg text-stone-300">No festivals match your search.</p>
            </div>
          ) : (
            monthlyGroups.map(({ monthNum, monthName, items }) => (
              <section key={monthNum} id={`month-${monthNum}`} className="scroll-mt-28 space-y-5">
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C8A24B]/15 text-[#E4BE72]">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-serif text-2xl font-medium text-[#F2ECE1]">
                        {monthName}
                      </h3>
                      <p className="text-[11px] font-mono text-[#C8A24B]">
                        Month {monthNum} of 12 · Arranged in Day Order
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-stone-400">
                    {items.length} Auspicious Festivities
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((f) => (
                    <FestivalCard key={`${f.id}-${f.dateStr}`} festival={f} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* 5. Verification & Devasthanam Policy */}
      <div className="rounded-3xl border border-stone-800/80 bg-stone-950/60 p-6 md:p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-5 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Compass className="h-4 w-4" />
            </span>
            <h4 className="font-serif text-lg font-medium text-[#F2ECE1]">
              Panchang Calculation &amp; Devasthanam Confirmation Standard
            </h4>
          </div>
          <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" /> Verified Archival Integrity
          </span>
        </div>
        <p className="text-xs text-stone-400 leading-relaxed font-sans">
          Sacred festival tithis are calculated according to traditional Hindu panchang systems. Regional observances can vary by one day depending on local sunrise (Udaya Tithi) calculations. Templeora advises confirming exact puja and rathotsavam schedules with official temple trusts prior to finalizing your journey logistics.
        </p>
      </div>
    </div>
  );
}

function FestivalCard({ festival }: { festival: SerializedFestival }) {
  const d = new Date(festival.dateStr);
  const dayNum = String(d.getDate()).padStart(2, "0");
  const monthAbbr = MONTH_SHORT[d.getMonth()].toUpperCase();

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-800/80 bg-stone-950/80 p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#C8A24B]/60 hover:bg-stone-900/90 shadow-xl">
      <div>
        {/* Top: Date Pill & Countdown */}
        <div className="flex items-start justify-between gap-3">
          {/* Prominent Date Box */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#C8A24B]/30 bg-[#C8A24B]/10 px-3 py-2 text-center shrink-0">
              <span className="font-mono text-xl font-bold text-[#E4BE72] leading-none">
                {dayNum}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#C8A24B] mt-0.5">
                {monthAbbr}
              </span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#C8A24B]">
                {festival.dateLabel}
              </span>
              <p className="text-xs font-mono text-stone-400 mt-0.5">
                {festival.formattedDate}
              </p>
            </div>
          </div>

          {/* Relative badge */}
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-mono",
              festival.daysRemaining === 0
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                : festival.daysRemaining <= 7
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-stone-800/80 text-stone-400 border border-stone-700/60"
            )}
          >
            {festival.relativeLabel}
          </span>
        </div>

        {/* Festival Name & Temple */}
        <div className="mt-4">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/temples/${festival.temple.stateCode.toLowerCase()}/${festival.temple.slug}#festivals`}
              className="font-serif text-lg font-medium text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors leading-snug"
            >
              {festival.name}
            </Link>
            {festival.specialDarshan && (
              <span className="shrink-0 rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[9.5px] text-amber-300">
                Special Darshan
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
            <MapPin className="h-3 w-3 text-[#C8A24B] shrink-0" />
            <span className="truncate">
              {festival.temple.name} · {festival.temple.district}, {festival.temple.stateName}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-stone-300">
            {festival.description}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 border-t border-stone-800/80 pt-3 flex items-center justify-between gap-2 text-xs font-mono">
        <Link
          href={`/temples/${festival.temple.stateCode.toLowerCase()}/${festival.temple.slug}`}
          className="text-stone-400 hover:text-stone-200 transition-colors"
        >
          Temple details →
        </Link>

        <Link
          href={`/plan?temple=${festival.temple.slug}&festival=${encodeURIComponent(festival.name)}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#C8A24B]/40 bg-[#C8A24B]/10 px-3 py-1.5 text-[11px] text-[#E4BE72] transition-colors hover:bg-[#C8A24B]/20"
        >
          <Sparkles className="h-3 w-3" />
          <span>Plan Visit</span>
        </Link>
      </div>
    </div>
  );
}
