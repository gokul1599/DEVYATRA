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
  DEFAULT_MAP_CENTER,
  INDIA_BOUNDS,
  assessLocationQuality,
  isWithinIndiaBounds,
  type LocationQualityAssessment,
} from "@/lib/map/location-quality";
import { type DestinationGeoJSONFeature } from "@/lib/map/geojson";
import { loadGoogleMaps } from "@/lib/map/google-loader";
import { MarkerClusterer, type Cluster } from "@googlemaps/markerclusterer";

interface Suggestion {
  type: "place" | "query";
  placeId?: string;
  text: string;
}

export function MapExplorer() {
  const { t } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersMapRef = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const [items, setItems] = useState<DiscoveredPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mode, setMode] = useState<DiscoveryResult["mode"] | null>(null);
  const [stale, setStale] = useState(false);
  const [failed, setFailed] = useState(false);

  // Distinct Map vs Data Error states
  const [mapError, setMapError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [mapRetryCount, setMapRetryCount] = useState(0);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "verified" | "open" | "heritage" | "nature" | "food_stay"
  >("all");
  const [showAreaSearchPill, setShowAreaSearchPill] = useState(false);

  const viewportAbortRef = useRef<AbortController | null>(null);
  const viewportTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Autocomplete state
  const [q, setQ] = useState("");
  const [ac, setAc] = useState<Suggestion[]>([]);
  const [acOpen, setAcOpen] = useState(false);
  const [acIdx, setAcIdx] = useState(-1);

  const filteredItems = (Array.isArray(items) ? items : []).filter((p) => {
    // Zero centroid fallback guarantee
    if ((p as unknown as { isCentroidFallback?: boolean }).isCentroidFallback) return false;
    if (filterCategory === "verified") return p.verified || p.source === "verified";
    if (filterCategory === "open") return p.openNow === true;
    if (filterCategory === "heritage") {
      const txt = `${p.name} ${p.address || ""}`.toLowerCase();
      return (
        p.certainty === "religious_site" ||
        txt.includes("fort") ||
        txt.includes("palace") ||
        txt.includes("heritage") ||
        txt.includes("asi") ||
        txt.includes("monument") ||
        txt.includes("cave")
      );
    }
    if (filterCategory === "nature") {
      const txt = `${p.name} ${p.address || ""}`.toLowerCase();
      return (
        txt.includes("lake") ||
        txt.includes("river") ||
        txt.includes("ghat") ||
        txt.includes("sangam") ||
        txt.includes("hill") ||
        txt.includes("waterfall") ||
        txt.includes("kund")
      );
    }
    if (filterCategory === "food_stay") {
      const txt = `${p.name} ${p.address || ""}`.toLowerCase();
      return (
        txt.includes("ashram") ||
        txt.includes("bhojanalaya") ||
        txt.includes("dharamshala") ||
        txt.includes("bhavan") ||
        txt.includes("annakshetra") ||
        txt.includes("matha")
      );
    }
    return true;
  });

  const filteredItemsRef = useRef(filteredItems);
  useEffect(() => {
    filteredItemsRef.current = filteredItems;
  }, [filteredItems]);

  const selected = (Array.isArray(items) ? items : []).find((i) => i.id === selectedId) ?? null;

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

  // Fetch discoveries for area (Search This Area or specific target)
  const fetchArea = useCallback(
    async (lat: number, lng: number, radiusKm: number, panToCenter = false) => {
      setLoading(true);
      setFailed(false);
      setShowAreaSearchPill(false);
      try {
        const res = await fetch(
          `/api/temples/discover?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&radius=${Math.round(radiusKm)}&limit=60&forceLive=1`
        );
        if (!res.ok) {
          setFailed(true);
          setDataError("Discovery service temporarily unavailable.");
          return;
        }
        const data = (await res.json()) as DiscoveryResult;
        if (data && Array.isArray(data.items)) {
          setItems(data.items);
          setMode(data.mode);
          setStale(Boolean(data.stale));
          setDataError(null);
        } else {
          setItems([]);
        }

        if (panToCenter && googleMapRef.current) {
          googleMapRef.current.panTo({ lat, lng });
          googleMapRef.current.setZoom(13);
        }
      } catch (err) {
        console.warn("[MapExplorer] fetchArea error:", err);
        setFailed(true);
        setDataError("Discovery service temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Viewport Data Engine
  const fetchViewportTemples = useCallback(async (map: google.maps.Map) => {
    viewportAbortRef.current?.abort();

    const controller = new AbortController();
    viewportAbortRef.current = controller;

    try {
      const bounds = map.getBounds();
      if (!bounds) return;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const bbox = [
        sw.lng().toFixed(4),
        sw.lat().toFixed(4),
        ne.lng().toFixed(4),
        ne.lat().toFixed(4),
      ].join(",");

      const response = await fetch(`/api/map/viewport?bbox=${bbox}&limit=120`, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Viewport request failed with ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data.features)) {
        throw new Error("Viewport response contains no GeoJSON features");
      }

      const newPlaces: DiscoveredPlace[] = data.features
        .filter(
          (feature: DestinationGeoJSONFeature) =>
            Number.isFinite(feature.geometry.coordinates[0]) &&
            Number.isFinite(feature.geometry.coordinates[1])
        )
        .map((feature: DestinationGeoJSONFeature) => ({
          id: feature.properties.id,
          name: feature.properties.name,
          category: feature.properties.category,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          address:
            feature.properties.address ||
            `${feature.properties.city || ""}, ${feature.properties.state || ""}`.trim(),
          region:
            feature.properties.state || feature.properties.district || "India",
          verified: feature.properties.isVerified
            ? {
                href:
                  feature.properties.href ||
                  `/temples/india/${feature.properties.slug || ""}`,
              }
            : undefined,
          source:
            feature.properties.sourceType === "verified" ? "verified" : "cached",
          googlePlaceId: feature.properties.googlePlaceId || undefined,
          types: [],
          openNow: feature.properties.openNow ?? null,
          mapsUrl: feature.properties.googlePlaceId
            ? `https://www.google.com/maps/place/?q=place_id:${feature.properties.googlePlaceId}`
            : `https://www.google.com/maps/search/?api=1&query=${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`,
          certainty: "temple",
        }));

      setItems((previous) => {
        const byId = new Map<string, DiscoveredPlace>();
        for (const item of previous) {
          byId.set(item.id, item);
        }
        for (const item of newPlaces) {
          byId.set(item.id, item);
        }
        return Array.from(byId.values());
      });

      setDataError(null);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error("[MapExplorer] viewport data error:", error);
      setDataError(
        "Destination data is temporarily unavailable. The map remains available."
      );
    }
  }, []);

  // Update Markers and Clusters when filtered items change
  useEffect(() => {
    const map = googleMapRef.current;
    const clusterer = clustererRef.current;
    if (!map || !clusterer || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    const places = filteredItems;
    const existingMarkers = markersMapRef.current;
    const currentPlaceIds = new Set(places.map((p) => p.id));

    // Remove markers that are no longer in filtered list
    existingMarkers.forEach((marker, id) => {
      if (!currentPlaceIds.has(id)) {
        clusterer.removeMarker(marker);
        marker.map = null;
        existingMarkers.delete(id);
      }
    });

    const newMarkersToAdd: google.maps.marker.AdvancedMarkerElement[] = [];

    for (const place of places) {
      if (existingMarkers.has(place.id)) continue;

      const isExact = Boolean(
        place.verified ||
          (place.googlePlaceId && place.googlePlaceId.startsWith("ChIJ"))
      );

      // Create Custom DOM Element for AdvancedMarkerElement
      const pinElement = document.createElement("div");
      pinElement.className =
        "temple-advanced-marker select-none cursor-pointer transition-transform duration-200 hover:scale-115 active:scale-95";
      pinElement.setAttribute("role", "button");
      pinElement.setAttribute("tabindex", "0");
      pinElement.setAttribute("aria-label", `${place.name} sanctuary marker`);

      pinElement.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${
            isExact
              ? "linear-gradient(135deg, #E4BE72 0%, #C8A24B 100%)"
              : "linear-gradient(135deg, #FF8C42 0%, #D9822B 100%)"
          };
          border: 2px solid ${isExact ? "#FFFFFF" : "#FFF3E0"};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45), 0 0 10px rgba(200, 162, 75, 0.4);
          font-size: 15px;
          color: #0D0B09;
        ">
          🛕
        </div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: null, // added to clusterer instead
        position: { lat: place.latitude, lng: place.longitude },
        title: place.name,
        content: pinElement,
      });

      marker.addListener("click", () => {
        setSelectedId(place.id);
        if (googleMapRef.current) {
          googleMapRef.current.panTo({ lat: place.latitude, lng: place.longitude });
        }
      });

      existingMarkers.set(place.id, marker);
      newMarkersToAdd.push(marker);
    }

    if (newMarkersToAdd.length > 0) {
      clusterer.addMarkers(newMarkersToAdd);
    }
  }, [filteredItems]);

  // Google Maps Initialization & Lifecycle
  useEffect(() => {
    const container = mapContainerRef.current;
    const markersMap = markersMapRef.current;
    if (!container) return;

    let cancelled = false;

    setLoading(true);
    setMapError(null);

    loadGoogleMaps()
      .then((googleMaps) => {
        if (cancelled || !container) return;

        try {
          const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || "DEMO_MAP_ID";

          const map = new googleMaps.Map(container, {
            center: { lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng },
            zoom: DEFAULT_MAP_CENTER.zoom,
            mapId,
            mapTypeId: googleMaps.MapTypeId.ROADMAP,
            // Native Google Controls
            zoomControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: googleMaps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: googleMaps.ControlPosition.TOP_RIGHT,
              mapTypeIds: [
                googleMaps.MapTypeId.ROADMAP,
                googleMaps.MapTypeId.SATELLITE,
                googleMaps.MapTypeId.HYBRID,
                googleMaps.MapTypeId.TERRAIN,
              ],
            },
            fullscreenControl: true,
            fullscreenControlOptions: {
              position: googleMaps.ControlPosition.RIGHT_TOP,
            },
            streetViewControl: true,
            streetViewControlOptions: {
              position: googleMaps.ControlPosition.RIGHT_BOTTOM,
            },
            scaleControl: true,
            restriction: {
              latLngBounds: {
                north: INDIA_BOUNDS.maxLat + 8,
                south: INDIA_BOUNDS.minLat - 5,
                west: INDIA_BOUNDS.minLng - 10,
                east: INDIA_BOUNDS.maxLng + 10,
              },
              strictBounds: false,
            },
          });

          googleMapRef.current = map;

          // Initialize MarkerClusterer with custom gold styling for AdvancedMarkerElement
          const clusterer = new MarkerClusterer({
            map,
            markers: [],
            renderer: {
              render({ count, position }: Cluster, _stats, targetMap) {
                const clusterEl = document.createElement("div");
                clusterEl.className = "select-none cursor-pointer transition-transform hover:scale-110";
                clusterEl.innerHTML = `
                  <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: ${count > 99 ? "44px" : "38px"};
                    height: ${count > 99 ? "44px" : "38px"};
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(200, 162, 75, 0.95) 0%, rgba(13, 11, 9, 0.92) 100%);
                    border: 2px solid #C8A24B;
                    box-shadow: 0 0 14px rgba(200, 162, 75, 0.45), 0 4px 12px rgba(0, 0, 0, 0.6);
                    color: #FFFFFF;
                    font-family: var(--font-geist-sans), sans-serif;
                    font-weight: 700;
                    font-size: ${count > 99 ? "11px" : "12px"};
                  ">
                    ${count}
                  </div>
                `;
                return new googleMaps.marker.AdvancedMarkerElement({
                  map: targetMap,
                  position,
                  content: clusterEl,
                  zIndex: 1000 + count,
                });
              },
            },
          });

          clustererRef.current = clusterer;

          // Debounced Idle listener for Viewport Data fetching
          map.addListener("idle", () => {
            if (cancelled) return;
            setMapReady(true);
            setShowAreaSearchPill(true);

            if (viewportTimerRef.current !== null) {
              clearTimeout(viewportTimerRef.current);
            }

            viewportTimerRef.current = setTimeout(() => {
              if (!cancelled && googleMapRef.current) {
                void fetchViewportTemples(googleMapRef.current);
              }
            }, 850);
          });

          // Initial load triggers initial national viewport query
          void fetchViewportTemples(map);
          setLoading(false);

          // ResizeObserver for dynamic layout / orientation changes
          if (typeof ResizeObserver !== "undefined") {
            const ro = new ResizeObserver(() => {
              if (googleMapRef.current && !cancelled) {
                google.maps.event.trigger(googleMapRef.current, "resize");
              }
            });
            ro.observe(container);
            resizeObserverRef.current = ro;
          }
        } catch (initErr) {
          console.error("[MapExplorer] Google Maps initialization error:", initErr);
          setMapError("Google Maps is temporarily unavailable on this device.");
          setLoading(false);
        }
      })
      .catch((loadErr) => {
        console.error("[MapExplorer] Google Maps script load error:", loadErr);
        if (!cancelled) {
          setMapError("Google Maps is temporarily unavailable.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;

      viewportAbortRef.current?.abort();
      viewportAbortRef.current = null;

      if (viewportTimerRef.current !== null) {
        clearTimeout(viewportTimerRef.current);
        viewportTimerRef.current = null;
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }

      markersMap.forEach((marker) => {
        marker.map = null;
      });
      markersMap.clear();

      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
        userMarkerRef.current = null;
      }

      googleMapRef.current = null;
      setMapReady(false);
    };
  }, [mapRetryCount, fetchViewportTemples]);

  // Search Area Trigger
  const handleSearchThisArea = () => {
    const map = googleMapRef.current;
    if (!map) return;
    const center = map.getCenter();
    const bounds = map.getBounds();
    if (!center || !bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const radius = Math.min(
      Math.max(
        Math.round(
          Math.hypot(ne.lat() - sw.lat(), ne.lng() - sw.lng()) * 55
        ),
        5
      ),
      60
    );

    setSelectedId(null);
    fetchArea(center.lat(), center.lng(), radius);
  };

  // Reset to Sovereign India View
  const resetToIndia = () => {
    const map = googleMapRef.current;
    if (!map) return;
    map.panTo({ lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng });
    map.setZoom(DEFAULT_MAP_CENTER.zoom);
  };

  // Locate User via Browser Geolocation
  const locateUser = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isWithinIndiaBounds(latitude, longitude)) {
          alert("Your detected location is outside India bounds. Displaying national pilgrimage atlas.");
          return;
        }

        const map = googleMapRef.current;
        if (map && window.google?.maps?.marker?.AdvancedMarkerElement) {
          if (userMarkerRef.current) {
            userMarkerRef.current.map = null;
          }

          const userEl = document.createElement("div");
          userEl.className =
            "h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse";

          userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: latitude, lng: longitude },
            title: "Your Location",
            content: userEl,
          });

          map.panTo({ lat: latitude, lng: longitude });
          map.setZoom(13);
        }

        fetchArea(latitude, longitude, 20);
      },
      (err) => {
        console.warn("[MapExplorer] Geolocation denied or error:", err);
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
        const r = await fetch(
          `/api/places/autocomplete?q=${encodeURIComponent(trimmed)}&_t=${Date.now()}`
        );
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
        const r = await fetch(
          `/api/places/details?placeId=${encodeURIComponent(sug.placeId)}`
        );
        const data = (await r.json()) as {
          place?: { latitude: number; longitude: number } | null;
        };
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
      const res = await fetch(
        `/api/temples/discover?q=${encodeURIComponent(sug.text)}&limit=50&forceLive=1`
      );
      if (!res.ok) {
        setFailed(true);
        return;
      }
      const data = (await res.json()) as DiscoveryResult;
      if (data && Array.isArray(data.items)) {
        setItems(data.items);
        setMode(data.mode);
        setStale(Boolean(data.stale));
        if (data.items[0] && googleMapRef.current) {
          googleMapRef.current.panTo({
            lat: data.items[0].latitude,
            lng: data.items[0].longitude,
          });
          googleMapRef.current.setZoom(13);
          setSelectedId(data.items[0].id);
        }
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
                    <LocateFixed
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        acIdx === i ? "text-gold-bright" : "text-gold-dim"
                      )}
                    />
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
                activeTab === "map"
                  ? "bg-gold text-obsidian font-semibold shadow"
                  : "text-ivory-dim hover:text-ivory"
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
                activeTab === "list"
                  ? "bg-gold text-obsidian font-semibold shadow"
                  : "text-ivory-dim hover:text-ivory"
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
        <div className="pointer-events-auto mx-auto flex w-full max-w-2xl items-center justify-between gap-2 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            {(
              [
                { id: "all", label: "All Shrines" },
                { id: "verified", label: "Verified Atlas" },
                { id: "open", label: "Open Now" },
                { id: "heritage", label: "ASI & Heritage" },
                { id: "nature", label: "Nature & Sangam" },
                { id: "food_stay", label: "Bhojanalaya & Stay" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium transition-all shadow-md",
                  filterCategory === cat.id
                    ? "bg-gold text-obsidian font-semibold shadow-gold/20"
                    : "glass border border-line text-ivory-dim hover:text-ivory"
                )}
              >
                {cat.label}
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
          "relative min-h-0 flex-1 w-full h-full",
          activeTab === "list" ? "hidden lg:block" : "block"
        )}
      >
        <div
          ref={mapContainerRef}
          className="h-full min-h-0 w-full"
          tabIndex={0}
          aria-label="Google Maps Geographic View"
        />

        {/* Loading Overlay */}
        {!mapReady && !mapError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-obsidian/80 backdrop-blur-sm pointer-events-none">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-obsidian-3/90 text-gold shadow-2xl animate-pulse">
              <Compass className="h-7 w-7 animate-spin duration-3000" />
            </div>
            <p className="mt-3 font-serif text-sm font-medium text-ivory">
              Initializing Google Maps Atlas…
            </p>
          </div>
        )}

        {/* Offline / Failure Mode UI */}
        {mapError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-obsidian-2/95 p-6 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold-bright mb-4 border border-gold/30">
              <MapIcon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-medium text-ivory">
              Google Maps is temporarily unavailable
            </h3>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-ivory-dim">
              The Google Maps JavaScript API could not be reached. You can retry map initialization or browse all verified sanctuaries in list view.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setMapRetryCount((c) => c + 1)}
                className="rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-obsidian shadow-md hover:bg-gold-bright transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className="rounded-xl border border-line bg-obsidian-3 px-4 py-2 text-xs font-medium text-ivory hover:border-gold transition-colors"
              >
                Open List View ({filteredItems.length})
              </button>
            </div>
          </div>
        )}

        {/* Floating Custom TEMPLEORA Action Buttons */}
        <div className="pointer-events-none absolute bottom-5 left-5 z-10 flex flex-col gap-2">
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

        {/* Data degradation notification: keeps Google map visible! */}
        {dataError && !mapError && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
            <div className="pointer-events-auto rounded-full border border-amber-500/30 bg-obsidian-3/95 px-4 py-2 text-[11px] text-amber-200 shadow-2xl backdrop-blur-xl">
              {dataError}
            </div>
          </div>
        )}

        {/* Degradation / Wifi Alert */}
        {(failed || (mode === "degraded" && !stale)) && !dataError && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
            <div className="pointer-events-auto flex max-w-md items-center gap-2 rounded-2xl border border-amber-500/30 bg-obsidian-3/95 px-4 py-2.5 text-xs text-ivory shadow-2xl backdrop-blur-md">
              <WifiOff className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                {t("discover_degraded")}. {t("discover_stale")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results List / Side Rail (25-35% on Desktop) */}
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
              {mode === "live"
                ? t("discover_live")
                : mode === "cache"
                  ? t("discover_cache")
                  : "Sacred Destinations"}
            </p>
            <p className="text-xs text-ivory-dim">
              {loading
                ? "Searching geography…"
                : `${filteredItems.length} verified pilgrimage places`}
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
                verificationStatus: p.verified
                  ? "VERIFIED_OFFICIAL"
                  : p.source === "verified"
                    ? "VERIFIED_OFFICIAL"
                    : "VERIFIED_SOURCE",
                sourceType: p.source,
                googlePlaceId: p.googlePlaceId,
              });

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    if (googleMapRef.current) {
                      googleMapRef.current.panTo({
                        lat: p.latitude,
                        lng: p.longitude,
                      });
                      googleMapRef.current.setZoom(14);
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
                    {p.verified ? (
                      <ShieldCheck className="h-5 w-5 text-gold-bright" />
                    ) : (
                      "🛕"
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-ivory">
                        {p.name}
                      </span>
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
                      {p.distanceKm
                        ? `${p.distanceKm.toFixed(1)} km away`
                        : p.address || "India"}
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
                  {selected.verified ? (
                    <ShieldCheck className="h-7 w-7 text-gold-bright" />
                  ) : (
                    "🛕"
                  )}
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
                    <span className="text-[11px] font-medium text-ivory">
                      Geographic Coordinates
                    </span>
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
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    selected.name
                  )}+${selected.latitude},${selected.longitude}`}
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