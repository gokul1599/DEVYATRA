/**
 * Canonical Architectural Elements of Indian Temples
 * Grounded in Shilpa Shastras (Mayamata, Manasara, Samarangana Sutradhara).
 */

export type TempleTradition = "DRAVIDIAN" | "NAGARA" | "KALINGA" | "VESARA";

export interface ArchitecturalElement {
  id: string;
  name: string;
  sanskritName: string;
  tradition: "Dravida" | "Nagara" | "Kalinga" | "Vesara" | "Both";
  shortDescription: string;
  significance: string;
  depthTier: number; // 1 to 5 from entrance to sanctum
  coordinates: { x: number; y: number; z: number }; // Relative 3D unit coordinates
  // Volumetric geometry parameters for spatial rendering
  geometry: {
    type: "pyramid" | "spire_curved" | "cube" | "pillars" | "stepped_roof" | "wall" | "finial";
    width: number;
    height: number;
    depth: number;
  };
}

export const CANONICAL_ELEMENTS: ArchitecturalElement[] = [
  {
    id: "gopuram",
    name: "Rajagopuram / Gateway Tower",
    sanskritName: "राजगोपुरम्",
    tradition: "Dravida",
    shortDescription: "Monumental pyramidal gateway tower welcoming pilgrims into the sacred precincts.",
    significance: "Marks the metaphysical boundary between the mundane outer cosmos and the consecrated inner sanctum.",
    depthTier: 1,
    coordinates: { x: 0, y: 0.1, z: 2.2 },
    geometry: { type: "pyramid", width: 1.1, height: 1.8, depth: 0.8 },
  },
  {
    id: "mandapa",
    name: "Mahamandapa / Pillared Hall",
    sanskritName: "महामण्डप",
    tradition: "Both",
    shortDescription: "Vast carved pillared assembly hall designed for sacred recitation, sangeet, and congregation.",
    significance: "Features geometrically aligned monolithic stone pillars vibrating with acoustic sanctity and cosmic alignments.",
    depthTier: 2,
    coordinates: { x: 0, y: 0, z: 1.1 },
    geometry: { type: "pillars", width: 1.4, height: 0.7, depth: 1.0 },
  },
  {
    id: "antarala",
    name: "Antarala / Vestibule",
    sanskritName: "अन्तराल",
    tradition: "Both",
    shortDescription: "Intermediate vestibule connecting the gathering hall to the sanctum chamber.",
    significance: "A transitional acoustic and spiritual threshold where outer worldly noise recedes into solemn meditative silence.",
    depthTier: 3,
    coordinates: { x: 0, y: 0, z: 0.2 },
    geometry: { type: "cube", width: 0.8, height: 0.7, depth: 0.6 },
  },
  {
    id: "garbhagriha",
    name: "Garbhagriha / Sanctum Sanctorum",
    sanskritName: "गर्भगृह",
    tradition: "Both",
    shortDescription: "The Sanctum Sanctorum — the 'Womb-Chamber' housing the consecrated deity's Moolavar.",
    significance: "The supreme focal point of the temple; unadorned, heavy stone walls holding concentrated divine energy and timeless stillness.",
    depthTier: 4,
    coordinates: { x: 0, y: 0.1, z: -0.7 },
    geometry: { type: "cube", width: 1.2, height: 1.0, depth: 1.2 },
  },
  {
    id: "shikhara",
    name: "Vimana / Shikhara Superstructure",
    sanskritName: "विमान / शिखर",
    tradition: "Both",
    shortDescription: "Ascending monumental superstructure directly crowning the Garbhagriha.",
    significance: "Symbolizes Mount Meru — the cosmic axis connecting terrestrial existence directly to the infinite heavens.",
    depthTier: 5,
    coordinates: { x: 0, y: 1.4, z: -0.7 },
    geometry: { type: "spire_curved", width: 1.1, height: 2.1, depth: 1.1 },
  },
  {
    id: "kalasha",
    name: "Kalasha & Stupika",
    sanskritName: "कलश / स्तूपिका",
    tradition: "Both",
    shortDescription: "Sacred golden vessel finial installed at the apex of the tower during Kumbhabhishekam.",
    significance: "Acts as a spiritual lightning rod channelizing cosmic prana downward into the consecrated deity.",
    depthTier: 5,
    coordinates: { x: 0, y: 2.5, z: -0.7 },
    geometry: { type: "finial", width: 0.3, height: 0.4, depth: 0.3 },
  },
  {
    id: "prakara",
    name: "Prakara & Parikrama Path",
    sanskritName: "प्राकार / परिक्रमा",
    tradition: "Both",
    shortDescription: "Concentric stone enclosure walls and clockwise circumambulatory pathways.",
    significance: "Guides pilgrims through sequential stages of mental purification as they circle the core cosmic center.",
    depthTier: 1,
    coordinates: { x: 1.5, y: -0.15, z: 0.5 },
    geometry: { type: "wall", width: 3.2, height: 0.5, depth: 4.0 },
  },
];

