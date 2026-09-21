import { STATES } from "./data/states";
import { TEMPLES, TEMPLE_INDEX, slugify } from "./data/temples";
import { Temple, StateData, FestivalEvent, NearbyKind } from "./types";
import { NEARBY, nearbyFor } from "./data/nearby";

export { slugify, TEMPLES, TEMPLE_INDEX };

export const getStates = (): StateData[] => STATES;

export const getState = (key: string): StateData | undefined =>
  STATES.find((s) => s.code.toLowerCase() === key.toLowerCase() || s.slug === key);

export const getDistrict = (stateCode: string, districtSlug: string) => {
  const state = getState(stateCode);
  if (!state) return undefined;
  const districts = state.districts;
  const name = districts.find((d) => slugify(d) === districtSlug);
  if (!name) return undefined;
  const temples = templesByDistrict(stateCode, districtSlug);
  return { name, slug: districtSlug, state, temples };
};

export const getDistrictByState = (state: StateData, districtSlug: string) => {
  const name = state.districts.find((d) => slugify(d) === districtSlug);
  if (!name) return undefined;
  return { name, slug: districtSlug, state, temples: templesByDistrict(state.code, districtSlug) };
};

export const getAdminUnits = (stateCode: string, districtSlug: string) => {
  const temples = templesByDistrict(stateCode, districtSlug);
  const map = new Map<string, { name: string; slug: string; temples: Temple[] }>();
  for (const t of temples) {
    if (!t.subUnitSlug) continue;
    const key = t.subUnitSlug;
    let entry = map.get(key);
    if (!entry) {
      entry = { name: t.subUnit ?? t.subUnitSlug, slug: key, temples: [] };
      map.set(key, entry);
    }
    entry.temples.push(t);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const getLocations = (stateCode: string, districtSlug: string, subUnitSlug: string) => {
  const temples = templesByDistrict(stateCode, districtSlug).filter((t) => t.subUnitSlug === subUnitSlug);
  const map = new Map<string, { name: string; slug: string; kind: string; temples: Temple[] }>();
  for (const t of temples) {
    const key = t.locationSlug;
    let entry = map.get(key);
    if (!entry) {
      entry = { name: t.location, slug: key, kind: t.locationKind, temples: [] };
      map.set(key, entry);
    }
    entry.temples.push(t);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const templesByDistrict = (stateCode: string, districtSlug: string) =>
  TEMPLES.filter((t) => t.stateCode === stateCode && t.districtSlug === districtSlug);

export const templesByState = (stateCode: string) => TEMPLES.filter((t) => t.stateCode === stateCode);

export const getTemple = (key: string): Temple | undefined => TEMPLE_INDEX.get(key);

export const templeUrl = (t: Temple) => `/temples/${getState(t.stateCode)?.slug}/${t.slug}`;

export type FestivalWithTemple = FestivalEvent & { temple: Temple };

export const getFestivalAll = (): FestivalWithTemple[] =>
  TEMPLES.flatMap((t) => t.festivals.map((f) => ({ ...f, temple: t }))).sort((a, b) => a.month - b.month || a.day - b.day);

export { NEARBY, nearbyFor };

export const nearbyCategories: { kind: NearbyKind; label: string; emoji: string }[] = [
  { kind: "temple", label: "Temples", emoji: "🛕" },
  { kind: "restaurant", label: "Restaurants", emoji: "🍴" },
  { kind: "hotel", label: "Hotels", emoji: "🏨" },
  { kind: "attraction", label: "Historical Places", emoji: "🏛️" },
  { kind: "nature", label: "Nature", emoji: "🌳" },
  { kind: "shopping", label: "Shopping", emoji: "🛍️" },
  { kind: "parking", label: "Parking", emoji: "🚗" },
  { kind: "hospital", label: "Hospitals", emoji: "🏥" },
  { kind: "pharmacy", label: "Pharmacies", emoji: "💊" },
  { kind: "police", label: "Police", emoji: "👮" },
  { kind: "restroom", label: "Restrooms", emoji: "🚻" },
  { kind: "atm", label: "ATMs", emoji: "🏧" },
  { kind: "fuel", label: "Fuel", emoji: "⛽" },
  { kind: "transport", label: "Transport", emoji: "🚉" },
];

export const safetyFacilities: NearbyKind[] = ["hospital", "police", "pharmacy", "restroom", "atm", "fuel", "parking", "transport"];