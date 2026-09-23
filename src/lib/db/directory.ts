import { getPrisma } from "./client";
import { Prisma } from "@/generated/prisma/client";
import { Temple, VerificationStatus, SourceRef, SourceType, TempleBadge } from "@/lib/types";
import { getTemple as getStaticTemple } from "@/lib/registry";
import { getAdminIntelligenceSummary, TempleIntelligenceHealthSummary } from "@/lib/intelligence/admin";

export type DirectoryStatus = "offline" | "online";

function prismaOrNull() {
  return getPrisma();
}

export interface Coverage {
  countries: number;
  states: number;
  districts: number;
  adminUnits: number;
  localities: number;
  temples: number;
  statesWithTemples: number;
  districtsWithTemples: number;
}

export async function getCoverage(): Promise<Coverage | null> {
  const prisma = prismaOrNull();
  if (!prisma) return null;
  const [countries, states, districts, adminUnits, localities, temples, statesWithTemples, districtsWithTemples] = await Promise.all([
    prisma.country.count(),
    prisma.state.count(),
    prisma.district.count(),
    prisma.adminUnit.count(),
    prisma.locality.count(),
    prisma.temple.count(),
    prisma.state.count({ where: { temples: { some: {} } } }),
    prisma.district.count({ where: { temples: { some: {} } } }),
  ]);
  return { countries, states, districts, adminUnits, localities, temples, statesWithTemples, districtsWithTemples };
}

export interface DirectoryState {
  id: string;
  code: string;
  slug: string;
  name: string;
  type: string;
  adminUnitTerm: string;
  capital: string | null;
  templeCount: number;
  districtCount: number;
}

export interface DirectoryDistrict {
  id: string;
  slug: string;
  name: string;
  templeCount: number;
  adminUnitCount: number;
  localityCount: number;
  latitude: number | null;
  longitude: number | null;
}

export interface DirectoryAdminUnit {
  id: string;
  slug: string;
  name: string;
  type: string;
  templeCount: number;
  localityCount: number;
}

export interface DirectoryLocality {
  id: string;
  slug: string;
  name: string;
  kind: string;
  templeCount: number;
}

export interface DirectoryTemple {
  id: string;
  identifier: string;
  slug: string;
  name: string;
  nameLocal?: string | null;
  description?: string | null;
  mainDeity: string | null;
  deities: string[];
  templeType?: string | null;
  tradition: string[];
  architecture?: string | null;
  badges: string[];
  verificationStatus: string;
  dataConfidence: number;
  isCentroidFallback: boolean;
  latitude: number;
  longitude: number;
  stateCode: string;
  stateName: string;
  stateSlug: string;
  districtName: string;
  districtSlug: string;
  adminUnitName?: string | null;
  adminUnitSlug: string | null;
  localityName?: string | null;
  localitySlug: string | null;
  sourceUrl?: string | null;
  officialWebsite?: string | null;
}

export const directoryStatus = (): DirectoryStatus => (prismaOrNull() ? "online" : "offline");

export async function listStates(): Promise<DirectoryState[]> {
  const prisma = prismaOrNull();
  if (!prisma) return [];
  const rows = await prisma.state.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { temples: true, districts: true } } },
  });
  return rows.map((s) => ({
    id: s.id,
    code: s.code,
    slug: s.slug,
    name: s.name,
    type: s.type,
    adminUnitTerm: s.adminUnitTerm,
    capital: s.capital,
    templeCount: s._count.temples,
    districtCount: s._count.districts,
  }));
}

export async function getStateBySlug(slug: string): Promise<DirectoryState | null> {
  const prisma = prismaOrNull();
  if (!prisma) return null;
  const s = await prisma.state.findUnique({ where: { slug }, include: { _count: { select: { temples: true, districts: true } } } });
  if (!s) return null;
  return {
    id: s.id,
    code: s.code,
    slug: s.slug,
    name: s.name,
    type: s.type,
    adminUnitTerm: s.adminUnitTerm,
    capital: s.capital,
    templeCount: s._count.temples,
    districtCount: s._count.districts,
  };
}

