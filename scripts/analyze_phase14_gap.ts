import { existsSync } from "node:fs";
import * as fs from 'fs';
import * as path from 'path';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log('--- PHASE 14A: COVERAGE GAP ANALYSIS ---');

  const states = await prisma.state.findMany({
    include: {
      districts: {
        include: {
          temples: {
            select: { id: true, verificationStatus: true, source: true }
          }
        }
      },
      temples: {
        select: { id: true, verificationStatus: true, source: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  const totalOfficialDistricts = await prisma.district.count();
  const representedDistrictsCount = await prisma.district.count({
    where: { temples: { some: {} } }
  });

  console.log(`Total Official LGD Districts: ${totalOfficialDistricts}`);
  console.log(`Total Represented Districts: ${representedDistrictsCount} (${((representedDistrictsCount / totalOfficialDistricts) * 100).toFixed(2)}%)`);
  console.log(`Target for 70%: 642 districts (+${Math.max(0, 642 - representedDistrictsCount)} needed)`);
  console.log(`Target for 75%: 688 districts (+${Math.max(0, 688 - representedDistrictsCount)} needed)`);

  const stateStats = states.map(s => {
    const totalDistricts = s.districts.length;
    const representedDistricts = s.districts.filter(d => d.temples.length > 0).length;
    const unrepresentedDistricts = totalDistricts - representedDistricts;
    const coveragePct = totalDistricts > 0 ? (representedDistricts / totalDistricts) * 100 : 0;
    const templeCount = s.temples.length;
    const verifiedCount = s.temples.filter(t => t.verificationStatus === 'VERIFIED').length;
    const sourceCount = s.temples.filter(t => !!t.source).length;

    const unrepresentedList = s.districts
      .filter(d => d.temples.length === 0)
      .map(d => ({ name: d.name, officialCode: d.officialCode, slug: d.slug }));

    return {
      state: s.name,
      code: s.code,
      totalDistricts,
      representedDistricts,
      unrepresentedDistricts,
      coveragePct,
      templeCount,
      verifiedCount,
      sourceCount,
      unrepresentedList
    };
  });

  // Sort by highest number of unrepresented districts
  stateStats.sort((a, b) => b.unrepresentedDistricts - a.unrepresentedDistricts);

  console.log('\nTop States by Unrepresented Districts:');
  stateStats.slice(0, 15).forEach(s => {
    console.log(`- ${s.state} (${s.code}): ${s.unrepresentedDistricts} unrepresented / ${s.totalDistricts} total (${s.coveragePct.toFixed(1)}% cov) | ${s.templeCount} temples`);
  });

  // Output JSON for precise data ingestion planning
  const reportData = {
    totalOfficialDistricts,
    representedDistrictsCount,
    nationalCoveragePct: (representedDistrictsCount / totalOfficialDistricts) * 100,
    target70: 642,
    neededFor70: Math.max(0, 642 - representedDistrictsCount),
    target75: 688,
    neededFor75: Math.max(0, 688 - representedDistrictsCount),
    stateStats
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'phase14_gap_data.json'),
    JSON.stringify(reportData, null, 2)
  );

  // Generate markdown report
  let md = `# 🇮🇳 DEVYATRA — PHASE 14 COVERAGE GAP ANALYSIS\n\n`;
  md += `**Generated**: ${new Date().toISOString()}\n`;
  md += `**Baseline Districts Represented**: ${representedDistrictsCount} / ${totalOfficialDistricts} (${((representedDistrictsCount / totalOfficialDistricts) * 100).toFixed(2)}%)\n`;
  md += `**Target 70%**: 642 / 917 districts (+${Math.max(0, 642 - representedDistrictsCount)} new districts required)\n`;
  md += `**Target 75%**: 688 / 917 districts (+${Math.max(0, 688 - representedDistrictsCount)} new districts required)\n\n`;

  md += `## 1. National District Distribution by State\n\n`;
  md += `| State / UT | Code | Total Districts | Represented | Unrepresented | Coverage % | Temples | Verified | Sources |\n`;
  md += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

  for (const s of stateStats) {
    md += `| **${s.state}** | \`${s.code}\` | ${s.totalDistricts} | ${s.representedDistricts} | **${s.unrepresentedDistricts}** | ${s.coveragePct.toFixed(1)}% | ${s.templeCount} | ${s.verifiedCount} | ${s.sourceCount} |\n`;
  }

  md += `\n## 2. Priority Strategic States for Phase 14 Ingestion\n\n`;
  const priorityStates = stateStats.filter(s => s.unrepresentedDistricts > 0);
  for (const s of priorityStates) {
    md += `### ${s.state} (\`${s.code}\`)\n`;
    md += `- **Unrepresented Districts**: ${s.unrepresentedDistricts} / ${s.totalDistricts}\n`;
    md += `- **Current Temples**: ${s.templeCount}\n`;
    md += `- **Unrepresented District List**:\n`;
    for (const d of s.unrepresentedList) {
      md += `  - \`${d.officialCode || d.slug}\`: ${d.name} (\`${d.slug}\`)\n`;
    }
    md += `\n`;
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'docs', 'PHASE_14_COVERAGE_GAP_ANALYSIS.md'),
    md
  );

  console.log('\nWrote docs/PHASE_14_COVERAGE_GAP_ANALYSIS.md and scripts/phase14_gap_data.json');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
