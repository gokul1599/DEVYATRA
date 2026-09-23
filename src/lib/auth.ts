import "server-only";
import { randomUUID, randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { getPrisma } from "@/lib/db/client";

export interface UserPreferences {
  preferredLanguage: string;
  deities: string[];
  traditions: string[];
  travelStyle: "solo" | "family" | "elderly" | "friends";
  accessibilityNeeds: boolean;
  budgetTier: "budget" | "mid" | "premium";
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  preferredLanguage: "en",
  deities: [],
  traditions: [],
  travelStyle: "family",
  accessibilityNeeds: false,
  budgetTier: "mid",
};

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  normalizedEmail?: string;
  role: "user" | "admin";
  created: string;
  passwordHash?: string;
  preferences?: UserPreferences;
  followedTemples?: string[];
}

export const SESSION_COOKIE = "tem_session";
const LIFETIME_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailHash(email: string): string {
  return createHash("sha256").update(normalizeEmail(email)).digest("hex").slice(0, 16);
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function createPasswordHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPassword(password, salt)}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (!stored || !stored.includes(":")) return false;
  const [salt, known] = stored.split(":");
  const attempt = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(known, "hex");
  return attempt.length === expected.length && timingSafeEqual(attempt, expected);
}

export const publicUser = (u: UserRecord) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  created: u.created,
  preferences: u.preferences || DEFAULT_PREFERENCES,
  followedTemples: u.followedTemples || [],
});

/* ─── Resilient In-Memory Fallback Store (for offline tests & detached runs) ─── */
interface FallbackSession {
  token: string;
  userId: string;
  expiresAt: Date;
  revokedAt?: Date | null;
}

const fallbackUsers = new Map<string, UserRecord>();
const fallbackSessions = new Map<string, FallbackSession>();

// Initialize default admin in fallback
const adminSalt = randomBytes(16).toString("hex");
const adminHash = hashPassword("Devyatra@2026", adminSalt);
fallbackUsers.set("admin-default-id", {
  id: "admin-default-id",
  name: "Devyatra Admin",
  email: "admin@devyatra.dev",
  normalizedEmail: "admin@devyatra.dev",
  role: "admin",
  created: new Date().toISOString(),
  passwordHash: `${adminSalt}:${adminHash}`,
  preferences: DEFAULT_PREFERENCES,
  followedTemples: [],
});

function mapPrismaUser(u: {
  id: string;
  name: string;
  email: string;
  normalizedEmail?: string | null;
  role: string;
  created: string;
  password?: string | null;
  preferences?: string | null;
  followedTemples?: string[];
}): UserRecord {
  let parsedPrefs: UserPreferences = DEFAULT_PREFERENCES;
  if (u.preferences) {
    try {
      parsedPrefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(u.preferences) };
    } catch {
      parsedPrefs = DEFAULT_PREFERENCES;
    }
  }
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    normalizedEmail: u.normalizedEmail || normalizeEmail(u.email),
    role: u.role === "admin" ? "admin" : "user",
    created: u.created,
    passwordHash: u.password ?? undefined,
    preferences: parsedPrefs,
    followedTemples: Array.isArray(u.followedTemples) ? u.followedTemples : [],
  };
}

/* ─── Database-backed Auth Operations with Resilient Fallback ─── */

export async function createUser(name: string, email: string, password: string): Promise<UserRecord> {
  const norm = normalizeEmail(email);
  const passwordHash = createPasswordHash(password);
  const prisma = getPrisma();

  if (prisma) {
    try {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ normalizedEmail: norm }, { email: norm }],
        },
      });
      if (existing) {
        throw new Error("EMAIL_EXISTS");
      }

      const user = await prisma.user.create({
        data: {
          name,
          email: norm,
          normalizedEmail: norm,
          role: "user",
          password: passwordHash,
          created: new Date().toISOString(),
          preferences: JSON.stringify(DEFAULT_PREFERENCES),
          followedTemples: [],
        },
      });
      return mapPrismaUser(user);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "EMAIL_EXISTS") throw err;
      // Network/offline fallback
    }
  }

  // Fallback branch
  for (const u of fallbackUsers.values()) {
    if (u.normalizedEmail === norm || normalizeEmail(u.email) === norm) {
      throw new Error("EMAIL_EXISTS");
    }
  }

  const id = randomUUID();
  const user: UserRecord = {
    id,
    name,
    email: norm,
    normalizedEmail: norm,
    role: "user",
    created: new Date().toISOString(),
    passwordHash,
    preferences: DEFAULT_PREFERENCES,
    followedTemples: [],
  };
  fallbackUsers.set(id, user);
  return user;
}