export const TRADITION_DETAILS: Record<
  TempleTradition,
  {
    name: string;
    sanskritName: string;
    regions: string;
    superstructure: string;
    gateway: string;
    notableExamples: string[];
    description: string;
  }
> = {
  DRAVIDIAN: {
    name: "Dravidian Tradition",
    sanskritName: "द्रविड शैली",
    regions: "Tamil Nadu, Karnataka, Andhra Pradesh, Kerala, Telangana",
    superstructure: "Stepped pyramidal Vimana with horizontal storeys (talas) capped by a circular or octagonal dome (shikhara/stupika).",
    gateway: "Monumental, towering Rajagopurams dwarfing the inner shrine.",
    notableExamples: ["Brihadeeswarar Temple", "Meenakshi Amman Temple", "Tirumala Venkateswara Temple"],
    description:
      "Renowned for colossal sculpted gopuram entrance towers, expansive enclosed courtyards (prakaras), monolithic pillared halls, and sacred water tanks (pushkarini).",
  },
  NAGARA: {
    name: "Nagara Tradition",
    sanskritName: "नागर शैली",
    regions: "North, West, and Central India (Varanasi, Uttarakhand, Gujarat, Rajasthan, MP)",
    superstructure: "Curvilinear beehive-shaped Shikhara with vertical central bands (Latina or Shekhari).",
    gateway: "Torana arches or modest entrance porch, without towering perimeter gopurams.",
    notableExamples: ["Kashi Vishwanath Temple", "Kedarnath Temple", "Somnath Temple", "Khajuraho Kandariya Mahadeva"],
    description:
      "Distinguished by sanctum spires curving inward toward the summit, crowned by a ribbed horizontal stone wheel (Amalaka) and a Kalasha pot finial.",
  },
  KALINGA: {
    name: "Kalinga Tradition",
    sanskritName: "कलिंग शैली",
    regions: "Odisha and northern Andhra coastline",
    superstructure: "Rekha Deul (towering vertical sanctum) coupled with a stepped pyramidal Jagamohana (assembly hall).",
    gateway: "Lion-guarded Singhadwara portals.",
    notableExamples: ["Jagannath Temple Puri", "Konark Sun Temple", "Lingaraja Temple Bhubaneswar"],
    description:
      "Mastery of monumental sandstone architecture divided into the soaring Rekha Deul, stepped Pidha Deul, Natamandira, and Bhogamandapa along a linear east-west axis.",
  },
  VESARA: {
    name: "Vesara / Hybrid Deccan Tradition",
    sanskritName: "वेसर शैली",
    regions: "Karnataka, Maharashtra, Deccan Plateau (Chalukya, Rashtrakuta, Hoysala)",
    superstructure: "Stellate (star-shaped) stepped towers combining Nagara vertical curvature with Dravidian tiering.",
    gateway: "Carved soapstone porch entrances.",
    notableExamples: ["Hoysaleswara Temple Halebidu", "Chennakeshava Temple Belur", "Pattadakal Virupaksha"],
    description:
      "A magnificent synthesis originating under the Badami Chalukyas and perfected by the Hoysalas, characterized by intricate soapstone filigree and stellate ground plans.",
  },
};

/**
 * Determine canonical tradition from temple architecture metadata
 */
export function getTraditionFromArchitecture(architectureStr?: string): TempleTradition {
  if (!architectureStr) return "DRAVIDIAN";
  const norm = architectureStr.toLowerCase();
  if (norm.includes("kalinga") || norm.includes("odisha")) return "KALINGA";
  if (norm.includes("nagara") || norm.includes("north") || norm.includes("himalayan") || norm.includes("maru-gurjara")) return "NAGARA";
  if (norm.includes("vesara") || norm.includes("hoysala") || norm.includes("chalukya") || norm.includes("deccan")) return "VESARA";
  return "DRAVIDIAN";
}
