/**
 * DEVYATRA / TEMPLEORA — V2.4 MASTER DESTINATION INTELLIGENCE OBJECT
 * 
 * Complete destination intelligence architecture uniting:
 * ACCESS -> LOGISTICS -> TRUST -> LIVE CHANGES -> SAFETY -> BOOKING -> PRACTICAL TRAVEL -> MEMORY
 * 
 * Guarantees:
 * - Single canonical intelligence structure powering Map, Temple Page, Search, AI, Journey, Route Lab.
 * - Strict non-fabrication: Never guess coordinates, timings, facilities, or accessibility.
 * - Three-state accessibility: VERIFIED_AVAILABLE, VERIFIED_UNAVAILABLE, VERIFY_ON_GROUND.
 * - Honest unknown states with clear source attribution and last-verified timestamps.
 */

import { type LocationAccuracy, type LocationSource } from "@/lib/map/location-quality";
export type { DistanceBandId, SignificanceTier, TravelStyle } from "@/lib/destinations/extended-types";

// ─── 1. ACCESS POINTS ────────────────────────────────────────────────────────

export type AccessPointType =
  | "MAIN_TEMPLE"
  | "MAIN_ENTRANCE"
  | "DARSHAN_ENTRANCE"
  | "TICKET_COUNTER"
  | "PARKING_ENTRANCE"
  | "ACCESSIBLE_ENTRANCE"
  | "QUEUE_ENTRANCE"
  | "EXIT_GATE"
  | "PRASADAM_COUNTER"
  | "FOOTWEAR_CLOAKROOM";

export interface DestinationAccessPoint {
  id: string;
  type: AccessPointType;
  label: string;
  latitude?: number | null;
  longitude?: number | null;
  source: string;
  accuracy: LocationAccuracy;
  verifiedAt?: string | null;
  status: "VERIFIED" | "SURVEYED" | "UNVERIFIED" | "INFORMATION_UNAVAILABLE";
  notes?: string;
}

// ─── 2. STRUCTURED ADDRESS ───────────────────────────────────────────────────

export interface StructuredAddress {
  formattedAddress: string;
  nativeName?: string | null;
  alternateNames: string[];
  historicalNames: string[];
  transliterations: Record<string, string>; // e.g. { ta: "...", te: "...", kn: "...", hi: "..." }
  locality?: string | null;
  village?: string | null;
  city?: string | null;
  adminUnit?: string | null; // Taluk / Tehsil / Mandal
  district: string;
  state: string;
  stateCode: string;
  pinCode?: string | null;
  country: string;
}

// ─── 3. VISIT LOGISTICS & FACILITIES ─────────────────────────────────────────

export type FacilityStatus = "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN";

export interface LogisticalFacilityItem {
  key: string;
  label: string;
  status: FacilityStatus;
  details?: string | null;
  source: string;
  lastVerifiedAt?: string | null;
}

export interface VisitLogistics {
  queueEntry: LogisticalFacilityItem;
  ticketCounter: LogisticalFacilityItem;
  cloakroom: LogisticalFacilityItem;
  footwearCounter: LogisticalFacilityItem;
  lockers: LogisticalFacilityItem;
  drinkingWater: LogisticalFacilityItem;
  toilets: LogisticalFacilityItem;
  washrooms: LogisticalFacilityItem;
  changingFacilities: LogisticalFacilityItem;
  waitingArea: LogisticalFacilityItem;
  seating: LogisticalFacilityItem;
  prasadam: LogisticalFacilityItem;
  donationCounter: LogisticalFacilityItem;
  atm: LogisticalFacilityItem;
  rules: {
    luggagePolicy: string; // e.g. "Specific cloakroom rules unverified — deposit large bags at official counters"
    photographyPolicy: string; // e.g. "Photography prohibited inside sanctum sanctorum"
    mobilePolicy: string; // e.g. "Mobile phones restricted in inner prakaram"
    footwearPolicy: string; // e.g. "Footwear deposited barefoot before rajagopuram"
    dressCodePolicy: string; // e.g. "Traditional modest attire recommended; specific dress code unverified locally"
  };
}

// ─── 4. PHYSICAL EASE & ACCESSIBILITY ────────────────────────────────────────

export type AccessibilityState =
  | "VERIFIED_AVAILABLE"
  | "VERIFIED_UNAVAILABLE"
  | "VERIFY_ON_GROUND";

export interface AccessibilityFeature {
  feature: string;
  state: AccessibilityState;
  description: string;
  source: string;
  lastVerifiedAt?: string | null;
}

