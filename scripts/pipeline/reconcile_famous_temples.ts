import { existsSync, writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { ALL_INDIA_DESTINATIONS } from "../../src/lib/destinations/all-india-data";
import {
  CANONICAL_BENCHMARK_SPECS,
  CanonicalBenchmarkSpec,
  haversineDistanceKm,
  BenchmarkMatchStatus,
  ReconciliationResult
} from "./build_canonical_temple_index";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
if (existsSync(".env")) process.loadEnvFile(".env");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Old flawed alias mapping to precisely track previous false positives
const OLD_BENCHMARK_ALIASES: Record<string, string[]> = {
  "Tirumala Venkateswara": ["venkateswara", "tirumala", "tirupati"],
  "Srisailam Mallikarjuna": ["srisailam", "mallikarjuna"],
  "Srikalahasteeswara": ["kalahasti", "srikalahasti", "srikalahasteeswara"],
  "Simhachalam": ["simhachalam", "varaha lakshmi"],
  "Kanaka Durga": ["kanaka durga", "vijayawada"],
  "Ahobilam": ["ahobilam", "narasimha"],
  "Kamakhya": ["kamakhya", "guwahati"],
  "Umananda": ["umananda", "peacock island"],
  "Mahabodhi": ["mahabodhi", "bodh gaya"],
  "Vishnupad": ["vishnupad", "gaya"],
  "Mundeshwari": ["mundeshwari", "kaimur"],
  "Danteshwari": ["danteshwari", "dantewada"],
  "Bhoramdeo": ["bhoramdeo", "kawardha"],
  "Mangueshi": ["mangeshi", "mangueshi"],
  "Shantadurga": ["shantadurga", "kavlem"],
  "Mahalasa": ["mahalasa", "mardol"],
  "Somnath": ["somnath", "prabhas patan"],
  "Dwarkadhish": ["dwarkadhish", "dwarka"],
  "Nageshwar": ["nageshwar", "darukavana"],
  "Ambaji": ["ambaji", "arassur"],
  "Modhera": ["modhera", "sun temple"],
  "Akshardham": ["akshardham", "swaminarayan"],
  "Mansa Devi": ["mansa devi", "haridwar", "panchkula"],
  "Sheetla Mata": ["sheetla mata", "gurugram"],
  "Jwala Ji": ["jwala", "jwalaji"],
  "Naina Devi": ["naina devi", "bilaspur", "nainital"],
  "Chintpurni": ["chintpurni", "chinnamastika"],
  "Chamunda Devi": ["chamunda devi", "kangra"],
  "Baijnath": ["baijnath", "vaidyanath"],
  "Hidimba Devi": ["hidimba", "manali"],
  "Vaishno Devi": ["vaishno devi", "katra"],
  "Amarnath": ["amarnath", "pahalgham"],
  "Shankaracharya": ["shankaracharya", "srinagar"],
  "Martand": ["martand", "anantnag"],
  "Kheer Bhawani": ["kheer bhawani", "tulla mulla"],
  "Udupi Krishna": ["udupi krishna", "udupi sri krishna"],
  "Murudeshwar": ["murudeshwar"],
  "Gokarna Mahabaleshwar": ["mahabaleshwar temple, gokarna", "gokarna", "atmalinga"],
  "Kukke Subramanya": ["kukke", "subrahmanya"],
  "Dharmasthala": ["dharmasthala", "manjunatha"],
  "Kollur Mookambika": ["kollur", "mookambika"],
  "Sringeri": ["sringeri", "sharada"],
  "Belur": ["chennakeshava", "belur"],
  "Halebidu": ["hoysaleswara", "halebidu"],
  "Somanathapura": ["somanathapura", "keshava temple"],
  "Hampi": ["virupaksha", "hampi", "vijayanagara"],
  "Pattadakal": ["pattadakal", "virupaksha temple, pattadakal"],
  "Aihole": ["aihole", "durga temple"],
  "Padmanabhaswamy": ["padmanabhaswamy", "ananta padmanabha", "thiruvananthapuram"],
  "Sabarimala": ["sabarimala", "ayyappa"],
  "Guruvayur": ["guruvayur", "guruvayurappan"],
  "Chottanikkara": ["chottanikkara", "bhagavathy"],
  "Attukal": ["attukal", "pongala"],
  "Vadakkunnathan": ["vadakkunnathan", "thrissur"],
  "Ettumanoor": ["ettumanoor", "mahadeva"],
  "Mannarasala": ["mannarasala", "nagaraja"],
  "Ambalappuzha": ["ambalappuzha", "sri krishna"],
  "Vaikom": ["vaikom", "mahadeva"],
  "Mahakaleshwar": ["mahakaleshwar", "ujjain"],
  "Omkareshwar": ["omkareshwar", "mandhata"],
  "Maihar": ["maihar", "sharda devi"],
  "Khajuraho": ["kandariya mahadeva", "khajuraho"],
  "Bhojeshwar": ["bhojeshwar", "bhojpur"],
  "Trimbakeshwar": ["trimbakeshwar", "nasik"],
  "Bhimashankar": ["bhimashankar", "khed"],
  "Grishneshwar": ["grishneshwar", "ghrushneshwar", "ellora"],
  "Shirdi": ["shirdi", "sai baba"],
  "Siddhivinayak": ["siddhivinayak", "mumbai"],
  "Tulja Bhavani": ["tulja bhavani", "tuljapur"],
  "Mahalakshmi Kolhapur": ["mahalakshmi", "kolhapur", "ambabai"],
  "Dagdusheth": ["dagdusheth", "halwai ganpati", "pune"],
  "Ganpatipule": ["ganpatipule", "ratnagiri"],
  "Aundha Nagnath": ["aundha nagnath", "hingoli"],
  "Parli Vaijnath": ["parli vaijnath", "beed"],
  "Jagannath": ["jagannath", "puri"],
  "Konark": ["konark", "sun temple"],
  "Lingaraj": ["lingaraj", "bhubaneswar"],
  "Mukteshwar": ["mukteshwar", "bhubaneswar"],
  "Rajarani": ["rajarani", "bhubaneswar"],
  "Taratarini": ["tara tarini", "taratarini", "ganjam"],
  "Biraja": ["biraja", "jajpur"],
  "Sakshigopal": ["sakshigopal", "satyabadi"],
  "Samaleswari": ["samaleswari", "sambalpur"],
  "Brahma Pushkar": ["brahma temple, pushkar", "pushkar brahma", "brahma"],
  "Shrinathji": ["shrinathji", "nathdwara"],
  "Eklingji": ["eklingji", "udaipur"],
  "Karni Mata": ["karni mata", "deshnoke"],
  "Ranakpur": ["ranakpur", "jain temple"],
  "Dilwara": ["dilwara", "mount abu"],
  "Salasar": ["salasar balaji", "salasar"],
  "Mehandipur": ["mehandipur balaji", "mehandipur"],
  "Khatu Shyam": ["khatu shyam", "sikar"],
  "Tripura Sundari": ["tripura sundari", "matabari", "udaipur, tripura"],
  "Brihadisvara Thanjavur": ["brihadisvara", "thanjavur"],
  "Brihadisvara Gangaikondacholapuram": ["gangaikonda cholapuram", "brihadisvara"],
  "Airavatesvara": ["airavatesvara", "darasuram"],
  "Meenakshi": ["meenakshi", "madurai"],
  "Ranganathaswamy": ["ranganathaswamy", "srirangam"],
  "Chidambaram": ["chidambaram", "thillai nataraja"],
  "Ramanathaswamy": ["ramanathaswamy", "rameswaram"],
  "Arunachaleswarar": ["arunachaleswarar", "tiruvannamalai"],
  "Kamakshi": ["kamakshi amman", "kanchipuram"],
  "Ekambareswarar": ["ekambareswarar", "kanchipuram"],
  "Varadaraja Perumal": ["varadaraja perumal", "kanchipuram"],
  "Kapaleeshwarar": ["kapaleeshwarar", "mylapore", "chennai"],
  "Palani": ["palani", "dhandayuthapani"],
  "Tiruchendur": ["tiruchendur", "subramanya swamy"],
  "Thiruttani": ["thiruttani", "murugan"],
  "Swamimalai": ["swamimalai", "murugan"],
  "Ramappa": ["ramappa", "rudreshwara", "mulugu"],
  "Yadadri": ["yadagirigutta", "yadadri", "lakshmi narasimha"],
  "Bhadrachalam": ["bhadrachalam", "sita ramachandra"],
  "Thousand Pillar": ["thousand pillar", "hanamkonda", "warangal"],
  "Bhadrakali": ["bhadrakali temple, warangal", "warangal bhadrakali"],
  "Jogulamba": ["jogulamba", "alampur"],
  "Chilkur": ["chilkur balaji", "visa balaji", "hyderabad"],
  "Kashi Vishwanath": ["kashi vishwanath", "varanasi"],
  "Ram Mandir": ["ram mandir", "ram janmabhoomi", "ayodhya"],
  "Krishna Janmabhoomi": ["krishna janmabhoomi", "keshavdev", "mathura"],
  "Banke Bihari": ["banke bihari", "vrindavan"],
  "Prem Mandir": ["prem mandir", "vrindavan"],
  "Vindhyavasini": ["vindhyavasini", "mirzapur", "vindhyachal"],
  "Hanuman Garhi": ["hanuman garhi", "ayodhya"],
  "Sankat Mochan": ["sankat mochan", "varanasi"],
  "Gorakhnath": ["gorakhnath", "gorakhpur"],
  "Kal Bhairav": ["kaal bhairav", "kal bhairav", "varanasi"],
  "Kedarnath": ["kedarnath", "rudraprayag"],
  "Badrinath": ["badrinath", "chamoli"],
  "Gangotri": ["gangotri", "uttarkashi"],
  "Yamunotri": ["yamunotri", "uttarkashi"],
  "Tungnath": ["tungnath", "rudraprayag"],
  "Jageshwar": ["jageshwar", "almora"],
  "Hemkund Sahib": ["hemkund sahib", "chamoli"],
  "Dakshineswar": ["dakshineswar", "kali temple"],
  "Kalighat": ["kalighat", "kolkata"],
  "Tarapith": ["tarapith", "birbhum"],
  "Belur Math": ["belur math", "ramakrishna"],
  "Mayapur": ["iskcon mayapur", "chandrodaya", "mayapur"],
  "Tarakeswar": ["tarakeswar", "hooghly"]
};

interface Candidate {
  id: string;
  name: string;
  slug: string;
  stateCode?: string | null;
  stateName?: string | null;
  districtName?: string | null;
  latitude: number;
  longitude: number;
  address?: string | null;
  sourceType?: string | null;
  verificationStatus?: string | null;
  origin: "prisma.temple" | "prisma.place" | "ALL_INDIA_DESTINATIONS";
}

async function reconcile() {
  console.log("Loading datasets...");
  const dbTemples = await prisma.temple.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      stateCode: true,
      latitude: true,
      longitude: true,
      sourceType: true,
      verificationStatus: true,
      address: true,
      district: { select: { name: true } },
      state: { select: { name: true, slug: true } }
    }
  });

  const dbPlaces = await prisma.place.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      state: true,
      district: true,
      latitude: true,
      longitude: true,
      category: true,
      address: true
    }
  });

  console.log(`Loaded ${dbTemples.length} DB temples, ${dbPlaces.length} DB places, ${ALL_INDIA_DESTINATIONS.length} static destinations.`);

  // Combine into unified candidate pool
  const candidatePool: Candidate[] = [];

  for (const t of dbTemples) {
    candidatePool.push({
      id: t.id,
      name: t.name,
      slug: t.slug,
      stateCode: t.stateCode,
      stateName: t.state?.name || t.stateCode,
      districtName: t.district?.name,
      latitude: t.latitude,
      longitude: t.longitude,
      address: t.address,
      sourceType: t.sourceType,
      verificationStatus: t.verificationStatus,
      origin: "prisma.temple"
    });
  }

  for (const p of dbPlaces) {
    candidatePool.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      stateName: p.state,
      districtName: p.district,
      latitude: p.latitude,
      longitude: p.longitude,
      address: p.address,
      sourceType: "prisma.place",
      verificationStatus: "VERIFIED",
      origin: "prisma.place"
    });
  }

  for (const d of ALL_INDIA_DESTINATIONS) {
    candidatePool.push({
      id: d.id,
      name: d.name,
      slug: d.slug,
      stateName: d.state,
      districtName: d.district,
      latitude: d.latitude,
      longitude: d.longitude,
      address: `${d.city || ""}, ${d.district}, ${d.state}`,
      sourceType: d.provenance?.sourceType,
      verificationStatus: "VERIFIED",
      origin: "ALL_INDIA_DESTINATIONS"
    });
  }

  const results: ReconciliationResult[] = [];
  const falsePositivesList: Array<{
    benchmark: string;
    oldMatchedName: string;
    oldMatchedTable: string;
    trueCanonicalName: string;
    issueReason: string;
    resolvedStatus: string;
  }> = [];

  for (const spec of CANONICAL_BENCHMARK_SPECS) {
    // 1. Compute what old naive audit matched
    const oldAliases = OLD_BENCHMARK_ALIASES[spec.benchmarkName] || [spec.benchmarkName.toLowerCase()];
    const oldFound = dbTemples.find(t => {
      const nameL = t.name.toLowerCase();
      const slugL = t.slug.toLowerCase();
      const addrL = (t.address || "").toLowerCase();
      return oldAliases.some(a => 
        nameL.includes(a) || 
        slugL.includes(a.replace(/\s+/g, "-")) || 
        (nameL.includes(a.split(" ")[0]) && addrL.includes(a.split(" ")[1] || ""))
      );
    });

    // 2. Strict candidate evaluation
    // Filter out candidates that violate negative keywords
    const filteredCandidates = candidatePool.filter(c => {
      const nameL = c.name.toLowerCase();
      const slugL = c.slug.toLowerCase();
      const addrL = (c.address || "").toLowerCase();

      // Negative keyword check
      for (const neg of spec.negativeKeywords) {
        const negL = neg.toLowerCase();
        if (nameL.includes(negL) || slugL.includes(negL.replace(/\s+/g, "-")) || addrL.includes(negL)) {
          return false;
        }
      }
      return true;
    });

    // Score candidates based on:
    // a) State matching
    // b) Geodesic distance (Haversine km)
    // c) Keyword matches
    const scoredCandidates: Array<{
      candidate: Candidate;
      distanceKm: number;
      score: number;
      matchedKeyword: string;
    }> = [];

    for (const c of filteredCandidates) {
      const nameL = c.name.toLowerCase();
      const slugL = c.slug.toLowerCase();
      const addrL = (c.address || "").toLowerCase();

      // State check
      const stateMatch =
        (c.stateCode && c.stateCode.toUpperCase() === spec.expectedStateCode.toUpperCase()) ||
        (c.stateName && c.stateName.toLowerCase().includes(spec.expectedState.toLowerCase())) ||
        (c.stateName && spec.expectedState.toLowerCase().includes(c.stateName.toLowerCase()));

      // Keyword check
      let hasKeyword = false;
      let matchedKeyword = "";
      for (const kw of spec.primaryKeywords) {
        const kwL = kw.toLowerCase();
        if (nameL.includes(kwL) || slugL.includes(kwL.replace(/\s+/g, "-"))) {
          hasKeyword = true;
          matchedKeyword = kw;
          break;
        }
      }

      if (!hasKeyword && spec.secondaryKeywords) {
        for (const kw of spec.secondaryKeywords) {
          const kwL = kw.toLowerCase();
          if (nameL.includes(kwL) || slugL.includes(kwL.replace(/\s+/g, "-"))) {
            hasKeyword = true;
            matchedKeyword = kw;
            break;
          }
        }
      }

      if (!hasKeyword) continue;

      const distKm = haversineDistanceKm(c.latitude, c.longitude, spec.latitude, spec.longitude);

      // Scoring
      let score = 0;
      if (stateMatch) score += 50;
      if (distKm < 5.0) score += 40;
      else if (distKm < 15.0) score += 25;
      else if (distKm < 30.0) score += 10;
      else if (distKm > 100.0) score -= 50; // Heavily penalize different geographic location

      // Exact name match bonus
      if (nameL === spec.canonicalName.toLowerCase() || nameL.includes(spec.benchmarkName.toLowerCase())) {
        score += 20;
      }

      // Origin preference: prisma.temple > ALL_INDIA_DESTINATIONS > prisma.place
      if (c.origin === "prisma.temple") score += 5;

      scoredCandidates.push({ candidate: c, distanceKm: distKm, score, matchedKeyword });
    }

    scoredCandidates.sort((a, b) => b.score - a.score);

    const best = scoredCandidates[0];

    // Determine status
    let status: BenchmarkMatchStatus = "MISSING";
    let issueDescription: string | undefined;

    if (!best || best.score < 40) {
      status = "MISSING";
      issueDescription = `No canonical temple record found matching ${spec.canonicalName} within valid geodetic and state boundaries.`;
    } else {
      const c = best.candidate;
      const dist = best.distanceKm;

      if (dist <= 15.0) {
        status = "PRESENT_VERIFIED";
      } else if (dist <= 50.0) {
        status = "PRESENT_NEEDS_REPAIR";
        issueDescription = `Location coordinates are ${dist.toFixed(1)} km away from benchmark sanctuary (${spec.latitude}, ${spec.longitude}). Geodesic calibration needed.`;
      } else {
        // More than 50km away but matched keywords
        status = "WRONG_LOCATION";
        issueDescription = `Candidate located in ${c.districtName || "unknown"}, ${c.stateName || c.stateCode} is ${dist.toFixed(1)} km away from expected site.`;
      }
    }

    // Check false positive with old audit
    if (oldFound) {
      const oldDist = haversineDistanceKm(oldFound.latitude, oldFound.longitude, spec.latitude, spec.longitude);
      const isMismatch = oldDist > 5.0 || spec.negativeKeywords.some(k => oldFound.name.toLowerCase().includes(k.toLowerCase()));

      if (isMismatch) {
        falsePositivesList.push({
          benchmark: spec.benchmarkName,
          oldMatchedName: oldFound.name,
          oldMatchedTable: "prisma.temple",
          trueCanonicalName: spec.canonicalName,
          issueReason: `Old audit loosely matched "${oldFound.name}" (distance: ${oldDist.toFixed(1)} km) which is a distinct temple.`,
          resolvedStatus: status
        });
      }
    }

    results.push({
      benchmarkId: spec.id,
      benchmarkName: spec.benchmarkName,
      expectedState: spec.expectedState,
      expectedDistrict: spec.expectedDistrict,
      expectedLocality: spec.expectedLocality,
      status,
      canonicalId: best?.candidate.id,
      canonicalName: best?.candidate.name,
      slug: best?.candidate.slug,
      matchedState: best?.candidate.stateName || best?.candidate.stateCode || undefined,
      matchedDistrict: best?.candidate.districtName || undefined,
      latitude: best?.candidate.latitude,
      longitude: best?.candidate.longitude,
      distanceKm: best ? Number(best.distanceKm.toFixed(2)) : undefined,
      source: best?.candidate.sourceType || spec.officialSource,
      sourceUrl: spec.officialSourceUrl,
      verificationStatus: best?.candidate.verificationStatus || "VERIFIED",
      issueDescription,
      previousFalsePositiveMapping: oldFound ? `${oldFound.name} [${oldFound.id}]` : "None"
    });
  }

  // Summary counts
  const statusCounts: Record<string, number> = {};
  for (const r of results) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }

  console.log("\n================ RECONCILIATION SUMMARY ================");
  console.log(`Total Benchmarks Evaluated: ${results.length}`);
  for (const [s, count] of Object.entries(statusCounts)) {
    console.log(`  - ${s}: ${count} (${((count / results.length) * 100).toFixed(1)}%)`);
  }
  console.log(`Identified False Positives in Prior Audit: ${falsePositivesList.length}`);

  // Write reconciliation output
  writeFileSync("docs/FAMOUS_TEMPLES_RECONCILIATION.json", JSON.stringify(results, null, 2));
  console.log("Saved docs/FAMOUS_TEMPLES_RECONCILIATION.json");

  // Output missing or problematic list
  const problematic = results.filter(r => r.status !== "PRESENT_VERIFIED");
  console.log(`\nProblematic / Missing Benchmarks (${problematic.length}):`);
  for (const p of problematic) {
    console.log(`  - [${p.status}] ${p.benchmarkName} (${p.expectedState}, ${p.expectedDistrict}) -> ${p.issueDescription || "N/A"}`);
  }

  await prisma.$disconnect();
}

reconcile().catch(console.error);
