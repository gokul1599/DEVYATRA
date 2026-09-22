/**
 * Ladakh Official Union Territory Ingestion Importer
 * Authoritative Sources:
 * - Archaeological Survey of India (Mini Circle Leh) (https://asigov.in)
 * - Administration of Union Territory of Ladakh (https://ladakh.nic.in)
 * - Ladakh Tourism Department (https://ladakhtourism.org)
 * - District Administrations of Kargil and Leh
 */
import { processStateBatch } from "./base-importer";
import type { RawTempleRecord } from "./types";

const LADAKH_AUTHORITATIVE_TEMPLES: RawTempleRecord[] = [
  {
    name: "Mulbekh Chamba Rock Cut Monolith",
    nameLocal: "མུལ་བེག་བྱམས་པ། (मूलबेख चम्बा)",
    stateCode: "LA",
    districtName: "Kargil",
    localityName: "Mulbekh Village, National Highway 1D, Kargil",
    latitude: 34.3833,
    longitude: 76.3500,
    mainDeity: "Maitreya Buddha (Future Buddha Chamba)",
    deities: ["Maitreya Buddha", "Ancient Kharosthi Inscriptions"],
    templeType: "8th-Century Monolithic Rock Carving (ASI National Monument)",
    tradition: ["Himalayan Buddhism", "Kushan-Gandhara Classical Transition"],
    architecture: "9-meter High Colossal Relief Carved on Isolated Limestone Rock Face",
    historicalPeriod: "Karkota / Kushan Era Transition / 8th Century CE",
    description: "An Archaeological Survey of India (ASI) protected monument standing over 9 meters tall, carved directly onto an isolated limestone pinnacle overlooking the historic caravan trade route.",
    officialWebsite: "https://kargil.nic.in/tourist-place/mulbekh-monastery/",
    sourceRecordId: "LA-ASI-KAR-001",
    sourceName: "Archaeological Survey of India & Kargil District Administration",
    sourceUrl: "https://kargil.nic.in",
    sourceType: "asi",
  },
  {
    name: "Dras Bhimbet Pandava Stone Monoliths",
    nameLocal: "द्रास भीमबेट पाषाण तीर्थ",
    stateCode: "LA",
    districtName: "Kargil",
    localityName: "Dras Valley, Gateway to Ladakh",
    latitude: 34.4294,
    longitude: 75.7533,
    mainDeity: "Ancient Pandava Sacred Monoliths & Maitreya Carvings",
    deities: ["Bhimbet Monoliths", "Kharosthi Inscriptions"],
    templeType: "High Altitude Ancient Caravan Rock Sanctuary",
    tradition: ["Vedic Mahabharata Tradition", "Ancient Silk Route Pilgrimage"],
    architecture: "Natural High-Altitude Rock Pillars with Ancient Petroglyphs",
    historicalPeriod: "1st-7th Century CE Inscriptions",
    description: "Sacred rock monoliths in the Dras valley, the second coldest inhabited place on Earth, bearing ancient Brahmi and Kharosthi inscriptions traditionally associated with the Pandavas.",
    officialWebsite: "https://kargil.nic.in/tourist-place/dras-valley/",
    sourceRecordId: "LA-TOUR-KAR-002",
    sourceName: "Ladakh Tourism & Kargil District Administration",
    sourceUrl: "https://ladakhtourism.org",
    sourceType: "government",
  },
  {
    name: "Thiksey Monastery Maitreya Temple",
    nameLocal: "ཁྲིག་ཙེ་དགོན་པ། (ठिकसे गोम्पा)",
    stateCode: "LA",
    districtName: "Leh",
    localityName: "Thiksey, Indus River Valley, Leh",
    latitude: 34.0583,
    longitude: 77.6667,
    mainDeity: "Maitreya Buddha (Colossal 49-foot Statue)",
    deities: ["Maitreya Buddha", "Mahakala", "Tara"],
    templeType: "12-Storey Hilltop Sacred Gompa Complex",
    tradition: ["Gelugpa Tibetan Buddhism", "Himalayan Sacred Heritage"],
    architecture: "Hillside Tiered Monastery resembling Potala Palace",
    historicalPeriod: "15th Century CE by Spon Paldan Sherab",
    description: "Iconic 12-storey monastery towering over the Indus Valley, enshrining a magnificent two-storey high statue of Maitreya Buddha consecrated by the 14th Dalai Lama.",
    officialWebsite: "https://leh.nic.in/tourist-place/thiksey-monastery/",
    sourceRecordId: "LA-TOUR-LEH-003",
    sourceName: "UT Administration of Ladakh & Leh District Administration",
    sourceUrl: "https://ladakhtourism.org",
    sourceType: "government",
  },
];

export async function importLadakhTemples(options: { dryRun?: boolean; parserVersion?: string } = {}) {
  console.log("==================================================");
  console.log("🏛️ LADAKH UT TEMPLE INGESTION ENGINE");
  console.log("Source: ASI, UT Administration of Ladakh & Tourism");
  console.log(`Mode: ${options.dryRun ? "DRY RUN (Validation only)" : "LIVE PRODUCTION INGESTION"}`);
  console.log("==================================================\n");

  return processStateBatch(
    "ASI, UT Administration of Ladakh & Tourism",
    "https://ladakhtourism.org",
    LADAKH_AUTHORITATIVE_TEMPLES,
    options
  );
}

// CLI runner
if (process.argv[1]?.endsWith("ladakh.ts")) {
  const isDryRun = process.argv.includes("--dry-run");
  importLadakhTemples({ dryRun: isDryRun })
    .then((report) => {
      console.log("\nTelemetry Report:");
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n❌ Importer crashed:", err);
      process.exit(1);
    });
}