export interface PhysicalWalkingProfile {
  parkingToEntranceMeters?: number | null;
  entranceToQueueMeters?: number | null;
  queueToSanctumMeters?: number | null;
  totalWalkingMeters?: number | null;
  totalStepsCount?: number | null;
  terrainType: "FLAT_PAVED" | "GENTLE_INCLINE" | "STEEP_STAIRS" | "ROCKY_HILL" | "UNVERIFIED";
  shadedPathways: AccessibilityState;
  elderlyRestSeatingIntervals: AccessibilityState;
  notes: string;
}

export interface VisitEase {
  wheelchairAccess: AccessibilityFeature;
  rampAccess: AccessibilityFeature;
  elevatorAccess: AccessibilityFeature;
  groundLevelAccess: AccessibilityFeature;
  buggyBatteryCart: AccessibilityFeature;
  accessibleRestroom: AccessibilityFeature;
  accessibleParking: AccessibilityFeature;
  seniorQueueAssistance: AccessibilityFeature;
  walkingProfile: PhysicalWalkingProfile;
  overallRating: "HIGH_ACCESSIBILITY" | "MODERATE_ASSISTANCE_NEEDED" | "CHALLENGING_TERRAIN" | "UNVERIFIED";
}

// ─── 5. PERSONA MODES: FAMILY & SENIOR ───────────────────────────────────────

export interface FamilyComfortProfile {
  strollerFriendly: AccessibilityState;
  childRestAreas: AccessibilityState;
  drinkingWaterAccessible: boolean;
  familySeatingAvailable: boolean;
  restroomsNearQueue: boolean;
  babyCareChangingRoom: AccessibilityState;
  queuePracticalityScore: "EASY_FOR_TODDLERS" | "MODERATE_WAIT" | "PROLONGED_QUEUE_DIFFICULT" | "UNKNOWN";
  advice: string;
}

export interface SeniorEaseProfile {
  mobilityTier: "LEVEL_WALK_FRIENDLY" | "MINIMAL_STAIRS" | "STEEP_HILL_CLIMB_DIFFICULT" | "UNVERIFIED";
  batteryCartAvailable: boolean;
  wheelchairAssistanceAvailable: boolean;
  seniorPriorityDarshan: boolean;
  shadedRestPointsPresent: boolean;
  estimatedWalkingMinutes: number;
  stepsCount: number | null;
  recommendedDarshanWindow?: string | null;
  advice: string;
}

// ─── 6. ROUTE RESTRICTIONS & ROAD TOPOLOGY ───────────────────────────────────

export interface RouteRestriction {
  id: string;
  type: "TOLL" | "ONE_WAY" | "VEHICLE_RESTRICTION" | "PEDESTRIAN_ONLY" | "HILL_RESTRICTION" | "SEASONAL_CLOSURE" | "ROAD_CLOSURE" | "EVENT_TRAFFIC";
  title: string;
  description: string;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED" | "UNKNOWN";
  affectedSection?: string;
  source: string;
  verifiedAt: string;
}

// ─── 7. WEATHER INTELLIGENCE & FRESHNESS ─────────────────────────────────────

export type DataFreshnessClass =
  | "LIVE"
  | "RECENT"
  | "SCHEDULED"
  | "STATIC"
  | "STALE"
  | "UNKNOWN";

export interface DestinationWeather {
  temperatureCelsius?: number;
  condition?: "CLEAR" | "PARTLY_CLOUDY" | "OVERCAST" | "RAIN" | "THUNDERSTORM" | "HEAVY_HEAT" | "MIST" | "UNKNOWN";
  rainProbabilityPercent?: number;
  heatWarning?: string | null;
  sunrise?: string | null; // HH:mm
  sunset?: string | null;  // HH:mm
  retrievedAt: string;
  freshnessClass: DataFreshnessClass;
  freshnessLabel: string;
  plannerImplication?: string;
}

// ─── 8. SACRED CALENDAR & PANCHANG VARIATION ─────────────────────────────────

export interface DestinationCalendarEvent {
  id: string;
  name: string;
  type: "FESTIVAL" | "SPECIAL_POOJA" | "SPECIAL_DARSHAN" | "TEMPLE_ANNIVERSARY" | "LUNAR_EVENT" | "SEASONAL_CLOSURE";
  date: string;
  dateConfidence: "OFFICIAL_ANNOUNCED" | "ASTRONOMICAL_PANCHANG_CALCULATED" | "ESTIMATED_SEASONAL";
  lunarTithi?: string;
  source: string;
  bookingImplications?: string;
  crowdExpectation: "NORMAL" | "HIGH" | "PEAK_PILGRIMAGE" | "UNKNOWN";
  regionalVariationNote: string; // Explains regional Panchang variations
  lastVerifiedAt?: string | null;
}

// ─── 9. BOOKING INTELLIGENCE & HIERARCHY ─────────────────────────────────────

