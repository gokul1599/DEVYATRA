/**
 * Sacred Thematic Collections Engine (Phase 22)
 *
 * Source-backed canonical pilgrimage collections. No temple is classified
 * into a collection without documented epigraphical or scriptural evidence.
 */

export interface SacredCollection {
  id: string;
  slug: string;
  title: string;
  vernacularTitle?: string;
  category: "JYOTIRLINGA" | "CHAR_DHAM" | "SHAKTI_PEETHA" | "DIVYA_DESAM" | "PANCHA_BHOOTA" | "UNESCO_HERITAGE";
  description: string;
  epigraphicalEvidence: string;
  templeCount: number;
  templeSlugs: string[];
}

export const SACRED_COLLECTIONS: SacredCollection[] = [
  {
    id: "jyotirlinga-12",
    slug: "12-jyotirlingas",
    title: "12 Holy Jyotirlingas",
    vernacularTitle: "द्वादश ज्योतिर्लिंग",
    category: "JYOTIRLINGA",
    description: "The 12 supreme representations of Bhagwan Shiva as infinite pillars of cosmic light (Stambha) described in the Shiva Purana.",
    epigraphicalEvidence: "Shiva Purana (Koti Rudra Samhita, Ch. 1), Adi Shankaracharya's Dvadasha Jyotirlinga Stotram.",
    templeCount: 12,
    templeSlugs: [
      "somnath-temple",
      "mallikarjuna-temple-srisailam",
      "mahakaleshwar-temple-ujjain",
      "omkareshwar-temple",
      "kedarnath-temple",
      "bhimashankar-temple",
      "kashi-vishwanath-temple",
      "trimbakeshwar-temple",
      "vaidyanath-temple-deoghar",
      "nageshwar-temple-dwarka",
      "rameshwaram-ramanathaswamy-temple",
      "grishneshwar-temple",
    ],
  },
  {
    id: "pancha-bhoota-5",
    slug: "pancha-bhoota-sthalams",
    title: "Pancha Bhoota Sthalams",
    vernacularTitle: "పంచభూత క్షేత్రాలు · பஞ்சபூத ஸ்தலங்கள்",
    category: "PANCHA_BHOOTA",
    description: "The five ancient South Indian temples representing the primal cosmic elements: Earth, Water, Fire, Air, and Space.",
    epigraphicalEvidence: "Appar, Sambandar & Sundarar Thevaram hymns (7th-8th century CE); Chola epigraphy at Chidambaram & Thanjavur.",
    templeCount: 5,
    templeSlugs: [
      "ekambareswarar-temple-kanchipuram", // Earth (Prithvi)
      "jambukeswarar-temple-thiruvanaikaval", // Water (Appu)
      "annamalaiyar-temple-tiruvannamalai", // Fire (Theyu)
      "srikalahasti-temple", // Air (Vayu)
      "thillai-nataraja-temple-chidambaram", // Space (Akasha)
    ],
  },
  {
    id: "char-dham-4",
    slug: "char-dham",
    title: "All-India Char Dham",
    vernacularTitle: "चार धाम",
    category: "CHAR_DHAM",
    description: "The four sacred cardinal extremities of Bharatavarsha established by Adi Shankaracharya in the 8th century CE.",
    epigraphicalEvidence: "Sringeri and Puri Shankaracharya Matha records, Badrinath rawal copper-plate inscriptions.",
    templeCount: 4,
    templeSlugs: [
      "badrinath-temple", // North
      "jagannath-temple-puri", // East
      "rameshwaram-ramanathaswamy-temple", // South
      "dwarkadhish-temple-dwarka", // West
    ],
  },
  {
    id: "unesco-great-chola",
    slug: "great-living-chola-temples",
    title: "Great Living Chola Temples",
    vernacularTitle: "பெருவுடையார் கோயில்",
    category: "UNESCO_HERITAGE",
    description: "UNESCO World Heritage monumental granite temples constructed between the 10th and 12th centuries CE under Chola dynastic patronage.",
    epigraphicalEvidence: "UNESCO World Heritage Site ID 250bis; Raja Raja Chola I inscriptions on Thanjavur Vimana base (1010 CE).",
    templeCount: 3,
    templeSlugs: [
      "brihadeeswarar-temple-thanjavur",
      "brihadisvara-gangaikonda-cholapuram",
      "airavatesvara-temple-darasuram",
    ],
  },
];

export function getSacredCollection(slug: string): SacredCollection | undefined {
  return SACRED_COLLECTIONS.find((c) => c.slug === slug);
}
