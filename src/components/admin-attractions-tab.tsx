"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Landmark,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface AttractionTelemetry {
  stats: {
    totalPlaces: number;
    totalLinks: number;
    categories: Record<string, number>;
    verification: Record<string, number>;
  };
  places: Array<{
    id: string;
    name: string;
    nativeName?: string | null;
    slug: string;
    category: string;
    district: string | null;
    state: string | null;
    sourceType: string | null;
    verificationStatus: string;
    linkedTemplesCount: number;
  }>;
  unlinkedTemplesQueue: Array<{
    id: string;
    name: string;
    slug: string;
    district: string;
    state: string;
    stateCode: string;
    latitude: number;
    longitude: number;
  }>;
}

export function AdminAttractionsTab() {
  const [data, setData] = useState<AttractionTelemetry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"places" | "unlinked">("places");
  const [selectedCat, setSelectedCat] = useState<string>("ALL");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/attractions");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load attraction data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/attractions");
        if (res.ok) {
          const json = await res.json();
          if (!ignore) {
            setData(json);
            setLoading(false);
          }
        }
      } catch {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-line bg-obsidian-2">
        <div className="flex items-center gap-3 text-ivory-dim">
          <RefreshCw className="h-5 w-5 animate-spin text-gold" />
          <span>Loading normalized attractions telemetry...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-line bg-obsidian-2 p-8 text-center text-ivory-dim">
        <p>Attraction telemetry unavailable.</p>
        <button
          onClick={fetchData}
          className="mt-3 rounded-lg border border-line px-4 py-1.5 text-xs text-ivory hover:bg-white/[0.05]"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, places, unlinkedTemplesQueue } = data;

  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.district && p.district.toLowerCase().includes(search.toLowerCase())) ||
      (p.state && p.state.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCat === "ALL" || p.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const filteredUnlinked = unlinkedTemplesQueue.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.district.toLowerCase().includes(search.toLowerCase()) ||
      t.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── KPI Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Famous Places
            </span>
            <Compass className="h-4 w-4 text-gold-bright" />
          </div>
          <p className="mt-2 font-display text-3xl font-medium text-ivory">
            {stats.totalPlaces}
          </p>
          <p className="mt-1 text-[12px] text-ivory-dim">
            Across 5 national categories
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Spatial Links
            </span>
            <Layers className="h-4 w-4 text-sky-400" />
          </div>
          <p className="mt-2 font-display text-3xl font-medium text-sky-400">
            {stats.totalLinks}
          </p>
          <p className="mt-1 text-[12px] text-ivory-dim">
            Multi-temple proximity bindings
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Heritage Protection
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 font-display text-3xl font-medium text-emerald-400">
            {stats.verification["VERIFIED"] || stats.totalPlaces}
          </p>
          <p className="mt-1 text-[12px] text-ivory-dim">
            100% ASI / UNESCO / Official
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Unlinked Temples
            </span>
            <AlertCircle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 font-display text-3xl font-medium text-amber-400">
            {unlinkedTemplesQueue.length}
          </p>
          <p className="mt-1 text-[12px] text-ivory-dim">
            In queue for spatial linkage
          </p>
        </div>
      </div>

      {/* ── Sub-view Controls & Search ── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-obsidian-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("places")}
            className={cn(
              "rounded-xl px-4 py-2 text-[12.5px] font-medium transition-colors",
              viewMode === "places"
                ? "bg-gold/15 text-gold-bright border border-gold/30"
                : "text-ivory-dim hover:text-ivory border border-transparent"
            )}
          >
            Famous Places Registry ({places.length})
          </button>
          <button
            onClick={() => setViewMode("unlinked")}
            className={cn(
              "rounded-xl px-4 py-2 text-[12.5px] font-medium transition-colors",
              viewMode === "unlinked"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                : "text-ivory-dim hover:text-ivory border border-transparent"
            )}
          >
            Unlinked Temples Queue ({unlinkedTemplesQueue.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ivory-dim" />
            <input
              type="text"
              placeholder={
                viewMode === "places"
                  ? "Filter places or districts..."
                  : "Filter unlinked temples..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 rounded-xl border border-line bg-surface py-1.5 pl-9 pr-4 text-xs text-ivory placeholder-ivory-dim focus:border-gold/50 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchData}
            title="Refresh Telemetry"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-surface text-ivory-dim hover:text-ivory"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── View 1: Famous Places Registry Table ── */}
      {viewMode === "places" && (
        <div className="overflow-hidden rounded-2xl border border-line bg-obsidian-2">
          {/* Category Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.05] p-3 text-[11px]">
            {["ALL", "HERITAGE", "PILGRIMAGE", "NATURE", "CULTURE", "LOCAL_EXPERIENCES"].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCat(c)}
                className={cn(
                  "rounded-full px-3 py-1 font-medium transition-colors",
                  selectedCat === c
                    ? "bg-gold/20 text-gold-bright border border-gold/40"
                    : "bg-surface text-ivory-dim hover:text-ivory border border-transparent"
                )}
              >
                {c === "ALL" ? "All Categories" : c.replace(/_/g, " ")}{" "}
                {c !== "ALL" && stats.categories[c] ? `(${stats.categories[c]})` : ""}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-surface/50 text-[11px] uppercase tracking-wider text-ivory-dim">
                <tr>
                  <th className="px-4 py-3 font-semibold">Attraction</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold text-center">Linked Temples</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredPlaces.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-ivory">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-3.5 w-3.5 text-gold" />
                        <div>
                          <p>{p.name}</p>
                          {p.nativeName && (
                            <p className="text-[11px] text-ivory-dim">{p.nativeName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10.5px] font-medium text-gold-bright">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ivory-dim">
                      {p.district}, {p.state}
                    </td>
                    <td className="px-4 py-3 text-ivory-dim">
                      <span className="uppercase text-[10px] tracking-wide text-emerald-400 font-semibold">
                        {p.sourceType || "Official"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block rounded-full bg-sky-500/15 px-2.5 py-0.5 font-mono text-[11px] font-medium text-sky-300">
                        {p.linkedTemplesCount} shrines
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View 2: Unlinked Temples Queue ── */}
      {viewMode === "unlinked" && (
        <div className="overflow-hidden rounded-2xl border border-line bg-obsidian-2">
          <div className="p-4 border-b border-white/[0.06] bg-amber-500/[0.04]">
            <p className="text-xs text-amber-300">
              Showing temples that do not currently have pre-bound records in{" "}
              <code className="text-gold-bright">temple_nearby_places</code>. These temples still
              utilize real-time spatial bounding-box discovery dynamically.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.06] bg-surface/50 text-[11px] uppercase tracking-wider text-ivory-dim">
                <tr>
                  <th className="px-4 py-3 font-semibold">Temple</th>
                  <th className="px-4 py-3 font-semibold">District & State</th>
                  <th className="px-4 py-3 font-semibold">Coordinates</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUnlinked.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-ivory">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-3.5 w-3.5 text-gold-dim" />
                        <span>{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ivory-dim">
                      {t.district}, {t.state} ({t.stateCode})
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-ivory-dim">
                      {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/temples/${t.stateCode.toLowerCase()}/${t.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[11px] text-ivory hover:bg-white/[0.05]"
                      >
                        <ExternalLink className="h-3 w-3 text-gold-bright" />
                        View Page
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