export async function listDistricts(stateSlug: string): Promise<DirectoryDistrict[]> {
  const prisma = prismaOrNull();
  if (!prisma) return [];
  const state = await prisma.state.findUnique({ where: { slug: stateSlug } });
  if (!state) return [];
  const rows = await prisma.district.findMany({
    where: { stateId: state.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { temples: true, adminUnits: true, localities: true } } },
  });
  return rows.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: d.name,
    templeCount: d._count.temples,
    adminUnitCount: d._count.adminUnits,
    localityCount: d._count.localities,
    latitude: d.latitude,
    longitude: d.longitude,
  }));
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface DistrictPageData {
  state: DirectoryState;
  district: DirectoryDistrict & { nameLocal: string | null };
  adminUnits: DirectoryAdminUnit[];
  localities: DirectoryLocality[];
  temples: DirectoryTemple[];
  breadcrumbs: Breadcrumb[];
}

export async function getDistrictPage(stateSlug: string, districtSlug: string): Promise<DistrictPageData | null> {
  const prisma = prismaOrNull();
  if (!prisma) return null;
  const state = await prisma.state.findUnique({ where: { slug: stateSlug } });
  if (!state) return null;
  const district = await prisma.district.findUnique({ where: { stateId_slug: { stateId: state.id, slug: districtSlug } }, include: { _count: { select: { temples: true, adminUnits: true, localities: true } } } });
  if (!district) return null;
  const [adminUnits, localities, temples] = await Promise.all([
    prisma.adminUnit.findMany({
      where: { districtId: district.id },
      orderBy: { name: "asc" },
      include: { _count: { select: { temples: true, localities: true } } },
    }),
    prisma.locality.findMany({
      where: { districtId: district.id },
      orderBy: { name: "asc" },
      include: { _count: { select: { temples: true } } },
    }),
    listTemples({ districtId: district.id }, 200, 0),
  ]);
  return {
    state: {
      id: state.id,
      code: state.code,
      slug: state.slug,
      name: state.name,
      type: state.type,
      adminUnitTerm: state.adminUnitTerm,
      capital: state.capital,
      templeCount: 0,
      districtCount: 0,
    },
    district: { ...district, nameLocal: district.nameLocal, templeCount: district._count.temples, adminUnitCount: district._count.adminUnits, localityCount: district._count.localities },
    adminUnits: adminUnits.map((a) => ({ id: a.id, slug: a.slug, name: a.name, type: a.type, templeCount: a._count.temples, localityCount: a._count.localities })),
    localities: localities.map((l) => ({ id: l.id, slug: l.slug, name: l.name, kind: l.kind, templeCount: l._count.temples })),
    temples,
    breadcrumbs: [
      { label: "India", href: "/india" },
      { label: state.name, href: `/states/${state.slug}` },
      { label: district.name },
    ],
  };
}

export interface AdminUnitPageData {
  state: DirectoryState;
  district: { slug: string; name: string };
  adminUnit: DirectoryAdminUnit & { officialCode: string | null };
  localities: DirectoryLocality[];
  temples: DirectoryTemple[];
  breadcrumbs: Breadcrumb[];
}

export async function getAdminUnitPage(stateSlug: string, districtSlug: string, adminUnitSlug: string): Promise<AdminUnitPageData | null> {
  const prisma = prismaOrNull();
  if (!prisma) return null;
  const state = await prisma.state.findUnique({ where: { slug: stateSlug } });
  if (!state) return null;
  const district = await prisma.district.findUnique({ where: { stateId_slug: { stateId: state.id, slug: districtSlug } } });
  if (!district) return null;
  const adminUnit = await prisma.adminUnit.findUnique({ where: { districtId_slug: { districtId: district.id, slug: adminUnitSlug } }, include: { _count: { select: { temples: true, localities: true } } } });
  if (!adminUnit) return null;
  const [localities, temples] = await Promise.all([
    prisma.locality.findMany({ where: { adminUnitId: adminUnit.id }, orderBy: { name: "asc" }, include: { _count: { select: { temples: true } } } }),
    listTemples({ adminUnitId: adminUnit.id }, 500, 0),
  ]);
  return {
    state: {
      id: state.id,
      code: state.code,
      slug: state.slug,
      name: state.name,
      type: state.type,
      adminUnitTerm: state.adminUnitTerm,
      capital: state.capital,
      templeCount: 0,
      districtCount: 0,
    },
    district: { slug: district.slug, name: district.name },
    adminUnit: { id: adminUnit.id, slug: adminUnit.slug, name: adminUnit.name, type: adminUnit.type, officialCode: adminUnit.officialCode, templeCount: adminUnit._count.temples, localityCount: adminUnit._count.localities },
    localities: localities.map((l) => ({ id: l.id, slug: l.slug, name: l.name, kind: l.kind, templeCount: l._count.temples })),
    temples,
    breadcrumbs: [
      { label: "India", href: "/india" },
      { label: state.name, href: `/states/${state.slug}` },
      { label: district.name, href: `/states/${state.slug}/districts/${district.slug}` },
      { label: adminUnit.name },
    ],
  };
}

