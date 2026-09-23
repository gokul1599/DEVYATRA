"use client";

import { useState, useEffect } from "react";
import {
  Compass,
  Sparkles,
  Navigation,
  ShieldCheck,
  Check,
  Plus,
  X,
  Info,
} from "lucide-react";
import type { NormalizedAttraction, AdaptiveRadiusConfig } from "@/lib/nearby/engine";
import type { DayAroundTempleResult, SacredItineraryStop } from "@/lib/ai/planner2";
import { TempleNearbyMap } from "./temple-nearby-map";
import { cn } from "@/lib/cn";

interface ExploreAroundProps {
  templeId: string;
  templeSlug: string;
  templeName: string;
  templeLat: number;
  templeLng: number;
  location: string;
  attractions: NormalizedAttraction[];
  radiusConfig: AdaptiveRadiusConfig;
}

const CATEGORY_NAMES: Record<string, string> = {
  ALL: "All Attractions",
  HERITAGE: "Heritage & History",
  PILGRIMAGE: "Sacred Pilgrimage",
  NATURE: "Nature & Landscapes",
  CULTURE: "Arts & Culture",
  LOCAL_EXPERIENCES: "Local Experiences",
};

export function ExploreAround({
  templeId,
  templeSlug,
  templeName,
  templeLat,
  templeLng,
  location,
  attractions,
  radiusConfig,
}: ExploreAroundProps) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showDayModal, setShowDayModal] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dayPlanResult, setDayPlanResult] = useState<DayAroundTempleResult | null>(null);
  const [pace, setPace] = useState<"relaxed" | "standard" | "intensive">("standard");
  const [isElderly, setIsElderly] = useState<boolean>(false);
  const [includeFood, setIncludeFood] = useState<boolean>(true);

  // Initialize saved IDs from localStorage after mount (client-only, avoids hydration mismatch)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem("tem_saved_places");
        if (raw) {
          const arr: string[] = JSON.parse(raw);
          setSavedIds(new Set(arr));
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleSave = async (attr: NormalizedAttraction) => {
    const nextSaved = !savedIds.has(attr.id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (nextSaved) next.add(attr.id);
      else next.delete(attr.id);
      return next;
    });

    // Update localStorage
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("tem_saved_places");
        const list: string[] = raw ? JSON.parse(raw) : [];
        const updated = nextSaved
          ? [...new Set([...list, attr.id])]
          : list.filter((id) => id !== attr.id);
        localStorage.setItem("tem_saved_places", JSON.stringify(updated));

        // Also store rich place object for offline access
        const richRaw = localStorage.getItem("tem_saved_places_rich");
        const richList: Array<{ id: string; name: string; category: string; location: string }> = richRaw ? JSON.parse(richRaw) : [];
        const richUpdated = nextSaved
          ? [...richList.filter((p) => p.id !== attr.id), { id: attr.id, name: attr.name, category: attr.category, location: attr.city || attr.district || location }]
          : richList.filter((p) => p.id !== attr.id);
        localStorage.setItem("tem_saved_places_rich", JSON.stringify(richUpdated));
      } catch {}
    }

    // Sync to backend if authenticated
    try {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          add: nextSaved,
          item: {
            id: attr.id,
            kind: "place",
            name: attr.name,
            category: attr.category,
            location: attr.city || attr.district || location,
            state: attr.state || undefined,
          },
        }),
      });
    } catch {
      // Local storage remains source of truth for offline/anonymous users
    }
  };

  const filteredAttractions =
    activeCategory === "ALL"
      ? attractions
      : attractions.filter((a) => a.category === activeCategory);

  const handleGenerateDayPlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/day-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeSlug,
          pace,
          companions: isElderly ? ["family", "elderly"] : ["family"],
          interests: includeFood
            ? ["heritage", "pilgrimage", "food"]
            : ["heritage", "pilgrimage"],
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setDayPlanResult(json.data);
      }
    } catch (err) {
      console.error("Failed to generate day plan:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="explore-around" data-temple-id={templeId} className="mt-16 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-bright">
            <Compass className="h-3.5 w-3.5" />
            Explore Around This Temple
          </p>
          <h2 className="mt-1 font-display text-2xl text-ivory md:text-3xl">
            Sacred Surroundings & Heritage Corridors
          </h2>
          <p className="mt-1 text-[13px] text-ivory-dim">
            Curated national heritage landmarks, sacred theerthams, and cultural spots within{" "}
            <span className="text-gold-bright font-medium">{radiusConfig.description}</span>.
          </p>
        </div>

        {/* Build My Day Trigger Button */}
        <button
          onClick={() => {
            setShowDayModal(true);
            if (!dayPlanResult) handleGenerateDayPlan();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-5 py-2.5 text-[13px] font-medium text-gold-bright shadow-lg transition-all hover:bg-gold/25 hover:border-gold"
        >
          <Sparkles className="h-4 w-4" />
          Build My Day Around This Temple
        </button>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="mt-8">
        <TempleNearbyMap
          templeName={templeName}
          templeLat={templeLat}
          templeLng={templeLng}
          attractions={attractions}
          radiusConfig={radiusConfig}
        />
      </div>

      {/* Category Filter Pills */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-white/[0.06] pb-4">
        {["ALL", "HERITAGE", "PILGRIMAGE", "NATURE", "CULTURE", "LOCAL_EXPERIENCES"].map((cat) => {
          const count =
            cat === "ALL"
              ? attractions.length
              : attractions.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition-all",
                activeCategory === cat
                  ? "border border-gold bg-gold/20 text-gold-bright shadow-sm"
                  : "border border-line bg-surface text-ivory-dim hover:border-gold/30 hover:text-ivory"
              )}
            >
              <span>{CATEGORY_NAMES[cat] || cat}</span>
              <span className="rounded-full bg-white/[0.08] px-1.5 py-0.2 text-[10px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Attractions Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAttractions.map((attr) => {
          const isSaved = savedIds.has(attr.id);
          return (
            <div
              key={attr.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:border-gold/30 hover:shadow-xl"
            >
              <div>
                {/* Header Badge Strip */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-gold/15 px-2 py-0.5 text-[10.5px] font-medium tracking-wide text-gold-bright">
                    {attr.editorialHighlight}
                  </span>
                  <span className="flex items-center gap-1 text-[11.5px] font-medium text-gold">
                    <Navigation className="h-3 w-3" />
                    {attr.displayDistance}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-3 font-display text-[16px] text-ivory group-hover:text-gold-bright transition-colors">
                  {attr.name}
                </h3>
                {attr.nativeName && (
                  <p className="text-[12px] text-ivory-dim">{attr.nativeName}</p>
                )}

                {/* Subcategory & Protection */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {attr.subcategory && (
                    <span className="rounded border border-line bg-surface px-1.5 py-0.5 text-ivory-dim">
                      {attr.subcategory}
                    </span>
                  )}
                  {attr.sourceType && (
                    <span className="flex items-center gap-1 text-[10.5px] text-emerald-400">
                      <ShieldCheck className="h-3 w-3" />
                      Verified {attr.sourceType.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-3 text-[12.5px] leading-relaxed text-ivory-dim line-clamp-3">
                  {attr.description}
                </p>
              </div>

              {/* Footer Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[12px]">
                <span className="text-ivory-dim">
                  {attr.city || attr.district || location}
                </span>

                <button
                  onClick={() => toggleSave(attr)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors",
                    isSaved
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-surface text-ivory-dim hover:text-ivory border border-line"
                  )}
                >
                  {isSaved ? (
                    <>
                      <Check className="h-3 w-3" /> In My Journey
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" /> Add to Journey
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAttractions.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-ivory-dim">
          <p className="text-sm">
            No registered attractions found in this category within {radiusConfig.maxRadiusKm} km.
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* BUILD MY DAY MODAL / DIALOG */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gold/30 bg-obsidian-1 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-bright">
                  <Sparkles className="h-3.5 w-3.5" />
                  Devyatra Pilgrimage AI
                </p>
                <h3 className="mt-1 font-display text-xl text-ivory sm:text-2xl">
                  Build My Day Around {templeName}
                </h3>
              </div>
              <button
                onClick={() => setShowDayModal(false)}
                className="rounded-full bg-surface p-1.5 text-ivory-dim hover:text-ivory"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Config Controls */}
            <div className="mt-4 grid gap-3 sm:grid-cols-4 border-b border-white/[0.06] pb-4 text-xs">
              <div>
                <label className="text-ivory-dim">Travel Pace</label>
                <select
                  value={pace}
                  onChange={(e) => setPace(e.target.value as "relaxed" | "standard" | "intensive")}
                  className="mt-1 w-full rounded-lg border border-line bg-surface p-2 text-ivory"
                >
                  <option value="relaxed">Relaxed (1-2 Stops)</option>
                  <option value="standard">Standard (2-3 Stops)</option>
                  <option value="intensive">Intensive (Full Day)</option>
                </select>
              </div>

              <div>
                <label className="text-ivory-dim">Pilgrim Group</label>
                <select
                  value={isElderly ? "elderly" : "standard"}
                  onChange={(e) => setIsElderly(e.target.value === "elderly")}
                  className="mt-1 w-full rounded-lg border border-line bg-surface p-2 text-ivory"
                >
                  <option value="standard">Standard / Solo / Family</option>
                  <option value="elderly">With Senior Citizens</option>
                </select>
              </div>

              <div>
                <label className="text-ivory-dim">Meal Break</label>
                <button
                  type="button"
                  onClick={() => setIncludeFood(!includeFood)}
                  className={cn(
                    "mt-1 w-full rounded-lg border p-2 text-left transition-colors",
                    includeFood
                      ? "border-gold/40 bg-gold/15 text-gold-bright"
                      : "border-line bg-surface text-ivory-dim"
                  )}
                >
                  {includeFood ? "✓ Annaprasadam" : "Skip Dining"}
                </button>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateDayPlan}
                  disabled={isGenerating}
                  className="w-full rounded-lg border border-gold/40 bg-gold/20 py-2 font-medium text-gold-bright hover:bg-gold/30 disabled:opacity-50"
                >
                  {isGenerating ? "Synthesizing..." : "Update Itinerary"}
                </button>
              </div>
            </div>

            {/* Generated Plan Itinerary */}
            {dayPlanResult && (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-surface/50 p-3 text-xs text-ivory-dim border border-white/[0.05]">
                  <p className="font-medium text-ivory">{dayPlanResult.summary}</p>
                </div>

                {/* Advisories if present */}
                {dayPlanResult.advisories && dayPlanResult.advisories.length > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                    {dayPlanResult.advisories.map((adv: string, i: number) => (
                      <p key={i}>• {adv}</p>
                    ))}
                  </div>
                )}

                {/* Timeline Stops */}
                <div className="space-y-2.5">
                  {dayPlanResult.stops?.map((stop: SacredItineraryStop, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-xl border border-line bg-obsidian-2 p-3 text-xs"
                    >
                      <div className="flex h-7 w-16 shrink-0 items-center justify-center rounded-md bg-gold/15 font-mono text-[11px] font-semibold text-gold-bright">
                        {stop.time}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-medium text-ivory">{stop.place}</p>
                          <span className="text-[10.5px] uppercase tracking-wider text-ivory-dim">
                            {stop.type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-[11.5px] text-ivory-dim leading-relaxed">
                          {stop.reason}
                        </p>
                        {stop.dressCodeNotice && (
                          <p className="mt-1 text-[11px] text-amber-300/80">
                            Notice: {stop.dressCodeNotice}
                          </p>
                        )}
                        {stop.accessibilityNotice && (
                          <p className="mt-1 text-[11px] text-emerald-400">
                            Accessibility: {stop.accessibilityNotice}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Anti-Hallucination Disclaimer */}
                <div className="mt-4 rounded-xl border border-white/[0.08] bg-obsidian-3 p-3 text-[11px] text-ivory-dim">
                  <p className="flex items-center gap-1.5 font-medium text-ivory">
                    <Info className="h-3.5 w-3.5 text-gold" />
                    Verified Grounding Guarantee
                  </p>
                  <p className="mt-1">{dayPlanResult.honestDisclaimer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
