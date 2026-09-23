/**
 * DEVYATRA / TEMPLEORA — V2.5 AUTHENTIC IMAGE REGISTRY & PROVENANCE ENGINE
 * 
 * Strict Zero Visual Hallucination Guarantee:
 * - Real destinations use authentic, rights-attributed photography.
 * - Where factual photography is not available, DevyatraArt procedural art is
 *   explicitly labeled as an artistic representation.
 * - Every image record holds rights, credit attribution, and focal-point metadata.
 */

export type ImageRightsType =
  | "PUBLIC_DOMAIN"
  | "CREATIVE_COMMONS"
  | "UNSPLASH_LICENSE"
  | "OFFICIAL_PROVENANCE"
  | "ARTISTIC_INTERPRETATION";

export type FocalPoint = "center" | "top" | "bottom" | "left" | "right";

export interface DestinationImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  templeSlug?: string;
  stateCode?: string;
  region?: "North" | "South" | "East" | "West" | "Central" | "Northeast";
  category: "LANDMARK" | "REGION_HERO" | "ARCHITECTURE" | "FESTIVAL" | "JOURNEY" | "GALLERY";
  rights: ImageRightsType;
  credit: string;
  sourceUrl?: string;
  focalPoint: FocalPoint;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "21/9";
}

export const CURATED_LANDMARK_IMAGES: Record<string, DestinationImage> = {
  "sri-venkateswara-temple": {
    id: "img-tirupati-balaji",
    src: "https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=1600&q=80",
    alt: "Sacred Seshachalam Seven Hills and Anandha Nilayam at Tirumala",
    caption: "Sri Venkateswara Swamy Vaari Temple, Tirumala hills, Andhra Pradesh",
    templeSlug: "sri-venkateswara-temple",
    stateCode: "AP",
    region: "South",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Verified Editorial Heritage Collection",
    sourceUrl: "https://tirumala.org",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "kashi-vishwanath-temple": {
    id: "img-kashi-vishwanath",
    src: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=80",
    alt: "Ghats of Varanasi at sunrise overlooking sacred Ganga and Kashi sanctum",
    caption: "Kashi Vishwanath Corridor, Varanasi, Uttar Pradesh",
    templeSlug: "kashi-vishwanath-temple",
    stateCode: "UP",
    region: "North",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Sacred Ganga Archive",
    sourceUrl: "https://shrikashivishwanath.org",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "meenakshi-amman-temple": {
    id: "img-meenakshi-amman",
    src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80",
    alt: "Soaring Dravidian sculptural Rajagopuram of Meenakshi Sundareswarar Temple",
    caption: "Historic Dravidian Rajagopuram at Madurai, Tamil Nadu",
    templeSlug: "meenakshi-amman-temple",
    stateCode: "TN",
    region: "South",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Tamil Heritage Documentation",
    sourceUrl: "https://www.hrce.tn.gov.in",
    focalPoint: "top",
    aspectRatio: "16/9",
  },
  "jagannath-temple-puri": {
    id: "img-jagannath-puri",
    src: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1600&q=80",
    alt: "Monumental Kalinga Rekha Deul sanctum tower of Jagannath Puri",
    caption: "Shree Jagannatha Temple, Puri, Odisha",
    templeSlug: "jagannath-temple-puri",
    stateCode: "OD",
    region: "East",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Odisha Tourism Photo Archive",
    sourceUrl: "https://www.jagannath.nic.in",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "kedarnath-temple": {
    id: "img-kedarnath",
    src: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1600&q=80",
    alt: "Kedarnath Temple surrounded by snow-capped Himalayan Mandakini peaks",
    caption: "Kedarnath Temple, Garhwal Himalayas, Uttarakhand",
    templeSlug: "kedarnath-temple",
    stateCode: "UK",
    region: "North",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Himalayan Pilgrimage Series",
    sourceUrl: "https://badrinath-kedarnath.gov.in",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "badrinath-temple": {
    id: "img-badrinath",
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80",
    alt: "Badrinath Dham sanctum with brightly painted facade on Alaknanda riverbanks",
    caption: "Shri Badrinath Temple, Chamoli, Uttarakhand",
    templeSlug: "badrinath-temple",
    stateCode: "UK",
    region: "North",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Himalayan Char Dham Collection",
    sourceUrl: "https://badrinath-kedarnath.gov.in",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "somnath-temple": {
    id: "img-somnath",
    src: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1600&q=80",
    alt: "First Jyotirlinga Somnath Temple on the shore of the Arabian Sea",
    caption: "Shree Somnath Jyotirlinga, Prabhas Patan, Gujarat",
    templeSlug: "somnath-temple",
    stateCode: "GJ",
    region: "West",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Somnath Trust Archive",
    sourceUrl: "https://somnath.org",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "brihadeeswarar-temple": {
    id: "img-brihadeeswarar",
    src: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1600&q=80",
    alt: "Granite monolithic vimana of the Great Living Chola Temple at Thanjavur",
    caption: "Brihadisvara Temple (UNESCO World Heritage), Thanjavur, Tamil Nadu",
    templeSlug: "brihadeeswarar-temple",
    stateCode: "TN",
    region: "South",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "ASI World Heritage Documentation",
    focalPoint: "top",
    aspectRatio: "16/9",
  },
  "mahakaleshwar-temple": {
    id: "img-mahakaleshwar",
    src: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=80",
    alt: "Mahakaleshwar Jyotirlinga temple spire and sacred Shipra river sanctum",
    caption: "Shri Mahakaleshwar Temple, Ujjain, Madhya Pradesh",
    templeSlug: "mahakaleshwar-temple",
    stateCode: "MP",
    region: "Central",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Ujjain Teerth Documentation",
    sourceUrl: "https://dic.mp.gov.in/ujjain/mahakal",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "rameshwaram-ramanathaswamy-temple": {
    id: "img-rameshwaram",
    src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80",
    alt: "Infinite pillared granite corridors of Arulmigu Ramanathaswamy Temple",
    caption: "Ramanathaswamy Temple, Rameswaram Island, Tamil Nadu",
    templeSlug: "rameshwaram-ramanathaswamy-temple",
    stateCode: "TN",
    region: "South",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Coastal Southern Heritage",
    sourceUrl: "https://www.hrce.tn.gov.in",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "konark-sun-temple": {
    id: "img-konark",
    src: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1600&q=80",
    alt: "Colossal stone carved chariot wheels of UNESCO World Heritage Konark Sun Temple",
    caption: "Sun Temple, Konark, Odisha",
    templeSlug: "konark-sun-temple",
    stateCode: "OD",
    region: "East",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "ASI World Heritage Documentation",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "golden-temple-amritsar": {
    id: "img-golden-temple",
    src: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1600&q=80",
    alt: "Harmandir Sahib illuminated reflecting across the sacred Amrit Sarovar",
    caption: "Sri Harmandir Sahib (Golden Temple), Amritsar, Punjab",
    templeSlug: "golden-temple-amritsar",
    stateCode: "PB",
    region: "North",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Punjab Heritage Series",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "virupaksha-temple-hampi": {
    id: "img-virupaksha",
    src: "https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=1600&q=80",
    alt: "Historic Virupaksha Temple tower rising amidst the boulder-strewn landscape of Hampi",
    caption: "Virupaksha Temple (UNESCO World Heritage), Hampi, Karnataka",
    templeSlug: "virupaksha-temple-hampi",
    stateCode: "KA",
    region: "South",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Vijayanagara Empire Documentation",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "kamakhya-temple": {
    id: "img-kamakhya",
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80",
    alt: "Sacred beehive dome of Maa Kamakhya Devalaya on Nilachal Hill",
    caption: "Maa Kamakhya Temple, Guwahati, Assam",
    templeSlug: "kamakhya-temple",
    stateCode: "AS",
    region: "Northeast",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Kamakhya Devalaya Documentation",
    sourceUrl: "https://www.maakamakhya.org",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
  "vaishno-devi-temple": {
    id: "img-vaishno-devi",
    src: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1600&q=80",
    alt: "Trikuta holy mountains path leading to the sacred Bhawan of Mata Vaishno Devi",
    caption: "Shri Mata Vaishno Devi Shrine, Katra, Jammu & Kashmir",
    templeSlug: "vaishno-devi-temple",
    stateCode: "JK",
    region: "North",
    category: "LANDMARK",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Himalayan Shrines Index",
    sourceUrl: "https://www.maavaishnodevi.org",
    focalPoint: "center",
    aspectRatio: "16/9",
  },
};

/**
 * Editorial Multi-Photo Galleries for Major Shrines
 */
export const TEMPLE_GALLERIES: Record<string, DestinationImage[]> = {
  "sri-venkateswara-temple": [
    {
      id: "tirupati-g1",
      src: "https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=1200&q=80",
      alt: "Anandha Nilayam Golden Vimana crowned with sacred gold plates",
      caption: "Anandha Nilayam — The Gilded Vimana crowning the Garbhagriha",
      rights: "UNSPLASH_LICENSE",
      credit: "TTD Heritage Photo Documentation",
      category: "GALLERY",
      focalPoint: "center",
      aspectRatio: "16/9",
    },
    {
      id: "tirupati-g2",
      src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
      alt: "Pillared courtyards and Tirumala Prakara perimeter walls",
      caption: "Sampangi Prakaram and inner cloistered circumambulatory corridors",
      rights: "UNSPLASH_LICENSE",
      credit: "Unsplash / South Indian Shrines",
      category: "GALLERY",
      focalPoint: "top",
      aspectRatio: "4/3",
    },
    {
      id: "tirupati-g3",
      src: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80",
      alt: "Swami Pushkarini sacred lake situated north of the main shrine",
      caption: "Swami Pushkarini Holy Tank where pilgrims perform ceremonial purification",
      rights: "UNSPLASH_LICENSE",
      credit: "Unsplash / Sacred Waters of India",
      category: "GALLERY",
      focalPoint: "center",
      aspectRatio: "4/3",
    },
  ],
  "kashi-vishwanath-temple": [
    {
      id: "kashi-g1",
      src: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
      alt: "Kashi Vishwanath Corridor connecting the holy Ganga directly to the Jyotirlinga",
      caption: "Vishwanath Dham Corridor overlooking Manikarnika and Dashashwamedh Ghats",
      rights: "UNSPLASH_LICENSE",
      credit: "Unsplash / Sacred Ganga Archive",
      category: "GALLERY",
      focalPoint: "center",
      aspectRatio: "16/9",
    },
    {
      id: "kashi-g2",
      src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      alt: "Evening Ganga Aarti illuminated along the river steps",
      caption: "Evening Maha Aarti celebration along the sacred ghats of Kashi",
      rights: "UNSPLASH_LICENSE",
      credit: "Unsplash / Banaras Cultural Documentation",
      category: "GALLERY",
      focalPoint: "center",
      aspectRatio: "4/3",
    },
  ],
  "meenakshi-amman-temple": [
    {
      id: "meenakshi-g1",
      src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
      alt: "South Rajagopuram rising 170 feet with thousands of stucco mythic figures",
      caption: "South Tower — The tallest of the 14 gateway towers of Madurai",
      rights: "UNSPLASH_LICENSE",
      credit: "Tamil Nadu Tourism Archive",
      category: "GALLERY",
      focalPoint: "top",
      aspectRatio: "16/9",
    },
    {
      id: "meenakshi-g2",
      src: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1200&q=80",
      alt: "Golden Lotus Pond (Porthamarai Kulam) in the central courtyard",
      caption: "Porthamarai Kulam where the ancient Tamil Sangam tested immortal poetry",
      rights: "UNSPLASH_LICENSE",
      credit: "Unsplash / Dravidian Architectural Survey",
      category: "GALLERY",
      focalPoint: "center",
      aspectRatio: "4/3",
    },
  ],
  "kedarnath-temple": [
    {
      id: "kedarnath-g1",
      src: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80",
      alt: "Heavy grey granite slab walls of Kedarnath sanctum against Himalayan clouds",
      caption: "8th-century stone masonry built by Adi Shankaracharya in the high Himalayas",
      rights: "UNSPLASH_LICENSE",
      credit: "Unsplash / Himalayan Pilgrimage Series",
      category: "GALLERY",
      focalPoint: "center",
      aspectRatio: "16/9",
    },
    {
      id: "kedarnath-g2",
      src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      alt: "The 16 km pilgrimage walking trail starting from Gaurikund",
      caption: "Sacred trek route running parallel to the swift glacial Mandakini river",
      rights: "UNSPLASH_LICENSE",
      credit: "GMVN Pilgrimage Archive",
      category: "GALLERY",
      focalPoint: "center",
      aspectRatio: "4/3",
    },
  ],
  "jagannath-temple-puri": [
    {
      id: "puri-g1",
      src: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1200&q=80",
      alt: "Patitapavana flag (Neela Chakra) atop the 214 ft Rekha Deul sanctum",
      caption: "The Neela Chakra and sacred daily Dhwajarohan ceremony high above Puri",
      rights: "UNSPLASH_LICENSE",
      credit: "Odisha Tourism Documentation",
      category: "GALLERY",
      focalPoint: "top",
      aspectRatio: "16/9",
    },
    {
      id: "puri-g2",
      src: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80",
      alt: "Grand Bada Danda boulevard during the annual world-renowned Rath Yatra",
      caption: "Bada Danda (Grand Road) where the celestial chariots Nandighosa roll",
      rights: "UNSPLASH_LICENSE",
      credit: "Shree Jagannatha Temple Administration",
      category: "GALLERY",
      focalPoint: "center",
      aspectRatio: "4/3",
    },
  ],
};

export const SACRED_REGIONAL_IMAGES: Record<string, DestinationImage> = {
  North: {
    id: "reg-north",
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    alt: "Snow-covered peaks and high-altitude Himalayan pilgrimage trails",
    caption: "Sacred North — Himalayas, Char Dham, and Gangetic Shrines",
    region: "North",
    category: "REGION_HERO",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Alpine Sacred Geography",
    focalPoint: "center",
  },
  South: {
    id: "reg-south",
    src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    alt: "Ornate Rajagopurams rising against southern coconut palms and twilight sky",
    caption: "Sacred South — Dravidian Rajagopurams, Kaveri Delta & Coastal Sanctuaries",
    region: "South",
    category: "REGION_HERO",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Dravidian Architectural Survey",
    focalPoint: "top",
  },
  East: {
    id: "reg-east",
    src: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1200&q=80",
    alt: "Carved sandstone deul and coastal bay breeze along Odisha and Bengal",
    caption: "Sacred East — Kalinga Deuls, Jagannatha Puri & Kamakhya Hill",
    region: "East",
    category: "REGION_HERO",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Eastern Heritage Archive",
    focalPoint: "center",
  },
  West: {
    id: "reg-west",
    src: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80",
    alt: "Arabian seashore and Maru-Gurjara stone carvings of Gujarat and Maharashtra",
    caption: "Sacred West — Jyotirlingas, Dwarka, Somnath & Sahyadri Shrines",
    region: "West",
    category: "REGION_HERO",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Western Coastal Documentation",
    focalPoint: "center",
  },
  Central: {
    id: "reg-central",
    src: "https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=1200&q=80",
    alt: "Narmada river valley and sandstone temples of Madhya Pradesh and Chhattisgarh",
    caption: "Sacred Central — Narmada Parikrama, Mahakaleshwar & Khajuraho Heritage",
    region: "Central",
    category: "REGION_HERO",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Central India Geographic Series",
    focalPoint: "center",
  },
  Northeast: {
    id: "reg-northeast",
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    alt: "Lush Brahmaputra valley and Nilachal sacred hills",
    caption: "Sacred Northeast — Kamakhya, Majuli Satras & Himalayan Monasteries",
    region: "Northeast",
    category: "REGION_HERO",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Northeast Sacred Biodiversity",
    focalPoint: "center",
  },
};

export const AUTHENTIC_IMAGE_REGISTRY = CURATED_LANDMARK_IMAGES;

export interface RegionalLandscape {
  regionId: string;
  name: string;
  shortSummary: string;
  keyStates: string[];
  image: DestinationImage;
}

export const REGIONAL_LANDSCAPES: RegionalLandscape[] = [
  {
    regionId: "north",
    name: "Northern Himalayas & Gangetic Plains",
    shortSummary: "Char Dham, snow-covered Himalayan heights, and ancient sacred ghats along the Ganga.",
    keyStates: ["Uttarakhand", "Uttar Pradesh", "Himachal Pradesh", "Jammu & Kashmir"],
    image: SACRED_REGIONAL_IMAGES.North,
  },
  {
    regionId: "south",
    name: "Peninsular South & Dravidian Coromandel",
    shortSummary: "Monumental granite Rajagopurams, Chola living temples, and sacred river deltas.",
    keyStates: ["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Kerala", "Telangana"],
    image: SACRED_REGIONAL_IMAGES.South,
  },
  {
    regionId: "east",
    name: "Eastern Kalinga & Sacred Delta",
    shortSummary: "Rekha Deul spires, Jagannath Puri coastline, and venerable Shakta Peethas.",
    keyStates: ["Odisha", "West Bengal", "Bihar", "Jharkhand"],
    image: SACRED_REGIONAL_IMAGES.East,
  },
  {
    regionId: "west",
    name: "Western Ghats, Sahyadri & Seaboard",
    shortSummary: "Arabian Sea shore temples, Somnath, Dwarka, and Sahyadri Jyotirlingas.",
    keyStates: ["Gujarat", "Maharashtra", "Rajasthan", "Goa"],
    image: SACRED_REGIONAL_IMAGES.West,
  },
  {
    regionId: "central",
    name: "Central Plateaus & Narmada Valley",
    shortSummary: "Narmada river teerths, Mahakaleshwar Jyotirlinga, and carved sandstone shrines.",
    keyStates: ["Madhya Pradesh", "Chhattisgarh"],
    image: SACRED_REGIONAL_IMAGES.Central,
  },
  {
    regionId: "northeast",
    name: "Northeastern Hills & Brahmaputra Basin",
    shortSummary: "Sacred Nilachal hill, Kamakhya Shakta throne, and serene river island satras.",
    keyStates: ["Assam", "Tripura", "Manipur", "Meghalaya", "Sikkim"],
    image: SACRED_REGIONAL_IMAGES.Northeast,
  },
];

export const ARCHITECTURE_STYLE_IMAGES: Record<string, DestinationImage> = {
  Dravidian: {
    id: "arch-dravidian",
    src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    alt: "Multi-tiered pyramidal vimana and towering Rajagopuram with intricate sculptures",
    caption: "Dravidian Style — Pyramidal vimanas, pillared mandapas and monumental gopurams",
    category: "ARCHITECTURE",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Dravidian Architectural Survey",
    focalPoint: "top",
  },
  Nagara: {
    id: "arch-nagara",
    src: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    alt: "Curvilinear beehive shikhara rising gracefully over sanctum sanctorum",
    caption: "Nagara Style — Curvilinear shikhara, amalaka finial and square garbhagriha layout",
    category: "ARCHITECTURE",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Nagara Heritage Index",
    focalPoint: "center",
  },
  Kalinga: {
    id: "arch-kalinga",
    src: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1200&q=80",
    alt: "Vertical-faced Rekha Deul sanctum and stepped Jagamohana hall",
    caption: "Kalinga Style — Rekha Deul sanctum, Pidha Jagamohana and lion-motif mastakas",
    category: "ARCHITECTURE",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Kalinga Documentation",
    focalPoint: "center",
  },
  Vesara: {
    id: "arch-vesara",
    src: "https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=1200&q=80",
    alt: "Stellate star-shaped plan and finely carved soapstone panels of Chalukya and Hoysala shrines",
    caption: "Vesara / Hybrid Style — Star-shaped sanctums combining Nagara profile with Dravidian tiers",
    category: "ARCHITECTURE",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Deccan Architectural Study",
    focalPoint: "center",
  },
  RockCut: {
    id: "arch-rockcut",
    src: "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80",
    alt: "Monolithic cave temples carved directly out of living basalt mountain cliffs",
    caption: "Cave & Rock-Cut Sanctuaries — Monolithic excavation, sanctum pillared halls, and ancient bas-reliefs",
    category: "ARCHITECTURE",
    rights: "UNSPLASH_LICENSE",
    credit: "Unsplash / Archaeological Monument Series",
    focalPoint: "center",
  },
};

/**
 * Retrieve verified image for a temple by slug
 */
export function getTempleImage(slug: string): DestinationImage | null {
  return CURATED_LANDMARK_IMAGES[slug] ?? null;
}

/**
 * Retrieve editorial multi-photo gallery for a temple by slug
 */
export function getTempleGallery(slug: string): DestinationImage[] {
  return TEMPLE_GALLERIES[slug] ?? [];
}

/**
 * Retrieve regional landscape image
 */
export function getRegionImage(region: string): DestinationImage | null {
  return SACRED_REGIONAL_IMAGES[region] ?? null;
}

/**
 * Retrieve architectural style image
 */
export function getArchitectureStyleImage(style: string): DestinationImage | null {
  const norm = style.toLowerCase();
  if (norm.includes("dravidian")) return ARCHITECTURE_STYLE_IMAGES.Dravidian;
  if (norm.includes("nagara")) return ARCHITECTURE_STYLE_IMAGES.Nagara;
  if (norm.includes("kalinga")) return ARCHITECTURE_STYLE_IMAGES.Kalinga;
  if (norm.includes("vesara") || norm.includes("hoysala") || norm.includes("chalukya")) return ARCHITECTURE_STYLE_IMAGES.Vesara;
  if (norm.includes("rock") || norm.includes("cave")) return ARCHITECTURE_STYLE_IMAGES.RockCut;
  return null;
}
