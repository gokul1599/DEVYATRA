import Link from "next/link";
import { MapPin, ArrowUpRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { Temple } from "@/lib/types";
import { DirectoryTemple } from "@/lib/db/directory";
import { getState } from "@/lib/registry";
import { SaveButton } from "@/components/save-button";
import { Lift } from "@/components/motion";
import { cn } from "@/lib/cn";
import { CinematicImage } from "@/components/ui/cinematic-image";
import { resolvePrimaryTempleMedia } from "@/lib/images/resolver";

export function TempleCard({
  temple,
  stateSlug,
  index = 0,
  showLocation = true,
  featured = false,
  className,
}: {
  temple: Temple | DirectoryTemple;
  stateSlug?: string;
  index?: number;
  showLocation?: boolean;
  featured?: boolean;
  className?: string;
}) {
  const effectiveStateSlug =
    stateSlug ||
    ("stateSlug" in temple && temple.stateSlug ? temple.stateSlug : (getState(temple.stateCode)?.slug ?? "india"));
  const state = getState(effectiveStateSlug) || (("stateName" in temple && temple.stateName) ? { name: temple.stateName, slug: effectiveStateSlug } : undefined);
  const href = `/temples/${effectiveStateSlug}/${temple.slug}`;

  const isCentroid = "isCentroidFallback" in temple && temple.isCentroidFallback;

  const locationText = "location" in temple && temple.location
    ? `${temple.location}, ${temple.district}`
    : "districtName" in temple
      ? `${temple.localityName ? temple.localityName + ", " : ""}${temple.districtName}`
      : "Sacred Shrine";

  const primaryDeity = temple.deities?.[0] || ("mainDeity" in temple ? temple.mainDeity : undefined);
  const archOrTradition = temple.architecture || ("templeType" in temple ? temple.templeType : undefined);
  const resolvedMedia = resolvePrimaryTempleMedia(temple);

  return (
    <Lift>
      <Link
        href={href}
        className={cn(
          "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-950/70 transition-all duration-500 hover:border-stone-700 hover:bg-stone-900/60 shadow-lg shadow-black/30",
          className
        )}
      >
        {/* Photo Container */}
        <div className="relative overflow-hidden">
          <CinematicImage
            media={resolvedMedia}
            artSeed={`${temple.name}-${index}`}
            alt={temple.name}
            aspectRatio={featured ? "16/9" : "4/3"}
            priority={index < 2}
            showCreditBadge={resolvedMedia.hasFactualPhoto}
            className="w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          {/* Understated Verification Pip */}
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
            {resolvedMedia.hasFactualPhoto ? (
              <span
                title="Verified Sacred Heritage Photography"
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-stone-950/80 px-2 py-0.5 text-[10px] font-medium text-emerald-400 backdrop-blur-md"
              >
                <ShieldCheck className="h-2.5 w-2.5" />
                Verified
              </span>
            ) : null}

            {isCentroid && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-stone-950/80 px-2 py-0.5 text-[9.5px] font-medium text-amber-300 backdrop-blur-md">
                <AlertTriangle className="h-2.5 w-2.5" /> Approx. Region
              </span>
            )}
          </div>

          {/* Save Button */}
          <div className="absolute right-3 top-3 z-10">
            <SaveButton slug={temple.slug} />
          </div>
        </div>

        {/* Editorial Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            {/* Title & Local Name */}
            <h3 className="font-display text-[19px] font-medium leading-snug text-ivory transition-colors duration-300 group-hover:text-gold-bright">
              {temple.name}
            </h3>
            {temple.nameLocal && (
              <p className="mt-0.5 text-[12px] text-ivory-dim/60 font-serif italic">
                {temple.nameLocal}
              </p>
            )}

            {/* Geographic Coordinates */}
            {showLocation && (
              <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-ivory-dim/80">
                <MapPin className="h-3 w-3 text-gold-dim shrink-0" />
                <span className="truncate">
                  {locationText}
                  {state?.name ? `, ${state.name}` : ""}
                </span>
              </p>
            )}

            {/* Deity / Tradition Tag */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {primaryDeity && (
                <span className="rounded-md bg-stone-900/90 border border-stone-800 px-2 py-0.5 text-[11px] font-medium text-gold-bright/90">
                  {primaryDeity}
                </span>
              )}
              {archOrTradition && (
                <span className="rounded-md bg-stone-900/90 border border-stone-800 px-2 py-0.5 text-[11px] font-medium text-ivory-dim/70">
                  {archOrTradition}
                </span>
              )}
            </div>
          </div>

          {/* Subtle Hover Reveal Action */}
          <div className="mt-4 flex items-center justify-between border-t border-stone-800/60 pt-3 text-[12px] text-ivory-dim/60 transition-colors group-hover:text-gold-bright">
            <span className="text-[11px] uppercase tracking-wider text-stone-500">Sacred Sanctum</span>
            <span className="inline-flex items-center gap-0.5 text-[12px] font-medium transition-transform duration-300 group-hover:translate-x-1">
              Explore <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </Lift>
  );
}