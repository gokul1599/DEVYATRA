"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  Clock,
  Sparkles,
  Users,
  Wallet,
  Plus,
  X,
  Search,
  Check,
  AlertTriangle,
  Car,
  Baby,
  HeartHandshake,
  Accessibility,
  Copy,
  ChevronDown,
  Compass,
  Calendar,
  Printer,
  ShieldCheck,
  Bookmark,
  Share2,
} from "lucide-react";
import { TripCostPanel } from "@/components/plan/trip-cost-panel";
import type { PlanResult } from "@/lib/ai/engine";
import { cn } from "@/lib/cn";

interface LiteTemple {
  id: string;
  templeId?: string;
  slug: string;
  name: string;
  nameLocal?: string;
  stateCode: string;
  stateName?: string;
  district: string;
  location: string;
  deity: string;
  href: string;
}

const CURATED_CIRCUITS = [
  {
    id: "central-jyotirlinga",
    name: "Central Jyotirlinga (Mahakal & Omkareshwar)",
    state: "MP",
    days: 2 as const,
    templeKeywords: ["Mahakaleshwar", "Omkareshwar"],
  },
  {
    id: "pancha-bhoota",
    name: "Pancha Bhoota Sthalams (5 Elements)",
    state: "TN",
    days: 3 as const,
    templeKeywords: ["Ekambareswarar", "Jambukeswarar", "Annamalaiyar", "Srikalahasti", "Nataraja"],
  },
  {
    id: "western-jyotirlinga",
    name: "Western Jyotirlinga (Somnath & Dwarka)",
    state: "GJ",
    days: 3 as const,
    templeKeywords: ["Somnath", "Dwarkadhish"],
  },
  {
    id: "chota-char-dham",
    name: "Chota Char Dham (Kedarnath & Badrinath)",
    state: "UK",
    days: 3 as const,
    templeKeywords: ["Kedarnath", "Badrinath"],
  },
  {
    id: "ashta-vinayaka",
    name: "Ashta Vinayaka Circuit (Maharashtra)",
    state: "MH",
    days: 3 as const,
    templeKeywords: ["Siddhivinayak", "Ganesh", "Ganpati"],
  },
  {
    id: "divya-desam-chola",
    name: "Divya Desam Circuit (Srirangam)",
    state: "TN",
    days: 3 as const,
    templeKeywords: ["Ranganathaswamy", "Sarangapani"],
  },
  {
    id: "eastern-shakti",
    name: "Eastern Shakti Peethas (Kamakhya & Kalighat)",
    state: "AS",
    days: 3 as const,
    templeKeywords: ["Kamakhya", "Kalighat", "Tarapith"],
  },
  {
    id: "jh-jyotirlinga",
    name: "Baidyanath-Basukinath Jyotirlinga (JH)",
    state: "JH",
    days: 2 as const,
    templeKeywords: ["Baidyanath", "Basukinath", "Rajrappa"],
  },
  {
    id: "ts-kakatiya-trail",
    name: "Telangana Kakatiya & Heritage Trail (TS)",
    state: "TS",
    days: 2 as const,
    templeKeywords: ["Yadadri", "Thousand Pillar", "Ramappa"],
  },
  {
    id: "cg-heritage",
    name: "Chhattisgarh Shakti & Sirpur (CG)",
    state: "CG",
    days: 2 as const,
    templeKeywords: ["Danteshwari", "Bhoramdeo", "Sirpur"],
  },
  {
    id: "jk-kashmir-peaks",
    name: "Kashmir Peaks & Springs (JK)",
    state: "JK",
    days: 3 as const,
    templeKeywords: ["Shankaracharya", "Kheer Bhawani", "Amarnathji"],
  },
  {
    id: "ga-konkan-devasthan",
    name: "Goa Konkani Devasthan Parikrama (GA)",
    state: "GA",
    days: 1 as const,
    templeKeywords: ["Manguesh", "Shanta Durga", "Tambdi Surla"],
  },
];

const INTERESTS = [
  "Darshan",
  "History",
  "Photography",
  "Devotional music",
  "Food & prasad",
  "Rest & comfort",
];

