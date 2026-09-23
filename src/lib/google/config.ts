import "server-only";

const PLACES_BASE = "https://places.googleapis.com/v1/";

export function googleMapsApiKey(): string {
  return process.env.GOOGLE_MAPS_API_KEY ?? "";
}

export function googleEnabled(): boolean {
  return googleMapsApiKey().length > 0;
}

export const GOOGLE_HTTP_TIMEOUT_MS = Number(process.env.GOOGLE_HTTP_TIMEOUT_MS ?? 8000);

export const FIELD_MASKS = {
  /** Core set for list-style searches (text + nearby). Never use "*". */
  search:
    [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.shortFormattedAddress",
      "places.location",
      "places.types",
      "places.primaryType",
      "places.googleMapsUri",
      "places.businessStatus",
      "places.regularOpeningHours",
      "places.photos",
      "places.rating",
      "places.userRatingCount",
    ].join(","),
  /** Place Details adds plusCode for region labelling. */
  details:
    [
      "id",
      "displayName",
      "formattedAddress",
      "shortFormattedAddress",
      "location",
      "types",
      "primaryType",
      "googleMapsUri",
      "businessStatus",
      "regularOpeningHours",
      "photos",
      "rating",
      "userRatingCount",
      "plusCode",
    ].join(","),
  /** Autocomplete predictions */
  autocomplete:
    [
      "suggestions.placePrediction.placeId",
      "suggestions.placePrediction.text",
      "suggestions.placePrediction.structuredFormat",
      "suggestions.placePrediction.types",
    ].join(","),
} as const;

export { PLACES_BASE };

export const DEFAULT_NEARBY_RADIUS_KM = 10;
export const EXPANDED_NEARBY_RADIUS_KM = 25;
export const MIN_NEARBY_RESULTS = 8;
export const MAX_QUERIES_PER_DISCOVERY = 4;
export const MAX_DISCOVERED_ITEMS = 60;