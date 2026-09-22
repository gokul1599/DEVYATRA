/**
 * Devyatra Transparent Data Quality Score Engine (0–100)
 *
 * This score represents how complete, verified, and authoritative a temple record is.
 * It NEVER indicates religious or cultural importance.
 *
 * Criteria breakdown (Total 100 points):
 * - Coordinate Accuracy (20 pts): Non-centroid verified lat/long with precision
 * - Source Authenticity (20 pts): Official government, ASI, or vetted institutional provenance
 * - Verified Timings (15 pts): Structured darshan/pooja schedules with documented source
 * - Official Website / Portals (15 pts): Official domain or government endowment portal
 * - Native Vernacular Coverage (10 pts): Authentic native script translation present
 * - Booking Verification (10 pts): Documented entry modes & authentic booking URLs
 * - Provenance & History (10 pts): Documented architectural era, tradition, or monument IDs
 */

export interface QualityScoreBreakdown {
  total: number; // 0–100
  categories: {
    coordinates: { score: number; max: 20; details: string };
    source: { score: number; max: 20; details: string };
    timings: { score: number; max: 15; details: string };
    website: { score: number; max: 15; details: string };
    nativeLanguage: { score: number; max: 10; details: string };
    booking: { score: number; max: 10; details: string };
    provenance: { score: number; max: 10; details: string };
  };
}

export interface ScorableTemple {
  latitude: number;
  longitude: number;
  isCentroidFallback?: boolean;
  verificationStatus?: string;
  sourceType?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  officialWebsite?: string | null;
  officialPhone?: string | null;
  nameLocal?: string | null;
  asiMonumentId?: string | null;
  historicalPeriod?: string | null;
  architecture?: string | null;
  tradition?: string[];
  timings?: Array<{ openTime?: string | null; closeTime?: string | null; verificationStatus?: string }> | null;
  bookings?: Array<{ onlineAvailable?: boolean | null; bookingUrl?: string | null; verificationStatus?: string }> | null;
  translations?: Array<{ languageCode: string; translatedName: string }> | null;
}

export function calculateQualityScore(temple: ScorableTemple): QualityScoreBreakdown {
  // 1. Coordinates (Max 20)
  let coordScore = 0;
  let coordDetails = "Missing coordinates";
  if (temple.isCentroidFallback) {
    coordScore = 0;
    coordDetails = "Quarantined centroid fallback (national center)";
  } else if (temple.latitude && temple.longitude && (temple.latitude !== 0 || temple.longitude !== 0)) {
    coordScore = 20;
    coordDetails = "Verified pinpoint coordinates";
  }

  // 2. Source Authenticity (Max 20)
  let srcScore = 0;
  let srcDetails = "Unverified source";
  const st = (temple.sourceType || "").toUpperCase();
  const vs = (temple.verificationStatus || "").toUpperCase();

  if (vs === "VERIFIED_OFFICIAL" || st === "OFFICIAL" || st === "GOVERNMENT" || temple.asiMonumentId) {
    srcScore = 20;
    srcDetails = "Official government or ASI monument registry";
  } else if (vs === "VERIFIED_SOURCE" || st === "TRUSTED") {
    srcScore = 15;
    srcDetails = "Vetted institutional directory or gazetteer";
  } else if (temple.sourceUrl || temple.source) {
    srcScore = 10;
    srcDetails = "Documented web citation";
  }

  // 3. Timings (Max 15)
  let timingScore = 0;
  let timingDetails = "No darshan timings indexed";
  if (temple.timings && temple.timings.length > 0) {
    const verified = temple.timings.some((t) => t.verificationStatus === "VERIFIED");
    if (verified) {
      timingScore = 15;
      timingDetails = "Verified structured darshan schedule";
    } else {
      timingScore = 8;
      timingDetails = "Standard opening hours indexed (unverified)";
    }
  }

  // 4. Official Website & Contact (Max 15)
  let webScore = 0;
  let webDetails = "No official website or contact";
  if (temple.officialWebsite && temple.officialWebsite !== "Not Available") {
    webScore = 12;
    webDetails = "Official temple portal linked";
    if (temple.officialPhone) {
      webScore = 15;
      webDetails = "Official portal and administration phone linked";
    }
  } else if (temple.officialPhone) {
    webScore = 6;
    webDetails = "Temple contact phone indexed";
  }

  // 5. Native Language Coverage (Max 10)
  let langScore = 0;
  let langDetails = "English-only record";
  if (temple.nameLocal && temple.nameLocal.trim()) {
    langScore = 10;
    langDetails = "Authentic native script name present";
  } else if (temple.translations && temple.translations.length > 0) {
    langScore = 10;
    langDetails = `${temple.translations.length} vernacular translations indexed`;
  }

  // 6. Booking Verification (Max 10)
  let bookScore = 0;
  let bookDetails = "Booking details unindexed";
  if (temple.bookings && temple.bookings.length > 0) {
    const hasOnline = temple.bookings.some((b) => b.onlineAvailable && b.bookingUrl);
    if (hasOnline) {
      bookScore = 10;
      bookDetails = "Official online booking link verified";
    } else {
      bookScore = 6;
      bookDetails = "Entry protocols documented (offline/counter darshan)";
    }
  }

  // 7. Provenance & History (Max 10)
  let provScore = 0;
  let provDetails = "Basic heritage listing";
  let provItems = 0;
  if (temple.asiMonumentId) provItems += 2;
  if (temple.architecture) provItems += 1;
  if (temple.historicalPeriod) provItems += 1;
  if (temple.tradition && temple.tradition.length > 0) provItems += 1;

  if (provItems >= 3) {
    provScore = 10;
    provDetails = "Rich architectural, historical, and tradition provenance";
  } else if (provItems >= 1) {
    provScore = 6;
    provDetails = "Documented historical period or architectural style";
  }

  const total = Math.min(100, Math.max(0, coordScore + srcScore + timingScore + webScore + langScore + bookScore + provScore));

  return {
    total,
    categories: {
      coordinates: { score: coordScore, max: 20, details: coordDetails },
      source: { score: srcScore, max: 20, details: srcDetails },
      timings: { score: timingScore, max: 15, details: timingDetails },
      website: { score: webScore, max: 15, details: webDetails },
      nativeLanguage: { score: langScore, max: 10, details: langDetails },
      booking: { score: bookScore, max: 10, details: bookDetails },
      provenance: { score: provScore, max: 10, details: provDetails },
    },
  };
}