export type AuthoritySourceHierarchy =
  | "OFFICIAL_TEMPLE_ADMINISTRATION"
  | "GOVERNMENT_ENDOWMENT_BOARD"
  | "STATE_TOURISM_CORPORATION"
  | "AUTHORIZED_BOOKING_PROVIDER"
  | "THIRD_PARTY_PROVIDER"
  | "UNVERIFIED";

export interface BookingTicketCategory {
  name: string;
  priceInr?: number | null;
  priceLabel: string; // "Free", "₹100 (Official)", "Donation based", "Price unverified"
  bookingMode: "ONLINE_MANDATORY" | "ONLINE_OR_COUNTER" | "COUNTER_ONLY" | "UNVERIFIED";
  quotaCategory?: string; // "General", "Senior Citizen", "Foreign Pilgrim", "Special Darshan"
  advanceBookingDays?: number | null;
  cancellationAllowed?: boolean;
}

export interface StructuredBookingIntelligence {
  bookingRequired: boolean;
  bookingAvailable: boolean;
  primaryPortalUrl?: string | null;
  portalAuthorityTier: AuthoritySourceHierarchy;
  portalAuthorityLabel: string;
  bookingWindowNotice?: string | null;
  ticketCategories: BookingTicketCategory[];
  recentBookingUpdateAlert?: {
    summary: string;
    changedAt: string;
    source: string;
  } | null;
  provenance: {
    source: string;
    lastVerifiedAt: string;
    verificationStatus: string;
  };
}

// ─── 10. BUSINESS FRESHNESS & STATUS (STAY, FOOD, FACILITIES) ────────────────

export type BusinessOpenStatus =
  | "OPEN"
  | "CLOSED"
  | "TEMPORARILY_CLOSED"
  | "PERMANENTLY_CLOSED"
  | "STATUS_UNAVAILABLE";

export interface VerifiedBusinessItem {
  id: string;
  name: string;
  category: "HOTEL" | "RESTAURANT" | "HOSPITAL" | "PHARMACY" | "FUEL" | "EV_CHARGING" | "POLICE";
  cuisineOrSpecialty?: string | null;
  isVegetarianOrSatvik?: "VERIFIED_SATVIK" | "VEGETARIAN" | "MIXED_CUISINE" | "UNVERIFIED";
  distanceAirKm: number;
  distanceRoadKm: number;
  estimatedDriveMinutes: number;
  openStatus: BusinessOpenStatus;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  provider: string;
  retrievedAt: string;
  freshnessClass: DataFreshnessClass;
  freshnessText: string;
  sourceConfidence: "OFFICIAL_REGISTRY" | "GOOGLE_PLACES_VERIFIED" | "CURATED" | "UNVERIFIED";
}

// ─── 11. EMERGENCY & SAFETY MODE ─────────────────────────────────────────────

export interface SafetyIntelligenceContext {
  destinationId: string;
  destinationName: string;
  emergencyHelplines: {
    nationalEmergency: string; // "112"
    police: string;           // "100" or local police station
    ambulance: string;        // "108"
    templeAdministration?: string;
    templeDisasterManagement?: string;
  };
  nearestHospital?: VerifiedBusinessItem | null;
  nearestPharmacy?: VerifiedBusinessItem | null;
  nearestPoliceStation?: VerifiedBusinessItem | null;
  templeFirstAidPost?: {
    available: boolean;
    locationNote: string;
    source: string;
  } | null;
  safetyAdvisory?: string | null;
}

// ─── 12. CROWD INTELLIGENCE & TRANSPARENT METHODOLOGY ────────────────────────

export type CrowdSignalType =
  | "LIVE_OBSERVED"
  | "PROVIDER_SIGNAL"
  | "USER_REPORTED"
  | "SCHEDULED_PEAK"
  | "ESTIMATED_PANCHANG"
  | "UNKNOWN";

export interface CrowdIntelligence {
  signalType: CrowdSignalType;
  signalLabel: string;
  level: "LOW" | "MODERATE" | "HIGH" | "INTENSE_PEAK" | "UNKNOWN";
  methodologyDisclaimer: string;
  estimatedDarshanWaitMinutes?: number | null;
  retrievedAt: string;
  freshnessClass: DataFreshnessClass;
}

// ─── 13. TEMPORAL CHANGE DETECTION & WHAT CHANGED? ───────────────────────────

export interface TemporalDataChange {
  id: string;
  field: "TIMINGS" | "BOOKING" | "FACILITIES" | "CONTACT" | "LOCATION" | "OFFICIAL_WEBSITE" | "FESTIVAL" | "OPERATIONAL_STATE";
  fieldLabel: string;
  previousValue: string;
  currentValue: string;
  changedAt: string;
  sourceAuthority: string;
  verificationState: "VERIFIED" | "PENDING_AUDIT" | "COMMUNITY_FLAGGED";
  explanation: string;
}

