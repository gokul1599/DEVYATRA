"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Compass,
  Navigation,
  Car,
  Clock,
  Plus,
  Check,
  ChevronRight,
  Sparkles,
  Map as MapIcon,
  Users,
  HeartHandshake,
  Route,
} from "lucide-react";
import {
  DISTANCE_BANDS,
  type DistanceBandId,
  type ExtendedDiscoveryItem,
  type TravelStyle,
} from "@/lib/destinations/extended-types";
import { cn } from "@/lib/cn";
import { CinematicImage } from "@/components/ui/cinematic-image";
import { getTempleImage } from "@/lib/images/registry";

interface TempleExtendedDiscoveryProps {
  templeId: string;
  templeName: string;
  templeLat: number;
  templeLng: number;
  locationName: string;
  initialData?: {
    bands: {
      band: (typeof DISTANCE_BANDS)[DistanceBandId];
      count: number;
      items: ExtendedDiscoveryItem[];
    }[];
    totalCount: number;
  };
}

export function TempleExtendedDiscovery({
  templeId,
  templeName,
  templeLat,
  templeLng,
  locationName,
  initialData,
}: TempleExtendedDiscoveryProps) {
  const [activeBand, setActiveBand] = useState<DistanceBandId | "ALL">("ALL");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeStyle, setActiveStyle] = useState<TravelStyle | "ALL">("ALL");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<ExtendedDiscoveryItem[]>(() => {
    if (!initialData?.bands) return [];
    return initialData.bands.flatMap((b) => b.items);
  });
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [bandCounts, setBandCounts] = useState<Record<string, number>>(() => {
    if (!initialData?.bands) return {};
    const counts: Record<string, number> = {};
    for (const b of initialData.bands) {
      counts[b.band.id] = b.count;
    }
    return counts;
  });

  // Sync saved places from localStorage (deferred to avoid hydration mismatch)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem("tem_saved_places");
        if (raw) {
          setSavedIds(new Set(JSON.parse(raw)));
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch extended discovery data if not provided or when parameters change
  useEffect(() => {
    if (initialData) return;
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/destinations/extended-discovery?lat=${templeLat}&lng=${templeLng}&radiusKm=300&excludeId=${templeId}&limit=120`
        );
        if (!res.ok) throw new Error("Failed to load extended discovery");
        const json = await res.json();
        if (isMounted && json.bands) {
          const allItems: ExtendedDiscoveryItem[] = [];
          const counts: Record<string, number> = {};
          for (const b of json.bands) {
            counts[b.band.id] = b.count;
            allItems.push(...b.items);
          }
          setItems(allItems);
          setBandCounts(counts);
        }
      } catch (err) {
        console.error("Error loading extended discovery:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [templeLat, templeLng, templeId, initialData]);

  // Toggle Save to Journey
  const toggleSave = (item: ExtendedDiscoveryItem) => {
    const isSaved = savedIds.has(item.id);
    const nextSaved = new Set(savedIds);
    if (isSaved) {
      nextSaved.delete(item.id);
    } else {
      nextSaved.add(item.id);
    }
    setSavedIds(nextSaved);

    try {
      localStorage.setItem("tem_saved_places", JSON.stringify([...nextSaved]));
      const richRaw = localStorage.getItem("tem_saved_places_rich");
      const richList: Array<{ id: string; name: string; category: string; location: string }> = richRaw ? JSON.parse(richRaw) : [];
      const updatedRich = isSaved
        ? richList.filter((p) => p.id !== item.id)
        : [...richList, { id: item.id, name: item.name, category: item.category, location: item.locality || locationName }];
      localStorage.setItem("tem_saved_places_rich", JSON.stringify(updatedRich));
    } catch {}
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeBand !== "ALL" && item.distanceBand !== activeBand) {
        return false;
      }
      if (activeCategory !== "ALL") {
        if (activeCategory === "TEMPLE" && item.category !== "TEMPLE" && item.category !== "PILGRIMAGE") return false;
        if (activeCategory === "HERITAGE" && item.category !== "HERITAGE") return false;
        if (activeCategory === "NATURE" && item.category !== "NATURE" && item.category !== "VIEWPOINT") return false;
        if (activeCategory === "CULTURE" && item.category !== "CULTURE") return false;
      }
      if (activeStyle !== "ALL" && !item.travelStyles.includes(activeStyle)) {
        return false;
      }
      return true;
    });
  }, [items, activeBand, activeCategory, activeStyle]);

  const totalDestinationsFound = items.length;

  return (
    <div className="rounded-3xl border border-gold/20 bg-gradient-to-b from-obsidian-2 to-obsidian p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
            <Compass className="h-3.5 w-3.5" />
            300 km Regional Sacred Atlas
          </div>
          <h2 className="mt-3 font-display text-2xl font-medium text-ivory sm:text-3xl">
            Extend Your Yatra
          </h2>
          <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ivory-dim">
            Explore authentic sacred corridors, historical monuments, and holy rivers up to 300 km around {templeName}. Distances are rigorously grounded between straight-line air and road travel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/map?lat=${templeLat}&lng=${templeLng}&zoom=9`}
            className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-[13px] font-medium text-gold-bright transition hover:bg-gold/20"
          >
            <MapIcon className="h-4 w-4" />
            Open on Map Explorer
          </Link>
          <Link
            href={`/plan?origin=${encodeURIComponent(locationName)}&temple=${encodeURIComponent(templeName)}`}
            className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-[13px] font-semibold text-obsidian transition hover:bg-gold-bright"
          >
            <Route className="h-4 w-4" />
            Build Route
          </Link>
        </div>
      </div>

      {/* Graduated Distance Band Tabs */}
      <div className="mt-8 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveBand("ALL")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium transition",
              activeBand === "ALL"
                ? "bg-gold text-obsidian shadow-sm shadow-gold/20"
                : "border border-line bg-obsidian-3 text-ivory-dim hover:border-gold/40 hover:text-ivory"
            )}
          >
            All Bands (0–300 km)
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              activeBand === "ALL" ? "bg-obsidian/20 text-obsidian" : "bg-line text-ivory-dim"
            )}>
              {totalDestinationsFound}
            </span>
          </button>

          {(Object.keys(DISTANCE_BANDS) as DistanceBandId[]).map((bId) => {
            const b = DISTANCE_BANDS[bId];
            const count = bandCounts[bId] || 0;
            const isSelected = activeBand === bId;
            return (
              <button
                key={bId}
                onClick={() => setActiveBand(bId)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-medium transition",
                  isSelected
                    ? "bg-gold text-obsidian shadow-sm shadow-gold/20"
                    : "border border-line bg-obsidian-3 text-ivory-dim hover:border-gold/40 hover:text-ivory"
                )}
              >
                <span>{b.label}</span>
                <span className="hidden sm:inline text-[11px] opacity-80">· {b.tagline.split("&")[0].trim()}</span>
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  isSelected ? "bg-obsidian/20 text-obsidian" : "bg-line text-ivory-dim"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Filters: Category & Travel Style */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Category:</span>
          {[
            { id: "ALL", label: "All" },
            { id: "TEMPLE", label: "Sacred Shrines" },
            { id: "HERITAGE", label: "ASI & Heritage" },
            { id: "NATURE", label: "Nature & Sangam" },
            { id: "CULTURE", label: "Culture & Arts" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition",
                activeCategory === cat.id
                  ? "bg-gold/20 text-gold-bright border border-gold/40"
                  : "text-ivory-dim hover:text-ivory border border-transparent"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Travel Style Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Travel Style:</span>
          {[
            { id: "ALL", label: "Any Style", icon: Sparkles },
            { id: "FAMILY", label: "Family", icon: Users },
            { id: "SENIOR", label: "Senior Ease", icon: HeartHandshake },
            { id: "ROAD_TRIP", label: "Road Trip", icon: Car },
          ].map((style) => {
            const Icon = style.icon;
            return (
              <button
                key={style.id}
                onClick={() => setActiveStyle(style.id as TravelStyle | "ALL")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition",
                  activeStyle === style.id
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "text-ivory-dim hover:text-ivory border border-transparent"
                )}
              >
                <Icon className="h-3 w-3" />
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 animate-pulse rounded-2xl border border-line/40 bg-obsidian-3 p-4"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-ivory-dim">
            <Compass className="mx-auto h-8 w-8 text-gold/40" />
            <p className="mt-3 text-[14px] font-medium text-ivory">No destinations match this filter combination</p>
            <p className="mt-1 text-[12.5px]">Try switching to &quot;All Bands&quot; or selecting &quot;Any Style&quot; to view all verified destinations.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.slice(0, 18).map((item) => {
              const isSaved = savedIds.has(item.id);
              const band = DISTANCE_BANDS[item.distanceBand];

              const imgRecord = item.imageReference
                ? {
                    id: `ext-${item.id}`,
                    src: item.imageReference,
                    alt: item.name,
                    category: "LANDMARK" as const,
                    rights: "OFFICIAL_PROVENANCE" as const,
                    credit: "Verified Destination Archive",
                    focalPoint: "center" as const,
                  }
                : getTempleImage(item.slug);

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-obsidian-2 transition hover:border-gold/40 hover:bg-obsidian-3"
                >
                  <div className="relative overflow-hidden">
                    <CinematicImage
                      image={imgRecord}
                      artSeed={`${item.slug || item.name}`}
                      alt={item.name}
                      aspectRatio="16/9"
                      showCreditBadge={Boolean(imgRecord?.src)}
                      className="w-full"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[10.5px] font-semibold text-gold-bright">
                          {band.label}
                        </span>
                        <span className="text-[11px] font-medium text-ivory-dim">
                          {item.significanceLabel}
                        </span>
                      </div>

                    {/* Title & Native Name */}
                    <h3 className="mt-2.5 font-display text-[17px] font-medium leading-snug text-ivory">
                      <Link href={item.navLinks.internalUrl} className="hover:text-gold-bright transition">
                        {item.name}
                      </Link>
                    </h3>
                    {item.nativeName && (
                      <p className="text-[12px] font-medium text-gold-dim">{item.nativeName}</p>
                    )}

                    {/* Grounded Distance & Driving Specs */}
                    <div className="mt-3 space-y-1 rounded-xl border border-line/50 bg-obsidian/60 p-2.5 text-[12px]">
                      <div className="flex items-center justify-between text-ivory">
                        <span className="flex items-center gap-1.5 text-ivory-dim">
                          <Car className="h-3.5 w-3.5 text-gold" />
                          Road Transit:
                        </span>
                        <span className="font-semibold text-gold-bright">
                          {item.roadDistanceKm} km (~{item.estimatedDriveMinutes >= 60 ? `${Math.floor(item.estimatedDriveMinutes / 60)}h ${item.estimatedDriveMinutes % 60}m` : `${item.estimatedDriveMinutes} min`} drive)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-ivory-dim text-[11px]">
                        <span>Straight-line air:</span>
                        <span>Approx. {item.airDistanceKm} km</span>
                      </div>
                    </div>

                    {/* Travel Style & Duration Tags */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10.5px] text-ivory-dim">
                        <Clock className="h-3 w-3 text-gold/70" />
                        {item.duration === "QUICK_STOP" ? "1–2h Visit" : item.duration === "HALF_DAY" ? "Half Day" : item.duration === "FULL_DAY" ? "Full Day" : "Multi-Day Yatra"}
                      </span>
                      {item.travelStyles.includes("SENIOR") && (
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-400">
                          Senior Ease
                        </span>
                      )}
                      {item.travelStyles.includes("FAMILY") && (
                        <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10.5px] font-medium text-blue-400">
                          Family Friendly
                        </span>
                      )}
                    </div>

                    {/* Description snippet */}
                    <p className="mt-2.5 line-clamp-2 text-[12.5px] leading-relaxed text-ivory-dim">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 flex items-center justify-between gap-2 border-t border-line/60 pt-3">
                    <button
                      onClick={() => toggleSave(item)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition",
                        isSaved
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "border border-line bg-obsidian-4 text-ivory-dim hover:text-ivory hover:border-gold/40"
                      )}
                    >
                      {isSaved ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Saved
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" /> Save to Yatra
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.navLinks.googleMaps}
                        target="_blank"
                        rel="noreferrer"
                        title="Directions in Google Maps"
                        className="rounded-lg border border-line bg-obsidian-4 p-1.5 text-ivory-dim transition hover:border-gold/40 hover:text-ivory"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                      </a>
                      <Link
                        href={item.navLinks.internalUrl}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-gold-bright hover:underline"
                      >
                        View Details <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* Footer Corridor Action Banner */}
      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line/80 bg-obsidian-3 p-5 sm:flex-row">
        <div>
          <h4 className="font-display text-[15px] font-medium text-ivory">Planning a broader pilgrimage circuit?</h4>
          <p className="mt-0.5 text-[12.5px] text-ivory-dim">
            Connect {templeName} with other sacred sanctums in our Route Lab with darshan slots and driving schedules.
          </p>
        </div>
        <Link
          href={`/plan?origin=${encodeURIComponent(locationName)}&temple=${encodeURIComponent(templeName)}`}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-[12.5px] font-semibold text-obsidian transition hover:bg-gold-bright"
        >
          <Route className="h-4 w-4" />
          Open in Route Lab
        </Link>
      </div>
    </div>
  );
}
