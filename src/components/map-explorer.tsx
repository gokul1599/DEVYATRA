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
import { discoveredPlacesToGeoJSON, type DestinationGeoJSONFeature } from "@/lib/map/geojson";
import { MAP_STYLES } from "@/lib/map/data-engine";
import * as maplibregl from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

type RuntimeMapStyle = "dark" | "liberty" | "satellite" | "carto";

const FALLBACK_CHAIN: Record<RuntimeMapStyle, RuntimeMapStyle | null> = {
  dark: "satellite",
  liberty: "satellite",
  satellite: "carto",
  carto: null,
};

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
  const [mapStyleKey, setMapStyleKey] = useState<RuntimeMapStyle>("dark");
  const [items, setItems] = useState<DiscoveredPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<DiscoveryResult["mode"] | null>(null);
  const [stale, setStale] = useState(false);
  const [failed, setFailed] = useState(false);

  // Error States & Control Refs
  const [mapError, setMapError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  const fallbackLockRef = useRef(false);
  const mapRenderableRef = useRef(false);
  const mapTimeoutRef = useRef<number | null>(null);
  const viewportAbortRef = useRef<AbortController | null>(null);
  const viewportTimerRef = useRef<number | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<
    "all" | "verified" | "open" | "heritage" | "nature" | "food_stay"
  >("all");
  const [showAreaSearchPill, setShowAreaSearchPill] = useState(false);

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

  // Sync GeoJSON features to MapLibre source
  const updateMapSource = useCallback((placesList: DiscoveredPlace[]) => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource("destinations") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const geojson = discoveredPlacesToGeoJSON(placesList);
    source.setData(geojson);
  }, []);

  useEffect(() => {
    updateMapSource(filteredItems);
  }, [filteredItems, updateMapSource]);

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

        if (panToCenter && mapRef.current) {
          const prefersReducedMotion =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (prefersReducedMotion) {
            mapRef.current.jumpTo({ center: [lng, lat], zoom: 12.5 });
          } else {
            mapRef.current.flyTo({ center: [lng, lat], zoom: 12.5, essential: true });
          }
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
  const fetchViewportTemples = useCallback(
    async (map: maplibregl.Map) => {
      viewportAbortRef.current?.abort();

      const controller = new AbortController();
      viewportAbortRef.current = controller;

      try {
        const bounds = map.getBounds();

        const bbox = [
          bounds.getWest().toFixed(4),
          bounds.getSouth().toFixed(4),
          bounds.getEast().toFixed(4),
          bounds.getNorth().toFixed(4),
        ].join(",");

        const response = await fetch(
          `/api/map/viewport?bbox=${bbox}&limit=120`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Viewport request failed with ${response.status}`
          );
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
              `${feature.properties.city || ""}, ${
                feature.properties.state || ""
              }`.trim(),
            region:
              feature.properties.state ||
              feature.properties.district ||
              "India",
            verified: feature.properties.isVerified
              ? {
                  href:
                    feature.properties.href ||
                    `/temples/india/${
                      feature.properties.slug || ""
                    }`,
                }
              : undefined,
            source:
              feature.properties.sourceType === "verified"
                ? "verified"
                : "cached",
            googlePlaceId:
              feature.properties.googlePlaceId || undefined,
            types: [],
            openNow: feature.properties.openNow ?? null,
            mapsUrl:
              feature.properties.googlePlaceId
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
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "[MapExplorer] viewport data error:",
          error
        );

        setDataError(
          "Destination data is temporarily unavailable. The map remains available."
        );
      }
    },
    []
  );

  // MapLibre Initialization & Lifecycle
  useEffect(() => {
    const container = mapContainerRef.current;

    if (!container) {
      return;
    }

    let cancelled = false;
    let map: maplibregl.Map | null = null;

    mapRenderableRef.current = false;
    fallbackLockRef.current = false;

    const styleDefinition =
      mapStyleKey === "dark"
        ? MAP_STYLES.primaryVector
        : mapStyleKey === "liberty"
          ? MAP_STYLES.primaryLiberty
          : mapStyleKey === "satellite"
            ? MAP_STYLES.esriSatellite
            : MAP_STYLES.cartoDark;

    const installDestinationLayers = () => {
      if (!map || !map.isStyleLoaded()) {
        return;
      }

      try {
        if (!map.getSource("destinations")) {
          map.addSource("destinations", {
            type: "geojson",
            data: discoveredPlacesToGeoJSON(
              filteredItemsRef.current
            ),
            cluster: true,
            clusterRadius: 45,
            clusterMaxZoom: 14,
          });
        }

        if (!map.getLayer("clusters")) {
          map.addLayer({
            id: "clusters",
            type: "circle",
            source: "destinations",
            filter: ["has", "point_count"],
            paint: {
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#c8a24b",
                10,
                "#d9822b",
                30,
                "#ff8c42",
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
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.92,
            },
          });
        }

        if (!map.getLayer("cluster-count")) {
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
        }

        if (!map.getLayer("unclustered-halo")) {
          map.addLayer({
            id: "unclustered-halo",
            type: "circle",
            source: "destinations",
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": "rgba(228,190,114,0.25)",
              "circle-radius": 14,
              "circle-stroke-width": 0,
            },
          });
        }

        if (!map.getLayer("unclustered-point")) {
          map.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "destinations",
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": [
                "case",
                ["get", "isVerified"],
                "#e4be72",
                "#ff8c42",
              ],
              "circle-radius": 7,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            },
          });
        }
      } catch (error) {
        console.error(
          "[MapExplorer] destination layer installation failed:",
          error
        );

        setMapError(
          "The map loaded, but destination layers could not be initialized."
        );
      }
    };

    const moveEnd = () => {
      if (!map) {
        return;
      }

      setShowAreaSearchPill(true);

      if (viewportTimerRef.current !== null) {
        window.clearTimeout(viewportTimerRef.current);
      }

      viewportTimerRef.current = window.setTimeout(() => {
        if (!map || cancelled) {
          return;
        }

        void fetchViewportTemples(map);
      }, 1000);
    };

    const scheduleFallback = (reason: string) => {
      if (
        cancelled ||
        fallbackLockRef.current ||
        mapRenderableRef.current
      ) {
        return;
      }

      const nextStyle = FALLBACK_CHAIN[mapStyleKey];

      console.warn(
        `[MapExplorer] Map startup failure: ${reason}`
      );

      if (!nextStyle) {
        setMapError(
          "All interactive map sources are currently unavailable. List view is still available."
        );
        return;
      }

      fallbackLockRef.current = true;

      setMapError(
        "Map source unavailable. Switching to a backup map source…"
      );

      window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        setMapStyleKey(nextStyle);
      }, 100);
    };

    try {
      map = new maplibregl.Map({
        container,
        // MapLibre accepts either a URL or an inline StyleSpecification.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style: styleDefinition as any,

        center: [
          DEFAULT_MAP_CENTER.lng,
          DEFAULT_MAP_CENTER.lat,
        ],

        zoom: DEFAULT_MAP_CENTER.zoom,

        minZoom: 3.5,
        maxZoom: 18.5,

        maxBounds: [
          [
            INDIA_BOUNDS.minLng - 10,
            INDIA_BOUNDS.minLat - 5,
          ],
          [
            INDIA_BOUNDS.maxLng + 10,
            INDIA_BOUNDS.maxLat + 5,
          ],
        ],

        attributionControl: { compact: true },

        dragRotate: false,
        pitchWithRotate: false,
      });
    } catch (error) {
      console.error(
        "[MapExplorer] Map constructor failed:",
        error
      );

      setTimeout(() => {
        setMapError(
          "Interactive map could not be initialized on this device."
        );
      }, 0);

      return;
    }

    mapRef.current = map;

    map.on("error", (event) => {
      console.warn(
        "[MapExplorer] MapLibre runtime error:",
        event
      );

      if (!mapRenderableRef.current) {
        scheduleFallback("style/tile initialization failure");
      }
    });

    map.on("load", () => {
      if (cancelled || !map) {
        return;
      }

      installDestinationLayers();

      void fetchViewportTemples(map);

      setMapError(null);
      setLoading(false);

      try {
        map.addControl(
          new maplibregl.NavigationControl({
            showCompass: true,
            visualizePitch: false,
          }),
          "top-right"
        );
      } catch (error) {
        console.warn(
          "[MapExplorer] Navigation control failed:",
          error
        );
      }

      map.on(
        "click",
        "clusters",
        async (event) => {
          if (!map) {
            return;
          }

          const features = map.queryRenderedFeatures(
            event.point,
            {
              layers: ["clusters"],
            }
          );

          if (!features.length) {
            return;
          }

          const clusterId =
            features[0].properties?.cluster_id;

          if (
            typeof clusterId !== "number"
          ) {
            return;
          }

          const source = map.getSource(
            "destinations"
          ) as maplibregl.GeoJSONSource | undefined;

          if (!source) {
            return;
          }

          try {
            const zoom =
              await source.getClusterExpansionZoom(
                clusterId
              );

            const geometry = features[0]
              .geometry as {
              type: "Point";
              coordinates: [number, number];
            };

            map.easeTo({
              center: geometry.coordinates,
              zoom: Math.min(zoom + 0.5, 17),
            });
          } catch (error) {
            console.error(
              "[MapExplorer] Cluster expansion failed:",
              error
            );
          }
        }
      );

      map.on(
        "click",
        "unclustered-point",
        (event) => {
          if (!map || !event.features?.length) {
            return;
          }

          const feature = event.features[0];

          const id =
            feature.properties?.id;

          if (!id) {
            return;
          }

          setSelectedId(String(id));

          const geometry = feature.geometry as {
            type: "Point";
            coordinates: [number, number];
          };

          map.easeTo({
            center: geometry.coordinates,
            offset: [0, 50],
          });
        }
      );

      map.on(
        "mouseenter",
        "clusters",
        () => {
          if (map) {
            map.getCanvas().style.cursor =
              "pointer";
          }
        }
      );

      map.on(
        "mouseleave",
        "clusters",
        () => {
          if (map) {
            map.getCanvas().style.cursor =
              "";
          }
        }
      );

      map.on(
        "mouseenter",
        "unclustered-point",
        () => {
          if (map) {
            map.getCanvas().style.cursor =
              "pointer";
          }
        }
      );

      map.on(
        "mouseleave",
        "unclustered-point",
        () => {
          if (map) {
            map.getCanvas().style.cursor =
              "";
          }
        }
      );

      map.on("moveend", moveEnd);
    });

    /*
     * A style replacement removes custom sources/layers.
     * Reinstall them after every successful style load.
     */
    map.on("style.load", () => {
      if (cancelled || !map) {
        return;
      }

      installDestinationLayers();
    });

    /*
     * `idle` is used as the successful-render signal.
     * Once this happens we stop automatic startup fallback.
     */
    const markRenderable = () => {
      if (cancelled) {
        return;
      }

      mapRenderableRef.current = true;
      fallbackLockRef.current = false;

      if (mapTimeoutRef.current !== null) {
        window.clearTimeout(mapTimeoutRef.current);
        mapTimeoutRef.current = null;
      }

      setMapError(null);
    };

    map.once("idle", markRenderable);

    /*
     * Protect against a style that never reaches a usable state.
     */
    mapTimeoutRef.current = window.setTimeout(() => {
      if (!mapRenderableRef.current) {
        scheduleFallback(
          "initial map rendering timed out"
        );
      }
    }, 12000);

    /*
     * Keep MapLibre dimensions synchronized with the actual DOM.
     */
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (!map || cancelled) {
              return;
            }

            map.resize();
          })
        : null;

    resizeObserver?.observe(container);

    /*
     * Initial resize after dynamic import/layout.
     */
    requestAnimationFrame(() => {
      if (!map || cancelled) {
        return;
      }

      map.resize();
    });

    return () => {
      cancelled = true;

      viewportAbortRef.current?.abort();
      viewportAbortRef.current = null;

      if (viewportTimerRef.current !== null) {
        window.clearTimeout(viewportTimerRef.current);
        viewportTimerRef.current = null;
      }

      if (mapTimeoutRef.current !== null) {
        window.clearTimeout(mapTimeoutRef.current);
        mapTimeoutRef.current = null;
      }

      resizeObserver?.disconnect();

      if (map) {
        try {
          map.remove();
        } catch (error) {
          console.warn(
            "[MapExplorer] Map cleanup warning:",
            error
          );
        }
      }

      mapRef.current = null;
      mapRenderableRef.current = false;
    };
  }, [mapStyleKey, fetchViewportTemples]);

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
          alert("Your detected location is outside India bounds. Displaying national pilgrimage atlas.");
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
      if (!res.ok) {
        setFailed(true);
        return;
      }
      const data = (await res.json()) as DiscoveryResult;
      if (data && Array.isArray(data.items)) {
        setItems(data.items);
        setMode(data.mode);
        setStale(Boolean(data.stale));
        if (data.items[0] && mapRef.current) {
          mapRef.current.flyTo({
            center: [data.items[0].longitude, data.items[0].latitude],
            zoom: 13,
            essential: true,
          });
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

          {/* Map Style Switcher (Dark / Roads / Satellite) */}
          <div className="glass flex items-center rounded-xl border border-line p-0.5 shadow-md">
            {(["dark", "liberty", "satellite"] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyleKey(style)}
                className={cn(
                  "rounded-lg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  (mapStyleKey === style || (mapStyleKey === "carto" && style === "dark"))
                    ? "bg-white/15 text-gold-bright"
                    : "text-ivory-dim/70 hover:text-ivory"
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
          "relative min-h-0 flex-1 w-full h-full",
          activeTab === "list" ? "hidden lg:block" : "block"
        )}
      >
        <div
          ref={mapContainerRef}
          className="h-full min-h-0 w-full"
          tabIndex={0}
          aria-label="Interactive Geographic Map"
        />

        {/* Dignified Map Error Fallback UI */}
        {mapError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-obsidian-2/95 p-6 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold-bright mb-4 border border-gold/30">
              <MapIcon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-medium text-ivory">Interactive Map Offline</h3>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-ivory-dim">
              Vector and raster map tiles are unreachable on this network or device. You can retry map initialization or browse all verified sanctuaries in list view.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => {
                  fallbackLockRef.current = false;
                  mapRenderableRef.current = false;
                  setMapError(null);

                  setMapStyleKey(
                    mapStyleKey === "carto"
                      ? "dark"
                      : mapStyleKey === "dark"
                        ? "satellite"
                        : mapStyleKey === "satellite"
                          ? "carto"
                          : "satellite"
                  );
                }}
                className="rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-obsidian shadow-md hover:bg-gold-bright transition-colors"
              >
                Retry Map
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

        {/* Separate data-error indicator: keeps map visible! */}
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