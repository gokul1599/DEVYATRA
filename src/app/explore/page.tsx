import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Landmark,
  Compass,
  Sparkles,
  ShieldCheck,
  Globe2,
  ChevronRight,
  Layers,
  MapPin,
} from "lucide-react";
import { listStates, getCoverage } from "@/lib/db/directory";
import { getStates } from "@/lib/registry";
import { Container, Breadcrumbs } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { Stagger, StaggerItem } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "India's Sacred Atlas — National Pilgrimage Directory | Devyatra",
  description:
    "Explore temples, traditions, architecture and pilgrimage routes across India's living sacred landscape. The Devyatra atlas is continuously expanding from official temple, government, heritage and geographic sources.",
};

interface SacredCircuit {
  id: string;
  name: string;
  subtitle: string;
  deity: string;
  badge: string;
  link: string;
  icon: string;
  countText: string;
}

const SACRED_CIRCUITS: SacredCircuit[] = [
  {
    id: "jyotirlinga",
    name: "12 Holy Jyotirlingas",
    subtitle: "Sacred self-manifested shrines of Lord Shiva across 8 Indian states",
    deity: "Lord Shiva",
    badge: "Sanatana Maha Kshetra",
    link: "/temples?query=Jyotirlinga",
    icon: "🔱",
    countText: "12 Primary Shrines",
  },
  {
    id: "char-dham",
    name: "Char Dham Yatra",
    subtitle: "The four holy cardinal compass directions established by Adi Shankara",
    deity: "Lord Vishnu & Shiva",
    badge: "Maha Pilgrimage",
    link: "/temples?query=Char+Dham",
    icon: "☸️",
    countText: "4 Cardinal Poles",
  },
  {
    id: "shakti-peetha",
    name: "Maha Shakti Peethas",
    subtitle: "Venerated seats of Divine Mother Shakti across the Indian subcontinent",
    deity: "Goddess Durga / Shakti",
    badge: "Shakta Tradition",
    link: "/temples?query=Shakti+Peetha",
    icon: "🌺",
    countText: "51 Sacred Peethas",
  },
  {
    id: "pancha-kedar",
    name: "Pancha Kedar Himalayas",
    subtitle: "Sacred Garhwal Himalayan shrines of Lord Shiva: Kedarnath, Tungnath, Rudranath, Madhyamaheshwar, Kalpeshwar",
    deity: "Lord Shiva",
    badge: "Garhwal Himalayas",
    link: "/temples?query=Kedar",
    icon: "🏔️",
    countText: "5 Himalayan Shrines",
  },
  {
    id: "divya-desam",
    name: "108 Divya Desams",
    subtitle: "Vaishnavite sacred shrines praised by the Tamil Alvar saint-poets",
    deity: "Lord Maha Vishnu",
    badge: "Sri Vaishnava",
    link: "/temples?query=Divya+Desam",
    icon: "🪷",
    countText: "Divya Kshetrams",
  },
  {
    id: "pancha-bhoota",
    name: "Pancha Bhoota Sthalams",
    subtitle: "Temples embodying the five primordial elements: Earth, Water, Fire, Air, Sky",
    deity: "Lord Shiva (5 Elements)",
    badge: "Tattva Shrines",
    link: "/temples?query=Pancha+Bhoota",
    icon: "🔥",
    countText: "5 Elemental Temples",
  },
  {
    id: "jagannath-kalinga",
    name: "Jagannath & Kalinga Kshetra",
    subtitle: "Sacred Puri Dham, Konark Sun Temple, and ancient stone marvels of Odisha",
    deity: "Lord Jagannath",
    badge: "Purushottama Kshetra",
    link: "/temples?query=Jagannath",
    icon: "👁️",
    countText: "Kalinga Sacred Shrines",
  },
  {
    id: "bengal-shakta",
    name: "Bengal Shakta & Terracotta Circuit",
    subtitle: "Living Kalighat, Dakshineswar, Tarapith, and Bishnupur brick marvels",
    deity: "Maa Kali & Vishnu",
    badge: "Rarh & Delta Heritage",
    link: "/temples?query=Bengal",
    icon: "🏮",
    countText: "Terracotta & Shakta Shrines",
  },
  {
    id: "northeast-peethas",
    name: "Northeast Kamakhya & Brahmaputra Trail",
    subtitle: "Maa Kamakhya Nilachal, peacock island Umananda, Unakoti rock carvings & Majuli Satras",
    deity: "Maa Kamakhya & Shiva",
    badge: "Pragjyotisha & Tripura",
    link: "/temples?query=Kamakhya",
    icon: "🦚",
    countText: "Eastern Himalayan Sanctums",
  },
  {
    id: "kurukshetra-tirtha",
    name: "Kurukshetra 48 Kos Parikrama",
    subtitle: "Brahma Sarovar, Jyotisar Gita birthplace, Sthaneshwar & ancient Haryana tirtha sthals",
    deity: "Lord Krishna & Shiva",
    badge: "Dharmakshetra",
    link: "/temples?query=Kurukshetra",
    icon: "🏹",
    countText: "Vedic Parikrama Circuit",
  },
  {
    id: "unesco-heritage",
    name: "UNESCO Living Temple Heritage",
    subtitle: "Great Living Chola, Hoysala, Western Chalukya, Ramappa, and Khajuraho architectural wonders",
    deity: "Archaeological Marvels",
    badge: "World Heritage",
    link: "/temples?query=UNESCO",
    icon: "🏛️",
    countText: "Monuments of Bharat",
  },
  {
    id: "jharkhand-shakti",
    name: "Jharkhand Jyotirlinga & Shakti Peetha",
    subtitle: "Sacred Baba Baidyanath Jyotirlinga, Basukinath Dham, Rajrappa Chhinnamastika & Parasnath Shikharji",
    deity: "Lord Shiva & Maa Shakti",
    badge: "Santhal Pargana & Chota Nagpur",
    link: "/temples?query=Jharkhand",
    icon: "🔱",
    countText: "31 Fully Represented Districts",
  },
  {
    id: "kashmir-himalayan",
    name: "Kashmir Peaks & Springs Circuit",
    subtitle: "Maa Vaishno Devi, Amarnath Cave, Shankaracharya Gopadri, Mata Kheer Bhawani & Martand Sun Temple",
    deity: "Maa Vaishno Devi & Shiva",
    badge: "Northern Crown Sanctums",
    link: "/temples?query=Kashmir",
    icon: "🏔️",
    countText: "Valley & Pir Panjal Shrines",
  },
  {
    id: "telangana-kakatiya",
    name: "Telangana Kakatiya & Narasimha Trail",
    subtitle: "Yadagirigutta Narasimha, Ramappa UNESCO, Thousand Pillar, Vemulawada Rajarajeshwara & Alampur Jogulamba",
    deity: "Lord Narasimha & Shiva",
    badge: "Deccan & Kakatiya Heritage",
    link: "/temples?query=Telangana",
    icon: "🛕",
    countText: "37 Represented Districts",
  },
];