// ─── 14. SOURCE CONFLICT RESOLUTION & LEDGER ─────────────────────────────────

export interface SourceConflictRecord {
  id: string;
  fieldName: string;
  sourceA: {
    sourceName: string;
    value: string;
    date: string;
    authorityRank: number;
  };
  sourceB: {
    sourceName: string;
    value: string;
    date: string;
    authorityRank: number;
  };
  conflictStatus: "ACTIVE_CONFLICT" | "RESOLVED_BY_AUTHORITY" | "HUMAN_AUDIT_REQUIRED";
  publicDisclosureText: string;
}

export interface FactProvenanceRecord {
  factKey: string;
  factLabel: string;
  currentValue: string;
  sourceName: string;
  sourceType: string;
  sourceUrl?: string | null;
  retrievedAt: string;
  verifiedAt: string;
  publishedAt: string;
  isOfficialStatutory: boolean;
  auditTrail: string[];
}

export interface DestinationSourceLedger {
  overallVerificationStatus: "VERIFIED_OFFICIAL" | "VERIFIED_SOURCE" | "COMMUNITY_VERIFIED" | "UNVERIFIED";
  lastAuditDate: string;
  facts: FactProvenanceRecord[];
  conflicts: SourceConflictRecord[];
}

// ─── 15. DESTINATION GRAPH RELATIONSHIPS ─────────────────────────────────────

export interface DestinationRelationships {
  city: { name: string; slug?: string };
  pilgrimageCircuits: Array<{ name: string; slug: string }>;
  associatedDynasties: string[];
  sacredRiversAndSangams: string[];
  sacredHillsAndParvats: string[];
  connectedCorridorHighways: string[];
  pairedTwinSanctums: Array<{ id: string; name: string; slug: string; distanceKm: number }>;
}

// ─── 16. PRACTICAL TRAVEL FEASIBILITY (DISTANCE != VISITABILITY) ─────────────

export interface PracticalTravelFeasibility {
  geographicDistanceKm: number;
  roadDistanceKm: number;
  estimatedDriveMinutes: number;
  visitDurationMinutes: number;
  totalTimeRequiredMinutes: number;
  isFeasibleInAvailableTime: boolean;
  feasibilityScore: "HIGHLY_FEASIBLE" | "TIGHT_SCHEDULE" | "UNREALISTIC_FOR_TODAY";
  feasibilityReason: string;
  operatingWindowConstraint?: {
    isOpenDuringVisit: boolean;
    openTime?: string;
    closeTime?: string;
  };
}

// ─── 17. MASTER CANONICAL DESTINATION INTELLIGENCE OBJECT ────────────────────

export interface MasterDestinationIntelligence {
  // Identity
  id: string;
  slug: string;
  name: string;
  nativeName?: string | null;
  alternateNames: string[];
  mainDeity?: string | null;
  tradition: string[];
  architecture?: string | null;
  historicalPeriod?: string | null;
  establishedYear?: string | null;
  description: string;
  images: string[];

  // Location & Geometry
  latitude: number;
  longitude: number;
  locationAccuracy: LocationAccuracy;
  locationSource: LocationSource;
  isWithinSovereignIndia: boolean;
  isCentroidFallback: boolean;

  // Exact Access Points
  accessPoints: DestinationAccessPoint[];

  // Structured Address
  address: StructuredAddress;

  // Visit Logistics & Accessibility
  visitLogistics: VisitLogistics;
  visitEase: VisitEase;
  familyComfort: FamilyComfortProfile;
  seniorEase: SeniorEaseProfile;

  // Route Restrictions
  routeRestrictions: RouteRestriction[];

  // Live Conditions
  weather: DestinationWeather;
  crowd: CrowdIntelligence;
  calendarEvents: DestinationCalendarEvent[];

  // Booking & Commercial
  booking: StructuredBookingIntelligence;

  // Surrounding Ecosystem
  emergencySafety: SafetyIntelligenceContext;
  nearbyHotels: VerifiedBusinessItem[];
  nearbyDining: VerifiedBusinessItem[];
  nearbyFuelEv: VerifiedBusinessItem[];

  // Destination Graph
  relationships: DestinationRelationships;

  // Data Integrity, Trust & Provenance
  sourceLedger: DestinationSourceLedger;
  recentChanges: TemporalDataChange[];

  // Metadata
  freshnessClass: DataFreshnessClass;
  lastVerifiedAt: string;
  shareableUrl: string;
}
