/**
 * Goa Official State Ingestion Importer
 * Authoritative Sources:
 * - Goa Tourism Development Corporation (https://goatourism.gov.in)
 * - Devasthan Management Committees & Trusts of Goa
 * - Archaeological Survey of India (Goa Circle) (https://asigoacircle.gov.in)
 * - District Administrations of North Goa & South Goa
 */
import { processStateBatch } from "./base-importer";
import type { RawTempleRecord } from "./types";

const GOA_AUTHORITATIVE_TEMPLES: RawTempleRecord[] = [
  {
    name: "Shri Manguesh Temple Priol",
    nameLocal: "श्री मंगेश महारुद्र संस्थान प्रियोळ",
    stateCode: "GA",
    districtName: "North Goa",
    localityName: "Priol, Ponda Taluka",
    latitude: 15.4439,
    longitude: 73.9686,
    mainDeity: "Manguesh Maharudra (Lord Shiva)",
    deities: ["Lord Shiva (Manguesh)", "Goddess Parvati", "Ganesha", "Nandi"],
    templeType: "Supreme Kuldevta Devasthan of Saraswat Brahmins",
    tradition: ["Shaivism", "Saraswat Heritage"],
    architecture: "Goan Hindu-Portuguese Fusion Architecture with Seven-Storey Deepstambha",
    historicalPeriod: "Shifted from Kushasthali (Cortalim) in 1560 CE / Rebuilt 18th Century",
    description: "One of the most famous and prominent Hindu temples in Goa, renowned for its towering seven-storey octagonal lamp tower (Deepstambha) and graceful Konkani temple tanks.",
    officialWebsite: "https://shrimangesh.com",
    sourceRecordId: "GA-DEVA-PON-001",
    sourceName: "Shri Manguesh Sansthan & Goa Tourism",
    sourceUrl: "https://shrimangesh.com",
    sourceType: "official",
  },
  {
    name: "Shri Shanta Durga Temple Kavlem",
    nameLocal: "श्री शांतादुर्गा देवस्थान कवले",
    stateCode: "GA",
    districtName: "South Goa",
    localityName: "Kavlem, Ponda Taluka",
    latitude: 15.3942,
    longitude: 73.9875,
    mainDeity: "Goddess Shanta Durga (Mediator between Vishnu & Shiva)",
    deities: ["Shanta Durga Devi", "Lord Shiva", "Lord Vishnu"],
    templeType: "Revered Peacemaker Mother Goddess Temple",
    tradition: ["Shaktism", "Smartism"],
    architecture: "Majestic Indo-Portuguese Classical Temple with Pyramid Roof & Deepstambha",
    historicalPeriod: "Shifted from Quelossim in 1566 CE / Rebuilt by King Shahu Maharaj in 1738 CE",
    description: "Built during Maratha rule under King Shahu Maharaj, dedicated to Goddess Shanta Durga who intervened and pacified the fierce celestial battle between Lord Shiva and Lord Vishnu.",
    officialWebsite: "https://shrishantadurgadevasthan.com",
    sourceRecordId: "GA-DEVA-PON-002",
    sourceName: "Shri Shanta Durga Devasthan Trust & Goa Tourism",
    sourceUrl: "https://goatourism.gov.in",
    sourceType: "official",
  },
  {
    name: "Mahadev Temple Tambdi Surla",
    nameLocal: "महादेव मंदिर तांबडी सुर्ला",
    stateCode: "GA",
    districtName: "South Goa",
    localityName: "Tambdi Surla, Bhagwan Mahavir Wildlife Sanctuary",
    latitude: 15.4389,
    longitude: 74.2567,
    mainDeity: "Lord Shiva",
    deities: ["Lord Shiva Lingam", "Lord Vishnu", "Goddess Mahakali"],
    templeType: "12th-Century Kadamba Basalt Stone Temple (ASI National Monument)",
    tradition: ["Shaivism", "Kadamba Heritage"],
    architecture: "Intricately Carved Weather-Proof Grey-Black Basalt Kadamba Architecture",
    historicalPeriod: "Kadamba Dynasty / 12th Century CE",
    description: "The only surviving ancient Kadamba stone temple in Goa that weathered centuries of European rule, nestled in dense forests at the foot of the Western Ghats. Protected by ASI.",
    officialWebsite: "https://goatourism.gov.in/attraction/tambdi-surla/",
    sourceRecordId: "GA-ASI-SAN-003",
    sourceName: "Archaeological Survey of India Goa Circle & Goa Tourism",
    sourceUrl: "https://asigoacircle.gov.in",
    sourceType: "asi",
  },
  {
    name: "Shri Mahalsa Narayani Temple Mardol",
    nameLocal: "श्री म्हाळसा नारायणी संस्थान मर्दोल",
    stateCode: "GA",
    districtName: "North Goa",
    localityName: "Mardol, Ponda Taluka",
    latitude: 15.4286,
    longitude: 73.9619,
    mainDeity: "Goddess Mahalsa (Mohini Incarnation of Vishnu)",
    deities: ["Maa Mahalsa Narayani", "Santeri Devi", "Laxmi Narayan"],
    templeType: "Mohini Avatar Female Deity Shrine",
    tradition: ["Vaishnavism", "Shaktism"],
    architecture: "Traditional Konkani Temple with Huge Brass 40-foot Deepstambha",
    historicalPeriod: "Shifted from Verna in 1565 CE",
    description: "Unique temple dedicated to Goddess Mahalsa Narayani, the divine female Mohini manifestation of Lord Vishnu during the churning of the ocean (Amrit Manthan).",
    officialWebsite: "https://mardolmahalasa.org",
    sourceRecordId: "GA-DEVA-PON-004",
    sourceName: "Shri Mahalsa Sansthan Mardol & Goa Tourism",
    sourceUrl: "https://goatourism.gov.in",
    sourceType: "official",
  },
  {
    name: "Shri Ramnathi Temple Bandora",
    nameLocal: "श्री रामनाथ संस्थान बांदोडा",
    stateCode: "GA",
    districtName: "South Goa",
    localityName: "Bandora, Ponda Taluka",
    latitude: 15.4056,
    longitude: 73.9861,
    mainDeity: "Lord Shiva (Ramnathi - Worshipped by Lord Rama)",
    deities: ["Lord Shiva (Ramanatha)", "Kamadhenu", "Shanteri"],
    templeType: "Ramayana Rameshwaram Lineage Shrine",
    tradition: ["Shaivism"],
    architecture: "Goan Temple Architecture with Distinct Pillar Spire",
    historicalPeriod: "Relocated from Loutolim in 1566 CE / Renovated 1905 CE",
    description: "450-year-old sanctuary dedicated to Lord Shiva as Ramanatha, founded by Lord Rama on his return from Lanka before slaying Ravana.",
    officialWebsite: "https://goatourism.gov.in",
    sourceRecordId: "GA-DEVA-PON-005",
    sourceName: "Shri Ramnathi Devasthan & Goa Tourism",
    sourceUrl: "https://goatourism.gov.in",
    sourceType: "official",
  },
  {
    name: "Shri Damodar Temple Zambaulim",
    nameLocal: "श्री दामोदर संस्थान जांबावली",
    stateCode: "GA",
    districtName: "South Goa",
    localityName: "Zambaulim, Kushavati River Bank",
    latitude: 15.2289,
    longitude: 74.1200,
    mainDeity: "Lord Shiva (Damodar)",
    deities: ["Lord Shiva", "Mata Parvati", "Goddess Mahakali"],
    templeType: "Kushavati River Holy Gulal Utsav Pilgrimage",
    tradition: ["Shaivism"],
    architecture: "Riverfront Temple Complex with Bathing Ghats",
    historicalPeriod: "Shifted from Margao (Madgaon) in 1565 CE",
    description: "The beloved presiding deity of Margao shifted to the tranquil banks of holy Kushavati River in Zambaulim, world-famous for its exuberant Shigmo Gulal festival.",
    officialWebsite: "https://goatourism.gov.in",
    sourceRecordId: "GA-DEVA-SAN-006",
    sourceName: "Shri Damodar Sansthan Zambaulim & Goa Tourism",
    sourceUrl: "https://goatourism.gov.in",
    sourceType: "official",
  },
  {
    name: "Shri Saptakoteshwar Temple Narve",
    nameLocal: "श्री सप्तकोटेश्वर संस्थान नार्वे",
    stateCode: "GA",
    districtName: "North Goa",
    localityName: "Narve, Bicholim Taluka",
    latitude: 15.5417,
    longitude: 73.9167,
    mainDeity: "Lord Shiva (Saptakoteshwar - Lord of 7 Crores)",
    deities: ["Lord Shiva (Saptakoteshwar)", "Dharani Lingam"],
    templeType: "Royal Patron Deity of Kadamba Dynasty (ASI Heritage)",
    tradition: ["Shaivism", "Maratha Heritage"],
    architecture: "Historic Shikhara Temple Restored by Chhatrapati Shivaji Maharaj",
    historicalPeriod: "Kadamba Kings / Restored by Chhatrapati Shivaji Maharaj in 1668 CE",
    description: "The supreme family deity of the Kadamba dynasty. Reconstructed in 1668 CE by Chhatrapati Shivaji Maharaj himself, celebrated as a national monument.",
    officialWebsite: "https://goatourism.gov.in/attraction/saptakoteshwar-temple/",
    sourceRecordId: "GA-ASI-BIC-007",
    sourceName: "Archaeological Survey of India & Goa Tourism",
    sourceUrl: "https://asigoacircle.gov.in",
    sourceType: "asi",
  },
  {
    name: "Shri Kamakshi Temple Shiroda",
    nameLocal: "श्री कामाक्षी देवस्थान शिरोडा",
    stateCode: "GA",
    districtName: "South Goa",
    localityName: "Shiroda, Ponda Taluka",
    latitude: 15.3444,
    longitude: 74.0056,
    mainDeity: "Goddess Kamakshi",
    deities: ["Goddess Kamakshi", "Ravalnath", "Rayeshwar"],
    templeType: "Historic Kanchi Lineage Konkani Shakti Shrine",
    tradition: ["Shaktism"],
    architecture: "Traditional Goan Temple with Grand Wooden Ratha and Octagonal Tower",
    historicalPeriod: "Shifted from Raia in 1568 CE",
    description: "Centuries-old pilgrimage shrine in Shiroda dedicated to Divine Mother Kamakshi, carrying forward the sacred spiritual traditions of Kanchi Kamakshi in the Konkan seaboard.",
    officialWebsite: "https://goatourism.gov.in",
    sourceRecordId: "GA-DEVA-PON-008",
    sourceName: "Shri Kamakshi Devasthan Trust & Goa Tourism",
    sourceUrl: "https://goatourism.gov.in",
    sourceType: "official",
  },
];

export async function importGoaTemples(options: { dryRun?: boolean; parserVersion?: string } = {}) {
  console.log("==================================================");
  console.log("🏛️ GOA TEMPLE INGESTION ENGINE");
  console.log("Source: Goa Devasthan Trusts, ASI Goa & Goa Tourism");
  console.log(`Mode: ${options.dryRun ? "DRY RUN (Validation only)" : "LIVE PRODUCTION INGESTION"}`);
  console.log("==================================================\n");

  return processStateBatch(
    "Goa Devasthan Trusts, ASI Goa & Goa Tourism",
    "https://goatourism.gov.in",
    GOA_AUTHORITATIVE_TEMPLES,
    options
  );
}

// CLI runner
if (process.argv[1]?.endsWith("goa.ts")) {
  const isDryRun = process.argv.includes("--dry-run");
  importGoaTemples({ dryRun: isDryRun })
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
