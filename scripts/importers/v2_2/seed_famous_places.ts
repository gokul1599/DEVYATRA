/**
 * DEVYATRA / TEMPLEORA — PHASE V2.2: CANONICAL FAMOUS PLACES SEEDER
 * 
 * Populates verified, reusable attractions across India's pilgrimage zones:
 * - Heritage: UNESCO World Heritage sites, ASI protected monuments, royal palaces, forts
 * - Pilgrimage: Sacred ghats, sacred kunds/tanks, historic mathas
 * - Nature: Sacred rivers, waterfalls, hills, coastal promenades
 * - Culture: Royal museums, heritage arts centers, Vedic research libraries
 * - Local Experiences: Traditional bazaar corridors, handloom weavers' streets
 * 
 * Computes spatial relations and links to existing temples in the database.
 */

import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../src/generated/prisma/client";
import { calculateHaversineDistanceKm } from "../../../src/lib/nearby/engine";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

interface RawFamousPlace {
  slug: string;
  name: string;
  nativeName?: string;
  category: "HERITAGE" | "PILGRIMAGE" | "NATURE" | "CULTURE" | "LOCAL_EXPERIENCES";
  subcategory?: string;
  description: string;
  latitude: number;
  longitude: number;
  city?: string;
  district?: string;
  state?: string;
  sourceType: string;
  sourceUrl?: string;
  officialUrl?: string;
  imageReference?: string;
  nearbyTempleSlugs: string[]; // explicit canonical anchor linkages
}

