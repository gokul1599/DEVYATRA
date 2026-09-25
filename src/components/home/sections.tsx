import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Landmark,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  ScrollText,
  Users,
  ArrowRight,
  Compass,
  Clock,
  Layers,
} from "lucide-react";
import { getState, getStates, templesByState, getFestivalAll, templeUrl } from "@/lib/registry";
import { listStates } from "@/lib/db/directory";
import { TEMPLE_INDEX } from "@/lib/data/temples";
import { Container } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";
import { festivalDate, fmtDate } from "@/lib/format";
import { SectionShell } from "@/components/ui/section-shell";
import { SacredArchitectureShowcase } from "@/components/home/sacred-architecture-showcase";
import { REGIONAL_LANDSCAPES, CURATED_LANDMARK_IMAGES } from "@/lib/images/registry";
import { CinematicImage } from "@/components/ui/cinematic-image";
import { VERIFIED_DESTINATIONS, type DestinationCategory, CATEGORY_METADATA } from "@/lib/destinations/registry";

/* -------------------------------------------------------------------------- */
/* Chapter I: The Sacred Geography of Bharat (Explore India)                   */
/* -------------------------------------------------------------------------- */

export async function ExploreIndia() {
  const dbStates = await listStates();
  const states = dbStates.length > 0
    ? dbStates
        .filter((s) => s.templeCount > 0)
        .sort((a, b) => b.templeCount - a.templeCount || a.name.localeCompare(b.name))
        .map((s) => ({ s: { name: s.name, slug: s.slug, code: s.code }, count: s.templeCount }))
    : getStates()
        .map((s) => ({ s, count: templesByState(s.code).length }))
        .filter((x) => x.count > 0)
        .sort((a, b) => b.count - a.count || a.s.name.localeCompare(b.s.name));

  return (
    <SectionShell sectionId="explore" id="explore-india" className="py-24 md:py-32 chapter-sandstone">
      <Container wide>
        {/* Editorial Chapter Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-800/80 pb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Chapter I · Sacred Geography
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl md:text-5xl">
              The Six Sacred Realms of Bharat
            </h2>
            <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
              India&apos;s sacred landscape is not uniform. From granite Dravidian Gopurams sculpted into coastal deltas
              to snow-bound Rekha spires in the Garhwal peaks, each geographic zone embodies an unbroken architectural and spiritual tradition.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-5 py-2.5 text-xs font-mono tracking-wider uppercase text-stone-300 transition-all hover:border-[#C8A24B] hover:text-[#F2ECE1] hover:bg-stone-800/80 shrink-0 self-start md:self-end"
          >
            <span>Complete State Atlas</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#C8A24B]" />
          </Link>
        </div>

        {/* Asymmetrical Magazine Spread for the 6 Realms */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
          {/* Featured Large Realm Spread 1: South */}
          {REGIONAL_LANDSCAPES[1] && (
            <Link
              href={`/explore?region=${REGIONAL_LANDSCAPES[1].regionId}`}
              className="group relative md:col-span-7 flex flex-col justify-end overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 p-8 min-h-[380px] md:min-h-[460px] transition-all duration-500 hover:border-[#C8A24B]/60 hover:shadow-2xl"
            >
              <div className="absolute inset-0">
                <CinematicImage
                  record={REGIONAL_LANDSCAPES[1].image}
                  artSeed="reg-south"
                  alt={REGIONAL_LANDSCAPES[1].name}
                  aspectRatio="16/9"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0907] via-[#0C0907]/60 to-transparent" />
                <div className="absolute inset-0 bg-radial-vignette opacity-70" />
              </div>

              <div className="relative z-10 max-w-xl">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C8A24B] mb-2">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Peninsular Realm</span>
                  <span className="text-stone-500">•</span>
                  <span>1,600+ Sanctuaries</span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-medium text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors">
                  {REGIONAL_LANDSCAPES[1].name}
                </h3>
                <p className="mt-2 text-xs md:text-sm text-stone-300 line-clamp-2 leading-relaxed">
                  {REGIONAL_LANDSCAPES[1].shortSummary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {REGIONAL_LANDSCAPES[1].keyStates.map((st) => (
                    <span
                      key={st}
                      className="rounded-full bg-stone-950/70 border border-stone-800/80 px-2.5 py-1 text-[11px] font-mono text-stone-300"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )}

          {/* Featured Large Realm Spread 2: North */}
          {REGIONAL_LANDSCAPES[0] && (
            <Link
              href={`/explore?region=${REGIONAL_LANDSCAPES[0].regionId}`}
              className="group relative md:col-span-5 flex flex-col justify-end overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 p-8 min-h-[380px] md:min-h-[460px] transition-all duration-500 hover:border-[#C8A24B]/60 hover:shadow-2xl"
            >
              <div className="absolute inset-0">
                <CinematicImage
                  record={REGIONAL_LANDSCAPES[0].image}
                  artSeed="reg-north"
                  alt={REGIONAL_LANDSCAPES[0].name}
                  aspectRatio="16/9"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0907] via-[#0C0907]/60 to-transparent" />
                <div className="absolute inset-0 bg-radial-vignette opacity-70" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C8A24B] mb-2">
                  <Compass className="h-3.5 w-3.5" />
                  <span>Himalayan & Gangetic Realm</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-medium text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors">
                  {REGIONAL_LANDSCAPES[0].name}
                </h3>
                <p className="mt-2 text-xs text-stone-300 line-clamp-2 leading-relaxed">
                  {REGIONAL_LANDSCAPES[0].shortSummary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {REGIONAL_LANDSCAPES[0].keyStates.slice(0, 3).map((st) => (
                    <span
                      key={st}
                      className="rounded-full bg-stone-950/70 border border-stone-800/80 px-2.5 py-1 text-[11px] font-mono text-stone-300"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          )}

          {/* 4 Complementary Regional Panels: East, West, Central, Northeast */}
          {REGIONAL_LANDSCAPES.slice(2).map((reg) => (
            <Link
              key={reg.regionId}
              href={`/explore?region=${reg.regionId}`}
              className="group relative md:col-span-3 flex flex-col justify-end overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-950 p-6 min-h-[260px] transition-all duration-500 hover:border-[#C8A24B]/50 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0">
                <CinematicImage
                  record={reg.image}
                  artSeed={`reg-${reg.regionId}`}
                  alt={reg.name}
                  aspectRatio="4/3"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0907]/95 via-[#0C0907]/50 to-transparent" />
              </div>

              <div className="relative z-10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C8A24B]">
                  {reg.keyStates.slice(0, 2).join(" • ")}
                </span>
                <h4 className="font-serif text-lg font-medium text-stone-100 mt-1 group-hover:text-[#E4BE72] transition-colors leading-snug">
                  {reg.name.split("&")[0].trim()}
                </h4>
                <p className="text-[11.5px] text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                  {reg.shortSummary}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-mono text-[#C8A24B] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span>Enter Realm</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Refined Pan-India Administrative Atlas Index */}
        <div className="rounded-3xl border border-stone-800/80 bg-stone-950/60 p-8 md:p-10 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/70 pb-6 mb-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C8A24B]">
                Official Geography Index
              </p>
              <h3 className="font-serif text-xl font-medium text-[#F2ECE1] mt-1">
                Explore by State & Union Territory
              </h3>
            </div>
            <p className="text-xs text-stone-400 font-mono">
              36 States & UTs • 725 Administrative Districts
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {states.map(({ s, count }) => (
              <Link
                key={s.code}
                href={`/explore/${s.slug}`}
                className="group flex items-center justify-between rounded-xl border border-stone-800/60 bg-stone-900/40 px-3.5 py-2.5 transition-all hover:border-[#C8A24B]/40 hover:bg-stone-900/80"
              >
                <span className="font-serif text-[13px] text-stone-200 group-hover:text-[#F2ECE1] truncate">
                  {s.name}
                </span>
                <span className="ml-2 font-mono text-[10.5px] text-stone-400 group-hover:text-[#C8A24B] shrink-0">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Editorial Chapter: India in One Atlas (National Destination Discoveries)   */
/* -------------------------------------------------------------------------- */

const ATLAS_EXPEDITIONS: {
  category: DestinationCategory;
  badge: "Iconic Landmark" | "Natural Wonder" | "National Heritage" | "Protected Sanctuary" | "Sacred Teertham";
  slug: string;
  curatedTitle: string;
  curatedDescription: string;
}[] = [
  {
    category: "LAKES",
    badge: "Natural Wonder",
    slug: "pangong-tso-lake-ladakh",
    curatedTitle: "Alpine Glacial Tarns & Lagoons",
    curatedDescription: "High-altitude endorheic lake at 14,270 ft spanning 134 km across Ladakh and Tibet. Turquoise crystal waters change shade continuously under Himalayan sunlight.",
  },
  {
    category: "CAVES",
    badge: "National Heritage",
    slug: "ajanta-caves",
    curatedTitle: "Monolithic Rock-Cut Architecture",
    curatedDescription: "30 rock-cut Buddhist sanctuaries chiseled into a horseshoe canyon gorge from 2nd century BCE, preserving masterpiece tempera murals and monolithic chaitya stupas.",
  },
  {
    category: "HILLS",
    badge: "Iconic Landmark",
    slug: "spiti-valley-and-key-monastery",
    curatedTitle: "Cold Deserts & High Passes",
    curatedDescription: "A 1,000-year-old monastery citadel perched dramatically at 13,668 ft above the meandering Spiti River, surrounded by barren snow-dusted crags.",
  },
  {
    category: "WATERFALLS",
    badge: "Natural Wonder",
    slug: "dudhsagar-waterfalls",
    curatedTitle: "Perennial Forest Cascades",
    curatedDescription: "Four-tiered milky torrent plunging 1,017 feet through the dense Western Ghats canopy of Bhagwan Mahaveer Sanctuary along the historic railway viaduct.",
  },
  {
    category: "BEACHES",
    badge: "Iconic Landmark",
    slug: "radhanagar-beach-havelock",
    curatedTitle: "Sacred Shores & Pristine Coral Rim",
    curatedDescription: "Vast crescent shoreline fringed with ancient padauk and mahua rainforest, celebrated for gentle turquoise surf and Blue Flag environmental certification.",
  },
  {
    category: "WILDLIFE",
    badge: "Protected Sanctuary",
    slug: "kaziranga-national-park",
    curatedTitle: "Endangered Corridors & Grasslands",
    curatedDescription: "UNESCO World Heritage floodplains of the Brahmaputra housing two-thirds of the world's Great Indian One-Horned Rhinoceros and viable breeding tiger populations.",
  },
];

export function IndiaInOneAtlas() {
  return (
    <SectionShell sectionId="explore" id="india-atlas" className="py-24 md:py-32 chapter-charcoal">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-800/80 pb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              National Atlas · Beyond The Temple
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl md:text-5xl">
              India in One Atlas
            </h2>
            <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
              India&apos;s sacred geography lives within an extraordinary continuum of ancient rock-cut caves,
              mist-cloaked Western Ghats, high-altitude alpine lakes, and protected biodiversity sanctuaries.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-end">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-black transition-all hover:bg-[#E4BE72]"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Interactive Map Atlas</span>
            </Link>
            <Link
              href="/map?category=lakes"
              className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-5 py-2.5 text-xs font-mono tracking-wider uppercase text-stone-300 transition-all hover:border-[#C8A24B] hover:text-[#F2ECE1]"
            >
              <span>Explore All Frontiers</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#C8A24B]" />
            </Link>
          </div>
        </div>

        {/* 6 Geographic Frontier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ATLAS_EXPEDITIONS.map((exp) => {
            const dest = VERIFIED_DESTINATIONS.find((d) => d.slug === exp.slug);
            const meta = CATEGORY_METADATA[exp.category];
            const imageSrc = dest?.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
            const imageAlt = dest?.imageAlt || exp.curatedTitle;
            const photographer = dest?.imageCredit?.photographer || "Verified Contributor";

            return (
              <div
                key={exp.slug}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-800/80 bg-stone-950 p-6 transition-all duration-300 hover:border-[#C8A24B]/50 hover:shadow-2xl"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-stone-800 mb-6">
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      fill
                      className="object-cover brightness-[0.8] transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Landmark Badge - Truthful, Non-ranking */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-[11px] font-mono text-stone-200 border border-stone-700/60 backdrop-blur-md">
                      <BadgeCheck className="h-3.5 w-3.5 text-[#C8A24B]" />
                      <span>{exp.badge}</span>
                    </div>

                    {/* Location Badge */}
                    {dest && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-mono text-stone-300">
                        <MapPin className="h-3.5 w-3.5 text-[#C8A24B]" />
                        <span>{dest.district}, {dest.state}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-wider text-[#C8A24B] mb-2">
                    <span>{meta?.icon || "✦"}</span>
                    <span>{meta?.label || exp.category}</span>
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#F2ECE1] leading-snug group-hover:text-[#E4BE72] transition-colors">
                    {dest?.name || exp.curatedTitle}
                  </h3>

                  <p className="mt-3 font-sans text-xs md:text-sm text-stone-300 line-clamp-3 leading-relaxed">
                    {dest?.description || exp.curatedDescription}
                  </p>

                  {/* Highlights tag pills */}
                  {dest?.highlights && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {dest.highlights.slice(0, 2).map((h, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-stone-800 bg-stone-900/60 px-2 py-0.5 text-[10.5px] font-mono text-stone-400"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-stone-800/80 flex items-center justify-between">
                  <Link
                    href={`/places/${exp.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#C8A24B] hover:text-[#E4BE72] transition-colors"
                  >
                    <span>View Destination Intel</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <span className="text-[10px] font-mono text-stone-500" title={`Photo: ${photographer}`}>
                    Photo: {photographer}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Chapter II: Masterpieces of Stone & Devotion (Famous Temples)              */
/* -------------------------------------------------------------------------- */

const FEATURED_MONUMENT_SLUG = "meenakshi-amman-temple";
const CURATED_SHOWCASE_SLUGS = [
  "kedarnath-temple",
  "kashi-vishwanath-temple",
  "somnath-temple",
] as const;

export function Famous() {
  const featuredTemple = TEMPLE_INDEX.get(FEATURED_MONUMENT_SLUG);
  const featuredImage = CURATED_LANDMARK_IMAGES[FEATURED_MONUMENT_SLUG];

  const galleryItems = CURATED_SHOWCASE_SLUGS.map((slug) => ({
    temple: TEMPLE_INDEX.get(slug),
    image: CURATED_LANDMARK_IMAGES[slug],
  })).filter((x) => x.temple && x.image);

  return (
    <SectionShell sectionId="famous" id="famous" className="py-24 md:py-32 chapter-maroon">
      <Container wide>
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-800/80 pb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Chapter II · Architectural Masterpieces
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl md:text-5xl">
              Living Sanctuaries of Bharat
            </h2>
            <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
              Centuries of devotion immortalized in living granite, sandstone, and marble.
              Each shrine is an architectural universe preserving daily rituals, royal epigraphy, and sacred astronomy.
            </p>
          </div>
          <Link
            href="/temples"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-5 py-2.5 text-xs font-mono tracking-wider uppercase text-stone-300 transition-all hover:border-[#C8A24B] hover:text-[#F2ECE1] hover:bg-stone-800/80 shrink-0 self-start md:self-end"
          >
            <span>View All 2,205 Sanctuaries</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#C8A24B]" />
          </Link>
        </div>

        {/* 1. Monumental Hero Destination Panel (Split Editorial Layout) */}
        {featuredTemple && featuredImage && (
          <div className="relative mb-16 overflow-hidden rounded-[2.5rem] border border-stone-800 bg-[#120F0C] shadow-2xl">
            <div className="grid lg:grid-cols-12 items-stretch">
              {/* 60% Visual Spread */}
              <div className="relative min-h-[380px] lg:min-h-[540px] lg:col-span-7 overflow-hidden">
                <Image
                  src={featuredImage.src}
                  alt={featuredImage.alt}
                  fill
                  priority
                  className="object-cover transition-transform duration-1000 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120F0C] via-[#120F0C]/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#120F0C]" />
                <div className="absolute top-6 left-6 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 backdrop-blur-md border border-stone-700/60">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#C8A24B]" />
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-stone-200">
                    Monumental Benchmark · 100% Verified
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 z-10 max-w-md">
                  <p className="text-[11px] font-mono text-stone-400">
                    {featuredImage.credit}
                  </p>
                </div>
              </div>

              {/* 40% Editorial Narrative & Curated Intel */}
              <div className="p-8 sm:p-12 lg:col-span-5 flex flex-col justify-between space-y-8">
                <div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#C8A24B] uppercase tracking-[0.2em] mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Madurai, Tamil Nadu</span>
                    <span className="text-stone-600">•</span>
                    <span>Dravidian Style</span>
                  </div>

                  <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#F2ECE1] leading-tight">
                    {featuredTemple.name}
                  </h3>
                  <p className="font-serif text-base italic text-[#E4BE72]/90 mt-1">
                    Arulmigu Meenakshi Sundareswarar Thirukovil
                  </p>

                  <p className="mt-5 font-sans text-sm text-stone-300 leading-relaxed">
                    Spanning 14 acres in the heart of ancient Madurai, this living masterpiece boasts 14 soaring
                    gateway gopurams encrusted with thousands of stucco deities, the thousand-pillared hall of musical resonance,
                    and the golden lotus tank where centuries of Tamil poets gathered.
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4 border-t border-stone-800/80 pt-6">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Deity & Sanctum</p>
                      <p className="font-serif text-sm font-medium text-stone-200 mt-1">Goddess Meenakshi & Sundareswarar</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Patron Dynasties</p>
                      <p className="font-serif text-sm font-medium text-stone-200 mt-1">Pandya & Nayaka Rulers</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    href={`/temples/tamil-nadu/${featuredTemple.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-7 py-3 text-xs font-mono font-semibold uppercase tracking-wider text-[#0C0907] transition-all hover:bg-[#E4BE72] hover:shadow-lg hover:shadow-[#C8A24B]/20"
                  >
                    <span>Enter Sanctuary</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/plan?temple=${featuredTemple.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 px-5 py-3 text-xs font-mono uppercase tracking-wider text-stone-300 transition-colors hover:border-[#C8A24B] hover:text-[#F2ECE1]"
                  >
                    <span>Plan Darshan</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Curated Editorial Gallery: 3 Jewels in Asymmetrical Harmony */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryItems.map(({ temple, image }) => {
            if (!temple || !image) return null;
            return (
              <Link
                key={temple.slug}
                href={templeUrl(temple)}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-800/80 bg-stone-950 p-5 transition-all duration-500 hover:border-[#C8A24B]/60 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md border border-stone-700/60 px-2.5 py-0.5 font-mono text-[10px] text-stone-300 uppercase tracking-wider">
                      {temple.architecture ?? temple.type ?? "Sacred Tradition"}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-[#C8A24B]" />
                      {getState(temple.stateCode)?.name ?? temple.location}
                    </span>
                    <span>{temple.mainDeity?.split(",")[0] || "Sacred Sanctum"}</span>
                  </div>

                  <h4 className="font-serif text-xl font-medium text-[#F2ECE1] mt-2 group-hover:text-[#E4BE72] transition-colors">
                    {temple.name}
                  </h4>
                  <p className="mt-2 text-xs text-stone-300 line-clamp-2 leading-relaxed">
                    {temple.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-800/80 pt-4 text-xs font-mono text-stone-400">
                  <span className="group-hover:text-stone-300">View Sanctuary Record</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#C8A24B] transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Chapter III: Sacred Geometry & Shilpa Shastra                              */
/* -------------------------------------------------------------------------- */

export function ArchitectureShowcase() {
  return (
    <SectionShell sectionId="architecture" id="architecture" className="py-24 md:py-32 chapter-architecture">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-800/80 pb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Chapter III · Sacred Geometry
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl md:text-5xl">
              Shilpa Shastra: Architecture of the Cosmos
            </h2>
            <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
              An Indian temple is designed as a Vastu Purusha Mandala — a physical diagram of cosmic order.
              Explore the four principal orders that defined subcontinental monumentality over two millennia.
            </p>
          </div>
          <Link
            href="/temples?view=architecture"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-5 py-2.5 text-xs font-mono tracking-wider uppercase text-stone-300 transition-all hover:border-[#C8A24B] hover:text-[#F2ECE1] hover:bg-stone-800/80 shrink-0 self-start md:self-end"
          >
            <span>Architectural Codex</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#C8A24B]" />
          </Link>
        </div>

        {/* Sacred Architecture Showcase with Canonical Model */}
        <SacredArchitectureShowcase />

        {/* The Four Grand Architectural Traditions */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              name: "Dravidian Tradition",
              region: "Peninsular South (Tamil Nadu, Karnataka, AP, Kerala)",
              features: "Pyramidal stepped Vimanas, monumental sculptured Gopurams, pillared Mandapas",
              benchmark: "Brihadeeswarar & Meenakshi Amman",
            },
            {
              name: "Nagara Tradition",
              region: "North & Central (UP, Gujarat, MP, Rajasthan)",
              features: "Curvilinear beehive Shikhara, square Garbhagriha, Amalaka ribbed stone crown",
              benchmark: "Kashi Vishwanath & Khajuraho",
            },
            {
              name: "Vesara Tradition",
              region: "Deccan Plateau (Karnataka & Maharashtra)",
              features: "Stellate star-shaped plan, hybrid fusion of Nagara spire and Dravidian mandapa",
              benchmark: "Hoysaleswara & Badami Cave Temples",
            },
            {
              name: "Kalinga Tradition",
              region: "Eastern Coast (Odisha & Bengal)",
              features: "Vertical Rekha Deul towers, frontal Jagamohana assembly, khakhara shrines",
              benchmark: "Jagannath Puri & Konark Sun Temple",
            },
          ].map((style) => (
            <div
              key={style.name}
              className="rounded-2xl border border-stone-800/80 bg-stone-950/70 p-6 backdrop-blur-sm"
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C8A24B]">
                {style.name}
              </span>
              <p className="font-serif text-sm font-medium text-stone-200 mt-2">
                {style.features}
              </p>
              <div className="mt-4 border-t border-stone-800/80 pt-3 text-[11px] text-stone-400">
                <span className="font-mono text-stone-300">Exemplar:</span> {style.benchmark}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Chapter IV: Sacred Time & Processions (Festival Calendar)                  */
/* -------------------------------------------------------------------------- */

export function FestivalStrip() {
  const now = new Date();
  const year = now.getFullYear();

  const upcoming = getFestivalAll()
    .map((f) => {
      let d = festivalDate(f.month, f.day, year);
      if (d < now) d = festivalDate(f.month, f.day, year + 1);
      return { ...f, date: d };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 8);

  return (
    <SectionShell sectionId="festivals" id="festivals" className="py-24 md:py-32 chapter-festivals">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-stone-800/80 pb-10">
          <div className="max-w-2xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Chapter IV · Sacred Time & Processions
            </span>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl md:text-5xl">
              The Celestial Calendar of Bharat
            </h2>
            <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
              Temple life breathes to the rhythm of lunar tithis, solstices, and celestial marriages.
              Experience monumental Rath Yatras, sacred river snanams, and temple processions.
            </p>
          </div>
          <Link
            href="/festivals"
            className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-5 py-2.5 text-xs font-mono tracking-wider uppercase text-stone-300 transition-all hover:border-[#C8A24B] hover:text-[#F2ECE1] hover:bg-stone-800/80 shrink-0 self-start md:self-end"
          >
            <span>Full Pan-India Calendar</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#C8A24B]" />
          </Link>
        </div>

        {/* Horizontal Editorial Timeline Rail Arranged Date-wise */}
        <div className="flex gap-5 overflow-x-auto pb-4 [scrollbar-width:thin] no-scrollbar">
          {upcoming.map((f) => {
            const key = `${f.name}-${f.date.toISOString()}`;
            const diffMs = f.date.getTime() - now.getTime();
            const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
            const countdown = diffDays === 0 ? "Today" : diffDays === 1 ? "Tomorrow" : `In ${diffDays} days`;
            const dayNum = String(f.date.getDate()).padStart(2, "0");
            const monthAbbr = f.date.toLocaleString("en-US", { month: "short" }).toUpperCase();

            return (
              <Link
                key={key}
                href={`${templeUrl(f.temple)}#festivals`}
                className="group relative w-80 shrink-0 snap-start overflow-hidden rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#C8A24B]/60 hover:bg-stone-900/90 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#C8A24B]/30 bg-[#C8A24B]/10 px-2.5 py-1.5 text-center shrink-0">
                        <span className="font-mono text-base font-bold text-[#E4BE72] leading-none">
                          {dayNum}
                        </span>
                        <span className="font-mono text-[8.5px] uppercase tracking-wider text-[#C8A24B] mt-0.5">
                          {monthAbbr}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#C8A24B]">
                        <span>{f.dateLabel}</span>
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5">{fmtDate(f.date)}</p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full border border-stone-800 bg-stone-900/80 px-2.5 py-0.5 text-[10px] font-mono text-stone-300">
                      {countdown}
                    </span>
                  </div>

                  <h4 className="mt-4 font-serif text-lg font-medium text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors leading-snug">
                    {f.name}
                  </h4>
                  <p className="mt-1 text-xs font-serif text-stone-300 truncate">
                    {f.temple.name} · {getState(f.temple.stateCode)?.name ?? f.temple.location}
                  </p>
                  <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-stone-400">
                    {f.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-stone-800/80 pt-3 flex items-center justify-between text-[11px] font-mono text-[#C8A24B]">
                  <span>Explore Pilgrimage</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Chapter V: The Pilgrimage Studio (PlanBand)                                */
/* -------------------------------------------------------------------------- */

export function PlanBand() {
  return (
    <SectionShell sectionId="journey" id="plan-band" className="py-24 md:py-32 chapter-journey">
      <Container wide>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-800 bg-[#120F0C] p-8 md:p-16 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#C8A24B]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-[#8E2800]/15 blur-3xl" />

          <div className="relative grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
                Chapter V · The Pilgrimage Studio
              </span>
              <h2 className="mt-3 font-serif text-3xl font-medium leading-[1.15] text-[#F2ECE1] sm:text-4xl md:text-5xl">
                Your Pilgrimage, Composed with Intelligence
              </h2>
              <p className="mt-5 max-w-xl text-sm md:text-base leading-relaxed text-stone-300">
                A sacred pilgrimage demands more than generic navigation. Devyatra crafts a seamless, time-buffered itinerary
                incorporating darshan queues, official prasad distribution timings, footwear protocols, senior accessibility,
                and sacred parikrama routes.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-8 py-3.5 text-xs font-mono font-semibold uppercase tracking-wider text-[#0C0907] shadow-lg transition-all hover:bg-[#E4BE72]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Compose Your Journey</span>
                </Link>
                <Link
                  href="/plan?mode=route"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-6 py-3.5 text-xs font-mono uppercase tracking-wider text-stone-300 transition-colors hover:border-[#C8A24B] hover:text-[#F2ECE1]"
                >
                  <Compass className="h-4 w-4 text-[#C8A24B]" />
                  <span>Build Sacred Corridor</span>
                </Link>
              </div>
            </div>

            {/* Curated Journey Experience Pillars */}
            <div className="lg:col-span-5 space-y-4">
              {[
                {
                  step: "01",
                  title: "Authentic Darshan Synchronization",
                  desc: "Timings aligned with official Devaswom, TTD, and Shrine Board records.",
                  icon: Clock,
                },
                {
                  step: "02",
                  title: "Pacing & Accessibility Buffers",
                  desc: "Realistic foot-traffic buffers, midday heat avoidance, and senior ease.",
                  icon: Layers,
                },
                {
                  step: "03",
                  title: "Extended 300 km Sacred Corridors",
                  desc: "Connect nearby historic forts, sacred rivers, and hidden monolithic temples.",
                  icon: Landmark,
                },
              ].map((pill) => (
                <div
                  key={pill.step}
                  className="flex items-start gap-4 rounded-2xl border border-stone-800/80 bg-stone-950/60 p-5 backdrop-blur-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C8A24B]/10 text-[#C8A24B] border border-[#C8A24B]/20">
                    <pill.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-serif text-base font-medium text-stone-200">
                      {pill.title}
                    </h4>
                    <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                      {pill.desc}
                    </p>
                  </div>
                  <span className="ml-auto font-mono text-xs text-[#C8A24B]/60">{pill.step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Chapter VI: The Archival Standard (TrustSection)                           */
/* -------------------------------------------------------------------------- */

export function TrustSection() {
  const items = [
    {
      icon: ShieldCheck,
      t: "Official Board Provenance",
      d: "Every timing, fee, and administrative datum is cited directly from TTD, HR&CE, ASI, and Shrine Boards.",
    },
    {
      icon: ScrollText,
      t: "Zero Visual Hallucination",
      d: "Real sanctuaries feature authentic, verified editorial photography with source attributions. Never synthetic masks.",
    },
    {
      icon: Users,
      t: "Community Epigraphy",
      d: "Field reports and regional pilgrim observations verified through our automated integrity pipeline.",
    },
    {
      icon: Sparkles,
      t: "Grounded AI Intelligence",
      d: "Our pilgrimage companion strictly refuses to invent ticket portals or false timings, preserving traveler trust.",
    },
  ];

  return (
    <SectionShell sectionId="trust" id="trust" className="py-24 md:py-32 chapter-sandstone">
      <Container wide>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
            Chapter VI · The Archival Standard
          </span>
          <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-4xl">
            Radically Honest. Archival Grade.
          </h2>
          <p className="mt-4 font-sans text-sm md:text-base leading-relaxed text-stone-300">
            We treat India&apos;s sacred heritage as an inviolable public trust — auditable, sourced, and grounded in administrative fact.
          </p>
        </div>

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <StaggerItem key={it.t}>
              <div className="h-full rounded-2xl border border-stone-800/80 bg-stone-950/60 p-7 backdrop-blur-sm">
                <it.icon className="h-6 w-6 text-[#C8A24B]" />
                <h4 className="mt-4 font-serif text-lg font-medium text-[#F2ECE1]">{it.t}</h4>
                <p className="mt-2 text-xs leading-relaxed text-stone-400">{it.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-10 text-center">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#C8A24B] hover:text-[#E4BE72] transition-colors"
          >
            <span>Our Verification Methodology</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Container>
    </SectionShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Epilogue: The Open Road (CtaBand)                                          */
/* -------------------------------------------------------------------------- */

export function CtaBand() {
  return (
    <section className="py-16 pb-28 md:pb-36 chapter-climax">
      <Container wide>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-800/80 bg-stone-950 px-8 py-20 text-center shadow-2xl">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(70% 90% at 50% 0%, rgba(200,162,75,0.2), transparent 70%), linear-gradient(180deg, #1c1812, #0C0907)",
            }}
          />
          <div className="relative max-w-2xl mx-auto">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Epilogue · The Open Road
            </span>
            <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-[#F2ECE1] sm:text-5xl leading-tight">
              Every stone carries memory. Every river remembers a prayer.
            </h2>
            <p className="mx-auto mt-5 text-sm md:text-base text-stone-300 leading-relaxed">
              From the seven sacred hills of Tirumala to the ancient morning bells of Varanasi,
              your pilgrimage through sacred Bharat begins now.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/temples"
                className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-8 py-4 text-xs font-mono font-semibold uppercase tracking-wider text-[#0C0907] shadow-xl transition-all hover:bg-[#E4BE72]"
              >
                <Landmark className="h-4 w-4" />
                <span>Explore the Sanctuaries</span>
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-8 py-4 text-xs font-mono uppercase tracking-wider text-stone-300 transition-colors hover:border-[#C8A24B] hover:text-[#F2ECE1]"
              >
                <Compass className="h-4 w-4 text-[#C8A24B]" />
                <span>Sacred Atlas</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}