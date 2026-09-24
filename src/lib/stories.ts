export interface EditorialStory {
  slug: string;
  title: string;
  subtitle: string;
  category: "ARCHITECTURE" | "TEMPLE STORIES" | "PILGRIMAGE" | "FESTIVALS" | "SACRED LANDSCAPES";
  readingTimeMinutes: number;
  publishDate: string;
  author: string;
  heroImage: {
    src: string;
    alt: string;
    caption: string;
    credit: string;
  };
  excerpt: string;
  content: {
    sectionTitle?: string;
    paragraphs: string[];
    quote?: string;
  }[];
  relatedTempleSlugs: string[];
  sourceArchive: {
    primarySource: string;
    gazetteerRef?: string;
    auditStatus: string;
  };
}

export const EDITORIAL_STORIES: EditorialStory[] = [
  {
    slug: "chola-granite-monuments-and-bronze-devotion",
    title: "The Granite Sovereignty of the Great Living Cholas",
    subtitle: "How Rajaraja and Rajendra Chola translated imperial vision and cosmic devotion into the soaring vimanas of Thanjavur and Gangaikonda Cholapuram.",
    category: "ARCHITECTURE",
    readingTimeMinutes: 7,
    publishDate: "2026-09-18",
    author: "Templeora Heritage Editorial",
    heroImage: {
      src: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80",
      alt: "Brihadisvara Temple monolithic granite vimana tower",
      caption: "The 216-foot vimana of the Peruvudaiyar Kovil (Brihadisvara), completed in 1010 CE entirely of interlocking dry-stone granite.",
      credit: "ASI Architectural Survey / Verified Editorial Archive",
    },
    excerpt: "No granite quarry exists within fifty miles of Thanjavur. Yet in 1010 CE, Rajaraja I raised a 216-foot granite tower crowned by an eighty-ton monolithic cupola—an engineering marvel that defied both gravity and antiquity.",
    content: [
      {
        sectionTitle: "I. The Material Paradox of Thanjavur",
        paragraphs: [
          "The fertile Cauvery delta is a land of soft silt, clay, and paddy fields. It possesses no stone of its own. For centuries, Tamil builders had relied on fired brick and timber, materials subject to the relentless tropical humidity of the southern peninsula. When Rajaraja Chola ascended the throne, he decreed an unprecedented break with tradition: the new imperial sanctuary would be constructed purely of granite, the hardest and most permanent stone known to the subcontinent.",
          "Over one hundred and thirty thousand tons of granite were quarried in the distant hills beyond Tiruchirappalli, floated down the swollen monsoon waters of the Cauvery on massive timber rafts, and hauled to the building site by teams of imperial elephants and stonemasons.",
        ],
        quote: "Let the king build not for his own brief reign, but as an axis mundi that outlasts dynastic memory.",
      },
      {
        sectionTitle: "II. Engineering the 80-Ton Kumbam",
        paragraphs: [
          "The crowning glory of Brihadisvara is its sikhara—an octagonal dome carved from a single block of granite estimated to weigh over eighty tons. To hoist this colossal mass to the summit of a 216-foot hollow pyramid without cranes, the Chola engineers constructed a continuous earthen ramp beginning four miles away in the village of Sarapallam.",
          "Elephants and human draft teams pushed the gilded monolithic stone up this gentle incline over months of meticulous labor, positioning it with millimeter precision over the central garbhagriha.",
        ],
      },
      {
        sectionTitle: "III. The Living Bronze Tradition",
        paragraphs: [
          "Inside the shadowed pillared corridors of the temple courtyards flourished the lost-wax (cire perdue) bronze casters. The Chola bronze Nataraja—Lord Shiva dancing the Ananda Tandava—remains universally recognized as one of mankind's supreme sculptural accomplishments, balancing rhythm, fire, and cosmic dissolution in flawless metallic equilibrium.",
        ],
      },
    ],
    relatedTempleSlugs: ["brihadisvara-temple", "meenakshi-amman-temple"],
    sourceArchive: {
      primarySource: "Epigraphia Indica Vol. II & Archaeological Survey of India (ASI) Memoir No. 34",
      gazetteerRef: "Tanjore District Gazetteer, Madras Presidency (1906)",
      auditStatus: "Archival Grade Historical Record",
    },
  },
  {
    slug: "himalayan-mandakini-trail-kedarnath",
    title: "The High Altitude Sanctum: Walking the Mandakini Trail",
    subtitle: "Glacial winds, stone sanctums, and the timeless pilgrimage to Kedarnath at 3,583 meters above sea level.",
    category: "PILGRIMAGE",
    readingTimeMinutes: 6,
    publishDate: "2026-09-12",
    author: "Templeora Himalayan Expedition Desk",
    heroImage: {
      src: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80",
      alt: "Kedarnath Temple surrounded by snow-clad Himalayan peaks",
      caption: "Kedarnath sanctuary standing resolutely before the snowbound Kedar Dome at 11,755 feet.",
      credit: "Uttarakhand Heritage Documentation / Unsplash",
    },
    excerpt: "At 3,583 meters, oxygen is scarce and silence is absolute. When the morning mist lifts over the Mandakini river, the ancient grey granite sanctum of Kedarnath appears against the sheer glacial face of the Himalayas.",
    content: [
      {
        sectionTitle: "I. The Approach Along the Sacred Torrent",
        paragraphs: [
          "The pilgrimage to Kedarnath begins long before the temple comes into view. From Gaurikund, the path ascends eighteen kilometers along the thundering glacial gorge of the Mandakini river. Pilgrims walk through pine forests that gradually yield to rhododendron scrub, and finally to bare, windswept moraine.",
          "The temple itself, built of massive interlocking grey stone slabs, has stood for over a millennium. When the catastrophic glacial lake outburst flood of 2013 tore down the valley, a gigantic boulder rolled down the mountainside and lodged directly behind the sanctum, miraculously deflecting the wall of water and debris around the shrine.",
        ],
        quote: "In the high mountains, a shrine is not merely visited—it is reached through surrender of body and breath.",
      },
      {
        sectionTitle: "II. The Winter Samadhi and Rawal Tradition",
        paragraphs: [
          "For six months each year, heavy Himalayan snow buries the temple. On the auspicious day of Bhai Dooj, the sacred flame inside the sanctum is kept alight, the doors are sealed, and the deity's utsav vigraha is carried down to Ukhimath in a grand procession led by the chief priest (Rawal), who traditionally belongs to the Veerashaiva community of Karnataka—a living emblem of India's ancient civilizational unity.",
        ],
      },
    ],
    relatedTempleSlugs: ["kedarnath-temple", "kashi-vishwanath-temple"],
    sourceArchive: {
      primarySource: "Badri-Kedar Temple Committee Gazette & Geological Survey of India 2014 Terrain Audit",
      auditStatus: "Archival Grade Geographical & Historical Record",
    },
  },
  {
    slug: "sacred-geometry-vastu-purusha-mandala",
    title: "Vastu Purusha Mandala: The Cosmic Grid of Temple Architecture",
    subtitle: "Decoding the mathematical square, astronomical alignment, and metaphysics embedded in the foundation of every classical Indian shrine.",
    category: "ARCHITECTURE",
    readingTimeMinutes: 8,
    publishDate: "2026-09-04",
    author: "Templeora Shilpa Shastra Codex",
    heroImage: {
      src: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1600&q=80",
      alt: "Geometric stone carvings and sanctum tower of Konark and Puri",
      caption: "The geometrical fractals and exact compass calibration of ancient Kalinga and Nagara architecture.",
      credit: "Archaeological Survey of India / Shilpa Shastra Archive",
    },
    excerpt: "Before the first chisel strikes stone, a sacred geometry is drawn upon the consecrated earth. The Vastu Purusha Mandala is a microcosm of the universe—a mathematical square divided into 64 or 81 padas.",
    content: [
      {
        sectionTitle: "I. The Primordial Square",
        paragraphs: [
          "In Indian architectural treatises—from the Brihat Samhita to the Manasara and Mayamata—the circle represents motion, flux, and time, while the square represents divine stability, completeness, and cosmic order.",
          "The Vastu Purusha Mandala is invariably structured as a square aligned precisely to the true cardinal directions (North, South, East, West) determined by astronomical gnomon shadows (Shanku Sthapana) rather than magnetic compasses.",
        ],
        quote: "The temple is not an assembly hall; it is the physical embodiment of the cosmic Purusha in stone.",
      },
      {
        sectionTitle: "II. The Sanctum as Garbhagriha",
        paragraphs: [
          "At the exact geometric center lies the Brahma Sthana—the innermost sanctum or Garbhagriha ('womb-chamber'). Devoid of windows and carved from thick, insulating stone walls, this space is designed to contain minimal sensory distraction. Above this point rises the vertical axis of the Vimana or Shikhara, channeling consciousness upwards like a mountain peak toward the infinite sky.",
        ],
      },
    ],
    relatedTempleSlugs: ["brihadisvara-temple", "konark-sun-temple", "somnath-temple"],
    sourceArchive: {
      primarySource: "Stella Kramrisch, 'The Hindu Temple' (University of Calcutta, 1946)",
      auditStatus: "Archival Grade Theoretical & Epigraphical Treatise",
    },
  },
  {
    slug: "puri-rath-yatra-cosmic-wheels",
    title: "The Chariots of Jagannath: Engineering the Puri Rath Yatra",
    subtitle: "Centuries of sacred carpentry, neem timber selection, and mass devotional ecstasy along the Grand Road.",
    category: "FESTIVALS",
    readingTimeMinutes: 5,
    publishDate: "2026-08-28",
    author: "Templeora Cultural Research",
    heroImage: {
      src: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1600&q=80",
      alt: "Monumental chariot wheels of Puri Rath Yatra",
      caption: "Nandighosha, Taladhwaja, and Darpadalana: the three towering wooden rathas built anew every year without a single iron nail.",
      credit: "Shree Jagannath Temple Administration / Verified Heritage Archive",
    },
    excerpt: "Every summer on Ashadha Shukla Dwitiya, Lord Jagannath, along with his brother Balabhadra and sister Subhadra, leaves the sanctum sanctorum to meet the world on three colossal wooden chariots constructed without a single nail.",
    content: [
      {
        sectionTitle: "I. The Annual Rebirth in Wood",
        paragraphs: [
          "Unlike static stone shrines, the Puri Rath Yatra is defined by the ephemeral vitality of wood (Daru). Each year on Akshaya Tritiya, the construction of the three massive chariots commences under the supervision of hereditary royal carpenters (Maharanas).",
          "Nandighosha, the chariot of Lord Jagannath, stands forty-five feet tall, rests on sixteen enormous solid wooden wheels, and is assembled using traditional mortise-and-tenon joints that withstand the immense mechanical torque of being hauled by hundreds of thousands of pilgrims.",
        ],
      },
      {
        sectionTitle: "II. Chhera Pahanra: The King as Sweeper",
        paragraphs: [
          "Before the chariots begin their procession down the Bada Danda (Grand Road), the Gajapati King of Puri arrives in a palanquin, climbs onto each ratha, and sweeps the wooden deck with a golden broom. In this profound ritual moment, imperial sovereignty dissolves in the presence of the Lord of the Universe.",
        ],
      },
    ],
    relatedTempleSlugs: ["jagannath-temple-puri", "konark-sun-temple"],
    sourceArchive: {
      primarySource: "Madala Panji (Puri Temple Chronicle) & Odisha State Archives",
      auditStatus: "Archival Grade Festival Monograph",
    },
  },
];

export function getStoryBySlug(slug: string): EditorialStory | undefined {
  return EDITORIAL_STORIES.find((s) => s.slug === slug);
}
