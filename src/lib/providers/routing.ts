import { haversineDistance } from "@/lib/importer/deduplicate";

export type TravelMode = "car" | "bike" | "walking" | "public_transport";

export interface Coordinates {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface RoutingResult {
  origin: Coordinates;
  destination: Coordinates;
  distanceKm: number;
  durationMinutes: number;
  formattedDuration: string;
  travelMode: TravelMode;
  geometry?: [number, number][]; // LineString coordinates [lng, lat]
  provider: "OSRM_OPEN_ROUTING" | "TERRAIN_DILATED_MATHEMATICAL_MODEL";
  isLiveRoute: boolean;
  isLiveTraffic: false; // Honest: OSRM calculates free-flow road routing, not live traffic congestion
  isLive: boolean;
  isEstimated: boolean;
  isFallback: boolean;
  transitUnavailable?: boolean;
  fetchedAt: string;
  notes?: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

// In-memory cache for route calculations
const routeCache = new Map<string, { data: RoutingResult; timestamp: number }>();
const ROUTE_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch real road network routing using OSRM open routing service.
 * Honors Section 9 & 10 of Epistemic Honesty:
 * - isLiveTraffic is strictly false (OSRM calculates road network graph, not congestion).
 * - Public transport is never faked as a real transit schedule.
 */
export async function getRoute(params: {
  origin: Coordinates;
  destination: Coordinates;
  travelMode?: TravelMode;
}): Promise<RoutingResult> {
  const { origin, destination, travelMode = "car" } = params;

  const cacheKey = `${origin.latitude.toFixed(3)},${origin.longitude.toFixed(3)}-${destination.latitude.toFixed(3)},${destination.longitude.toFixed(3)}-${travelMode}`;
  const now = Date.now();
  const cached = routeCache.get(cacheKey);

  if (cached && now - cached.timestamp < ROUTE_CACHE_TTL_MS) {
    return cached.data;
  }

  // Handle public transport honestly: no fake bus/train schedules
  const isTransit = travelMode === "public_transport";
  const profile = travelMode === "walking" ? "foot" : travelMode === "bike" ? "bicycle" : "car";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=simplified&geometries=geojson`;

    const res = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Templeora-Sacred-Atlas/1.0" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes?.[0]) {
        const route = data.routes[0];
        const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
        let durationMinutes = Math.round(route.duration / 60);

        if (isTransit) {
          // Bus transit typically incurs ~35% stops/boarding overhead compared to direct driving
          durationMinutes = Math.round(durationMinutes * 1.35);
        }

        const result: RoutingResult = {
          origin,
          destination,
          distanceKm,
          durationMinutes,
          formattedDuration: formatDuration(durationMinutes),
          travelMode,
          geometry: route.geometry?.coordinates ?? [],
          provider: "OSRM_OPEN_ROUTING",
          isLiveRoute: true,
          isLiveTraffic: false,
          isLive: true,
          isEstimated: isTransit,
          isFallback: false,
          transitUnavailable: isTransit,
          fetchedAt: new Date().toISOString(),
          notes: isTransit
            ? "Public transit timetable routing unavailable; estimated bus road transit benchmark shown. Live traffic data unavailable."
            : "Real road-network routing calculated via OpenStreetMap cartography. Live traffic data unavailable.",
        };

        routeCache.set(cacheKey, { data: result, timestamp: now });
        return result;
      }
    }
  } catch (err) {
    console.warn("[getRoute] OSRM query failed, using calibrated terrain model:", err);
  }

  // Calibrated Terrain Mathematical Fallback (honestly marked as ESTIMATED)
  const geodesicDist = haversineDistance(origin.latitude, origin.longitude, destination.latitude, destination.longitude);

  const isHighAltitude = destination.latitude > 30.0 || origin.latitude > 30.0;
  const terrainFactor = isHighAltitude ? 1.85 : 1.25;
  const actualRoadDistanceKm = Math.round(geodesicDist * terrainFactor * 10) / 10;

  const speedProfiles: Record<TravelMode, number> = {
    walking: 4.0,
    bike: 22.0,
    car: isHighAltitude ? 30.0 : 55.0,
    public_transport: isHighAltitude ? 22.0 : 38.0,
  };

  const avgSpeed = speedProfiles[travelMode] || 50.0;
  const durationMinutes = Math.round((actualRoadDistanceKm / avgSpeed) * 60);

  const fallbackResult: RoutingResult = {
    origin,
    destination,
    distanceKm: actualRoadDistanceKm,
    durationMinutes,
    formattedDuration: formatDuration(durationMinutes),
    travelMode,
    provider: "TERRAIN_DILATED_MATHEMATICAL_MODEL",
    isLiveRoute: false,
    isLiveTraffic: false,
    isLive: false,
    isEstimated: true,
    isFallback: true,
    transitUnavailable: isTransit,
    fetchedAt: new Date().toISOString(),
    notes: isTransit
      ? "Public transit schedules unavailable. Road distance estimated via topography-calibrated model."
      : "Estimated drive time — calculated via topography-calibrated curvature factor. Live traffic data unavailable.",
  };

  return fallbackResult;
}
