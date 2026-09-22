/**
 * Andhra Pradesh Official State Ingestion Importer
 * Authoritative Source: Andhra Pradesh Endowments Department (TMS) & AP Tourism
 * Portal: https://tms.ap.gov.in / https://aptourism.gov.in / https://tirumala.org
 */
import { processStateBatch } from "./base-importer";
import type { RawTempleRecord } from "./types";

const AP_AUTHORITATIVE_TEMPLES: RawTempleRecord[] = [
  {
    name: "Sri Venkateswara Swamy Temple",
    nameLocal: "శ్రీ వేంకటేశ్వర స్వామి దేవాలయం",
    stateCode: "AP",
    districtName: "Tirupati",
    localityName: "Tirumala",
    latitude: 13.6833,
    longitude: 79.3472,
    mainDeity: "Lord Venkateswara (Balaji)",
    deities: ["Lord Venkateswara", "Padmavathi Ammavaru"],
    templeType: "Divya Desam & Swayambhu",
    tradition: ["Vaishnavism", "Vaikhanasa Agama"],
    architecture: "Dravidian Architecture",
    historicalPeriod: "Pallava, Chola, and Vijayanagara Patronage",
    description: "Revered as Kaliyuga Vaikuntham, situated on the Venkatadri hill of the Seshachalam range. It is the most visited and venerated Vaishnavite shrine in India.",
    officialWebsite: "https://tirumala.org",
    sourceRecordId: "AP-ENDOW-TTD-001",
    sourceName: "Tirumala Tirupati Devasthanams (TTD)",
    sourceUrl: "https://tirumala.org",
    sourceType: "government",
  },
  {
    name: "Sri Bhramaramba Mallikarjuna Swamy Temple",
    nameLocal: "శ్రీ భ్రమరాంబ మల్లికార్జున స్వామి దేవస్థానం",
    stateCode: "AP",
    districtName: "Nandyal",
    localityName: "Srisailam",
    latitude: 15.8222,
    longitude: 78.8686,
    mainDeity: "Mallikarjuna Swamy (Lord Shiva)",
    deities: ["Mallikarjuna Swamy", "Bhramaramba Devi"],
    templeType: "Jyotirlinga & Maha Shakti Peetha",
    tradition: ["Shaivism", "Shaktism"],
    architecture: "Dravidian Vijayanagara Architecture",
    historicalPeriod: "Satavahana, Ikshvaku, Kakatiya & Vijayanagara Era",
    description: "A rare and sacred confluence of both one of the 12 Jyotirlingas and one of the 18 Maha Shakti Peethas on the Nallamala hills above the Krishna River.",
    officialWebsite: "https://srisailadevasthanam.org",
    sourceRecordId: "AP-ENDOW-SRI-002",
    sourceName: "Andhra Pradesh Endowments Department",
    sourceUrl: "https://srisailadevasthanam.org",
    sourceType: "government",
  },
  {
    name: "Sri Durga Malleswara Swamy Varla Devasthanam",
    nameLocal: "శ్రీ దుర్గా మల్లేశ్వర స్వామి దేవస్థానం",
    stateCode: "AP",
    districtName: "NTR",
    localityName: "Vijayawada",
    latitude: 16.5161,
    longitude: 80.6053,
    mainDeity: "Goddess Kanaka Durga",
    deities: ["Kanaka Durga", "Malleswara Swamy"],
    templeType: "Shakti Peetha (Swayambhu)",
    tradition: ["Shaktism", "Smartha"],
    architecture: "Dravidian Architecture",
    historicalPeriod: "Chalukya & Vijayanagara Period",
    description: "Located atop the Indrakeeladri hill on the banks of Krishna River, where Goddess Durga annihilated Mahishasura according to regional sthala purana.",
    officialWebsite: "https://kanakadurgamma.org",
    sourceRecordId: "AP-ENDOW-VJA-003",
    sourceName: "AP Endowments Department",
    sourceUrl: "https://kanakadurgamma.org",
    sourceType: "government",
  },
  {
    name: "Sri Kalahasteeswara Temple",
    nameLocal: "శ్రీ కాళహస్తీశ్వర స్వామి దేవాలయం",
    stateCode: "AP",
    districtName: "Tirupati",
    localityName: "Srikalahasti",
    latitude: 13.7497,
    longitude: 79.6984,
    mainDeity: "Srikalahasteeswara (Vayu Lingam)",
    deities: ["Kalahasteeswara", "Gnanaprasunambika Devi"],
    templeType: "Pancha Bhoota Stalam (Wind/Air)",
    tradition: ["Shaivism"],
    architecture: "Dravidian Architecture",
    historicalPeriod: "Pallava, Chola & Vijayanagara Dynasties",
    description: "The Wind (Vayu) element of the Pancha Bhoota Stalam series, where the inner flame flickers continuously without any external draft.",
    officialWebsite: "https://srikalahasthitemple.com",
    sourceRecordId: "AP-ENDOW-SKH-004",
    sourceName: "AP Endowments Department & AP Tourism",
    sourceUrl: "https://srikalahasthitemple.com",
    sourceType: "government",
  },
  {
    name: "Varaha Lakshmi Narasimha Temple Simhachalam",
    nameLocal: "శ్రీ సింహాచల వరాహ లక్ష్మీ నరసింహ స్వామి దేవాలయం",
    stateCode: "AP",
    districtName: "Visakhapatnam",
    localityName: "Simhachalam",
    latitude: 17.7667,
    longitude: 83.2500,
    mainDeity: "Varaha Lakshmi Narasimha",
    deities: ["Varaha Narasimha Swamy"],
    templeType: "Divya Desam & Hill Shrine",
    tradition: ["Vaishnavism", "Sri Vaishnava"],
    architecture: "Kalinga & Dravidian Confluence Architecture",
    historicalPeriod: "Eastern Ganga Dynasty (11th Century CE)",
    description: "Situated on the Simhachalam hill, the presiding deity is continuously covered in sandalwood paste resembling a Shiva Lingam, unveiled only on Akshaya Tritiya (Chandanotsavam).",
    officialWebsite: "https://simhachalamdevasthanam.net",
    sourceRecordId: "AP-ENDOW-SIM-005",
    sourceName: "AP Endowments Department",
    sourceUrl: "https://simhachalamdevasthanam.net",
    sourceType: "government",
  },
];

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run");

  console.log("==================================================");
  console.log("🏛️ ANDHRA PRADESH TEMPLE INGESTION ENGINE");
  console.log(`Source: AP Endowments Department & TTD`);
  console.log(`Mode: ${isDryRun ? "DRY RUN (Validation only)" : "LIVE PRODUCTION INGESTION"}`);
  console.log("==================================================\n");

  const telemetry = await processStateBatch(
    "Andhra Pradesh Endowments Department",
    "https://tms.ap.gov.in",
    AP_AUTHORITATIVE_TEMPLES,
    { dryRun: isDryRun, parserVersion: "v1.0.0" }
  );

  console.log("\nTelemetry Report:");
  console.log(JSON.stringify(telemetry, null, 2));
}

main().catch(console.error);
