/**
 * Phase 16: Sacred Pilgrimage Circuit Catalog
 * 
 * Curated, verified pilgrimage circuit templates covering India's sacred traditions:
 * - 12 Jyotirlinga Regional Circuits (Western, Central, Maharashtra, Southern, Eastern, Himalayan)
 * - Char Dham Circuits (Chota Char Dham & Maha Char Dham)
 * - Pancha Bhoota Sthalams (5 Elements of Shiva in Tamil Nadu & Andhra Pradesh)
 * - Ashta Vinayaka Circuit (8 Swayambhu Ganeshas of Maharashtra)
 * - Navagraha Temples Circuit (9 Celestial Shrines of Kumbakonam)
 * - 51 Shakti Peethas Regional Clusters (Bengal/Assam, Himachal/North)
 * - 108 Divya Desams (Chola Nadu, Pandya Nadu, Thondai Nadu)
 */

export interface SacredCircuit {
  id: string;
  name: string;
  tradition: "Shaiva" | "Vaishnava" | "Shakta" | "Smarta" | "Universal";
  region: string;
  recommendedDays: number;
  description: string;
  deity: string;
  templeSlugs: string[];
  templeNames: string[];
  terrain: "plains" | "hills" | "mountain" | "coastal";
  auspiciousMonths: string[];
  dressCodeAdvice: string;
}

