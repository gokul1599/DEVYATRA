import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateTempleCandidate,
  haversineDistanceKm,
  normalizeText,
  CandidateRecord
} from "../src/lib/canonical/canonical-identity";

describe("National Canonical Identity & Disambiguation Regression Suite (50+ Gates)", () => {
  // Helper to construct a standard candidate
  function makeCandidate(
    id: string,
    name: string,
    slug: string,
    stateCode: string,
    stateName: string,
    districtName: string,
    lat: number,
    lng: number,
    address = ""
  ): CandidateRecord {
    return {
      id,
      name,
      slug,
      stateCode,
      stateName,
      districtName,
      latitude: lat,
      longitude: lng,
      address,
      origin: "prisma.temple",
    };
  }

  // --- GATE 1: ANDHRA PRADESH & TELANGANA ---
  test("1. Tirumala Venkateswara Swamy ≠ Sri Varaha Swami Temple", () => {
    const benchmark = {
      id: "bm-tirumala",
      benchmarkName: "Tirumala Venkateswara Temple",
      canonicalName: "Sri Venkateswara Swamy Temple",
      expectedState: "Andhra Pradesh",
      expectedStateCode: "AP",
      expectedDistrict: "Tirupati",
      latitude: 13.6833,
      longitude: 79.3472,
      primaryKeywords: ["venkateswara", "tirumala"],
      negativeKeywords: ["varaha", "bedi anjaneya"],
    };
    const varahaCandidate = makeCandidate(
      "c-varaha",
      "Sri Varaha Swami Temple",
      "sri-varaha-swami-temple",
      "AP",
      "Andhra Pradesh",
      "Tirupati",
      13.684,
      79.348
    );
    const result = evaluateTempleCandidate(benchmark, varahaCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
    assert.ok(result.discrepancies.some((d) => d.includes("negative keyword")));
  });

  test("2. Srisailam Mallikarjuna ≠ Araku Mallikarjuna", () => {
    const benchmark = {
      id: "bm-srisailam",
      benchmarkName: "Srisailam Mallikarjuna Jyotirlinga",
      canonicalName: "Sri Bhramaramba Mallikarjuna Swamy Temple",
      expectedState: "Andhra Pradesh",
      expectedStateCode: "AP",
      expectedDistrict: "Nandyal",
      latitude: 16.0744,
      longitude: 78.8681,
      primaryKeywords: ["srisailam", "bhramaramba", "mallikarjuna"],
      negativeKeywords: ["araku"],
    };
    const arakuCandidate = makeCandidate(
      "c-araku",
      "Mallikarjuna Temple near Araku",
      "mallikarjuna-temple-araku",
      "AP",
      "Andhra Pradesh",
      "Alluri Sitharama Raju",
      18.3273,
      82.8775
    );
    const result = evaluateTempleCandidate(benchmark, arakuCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("3. Srikalahasteeswara ≠ Madurai Kalahastiswamy in Tamil Nadu", () => {
    const benchmark = {
      id: "bm-kalahasti",
      benchmarkName: "Srikalahasteeswara Temple",
      canonicalName: "Srikalahasteeswara Temple",
      expectedState: "Andhra Pradesh",
      expectedStateCode: "AP",
      expectedDistrict: "Tirupati",
      latitude: 13.7498,
      longitude: 79.6984,
      primaryKeywords: ["kalahasteeswara", "kalahasti"],
      negativeKeywords: ["madurai"],
    };
    const maduraiCandidate = makeCandidate(
      "c-kalahasti-tn",
      "Kalahastiswamy Temple",
      "kalahastiswamy-temple-madurai",
      "TN",
      "Tamil Nadu",
      "Madurai",
      9.9252,
      78.1198
    );
    const result = evaluateTempleCandidate(benchmark, maduraiCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD", "Must reject candidate in Tamil Nadu");
  });

  test("4. Yadadri Narasimha Swamy ≠ an unrelated Lakshmi Narasimha temple", () => {
    const benchmark = {
      id: "bm-yadadri",
      benchmarkName: "Yadadri Lakshmi Narasimha Swamy Temple",
      canonicalName: "Sri Lakshmi Narasimha Swamy Temple Yadadri",
      expectedState: "Telangana",
      expectedStateCode: "TG",
      expectedDistrict: "Yadadri Bhuvanagiri",
      latitude: 17.5878,
      longitude: 78.9489,
      primaryKeywords: ["yadadri", "yadagirigutta"],
      negativeKeywords: ["ahobilam", "dharmapuri"],
    };
    const otherCandidate = makeCandidate(
      "c-ahobilam",
      "Ahobilam Narasimha Temple",
      "ahobilam-narasimha",
      "AP",
      "Andhra Pradesh",
      "Nandyal",
      15.132,
      78.718
    );
    const result = evaluateTempleCandidate(benchmark, otherCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("5. Bhadrakali Temple Warangal ≠ Godachi Bhadrakali in Karnataka", () => {
    const benchmark = {
      id: "bm-bhadrakali-warangal",
      benchmarkName: "Bhadrakali Temple Warangal",
      canonicalName: "Bhadrakali Temple",
      expectedState: "Telangana",
      expectedStateCode: "TG",
      expectedDistrict: "Hanamkonda",
      latitude: 17.9942,
      longitude: 79.5786,
      primaryKeywords: ["bhadrakali", "warangal", "hanamkonda"],
      negativeKeywords: ["godachi", "belagavi"],
    };
    const karnatakaCandidate = makeCandidate(
      "c-godachi",
      "Godachi Bhadrakali Temple",
      "godachi-bhadrakali-temple",
      "KA",
      "Karnataka",
      "Belagavi",
      15.8497,
      74.4977
    );
    const result = evaluateTempleCandidate(benchmark, karnatakaCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("6. Chilkur Balaji Temple ≠ Hyderabad Kalibari", () => {
    const benchmark = {
      id: "bm-chilkur",
      benchmarkName: "Chilkur Balaji Temple",
      canonicalName: "Chilkur Balaji Temple",
      expectedState: "Telangana",
      expectedStateCode: "TG",
      expectedDistrict: "Rangareddy",
      latitude: 17.3601,
      longitude: 78.3015,
      primaryKeywords: ["chilkur", "visa balaji"],
      negativeKeywords: ["kalibari"],
    };
    const kalibariCandidate = makeCandidate(
      "c-kalibari",
      "Hyderabad Kalibari",
      "hyderabad-kalibari",
      "TG",
      "Telangana",
      "Malkajgiri",
      17.4721,
      78.5321
    );
    const result = evaluateTempleCandidate(benchmark, kalibariCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 2: ASSAM & EAST INDIA ---
  test("7. Kamakhya Temple ≠ Navagraha Temple", () => {
    const benchmark = {
      id: "bm-kamakhya",
      benchmarkName: "Maa Kamakhya Temple",
      canonicalName: "Kamakhya Temple",
      expectedState: "Assam",
      expectedStateCode: "AS",
      expectedDistrict: "Kamrup Metropolitan",
      latitude: 26.1664,
      longitude: 91.7054,
      primaryKeywords: ["kamakhya", "nilachal"],
      negativeKeywords: ["navagraha", "umananda"],
    };
    const navagrahaCandidate = makeCandidate(
      "c-navagraha",
      "Navagraha Temple Guwahati",
      "navagraha-temple-guwahati",
      "AS",
      "Assam",
      "Kamrup Metropolitan",
      26.1856,
      91.7612
    );
    const result = evaluateTempleCandidate(benchmark, navagrahaCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("8. Umananda Temple ≠ Chandrasekhar Temple", () => {
    const benchmark = {
      id: "bm-umananda",
      benchmarkName: "Umananda Temple",
      canonicalName: "Umananda Devaloi",
      expectedState: "Assam",
      expectedStateCode: "AS",
      expectedDistrict: "Kamrup Metropolitan",
      latitude: 26.1928,
      longitude: 91.7454,
      primaryKeywords: ["umananda", "peacock island"],
      negativeKeywords: ["chandrasekhar"],
    };
    const chandraCandidate = makeCandidate(
      "c-chandra",
      "Chandrasekhar Temple",
      "chandrasekhar-temple",
      "AS",
      "Assam",
      "Kamrup Metropolitan",
      26.18,
      91.73
    );
    const result = evaluateTempleCandidate(benchmark, chandraCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 3: BIHAR & JHARKHAND ---
  test("9. Vishnupad Temple Gaya ≠ Mangla Gauri Temple", () => {
    const benchmark = {
      id: "bm-vishnupad",
      benchmarkName: "Vishnupad Temple Gaya",
      canonicalName: "Vishnupad Temple",
      expectedState: "Bihar",
      expectedStateCode: "BR",
      expectedDistrict: "Gaya",
      latitude: 24.7781,
      longitude: 85.0069,
      primaryKeywords: ["vishnupad", "falgu"],
      negativeKeywords: ["mangla gauri", "maa mangla"],
    };
    const manglaCandidate = makeCandidate(
      "c-mangla",
      "Maa Mangla Gauri Mandir",
      "maa-mangla-gauri-mandir",
      "BR",
      "Bihar",
      "Gaya",
      24.775,
      85.001
    );
    const result = evaluateTempleCandidate(benchmark, manglaCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("10. Mundeshwari Temple ≠ Chamundeshwari Temple Mysuru", () => {
    const benchmark = {
      id: "bm-mundeshwari",
      benchmarkName: "Mundeshwari Devi Temple",
      canonicalName: "Maa Mundeshwari Temple",
      expectedState: "Bihar",
      expectedStateCode: "BR",
      expectedDistrict: "Kaimur",
      latitude: 24.9744,
      longitude: 83.5689,
      primaryKeywords: ["mundeshwari", "kaimur"],
      negativeKeywords: ["chamundeshwari", "mysore", "mysuru"],
    };
    const chamundiCandidate = makeCandidate(
      "c-chamundi",
      "Chamundeshwari Temple",
      "chamundeshwari-temple",
      "KA",
      "Karnataka",
      "Mysuru",
      12.2753,
      76.6711
    );
    const result = evaluateTempleCandidate(benchmark, chamundiCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("11. Deo Sun Temple Bihar ≠ Modhera Sun Temple Gujarat", () => {
    const benchmark = {
      id: "bm-deo-sun",
      benchmarkName: "Deo Sun Temple",
      canonicalName: "Deo Surya Mandir",
      expectedState: "Bihar",
      expectedStateCode: "BR",
      expectedDistrict: "Aurangabad",
      latitude: 24.6547,
      longitude: 84.4372,
      primaryKeywords: ["deo", "surya", "aurangabad"],
      negativeKeywords: ["modhera", "konark"],
    };
    const modheraCandidate = makeCandidate(
      "c-modhera",
      "Sun Temple Modhera",
      "sun-temple-modhera",
      "GJ",
      "Gujarat",
      "Mehsana",
      23.5836,
      72.1333
    );
    const result = evaluateTempleCandidate(benchmark, modheraCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 4: GUJARAT & RAJASTHAN ---
  test("12. Modhera Sun Temple ≠ Deo Sun Temple Bihar", () => {
    const benchmark = {
      id: "bm-modhera",
      benchmarkName: "Modhera Sun Temple",
      canonicalName: "Sun Temple Modhera",
      expectedState: "Gujarat",
      expectedStateCode: "GJ",
      expectedDistrict: "Mehsana",
      latitude: 23.5836,
      longitude: 72.1333,
      primaryKeywords: ["modhera", "sun temple"],
      negativeKeywords: ["deo", "bihar"],
    };
    const deoCandidate = makeCandidate(
      "c-deo",
      "Deo Sun Temple",
      "deo-sun-temple",
      "BR",
      "Bihar",
      "Aurangabad",
      24.6547,
      84.4372
    );
    const result = evaluateTempleCandidate(benchmark, deoCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("13. Brahma Temple Pushkar ≠ an unrelated monastery / garden", () => {
    const benchmark = {
      id: "bm-pushkar",
      benchmarkName: "Brahma Temple Pushkar",
      canonicalName: "Jagatpita Brahma Mandir",
      expectedState: "Rajasthan",
      expectedStateCode: "RJ",
      expectedDistrict: "Ajmer",
      latitude: 26.4897,
      longitude: 74.5511,
      primaryKeywords: ["brahma", "pushkar"],
      negativeKeywords: ["monastery", "ganganagar"],
    };
    const monasteryCandidate = makeCandidate(
      "c-monastery",
      "Pushkar Buddhist Monastery",
      "pushkar-buddhist-monastery",
      "RJ",
      "Rajasthan",
      "Ajmer",
      26.491,
      74.555
    );
    const result = evaluateTempleCandidate(benchmark, monasteryCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("14. Ranakpur Jain Temple ≠ an unrelated Jain temple in Bihar", () => {
    const benchmark = {
      id: "bm-ranakpur",
      benchmarkName: "Ranakpur Jain Temple",
      canonicalName: "Ranakpur Chaturmukha Dharana Vihara",
      expectedState: "Rajasthan",
      expectedStateCode: "RJ",
      expectedDistrict: "Pali",
      latitude: 25.1158,
      longitude: 73.4731,
      primaryKeywords: ["ranakpur", "adinatha"],
      negativeKeywords: ["pawapuri", "rajgir"],
    };
    const biharJainCandidate = makeCandidate(
      "c-pawapuri",
      "Pawapuri Jal Mandir",
      "pawapuri-jal-mandir",
      "BR",
      "Bihar",
      "Nalanda",
      25.088,
      85.534
    );
    const result = evaluateTempleCandidate(benchmark, biharJainCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 5: HARYANA, HIMACHAL PRADESH & JAMMU & KASHMIR ---
  test("15. Mansa Devi Temple Panchkula ≠ Pinjore Gardens", () => {
    const benchmark = {
      id: "bm-mansa-devi",
      benchmarkName: "Mata Mansa Devi Temple",
      canonicalName: "Mata Mansa Devi Mandir Panchkula",
      expectedState: "Haryana",
      expectedStateCode: "HR",
      expectedDistrict: "Panchkula",
      latitude: 30.7042,
      longitude: 76.8489,
      primaryKeywords: ["mansa devi", "panchkula"],
      negativeKeywords: ["pinjore", "yadavindra"],
    };
    const pinjoreCandidate = makeCandidate(
      "c-pinjore",
      "Pinjore Gardens (Yadavindra Gardens)",
      "pinjore-gardens",
      "HR",
      "Haryana",
      "Panchkula",
      30.7969,
      76.9142
    );
    const result = evaluateTempleCandidate(benchmark, pinjoreCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("16. Jwala Ji Kangra ≠ a different Jwala temple in another state", () => {
    const benchmark = {
      id: "bm-jwala-ji",
      benchmarkName: "Maa Jwala Ji Temple",
      canonicalName: "Jwalamukhi Devi Temple",
      expectedState: "Himachal Pradesh",
      expectedStateCode: "HP",
      expectedDistrict: "Kangra",
      latitude: 31.8744,
      longitude: 76.3242,
      primaryKeywords: ["jwala", "jwalamukhi", "flame"],
      negativeKeywords: ["kashmir", "tripura"],
    };
    const otherJwala = makeCandidate(
      "c-jwala-kashmir",
      "Jwalamukhi Temple Khrew",
      "jwalamukhi-temple-khrew",
      "JK",
      "Jammu and Kashmir",
      "Pulwama",
      34.021,
      74.962
    );
    const result = evaluateTempleCandidate(benchmark, otherJwala);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("17. Chamunda Devi Temple Kangra ≠ Baijnath Temple Kangra", () => {
    const benchmark = {
      id: "bm-chamunda-devi",
      benchmarkName: "Chamunda Devi Temple Kangra",
      canonicalName: "Shri Chamunda Nandikeshwar Dham",
      expectedState: "Himachal Pradesh",
      expectedStateCode: "HP",
      expectedDistrict: "Kangra",
      latitude: 32.1642,
      longitude: 76.4178,
      primaryKeywords: ["chamunda", "nandikeshwar"],
      negativeKeywords: ["baijnath"],
    };
    const baijnathCandidate = makeCandidate(
      "c-baijnath",
      "Baijnath Shiva Temple",
      "baijnath-shiva-temple-kangra",
      "HP",
      "Himachal Pradesh",
      "Kangra",
      32.0528,
      76.6478
    );
    const result = evaluateTempleCandidate(benchmark, baijnathCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("18. Baijnath Temple Kangra ≠ Baijnath Temple Uttarakhand", () => {
    const benchmark = {
      id: "bm-baijnath-hp",
      benchmarkName: "Baijnath Temple Kangra",
      canonicalName: "Baijnath Temple",
      expectedState: "Himachal Pradesh",
      expectedStateCode: "HP",
      expectedDistrict: "Kangra",
      latitude: 32.0528,
      longitude: 76.6478,
      primaryKeywords: ["baijnath", "vaidyanatha"],
      negativeKeywords: ["bageshwar", "almora"],
    };
    const uttarakhandCandidate = makeCandidate(
      "c-baijnath-uk",
      "Baijnath Temple Bageshwar",
      "baijnath-temple-bageshwar",
      "UK",
      "Uttarakhand",
      "Bageshwar",
      29.9056,
      79.6178
    );
    const result = evaluateTempleCandidate(benchmark, uttarakhandCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("19. Vaishno Devi Shrine ≠ another shrine in Jammu region", () => {
    const benchmark = {
      id: "bm-vaishno-devi",
      benchmarkName: "Shri Mata Vaishno Devi Shrine",
      canonicalName: "Shri Mata Vaishno Devi Temple Katra",
      expectedState: "Jammu and Kashmir",
      expectedStateCode: "JK",
      expectedDistrict: "Reasi",
      latitude: 33.0308,
      longitude: 74.949,
      primaryKeywords: ["vaishno devi", "katra", "bhawan"],
      negativeKeywords: ["bahu fort", "sukrala"],
    };
    const bahuCandidate = makeCandidate(
      "c-bahu",
      "Bawe Wali Mata (Bahu Fort)",
      "bawe-wali-mata",
      "JK",
      "Jammu and Kashmir",
      "Jammu",
      32.7297,
      74.8814
    );
    const result = evaluateTempleCandidate(benchmark, bahuCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("20. Amarnath Cave Shrine ≠ Baba Budha Amarnath", () => {
    const benchmark = {
      id: "bm-amarnath",
      benchmarkName: "Amarnath Cave Shrine",
      canonicalName: "Shri Amarnath Cave Temple",
      expectedState: "Jammu and Kashmir",
      expectedStateCode: "JK",
      expectedDistrict: "Anantnag",
      latitude: 34.2156,
      longitude: 75.5036,
      primaryKeywords: ["amarnath", "holy cave"],
      negativeKeywords: ["budha amarnath", "poonch"],
    };
    const budhaCandidate = makeCandidate(
      "c-budha-amarnath",
      "Baba Budha Amarnath",
      "baba-budha-amarnath",
      "JK",
      "Jammu and Kashmir",
      "Poonch",
      33.805,
      74.298
    );
    const result = evaluateTempleCandidate(benchmark, budhaCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("21. Shankaracharya Temple Srinagar ≠ Mughal Gardens", () => {
    const benchmark = {
      id: "bm-shankaracharya",
      benchmarkName: "Shankaracharya Temple Srinagar",
      canonicalName: "Shankaracharya Temple (Jyeshtheshwara)",
      expectedState: "Jammu and Kashmir",
      expectedStateCode: "JK",
      expectedDistrict: "Srinagar",
      latitude: 34.0722,
      longitude: 74.8422,
      primaryKeywords: ["shankaracharya", "jyeshtheshwara"],
      negativeKeywords: ["mughal gardens", "shalimar", "nishat"],
    };
    const gardenCandidate = makeCandidate(
      "c-mughal-gardens",
      "Nishat Bagh Mughal Gardens",
      "nishat-bagh",
      "JK",
      "Jammu and Kashmir",
      "Srinagar",
      34.125,
      74.878
    );
    const result = evaluateTempleCandidate(benchmark, gardenCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 6: KARNATAKA & KERALA ---
  test("22. Somanathapura Chennakeshava ≠ Belur Chennakeshava", () => {
    const benchmark = {
      id: "bm-somanathapura",
      benchmarkName: "Keshava Temple Somanathapura",
      canonicalName: "Chennakeshava Temple Somanathapura",
      expectedState: "Karnataka",
      expectedStateCode: "KA",
      expectedDistrict: "Mysuru",
      latitude: 12.2758,
      longitude: 76.9044,
      primaryKeywords: ["somanathapura", "keshava"],
      negativeKeywords: ["belur", "hassan"],
    };
    const belurCandidate = makeCandidate(
      "c-belur",
      "Chennakeshava Temple Belur",
      "chennakeshava-temple-belur",
      "KA",
      "Karnataka",
      "Hassan",
      13.1623,
      75.8647
    );
    const result = evaluateTempleCandidate(benchmark, belurCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("23. Hampi Ruins ≠ a random unrelated Virupaksha record in another district", () => {
    const benchmark = {
      id: "bm-virupaksha-hampi",
      benchmarkName: "Virupaksha Temple Hampi",
      canonicalName: "Virupaksha Temple",
      expectedState: "Karnataka",
      expectedStateCode: "KA",
      expectedDistrict: "Vijayanagara",
      latitude: 15.335,
      longitude: 76.46,
      primaryKeywords: ["virupaksha", "hampi"],
      negativeKeywords: ["mulbagal", "pattadakal"],
    };
    const otherCandidate = makeCandidate(
      "c-virupaksha-kolar",
      "Virupaksha Temple Mulbagal",
      "virupaksha-temple-mulbagal",
      "KA",
      "Karnataka",
      "Kolar",
      13.16,
      78.39
    );
    const result = evaluateTempleCandidate(benchmark, otherCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("24. Aihole Complex ≠ a random modern Durga temple", () => {
    const benchmark = {
      id: "bm-aihole",
      benchmarkName: "Durga Temple Complex Aihole",
      canonicalName: "Durga Temple Aihole",
      expectedState: "Karnataka",
      expectedStateCode: "KA",
      expectedDistrict: "Bagalkote",
      latitude: 16.0211,
      longitude: 75.8821,
      primaryKeywords: ["aihole", "durga temple"],
      negativeKeywords: ["varanasi", "kolkata"],
    };
    const varanasiDurga = makeCandidate(
      "c-durga-varanasi",
      "Durga Kund Mandir",
      "durga-kund-mandir",
      "UP",
      "Uttar Pradesh",
      "Varanasi",
      25.2858,
      82.9989
    );
    const result = evaluateTempleCandidate(benchmark, varanasiDurga);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("25. Padmanabhaswamy Temple ≠ Attukal Bhagavathy Temple", () => {
    const benchmark = {
      id: "bm-padmanabhaswamy",
      benchmarkName: "Sree Padmanabhaswamy Temple",
      canonicalName: "Sree Padmanabhaswamy Temple",
      expectedState: "Kerala",
      expectedStateCode: "KL",
      expectedDistrict: "Thiruvananthapuram",
      latitude: 8.483,
      longitude: 76.9436,
      primaryKeywords: ["padmanabhaswamy", "ananta"],
      negativeKeywords: ["attukal", "bhagavathy"],
    };
    const attukalCandidate = makeCandidate(
      "c-attukal",
      "Attukal Bhagavathy Temple",
      "attukal-bhagavathy-temple",
      "KL",
      "Kerala",
      "Thiruvananthapuram",
      8.4721,
      76.9536
    );
    const result = evaluateTempleCandidate(benchmark, attukalCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("26. Chottanikkara Temple ≠ a different Bhagavathy temple", () => {
    const benchmark = {
      id: "bm-chottanikkara",
      benchmarkName: "Chottanikkara Bhagavathy Temple",
      canonicalName: "Chottanikkara Devi Temple",
      expectedState: "Kerala",
      expectedStateCode: "KL",
      expectedDistrict: "Ernakulam",
      latitude: 9.9328,
      longitude: 76.3908,
      primaryKeywords: ["chottanikkara", "makam thozhal"],
      negativeKeywords: ["kodungallur", "attukal"],
    };
    const kodungallurCandidate = makeCandidate(
      "c-kodungallur",
      "Kodungallur Sree Kurumba Bhagavathy Temple",
      "kodungallur-bhagavathy",
      "KL",
      "Kerala",
      "Thrissur",
      10.2269,
      76.1953
    );
    const result = evaluateTempleCandidate(benchmark, kodungallurCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("27. Vaikom Mahadeva Temple ≠ Ettumanoor Mahadeva Temple", () => {
    const benchmark = {
      id: "bm-vaikom",
      benchmarkName: "Vaikom Mahadeva Temple",
      canonicalName: "Vaikom Mahadeva Temple",
      expectedState: "Kerala",
      expectedStateCode: "KL",
      expectedDistrict: "Kottayam",
      latitude: 9.7547,
      longitude: 76.3956,
      primaryKeywords: ["vaikom", "vaikathappan"],
      negativeKeywords: ["ettumanoor"],
    };
    const ettumanoorCandidate = makeCandidate(
      "c-ettumanoor",
      "Ettumanoor Mahadeva Temple",
      "ettumanoor-mahadeva-temple",
      "KL",
      "Kerala",
      "Kottayam",
      9.6711,
      76.5619
    );
    const result = evaluateTempleCandidate(benchmark, ettumanoorCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 7: MADHYA PRADESH & MAHARASHTRA ---
  test("28. Mahakaleshwar Jyotirlinga ≠ Harsiddhi Temple Ujjain", () => {
    const benchmark = {
      id: "bm-mahakal",
      benchmarkName: "Mahakaleshwar Jyotirlinga",
      canonicalName: "Shri Mahakaleshwar Jyotirlinga Temple",
      expectedState: "Madhya Pradesh",
      expectedStateCode: "MP",
      expectedDistrict: "Ujjain",
      latitude: 23.1827,
      longitude: 75.7682,
      primaryKeywords: ["mahakaleshwar", "bhasma aarti"],
      negativeKeywords: ["harsiddhi", "gadkalika"],
    };
    const harsiddhiCandidate = makeCandidate(
      "c-harsiddhi",
      "Maa Harsiddhi Temple Ujjain",
      "maa-harsiddhi-temple-ujjain",
      "MP",
      "Madhya Pradesh",
      "Ujjain",
      23.1844,
      75.7644
    );
    const result = evaluateTempleCandidate(benchmark, harsiddhiCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("29. Bhojeshwar Temple Bhojpur ≠ an unrelated Jain temple", () => {
    const benchmark = {
      id: "bm-bhojeshwar",
      benchmarkName: "Bhojeshwar Temple Bhojpur",
      canonicalName: "Bhojeshwar Mahadev Temple",
      expectedState: "Madhya Pradesh",
      expectedStateCode: "MP",
      expectedDistrict: "Raisen",
      latitude: 23.1008,
      longitude: 77.5858,
      primaryKeywords: ["bhojeshwar", "bhojpur"],
      negativeKeywords: ["jain", "shantinath"],
    };
    const jainCandidate = makeCandidate(
      "c-bhojpur-jain",
      "Bhojpur Jain Temple",
      "bhojpur-jain-temple",
      "MP",
      "Madhya Pradesh",
      "Raisen",
      23.102,
      77.588
    );
    const result = evaluateTempleCandidate(benchmark, jainCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("30. Siddhivinayak Mumbai ≠ Madhur Siddhivinayaka Kerala", () => {
    const benchmark = {
      id: "bm-siddhivinayak-mumbai",
      benchmarkName: "Siddhivinayak Temple Prabhadevi",
      canonicalName: "Shree Siddhivinayak Ganapati Temple Mumbai",
      expectedState: "Maharashtra",
      expectedStateCode: "MH",
      expectedDistrict: "Mumbai City",
      latitude: 19.0169,
      longitude: 72.8304,
      primaryKeywords: ["siddhivinayak", "prabhadevi", "mumbai"],
      negativeKeywords: ["madhur", "kerala", "kasaragod"],
    };
    const madhurCandidate = makeCandidate(
      "c-madhur",
      "Madhur Sree Madanantheshwara-Siddhivinayaka Temple",
      "madhur-temple",
      "KL",
      "Kerala",
      "Kasaragod",
      12.5447,
      75.0089
    );
    const result = evaluateTempleCandidate(benchmark, madhurCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("31. Mahalakshmi Temple Kolhapur ≠ Kanaka Mahalakshmi Visakhapatnam", () => {
    const benchmark = {
      id: "bm-mahalakshmi-kolhapur",
      benchmarkName: "Mahalakshmi Temple Kolhapur",
      canonicalName: "Shri Ambabai Mahalakshmi Temple",
      expectedState: "Maharashtra",
      expectedStateCode: "MH",
      expectedDistrict: "Kolhapur",
      latitude: 16.6947,
      longitude: 74.2236,
      primaryKeywords: ["mahalakshmi", "ambabai", "kolhapur"],
      negativeKeywords: ["kanaka", "visakhapatnam", "vizag"],
    };
    const kanakaCandidate = makeCandidate(
      "c-kanaka-vizag",
      "Sri Kanaka Mahalakshmi Temple",
      "sri-kanaka-mahalakshmi-temple",
      "AP",
      "Andhra Pradesh",
      "Visakhapatnam",
      17.7022,
      83.2989
    );
    const result = evaluateTempleCandidate(benchmark, kanakaCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("32. Ganpatipule Temple ≠ an unrelated Murugan temple", () => {
    const benchmark = {
      id: "bm-ganpatipule",
      benchmarkName: "Swayambhu Ganpati Temple Ganpatipule",
      canonicalName: "Swayambhu Ganpati Temple",
      expectedState: "Maharashtra",
      expectedStateCode: "MH",
      expectedDistrict: "Ratnagiri",
      latitude: 17.1478,
      longitude: 73.2661,
      primaryKeywords: ["ganpatipule", "swayambhu ganpati"],
      negativeKeywords: ["murugan", "palani"],
    };
    const muruganCandidate = makeCandidate(
      "c-murugan",
      "Palani Murugan Temple",
      "palani-murugan-temple",
      "TN",
      "Tamil Nadu",
      "Dindigul",
      10.4447,
      77.5211
    );
    const result = evaluateTempleCandidate(benchmark, muruganCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 8: ODISHA ---
  test("33. Jagannath Temple Puri ≠ a generic Ganesa/Jagannath record in Ranchi", () => {
    const benchmark = {
      id: "bm-jagannath-puri",
      benchmarkName: "Shri Jagannath Temple Puri",
      canonicalName: "Shree Jagannatha Temple Puri",
      expectedState: "Odisha",
      expectedStateCode: "OD",
      expectedDistrict: "Puri",
      latitude: 19.8047,
      longitude: 85.8178,
      primaryKeywords: ["jagannath", "puri"],
      negativeKeywords: ["ranchi", "jharkhand"],
    };
    const ranchiCandidate = makeCandidate(
      "c-jagannath-ranchi",
      "Jagannath Temple Ranchi",
      "jagannath-temple-ranchi",
      "JH",
      "Jharkhand",
      "Ranchi",
      23.312,
      85.281
    );
    const result = evaluateTempleCandidate(benchmark, ranchiCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("34. Konark Sun Temple ≠ Deo Sun Temple Bihar", () => {
    const benchmark = {
      id: "bm-konark",
      benchmarkName: "Konark Sun Temple",
      canonicalName: "Konark Sun Temple (Surya Deula)",
      expectedState: "Odisha",
      expectedStateCode: "OD",
      expectedDistrict: "Puri",
      latitude: 19.8876,
      longitude: 86.0945,
      primaryKeywords: ["konark", "surya deula"],
      negativeKeywords: ["deo", "bihar"],
    };
    const deoCandidate = makeCandidate(
      "c-deo",
      "Deo Sun Temple",
      "deo-sun-temple",
      "BR",
      "Bihar",
      "Aurangabad",
      24.6547,
      84.4372
    );
    const result = evaluateTempleCandidate(benchmark, deoCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("35. Lingaraj Temple Bhubaneswar ≠ Mukteshwar Temple", () => {
    const benchmark = {
      id: "bm-lingaraj",
      benchmarkName: "Lingaraj Temple Bhubaneswar",
      canonicalName: "Lingaraj Temple",
      expectedState: "Odisha",
      expectedStateCode: "OD",
      expectedDistrict: "Khordha",
      latitude: 20.2381,
      longitude: 85.8336,
      primaryKeywords: ["lingaraj", "tribhubaneswar"],
      negativeKeywords: ["mukteshwar", "rajarani"],
    };
    const mukteshwarCandidate = makeCandidate(
      "c-mukteshwar",
      "Mukteshwar Temple Bhubaneswar",
      "mukteshwar-temple-bhubaneswar",
      "OD",
      "Odisha",
      "Khordha",
      20.2431,
      85.8369
    );
    const result = evaluateTempleCandidate(benchmark, mukteshwarCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("36. Rajarani Temple Bhubaneswar ≠ Mukteshwar Temple", () => {
    const benchmark = {
      id: "bm-rajarani",
      benchmarkName: "Rajarani Temple Bhubaneswar",
      canonicalName: "Rajarani Temple",
      expectedState: "Odisha",
      expectedStateCode: "OD",
      expectedDistrict: "Khordha",
      latitude: 20.2514,
      longitude: 85.8458,
      primaryKeywords: ["rajarani", "indreswara"],
      negativeKeywords: ["mukteshwar"],
    };
    const mukteshwarCandidate = makeCandidate(
      "c-mukteshwar",
      "Mukteshwar Temple Bhubaneswar",
      "mukteshwar-temple-bhubaneswar",
      "OD",
      "Odisha",
      "Khordha",
      20.2431,
      85.8369
    );
    const result = evaluateTempleCandidate(benchmark, mukteshwarCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 9: TAMIL NADU ---
  test("37. Kamakshi Amman Temple Kanchipuram ≠ Ekambareswarar Temple", () => {
    const benchmark = {
      id: "bm-kamakshi-kanchipuram",
      benchmarkName: "Kamakshi Amman Temple Kanchipuram",
      canonicalName: "Arulmigu Kamakshi Amman Temple",
      expectedState: "Tamil Nadu",
      expectedStateCode: "TN",
      expectedDistrict: "Kanchipuram",
      latitude: 12.8406,
      longitude: 79.7033,
      primaryKeywords: ["kamakshi", "kanchipuram"],
      negativeKeywords: ["ekambareswarar", "varadaraja"],
    };
    const ekambareswararCandidate = makeCandidate(
      "c-ekambareswarar",
      "Ekambareswarar Temple",
      "ekambareswarar-temple-kanchipuram",
      "TN",
      "Tamil Nadu",
      "Kanchipuram",
      12.8469,
      79.6997
    );
    const result = evaluateTempleCandidate(benchmark, ekambareswararCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("38. Varadaraja Perumal Temple Kanchipuram ≠ Ekambareswarar Temple", () => {
    const benchmark = {
      id: "bm-varadaraja-kanchipuram",
      benchmarkName: "Varadaraja Perumal Temple Kanchipuram",
      canonicalName: "Arulmigu Varadaraja Perumal Temple",
      expectedState: "Tamil Nadu",
      expectedStateCode: "TN",
      expectedDistrict: "Kanchipuram",
      latitude: 12.8197,
      longitude: 79.7247,
      primaryKeywords: ["varadaraja", "athi varadar"],
      negativeKeywords: ["ekambareswarar"],
    };
    const ekambareswararCandidate = makeCandidate(
      "c-ekambareswarar",
      "Ekambareswarar Temple",
      "ekambareswarar-temple-kanchipuram",
      "TN",
      "Tamil Nadu",
      "Kanchipuram",
      12.8469,
      79.6997
    );
    const result = evaluateTempleCandidate(benchmark, ekambareswararCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("39. Tiruchendur Murugan Temple ≠ an unrelated Murugan temple in Salem", () => {
    const benchmark = {
      id: "bm-tiruchendur",
      benchmarkName: "Tiruchendur Subramanya Swamy Temple",
      canonicalName: "Arulmigu Subramaniya Swamy Temple Tiruchendur",
      expectedState: "Tamil Nadu",
      expectedStateCode: "TN",
      expectedDistrict: "Thoothukudi",
      latitude: 8.4964,
      longitude: 78.1289,
      primaryKeywords: ["tiruchendur", "jayanthipuram"],
      negativeKeywords: ["salem", "belukurichi"],
    };
    const salemCandidate = makeCandidate(
      "c-salem-murugan",
      "Murugan Temple Salem",
      "murugan-temple-salem",
      "TN",
      "Tamil Nadu",
      "Salem",
      11.664,
      78.146
    );
    const result = evaluateTempleCandidate(benchmark, salemCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("40. Thiruttani Murugan Temple ≠ an unrelated Subramanya temple in Palani", () => {
    const benchmark = {
      id: "bm-thiruttani",
      benchmarkName: "Thiruttani Murugan Temple",
      canonicalName: "Arulmigu Subramanya Swamy Temple Thiruttani",
      expectedState: "Tamil Nadu",
      expectedStateCode: "TN",
      expectedDistrict: "Tiruvallur",
      latitude: 13.1764,
      longitude: 79.6108,
      primaryKeywords: ["thiruttani", "tanikasalam"],
      negativeKeywords: ["palani", "dindigul"],
    };
    const palaniCandidate = makeCandidate(
      "c-palani",
      "Palani Murugan Temple",
      "palani-murugan-temple",
      "TN",
      "Tamil Nadu",
      "Dindigul",
      10.4447,
      77.5211
    );
    const result = evaluateTempleCandidate(benchmark, palaniCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 10: UTTAR PRADESH ---
  test("41. Kashi Vishwanath Temple ≠ Maa Annapurna Temple Varanasi", () => {
    const benchmark = {
      id: "bm-kashi-vishwanath",
      benchmarkName: "Kashi Vishwanath Jyotirlinga",
      canonicalName: "Shri Kashi Vishwanath Temple",
      expectedState: "Uttar Pradesh",
      expectedStateCode: "UP",
      expectedDistrict: "Varanasi",
      latitude: 25.3109,
      longitude: 83.0107,
      primaryKeywords: ["kashi vishwanath", "golden temple"],
      negativeKeywords: ["annapurna", "kaal bhairav"],
    };
    const annapurnaCandidate = makeCandidate(
      "c-annapurna",
      "Maa Annapurna Mandir Varanasi",
      "maa-annapurna-mandir-varanasi",
      "UP",
      "Uttar Pradesh",
      "Varanasi",
      25.3106,
      83.0103
    );
    const result = evaluateTempleCandidate(benchmark, annapurnaCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("42. Ram Mandir Ayodhya ≠ Balaji Puram Betul (MP)", () => {
    const benchmark = {
      id: "bm-ram-mandir",
      benchmarkName: "Shri Ram Janmabhoomi Mandir Ayodhya",
      canonicalName: "Shri Ram Janmabhoomi Mandir",
      expectedState: "Uttar Pradesh",
      expectedStateCode: "UP",
      expectedDistrict: "Ayodhya",
      latitude: 26.7922,
      longitude: 82.1998,
      primaryKeywords: ["ram janmabhoomi", "ayodhya"],
      negativeKeywords: ["betul", "balaji puram"],
    };
    const betulCandidate = makeCandidate(
      "c-betul",
      "Balaji Puram Temple Betul",
      "balaji-puram-betul",
      "MP",
      "Madhya Pradesh",
      "Betul",
      21.904,
      77.902
    );
    const result = evaluateTempleCandidate(benchmark, betulCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("43. Krishna Janmabhoomi Mathura ≠ Banke Bihari Vrindavan", () => {
    const benchmark = {
      id: "bm-krishna-janmabhoomi",
      benchmarkName: "Shri Krishna Janmabhoomi Mathura",
      canonicalName: "Shri Krishna Janmasthan Temple Complex",
      expectedState: "Uttar Pradesh",
      expectedStateCode: "UP",
      expectedDistrict: "Mathura",
      latitude: 27.505,
      longitude: 77.6694,
      primaryKeywords: ["krishna janmasthan", "janmabhoomi"],
      negativeKeywords: ["banke bihari", "vrindavan"],
    };
    const bankeBihariCandidate = makeCandidate(
      "c-banke-bihari",
      "Shri Banke Bihari Temple Vrindavan",
      "shri-banke-bihari-temple",
      "UP",
      "Uttar Pradesh",
      "Mathura",
      27.5806,
      77.7006
    );
    const result = evaluateTempleCandidate(benchmark, bankeBihariCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("44. Prem Mandir Vrindavan ≠ Banke Bihari Vrindavan", () => {
    const benchmark = {
      id: "bm-prem-mandir",
      benchmarkName: "Prem Mandir Vrindavan",
      canonicalName: "Prem Mandir Vrindavan",
      expectedState: "Uttar Pradesh",
      expectedStateCode: "UP",
      expectedDistrict: "Mathura",
      latitude: 27.5719,
      longitude: 77.6728,
      primaryKeywords: ["prem mandir", "kripalu"],
      negativeKeywords: ["banke bihari"],
    };
    const bankeCandidate = makeCandidate(
      "c-banke-bihari",
      "Shri Banke Bihari Temple Vrindavan",
      "shri-banke-bihari-temple",
      "UP",
      "Uttar Pradesh",
      "Mathura",
      27.5806,
      77.7006
    );
    const result = evaluateTempleCandidate(benchmark, bankeCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("45. Sankat Mochan Varanasi ≠ Annapurna Temple", () => {
    const benchmark = {
      id: "bm-sankat-mochan",
      benchmarkName: "Sankat Mochan Hanuman Temple Varanasi",
      canonicalName: "Sankat Mochan Hanuman Mandir",
      expectedState: "Uttar Pradesh",
      expectedStateCode: "UP",
      expectedDistrict: "Varanasi",
      latitude: 25.2817,
      longitude: 82.9989,
      primaryKeywords: ["sankat mochan", "hanuman"],
      negativeKeywords: ["annapurna", "vishwanath"],
    };
    const annapurnaCandidate = makeCandidate(
      "c-annapurna",
      "Maa Annapurna Mandir",
      "maa-annapurna-mandir-varanasi",
      "UP",
      "Uttar Pradesh",
      "Varanasi",
      25.3106,
      83.0103
    );
    const result = evaluateTempleCandidate(benchmark, annapurnaCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("46. Kaal Bhairav Varanasi ≠ Annapurna Temple", () => {
    const benchmark = {
      id: "bm-kaal-bhairav",
      benchmarkName: "Kaal Bhairav Temple Varanasi",
      canonicalName: "Kaal Bhairav Mandir (Kotwal of Varanasi)",
      expectedState: "Uttar Pradesh",
      expectedStateCode: "UP",
      expectedDistrict: "Varanasi",
      latitude: 25.3183,
      longitude: 83.0142,
      primaryKeywords: ["kaal bhairav", "kotwal of varanasi"],
      negativeKeywords: ["annapurna", "vishwanath"],
    };
    const annapurnaCandidate = makeCandidate(
      "c-annapurna",
      "Maa Annapurna Mandir",
      "maa-annapurna-mandir-varanasi",
      "UP",
      "Uttar Pradesh",
      "Varanasi",
      25.3106,
      83.0103
    );
    const result = evaluateTempleCandidate(benchmark, annapurnaCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 11: WEST BENGAL ---
  test("47. Dakshineswar Kali Temple ≠ Thillai Kali Tamil Nadu", () => {
    const benchmark = {
      id: "bm-dakshineswar",
      benchmarkName: "Dakshineswar Kali Temple",
      canonicalName: "Dakshineswar Kali Temple",
      expectedState: "West Bengal",
      expectedStateCode: "WB",
      expectedDistrict: "North 24 Parganas",
      latitude: 22.655,
      longitude: 88.3575,
      primaryKeywords: ["dakshineswar", "bhavatarini"],
      negativeKeywords: ["thillai kali", "chidambaram"],
    };
    const thillaiCandidate = makeCandidate(
      "c-thillai",
      "Thillai Kali Temple Chidambaram",
      "thillai-kali-temple-chidambaram",
      "TN",
      "Tamil Nadu",
      "Cuddalore",
      11.405,
      79.692
    );
    const result = evaluateTempleCandidate(benchmark, thillaiCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("48. Tarakeswar Temple ≠ Hangseshwari Temple", () => {
    const benchmark = {
      id: "bm-tarakeswar",
      benchmarkName: "Tarakeswar Temple Hooghly",
      canonicalName: "Taraknath Temple Tarakeswar",
      expectedState: "West Bengal",
      expectedStateCode: "WB",
      expectedDistrict: "Hooghly",
      latitude: 22.8881,
      longitude: 88.0189,
      primaryKeywords: ["tarakeswar", "taraknath"],
      negativeKeywords: ["hangseshwari", "bansberia"],
    };
    const hangseCandidate = makeCandidate(
      "c-hangseshwari",
      "Hangseshwari Temple Bansberia",
      "hangseshwari-temple-bansberia",
      "WB",
      "West Bengal",
      "Hooghly",
      22.9589,
      88.4022
    );
    const result = evaluateTempleCandidate(benchmark, hangseCandidate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 12: UTTARAKHAND ---
  test("49. Kedarnath Temple Rudraprayag ≠ Tehri Garhwal duplicates", () => {
    const benchmark = {
      id: "bm-kedarnath",
      benchmarkName: "Kedarnath Jyotirlinga Temple",
      canonicalName: "Kedarnath Temple",
      expectedState: "Uttarakhand",
      expectedStateCode: "UK",
      expectedDistrict: "Rudraprayag",
      latitude: 30.7352,
      longitude: 79.0669,
      primaryKeywords: ["kedarnath"],
      negativeKeywords: ["tehri"],
    };
    const tehriDuplicate = makeCandidate(
      "c-tehri-kedarnath",
      "Kedarnath Temple (Tehri Seed)",
      "kedarnath-temple-tehri",
      "UK",
      "Uttarakhand",
      "Tehri Garhwal",
      30.38,
      78.48
    );
    const result = evaluateTempleCandidate(benchmark, tehriDuplicate);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  test("50. Badrinath Temple Chamoli ≠ Vishnu temple in another state", () => {
    const benchmark = {
      id: "bm-badrinath",
      benchmarkName: "Badrinath Temple",
      canonicalName: "Badrinath Temple (Badri Vishal)",
      expectedState: "Uttarakhand",
      expectedStateCode: "UK",
      expectedDistrict: "Chamoli",
      latitude: 30.7447,
      longitude: 79.4911,
      primaryKeywords: ["badrinath", "badri vishal"],
      negativeKeywords: ["gujarat", "karnataka"],
    };
    const otherVishnu = makeCandidate(
      "c-other-vishnu",
      "Badrinath Temple Ahmedabad",
      "badrinath-temple-ahmedabad",
      "GJ",
      "Gujarat",
      "Ahmedabad",
      23.0225,
      72.5714
    );
    const result = evaluateTempleCandidate(benchmark, otherVishnu);
    assert.strictEqual(result.status, "WRONG_RECORD");
  });

  // --- GATE 13: POSITIVE CANONICAL MATCH PROOFS ---
  test("51. Confirms positive EXACT canonical identification for Meenakshi Temple", () => {
    const benchmark = {
      id: "bm-meenakshi",
      benchmarkName: "Meenakshi Amman Temple Madurai",
      canonicalName: "Arulmigu Meenakshi Sundareswarar Temple",
      expectedState: "Tamil Nadu",
      expectedStateCode: "TN",
      expectedDistrict: "Madurai",
      latitude: 9.9195,
      longitude: 78.1193,
      primaryKeywords: ["meenakshi", "sundareswarar"],
      negativeKeywords: ["tirunelveli"],
    };
    const exactCandidate = makeCandidate(
      "c-meenakshi",
      "Arulmigu Meenakshi Amman Temple",
      "arulmigu-meenakshi-amman-temple-madurai",
      "TN",
      "Tamil Nadu",
      "Madurai",
      9.9195,
      78.1193,
      "Madurai, Tamil Nadu"
    );
    const result = evaluateTempleCandidate(benchmark, exactCandidate);
    assert.ok(
      result.status === "PRESENT_EXACT" || result.status === "PRESENT_CANONICAL",
      `Expected PRESENT_EXACT or PRESENT_CANONICAL, got ${result.status}`
    );
    assert.ok((result.distanceKm || 0) < 0.1, "Exact candidate must be within 100 meters");
  });

  test("52. Confirms positive EXACT canonical identification for Kukke Subramanya", () => {
    const benchmark = {
      id: "bm-kukke",
      benchmarkName: "Kukke Subramanya Temple",
      canonicalName: "Kukke Subramanya Temple",
      expectedState: "Karnataka",
      expectedStateCode: "KA",
      expectedDistrict: "Dakshina Kannada",
      latitude: 12.6644,
      longitude: 75.6158,
      primaryKeywords: ["kukke", "subramanya"],
      negativeKeywords: ["ghati", "kolar"],
    };
    const exactCandidate = makeCandidate(
      "IN-KA-DAK-000003",
      "Kukke Subramanya Temple",
      "kukke-subramanya-temple",
      "KA",
      "Karnataka",
      "Dakshina Kannada",
      12.6644,
      75.6158,
      "Subramanya, Sullia Taluk, Dakshina Kannada, Karnataka"
    );
    const result = evaluateTempleCandidate(benchmark, exactCandidate);
    assert.ok(
      result.status === "PRESENT_EXACT" || result.status === "PRESENT_CANONICAL",
      `Expected PRESENT_EXACT or PRESENT_CANONICAL, got ${result.status}`
    );
  });
});
