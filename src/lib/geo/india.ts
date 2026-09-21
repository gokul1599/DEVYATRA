/**
 * Best-effort state lookup for Google-discovered places. Google results do not
 * reliably include a state, so we map the nearest known state capital. This is
 * a rough "which region is this likely in" hint — never treated as verified.
 */

import { haversineKm } from "./distance";

export interface StateAnchor {
  code: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
}

// Approximate capital-city coordinates (not precise boundaries).
export const STATE_ANCHORS: StateAnchor[] = [
  { code: "AP", name: "Andhra Pradesh", slug: "andhra-pradesh", latitude: 16.5062, longitude: 80.648 },
  { code: "TS", name: "Telangana", slug: "telangana", latitude: 17.385, longitude: 78.4867 },
  { code: "TN", name: "Tamil Nadu", slug: "tamil-nadu", latitude: 13.0827, longitude: 80.2707 },
  { code: "KA", name: "Karnataka", slug: "karnataka", latitude: 12.9716, longitude: 77.5946 },
  { code: "KL", name: "Kerala", slug: "kerala", latitude: 8.5241, longitude: 76.9366 },
  { code: "MH", name: "Maharashtra", slug: "maharashtra", latitude: 19.076, longitude: 72.8777 },
  { code: "GJ", name: "Gujarat", slug: "gujarat", latitude: 23.2233, longitude: 72.6499 },
  { code: "RJ", name: "Rajasthan", slug: "rajasthan", latitude: 26.9124, longitude: 75.7873 },
  { code: "UP", name: "Uttar Pradesh", slug: "uttar-pradesh", latitude: 26.8467, longitude: 80.9462 },
  { code: "UK", name: "Uttarakhand", slug: "uttarakhand", latitude: 30.3165, longitude: 78.0322 },
  { code: "MP", name: "Madhya Pradesh", slug: "madhya-pradesh", latitude: 23.2599, longitude: 77.4126 },
  { code: "OD", name: "Odisha", slug: "odisha", latitude: 20.2961, longitude: 85.8245 },
  { code: "BR", name: "Bihar", slug: "bihar", latitude: 25.5941, longitude: 85.1376 },
  { code: "JH", name: "Jharkhand", slug: "jharkhand", latitude: 23.3441, longitude: 85.3096 },
  { code: "WB", name: "West Bengal", slug: "west-bengal", latitude: 22.5726, longitude: 88.3639 },
  { code: "AS", name: "Assam", slug: "assam", latitude: 26.2006, longitude: 92.9376 },
  { code: "GA", name: "Goa", slug: "goa", latitude: 15.4909, longitude: 73.8278 },
  { code: "HR", name: "Haryana", slug: "haryana", latitude: 30.7333, longitude: 76.7794 },
  { code: "PB", name: "Punjab", slug: "punjab", latitude: 30.7333, longitude: 76.7794 },
  { code: "CG", name: "Chhattisgarh", slug: "chhattisgarh", latitude: 21.2514, longitude: 81.6296 },
  { code: "TR", name: "Tripura", slug: "tripura", latitude: 23.8315, longitude: 91.2868 },
  { code: "MN", name: "Manipur", slug: "manipur", latitude: 24.817, longitude: 93.9368 },
  { code: "ML", name: "Meghalaya", slug: "meghalaya", latitude: 25.5788, longitude: 91.8933 },
  { code: "AR", name: "Arunachal Pradesh", slug: "arunachal-pradesh", latitude: 27.0844, longitude: 93.6053 },
  { code: "NL", name: "Nagaland", slug: "nagaland", latitude: 25.6751, longitude: 94.1086 },
  { code: "MZ", name: "Mizoram", slug: "mizoram", latitude: 23.1645, longitude: 92.9376 },
  { code: "SK", name: "Sikkim", slug: "sikkim", latitude: 27.3389, longitude: 88.6065 },
  { code: "JK", name: "Jammu & Kashmir", slug: "jammu-and-kashmir", latitude: 34.0837, longitude: 74.7973 },
  { code: "LA", name: "Ladakh", slug: "ladakh", latitude: 34.1526, longitude: 77.5771 },
  { code: "DL", name: "Delhi", slug: "delhi", latitude: 28.6139, longitude: 77.209 },
  { code: "PY", name: "Puducherry", slug: "puducherry", latitude: 11.9416, longitude: 79.8083 },
  { code: "CH", name: "Chandigarh", slug: "chandigarh", latitude: 30.7333, longitude: 76.7794 },
  { code: "AN", name: "Andaman & Nicobar Islands", slug: "andaman-and-nicobar", latitude: 11.6234, longitude: 92.7265 },
  { code: "LD", name: "Lakshadweep", slug: "lakshadweep", latitude: 10.5667, longitude: 72.6417 },
  { code: "DN", name: "Dadra & Nagar Haveli and Daman & Diu", slug: "dadra-nagar-haveli-daman-diu", latitude: 20.3974, longitude: 72.8328 },
];

export function nearestStateAnchor(lat: number, lng: number): StateAnchor | null {
  let best: StateAnchor | null = null;
  let bestKm = Infinity;
  for (const anchor of STATE_ANCHORS) {
    const d = haversineKm(lat, lng, anchor.latitude, anchor.longitude);
    if (d < bestKm) {
      bestKm = d;
      best = anchor;
    }
  }
  return best;
}

/** Coarse label like "likely in Karnataka". Only shown for Google-discovered items. */
export function regionLabel(lat: number, lng: number): string | null {
  const anchor = nearestStateAnchor(lat, lng);
  if (!anchor) return null;
  return anchor.name;
}