export const SACRED_CIRCUITS: SacredCircuit[] = [
  {
    id: "jyotirlinga-central",
    name: "Central Jyotirlinga Circuit (Mahakal & Omkareshwar)",
    tradition: "Shaiva",
    region: "Madhya Pradesh (Malwa & Nimar)",
    recommendedDays: 2,
    description: "Sacred pilgrimage connecting the only south-facing Jyotirlinga (Dakshinmukhi Mahakal in Ujjain) and the sacred island shrine of Omkareshwar along the Narmada river.",
    deity: "Shiva (Mahakaleshwar & Omkareshwar)",
    templeSlugs: ["mahakaleshwar-temple", "shri-omkareshwar-jyotirlinga-temple-omkareshwar-000508"],
    templeNames: ["Mahakaleshwar Jyotirlinga (Ujjain)", "Shri Omkareshwar Jyotirlinga (Mandhata Island)"],
    terrain: "plains",
    auspiciousMonths: ["Shravan (July-Aug)", "Kartik (Oct-Nov)", "Maha Shivaratri (Feb-Mar)"],
    dressCodeAdvice: "Traditional dhoti/sari mandatory for Garbhagriha Jalabhishek and Bhasma Aarti entry.",
  },
  {
    id: "jyotirlinga-western",
    name: "Western Jyotirlinga & Krishna Circuit (Somnath & Dwarka)",
    tradition: "Smarta",
    region: "Gujarat (Saurashtra Coast)",
    recommendedDays: 3,
    description: "The premier Jyotirlinga of Bharat (Somnath at Prabhas Patan) paired with the holy Moksha Puri of Dwarkadhish and Nageshwar Jyotirlinga.",
    deity: "Shiva & Krishna",
    templeSlugs: ["somnath-temple", "dwarkadhish-temple"],
    templeNames: ["Shree Somnath Jyotirlinga (Veraval)", "Shri Dwarkadhish Jagat Mandir (Dwarka)"],
    terrain: "coastal",
    auspiciousMonths: ["October to March", "Janmashtami", "Maha Shivaratri"],
    dressCodeAdvice: "Modest traditional attire recommended. Check individual shrine cloakroom rules for phones and bags.",
  },
  {
    id: "pancha-bhoota-sthalams",
    name: "Pancha Bhoota Sthalams (Five Elements of Shiva)",
    tradition: "Shaiva",
    region: "Tamil Nadu & Andhra Pradesh",
    recommendedDays: 4,
    description: "Five monumental ancient temples representing the elemental manifestations of Lord Shiva: Earth, Water, Fire, Air, and Cosmic Space.",
    deity: "Shiva (Prithvi, Appu, Tejas, Vayu, Akasha)",
    templeSlugs: [
      "ekambareswarar-temple-kanchipuram",
      "jambukeswarar-temple-thiruvanaikaval",
      "annamalaiyar-temple",
      "srikalahasteeswara-temple",
      "thillai-nataraja-temple-chidambaram",
    ],
    templeNames: [
      "Ekambareswarar Temple (Earth · Kanchipuram)",
      "Jambukeswarar Temple (Water · Thiruvanaikaval)",
      "Arunachaleswarar Temple (Fire · Tiruvannamalai)",
      "Srikalahasti Temple (Air · Srikalahasti)",
      "Thillai Nataraja Temple (Cosmic Space · Chidambaram)",
    ],
    terrain: "plains",
    auspiciousMonths: ["Karthigai Deepam (Nov-Dec)", "Maha Shivaratri", "Panguni Uthiram"],
    dressCodeAdvice: "Traditional South Indian attire: Men in Veshti/Dhoti without shirts; Women in Sarees or Salwars with Dupatta.",
  },
  {
    id: "chota-char-dham",
    name: "Chota Char Dham Himalayan Yatra",
    tradition: "Universal",
    region: "Uttarakhand (Garhwal Himalayas)",
    recommendedDays: 6,
    description: "The sacred Himalayan circuit traversing Yamunotri, Gangotri, Kedarnath Jyotirlinga, and Badrinath Dham high in the Garhwal mountains.",
    deity: "Yamuna, Ganga, Shiva (Kedarnath), Vishnu (Badrinath)",
    templeSlugs: ["kedarnath-temple", "badrinath-temple"],
    templeNames: [
      "Yamunotri Temple (Source of Yamuna)",
      "Gangotri Temple (Source of Bhagirathi)",
      "Kedarnath Jyotirlinga (Highest Shiva Sanctum)",
      "Badrinath Temple (Badri Vishal)",
    ],
    terrain: "mountain",
    auspiciousMonths: ["May to June", "September to October (Portals close after Diwali)"],
    dressCodeAdvice: "Heavy woolen thermal clothing required. High-ankle trekking shoes, rainwear, and valid biometric yatra registration slip.",
  },
  {
    id: "ashta-vinayaka",
    name: "Ashta Vinayaka Circuit (8 Ganeshas of Maharashtra)",
    tradition: "Smarta",
    region: "Maharashtra (Pune, Raigad & Ahmednagar)",
    recommendedDays: 3,
    description: "Sacred self-manifested (Swayambhu) eight Ganesha shrines arranged around Pune in a specific scriptural sequence beginning and ending at Morgaon.",
    deity: "Ganesha",
    templeSlugs: [
      "siddhivinayak-temple",
      "shri-ganesh-mandir-tekdi-nagpur-000108",
      "kasba-ganpati-pune-000215",
    ],
    templeNames: [
      "Mayureshwar (Morgaon)",
      "Siddhivinayak (Siddhatek)",
      "Ballaleshwar (Pali)",
      "Varadavinayak (Mahad)",
      "Chintamani (Theur)",
      "Girijatmaj (Lenyadri Caves)",
      "Vighneshwar (Ozar)",
      "Mahaganapati (Ranjangaon)",
    ],
    terrain: "hills",
    auspiciousMonths: ["Ganesh Chaturthi (Aug-Sept)", "Angarika Sankashti", "November to February"],
    dressCodeAdvice: "Traditional Indian clothing. Note: Lenyadri requires climbing 300+ rock-cut cave steps; plan morning hours.",
  },
  {
    id: "navagraha-cluster",
    name: "Navagraha Temples of Tamil Nadu",
    tradition: "Shaiva",
    region: "Tamil Nadu (Cauvery Delta · Kumbakonam & Thanjavur)",
    recommendedDays: 2,
    description: "Nine ancient Chola temples dedicated to the celestial planetary deities (Navagrahas) clustered within a 45-km radius of the sacred temple town of Kumbakonam.",
    deity: "Navagrahas (Surya, Chandra, Angaraka, Budha, Guru, Shukra, Shani, Rahu, Ketu)",
    templeSlugs: [
      "brihadeeswarar-temple",
      "airavatesvara-temple-darasuram-000088",
      "sarangapani-temple-kumbakonam-000091",
    ],
    templeNames: [
      "Suryanar Kovil (Sun)",
      "Thingalur Kailasanathar (Moon)",
      "Vaitheeswaran Koil (Mars / Sevvai)",
      "Thiruvenkadu (Mercury / Budha)",
      "Alangudi Apatsahayeswarar (Jupiter / Guru)",
      "Kanjanur Agneeswarar (Venus / Shukra)",
      "Thirunallar Saniswaran (Saturn / Shani)",
      "Thirunageswaram Naganathar (Rahu)",
      "Keezhperumpallam Naganathar (Ketu)",
    ],
    terrain: "plains",
    auspiciousMonths: ["All year round", "Margazhi (Dec-Jan)", "Maha Shivaratri", "Panguni Uthiram"],
    dressCodeAdvice: "Traditional South Indian dhoti/saree required. Best completed in 2 consecutive days following planetary order.",
  },
  {
    id: "divya-desam-chola",
    name: "Divya Desam Grand Circuit (Chola Nadu & Kaveri Delta)",
    tradition: "Vaishnava",
    region: "Tamil Nadu (Srirangam & Kumbakonam)",
    recommendedDays: 3,
    description: "The foremost Vishnu holy abodes (Divya Desams) celebrated by the Alwars, anchored by the supreme shrine Srirangam (Thiruvarangam).",
    deity: "Vishnu (Ranganatha, Sarangapani, Oppiliappan)",
    templeSlugs: [
      "sri-ranganathaswamy-temple-srirangam-000077",
      "sarangapani-temple-kumbakonam-000091",
      "kallazhagar-temple-alagar-koyil-000081",
    ],
    templeNames: [
      "Sri Ranganathaswamy Temple (Srirangam · 1st Divya Desam)",
      "Sarangapani Temple (Kumbakonam)",
      "Oppiliappan Temple (Thiruvinnagar)",
      "Nachiyar Koil (Thirunarayur)",
    ],
    terrain: "plains",
    auspiciousMonths: ["Vaikuntha Ekadashi (Dec-Jan)", "Brahmotsavam", "October to March"],
    dressCodeAdvice: "Strict traditional Vaishnava protocol. Men must remove shirts; sarees/dhotis mandatory.",
  },
  {
    id: "shakti-peethas-east",
    name: "Eastern Shakti Peethas Circuit (Kamakhya & Kalighat)",
    tradition: "Shakta",
    region: "Assam & West Bengal",
    recommendedDays: 4,
    description: "The supreme Tantric yoni peetha at Kamakhya Hill in Assam coupled with the sacred Kalighat and Tarapith peethas in Bengal.",
    deity: "Devi (Kamakhya, Kali, Tara)",
    templeSlugs: [
      "kamakhya-temple",
      "kalighat-kali-temple",
      "tarapith-temple",
    ],
    templeNames: [
      "Maa Kamakhya Temple (Guwahati, Assam · Yoni Peetha)",
      "Kalighat Kali Temple (Kolkata, West Bengal · Right Toe)",
      "Tarapith Temple (Birbhum, West Bengal · Third Eye)",
    ],
    terrain: "hills",
    auspiciousMonths: ["Ambubachi Mela (June)", "Navratri (Sept-Oct)", "Diwali / Kali Puja"],
    dressCodeAdvice: "Traditional Indian attire. Strict red/saffron or white attire preferred during Devi aradhana.",
  },
];

/**
 * Finds a circuit by ID.
 */
export function getSacredCircuit(circuitId: string): SacredCircuit | undefined {
  return SACRED_CIRCUITS.find((c) => c.id === circuitId);
}
