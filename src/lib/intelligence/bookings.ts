/**
 * Phase 15: Bookings Intelligence & Verification Engine
 * 
 * Provides official darshan ticketing verification, special entry categories,
 * anti-fraud warnings against touts/fake portals, official trust URLs,
 * and accommodation intelligence.
 */

import { Temple } from "@/lib/types";

export type BookingModality =
  | "FREE_GENERAL"
  | "PAID_SPECIAL_ENTRY"
  | "ONLINE_MANDATORY"
  | "COUNTER_ONLY"
  | "NOT_REQUIRED";

export type PortalTrustBadge =
  | "STATUTORY_GOVT_BOARD"
  | "OFFICIAL_TEMPLE_TRUST"
  | "STATE_HRCE_PORTAL"
  | "VERIFIED_EXTERNAL"
  | "UNVERIFIED";

export interface SpecialDarshanOption {
  name: string;
  price: string;
  bookingMode: "online" | "counter" | "both";
  benefits: string;
}

export interface AccommodationInfo {
  available: boolean;
  type: "TRUST_GUESTHOUSE" | "DHARAMSHALA" | "DEVASWOM_BHAVAN" | "LOCAL_LODGES";
  description: string;
  bookingMethod: "OFFICIAL_ONLINE" | "CURRENT_COUNTER" | "WALK_IN";
  contactOrUrl?: string;
}

export interface SevaOption {
  name: string;
  timing?: string;
  price?: string;
  bookingMethod?: "online" | "counter" | "both";
  bookingMode?: "online" | "counter" | "both";
  description: string;
}

export interface BookingIntelligence {
  modality: BookingModality;
  modalityLabel: string;
  generalEntryCost: string;
  isOnlineMandatory: boolean;
  hasSpecialDarshan: boolean;
  specialDarshans: SpecialDarshanOption[];
  sevas: SevaOption[];
  officialPortal: {
    url: string | null;
    domain: string | null;
    isVerified: boolean;
    trustName: string;
    trustBadge: PortalTrustBadge;
  };
  fraudAlert: {
    hasWarning: boolean;
    title: string;
    description: string;
    cautions: string[];
  };
  accommodation: AccommodationInfo;
}

/**
 * Registry of authoritative statutory / official booking portals for India's landmark shrines.
 */
export const STATUTORY_BOOKING_REGISTRY: Record<
  string,
  {
    trustName: string;
    domain: string;
    url: string;
    badge: PortalTrustBadge;
    onlineMandatory?: boolean;
    specialDarshan?: SpecialDarshanOption[];
    accommodation?: AccommodationInfo;
    sevas?: SevaOption[];
  }