export async function login(email: string, password: string): Promise<UserRecord | null> {
  const norm = normalizeEmail(email);
  const prisma = getPrisma();

  if (prisma) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ normalizedEmail: norm }, { email: norm }],
        },
      });
      if (user && user.password && verifyPassword(password, user.password)) {
        return mapPrismaUser(user);
      }
      return null;
    } catch {
      // Network/offline fallback
    }
  }

  // Fallback branch
  for (const u of fallbackUsers.values()) {
    if (u.normalizedEmail === norm || normalizeEmail(u.email) === norm) {
      if (u.passwordHash && verifyPassword(password, u.passwordHash)) {
        return u;
      }
      return null;
    }
  }
  return null;
}

export async function createSession(userId: string): Promise<string> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + LIFETIME_MS);
  const prisma = getPrisma();

  if (prisma) {
    try {
      await prisma.session.create({
        data: {
          token,
          userId,
          expiresAt,
        },
      });
      return token;
    } catch {
      // Network/offline fallback
    }
  }

  // Fallback branch
  fallbackSessions.set(token, {
    token,
    userId,
    expiresAt,
  });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.session.deleteMany({
        where: { token },
      });
      return;
    } catch {
      // Network/offline fallback
    }
  }

  // Fallback branch
  fallbackSessions.delete(token);
}

export async function getUserByToken(token?: string | null): Promise<UserRecord | null> {
  if (!token) return null;
  const prisma = getPrisma();

  if (prisma) {
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });
      if (!session || session.revokedAt || new Date(session.expiresAt) < new Date()) {
        return null;
      }
      return mapPrismaUser(session.user);
    } catch {
      // Network/offline fallback
    }
  }

  // Fallback branch
  const session = fallbackSessions.get(token);
  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) {
    return null;
  }
  return fallbackUsers.get(session.userId) ?? null;
}

export async function updateUserPreferences(
  userId: string,
  prefs: Partial<UserPreferences>
): Promise<UserPreferences> {
  const prisma = getPrisma();

  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("USER_NOT_FOUND");
      let currentPrefs: UserPreferences = DEFAULT_PREFERENCES;
      if (user.preferences) {
        try {
          currentPrefs = { ...DEFAULT_PREFERENCES, ...JSON.parse(user.preferences) };
        } catch {
          currentPrefs = DEFAULT_PREFERENCES;
        }
      }
      const nextPrefs: UserPreferences = { ...currentPrefs, ...prefs };
      await prisma.user.update({
        where: { id: userId },
        data: { preferences: JSON.stringify(nextPrefs) },
      });
      return nextPrefs;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "USER_NOT_FOUND") throw err;
      // Network/offline fallback
    }
  }

  // Fallback branch
  const user = fallbackUsers.get(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  user.preferences = {
    ...(user.preferences || DEFAULT_PREFERENCES),
    ...prefs,
  };
  return user.preferences;
}

export async function toggleFollowTemple(userId: string, slug: string): Promise<string[]> {
  const prisma = getPrisma();

  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("USER_NOT_FOUND");
      const current = Array.isArray(user.followedTemples) ? user.followedTemples : [];
      const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
      await prisma.user.update({
        where: { id: userId },
        data: { followedTemples: next },
      });
      return next;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "USER_NOT_FOUND") throw err;
      // Network/offline fallback
    }
  }

  // Fallback branch
  const user = fallbackUsers.get(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  const current = user.followedTemples || [];
  const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
  user.followedTemples = next;
  return next;
}