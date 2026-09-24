"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, MapPin, Waves, Mountain, Trees, Clock } from "lucide-react";
import { Container } from "@/components/ui";

/* -------------------------------------------------------------------------- */
/* Chapter: India Is Calling (Section 14 Breathing Transition)                */
/* -------------------------------------------------------------------------- */

export function IndiaIsCalling() {
  return (
    <section className="relative py-28 md:py-40 bg-[#090705] overflow-hidden border-t border-stone-800/60">
      {/* Subtle radial ambient warmth */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] bg-radial from-[#C8A24B]/10 via-transparent to-transparent blur-3xl" />

      <Container className="relative z-10 text-center max-w-4xl mx-auto">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C8A24B]">
          The Call of Bharat
        </span>

        <h2 className="mt-6 font-serif text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#F2ECE1] leading-[1.12]">
          Millions of journeys.
          <br />
          <span className="bg-gradient-to-r from-[#F2ECE1] via-[#E4BE72] to-[#C8A24B] bg-clip-text text-transparent">
            Thousands of sacred places.
          </span>
          <br />
          One India.
        </h2>

        <p className="mt-8 max-w-2xl mx-auto font-sans text-sm sm:text-base md:text-lg leading-relaxed text-stone-300">
          Across two millennia, sacred architecture has served as India&apos;s living memory.
          Every carved stone pillar records a prayer; every river confluence gathers generations of pilgrims.
          Templeora maps this sacred continuum with verified geographic precision.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-8 py-3.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#0C0907] transition-all hover:bg-[#E4BE72] shadow-lg shadow-[#C8A24B]/20"
          >
            <span>Explore Geographic Atlas</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-7 py-3.5 text-xs font-mono uppercase tracking-wider text-stone-200 transition-colors hover:border-[#C8A24B] hover:text-[#F2ECE1]"
          >
            <MapPin className="h-3.5 w-3.5 text-[#C8A24B]" />
            <span>Interactive Map</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Chapter: The Sacred Landscape (Section 21 "The Temple is Part of a Place") */
/* -------------------------------------------------------------------------- */

const LANDSCAPES = [
  {
    title: "Gangetic River Sanctums",
    region: "Uttar Pradesh & Bihar",
    ecology: "Sacred River Ganga & Ancient Confluences",
    desc: "Sanctuaries conceived where glacial rivers meet timeless stone ghats, harmonizing daily aartis with cosmological geometry.",
    icon: Waves,
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
    shrine: "Kashi Vishwanath, Varanasi",
    href: "/temples/uttar-pradesh/kashi-vishwanath-temple",
  },
  {
    title: "Himalayan Ridge Altars",
    region: "Garhwal & Kumaon, Uttarakhand",
    ecology: "High-Altitude Glacial Valleys (3,500m+)",
    desc: "Monolithic grey granite sanctuaries nestled beneath towering snowfields, guarded by sacred alpine forests and mountain passes.",
    icon: Mountain,
    image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80",
    shrine: "Kedarnath Temple, Rudraprayag",
    href: "/temples/uttarakhand/kedarnath-temple",
  },
  {
    title: "Seshachalam Forest Enclaves",
    region: "Eastern Ghats, Andhra Pradesh",
    ecology: "Sacred Red Sanders Canopy & Seven Hills",
    desc: "Ancient forested peaks forming the mythical coiled body of Adisesha, housing monumental gold-gilded sanctums in sacred valleys.",
    icon: Trees,
    image: "https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=1200&q=80",
    shrine: "Sri Venkateswara Temple, Tirumala",
    href: "/temples/andhra-pradesh/sri-venkateswara-temple",
  },
];

export function SacredLandscape() {
  return (
    <section className="relative py-28 md:py-36 bg-[#0B0907] overflow-hidden border-t border-stone-800/70">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-800/80 pb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Sacred Geography · Ecological Context
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl md:text-5xl">
              The Temple is Part of a Sacred Landscape
            </h2>
            <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
              In traditional Indian architectural treatises (Agama &amp; Shilpa Shastra), a temple does not exist in isolation.
              It is anchored to rivers, mountain ridges, sacred trees, and solar solstices.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <Compass className="h-4 w-4 text-[#C8A24B]" />
            <span>Topographical Integration</span>
          </div>
        </div>

        {/* 3 Asymmetrical Landscape Spreads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LANDSCAPES.map((item) => (
            <div
              key={item.title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-800/80 bg-stone-950 p-6 transition-all duration-500 hover:border-[#C8A24B]/50 hover:shadow-2xl"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.88]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-[10.5px] font-mono text-stone-200 border border-stone-700/60 backdrop-blur-md">
                  <item.icon className="h-3 w-3 text-[#C8A24B]" />
                  <span>{item.region}</span>
                </div>
              </div>

              <div className="mt-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#C8A24B]">
                    {item.ecology}
                  </span>
                  <h3 className="mt-2 font-serif text-xl font-medium text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-stone-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 border-t border-stone-800/80 pt-4 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-stone-400 truncate">
                    Exemplar: <span className="text-stone-200">{item.shrine}</span>
                  </span>
                  <Link
                    href={item.href}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-700 text-[#C8A24B] transition-colors hover:border-[#C8A24B] hover:bg-[#C8A24B] hover:text-black shrink-0"
                    aria-label={`View ${item.shrine}`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Chapter: Sacred Routes & Corridors (Section 39 Multi-Temple Journeys)     */
/* -------------------------------------------------------------------------- */

const SACRED_ROUTES = [
  {
    name: "The Great Living Chola Corridor",
    region: "Cauvery Delta, Tamil Nadu",
    stops: [
      { name: "Brihadeeswarar Temple", loc: "Thanjavur" },
      { name: "Gangaikonda Cholapuram", loc: "Jayankondam" },
      { name: "Airavatesvara Temple", loc: "Darasuram" },
    ],
    duration: "2 Days",
    distance: "115 km",
    theme: "UNESCO Granite Monoliths & Chola Bronze Heritage",
    href: "/temples/tamil-nadu/brihadeeswarar-temple",
  },
  {
    name: "The First Jyotirlinga Ocean Trail",
    region: "Kathiawar Peninsula, Gujarat",
    stops: [
      { name: "Somnath Jyotirlinga", loc: "Prabhas Patan" },
      { name: "Bhalka Tirtha", loc: "Veraval" },
      { name: "Dwarkadhish Temple", loc: "Dwarka" },
    ],
    duration: "3 Days",
    distance: "235 km",
    theme: "Coastal Jyotirlinga & Sacred Krishna Corridors",
    href: "/temples/gujarat/somnath-temple",
  },
  {
    name: "The Himalayan Mandakini Pilgrimage",
    region: "Garhwal Himalayas, Uttarakhand",
    stops: [
      { name: "Haridwar Ganga Ghats", loc: "Haridwar" },
      { name: "Rudraprayag Sangam", loc: "Rudraprayag" },
      { name: "Kedarnath Jyotirlinga", loc: "Kedarnath" },
    ],
    duration: "4 Days",
    distance: "240 km",
    theme: "Sacred River Sangams & High-Altitude Jyotirlinga",
    href: "/temples/uttarakhand/kedarnath-temple",
  },
];

export function SacredRoutes() {
  return (
    <section className="relative py-28 md:py-36 bg-[#0E0B08] overflow-hidden border-t border-stone-800/80">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-800/80 pb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Sacred Corridors · Pilgrimage Itineraries
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl md:text-5xl">
              Curated Pilgrimage Corridors
            </h2>
            <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
              India&apos;s sacred journeys are historically linked in coherent circuits.
              Travel through documented corridors with realistic road pacing, darshan windows, and seasonal guidance.
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-5 py-2.5 text-xs font-mono tracking-wider uppercase text-stone-300 transition-all hover:border-[#C8A24B] hover:text-[#F2ECE1] shrink-0"
          >
            <span>Custom Yatra Planner</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#C8A24B]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {SACRED_ROUTES.map((route) => (
            <div
              key={route.name}
              className="relative flex flex-col justify-between rounded-3xl border border-stone-800/80 bg-stone-950/70 p-7 backdrop-blur-sm transition-all duration-300 hover:border-[#C8A24B]/50 hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#C8A24B] border-b border-stone-800/60 pb-3">
                  <span>{route.region}</span>
                  <div className="flex items-center gap-3 text-stone-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#C8A24B]" />{route.duration}</span>
                    <span>•</span>
                    <span>{route.distance}</span>
                  </div>
                </div>

                <h3 className="mt-4 font-serif text-2xl font-medium text-[#F2ECE1] leading-snug">
                  {route.name}
                </h3>
                <p className="mt-2 text-xs font-mono text-stone-400">
                  {route.theme}
                </p>

                {/* Route Waypoints Sequence */}
                <div className="mt-6 space-y-3">
                  {route.stops.map((stop, idx) => (
                    <div key={stop.name} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C8A24B]/15 text-[10px] font-mono font-semibold text-[#E4BE72] border border-[#C8A24B]/30">
                        0{idx + 1}
                      </span>
                      <div className="truncate">
                        <span className="font-serif text-[13px] text-stone-200 block truncate">{stop.name}</span>
                        <span className="text-[10.5px] font-mono text-stone-500">{stop.loc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-stone-800/80 pt-4 flex items-center justify-between">
                <Link
                  href={route.href}
                  className="text-xs font-mono text-[#C8A24B] hover:text-[#E4BE72] transition-colors flex items-center gap-1.5"
                >
                  <span>Explore Corridor Anchor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[11px] font-mono text-stone-500">Verified Circuit</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Chapter: Beyond the Famous (Sections 51, 52 Lesser-Known Architecture)     */
/* -------------------------------------------------------------------------- */

const HIDDEN_GEMS = [
  {
    name: "Veerabhadra Temple, Lepakshi",
    state: "Andhra Pradesh",
    era: "16th-Century Vijayanagara Dynasty",
    highlight: "Famous for the monolithic hanging pillar and colossal Nandi carved from a single granite boulder.",
    href: "/temples",
  },
  {
    name: "Chennakeshava Temple, Belur",
    state: "Karnataka",
    era: "12th-Century Hoysala Architecture",
    highlight: "Intricately carved soapstone filigree with bracket figures (Madanikas) representing celestial dancers.",
    href: "/temples",
  },
  {
    name: "Martand Sun Temple",
    state: "Jammu and Kashmir",
    era: "8th-Century Karkota Dynasty",
    highlight: "Colossal stone colonnades combining classical Kashmiri architecture with Greco-Roman influences overlooking the Kashmir valley.",
    href: "/temples",
  },
  {
    name: "Bhojpur Shiva Temple",
    state: "Madhya Pradesh",
    era: "11th-Century Paramara Dynasty",
    highlight: "Unfinished monolithic sanctuary commissioned by Raja Bhoj housing a colossal 7.5-foot monolithic Shiva lingam.",
    href: "/temples",
  },
];

export function BeyondTheFamous() {
  return (
    <section className="relative py-28 md:py-36 bg-[#090705] overflow-hidden border-t border-stone-800/70">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-800/80 pb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Hidden Heritage · Beyond The Crowds
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl md:text-5xl">
              Beyond the Famous: Architectural Marvels
            </h2>
            <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
              India holds thousands of ancient sanctuaries away from mainstream tourist circuits — monumental stone carvings,
              isolated temple fortresses, and forgotten dynastic capitals.
            </p>
          </div>
          <Link
            href="/temples"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-5 py-2.5 text-xs font-mono tracking-wider uppercase text-stone-300 transition-all hover:border-[#C8A24B] hover:text-[#F2ECE1] shrink-0"
          >
            <span>All 2,205 Sanctuaries</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#C8A24B]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIDDEN_GEMS.map((gem) => (
            <div
              key={gem.name}
              className="flex flex-col justify-between rounded-2xl border border-stone-800/80 bg-stone-950/70 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#C8A24B]/40 hover:-translate-y-1"
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C8A24B]">
                  {gem.state}
                </span>
                <h4 className="mt-2 font-serif text-lg font-medium text-[#F2ECE1] leading-snug">
                  {gem.name}
                </h4>
                <p className="mt-1 text-[11px] font-mono text-stone-400">
                  {gem.era}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-stone-300 line-clamp-3">
                  {gem.highlight}
                </p>
              </div>

              <div className="mt-6 border-t border-stone-800/80 pt-3">
                <Link
                  href={gem.href}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C8A24B] hover:text-[#E4BE72] transition-colors"
                >
                  <span>Explore Monument</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
