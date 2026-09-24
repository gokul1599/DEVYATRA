"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, MapPin, Layers } from "lucide-react";
import { Container } from "@/components/ui";
import { cn } from "@/lib/cn";

interface RegionalSanctuaryHub {
  id: string;
  name: string;
  realm: string;
  coordinates: string;
  description: string;
  templesCount: number;
  highlightTemple: {
    name: string;
    slug: string;
    stateSlug: string;
    image: string;
    deity: string;
    architecture: string;
  };
}

const REGIONAL_HUBS: RegionalSanctuaryHub[] = [
  {
    id: "south",
    name: "Dravidian Heartland & Western Ghats",
    realm: "Southern Sanctuaries",
    coordinates: "9.9195° N, 78.1193° E",
    description: "Towering multi-tiered Rajagopurams, thousand-pillared mandapas, and continuous thousand-year ritual traditions.",
    templesCount: 842,
    highlightTemple: {
      name: "Meenakshi Sundareswarar Temple",
      slug: "meenakshi-amman-temple",
      stateSlug: "tamil-nadu",
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
      deity: "Goddess Meenakshi & Lord Sundareswarar",
      architecture: "Dravidian Monumental Order",
    },
  },
  {
    id: "north",
    name: "Gangetic Plain & Himalayan Heights",
    realm: "Northern Sacred Rivers",
    coordinates: "25.3109° N, 83.0107° E",
    description: "High-altitude Himalayan shrines nestled amid glacial ridges, and eternal ghats flanking sacred Mother Ganga.",
    templesCount: 518,
    highlightTemple: {
      name: "Kashi Vishwanath Corridor",
      slug: "kashi-vishwanath-temple",
      stateSlug: "uttar-pradesh",
      image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80",
      deity: "Lord Shiva (Vishveshwara)",
      architecture: "Nagara Shikhar Order",
    },
  },
  {
    id: "west",
    name: "Saurashtra & Arabian Ocean Coast",
    realm: "Western Coastal Shrines",
    coordinates: "20.8880° N, 70.4013° E",
    description: "The premier Jyotirlinga standing against relentless ocean tides, Solanki intricate stepwells, and desert marble shrines.",
    templesCount: 310,
    highlightTemple: {
      name: "Somnath Jyotirlinga",
      slug: "somnath-temple",
      stateSlug: "gujarat",
      image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
      deity: "Lord Somnath",
      architecture: "Māru-Gurjara Order",
    },
  },
  {
    id: "east",
    name: "Kalinga Shore & Eastern Delta",
    realm: "Eastern Sanctuaries",
    coordinates: "19.8049° N, 85.8179° E",
    description: "Curvilinear Rekha Deul towers soaring above golden coastlines, and ancient Shakti peethas commanding the Brahmaputra.",
    templesCount: 295,
    highlightTemple: {
      name: "Shree Jagannatha Temple",
      slug: "jagannath-temple-puri",
      stateSlug: "odisha",
      image: "https://images.unsplash.com/photo-1600100397608-f010f443b71a?auto=format&fit=crop&w=1200&q=80",
      deity: "Lord Jagannath, Balabhadra & Subhadra",
      architecture: "Kalinga Rekha Deul",
    },
  },
];

