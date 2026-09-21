"use client";

import { useState } from "react";
import Link from "next/link";
import { Radar, WifiOff, ExternalLink, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers";
import { GoogleAttribution } from "@/components/google-attribution";
import type { DiscoveredPlace, DiscoveryResult } from "@/lib/google/types";

export function LiveDiscoveryPanel({ query, exclude }: { query: string; exclude: string[] }) {
  const { t } = useApp();
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [items, setItems] = useState<DiscoveredPlace[]>([]);
  const [mode, setMode] = useState<DiscoveryResult["mode"] | null>(null);
  const [stale, setStale] = useState(false);

  const run = async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/temples/discover?q=${encodeURIComponent(query)}&limit=9&forceLive=1`);
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as DiscoveryResult;
      const seen = new Set(exclude.map((s) => s.toLowerCase()));
      const filtered = data.items.filter((p) => !seen.has(p.name.toLowerCase().replace(/^(sri|shri|shree)\s+/i, "")));
      setItems(filtered);
      setMode(data.mode);
      setStale(data.stale);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  if (state === "idle") {
    return (
      <button
        onClick={run}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/30 px-6 py-5 text-[13px] text-gold-bright transition-colors hover:bg-gold/[0.06]"
      >
        <Radar className="h-4 w-4" />
        Search live place data for more temples nearby
      </button>
    );
  }

  if (state === "loading") {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (state === "error" || (state === "ready" && items.length === 0 && mode === "degraded")) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-line px-4 py-4 text-[12.5px] text-ivory-dim">
        <WifiOff className="h-4 w-4 shrink-0" />
        {t("discover_degraded")}. {t("discover_stale")}
      </div>
    );
  }

  if (state === "ready" && items.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-dim">
          {mode === "live" ? t("discover_live") : mode === "cache" ? t("discover_cache") : t("discover_degraded")}
          {stale ? ` · ${t("discover_stale")}` : ""}
        </p>
        <GoogleAttribution className="text-[10px] text-ivory-dim/50" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <div key={p.id} className="group flex flex-col rounded-2xl border border-line bg-obsidian-3/90 p-4 transition-colors hover:border-gold/25">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13.5px] font-medium leading-snug text-ivory">{p.name}</p>
              <span className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", p.openNow === true ? "bg-emerald-400" : p.openNow === false ? "bg-red-400" : "bg-ivory-dim/30")} />
            </div>
            <p className="mt-1 text-[11.5px] text-ivory-dim">{p.region ?? p.address}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.verified && (
                <span className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] text-gold-bright">
                  <ShieldCheck className="h-3 w-3" />
                  {t("discover_verified")}
                </span>
              )}
              <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-ivory-dim/70">
                {p.businessStatus === "CLOSED_TEMPORARILY" ? t("discovered_closed") : p.openNow === null ? t("discover_open_unknown") : p.openNow ? t("discovered_open") : t("discovered_closed")}
              </span>
            </div>
            <div className="mt-3 flex gap-2 border-t border-line pt-3">
              {p.verified ? (
                <Link
                  href={p.verified.href}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gold/15 px-3 py-2 text-[12px] font-medium text-gold-bright transition-colors hover:bg-gold/25"
                >
                  Open profile
                </Link>
              ) : (
                <a
                  href={p.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-line px-3 py-2 text-[12px] text-ivory-dim transition-colors hover:text-ivory"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Google Maps
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <GoogleAttribution className="mt-3 text-[10px] text-ivory-dim/40" />
    </div>
  );
}