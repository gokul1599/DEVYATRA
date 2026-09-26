"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Mountain,
  MountainSnow,
  Droplets,
  Smile,
  Bookmark,
  BookmarkCheck,
  ChevronUp,
  ChevronDown,
  Globe2,
  Building2,
  Layers,
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
import {
  getStateBoundary,
  getDistrictBoundary,
  getLocalityBoundary,
} from "@/lib/map/admin-boundaries";

export interface MapPlaceItem {
  id: string;
  name: string;
  category?: string;
  subcategory?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  stateCode?: string | null;
  image?: string | null;
  verified?: boolean;
  isInside?: boolean;
  source?: string;
  certainty?: string;
  href?: string | null;
  openNow?: boolean | null;
  googlePlaceId?: string | null;
  accuracy?: string;
  accuracyLabel?: string;
  distanceKm?: number | null;
}

export interface ActiveLocationFilter {
  type: "state" | "district" | "city";
  name: string;
  district?: string;
  state?: string;
  lat: number;
  lng: number;
  zoom?: number;
}

interface Suggestion {
  type: "destination" | "locality" | "district" | "state" | "temple" | "location";
  title: string;
  subtitle?: string;
  category?: string;
  slug?: string;
  id?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  district?: string;
  state?: string;
  city?: string;
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
  Mountain,
  MountainSnow,
  Droplets,
  Trees,
  Waves,
  PawPrint,
  Smile,
  Palette,
  UtensilsCrossed,
  ShoppingBag,
  ShieldCheck,
  Building2,
  Globe2,
  Layers,
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const [activeTab, setActiveTab] = useState<"map" | "filters" | "list">("map");
  const [currentStyle, setCurrentStyle] = useState<"liberty" | "dark">("liberty");
  const [items, setItems] = useState<MapPlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
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

