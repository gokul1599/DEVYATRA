import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("docs/FAMOUS_TEMPLES_RECONCILIATION.json", "utf8"));
const checks = [
  "Kamakhya", "Ambaji", "Akshardham", "Gokarna Mahabaleshwar", "Kukke Subramanya",
  "Sringeri", "Halebidu", "Somanathapura", "Bhimashankar", "Mahalakshmi Kolhapur",
  "Kedarnath", "Rajarani", "Belur Math", "Sankat Mochan", "Brahma Pushkar"
];

console.log("--- CHECKING FAMOUS TEMPLES RECONCILIATION ENTRIES ---");
let mismatches = 0;
for (const c of checks) {
  const item = data.find((x: any) => x.benchmarkName.toLowerCase().includes(c.toLowerCase()));
  if (item) {
    const distMatch = item.matchedDistrict?.toLowerCase().trim() === item.expectedDistrict?.toLowerCase().trim();
    if (!distMatch) {
      mismatches++;
      console.log(`[MISMATCH] ${item.benchmarkName}:`);
      console.log(`   Canonical Name: ${item.canonicalName} (${item.canonicalId})`);
      console.log(`   Expected District: ${item.expectedDistrict} | Matched District: ${item.matchedDistrict}`);
      console.log(`   Slug: ${item.slug}`);
      console.log(`   Status in JSON: ${item.status}\n`);
    } else {
      console.log(`[OK] ${item.benchmarkName} -> District: ${item.matchedDistrict} (${item.slug})`);
    }
  } else {
    console.log(`[NOT FOUND] ${c}`);
  }
}
console.log(`Total checked: ${checks.length}, Mismatches: ${mismatches}`);
