import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const PLACEHOLDER_HOSTS = ["localhost", "127.0.0.1"];

export function databaseUrl(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (PLACEHOLDER_HOSTS.includes(parsed.hostname)) return null;
  } catch {
    return null;
  }
  return url;
}

export function dbConfigured(): boolean {
  return databaseUrl() !== null;
}

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (!dbConfigured()) return null;
  if (prisma) return prisma;
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  prisma = new PrismaClient({ adapter });
  return prisma;
}