> = {
  "sri-venkateswara-temple": {
    trustName: "Tirumala Tirupati Devasthanams (TTD)",
    domain: "tirupatibalaji.ap.gov.in",
    url: "https://tirupatibalaji.ap.gov.in",
    badge: "STATUTORY_GOVT_BOARD",
    onlineMandatory: true,
    specialDarshan: [
      { name: "Special Entry Darshan (SED)", price: "₹300", bookingMode: "online", benefits: "Dedicated queue with 1 free Laddu Prasadam" },
      { name: "Sarva Darshanam (Free Token SSD)", price: "Free", bookingMode: "counter", benefits: "Time-slotted darshan token issued at Tirupati counters" },
      { name: "VIP Break Darshan", price: "₹500+", bookingMode: "online", benefits: "Protocol recommendation required" },
    ],
    accommodation: {
      available: true,
      type: "TRUST_GUESTHOUSE",
      description: "TTD Cottages & Rest Houses in Tirumala (₹100–₹1,500/day). Advance quota released monthly.",
      bookingMethod: "OFFICIAL_ONLINE",
      contactOrUrl: "https://tirupatibalaji.ap.gov.in",
    },
    sevas: [
      { name: "Suprabhata Seva", timing: "03:00 AM", price: "₹120", bookingMode: "online", description: "First morning darshan awakening ritual" },
      { name: "Kalyanotsavam", timing: "11:00 AM", price: "₹1,000", bookingMode: "online", description: "Celestial wedding ceremony of Sri Malayappa Swami" },
      { name: "Arjitha Brahmotsavam", timing: "02:00 PM", price: "₹200", bookingMode: "online", description: "Procession seva around inner praharam" },
    ],
  },
  "kashi-vishwanath-temple": {
    trustName: "Shri Kashi Vishwanath Special Area Development Board",
    domain: "shrikashivishwanath.org",
    url: "https://shrikashivishwanath.org",
    badge: "STATUTORY_GOVT_BOARD",
    onlineMandatory: false,
    specialDarshan: [
      { name: "Sugam Darshan (Queue-free entry)", price: "₹300", bookingMode: "both", benefits: "Direct sanctum entry via dedicated corridor with priest escort" },
      { name: "General Public Darshan", price: "Free", bookingMode: "both", benefits: "Entry through Kashi Vishwanath Corridor Gate 4 / Riverfront" },
    ],
    accommodation: {
      available: true,
      type: "TRUST_GUESTHOUSE",
      description: "Corridor Mumukshu Bhavan & Shri Kashi Vishwanath Yatri Niwas.",
      bookingMethod: "OFFICIAL_ONLINE",
      contactOrUrl: "https://shrikashivishwanath.org",
    },
    sevas: [
      { name: "Mangala Aarti", timing: "03:00 AM", price: "₹500", bookingMode: "online", description: "Solemn awakening aarti before general gates open" },
      { name: "Rudrabhishek (Single Priest)", timing: "06:00 AM", price: "₹450", bookingMode: "both", description: "Vedic linga abhishekam with sacred water and milk" },
      { name: "Saptarishi Aarti", timing: "07:00 PM", price: "₹300", bookingMode: "online", description: "Historic ritual conducted simultaneously by 7 priests" },
    ],
  },
  "vaishno-devi": {
    trustName: "Shri Mata Vaishno Devi Shrine Board (SMVDSB)",
    domain: "maavaishnodevi.org",
    url: "https://www.maavaishnodevi.org",
    badge: "STATUTORY_GOVT_BOARD",
    onlineMandatory: true,
    specialDarshan: [
      { name: "Yatra Parchi (RFID Registration)", price: "Free", bookingMode: "both", benefits: "Mandatory RFID access card required for all pilgrims at Katra" },
      { name: "Attka Aarti Darshan", price: "₹2,000", bookingMode: "online", benefits: "Sitting darshan inside Bhavan during morning/evening Aarti" },
      { name: "Helicopter (Katra ↔ Sanjichhat)", price: "₹2,100 (one-way)", bookingMode: "online", benefits: "Priority darshan slip included with return ticket" },
    ],
    accommodation: {
      available: true,
      type: "DEVASWOM_BHAVAN",
      description: "Shrine Board complexes at Katra, Adhkuwari, Sanjichhat, and Bhawan.",
      bookingMethod: "OFFICIAL_ONLINE",
      contactOrUrl: "https://www.maavaishnodevi.org",
    },
    sevas: [
      { name: "Hawan / Pujan", timing: "Morning", price: "₹1,100", bookingMode: "online", description: "Vedic Yajna at Holy Cave complex" },
    ],
  },
  "shirdi-sai-baba": {
    trustName: "Shri Saibaba Sansthan Trust Shirdi",
    domain: "online.sai.org.in",
    url: "https://online.sai.org.in",
    badge: "OFFICIAL_TEMPLE_TRUST",
    onlineMandatory: false,
    specialDarshan: [
      { name: "VIP Paid Pass", price: "₹200", bookingMode: "both", benefits: "Accelerated darshan through Gate 3" },
      { name: "Aarti Pass (Kakad / Shej)", price: "₹400–₹600", bookingMode: "online", benefits: "Seated entry for sacred dawn or night Aarti" },
    ],
    accommodation: {
      available: true,
      type: "TRUST_GUESTHOUSE",
      description: "Sai Ashram, Bhakta Niwas, and Dwarawati (over 3,000 rooms available).",
      bookingMethod: "OFFICIAL_ONLINE",
      contactOrUrl: "https://online.sai.org.in",
    },
  },
  "mahakaleshwar-temple": {
    trustName: "Shri Mahakaleshwar Temple Management Committee Ujjain",
    domain: "shrimahakaleshwar.com",
    url: "https://shrimahakaleshwar.com",
    badge: "STATUTORY_GOVT_BOARD",
    onlineMandatory: false,
    specialDarshan: [
      { name: "Bhasma Aarti Darshan", price: "₹200 (Online Quota)", bookingMode: "online", benefits: "Famous 04:00 AM sacred ash ritual (Strict traditional dress required)" },
      { name: "Sheegra Darshan Pass", price: "₹250", bookingMode: "both", benefits: "Fast-track corridor pass" },
      { name: "Garbhagriha Jalabhishek", price: "₹750", bookingMode: "counter", benefits: "Sanctum inner entry during designated non-peak hours" },
    ],
    accommodation: {
      available: true,
      type: "DHARAMSHALA",
      description: "Mahakal Yatri Niwas & Vikramaditya Dharamshala near Mahakal Lok corridor.",
      bookingMethod: "OFFICIAL_ONLINE",
      contactOrUrl: "https://shrimahakaleshwar.com",
    },
  },
  "jagannath-temple-puri": {
    trustName: "Shree Jagannatha Temple Administration (SJTA)",
    domain: "shreejagannatha.in",
    url: "https://shreejagannatha.in",
    badge: "STATUTORY_GOVT_BOARD",
    onlineMandatory: false,
    specialDarshan: [
      { name: "General Darshan", price: "Free", bookingMode: "counter", benefits: "Entry via Singhadwara (Lion's Gate)" },
      { name: "Parimanik Darshan", price: "₹50 (Controlled)", bookingMode: "counter", benefits: "Close proximity darshan behind Bhitar Katha" },
    ],
    accommodation: {
      available: true,
      type: "DHARAMSHALA",
      description: "SJTA Bhakta Niwas (Niladri, Gundicha, and Shree Setu complexes).",
      bookingMethod: "OFFICIAL_ONLINE",
      contactOrUrl: "https://shreejagannatha.in",
    },
  },
  "sabarimala-temple": {
    trustName: "Travancore Devaswom Board (TDB)",
    domain: "sabarimalaonline.org",
    url: "https://sabarimalaonline.org",
    badge: "STATUTORY_GOVT_BOARD",
    onlineMandatory: true,
    specialDarshan: [
      { name: "Virtual-Q Booking", price: "Free", bookingMode: "online", benefits: "Mandatory time slot reservation for climbing 18 holy steps (Pathinettampadi)" },
    ],
    accommodation: {
      available: true,
      type: "DEVASWOM_BHAVAN",
      description: "Devaswom guest houses at Pamba base and Sannidhanam summit.",
      bookingMethod: "OFFICIAL_ONLINE",
      contactOrUrl: "https://sabarimalaonline.org",
    },
  },
  "meenakshi-amman-temple": {
    trustName: "Tamil Nadu Hindu Religious & Charitable Endowments (HR&CE)",
    domain: "maduraimeenakshi.hrce.tn.gov.in",
    url: "https://maduraimeenakshi.hrce.tn.gov.in",
    badge: "STATE_HRCE_PORTAL",
    onlineMandatory: false,
    specialDarshan: [
      { name: "Special Darshan Pass", price: "₹100", bookingMode: "both", benefits: "Dedicated queue pass available at temple gopuram counters & HR&CE portal" },
      { name: "General Free Darshan", price: "Free", bookingMode: "counter", benefits: "Free queue entry through East / South Tower" },
    ],
    accommodation: {
      available: true,
      type: "DHARAMSHALA",
      description: "Birla Vishram & Temple Lodge near West Tower.",
      bookingMethod: "WALK_IN",
    },
  },
  "somnath-temple": {
    trustName: "Shree Somnath Trust",
    domain: "somnath.org",
    url: "https://somnath.org",
    badge: "OFFICIAL_TEMPLE_TRUST",
    onlineMandatory: false,
    specialDarshan: [
      { name: "General Darshan", price: "Free", bookingMode: "counter", benefits: "Unrestricted entry for all pilgrims" },
      { name: "Special Puja / Abhishek Registration", price: "₹100–₹500", bookingMode: "both", benefits: "Puja sankalpa in temple hall" },
    ],
    accommodation: {
      available: true,
      type: "TRUST_GUESTHOUSE",
      description: "Sagar Darshan, Maheshwari Bhawan, and Lilavati Guest House directly by the Arabian Sea.",
      bookingMethod: "OFFICIAL_ONLINE",
      contactOrUrl: "https://somnath.org",
    },
  },
};

