import "server-only";
import { randomUUID, randomBytes } from "crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { getPrisma } from "@/lib/db/client";

export interface SavedJourney {
  id: string;
  userId: string;
  title: string;
  circuitId?: string | null;
  templeSlugs: string[];
  templeNames: string[];
  startDate: string;
  totalDays: number;
  travelMode: string;
  budget: string;
  itineraryBrief?: unknown;
  notes?: string | null;
  familyMode?: boolean;
  seniorMode?: boolean;
  accessibilityMode?: boolean;
  costBreakdown?: unknown;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const JOURNEYS_FILE = path.join(DATA_DIR, "journeys.json");

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(JOURNEYS_FILE)) writeFileSync(JOURNEYS_FILE, "[]");
}

function readLocalJourneys(): SavedJourney[] {
  ensureStore();
  try {
    return JSON.parse(readFileSync(JOURNEYS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeLocalJourneys(journeys: SavedJourney[]) {
  writeFileSync(JOURNEYS_FILE, JSON.stringify(journeys, null, 2));
}

export async function getSavedJourneys(userId: string): Promise<SavedJourney[]> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const rows = await prisma.journey.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
      return rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        title: r.title,
        circuitId: r.circuitId,
        templeSlugs: r.templeSlugs,
        templeNames: r.templeNames,
        startDate: r.startDate,
        totalDays: r.totalDays,
        travelMode: r.travelMode,
        budget: r.budget,
        itineraryBrief: r.itineraryBrief,
        notes: r.notes,
        familyMode: r.familyMode,
        seniorMode: r.seniorMode,
        accessibilityMode: r.accessibilityMode,
        costBreakdown: r.costBreakdown,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn("[Journeys] Prisma query failed, falling back to local store:", err);
    }
  }

  const all = readLocalJourneys();
  return all.filter((j) => j.userId === userId);
}

export async function getSavedJourneyById(userId: string, journeyId: string): Promise<SavedJourney | null> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const r = await prisma.journey.findFirst({
        where: { id: journeyId, userId },
      });
      if (r) {
        return {
          id: r.id,
          userId: r.userId,
          title: r.title,
          circuitId: r.circuitId,
          templeSlugs: r.templeSlugs,
          templeNames: r.templeNames,
          startDate: r.startDate,
          totalDays: r.totalDays,
          travelMode: r.travelMode,
          budget: r.budget,
          itineraryBrief: r.itineraryBrief,
          notes: r.notes,
          familyMode: r.familyMode,
          seniorMode: r.seniorMode,
          accessibilityMode: r.accessibilityMode,
          costBreakdown: r.costBreakdown,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.warn("[Journeys] Prisma findFirst failed, falling back to local store:", err);
    }
  }

  const all = readLocalJourneys();
  return all.find((j) => j.userId === userId && j.id === journeyId) ?? null;
}

export async function saveJourney(
  userId: string,
  input: {
    title: string;
    circuitId?: string;
    templeSlugs: string[];
    templeNames: string[];
    startDate: string;
    totalDays: number;
    travelMode?: string;
    budget?: string;
    itineraryBrief?: unknown;
    notes?: string;
    familyMode?: boolean;
    seniorMode?: boolean;
    accessibilityMode?: boolean;
    costBreakdown?: unknown;
  }
): Promise<SavedJourney> {
  const prisma = getPrisma();
  const now = new Date();

  if (prisma) {
    try {
      const row = await prisma.journey.create({
        data: {
          userId,
          title: input.title,
          circuitId: input.circuitId ?? null,
          templeSlugs: input.templeSlugs,
          templeNames: input.templeNames,
          startDate: input.startDate,
          totalDays: input.totalDays,
          travelMode: input.travelMode ?? "car",
          budget: input.budget ?? "mid",
          itineraryBrief: input.itineraryBrief ? JSON.parse(JSON.stringify(input.itineraryBrief)) : null,
          notes: input.notes ?? null,
          familyMode: input.familyMode ?? false,
          seniorMode: input.seniorMode ?? false,
          accessibilityMode: input.accessibilityMode ?? false,
          costBreakdown: input.costBreakdown ? JSON.parse(JSON.stringify(input.costBreakdown)) : null,
        },
      });

      return {
        id: row.id,
        userId: row.userId,
        title: row.title,
        circuitId: row.circuitId,
        templeSlugs: row.templeSlugs,
        templeNames: row.templeNames,
        startDate: row.startDate,
        totalDays: row.totalDays,
        travelMode: row.travelMode,
        budget: row.budget,
        itineraryBrief: row.itineraryBrief,
        notes: row.notes,
        familyMode: row.familyMode,
        seniorMode: row.seniorMode,
        accessibilityMode: row.accessibilityMode,
        costBreakdown: row.costBreakdown,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("[Journeys] Prisma create failed, falling back to local file store:", err);
    }
  }

  const all = readLocalJourneys();
  const newJourney: SavedJourney = {
    id: randomUUID(),
    userId,
    title: input.title,
    circuitId: input.circuitId ?? null,
    templeSlugs: input.templeSlugs,
    templeNames: input.templeNames,
    startDate: input.startDate,
    totalDays: input.totalDays,
    travelMode: input.travelMode ?? "car",
    budget: input.budget ?? "mid",
    itineraryBrief: input.itineraryBrief,
    notes: input.notes ?? null,
    familyMode: input.familyMode ?? false,
    seniorMode: input.seniorMode ?? false,
    accessibilityMode: input.accessibilityMode ?? false,
    costBreakdown: input.costBreakdown,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  all.unshift(newJourney);
  writeLocalJourneys(all);
  return newJourney;
}

export async function deleteSavedJourney(userId: string, journeyId: string): Promise<boolean> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      const match = await prisma.journey.findFirst({ where: { id: journeyId, userId } });
      if (match) {
        await prisma.journey.delete({ where: { id: journeyId } });
        return true;
      }
      return false;
    } catch (err) {
      console.warn("[Journeys] Prisma delete failed, falling back to local file:", err);
    }
  }

  const all = readLocalJourneys();
  const initialLength = all.length;
  const filtered = all.filter((j) => !(j.userId === userId && j.id === journeyId));
  if (filtered.length !== initialLength) {
    writeLocalJourneys(filtered);
    return true;
  }
  return false;
}