export default function PlanStudio() {
  const sp = useSearchParams();
  const initialTemple = sp.get("temple") ?? "";
  const festivalParam = sp.get("festival") ?? "";

  const [allTemples, setAllTemples] = useState<LiteTemple[]>([]);
  const [selectedTemples, setSelectedTemples] = useState<LiteTemple[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Pilgrimage options (Route Lab supporting 1 to 7+ days)
  const [days, setDays] = useState<1 | 2 | 3 | 5 | 7>(1);
  const [originLocation, setOriginLocation] = useState("");
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState<"budget" | "moderate" | "premium">("moderate");
  const [pace, setPace] = useState<"leisurely" | "standard" | "fast">("standard");
  const [type, setType] = useState<"morning" | "full" | "evening">("full");
  const [travel, setTravel] = useState<"walking" | "car" | "bus">("car");
  const [interests, setInterests] = useState<string[]>(["Darshan", "History", "Food & prasad"]);

  // Demographic & accessibility toggles
  const [hasChildren, setHasChildren] = useState(false);
  const [hasElderly, setHasElderly] = useState(false);
  const [hasAccessibility, setHasAccessibility] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Fetch full live catalog of verified temples from Neon PostgreSQL
  useEffect(() => {
    fetch("/api/temples-lite")
      .then((r) => r.json())
      .then((d: LiteTemple[]) => {
        setAllTemples(d);
        if (initialTemple) {
          const match = d.find((t) => t.slug === initialTemple || t.id === initialTemple);
          if (match) setSelectedTemples([match]);
        } else if (d.length > 0) {
          setSelectedTemples([d[0]]);
        }
      })
      .catch((err) => {
        console.error("Failed to load temples lite:", err);
      });
  }, [initialTemple]);

  const selectCuratedCircuit = (circuit: (typeof CURATED_CIRCUITS)[number]) => {
    const matched = allTemples.filter(
      (t) =>
        t.stateCode === circuit.state &&
        circuit.templeKeywords.some((k) => t.name.toLowerCase().includes(k.toLowerCase()))
    );
    if (matched.length > 0) {
      setSelectedTemples(matched.slice(0, 4));
      setDays(circuit.days);
      setError("");
    }
  };

  // Unique states for filtering
  const availableStates = useMemo(() => {
    const map = new Map<string, string>();
    allTemples.forEach((t) => {
      map.set(t.stateCode, t.stateName || t.stateCode);
    });
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allTemples]);

  // Filtered temples in search dropdown
  const filteredCandidates = useMemo(() => {
    return allTemples
      .filter((t) => {
        const matchesState = stateFilter === "all" || t.stateCode === stateFilter;
        const matchesQuery =
          !searchQuery.trim() ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.deity.toLowerCase().includes(searchQuery.toLowerCase());
        const notSelected = !selectedTemples.some((s) => s.slug === t.slug);
        return matchesState && matchesQuery && notSelected;
      })
      .slice(0, 30);
  }, [allTemples, searchQuery, stateFilter, selectedTemples]);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const addTemple = (t: LiteTemple) => {
    if (selectedTemples.length >= 5) {
      setError("Maximum 5 temples can be sequenced in a single day itinerary.");
      return;
    }
    setSelectedTemples((prev) => [...prev, t]);
    setSearchQuery("");
    setIsSearchOpen(false);
    setError("");
  };

  const removeTemple = (slug: string) => {
    setSelectedTemples((prev) => prev.filter((t) => t.slug !== slug));
  };

  const generate = async () => {
    if (selectedTemples.length === 0) {
      setError("Please select at least one temple to plan your visit.");
      return;
    }

    setLoading(true);
    setError("");

    const companions: ("solo" | "couple" | "family" | "children" | "elderly" | "accessibility")[] = [];
    if (people === 1) companions.push("solo");
    else if (people === 2) companions.push("couple");
    else companions.push("family");

    if (hasChildren) companions.push("children");
    if (hasElderly) companions.push("elderly");
    if (hasAccessibility) companions.push("accessibility");

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeIds: selectedTemples.map((t) => t.slug),
          templeId: selectedTemples[0].slug,
          days,
          people,
          budget,
          pace,
          type,
          companions,
          interests,
          lang: "en",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to construct itinerary");
      setResult(data.plan ?? data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Plan generation failed");
    } finally {
      setLoading(false);
    }
  };

  const copyItinerary = () => {
    if (!result) return;
    const text = [
      `Devyatra Pilgrimage Itinerary`,
      `Summary: ${result.summary}`,
      `Duration: ${result.duration} | Cost: ${result.estimatedCost}`,
      ``,
      `Schedule:`,
      ...result.items.map((it, i) => `${i + 1}. [${it.time}] ${it.place} (${it.type}) - ${it.reason}`),
      ``,
      `Warnings & Grounded Notes:`,
      ...result.warnings.map((w) => `• ${w}`),
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const saveToMyJourneys = async () => {
    if (!result) return;
    try {
      const resp = await fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTemples.length > 0 ? `${selectedTemples[0].name} Pilgrimage` : "Sacred Pilgrimage",
          templeSlugs: selectedTemples.map((t) => t.slug),
          templeNames: selectedTemples.map((t) => t.name),
          startDate: new Date().toISOString().split("T")[0],
          totalDays: days,
          travelMode: travel,
          budget,
          itineraryBrief: result?.summary ?? null,
          familyMode: hasChildren,
          seniorMode: hasElderly,
          accessibilityMode: hasAccessibility,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.journey) {
        setLastSavedId(data.journey.id);
        setSaveFeedback("Saved!");
        setTimeout(() => setSaveFeedback(null), 3000);
      } else {
        setSaveFeedback(data.error || "Sign in to save");
        setTimeout(() => setSaveFeedback(null), 3500);
      }
    } catch {
      setSaveFeedback("Error saving");
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  const shareCurrentJourney = async () => {
    if (!lastSavedId) {
      setShareFeedback("Save journey first");
      setTimeout(() => setShareFeedback(null), 3000);
      return;
    }
    try {
      const resp = await fetch("/api/journeys/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journeyId: lastSavedId }),
      });
      const data = await resp.json();
      if (resp.ok && data.shareUrl) {
        const full = `${window.location.origin}${data.shareUrl}`;
        navigator.clipboard.writeText(full);
        setShareFeedback("Link Copied!");
        setTimeout(() => setShareFeedback(null), 3500);
      } else {
        setShareFeedback(data.error || "Error sharing");
        setTimeout(() => setShareFeedback(null), 3000);
      }
    } catch {
      setShareFeedback("Error sharing");
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {/* ── Configuration Form ── */}
      <div className="space-y-6 rounded-3xl border border-line bg-obsidian-2 p-6">
        <div>
          <p className="font-display text-xl font-medium text-ivory">Design Your Pilgrimage Circuit</p>
          <p className="mt-1 text-xs text-ivory-dim">
            Select 1 to 5 temples across India. The AI sequences travel legs, darshan pacing, and meal breaks based on your itinerary.
          </p>
        </div>

        {festivalParam && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300">Auspicious Festival Itinerary</p>
              <p className="text-[11.5px] text-amber-200/90 mt-0.5">
                Planning pilgrimage for <strong>{festivalParam}</strong>. Special darshan pacing and peak hours calibrated.
              </p>
            </div>
          </div>
        )}

        {/* Curated Sacred Circuits */}
        <div>
          <label className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            <span className="flex items-center gap-1.5 text-gold-bright">
              <Compass className="h-3.5 w-3.5" />
              <span>National Sacred Pilgrimage Circuits</span>
            </span>
            <span className="text-[10px] text-ivory-dim/60">One-click preset</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CURATED_CIRCUITS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCuratedCircuit(c)}
                className="group flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/5 px-2.5 py-1 text-[11px] text-ivory-dim transition-all hover:border-gold/60 hover:bg-gold/15 hover:text-gold-bright"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold/50 group-hover:bg-gold" />
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Starting Point (Route Lab) */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            <Compass className="mr-1 inline h-3.5 w-3.5" /> Starting Point / Origin
          </label>
          <input
            type="text"
            placeholder="e.g. Current location, Bengaluru Airport, Chennai Central..."
            value={originLocation}
            onChange={(e) => setOriginLocation(e.target.value)}
            className="w-full rounded-xl border border-line bg-obsidian-3 px-3.5 py-2.5 text-xs text-ivory placeholder:text-ivory-dim/50 focus:border-gold/50 focus:outline-none"
          />
        </div>

        {/* Pilgrimage Duration (Days) */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            <Calendar className="mr-1 inline h-3.5 w-3.5" /> Pilgrimage Duration
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { d: 1 as const, label: "1 Day" },
              { d: 2 as const, label: "2 Days" },
              { d: 3 as const, label: "3 Days" },
              { d: 5 as const, label: "5 Days" },
              { d: 7 as const, label: "7 Days" },
            ].map((opt) => (
              <SegBtn
                key={opt.d}
                active={days === opt.d}
                onClick={() => setDays(opt.d)}
                label={opt.label}
              />
            ))}
          </div>
        </div>

        {/* Selected Temples Queue */}
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            Selected Temples ({selectedTemples.length}/5)
          </label>

          <div className="space-y-2">
            {selectedTemples.map((t, idx) => (
              <div
                key={t.slug}
                className="flex items-center justify-between rounded-xl border border-gold/30 bg-obsidian-3 p-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 font-mono text-[11px] font-semibold text-gold-bright">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ivory">{t.name}</p>
                    <p className="truncate text-[11px] text-ivory-dim">
                      {t.deity} · {t.location}, {t.stateCode}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeTemple(t.slug)}
                  aria-label={`Remove ${t.name}`}
                  className="rounded-lg p-1 text-ivory-dim/60 hover:bg-white/[0.08] hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Temple Combobox */}
          {selectedTemples.length < 5 && (
            <div className="relative mt-2">
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-dashed border-white/20 bg-obsidian-3/50 px-3.5 py-2.5 text-xs text-ivory-dim hover:border-gold/40 hover:text-ivory"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-gold" />
                  <span>Add another temple to this day...</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {isSearchOpen && (
                <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-line bg-obsidian-1 p-3 shadow-2xl backdrop-blur-xl">
                  {/* Filters inside combobox */}
                  <div className="flex gap-2 pb-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ivory-dim" />
                      <input
                        type="text"
                        placeholder="Search temple name or deity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-white/[0.08] bg-obsidian-3 py-1.5 pl-8 pr-3 text-xs text-ivory placeholder:text-ivory-dim/50 focus:border-gold/40 focus:outline-none"
                        autoFocus
                      />
                    </div>
                    <select
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      className="rounded-lg border border-white/[0.08] bg-obsidian-3 px-2 py-1.5 text-xs text-ivory focus:border-gold/40 focus:outline-none"
                    >
                      <option value="all">All States</option>
                      {availableStates.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* List of matches */}
                  <div className="max-h-52 overflow-y-auto divide-y divide-white/[0.04]">
                    {filteredCandidates.length === 0 ? (
                      <p className="py-4 text-center text-xs text-ivory-dim/60">
                        No matching temples found. Try adjusting search or state filter.
                      </p>
                    ) : (
                      filteredCandidates.map((t) => (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => addTemple(t)}
                          className="flex w-full items-center justify-between py-2 text-left text-xs transition-colors hover:bg-white/[0.04] px-2 rounded-lg"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate font-medium text-ivory">{t.name}</p>
                            <p className="truncate text-[10.5px] text-ivory-dim">
                              {t.deity} · {t.district}, {t.stateCode}
                            </p>
                          </div>
                          <Plus className="h-3.5 w-3.5 text-gold shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Schedule Window */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            Daily Hours Window
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "morning", label: "Morning (07:00–13:00)" },
              { id: "full", label: "Full Day (08:00–18:00)" },
              { id: "evening", label: "Evening (14:00–21:00)" },
            ].map((td) => (
              <SegBtn
                key={td.id}
                active={type === td.id}
                onClick={() => setType(td.id as "morning" | "full" | "evening")}
                label={td.label}
              />
            ))}
          </div>
        </div>

        {/* People & Transport */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
              <Users className="mr-1 inline h-3.5 w-3.5" /> Pilgrims: {people}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              aria-label="Number of pilgrims"
              className="w-full accent-saffron"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
              <Car className="mr-1 inline h-3.5 w-3.5" /> Transit Mode
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["walking", "car", "bus"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTravel(m)}
                  className={cn(
                    "rounded-xl border py-1.5 text-center text-[11px] font-medium capitalize",
                    travel === m
                      ? "border-gold/50 bg-gold/15 text-gold-bright"
                      : "border-line bg-obsidian-3 text-ivory-dim"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Budget & Pacing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
              <Wallet className="mr-1 inline h-3.5 w-3.5" /> Budget Tier
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["budget", "moderate", "premium"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={cn(
                    "rounded-xl border py-1.5 text-center text-[11px] font-medium capitalize transition-colors",
                    budget === b
                      ? "border-gold/50 bg-gold/15 text-gold-bright"
                      : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
                  )}
                >
                  {b === "budget" ? "Budget" : b === "moderate" ? "Mid" : "Comfort"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
              <Clock className="mr-1 inline h-3.5 w-3.5" /> Pilgrimage Pace
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["leisurely", "standard", "fast"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPace(p)}
                  className={cn(
                    "rounded-xl border py-1.5 text-center text-[11px] font-medium capitalize transition-colors",
                    pace === p
                      ? "border-gold/50 bg-gold/15 text-gold-bright"
                      : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Demographic & Accessibility Toggles */}
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            Party Demographics & Accessibility
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setHasChildren(!hasChildren)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center text-xs transition-colors",
                hasChildren
                  ? "border-gold/50 bg-gold/15 text-gold-bright"
                  : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
              )}
            >
              <Baby className="h-4 w-4" />
              <span className="text-[11px] font-medium">Children</span>
            </button>

            <button
              type="button"
              onClick={() => setHasElderly(!hasElderly)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center text-xs transition-colors",
                hasElderly
                  ? "border-gold/50 bg-gold/15 text-gold-bright"
                  : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
              )}
            >
              <HeartHandshake className="h-4 w-4" />
              <span className="text-[11px] font-medium">Elderly / Seniors</span>
            </button>

            <button
              type="button"
              onClick={() => setHasAccessibility(!hasAccessibility)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center text-xs transition-colors",
                hasAccessibility
                  ? "border-gold/50 bg-gold/15 text-gold-bright"
                  : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
              )}
            >
              <Accessibility className="h-4 w-4" />
              <span className="text-[11px] font-medium">Step-Free / Ramp</span>
            </button>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
            Focus & Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleInterest(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11.5px] transition-colors",
                  interests.includes(i)
                    ? "border-gold/50 bg-gold/12 text-gold-bright"
                    : "border-line text-ivory-dim hover:border-gold/30"
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generate}
          disabled={loading || selectedTemples.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-saffron to-gold py-3.5 text-sm font-semibold text-obsidian shadow-lg transition-transform hover:scale-[1.01] hover:brightness-110 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>{loading ? "Synthesizing Circuit & Timing Context..." : "Generate Pilgrimage Itinerary"}</span>
        </button>

        {error && <p className="text-center text-xs text-red-400">{error}</p>}
      </div>

      {/* ── Generated Itinerary Result Display ── */}
      <div className="min-h-[400px] rounded-3xl border border-line bg-obsidian-2 p-6">
        {!result && !loading ? (
          <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
            <Sparkles className="h-10 w-10 text-gold-dim/50" />
            <h3 className="mt-3 font-display text-lg font-medium text-ivory">
              Grounded AI Pilgrimage Studio
            </h3>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-ivory-dim">
              Your customized timeline — incorporating actual temple darshan slots, calculated transit distances,
              satvik meals, and senior/child accommodation notes — will appear here.
            </p>
          </div>
        ) : loading ? (
          <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
            <p className="text-xs text-ivory-dim">
              Reconciling verified temple schedules and geospatial travel legs...
            </p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Header with quick telemetry */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-bright">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{result.duration}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-bright">
                  <Wallet className="h-3.5 w-3.5" />
                  <span>{result.estimatedCost || (budget === "budget" ? "General Queue Darshan" : "Darshan & Special Entry Options")}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyItinerary}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs text-ivory-dim hover:text-ivory"
                >
                  {copyFeedback ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs text-ivory-dim hover:text-ivory"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={saveToMyJourneys}
                  className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-gold/15 px-2.5 py-1.5 text-xs font-medium text-gold-bright hover:bg-gold/25"
                >
                  {saveFeedback ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">{saveFeedback}</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Save Journey</span>
                    </>
                  )}
                </button>
                <button
                  onClick={shareCurrentJourney}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-ivory-dim hover:text-ivory hover:border-gold/30"
                >
                  {shareFeedback ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">{shareFeedback}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm leading-relaxed text-ivory/90">{result.summary}</p>
            <p className="font-mono text-xs text-gold-bright">{result.estimatedCost}</p>

            {/* Step by step timeline */}
            <ol className="space-y-3">
              {result.items.map((it, i) => {
                const prev = result.items[i - 1];
                const isNewDay = it.day && (!prev || prev.day !== it.day);
                return (
                  <div key={i} className="space-y-2">
                    {isNewDay && (
                      <div className="flex items-center gap-2 border-b border-gold/25 py-2 first:pt-0">
                        <Calendar className="h-4 w-4 text-gold-bright" />
                        <span className="font-display text-xs font-semibold uppercase tracking-wider text-gold-bright">
                          Day {it.day} Pilgrimage Circuit
                        </span>
                      </div>
                    )}
                    <motion.li
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                      className={cn(
                        "flex gap-3.5 rounded-2xl border p-4 transition-colors",
                        it.type.includes("transit")
                          ? "border-white/[0.04] bg-obsidian-1 text-ivory-dim"
                          : it.type.includes("rest")
                          ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300/90"
                          : "border-white/[0.08] bg-obsidian-3 text-ivory"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 font-mono text-xs font-semibold text-gold-bright">
                          {i + 1}
                        </span>
                        {i < result.items.length - 1 && <span className="mt-1 h-full w-px bg-white/10" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-gold-bright">{it.time}</span>
                          <span className="font-display text-sm font-medium text-ivory">{it.place}</span>
                          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-wider text-ivory-dim">
                            {it.type}
                          </span>
                          {it.durationMinutes > 0 && (
                            <span className="text-[11px] text-ivory-dim">({it.durationMinutes} min)</span>
                          )}
                        </div>

                        <p className="mt-1.5 text-xs leading-relaxed text-ivory-dim">{it.reason}</p>

                        {it.source && (
                          <p className="mt-1 font-mono text-[10px] text-ivory-dim/50">Source: {it.source}</p>
                        )}
                      </div>
                    </motion.li>
                  </div>
                );
              })}
            </ol>

            {/* Warnings and Epistemic Honesty Alert */}
            {result.warnings.length > 0 && (
              <div className="space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-300/90">
                <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Important Verification & Advisory Notes</span>
                </div>
                <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[11.5px] leading-relaxed">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Offline Sacred Checklist */}
            <div className="rounded-2xl border border-line bg-obsidian-3 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Offline Sacred Pilgrimage Checklist</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-ivory">Dress Code & Etiquette</p>
                  <p className="text-ivory-dim">Rules vary by shrine tradition. Traditional modest attire recommended; verify specific temple requirements prior to darshan.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-ivory">Identity & Verification</p>
                  <p className="text-ivory-dim">Carrying government photo identification is advised for booked special darshan or quota counters.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-ivory">Electronics & Items</p>
                  <p className="text-ivory-dim">Electronics and leather rules vary by temple authority. Official cloakroom availability should be verified upon arrival.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-ivory">Prasadam & Dining</p>
                  <p className="text-ivory-dim">Prasadam distribution schedules and annadhanam facilities depend on individual devasthanam trusts.</p>
                </div>
              </div>
            </div>

            {/* Transparent Pilgrim Trip Cost Estimator */}
            <TripCostPanel
              totalDays={days}
              totalEstimatedKm={Math.max(60, selectedTemples.length * 85)}
              templeCount={selectedTemples.length}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-2 py-2 text-center text-xs font-medium transition-all",
        active
          ? "border-gold/50 bg-gold/15 text-gold-bright"
          : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
      )}
    >
      {label}
    </button>
  );
}