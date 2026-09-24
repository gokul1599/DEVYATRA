import {
  type DestinationGeoJSONFeature,
  type DestinationFeatureCollection,
} from "./geojson";
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

export const MAP_STYLES = {
  primaryVector: "https://tiles.openfreemap.org/styles/dark",

  primaryLiberty: "https://tiles.openfreemap.org/styles/liberty",

  esriSatellite: {
    version: 8 as const,
    sources: {
      "esri-satellite": {
        type: "raster" as const,
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        attribution: "Tiles © Esri, Maxar, Earthstar Geographics",
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
        attribution: "© OpenStreetMap contributors © CARTO",
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
  static toGeoJSON(points: MapDataPoint[]): DestinationFeatureCollection {
    const features: DestinationGeoJSONFeature[] = [];

    let exactCount = 0;
    let siteCenterCount = 0;
    const approximateCount = 0;
    let centroidFallbackExcluded = 0;

    for (const point of points) {
      if (point.isCentroidFallback) {
        centroidFallbackExcluded++;
        continue;
      }

      if (
        !isValidCoordinate(point.latitude, point.longitude) ||
        !isWithinIndiaBounds(point.latitude, point.longitude)
      ) {
        continue;
      }

      const isExact = Boolean(
        point.googlePlaceId && point.googlePlaceId.startsWith("ChIJ")
      );

      if (isExact) {
        exactCount++;
      } else {
        siteCenterCount++;
      }

      const stateSlug = point.stateCode
        ? point.stateCode.toLowerCase()
        : "india";

      const href =
        point.href ||
        (point.slug
          ? `/temples/${stateSlug}/${point.slug}`
          : undefined);

      const accuracyLabel = isExact
        ? "Verified Coordinates"
        : "Site Center";

      const accuracyDescription = isExact
        ? "Coordinates matched to a verified Google Place record."
        : "Coordinates represent the known temple/site center.";

      features.push({
        type: "Feature",
        id: point.id,
        geometry: {
          type: "Point",
          coordinates: [point.longitude, point.latitude],
        },
        properties: {
          id: point.id,
          name: point.name,
          slug: point.slug,
          category: point.category || "TEMPLE",
          subcategory: point.subcategory || null,
          mainDeity: point.subcategory || null,
          address: point.address || null,
          city: point.district || null,
          district: point.district || null,
          state: point.state || null,
          stateCode: point.stateCode || null,
          latitude: point.latitude,
          longitude: point.longitude,
          accuracy: isExact ? "EXACT" : "SITE_CENTER",
          accuracyLabel,
          accuracyDescription,
          badgeVariant: isExact ? "emerald" : "gold",
          qualityScore: isExact ? 95 : 85,
          verificationStatus:
            point.verificationStatus || "VERIFIED_SOURCE",
          sourceType: point.sourceType || "CURATED",
          sourceName: "Templeora Sacred Atlas",
          isVerified: true,
          openNow: null,
          distanceKm: null,
          googlePlaceId: point.googlePlaceId || null,
          href: href || null,
          imageReference: point.imageReference || null,
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

  static filterBbox(
    points: MapDataPoint[],
    bbox: {
      minLng: number;
      minLat: number;
      maxLng: number;
      maxLat: number;
    }
  ): MapDataPoint[] {
    return points.filter(
      (point) =>
        point.latitude >= bbox.minLat &&
        point.latitude <= bbox.maxLat &&
        point.longitude >= bbox.minLng &&
        point.longitude <= bbox.maxLng
    );
  }
}
