import "server-only";
import { randomUUID } from "crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export interface SavedJourney {
  id: string;
  userId: string;
  title: string;
  circuitId?: string;
  templeSlugs: string[];
  templeNames: string[];
  startDate: string;
  totalDays: number;
  travelMode: string;
  budget: string;
  itineraryBrief?: unknown;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const JOURNEYS_FILE = path.join(DATA_DIR, "journeys.json");

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(JOURNEYS_FILE)) writeFileSync(JOURNEYS_FILE, "[]");
}

function readJourneys(): SavedJourney[] {
  ensureStore();
  try {
    return JSON.parse(readFileSync(JOURNEYS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeJourneys(journeys: SavedJourney[]) {
  writeFileSync(JOURNEYS_FILE, JSON.stringify(journeys, null, 2));
}

export function getSavedJourneys(userId: string): SavedJourney[] {
  const all = readJourneys();
  return all.filter((j) => j.userId === userId);
}

export function getSavedJourneyById(userId: string, journeyId: string): SavedJourney | null {
  const all = readJourneys();
  return all.find((j) => j.userId === userId && j.id === journeyId) ?? null;
}

export function saveJourney(
  userId: string,
  input: Omit<SavedJourney, "id" | "userId" | "createdAt" | "updatedAt">
): SavedJourney {
  const all = readJourneys();
  const now = new Date().toISOString();
  const newJourney: SavedJourney = {
    ...input,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  all.unshift(newJourney);
  writeJourneys(all);
  return newJourney;
}

export function deleteSavedJourney(userId: string, journeyId: string): boolean {
  const all = readJourneys();
  const initialLength = all.length;
  const filtered = all.filter((j) => !(j.userId === userId && j.id === journeyId));
  if (filtered.length !== initialLength) {
    writeJourneys(filtered);
    return true;
  }
  return false;
}