export function GeographicAtlasChapter() {
  const [activeHubId, setActiveHubId] = useState<string>("south");
  const activeHub = REGIONAL_HUBS.find((h) => h.id === activeHubId) ?? REGIONAL_HUBS[0];

  return (
    <section className="relative py-24 md:py-32 bg-[#080605] border-t border-stone-800/80 overflow-hidden">
      <Container wide>
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-stone-800/80 pb-8">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Geographic Atlas &amp; Sanctuary Nodes
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl md:text-5xl">
              Sacred Geography of Bharat
            </h2>
            <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
              India’s temples were never built in isolation. They form an interconnected topological grid
              calibrated to river systems, mountain ridges, and solar cardinal axes.
            </p>
          </div>

          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-full border border-[#C8A24B]/50 bg-[#C8A24B]/10 px-6 py-3 font-mono text-xs uppercase tracking-wider text-[#E4BE72] transition-all hover:bg-[#C8A24B] hover:text-[#0A0806] shrink-0"
          >
            <Compass className="h-4 w-4" />
            <span>Launch Full National Map</span>
          </Link>
        </div>

        {/* Region Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 [scrollbar-width:none]">
          {REGIONAL_HUBS.map((hub) => (
            <button
              key={hub.id}
              type="button"
              onClick={() => setActiveHubId(hub.id)}
              className={cn(
                "shrink-0 rounded-2xl px-5 py-3 text-xs font-mono transition-all text-left",
                activeHubId === hub.id
                  ? "bg-[#C8A24B] text-[#0A0806] font-semibold shadow-xl scale-[1.02]"
                  : "border border-stone-800/80 bg-stone-950/70 text-stone-400 hover:border-[#C8A24B]/40 hover:text-stone-200"
              )}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-80">{hub.realm}</div>
              <div className="text-sm font-serif font-normal mt-0.5">{hub.name.split("&")[0].trim()}</div>
            </button>
          ))}
        </div>

        {/* Interactive Hub Visual Split Card */}
        <div className="mt-8 relative overflow-hidden rounded-[2.5rem] border border-stone-800/80 bg-stone-950 shadow-2xl">
          <div className="grid lg:grid-cols-12 items-stretch">
            {/* Left: Highlight Sanctuary Photograph */}
            <div className="relative lg:col-span-7 min-h-[360px] lg:min-h-[480px] overflow-hidden">
              <Image
                src={activeHub.highlightTemple.image}
                alt={activeHub.highlightTemple.name}
                fill
                className="object-cover object-center brightness-[0.8] contrast-[1.05] transition-all duration-700"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-stone-950 hidden lg:block" />

              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-stone-700/60 px-3 py-1 font-mono text-[10px] text-stone-300">
                <MapPin className="h-3 w-3 text-[#C8A24B]" />
                <span>Geodetic Center: {activeHub.coordinates}</span>
              </div>
            </div>

            {/* Right: Regional Node Dossier */}
            <div className="relative lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#C8A24B]">
                  {activeHub.realm}
                </span>

                <h3 className="mt-2 font-serif text-2xl lg:text-3xl font-normal text-[#F2ECE1] leading-snug">
                  {activeHub.name}
                </h3>

                <p className="mt-4 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                  {activeHub.description}
                </p>

                {/* Highlight Temple Info */}
                <div className="mt-6 rounded-2xl border border-stone-800/80 bg-stone-900/40 p-4">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                    Exemplar Monument
                  </span>
                  <h4 className="font-serif text-lg font-medium text-[#F2ECE1] mt-0.5">
                    {activeHub.highlightTemple.name}
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-[#C8A24B]">
                    <span>{activeHub.highlightTemple.deity}</span>
                    <span>•</span>
                    <span className="text-stone-400">{activeHub.highlightTemple.architecture}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-stone-800/80">
                <Link
                  href={`/temples/${activeHub.highlightTemple.stateSlug}/${activeHub.highlightTemple.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-6 py-3 font-mono text-xs uppercase tracking-wider text-[#0A0806] font-semibold transition-all hover:bg-[#E4BE72]"
                >
                  <span>Explore Monument</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href={`/map?lat=${activeHub.coordinates.split(",")[0].trim().replace("° N", "")}&lng=${activeHub.coordinates.split(",")[1].trim().replace("° E", "")}&zoom=8`}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-5 py-3 font-mono text-xs uppercase tracking-wider text-stone-300 transition-colors hover:border-[#C8A24B] hover:text-[#F2ECE1]"
                >
                  <Layers className="h-3.5 w-3.5 text-[#C8A24B]" />
                  <span>Inspect on Map</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
