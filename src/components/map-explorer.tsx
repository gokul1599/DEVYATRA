"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Configure same-origin web worker URL to prevent Next.js chunk 404
if (typeof window !== "undefined") {
  try {
    if (maplibregl.config) {
      maplibregl.config.WORKER_URL = "/maplibre/maplibre-gl-worker.mjs";
    }
  } catch (err) {
    console.warn("[MapExplorer] Setting MapLibre WORKER_URL warning:", err);
  }
}

import {
  Compass,
  ExternalLink,
  List,
  LocateFixed,
  Map as MapIcon,
  Navigation2,
  Search,
  ShieldCheck,
  X,
  MapPin,
  Car,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Sparkles,
  Landmark,
  Trees,
  Waves,
  PawPrint,
  Palette,
  UtensilsCrossed,
  ShoppingBag,
  Bookmark,
  BookmarkCheck,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers";
import {
  DEFAULT_MAP_CENTER,
  assessLocationQuality,
  isWithinIndiaBounds,
  isValidCoordinate,
  calculateHaversineKm,
  type LocationQualityAssessment,
} from "@/lib/map/location-quality";
import { MAP_STYLES } from "@/lib/map/data-engine";
import {
  type DestinationGeoJSONFeature,
  type DestinationFeatureCollection,
} from "@/lib/map/geojson";
import { resolveDestinationMedia } from "@/lib/images/resolver";

export interface MapPlaceItem {
  id: string;
  name: string;
  category?: string;
  subcategory?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  district?: string | null;
  state?: string | null;
  stateCode?: string | null;
  image?: string | null;
  verified?: boolean;
  source?: string;
  certainty?: string;
  href?: string | null;
  openNow?: boolean | null;
  googlePlaceId?: string | null;
  accuracy?: string;
  accuracyLabel?: string;
}

interface Suggestion {
  type: "temple" | "location" | "heritage" | "query";
  title: string;
  subtitle?: string;
  slug?: string;
  lat?: number;
  lng?: number;
  id?: string;
}

import {
  MAP_CATEGORIES,
  getCategoryVisual,
  type CategoryMeta,
} from "@/lib/map/categories";
export { MAP_CATEGORIES, getCategoryVisual, type CategoryMeta };

const ICON_MAP: Record<string, LucideIcon> = {
  Compass,
  Sparkles,
  Landmark,
  Trees,
  Waves,
  PawPrint,
  Palette,
  UtensilsCrossed,
  ShoppingBag,
  ShieldCheck,
};

function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function MapExplorer() {
  const { t } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeGeoJsonRef = useRef<DestinationFeatureCollection>({
    type: "FeatureCollection",
    features: [],
    metadata: {
      total: 0,
      exactCount: 0,
      siteCenterCount: 0,
      approximateCount: 0,
      centroidFallbackExcluded: 0,
    },
  });

  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const [currentStyle, setCurrentStyle] = useState<"liberty" | "dark">("liberty");
  const [items, setItems] = useState<MapPlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Bearing for rotating compass
  const [bearing, setBearing] = useState(0);

  // Error states
  const [mapError, setMapError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [mapRetryCount, setMapRetryCount] = useState(0);

  // User Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [userLocationMessage, setUserLocationMessage] = useState<string | null>(null);

  // Selected Marker & Card State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  // Category Filter
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showAreaSearchPill, setShowAreaSearchPill] = useState(false);

  const viewportAbortRef = useRef<AbortController | null>(null);
  const viewportTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Search state
  const [q, setQ] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIdx, setSuggestIdx] = useState(-1);

  // Filter items in memory
  const filteredItems = (Array.isArray(items) ? items : []).filter((p) => {
    if ((p as unknown as { isCentroidFallback?: boolean }).isCentroidFallback) return false;
    if (filterCategory === "verified") return p.verified || p.source === "verified";
    if (filterCategory === "open") return p.openNow === true;
    if (filterCategory === "sacred") {
      return p.category === "TEMPLE" || p.category === "SACRED" || p.category === "PILGRIMAGE";
    }
    if (filterCategory === "heritage") {
      const txt = `${p.name} ${p.subcategory || ""} ${p.address || ""}`.toLowerCase();
      return (
        p.category === "HERITAGE" ||
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
      const txt = `${p.name} ${p.subcategory || ""} ${p.address || ""}`.toLowerCase();
      return (
        p.category === "NATURE" ||
        txt.includes("ghat") ||
        txt.includes("river") ||
        txt.includes("ganga") ||
        txt.includes("kund") ||
        txt.includes("lake") ||
        txt.includes("hills") ||
        txt.includes("teerth") ||
        txt.includes("waterfall") ||
        txt.includes("falls")
      );
    }
    if (filterCategory === "beaches") {
      const txt = `${p.name} ${p.subcategory || ""} ${p.address || ""}`.toLowerCase();
      return (
        p.category === "BEACHES" ||
        p.category === "BEACH" ||
        txt.includes("beach") ||
        txt.includes("coast") ||
        txt.includes("sea") ||
        txt.includes("ocean")
      );
    }
    if (filterCategory === "wildlife") {
      const txt = `${p.name} ${p.subcategory || ""} ${p.address || ""}`.toLowerCase();
      return (
        p.category === "WILDLIFE" ||
        p.category === "PARKS" ||
        txt.includes("national park") ||
        txt.includes("sanctuary") ||
        txt.includes("tiger") ||
        txt.includes("wildlife")
      );
    }
    if (filterCategory === "culture") {
      const txt = `${p.name} ${p.subcategory || ""} ${p.address || ""}`.toLowerCase();
      return (
        p.category === "CULTURE" ||
        txt.includes("museum") ||
        txt.includes("palace") ||
        txt.includes("mahal") ||
        txt.includes("art") ||
        txt.includes("theatre")
      );
    }
    if (filterCategory === "food") {
      const txt = `${p.name} ${p.subcategory || ""} ${p.address || ""}`.toLowerCase();
      return (
        p.category === "FOOD" ||
        txt.includes("dhaba") ||
        txt.includes("gali") ||
        txt.includes("bazaar") ||
        txt.includes("sweets") ||
        txt.includes("lassi") ||
        txt.includes("prasadam") ||
        txt.includes("kachori")
      );
    }
    if (filterCategory === "adventure") {
      const txt = `${p.name} ${p.subcategory || ""} ${p.address || ""}`.toLowerCase();
      return (
        p.category === "ADVENTURE" ||
        txt.includes("trek") ||
        txt.includes("climb") ||
        txt.includes("camp") ||
        txt.includes("rafting")
      );
    }
    if (filterCategory === "shopping") {
      const txt = `${p.name} ${p.subcategory || ""} ${p.address || ""}`.toLowerCase();
      return (
        p.category === "SHOPPING" ||
        txt.includes("bazaar") ||
        txt.includes("market") ||
        txt.includes("craft") ||
        txt.includes("sari") ||
        txt.includes("silk")
      );
    }
    return true;
  });

  const selected = (Array.isArray(items) ? items : []).find((i) => i.id === selectedId) ?? null;

  // Resolve authentic destination imagery & rights metadata
  const resolvedMedia = selected
    ? resolveDestinationMedia({
        id: selected.id,
        slug: selected.href?.split("/").pop(),
        name: selected.name,
        category: selected.category,
        image: selected.image,
        state: selected.state,
        district: selected.district,
      })
    : null;

  const selectedQuality: LocationQualityAssessment | null = selected
    ? assessLocationQuality({
        latitude: selected.latitude,
        longitude: selected.longitude,
        verificationStatus: selected.verified ? "VERIFIED_OFFICIAL" : "VERIFIED_SOURCE",
        sourceType: selected.source,
        googlePlaceId: selected.googlePlaceId,
      })
    : null;

  // Keep save button synchronized with user saved state
  useEffect(() => {
    if (!selected) return;
    const slug = selected.href?.split("/").pop() || selected.id;
    try {
      const raw = localStorage.getItem("tem_saved");
      const local: string[] = raw ? JSON.parse(raw) : [];
      setSavedStatus(local.includes(slug) || local.includes(selected.id));
    } catch {
      setSavedStatus(false);
    }
  }, [selected]);

  // Handle Save / Add to Journey toggle
  const handleToggleSave = async () => {
    if (!selected || saveBusy) return;
    const slug = selected.href?.split("/").pop() || selected.id;
    const nextSaved = !savedStatus;
    setSaveBusy(true);

    try {
      // Local Storage Update
      const raw = localStorage.getItem("tem_saved");
      const list: string[] = raw ? JSON.parse(raw) : [];
      const updated = nextSaved
        ? [...new Set([...list, slug])]
        : list.filter((s) => s !== slug && s !== selected.id);
      localStorage.setItem("tem_saved", JSON.stringify(updated));
      setSavedStatus(nextSaved);

      // Async sync to backend
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, add: nextSaved }),
      }).catch(() => {});
    } finally {
      setSaveBusy(false);
    }
  };

  // Keyboard accessibility: ESC key closes card & suggestion menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
        setSuggestOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Map ↔ List Synchronization: scroll matching list item into view when marker selected
  useEffect(() => {
    if (selectedId && itemRefs.current[selectedId]) {
      itemRefs.current[selectedId]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  // Configure custom layers on MapLibre source
  const setupLayers = useCallback((map: maplibregl.Map, collection: DestinationFeatureCollection) => {
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    try {
      // 1. Add GeoJSON Source with Native Clustering
      if (!map.getSource("temples")) {
        map.addSource("temples", {
          type: "geojson",
          data: collection,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });
      }

      // 2. Clusters layer (Multi-category aggregated density)
      if (!map.getLayer("temple-clusters")) {
        map.addLayer({
          id: "temple-clusters",
          type: "circle",
          source: "temples",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#D97706", // Ochre Gold for < 15
              15,
              "#C8A24B", // Sacred Gold for 15-50
              50,
              "#F59E0B", // Brilliant Gold for 50+
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              15,
              23,
              50,
              29,
            ],
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#FFFFFF",
            "circle-opacity": 0.95,
          },
        });
      }

      // 3. Cluster count label
      if (!map.getLayer("temple-cluster-count")) {
        map.addLayer({
          id: "temple-cluster-count",
          type: "symbol",
          source: "temples",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 12,
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": "#0D0B09",
          },
        });
      }

      // 4. Selected Marker Halo (Subtle, non-distracting restrained ring)
      if (!map.getLayer("selected-point-halo")) {
        map.addLayer({
          id: "selected-point-halo",
          type: "circle",
          source: "temples",
          filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "id"], selectedId || ""]],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              6, 16,
              12, 22,
              16, 28,
            ],
            "circle-color": "#F59E0B",
            "circle-opacity": 0.25,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#F59E0B",
            "circle-stroke-opacity": 0.7,
          },
        });
      }

      // 5. Unclustered destination points (Differentiated by Category Visual Identity)
      if (!map.getLayer("unclustered-point")) {
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "temples",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "match",
              ["get", "category"],
              "HERITAGE", "#D97706",
              "NATURE", "#10B981",
              "BEACHES", "#0284C7",
              "BEACH", "#0284C7",
              "WILDLIFE", "#16A34A",
              "PARKS", "#16A34A",
              "ADVENTURE", "#EA580C",
              "CULTURE", "#9333EA",
              "FOOD", "#E11D48",
              "SHOPPING", "#DB2777",
              /* default sacred */ "#F59E0B",
            ],
            "circle-radius": [
              "case",
              ["==", ["get", "id"], selectedId || ""],
              11.5,
              7,
            ],
            "circle-stroke-width": [
              "case",
              ["==", ["get", "id"], selectedId || ""],
              3.5,
              2,
            ],
            "circle-stroke-color": [
              "case",
              ["==", ["get", "id"], selectedId || ""],
              "#FFFBEB",
              "#FFFFFF",
            ],
          },
        });
      }

      // 6. Unclustered labels (visible when zoomed in)
      if (!map.getLayer("unclustered-point-label")) {
        map.addLayer({
          id: "unclustered-point-label",
          type: "symbol",
          source: "temples",
          filter: ["!", ["has", "point_count"]],
          minzoom: 11,
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Noto Sans Regular"],
            "text-size": 11,
            "text-offset": [0, 1.3],
            "text-anchor": "top",
            "text-optional": true,
          },
          paint: {
            "text-color": currentStyle === "dark" ? "#F2ECE1" : "#1C1813",
            "text-halo-color": currentStyle === "dark" ? "#0D0B09" : "#FFFFFF",
            "text-halo-width": 1.5,
          },
        });
      }

      // Click cluster -> expand with smooth transition
      map.on("click", "temple-clusters", async (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["temple-clusters"] });
        if (!features[0]) return;
        const clusterId = features[0].properties?.cluster_id;
        const source = map.getSource("temples") as maplibregl.GeoJSONSource | undefined;
        if (!source || clusterId == null) return;

        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const geom = features[0].geometry as GeoJSON.Point;
          const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          map.easeTo({
            center: geom.coordinates as [number, number],
            zoom: Math.min(zoom, 16),
            duration: prefersReduced ? 100 : 500,
          });
        } catch (err) {
          console.warn("[MapExplorer] Cluster expansion error:", err);
        }
      });

      // Click individual point -> exact destination selection & smooth camera flight
      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties as Record<string, unknown>;
        const geom = feature.geometry as GeoJSON.Point;
        if (typeof props?.id === "string") {
          setSelectedId(props.id);
          setMobileSheetExpanded(false);
        }
        const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        map.flyTo({
          center: geom.coordinates as [number, number],
          zoom: Math.max(map.getZoom(), 14.5),
          speed: prefersReduced ? 5.0 : 1.2,
          curve: prefersReduced ? 1.0 : 1.42,
          essential: true,
        });
      });

      // Pointer cursors
      map.on("mouseenter", "temple-clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "temple-clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });
    } catch (err) {
      console.warn("[MapExplorer] setupLayers caught error:", err);
    }
  }, [currentStyle, selectedId]);

  // Update layer styles & halo whenever selectedId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("unclustered-point")) return;

    try {
      // Update selected halo layer filter
      if (map.getLayer("selected-point-halo")) {
        map.setFilter("selected-point-halo", [
          "all",
          ["!", ["has", "point_count"]],
          ["==", ["get", "id"], selectedId || ""],
        ]);
      }

      // Update point radius & stroke
      map.setPaintProperty("unclustered-point", "circle-radius", [
        "case",
        ["==", ["get", "id"], selectedId || ""],
        11.5,
        7,
      ]);
      map.setPaintProperty("unclustered-point", "circle-stroke-width", [
        "case",
        ["==", ["get", "id"], selectedId || ""],
        3.5,
        2,
      ]);
      map.setPaintProperty("unclustered-point", "circle-stroke-color", [
        "case",
        ["==", ["get", "id"], selectedId || ""],
        "#FFFBEB",
        "#FFFFFF",
      ]);
    } catch {
      /* ignore if layer is transitioning */
    }
  }, [selectedId]);

  // Viewport Data Engine
  const fetchViewportTemples = useCallback(async (mapInstance?: maplibregl.Map) => {
    const map = mapInstance || mapRef.current;
    if (!map) return;

    viewportAbortRef.current?.abort();
    const controller = new AbortController();
    viewportAbortRef.current = controller;

    try {
      const bounds = map.getBounds();
      if (!bounds) return;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const bbox = [
        sw.lng.toFixed(4),
        sw.lat.toFixed(4),
        ne.lng.toFixed(4),
        ne.lat.toFixed(4),
      ].join(",");

      const response = await fetch(`/api/map/viewport?bbox=${bbox}&category=${filterCategory}&limit=200`, {
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Viewport query responded with ${response.status}`);
      }

      const collection = (await response.json()) as DestinationFeatureCollection;
      setDataError(null);
      activeGeoJsonRef.current = collection;

      // Update GeoJSON source
      try {
        const source = map.getSource("temples") as maplibregl.GeoJSONSource | undefined;
        if (source && map.isStyleLoaded()) {
          source.setData(collection);
        } else if (map.isStyleLoaded()) {
          setupLayers(map, collection);
        }
      } catch (err) {
        console.warn("[MapExplorer] Source data update error:", err);
      }

      // Transform features to MapPlaceItems
      const mappedItems: MapPlaceItem[] = collection.features.map((f: DestinationGeoJSONFeature) => {
        const props = f.properties;
        const [lng, lat] = f.geometry.coordinates;
        return {
          id: props.id,
          name: props.name,
          category: props.category,
          subcategory: props.subcategory,
          latitude: lat,
          longitude: lng,
          address: props.address,
          district: props.district || props.city,
          state: props.state,
          stateCode: props.stateCode,
          image: props.imageReference,
          verified: props.isVerified,
          source: props.sourceType || "CURATED",
          href: props.href,
          accuracy: props.accuracy,
          accuracyLabel: props.accuracyLabel,
          googlePlaceId: props.googlePlaceId,
        };
      });

      setItems(mappedItems);
      setShowAreaSearchPill(false);
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      console.warn("[MapExplorer] Viewport data fetch warning:", err);
      setDataError("Geospatial data temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }, [filterCategory, setupLayers]);

  // MapLibre Initialization & Lifecycle
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (!isWebGLSupported()) {
      setMapError("WebGL is not supported or hardware acceleration is disabled in your browser. Switched to list view.");
      setActiveTab("list");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMapError(null);

    const styleUrl =
      currentStyle === "liberty"
        ? MAP_STYLES.primaryLiberty
        : MAP_STYLES.primaryVector;

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container,
        style: styleUrl,
        center: [DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat],
        zoom: DEFAULT_MAP_CENTER.zoom,
        minZoom: 3.5,
        maxZoom: 18,
        attributionControl: false,
      });
      mapRef.current = map;
    } catch (err) {
      console.error("[MapExplorer] Map constructor error:", err);
      setMapError("Unable to initialize cartography engine in your browser.");
      setActiveTab("list");
      setLoading(false);
      return;
    }

    // Compact open cartography attribution
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution:
          '© <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }),
      "bottom-right"
    );

    let isReadyTriggered = false;
    const triggerMapReady = () => {
      if (cancelled || isReadyTriggered) return;
      isReadyTriggered = true;
      setLoading(false);
      setMapReady(true);
      if (map.isStyleLoaded()) {
        try {
          setupLayers(map, activeGeoJsonRef.current);
        } catch (err) {
          console.warn("[MapExplorer] setupLayers error:", err);
        }
      }
      void fetchViewportTemples(map);
      requestAnimationFrame(() => {
        try {
          map.resize();
        } catch {}
      });
    };

    map.on("load", triggerMapReady);
    map.on("style.load", () => {
      if (cancelled) return;
      if (!isReadyTriggered) {
        triggerMapReady();
      } else if (map.isStyleLoaded()) {
        try {
          setupLayers(map, activeGeoJsonRef.current);
        } catch (err) {
          console.warn("[MapExplorer] style.load setupLayers error:", err);
        }
      }
    });
    map.on("idle", () => {
      if (cancelled) return;
      if (!isReadyTriggered) {
        triggerMapReady();
      }
    });

    if (map.isStyleLoaded()) {
      triggerMapReady();
    }

    // Safety fallback
    const safetyTimer = setTimeout(() => {
      if (!cancelled && !isReadyTriggered) {
        triggerMapReady();
      }
    }, 1500);

    map.on("rotate", () => {
      if (!cancelled) {
        setBearing(map.getBearing());
      }
    });

    map.on("error", (e) => {
      console.warn("[MapExplorer] MapLibre internal warning:", e.error);
    });

    // Moveend listener: debounced viewport fetch
    map.on("moveend", () => {
      if (cancelled) return;
      setShowAreaSearchPill(true);

      if (viewportTimerRef.current !== null) {
        clearTimeout(viewportTimerRef.current);
      }

      viewportTimerRef.current = setTimeout(() => {
        if (!cancelled && mapRef.current) {
          void fetchViewportTemples(mapRef.current);
        }
      }, 700);
    });

    // ResizeObserver
    const ro = new ResizeObserver(() => {
      map.resize();
    });
    ro.observe(container);

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
      ro.disconnect();
      if (viewportTimerRef.current !== null) {
        clearTimeout(viewportTimerRef.current);
      }
      viewportAbortRef.current?.abort();
      userMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [mapRetryCount, currentStyle, fetchViewportTemples, setupLayers]);

  // Handle Style Switching
  const handleToggleStyle = (newStyle: "liberty" | "dark") => {
    if (newStyle === currentStyle) return;
    const map = mapRef.current;
    if (!map) {
      setCurrentStyle(newStyle);
      return;
    }

    setCurrentStyle(newStyle);
    const targetUrl =
      newStyle === "liberty"
        ? MAP_STYLES.primaryLiberty
        : MAP_STYLES.primaryVector;

    map.setStyle(targetUrl);
    map.once("style.load", () => {
      setupLayers(map, activeGeoJsonRef.current);
    });
  };

  // User Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setUserLocationMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setUserLocationMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;

        if (!isValidCoordinate(latitude, longitude) || !isWithinIndiaBounds(latitude, longitude)) {
          setUserLocationMessage("Location coordinates are outside sovereign India bounds.");
          return;
        }

        setUserLocation({ lat: latitude, lng: longitude });

        const map = mapRef.current;
        if (map) {
          map.flyTo({
            center: [longitude, latitude],
            zoom: 13.5,
            speed: 1.4,
            essential: true,
          });

          // Create or update pulse user marker
          if (!userMarkerRef.current) {
            const el = document.createElement("div");
            el.className = "templeora-user-pin";
            el.innerHTML = `
              <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
                <div style="position:absolute;width:100%;height:100%;border-radius:50%;background:#38bdf8;opacity:0.6;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                <div style="position:relative;width:14px;height:14px;border-radius:50%;background:#0284c7;border:2.5px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
              </div>
            `;
            userMarkerRef.current = new maplibregl.Marker({ element: el })
              .setLngLat([longitude, latitude])
              .addTo(map);
          } else {
            userMarkerRef.current.setLngLat([longitude, latitude]);
          }

          void fetchViewportTemples(map);
        }
      },
      (err) => {
        setLocating(false);
        setUserLocationMessage(
          err.code === 1
            ? "Location permission was denied. Enable permission to center on your position."
            : "Location signal unavailable."
        );
        setTimeout(() => setUserLocationMessage(null), 4500);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Reset to National India View
  const handleResetToIndia = () => {
    const map = mapRef.current;
    if (!map) return;
    const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo({
      center: [DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat],
      zoom: DEFAULT_MAP_CENTER.zoom,
      bearing: 0,
      pitch: 0,
      speed: prefersReduced ? 5.0 : 1.2,
      essential: true,
    });
    setSelectedId(null);
  };

  // Reset Orientation / Compass
  const handleResetOrientation = () => {
    const map = mapRef.current;
    if (!map) return;
    map.resetNorthPitch({ duration: 400 });
  };

  // Deep-linking URL handler for ?temple=slug, ?place=slug, ?lat=&lng=, ?category=
  const deepLinkHandledRef = useRef(false);
  useEffect(() => {
    if (!mapReady || deepLinkHandledRef.current || typeof window === "undefined") return;
    deepLinkHandledRef.current = true;

    const sp = new URLSearchParams(window.location.search);
    const templeSlug = sp.get("temple");
    const placeSlug = sp.get("place");
    const latStr = sp.get("lat");
    const lngStr = sp.get("lng");
    const zoomStr = sp.get("zoom");
    const catStr = sp.get("category");

    if (catStr && MAP_CATEGORIES.some((c) => c.id === catStr.toLowerCase())) {
      setFilterCategory(catStr.toLowerCase());
    }

    if (templeSlug) {
      void fetch(`/api/v1/temples/${templeSlug}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((t) => {
          if (t && t.latitude && t.longitude) {
            setSelectedId(t.id);
            setItems((prev) => {
              if (prev.some((p) => p.id === t.id)) return prev;
              const newItem: MapPlaceItem = {
                id: t.id,
                name: t.name,
                category: "TEMPLE",
                subcategory: t.mainDeity,
                latitude: t.latitude,
                longitude: t.longitude,
                address: t.address,
                district: t.district?.name,
                state: t.state?.name,
                image: t.images?.[0] || null,
                verified: true,
                href: `/temples/${t.state?.slug || "india"}/${t.slug}`,
              };
              return [newItem, ...prev];
            });

            if (mapRef.current) {
              const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              mapRef.current.flyTo({
                center: [t.longitude, t.latitude],
                zoom: 15.5,
                speed: prefersReduced ? 5.0 : 1.4,
                curve: prefersReduced ? 1.0 : 1.42,
                essential: true,
              });
            }
          }
        })
        .catch(() => {});
    } else if (placeSlug) {
      void fetch(`/api/destinations?q=${encodeURIComponent(placeSlug)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d && Array.isArray(d.items) && d.items.length > 0) {
            const first = d.items[0];
            setSelectedId(first.id);
            setItems((prev) => {
              if (prev.some((p) => p.id === first.id)) return prev;
              const newItem: MapPlaceItem = {
                id: first.id,
                name: first.name,
                category: first.category,
                subcategory: first.subcategory,
                latitude: first.latitude,
                longitude: first.longitude,
                address: [first.city, first.district, first.state].filter(Boolean).join(", "),
                district: first.district,
                state: first.state,
                image: first.image,
                verified: true,
                href: `/places/${first.slug}`,
              };
              return [newItem, ...prev];
            });

            if (mapRef.current) {
              const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              mapRef.current.flyTo({
                center: [first.longitude, first.latitude],
                zoom: 15,
                speed: prefersReduced ? 5.0 : 1.4,
                curve: prefersReduced ? 1.0 : 1.42,
                essential: true,
              });
            }
          }
        })
        .catch(() => {});
    } else if (latStr && lngStr) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      const zoom = zoomStr ? parseFloat(zoomStr) : 14;
      if (!isNaN(lat) && !isNaN(lng) && isValidCoordinate(lat, lng)) {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom,
            speed: 1.4,
            essential: true,
          });
        }
      }
    }
  }, [mapReady]);

  // Synchronize URL query params with selection and active category
  useEffect(() => {
    if (typeof window === "undefined" || !mapReady) return;
    const url = new URL(window.location.href);

    if (selected) {
      const slug = selected.href?.split("/").pop();
      if ((selected.category === "TEMPLE" || selected.category === "SACRED") && slug) {
        url.searchParams.set("temple", slug);
        url.searchParams.delete("place");
      } else if (slug) {
        url.searchParams.set("place", slug);
        url.searchParams.delete("temple");
      } else {
        url.searchParams.set("place", selected.id);
        url.searchParams.delete("temple");
      }
    } else {
      url.searchParams.delete("temple");
      url.searchParams.delete("place");
    }

    if (filterCategory && filterCategory !== "all") {
      url.searchParams.set("category", filterCategory);
    } else {
      url.searchParams.delete("category");
    }

    window.history.replaceState(null, "", url.toString());
  }, [selectedId, selected, filterCategory, mapReady]);

  // Browser back / forward (popstate) handling
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const templeSlug = sp.get("temple");
      const placeSlug = sp.get("place");
      const target = templeSlug || placeSlug;

      if (!target) {
        setSelectedId(null);
      } else {
        const found = items.find((i) => i.id === target || i.href?.endsWith(`/${target}`));
        if (found) {
          setSelectedId(found.id);
          mapRef.current?.flyTo({
            center: [found.longitude, found.latitude],
            zoom: 15,
            speed: 1.2,
          });
        }
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [items]);

  // Refetch viewport items when filterCategory changes
  useEffect(() => {
    if (mapRef.current && mapReady) {
      void fetchViewportTemples(mapRef.current);
    }
  }, [filterCategory, fetchViewportTemples, mapReady]);

  // Search input handler with debounce
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        const results: Suggestion[] = [];

        // 1. Temples from internal registry/catalog
        if (Array.isArray(data.temples)) {
          for (const t of data.temples.slice(0, 5)) {
            results.push({
              type: "temple",
              title: t.name,
              subtitle: [t.location || t.district, t.stateSlug].filter(Boolean).join(", "),
              slug: t.slug,
              lat: t.latitude,
              lng: t.longitude,
              id: t.id,
            });
          }
        }

        // 2. Geographic Locations / Districts / States
        if (Array.isArray(data.locations)) {
          for (const loc of data.locations.slice(0, 2)) {
            results.push({
              type: "location",
              title: loc.name,
              subtitle: loc.type ? `${loc.type} · ${loc.parent || "India"}` : loc.parent,
              lat: loc.latitude,
              lng: loc.longitude,
            });
          }
        }

        setSuggestions(results);
        setSuggestOpen(results.length > 0);
        setSuggestIdx(-1);
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          console.warn("[MapExplorer] Search error:", err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  const handleSelectSuggestion = async (s: Suggestion) => {
    setSuggestOpen(false);
    setQ(s.title);

    const map = mapRef.current;
    if (!map) return;

    if (s.lat && s.lng) {
      if (s.id) setSelectedId(s.id);
      const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map.flyTo({
        center: [s.lng, s.lat],
        zoom: s.type === "temple" ? 15.5 : 12,
        speed: prefersReduced ? 5.0 : 1.4,
        essential: true,
      });
      void fetchViewportTemples(map);
    } else if (s.slug) {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/temples/${s.slug}`);
        if (res.ok) {
          const temple = await res.json();
          if (temple && temple.latitude && temple.longitude) {
            setSelectedId(temple.id);
            const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            map.flyTo({
              center: [temple.longitude, temple.latitude],
              zoom: 15.5,
              speed: prefersReduced ? 5.0 : 1.3,
              essential: true,
            });
            void fetchViewportTemples(map);
          }
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestOpen && suggestIdx >= 0 && suggestions[suggestIdx]) {
        void handleSelectSuggestion(suggestions[suggestIdx]);
      } else if (q.trim()) {
        void handleSelectSuggestion({ type: "query", title: q.trim() });
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestIdx((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestIdx((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
    }
  };

  const selectedCatVisual = getCategoryVisual(selected?.category);
  const SelectedCatIcon = ICON_MAP[selectedCatVisual.iconName] || Compass;

  return (
    <div className="relative flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)] w-full flex-col lg:flex-row overflow-hidden bg-obsidian">
      {/* Top Floating Search & Filter Bar */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex flex-col gap-2 px-3 sm:px-6">
        <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-2">
          {/* Autocomplete Search Bar */}
          <div className="relative flex-1">
            <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-obsidian-2/95 px-3.5 py-2.5 shadow-2xl backdrop-blur-md transition-colors focus-within:border-gold/50">
              <Search className="h-4 w-4 shrink-0 text-gold-dim" />
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  const val = e.target.value;
                  setQ(val);
                  if (val.trim().length < 2) {
                    setSuggestions([]);
                    setSuggestOpen(false);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
                placeholder={t("map_search") || "Search temples, heritage forts, ghats, beaches, or food…"}
                className="w-full bg-transparent text-[13.5px] text-ivory placeholder-ivory-dim/60 outline-none"
                aria-label={t("map_search") || "Search map"}
              />
              {isSearching && (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-gold-dim" />
              )}
              {q && (
                <button
                  onClick={() => {
                    setQ("");
                    setSuggestions([]);
                    setSuggestOpen(false);
                  }}
                  className="rounded-full p-0.5 text-ivory-dim hover:text-ivory"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {suggestOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto rounded-2xl border border-line bg-obsidian-2/95 p-1.5 shadow-2xl backdrop-blur-xl">
                {suggestions.map((s, idx) => (
                  <button
                    key={`${s.type}-${s.title}-${idx}`}
                    onClick={() => void handleSelectSuggestion(s)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors",
                      suggestIdx === idx
                        ? "bg-gold/15 text-gold-bright"
                        : "text-ivory hover:bg-obsidian-3 hover:text-gold-bright"
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold-bright">
                      {s.type === "temple" ? <Sparkles className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-semibold">{s.title}</div>
                      {s.subtitle && (
                        <div className="truncate text-[10px] text-ivory-dim">{s.subtitle}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Tab Toggle */}
          <div className="flex lg:hidden pointer-events-auto items-center rounded-2xl border border-line bg-obsidian-2/95 p-1 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab("map")}
              className={cn(
                "flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "map"
                  ? "bg-gold text-obsidian font-semibold shadow"
                  : "text-ivory-dim hover:text-ivory"
              )}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={cn(
                "flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "list"
                  ? "bg-gold text-obsidian font-semibold shadow"
                  : "text-ivory-dim hover:text-ivory"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>List ({filteredItems.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Chips (Lucide Icons, No Emojis) */}
        <div className="pointer-events-auto mx-auto flex w-full max-w-2xl items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MAP_CATEGORIES.map((chip) => {
            const Icon = ICON_MAP[chip.iconName] || Compass;
            const isActive = filterCategory === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => setFilterCategory(chip.id)}
                className={cn(
                  "flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium shadow-md backdrop-blur-md transition-all active:scale-95",
                  isActive
                    ? "border-gold bg-gold text-obsidian font-semibold shadow-gold/20"
                    : "border-line bg-obsidian-2/90 text-ivory-dim hover:border-gold/40 hover:text-ivory"
                )}
              >
                <Icon className={cn("h-3 w-3", isActive ? "text-obsidian" : "text-gold-dim")} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* "Search This Area" Floating Pill */}
      {showAreaSearchPill && !loading && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center">
          <button
            onClick={() => void fetchViewportTemples()}
            disabled={loading}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-gold/40 bg-obsidian-2/95 px-4 py-2 text-xs font-semibold text-gold-bright shadow-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Compass className="h-3.5 w-3.5 text-gold animate-spin duration-3000" />
            <span>Search This Area</span>
          </button>
        </div>
      )}

      {/* Main Map Viewport */}
      <div
        className={cn(
          "relative flex-1 w-full h-full min-h-0 min-w-0 overflow-hidden",
          activeTab === "list" && "hidden lg:block"
        )}
      >
        {/* MapLibre Canvas Container */}
        <div
          ref={mapContainerRef}
          className="absolute inset-0 h-full w-full"
          role="region"
          aria-label="TEMPLEORA Sacred Atlas Open Map"
        />

        {/* Loading Overlay */}
        {!mapReady && !mapError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-obsidian/85 backdrop-blur-sm pointer-events-none">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-obsidian-3/90 text-gold shadow-2xl animate-pulse">
              <Compass className="h-7 w-7 animate-spin duration-3000" />
            </div>
            <p className="mt-3 font-serif text-sm font-medium text-ivory">
              Rendering Sacred Atlas Cartography…
            </p>
          </div>
        )}

        {/* Map Failure Recovery UI */}
        {mapError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-obsidian-2/95 p-6 text-center backdrop-blur-md">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 mb-4 border border-amber-500/30">
              <MapIcon className="h-7 w-7" />
            </div>
            <h3 className="font-display text-xl font-medium text-ivory">
              Atlas Cartography Unavailable
            </h3>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-ivory-dim">
              The vector basemap tiles could not be initialized. You can retry map rendering or browse the verified pilgrimage sanctuaries in list view.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() => setMapRetryCount((c) => c + 1)}
                className="rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-obsidian shadow-md hover:bg-gold-bright transition-colors"
              >
                Retry Atlas
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

        {/* Geolocation feedback toast */}
        {userLocationMessage && (
          <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center px-4">
            <div className="pointer-events-auto rounded-full border border-sky-500/40 bg-obsidian-2/95 px-4 py-2 text-xs text-sky-200 shadow-2xl backdrop-blur-md">
              {userLocationMessage}
            </div>
          </div>
        )}

        {/* Subtle Data Error Toast */}
        {dataError && !mapError && (
          <div className="pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4">
            <div className="pointer-events-auto rounded-full border border-amber-500/30 bg-obsidian-3/95 px-4 py-2 text-[11px] text-amber-200 shadow-2xl backdrop-blur-xl">
              {dataError}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* DESKTOP INTEGRATED RIGHT-SIDE DESTINATION CARD (Section 7)   */}
        {/* ------------------------------------------------------------- */}
        {selected && (
          <div className="pointer-events-none absolute top-20 right-4 w-96 max-h-[calc(100vh-10rem)] z-30 hidden sm:block">
            <div className="pointer-events-auto rounded-3xl border border-gold/40 bg-obsidian-2/95 p-4 shadow-2xl backdrop-blur-xl space-y-3.5 max-h-[82vh] overflow-y-auto">
              {/* Header Image with Real Photography & Rights Attribution */}
              {resolvedMedia?.src ? (
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-line bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvedMedia.src}
                    alt={resolvedMedia.alt || selected.name}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-transparent to-transparent" />

                  {/* Category Pill */}
                  <div className={cn("absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-mono border backdrop-blur-md", selectedCatVisual.bgClass, selectedCatVisual.textClass, selectedCatVisual.borderClass)}>
                    <SelectedCatIcon className="h-3 w-3" />
                    <span>{selected.category || "SANCTUARY"}</span>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedId(null)}
                    aria-label="Close destination card"
                    className="absolute top-2.5 right-2.5 rounded-full bg-black/70 p-1 text-ivory-dim hover:text-ivory transition-colors backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {/* Rights & Provenance Ribbon */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[9.5px] font-mono text-stone-300">
                    <span className="truncate max-w-[200px]">{resolvedMedia.credit}</span>
                    <span className="shrink-0 rounded bg-black/60 px-1.5 py-0.5 border border-white/10">
                      {resolvedMedia.rights === "UNSPLASH_LICENSE"
                        ? "Unsplash"
                        : resolvedMedia.rights === "GOOGLE_PLACES_ATTRIBUTION"
                        ? "Google Places"
                        : resolvedMedia.rights === "PUBLIC_DOMAIN"
                        ? "Public Domain"
                        : "Verified"}
                    </span>
                  </div>
                </div>
              ) : (
                /* Dignified Non-Photo Placeholder (No lone emoji) */
                <div className="relative flex flex-col justify-between rounded-2xl border border-gold/30 bg-gradient-to-br from-stone-900 to-obsidian p-4">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10.5px] font-mono border", selectedCatVisual.bgClass, selectedCatVisual.textClass, selectedCatVisual.borderClass)}>
                      <SelectedCatIcon className="h-3 w-3" />
                      <span>{selected.category || "SANCTUARY"}</span>
                    </div>
                    <button
                      onClick={() => setSelectedId(null)}
                      aria-label="Close destination card"
                      className="rounded-full p-1 text-ivory-dim hover:text-ivory transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="my-2 text-center">
                    <p className="text-xs font-mono text-gold-bright">Photography Verification in Progress</p>
                    <p className="text-[10.5px] text-stone-400 mt-0.5">Exact geodetic ground coordinates verified</p>
                  </div>
                </div>
              )}

              {/* Identity & Location Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif text-lg font-semibold text-ivory truncate">
                    {selected.name}
                  </h4>
                  {selected.verified && (
                    <span title="Verified Sovereign Coordinates">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                    </span>
                  )}
                </div>
                <p className="flex items-center gap-1 text-xs text-ivory-dim truncate">
                  <MapPin className="h-3 w-3 text-gold shrink-0" />
                  <span>{selected.address || [selected.district, selected.state].filter(Boolean).join(", ")}</span>
                </p>
              </div>

              {/* Quality & Distance Badges */}
              <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                {selectedQuality && (
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-semibold text-gold-bright border border-gold/30">
                    {selectedQuality.accuracyLabel}
                  </span>
                )}
                <span className="rounded-full bg-stone-800/80 px-2 py-0.5 text-stone-300 border border-stone-700/60 font-mono text-[10px]">
                  {selected.subcategory || selected.category || "Sanctuary"}
                </span>
                {userLocation && (
                  <span className="text-ivory-dim font-mono text-[10.5px]">
                    ~{calculateHaversineKm(userLocation.lat, userLocation.lng, selected.latitude, selected.longitude).toFixed(1)} km (~{Math.round(calculateHaversineKm(userLocation.lat, userLocation.lng, selected.latitude, selected.longitude) * 1.8)} min drive)
                  </span>
                )}
              </div>

              {/* Action Buttons: Explore / Directions / Save / Plan Visit */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line/60">
                {selected.href && (
                  <Link
                    href={selected.href}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold px-3.5 py-2 text-xs font-semibold text-obsidian shadow-md hover:bg-gold-bright transition-colors"
                  >
                    <span>{selected.category === "TEMPLE" ? "Explore Sanctuary" : "Explore"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-obsidian-3 px-3 py-2 text-xs font-medium text-ivory hover:border-gold transition-colors"
                  title="Open Driving Navigation"
                >
                  <Car className="h-3.5 w-3.5 text-gold" />
                  <span>Directions</span>
                </a>
                <button
                  onClick={handleToggleSave}
                  disabled={saveBusy}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                    savedStatus
                      ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                      : "border-line bg-obsidian-3 text-ivory hover:border-gold"
                  )}
                  title={savedStatus ? "Saved in Journey" : "Save to Journey"}
                >
                  {savedStatus ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                  <span>{savedStatus ? "Saved" : "Save"}</span>
                </button>
                <Link
                  href={`/plan?destination=${encodeURIComponent(selected.name)}`}
                  className="flex items-center justify-center gap-1 rounded-xl border border-line bg-obsidian-3 px-3 py-2 text-xs font-medium text-ivory hover:border-gold transition-colors"
                  title="Plan Visit in Yatra Planner"
                >
                  <span>Plan</span>
                  <ArrowRight className="h-3 w-3 text-gold" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MOBILE RESPONSIVE BOTTOM SHEET (Section 8)                   */}
        {/* ------------------------------------------------------------- */}
        {selected && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 sm:hidden">
            <div className={cn(
              "pointer-events-auto rounded-t-3xl border-t border-gold/40 bg-obsidian-2/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300",
              mobileSheetExpanded ? "max-h-[85vh] overflow-y-auto" : "max-h-[220px]"
            )}>
              {/* Drag Handle & Toggle Pill */}
              <div
                onClick={() => setMobileSheetExpanded(!mobileSheetExpanded)}
                className="flex flex-col items-center cursor-pointer pb-2"
              >
                <div className="h-1.5 w-12 rounded-full bg-stone-600 mb-1" />
                <span className="text-[9.5px] font-mono text-stone-400 flex items-center gap-0.5">
                  {mobileSheetExpanded ? (
                    <><span>Collapse</span><ChevronDown className="h-2.5 w-2.5" /></>
                  ) : (
                    <><span>Swipe or Tap to Expand</span><ChevronUp className="h-2.5 w-2.5" /></>
                  )}
                </span>
              </div>

              {/* Compact Header for Mobile */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {resolvedMedia?.src ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolvedMedia.src}
                        alt={selected.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border", selectedCatVisual.bgClass, selectedCatVisual.borderClass)}>
                      <SelectedCatIcon className={cn("h-6 w-6", selectedCatVisual.textClass)} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-serif text-base font-semibold text-ivory truncate">
                        {selected.name}
                      </h4>
                      {selected.verified && (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-[11.5px] text-ivory-dim truncate">
                      {selected.address || [selected.district, selected.state].filter(Boolean).join(", ")}
                    </p>
                    {userLocation && (
                      <p className="text-[10px] font-mono text-gold-bright mt-0.5">
                        ~{calculateHaversineKm(userLocation.lat, userLocation.lng, selected.latitude, selected.longitude).toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="Close destination card"
                  className="rounded-full p-1 text-ivory-dim hover:text-ivory transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Expanded details on mobile */}
              {mobileSheetExpanded && (
                <div className="mt-4 pt-3 border-t border-line/60 space-y-3">
                  {resolvedMedia?.src && (
                    <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-line bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolvedMedia.src}
                        alt={selected.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2.5 rounded bg-black/60 px-2 py-0.5 text-[9px] font-mono text-stone-300">
                        {resolvedMedia.credit}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                    {selectedQuality && (
                      <span className="rounded-full bg-gold/15 px-2.5 py-0.5 font-semibold text-gold-bright border border-gold/30">
                        {selectedQuality.accuracyLabel}
                      </span>
                    )}
                    <span className="rounded-full bg-stone-800/80 px-2 py-0.5 text-stone-300 border border-stone-700/60 font-mono text-[10px]">
                      {selected.subcategory || selected.category || "Sanctuary"}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Action Buttons */}
              <div className="flex items-center gap-2 pt-3 mt-2 border-t border-line/50">
                {selected.href && (
                  <Link
                    href={selected.href}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gold px-3 py-2 text-xs font-semibold text-obsidian shadow-md hover:bg-gold-bright transition-colors"
                  >
                    <span>{selected.category === "TEMPLE" ? "Explore" : "Visit"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 rounded-xl border border-line bg-obsidian-3 px-3 py-2 text-xs font-medium text-ivory hover:border-gold transition-colors"
                >
                  <Car className="h-3.5 w-3.5 text-gold" />
                  <span>Navigate</span>
                </a>
                <button
                  onClick={handleToggleSave}
                  disabled={saveBusy}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                    savedStatus
                      ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                      : "border-line bg-obsidian-3 text-ivory hover:border-gold"
                  )}
                >
                  {savedStatus ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Map Controls (Bottom-Right) */}
        <div className="pointer-events-none absolute bottom-5 right-4 z-20 flex flex-col items-end gap-2.5">
          {/* Style Switcher Pill */}
          <div className="pointer-events-auto flex items-center rounded-2xl border border-line bg-obsidian-2/95 p-1 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => handleToggleStyle("liberty")}
              title="Open road hierarchy & geographic landmarks"
              className={cn(
                "rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all",
                currentStyle === "liberty"
                  ? "bg-gold text-obsidian shadow"
                  : "text-ivory-dim hover:text-ivory"
              )}
            >
              Roads
            </button>
            <button
              onClick={() => handleToggleStyle("dark")}
              title="Nocturnal cinematic atlas"
              className={cn(
                "rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all",
                currentStyle === "dark"
                  ? "bg-gold text-obsidian shadow"
                  : "text-ivory-dim hover:text-ivory"
              )}
            >
              Dark
            </button>
          </div>

          {/* Action Button Stack */}
          <div className="pointer-events-auto flex flex-col overflow-hidden rounded-2xl border border-line bg-obsidian-2/95 shadow-2xl backdrop-blur-md">
            {/* Zoom In */}
            <button
              onClick={() => mapRef.current?.zoomIn()}
              title="Zoom In"
              aria-label="Zoom In"
              className="flex h-9 w-9 items-center justify-center text-ivory-dim transition-colors hover:bg-obsidian-3 hover:text-gold-bright active:scale-95"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="h-[1px] w-full bg-line" />

            {/* Zoom Out */}
            <button
              onClick={() => mapRef.current?.zoomOut()}
              title="Zoom Out"
              aria-label="Zoom Out"
              className="flex h-9 w-9 items-center justify-center text-ivory-dim transition-colors hover:bg-obsidian-3 hover:text-gold-bright active:scale-95"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="h-[1px] w-full bg-line" />

            {/* Compass / Reset Orientation */}
            <button
              onClick={handleResetOrientation}
              title="Reset Orientation (North Up)"
              aria-label="Reset Orientation"
              className="flex h-9 w-9 items-center justify-center text-ivory-dim transition-colors hover:bg-obsidian-3 hover:text-gold-bright active:scale-95"
            >
              <Compass
                className="h-4 w-4 transition-transform duration-150"
                style={{ transform: `rotate(${-bearing}deg)` }}
              />
            </button>
            <div className="h-[1px] w-full bg-line" />

            {/* Locate Me */}
            <button
              onClick={handleLocateMe}
              disabled={locating}
              title="Center on my location"
              aria-label="Center on my location"
              className="flex h-9 w-9 items-center justify-center text-ivory-dim transition-colors hover:bg-obsidian-3 hover:text-gold-bright active:scale-95 disabled:opacity-50"
            >
              <LocateFixed className={cn("h-4 w-4", locating && "animate-spin text-sky-400")} />
            </button>
            <div className="h-[1px] w-full bg-line" />

            {/* Reset to India */}
            <button
              onClick={handleResetToIndia}
              title="Reset to National Map of India"
              aria-label="Reset to National Map of India"
              className="flex h-9 w-9 items-center justify-center text-ivory-dim transition-colors hover:bg-obsidian-3 hover:text-gold-bright active:scale-95"
            >
              <Navigation2 className="h-4 w-4 text-gold" />
            </button>
          </div>
        </div>

        {/* Floating Expand Sidebar Button when collapsed on desktop */}
        {!sidebarOpen && (
          <div className="pointer-events-none absolute top-4 right-4 z-20 hidden lg:flex">
            <button
              onClick={() => setSidebarOpen(true)}
              title="Show Sanctuaries List"
              aria-label="Show Sanctuaries List"
              className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-line bg-obsidian-2/95 px-3.5 py-2 text-xs font-semibold text-gold-bright shadow-2xl backdrop-blur-md transition-all hover:border-gold hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Destinations ({filteredItems.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Side Sanctuary Drawer (Desktop 28% / Mobile Full List) */}
      <aside
        className={cn(
          "flex flex-col border-line bg-obsidian-2 lg:w-[390px] lg:border-l shrink-0 transition-all",
          activeTab === "map" && (sidebarOpen ? "hidden lg:flex" : "hidden"),
          activeTab === "list" && "flex flex-1"
        )}
      >
        {/* Header summary */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <div>
            <h2 className="font-serif text-sm font-semibold text-ivory">
              {MAP_CATEGORIES.find((c) => c.id === filterCategory)?.label || "Sacred Atlas"}
            </h2>
            <p className="text-[11px] text-ivory-dim">
              {loading
                ? "Querying verified geospatial nodes…"
                : `${filteredItems.length} verified destinations in view`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold border border-gold/30 bg-gold/10 text-gold-bright">
              Verified Atlas
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              title="Collapse list"
              aria-label="Collapse list"
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-ivory-dim hover:text-ivory hover:bg-obsidian-3 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sanctuary Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {!loading && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-ivory-dim">
              <MapPin className="h-8 w-8 text-gold/30 mb-2" />
              <p className="text-xs">No destinations found in this view.</p>
              <p className="text-[10px] text-ivory-dim/60 mt-1">
                Try zooming out, panning along the corridor, or selecting All Destinations.
              </p>
            </div>
          )}

          {filteredItems.map((p) => {
            const isSel = p.id === selectedId;
            const pCatVisual = getCategoryVisual(p.category);
            const PCatIcon = ICON_MAP[pCatVisual.iconName] || Compass;

            return (
              <button
                key={p.id}
                ref={(el) => {
                  itemRefs.current[p.id] = el;
                }}
                onClick={() => {
                  setSelectedId(p.id);
                  const map = mapRef.current;
                  if (map) {
                    const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                    map.flyTo({
                      center: [p.longitude, p.latitude],
                      zoom: 15.5,
                      speed: prefersReduced ? 5.0 : 1.4,
                      curve: prefersReduced ? 1.0 : 1.42,
                      essential: true,
                    });
                  }
                  if (activeTab === "list") {
                    setActiveTab("map");
                  }
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                  isSel
                    ? "border-gold bg-gold/10 shadow-lg shadow-gold/10 ring-1 ring-gold/40"
                    : "border-line bg-obsidian-3/60 hover:border-gold/30 hover:bg-obsidian-3"
                )}
              >
                {/* Photo thumbnail or Category visual */}
                {p.image ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border", pCatVisual.bgClass, pCatVisual.borderClass)}>
                    <PCatIcon className={cn("h-6 w-6", pCatVisual.textClass)} />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate font-serif text-[13.5px] font-semibold text-ivory">
                      {p.name}
                    </h3>
                    {p.verified && (
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    )}
                  </div>
                  <p className="truncate text-[11px] text-ivory-dim">
                    {[p.district, p.state].filter(Boolean).join(", ") || "India"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                    <span className={cn("font-medium", pCatVisual.textClass)}>
                      {p.subcategory || p.category || "Sanctuary"}
                    </span>
                    {p.accuracyLabel && (
                      <span className="rounded bg-gold/15 px-1.5 py-0.2 text-[9px] font-semibold text-gold-bright">
                        {p.accuracyLabel}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Attribution Bar */}
        <div className="border-t border-line/60 px-4 py-2.5 bg-obsidian-3/60 text-center">
          <p className="text-[10px] text-ivory-dim/60 leading-tight">
            TEMPLEORA Sacred Atlas — powered by sovereign geographic mapping and verified India destination intelligence.
          </p>
        </div>
      </aside>
    </div>
  );
}