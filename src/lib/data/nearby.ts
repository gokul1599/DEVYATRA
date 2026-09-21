import { NearbyPlace } from "@/lib/types";

/**
 * Curated nearby discovery data. Only genuinely, commonly documented places
 * are listed (temple amenities, well-known monuments, famous eateries).
 * A dedicated business-data integration (restaurant / maps providers) feeds
 * the mm-scale dataset; see /docs/data-import.md.
 */

const P = (
  templeId: string,
  id: string,
  name: string,
  kind: NearbyPlace["kind"],
  distanceKm: number,
  extra: Partial<NearbyPlace> = {}
): NearbyPlace => ({
  id,
  templeId,
  name,
  kind,
  distanceKm,
  verified: true,
  ...extra,
});

const FOOD = (t: string, id: string, name: string, d: number, extra: Partial<NearbyPlace>) =>
  P(t, id, name, "restaurant", d, { cuisine: ["South Indian", "North Indian"], ...extra });

export const NEARBY: Record<string, NearbyPlace[]> = {
  "t-venkateswara": [
    P("t-venkateswara", "n-ven-annadanam", "TTD Annadanam (free meals)", "restaurant", 0.3, { priceHint: "Free", cuisine: ["South Indian", "Vegetarian"], recommendation: "The temple's own free dining hall, just outside the main enclosures." }),
    P("t-venkateswara", "n-ven-laddu", "TTD Laddu Prasadam counters", "shopping", 0.4, { priceHint: "Paid (nominal)", recommendation: "Take your laddu prasadam from the official TTD counters, not street stalls." }),
    P("t-venkateswara", "n-ven-sheshadri", "Haritha Sheshadri (APTDC)", "hotel", 1.2, { priceHint: "Mid-range", recommendation: "State-run hotel near the temple with convenient darshan access." }),
    P("t-venkateswara", "n-ven-papavinasam", "Papavinasanam waterfall", "nature", 2.0, { recommendation: "A quiet forest viewpoint on the hill, part of the sacred circuit." }),
    P("t-venkateswara", "n-ven-akasa", "Akasa Ganga (hill spring)", "nature", 3.0, { recommendation: "Sacred spring on the hill believed to supply the temple's water." }),
    P("t-venkateswara", "n-ven-sila", "Silathoranam (natural rock arch)", "nature", 1.5, { recommendation: "Natural arch below the temple, unique to the Seshachalam range." }),
    P("t-venkateswara", "n-ven-alipiri", "Alipiri footpath trek start", "nature", 6.0, { recommendation: "Classic 9 km step-foothill route to the temple for walkers." }),
  ],
  "t-meenakshi": [
    FOOD("t-meenakshi", "n-mad-idli", "Murugan Idli Shop", 0.5, { priceHint: "Budget", openNow: true, recommendation: "Famed for soft idlis since decades — a safe vegetarian breakfast near the temple." }),
    P("t-meenakshi", "n-mad-palace", "Thirumalai Nayakkar Mahal", "attraction", 1.8, { priceHint: "Paid", recommendation: "17th-century palace, 15 minutes from the temple." }),
    P("t-meenakshi", "n-mad-teppakulam", "Vandiyur Mariamman Teppakulam", "nature", 4.0, { recommendation: "Vast temple tank with a central shrine, usually visitable post-dawn." }),
    P("t-meenakshi", "n-mad-canteen", "Temple canteen (HR&CE)", "restaurant", 0.2, { priceHint: "Budget", cuisine: ["South Indian", "Vegetarian"], recommendation: "Simple and clean, right at the temple complex." }),
    P("t-meenakshi", "n-mad-royal", "Hotel Royal Court", "hotel", 2.5, { priceHint: "Mid-range", recommendation: "Well-reviewed central option a short auto ride away." }),
    P("t-meenakshi", "n-mad-parking", "Temple parking plaza", "parking", 0.4, { recommendation: "Pay-and-park facility near the east gopuram access." }),
  ],
  "t-kashi-vishwanath": [
    P("t-kashi-vishwanath", "n-var-attri", "Dashashwamedh Ganga Aarti", "attraction", 0.7, { recommendation: "Evening river aarti on the main ghat — pair with temple darshan." }),
    P("t-kashi-vishwanath", "n-var-corridor", "Kashi Vishwanath Corridor", "attraction", 0.3, { recommendation: "Opened 2021, links the temple to the Ganga ghats." }),
    FOOD("t-kashi-vishwanath", "n-var-deena", "Deena Chat Bhandar", 0.8, { priceHint: "Budget", openNow: true, recommendation: "A Varanasi classic for chaat near the old city." }),
    P("t-kashi-vishwanath", "n-var-blue", "Blue Lassi", "restaurant", 0.6, { priceHint: "Budget", cuisine: ["Lassi", "Vegetarian"], recommendation: "Famous corner lassi shop in the lanes near the temple." }),
    P("t-kashi-vishwanath", "n-var-sarnath", "Sarnath", "attraction", 10.5, { priceHint: "Paid", recommendation: "Buddhist site of the First Sermon, ~40 minutes by road." }),
    P("t-kashi-vishwanath", "n-var-brij", "BrijRama Palace", "hotel", 0.9, { priceHint: "Premium", recommendation: "Heritage hotel on the ghat, within walking distance." }),
  ],
  "t-jagannath-puri": [
    P("t-jagannath-puri", "n-pur-beach", "Golden Beach (Swargadwar)", "nature", 1.2, { recommendation: "Puri's sea beach, about 15 minutes on foot." }),
    P("t-jagannath-puri", "n-pur-konark", "Konark Sun Temple", "attraction", 34, { priceHint: "Paid", recommendation: "One hour from Puri on the coastal road — the UNESCO sun chariot temple." }),
    P("t-jagannath-puri", "n-pur-chilika", "Chilika Lake", "nature", 56, { recommendation: "Asia's largest brackish lagoon; more suited to an extended day." }),
    FOOD("t-jagannath-puri", "n-pur-chung", "Chung Wah Restaurant", 1.8, { priceHint: "Mid-range", openNow: true, recommendation: "Long-established Chinese restaurant in Puri town." }),
    P("t-jagannath-puri", "n-pur-mayfair", "Mayfair Beach Resort", "hotel", 2.5, { priceHint: "Premium", recommendation: "Beachfront resort a short drive from the temple." }),
    P("t-jagannath-puri", "n-pur-mahaprasad", "Mahaprasad (temple kitchen)", "restaurant", 0.3, { priceHint: "Free/nominal", cuisine: ["Vegetarian", "Odia"], recommendation: "The temple's enormous kitchen service — a unique experience." }),
  ],
  "t-brihadeeswarar": [
    P("t-brihadeeswarar", "n-tnj-palace", "Thanjavur Maratha Palace", "attraction", 1.4, { priceHint: "Paid", recommendation: "Palace and Durbar Hall, 10 minutes from the temple." }),
    P("t-brihadeeswarar", "n-tnj-library", "Saraswathi Mahal Library", "attraction", 1.6, { recommendation: "Rare-manuscript library inside the palace complex." }),
    FOOD("t-brihadeeswarar", "n-tnj-ariya", "Sree Ariya Bhavan", 1.2, { priceHint: "Budget", openNow: true, recommendation: "Dependable vegetarian stop near the temple town centre." }),
    P("t-brihadeeswarar", "n-tnj-vijay", "Hotel Vijay Residency", "hotel", 1.0, { priceHint: "Mid-range", recommendation: "Central and close to the temple complex." }),
    P("t-brihadeeswarar", "n-tnj-parking", "Temple approach parking", "parking", 0.3, { recommendation: "Designated parking by the eastern entrance road." }),
  ],
  "t-vaishno-devi": [
    P("t-vaishno-devi", "n-vnd-ardhk", "Ardhkuwari cave (en route)", "attraction", 6.0, { recommendation: "Halfway cave shrine on the 13 km trek." }),
    P("t-vaishno-devi", "n-vnd-bhairav", "Bhairavnath Temple", "temple", 13.5, { recommendation: "The twin shrine above the main cave, reached at yatra end." }),
    P("t-vaishno-devi", "n-vnd-katra", "Katra bazaar", "shopping", 0.5, { recommendation: "Markets for prasad and supplies before the trek." }),
    P("t-vaishno-devi", "n-vnd-helipad", "Sanjichhat helipad", "transport", 9.5, { priceHint: "Paid", recommendation: "Helicopter option on the Bhairon route, booked via the board." }),
    P("t-vaishno-devi", "n-vnd-parking", "Katra vehicle parking", "parking", 0.8, { recommendation: "Board-managed parking at the base." }),
  ],
  "t-somnath": [
    P("t-somnath", "n-som-sound", "Somnath Sound & Light Show", "attraction", 0.5, { priceHint: "Paid", recommendation: "Evening narrative of the temple's history — starts at dusk." }),
    P("t-somnath", "n-som-museum", "Somnath Museum", "attraction", 1.0, { recommendation: "Local antiquities near the temple precinct." }),
    P("t-somnath", "n-som-beach", "Prabhas Patan beach", "nature", 1.5, { recommendation: "Sea view near the confluence point, calm in mornings." }),
    P("t-somnath", "n-som-ahmed", "Hotel Ahmed Abad (HTDC)", "hotel", 1.2, { priceHint: "Mid-range", recommendation: "Government-circuit hotel close to the temple." }),
  ],
  "t-ram-mandir-ayodhya": [
    P("t-ram-mandir-ayodhya", "n-ayodhya-saryu", "Saryu Ghat aarti", "attraction", 1.0, { recommendation: "Evening aarti on the Saryu, ~1 km from the temple." }),
    P("t-ram-mandir-ayodhya", "n-ayodhya-hanuman", "Hanuman Garhi", "temple", 0.8, { recommendation: "Old hill-top Hanuman temple in the city centre." }),
    P("t-ram-mandir-ayodhya", "n-ayodhya-kanak", "Kanak Bhawan", "temple", 1.1, { recommendation: "Palace-temple of Sita and Rama, a short walk away." }),
    P("t-ram-mandir-ayodhya", "n-ayodhya-katha", "Ram Katha Park", "nature", 3.0, { recommendation: "Riverside park with murals of the Ramayana episodes." }),
    P("t-ram-mandir-ayodhya", "n-ayodhya-parking", "Visitor parking (city)", "parking", 1.4, { recommendation: "City parking lots with shuttle to the temple gate." }),
  ],
  "t-mahabodhi": [
    P("t-mahabodhi", "n-bodhi-gbs", "Great Buddha Statue", "attraction", 0.7, { recommendation: "25 m meditation statue, 10 minutes' walk." }),
    P("t-mahabodhi", "n-bodhi-thai", "Thai Monastery", "attraction", 1.2, { recommendation: "One of Bodh Gaya's many international monasteries." }),
    P("t-mahabodhi", "n-bodhi-royal", "Royal Bhutan Monastery", "attraction", 1.0, { recommendation: "Bhutanese monastery enclosure near the temple." }),
    P("t-mahabodhi", "n-bodhi-gaya", "Gaya railway station", "transport", 11, { recommendation: "Nearest mainline railhead, ~30 minutes by road." }),
    P("t-mahabodhi", "n-bodhi-hotel", "Hotels on Temple Street", "hotel", 1.3, { priceHint: "Budget–mid", recommendation: "Cluster of pilgrim hotels by the temple street." }),
  ],
  "t-shirdi-sai": [
    P("t-shirdi-sai", "n-shirdi-dwarkamai", "Dwarkamai Masjid", "attraction", 0.3, { recommendation: "Where Sai Baba lived; part of the core sanctum walk." }),
    P("t-shirdi-sai", "n-shirdi-chavadi", "Chavadi", "attraction", 0.5, { recommendation: "Where Sai Baba stayed on alternate nights." }),
    P("t-shirdi-sai", "n-shirdi-prasad", "Sansthan Prasadalaya", "restaurant", 0.6, { priceHint: "Free", cuisine: ["Vegetarian"], recommendation: "The trust's free dining hall — enormous and quick." }),
    P("t-shirdi-sai", "n-shirdi-atm", "ATMs near temple gate", "atm", 0.4, { recommendation: "Presence is routine at the gate; verify locally." }),
  ],
  "t-siddhivinayak": [
    P("t-siddhivinayak", "n-sid-dadar", "Dadar railway station", "transport", 1.5, { recommendation: "Western/Central line junction, ~10 minutes away." }),
    P("t-siddhivinayak", "n-sid-chaitya", "Chaitya Bhoomi", "attraction", 2.2, { recommendation: "Dr. Ambedkar memorial adjacent to Dadar beach." }),
    P("t-siddhivinayak", "n-sid-shivajipark", "Shivaji Park", "nature", 1.8, { recommendation: "Mumbai's historic public ground for an evening walk." }),
    P("t-siddhivinayak", "n-sid-parking", "Siddhivinayak parking", "parking", 0.2, { recommendation: "Pay-and-park lots immediately around the temple." }),
  ],
  "t-guruvayur": [
    P("t-guruvayur", "n-gur-ekadasi-photo", "Punnathur Kotta (elephant camp)", "attraction", 3.5, { priceHint: "Paid", recommendation: "The temple's elephant camp, managed by Devaswom." }),
    P("t-guruvayur", "n-gur-chavakkad", "Chavakkad beach", "nature", 6.0, { recommendation: "Quiet sea beach about 15 minutes by auto." }),
    P("t-guruvayur", "n-gur-mammiyur", "Mammiyur Mahadeva Temple", "temple", 0.5, { recommendation: "Sister Shiva shrine joined to Guruvayur's ritual circuit." }),
    P("t-guruvayur", "n-gur-anand", "Anandashram (free lunch)", "restaurant", 0.7, { priceHint: "Free / donation", cuisine: ["Vegetarian"], recommendation: "Free sadya lunches served by the neighbouring ashram." }),
    P("t-guruvayur", "n-gur-hotel", "Devine Inn / temple-stay hotels", "hotel", 1.0, { priceHint: "Budget–mid", recommendation: "Pilgrim-hostel belt a short walk from the east gate." }),
  ],
  "t-konark": [
    P("t-konark", "n-kon-pack", "Konark museum (ASI)", "attraction", 0.3, { recommendation: "Sculptural collection beside the monument complex." }),
    P("t-konark", "n-kon-beach", "Konark beach", "nature", 1.2, { recommendation: "Sunrise walk on the beach near the temple." }),
    P("t-konark", "n-kon-chand", "Chandrabhaga", "nature", 1.5, { recommendation: "The sacred beach for the Magha Saptami sun festival." }),
  ],
  "t-dwarkadhish": [
    P("t-dwarkadhish", "n-dwk-beti", "Bet Dwarka island temple", "temple", 30, { recommendation: "Island shrine linked by ferry, famed in Krishna tradition." }),
    P("t-dwarkadhish", "n-dwk-gomti", "Gomti Ghat", "nature", 0.6, { recommendation: "Bathing ghat where the Gomti meets the sea." }),
    P("t-dwarkadhish", "n-dwk-rup", "Rukmini Devi Temple", "temple", 2.0, { recommendation: "Rukmini's shrine ~2 km away, part of the dwarka circuit." }),
  ],
  "t-kedarnath": [
    P("t-kedarnath", "n-ked-helipad", "Kedarnath helipad", "transport", 0.4, { priceHint: "Paid", recommendation: "Helicopter option for return from the shrine." }),
    P("t-kedarnath", "n-ked-gaurikund", "Gaurikund base camp", "transport", 16, { recommendation: "Trek start with phone coverage and basic facilities." }),
    P("t-kedarnath", "n-ked-atm", "ATM at Gaurikund", "atm", 16, { recommendation: "Carry cash — ATMs at the base only." }),
  ],
  "t-badrinath": [
    P("t-badrinath", "n-bdr-vasudhara", "Vasudhara fall", "nature", 3.0, { recommendation: "Snow-fed waterfall above the temple (seasonal)." }),
    P("t-badrinath", "n-bdr-narad", "Mana village & Vyasa Cave", "attraction", 3.5, { recommendation: "Last Indian village before the border, ~4 km." }),
    P("t-badrinath", "n-bdr-helipad", "Badrinath helipad", "transport", 1.0, { priceHint: "Paid", recommendation: "Helicopter option during the open season." }),
  ],
  "t-amarnath": [
    P("t-amarnath", "n-amn-pahalgam", "Pahalgam (base, 36 km)", "transport", 36, { recommendation: "Long-route valley base on the Pahalgam trek." }),
    P("t-amarnath", "n-amn-baltal", "Baltal (base, 14 km)", "transport", 14, { recommendation: "Short-route base for the 14 km trek." }),
    P("t-amarnath", "n-amn-sheshnag", "Sheshnag lake", "nature", 13, { recommendation: "Alpine lake at the first major camping halt." }),
  ],
};

export const nearbyFor = (templeId: string): NearbyPlace[] => NEARBY[templeId] ?? [];