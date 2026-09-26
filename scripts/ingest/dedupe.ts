import type { RawPlaceInput } from "./types";
import { calculateHaversineDistanceKm } from "../../src/lib/nearby/engine";

export interface DeduplicationReport {
  unique: RawPlaceInput[];
  duplicates: {
    record: RawPlaceInput;
    matchedWith: RawPlaceInput;
    reason: string;
  }[];
}

export function normalizeNameForMatch(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function deduplicatePlaces(places: RawPlaceInput[]): DeduplicationReport {
  const uniqueBySlug = new Map<string, RawPlaceInput>();
  const duplicates: DeduplicationReport["duplicates"] = [];

  for (const place of places) {
    // 1. Check exact slug
    if (uniqueBySlug.has(place.slug)) {
      duplicates.push({
        record: place,
        matchedWith: uniqueBySlug.get(place.slug)!,
        reason: `Duplicate slug: ${place.slug}`
      });
      continue;
    }

    // 2. Check spatial proximity & name match against existing unique
    let isSpatialDuplicate = false;
    const normName = normalizeNameForMatch(place.name);

    for (const existing of uniqueBySlug.values()) {
      const distKm = calculateHaversineDistanceKm(
        place.latitude,
        place.longitude,
        existing.latitude,
        existing.longitude
      );

      // Within 500 meters and matching normalized name or state/district
      if (distKm <= 0.5) {
        const existingNorm = normalizeNameForMatch(existing.name);
        if (normName === existingNorm || normName.includes(existingNorm) || existingNorm.includes(normName)) {
          duplicates.push({
            record: place,
            matchedWith: existing,
            reason: `Spatial duplicate (${(distKm * 1000).toFixed(0)}m proximity with similar name '${existing.name}')`
          });
          isSpatialDuplicate = true;
          break;
        }
      }
    }

    if (!isSpatialDuplicate) {
      uniqueBySlug.set(place.slug, place);
    }
  }

  return {
    unique: Array.from(uniqueBySlug.values()),
    duplicates
  };
}
