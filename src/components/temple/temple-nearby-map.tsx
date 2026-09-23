"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Navigation,
  MapPin,
  Clock,
} from "lucide-react";
import type { NormalizedAttraction, AdaptiveRadiusConfig } from "@/lib/nearby/engine";
import { cn } from "@/lib/cn";

export interface TempleNearbyMapProps {
  templeName: string;
  templeLat: number;
  templeLng: number;
  attractions: NormalizedAttraction[];
  radiusConfig: AdaptiveRadiusConfig;
  onSelectAttraction?: (attraction: NormalizedAttraction | null) => void;
  selectedAttractionId?: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  HERITAGE: "#e4be72", // Gold
  PILGRIMAGE: "#ff8c42", // Saffron
  NATURE: "#34d399", // Emerald
  CULTURE: "#a78bfa", // Lavender
  LOCAL_EXPERIENCES: "#38bdf8", // Sky blue
};

const CATEGORY_LABELS: Record<string, string> = {
  ALL: "All Surroundings",
  HERITAGE: "Heritage & History",
  PILGRIMAGE: "Sacred Shrines",
  NATURE: "Nature & Rivers",
  CULTURE: "Arts & Culture",
  LOCAL_EXPERIENCES: "Local Spots",
};

const TILE_STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  satellite: {
    version: 8 as const,
    sources: {
      "esri-satellite": {
        type: "raster" as const,
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Esri, Maxar, Earthstar Geographics",
      },
    },
    layers: [
      {
        id: "esri-satellite-layer",
        type: "raster" as const,
        source: "esri-satellite",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
};

export function TempleNearbyMap({
  templeName,
  templeLat,
  templeLng,
  attractions,
  radiusConfig,
  onSelectAttraction,
  selectedAttractionId,
}: TempleNearbyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const templeMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<"dark" | "liberty" | "satellite">("dark");
  const [mapError, setMapError] = useState<string | null>(null);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedIdOverride, setSelectedIdOverride] = useState<string | null>(null);
  const [viewDistance, setViewDistance] = useState<number>(radiusConfig.maxRadiusKm);

  // Derive active selection from prop or manual user interaction
  const currentSelectedId =
    selectedIdOverride === "__none__"
      ? null
      : (selectedIdOverride ?? selectedAttractionId ?? null);

  const selectedAttraction = currentSelectedId
    ? attractions.find((a) => a.id === currentSelectedId) || null
    : null;

  const filteredAttractions =
    activeCategory === "ALL"
      ? attractions
      : attractions.filter((a) => a.category === activeCategory);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: maplibregl.Map;
    try {
      const styleDef =
        mapStyle === "satellite" ? TILE_STYLES.satellite : TILE_STYLES[mapStyle];

      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleDef as unknown as maplibregl.StyleSpecification,
        center: [templeLng, templeLat],
        zoom: 12.5,
        pitch: 30,
        bearing: 0,
        attributionControl: false,
      });
    } catch (err) {
      console.error("[TempleNearbyMap] WebGL initialization failed:", err);
      setTimeout(() => {
        setMapError("WebGL initialization failed on this device");
      }, 0);
      return;
    }

    map.on("error", (e) => {
      console.warn("[TempleNearbyMap] Map tile error:", e);
      if (!fallbackActive && mapStyle !== "satellite") {
        setFallbackActive(true);
        try {
          map.setStyle(TILE_STYLES.satellite as unknown as maplibregl.StyleSpecification);
        } catch {
          setMapError("Map tiles could not be loaded on this network");
        }
      }
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("load", () => {
      setMapLoaded(true);
      setMapError(null);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (templeMarkerRef.current) templeMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [mapStyle, templeLat, templeLng, fallbackActive]);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Remove existing attraction markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 1. Add / Update Temple Center Marker
    if (templeMarkerRef.current) {
      templeMarkerRef.current.remove();
    }

    const templeEl = document.createElement("div");
    templeEl.className = "group relative flex items-center justify-center cursor-pointer";
    templeEl.innerHTML = `
      <div class="absolute -inset-2 rounded-full bg-gold/20 animate-ping opacity-75"></div>
      <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-gold-deep via-gold to-gold-bright text-obsidian shadow-xl shadow-gold/50 border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 2L2 22h20L12 2zm0 5l6.5 13H5.5L12 7z"/>
        </svg>
      </div>
      <div class="absolute -bottom-7 whitespace-nowrap rounded-md bg-obsidian/90 px-2 py-0.5 text-[11px] font-semibold text-gold-bright shadow-lg border border-gold/40 pointer-events-none">
        ${templeName}
      </div>
    `;

    templeMarkerRef.current = new maplibregl.Marker({ element: templeEl })
      .setLngLat([templeLng, templeLat])
      .addTo(map);

    // 2. Add Filtered Attraction Markers
    filteredAttractions.forEach((attraction) => {
      const color = CATEGORY_COLORS[attraction.category] || "#e4be72";
      const isSelected = selectedAttraction?.id === attraction.id;

      const el = document.createElement("div");
      el.className = cn(
        "cursor-pointer transition-transform duration-200 hover:scale-125",
        isSelected && "scale-125 z-30"
      );
      el.innerHTML = `
        <div style="background-color: ${color}; box-shadow: 0 0 12px ${color}80;" class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-obsidian text-obsidian font-bold text-[10px]">
          ${attraction.airDistanceKm < 1 ? "<1" : Math.round(attraction.airDistanceKm)}
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedIdOverride(attraction.id);
        if (onSelectAttraction) onSelectAttraction(attraction);
        map.flyTo({
          center: [attraction.longitude, attraction.latitude],
          zoom: 14,
          speed: 1.2,
          curve: 1.4,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([attraction.longitude, attraction.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, filteredAttractions, selectedAttraction, templeLat, templeLng, templeName, onSelectAttraction]);

  // Fit bounds to temple + attractions
  const fitAll = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([templeLng, templeLat]);

    if (filteredAttractions.length > 0) {
      filteredAttractions.forEach((a) => {
        bounds.extend([a.longitude, a.latitude]);
      });
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 1000 });
    } else {
      map.flyTo({ center: [templeLng, templeLat], zoom: 13, duration: 1000 });
    }
  }, [templeLat, templeLng, filteredAttractions]);

  // Preset Radius Views
  const setRadiusZoom = (km: number) => {
    const map = mapRef.current;
    if (!map) return;
    setViewDistance(km);

    let targetZoom = 14; // ~1-2km
    if (km <= 2) targetZoom = 14.5;
    else if (km <= 5) targetZoom = 13;
    else if (km <= 15) targetZoom = 11.5;
    else if (km <= 35) targetZoom = 10;
    else targetZoom = 8.5;

    map.flyTo({ center: [templeLng, templeLat], zoom: targetZoom, duration: 1000 });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-obsidian-2 shadow-2xl shadow-obsidian">
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/80 bg-obsidian-2/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-gold-bright">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ivory flex items-center gap-2">
              <span>Sacred Surroundings & Geographic Real Map</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                Vector Tiles Active
              </span>
            </h3>
            <p className="text-[11px] text-ivory-dim">
              Verified satellite-calibrated coordinates within {radiusConfig.maxRadiusKm} km radius
            </p>
          </div>
        </div>

        {/* Style & View Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-line bg-obsidian p-0.5 text-xs">
            <button
              onClick={() => setMapStyle("dark")}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                mapStyle === "dark" ? "bg-gold/20 text-gold-bright" : "text-ivory-dim hover:text-ivory"
              )}
            >
              Sacred Dark
            </button>
            <button
              onClick={() => setMapStyle("liberty")}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                mapStyle === "liberty" ? "bg-gold/20 text-gold-bright" : "text-ivory-dim hover:text-ivory"
              )}
            >
              Daylight
            </button>
          </div>

          <button
            onClick={fitAll}
            className="flex items-center gap-1 rounded-lg border border-line bg-obsidian px-2.5 py-1.5 text-xs text-ivory-dim hover:text-gold-bright transition-colors"
            title="Reset perspective to fit all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Fit All</span>
          </button>
        </div>
      </div>

      {/* Real Map Canvas Container */}
      <div className="relative h-[480px] w-full bg-obsidian">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Dignified Fallback UI */}
        {mapError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-obsidian-2/95 p-6 text-center backdrop-blur-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-bright mb-3 border border-gold/30">
              <Compass className="h-6 w-6" />
            </div>
            <h4 className="font-display text-lg font-medium text-ivory">Surroundings Map Offline</h4>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-ivory-dim">
              Map tiles are currently unreachable on this connection. You can retry with satellite tiles or browse the list of attractions below.
            </p>
            <button
              onClick={() => {
                setMapError(null);
                setMapStyle("satellite");
              }}
              className="mt-4 rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-obsidian shadow-md hover:bg-gold-bright transition-colors"
            >
              Retry with Satellite Tiles
            </button>
          </div>
        )}

        {/* Map Float Controls */}
        <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5 rounded-xl border border-line/80 bg-obsidian-2/90 p-1.5 backdrop-blur-md shadow-xl">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory-dim hover:bg-white/[0.08] hover:text-gold-bright transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory-dim hover:bg-white/[0.08] hover:text-gold-bright transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <div className="my-1 h-px bg-line" />
          <button
            onClick={() => {
              mapRef.current?.flyTo({ center: [templeLng, templeLat], zoom: 14 });
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ivory-dim hover:bg-white/[0.08] hover:text-gold-bright transition-colors"
            title="Recenter on temple"
          >
            <Navigation className="h-4 w-4 text-gold" />
          </button>
        </div>

        {/* Distance Range Filter Buttons */}
        <div className="absolute left-4 top-4 z-20 hidden sm:flex items-center gap-1 rounded-xl border border-line/80 bg-obsidian-2/90 p-1 backdrop-blur-md shadow-xl">
          {[
            { label: "2 km", km: 2 },
            { label: "5 km", km: 5 },
            { label: "15 km", km: 15 },
            { label: `${radiusConfig.maxRadiusKm} km`, km: radiusConfig.maxRadiusKm },
          ].map((item) => (
            <button
              key={item.km}
              onClick={() => setRadiusZoom(item.km)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                viewDistance === item.km
                  ? "bg-gold/20 text-gold-bright border border-gold/40"
                  : "text-ivory-dim hover:text-ivory"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Selected Attraction Card Drawer */}
        {selectedAttraction && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-20 rounded-xl border border-gold/40 bg-obsidian-2/95 p-4 backdrop-blur-md shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  style={{
                    color: CATEGORY_COLORS[selectedAttraction.category] || "#e4be72",
                    backgroundColor: `${CATEGORY_COLORS[selectedAttraction.category] || "#e4be72"}15`,
                  }}
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase mb-1"
                >
                  {selectedAttraction.category.replace("_", " ")}
                </span>
                <h4 className="font-display text-base font-semibold text-ivory">
                  {selectedAttraction.name}
                </h4>
              </div>
              <button
                onClick={() => {
                  setSelectedIdOverride("__none__");
                  if (onSelectAttraction) onSelectAttraction(null);
                }}
                className="rounded-lg p-1 text-ivory-dim hover:bg-white/[0.08] hover:text-ivory"
              >
                ✕
              </button>
            </div>

            <p className="mt-1 text-xs text-ivory-dim line-clamp-2">
              {selectedAttraction.description}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-ivory-dim border-t border-line/60 pt-2.5">
              <span className="flex items-center gap-1 text-gold-bright font-medium">
                <MapPin className="h-3.5 w-3.5 text-gold" />
                {selectedAttraction.displayDistance || `${selectedAttraction.airDistanceKm.toFixed(1)} km`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                ~{selectedAttraction.estimatedDriveMinutes || 15} mins drive
              </span>
              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] text-ivory">
                {selectedAttraction.estimatedDriveMinutes ? selectedAttraction.estimatedDriveMinutes * 2 : 45}m visit
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Category Filter Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-line/80 bg-obsidian-2/95 px-4 py-2.5">
        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
          const count =
            cat === "ALL"
              ? attractions.length
              : attractions.filter((a) => a.category === cat).length;
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-all shrink-0",
                active
                  ? "bg-gold/20 text-gold-bright border border-gold/40 shadow-sm shadow-gold/20"
                  : "border border-line/60 text-ivory-dim hover:text-ivory hover:border-gold/30"
              )}
            >
              {cat !== "ALL" && (
                <span
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  className="h-2 w-2 rounded-full"
                />
              )}
              <span>{label}</span>
              <span className="ml-0.5 rounded-full bg-white/[0.06] px-1.5 py-0.2 text-[10px] opacity-80">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
