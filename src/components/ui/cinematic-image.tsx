"use client";

import { useState } from "react";
import Image from "next/image";
import { Info, Sparkles } from "lucide-react";
import { type DestinationImage } from "@/lib/images/registry";
import { type ResolvedTempleMedia } from "@/lib/images/resolver";
import { DevyatraArt } from "@/components/devyatra-art";
import { cn } from "@/lib/cn";

interface CinematicImageProps {
  image?: DestinationImage | null;
  record?: DestinationImage | null;
  media?: ResolvedTempleMedia | DestinationImage | null;
  fallbackSeed?: string;
  artSeed?: string;
  alt?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "21/9" | "auto";
  priority?: boolean;
  className?: string;
  showCreditBadge?: boolean;
  withOverlay?: boolean;
  overlayClass?: string;
}

const ASPECT_CLASSES = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]",
  auto: "h-full w-full",
};

const FOCAL_CLASSES = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
};

export function CinematicImage({
  image,
  record,
  media,
  fallbackSeed = "devyatra-shrine",
  artSeed,
  alt,
  aspectRatio = "16/9",
  priority = false,
  className,
  showCreditBadge = false,
  withOverlay = true,
  overlayClass = "from-obsidian/85 via-obsidian/20 to-transparent",
}: CinematicImageProps) {
  const [hasError, setHasError] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const effectiveImage = media ?? image ?? record ?? null;
  const effectiveSeed = artSeed ?? fallbackSeed;
  const hasPhoto = Boolean(effectiveImage && effectiveImage.src && !hasError);

  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-obsidian-3",
        ASPECT_CLASSES[aspectRatio],
        className
      )}
    >
      {hasPhoto && effectiveImage && effectiveImage.src ? (
        <>
          <Image
            src={effectiveImage.src}
            alt={alt || effectiveImage.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            onError={() => setHasError(true)}
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              FOCAL_CLASSES[effectiveImage.focalPoint || "center"]
            )}
          />

          {/* Vignette & Depth Gradient */}
          {withOverlay && (
            <div
              className={cn(
                "pointer-events-none absolute inset-0 z-10 bg-gradient-to-t opacity-90 transition-opacity duration-500",
                overlayClass
              )}
            />
          )}

          {/* Accessible Image Rights Affordance */}
          {showCreditBadge && (
            <div className="absolute bottom-2.5 right-2.5 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowInfo((prev) => !prev);
                }}
                title={`Image Credit: ${effectiveImage.credit}`}
                className="flex items-center gap-1 rounded-full bg-obsidian/75 px-2 py-1 text-[10px] text-ivory-dim backdrop-blur-md transition-colors hover:bg-obsidian hover:text-ivory"
              >
                <Info className="h-3 w-3 text-gold-dim" />
                <span className="hidden sm:inline">Photo Details</span>
              </button>

              {showInfo && (
                <div
                  className="absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-line bg-obsidian p-3 text-xs text-ivory shadow-xl backdrop-blur-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="font-medium text-gold-bright">{effectiveImage.caption || effectiveImage.alt}</p>
                  <p className="mt-1 text-[11px] text-ivory-dim">Source: {effectiveImage.credit}</p>
                  {effectiveImage.rights && (
                    <p className="mt-1 font-mono text-[10px] text-emerald-400">License: {effectiveImage.rights.replace(/_/g, " ")}</p>
                  )}
                  {"authorUrl" in effectiveImage && effectiveImage.authorUrl && (
                    <a
                      href={effectiveImage.authorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 block text-[10px] text-gold underline hover:text-gold-bright"
                    >
                      View Source / Contributor
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Fallback: High-craft DevyatraArt clearly labeled as artistic interpretation */
        <div className="relative h-full w-full">
          <DevyatraArt seed={effectiveSeed} className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-md bg-obsidian/85 px-2 py-0.5 text-[9.5px] text-ivory-dim/90 backdrop-blur-sm border border-white/5">
            <Sparkles className="h-2.5 w-2.5 text-gold-dim" />
            <span>Verification in progress • Artistic Representation</span>
          </div>
        </div>
      )}
    </div>
  );
}
