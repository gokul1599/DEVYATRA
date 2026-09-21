import "server-only";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export interface SavedRecord {
  userId: string;
  items: string[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const SAVED_FILE = path.join(DATA_DIR, "saved.json");

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(SAVED_FILE)) writeFileSync(SAVED_FILE, "[]");
}

function readSaved(): SavedRecord[] {
  ensure();
  try {
    return JSON.parse(readFileSync(SAVED_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeSaved(all: SavedRecord[]) {
  writeFileSync(SAVED_FILE, JSON.stringify(all, null, 2));
}

export function getSaved(userId: string): string[] {
  return readSaved().find((s) => s.userId === userId)?.items ?? [];
}

export function setSaved(userId: string, items: string[]): string[] {
  const all = readSaved();
  const idx = all.findIndex((s) => s.userId === userId);
  const next = [...new Set(items)];
  if (idx === -1) all.push({ userId, items: next });
  else all[idx].items = next;
  writeSaved(all);
  return next;
}