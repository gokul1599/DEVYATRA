"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Compass,
  ExternalLink,
  List,
  LocateFixed,
  Map as MapIcon,
  Navigation2,
  Search,
  ShieldCheck,
  WifiOff,
  X,
  MapPin,
  Car,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers";
import { GoogleAttribution } from "@/components/google-attribution";
import type { DiscoveredPlace, DiscoveryResult } from "@/lib/google/types";
import {
  assessLocationQuality,
  isWithinIndiaBounds,
  INDIA_BOUNDS,
  type LocationQualityAssessment,
} from "@/lib/map/location-quality";
import { discoveredPlacesToGeoJSON } from "@/lib/map/geojson";
import * as maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

// Map Style URLs
const MAP_STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  satellite: {
    version: 8,
    sources: {
      "esri-satellite": {
        type: "raster",
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
        type: "raster",
        source: "esri-satellite",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
};

const DEFAULT_ANCHOR = { lat: 9.9196, lng: 78.1198 }; // Madurai

interface Suggestion {
  type: "place" | "query";
  placeId?: string;
  text: string;
}

export function MapExplorer() {
  const { t } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const [mapStyleKey, setMapStyleKey] = useState<"dark" | "liberty" | "satellite">("dark");
  const [items, setItems] = useState<DiscoveredPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<DiscoveryResult["mode"] | null>(null);
  const [stale, setStale] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | "verified" | "open">("all");
  const [showAreaSearchPill, setShowAreaSearchPill] = useState(false);

  // Autocomplete state
  const [q, setQ] = useState("");
  const [ac, setAc] = useState<Suggestion[]>([]);
  const [acOpen, setAcOpen] = useState(false);
  const [acIdx, setAcIdx] = useState(-1);

  const filteredItems = items.filter((p) => {
    // Zero centroid fallback guarantee
    if ((p as unknown as { isCentroidFallback?: boolean }).isCentroidFallback) return false;
    if (filterCategory === "verified") return p.verified || p.source === "verified";
    if (filterCategory === "open") return p.openNow === true;
    return true;
  });

  const filteredItemsRef = useRef(filteredItems);
  useEffect(() => {
    filteredItemsRef.current = filteredItems;
  }, [filteredItems]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  // Selected place quality assessment
  const selectedQuality: LocationQualityAssessment | null = selected
    ? assessLocationQuality({
        latitude: selected.latitude,
        longitude: selected.longitude,
        verificationStatus: selected.verified ? "VERIFIED_OFFICIAL" : selected.source === "verified" ? "VERIFIED_OFFICIAL" : "VERIFIED_SOURCE",
        sourceType: selected.source,
        googlePlaceId: selected.googlePlaceId,
      })
    : null;

  // Sync GeoJSON features to MapLibre source
  const updateMapSource = useCallback((placesList: DiscoveredPlace[]) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource("destinations") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const geojson = discoveredPlacesToGeoJSON(placesList);
    source.setData(geojson);
  }, []);

  // Fetch discoveries for area
  const fetchArea = useCallback(
    async (lat: number, lng: number, radiusKm: number, panToCenter = false) => {
      setLoading(true);
      setFailed(false);
      setShowAreaSearchPill(false);
      try {
        const res = await fetch(
          `/api/temples/discover?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&radius=${Math.round(radiusKm)}&limit=80&forceLive=1`
        );
        const data = (await res.json()) as DiscoveryResult;
        setItems(data.items);
        setMode(data.mode);
        setStale(data.stale);

        if (panToCenter && mapRef.current) {
          const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (prefersReducedMotion) {
            mapRef.current.jumpTo({ center: [lng, lat], zoom: 12.5 });
          } else {
            mapRef.current.flyTo({ center: [lng, lat], zoom: 12.5, essential: true });
          }
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

  // Initial fetch on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArea(DEFAULT_ANCHOR.lat, DEFAULT_ANCHOR.lng, 25);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchArea]);

  // Synchronize GeoJSON features whenever filteredItems change
  useEffect(() => {
    updateMapSource(filteredItems);
  }, [filteredItems, updateMapSource]);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;

    function initMap() {
      if (isCancelled || !mapContainerRef.current) return;

      const styleDef =
        mapStyleKey === "satellite" ? MAP_STYLES.satellite : MAP_STYLES[mapStyleKey];

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style: styleDef as any,
        center: [DEFAULT_ANCHOR.lng, DEFAULT_ANCHOR.lat],
        zoom: 11.5,
        minZoom: 3.5,
        maxZoom: 18.5,
        maxBounds: [
          [INDIA_BOUNDS.minLng - 10, INDIA_BOUNDS.minLat - 5],
          [INDIA_BOUNDS.maxLng + 10, INDIA_BOUNDS.maxLat + 5],
        ],
        attributionControl: false,
      });

      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), "top-right");

      map.on("load", () => {
        if (isCancelled) return;

        // Add clustered GeoJSON source
        map.addSource("destinations", {
          type: "geojson",
          data: discoveredPlacesToGeoJSON(filteredItemsRef.current),
          cluster: true,
          clusterRadius: 45,
          clusterMaxZoom: 14,
        });

        // 1. Cluster Circles Layer
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "destinations",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#c8a24b", // Gold for < 10
              10,
              "#d9822b", // Saffron for 10-30
              30,
              "#ff8c42", // Vivid Saffron for 30+
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              10,
              24,
              30,
              30,
            ],
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 0.92,
          },
        });

        // 2. Cluster Count Text Layer
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "destinations",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 12,
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": "#0d0b09",
          },
        });

        // 3. Unclustered Single Point Halo (Outer Glow)
        map.addLayer({
          id: "unclustered-halo",
          type: "circle",
          source: "destinations",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "rgba(228, 190, 114, 0.25)",
            "circle-radius": 14,
            "circle-stroke-width": 0,
          },
        });

        // 4. Unclustered Single Point Inner Pin
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "destinations",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "case",
              ["get", "isVerified"],
              "#e4be72", // Gold for verified
              "#ff8c42", // Saffron for live/other
            ],
            "circle-radius": 7,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Cluster Click -> Smooth Expansion
        map.on("click", "clusters", async (e: maplibregl.MapLayerMouseEvent) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
          if (!features.length) return;
          const clusterId = features[0].properties?.cluster_id as number;
          const source = map.getSource("destinations") as maplibregl.GeoJSONSource | undefined;
          if (!source) return;

          try {
            const zoom = await source.getClusterExpansionZoom(clusterId);
            const geom = features[0].geometry as { type: "Point"; coordinates: [number, number] };
            map.easeTo({
              center: geom.coordinates,
              zoom: Math.min(zoom + 0.5, 17),
            });
          } catch (err) {
            console.error("Cluster expansion error:", err);
          }
        });

        // Point Click -> Select Destination
        map.on("click", "unclustered-point", (e: maplibregl.MapLayerMouseEvent) => {
          if (!e.features?.length) return;
          const feat = e.features[0];
          setSelectedId(feat.properties?.id ?? null);
          const geom = feat.geometry as { type: "Point"; coordinates: [number, number] };
          map.easeTo({
            center: geom.coordinates,
            offset: [0, 50],
          });
        });

        // Pointer Cursor Management
        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("mouseenter", "unclustered-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "unclustered-point", () => {
          map.getCanvas().style.cursor = "";
        });

        // Detect user pan -> show "Search This Area" button
        map.on("moveend", () => {
          setShowAreaSearchPill(true);
        });
      });
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapStyleKey]);

  // Search Area Trigger
  const handleSearchThisArea = () => {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    const bounds = map.getBounds();
    const radius = Math.min(
      Math.max(
        Math.round(
          bounds.getNorthEast().distanceTo(bounds.getSouthWest()) / 2000
        ),
        5
      ),
      60
    );
    setSelectedId(null);
    fetchArea(center.lat, center.lng, radius);
  };

  // Reset to Sovereign India View
  const resetToIndia = () => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(
      [
        [INDIA_BOUNDS.minLng, INDIA_BOUNDS.minLat],
        [INDIA_BOUNDS.maxLng, INDIA_BOUNDS.maxLat],
      ],
      { padding: 40, essential: true }
    );
  };

  // Locate User via Browser Geolocation
  const locateUser = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isWithinIndiaBounds(latitude, longitude)) {
          alert("Your detected location is outside India bounds. Showing default pilgrimage centers.");
          return;
        }

        // Add user marker
        const map = mapRef.current;
        if (map) {
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          const el = document.createElement("div");
          el.className = "h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse";

          userMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map);

          map.flyTo({ center: [longitude, latitude], zoom: 13, essential: true });
        }

        fetchArea(latitude, longitude, 20);
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        alert("Location access was denied or timed out. You can still search any sacred site above.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Autocomplete logic
  useEffect(() => {
    const trimmed = q.trim();
    const id = setTimeout(async () => {
      if (trimmed.length < 2) {
        setAc([]);
        return;
      }
      try {
        const r = await fetch(`/api/places/autocomplete?q=${encodeURIComponent(trimmed)}&_t=${Date.now()}`);
        const data = (await r.json()) as { suggestions?: Suggestion[] };
        setAc(data.suggestions ?? []);
        setAcOpen(true);
      } catch {
        setAc([]);
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
          fetchArea(data.place.latitude, data.place.longitude, 18, true);
          return;
        }
      } catch {
        /* fall through to text search */
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/temples/discover?q=${encodeURIComponent(sug.text)}&limit=50&forceLive=1`);
      const data = (await res.json()) as DiscoveryResult;
      setItems(data.items);
      setMode(data.mode);
      setStale(data.stale);
      if (data.items[0] && mapRef.current) {
        mapRef.current.flyTo({
          center: [data.items[0].longitude, data.items[0].latitude],
          zoom: 13,
          essential: true,
        });
        setSelectedId(data.items[0].id);
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)] w-full flex-col lg:flex-row overflow-hidden bg-obsidian">
      {/* Top Floating Controls Rail */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-col gap-2 px-3 sm:px-6">
        <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-2">
          {/* Autocomplete Search Bar */}
          <div className="relative flex-1">
            <div className="glass flex items-center gap-2 rounded-2xl border border-line px-3.5 py-2.5 shadow-2xl transition-colors focus-within:border-gold/50">
              <Search className="h-4 w-4 shrink-0 text-gold-dim" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => ac.length > 0 && setAcOpen(true)}
                placeholder={t("map_search")}
                className="w-full bg-transparent text-[13.5px] text-ivory placeholder-ivory-dim/60 outline-none"
                aria-label={t("map_search")}
              />
              {q && (
                <button
                  onClick={() => {
                    setQ("");
                    setAc([]);
                    setAcOpen(false);
                  }}
                  aria-label="Clear Search"
                  className="text-ivory-dim hover:text-ivory"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {acOpen && ac.length > 0 && (
              <div className="glass absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-2xl border border-line p-1 shadow-2xl backdrop-blur-xl">
                {ac.map((s, i) => (
                  <button
                    key={`${s.type}-${s.text}-${i}`}
                    onMouseEnter={() => setAcIdx(i)}
                    onClick={() => goToPlace(s)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] transition-colors",
                      acIdx === i ? "bg-gold/15 text-ivory" : "text-ivory-dim hover:bg-white/[0.05]"
                    )}
                  >
                    <LocateFixed className={cn("h-3.5 w-3.5 shrink-0", acIdx === i ? "text-gold-bright" : "text-gold-dim")} />
                    <span className="truncate">{s.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tab Switcher: Map vs List View */}
          <div className="glass flex items-center rounded-2xl border border-line p-1 shadow-2xl">
            <button
              onClick={() => setActiveTab("map")}
              aria-label="Interactive Map View"
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "map" ? "bg-gold text-obsidian font-semibold shadow" : "text-ivory-dim hover:text-ivory"
              )}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setActiveTab("list")}
              aria-label="List View"
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "list" ? "bg-gold text-obsidian font-semibold shadow" : "text-ivory-dim hover:text-ivory"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
              <span className="ml-0.5 rounded-full bg-black/20 px-1.5 py-0.2 text-[10px]">
                {filteredItems.length}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Filters Pill Bar */}
        <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center justify-between gap-2 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5">
            {(["all", "verified", "open"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium transition-all shadow-md",
                  filterCategory === cat
                    ? "bg-gold text-obsidian font-semibold shadow-gold/20"
                    : "glass border border-line text-ivory-dim hover:text-ivory"
                )}
              >
                {cat === "all" ? "All Shrines" : cat === "verified" ? "Verified Atlas" : "Open Now"}
              </button>
            ))}
          </div>

          {/* Map Style Switcher (Dark / Roads / Satellite) */}
          <div className="glass flex items-center rounded-xl border border-line p-0.5 shadow-md">
            {(["dark", "liberty", "satellite"] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyleKey(style)}
                className={cn(
                  "rounded-lg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  mapStyleKey === style ? "bg-white/15 text-gold-bright" : "text-ivory-dim/70 hover:text-ivory"
                )}
              >
                {style === "dark" ? "Dark" : style === "liberty" ? "Roads" : "Satellite"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating "Search This Area" Pill */}
      {showAreaSearchPill && activeTab === "map" && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center">
          <button
            onClick={handleSearchThisArea}
            disabled={loading}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-gold/40 bg-obsidian-2/95 px-4 py-2 text-xs font-semibold text-gold-bright shadow-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <LocateFixed className="h-3.5 w-3.5 text-gold" />
            {t("map_search_this_area")}
          </button>
        </div>
      )}

      {/* Map View Container */}
      <div
        className={cn(
          "relative flex-1 w-full h-full",
          activeTab === "list" ? "hidden lg:block" : "block"
        )}
      >
        <div ref={mapContainerRef} className="h-full w-full" tabIndex={0} aria-label="Interactive Geographic Map" />

        {/* Floating Bottom Navigation & Controls */}
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={locateUser}
            aria-label="Locate me"
            className="glass pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ivory-dim shadow-xl transition-all hover:border-gold hover:text-gold-bright active:scale-95"
          >
            <Navigation2 className="h-4 w-4" />
          </button>
          <button
            onClick={resetToIndia}
            aria-label="Reset to India view"
            className="glass pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ivory-dim shadow-xl transition-all hover:border-gold hover:text-gold-bright active:scale-95"
          >
            <Compass className="h-4 w-4" />
          </button>
        </div>

        {/* Degradation / Wifi Alert */}
        {(failed || (mode === "degraded" && !stale)) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
            <div className="pointer-events-auto flex max-w-md items-center gap-2 rounded-2xl border border-amber-500/30 bg-obsidian-3/95 px-4 py-2.5 text-xs text-ivory shadow-2xl backdrop-blur-md">
              <WifiOff className="h-4 w-4 shrink-0 text-amber-400" />
              <span>{t("discover_degraded")}. {t("discover_stale")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Results List / Side Rail */}
      <aside
        className={cn(
          "flex flex-col border-line bg-obsidian-2/95 backdrop-blur-xl lg:w-[380px] lg:border-l",
          activeTab === "map"
            ? "max-h-[44vh] w-full border-t lg:max-h-none lg:border-t-0"
            : "flex-1 w-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dim">
              {mode === "live" ? t("discover_live") : mode === "cache" ? t("discover_cache") : "Sacred Destinations"}
            </p>
            <p className="text-xs text-ivory-dim">
              {loading ? "Searching geography…" : `${filteredItems.length} verified pilgrimage places`}
            </p>
          </div>
          <GoogleAttribution className="text-[10px] text-ivory-dim/50" />
        </div>

        {/* Destination List (Accessible & Keyboard Navigable) */}
        <div
          role="region"
          aria-label="Pilgrimage Destinations List"
          aria-live="polite"
          className="flex-1 space-y-2.5 overflow-y-auto p-3"
        >
          {loading && (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line p-8 text-center">
              <MapPin className="h-8 w-8 text-gold-dim mb-2 opacity-50" />
              <p className="text-xs text-ivory-dim">{t("map_empty")}</p>
              <button
                onClick={resetToIndia}
                className="mt-3 rounded-xl border border-gold/30 px-3 py-1.5 text-xs text-gold-bright hover:bg-gold/10"
              >
                Explore National Map
              </button>
            </div>
          )}

          {!loading &&
            filteredItems.map((p) => {
              const quality = assessLocationQuality({
                latitude: p.latitude,
                longitude: p.longitude,
                verificationStatus: p.verified ? "VERIFIED_OFFICIAL" : p.source === "verified" ? "VERIFIED_OFFICIAL" : "VERIFIED_SOURCE",
                sourceType: p.source,
                googlePlaceId: p.googlePlaceId,
              });

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    if (mapRef.current) {
                      mapRef.current.flyTo({
                        center: [p.longitude, p.latitude],
                        zoom: 14.5,
                        essential: true,
                      });
                    }
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                    selectedId === p.id
                      ? "border-gold/50 bg-gold/10 shadow-lg shadow-gold/5"
                      : "border-line bg-obsidian-3/80 hover:border-gold/30 hover:bg-obsidian-3"
                  )}
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] text-lg">
                    {p.verified ? <ShieldCheck className="h-5 w-5 text-gold-bright" /> : "🛕"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-ivory">{p.name}</span>
                      {p.openNow !== null && (
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            p.openNow ? "bg-emerald-400" : "bg-red-400"
                          )}
                          title={p.openNow ? "Open now" : "Closed"}
                        />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ivory-dim">
                      {p.region ? `${p.region} · ` : ""}
                      {p.distanceKm ? `${p.distanceKm.toFixed(1)} km away` : p.address || "India"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {/* Location Quality Badge */}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                          quality.badgeVariant === "gold"
                            ? "border-gold/30 bg-gold/10 text-gold-bright"
                            : quality.badgeVariant === "emerald"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        )}
                      >
                        {quality.accuracyLabel}
                      </span>
                      {p.verified && (
                        <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] text-gold-bright font-medium">
                          Verified Shrine
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </aside>

      {/* Floating Detailed Destination Drawer (Bottom/Side Modal) */}
      {selected && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:left-1/2 lg:-translate-x-1/2 lg:max-w-xl">
          <div className="pointer-events-auto w-full overflow-hidden rounded-3xl border border-line bg-obsidian-3/98 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
            <div className="relative p-5">
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close details"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] text-ivory transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-3.5 pr-8">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-2xl text-gold-bright">
                  {selected.verified ? <ShieldCheck className="h-7 w-7 text-gold-bright" /> : "🛕"}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-medium leading-tight text-ivory">
                    {selected.name}
                  </h3>
                  <p className="mt-1 text-xs text-ivory-dim">
                    {selected.region ? `${selected.region} · ` : ""}
                    {selected.address || "Pilgrimage Destination"}
                  </p>
                </div>
              </div>

              {/* Provenance & Quality Badge Panel */}
              {selectedQuality && (
                <div className="mt-4 rounded-2xl border border-line/60 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-ivory">Geographic Coordinates</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                        selectedQuality.badgeVariant === "gold"
                          ? "border-gold/40 bg-gold/15 text-gold-bright"
                          : selectedQuality.badgeVariant === "emerald"
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                            : "border-amber-500/40 bg-amber-500/15 text-amber-300"
                      )}
                    >
                      {selectedQuality.accuracyLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-ivory-dim leading-relaxed">
                    {selectedQuality.accuracyDescription}
                  </p>
                  <p className="mt-1.5 font-mono text-[10px] text-gold-dim">
                    {selected.latitude.toFixed(5)}°N, {selected.longitude.toFixed(5)}°E
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {selected.verified ? (
                  <Link
                    href={selected.verified.href}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-obsidian shadow-md shadow-gold/20 transition-all hover:bg-gold-bright"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Open Verified Profile
                  </Link>
                ) : (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-obsidian shadow-md shadow-gold/20 transition-all hover:bg-gold-bright"
                  >
                    <Car className="h-4 w-4" />
                    Navigate via Maps
                  </a>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name)}+${selected.latitude},${selected.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line px-3.5 py-2.5 text-xs font-medium text-ivory-dim transition-colors hover:border-gold hover:text-ivory"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}