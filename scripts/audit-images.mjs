import fs from "fs";

const content = fs.readFileSync("src/lib/destinations/all-india-data.ts", "utf8");
const matches = [...content.matchAll(/slug:\s*"([^"]+)"[\s\S]*?image:\s*"([^"]+)"/g)];
const counts = {};
const mapping = {};

for (const m of matches) {
  const slug = m[1];
  const url = m[2];
  counts[url] = (counts[url] || 0) + 1;
  mapping[url] = mapping[url] || [];
  mapping[url].push(slug);
}

const dups = Object.entries(counts).filter(([u, c]) => c > 1);
console.log("Total destination entries scanned:", matches.length);
console.log("Unique images:", Object.keys(counts).length);
console.log("Duplicate image URLs found:", dups.length);

for (const [url, count] of dups) {
  console.log(`\nReused ${count}x: ${url}`);
  console.log("Slugs:", mapping[url].join(", "));
}