  // Canonical Filters: Category & Administrative Location
  const [filterCategory, setFilterCategory] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const cat = sp.get("category")?.toLowerCase();
      if (cat && (cat === "all" || MAP_CATEGORIES.some((c) => c.id === cat))) {
        return cat;
      }
    }
    return "all";
  });
  const [activeLocation, setActiveLocation] = useState<ActiveLocationFilter | null>(null);
  const [showAreaSearchPill, setShowAreaSearchPill] = useState(false);

  const viewportAbortRef = useRef<AbortController | null>(null);
  const viewportTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);
  const initialParamsHandledRef = useRef(false);

  // Search state
  const [q, setQ] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestIdx, setSuggestIdx] = useState(-1);

  // Update canonical URL search query without full navigation reload
  const updateUrlParams = useCallback(
    (paramsToUpdate: Record<string, string | null | undefined>) => {
      if (typeof window === "undefined") return;
      const current = new URLSearchParams(window.location.search);
      for (const [key, val] of Object.entries(paramsToUpdate)) {
        if (
          val === null ||
          val === undefined ||
          val === "" ||
          (key === "category" && val === "all")
        ) {
          current.delete(key);
        } else {
          current.set(key, val);
        }
      }
      const search = current.toString();
      const query = search ? `?${search}` : "";
      window.history.replaceState(null, "", `${pathname}${query}`);
    },
    [pathname]
  );

  // Parse initial query params on mount
  useEffect(() => {
    if (initialParamsHandledRef.current || typeof window === "undefined") return;
    initialParamsHandledRef.current = true;

    const sp = new URLSearchParams(window.location.search);
    const cat = sp.get("category");
    const dist = sp.get("district");
    const st = sp.get("state");
    const city = sp.get("city");
    const qParam = sp.get("q");
    const selId = sp.get("selectedId") || sp.get("place") || sp.get("temple");

    if (cat && (cat === "all" || MAP_CATEGORIES.some((c) => c.id === cat.toLowerCase()))) {
      setFilterCategory(cat.toLowerCase());
    }

    if (city) {
      const bound = getLocalityBoundary(city);
      setActiveLocation({
        type: "city",
        name: city,
        district: dist || undefined,
        state: st || bound?.parent?.split(",")?.[1]?.trim(),
        lat: bound?.center.lat || 15.335,
        lng: bound?.center.lng || 76.46,
        zoom: bound?.recommendedZoom || 13.5,
      });
    } else if (dist) {
      const bound = getDistrictBoundary(dist);
      setActiveLocation({
        type: "district",
        name: dist,
        state: st || bound?.parent,
        lat: bound?.center.lat || 13.9299,
        lng: bound?.center.lng || 75.5681,
        zoom: bound?.recommendedZoom || 10.2,
      });
    } else if (st) {
      const bound = getStateBoundary(st);
      setActiveLocation({
        type: "state",
        name: bound?.name || st,
        lat: bound?.center.lat || 20.5937,
        lng: bound?.center.lng || 78.9629,
        zoom: bound?.recommendedZoom || 7,
      });
    }

    if (qParam) setQ(qParam);
    if (selId) setSelectedId(selId);
  }, []);

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
      const raw = localStorage.getItem("tem_saved");
      const list: string[] = raw ? JSON.parse(raw) : [];
      const updated = nextSaved
        ? [...new Set([...list, slug])]
        : list.filter((s) => s !== slug && s !== selected.id);
      localStorage.setItem("tem_saved", JSON.stringify(updated));
      setSavedStatus(nextSaved);

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
        updateUrlParams({ selectedId: null });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [updateUrlParams]);

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
              "CAVES", "#854D0E",
              "HILLS", "#0D9488",
              "WATERFALLS", "#06B6D4",
              "LAKES", "#0284C7",
              "NATURE", "#10B981",
              "BEACHES", "#0284C7",
              "BEACH", "#0284C7",
              "WILDLIFE", "#16A34A",
              "PARKS", "#059669",
              "FAMILY", "#6366F1",
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
          updateUrlParams({ selectedId: props.id });
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
  }, [currentStyle, selectedId, updateUrlParams]);

  // Update layer styles & halo whenever selectedId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("unclustered-point")) return;

    try {
      if (map.getLayer("selected-point-halo")) {
        map.setFilter("selected-point-halo", [
          "all",
          ["!", ["has", "point_count"]],
          ["==", ["get", "id"], selectedId || ""],
        ]);
      }

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

  // Viewport Data Engine with Category and Administrative Filters
  const fetchViewportTemples = useCallback(
    async (
      mapInstance?: maplibregl.Map,
      overrideCategory?: string,
      overrideLocation?: ActiveLocationFilter | null,
      shouldFitBounds = false,
      isBboxScope = false
    ) => {
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

        const cat = overrideCategory !== undefined ? overrideCategory : filterCategory;
        const loc = overrideLocation !== undefined ? overrideLocation : activeLocation;

        const params = new URLSearchParams({
          bbox,
          category: cat,
          limit: "250",
        });

        if (cat === "verified") {
          params.set("verifiedOnly", "true");
          params.set("category", "ALL");
        } else if (cat !== "all" && !loc && !isBboxScope) {
          params.set("allIndia", "true");
        }

        if (loc) {
          if (loc.type === "district") {
            params.set("district", loc.name);
          } else if (loc.type === "city") {
            params.set("city", loc.name);
          } else if (loc.type === "state") {
            params.set("state", loc.name);
          }
          if (loc.state && loc.type !== "state") {
            params.set("state", loc.state);
          }
        }

        const response = await fetch(`/api/map/viewport?${params.toString()}`, {
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

        // Fit map bounds to encompass all returned category points if requested
        if (shouldFitBounds && collection.features.length > 0) {
          let [minLng, minLat, maxLng, maxLat] = collection.metadata?.bbox || [
            Infinity,
            Infinity,
            -Infinity,
            -Infinity,
          ];
          if (minLng === Infinity) {
            for (const f of collection.features) {
              const [lng, lat] = f.geometry.coordinates;
              if (lng < minLng) minLng = lng;
              if (lat < minLat) minLat = lat;
              if (lng > maxLng) maxLng = lng;
              if (lat > maxLat) maxLat = lat;
            }
          }

          if (minLng !== Infinity && (minLng !== maxLng || minLat !== maxLat)) {
            const prefersReduced =
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            map.fitBounds(
              [
                [minLng, minLat],
                [maxLng, maxLat],
              ],
              {
                padding: {
                  top: 80,
                  bottom: 80,
                  left: leftPanelOpen ? 340 : 80,
                  right: sidebarOpen ? 400 : 80,
                },
                maxZoom: 12,
                duration: prefersReduced ? 100 : 900,
              }
            );
          } else if (collection.features.length === 1) {
            const [lng, lat] = collection.features[0].geometry.coordinates;
            map.flyTo({
              center: [lng, lat],
              zoom: 12,
              duration: 800,
            });
          }
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
            city: props.city,
            district: props.district || props.city,
            state: props.state,
            stateCode: props.stateCode,
            image: props.imageReference,
            verified: props.isVerified,
            isInside: props.isInside,
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
    },
    [filterCategory, activeLocation, leftPanelOpen, sidebarOpen, setupLayers]
  );

  // Synchronize category filter with Next.js navigation and URL searchParams
  useEffect(() => {
    const cat = searchParams.get("category")?.toLowerCase();
    const validCat = cat && (cat === "all" || MAP_CATEGORIES.some((c) => c.id === cat)) ? cat : "all";
    if (validCat !== filterCategory) {
      setFilterCategory(validCat);
      if (mapRef.current) {
        void fetchViewportTemples(mapRef.current, validCat, activeLocation, validCat !== "all");
      }
    }
  }, [searchParams, filterCategory, activeLocation, fetchViewportTemples]);

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
      const initCenter: [number, number] = activeLocation
        ? [activeLocation.lng, activeLocation.lat]
        : [DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat];
      const initZoom = activeLocation?.zoom || DEFAULT_MAP_CENTER.zoom;

      map = new maplibregl.Map({
        container,
        style: styleUrl,
        center: initCenter,
        zoom: initZoom,
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
      const initialCat = searchParams.get("category")?.toLowerCase() || filterCategory;
      const initialFit = initialCat !== "all";
      void fetchViewportTemples(map, initialCat, activeLocation, initialFit);
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
          void fetchViewportTemples(mapRef.current, undefined, undefined, false, true);
        }
      }, 700);
    });

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
  }, [mapRetryCount, currentStyle]); // intentionally minimal to avoid map recreation

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

  // Category Switch Handler with Canonical URL State
  const handleSelectCategory = (catId: string) => {
    setFilterCategory(catId);
    updateUrlParams({ category: catId === "all" ? null : catId });
    if (mapRef.current) {
      void fetchViewportTemples(mapRef.current, catId, activeLocation, catId !== "all");
    }
  };

  // Location Clear Handler
  const handleClearLocation = () => {
    setActiveLocation(null);
    updateUrlParams({ district: null, state: null, city: null });
    if (mapRef.current) {
      void fetchViewportTemples(mapRef.current, filterCategory, null);
    }
  };

  // Clear All Filters Handler
  const handleClearAllFilters = () => {
    setFilterCategory("all");
    setActiveLocation(null);
    setSelectedId(null);
    setQ("");
    updateUrlParams({
      category: null,
      district: null,
      state: null,
      city: null,
      q: null,
      selectedId: null,
    });
    if (mapRef.current) {
      void fetchViewportTemples(mapRef.current, "all", null);
    }
  };

  // Reset to National Map of India
  const handleResetToIndia = () => {
    const map = mapRef.current;
    if (!map) return;
    handleClearLocation();
    map.flyTo({
      center: [DEFAULT_MAP_CENTER.lng, DEFAULT_MAP_CENTER.lat],
      zoom: DEFAULT_MAP_CENTER.zoom,
      bearing: 0,
      pitch: 0,
      speed: 1.2,
      essential: true,
    });
  };

  // Reset Orientation (North Up)
  const handleResetOrientation = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ bearing: 0, pitch: 0, duration: 350 });
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
              <div class="relative flex h-6 w-6 items-center justify-center">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span class="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-sky-500 shadow-md"></span>
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
        setUserLocationMessage(err.message || "Unable to acquire location.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Hierarchical Search Autocomplete (Destinations, Localities, Districts, States)
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        const results: Suggestion[] = [];

        // 1. States / UTs
        if (Array.isArray(data.states)) {
          for (const s of data.states) {
            results.push({
              type: "state",
              title: s.name,
              subtitle: `State · Republic of India`,
              lat: s.latitude,
              lng: s.longitude,
              zoom: s.zoom || 7,
            });
          }
        }

        // 2. Districts
        if (Array.isArray(data.districts)) {
          for (const d of data.districts) {
            results.push({
              type: "district",
              title: d.name,
              subtitle: `District · ${d.state}`,
              state: d.state,
              lat: d.latitude,
              lng: d.longitude,
              zoom: d.zoom || 10.2,
            });
          }
        }

        // 3. Localities / Cities
        if (Array.isArray(data.localities)) {
          for (const loc of data.localities) {
            results.push({
              type: "locality",
              title: loc.name,
              subtitle: `Locality · ${loc.parent}`,
              lat: loc.latitude,
              lng: loc.longitude,
              zoom: loc.zoom || 13.5,
            });
          }
        }

        // 4. Exact Destinations (Places & Temples)
        if (Array.isArray(data.destinations)) {
          for (const dest of data.destinations.slice(0, 6)) {
            const visual = getCategoryVisual(dest.category);
            results.push({
              type: "destination",
              title: dest.name,
              subtitle: `${visual.label} · ${[dest.district, dest.state].filter(Boolean).join(", ")}`,
              category: dest.category,
              slug: dest.slug,
              id: dest.id,
              lat: dest.latitude,
              lng: dest.longitude,
              zoom: 15.5,
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

  // Handle Suggestion Selection with Zoom & Boundary Animation
  const handleSelectSuggestion = async (s: Suggestion) => {
    setSuggestOpen(false);
    setQ(s.title);

    const map = mapRef.current;
    if (!map) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (s.type === "destination") {
      if (s.id) {
        setSelectedId(s.id);
        updateUrlParams({ selectedId: s.id, q: null });
      }
      if (s.lat && s.lng) {
        map.flyTo({
          center: [s.lng, s.lat],
          zoom: s.zoom || 15.5,
          speed: prefersReduced ? 5.0 : 1.3,
          essential: true,
        });
        void fetchViewportTemples(map);
      }
    } else if (s.type === "district") {
      const newLoc: ActiveLocationFilter = {
        type: "district",
        name: s.title,
        state: s.state,
        lat: s.lat || 13.9299,
        lng: s.lng || 75.5681,
        zoom: s.zoom || 10.2,
      };
      setActiveLocation(newLoc);
      updateUrlParams({
        district: s.title,
        state: s.state || null,
        city: null,
        q: null,
      });

      if (s.lat && s.lng) {
        map.flyTo({
          center: [s.lng, s.lat],
          zoom: s.zoom || 10.2,
          speed: prefersReduced ? 5.0 : 1.2,
          essential: true,
        });
      }
      void fetchViewportTemples(map, filterCategory, newLoc);
    } else if (s.type === "locality") {
      const newLoc: ActiveLocationFilter = {
        type: "city",
        name: s.title,
        lat: s.lat || 15.335,
        lng: s.lng || 76.46,
        zoom: s.zoom || 13.5,
      };
      setActiveLocation(newLoc);
      updateUrlParams({
        city: s.title,
        district: null,
        state: null,
        q: null,
      });

      if (s.lat && s.lng) {
        map.flyTo({
          center: [s.lng, s.lat],
          zoom: s.zoom || 13.5,
          speed: prefersReduced ? 5.0 : 1.3,
          essential: true,
        });
      }
      void fetchViewportTemples(map, filterCategory, newLoc);
    } else if (s.type === "state") {
      const newLoc: ActiveLocationFilter = {
        type: "state",
        name: s.title,
        lat: s.lat || 20.5937,
        lng: s.lng || 78.9629,
        zoom: s.zoom || 7,
      };
      setActiveLocation(newLoc);
      updateUrlParams({
        state: s.title,
        district: null,
        city: null,
        q: null,
      });

      if (s.lat && s.lng) {
        map.flyTo({
          center: [s.lng, s.lat],
          zoom: s.zoom || 7,
          speed: prefersReduced ? 5.0 : 1.2,
          essential: true,
        });
      }
      void fetchViewportTemples(map, filterCategory, newLoc);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestOpen && suggestIdx >= 0 && suggestions[suggestIdx]) {
        void handleSelectSuggestion(suggestions[suggestIdx]);
      } else if (q.trim()) {
        updateUrlParams({ q: q.trim() });
        setSuggestOpen(false);
        if (mapRef.current) void fetchViewportTemples(mapRef.current);
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

  // Group items by "Inside Selected Location" vs "Nearby in Viewport"
  const hasActiveLoc = Boolean(activeLocation);
  const insideItems = hasActiveLoc ? items.filter((p) => p.isInside) : items;
  const nearbyItems = hasActiveLoc ? items.filter((p) => !p.isInside) : [];

  const selectedCatVisual = getCategoryVisual(selected?.category);
  const SelectedCatIcon = ICON_MAP[selectedCatVisual.iconName] || Compass;

  const hasAnyFilter =
    filterCategory !== "all" || activeLocation !== null || Boolean(q.trim());

  return (
    <div className="relative flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)] w-full flex-col lg:flex-row overflow-hidden bg-obsidian">
      {/* ── Mobile Tab Segmented Toggle (< lg) ── */}
      <div className="flex lg:hidden w-full items-center justify-around border-b border-line bg-obsidian-2 px-2 py-1.5 z-30 shrink-0">
        <button
          onClick={() => setActiveTab("filters")}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
            activeTab === "filters"
              ? "bg-gold text-obsidian font-semibold shadow"
              : "text-ivory-dim hover:text-ivory"
          )}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Categories</span>
          {filterCategory !== "all" && (
            <span className="h-1.5 w-1.5 rounded-full bg-gold-bright" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
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
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
            activeTab === "list"
              ? "bg-gold text-obsidian font-semibold shadow"
              : "text-ivory-dim hover:text-ivory"
          )}
        >
          <List className="h-3.5 w-3.5" />
          <span>Places ({items.length})</span>
        </button>
      </div>

      {/* ── Left Sidebar: Search, Filters & 15-Category Directory ── */}
      <aside
        className={cn(
          "flex flex-col border-line bg-obsidian-2 lg:w-[320px] lg:border-r shrink-0 transition-all z-20",
          activeTab === "filters" ? "flex flex-1 w-full" : (leftPanelOpen ? "hidden lg:flex" : "hidden")
        )}
      >
        {/* Left Panel Header */}
        <div className="border-b border-line px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/10 text-gold-bright border border-gold/30">
              <Compass className="h-4 w-4 text-gold" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-semibold text-ivory">Atlas Directory</h2>
              <p className="text-[10.5px] text-ivory-dim">Categories & Search</p>
            </div>
          </div>
          <button
            onClick={() => setLeftPanelOpen(false)}
            title="Collapse categories panel"
            aria-label="Collapse categories panel"
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-ivory-dim hover:text-ivory hover:bg-obsidian-3 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Search input with autocomplete inside the left sidebar */}
        <div className="p-3 border-b border-line space-y-2">
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-obsidian-3/80 px-3 py-2 text-xs transition-colors focus-within:border-gold/50">
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
                placeholder={
                  activeLocation
                    ? `Search in ${activeLocation.name}…`
                    : t("map_search") || "Search places, cities, states…"
                }
                className="w-full bg-transparent text-xs text-ivory placeholder-ivory-dim/60 outline-none"
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
                    updateUrlParams({ q: null });
                  }}
                  className="rounded-full p-0.5 text-ivory-dim hover:text-ivory"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown positioned relative to the search box */}
            {suggestOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-line bg-obsidian-2/98 p-1.5 shadow-2xl backdrop-blur-xl z-50">
                {suggestions.map((s, idx) => {
                  const isDestination = s.type === "destination";
                  const isDistrict = s.type === "district";
                  const isLocality = s.type === "locality";
                  const isState = s.type === "state";
                  const catVisual = getCategoryVisual(s.category);
                  const CatIcon = ICON_MAP[catVisual.iconName] || Compass;

                  return (
                    <button
                      key={`${s.type}-${s.title}-${idx}`}
                      onClick={() => {
                        void handleSelectSuggestion(s);
                        if (activeTab === "filters") setActiveTab("map");
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                        suggestIdx === idx
                          ? "bg-gold/15 text-gold-bright"
                          : "text-ivory hover:bg-obsidian-3 hover:text-gold-bright"
                      )}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold-bright">
                        {isDestination && <CatIcon className="h-3.5 w-3.5" />}
                        {isDistrict && <Compass className="h-3.5 w-3.5 text-amber-400" />}
                        {isLocality && <Building2 className="h-3.5 w-3.5 text-cyan-400" />}
                        {isState && <Globe2 className="h-3.5 w-3.5 text-emerald-400" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-semibold">{s.title}</span>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider",
                              isDestination && "bg-amber-500/15 text-amber-300",
                              isDistrict && "bg-amber-600/20 text-amber-400",
                              isLocality && "bg-cyan-500/15 text-cyan-300",
                              isState && "bg-emerald-500/15 text-emerald-300"
                            )}
                          >
                            {s.type}
                          </span>
                        </div>
                        {s.subtitle && (
                          <div className="truncate text-[10.5px] text-ivory-dim">{s.subtitle}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Filter Chips in Left Panel */}
          {hasAnyFilter && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {filterCategory !== "all" && (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/15 px-2 py-0.5 text-[10.5px] font-medium text-gold-bright">
                  <span>{MAP_CATEGORIES.find((c) => c.id === filterCategory)?.label || filterCategory}</span>
                  <button
                    onClick={() => handleSelectCategory("all")}
                    className="rounded p-0.5 hover:bg-gold/20"
                    aria-label="Remove category filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {activeLocation && (
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[10.5px] font-medium text-cyan-300">
                  <MapPin className="h-3 w-3 text-cyan-400" />
                  <span className="truncate max-w-[120px]">{activeLocation.name}</span>
                  <button
                    onClick={handleClearLocation}
                    className="rounded p-0.5 hover:bg-cyan-500/20"
                    aria-label="Remove location filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <button
                onClick={handleClearAllFilters}
                className="text-[10px] text-ivory-dim/70 hover:text-gold-bright underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Categories List (All 15 + All Destinations) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim/60 px-2 pt-1 pb-1.5 flex items-center justify-between">
            <span>Explore Categories</span>
            <span className="text-[10px] text-ivory-dim/40 font-mono">{MAP_CATEGORIES.length}</span>
          </div>

          {MAP_CATEGORIES.map((chip) => {
            const Icon = ICON_MAP[chip.iconName] || Compass;
            const isActive = filterCategory === chip.id;

            return (
              <button
                key={chip.id}
                onClick={() => {
                  handleSelectCategory(chip.id);
                  if (activeTab === "filters") setActiveTab("map");
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all text-xs group",
                  isActive
                    ? "bg-gold/15 text-gold-bright font-semibold border border-gold/40 shadow-sm"
                    : "text-ivory-dim hover:text-ivory hover:bg-obsidian-3 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105",
                      isActive
                        ? "border-gold/50 bg-gold/20 text-gold-bright"
                        : `${chip.bgClass} ${chip.borderClass} ${chip.textClass}`
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{chip.label}</span>
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer actions in Left Panel */}
        <div className="border-t border-line p-3 flex items-center justify-between text-xs bg-obsidian-3/40">
          <button
            onClick={() => handleToggleStyle(currentStyle === "liberty" ? "dark" : "liberty")}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-obsidian-2 px-2.5 py-1.5 text-[11px] text-ivory-dim hover:text-ivory hover:border-gold/30 transition-colors"
            title="Toggle Map Style"
          >
            <Layers className="h-3.5 w-3.5 text-gold" />
            <span>{currentStyle === "liberty" ? "Liberty" : "Dark"}</span>
          </button>
          <button
            onClick={handleResetToIndia}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-obsidian-2 px-2.5 py-1.5 text-[11px] text-ivory-dim hover:text-gold-bright hover:border-gold/30 transition-colors"
          >
            <Navigation2 className="h-3.5 w-3.5 text-gold" />
            <span>Reset India</span>
          </button>
        </div>
      </aside>

      {/* ── Middle Map Viewport ── */}
      <div
        className={cn(
          "relative flex-1 w-full h-full min-h-0 min-w-0 overflow-hidden",
          activeTab !== "map" && "hidden lg:block"
        )}
      >
        {/* Floating Expand Left Panel Button when collapsed on desktop */}
        {!leftPanelOpen && (
          <div className="pointer-events-none absolute top-4 left-4 z-20 hidden lg:flex">
            <button
              onClick={() => setLeftPanelOpen(true)}
              title="Show Categories & Filters"
              aria-label="Show Categories & Filters"
              className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-line bg-obsidian-2/95 px-3.5 py-2 text-xs font-semibold text-gold-bright shadow-2xl backdrop-blur-md transition-all hover:border-gold hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
              <span>Categories</span>
              {filterCategory !== "all" && (
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-gold-bright">
                  {MAP_CATEGORIES.find((c) => c.id === filterCategory)?.label || filterCategory}
                </span>
              )}
            </button>
          </div>
        )}

        {/* "Search This Area" Floating Pill */}
        {showAreaSearchPill && !loading && (
          <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center">
            <button
              onClick={() => void fetchViewportTemples(undefined, undefined, undefined, false, true)}
              disabled={loading}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-gold/40 bg-obsidian-2/95 px-4 py-2 text-xs font-semibold text-gold-bright shadow-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Compass className="h-3.5 w-3.5 text-gold animate-spin duration-3000" />
              <span>Search This Area</span>
            </button>
          </div>
        )}
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
                className="rounded-xl border border-line bg-obsidian-3 px-4 py-2 text-xs font-semibold text-ivory hover:border-gold transition-colors"
              >
                Open List View
              </button>
            </div>
          </div>
        )}

        {/* User Location Error Message */}
        {userLocationMessage && (
          <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
            <div className="pointer-events-auto rounded-xl border border-amber-500/40 bg-obsidian-2/95 px-3.5 py-2 text-xs text-amber-300 shadow-xl backdrop-blur-md">
              {userLocationMessage}
            </div>
          </div>
        )}

        {/* Selected Destination Card (Desktop Floating Bottom-Left / Mobile Drawer) */}
        {selected && (
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 flex justify-center sm:justify-start lg:right-auto">
            <div className="pointer-events-auto w-full max-w-md rounded-3xl border border-line bg-obsidian-2/95 p-4 shadow-2xl backdrop-blur-xl transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Photo Thumbnail */}
                  {resolvedMedia?.src ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolvedMedia.src}
                        alt={selected.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border", selectedCatVisual.bgClass, selectedCatVisual.borderClass)}>
                      <SelectedCatIcon className={cn("h-7 w-7", selectedCatVisual.textClass)} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold border", selectedCatVisual.bgClass, selectedCatVisual.textClass, selectedCatVisual.borderClass)}>
                        {selected.category || "SANCTUARY"}
                      </span>
                      {selected.verified && (
                        <span className="flex items-center gap-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified</span>
                        </span>
                      )}
                      {selected.isInside && activeLocation && (
                        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[9.5px] font-medium text-cyan-300">
                          Inside {activeLocation.name}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-serif text-base font-semibold text-ivory truncate">
                      {selected.name}
                    </h3>
                    <p className="text-xs text-ivory-dim truncate">
                      {[selected.district, selected.state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedId(null);
                    updateUrlParams({ selectedId: null });
                  }}
                  className="rounded-full p-1 text-ivory-dim hover:bg-obsidian-3 hover:text-ivory"
                  aria-label="Close card"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Expanded details */}
              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-line/50">
                {selected.href && (
                  <Link
                    href={selected.href}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold px-3.5 py-2 text-xs font-semibold text-obsidian shadow-md hover:bg-gold-bright transition-colors"
                  >
                    <span>View Full Details</span>
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
                  aria-label={savedStatus ? "Saved" : "Save destination"}
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
            <button
              onClick={() => mapRef.current?.zoomIn()}
              title="Zoom In"
              aria-label="Zoom In"
              className="flex h-9 w-9 items-center justify-center text-ivory-dim transition-colors hover:bg-obsidian-3 hover:text-gold-bright active:scale-95"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="h-[1px] w-full bg-line" />

            <button
              onClick={() => mapRef.current?.zoomOut()}
              title="Zoom Out"
              aria-label="Zoom Out"
              className="flex h-9 w-9 items-center justify-center text-ivory-dim transition-colors hover:bg-obsidian-3 hover:text-gold-bright active:scale-95"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="h-[1px] w-full bg-line" />

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
              <span>Destinations ({items.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Places Panel (Desktop right side / Mobile Places tab) */}
      <aside
        className={cn(
          "flex flex-col border-line bg-obsidian-2 lg:w-[380px] xl:w-[400px] lg:border-l shrink-0 transition-all z-20",
          activeTab === "list" ? "flex flex-1 w-full" : (sidebarOpen ? "hidden lg:flex" : "hidden")
        )}
      >
        {/* Header summary */}
        <div className="border-b border-line px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-sm font-semibold text-ivory flex items-center gap-1.5">
                <span>{MAP_CATEGORIES.find((c) => c.id === filterCategory)?.label || "Sacred Atlas"}</span>
                {activeLocation && (
                  <span className="text-gold-bright font-normal text-xs">
                    · {activeLocation.name}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-ivory-dim">
                {loading
                  ? "Querying verified geospatial nodes…"
                  : `${items.length} verified destinations in view`}
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
        </div>

        {/* Sanctuary Cards List with Inside vs Nearby Sectioning */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-ivory-dim">
              <MapPin className="h-8 w-8 text-gold/30 mb-2" />
              <p className="text-xs">No destinations found in this view.</p>
              <p className="text-[10px] text-ivory-dim/60 mt-1">
                Try zooming out, clearing location filters, or selecting All Destinations.
              </p>
            </div>
          )}

          {/* If Active Location is set, render "Inside" section first */}
          {hasActiveLoc && insideItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                <MapPin className="h-3 w-3" />
                <span>Inside {activeLocation?.name} ({insideItems.length})</span>
              </div>
              <div className="space-y-2">
                {insideItems.map((p) => renderCard(p))}
              </div>
            </div>
          )}

          {/* Nearby Section when Active Location is set */}
          {hasActiveLoc && nearbyItems.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gold-dim">
                <Compass className="h-3 w-3" />
                <span>Nearby in Viewport ({nearbyItems.length})</span>
              </div>
              <div className="space-y-2">
                {nearbyItems.map((p) => renderCard(p))}
              </div>
            </div>
          )}

          {/* Unified list if no active location is set */}
          {!hasActiveLoc && (
            <div className="space-y-2">
              {items.map((p) => renderCard(p))}
            </div>
          )}
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

  function renderCard(p: MapPlaceItem) {
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
          updateUrlParams({ selectedId: p.id });
          const map = mapRef.current;
          if (map) {
            const prefersReduced =
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
          "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all",
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
  }
}