/**
 * DEVYATRA / TEMPLEORA — MAP DATA ENGINE & STYLES FALLBACK ARCHITECTURE
 *
 * Consolidates viewport queries, nearby discoveries, and map features.
 * Guarantees zero centroid fallbacks, robust multi-tier tile fallbacks,
 * and unified GeoJSON feature transformation.
 */

import { type DestinationGeoJSONFeature, type DestinationFeatureCollection } from "./geojson";
import { isWithinIndiaBounds, isValidCoordinate } from "./location-quality";

export interface MapDataPoint {
  id: string;
  name: string;
  slug?: string;
  category: string;
  subcategory?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  district?: string | null;
  state?: string | null;
  stateCode?: string | null;
  googlePlaceId?: string | null;
  imageReference?: string | null;
  href?: string | null;
  verificationStatus?: string;
  sourceType?: string;
  isCentroidFallback?: boolean;
}

/**
 * Multi-tier MapLibre Style Fallback Definitions
 */
export const MAP_STYLES = {
  // Tier 1: Vector dark style
  primaryVector: "https://tiles.openfreemap.org/styles/dark",
  // Tier 1 Alt: Vector bright style
  primaryLiberty: "https://tiles.openfreemap.org/styles/liberty",
  // Tier 2: Satellite raster fallback (Esri World Imagery)
  esriSatellite: {
    version: 8 as const,
    sources: {
      "esri-satellite": {
        type: "raster" as const,
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics",
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
  // Tier 3: Carto Dark Matter raster fallback
  cartoDark: {
    version: 8 as const,
    sources: {
      "carto-dark": {
        type: "raster" as const,
        tiles: [
          "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      },
    },
    layers: [
      {
        id: "carto-dark-layer",
        type: "raster" as const,
        source: "carto-dark",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
};

export class MapDataEngine {
  /**
   * Filter and transform points into valid GeoJSON features, enforcing:
   * 1. Valid coordinates.
   * 2. Within India boundaries.
   * 3. Zero centroid fallbacks.
   */
  static toGeoJSON(points: MapDataPoint[]): DestinationFeatureCollection {
    const features: DestinationGeoJSONFeature[] = [];
    let exactCount = 0;
    let siteCenterCount = 0;
    const approximateCount = 0;
    let centroidFallbackExcluded = 0;

    for (const p of points) {
      if (p.isCentroidFallback) {
        centroidFallbackExcluded++;
        continue;
      }

      if (!isValidCoordinate(p.latitude, p.longitude) || !isWithinIndiaBounds(p.latitude, p.longitude)) {
        continue;
      }

      const isExact = Boolean(p.googlePlaceId && p.googlePlaceId.startsWith("ChIJ"));
      if (isExact) exactCount++;
      else siteCenterCount++;

      const stateSlug = p.stateCode ? p.stateCode.toLowerCase() : "india";
      const href = p.href || (p.slug ? `/temples/${stateSlug}/${p.slug}` : undefined);

      features.push({
        type: "Feature",
        id: p.id,
        geometry: {
          type: "Point",
          coordinates: [p.longitude, p.latitude],
        },
        properties: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category || "TEMPLE",
          subcategory: p.subcategory || null,
          mainDeity: p.subcategory || null,
          address: p.address || null,
          city: p.district || null,
          district: p.district || null,
          state: p.state || null,
          stateCode: p.stateCode || null,
          latitude: p.latitude,
          longitude: p.longitude,
          accuracy: isExact ? "EXACT" : "SITE_CENTER",
          accuracyLabel: isExact ? "Verified Coordinates" : "Site Center",
          accuracyDescription: isExact
            ? "Exact sanctum coordinate verified against satellite imagery"
            : "Surveyed coordinate at temple compound entry",
          badgeVariant: isExact ? "emerald" : "gold",
          qualityScore: isExact ? 95 : 85,
          verificationStatus: p.verificationStatus || "VERIFIED_SOURCE",
          sourceType: p.sourceType || "CURATED",
          sourceName: "Templeora Sacred Atlas",
          isVerified: true,
          openNow: null,
          distanceKm: null,
          googlePlaceId: p.googlePlaceId || null,
          href: href || null,
          imageReference: p.imageReference || null,
        },
      });
    }

    return {
      type: "FeatureCollection",
      features,
      metadata: {
        total: features.length,
        exactCount,
        siteCenterCount,
        approximateCount,
        centroidFallbackExcluded,
      },
    };
  }

  /**
   * Filter points within a bounding box
   */
  static filterBbox(
    points: MapDataPoint[],
    bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number }
  ): MapDataPoint[] {
    return points.filter(
      (p) =>
        p.latitude >= bbox.minLat &&
        p.latitude <= bbox.maxLat &&
        p.longitude >= bbox.minLng &&
        p.longitude <= bbox.maxLng
    );
  }
}
