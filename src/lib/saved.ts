import "server-only";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export interface SavedItem {
  id: string; // unique slug or ID
  kind: "temple" | "place" | "circuit";
  name: string;
  category?: string;
  location?: string;
  state?: string;
  savedAt: string;
  notes?: string;
}

export interface SavedRecord {
  userId: string;
  items: string[]; // legacy temple slugs array for backward compatibility
  savedItems?: SavedItem[]; // rich multi-entity saved items
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

export function getSavedRichItems(userId: string): SavedItem[] {
  const record = readSaved().find((s) => s.userId === userId);
  if (!record) return [];
  if (record.savedItems && record.savedItems.length > 0) {
    return record.savedItems;
  }
  // Convert legacy items into SavedItem format
  return (record.items || []).map((slug) => ({
    id: slug,
    kind: "temple",
    name: slug.replace(/-/g, " "),
    savedAt: new Date().toISOString(),
  }));
}

export function setSaved(userId: string, items: string[]): string[] {
  const all = readSaved();
  const idx = all.findIndex((s) => s.userId === userId);
  const next = [...new Set(items)];
  if (idx === -1) {
    all.push({
      userId,
      items: next,
      savedItems: next.map((slug) => ({
        id: slug,
        kind: "temple",
        name: slug.replace(/-/g, " "),
        savedAt: new Date().toISOString(),
      })),
    });
  } else {
    all[idx].items = next;
    // ensure savedItems is synced
    const existing = all[idx].savedItems || [];
    const rich: SavedItem[] = next.map((slug) => {
      const found = existing.find((e) => e.id === slug);
      return (
        found || {
          id: slug,
          kind: "temple",
          name: slug.replace(/-/g, " "),
          savedAt: new Date().toISOString(),
        }
      );
    });
    all[idx].savedItems = rich;
  }
  writeSaved(all);
  return next;
}

export function addRichSavedItem(userId: string, item: Omit<SavedItem, "savedAt">): SavedItem[] {
  const all = readSaved();
  let record = all.find((s) => s.userId === userId);
  if (!record) {
    record = { userId, items: [], savedItems: [] };
    all.push(record);
  }
  if (!record.savedItems) record.savedItems = [];

  const existingIdx = record.savedItems.findIndex((i) => i.id === item.id);
  const newItem: SavedItem = {
    ...item,
    savedAt: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    record.savedItems[existingIdx] = newItem;
  } else {
    record.savedItems.unshift(newItem);
  }

  // sync legacy items if it's a temple
  if (item.kind === "temple" && !record.items.includes(item.id)) {
    record.items.push(item.id);
  }

  writeSaved(all);
  return record.savedItems;
}

export function removeRichSavedItem(userId: string, itemId: string): SavedItem[] {
  const all = readSaved();
  const record = all.find((s) => s.userId === userId);
  if (!record) return [];

  record.savedItems = (record.savedItems || []).filter((i) => i.id !== itemId);
  record.items = record.items.filter((slug) => slug !== itemId);

  writeSaved(all);
  return record.savedItems;
}