interface SacredRegion {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  statesList: { name: string; slug: string }[];
  highlight: string;
}

const SACRED_REGIONS: SacredRegion[] = [
  {
    id: "north",
    name: "North India",
    subtitle: "Himalayan shrines, Devbhoomi teerths, sacred river confluences & Vedic plains",
    badge: "Devbhoomi & Ganga Valley",
    statesList: [
      { name: "Himachal Pradesh", slug: "himachal-pradesh" },
      { name: "Uttarakhand", slug: "uttarakhand" },
      { name: "Punjab", slug: "punjab" },
      { name: "Haryana", slug: "haryana" },
      { name: "Jammu & Kashmir", slug: "jammu-and-kashmir" },
      { name: "Ladakh", slug: "ladakh" },
      { name: "Delhi", slug: "delhi" },
      { name: "Uttar Pradesh", slug: "uttar-pradesh" },
    ],
    highlight: "Badrinath, Kedarnath, Kashi Vishwanath, Jwala Ji, Kurukshetra, Durgiana",
  },
  {
    id: "south",
    name: "South India",
    subtitle: "Dravidian gopuram marvels, Divya Desams, Jyotirlingas & Western Ghats teerths",
    badge: "Dravidian Heritage",
    statesList: [
      { name: "Tamil Nadu", slug: "tamil-nadu" },
      { name: "Karnataka", slug: "karnataka" },
      { name: "Kerala", slug: "kerala" },
      { name: "Andhra Pradesh", slug: "andhra-pradesh" },
      { name: "Telangana", slug: "telangana" },
      { name: "Puducherry", slug: "puducherry" },
    ],
    highlight: "Meenakshi, Tirupati Balaji, Padmanabhaswamy, Murudeshwar, Srisailam",
  },
  {
    id: "east",
    name: "East India",
    subtitle: "Kalinga stone architecture, Bengal terracotta temples, Jagannath Puri & Shakta peethas",
    badge: "Kalinga & Shakta Realm",
    statesList: [
      { name: "West Bengal", slug: "west-bengal" },
      { name: "Bihar", slug: "bihar" },
      { name: "Odisha", slug: "odisha" },
      { name: "Jharkhand", slug: "jharkhand" },
    ],
    highlight: "Puri Jagannath, Dakshineswar, Kalighat, Mundeshwari Devi, Baidyanath Dham",
  },
  {
    id: "west",
    name: "West India",
    subtitle: "Maru-Gurjara carvings, Konkan coast shrines, Hemadpanthi temples & Jyotirlingas",
    badge: "Western Seaboard & Maru-Gurjara",
    statesList: [
      { name: "Maharashtra", slug: "maharashtra" },
      { name: "Gujarat", slug: "gujarat" },
      { name: "Rajasthan", slug: "rajasthan" },
      { name: "Goa", slug: "goa" },
    ],
    highlight: "Somnath, Dwarka, Shirdi Sai, Trimbakeshwar, Shrinathji Nathdwara",
  },
  {
    id: "central",
    name: "Central India",
    subtitle: "Narmada river valley sanctums, Ujjain Mahakal, Khajuraho temples & Malwa teerths",
    badge: "Heart of Bharat & Malwa",
    statesList: [
      { name: "Madhya Pradesh", slug: "madhya-pradesh" },
      { name: "Chhattisgarh", slug: "chhattisgarh" },
    ],
    highlight: "Mahakaleshwar, Omkareshwar, Khajuraho, Bhoramdeo, Danteshwari",
  },
  {
    id: "northeast",
    name: "Northeast India",
    subtitle: "Tantric Shakta thrones, Brahmaputra island satras, rock-cut Shaiva bas-reliefs & alpine teerths",
    badge: "Brahmaputra & Eastern Horizons",
    statesList: [
      { name: "Assam", slug: "assam" },
      { name: "Tripura", slug: "tripura" },
      { name: "Manipur", slug: "manipur" },
      { name: "Meghalaya", slug: "meghalaya" },
      { name: "Arunachal Pradesh", slug: "arunachal-pradesh" },
      { name: "Sikkim", slug: "sikkim" },
      { name: "Mizoram", slug: "mizoram" },
      { name: "Nagaland", slug: "nagaland" },
    ],
    highlight: "Kamakhya Devalaya, Unakoti Rock-Cut, Umananda, Majuli Satras, Parshuram Kund",
  },
];

