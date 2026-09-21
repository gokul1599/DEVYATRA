"use client";

import { useState } from "react";
import { Compass, ExternalLink, Radar, ShieldCheck, WifiOff, Database } from "lucide-react";
import { cn } from "@/lib/cn";
import type { DiscoveryResult } from "@/lib/google/types";

interface DiscoverResponse {
  result: DiscoveryResult;
  stats: { count: number; bytes: number; freshest: string | null; oldest: string | null };
}

const SPOTS = [
  { label: "Madurai", lat: 9.9196, lng: 78.1198 },
  { label: "Mysuru", lat: 12.3039, lng: 76.6446 },
  { label: "Tirupati", lat: 13.683, lng: 79.347 },
  { label: "Varanasi", lat: 25.3109, lng: 83.0107 },
  { label: "Puri", lat: 19.805, lng: 85.8174 },
  { label: "Dwarka", lat: 22.2394, lng: 68.9678 },
];

export function DiscoverConsole() {
  const [q, setQ] = useState("");
  const [spot, setSpot] = useState<{ lat: number; lng: number } | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [data, setData] = useState<DiscoverResponse | null>(null);

  const run = async () => {
    setState("loading");
    const params = new URLSearchParams();
    if (spot) {
      params.set("lat", spot.lat.toFixed(4));
      params.set("lng", spot.lng.toFixed(4));
      params.set("radius", "20");
    } else if (q.trim().length >= 2) {
      params.set("q", q.trim());
    } else {
      setState("idle");
      return;
    }
    try {
      const res = await fetch(`/api/admin/discover?${params.toString()}`);
      const json = (await res.json()) as DiscoverResponse;
      setData(json);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  return (
    <section className="mt-8 rounded-3xl border border-line bg-obsidian-2 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-display text-lg text-ivory">
          <Radar className="h-4 w-4 text-gold" />
          Live discovery console
        </p>
        <span className="text-[11px] text-ivory-dim">Admin-only Google Places (New) tool</span>
      </div>

      <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-ivory-dim">
        Runs diversified text/nearby queries and merges results with verified Devyatra records. Google data never overwrites verified fields.
        This tool does not claim to list every temple.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSpot(null);
          }}
          placeholder="e.g. Shiva temples in Thanjavur"
          className="w-full max-w-sm rounded-2xl border border-line bg-obsidian-3 px-4 py-2.5 text-[13px] text-ivory placeholder:text-ivory-dim/40 focus:border-gold/40 focus:outline-none sm:w-auto sm:min-w-[260px]"
        />
        <button
          onClick={run}
          disabled={state === "loading" || (q.trim().length < 2 && !spot)}
          className="flex items-center gap-1.5 rounded-2xl bg-gold/15 px-4 py-2.5 text-[13px] font-medium text-gold-bright transition-colors hover:bg-gold/25 disabled:opacity-50"
        >
          <Compass className="h-4 w-4" />
          Run discovery
        </button>
        <div className="flex flex-wrap gap-1.5">
          {SPOTS.map((s) => (
            <button
              key={s.label}
              onClick={() => {
                setSpot({ lat: s.lat, lng: s.lng });
                setQ("");
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                spot?.lat === s.lat ? "border-gold/40 bg-gold/10 text-gold-bright" : "border-line text-ivory-dim hover:border-gold/25 hover:text-ivory"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {state === "loading" && (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-10 rounded-2xl" />
          ))}
        </div>
      )}

      {state === "error" && (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-line px-4 py-4 text-[12.5px] text-ivory-dim">
          <WifiOff className="h-4 w-4 shrink-0" />
          Live discovery failed. Check GOOGLE_MAPS_API_KEY and its Places API entitlements.
        </p>
      )}

      {state === "ready" && data && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-ivory-dim">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5",
                data.result.mode === "live" ? "border-emerald-500/30 text-emerald-300" : data.result.mode === "cache" ? "border-sky-500/30 text-sky-300" : "border-amber-500/30 text-amber-300"
              )}
            >
              mode: {data.result.mode}
            </span>
            <span className="rounded-full border border-line px-2.5 py-0.5">via {data.result.via.join(" + ")}</span>
            <span className="rounded-full border border-line px-2.5 py-0.5">{data.result.count} items</span>
            <span className="rounded-full border border-line px-2.5 py-0.5">{data.result.queryType}</span>
            <span className="rounded-full border border-line px-2.5 py-0.5 text-ivory-dim/70">{data.result.sharedHits ? "deduped" : "no dupes"}</span>
          </div>
          {data.result.usedQueries.length > 0 && (
            <p className="text-[11px] text-ivory-dim/70">queries: {data.result.usedQueries.join(" · ")}</p>
          )}
          {data.result.warnings.length > 0 && <p className="text-[11px] text-amber-300/70">{data.result.warnings.join(" · ")}</p>}

          <div className="max-h-96 overflow-y-auto rounded-2xl border border-line">
            {data.result.items.length === 0 ? (
              <p className="px-4 py-10 text-center text-[12.5px] text-ivory-dim">No temple-like results.</p>
            ) : (
              <table className="w-full text-left text-[12px]">
                <thead className="sticky top-0 bg-obsidian-4 text-[10.5px] uppercase tracking-wider text-ivory-dim">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-3 py-2.5 font-medium">Source</th>
                    <th className="px-3 py-2.5 font-medium">Certainty</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium">Region</th>
                    <th className="px-4 py-2.5 font-medium">Maps</th>
                  </tr>
                </thead>
                <tbody>
                  {data.result.items.map((p) => (
                    <tr key={p.id} className="border-t border-line">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-ivory">{p.name}</p>
                        <p className="text-[10.5px] font-mono text-ivory-dim/50">{p.id.slice(0, 40)}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                            p.source === "verified" ? "border-gold/25 bg-gold/10 text-gold-bright" : p.source === "cached" ? "border-line text-ivory-dim/70" : "border-orange-500/30 text-orange-300"
                          )}
                        >
                          {p.verified && <ShieldCheck className="h-3 w-3" />}
                          {p.source}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-ivory-dim">{p.certainty}</td>
                      <td className="px-3 py-2.5 text-ivory-dim">
                        {p.openNow === null ? "—" : p.openNow ? <span className="text-emerald-300">open</span> : <span className="text-red-300">closed</span>}
                      </td>
                      <td className="px-3 py-2.5 text-ivory-dim">{p.region ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <a
                          href={p.googlePlaceId ? p.mapsUrl : p.verified?.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-gold-dim hover:text-gold-bright"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-obsidian-3/60 px-4 py-3 text-[11px] text-ivory-dim">
            <span className="inline-flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-gold-dim" />
              search cache: {data.stats.count} entries · {(data.stats.bytes / 1024).toFixed(1)} KB
            </span>
            <span>freshest: {data.stats.freshest ? new Date(data.stats.freshest).toLocaleString("en-IN") : "—"}</span>
            <span>oldest: {data.stats.oldest ? new Date(data.stats.oldest).toLocaleString("en-IN") : "—"}</span>
            <span className="text-ivory-dim/50">cache file lives in .data/google-cache.json (ephemeral on serverless)</span>
          </div>
        </div>
      )}
    </section>
  );
}