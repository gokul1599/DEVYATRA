import type { BusinessStatus, DiscoveredPlace, GoogleOpeningHours, GooglePhoto, GooglePlace, TempleCertainty } from "./types";

export interface RawGooglePlace {
  id?: string;
  displayName?: { text?: string } | null;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  primaryType?: string;
  types?: string[];
  googleMapsUri?: string;
  businessStatus?: BusinessStatus;
  regularOpeningHours?: { openNow?: boolean | null; weekdayDescriptions?: string[] };
  photos?: GooglePhoto[];
  rating?: number;
  userRatingCount?: number;
  shortFormattedAddress?: string;
  plusCode?: { globalCode?: string };
}

const TEMPLE_TYPE_SIGNALS = new Set(["hindu_temple", "jain_temple", "place_of_worship", "church", "mosque", "gurdwara", "synagogue", "temple"]);
const STRICT_TEMPLE_TYPES = new Set(["hindu_temple", "jain_temple"]);

const NAME_SIGNALS = [
  "temple",
  "mandir",
  "devasthanam",
  "devaswom",
  "devalaya",
  "kovil",
  "koil",
  "kshethram",
  "kshetra",
  "ksetra",
  "mutt",
  "ashram",
  "math",
  "derasar",
  "basadi",
];

export function toGooglePlace(raw: RawGooglePlace): GooglePlace | null {
  if (!raw.id || !raw.displayName?.text) return null;
  const loc = raw.location;
  if (typeof loc?.latitude !== "number" || typeof loc.longitude !== "number") return null;
  const hours = raw.regularOpeningHours;
  const openingHours: GoogleOpeningHours | undefined = hours
    ? { openNow: hours.openNow ?? null, weekdayDescriptions: hours.weekdayDescriptions }
    : undefined;
  return {
    placeId: raw.id,
    displayName: raw.displayName.text,
    formattedAddress: raw.formattedAddress ?? raw.shortFormattedAddress ?? "",
    latitude: loc.latitude,
    longitude: loc.longitude,
    primaryType: raw.primaryType ?? "",
    types: raw.types ?? [],
    googleMapsUri: raw.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${raw.id}`,
    businessStatus: raw.businessStatus,
    openingHours,
    photos: raw.photos,
    rating: raw.rating,
    userRatingCount: raw.userRatingCount,
    plusCode: raw.plusCode?.globalCode,
    shortFormattedAddress: raw.shortFormattedAddress,
    retrievedAt: new Date().toISOString(),
  };
}

const COMMERCIAL_OR_SERVICE_TYPES = new Set([
  "restaurant", "cafe", "bar", "hotel", "lodging", "shopping_mall", "store", "supermarket",
  "grocery_store", "school", "university", "hospital", "pharmacy", "atm", "bank",
  "petrol_station", "car_repair", "office", "taxi_stand", "bus_station", "train_station",
  "airport", "parking", "florist", "jewelry_store", "gas_station", "museum", "art_gallery", "zoo",
]);

/** Worship types that are not Hindu/Jain temples and are excluded from temple discovery. */
export const OTHER_WORSHIP_TYPES = new Set([
  "church", "mosque", "gurdwara", "synagogue", "masjid", "cathedral", "chapel",
  "hindu_temple_gate", "islamic",
]);

export function isOtherWorship(types: string[]): boolean {
  return types.some((t) => OTHER_WORSHIP_TYPES.has(t));
}

export interface TempleGuess {
  certainty: TempleCertainty;
  templeLike: boolean;
  excluded: boolean;
  exclusionReason?: string;
}

export function classifyTemple(place: { name?: string; types?: string[] }): TempleGuess {
  const types = place.types ?? [];
  if (types.some((t) => STRICT_TEMPLE_TYPES.has(t))) {
    return { certainty: "temple", templeLike: true, excluded: false };
  }
  if (types.some((t) => TEMPLE_TYPE_SIGNALS.has(t))) {
    return { certainty: "religious_site", templeLike: true, excluded: false };
  }
  const name = (place.name ?? "").toLowerCase();
  const hasTempleSignal = NAME_SIGNALS.some((s) => name.includes(s));
  if (hasTempleSignal) {
    return { certainty: types.length ? "likely_temple" : "temple", templeLike: true, excluded: false };
  }
  // A place with no temple signal that is clearly commercial/service is never a temple.
  const strongNonTemple = types.filter((t) => COMMERCIAL_OR_SERVICE_TYPES.has(t));
  if (strongNonTemple.length > 0) {
    return { certainty: "uncertain", templeLike: false, excluded: true, exclusionReason: `Non-temple primary type: ${strongNonTemple[0]}` };
  }
  // Religious keywords in name (deity/hill names) even without the word "temple".
  const spiritualHints = ["devi", "shiva", "siva", "vishnu", "krishna", "ram", "hanuman", "ganesh", "ganapati",
    "murugan", "subramanya", "ayyappa", "baba", "gurudwara", "masjid", "dargah", "annadanam", "prasada"];
  const hasSpiritualHint = spiritualHints.some((s) => name.includes(s));
  if (hasSpiritualHint) return { certainty: "religious_site", templeLike: true, excluded: false };
  return { certainty: "uncertain", templeLike: false, excluded: true, exclusionReason: "No temple signal" };
}

export function modeSummary(status: BusinessStatus | undefined): string {
  switch (status) {
    case "OPERATIONAL":
      return "Open (per live data)";
    case "CLOSED_TEMPORARILY":
      return "Temporarily closed (per live data)";
    case "CLOSED_PERMANENTLY":
      return "Permanently closed (per live data)";
    default:
      return "";
  }
}

export function toDiscoveredPlace(place: GooglePlace, opts?: { source?: DiscoveredPlace["source"]; distanceKm?: number }): DiscoveredPlace {
  const guess = classifyTemple({ name: place.displayName, types: place.types });
  return {
    id: place.placeId,
    googlePlaceId: place.placeId,
    name: place.displayName,
    address: place.formattedAddress || place.shortFormattedAddress || "",
    latitude: place.latitude,
    longitude: place.longitude,
    types: place.types,
    businessStatus: place.businessStatus,
    openNow: place.openingHours?.openNow ?? null,
    weekdayDescriptions: place.openingHours?.weekdayDescriptions,
    photos: place.photos,
    mapsUrl: place.googleMapsUri,
    source: opts?.source ?? "google",
    certainty: guess.certainty,
    distanceKm: opts?.distanceKm,
    region: place.plusCode ?? undefined,
  };
}