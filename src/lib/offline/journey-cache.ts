/**
 * Offline Journey Caching & Storage Engine (Phase 23)
 *
 * Enables pilgrims to save full itineraries, emergency contact numbers,
 * verified darshan slots, and stop sequences for offline use in high-altitude
 * or remote forested sanctums with zero cellular connectivity.
 */

export interface OfflineTempleSnapshot {
  id: string;
  slug: string;
  name: string;
  nameLocal?: string;
  state: string;
  district: string;
  location: string;
  latitude: number;
  longitude: number;
  timingsSummary: string;
  generalDarshanRule: string;
  emergencyPhone?: string;
  verifiedSourceOrg: string;
  cachedAtIso: string;
}

export interface OfflineJourneyPackage {
  id: string;
  title: string;
  totalDays: number;
  dateGenerated: string;
  offlineNotice: string;
  stops: Array<{
    day: number;
    time: string;
    place: string;
    action: string;
    latitude?: number;
    longitude?: number;
  }>;
  templeSnapshots: OfflineTempleSnapshot[];
}

const OFFLINE_STORAGE_KEY = "devyatra_offline_journeys_v1";

export function packageJourneyForOffline(
  journeyId: string,
  title: string,
  totalDays: number,
  stops: OfflineJourneyPackage["stops"],
  temples: OfflineTempleSnapshot[]
): OfflineJourneyPackage {
  const now = new Date().toISOString();
  return {
    id: journeyId,
    title,
    totalDays,
    dateGenerated: now,
    offlineNotice: `Offline Pilgrim Snapshot saved on ${now.slice(0, 10)}. Timings & darshan slots are verified as of save date. Connect to network for live IST telemetry.`,
    stops,
    templeSnapshots: temples,
  };
}

export function saveOfflinePackage(pkg: OfflineJourneyPackage): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    const existing: OfflineJourneyPackage[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((p) => p.id !== pkg.id);
    filtered.unshift(pkg);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error("Failed to save offline journey package:", err);
    return false;
  }
}

export function getOfflinePackages(): OfflineJourneyPackage[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function removeOfflinePackage(journeyId: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!raw) return;
    const existing: OfflineJourneyPackage[] = JSON.parse(raw);
    const filtered = existing.filter((p) => p.id !== journeyId);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete offline package:", err);
  }
}
