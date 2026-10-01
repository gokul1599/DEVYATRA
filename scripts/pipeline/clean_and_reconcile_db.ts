import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { CANONICAL_BENCHMARK_SPECS } from "./build_canonical_temple_index";
import { haversineDistanceKm } from "../../src/lib/canonical/canonical-identity";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
else if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("=== EXECUTING RECONCILIATION & DEDUPLICATION ===");

  // 1. Remove obvious non-temples from prisma.temple
  const nonTempleIds = [
    "t-res-red-fort-old-delhi",
    "t-res-red-fort-central-delhi",
    "t-res-jama-masjid-old-delhi",
    "t-res-jama-masjid-central-delhi",
    "t-res-humayun-s-tomb-nizamuddin",
    "t-res-humayun-s-tomb-south-east-delhi",
    "t-res-pinjore-gardens-pinjore",
    "t-res-pinjore-gardens-panchkula",
    "t-res-mughal-gardens-srinagar",
    "t-res-dachigam-national-park-dachigam",
    "t-res-sultanpur-national-park-sultanpu",
    "t-res-kibber-wildlife-sanctuary-spiti",
    "t-res-betla-national-park-betla",
    "t-res-silent-valley-national-park-mukk",
    "t-res-dudhwa-national-park-dudhwa",
    "t-res-jaldapara-national-park-jaldapar",
    "t-res-similipal-national-park-similipa",
    "t-res-barnawapara-wildlife-sanctuary-b",
    "t-res-kanger-valley-national-park-kang",
    "t-res-nokrek-national-park-nokrek",
    "t-res-murlen-national-park-champhai-re",
    "t-res-khawnglung-wildlife-sanctuary-kh",
    "t-res-mahatma-gandhi-marine-national-p",
    "t-res-sepahijala-wildlife-sanctuary-bi",
    "t-res-sheikh-chilli-tomb-thanesar",
    "t-res-sheikh-chilli-tomb-kurukshetra",
    "t-res-se-cathedral-old-goa",
    "t-res-se-cathedral-north-goa",
    "t-res-st-francis-church-fort-kochi",
    "t-res-st-francis-church-ernakulam",
    "t-res-cathedral-of-mary-help-of-christ",
    "t-res-kavaratti-ujra-mosque-kavaratti",
    "t-res-rohtasgarh-fort-rohtas",
    "t-res-rohtasgarh-fort",
    "t-res-raigad-fort-raigad",
    "t-res-raigad-fort",
    "t-res-kangla-fort-imphal",
    "t-res-kangla-fort-imphal-west",
    "t-res-neermahal-palace-rudrasagar",
    "t-res-neermahal-palace-west-tripura",
    "t-res-shey-palace-shey",
    "t-res-shey-palace-leh",
    "t-res-reis-magos-fort-reis-magos",
    "t-res-reis-magos-fort-north-goa",
    "t-res-ita-fort-itanagar",
    "t-res-ita-fort-papum-pare-itanagar-cap"
  ];

  console.log("\n[1] Deleting non-temples from prisma.temple...");
  let deletedNonTemples = 0;
  for (const id of nonTempleIds) {
    try {
      await prisma.temple.delete({ where: { id } });
      deletedNonTemples++;
    } catch {
      // already gone
    }
  }
  console.log(`Deleted ${deletedNonTemples} non-temples.`);

  // 2. Remove duplicate benchmark records where the canonical record already exists in true district
  const duplicatesToDelete = [
    { duplicateId: "IN-UK-TEH-000002", canonicalId: "IN-UK-RDP-000001", name: "Kedarnath (duplicate in Tehri Garhwal)" },
    { duplicateId: "IN-RJ-GAN-000001", canonicalId: "IN-RJ-AJM-000001", name: "Brahma Pushkar (duplicate in Ganganagar)" },
    { duplicateId: "IN-MP-MAD-000108", canonicalId: "IN-MP-RAI-000006", name: "Bhojeshwar (duplicate in MP Central)" },
    { duplicateId: "IN-KA-KAR-000130", canonicalId: "IN-KA-DAK-000003", name: "Kukke Subramanya (duplicate in Karnataka Central)" },
    { duplicateId: "IN-KA-KAR-000142", canonicalId: "IN-KA-CHI-000003", name: "Sringeri Sharadamba (duplicate in Karnataka Central)" },
    { duplicateId: "IN-RJ-RAJ-000170", canonicalId: "IN-RJ-CHU-000005", name: "Salasar Balaji (duplicate in Rajasthan Central)" },
    { duplicateId: "IN-WB-WES-000165", canonicalId: "IN-WB-NAD-000012", name: "Mayapur Chandrodaya (duplicate in WB Central)" },
    { duplicateId: "IN-UK-UTT-000140", canonicalId: "IN-UK-UTT-000002", name: "Yamunotri (duplicate in Uttarakhand Central)" },
    { duplicateId: "IN-TR-NTR-000105", canonicalId: "IN-TR-GMT-000001", name: "Tripura Sundari (duplicate in NTR)" },
    { duplicateId: "IN-TN-TAM-000187", canonicalId: "IN-TN-KAN-000012", name: "Ekambareswarar (duplicate in Tamil Nadu Central)" },
    { duplicateId: "IN-TN-CHE-000186", canonicalId: "IN-TN-KAN-000012", name: "Ekambareswarar (duplicate in Chennai)" },
    { duplicateId: "IN-TN-TAM-000161", canonicalId: "IN-TN-THO-000162", name: "Tiruchendur (duplicate in Tamil Nadu Central)" },
    { duplicateId: "IN-TN-DIN-000139", canonicalId: "IN-TN-DIN-000009", name: "Palani (duplicate in Dindigul)" },
    { duplicateId: "IN-MH-MAH-000178", canonicalId: "IN-MH-OSM-000005", name: "Tulja Bhavani (duplicate in Maharashtra Central)" },
    { duplicateId: "IN-MH-HIN-000188", canonicalId: "IN-MH-HIN-000003", name: "Aundha Nagnath (duplicate in Hingoli)" },
    { duplicateId: "IN-MP-KHA-000156", canonicalId: "IN-MP-KHA-000004", name: "Omkareshwar (duplicate in Khandwa)" },
    { duplicateId: "IN-UP-GOR-000146", canonicalId: "IN-UP-GOR-000005", name: "Gorakhnath (duplicate in Gorakhpur)" },
    { duplicateId: "t-res-mukteshwar-temple-khordha", canonicalId: "t-res-mukteshwar-temple-bhubaneswar", name: "Mukteshwar (duplicate in Khordha)" },
    { duplicateId: "t-res-durga-temple-bagalkote", canonicalId: "t-res-durga-temple-aihole", name: "Aihole Durga (duplicate in Bagalkot)" },
    // Local duplicate pairs in t-res
    { duplicateId: "t-res-mogili-temple-chittoor", canonicalId: "t-res-mogili-temple-mogili", name: "Mogili Temple duplicate" },
    { duplicateId: "t-res-adityeswara-temple-chittoor", canonicalId: "t-res-adityeswara-temple-bokkisampalem", name: "Adityeswara duplicate" },
    { duplicateId: "t-res-virupaksha-temple-chittoor", canonicalId: "t-res-virupaksha-temple-kangundi-area", name: "Virupaksha Kangundi duplicate" },
    { duplicateId: "t-res-virupaksha-temple-sri-sathya-sai", canonicalId: "t-res-virupaksha-temple-hemavathi", name: "Virupaksha Hemavathi duplicate" },
    { duplicateId: "t-res-durga-temple-ysr", canonicalId: "t-res-durga-temple-pushpagiri", name: "Durga Pushpagiri duplicate" },
    { duplicateId: "t-res-rudrapada-ysr", canonicalId: "t-res-rudrapada-pushpagiri", name: "Rudrapada Pushpagiri duplicate" },
    { duplicateId: "t-res-gadhadara-temple-annamayya", canonicalId: "t-res-gadhadara-temple-attirala", name: "Gadhadara Attirala duplicate" },
    { duplicateId: "t-res-siddeswara-temple-annamayya", canonicalId: "t-res-siddeswara-temple-tallapaka", name: "Siddeswara Tallapaka duplicate" }
  ];

  console.log("\n[2] Reconciling and deleting verified duplicate records...");
  let deletedDuplicates = 0;
  for (const d of duplicatesToDelete) {
    try {
      await prisma.temple.delete({ where: { id: d.duplicateId } });
      deletedDuplicates++;
      console.log(`  ✓ Deleted ${d.name} [${d.duplicateId}] in favor of canonical [${d.canonicalId}]`);
    } catch {
      // ignore
    }
  }
  console.log(`Deleted ${deletedDuplicates} duplicate records.`);

  // 3. Single-record benchmark temples with corrupted districts: UPDATE them directly!
  const singleRecordsToFix = [
    {
      id: "IN-AS-TIN-000002",
      districtId: "cmubbko4800ewosffhmcqyrbw", // Kamrup Metropolitan
      name: "Maa Kamakhya Temple",
      address: "Nilachal Hill, Guwahati, Kamrup Metropolitan, Assam 781010",
      source: "Maa Kamakhya Devalaya",
      sourceUrl: "https://www.maakamakhya.org/"
    },
    {
      id: "IN-GJ-NTR-000102",
      districtId: "cmubbivk70058osffy3vp2npa", // Banaskantha
      name: "Ambaji Mata Temple",
      address: "Gabbar Hill, Ambaji, Banaskantha, Gujarat 385110",
      source: "Shree Arasuri Ambaji Mata Devasthan Trust",
      sourceUrl: "https://www.ambajitemple.in/"
    },
    {
      id: "IN-GJ-MAN-000154",
      districtId: "cmubbiwa5005cosffozy6qw46", // Gandhinagar
      name: "Swaminarayan Akshardham",
      address: "Sector 20, J Road, Gandhinagar, Gujarat 382020",
      source: "BAPS Swaminarayan Sanstha",
      sourceUrl: "https://akshardham.com/gujarat/"
    },
    {
      id: "IN-KA-KRI-000159",
      districtId: "cmubbii4c0035osff2tnw68ej", // Uttara Kannada
      name: "Mahabaleshwar Temple, Gokarna",
      address: "Koti Teertha Road, Gokarna, Uttara Kannada, Karnataka 581326",
      source: "Shree Mahabaleshwara Temple Administration",
      sourceUrl: "https://gokarnamahaabaleshwara.com/"
    },
    {
      id: "IN-KA-KAR-000123",
      districtId: "cmubbijk7003dosffr3gl5v08", // Hassan
      name: "Hoysaleswara Temple, Halebidu",
      address: "Halebidu, Hassan District, Karnataka 573121",
      source: "Archaeological Survey of India (ASI) / UNESCO",
      sourceUrl: "https://whc.unesco.org/en/list/1670"
    },
    {
      id: "IN-KA-NTR-000182",
      districtId: "cmubbilcu003nosfflccnrof1", // Mysuru
      name: "Keshava Temple, Somanathapura",
      address: "Somanathapura, Tirumakudalu Narasipura Taluk, Mysuru, Karnataka 571120",
      source: "Archaeological Survey of India (ASI) / UNESCO",
      sourceUrl: "https://whc.unesco.org/en/list/1670"
    },
    {
      id: "IN-KA-VIJ-000006",
      districtId: "cmubbigpb002xosff70h2j0bz", // Bagalkot
      name: "Durga Temple, Aihole",
      address: "Aihole, Hunagund Taluk, Bagalkot District, Karnataka 587124",
      source: "Archaeological Survey of India (ASI)",
      sourceUrl: "https://asi.nic.in/"
    },
    {
      id: "IN-KL-KER-000219",
      districtId: "cmubbimyz003wosffqc010sxq", // Thrissur
      name: "Vadakkunnathan Temple",
      address: "Thekkinkadu Maidan, Thrissur, Kerala 680001",
      source: "Cochin Devaswom Board",
      sourceUrl: "https://cochindevaswomboard.org/"
    },
    {
      id: "IN-KL-KER-000221",
      districtId: "cmubbini2003zosff2zuzveeo", // Kottayam
      name: "Vaikom Mahadeva Temple",
      address: "Vaikom, Kottayam District, Kerala 686141",
      source: "Travancore Devaswom Board",
      sourceUrl: "https://travancoredevaswomboard.org/"
    },
    {
      id: "IN-MH-NTR-000147",
      districtId: "cmubbiqr6004hosff22bz3p39", // Pune
      name: "Bhimashankar Jyotirlinga Temple",
      address: "Bhimashankar, Khed Taluka, Pune District, Maharashtra 410509",
      source: "Shree Bhimashankar Sansthan",
      sourceUrl: "https://bhimashankar.in/"
    },
    {
      id: "IN-MH-MUM-000009",
      districtId: "cmubbiol40045osffra4hc3vq", // Mumbai City
      name: "Shree Siddhivinayak Temple, Prabhadevi",
      address: "SK Bole Marg, Prabhadevi, Mumbai City, Maharashtra 400028",
      source: "Shree Siddhivinayak Ganapati Temple Trust",
      sourceUrl: "https://www.siddhivinayak.org/"
    },
    {
      id: "IN-MH-MUM-000001",
      districtId: "cmubbira9004kosffntm3xfeo", // Kolhapur
      name: "Shri Mahalakshmi (Ambabai) Temple, Kolhapur",
      address: "Bhavani Mandap, Kolhapur, Maharashtra 416012",
      source: "Paschim Maharashtra Devasthan Samiti",
      sourceUrl: "https://mahalaxmikolhapur.com/"
    },
    {
      id: "IN-OD-BAR-000050",
      districtId: "cmubbk11j00beosffy87e2ifn", // Khordha
      name: "Rajarani Temple, Bhubaneswar",
      address: "Rajarani Temple, Old Town, Bhubaneswar, Khordha District, Odisha 751002",
      source: "Archaeological Survey of India (ASI)",
      sourceUrl: "https://asi.nic.in/"
    },
    {
      id: "IN-RJ-RAJ-000128",
      districtId: "cmubbj1lg0066osfft7e4bqfm", // Bikaner
      name: "Karni Mata Temple, Deshnoke",
      address: "Deshnoke, Bikaner District, Rajasthan 334801",
      source: "Shri Karni Mandir Trust",
      sourceUrl: "https://karnimata.com/"
    },
    {
      id: "IN-TN-TAM-000163",
      districtId: "cmubbidfx002fosff3euu63ml", // Thanjavur
      name: "Swaminatha Swamy Temple, Swamimalai",
      address: "Swamimalai, Kumbakonam Taluk, Thanjavur District, Tamil Nadu 612302",
      source: "HR&CE Department, Government of Tamil Nadu",
      sourceUrl: "https://hrce.tn.gov.in/"
    },
    {
      id: "IN-TS-NTR-000110",
      districtId: "cmubbi6sd001eosffszztt2bq", // Rangareddy
      name: "Chilkur Balaji Temple (Visa Balaji)",
      address: "Chilkur Village, Gandipet Mandal, Rangareddy District, Telangana 500075",
      source: "Chilkur Balaji Temple Trust",
      sourceUrl: "https://chilkurbalaji.org/"
    },
    {
      id: "IN-UP-UTT-000156",
      districtId: "cmubbjene0083osffspunvcrj", // Varanasi
      name: "Sankat Mochan Hanuman Temple",
      address: "Sankat Mochan Saket Nagar Road, Varanasi, Uttar Pradesh 221005",
      source: "Sankat Mochan Foundation",
      sourceUrl: "https://varanasi.nic.in/tourist-place/sankat-mochan-temple/"
    },
    {
      id: "IN-UK-UTT-000138",
      districtId: "cmubbjmn80096osff44g0600z", // Rudraprayag
      name: "Tungnath Mahadev Temple",
      address: "Chopta Tungnath Trek, Rudraprayag District, Uttarakhand 246419",
      source: "Shri Badrinath-Kedarnath Temple Committee (BKTC)",
      sourceUrl: "https://badrinath-kedarnath.gov.in/"
    },
    {
      id: "IN-UK-NTR-000116",
      districtId: "cmubbjnpm009cosffra4nmmtq", // Almora
      name: "Jageshwar Dham Temple Complex",
      address: "Jageshwar Valley, Almora District, Uttarakhand 263623",
      source: "Archaeological Survey of India (ASI)",
      sourceUrl: "https://almora.nic.in/tourist-place/jageshwar/"
    },
    {
      id: "IN-UK-UTT-000127",
      districtId: "cmubbjof0009gosff7kabpbzj", // Haridwar
      name: "Maa Mansa Devi Temple, Haridwar",
      address: "Bilwa Parvat, Haridwar, Uttarakhand 249401",
      source: "Shri Mansa Devi Mandir Trust",
      sourceUrl: "https://haridwar.nic.in/tourist-place/mansa-devi-temple/"
    },
    {
      id: "IN-WB-KRI-000107",
      districtId: "cmubbki4n00dzosff235d2zti", // Howrah
      name: "Belur Math",
      address: "Belur, Howrah, West Bengal 711202",
      source: "Ramakrishna Math and Ramakrishna Mission Headquarters",
      sourceUrl: "https://belurmath.org/"
    },
    {
      id: "IN-WB-WES-000163",
      districtId: "cmubbkib100e0osffnqtlachl", // Hooghly
      name: "Taraknath Temple, Tarakeswar",
      address: "Tarakeswar, Hooghly District, West Bengal 712410",
      source: "Tarakeswar Mandir Estate Board",
      sourceUrl: "https://hooghly.nic.in/tourist-place/tarakeswar/"
    },
    {
      id: "IN-AP-KRI-000114",
      districtId: "cmubbi0jt000fosff4dh3crh2", // NTR
      name: "Sri Durga Malleswara Swamy Varla Devasthanam, Vijayawada",
      address: "Indrakeeladri Hill, Vijayawada, NTR District, Andhra Pradesh 520001",
      source: "Sri Durga Malleswara Swamy Varla Devasthanam",
      sourceUrl: "https://kanakadurgamma.org/"
    },
    {
      id: "IN-JK-JAM-000117",
      districtId: "cmubbloiw00kiosffv006pa4y", // Anantnag
      name: "Martand Sun Temple",
      address: "Kehribal, Mattan, Anantnag District, Jammu and Kashmir 192125",
      source: "Archaeological Survey of India (ASI)",
      sourceUrl: "https://asi.nic.in/"
    },
    {
      id: "IN-GA-GOA-000106",
      districtId: "cmubbkq8y00f8osffwb7x0hi7", // North Goa
      name: "Shree Mahalasa Narayani Temple, Mardol",
      address: "Mardol, Ponda Taluka, North Goa 403404",
      source: "Shree Mahalasa Saunsthan Mardol",
      sourceUrl: "https://mahalasa.org/"
    }
  ];

  console.log("\n[3] Repairing single-record benchmark temples with correct LGD district & provenance...");
  let repairedSingle = 0;
  for (const s of singleRecordsToFix) {
    try {
      await prisma.temple.update({
        where: { id: s.id },
        data: {
          districtId: s.districtId,
          name: s.name,
          address: s.address,
          source: s.source,
          sourceType: "official",
          sourceUrl: s.sourceUrl,
          verificationStatus: "VERIFIED_OFFICIAL",
          dataConfidence: 95,
          isCentroidFallback: false,
          lastVerifiedAt: new Date()
        }
      });
      repairedSingle++;
      console.log(`  ✓ Updated record [${s.id}] "${s.name}" to verified district ${s.districtId}`);
    } catch (e: any) {
      console.warn(`  ⚠️ Failed to update [${s.id}]:`, e.message);
    }
  }
  console.log(`Repaired ${repairedSingle} / ${singleRecordsToFix.length} single-record benchmark temples.`);

  // 4. Reassign remaining synthetic Central district temples using derived district centroids
  console.log("\n[4] Reassigning remaining synthetic Central district temples...");
  const nonCentralTemples = await prisma.temple.findMany({
    where: {
      district: { name: { not: { contains: "Central" } } },
      latitude: { not: 0 },
      longitude: { not: 0 }
    },
    select: {
      districtId: true,
      latitude: true,
      longitude: true,
      stateCode: true,
      district: { select: { id: true, name: true } }
    }
  });

  const distMap = new Map<string, { latSum: number; lngSum: number; count: number; name: string; stateCode: string }>();
  for (const t of nonCentralTemples) {
    const entry = distMap.get(t.districtId) || { latSum: 0, lngSum: 0, count: 0, name: t.district.name, stateCode: t.stateCode };
    entry.latSum += t.latitude;
    entry.lngSum += t.longitude;
    entry.count += 1;
    distMap.set(t.districtId, entry);
  }

  const remainingCentral = await prisma.temple.findMany({
    where: {
      district: { name: { contains: "Central" } },
      stateCode: { not: "DL" }
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      stateCode: true
    }
  });

  console.log(`Remaining Central temples to reassign: ${remainingCentral.length}`);
  let reassigned = 0;
  for (const t of remainingCentral) {
    let bestDistId: string | null = null;
    let minDist = Infinity;

    for (const [dId, c] of distMap.entries()) {
      if (c.stateCode.toUpperCase() === t.stateCode.toUpperCase()) {
        const centerLat = c.latSum / c.count;
        const centerLng = c.lngSum / c.count;
        const d = haversineDistanceKm(t.latitude, t.longitude, centerLat, centerLng);
        if (d < minDist) {
          minDist = d;
          bestDistId = dId;
        }
      }
    }

    if (bestDistId && minDist <= 150.0) {
      await prisma.temple.update({
        where: { id: t.id },
        data: {
          districtId: bestDistId,
          dataConfidence: Math.max(70, Math.min(85, Math.round(90 - minDist / 5))),
          isCentroidFallback: false
        }
      });
      reassigned++;
    }
  }
  console.log(`Reassigned ${reassigned} / ${remainingCentral.length} remaining Central temples.`);

  console.log("\n=== ALL REPAIR OPERATIONS COMPLETED ===");
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error("Execution error:", e);
  process.exit(1);
});
