import { getPrisma } from "@/lib/db/client";

export interface DistrictDepthMetrics {
  districtId: string;
  districtName: string;
  stateCode: string;
  stateName: string;
  templesTotal: number;
  templesVerified: number;
  nativeNamesRecorded: number;
  timingsCount: number;
  bookingsCount: number;
  festivalsCount: number;
  googlePlaceIds: number;
  sourceCount: number;
  // Depth score from 0 to 100 representing data richness & provenance, NOT temple importance
  depthScore: number;
  depthTier: "A_DEEP" | "B_MODERATE" | "C_FOUNDATIONAL" | "D_SPARSE";
}

export interface NationalDataDepthReport {
  totalDistrictsAssessed: number;
  tierBreakdown: {
    A_DEEP: number;
    B_MODERATE: number;
    C_FOUNDATIONAL: number;
    D_SPARSE: number;
  };
  averageDepthScore: number;
  districtsWithNativeNamesPct: number;
  districtsWithTimingsPct: number;
  districtsWithBookingsPct: number;
  topDistricts: DistrictDepthMetrics[];
}

export async function computeNationalDataDepth(): Promise<NationalDataDepthReport | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const districts = await prisma.district.findMany({
    include: {
      state: { select: { code: true, name: true } },
      temples: {
        select: {
          id: true,
          verificationStatus: true,
          nameLocal: true,
          googlePlaceId: true,
          source: true,
          sourceUrl: true,
          _count: {
            select: {
              timings: true,
              bookings: true,
              festivals: true,
            },
          },
        },
      },
    },
  });

  const assessed: DistrictDepthMetrics[] = [];
  const tiers = { A_DEEP: 0, B_MODERATE: 0, C_FOUNDATIONAL: 0, D_SPARSE: 0 };
  let totalScore = 0;
  let nativeCount = 0;
  let timingDistricts = 0;
  let bookingDistricts = 0;

  for (const d of districts) {
    const total = d.temples.length;
    if (total === 0) continue;

    const verified = d.temples.filter(
      (t) => t.verificationStatus === "VERIFIED_OFFICIAL" || t.verificationStatus === "VERIFIED_SOURCE"
    ).length;

    const nativeNames = d.temples.filter((t) => Boolean(t.nameLocal)).length;
    const places = d.temples.filter((t) => Boolean(t.googlePlaceId)).length;
    const sources = d.temples.filter((t) => Boolean(t.source || t.sourceUrl)).length;

    let timings = 0;
    let bookings = 0;
    let festivals = 0;

    for (const t of d.temples) {
      timings += t._count.timings;
      bookings += t._count.bookings;
      festivals += t._count.festivals;
    }

    if (nativeNames > 0) nativeCount++;
    if (timings > 0) timingDistricts++;
    if (bookings > 0) bookingDistricts++;

    // Calculate non-political data completeness score (0-100)
    // 1. Source Provenance (25 pts)
    const pSource = Math.min(25, Math.round((sources / total) * 25));
    // 2. Verification Ratio (25 pts)
    const pVerify = Math.min(25, Math.round((verified / total) * 25));
    // 3. Operational Schedules (Timings + Festivals) (20 pts)
    const pTiming = Math.min(20, Math.round(((timings > 0 ? 10 : 0) + (festivals > 0 ? 10 : 0))));
    // 4. Booking & Statutory Clarity (15 pts)
    const pBooking = Math.min(15, bookings > 0 ? 15 : 5);
    // 5. Native Vernacular & Geocoding Depth (15 pts)
    const pNative = Math.min(15, Math.round(((nativeNames / total) * 10) + (places > 0 ? 5 : 0)));

    const score = pSource + pVerify + pTiming + pBooking + pNative;
    totalScore += score;

    let tier: DistrictDepthMetrics["depthTier"] = "D_SPARSE";
    if (score >= 75) tier = "A_DEEP";
    else if (score >= 50) tier = "B_MODERATE";
    else if (score >= 25) tier = "C_FOUNDATIONAL";

    tiers[tier]++;

    assessed.push({
      districtId: d.id,
      districtName: d.name,
      stateCode: d.state.code,
      stateName: d.state.name,
      templesTotal: total,
      templesVerified: verified,
      nativeNamesRecorded: nativeNames,
      timingsCount: timings,
      bookingsCount: bookings,
      festivalsCount: festivals,
      googlePlaceIds: places,
      sourceCount: sources,
      depthScore: score,
      depthTier: tier,
    });
  }

  assessed.sort((a, b) => b.depthScore - a.depthScore || b.templesTotal - a.templesTotal);

  const count = assessed.length;
  return {
    totalDistrictsAssessed: count,
    tierBreakdown: tiers,
    averageDepthScore: count > 0 ? Math.round(totalScore / count) : 0,
    districtsWithNativeNamesPct: count > 0 ? Math.round((nativeCount / count) * 100) : 0,
    districtsWithTimingsPct: count > 0 ? Math.round((timingDistricts / count) * 100) : 0,
    districtsWithBookingsPct: count > 0 ? Math.round((bookingDistricts / count) * 100) : 0,
    topDistricts: assessed.slice(0, 20),
  };
}