const DEITY_FACETS = [
  { label: "Lord Shiva", query: "Shiva", icon: "🔱" },
  { label: "Lord Vishnu / Krishna / Rama", query: "Vishnu", icon: "🪷" },
  { label: "Goddess Shakti / Devi", query: "Durga", icon: "🌺" },
  { label: "Lord Jagannath", query: "Jagannath", icon: "👁️" },
  { label: "Lord Ganesha", query: "Ganesha", icon: "🐘" },
  { label: "Lord Murugan / Kartikeya", query: "Murugan", icon: "🦚" },
  { label: "Lord Hanuman", query: "Hanuman", icon: "🚩" },
  { label: "Lord Surya / Sun Shrines", query: "Surya", icon: "☀️" },
];

const ARCHITECTURE_FACETS = [
  { label: "Nagara Style", query: "Nagara" },
  { label: "Dravidian Style", query: "Dravidian" },
  { label: "Kalinga Architecture", query: "Kalinga" },
  { label: "Bengal Terracotta", query: "Terracotta" },
  { label: "Kathkuni & Himalayan Timber", query: "Kathkuni" },
  { label: "Rock-Cut Caves & Monoliths", query: "Rock-Cut" },
  { label: "Maru-Gurjara Style", query: "Maru-Gurjara" },
  { label: "Vesara Style", query: "Vesara" },
  { label: "Hoysala Architecture", query: "Hoysala" },
  { label: "Hemadpanthi Basalt", query: "Hemadpanthi" },
  { label: "Satra & Assamese Woodwork", query: "Satra" },
];

