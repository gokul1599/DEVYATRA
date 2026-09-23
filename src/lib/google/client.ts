import "server-only";
import { googleMapsApiKey, googleMapsFallbackApiKey, GOOGLE_HTTP_TIMEOUT_MS, PLACES_BASE, FIELD_MASKS } from "./config";
import {
  autocompleteResponseSchema,
  placeDetailsResponseSchema,
  searchResponseSchema,
  type AutocompleteResult,
  type PlaceDetailsResult,
  type TextSearchResult,
} from "./schemas";

export type GoogleApiErrorKind =
  | "no-key"
  | "invalid-key"
  | "permission-denied"
  | "rate-limit"
  | "not-found"
  | "unavailable"
  | "invalid-request"
  | "network"
  | "unknown";

export class GoogleApiError extends Error {
  readonly kind: GoogleApiErrorKind;
  readonly status?: number;
  constructor(kind: GoogleApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "GoogleApiError";
    this.kind = kind;
    this.status = status;
  }
}

function classify(status: number, message: string): GoogleApiErrorKind {
  if (status === 400) {
    if (/API key not valid|API key invalid/i.test(message)) return "invalid-key";
    if (/API key.*restrict|referrer|.*restriction/i.test(message)) return "permission-denied";
    return "invalid-request";
  }
  if (status === 403) {
    if (/API key not valid/i.test(message)) return "invalid-key";
    return "permission-denied";
  }
  if (status === 404) return "not-found";
  if (status === 429 || /RESOURCE_EXHAUSTED/i.test(message)) return "rate-limit";
  if (status >= 500 || /INTERNAL|UNAVAILABLE/i.test(message)) return "unavailable";
  return "unknown";
}

interface RequestInitExt extends RequestInit {
  timeoutMs?: number;
}

async function placesFetch(path: string, init: RequestInitExt = {}): Promise<Response> {
  const primaryKey = googleMapsApiKey();
  const fallbackKey = googleMapsFallbackApiKey();
  if (!primaryKey && !fallbackKey) throw new GoogleApiError("no-key", "GOOGLE_MAPS_API_KEY is not configured");

  async function executeFetch(key: string): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), init.timeoutMs ?? GOOGLE_HTTP_TIMEOUT_MS);
    try {
      return await fetch(`${PLACES_BASE}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          ...(init.headers ?? {}),
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new GoogleApiError("network", "Google Places request timed out");
      }
      throw new GoogleApiError("network", err instanceof Error ? err.message : "Network error calling Google Places");
    } finally {
      clearTimeout(timer);
    }
  }

  const activeKey = primaryKey || fallbackKey;
  const res = await executeFetch(activeKey);

  // If primary key gets 403 (e.g. SERVICE_DISABLED / PERMISSION_DENIED) and fallback is available, seamless failover
  if (!res.ok && res.status === 403 && fallbackKey && activeKey !== fallbackKey) {
    try {
      const fallbackRes = await executeFetch(fallbackKey);
      if (fallbackRes.ok) {
        return fallbackRes;
      }
    } catch {
      // return original res
    }
  }

  return res;
}

async function parseJson<T>(res: Response, schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: unknown } }): Promise<T> {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: { message?: string; status?: string } };
      message = body.error?.message ?? body.error?.status ?? message;
    } catch {
      /* ignore */
    }
    throw new GoogleApiError(classify(res.status, message), message, res.status);
  }
  const data = await res.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new GoogleApiError("unknown", "Malformed Google Places response");
  }
  return parsed.data as T;
}

export interface TextSearchArgs {
  query: string;
  locationBias?: { latitude: number; longitude: number; radiusKm: number };
  pageToken?: string;
  maxResults?: number;
}

export async function textSearch(args: TextSearchArgs): Promise<TextSearchResult> {
  const minResultCount = args.maxResults ?? 10;
  const body: Record<string, unknown> = { textQuery: args.query, pageSize: minResultCount };
  if (args.locationBias) {
    body.locationBias = {
      circle: {
        center: { latitude: args.locationBias.latitude, longitude: args.locationBias.longitude },
        radius: Math.min(args.locationBias.radiusKm * 1000, 50_000),
      },
    };
  }
  if (args.pageToken) body.pageToken = args.pageToken;
  const res = await placesFetch("places:searchText", {
    method: "POST",
    headers: { "X-Goog-FieldMask": FIELD_MASKS.search },
    body: JSON.stringify(body),
  });
  return parseJson(res, searchResponseSchema);
}

export interface NearbySearchArgs {
  latitude: number;
  longitude: number;
  radiusKm: number;
  includedTypes?: string[];
  excludedTypes?: string[];
  maxResults?: number;
}

export async function nearbySearch(args: NearbySearchArgs): Promise<TextSearchResult> {
  const body: Record<string, unknown> = {
    rankPreference: "DISTANCE",
    maxResultCount: args.maxResults ?? 10,
  };
  if (args.includedTypes?.length) body.includedTypes = args.includedTypes;
  if (args.excludedTypes?.length) body.excludedTypes = args.excludedTypes;
  body.locationRestriction = {
    circle: { center: { latitude: args.latitude, longitude: args.longitude }, radius: Math.min(args.radiusKm * 1000, 50_000) },
  };
  const res = await placesFetch("places:searchNearby", {
    method: "POST",
    headers: { "X-Goog-FieldMask": FIELD_MASKS.search },
    body: JSON.stringify(body),
  });
  return parseJson(res, searchResponseSchema);
}

export async function placeDetails(placeId: string): Promise<PlaceDetailsResult> {
  const res = await placesFetch(`places/${encodeURIComponent(placeId)}`, {
    method: "GET",
    headers: { "X-Goog-FieldMask": FIELD_MASKS.details },
  });
  return parseJson(res, placeDetailsResponseSchema);
}

export interface AutocompleteArgs {
  input: string;
  origin?: { latitude: number; longitude: number };
  region?: string;
}

export async function autocompleteSuggest(args: AutocompleteArgs): Promise<AutocompleteResult> {
  const body: Record<string, unknown> = {
    input: args.input,
    includeQueryPredictions: true,
    languageCode: "en",
  };
  if (args.origin) body.locationBias = { origin: { latitude: args.origin.latitude, longitude: args.origin.longitude } };
  if (args.region) body.regionCode = args.region;
  const res = await placesFetch("places:autocomplete", {
    method: "POST",
    headers: { "X-Goog-FieldMask": FIELD_MASKS.autocomplete },
    body: JSON.stringify(body),
  });
  return parseJson(res, autocompleteResponseSchema);
}

export interface PhotoArgs {
  name: string;
  maxHeightPx?: number;
}

export async function photoUrl(args: PhotoArgs): Promise<string> {
  const key = googleMapsApiKey() || googleMapsFallbackApiKey();
  if (!key) throw new GoogleApiError("no-key", "GOOGLE_MAPS_API_KEY is not configured");
  const maxHeightPx = args.maxHeightPx ?? 900;
  return `${PLACES_BASE}${args.name.replace(/^\/+/, "")}/media?key=${key}&maxHeightPx=${maxHeightPx}`;
}

/** Fetch a photo by its Places media name, keeping the key in a header (never in URLs). */
export async function photoFetch(args: PhotoArgs): Promise<Response> {
  const maxHeightPx = args.maxHeightPx ?? 900;
  const res = await placesFetch(`${args.name.replace(/^\/+/, "")}/media?maxHeightPx=${maxHeightPx}`, { method: "GET" });
  return res;
}