import "server-only";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import os from "os";
import path from "path";

interface CacheEntry {
  hash: string;
  key: string;
  at: number;
  ttlMs: number;
  payload: unknown;
}

interface CacheFile {
  version: 1;
  updatedAt: string;
  entries: CacheEntry[];
}

const DATA_DIR = process.env.VERCEL ? path.join(os.tmpdir(), "devyatra-cache") : path.join(process.cwd(), ".data");
const CACHE_FILE = path.join(DATA_DIR, "google-cache.json");
const MAX_ENTRIES = 250;

function safe(fn: () => CacheFile): CacheFile {
  try {
    return fn();
  } catch {
    return { version: 1, updatedAt: new Date().toISOString(), entries: [] };
  }
}

function ensure(): CacheFile {
  return safe(() => {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(CACHE_FILE)) {
      const empty: CacheFile = { version: 1, updatedAt: new Date().toISOString(), entries: [] };
      writeFileSync(CACHE_FILE, JSON.stringify(empty));
      return empty;
    }
    const parsed = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as CacheFile;
    return { version: 1, updatedAt: parsed.updatedAt ?? new Date().toISOString(), entries: parsed.entries ?? [] };
  });
}

function write(file: CacheFile) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    file.updatedAt = new Date().toISOString();
    file.entries = file.entries.slice(-MAX_ENTRIES);
    writeFileSync(CACHE_FILE, JSON.stringify(file));
  } catch {
    // read-only filesystem (e.g. serverless); cache is best-effort
  }
}

/** FNV-1a stable hash so cache keys never embed sensitive/verbose payloads. */
export function hashKey(key: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0") + ":" + key.length;
}

export interface CacheHit<T> {
  payload: T;
  fresh: boolean;
  stale: boolean;
}

export function getCached<T>(key: string, ttlMs: number): CacheHit<T> | null {
  const file = ensure();
  const hash = hashKey(key);
  const entry = file.entries.find((e) => e.hash === hash);
  if (!entry) return null;
  const now = Date.now();
  const effectiveTtl = Number.isFinite(ttlMs) ? ttlMs : entry.ttlMs;
  if (now < entry.at + effectiveTtl) {
    return { payload: entry.payload as T, fresh: true, stale: false };
  }
  return { payload: entry.payload as T, fresh: false, stale: true };
}

export function setCached(key: string, payload: unknown, ttlMs: number): void {
  const file = ensure();
  const hash = hashKey(key);
  const next: CacheEntry = { hash, key, at: Date.now(), ttlMs, payload };
  const rest = file.entries.filter((e) => e.hash !== hash);
  file.entries = [...rest, next];
  write(file);
}

export function cacheStats(): { count: number; bytes: number; freshest: string | null; oldest: string | null } {
  const file = ensure();
  const byTime = [...file.entries].sort((a, b) => a.at - b.at);
  return {
    count: file.entries.length,
    bytes: Buffer.byteLength(JSON.stringify(file)),
    freshest: byTime.length ? new Date(byTime[byTime.length - 1].at).toISOString() : null,
    oldest: byTime.length ? new Date(byTime[0].at).toISOString() : null,
  };
}

export function clearCache(): number {
  const file = ensure();
  const n = file.entries.length;
  file.entries = [];
  write(file);
  return n;
}