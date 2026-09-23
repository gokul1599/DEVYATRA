/**
 * DEVYATRA / TEMPLEORA — V2.4 REAL GEOGRAPHIC MAP ENGINE
 * GeoJSON Conversion & MapLibre Feature Collection Generator
 * 
 * Standard GeoJSON spec: coordinates are [longitude, latitude]
 */

import { assessLocationQuality, type LocationQualityAssessment } from "./location-quality";
import type { DiscoveredPlace } from "@/lib/google/types";
import type { UnifiedDestination } from "@/lib/destinations/unified";

export interface DestinationFeatureProperties {
  id: string;
  name: string;
  slug?: string;
  category: string;
  subcategory?: string | null;
  mainDeity?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  stateCode?: string | null;
  latitude: number;
  longitude: number;
  accuracy: string;
  accuracyLabel: string;
  accuracyDescription: string;
  badgeVariant: "gold" | "emerald" | "amber" | "muted";
  qualityScore: number;
  verificationStatus: string;
  sourceType?: string | null;
  sourceName?: string | null;
  isVerified: boolean;
  openNow?: boolean | null;
  distanceKm?: number | null;
  googlePlaceId?: string | null;
  href?: string | null;
  imageReference?: string | null;
}

export interface DestinationGeoJSONFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: DestinationFeatureProperties;
}

export interface DestinationFeatureCollection {
  type: "FeatureCollection";
  features: DestinationGeoJSONFeature[];
  metadata: {
    total: number;
    exactCount: number;
    siteCenterCount: number;
    approximateCount: number;
    centroidFallbackExcluded: number;
  };
}

/**
 * Converts DiscoveredPlace items to a GeoJSON FeatureCollection
 */
export function discoveredPlacesToGeoJSON(places: DiscoveredPlace[]): DestinationFeatureCollection {
  let exactCount = 0;
  let siteCenterCount = 0;
  let approximateCount = 0;
  let centroidFallbackExcluded = 0;

  const features: DestinationGeoJSONFeature[] = [];

  for (const p of places) {
    // If flagged as centroid fallback, exclude from map
    if ((p as unknown as { isCentroidFallback?: boolean }).isCentroidFallback) {
      centroidFallbackExcluded++;
      continue;
    }

    const assessment: LocationQualityAssessment = assessLocationQuality({
      latitude: p.latitude,
      longitude: p.longitude,
      verificationStatus: p.verified ? "VERIFIED_OFFICIAL" : p.source === "verified" ? "VERIFIED_OFFICIAL" : "VERIFIED_SOURCE",
      sourceType: p.source,
      googlePlaceId: p.googlePlaceId,
    });

    if (assessment.accuracy === "EXACT") exactCount++;
    else if (assessment.accuracy === "SITE_CENTER") siteCenterCount++;
    else if (assessment.accuracy === "APPROXIMATE") approximateCount++;

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
        category: "TEMPLE",
        address: p.address,
        region: p.region,
        latitude: p.latitude,
        longitude: p.longitude,
        accuracy: assessment.accuracy,
        accuracyLabel: assessment.accuracyLabel,
        accuracyDescription: assessment.accuracyDescription,
        badgeVariant: assessment.badgeVariant,
        qualityScore: assessment.qualityScore,
        verificationStatus: p.verified ? "VERIFIED_OFFICIAL" : "UNVERIFIED",
        sourceType: p.source,
        isVerified: Boolean(p.verified || p.source === "verified"),
        openNow: p.openNow,
        distanceKm: p.distanceKm,
        googlePlaceId: p.googlePlaceId,
        href: p.verified?.href || (p.googlePlaceId ? `https://www.google.com/maps/place/?q=place_id:${p.googlePlaceId}` : null),
        imageReference: p.photos?.[0]?.name,
      } as DestinationFeatureProperties,
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
 * Converts UnifiedDestination records to a GeoJSON FeatureCollection
 */
export function unifiedDestinationsToGeoJSON(destinations: UnifiedDestination[]): DestinationFeatureCollection {
  let exactCount = 0;
  let siteCenterCount = 0;
  let approximateCount = 0;
  let centroidFallbackExcluded = 0;

  const features: DestinationGeoJSONFeature[] = [];

  for (const d of destinations) {
    if (d.isCentroidFallback) {
      centroidFallbackExcluded++;
      continue;
    }

    const assessment = assessLocationQuality({
      latitude: d.latitude,
      longitude: d.longitude,
      verificationStatus: d.verificationStatus,
      sourceType: d.sourceType,
    });

    if (assessment.accuracy === "EXACT") exactCount++;
    else if (assessment.accuracy === "SITE_CENTER") siteCenterCount++;
    else if (assessment.accuracy === "APPROXIMATE") approximateCount++;

    features.push({
      type: "Feature",
      id: d.id,
      geometry: {
        type: "Point",
        coordinates: [d.longitude, d.latitude],
      },
      properties: {
        id: d.id,
        name: d.name,
        slug: d.slug,
        category: d.category,
        subcategory: d.subcategory,
        address: d.locality,
        city: d.city,
        district: d.district,
        state: d.state,
        latitude: d.latitude,
        longitude: d.longitude,
        accuracy: assessment.accuracy,
        accuracyLabel: assessment.accuracyLabel,
        accuracyDescription: assessment.accuracyDescription,
        badgeVariant: assessment.badgeVariant,
        qualityScore: assessment.qualityScore,
        verificationStatus: d.verificationStatus,
        sourceType: d.sourceType,
        sourceName: d.sourceName,
        isVerified: d.verificationStatus.includes("VERIFIED"),
        distanceKm: d.airDistanceKm,
        href: d.category === "TEMPLE" ? `/temple/${d.slug}` : `/places/${d.slug}`,
        imageReference: d.imageReference,
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
