/**
 * DEVYATRA / TEMPLEORA — NATIONAL SOURCE REGISTRY
 * 
 * Master authoritative registry of statutory, treaty, institutional,
 * and state government sources for India-wide place intelligence.
 * 
 * Strict Zero-Fabrication Rule:
 * Every source corresponds to a genuine, verifiable government ministry,
 * statutory authority, academic body, or international treaty organization.
 */

export interface SourceDefinition {
  id: string;
  name: string;
  shortName: string;
  publisher: string;
  authority: "GOVERNMENT" | "STATUTORY" | "UNESCO" | "INSTITUTIONAL" | "ACADEMIC" | "TOURISM" | "SECONDARY";
  tier: 1 | 2 | 3 | 4 | 5;
  url: string;
  scope: string[];
  description: string;
  statutoryMandate?: string;
  activeStatus: "ACTIVE" | "ARCHIVED" | "UNDER_REVIEW";
}

export const NATIONAL_SOURCE_REGISTRY: SourceDefinition[] = [
  // ==========================================
  // TIER 1: STATUTORY, TREATY & UNION MINISTRIES
  // ==========================================
  {
    id: "asi-national",
    name: "Archaeological Survey of India — Centrally Protected Monuments",
    shortName: "ASI",
    publisher: "Ministry of Culture, Government of India",
    authority: "STATUTORY",
    tier: 1,
    url: "https://asi.nic.in/monuments-of-national-importance/",
    scope: ["HERITAGE", "CAVES", "SACRED"],
    description: "Centrally protected monuments, archaeological excavation sites, rock shelters, and ancient forts protected under AMASR Act 1958.",
    statutoryMandate: "Ancient Monuments and Archaeological Sites and Remains Act, 1958",
    activeStatus: "ACTIVE",
  },
  {
    id: "gsi-geoheritage",
    name: "Geological Survey of India — National Geological Monuments",
    shortName: "GSI",
    publisher: "Ministry of Mines, Government of India",
    authority: "STATUTORY",
    tier: 1,
    url: "https://www.gsi.gov.in/webcenter/portal/OCBIS/pageGeoheritage",
    scope: ["NATURE", "HILLS", "CAVES"],
    description: "Gazetted National Geological Monuments, impact craters, columnar basalt, canyon gorges, natural arches, and fossil parks.",
    statutoryMandate: "Mines and Minerals (Development and Regulation) Act, 1957",
    activeStatus: "ACTIVE",
  },
  {
    id: "unesco-whc",
    name: "UNESCO World Heritage Centre — India Inscriptions",
    shortName: "UNESCO",
    publisher: "United Nations Educational, Scientific and Cultural Organization",
    authority: "UNESCO",
    tier: 1,
    url: "https://whc.unesco.org/en/statesparties/in",
    scope: ["HERITAGE", "WILDLIFE", "CULTURE"],
    description: "Cultural, natural, and mixed World Heritage Sites inscribed under the 1972 World Heritage Convention.",
    statutoryMandate: "Convention Concerning the Protection of the World Cultural and Natural Heritage (1972)",
    activeStatus: "ACTIVE",
  },
  {
    id: "ramsar-india",
    name: "Ramsar Convention on Wetlands — India Sites",
    shortName: "Ramsar",
    publisher: "Ramsar Secretariat & MoEFCC",
    authority: "STATUTORY",
    tier: 1,
    url: "https://rsis.ramsar.org/country-profiles/india",
    scope: ["LAKES", "NATURE", "WILDLIFE"],
    description: "Wetlands of International Importance designated under the Ramsar Convention.",
    statutoryMandate: "Convention on Wetlands of International Importance (1971)",
    activeStatus: "ACTIVE",
  },
  {
    id: "moefcc-wii",
    name: "Wildlife Institute of India & MoEFCC — National Parks and Wildlife Sanctuaries",
    shortName: "WII/MoEFCC",
    publisher: "Ministry of Environment, Forest and Climate Change",
    authority: "STATUTORY",
    tier: 1,
    url: "https://wii.gov.in/national_wildlife_database",
    scope: ["WILDLIFE", "NATURE"],
    description: "Official National Parks, Wildlife Sanctuaries, Biosphere Reserves, and Conservation Reserves of India.",
    statutoryMandate: "Wildlife (Protection) Act, 1972",
    activeStatus: "ACTIVE",
  },
  {
    id: "ntca-india",
    name: "National Tiger Conservation Authority — Tiger Reserves Database",
    shortName: "NTCA",
    publisher: "Ministry of Environment, Forest and Climate Change",
    authority: "STATUTORY",
    tier: 1,
    url: "https://ntca.gov.in/",
    scope: ["WILDLIFE"],
    description: "Statutory Tiger Reserves of India and core/buffer zone gazettes.",
    statutoryMandate: "Section 38-L of Wildlife (Protection) Act, 1972",
    activeStatus: "ACTIVE",
  },
  {
    id: "dc-handicrafts",
    name: "Development Commissioner (Handicrafts) — Craft Clusters",
    shortName: "DC Handicrafts",
    publisher: "Ministry of Textiles, Government of India",
    authority: "GOVERNMENT",
    tier: 1,
    url: "https://handicrafts.nic.in/",
    scope: ["SHOPPING", "CULTURE"],
    description: "Artisan villages, craft mega clusters, and GI-certified handicraft hubs across Indian districts.",
    activeStatus: "ACTIVE",
  },
  {
    id: "dc-handlooms",
    name: "Development Commissioner (Handlooms) — National Handloom Clusters",
    shortName: "DC Handlooms",
    publisher: "Ministry of Textiles, Government of India",
    authority: "GOVERNMENT",
    tier: 1,
    url: "https://handlooms.gov.in/",
    scope: ["SHOPPING", "CULTURE"],
    description: "Traditional weaving clusters, master weaver guilds, and GI handloom producing centers.",
    activeStatus: "ACTIVE",
  },
  {
    id: "cza-india",
    name: "Central Zoo Authority of India",
    shortName: "CZA",
    publisher: "Ministry of Environment, Forest and Climate Change",
    authority: "STATUTORY",
    tier: 1,
    url: "https://cza.nic.in/",
    scope: ["WILDLIFE", "FAMILY"],
    description: "Recognized zoological parks, animal rescue centers, and safari parks across India.",
    statutoryMandate: "Section 38-A of Wildlife (Protection) Act, 1972",
    activeStatus: "ACTIVE",
  },
  {
    id: "isro-centres",
    name: "Indian Space Research Organisation — Visitor Centres & Space Museums",
    shortName: "ISRO",
    publisher: "Department of Space, Government of India",
    authority: "GOVERNMENT",
    tier: 1,
    url: "https://www.isro.gov.in/",
    scope: ["FAMILY", "CULTURE"],
    description: "Vikram Sarabhai Space Museum, Satish Dhawan Space Centre visitor complexes, and national space exhibitions.",
    activeStatus: "ACTIVE",
  },
  {
    id: "ncsm-india",
    name: "National Council of Science Museums — Science Cities & Centres",
    shortName: "NCSM",
    publisher: "Ministry of Culture, Government of India",
    authority: "STATUTORY",
    tier: 1,
    url: "https://ncsm.gov.in/",
    scope: ["FAMILY", "CULTURE"],
    description: "National Science Centre, Birla Industrial & Technological Museum, Science City Kolkata, and provincial science centers.",
    activeStatus: "ACTIVE",
  },
  {
    id: "dgll-india",
    name: "Directorate General of Lighthouses and Lightships",
    shortName: "DGLL",
    publisher: "Ministry of Ports, Shipping and Waterways, Government of India",
    authority: "GOVERNMENT",
    tier: 1,
    url: "http://dgll.nic.in/",
    scope: ["HERITAGE", "ADVENTURE"],
    description: "Heritage coastal lighthouses, navigation beacons, and maritime museums open to public tourism.",
    activeStatus: "ACTIVE",
  },
  {
    id: "mot-swadesh-darshan",
    name: "Ministry of Tourism — Swadesh Darshan & PRASHAD Circuits",
    shortName: "MoT India",
    publisher: "Ministry of Tourism, Government of India",
    authority: "GOVERNMENT",
    tier: 1,
    url: "https://tourism.gov.in/",
    scope: ["SACRED", "HERITAGE", "CULTURE"],
    description: "Integrated thematic tourist circuits and national pilgrimage rejuvenation destinations.",
    activeStatus: "ACTIVE",
  },

  // ==========================================
  // TIER 2: STATE TOURISM & CULTURAL DEPARTMENTS
  // ==========================================
  {
    id: "ap-tourism",
    name: "Andhra Pradesh Tourism Development Corporation",
    shortName: "APTDC",
    publisher: "Government of Andhra Pradesh",
    authority: "TOURISM",
    tier: 2,
    url: "https://tourism.ap.gov.in/",
    scope: ["ALL"],
    description: "State-sanctioned pilgrimage, beach, valley, and heritage destinations in Andhra Pradesh.",
    activeStatus: "ACTIVE",
  },
  {
    id: "karnataka-tourism",
    name: "Karnataka Tourism Development Corporation",
    shortName: "KSTDC",
    publisher: "Government of Karnataka",
    authority: "TOURISM",
    tier: 2,
    url: "https://karnatakatourism.org/",
    scope: ["ALL"],
    description: "One State Many Worlds official inventory of heritage, coast, hills, and wildlife in Karnataka.",
    activeStatus: "ACTIVE",
  },
  {
    id: "kerala-tourism",
    name: "Kerala Tourism Department",
    shortName: "Kerala Tourism",
    publisher: "Government of Kerala",
    authority: "TOURISM",
    tier: 2,
    url: "https://www.keralatourism.org/",
    scope: ["ALL"],
    description: "God's Own Country official directory of backwaters, ayurveda, arts, hill stations, and beaches.",
    activeStatus: "ACTIVE",
  },
  {
    id: "tn-tourism",
    name: "Tamil Nadu Tourism Development Corporation",
    shortName: "TTDC",
    publisher: "Government of Tamil Nadu",
    authority: "TOURISM",
    tier: 2,
    url: "https://www.tamilnadutourism.tn.gov.in/",
    scope: ["ALL"],
    description: "Enchanting Tamil Nadu directory covering temples, UNESCO living Chola shrines, Western Ghats, and beaches.",
    activeStatus: "ACTIVE",
  },
  {
    id: "rajasthan-tourism",
    name: "Department of Tourism, Government of Rajasthan",
    shortName: "RTDC",
    publisher: "Government of Rajasthan",
    authority: "TOURISM",
    tier: 2,
    url: "https://www.tourism.rajasthan.gov.in/",
    scope: ["ALL"],
    description: "Royal Rajasthan forts, stepwells, palaces, desert reserves, and pilgrimage destinations.",
    activeStatus: "ACTIVE",
  },
  {
    id: "mp-tourism",
    name: "Madhya Pradesh Tourism Board",
    shortName: "MPTB",
    publisher: "Government of Madhya Pradesh",
    authority: "TOURISM",
    tier: 2,
    url: "https://www.mptourism.com/",
    scope: ["ALL"],
    description: "Heart of Incredible India national parks, UNESCO heritage sites, caves, and sacred river ghats.",
    activeStatus: "ACTIVE",
  },
  {
    id: "maharashtra-tourism",
    name: "Maharashtra Tourism Development Corporation",
    shortName: "MTDC",
    publisher: "Government of Maharashtra",
    authority: "TOURISM",
    tier: 2,
    url: "https://www.maharashtratourism.gov.in/",
    scope: ["ALL"],
    description: "Unlimited Maharashtra fortresses, Ajanta-Ellora caves, Lonar crater, and Western Ghat hill stations.",
    activeStatus: "ACTIVE",
  },
];

/**
 * Look up a registered source by ID
 */
export function getSourceById(id: string): SourceDefinition | undefined {
  return NATIONAL_SOURCE_REGISTRY.find((s) => s.id === id);
}

/**
 * Filter sources by scope / category
 */
export function getSourcesForCategory(category: string): SourceDefinition[] {
  return NATIONAL_SOURCE_REGISTRY.filter(
    (s) => s.scope.includes(category) || s.scope.includes("ALL")
  );
}
