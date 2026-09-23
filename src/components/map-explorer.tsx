"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Compass, ExternalLink, LocateFixed, Search, ShieldCheck, WifiOff, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers";
import { GoogleAttribution } from "@/components/google-attribution";
import type { DiscoveredPlace, DiscoveryResult } from "@/lib/google/types";

const LNG0 = 66.5;
const LNG1 = 98.5;
const LAT0 = 5.6;
const LAT1 = 37.8;

const toWorld = (lat: number, lng: number) => ({ x: (lng - LNG0) / (LNG1 - LNG0), y: (LAT1 - lat) / (LAT1 - LAT0) });
const toLatLng = (wx: number, wy: number) => ({ lat: LAT1 - wy * (LAT1 - LAT0), lng: LNG0 + wx * (LNG1 - LNG0) });

const hav = (a: number, b: number, c: number, d: number) => {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(c - a);
  const dLng = toRad(d - b);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

const COL = {
  grid: "#2a241c",
  bg: "#0d0b09",
  verified: "#e4be72",
  google: "#ff8c42",
  cached: "#9aa3b0",
  open: "#34d399",
  closed: "#f87171",
  unknown: "#5b6470",
};

const DEFAULT_ANCHOR = { lat: 9.9196, lng: 78.1198 }; // Madurai — temple-dense, fast first result
const MIN_VIEW_SCALE = 200;
const MAX_VIEW_SCALE = 120000;
const MAX_AREA_KM = 50;

interface ViewState {
  x: number;
  y: number;
  scale: number; // px per world-unit
}

interface Suggestion {
  type: "place" | "query";
  placeId?: string;
  text: string;
}

function sourceColor(p: DiscoveredPlace): string {
  if (p.source === "verified") return COL.verified;
  if (p.source === "cached") return COL.cached;
  return COL.google;
}

function certaintyLabel(c: DiscoveredPlace["certainty"]): string {
  switch (c) {
    case "likely_temple":
      return "Likely a temple";
    case "religious_site":
      return "Religious site";
    case "uncertain":
      return "Could not confirm if this is a temple";
    default:
      return "Temple";
  }
}

function openNowLabel(p: DiscoveredPlace): string {
  if (p.businessStatus === "CLOSED_TEMPORARILY") return "Temporarily closed (per live data)";
  if (p.businessStatus === "CLOSED_PERMANENTLY") return "Permanently closed (per live data)";
  if (p.openNow === null) return "Live status unavailable";
  return p.openNow ? "Open (per live data)" : "Closed (per live data)";
}

export function MapExplorer() {
  const { t } = useApp();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 900 });
  const [items, setItems] = useState<DiscoveredPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<DiscoveryResult["mode"] | null>(null);
  const [stale, setStale] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [ac, setAc] = useState<Suggestion[]>([]);
  const [acOpen, setAcOpen] = useState(false);
  const [acLoading, setAcLoading] = useState(false);
  const [acIdx, setAcIdx] = useState(-1);

  const drag = useRef<{ px: number; py: number; viewAtDown: ViewState; moved: boolean } | null>(null);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  // ---- size observation ---------------------------------------------------------
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: Math.max(r.width, 300), h: Math.max(r.height, 300) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- initial discovery ----------------------------------------------------------
  const fetchArea = useCallback(
    async (lat: number, lng: number, radiusKm: number, panTo?: { lat: number; lng: number }) => {
      setLoading(true);
      setFailed(false);
      try {
        const res = await fetch(`/api/temples/discover?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&radius=${Math.round(radiusKm)}&limit=60&forceLive=1`);
        const data = (await res.json()) as DiscoveryResult;
        setItems(data.items);
        setMode(data.mode);
        setStale(data.stale);
        setWarnings(data.warnings);
        setSelectedId(null);
        if (panTo) {
          const w = toWorld(panTo.lat, panTo.lng);
          setView((v) => ({ ...v, x: w.x, y: w.y }));
        }
      } catch {
        setFailed(true);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const id = setTimeout(() => {
      fetchArea(DEFAULT_ANCHOR.lat, DEFAULT_ANCHOR.lng, 20, { lat: DEFAULT_ANCHOR.lat, lng: DEFAULT_ANCHOR.lng });
    }, 0);
    return () => clearTimeout(id);
  }, [fetchArea]);

  const centerOfView = (v: ViewState): { lat: number; lng: number } => {
    const w = size.w > 0 ? size.w : 900;
    const h = size.h > 0 ? size.h : 600;
    return toLatLng(v.x + w / 2 / v.scale, v.y + h / 2 / v.scale);
  };

  const radiusOfView = (v: ViewState): number => {
    const w = size.w > 0 ? size.w : 900;
    const h = size.h > 0 ? size.h : 600;
    const tl = toLatLng(v.x, v.y);
    const br = toLatLng(v.x + w / v.scale, v.y + h / v.scale);
    return Math.min(Math.max(hav(tl.lat, tl.lng, br.lat, br.lng) / 2, 2), MAX_AREA_KM);
  };

  const searchThisArea = () => {
    const c = centerOfView(view);
    setSelectedId(null);
    fetchArea(c.lat, c.lng, radiusOfView(view));
  };

  const resetView = () => {
    const w = toWorld(DEFAULT_ANCHOR.lat, DEFAULT_ANCHOR.lng);
    setView({ x: w.x, y: w.y, scale: MIN_VIEW_SCALE * 3 });
  };

  // ---- autocomplete ---------------------------------------------------------------
  useEffect(() => {
    const trimmed = q.trim();
    const id = setTimeout(async () => {
      if (trimmed.length < 2) {
        setAc([]);
        setAcLoading(false);
        return;
      }
      setAcLoading(true);
      try {
        const r = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(trimmed)}&_t=${Date.now()}`);
        const data = (await r.json()) as { suggestions?: Suggestion[] };
        setAc(data.suggestions ?? []);
        setAcOpen(true);
      } catch {
        setAc([]);
      } finally {
        setAcLoading(false);
      }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  const goToPlace = async (sug: Suggestion) => {
    setAcOpen(false);
    setQ(sug.text);
    if (sug.placeId) {
      try {
        const r = await fetch(`/api/places/details?placeId=${encodeURIComponent(sug.placeId)}`);
        const data = (await r.json()) as { place?: { latitude: number; longitude: number } | null };
        if (data.place) {
          fetchArea(data.place.latitude, data.place.longitude, 15, { lat: data.place.latitude, lng: data.place.longitude });
          return;
        }
      } catch {
        /* fall through to text search */
      }
    }
    // text discovery
    setLoading(true);
    try {
      const res = await fetch(`/api/temples/discover?q=${encodeURIComponent(sug.text)}&limit=40&forceLive=1`);
      const data = (await res.json()) as DiscoveryResult;
      setItems(data.items);
      setMode(data.mode);
      setStale(data.stale);
      setWarnings(data.warnings);
      if (data.items[0]) {
        const w = toWorld(data.items[0].latitude, data.items[0].longitude);
        setView({ x: w.x, y: w.y, scale: Math.max(view.scale, MIN_VIEW_SCALE * 3) });
        setSelectedId(data.items[0].id);
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const onAcKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAcIdx((i) => Math.min(i + 1, ac.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAcIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = ac[acIdx];
      if (pick) goToPlace(pick);
      else if (q.trim().length >= 2) goToPlace({ type: "query", text: q.trim() });
    } else if (e.key === "Escape") {
      setAcOpen(false);
    }
  };

  // ---- drawing ----------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, size.w, size.h);

    // projected grid
    ctx.strokeStyle = COL.grid;
    ctx.lineWidth = 1;
    const stepWorld = size.w / view.scale / 3;
    for (let gx = Math.floor(view.x / stepWorld) - 1; gx < view.x / stepWorld + size.w / view.scale / stepWorld + 2; gx++) {
      const sx = (gx * stepWorld - view.x) * view.scale;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, size.h);
      ctx.stroke();
    }
    for (let gy = Math.floor(view.y / stepWorld) - 1; gy < view.y / stepWorld + size.h / view.scale / stepWorld + 2; gy++) {
      const sy = (gy * stepWorld - view.y) * view.scale;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(size.w, sy);
      ctx.stroke();
    }

    // cluster by grid cell in world coords
    const cellPx = 34;
    const cellWorld = cellPx / view.scale;
    const clusters = new Map<string, { x: number; y: number; items: DiscoveredPlace[] }>();
    const points = items.map((p) => {
      const w = toWorld(p.latitude, p.longitude);
      return { p, w };
    });
    for (const { p, w } of points) {
      const key = `${Math.floor((w.x - view.x) / cellWorld)}:${Math.floor((w.y - view.y) / cellWorld)}`;
      const c = clusters.get(key);
      if (c) c.items.push(p);
      else clusters.set(key, { x: w.x, y: w.y, items: [p] });
    }

    for (const [, cluster] of clusters) {
      const sx = (cluster.x - view.x) * view.scale;
      const sy = (cluster.y - view.y) * view.scale;
      if (sx < -40 || sy < -40 || sx > size.w + 40 || sy > size.h + 40) continue;
      const n = cluster.items.length;
      if (n === 1) {
        const p = cluster.items[0];
        const col = sourceColor(p);
        const ring = p.openNow === true ? COL.open : p.openNow === false ? COL.closed : "#20242a";
        ctx.beginPath();
        ctx.arc(sx, sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = ring;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, 4.2, 0, Math.PI * 2);
        ctx.strokeStyle = "#0d0b09";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        const r = Math.min(9 + n * 1.6, 22);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,162,75,0.16)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.strokeStyle = "#c8a24b";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#e4be72";
        ctx.font = "600 11px Geist, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(n), sx, sy + 0.5);
      }
    }

    // selected halo / hover ring
    if (selected) {
      const w = toWorld(selected.latitude, selected.longitude);
      const sx = (w.x - view.x) * view.scale;
      const sy = (w.y - view.y) * view.scale;
      ctx.beginPath();
      ctx.arc(sx, sy, 13, 0, Math.PI * 2);
      ctx.strokeStyle = "#e4be72";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    if (hoverId && hoverId !== selected?.id) {
      const hp = items.find((p) => p.id === hoverId);
      if (hp) {
        const w = toWorld(hp.latitude, hp.longitude);
        const sx = (w.x - view.x) * view.scale;
        const sy = (w.y - view.y) * view.scale;
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(242,236,225,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }, [items, view, size, selected, hoverId]);

  const zoomAt = (factor: number, cxPx?: number, cyPx?: number) => {
    const w = size.w > 0 ? size.w : 900;
    const h = size.h > 0 ? size.h : 600;
    const mx = cxPx ?? w / 2;
    const my = cyPx ?? h / 2;
    const wat = toLatLng(view.x + mx / view.scale, view.y + my / view.scale);
    const wt = toWorld(wat.lat, wat.lng);
    const ns = Math.min(Math.max(view.scale * factor, MIN_VIEW_SCALE), MAX_VIEW_SCALE);
    if (ns === view.scale) return;
    setView({ x: wt.x - mx / ns, y: wt.y - my / ns, scale: ns });
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, (rect?.left ? e.clientX - rect.left : 0) || undefined, rect?.top ? e.clientY - rect.top : undefined);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, viewAtDown: view, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.px;
    const dy = e.clientY - drag.current.py;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    if (drag.current.moved) {
      setView((v) => ({ ...v, x: drag.current!.viewAtDown.x - dx / v.scale, y: drag.current!.viewAtDown.y - dy / v.scale }));
    }
    if (!drag.current.moved) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      let hit: string | null = null;
      for (const p of items) {
        const w = toWorld(p.latitude, p.longitude);
        const sx = (w.x - view.x) * view.scale;
        const sy = (w.y - view.y) * view.scale;
        if (Math.hypot(cx - sx, cy - sy) < 10) {
          hit = p.id;
          break;
        }
      }
      setHoverId((prev) => (prev === hit ? prev : hit));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    const d = drag.current;
    drag.current = null;
    if (d?.moved || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const cellWorld = 34 / view.scale;
    let hit: DiscoveredPlace | null = null;
    let hitWorld: { x: number; y: number } | null = null;
    const cells = new Map<string, DiscoveredPlace[]>();
    for (const p of items) {
      const w = toWorld(p.latitude, p.longitude);
      const sx = (w.x - view.x) * view.scale;
      const sy = (w.y - view.y) * view.scale;
      if (Math.hypot(cx - sx, cy - sy) < 10) {
        const key = `${Math.floor((w.x - view.x) / cellWorld)}:${Math.floor((w.y - view.y) / cellWorld)}`;
        cells.set(key, [...(cells.get(key) ?? []), p]);
        hitWorld = w;
      }
    }
    if (cells.size >= 1) {
      const bucket = [...cells.values()][0];
      if (bucket.length > 1 && hitWorld) {
        setView((v) => ({ x: hitWorld!.x, y: hitWorld!.y, scale: Math.min(v.scale * 2.2, MAX_VIEW_SCALE) }));
      } else {
        hit = bucket[0];
      }
    }
    if (hit) setSelectedId(hit.id);
  };

  return (
    <div className="flex h-[calc(100vh-0px)] w-full flex-col overflow-hidden lg:flex-row">
      {/* Map canvas */}
      <div ref={wrapRef} className="relative min-h-[52vh] flex-1 lg:min-h-0">
        <canvas
          ref={canvasRef}
          className={cn("h-full w-full touch-none", loading && "animate-pulse")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onWheel={onWheel}
          aria-label="Temple discovery map"
          role="application"
        />

        {/* Search + controls overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 sm:p-4">
          <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <div className="glass flex items-center gap-2.5 rounded-2xl border border-line px-3.5 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-gold-dim" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setAcIdx(-1);
                    if (e.target.value.trim().length >= 2) setAcOpen(true);
                  }}
                  onFocus={() => ac.length > 0 && setAcOpen(true)}
                  onKeyDown={onAcKey}
                  placeholder={t("map_search")}
                  aria-label="Search a place"
                  className="w-full bg-transparent text-[13.5px] text-ivory placeholder:text-ivory-dim/45 focus:outline-none"
                />
                {acLoading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />}
                {q && (
                  <button
                    onClick={() => {
                      setQ("");
                      setAc([]);
                      setAcOpen(false);
                    }}
                    aria-label="Clear"
                    className="text-ivory-dim hover:text-ivory"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {acOpen && ac.length > 0 && (
                <div className="glass absolute inset-x-0 top-full z-20 mt-1.5 overflow-hidden rounded-2xl border border-line p-1 shadow-2xl">
                  {ac.map((s, i) => (
                    <button
                      key={`${s.type}-${s.text}-${i}`}
                      onMouseEnter={() => setAcIdx(i)}
                      onClick={() => goToPlace(s)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] transition-colors",
                        acIdx === i ? "bg-gold/12 text-ivory" : "text-ivory-dim hover:bg-white/[0.05]"
                      )}
                    >
                      <LocateFixed className={cn("h-3.5 w-3.5 shrink-0", acIdx === i ? "text-gold-bright" : "text-gold-dim")} />
                      <span className="truncate">{s.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={searchThisArea}
              disabled={loading}
              className="pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-2xl border border-gold/30 bg-gold/15 px-4 py-2.5 text-[13px] font-medium text-gold-bright transition-colors hover:bg-gold/25 disabled:opacity-50"
            >
              <LocateFixed className="h-4 w-4" />
              {t("map_search_this_area")}
            </button>
          </div>

          <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => zoomAt(1.3)}
                aria-label="Zoom in"
                className="glass flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ivory-dim transition-colors hover:text-ivory"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => zoomAt(1 / 1.3)}
                aria-label="Zoom out"
                className="glass flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ivory-dim transition-colors hover:text-ivory"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={resetView}
                aria-label={t("map_reset")}
                className="glass flex h-9 items-center gap-1.5 rounded-xl border border-line px-3 text-[12px] text-ivory-dim transition-colors hover:text-ivory"
              >
                <Compass className="h-3.5 w-3.5" />
                {t("map_reset")}
              </button>
            </div>
            <ModeChip loading={loading} mode={mode} stale={stale} />
          </div>
        </div>

        {/* status overlay */}
        {(failed || (mode === "degraded" && !stale)) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-28 z-10 flex justify-center px-4 lg:bottom-6">
            <div className="pointer-events-auto flex max-w-lg items-center gap-2.5 rounded-2xl border border-gold/20 bg-obsidian-3/95 px-4 py-3 text-[12.5px] text-ivory-dim shadow-2xl">
              <WifiOff className="h-4 w-4 shrink-0 text-gold-dim" />
              <span>
                {t("discover_degraded")}. {t("discover_stale")}
              </span>
            </div>
          </div>
        )}

        {/* explanatory footer */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-3">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-0.5 text-center">
            {mode === "live" && warnings.length > 0 && (
              <p className="max-w-full truncate text-[10px] text-gold-dim/70">{warnings.slice(0, 2).join(" · ")}</p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="text-[10.5px] text-ivory-dim/60">{t("discover_note")}</span>
              <GoogleAttribution className="text-[10.5px] text-ivory-dim/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Results list */}
      <aside className="flex max-h-[46vh] w-full flex-col border-t border-line bg-obsidian-2/90 lg:max-h-none lg:w-[360px] lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dim">
            {mode === "live" ? t("discover_live") : mode === "cache" ? t("discover_cache") : mode === "degraded" ? t("discover_degraded") : ""}
          </p>
          <p className="text-[11.5px] text-ivory-dim">
            {loading ? "…" : `${items.length} temple${items.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {loading && (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
          )}
          {!loading && items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-[12.5px] text-ivory-dim">
              {t("map_empty")}
            </p>
          )}
          {!loading &&
            [...items]
              .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
              .slice(0, 60)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    const w = toWorld(p.latitude, p.longitude);
                    setView((v) => ({ ...v, x: w.x, y: w.y }));
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors",
                    selectedId === p.id ? "border-gold/40 bg-gold/10" : "border-line bg-obsidian-3/90 hover:border-gold/25"
                  )}
                >
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg">
                    {p.verified ? <ShieldCheck className="h-4.5 w-4.5 text-gold-bright" /> : "🛕"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-medium text-ivory">{p.name}</span>
                      {p.openNow !== null && (
                        <span className={cn("mt-px inline-block h-2 w-2 shrink-0 rounded-full", p.openNow ? "bg-emerald-400" : "bg-red-400")} />
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-ivory-dim">
                      {p.region ? `${p.region} · ` : ""}
                      {p.distanceKm ? `${p.distanceKm.toFixed(1)} km away` : "area"}
                    </span>
                    <span className="mt-1 inline-flex flex-wrap gap-1">
                      <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-ivory-dim">{certaintyLabel(p.certainty)}</span>
                      {p.verified && <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] text-gold-bright">{t("discover_verified")}</span>}
                    </span>
                  </span>
                </button>
              ))}
        </div>
      </aside>

      {/* Selection detail card */}
      {selected && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-30 flex justify-center px-4 lg:bottom-4 lg:left-1/2 lg:max-w-lg">
          <DetailCard place={selected} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  );
}

function ModeChip({ loading, mode, stale }: { loading: boolean; mode: DiscoveryResult["mode"] | null; stale: boolean }) {
  const { t } = useApp();
  if (loading) return <span className="glass flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[11px] text-ivory-dim">…</span>;
  const label =
    mode === "live" ? t("discover_live") : mode === "cache" ? t("discover_cache") : mode === "degraded" ? (stale ? t("discover_stale") : t("discover_degraded")) : "";
  return <span className="glass rounded-xl border border-line px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-gold-dim">{label}</span>;
}

function Photo({ place }: { place: DiscoveredPlace }) {
  const photo = place.photos?.[0];
  if (!photo) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/places/photo?name=${encodeURIComponent(photo.name)}&h=360`}
      alt={place.name}
      loading="lazy"
      className="h-36 w-full rounded-xl object-cover"
    />
  );
}

function DetailCard({ place, onClose }: { place: DiscoveredPlace; onClose: () => void }) {
  const { t } = useApp();
  const safetyUrl = place.googlePlaceId
    ? `${place.mapsUrl || `https://www.google.com/maps/place/?q=place_id:${place.googlePlaceId}`}`
    : place.mapsUrl;
  return (
    <div className="pointer-events-auto w-full overflow-hidden rounded-2xl border border-line bg-obsidian-3/97 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)]">
      <div className="relative">
        <Photo place={place} />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-obsidian/70 text-ivory backdrop-blur transition-colors hover:bg-obsidian"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[17px] font-medium leading-snug text-ivory">{place.name}</h3>
            <p className="mt-0.5 text-[12px] text-ivory-dim">
              {place.region ? `${place.region} · ` : ""}
              {place.distanceKm ? `${place.distanceKm.toFixed(1)} km` : place.address}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-medium",
              place.openNow === true ? "bg-emerald-400/15 text-emerald-300" : place.openNow === false ? "bg-red-400/15 text-red-300" : "bg-white/[0.05] text-ivory-dim"
            )}
          >
            {openNowLabel(place)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-line px-2 py-0.5 text-[10.5px] text-ivory-dim">
              {certaintyLabel(place.certainty)}
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10.5px]",
                place.source === "verified"
                  ? "border-gold/25 bg-gold/10 text-gold-bright"
                  : place.source === "cached"
                    ? "border-line text-ivory-dim/70"
                    : "border-saffron/25 text-orange-300"
              )}
            >
              {place.source === "verified" ? t("discover_verified") : place.source === "cached" ? t("discover_cache") : t("discover_live")}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {place.verified ? (
            <Link
              href={place.verified.href}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold/15 px-4 py-2.5 text-[13px] font-medium text-gold-bright transition-colors hover:bg-gold/25"
            >
              <ShieldCheck className="h-4 w-4" />
              Open verified profile
            </Link>
          ) : (
            <Link
              href={safetyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-[13px] font-medium text-ivory-dim transition-colors hover:text-ivory"
            >
              <ExternalLink className="h-4 w-4" />
              {t("map_open_in_maps")}
            </Link>
          )}
        </div>
        <GoogleAttribution className="mt-2 text-[10.5px] text-ivory-dim/50" />
      </div>
    </div>
  );
}