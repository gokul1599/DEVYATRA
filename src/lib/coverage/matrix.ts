import { getPrisma } from "@/lib/db/client";

export type DistrictCoverageStatus =
  | "NO_SOURCE_IMPORTED"
  | "SOURCE_IMPORTED"
  | "INDEXED"
  | "PARTIALLY_VERIFIED"
  | "VERIFIED"
  | "EXPANSION_IN_PROGRESS";

export type StateCoverageStatus =
  | "indexed" // >= 75% districts covered
  | "partially_indexed" // 40-74% districts covered
  | "expansion_in_progress" // < 40% districts covered
  | "verification_in_progress"; // Has unverified records

export interface DistrictCoverageItem {
  id: string;
  name: string;
  slug: string;
  officialCode: string | null;
  hasSource: boolean;
  templesFound: number;
  templesVerified: number;
  sourceCount: number;
  status: DistrictCoverageStatus;
}

export interface StateCoverageItem {
  code: string;
  name: string;
  slug: string;
  type: string;
  capital: string | null;
  totalDistricts: number;
  representedDistricts: number;
  templeCount: number;
  verifiedCount: number;
  pendingCount: number;
  coveragePercent: number;
  status: StateCoverageStatus;
  lastSync: string;
  districts: DistrictCoverageItem[];
}

export interface NationalCoverageMatrix {
  totalStates: number;
  totalOfficialDistricts: number;
  totalRepresentedDistricts: number;
  nationalDistrictCoveragePercent: number;
  totalTemples: number;
  totalVerifiedTemples: number;
  states: StateCoverageItem[];
}

export async function getNationalCoverageMatrix(): Promise<NationalCoverageMatrix | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const states = await prisma.state.findMany({
    orderBy: { name: "asc" },
    include: {
      districts: {
        orderBy: { name: "asc" },
        include: {
          temples: {
            select: {
              id: true,
              verificationStatus: true,
              source: true,
              sourceUrl: true,
              lastVerifiedAt: true,
            },
          },
        },
      },
    },
  });

  let totalOfficialDistricts = 0;
  let totalRepresentedDistricts = 0;
  let totalTemples = 0;
  let totalVerifiedTemples = 0;

  const stateItems: StateCoverageItem[] = states.map((state) => {
    const districtsCount = state.districts.length;
    let stateTemples = 0;
    let stateVerified = 0;
    let statePending = 0;
    let representedDistricts = 0;
    let latestSyncDate = new Date(0);

    const districtItems: DistrictCoverageItem[] = state.districts.map((district) => {
      const temples = district.temples;
      const templesFound = temples.length;
      stateTemples += templesFound;

      const verified = temples.filter(
        (t) => t.verificationStatus === "VERIFIED_OFFICIAL" || t.verificationStatus === "VERIFIED_SOURCE"
      ).length;
      stateVerified += verified;

      const pending = temples.filter((t) => t.verificationStatus === "NEEDS_VERIFICATION").length;
      statePending += pending;

      if (templesFound > 0) {
        representedDistricts++;
      }

      for (const t of temples) {
        if (t.lastVerifiedAt && t.lastVerifiedAt > latestSyncDate) {
          latestSyncDate = t.lastVerifiedAt;
        }
      }

      const sourceCount = temples.filter((t) => Boolean(t.source || t.sourceUrl)).length;

      // Determine District Coverage Status (Never use COMPLETE)
      let dStatus: DistrictCoverageStatus = "NO_SOURCE_IMPORTED";
      if (templesFound === 0) {
        dStatus = "NO_SOURCE_IMPORTED";
      } else if (sourceCount === 0) {
        dStatus = "SOURCE_IMPORTED";
      } else if (verified >= 3) {
        dStatus = "INDEXED";
      } else if (verified === templesFound) {
        dStatus = "VERIFIED";
      } else if (verified > 0 && verified < templesFound) {
        dStatus = "PARTIALLY_VERIFIED";
      } else {
        dStatus = "EXPANSION_IN_PROGRESS";
      }

      return {
        id: district.id,
        name: district.name,
        slug: district.slug,
        officialCode: district.officialCode,
        hasSource: sourceCount > 0,
        templesFound,
        templesVerified: verified,
        sourceCount,
        status: dStatus,
      };
    });

    totalOfficialDistricts += districtsCount;
    totalRepresentedDistricts += representedDistricts;
    totalTemples += stateTemples;
    totalVerifiedTemples += stateVerified;

    const coveragePercent = districtsCount > 0
      ? Math.round((representedDistricts / districtsCount) * 100)
      : 0;

    let sStatus: StateCoverageStatus = "expansion_in_progress";
    if (statePending > 0) {
      sStatus = "verification_in_progress";
    } else if (coveragePercent >= 75) {
      sStatus = "indexed";
    } else if (coveragePercent >= 40) {
      sStatus = "partially_indexed";
    }

    return {
      code: state.code,
      name: state.name,
      slug: state.slug,
      type: state.type,
      capital: state.capital,
      totalDistricts: districtsCount,
      representedDistricts,
      templeCount: stateTemples,
      verifiedCount: stateVerified,
      pendingCount: statePending,
      coveragePercent,
      status: sStatus,
      lastSync: latestSyncDate.getTime() > 0 ? latestSyncDate.toISOString().split("T")[0] : "2026-03-22",
      districts: districtItems,
    };
  });

  const nationalCoveragePercent = totalOfficialDistricts > 0
    ? Math.round((totalRepresentedDistricts / totalOfficialDistricts) * 100)
    : 0;

  return {
    totalStates: states.length,
    totalOfficialDistricts,
    totalRepresentedDistricts,
    nationalDistrictCoveragePercent: nationalCoveragePercent,
    totalTemples,
    totalVerifiedTemples,
    states: stateItems,
  };
}

