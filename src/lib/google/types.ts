export type BusinessStatus = "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";

export interface GooglePeriod {
  open: { day: number; hour: number; minute: number };
  close: { day: number; hour: number; minute: number };
}

export interface GoogleOpeningHours {
  openNow: boolean | null;
  weekdayDescriptions?: string[];
}

export interface GooglePhoto {
  name: string;
  heightPx?: number;
  widthPx?: number;
}

export interface GooglePlace {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  primaryType: string;
  types: string[];
  googleMapsUri: string;
  businessStatus?: BusinessStatus;
  openingHours?: GoogleOpeningHours;
  photos?: GooglePhoto[];
  rating?: number;
  userRatingCount?: number;
  plusCode?: string;
  shortFormattedAddress?: string;
  retrievedAt: string;
}

export type DiscoverySource = "google" | "verified" | "cached";

export type TempleCertainty = "temple" | "likely_temple" | "religious_site" | "uncertain";

export interface VerifiedReference {
  slug: string;
  href: string;
  name: string;
}

export interface DiscoveredPlace {
  id: string;
  googlePlaceId?: string;
  name: string;
  localNames?: string[];
  deity?: string;
  region?: string;
  address: string;
  latitude: number;
  longitude: number;
  types: string[];
  businessStatus?: BusinessStatus;
  openNow: boolean | null;
  weekdayDescriptions?: string[];
  photos?: GooglePhoto[];
  mapsUrl: string;
  source: DiscoverySource;
  certainty: TempleCertainty;
  distanceKm?: number;
  verified?: VerifiedReference;
  description?: string;
}

export type DiscoveryMode = "live" | "cache" | "degraded";

export interface DiscoveryResult {
  query: string;
  queryType: "text" | "nearby";
  region?: { latitude: number; longitude: number; radiusKm: number };
  items: DiscoveredPlace[];
  count: number;
  mode: DiscoveryMode;
  stale: boolean;
  sharedHits: boolean;
  usedQueries: string[];
  via: ("google" | "verified")[];
  warnings: string[];
  retrievedAt: string;
}

export const DISCOVERY_NOTE =
  "Showing temples discovered via live place data and verified temple information. Live discovery does not claim to list every temple.";

export const SEARCH_CACHE_TTL_MS = Number(process.env.GOOGLE_SEARCH_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000);
export const DETAILS_CACHE_TTL_MS = Number(process.env.GOOGLE_DETAILS_CACHE_TTL_MS ?? 7 * 24 * 60 * 60 * 1000);