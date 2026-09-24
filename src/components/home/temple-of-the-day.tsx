import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Compass, MapPin, Sparkles } from "lucide-react";
import { Container } from "@/components/ui";
import { TEMPLES, getState, templeUrl } from "@/lib/registry";
import { CURATED_LANDMARK_IMAGES } from "@/lib/images/registry";

const ROTATING_SLUGS = [
  "meenakshi-amman-temple",
  "kedarnath-temple",
  "kashi-vishwanath-temple",
  "sri-venkateswara-temple",
  "somnath-temple",
  "jagannath-temple-puri",
  "brihadisvara-temple",
  "konark-sun-temple",
  "kamakhya-temple",
  "ramanathaswamy-temple",
] as const;

export function TempleOfTheDay() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const slug = ROTATING_SLUGS[dayOfYear % ROTATING_SLUGS.length];
  const temple = TEMPLES.find((t) => t.slug === slug) ?? TEMPLES[0];
  const curatedImage = CURATED_LANDMARK_IMAGES[slug];
  const state = getState(temple.stateCode);

  const formattedDate = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative py-20 md:py-28 bg-[#090705] border-t border-stone-800/80 overflow-hidden">
      <Container wide>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-stone-800/70 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
                Daily Archival Spotlight
              </span>
              <span className="rounded-full bg-[#C8A24B]/10 border border-[#C8A24B]/30 px-2 py-0.5 font-mono text-[10px] text-[#E4BE72]">
                Rotates Daily
              </span>
            </div>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-[#F2ECE1]">
              Sanctuary of the Day
            </h2>
          </div>
          <p className="font-mono text-xs text-stone-400">
            {formattedDate}
          </p>
        </div>

        {/* Large Editorial Split Showcase */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-stone-800/80 bg-stone-950 shadow-2xl">
          <div className="grid lg:grid-cols-12 items-stretch">
            {/* Left: Monumental Image */}
            <div className="relative lg:col-span-7 min-h-[380px] lg:min-h-[500px] overflow-hidden">
              <Image
                src={curatedImage?.src ?? "/images/templeora-hero.png"}
                alt={curatedImage?.alt ?? temple.name}
                fill
                priority
                className="object-cover object-center brightness-[0.85] contrast-[1.05] transition-transform duration-1000 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-stone-950 hidden lg:block" />

              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-stone-700/60 px-3 py-1 font-mono text-[10.5px] text-stone-300">
                <Compass className="h-3 w-3 text-[#C8A24B]" />
                <span>Verified Geodetic Coordinates: {temple.latitude.toFixed(4)}° N, {temple.longitude.toFixed(4)}° E</span>
              </div>
            </div>

            {/* Right: Editorial Narrative Dossier */}
            <div className="relative lg:col-span-5 p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-400">
                  <span className="flex items-center gap-1.5 text-[#C8A24B]">
                    <MapPin className="h-3.5 w-3.5" />
                    {state?.name ?? temple.location}
                  </span>
                  <span>•</span>
                  <span>{temple.district}</span>
                </div>

                <h3 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#F2ECE1] leading-snug">
                  {temple.name}
                </h3>

                {temple.nameLocal && (
                  <p className="mt-1 font-serif text-sm text-[#E4BE72]/80 italic">
                    {temple.nameLocal}
                  </p>
                )}

                <p className="mt-5 text-sm leading-relaxed text-stone-300 font-sans line-clamp-4">
                  {temple.description}
                </p>

                {/* Identity Matrix Badges */}
                <div className="mt-6 grid grid-cols-2 gap-3 border-y border-stone-800/80 py-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                      Presiding Deity
                    </span>
                    <p className="font-serif text-sm text-stone-200 mt-0.5 truncate">
                      {temple.mainDeity?.split(",")[0] || "Sacred Sanctum"}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                      Architectural Order
                    </span>
                    <p className="font-serif text-sm text-stone-200 mt-0.5 truncate">
                      {temple.architecture ?? "Traditional Indian"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={templeUrl(temple)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-[#0A0806] shadow-lg transition-all hover:bg-[#E4BE72]"
                >
                  <span>Enter Sanctuary Record</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/plan?temple=${temple.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/60 px-5 py-3 font-mono text-xs uppercase tracking-wider text-stone-300 transition-colors hover:border-[#C8A24B] hover:text-[#F2ECE1]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#C8A24B]" />
                  <span>Plan Darshan</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
