/**
 * Master State Importers Runner
 * Coordinates all official state-level temple ingestion engines
 * Usage:
 *   npx tsx scripts/importers/run-all.ts --dry-run
 *   npx tsx scripts/importers/run-all.ts
 */
import { execSync } from "child_process";
import path from "path";

const STATE_SCRIPTS = [
  "tamil-nadu.ts",
  "karnataka.ts",
  "andhra-pradesh.ts",
  "kerala.ts",
  "maharashtra.ts",
  "rajasthan.ts",
  "odisha.ts",
  "gujarat.ts",
  "madhya-pradesh.ts",
  "uttarakhand.ts",
  "uttar-pradesh.ts",
  "west-bengal.ts",
  "bihar.ts",
  "himachal-pradesh.ts",
  "northeast.ts",
  "punjab-haryana.ts",
];

async function main() {
  const args = process.argv.slice(2);
  const dryRunFlag = args.includes("--dry-run") ? " --dry-run" : "";

  console.log("==================================================");
  console.log("🇮🇳 DEVYATRA NATIONAL TEMPLE COVERAGE SUITE");
  console.log(`Executing ${STATE_SCRIPTS.length} official state ingestion engines`);
  console.log(`Flags: ${dryRunFlag || "LIVE INGESTION"}`);
  console.log("==================================================\n");

  for (const script of STATE_SCRIPTS) {
    const scriptPath = path.join(__dirname, script);
    console.log(`\n▶️ Running ${script}...`);
    try {
      execSync(`npx tsx "${scriptPath}"${dryRunFlag}`, {
        stdio: "inherit",
        cwd: path.resolve(__dirname, "../.."),
      });
    } catch (err: unknown) {
      console.error(`❌ Failed running ${script}:`, err instanceof Error ? err.message : String(err));
    }
  }

  console.log("\n==================================================");
  console.log("✅ National Coverage Ingestion Suite Complete");
  console.log("==================================================");
}

main().catch(console.error);
