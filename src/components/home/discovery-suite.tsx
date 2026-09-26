"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
  Utensils,
  Landmark,
  Waves,
  Mountain,
} from "lucide-react";
import { Container } from "@/components/ui";
import { CATEGORY_METADATA, type DestinationCategory } from "@/lib/destinations/registry";

/* -------------------------------------------------------------------------- */
/* 01. Begin Your Journey — Visual Category Tiles                            */
/* -------------------------------------------------------------------------- */

const DISCOVERY_CATEGORIES: {
  category: DestinationCategory;
  name: string;
  count: string;
  image: string;
  href: string;
}[] = [
  {
    category: "SACRED",
    name: "Living Sanctuaries & Teerthams",
    count: "Verified Living Shrines",
    image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=sacred",
  },
  {
    category: "HERITAGE",
    name: "UNESCO & ASI Monuments",
    count: "3,690+ Protected Sites",
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=heritage",
  },
  {
    category: "CAVES",
    name: "Ancient Rock-Cut Caves",
    count: "Ajanta, Ellora, Badami & More",
    image: "https://images.unsplash.com/photo-1609137144820-2212a433a758?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=caves",
  },
  {
    category: "HILLS",
    name: "Mist Hills & Mountain Summits",
    count: "Western Ghats & Himalayas",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=hills",
  },
  {
    category: "LAKES",
    name: "Sacred Lakes & Lagoons",
    count: "Pangong, Dal, Loktak & Chilika",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=lakes",
  },
  {
    category: "WATERFALLS",
    name: "Perennial Waterfalls & Gorges",
    count: "Jog, Dudhsagar, Athirappilly",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=waterfalls",
  },
  {
    category: "BEACHES",
    name: "Sacred Coastlines & Sea Ghats",
    count: "7,500 km Ocean Frontier",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=beaches",
  },
  {
    category: "WILDLIFE",
    name: "Tiger Reserves & Wildlife",
    count: "106 National Sanctuaries",
    image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=wildlife",
  },
  {
    category: "CULTURE",
    name: "Royal Palaces & Living Arts",
    count: "Dynastic Architecture & Crafts",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=culture",
  },
  {
    category: "FOOD",
    name: "Temple Flavors & Bazaars",
    count: "Centuries of Culinary Heritage",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    href: "/map?category=food",
  },
];

