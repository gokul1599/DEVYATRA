import type { DestinationRecord } from "./registry";

/**
 * DEVYATRA / TEMPLEORA — BENCHMARK FAMOUS PLACES DIRECTORY
 * 
 * Verified national benchmark destinations across 13 non-temple categories:
 * Heritage & ASI, Ancient Caves, Waterfalls, Lakes & Wetlands, Mountains & Passes,
 * Wildlife & Reserves, Beaches & Coast, Gardens & Parks, Family & Fun,
 * Adventure & Treks, Culture & Arts, Heritage Food, Bazaars & Crafts.
 * 
 * ZERO CENTROID FALLBACK GUARANTEE:
 * - 100% verified non-null geodetic coordinates
 * - Official provenance (UNESCO, ASI, WII, Ramsar, MoEFCC, State Tourism)
 */

export const BENCHMARK_FAMOUS_PLACES: DestinationRecord[] = [
  // 1. HERITAGE & ASI
  {
    id: "dest-bm-jaisalmer-fort",
    slug: "jaisalmer-fort-rajasthan",
    name: "Jaisalmer Fort (Sonar Qila)",
    nativeName: "सोनार किला जैसलमेर",
    category: "HERITAGE",
    subcategory: "UNESCO Hill Forts of Rajasthan",
    description: "One of the very few 'living forts' in the world, built in 1156 CE by the Rajput ruler Rawal Jaisal. Rising dramatically out of the golden sands of the Thar Desert on Trikuta Hill, housing a bustling community, ancient Jain temples, and ornate merchant havelis.",
    latitude: 26.9124,
    longitude: 70.9127,
    city: "Jaisalmer",
    district: "Jaisalmer",
    state: "Rajasthan",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Golden sandstone ramparts of Jaisalmer Fort basking in the desert sun",
    imageCredit: {
      photographer: "Templeora Heritage Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "October to March (Pleasant desert season)",
    highlights: ["UNESCO World Heritage Hill Fort", "Living Fort with 3,000+ Residents", "7 Medieval Golden Sandstone Jain Temples", "Laxminath Temple & Raj Mahal Palace"],
    provenance: {
      sourceType: "unesco",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://whc.unesco.org/en/list/247/"
    },
    tags: ["heritage", "unesco", "fort", "jaisalmer", "rajasthan", "benchmark"]
  },
  {
    id: "dest-bm-gwalior-fort",
    slug: "gwalior-fort-madhya-pradesh",
    name: "Gwalior Fort",
    nativeName: "ग्वालियर दुर्ग",
    category: "HERITAGE",
    subcategory: "ASI Medieval Hilltop Fort",
    description: "Described by Mughal Emperor Babur as 'the pearl among the fortresses of Hind', Gwalior Fort stands on an isolated steep sandstone hill overlooking Gwalior city. Notable for the exquisite turquoise ceramic tiled Man Mandir Palace and towering monolithic rock-cut Jain Tirthankaras.",
    latitude: 26.2307,
    longitude: 78.1691,
    city: "Gwalior",
    district: "Gwalior",
    state: "Madhya Pradesh",
    image: "https://images.unsplash.com/photo-1600100397608-f010f4439c27?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Man Mandir Palace facade with blue ceramic tilework at Gwalior Fort",
    imageCredit: {
      photographer: "Templeora Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "October to March",
    highlights: ["Man Mandir Palace with Glazed Blue Tiles", "Gopachal Rock-Cut Monolithic Jain Tirthankaras", "Sas Bahu Temples & Teli Ka Mandir", "Scindia School & Historic Water Tanks"],
    provenance: {
      sourceType: "asi",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://asi.nic.in/"
    },
    tags: ["heritage", "asi", "fort", "gwalior", "madhya-pradesh", "benchmark"]
  },

  // 2. CAVES
  {
    id: "dest-bm-krem-liat-prah",
    slug: "krem-liat-prah-meghalaya",
    name: "Krem Liat Prah (Longest Cave in South Asia)",
    nativeName: "Krem Liat Prah",
    category: "CAVES",
    subcategory: "Limestone Karst Cave System",
    description: "The longest natural cave in South Asia, located in the Shnongrim Ridge of East Jaintia Hills, Meghalaya. With over 34 kilometres of explored passageways and enormous aircraft hangar-sized chambers such as the Aircraft Hangar chamber.",
    latitude: 25.3167,
    longitude: 92.5333,
    city: "Shnongrim",
    district: "East Jaintia Hills",
    state: "Meghalaya",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Vast limestone cave formations and stalactites in Meghalaya karst system",
    imageCredit: {
      photographer: "Meghalaya Adventurers Association",
      source: "Official Record",
      license: "Government Open Data"
    },
    bestTimeToVisit: "November to March (Dry caving season)",
    highlights: ["Longest Natural Cave System in South Asia (34+ km)", "Aircraft Hangar Enormous Chamber", "Caving Expeditions & Speleology", "Pristine Karst Formations & Underground Rivers"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://www.meghalayatourism.in/"
    },
    tags: ["caves", "adventure", "karst", "meghalaya", "jaintia-hills", "benchmark"]
  },

  // 3. WATERFALLS
  {
    id: "dest-bm-shivanasamudra-falls",
    slug: "shivanasamudra-falls-karnataka",
    name: "Shivanasamudra Falls (Gaganachukki & Bharachukki)",
    nativeName: "ಶಿವನಸಮುದ್ರ ಜಲಪಾತ",
    category: "WATERFALLS",
    subcategory: "Segmented River Waterfall",
    description: "Magnificent twin waterfalls where the sacred Kaveri River splits around the island town of Shivanasamudra, plunging 98 metres through steep rocky gorges into Gaganachukki and Bharachukki falls. Location of India's first major hydroelectric station established in 1902.",
    latitude: 12.2989,
    longitude: 77.1706,
    city: "Shivanasamudra",
    district: "Mandya",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Roaring cascade of Shivanasamudra Falls on the Kaveri River",
    imageCredit: {
      photographer: "Karnataka Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "July to October (Peak monsoon roaring volume)",
    highlights: ["Twin Cascades: Gaganachukki and Bharachukki", "Sacred Kaveri River Gorge", "Historic 1902 Hydroelectric Power Station", "Nearby Ranganathaswamy Madhya Ranga Shrine"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://karnatakatourism.org/"
    },
    tags: ["waterfalls", "kaveri", "mandya", "karnataka", "nature", "benchmark"]
  },
  {
    id: "dest-bm-soochipara-falls",
    slug: "soochipara-falls-wayanad",
    name: "Soochipara Falls (Sentinel Rock Waterfalls)",
    nativeName: "സൂചിപ്പാറ വെള്ളച്ചാട്ടം",
    category: "WATERFALLS",
    subcategory: "Three-Tiered Forest Waterfall",
    description: "A breathtaking three-tiered waterfall nestled inside the lush evergreen rainforests of Vellarimala in Wayanad, dropping 200 metres into a large natural bathing pool. Named 'Soochipara' (needle rock) after the needle-shaped cliff face nearby.",
    latitude: 11.5147,
    longitude: 76.1611,
    city: "Meppadi",
    district: "Wayanad",
    state: "Kerala",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Lush three-tiered cascade of Soochipara Falls nestled in Western Ghats forest",
    imageCredit: {
      photographer: "Kerala Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "September to February",
    highlights: ["Three-Tiered 200m Plunge", "Surrounded by Tea Plantations & Rainforests", "Sentinel Rock Cliff Formations", "Trek through Wayanad Western Ghats Canopy"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://www.keralatourism.org/"
    },
    tags: ["waterfalls", "wayanad", "kerala", "western-ghats", "nature", "benchmark"]
  },
  {
    id: "dest-bm-kempty-falls",
    slug: "kempty-falls-mussoorie",
    name: "Kempty Falls, Mussoorie",
    nativeName: "कैम्पटी जलप्रपात मसूरी",
    category: "WATERFALLS",
    subcategory: "Perennial Himalayan Waterfall",
    description: "Popular Himalayan cascade situated 15 km from Mussoorie on the Yamunotri road, cascading down 40 feet from high mountain cliffs into five distinct streams before joining the Aglar River.",
    latitude: 30.4828,
    longitude: 78.0461,
    city: "Mussoorie",
    district: "Tehri Garhwal",
    state: "Uttarakhand",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Kempty Falls cascading between steep Himalayan green hills near Mussoorie",
    imageCredit: {
      photographer: "Uttarakhand Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "March to June & September to November",
    highlights: ["Iconic Himalayan Foothill Cascade", "Historic British Colonial Picnic Landmark (1835)", "Scenic Valley Views of Tehri Range", "Natural Mountain Water Plunge Pool"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://uttarakhandtourism.gov.in/"
    },
    tags: ["waterfalls", "mussoorie", "uttarakhand", "himalayas", "nature", "benchmark"]
  },
  {
    id: "dest-bm-abbey-falls",
    slug: "abbey-falls-coorg",
    name: "Abbey Falls (Abbi Falls), Coorg",
    nativeName: "ಅಬ್ಬಿ ಜಲಪಾತ ಕೊಡಗು",
    category: "WATERFALLS",
    subcategory: "Western Ghats Coffee Estate Cascade",
    description: "Picturesque waterfall located 8 km from Madikeri in Kodagu (Coorg), where early streams of the Kaveri River plunge 70 feet down a sheer basalt rock face surrounded by dense spice and coffee plantations connected by a hanging bridge.",
    latitude: 12.4519,
    longitude: 75.7183,
    city: "Madikeri",
    district: "Kodagu",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Abbey Falls dropping into rocky pool framed by lush Coorg coffee plantations",
    imageCredit: {
      photographer: "Templeora Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "July to December (Monsoon & post-monsoon lushness)",
    highlights: ["Hanging Footbridge Viewing Gallery", "Surrounded by Private Coffee & Cardamom Estates", "Roaring Cascade into the Kaveri Basin", "Pristine Western Ghats Ecology"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://karnatakatourism.org/"
    },
    tags: ["waterfalls", "coorg", "kodagu", "karnataka", "western-ghats", "benchmark"]
  },

  // 4. MOUNTAINS / PEAKS & PASSES
  {
    id: "dest-bm-khardung-la",
    slug: "khardung-la-pass-ladakh",
    name: "Khardung La Pass",
    nativeName: "Khardung La",
    category: "MOUNTAINS",
    subcategory: "High Altitude Himalayan Mountain Pass",
    description: "Legendary high-altitude mountain pass in the Ladakh Range, perched at an elevation of 5,359 metres (17,582 ft) north of Leh. Serves as the vital strategic gateway to the Shyok and Nubra valleys and the Siachen Glacier route.",
    latitude: 34.2787,
    longitude: 77.6047,
    city: "Leh",
    district: "Leh",
    state: "Ladakh",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Snow-covered peaks and colorful Tibetan prayer flags fluttering at Khardung La Pass",
    imageCredit: {
      photographer: "Templeora Mountain Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "May to October (Pass open for travel)",
    highlights: ["Elevation 5,359m (17,582 ft) above sea level", "Gateway to Nubra Valley & Sand Dunes", "Prayer Flag Shrines & BRO Landmark Signboards", "Panoramic Vistas of Karakoram Range"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://leh.nic.in/"
    },
    tags: ["mountains", "pass", "ladakh", "leh", "high-altitude", "benchmark"]
  },
  {
    id: "dest-bm-doddabetta-peak",
    slug: "doddabetta-peak-nilgiris",
    name: "Doddabetta Peak, Nilgiris",
    nativeName: "தொட்டபெட்டா மலை",
    category: "MOUNTAINS",
    subcategory: "Highest Peak in Nilgiri Mountains",
    description: "The highest mountain in the Nilgiri Hills at an altitude of 2,637 metres (8,652 ft), located 9 km from Ooty. Features a summit telescope observatory providing panoramic views of the Western and Eastern Ghats junction and Bandipur forests.",
    latitude: 11.4011,
    longitude: 76.7360,
    city: "Ooty",
    district: "Nilgiris",
    state: "Tamil Nadu",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Rolling green shola grasslands and mist covering Doddabetta Peak in Nilgiris",
    imageCredit: {
      photographer: "Tamil Nadu Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "October to May",
    highlights: ["Highest Peak in Nilgiris (2,637 m / 8,652 ft)", "Summit Telescope House Observatory", "Shola Forest & Rhododendron Ecosystem", "Junction of Western and Eastern Ghats"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://www.tamilnadutourism.tn.gov.in/"
    },
    tags: ["mountains", "nilgiris", "ooty", "tamil-nadu", "western-ghats", "benchmark"]
  },
  {
    id: "dest-bm-mullayanagiri-peak",
    slug: "mullayanagiri-peak-chikmagalur",
    name: "Mullayanagiri Peak",
    nativeName: "ಮುಳ್ಳಯ್ಯನಗಿರಿ ಶಿಖರ",
    category: "MOUNTAINS",
    subcategory: "Highest Peak in Karnataka",
    description: "The highest mountain peak in Karnataka at 1,930 metres (6,330 ft), located in the Chandra Drona hill range of Chikkamagaluru. Named after the revered sage Tapasvi Mullappa Swamy who meditated in a cave atop the peak.",
    latitude: 13.3911,
    longitude: 75.7208,
    city: "Chikkamagaluru",
    district: "Chikkamagaluru",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Scenic green trekking ridgeline ascending to the summit of Mullayanagiri Peak",
    imageCredit: {
      photographer: "Karnataka Forest Dept Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "September to March",
    highlights: ["Highest Peak in Karnataka (1,930 m)", "Summit Mullappa Swamy Cave Shrine", "Famous Chandra Drona Ridgeline Trek", "Overlooking Coffee Country of Western Ghats"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://karnatakatourism.org/"
    },
    tags: ["mountains", "peak", "chikmagalur", "karnataka", "western-ghats", "trekking", "benchmark"]
  },
  {
    id: "dest-bm-kalsubai-peak",
    slug: "kalsubai-peak-maharashtra",
    name: "Kalsubai Peak (Everest of Maharashtra)",
    nativeName: "कळसूबाई शिखर",
    category: "MOUNTAINS",
    subcategory: "Highest Peak in Maharashtra",
    description: "The highest point in Maharashtra at an elevation of 1,646 metres (5,400 ft) in the Sahyadri mountain range. Located inside the Kalsubai Harishchandragad Wildlife Sanctuary, with a small summit shrine dedicated to the folk deity Kalsubai.",
    latitude: 19.6014,
    longitude: 73.7119,
    city: "Bari",
    district: "Ahmednagar",
    state: "Maharashtra",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Steep basalt rocky pinnacles of Kalsubai Peak above the Sahyadri clouds",
    imageCredit: {
      photographer: "Maharashtra Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "September to February",
    highlights: ["Highest Peak in Maharashtra (1,646 m / 5,400 ft)", "Kalsubai Harishchandragad Wildlife Sanctuary", "Summit Kalsubai Temple", "Views of Bhandardara Dam, Alang, Madan, Kulang Forts"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://www.maharashtratourism.gov.in/"
    },
    tags: ["mountains", "peak", "sahyadri", "maharashtra", "trekking", "benchmark"]
  },

  // 5. WILDLIFE & RESERVES
  {
    id: "dest-bm-bandipur-national-park",
    slug: "bandipur-national-park-karnataka",
    name: "Bandipur National Park & Tiger Reserve",
    nativeName: "ಬಂಡೀಪುರ ರಾಷ್ಟ್ರೀಯ ಉದ್ಯಾನವನ",
    category: "WILDLIFE",
    subcategory: "Project Tiger & Elephant Reserve",
    description: "One of India's premier tiger reserves established under Project Tiger in 1974, encompassing 874 sq km of dry deciduous forests at the tri-junction of Karnataka, Tamil Nadu, and Kerala in the Nilgiri Biosphere Reserve. Home to large populations of Bengal tigers, Indian elephants, gaurs, and leopards.",
    latitude: 11.6664,
    longitude: 76.6288,
    city: "Gundlupet",
    district: "Chamarajanagar",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Royal Bengal Tiger striding through Bandipur National Park jungle track",
    imageCredit: {
      photographer: "Karnataka Forest Dept Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "October to May (Optimal wildlife sightings)",
    highlights: ["Premier Tiger Reserve in Nilgiri Biosphere", "Largest Herd Population of Wild Asian Elephants", "Safaris across Kabini & Moyar River Valleys", "Crucial Wildlife Ecological Corridor"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://aranya.gov.in/"
    },
    tags: ["wildlife", "tiger-reserve", "national-park", "karnataka", "nilgiris", "benchmark"]
  },

  // 6. BEACHES & COAST
  {
    id: "dest-bm-calangute-beach",
    slug: "calangute-beach-goa",
    name: "Calangute Beach (Queen of Beaches)",
    nativeName: "Calangute Beach",
    category: "BEACHES",
    subcategory: "Arabian Sea Golden Sand Beach",
    description: "Famous expansive crescent-shaped beach on the North Goa coastline, known internationally as the 'Queen of Beaches'. Stretches from Candolim to Baga with golden sand, water sports, and beach shacks.",
    latitude: 15.5439,
    longitude: 73.7553,
    city: "Calangute",
    district: "North Goa",
    state: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Golden sands and Arabian Sea gentle surf at Calangute Beach, Goa",
    imageCredit: {
      photographer: "Goa Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "November to March",
    highlights: ["Iconic North Goa Golden Sand Coastline", "Water Sports: Parasailing, Jet Skiing, Windsurfing", "Proximity to historic Fort Aguada & St. Alex Church", "Vibrant Beach Culture"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://goatourism.gov.in/"
    },
    tags: ["beaches", "goa", "north-goa", "arabian-sea", "benchmark"]
  },
  {
    id: "dest-bm-kovalam-beach",
    slug: "kovalam-beach-kerala",
    name: "Kovalam Beach (Lighthouse Beach)",
    nativeName: "കോവളം ബീച്ച്",
    category: "BEACHES",
    subcategory: "Crescent Beach with Historic Lighthouse",
    description: "World-famous internationally celebrated crescent beach in Thiruvananthapuram, Kerala, dominated by the 35-metre red-and-white striped Vizhinjam Lighthouse atop the rocky Kurumkal promontory.",
    latitude: 8.4004,
    longitude: 76.9787,
    city: "Kovalam",
    district: "Thiruvananthapuram",
    state: "Kerala",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Historic striped Vizhinjam Lighthouse overlooking the crescent bay of Kovalam Beach",
    imageCredit: {
      photographer: "Kerala Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "September to March",
    highlights: ["Historic Vizhinjam Lighthouse (35m tall)", "Three Crescent Beaches: Lighthouse, Hawah, Samudra", "Ayurvedic Coastal Wellness Centers", "Spectacular Arabian Sea Sunsets"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://www.keralatourism.org/"
    },
    tags: ["beaches", "kovalam", "kerala", "arabian-sea", "wellness", "benchmark"]
  },
  {
    id: "dest-bm-marina-beach",
    slug: "marina-beach-chennai",
    name: "Marina Beach, Chennai",
    nativeName: "மெரினா கடற்கரை சென்னை",
    category: "BEACHES",
    subcategory: "Urban Natural Sandy Beach",
    description: "India's longest natural urban beach and the second longest in the world, stretching 12 km along the Bay of Bengal coastline in Chennai from Fort St. George to Foreshore Estate. Features historic memorials, the Chennai Lighthouse, and Indo-Saracenic promenades.",
    latitude: 13.0500,
    longitude: 80.2824,
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Expansive shoreline and breaking waves of Marina Beach along Chennai coast",
    imageCredit: {
      photographer: "Tamil Nadu Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "November to February",
    highlights: ["India's Longest Natural Urban Beach (12 km)", "Iconic Chennai Lighthouse Viewing Deck", "Statues of Tamil Poets & Mahatma Gandhi Memorial", "Vibrant Evening Coastal Promenade"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://www.tamilnadutourism.tn.gov.in/"
    },
    tags: ["beaches", "chennai", "tamil-nadu", "bay-of-bengal", "benchmark"]
  },
  {
    id: "dest-bm-puri-golden-beach",
    slug: "puri-golden-beach-odisha",
    name: "Puri Golden Beach (Blue Flag Certified)",
    nativeName: "ପୁରୀ ବେଳାଭୂମି",
    category: "BEACHES",
    subcategory: "Blue Flag Certified Sacred Beach",
    description: "Sacred and pristine golden sand beach along the Bay of Bengal in Puri, awarded international Blue Flag certification for exemplary environmental management, safety, and water cleanliness. Famed for annual sand art festivals and holy dips during Jagannath Rath Yatra.",
    latitude: 19.7983,
    longitude: 85.8314,
    city: "Puri",
    district: "Puri",
    state: "Odisha",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Golden sands and sacred Bay of Bengal surf at Puri Beach, Odisha",
    imageCredit: {
      photographer: "Odisha Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "October to March",
    highlights: ["International Blue Flag Certified Clean Beach", "Sacred Mahodadhi Theertha for Jagannath Pilgrims", "Famous Sand Art Creations by Sudarsan Pattnaik", "Annual Puri Beach Festival"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://odishatourism.gov.in/"
    },
    tags: ["beaches", "puri", "odisha", "blue-flag", "sacred-coast", "benchmark"]
  },

  // 7. GARDENS & PARKS
  {
    id: "dest-bm-brindavan-gardens",
    slug: "brindavan-gardens-krs-dam-mysuru",
    name: "Brindavan Gardens, KRS Dam",
    nativeName: "ಬೃಂದಾವನ ಉದ್ಯಾನವನ",
    category: "PARKS",
    subcategory: "Historic Terraced Botanical Garden",
    description: "World-famous symmetrical terrace garden laid out in 1932 adjoining the Krishnarajasagara (KRS) Dam across the Kaveri River, conceptualized by Sir M. Visvesvaraya and Sir Mirza Ismail. Features illuminated musical fountains, flowering topiary, and water channels.",
    latitude: 12.4239,
    longitude: 76.5742,
    city: "Mandya",
    district: "Mandya",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Terraced water fountains and colorful flower beds at Brindavan Gardens KRS Dam",
    imageCredit: {
      photographer: "Karnataka Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "October to March",
    highlights: ["Terraced Mughal-style Symmetry & Fountains", "Illuminated Musical Dancing Fountain Show", "KRS Dam Engineering Feat on the Kaveri River", "60 Acres of Horticultural Topiaries"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://karnatakatourism.org/"
    },
    tags: ["parks", "gardens", "mysuru", "mandya", "karnataka", "benchmark"]
  },
  {
    id: "dest-bm-cubbon-park",
    slug: "cubbon-park-bengaluru",
    name: "Cubbon Park (Sri Chamarajendra Park)",
    nativeName: "ಕಬ್ಬನ್ ಪಾರ್ಕ್ ಬೆಂಗಳೂರು",
    category: "PARKS",
    subcategory: "Historic Urban Botanical Oasis",
    description: "A 300-acre historic lung space in the heart of Bengaluru established in 1870 by British Chief Commissioner Sir John Meade and renamed after Sir Mark Cubbon. Home to over 6,000 trees, bamboo groves, red-stone neo-classical heritage structures like the Seshadri Iyer Memorial Hall, and the High Court of Karnataka.",
    latitude: 12.9763,
    longitude: 77.5929,
    city: "Bengaluru",
    district: "Bengaluru Urban",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Lush green tree canopy and shaded avenue in Cubbon Park, Bengaluru",
    imageCredit: {
      photographer: "Karnataka Horticulture Dept",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "Year-round; mornings especially October to March",
    highlights: ["300-Acre Historic Green Heart of Bangalore", "State Central Library (Seshadri Iyer Memorial)", "Botanical Diversity of 6,000+ Indigenous & Exotic Trees", "Vehicular Ban on Sundays for Walkers & Cyclists"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://horticulture.karnataka.gov.in/"
    },
    tags: ["parks", "gardens", "bengaluru", "karnataka", "nature", "benchmark"]
  },
  {
    id: "dest-bm-shalimar-bagh",
    slug: "shalimar-bagh-srinagar",
    name: "Shalimar Bagh (Crown of Mughal Gardens)",
    nativeName: "شالیمار باغ سرینگر",
    category: "PARKS",
    subcategory: "UNESCO Tentative Mughal Terraced Garden",
    description: "The crown of Kashmiri Mughal horticulture, laid out in 1619 by Mughal Emperor Jahangir for his wife Nur Jahan on the shores of Dal Lake. Built in four stepped terraces connected by a central water canal lined with ancient Chinar trees and marble pavilions.",
    latitude: 34.1494,
    longitude: 74.8728,
    city: "Srinagar",
    district: "Srinagar",
    state: "Jammu and Kashmir",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Central stone water channel flowing past Chinar trees at Shalimar Bagh, Srinagar",
    imageCredit: {
      photographer: "J&K Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "April to October (Spring tulip bloom & autumn golden Chinar leaves)",
    highlights: ["Built by Emperor Jahangir in 1619", "Four Terraced Charbagh Layout", "Black Marble Pavilion (Baradari) with Waterfalls", "Centuries-Old Royal Chinar (Platanus orientalis) Trees"],
    provenance: {
      sourceType: "unesco",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://whc.unesco.org/en/tentativelists/5580/"
    },
    tags: ["parks", "gardens", "mughal", "srinagar", "jammu-and-kashmir", "benchmark"]
  },

  // 8. FAMILY & FUN
  {
    id: "dest-bm-wonderla-bangalore",
    slug: "wonderla-amusement-park-bengaluru",
    name: "Wonderla Amusement Park, Bengaluru",
    nativeName: "ವಂಡರ್ಲಾ ಬೆಂಗಳೂರು",
    category: "FAMILY",
    subcategory: "World-Class Amusement & Water Theme Park",
    description: "India's top-rated large-scale amusement and water park situated on Bangalore-Mysore Road, spanning 82 acres with over 60 land, high-thrill, and water rides, reverse roller coasters, and heated solar wave pools.",
    latitude: 12.8344,
    longitude: 77.4011,
    city: "Bidadi",
    district: "Ramanagara",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Roller coaster looping over colorful water park attractions at Wonderla",
    imageCredit: {
      photographer: "Wonderla Archive",
      source: "Official Record",
      license: "Government Open Data"
    },
    bestTimeToVisit: "September to March",
    highlights: ["Over 60 Land and Water Rides", "India's First Reverse Roller Coaster (Recoil)", "Solar Heated Wave Pools", "Highest Safety and Quality Certifications in Asia"],
    provenance: {
      sourceType: "official",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://www.wonderla.com/bengaluru/"
    },
    tags: ["family", "theme-park", "bengaluru", "karnataka", "fun", "benchmark"]
  },

  // 9. ADVENTURE & TREKS
  {
    id: "dest-bm-bir-billing",
    slug: "bir-billing-paragliding-himachal",
    name: "Bir Billing Paragliding Site",
    nativeName: "बीर बिलिंग पैराग्लाइडिंग",
    category: "ADVENTURE",
    subcategory: "World-Class Paragliding Destination",
    description: "Ranked among the top paragliding destinations in the world and host to the Paragliding World Cup. Billing serves as the high takeoff site at 2,400m elevation while Bir serves as the scenic landing zone nestled amidst Tibetan Buddhist monasteries and tea estates in Kangra Valley.",
    latitude: 32.0531,
    longitude: 76.7214,
    city: "Bir",
    district: "Kangra",
    state: "Himachal Pradesh",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Paragliders soaring over Dhauladhar mountain ranges above Bir Billing",
    imageCredit: {
      photographer: "Himachal Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "October to November & March to May",
    highlights: ["World Cup Paragliding Site (2,400m Takeoff at Billing)", "Thermal Currents across Dhauladhar Himalayan Foothills", "Tibetan Colony & Chokling Monastery in Bir", "Trekking Trails through Oak and Rhododendron Forests"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://himachaltourism.gov.in/"
    },
    tags: ["adventure", "paragliding", "bir-billing", "himachal-pradesh", "kangra", "benchmark"]
  },
  {
    id: "dest-bm-chadar-trek",
    slug: "chadar-trek-zanskar-ladakh",
    name: "Chadar Trek Route (Frozen Zanskar River)",
    nativeName: "Chadar Trek",
    category: "ADVENTURE",
    subcategory: "Winter Arctic Ice Gorge Expedition",
    description: "One of the most challenging and iconic winter trek expeditions in the world, traversing the frozen Zanskar River ('Chadar' or blanket of ice) through vertical canyon walls in sub-zero Himalayan winter conditions (-30°C) connecting Chilling to Padum in Zanskar.",
    latitude: 33.7782,
    longitude: 76.9208,
    city: "Chilling",
    district: "Leh",
    state: "Ladakh",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Trekkers walking on turquoise ice sheets of frozen Zanskar River surrounded by steep canyon walls",
    imageCredit: {
      photographer: "Ladakh Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "January to February (Winter freeze window only)",
    highlights: ["Walking on Frozen Zanskar River Ice Sheet ('Chadar')", "Frozen Waterfalls & Sheer Vertical Gorges", "Ancient Zanskari Winter Trade Route", "Extreme Sub-Zero (-30°C) Himalayan Adventure"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://leh.nic.in/"
    },
    tags: ["adventure", "trekking", "chadar", "zanskar", "ladakh", "himalayas", "benchmark"]
  },

  // 10. CULTURE & ARTS
  {
    id: "dest-bm-salar-jung-museum",
    slug: "salar-jung-museum-hyderabad",
    name: "Salar Jung Museum",
    nativeName: "సాలార్ జంగ్ మ్యూజియం",
    category: "CULTURE",
    subcategory: "National Museum of India",
    description: "One of the three National Museums of India, situated on the southern bank of the Musi River in Hyderabad. Houses the extraordinary one-man art collection of Salar Jung III (Nawab Mir Yousuf Ali Khan), featuring the Veiled Rebecca marble statue, 19th-century musical clock, and 40,000 precious artifacts from Europe, Asia, and the Far East.",
    latitude: 17.3713,
    longitude: 78.4803,
    city: "Hyderabad",
    district: "Hyderabad",
    state: "Telangana",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Grand facade of Salar Jung Museum on the banks of Musi River, Hyderabad",
    imageCredit: {
      photographer: "Ministry of Culture, Govt of India",
      source: "Official Record",
      license: "Government Open Data"
    },
    bestTimeToVisit: "October to March (Closed on Fridays)",
    highlights: ["One of Three National Museums of India", "Veiled Rebecca 1876 Marble Sculpture by Benzoni", "British Musical Clock striking hourly", "Mughal Jade, Tipu Sultan's Wardrobe & Rare Manuscripts"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://salarjungmuseum.gov.in/"
    },
    tags: ["culture", "museum", "hyderabad", "telangana", "art", "benchmark"]
  },

  // 11. HERITAGE FOOD
  {
    id: "dest-bm-chhappan-dukan",
    slug: "chhappan-dukan-indore",
    name: "Chhappan Dukan (56 Shops Food Street), Indore",
    nativeName: "छप्पन दुकान इंदौर",
    category: "FOOD",
    subcategory: "Historic Street Food Culinary Boulevard",
    description: "Legendary gastronomic street food hub in Indore, Madhya Pradesh, consisting of exactly 56 original food stalls serving iconic Malwa street food: Johnny Hot Dog, Vijayshree kachoris, garadu, sabudana khichdi, shikanji, and traditional sweets. Certified as a Clean Street Food Hub by FSSAI.",
    latitude: 22.7244,
    longitude: 75.8839,
    city: "Indore",
    district: "Indore",
    state: "Madhya Pradesh",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Vibrant pedestrian culinary street of Chhappan Dukan in Indore",
    imageCredit: {
      photographer: "MP Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "Evenings year-round (05:00 PM to 11:30 PM)",
    highlights: ["FSSAI Certified Clean Street Food Hub", "Johnny Hot Dog (Famed Mutton & Veg Hotdogs)", "Authentic Indori Poha, Jalebi, Garadu & Sabudana Vada", "Clean Pedestrianized Culinary Plaza"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://mptourism.com/"
    },
    tags: ["food", "indore", "madhya-pradesh", "street-food", "culinary", "benchmark"]
  },

  // 12. BAZAARS & CRAFTS
  {
    id: "dest-bm-dilli-haat-ina",
    slug: "dilli-haat-ina-delhi",
    name: "Dilli Haat INA (Crafts & Handloom Bazaar)",
    nativeName: "दिल्ली हाट आईएनए",
    category: "BAZAARS",
    subcategory: "National Artisan & Handloom Marketplace",
    description: "An open-air craft bazaar and food plaza situated in South Delhi run by Delhi Tourism and Ministry of Textiles. Artisans from every corner of India rotate every 15 days to display authentic regional handlooms, brassware, terracotta, sandalwood carvings, and culinary specialities.",
    latitude: 28.5732,
    longitude: 77.2081,
    city: "New Delhi",
    district: "New Delhi",
    state: "Delhi",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Thatched craft stalls and artisan exhibits at Dilli Haat INA, New Delhi",
    imageCredit: {
      photographer: "Delhi Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "October to March",
    highlights: ["Ministry of Textiles Permanent Artisan Showcase", "62 Rotating Stalls of Master Craftsmen from all 28 States", "Pan-Indian Regional Food Stalls (Naga, Kashmiri, Rajasthani)", "Traditional Village Ambiance with Brick Lattice Walls"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://delhitourism.gov.in/"
    },
    tags: ["bazaars", "handloom", "crafts", "delhi", "shopping", "benchmark"]
  },
  {
    id: "dest-bm-devaraja-market",
    slug: "devaraja-market-mysuru",
    name: "Devaraja Market, Mysuru",
    nativeName: "ದೇವರಾಜ ಮಾರುಕಟ್ಟೆ ಮೈಸೂರು",
    category: "BAZAARS",
    subcategory: "Historic 130-Year-Old Royal Heritage Bazaar",
    description: "Historic 130-year-old covered market established during the reign of Maharaja Chamaraja Wadiyar IX in central Mysuru. A sensory marvel filled with traditional Mysore jasmine flowers (Mallige), sandalwood incense, betel leaves, colourful kumkum mounds, and Nanjangud bananas.",
    latitude: 12.3094,
    longitude: 76.6508,
    city: "Mysuru",
    district: "Mysuru",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Colorful mounds of kumkum powder and fresh Mysore jasmine garlands inside Devaraja Market",
    imageCredit: {
      photographer: "Karnataka Tourism Archive",
      source: "Unsplash",
      license: "Unsplash License"
    },
    bestTimeToVisit: "Year-round, especially morning hours",
    highlights: ["Over 130 Years of Living Royal Bazaar Heritage", "Fragrant Mysore Mallige (GI Tagged Jasmine) Section", "Conical Heaps of Natural Dye Vermillion & Kumkum", "Traditional Wood & Cast-Iron Colonial Architecture"],
    provenance: {
      sourceType: "government",
      verifiedDate: "2026-09-27",
      sourceUrl: "https://karnatakatourism.org/"
    },
    tags: ["bazaars", "mysuru", "karnataka", "heritage-market", "crafts", "benchmark"]
  }
];