export interface PlaceCategoryMatrixItem {
  state: string;
  stateCode: string;
  totalPlaces: number;
  categories: Record<string, number>;
}

export interface NationalPlacesCoverageReport {
  totalPlaces: number;
  totalVerifiedPlaces: number;
  totalWithCoordinates: number;
  totalWithOfficialSources: number;
  totalWithApprovedImages: number;
  statesCoveredCount: number;
  totalStatesAndUTs: number;
  categoryBreakdown: Record<string, number>;
  matrix: PlaceCategoryMatrixItem[];
}

export async function getPlacesCoverageMatrix(): Promise<NationalPlacesCoverageReport | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    const places = await prisma.place.findMany({
      select: {
        id: true,
        slug: true,
        state: true,
        stateCode: true,
        category: true,
        categories: true,
        verificationStatus: true,
        provenanceTier: true,
        latitude: true,
        longitude: true,
        image: true,
        sourceName: true,
      },
      orderBy: { state: "asc" },
    });

    const totalPlaces = places.length;
    const totalVerifiedPlaces = places.filter(p => p.verificationStatus.includes("VERIFIED")).length;
    const totalWithCoordinates = places.filter(p => p.latitude !== 0 && p.longitude !== 0).length;
    const totalWithOfficialSources = places.filter(p => p.provenanceTier === "OFFICIAL_STATUTORY" || p.provenanceTier === "STATE_GOVERNMENT").length;
    const totalWithApprovedImages = places.filter(p => Boolean(p.image)).length;

    const stateMap = new Map<string, PlaceCategoryMatrixItem>();
    const categoryBreakdown: Record<string, number> = {};

    for (const p of places) {
      const stateName = p.state;
      const sCode = p.stateCode || stateName.slice(0, 2).toUpperCase();

      if (!stateMap.has(stateName)) {
        stateMap.set(stateName, {
          state: stateName,
          stateCode: sCode,
          totalPlaces: 0,
          categories: {},
        });
      }

      const item = stateMap.get(stateName)!;
      item.totalPlaces++;

      const cats = p.categories && p.categories.length > 0 ? p.categories : [p.category];
      for (const cat of cats) {
        item.categories[cat] = (item.categories[cat] || 0) + 1;
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      }
    }

    return {
      totalPlaces,
      totalVerifiedPlaces,
      totalWithCoordinates,
      totalWithOfficialSources,
      totalWithApprovedImages,
      statesCoveredCount: stateMap.size,
      totalStatesAndUTs: 36,
      categoryBreakdown,
      matrix: Array.from(stateMap.values()),
    };
  } catch (err) {
    console.error("Error computing places coverage matrix:", err);
    return null;
  }
}