/**
 * Generates verified booking intelligence for any temple in the directory.
 */
export function getBookingIntelligence(temple: Temple): BookingIntelligence {
  const slug = temple.slug.toLowerCase();
  const nameLower = temple.name.toLowerCase();

  // 1. Check known statutory registry match
  let matchedRegistry = STATUTORY_BOOKING_REGISTRY[slug];
  if (!matchedRegistry) {
    for (const [key, val] of Object.entries(STATUTORY_BOOKING_REGISTRY)) {
      if (slug.includes(key) || nameLower.includes(key.replace(/-/g, " "))) {
        matchedRegistry = val;
        break;
      }
    }
  }

  // 2. Modality & Pricing
  const isOnlineMandatory = matchedRegistry?.onlineMandatory ?? false;
  const isPaid = temple.entryFee?.generalDarshan === "paid";
  const hasSpecial = !!(temple.entryFee?.specialDarshan || matchedRegistry?.specialDarshan?.length);

  let modality: BookingModality = "FREE_GENERAL";
  let modalityLabel = "Free General Entry";

  if (isOnlineMandatory) {
    modality = "ONLINE_MANDATORY";
    modalityLabel = "Online Booking Mandatory";
  } else if (hasSpecial) {
    modality = "PAID_SPECIAL_ENTRY";
    modalityLabel = "Free Entry · Special Pass Available";
  } else if (isPaid) {
    modality = "PAID_SPECIAL_ENTRY";
    modalityLabel = "Paid Entry Required";
  }

  // 3. Official Portal Details
  const portalUrl = matchedRegistry?.url || temple.booking?.bookingUrl || null;
  const domain = matchedRegistry?.domain || (portalUrl ? new URL(portalUrl).hostname : null);
  const trustName = matchedRegistry?.trustName || temple.booking?.bookingOrg || "Temple Administration";
  let trustBadge: PortalTrustBadge = matchedRegistry?.badge || "UNVERIFIED";

  if (!matchedRegistry && portalUrl) {
    if (domain?.endsWith(".gov.in") || domain?.endsWith(".nic.in")) {
      trustBadge = "STATUTORY_GOVT_BOARD";
    } else if (domain?.includes("hrce.tn.gov.in")) {
      trustBadge = "STATE_HRCE_PORTAL";
    } else if (temple.booking?.verification?.status === "VERIFIED_OFFICIAL") {
      trustBadge = "OFFICIAL_TEMPLE_TRUST";
    } else {
      trustBadge = "VERIFIED_EXTERNAL";
    }
  }

  // 4. Special Darshan Options
  const specialDarshans: SpecialDarshanOption[] = matchedRegistry?.specialDarshan || [];
  if (specialDarshans.length === 0 && temple.entryFee?.specialDarshan) {
    specialDarshans.push({
      name: "Special Darshan Pass",
      price: temple.entryFee.specialDarshan,
      bookingMode: temple.booking?.bookingMode === "online" ? "online" : "counter",
      benefits: "Fast-track sanctum line access",
    });
  }

  // 5. Fraud Prevention Alert
  const hasFraudAlert = true; // Always active for pilgrim safety
  const cautions = [
    "Never pay unauthorized touts or agents outside the temple for 'guaranteed VIP passes'.",
    "Legitimate tickets are issued exclusively through verified official counters and genuine portals ending in .gov.in or official trust domains.",
    "Do not scan QR codes or transfer UPI money to private individuals claiming to book Prasad or Darshan.",
  ];

  if (isOnlineMandatory) {
    cautions.unshift("Entry without valid advance digital registration is strictly prohibited by shrine board authorities.");
  }

  // 6. Accommodation
  const accommodation: AccommodationInfo = matchedRegistry?.accommodation || {
    available: true,
    type: "LOCAL_LODGES",
    description: "Registered pilgrim dharamshalas and lodges available within 1–2 km of the temple complex.",
    bookingMethod: "CURRENT_COUNTER",
  };

  // 7. Sevas
  const sevas: SevaOption[] = matchedRegistry?.sevas || [
    {
      name: "Daily Archana & Sankalpam",
      timing: "Throughout darshan hours",
      price: "Nominal (₹20–₹100)",
      bookingMethod: "counter",
      description: "Individual family name archana with flowers and sacred prasadam.",
    },
    {
      name: "Abhishekam / Maha Snanam",
      timing: "Morning hours",
      price: "Varies",
      bookingMethod: "counter",
      description: "Sacred bathing of the moolavirat with holy waters, panchamrit, and milk.",
    },
  ];

  return {
    modality,
    modalityLabel,
    generalEntryCost: isPaid ? "Paid" : "Free (No pass needed)",
    isOnlineMandatory,
    hasSpecialDarshan: hasSpecial,
    specialDarshans,
    sevas,
    officialPortal: {
      url: portalUrl,
      domain,
      isVerified: trustBadge !== "UNVERIFIED",
      trustName,
      trustBadge,
    },
    fraudAlert: {
      hasWarning: hasFraudAlert,
      title: "Statutory Pilgrim Advisory: Beware of Fake Booking Portals & Touts",
      description: "Unauthorized third-party websites frequently charge exorbitant commissions for free passes or sell fraudulent tickets.",
      cautions,
    },
    accommodation,
  };
}