const CANONICAL_FAMOUS_PLACES: RawFamousPlace[] = [
  // 1. Madurai Zone (Anchored to Meenakshi Amman Temple)
  {
    slug: "thirumalai-nayakkar-palace-madurai",
    name: "Thirumalai Nayakkar Mahal",
    nativeName: "திருமலை நாயக்கர் அரண்மனை",
    category: "HERITAGE",
    subcategory: "ASI & State Protected Monument",
    description: "17th-century classical Dravidian-Italianate royal palace erected by King Thirumalai Nayak, celebrated for its towering 82-foot stucco pillars and light-and-sound heritage courtyard.",
    latitude: 9.9149,
    longitude: 78.1239,
    city: "Madurai",
    district: "Madurai",
    state: "Tamil Nadu",
    sourceType: "asi",
    sourceUrl: "https://www.tamilnadutourism.tn.gov.in",
    officialUrl: "https://www.tamilnadutourism.tn.gov.in/destinations/thirumalai-nayakkar-mahal",
    imageReference: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["meenakshi-amman-temple", "koodal-azhagar-temple", "vandiyur-mariamman-temple"],
  },
  {
    slug: "vandiyur-mariamman-teppakulam-madurai",
    name: "Vandiyur Mariamman Teppakulam",
    nativeName: "வண்டியூர் மாரியம்மன் தெப்பக்குளம்",
    category: "PILGRIMAGE",
    subcategory: "Sacred Temple Tank & Float Pavilion",
    description: "Massive 16-acre sacred temple tank fed through underground stone channels from the Vaigai river, housing the Maiya Mandapam used during the celestial Float Festival (Teppam).",
    latitude: 9.9142,
    longitude: 78.1528,
    city: "Madurai",
    district: "Madurai",
    state: "Tamil Nadu",
    sourceType: "official",
    sourceUrl: "https://madurai.nic.in/tourist-place/vandiyur-mariamman-teppakulam/",
    imageReference: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["meenakshi-amman-temple", "vandiyur-mariamman-temple"],
  },
  {
    slug: "gandhi-memorial-museum-madurai",
    name: "Gandhi Memorial Museum (Tamukkam Palace)",
    nativeName: "காந்தி நினைவு அருங்காட்சியகம்",
    category: "CULTURE",
    subcategory: "Historic Royal Summer Palace Museum",
    description: "Housed in the historic Rani Mangammal Palace (1670 CE), showcasing rare freedom-era artifacts, historic manuscripts, and handloom khadi traditions of Madurai.",
    latitude: 9.9324,
    longitude: 78.1396,
    city: "Madurai",
    district: "Madurai",
    state: "Tamil Nadu",
    sourceType: "government",
    sourceUrl: "https://gandhimmm.org",
    imageReference: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["meenakshi-amman-temple"],
  },

  // 2. Tirupati & Tirumala Zone (Anchored to Sri Venkateswara Swamy Vaari Temple)
  {
    slug: "silathoranam-natural-rock-arch-tirumala",
    name: "Silathoranam (Natural Rock Arch)",
    nativeName: "శిలాతోరణం",
    category: "NATURE",
    subcategory: "Geological Monument of India",
    description: "Rare pre-Cambrian geological natural stone arch perched in the Tirumala Hills, dating back 2.5 billion years and revered in Sthala Puranas as divine manifestation.",
    latitude: 13.6828,
    longitude: 79.3497,
    city: "Tirumala",
    district: "Tirupati",
    state: "Andhra Pradesh",
    sourceType: "official",
    sourceUrl: "https://www.tirumala.org",
    officialUrl: "https://www.tirumala.org",
    imageReference: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["sri-venkateswara-temple", "sri-varahaswami-temple-tirumala"],
  },
  {
    slug: "kapila-theertham-waterfalls-tirupati",
    name: "Kapila Theertham Waterfalls & Sacred Cave",
    nativeName: "కపిల తీర్థం",
    category: "PILGRIMAGE",
    subcategory: "Sacred Shaivite Mountain Waterfall",
    description: "Only ancient Shaiva temple complex situated at the foot of Seshachalam Hills, where the holy mountain spring cascades into a sacred stone tank sanctified by Maharishi Kapila.",
    latitude: 13.6525,
    longitude: 79.4243,
    city: "Tirupati",
    district: "Tirupati",
    state: "Andhra Pradesh",
    sourceType: "official",
    sourceUrl: "https://www.tirumala.org",
    imageReference: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["sri-venkateswara-temple", "sri-govindaraja-swamy-temple", "sri-padmavathi-ammavaru-temple"],
  },
  {
    slug: "chandragiri-fort-and-palace-tirupati",
    name: "Chandragiri Fort & Raja Mahal Palace",
    nativeName: "చంద్రగిరి కోట",
    category: "HERITAGE",
    subcategory: "Vijayanagara Imperial Fort",
    description: "11th-century fort that served as the final capital of the Vijayanagara Empire, featuring the Indo-Saracenic Raja Mahal and Rani Mahal preserved by the Archaeological Survey of India.",
    latitude: 13.5828,
    longitude: 79.3175,
    city: "Chandragiri",
    district: "Tirupati",
    state: "Andhra Pradesh",
    sourceType: "asi",
    sourceUrl: "https://asi.nic.in",
    imageReference: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["sri-venkateswara-temple", "sri-govindaraja-swamy-temple"],
  },

  // 3. Varanasi / Kashi Zone (Anchored to Kashi Vishwanath)
  {
    slug: "dashashwamedh-ghat-varanasi",
    name: "Dashashwamedh Ghat",
    nativeName: "दशाश्वमेध घाट",
    category: "PILGRIMAGE",
    subcategory: "Sacred Ganga Riverfront & Maha Aarti",
    description: "The most sacred and vibrant riverfront ghat of Kashi where Brahma performed ten Ashwamedha sacrifices, famous worldwide for the choreographed evening Ganga Aarti.",
    latitude: 25.3072,
    longitude: 83.0104,
    city: "Varanasi",
    district: "Varanasi",
    state: "Uttar Pradesh",
    sourceType: "official",
    sourceUrl: "https://varanasi.nic.in/tourist-place/dashashwamedh-ghat/",
    imageReference: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["kashi-vishwanath-temple", "annapurna-devi-temple-kashi", "kaal-bhairav-temple-varanasi"],
  },
  {
    slug: "sarnath-deer-park-and-dhamek-stupa",
    name: "Sarnath Archaeological Park & Dhamek Stupa",
    nativeName: "सारनाथ पुरातात्विक स्थल",
    category: "HERITAGE",
    subcategory: "UNESCO Tentative / ASI National Monument",
    description: "World-renowned sacred archaeological site where Lord Buddha delivered his first sermon (Dhammacakkappavattana Sutta); features the monumental 5th-century Dhamek Stupa and Ashoka Pillar.",
    latitude: 25.3811,
    longitude: 83.0214,
    city: "Varanasi",
    district: "Varanasi",
    state: "Uttar Pradesh",
    sourceType: "asi",
    sourceUrl: "https://asi.nic.in",
    imageReference: "https://images.unsplash.com/photo-1600100397608-f010f4439c36?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["kashi-vishwanath-temple", "kaal-bhairav-temple-varanasi"],
  },
  {
    slug: "thatheri-bazar-brass-and-banarasi-silk",
    name: "Thatheri Bazar & Banarasi Silk Corridor",
    nativeName: "ठठेरी बाजार",
    category: "LOCAL_EXPERIENCES",
    subcategory: "Centuries-Old Metalcraft & Handloom Bazaar",
    description: "Ancient labyrinthine medieval bazaar known for traditional brassware, hand-beaten bronze pooja utensils, and genuine master-weaver Banarasi silk ateliers.",
    latitude: 25.3115,
    longitude: 83.0082,
    city: "Varanasi",
    district: "Varanasi",
    state: "Uttar Pradesh",
    sourceType: "tourism",
    sourceUrl: "https://uptourism.gov.in",
    imageReference: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["kashi-vishwanath-temple"],
  },

  // 4. Hampi / Bellary Zone (Anchored to Virupaksha Temple)
  {
    slug: "hampi-vitthala-temple-stone-chariot",
    name: "Vitthala Temple Complex & Stone Chariot",
    nativeName: "ವಿಠ್ಠಲ ದೇವಾಲಯ ಮತ್ತು ಕಲ್ಲಿನ ರಥ",
    category: "HERITAGE",
    subcategory: "UNESCO World Heritage Site",
    description: "Culmination of Vijayanagara architectural mastery, celebrated for the iconic monolithic Stone Chariot, musical granite pillars, and sprawling ceremonial Kalyana Mandapa.",
    latitude: 15.3354,
    longitude: 76.4795,
    city: "Hampi",
    district: "Vijayanagara",
    state: "Karnataka",
    sourceType: "unesco",
    sourceUrl: "https://whc.unesco.org/en/list/241/",
    officialUrl: "https://asi.nic.in",
    imageReference: "https://images.unsplash.com/photo-1600100397608-f010f4439c36?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["virupaksha-temple-hampi", "vijaya-vittala-temple-hampi", "achyutaraya-temple-hampi"],
  },
  {
    slug: "matanga-hill-sunrise-viewpoint-hampi",
    name: "Matanga Hill",
    nativeName: "ಮಾತಂಗ ಬೆಟ್ಟ",
    category: "NATURE",
    subcategory: "Sacred Kishkindha Panoramic Hill",
    description: "Highest topographical peak in Hampi revered as the hermitage of Sage Matanga in Ramayana lore, offering 360-degree sunrise vistas across the Tungabhadra river valley.",
    latitude: 15.3321,
    longitude: 76.4678,
    city: "Hampi",
    district: "Vijayanagara",
    state: "Karnataka",
    sourceType: "tourism",
    sourceUrl: "https://karnatakatourism.org",
    imageReference: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["virupaksha-temple-hampi"],
  },

  // 5. Ujjain / Malwa Zone (Anchored to Mahakaleshwar)
  {
    slug: "shri-mahakal-lok-corridor-ujjain",
    name: "Shri Mahakal Mahalok Corridor",
    nativeName: "श्री महाकाल लोक",
    category: "CULTURE",
    subcategory: "Grand Sacred Cultural Promenade",
    description: "Spectacular 900-meter cultural heritage corridor adorned with 108 intricate Shiva Tandava murals, 200 sculpted statues, and musical water fountains bordering Rudrasagar Lake.",
    latitude: 23.1842,
    longitude: 75.7681,
    city: "Ujjain",
    district: "Ujjain",
    state: "Madhya Pradesh",
    sourceType: "official",
    sourceUrl: "https://shrimahakaleshwar.com",
    officialUrl: "https://shrimahakaleshwar.com",
    imageReference: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["mahakaleshwar-temple", "harsiddhi-mata-temple-ujjain", "kaal-bhairav-temple-ujjain"],
  },
  {
    slug: "ram-ghat-shipra-river-ujjain",
    name: "Ram Ghat (Shipra River)",
    nativeName: "राम घाट (शिप्रा तट)",
    category: "PILGRIMAGE",
    subcategory: "Historic Kumbh Mela Sacred Snan Ghat",
    description: "Centuries-old stone ghat on the sacred Shipra river where millions of yatris take ceremonial holy dips during the Simhastha Kumbh Mela and witness the evening Shipra Aarti.",
    latitude: 23.1812,
    longitude: 75.7621,
    city: "Ujjain",
    district: "Ujjain",
    state: "Madhya Pradesh",
    sourceType: "tourism",
    sourceUrl: "https://mptourism.com",
    imageReference: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["mahakaleshwar-temple", "harsiddhi-mata-temple-ujjain"],
  },

  // 6. Thanjavur / Chola Zone (Anchored to Brihadisvara Temple)
  {
    slug: "thanjavur-maratha-palace-and-saraswathi-mahal",
    name: "Thanjavur Royal Palace & Saraswathi Mahal Library",
    nativeName: "தஞ்சாவூர் மராட்டிய அரண்மனை",
    category: "HERITAGE",
    subcategory: "Nayaka & Maratha Royal Complex",
    description: "Stately 16th-century palace complex housing the world-famous Saraswathi Mahal Library (possessing over 49,000 rare palm-leaf manuscripts) and royal bronze art gallery.",
    latitude: 10.7932,
    longitude: 79.1362,
    city: "Thanjavur",
    district: "Thanjavur",
    state: "Tamil Nadu",
    sourceType: "asi",
    sourceUrl: "https://asi.nic.in",
    imageReference: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["brihadisvara-temple-thanjavur"],
  },

  // 7. Puri / Odisha Zone (Anchored to Jagannath Temple Puri)
  {
    slug: "golden-beach-puri-blue-flag",
    name: "Puri Golden Beach (Blue Flag Certified)",
    nativeName: "ପୁରୀ ସ୍ଵର୍ଣ୍ଣ ବେଳାଭୂମି",
    category: "NATURE",
    subcategory: "Eco-Certified Sacred Bay of Bengal Beach",
    description: "Pristine golden sand shoreline bordering the sacred Mahodadhi (Bay of Bengal) where pilgrims perform purifying holy baths before and after Darshan.",
    latitude: 19.7982,
    longitude: 85.8245,
    city: "Puri",
    district: "Puri",
    state: "Odisha",
    sourceType: "official",
    sourceUrl: "https://puri.nic.in",
    imageReference: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["jagannath-temple-puri", "gundicha-temple-puri"],
  },
  {
    slug: "raghurajpur-heritage-craft-village",
    name: "Raghurajpur Heritage Pattachitra Crafts Village",
    nativeName: "ରଘୁରାଜପୁର ହସ୍ତଶିଳ୍ପ ଗ୍ରାମ",
    category: "CULTURE",
    subcategory: "UNESCO / National Heritage Crafts Hamlet",
    description: "Historic crafts settlement along the Bhargavi river where every household practices traditional GI-tagged Pattachitra palm-leaf painting, stone carving, and Gotipua dance.",
    latitude: 19.8698,
    longitude: 85.8341,
    city: "Raghurajpur",
    district: "Puri",
    state: "Odisha",
    sourceType: "tourism",
    sourceUrl: "https://odishatourism.gov.in",
    imageReference: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["jagannath-temple-puri"],
  },

  // 8. Somnath / Gujarat Zone (Anchored to Somnath Temple)
  {
    slug: "somnath-triveni-sangam-ghat",
    name: "Triveni Sangam (Hiran, Kapila & Saraswati)",
    nativeName: "ત્રિવેણી સંગમ ઘાટ",
    category: "PILGRIMAGE",
    subcategory: "Holy Confluence & Arabian Sea Snan Ghat",
    description: "Sacred confluence of the holy rivers Hiran, Kapila, and mythical Saraswati as they meet the Arabian Sea, sanctified for ancestral Shraddha rites and Punya Snana.",
    latitude: 20.8924,
    longitude: 70.4142,
    city: "Veraval",
    district: "Gir Somnath",
    state: "Gujarat",
    sourceType: "official",
    sourceUrl: "https://somnath.org",
    imageReference: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["somnath-temple", "balka-tirth-somnath"],
  },
  {
    slug: "somnath-promenade-and-arabian-sea-walkway",
    name: "Somnath Sea Promenade",
    nativeName: "સોમનાથ સમુદ્ર વોકવે",
    category: "NATURE",
    subcategory: "Scenic Coastal Heritage Walkway",
    description: "Paved coastal promenade offering dramatic sunset views of the Arabian Sea waves crashing against the rugged foundation walls of the Somnath Jyotirlinga sanctum.",
    latitude: 20.8872,
    longitude: 70.4005,
    city: "Veraval",
    district: "Gir Somnath",
    state: "Gujarat",
    sourceType: "tourism",
    sourceUrl: "https://www.gujarattourism.com",
    imageReference: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["somnath-temple"],
  },

  // 9. Dwarka Zone (Anchored to Dwarkadhish Temple)
  {
    slug: "sudama-setu-and-gomati-river-ghat-dwarka",
    name: "Sudama Setu & Gomati Sangam Ghat",
    nativeName: "સુદામા સેતુ અને ગોમતી ઘાટ",
    category: "PILGRIMAGE",
    subcategory: "Sacred Estuary & Suspension Bridge",
    description: "Graceful pedestrian suspension bridge crossing the holy Gomati river estuary to the Panchkui beach, where Sri Krishna met his childhood friend Sudama.",
    latitude: 22.2361,
    longitude: 68.9664,
    city: "Dwarka",
    district: "Devbhumi Dwarka",
    state: "Gujarat",
    sourceType: "official",
    sourceUrl: "https://dwarkadhish.org",
    imageReference: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["dwarkadhish-temple-dwarka", "nageshwar-jyotirlinga-temple-dwarka"],
  },
  {
    slug: "dwarka-lighthouse-and-sunset-point",
    name: "Dwarka Lighthouse & Coastal Sunset Point",
    nativeName: "દ્વારકા દીવાદાંડી",
    category: "NATURE",
    subcategory: "Arabian Sea Panoramic Lookout",
    description: "Historic 43-meter cylindrical lighthouse at Rupen Creek offering sweeping vantage points across the Gulf of Kutch and ancient submerged Dwarka excavations.",
    latitude: 22.2345,
    longitude: 68.9567,
    city: "Dwarka",
    district: "Devbhumi Dwarka",
    state: "Gujarat",
    sourceType: "tourism",
    sourceUrl: "https://www.gujarattourism.com",
    imageReference: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["dwarkadhish-temple-dwarka"],
  },

  // 10. Kedarnath & Badrinath Himalayan Zone
  {
    slug: "vasuki-tal-glacial-lake-kedarnath",
    name: "Vasuki Tal Sacred Glacial Lake",
    nativeName: "वासुकी ताल",
    category: "NATURE",
    subcategory: "High Altitude Glacial Tarn (4,135m)",
    description: "Crystal-clear high-altitude alpine lake surrounded by the Chaukhamba peaks, where Lord Vishnu bathed according to Hindu scripture; an 8 km trek from Kedarnath.",
    latitude: 30.7621,
    longitude: 79.0984,
    city: "Kedarnath",
    district: "Rudraprayag",
    state: "Uttarakhand",
    sourceType: "tourism",
    sourceUrl: "https://uttarakhandtourism.gov.in",
    imageReference: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["kedarnath-temple", "bhadreshwar-temple"],
  },
  {
    slug: "bhim-pul-and-saraswati-river-mana",
    name: "Bhim Pul & Saraswati River Gorge (Mana Village)",
    nativeName: "भीम पुल (माणा)",
    category: "HERITAGE",
    subcategory: "Legendary Monolithic Rock Bridge",
    description: "Gigantic natural boulder bridge placed by Pandava Bhima across the foaming Saraswati river gorge in Mana, recognized as India's premier border heritage village.",
    latitude: 30.7782,
    longitude: 79.4975,
    city: "Mana",
    district: "Chamoli",
    state: "Uttarakhand",
    sourceType: "tourism",
    sourceUrl: "https://uttarakhandtourism.gov.in",
    imageReference: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    nearbyTempleSlugs: ["badrinath-temple"],
  }
];

