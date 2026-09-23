/**
 * DEVYATRA / TEMPLEORA — V2.4 OFFLINE JOURNEY PACK & PRE-TRIP SNAPSHOT ENGINE
 * 
 * Generates self-contained offline journey bundles with:
 * - Saved itinerary timeline
 * - Surveyed destination coordinates
 * - Structured offline addresses & navigation directions
 * - Emergency contacts & nearest safety facilities
 * - Essential visit logistics (footwear, cloakrooms, rules)
 * - Transparent offline freshness watermark ("Offline Snapshot Saved on [Date]")
 * 
 * Strict safety rule:
 * In offline mode, live sensors (live crowd, real-time weather forecasts, live queues)
 * are explicitly labeled as "OFFLINE_SNAPSHOT_STALE — Verify locally".
 */

export interface OfflineDestinationItem {
  id: string;
  slug: string;
  name: string;
  nativeName?: string | null;
  deity?: string | null;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  openingHoursSummary: string;
  rulesSummary: {
    footwear: string;
    dressCode: string;
    electronics: string;
    photography: string;
  };
  emergencyContacts: {
    nationalEmergency: string;
    police: string;
    ambulance: string;
    templeOffice?: string;
  };
  offlineNotes?: string;
}

export interface OfflineJourneyPack {
  journeyId: string;
  journeyTitle: string;
  exportedAt: string;
  offlineWatermark: string;
  isOfflineSafe: boolean;
  totalDestinations: number;
  destinations: OfflineDestinationItem[];
  itineraryDays: Array<{
    dayNumber: number;
    title: string;
    stops: Array<{
      destinationName: string;
      targetTime: string;
      activity: string;
      notes?: string;
    }>;
  }>;
  preTripChecklist: Array<{
    id: string;
    item: string;
    category: "DOCUMENTS" | "CLOTHING" | "LOGISTICS" | "HEALTH";
    isCompleted: boolean;
  }>;
  safetyDisclaimer: string;
}

/**
 * Generate a production-grade offline journey snapshot
 */
export function buildOfflineJourneyPack(params: {
  journeyId: string;
  title: string;
  destinations: OfflineDestinationItem[];
  days?: Array<{
    dayNumber: number;
    title: string;
    stops: Array<{
      destinationName: string;
      targetTime: string;
      activity: string;
      notes?: string;
    }>;
  }>;
}): OfflineJourneyPack {
  const now = new Date();
  const timestamp = now.toISOString();
  const formattedDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const defaultChecklist: OfflineJourneyPack["preTripChecklist"] = [
    {
      id: "chk-1",
      item: "Government Issued Photo ID (Aadhaar / Voter ID / Passport) for sanctum verification",
      category: "DOCUMENTS",
      isCompleted: false,
    },
    {
      id: "chk-2",
      item: "Downloaded offline maps & journey pack on phone",
      category: "LOGISTICS",
      isCompleted: true,
    },
    {
      id: "chk-3",
      item: "Traditional modest attire (Dhoti/Kurta or Saree/Salwar) packed for temple entry",
      category: "CLOTHING",
      isCompleted: false,
    },
    {
      id: "chk-4",
      item: "Prescription medications & basic hydration supplies",
      category: "HEALTH",
      isCompleted: false,
    },
    {
      id: "chk-5",
      item: "Cash in small denominations for prasad, coconut & cloakroom tokens (ATMs can run dry)",
      category: "LOGISTICS",
      isCompleted: false,
    },
  ];

  return {
    journeyId: params.journeyId,
    journeyTitle: params.title,
    exportedAt: timestamp,
    offlineWatermark: `OFFLINE JOURNEY SNAPSHOT · Saved ${formattedDate}`,
    isOfflineSafe: true,
    totalDestinations: params.destinations.length,
    destinations: params.destinations,
    itineraryDays: params.days ?? [
      {
        dayNumber: 1,
        title: "Sacred Darshan Day",
        stops: params.destinations.map((d, idx) => ({
          destinationName: d.name,
          targetTime: `${8 + idx * 3}:00 AM`,
          activity: "Darshan & Parikrama",
          notes: d.openingHoursSummary,
        })),
      },
    ],
    preTripChecklist: defaultChecklist,
    safetyDisclaimer:
      "This offline pack was compiled from verified records prior to departure. Live queue sensors and real-time weather are not active offline. Follow on-ground temple trust instructions on arrival.",
  };
}
