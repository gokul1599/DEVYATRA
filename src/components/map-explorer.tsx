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
import type { DiscoveryResult } from "@/lib/google/types";
import {
  DEFAULT_MAP_CENTER,
  assessLocationQuality,
  type LocationQualityAssessment,
} from "@/lib/map/location-quality";
import { type DestinationGeoJSONFeature } from "@/lib/map/geojson";
import { loadGoogleMaps } from "@/lib/map/google-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

interface Suggestion {
  type: "place" | "temple" | "query";
  placeId?: string;
  text: string;
  lat?: number;
  lng?: number;
  id?: string;
}

export interface MapPlaceItem {
  id: string;
  name: string;
  category?: string;
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
  googlePlaceId?: string;
  googleMapsUri?: string;
}

export function MapExplorer() {
  const { t } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersMapRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const searchPinRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const acServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  const [activeTab, setActiveTab] = useState<"map" | "list">("map");
  const [items, setItems] = useState<MapPlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [mode, setMode] = useState<DiscoveryResult["mode"] | null>(null);
  const [stale, setStale] = useState(false);

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

  const selected = (Array.isArray(items) ? items : []).find((i) => i.id === selectedId) ?? null;

  const selectedQuality: LocationQualityAssessment | null = selected
    ? assessLocationQuality({
        latitude: selected.latitude,
        longitude: selected.longitude,
        verificationStatus: selected.verified ? "VERIFIED_OFFICIAL" : selected.source === "verified" ? "VERIFIED_OFFICIAL" : "VERIFIED_SOURCE",
        sourceType: selected.source,
        googlePlaceId: selected.googlePlaceId,
      })
    : null;

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

      const newPlaces: MapPlaceItem[] = data.features
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
          address: feature.properties.address || null,
          district: feature.properties.district || null,
          state: feature.properties.state || null,
          stateCode: feature.properties.stateCode || null,
          image: feature.properties.imageReference || null,
          verified:
            feature.properties.verificationStatus === "VERIFIED_OFFICIAL" ||
            feature.properties.verificationStatus === "VERIFIED_COMMUNITY",
          source: feature.properties.sourceType === "verified" ? "verified" : "google",
          certainty: "temple",
          href: feature.properties.href || null,
          googleMapsUri: feature.properties.googlePlaceId
            ? `https://www.google.com/maps/place/?q=place_id:${feature.properties.googlePlaceId}`
            : `https://www.google.com/maps/search/?api=1&query=${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}`,
        }));

      setItems(newPlaces);
      setMode("live");
      setStale(false);
      setDataError(null);
      setShowAreaSearchPill(false);
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      console.warn("[MapExplorer] Viewport sync degraded:", err);
      setDataError("Unable to update live sacred sites in this viewport.");
    }
  }, []);

  // Open Google Maps InfoWindow for a place
  const openInfoWindowForPlace = useCallback((place: MapPlaceItem, marker: google.maps.Marker) => {
    const map = googleMapRef.current;
    if (!map) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    const info = infoWindowRef.current;
    const destUrl = place.href || (place.state && place.id ? `/temples` : null);
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

    const locationText = [place.district, place.state].filter(Boolean).join(", ") || "India";

    const contentString = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px; max-width: 280px; color: #1a1a1a;">
        ${place.image ? `
          <div style="width: 100%; height: 120px; overflow: hidden; border-radius: 8px; margin-bottom: 8px; background: #222;">
            <img src="${place.image}" alt="${place.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
          </div>
        ` : ''}
        <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #111; line-height: 1.3;">
          ${place.name}
        </h4>
        <div style="display: inline-block; font-size: 11px; font-weight: 600; color: #b45309; background: #fef3c7; padding: 2px 6px; border-radius: 4px; margin-bottom: 6px;">
          🛕 ${place.category || "Sacred Sanctuary"}
        </div>
        <div style="font-size: 12px; color: #555; margin-bottom: 10px; display: flex; align-items: center; gap: 4px;">
          📍 ${locationText}
        </div>
        <div style="display: flex; gap: 8px; margin-top: 6px;">
          ${destUrl ? `
            <a href="${destUrl}" style="flex: 1; text-align: center; background: #C8A24B; color: #0D0B09; font-weight: 600; font-size: 12px; padding: 6px 10px; border-radius: 6px; text-decoration: none; transition: background 0.2s;">
              View Details
            </a>
          ` : ''}
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; gap: 4px; background: #f1f3f4; color: #3c4043; font-weight: 600; font-size: 12px; padding: 6px 10px; border-radius: 6px; text-decoration: none; border: 1px solid #dadce0;">
            Directions ↗
          </a>
        </div>
      </div>
    `;

    info.setContent(contentString);
    info.open(map, marker);
  }, []);

  // Update Markers and Clusters
  useEffect(() => {
    const map = googleMapRef.current;
    const clusterer = clustererRef.current;
    if (!map || !clusterer) return;

    const existingMarkers = markersMapRef.current;
    const currentPlaceIds = new Set(filteredItems.map((p) => p.id));

    // Remove markers that are no longer in filtered list
    existingMarkers.forEach((marker, id) => {
      if (!currentPlaceIds.has(id)) {
        clusterer.removeMarker(marker);
        marker.setMap(null);
        existingMarkers.delete(id);
      }
    });

    const newMarkersToAdd: google.maps.Marker[] = [];

    // Custom SVG Temple Pin with pointed anchor
    const createTempleIcon = (isExact: boolean, isSelected: boolean) => ({
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 38 48">
          <defs>
            <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.45"/>
            </filter>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${isSelected ? '#FFFFFF' : isExact ? '#F59E0B' : '#EA580C'}" />
              <stop offset="100%" stop-color="${isSelected ? '#C8A24B' : isExact ? '#B45309' : '#C2410C'}" />
            </linearGradient>
          </defs>
          <path d="M19 0 C8.5 0 0 8.5 0 19 C0 30 19 48 19 48 C19 48 38 30 38 19 C38 8.5 29.5 0 19 0 Z" fill="url(#g1)" filter="url(#sh)" stroke="#FFFFFF" stroke-width="2" />
          <circle cx="19" cy="18" r="12" fill="#1C1812" />
          <text x="19" y="23" font-size="13" text-anchor="middle" fill="#FFFFFF">🛕</text>
        </svg>
      `)}`,
      scaledSize: isSelected ? new google.maps.Size(42, 53) : new google.maps.Size(34, 43),
      anchor: isSelected ? new google.maps.Point(21, 53) : new google.maps.Point(17, 43),
    });

    for (const place of filteredItems) {
      const isExact = Boolean(place.verified || place.source === "verified");
      const isSelected = selectedId === place.id;

      if (existingMarkers.has(place.id)) {
        const marker = existingMarkers.get(place.id)!;
        marker.setIcon(createTempleIcon(isExact, isSelected));
        marker.setZIndex(isSelected ? 9999 : isExact ? 100 : 50);
        continue;
      }

      const marker = new google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude },
        title: place.name,
        icon: createTempleIcon(isExact, isSelected),
        zIndex: isExact ? 100 : 50,
      });

      marker.addListener("click", () => {
        setSelectedId(place.id);
        openInfoWindowForPlace(place, marker);
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
  }, [filteredItems, selectedId, openInfoWindowForPlace]);

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
          const mapOptions: google.maps.MapOptions = {
            center: { lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng },
            zoom: DEFAULT_MAP_CENTER.zoom,
            mapTypeId: googleMaps.MapTypeId.ROADMAP,
            // Native Google Controls
            zoomControl: true,
            zoomControlOptions: {
              position: googleMaps.ControlPosition.RIGHT_BOTTOM,
            },
            mapTypeControl: true,
            mapTypeControlOptions: {
              style: googleMaps.MapTypeControlStyle.DROPDOWN_MENU,
              position: googleMaps.ControlPosition.TOP_LEFT,
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
            rotateControl: true,
            clickableIcons: true,
          };

          const map = new googleMaps.Map(container, mapOptions);
          googleMapRef.current = map;

          // Services for Places & Geocoding
          if (googleMaps.Geocoder) {
            geocoderRef.current = new googleMaps.Geocoder();
          }
          if (googleMaps.places?.AutocompleteService) {
            acServiceRef.current = new googleMaps.places.AutocompleteService();
          }

          // Initialize MarkerClusterer with standard Google Markers
          const clusterer = new MarkerClusterer({
            map,
            markers: [],
          });
          clustererRef.current = clusterer;

          // Click on map closes active InfoWindow
          map.addListener("click", () => {
            if (infoWindowRef.current) {
              infoWindowRef.current.close();
            }
          });

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
            }, 800);
          });

          // Initial load triggers initial national viewport query
          void fetchViewportTemples(map);
          setLoading(false);

          // Hook Google Maps authentication or API activation failure
          window.gm_authFailure = () => {
            console.warn("[MapExplorer] Google Maps API Authentication/Activation Failure detected.");
            if (!cancelled) {
              setLoading(false);
              setMapError("auth_failure");
            }
          };

          // ResizeObserver
          if (typeof ResizeObserver !== "undefined") {
            const ro = new ResizeObserver(() => {
              if (googleMapRef.current && !cancelled) {
                google.maps.event.trigger(googleMapRef.current, "resize");
              }
            });
            ro.observe(container);
            resizeObserverRef.current = ro;
          }
        } catch (err) {
          console.error("[MapExplorer] Google Maps initialization error:", err);
          if (!cancelled) {
            setLoading(false);
            setMapError("Failed to initialize Google Maps explorer.");
          }
        }
      })
      .catch((err) => {
        console.error("[MapExplorer] Failed to load Google Maps SDK:", err);
        if (!cancelled) {
          setLoading(false);
          const msg = (err as Error)?.message;
          setMapError(msg === "auth_failure" ? "auth_failure" : "Google Maps is temporarily unavailable. Using list explorer instead.");
        }
      });

    return () => {
      cancelled = true;

      if (viewportAbortRef.current) {
        viewportAbortRef.current.abort();
        viewportAbortRef.current = null;
      }

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
        marker.setMap(null);
      });
      markersMap.clear();

      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }

      if (searchPinRef.current) {
        searchPinRef.current.setMap(null);
        searchPinRef.current = null;
      }

      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }

      googleMapRef.current = null;
      setMapReady(false);
    };
  }, [mapRetryCount, fetchViewportTemples]);

  // Search Area Trigger
  const handleSearchThisArea = () => {
    const map = googleMapRef.current;
    if (!map) return;
    setShowAreaSearchPill(false);
    void fetchViewportTemples(map);
  };

  // Reset to National India View
  const resetToIndia = () => {
    const map = googleMapRef.current;
    if (!map) return;
    map.panTo({ lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng });
    map.setZoom(DEFAULT_MAP_CENTER.zoom);
    setShowAreaSearchPill(false);
    void fetchViewportTemples(map);
  };

  // User Geolocation
  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = googleMapRef.current;
        if (!map) return;

        const userPos = { lat: latitude, lng: longitude };
        map.panTo(userPos);
        map.setZoom(15);

        if (userMarkerRef.current) {
          userMarkerRef.current.setPosition(userPos);
        } else {
          userMarkerRef.current = new google.maps.Marker({
            position: userPos,
            map,
            title: "Your Location",
            zIndex: 10000,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 3,
            },
          });
        }

        void fetchViewportTemples(map);
      },
      (err) => {
        console.warn("[MapExplorer] Geolocation denied or error:", err);
        alert("Location access was denied. You can search any place, road, or city above.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Autocomplete search handler
  useEffect(() => {
    const trimmed = q.trim();
    const timer = setTimeout(() => {
      if (trimmed.length < 2) {
        setAc([]);
        return;
      }

      // 1. Search local temples first for instantaneous results
      const localMatches: Suggestion[] = filteredItems
        .filter((item) => item.name.toLowerCase().includes(trimmed.toLowerCase()))
        .slice(0, 3)
        .map((item) => ({
          type: "temple" as const,
          id: item.id,
          text: `🛕 ${item.name} (${item.district || item.state || "India"})`,
          lat: item.latitude,
          lng: item.longitude,
        }));

      // 2. Query Google Places Autocomplete in browser if available
      if (acServiceRef.current && window.google?.maps?.places?.PlacesServiceStatus) {
        acServiceRef.current.getPlacePredictions(
          {
            input: trimmed,
            componentRestrictions: { country: "in" },
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              const googleMatches: Suggestion[] = predictions.slice(0, 5).map((p) => ({
                type: "place" as const,
                placeId: p.place_id,
                text: p.description,
              }));
              setAc([...localMatches, ...googleMatches]);
              setAcOpen(true);
            } else {
              setAc(localMatches);
              if (localMatches.length > 0) setAcOpen(true);
            }
          }
        );
      } else {
        // Fallback to server autocomplete API
        fetch(`/api/places/autocomplete?q=${encodeURIComponent(trimmed)}&_t=${Date.now()}`)
          .then((r) => r.json())
          .then((data: { suggestions?: Suggestion[] }) => {
            const apiSuggestions = data.suggestions || [];
            setAc([...localMatches, ...apiSuggestions]);
            setAcOpen(true);
          })
          .catch(() => {
            setAc(localMatches);
            if (localMatches.length > 0) setAcOpen(true);
          });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [q, filteredItems]);

  // Navigate to Selected Place / Location / Road
  const goToPlace = (sug: Suggestion) => {
    setAcOpen(false);
    setQ(sug.text.replace(/^🛕\s*/, ""));
    const map = googleMapRef.current;
    if (!map) return;

    // 1. If it's a temple
    if (sug.type === "temple" && sug.lat && sug.lng) {
      map.panTo({ lat: sug.lat, lng: sug.lng });
      map.setZoom(16);
      if (sug.id) {
        setSelectedId(sug.id);
        const marker = markersMapRef.current.get(sug.id);
        const place = items.find((i) => i.id === sug.id);
        if (marker && place) {
          openInfoWindowForPlace(place, marker);
        }
      }
      return;
    }

    // 2. If it has a Google Place ID
    if (sug.placeId && geocoderRef.current) {
      geocoderRef.current.geocode({ placeId: sug.placeId }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          if (results[0].geometry.viewport) {
            map.fitBounds(results[0].geometry.viewport);
          } else {
            map.panTo(loc);
            map.setZoom(15);
          }

          // Place search marker
          if (searchPinRef.current) {
            searchPinRef.current.setPosition(loc);
            searchPinRef.current.setMap(map);
          } else {
            searchPinRef.current = new google.maps.Marker({
              position: loc,
              map,
              title: sug.text,
              animation: google.maps.Animation.DROP,
            });
          }

          void fetchViewportTemples(map);
        }
      });
      return;
    }

    // 3. Fallback text geocode
    if (geocoderRef.current) {
      geocoderRef.current.geocode({ address: sug.text, componentRestrictions: { country: "IN" } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          if (results[0].geometry.viewport) {
            map.fitBounds(results[0].geometry.viewport);
          } else {
            map.panTo(loc);
            map.setZoom(14);
          }
          void fetchViewportTemples(map);
        }
      });
    }
  };

  // Handle Search Input Keydown (Enter key)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (ac.length > 0 && acIdx >= 0 && ac[acIdx]) {
        goToPlace(ac[acIdx]);
      } else if (ac.length > 0 && ac[0]) {
        goToPlace(ac[0]);
      } else if (q.trim() && geocoderRef.current && googleMapRef.current) {
        setAcOpen(false);
        const map = googleMapRef.current;
        geocoderRef.current.geocode(
          { address: q.trim(), componentRestrictions: { country: "IN" } },
          (results, status) => {
            if (status === "OK" && results && results[0]) {
              const loc = results[0].geometry.location;
              if (results[0].geometry.viewport) {
                map.fitBounds(results[0].geometry.viewport);
              } else {
                map.panTo(loc);
                map.setZoom(14);
              }
              void fetchViewportTemples(map);
            }
          }
        );
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setAcIdx((prev) => (prev < ac.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAcIdx((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Escape") {
      setAcOpen(false);
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)] w-full flex-col lg:flex-row overflow-hidden bg-obsidian">
      {/* Top Floating Controls Rail */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-col gap-2 px-3 sm:px-6">
        <div className="pointer-events-auto mx-auto flex w-full max-w-xl items-center gap-2">
          {/* Autocomplete Search Bar */}
          <div className="relative flex-1">
            <div className="glass flex items-center gap-2 rounded-2xl border border-line px-3.5 py-2.5 shadow-2xl transition-colors focus-within:border-gold/50 bg-obsidian-2/95">
              <Search className="h-4 w-4 shrink-0 text-gold-dim" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleSearchKeyDown}
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
              <div className="glass absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-2xl border border-line p-1 shadow-2xl backdrop-blur-xl bg-obsidian-2/98">
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

          {/* Toggle Map vs List on Mobile / Tablet */}
          <div className="flex shrink-0 items-center rounded-2xl border border-line bg-obsidian-2/95 p-1 lg:hidden shadow-xl">
            <button
              onClick={() => setActiveTab("map")}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                activeTab === "map"
                  ? "bg-gold text-obsidian font-semibold"
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
                  ? "bg-gold text-obsidian font-semibold"
                  : "text-ivory-dim hover:text-ivory"
              )}
            >
              <List className="h-3.5 w-3.5" />
              <span>List ({filteredItems.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Filters Pill Bar */}
        <div className="pointer-events-auto mx-auto flex w-full max-w-2xl items-center justify-between gap-2 overflow-x-auto py-0.5 scrollbar-none">
          {[
            { id: "all", label: "All Sanctuaries" },
            { id: "verified", label: "Verified Only" },
            { id: "open", label: "Open Now" },
            { id: "heritage", label: "Heritage / Jyotirlinga" },
            { id: "nature", label: "Ghats & Rivers" },
            { id: "food_stay", label: "Annakshetra & Stay" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as typeof filterCategory)}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium transition-all shadow-md",
                filterCategory === cat.id
                  ? "bg-gold text-obsidian font-semibold"
                  : "bg-obsidian-2/90 border border-line text-ivory-dim hover:border-gold/40 hover:text-ivory"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* "Search This Area" Floating Pill */}
      {showAreaSearchPill && !loading && (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-20 flex justify-center">
          <button
            onClick={handleSearchThisArea}
            disabled={loading}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-gold/40 bg-obsidian-2/95 px-4 py-2 text-xs font-semibold text-gold-bright shadow-2xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Compass className="h-3.5 w-3.5 animate-spin duration-3000" />
            <span>Search This Area</span>
          </button>
        </div>
      )}

      {/* Main Map Viewport */}
      <div
        className={cn(
          "relative flex-1 w-full h-full",
          activeTab === "list" && "hidden lg:block"
        )}
      >
        {/* Genuine Google Maps Canvas */}
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          role="region"
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 mb-4 border border-amber-500/30">
              <MapIcon className="h-7 w-7" />
            </div>

            {mapError === "auth_failure" ? (
              <div className="max-w-md space-y-3">
                <h3 className="font-display text-xl font-medium text-ivory">
                  Google Maps API Activation Required
                </h3>
                <p className="text-xs leading-relaxed text-ivory-dim">
                  Your Google Maps API key was loaded, but Google returned an authentication error because the <strong className="text-gold-bright">Maps JavaScript API</strong> is not activated on your Google Cloud project, or billing is not linked.
                </p>
                <div className="rounded-xl border border-line bg-obsidian-3/80 p-3.5 text-left space-y-2 text-[12px] text-ivory-dim">
                  <div className="font-semibold text-ivory">Quick Fix in Google Cloud Console:</div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold font-bold">1.</span>
                    <span>Click the button below to open Google Cloud Console.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold font-bold">2.</span>
                    <span>Click the blue <strong className="text-white">&quot;Enable&quot;</strong> button for <strong>Maps JavaScript API</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold font-bold">3.</span>
                    <span>Ensure billing is linked to your project (Google includes $200 monthly free credit).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gold font-bold">4.</span>
                    <span>Under Credentials &gt; Restrictions, add <code className="text-gold">https://templeora.vercel.app/*</code>.</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <a
                    href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-obsidian shadow-md hover:bg-gold-bright transition-colors"
                  >
                    <span>Enable Maps JS API in Google Cloud</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => setMapRetryCount((c) => c + 1)}
                    className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-line bg-obsidian-3 px-4 py-2.5 text-xs font-medium text-ivory hover:border-gold transition-colors"
                  >
                    Retry Map
                  </button>
                  <button
                    onClick={() => setActiveTab("list")}
                    className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-line bg-obsidian-3 px-4 py-2.5 text-xs font-medium text-ivory hover:border-gold transition-colors"
                  >
                    View List ({filteredItems.length})
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-sm space-y-2">
                <h3 className="font-display text-xl font-medium text-ivory">
                  Google Maps is temporarily unavailable
                </h3>
                <p className="text-xs leading-relaxed text-ivory-dim">
                  {mapError}
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
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
          </div>
        )}

        {/* Floating Custom Navigation Buttons (Locate Me, Reset) */}
        <div className="pointer-events-none absolute bottom-5 left-5 z-10 flex flex-col gap-2">
          <button
            onClick={locateUser}
            aria-label="Locate me"
            title="Locate me"
            className="glass pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-obsidian-2/90 text-ivory-dim shadow-xl transition-all hover:border-gold hover:text-gold-bright active:scale-95"
          >
            <Navigation2 className="h-4 w-4" />
          </button>
          <button
            onClick={resetToIndia}
            aria-label="Reset to India view"
            title="Reset to India view"
            className="glass pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-obsidian-2/90 text-ivory-dim shadow-xl transition-all hover:border-gold hover:text-gold-bright active:scale-95"
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

        {/* Stale / Degraded Cache Banner */}
        {stale && !mapError && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
            <div className="pointer-events-auto flex max-w-md items-center gap-2 rounded-2xl border border-amber-500/30 bg-obsidian-3/95 px-4 py-2.5 text-xs text-ivory shadow-2xl backdrop-blur-md">
              <WifiOff className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Showing cached sanctuary coordinates for uninterrupted navigation.</span>
            </div>
          </div>
        )}
      </div>

      {/* Side Sanctuary Drawer (Desktop) & List View (Mobile) */}
      <aside
        className={cn(
          "flex flex-col border-line bg-obsidian-2 lg:w-[380px] lg:border-l shrink-0",
          activeTab === "map" && "hidden lg:flex",
          activeTab === "list" && "flex flex-1"
        )}
      >
        {/* Header summary */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <div>
            <h2 className="font-serif text-sm font-semibold text-ivory">
              {filterCategory === "all"
                ? "Sacred Atlas"
                : filterCategory === "verified"
                ? "Verified Sanctuaries"
                : filterCategory === "heritage"
                ? "Heritage & Jyotirlingas"
                : filterCategory === "nature"
                ? "Ghats & Sacred Rivers"
                : filterCategory === "food_stay"
                ? "Bhojanalaya & Stay"
                : "Open Sanctuaries"}
            </h2>
            <p className="text-[11px] text-ivory-dim">
              {loading
                ? "Querying verified geospatial nodes…"
                : `${filteredItems.length} verified pilgrimage places`}
            </p>
          </div>
          {mode && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium border",
                mode === "live"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : mode === "cache"
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              )}
            >
              {mode === "live" ? "Live GPS" : mode === "cache" ? "Cached" : "Verified Atlas"}
            </span>
          )}
        </div>

        {/* Sanctuary Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {!loading && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-ivory-dim">
              <MapPin className="h-8 w-8 text-gold/30 mb-2" />
              <p className="text-xs">No sacred sanctuaries found in this view.</p>
              <p className="text-[10px] text-ivory-dim/60 mt-1">
                Try zooming out, panning along the highway, or clearing filters.
              </p>
            </div>
          )}

          {filteredItems.map((p) => {
            const isSel = p.id === selectedId;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedId(p.id);
                  const map = googleMapRef.current;
                  if (map) {
                    map.panTo({ lat: p.latitude, lng: p.longitude });
                    map.setZoom(16);
                    const marker = markersMapRef.current.get(p.id);
                    if (marker) {
                      openInfoWindowForPlace(p, marker);
                    }
                  }
                  if (activeTab === "list") {
                    setActiveTab("map");
                  }
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all",
                  isSel
                    ? "border-gold bg-gold/10 shadow-lg shadow-gold/5"
                    : "border-line bg-obsidian-3/60 hover:border-gold/30 hover:bg-obsidian-3"
                )}
              >
                {/* Photo thumbnail */}
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
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-gold/10 text-gold-bright">
                    <span className="text-lg">🛕</span>
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
                    <span className="text-gold-dim">🛕 {p.category || "Temple"}</span>
                    {p.openNow !== undefined && (
                      <span
                        className={cn(
                          "font-medium",
                          p.openNow ? "text-emerald-400" : "text-stone-400"
                        )}
                      >
                        • {p.openNow ? "Open" : "Closed"}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Sanctuary Footer Details Drawer */}
        {selected && (
          <div className="border-t border-line bg-obsidian-3/95 p-3.5 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-serif text-sm font-semibold text-ivory">{selected.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[11px] text-ivory-dim">{selected.address || [selected.district, selected.state].filter(Boolean).join(", ")}</p>
                  {selectedQuality && (
                    <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[9.5px] font-semibold text-gold-bright">
                      {selectedQuality.accuracyLabel}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="text-ivory-dim hover:text-ivory"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {selected.href ? (
                <Link
                  href={selected.href}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-obsidian shadow-md hover:bg-gold-bright transition-colors"
                >
                  <span>View Temple Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 rounded-xl border border-line bg-obsidian-2 px-3 py-2 text-xs font-medium text-ivory hover:border-gold transition-colors"
              >
                <Car className="h-3.5 w-3.5 text-gold" />
                <span>Navigate</span>
              </a>
            </div>
          </div>
        )}

        {/* Google Attribution bar */}
        <div className="border-t border-line/60 px-4 py-2 bg-obsidian-3/50">
          <GoogleAttribution />
        </div>
      </aside>
    </div>
  );
}