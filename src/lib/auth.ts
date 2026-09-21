import "server-only";
import { randomUUID, randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created: string;
  passwordHash?: string;
}

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(USERS_FILE)) {
    const admin = createUserRecord("Devyatra Admin", "admin@devyatra.dev", "Devyatra@2026", "admin");
    writeUsers([admin]);
  }
}

function readUsers(): UserRecord[] {
  ensureStore();
  try {
    return JSON.parse(readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeUsers(users: UserRecord[]) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function createUserRecord(name: string, email: string, password: string, role: "user" | "admin"): UserRecord {
  const salt = randomBytes(16).toString("hex");
  const passHash = hash(password, salt);
  return {
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    role,
    created: new Date().toISOString(),
    passwordHash: `${salt}:${passHash}`,
  };
}

function hash(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, stored: string) {
  const [salt, known] = stored.split(":");
  const attempt = Buffer.from(hash(password, salt), "hex");
  const expected = Buffer.from(known, "hex");
  return attempt.length === expected.length && timingSafeEqual(attempt, expected);
}

export const publicUser = (u: UserRecord) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  created: u.created,
});

export function createUser(name: string, email: string, password: string): UserRecord {
  const users = readUsers();
  const exists = users.find((u) => u.email === email.toLowerCase());
  if (exists) throw new Error("EMAIL_EXISTS");
  const user = createUserRecord(name, email, password, "user");
  users.push(user);
  writeUsers(users);
  return user;
}

export function login(email: string, password: string): UserRecord | null {
  const user = readUsers().find((u) => u.email === email.toLowerCase());
  if (!user?.passwordHash) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

/* Sessions — in-memory token store (invalidated on restart). */
const sessions = new Map<string, { userId: string; expires: number }>();
const LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export function createSession(userId: string): string {
  const token = randomUUID();
  sessions.set(token, { userId, expires: Date.now() + LIFETIME_MS });
  return token;
}

export function destroySession(token: string) {
  sessions.delete(token);
}

export function getUserByToken(token?: string | null): UserRecord | null {
  if (!token) return null;
  const s = sessions.get(token);
  if (!s || s.expires < Date.now()) return null;
  return readUsers().find((u) => u.id === s.userId) ?? null;
}

export const SESSION_COOKIE = "tem_session";

export function emailHash(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 16);
}