export interface LocalityPageData {
  state: DirectoryState;
  district: { slug: string; name: string };
  adminUnit: { slug: string; name: string } | null;
  locality: DirectoryLocality & { officialCode: string | null };
  temples: DirectoryTemple[];
  breadcrumbs: Breadcrumb[];
}

export async function getLocalityPage(stateSlug: string, districtSlug: string, adminUnitSlug: string, localitySlug: string): Promise<LocalityPageData | null> {
  const prisma = prismaOrNull();
  if (!prisma) return null;
  const state = await prisma.state.findUnique({ where: { slug: stateSlug } });
  if (!state) return null;
  const district = await prisma.district.findUnique({ where: { stateId_slug: { stateId: state.id, slug: districtSlug } } });
  if (!district) return null;
  const adminUnit = await prisma.adminUnit.findUnique({ where: { districtId_slug: { districtId: district.id, slug: adminUnitSlug } } });
  if (!adminUnit) return null;
  const locality = await prisma.locality.findUnique({ where: { adminUnitId_slug: { adminUnitId: adminUnit.id, slug: localitySlug } }, include: { _count: { select: { temples: true } } } });
  if (!locality) return null;
  const temples = await listTemples({ localityId: locality.id }, 500, 0);
  return {
    state: {
      id: state.id,
      code: state.code,
      slug: state.slug,
      name: state.name,
      type: state.type,
      adminUnitTerm: state.adminUnitTerm,
      capital: state.capital,
      templeCount: 0,
      districtCount: 0,
    },
    district: { slug: district.slug, name: district.name },
    adminUnit: { slug: adminUnit.slug, name: adminUnit.name },
    locality: { id: locality.id, slug: locality.slug, name: locality.name, kind: locality.kind, officialCode: locality.officialCode, templeCount: locality._count.temples },
    temples,
    breadcrumbs: [
      { label: "India", href: "/india" },
      { label: state.name, href: `/states/${state.slug}` },
      { label: district.name, href: `/states/${state.slug}/districts/${district.slug}` },
      { label: adminUnit.name, href: `/states/${state.slug}/districts/${district.slug}/${adminUnit.slug}` },
      { label: locality.name },
    ],
  };
}

export interface TempleFilter {
  stateId?: string;
  districtId?: string;
  adminUnitId?: string;
  localityId?: string;
  deity?: string;
  verificationOnly?: boolean;
}