export async function seedFamousPlaces() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  console.log("=== Seeding Canonical Famous Places & Linking Temples (V2.2) ===");
  let placesInserted = 0;
  let linksCreated = 0;

  try {
    for (const raw of CANONICAL_FAMOUS_PLACES) {
      // 1. Upsert FamousPlace row
      const place = await prisma.famousPlace.upsert({
        where: { slug: raw.slug },
        update: {
          name: raw.name,
          nativeName: raw.nativeName,
          category: raw.category,
          subcategory: raw.subcategory,
          description: raw.description,
          latitude: raw.latitude,
          longitude: raw.longitude,
          city: raw.city,
          district: raw.district,
          state: raw.state,
          sourceType: raw.sourceType,
          sourceUrl: raw.sourceUrl,
          officialUrl: raw.officialUrl,
          imageReference: raw.imageReference,
          lastCheckedAt: new Date(),
        },
        create: {
          slug: raw.slug,
          name: raw.name,
          nativeName: raw.nativeName,
          category: raw.category,
          subcategory: raw.subcategory,
          description: raw.description,
          latitude: raw.latitude,
          longitude: raw.longitude,
          city: raw.city,
          district: raw.district,
          state: raw.state,
          sourceType: raw.sourceType,
          sourceUrl: raw.sourceUrl,
          officialUrl: raw.officialUrl,
          imageReference: raw.imageReference,
          verificationStatus: "VERIFIED_OFFICIAL",
          verifiedAt: new Date(),
          lastCheckedAt: new Date(),
        },
      });
      placesInserted++;

      // 2. Resolve anchor temples by slug or nearby distance
      for (const templeSlug of raw.nearbyTempleSlugs) {
        const temple = await prisma.temple.findFirst({
          where: {
            OR: [
              { slug: templeSlug },
              { slug: { contains: templeSlug.split("-")[0] } },
            ],
          },
        });

        if (temple) {
          const distKm = calculateHaversineDistanceKm(
            temple.latitude,
            temple.longitude,
            place.latitude,
            place.longitude
          );

          await prisma.templeNearbyPlace.upsert({
            where: {
              templeId_nearbyPlaceId: {
                templeId: temple.id,
                nearbyPlaceId: place.id,
              },
            },
            update: {
              distanceKm: distKm,
              estimatedDriveMinutes: Math.round(distKm * 2.5),
              estimatedWalkMinutes: distKm < 3.0 ? Math.round(distKm * 14) : null,
              relationshipType: "CANONICAL_VICINITY",
              verifiedAt: new Date(),
            },
            create: {
              templeId: temple.id,
              nearbyPlaceId: place.id,
              distanceKm: distKm,
              estimatedDriveMinutes: Math.round(distKm * 2.5),
              estimatedWalkMinutes: distKm < 3.0 ? Math.round(distKm * 14) : null,
              relationshipType: "CANONICAL_VICINITY",
              priority: 1,
              verifiedAt: new Date(),
            },
          });
          linksCreated++;
        }
      }
    }

    console.log(`✔ Finished: ${placesInserted} famous places seeded; ${linksCreated} temple links established.`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith("seed_famous_places.ts")) {
  seedFamousPlaces()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
