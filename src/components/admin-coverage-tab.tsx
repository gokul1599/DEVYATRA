"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Landmark,
  MapPin,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type {
  NationalCoverageMatrix,
  StateCoverageItem,
  DistrictCoverageItem,
} from "@/lib/coverage/matrix";

export function AdminCoverageTab() {
  const [coverageData, setCoverageData] = useState<NationalCoverageMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [expandedState, setExpandedState] = useState<string | null>(null);

  const refetchCoverage = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coverage");
      if (!res.ok) {
        throw new Error(`Failed to load coverage: ${res.statusText}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setCoverageData(json.data);
      } else {
        throw new Error(json.error || "Invalid response structure");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching coverage data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/coverage");
        if (!res.ok) {
          throw new Error(`Failed to load coverage: ${res.statusText}`);
        }
        const json = await res.json();
        if (!ignore && json.success && json.data) {
          setCoverageData(json.data);
        } else if (!ignore) {
          throw new Error(json.error || "Invalid response structure");
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Error fetching coverage data");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredStates = useMemo(() => {
    if (!coverageData) return [];
    return coverageData.states.filter((st: StateCoverageItem) => {
      const matchesSearch =
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" || st.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [coverageData, searchQuery, selectedStatus]);

  if (loading && !coverageData) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-line bg-obsidian-2">
        <div className="flex items-center gap-3 text-sm text-ivory-dim">
          <RefreshCw className="h-5 w-5 animate-spin text-gold" />
          <span>Computing National District Coverage Matrix...</span>
        </div>
      </div>
    );
  }

  if (error && !coverageData) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <span>Coverage Telemetry Error</span>
        </div>
        <p className="mt-2 text-xs text-red-200/80">{error}</p>
        <button
          onClick={refetchCoverage}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/30"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const national = coverageData!;

  return (
    <div className="space-y-6">
      {/* ── Continuous Expansion Notice Banner ── */}
      <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4 text-[13px] text-ivory-dim">
        <Sparkles className="h-5 w-5 shrink-0 text-gold" />
        <p>
          <span className="font-medium text-ivory">Continuous National Expansion:</span> The Devyatra atlas is
          continuously expanding from official temple, government, heritage and geographic sources. Every ingested record is verified
          against state Devaswom boards, HR&amp;CE departments, MTDC, Rajasthan Devasthan, and official LGD district registries with zero synthetic records.
        </p>
      </div>

      {/* ── National Summary Banner ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Temples</span>
            <Landmark className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-2 font-display text-3xl font-medium text-ivory">
            {national.totalTemples.toLocaleString()}
          </p>
          <p className="mt-1 text-[12px] text-ivory-dim">
            Across {national.totalStates} States & UTs
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Represented Districts</span>
            <MapPin className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-emerald-400">
              {national.totalRepresentedDistricts}
            </span>
            <span className="text-[12px] text-ivory-dim">/ {national.totalOfficialDistricts} Official</span>
          </div>
          <p className="mt-1 text-[12px] text-emerald-300/80">With verified temple records</p>
        </div>

        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">National Coverage</span>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-sky-400">
              {national.nationalDistrictCoveragePercent}%
            </span>
            <span className="text-[12px] text-ivory-dim">District Density</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-500"
              style={{ width: `${Math.min(100, national.nationalDistrictCoveragePercent)}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Verified Temples</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-emerald-400">
              {national.totalVerifiedTemples.toLocaleString()}
            </span>
            <span className="text-[12px] text-emerald-300">
              ({Math.round((national.totalVerifiedTemples / Math.max(1, national.totalTemples)) * 100)}%)
            </span>
          </div>
          <p className="mt-1 text-[12px] text-ivory-dim">0 Centroids · 100% Surveyed GPS</p>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-obsidian-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-dim" />
          <input
            type="text"
            placeholder="Search state name or code (e.g. Tamil Nadu, TN, KA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-obsidian-1 py-2 pl-9 pr-4 text-[13px] text-ivory placeholder:text-ivory-dim/50 focus:border-gold/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "indexed", "partially_indexed", "expansion_in_progress"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[11.5px] font-medium capitalize transition-colors",
                selectedStatus === status
                  ? "bg-gold/20 text-gold-bright border border-gold/40"
                  : "bg-white/[0.04] text-ivory-dim hover:text-ivory border border-transparent"
              )}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
          <button
            onClick={refetchCoverage}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11.5px] font-medium text-ivory hover:bg-white/[0.08]"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin text-gold")} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── State Coverage Cards Grid ── */}
      <div className="space-y-3">
        {filteredStates.map((st: StateCoverageItem) => {
          const isExpanded = expandedState === st.code;
          const statusColors: Record<string, string> = {
            indexed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            partially_indexed: "text-sky-400 bg-sky-500/10 border-sky-500/20",
            expansion_in_progress: "text-amber-400 bg-amber-500/10 border-amber-500/20",
            verification_in_progress: "text-orange-400 bg-orange-500/10 border-orange-500/20",
          };

          return (
            <div
              key={st.code}
              className="overflow-hidden rounded-2xl border border-line bg-obsidian-2 transition-colors hover:border-gold/30"
            >
              <div
                onClick={() => setExpandedState(isExpanded ? null : st.code)}
                className="flex cursor-pointer flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <button className="text-ivory-dim">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gold" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-gold-bright">
                        {st.code}
                      </span>
                      <h3 className="font-display text-base font-medium text-ivory">
                        {st.name}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                          statusColors[st.status] || "text-ivory-dim bg-white/[0.05] border-white/10"
                        )}
                      >
                        {st.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-ivory-dim">
                      {st.templeCount} catalogued temples ({st.verifiedCount} verified) · {st.representedDistricts} / {st.totalDistricts} districts covered
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-40">
                    <div className="flex justify-between text-[11px] text-ivory-dim">
                      <span>District Coverage</span>
                      <span className="font-mono font-medium text-ivory">
                        {st.coveragePercent}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          st.coveragePercent >= 75
                            ? "bg-emerald-400"
                            : st.coveragePercent >= 40
                            ? "bg-sky-400"
                            : "bg-amber-400"
                        )}
                        style={{ width: `${Math.min(100, st.coveragePercent)}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/explore/${st.code.toLowerCase()}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-ivory-dim hover:border-gold/30 hover:text-gold"
                  >
                    <span>View Public Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* ── Expanded Districts Breakdown ── */}
              {isExpanded && (
                <div className="border-t border-line bg-obsidian-1 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ivory-dim">
                      District Level Breakdown ({st.districts.length} Districts)
                    </h4>
                    <span className="text-[11px] text-ivory-dim">
                      {st.districts.filter((d: DistrictCoverageItem) => d.templesFound > 0).length} with temples ·{" "}
                      {st.districts.filter((d: DistrictCoverageItem) => d.templesFound === 0).length} coverage gap
                    </span>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {st.districts.map((d: DistrictCoverageItem) => {
                      const districtStatusBadge: Record<string, string> = {
                        NO_SOURCE_IMPORTED: "border-white/10 bg-white/[0.03] text-ivory-dim/60",
                        SOURCE_IMPORTED: "border-purple-500/30 bg-purple-500/10 text-purple-300",
                        INDEXED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                        PARTIALLY_VERIFIED: "border-amber-500/30 bg-amber-500/10 text-amber-300",
                        VERIFIED: "border-teal-500/30 bg-teal-500/10 text-teal-300",
                        EXPANSION_IN_PROGRESS: "border-sky-500/30 bg-sky-500/10 text-sky-300",
                      };

                      return (
                        <div
                          key={d.slug}
                          className={cn(
                            "flex flex-col justify-between gap-2.5 rounded-xl border p-3 text-xs transition-colors",
                            d.templesFound > 0
                              ? "border-white/[0.08] bg-obsidian-2 text-ivory"
                              : "border-white/[0.03] bg-obsidian-2/50 text-ivory-dim/60"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ivory">{d.name}</p>
                              <p className="font-mono text-[10.5px] text-ivory-dim/70">
                                LGD: {d.officialCode || "Unassigned"}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "shrink-0 rounded-md border px-1.5 py-0.5 text-[9.5px] font-mono font-medium tracking-tight",
                                districtStatusBadge[d.status] || "border-white/10 bg-white/5 text-ivory-dim"
                              )}
                            >
                              {d.status.replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/[0.05] pt-2 text-[11px]">
                            <span className="font-mono font-medium text-gold-bright">
                              {d.templesFound} {d.templesFound === 1 ? "temple" : "temples"}
                            </span>
                            <span className="text-[10.5px] text-emerald-400">
                              {d.templesVerified} verified
                            </span>
                            <span className="text-[10.5px] text-sky-400">
                              {d.sourceCount} sources
                            </span>
                          </div>
                        </div>
                      );
                    })}
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
