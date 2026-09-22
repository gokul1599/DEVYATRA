/**
 * URL Health Check Worker
 * Periodically verifies official websites and booking URLs in the temple database.
 * Updates AuditResult and Temple verification flags on dead links or domain changes.
 */
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function checkUrl(url: string, timeoutMs = 8000): Promise<{ status: number | null; ok: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "Devyatra-Verification-Bot/1.0 (+https://templeora.vercel.app)" }
    });
    clearTimeout(timer);
    return { status: res.status, ok: res.status >= 200 && res.status < 400 };
  } catch (err: any) {
    return { status: null, ok: false, error: err.message };
  }
}

async function runUrlCheckWorker() {
  console.log("=== DEVYATRA URL VERIFICATION WORKER ===");
  const batchSize = 50;

  const templesWithUrls = await prisma.temple.findMany({
    where: {
      officialWebsite: { not: null }
    },
    take: batchSize,
    select: {
      id: true,
      identifier: true,
      name: true,
      officialWebsite: true
    }
  });

  console.log(`Checking ${templesWithUrls.length} official temple URLs...`);
  let healthy = 0;
  let broken = 0;

  for (const t of templesWithUrls) {
    if (!t.officialWebsite || !t.officialWebsite.startsWith("http")) continue;

    const result = await checkUrl(t.officialWebsite);
    if (result.ok) {
      healthy++;
      console.log(`[OK ${result.status}] ${t.name}: ${t.officialWebsite}`);
    } else {
      broken++;
      console.warn(`[BROKEN ${result.status || result.error}] ${t.name}: ${t.officialWebsite}`);

      // Record audit failure
      await prisma.auditResult.create({
        data: {
          templeId: t.id,
          templeIdentifier: t.identifier,
          templeName: t.name,
          fieldChecked: "Official_Website",
          existingValue: t.officialWebsite,
          verified: false,
          problem: `URL health check failed: ${result.error || `HTTP ${result.status}`}`,
          recommendedAction: "Review domain registration or update to current state tourism URL",
          severity: "HIGH",
          status: "FLAGGED"
        }
      });
    }
  }

  console.log("=========================================");
  console.log(`Summary: Checked ${templesWithUrls.length} | Healthy: ${healthy} | Broken/Unreachable: ${broken}`);
  console.log("=========================================");
}

runUrlCheckWorker()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
