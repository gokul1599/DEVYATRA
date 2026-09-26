import { VERIFIED_DESTINATIONS } from "../src/lib/destinations/registry";
import { normalizeCategory } from "../src/lib/destinations/categories";

const cats = [
  "sacred",
  "heritage",
  "caves",
  "hills",
  "waterfalls",
  "lakes",
  "nature",
  "beaches",
  "wildlife",
  "parks",
  "family",
  "adventure",
  "culture",
  "food",
  "shopping",
];

console.log("=== CATEGORY VERIFICATION ===");
for (const cat of cats) {
  const norm = normalizeCategory(cat);
  const matched = VERIFIED_DESTINATIONS.filter(
    (d) => normalizeCategory(d.category) === norm
  );
  console.log(
    `${cat.padEnd(12)} -> ${norm.padEnd(12)} : ${matched.length} destinations: [${matched
      .slice(0, 3)
      .map((m) => m.name)
      .join(", ")}]`
  );
}