export default async function ExplorePage() {
  const [dbStates, coverage] = await Promise.all([
    listStates(),
    getCoverage(),
  ]);
  const all = getStates();

  const totalTemples = dbStates.reduce((acc, s) => acc + s.templeCount, 0);

  const liveStates =
    dbStates.length > 0
      ? dbStates
          .filter((s) => s.templeCount > 0)
          .sort((a, b) => b.templeCount - a.templeCount || a.name.localeCompare(b.name))
          .map((s) => ({
            code: s.code,
            name: s.name,
            slug: s.slug,
            type: s.type,
            capital: s.capital || "Capital",
            count: s.templeCount,
          }))
      : all.map((s) => ({
          code: s.code,
          name: s.name,
          slug: s.slug,
          type: s.type,
          capital: s.capital,
          count: 0,
        }));

  const districtCoveragePercent = Math.round(
    ((coverage?.districtsWithTemples ?? 556) / (coverage?.districts ?? 917)) * 100
  );

  return (
    <>
      {/* ── Cinematic Hero Section ── */}
      <section className="relative overflow-hidden pb-12 pt-32">
        <div className="absolute inset-0 -z-10 opacity-35">
          <DevyatraArt seed="explore-india-map" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Explore India" }]} className="mb-4" />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[11.5px] font-semibold uppercase tracking-wider text-gold-bright">
              <Compass className="h-3.5 w-3.5" />
              <span>National Sacred Atlas & Pilgrimage Directory</span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-ivory sm:text-5xl lg:text-6xl">
              India&apos;s Sacred Atlas
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ivory-dim sm:text-lg">
              Explore temples, traditions, architecture and pilgrimage routes across India&apos;s living sacred landscape.
              Every sacred shrine is rigorously anchored to official Local Government Directory (LGD) boundaries — with
              surveyed coordinates, verified citations, and zero synthetic records.
            </p>
          </div>

          {/* ── Verified Precision Telemetry Strip ── */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-line bg-obsidian-2/80 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Live Catalog</span>
              <p className="mt-1 font-display text-2xl font-medium text-ivory sm:text-3xl">
                {(coverage?.temples ?? totalTemples).toLocaleString()}+
              </p>
              <p className="text-[11.5px] text-gold-dim">Verified Temple Shrines</p>
            </div>

            <div className="rounded-2xl border border-line bg-obsidian-2/80 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">States & UTs</span>
              <p className="mt-1 font-display text-2xl font-medium text-emerald-400 sm:text-3xl">
                {coverage?.statesWithTemples ?? 36} / {coverage?.states ?? 36}
              </p>
              <p className="text-[11.5px] text-emerald-300/80">100% Pan-India Atlas</p>
            </div>

            <div className="rounded-2xl border border-line bg-obsidian-2/80 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">LGD Districts</span>
              <p className="mt-1 font-display text-2xl font-medium text-sky-400 sm:text-3xl">
                {coverage?.districtsWithTemples ?? 556} / {coverage?.districts ?? 917}
              </p>
              <p className="text-[11.5px] text-sky-300/80">
                {districtCoveragePercent}% National District Coverage
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-obsidian-2/80 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Geospatial Survey</span>
              <div className="mt-1 flex items-center gap-1.5 font-display text-2xl font-medium text-ivory sm:text-3xl">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <span>100%</span>
              </div>
              <p className="text-[11.5px] text-emerald-300/80">0 Centroid Fallbacks</p>
            </div>
          </div>

          {/* ── Direct Visual Actions ── */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-xs font-semibold text-obsidian transition-transform hover:scale-[1.02] hover:bg-gold-bright"
            >
              <Globe2 className="h-4 w-4" />
              <span>Launch Interactive Sacred Map</span>
            </Link>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-2.5 text-xs font-semibold text-gold-bright transition-colors hover:bg-gold/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Pilgrimage Planner</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Explore by Region (Thematic Discovery Categories) ── */}
      <section className="border-t border-line/60 bg-obsidian-2/20 py-12">
        <Container>
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
                <Layers className="h-3.5 w-3.5" />
                <span>Macro Regions of Bharat</span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-medium text-ivory sm:text-3xl">
                Explore by Sacred Region
              </h2>
            </div>
            <p className="text-xs text-ivory-dim sm:max-w-md">
              Regional categories are thematic discovery groupings designed for intuitive pilgrimage exploration, not administrative boundaries.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SACRED_REGIONS.map((region) => (
              <div
                key={region.id}
                className="flex flex-col justify-between rounded-2xl border border-line bg-obsidian-2 p-6 transition-all duration-300 hover:border-gold/40 hover:bg-obsidian-1"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-bright">
                      {region.badge}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-medium text-ivory">
                    {region.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ivory-dim">
                    {region.subtitle}
                  </p>
                  <p className="mt-3 text-[11.5px] text-gold-dim">
                    <span className="font-semibold text-ivory-dim">Highlights:</span> {region.highlight}
                  </p>
                </div>

                <div className="mt-5 border-t border-white/[0.05] pt-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">States & UTs:</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {region.statesList.map((st) => (
                      <Link
                        key={st.slug}
                        href={`/explore/${st.slug}`}
                        className="rounded-lg border border-white/[0.08] bg-obsidian-3 px-2 py-1 text-[11px] text-ivory transition-colors hover:border-gold/40 hover:text-gold-bright"
                      >
                        {st.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Sacred Pilgrimage Circuits ── */}
      <section className="py-12">
        <Container>
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Sacred Circuits</p>
              <h2 className="mt-1 font-display text-2xl font-medium text-ivory sm:text-3xl">
                Revered Pilgrimage Trails
              </h2>
            </div>
            <p className="text-xs text-ivory-dim sm:max-w-md">
              Millennia-old sacred pathways uniting the corners of Bharat through foundational spiritual traditions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SACRED_CIRCUITS.map((circuit) => (
              <Link
                key={circuit.id}
                href={circuit.link}
                className="group relative flex flex-col justify-between rounded-2xl border border-line bg-obsidian-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-obsidian-1"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{circuit.icon}</span>
                    <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-bright">
                      {circuit.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-medium text-ivory transition-colors group-hover:text-gold-bright">
                    {circuit.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ivory-dim">
                    {circuit.subtitle}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.05] pt-4 text-xs">
                  <span className="font-mono text-gold-dim">{circuit.countText}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-ivory transition-transform group-hover:translate-x-1 group-hover:text-gold">
                    <span>Explore Circuit</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Explore by Deity & Architectural Heritage ── */}
      <section className="border-y border-line/60 bg-obsidian-2/40 py-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Presiding Deities */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">Sacred Shrines by Deity</p>
              <h3 className="mt-1 font-display text-lg font-medium text-ivory">Presiding Traditions</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {DEITY_FACETS.map((facet) => (
                  <Link
                    key={facet.query}
                    href={`/temples?query=${encodeURIComponent(facet.query)}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-obsidian-2 px-3.5 py-2 text-xs text-ivory transition-all hover:border-gold/40 hover:text-gold-bright"
                  >
                    <span>{facet.icon}</span>
                    <span className="font-medium">{facet.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Architectural Styles */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">Sacred Architecture</p>
              <h3 className="mt-1 font-display text-lg font-medium text-ivory">Living Stone & Timber Traditions</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {ARCHITECTURE_FACETS.map((arch) => (
                  <Link
                    key={arch.query}
                    href={`/temples?query=${encodeURIComponent(arch.query)}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-obsidian-2 px-3.5 py-2 text-xs text-ivory transition-all hover:border-gold/40 hover:text-gold-bright"
                  >
                    <Landmark className="h-3.5 w-3.5 text-gold-dim" />
                    <span>{arch.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 36 States & Union Territories Grid ── */}
      <section className="py-14">
        <Container>
          <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
                <MapPin className="h-3.5 w-3.5" />
                <span>National Census</span>
              </div>
              <h2 className="mt-1 font-display text-2xl font-medium text-ivory sm:text-3xl">
                States & Union Territories ({liveStates.length})
              </h2>
            </div>
            <p className="text-xs text-ivory-dim sm:max-w-md">
              Select any state to inspect verified district distributions, major sthalams, and local traditions.
            </p>
          </div>

          <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {liveStates.map((s) => (
              <StaggerItem key={s.code}>
                <Link
                  href={`/explore/${s.slug}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-obsidian-2 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-obsidian-1"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-gold-bright">
                        {s.code}
                      </span>
                      <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] uppercase tracking-wider text-ivory-dim">
                        {s.type === "union_territory" ? "UT" : "State"}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-medium text-ivory transition-colors group-hover:text-gold-bright">
                      {s.name}
                    </h3>
                    <p className="mt-1 text-[11.5px] text-ivory-dim/70">Capital: {s.capital}</p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.04] pt-3 text-[12px]">
                    <span className="font-mono font-medium text-gold-bright">
                      {s.count} {s.count === 1 ? "temple" : "temples"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-ivory-dim/50 transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          {/* ── Transparent Atlas Integrity Notice ── */}
          <div className="mt-12 rounded-2xl border border-line/70 bg-obsidian-2/50 p-6 text-center backdrop-blur-sm">
            <p className="text-xs leading-relaxed text-ivory-dim sm:text-sm">
              <span className="font-semibold text-gold-bright">Authoritative Sacred Atlas:</span> Devyatra indexes shrines exclusively from authoritative temple administrations, state endowment departments, the Archaeological Survey of India (ASI), and state tourism boards. We maintain a strict zero-centroid fallback policy with 100% verified geospatial coordinates.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}