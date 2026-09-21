import "server-only";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export interface FeedPlace {
  id: string;
  templeId: string;
  kind: string;
  name: string;
  distanceKm: number;
  recommendation?: string;
  priceHint?: string;
  cuisine?: string[];
}

export interface FeedState {
  source: string;
  updatedAt: string;
  nearby: FeedPlace[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const FEEDS_FILE = path.join(DATA_DIR, "feeds.json");

const EMPTY: FeedState = { source: "none", updatedAt: "", nearby: [] };

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(FEEDS_FILE)) writeFileSync(FEEDS_FILE, JSON.stringify(EMPTY));
}

export function readFeed(): FeedState {
  ensure();
  try {
    const parsed = JSON.parse(readFileSync(FEEDS_FILE, "utf-8")) as FeedState;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

export function writeFeed(source: string, nearby: FeedPlace[]): FeedState {
  ensure();
  const state: FeedState = { source, updatedAt: new Date().toISOString(), nearby };
  writeFileSync(FEEDS_FILE, JSON.stringify(state, null, 2));
  return state;
}

export function feedPlacesFor(templeId: string): FeedPlace[] {
  return readFeed().nearby.filter((p) => p.templeId === templeId && p.distanceKm <= 8);
}