export function BeginYourJourney() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0A0806] border-t border-stone-800/80">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 border-b border-stone-800/80 pb-8">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Discovery Continuum · All Dimensions of India
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#F2ECE1]">
              Begin Your Journey
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-sm md:text-base text-stone-300 leading-relaxed">
              Explore India beyond the single shrine. Connect sacred darshans with world heritage monuments,
              biodiverse mountain passes, pristine coastlines, and ancient culinary traditions.
            </p>
          </div>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/60 px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-stone-300 hover:border-[#C8A24B] hover:text-[#F2ECE1] transition-colors shrink-0"
          >
            <Compass className="h-4 w-4 text-[#C8A24B]" />
            <span>Open Multi-Layer Atlas</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {DISCOVERY_CATEGORIES.map((item) => {
            const meta = CATEGORY_METADATA[item.category];
            return (
              <Link
                key={item.category}
                href={item.href}
                className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 p-6 h-[260px] transition-all duration-500 hover:border-[#C8A24B]/60 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="absolute inset-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover brightness-[0.72] transition-transform duration-700 group-hover:scale-105 group-hover:brightness-[0.8]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-[#C8A24B] mb-1.5">
                    <span>{meta.icon}</span>
                    <span>{item.count}</span>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-mono text-stone-400 group-hover:text-stone-200 transition-colors">
                    <span>Explore on Atlas</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 02. Beyond the Temple — Complete Multi-Category Circuits                   */
/* -------------------------------------------------------------------------- */

const CIRCUITS = [
  {
    name: "The Madurai Classical Continuum",
    region: "Tamil Nadu",
    theme: "Temple + Palace + Teppakulam + Heritage Tiffin",
    stops: [
      { name: "Meenakshi Amman Temple", type: "Sacred Sanctum", distance: "0 km" },
      { name: "Thirumalai Nayakkar Mahal", type: "17th-c. Nayak Palace", distance: "1.4 km" },
      { name: "Vandiyur Teppakulam", type: "Sacred Tank & Mandapa", distance: "3.8 km" },
      { name: "Famous Jigarthanda & Murugan Idli", type: "Culinary Heritage", distance: "0.6 km" },
    ],
    duration: "1–2 Days",
    anchorHref: "/places/thirumalai-nayakkar-mahal-madurai",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "The Varanasi Living River Corridor",
    region: "Uttar Pradesh",
    theme: "Jyotirlinga + Ancient Ghats + Ganga Aarti + Kachori Gali",
    stops: [
      { name: "Kashi Vishwanath Jyotirlinga", type: "Sacred Sanctum", distance: "0 km" },
      { name: "Dashashwamedh & Manikarnika Ghats", type: "Riverfront Teertham", distance: "0.4 km" },
      { name: "Kachori Gali & Blue Lassi Chowk", type: "Culinary Heritage", distance: "0.3 km" },
      { name: "Sarnath Deer Park & Dhamek Stupa", type: "Ancient Heritage", distance: "10 km" },
    ],
    duration: "2–3 Days",
    anchorHref: "/places/kachori-gali-and-blue-lassi-varanasi",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "The Gokarna Sacred Headland & Surf",
    region: "Karnataka Coast",
    theme: "Atmalinga + Sanskrit Cliffs + Arabian Sea + Coastal Forest",
    stops: [
      { name: "Mahabaleshwar Atmalinga Temple", type: "Sacred Sanctum", distance: "0 km" },
      { name: "Kotiteertha Sacred Tank", type: "Holy Cleansing Teertham", distance: "0.5 km" },
      { name: "Om Beach Cliffside Trail", type: "Natural Coastal Formation", distance: "5.5 km" },
      { name: "Yana Karst Limestone Rocks", type: "Ecological Monoliths", distance: "45 km" },
    ],
    duration: "2 Days",
    anchorHref: "/places/om-beach-and-kudle-gokarna",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
  },
];

export function BeyondTheTemple() {
  return (
    <section className="relative py-24 md:py-32 bg-[#0C0907] border-t border-stone-800/80">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 border-b border-stone-800/80 pb-8">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Integrated Yatras · Temple + Destination + Experience
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#F2ECE1]">
              Beyond the Temple: Complete Circuits
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-sm md:text-base text-stone-300 leading-relaxed">
              A pilgrimage is an immersive cultural journey. Experience how temple cities naturally flow into
              princely palaces, sacred river confluences, pristine beaches, and ancient culinary lanes.
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-6 py-3 text-xs font-mono font-semibold uppercase tracking-wider text-black hover:bg-[#E4BE72] transition-colors shrink-0 shadow-lg shadow-[#C8A24B]/10"
          >
            <span>Complete My Yatra Planner</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {CIRCUITS.map((c) => (
            <div
              key={c.name}
              className="group flex flex-col justify-between rounded-3xl border border-stone-800/80 bg-stone-950 p-7 transition-all duration-300 hover:border-[#C8A24B]/50 hover:shadow-2xl"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-stone-800 mb-6">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    className="object-cover brightness-[0.8] transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[10.5px] font-mono text-stone-200 border border-stone-700/60 backdrop-blur-md">
                    {c.region} · {c.duration}
                  </div>
                </div>

                <h3 className="font-serif text-xl font-medium text-[#F2ECE1] leading-snug">
                  {c.name}
                </h3>
                <p className="mt-1 text-xs font-mono text-[#C8A24B]">
                  {c.theme}
                </p>

                {/* Itinerary Waypoints */}
                <div className="mt-5 space-y-3">
                  {c.stops.map((stop, idx) => (
                    <div key={stop.name} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8A24B]/15 text-[10px] font-mono font-semibold text-[#C8A24B] border border-[#C8A24B]/30">
                        0{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1 truncate">
                        <span className="font-serif text-[13px] text-stone-200 block truncate">
                          {stop.name}
                        </span>
                        <span className="text-[10px] font-mono text-stone-500">
                          {stop.type} · {stop.distance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between">
                <Link
                  href={c.anchorHref}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C8A24B] hover:text-[#E4BE72] transition-colors"
                >
                  <span>Explore Circuit Node</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[10.5px] font-mono text-stone-500">Ground Verified</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 03. Weekend Escapes — 1, 2 & 3 Day Regional Discovery                      */
/* -------------------------------------------------------------------------- */

const WEEKEND_ESCAPES = [
  {
    hub: "From Bengaluru (South Corridor)",
    title: "Mysuru Royal Court & Chamundi Hill",
    days: "2 Days (Weekend)",
    distance: "145 km via Express Highway",
    stops: ["Mysore Amba Vilas Palace", "Chamundeshwari Temple", "Srirangapatna Ranganathaswamy", "Brindavan Fountains"],
    href: "/places/mysore-palace-amba-vilas",
    tag: "Family & Heritage",
  },
  {
    hub: "From Delhi / NCR (Northern Circuit)",
    title: "Braj Mandal & Yamuna Ghats",
    days: "2 Days (Weekend)",
    distance: "160 km via Yamuna Expressway",
    stops: ["Krishna Janmabhoomi Mathura", "Banke Bihari Vrindavan", "Prem Mandir", "Kusum Sarovar & Govardhan Parikrama"],
    href: "/temples",
    tag: "Sacred & Cultural",
  },
  {
    hub: "From Chennai (Coromandel Coast)",
    title: "Mamallapuram Shore & Kanchipuram Silks",
    days: "2 Days (Weekend)",
    distance: "65–75 km Coastal Road",
    stops: ["Mahabalipuram Shore Temple & Rathas", "Ekambareswarar & Kailasanathar Shrines", "Living Kanchipuram Weavers", "Tiger Cave"],
    href: "/places/mahabalipuram-shore-temple-and-reliefs",
    tag: "UNESCO & Craft",
  },
];

export function WeekendEscapes() {
  return (
    <section className="relative py-24 md:py-32 bg-[#090705] border-t border-stone-800/80">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 border-b border-stone-800/80 pb-8">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Weekend Escapes · 1, 2 &amp; 3 Day Micro-Yatras
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#F2ECE1]">
              Weekend Pilgrimage Escapes
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-sm md:text-base text-stone-300 leading-relaxed">
              Curated regional breaks designed for quick weekend departures from major Indian hubs,
              with realistic highway drive times and guaranteed darshan schedules.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/60 px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-stone-300 hover:border-[#C8A24B] hover:text-[#F2ECE1] transition-colors shrink-0"
          >
            <span>All Regional Circuits</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#C8A24B]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WEEKEND_ESCAPES.map((w) => (
            <div
              key={w.title}
              className="flex flex-col justify-between rounded-3xl border border-stone-800/80 bg-stone-950/70 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#C8A24B]/50 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#C8A24B] border-b border-stone-800/60 pb-3">
                  <span>{w.days}</span>
                  <span className="rounded-full bg-stone-800/80 px-2.5 py-0.5 text-[10px] text-stone-300 border border-stone-700/60">
                    {w.tag}
                  </span>
                </div>

                <span className="mt-3 block text-[11px] font-mono text-stone-400">
                  {w.hub}
                </span>

                <h3 className="mt-1 font-serif text-xl font-medium text-[#F2ECE1] leading-snug">
                  {w.title}
                </h3>

                <p className="mt-1 text-xs font-mono text-stone-400">
                  {w.distance}
                </p>

                <div className="mt-5 space-y-2">
                  {w.stops.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-xs text-stone-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C8A24B] shrink-0" />
                      <span className="truncate">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-800/80">
                <Link
                  href={w.href}
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#C8A24B] hover:text-[#E4BE72] transition-colors"
                >
                  <span>Explore Weekend Itinerary</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