/**
 * Creates or retrieves a persistent public share link for a journey.
 */
export async function shareJourney(
  userId: string,
  journeyId: string,
  authorName: string = "A Pilgrim"
): Promise<{ shareCode: string; shareUrl: string } | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    const journey = await prisma.journey.findFirst({
      where: { id: journeyId, userId },
    });
    if (!journey) return null;

    // Check if shareCode already exists
    const existing = await prisma.sharedJourney.findFirst({
      where: { journeyId, userId },
    });
    if (existing) {
      return {
        shareCode: existing.shareCode,
        shareUrl: `/journey/share/${existing.shareCode}`,
      };
    }

    const shareCode = randomBytes(6).toString("hex"); // 12-char hex code
    const created = await prisma.sharedJourney.create({
      data: {
        shareCode,
        journeyId,
        userId,
        authorName,
        isPublic: true,
      },
    });

    return {
      shareCode: created.shareCode,
      shareUrl: `/journey/share/${created.shareCode}`,
    };
  } catch (err) {
    console.error("[Journeys] Error sharing journey:", err);
    return null;
  }
}

/**
 * Retrieves a shared journey by public shareCode and increments view counter.
 */
export async function getSharedJourney(shareCode: string) {
  const prisma = getPrisma();
  if (!prisma) return null;

  try {
    const shared = await prisma.sharedJourney.findUnique({
      where: { shareCode },
      include: { journey: true },
    });
    if (!shared || !shared.isPublic) return null;

    // Increment views asynchronously
    prisma.sharedJourney
      .update({
        where: { id: shared.id },
        data: { viewsCount: { increment: 1 } },
      })
      .catch(() => {});

    return {
      shareCode: shared.shareCode,
      authorName: shared.authorName,
      createdAt: shared.createdAt.toISOString(),
      viewsCount: shared.viewsCount + 1,
      journey: {
        id: shared.journey.id,
        title: shared.journey.title,
        circuitId: shared.journey.circuitId,
        templeSlugs: shared.journey.templeSlugs,
        templeNames: shared.journey.templeNames,
        startDate: shared.journey.startDate,
        totalDays: shared.journey.totalDays,
        travelMode: shared.journey.travelMode,
        budget: shared.journey.budget,
        itineraryBrief: shared.journey.itineraryBrief,
        notes: shared.journey.notes,
        familyMode: shared.journey.familyMode,
        seniorMode: shared.journey.seniorMode,
        accessibilityMode: shared.journey.accessibilityMode,
        costBreakdown: shared.journey.costBreakdown,
      },
    };
  } catch (err) {
    console.error("[Journeys] Error retrieving shared journey:", err);
    return null;
  }
}

/**
 * Phase 13: Mark a temple as visited in user's personal sacred passport.
 */
export async function markTempleVisited(
  userId: string,
  data: {
    templeId: string;
    templeSlug: string;
    templeName: string;
    darshanType?: string;
    notes?: string;
    rating?: number;
    sevaPerformed?: string;
    prasadamTaken?: boolean;
  }
) {
  const prisma = getPrisma();
  if (!prisma) return null;

  return await prisma.visitedTemple.upsert({
    where: {
      userId_templeId: {
        userId,
        templeId: data.templeId,
      },
    },
    update: {
      darshanType: data.darshanType,
      notes: data.notes,
      rating: data.rating,
      sevaPerformed: data.sevaPerformed,
      prasadamTaken: data.prasadamTaken ?? false,
      updatedAt: new Date(),
    },
    create: {
      userId,
      templeId: data.templeId,
      templeSlug: data.templeSlug,
      templeName: data.templeName,
      darshanType: data.darshanType,
      notes: data.notes,
      rating: data.rating,
      sevaPerformed: data.sevaPerformed,
      prasadamTaken: data.prasadamTaken ?? false,
    },
  });
}

/**
 * Get all temples visited by a user.
 */
export async function getVisitedTemples(userId: string) {
  const prisma = getPrisma();
  if (!prisma) return [];

  return await prisma.visitedTemple.findMany({
    where: { userId },
    orderBy: { visitedAt: "desc" },
  });
}

/**
 * Phase 41: Create a pilgrimage journal reflection.
 */
export async function addJournalEntry(
  userId: string,
  data: {
    title: string;
    content: string;
    journeyId?: string;
    templeId?: string;
    mood?: string;
    photoUrls?: string[];
  }
) {
  const prisma = getPrisma();
  if (!prisma) return null;

  return await prisma.journalEntry.create({
    data: {
      userId,
      title: data.title,
      content: data.content,
      journeyId: data.journeyId ?? null,
      templeId: data.templeId ?? null,
      mood: data.mood ?? null,
      photoUrls: data.photoUrls ?? [],
    },
  });
}

/**
 * Get pilgrimage journal entries for a user.
 */
export async function getJournalEntries(userId: string, templeId?: string) {
  const prisma = getPrisma();
  if (!prisma) return [];

  return await prisma.journalEntry.findMany({
    where: {
      userId,
      ...(templeId ? { templeId } : {}),
    },
    orderBy: { entryDate: "desc" },
  });
}
