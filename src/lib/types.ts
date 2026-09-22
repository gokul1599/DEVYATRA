export type VerificationStatus =
  | "VERIFIED_OFFICIAL"
  | "VERIFIED_SOURCE"
  | "GOVERNMENT_SOURCE"
  | "TRUSTED_SOURCE"
  | "COMMUNITY_REPORTED"
  | "GOOGLE_PLACES"
  | "NEEDS_VERIFICATION"
  | "UNVERIFIED";

export type SourceType =
  | "official"
  | "government"
  | "trusted"
  | "community"
  | "google"
  | "unverified";

export interface SourceRef {
  id: string;
  org: string;
  url?: string;
  type: SourceType;
  status: VerificationStatus;
  lastVerified: string;
}

export interface Verification {
  status: VerificationStatus;
  source?: SourceRef;
  note?: string;
}

export type RegionType = "state" | "union_territory";

export interface StateData {
  code: string;
  slug: string;
  name: string;
  nameLocal?: string;
  type: RegionType;
  subUnitTerm: string;
  capital: string;
  tagline?: string;
  districts: string[];
}

export interface DistrictData {
  name: string;
  slug: string;
  stateCode: string;
  adminUnits: AdminUnit[];
}

export interface AdminUnit {
  name: string;
  slug: string;
  locations: LocationRef[];
}

export interface LocationRef {
  name: string;
  slug: string;
  kind: "village" | "town" | "city";
}

export interface Temple {
  id: string;
  slug: string;
  name: string;
  nameLocal?: string;
  aliases: string[];
  stateCode: string;
  districtSlug: string;
  district: string;
  subUnitSlug?: string;
  subUnit?: string;
  locationSlug: string;
  location: string;
  locationKind: "village" | "town" | "city";
  latitude: number;
  longitude: number;
  mainDeity: string;
  deities: string[];
  type: string;
  tradition: string[];
  architecture?: string;
  historicalPeriod?: string;
  establishedYear?: string;
  description: string;
  whyFamous: WhyFamous[];
  history: HistoryPhase[];
  timings: TimingSchedule | null;
  booking: BookingInfo;
  festivals: FestivalEvent[];
  images: string[];
  badges: TempleBadge[];
  verified: boolean;
  isCentroidFallback?: boolean;
  entryFee: EntryFee;
  source: SourceRef;
}

export interface WhyFamous {
  icon: string;
  title: string;
  body: string;
  type: "historic" | "belief";
}

export interface HistoryPhase {
  title: string;
  year?: string;
  body: string;
}

export type TimingSlot = {
  label: string;
  opening?: string;
  closing?: string;
  note?: string;
};

export interface TimingSchedule {
  slots: TimingSlot[];
  verification: Verification;
  todayNote?: string;
}

export interface EntryFee {
  generalDarshan: "free" | "paid" | "unavailable";
  specialDarshan?: string;
  notes?: string;
  bookable: boolean;
  bookingMode: "online" | "offline" | "unavailable" | "free";
  bookingUrl?: string;
  bookingOrg?: string;
  verification: Verification;
}

/** Booking mirrors EntryFee — a temple's entry/bookable darshan record. */
export type BookingInfo = EntryFee;

export interface FestivalEvent {
  id: string;
  name: string;
  templeId: string;
  month: number;
  day: number;
  dateLabel: string;
  repeating: boolean;
  description: string;
  specialDarshan?: boolean;
  source?: SourceRef;
}

export type TempleBadge =
  | "Historic"
  | "Major Pilgrimage"
  | "Heritage"
  | "Online Booking"
  | "Free Entry"
  | "Festival"
  | "Verified"
  | "UNESCO World Heritage";

export type NearbyKind =
  | "temple"
  | "restaurant"
  | "hotel"
  | "attraction"
  | "parking"
  | "hospital"
  | "pharmacy"
  | "restroom"
  | "atm"
  | "fuel"
  | "transport"
  | "police"
  | "shopping"
  | "nature";

export interface NearbyPlace {
  id: string;
  templeId: string;
  name: string;
  kind: NearbyKind;
  distanceKm: number;
  openNow?: boolean;
  priceHint?: string;
  cuisine?: string[];
  rating?: number;
  recommendation?: string;
  verified: boolean;
  url?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailHash?: string;
  passwordHash?: string;
  role: "user" | "admin";
  created: string;
}

export interface CommunityReport {
  id: string;
  templeId?: string;
  kind:
    | "missing_temple"
    | "incorrect_timing"
    | "incorrect_info"
    | "new_photo"
    | "closed_temple"
    | "booking_link_changed"
    | "festival_update";
  detail: string;
  submittedBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  created: string;
  data: { summary: string; duration: string; estimatedCost: string; items: ItineraryItem[]; warnings: string[] };
}

export interface ItineraryItem {
  time: string;
  place: string;
  type: string;
  durationMinutes: number;
  distanceKm: number;
  reason: string;
  source: string;
}

export const DEITIES = [
  "Shiva", "Vishnu", "Krishna", "Rama", "Venkateswara", "Hanuman",
  "Ganesha", "Durga", "Lakshmi", "Saraswati", "Kali", "Parvati / Amman",
  "Murugan / Kartikeya", "Ayyappa", "Surya", "Narasimha", "Dattatreya",
  "Jagannath", "Sai Baba", "Other local deities",
] as const;

export const TRADITIONS = ["Shaiva", "Vaishnava", "Shakta", "Smarta", "Other documented traditions"] as const;

export const ARCHITECTURE_STYLES = ["Nagara", "Dravidian", "Vesara", "Kalinga", "Other"] as const;

export const EXPERIENCE_BADGES = [
  "Historic",
  "Heritage",
  "Major Pilgrimage",
  "Festival",
  "Family Friendly",
  "Accessible",
  "Free Entry",
  "Online Booking",
] as const;

export const MANDAL_TERMS = {
  AP: "Mandal",
  TS: "Mandal",
  KA: "Taluk",
  TN: "Taluk",
  KL: "Taluk",
  MH: "Taluka",
  GJ: "Taluka",
  RJ: "Tehsil",
  UP: "Tehsil",
  UK: "Tehsil",
  MP: "Tehsil",
  OD: "Tehsil",
  BR: "Sub-district",
  JH: "Sub-division",
  WB: "Block",
  AS: "Sub-division",
  GA: "Taluka",
  HR: "Tehsil",
  PB: "Tehsil",
  CG: "Tehsil",
  TR: "Sub-division",
  MN: "Sub-division",
  ML: "Block",
  AR: "Circle",
  NL: "Circle",
  MZ: "Block",
  SK: "Sub-division",
  JK: "Tehsil",
  LA: "Tehsil",
  DL: "Districts",
  PY: "Circle",
  CH: "Tehsil",
  AN: "Tehsil",
  DN: "Taluka",
  LD: "Sub-division",
} as const;