export async function listTemples(filter: TempleFilter, limit = 100, offset = 0): Promise<DirectoryTemple[]> {
  const prisma = prismaOrNull();
  if (!prisma) return [];
  const rows = await prisma.temple.findMany({
    where: {
      ...(filter.stateId
        ? { state: { id: filter.stateId } }
        : filter.districtId
          ? { districtId: filter.districtId }
          : filter.adminUnitId
            ? { adminUnitId: filter.adminUnitId }
            : filter.localityId
              ? { localityId: filter.localityId }
              : {}),
      ...(filter.deity ? { deities: { has: filter.deity } } : {}),
      ...(filter.verificationOnly ? { verificationStatus: { not: "UNVERIFIED" } } : {}),
    },
    orderBy: [{ name: "asc" }],
    take: limit,
    skip: offset,
    include: {
      state: { select: { name: true, slug: true } },
      district: { select: { name: true, slug: true } },
      adminUnit: { select: { name: true, slug: true } },
      locality: { select: { name: true, slug: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    identifier: r.identifier,
    slug: r.slug,
    name: r.name,
    nameLocal: r.nameLocal,
    description: r.description,
    mainDeity: r.mainDeity,
    deities: r.deities,
    templeType: r.templeType,
    tradition: r.tradition,
    architecture: r.architecture,
    badges: r.badges,
    verificationStatus: r.verificationStatus,
    dataConfidence: r.dataConfidence,
    isCentroidFallback: r.isCentroidFallback,
    latitude: r.latitude,
    longitude: r.longitude,
    stateCode: r.stateCode,
    stateName: r.state?.name || r.stateCode,
    stateSlug: r.state?.slug || r.stateCode.toLowerCase(),
    districtName: r.district?.name || "",
    districtSlug: r.district?.slug || "",
    adminUnitName: r.adminUnit?.name ?? null,
    adminUnitSlug: r.adminUnit?.slug ?? null,
    localityName: r.locality?.name ?? null,
    localitySlug: r.locality?.slug ?? null,
    sourceUrl: r.sourceUrl,
    officialWebsite: r.officialWebsite,
  }));
}

export interface DirectoryStats {
  temples: number;
  states: number;
  districts: number;
  adminUnits: number;
  localities: number;
}

export async function getDirectoryStats(): Promise<DirectoryStats> {
  const prisma = prismaOrNull();
  if (!prisma) {
    return { temples: 29, states: 28, districts: 29, adminUnits: 29, localities: 29 };
  }
  const [temples, states, districts, adminUnits, localities] = await Promise.all([
    prisma.temple.count(),
    prisma.state.count({ where: { temples: { some: {} } } }),
    prisma.district.count({ where: { temples: { some: {} } } }),
    prisma.adminUnit.count(),
    prisma.locality.count(),
  ]);
  return { temples, states, districts, adminUnits, localities };
}

export interface PaginatedTemplesQuery {
  page?: number;
  limit?: number;
  q?: string;
  state?: string;
  district?: string;
  deity?: string;
  tradition?: string;
  style?: string;
  verificationStatus?: string;
  hasBooking?: boolean;
}

export interface PaginatedTemplesResult {
  temples: DirectoryTemple[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export async function getPaginatedTemples(query: PaginatedTemplesQuery): Promise<PaginatedTemplesResult> {
  const prisma = prismaOrNull();
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 24));
  const skip = (page - 1) * limit;

  if (!prisma) {
    return {
      temples: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  const andConditions: Prisma.TempleWhereInput[] = [];

  if (query.state) {
    const s = query.state.trim();
    if (s.length === 2) {
      andConditions.push({ stateCode: { equals: s.toUpperCase() } });
    } else {
      andConditions.push({
        OR: [
          { stateCode: { equals: s.toUpperCase() } },
          { state: { slug: { equals: s.toLowerCase() } } },
          { state: { name: { equals: s, mode: "insensitive" } } },
          { state: { name: { startsWith: s, mode: "insensitive" } } },
        ],
      });
    }
  }

  if (query.district) {
    andConditions.push({
      district: {
        OR: [
          { slug: { equals: query.district.toLowerCase() } },
          { name: { contains: query.district, mode: "insensitive" } },
        ],
      },
    });
  }

  if (query.deity) {
    andConditions.push({
      OR: [
        { mainDeity: { contains: query.deity, mode: "insensitive" } },
        { deities: { has: query.deity } },
      ],
    });
  }

  if (query.tradition) {
    andConditions.push({ tradition: { has: query.tradition } });
  }

  if (query.style) {
    andConditions.push({
      OR: [
        { architecture: { contains: query.style, mode: "insensitive" } },
        { templeType: { contains: query.style, mode: "insensitive" } },
      ],
    });
  }

  if (query.verificationStatus) {
    andConditions.push({ verificationStatus: { equals: query.verificationStatus } });
  }

  if (query.hasBooking) {
    andConditions.push({
      bookings: {
        some: { onlineAvailable: true },
      },
    });
  }

  if (query.q) {
    const term = query.q.trim();
    andConditions.push({
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { nameLocal: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { mainDeity: { contains: term, mode: "insensitive" } },
        { identifier: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.TempleWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const [total, rows] = await Promise.all([
    prisma.temple.count({ where }),
    prisma.temple.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ dataConfidence: "desc" }, { name: "asc" }],
      include: {
        state: { select: { name: true, slug: true } },
        district: { select: { name: true, slug: true } },
        adminUnit: { select: { name: true, slug: true } },
        locality: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    temples: rows.map((r) => ({
      id: r.id,
      identifier: r.identifier,
      slug: r.slug,
      name: r.name,
      nameLocal: r.nameLocal,
      description: r.description,
      mainDeity: r.mainDeity,
      deities: r.deities,
      templeType: r.templeType,
      tradition: r.tradition,
      architecture: r.architecture,
      badges: r.badges,
      verificationStatus: r.verificationStatus,
      dataConfidence: r.dataConfidence,
      isCentroidFallback: r.isCentroidFallback,
      latitude: r.latitude,
      longitude: r.longitude,
      stateCode: r.stateCode,
      stateName: r.state?.name || r.stateCode,
      stateSlug: r.state?.slug || r.stateCode.toLowerCase(),
      districtName: r.district?.name || "",
      districtSlug: r.district?.slug || "",
      adminUnitName: r.adminUnit?.name ?? null,
      adminUnitSlug: r.adminUnit?.slug ?? null,
      localityName: r.locality?.name ?? null,
      localitySlug: r.locality?.slug ?? null,
      sourceUrl: r.sourceUrl,
      officialWebsite: r.officialWebsite,
    })),
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function resolveTemple(slug: string): Promise<Temple | null> {
  const staticHit = getStaticTemple(slug);
  if (staticHit) return staticHit;

  const prisma = prismaOrNull();
  if (!prisma) return null;

  const r = await prisma.temple.findFirst({
    where: {
      OR: [
        { slug },
        { id: slug },
        { identifier: slug },
      ],
    },
    include: {
      state: { select: { name: true, slug: true } },
      district: { select: { name: true, slug: true } },
      adminUnit: { select: { name: true, slug: true } },
      locality: { select: { name: true, slug: true } },
      timings: true,
      bookings: true,
      festivals: true,
      whyFamous: true,
      timeline: true,
      nearby: true,
      sources: true,
      translations: true,
    },
  });

  if (!r) return null;

  const vStatus = (r.verificationStatus as VerificationStatus) || "VERIFIED_SOURCE";
  const sourceRecord = r.sources[0];
  const primarySource: SourceRef = {
    id: sourceRecord?.id || r.id,
    org: sourceRecord?.sourceName || r.source || "Devyatra National Temple Directory",
    url: sourceRecord?.sourceUrl || r.sourceUrl || undefined,
    type: (r.sourceType as SourceType) || "government",
    status: vStatus,
    lastVerified: r.lastVerifiedAt?.toISOString().split("T")[0] || "2026-03-21",
  };

  const bookingOnline = r.bookings.find((b) => b.onlineAvailable);
  const entryFeeObj = {
    generalDarshan: "free" as const,
    specialDarshan: bookingOnline ? `Online Booking available (INR ${bookingOnline.price || 0})` : undefined,
    notes: r.bookings[0]?.verificationStatus ? `Verification: ${r.bookings[0].verificationStatus}` : undefined,
    bookable: !!bookingOnline,
    bookingMode: (bookingOnline ? "online" : "free") as "online" | "offline" | "unavailable" | "free",
    bookingUrl: bookingOnline?.bookingUrl || r.officialWebsite || undefined,
    bookingOrg: r.name,
    verification: {
      status: (bookingOnline?.verificationStatus as VerificationStatus) || (r.officialWebsite ? "VERIFIED_OFFICIAL" : "UNVERIFIED"),
      source: primarySource,
    },
  };

  const timingSlots = r.timings.length > 0
    ? r.timings.map((t) => ({
        label: t.label || t.day || "General Darshan",
        opening: t.openTime || "06:00",
        closing: t.closeTime || "20:00",
        note: t.verificationStatus ? `Status: ${t.verificationStatus}` : undefined,
      }))
    : [
        {
          label: "General Darshan",
          opening: "06:00",
          closing: "20:00",
          note: "Standard historical slot — verify locally before visit",
        },
      ];

  const timingSchedule = {
    slots: timingSlots,
    verification: {
      status: (r.timings[0]?.verificationStatus as VerificationStatus) || "NEEDS_VERIFICATION",
      source: primarySource,
      note: "Timings subject to local festival schedules",
    },
  };

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    nameLocal: r.nameLocal ?? undefined,
    aliases: r.alternativeNames.length ? r.alternativeNames : [r.name],
    stateCode: r.stateCode,
    districtSlug: r.district?.slug || "district",
    district: r.district?.name || "District",
    subUnitSlug: r.adminUnit?.slug || undefined,
    subUnit: r.adminUnit?.name || undefined,
    locationSlug: r.locality?.slug || "location",
    location: r.locality?.name || r.address || r.district?.name || "Location",
    locationKind: "town",
    latitude: r.latitude,
    longitude: r.longitude,
    mainDeity: r.mainDeity || "Sacred Deity",
    deities: r.deities.length ? r.deities : [r.mainDeity || "Deity"],
    type: r.templeType || "Historic Hindu Temple",
    tradition: r.tradition.length ? r.tradition : ["Sanatana Dharma"],
    architecture: r.architecture ?? undefined,
    historicalPeriod: r.historicalPeriod ?? undefined,
    establishedYear: r.establishedYear ?? undefined,
    description:
      r.description ||
      `${r.name} is a historic Hindu shrine located in ${r.district?.name || ""}, ${r.state?.name || r.stateCode}. Indexed in the national heritage catalog with authentic source provenance.`,
    whyFamous: r.whyFamous.map((w) => ({
      icon: w.icon || "Landmark",
      title: w.title,
      body: w.body,
      type: "historic" as const,
    })),
    history: r.timeline.map((ti) => ({
      title: ti.title,
      year: ti.year ?? undefined,
      body: ti.body,
    })),
    timings: timingSchedule,
    booking: entryFeeObj,
    festivals: r.festivals.map((f) => ({
      id: f.id,
      name: f.name,
      templeId: r.id,
      month: f.month || 1,
      day: f.day || 1,
      dateLabel: f.dateLabel || `${f.day || 1} / ${f.month || 1}`,
      description: f.description || "Annual religious festival",
      repeating: true,
      significance: f.description || "Annual religious festival",
      rituals: [],
      crowdLevel: "high" as const,
    })),
    images: r.images,
    badges: (r.badges.length ? r.badges : ["Historic", "Verified"]) as TempleBadge[],
    verified: r.verificationStatus === "VERIFIED_OFFICIAL" || r.verificationStatus === "VERIFIED_SOURCE",
    isCentroidFallback: r.isCentroidFallback,
    entryFee: entryFeeObj,
    source: primarySource,
  };
}

export interface AdminDashboardData {
  metrics: {
    templesIndexed: number;
    statesCount: number;
    districtsCount: number;
    verifiedOfficial: number;
    verifiedSource: number;
    pendingVerification: number;
    verifiedCoordinates: number;
    pendingCoordinates: number;
    officialWebsites: number;
    bookingPortals: number;
    openAudits: number;
    userSubmissionsPending: number;
    googlePlacesVerified: number;
    googlePlacesPending: number;
  };
  recentAudits: Array<{
    id: string;
    templeIdentifier: string | null;
    templeName: string | null;
    fieldChecked: string;
    existingValue: string | null;
    sourceFound: string | null;
    severity: string;
    status: string;
    createdAt: Date;
  }>;
  verificationQueue: Array<{
    id: string;
    identifier: string;
    slug: string;
    name: string;
    nameLocal: string | null;
    stateCode: string;
    districtName: string;
    mainDeity: string | null;
    latitude: number;
    longitude: number;
    isCentroidFallback: boolean;
    verificationStatus: string;
    dataConfidence: number;
    googlePlaceVerificationStatus: string;
    officialWebsite: string | null;
    source: string | null;
    sourceType: string | null;
    lastVerifiedAt: Date | null;
    timingsCount: number;
    festivalsCount: number;
    bookingsCount: number;
  }>;
  userSubmissions: Array<{
    id: string;
    templeName: string;
    stateName: string;
    districtName: string;
    latitude: number;
    longitude: number;
    mainDeity: string | null;
    contributorName: string | null;
    status: string;
    submittedAt: Date;
  }>;
  intelligence?: TempleIntelligenceHealthSummary;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const prisma = prismaOrNull();
  if (!prisma) {
    return {
      metrics: {
        templesIndexed: 0,
        statesCount: 0,
        districtsCount: 0,
        verifiedOfficial: 0,
        verifiedSource: 0,
        pendingVerification: 0,
        verifiedCoordinates: 0,
        pendingCoordinates: 0,
        officialWebsites: 0,
        bookingPortals: 0,
        openAudits: 0,
        userSubmissionsPending: 0,
        googlePlacesVerified: 0,
        googlePlacesPending: 0,
      },
      recentAudits: [],
      verificationQueue: [],
      userSubmissions: [],
      intelligence: getAdminIntelligenceSummary(),
    };
  }

  const [
    templesIndexed,
    statesCount,
    districtsCount,
    verifiedOfficial,
    verifiedSource,
    pendingVerification,
    verifiedCoordinates,
    pendingCoordinates,
    officialWebsites,
    bookingPortals,
    openAudits,
    userSubmissionsPending,
    googlePlacesVerified,
    googlePlacesPending,
    recentAudits,
    rawQueue,
    rawSubmissions,
  ] = await Promise.all([
    prisma.temple.count(),
    prisma.state.count({ where: { temples: { some: {} } } }),
    prisma.district.count({ where: { temples: { some: {} } } }),
    prisma.temple.count({ where: { verificationStatus: "VERIFIED_OFFICIAL" } }),
    prisma.temple.count({ where: { verificationStatus: "VERIFIED_SOURCE" } }),
    prisma.temple.count({ where: { verificationStatus: { in: ["UNVERIFIED", "NEEDS_VERIFICATION", "PENDING_VERIFICATION"] } } }),
    prisma.temple.count({ where: { isCentroidFallback: false, latitude: { not: 0 }, longitude: { not: 0 } } }),
    prisma.temple.count({ where: { isCentroidFallback: true } }),
    prisma.temple.count({ where: { officialWebsite: { not: null } } }),
    prisma.temple.count({ where: { bookings: { some: { bookingUrl: { not: null } } } } }),
    prisma.auditResult.count({ where: { status: "OPEN" } }),
    prisma.userSubmission.count({ where: { status: "SUBMITTED" } }),
    prisma.temple.count({ where: { googlePlaceVerificationStatus: "VERIFIED" } }),
    prisma.temple.count({ where: { googlePlaceVerificationStatus: "PENDING_LOOKUP" } }),
    prisma.auditResult.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        templeIdentifier: true,
        templeName: true,
        fieldChecked: true,
        existingValue: true,
        sourceFound: true,
        severity: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.temple.findMany({
      take: 20,
      orderBy: [{ dataConfidence: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        identifier: true,
        slug: true,
        name: true,
        nameLocal: true,
        stateCode: true,
        mainDeity: true,
        latitude: true,
        longitude: true,
        isCentroidFallback: true,
        verificationStatus: true,
        dataConfidence: true,
        googlePlaceVerificationStatus: true,
        officialWebsite: true,
        source: true,
        sourceType: true,
        lastVerifiedAt: true,
        district: { select: { name: true } },
        _count: {
          select: {
            timings: true,
            festivals: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.userSubmission.findMany({
      take: 10,
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        templeName: true,
        stateName: true,
        districtName: true,
        latitude: true,
        longitude: true,
        mainDeity: true,
        contributorName: true,
        status: true,
        submittedAt: true,
      },
    }),
  ]);

  return {
    metrics: {
      templesIndexed,
      statesCount,
      districtsCount,
      verifiedOfficial,
      verifiedSource,
      pendingVerification,
      verifiedCoordinates,
      pendingCoordinates,
      officialWebsites,
      bookingPortals,
      openAudits,
      userSubmissionsPending,
      googlePlacesVerified,
      googlePlacesPending,
    },
    recentAudits,
    verificationQueue: rawQueue.map((t) => ({
      id: t.id,
      identifier: t.identifier,
      slug: t.slug,
      name: t.name,
      nameLocal: t.nameLocal,
      stateCode: t.stateCode,
      districtName: t.district?.name || "Unknown",
      mainDeity: t.mainDeity,
      latitude: t.latitude,
      longitude: t.longitude,
      isCentroidFallback: t.isCentroidFallback,
      verificationStatus: t.verificationStatus,
      dataConfidence: t.dataConfidence,
      googlePlaceVerificationStatus: t.googlePlaceVerificationStatus,
      officialWebsite: t.officialWebsite,
      source: t.source,
      sourceType: t.sourceType,
      lastVerifiedAt: t.lastVerifiedAt,
      timingsCount: t._count.timings,
      festivalsCount: t._count.festivals,
      bookingsCount: t._count.bookings,
    })),
    userSubmissions: rawSubmissions,
    intelligence: getAdminIntelligenceSummary(),
  };
}