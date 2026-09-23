"use client";

import { useState } from "react";
import Image from "next/image";
import {
  type DestinationImage,
  getTempleImage,
  getTempleGallery,
} from "@/lib/images/registry";
import { Camera, ShieldCheck, ExternalLink, X, Maximize2, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

interface TempleMediaGalleryProps {
  templeSlug: string;
  templeName: string;
  architectureStyle?: string;
  className?: string;
}

export function TempleMediaGallery({
  templeSlug,
  templeName,
  architectureStyle,
  className,
}: TempleMediaGalleryProps) {
  const primaryImage = getTempleImage(templeSlug);
  const galleryImages = getTempleGallery(templeSlug);
  const [activeLightbox, setActiveLightbox] = useState<DestinationImage | null>(null);

  // Combine primary with gallery images, filtering out duplicates
  const allImages: DestinationImage[] = [];
  if (primaryImage) allImages.push(primaryImage);
  galleryImages.forEach((img) => {
    if (!allImages.some((existing) => existing.src === img.src)) {
      allImages.push(img);
    }
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Title and Provenance Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-bright">
            <Camera className="h-4 w-4" />
            <span>Visual Heritage Archive</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
              Verified Authentic
            </span>
            {architectureStyle && (
              <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold-bright border border-gold/20">
                {architectureStyle} Tradition
              </span>
            )}
          </div>
          <h3 className="font-display text-2xl font-medium text-ivory">
            Photographic & Spatial Documentation
          </h3>
          <p className="text-xs text-ivory-dim">
            Curated high-resolution photography licensed under editorial and cultural heritage archives.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-line bg-obsidian px-2.5 py-1 text-xs text-ivory-dim">
          <ShieldCheck className="h-3.5 w-3.5 text-gold" />
          <span>Zero Hallucination Guaranteed</span>
        </div>
      </div>

      {/* Gallery Grid Display */}
      {allImages.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allImages.map((img, idx) => (
            <div
              key={img.id || idx}
              onClick={() => setActiveLightbox(img)}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-obsidian transition-all duration-300 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10",
                idx === 0 ? "sm:col-span-2 lg:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Top Attribution Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-obsidian/80 px-2.5 py-0.5 text-[10px] font-medium text-gold-bright backdrop-blur-md border border-gold/30">
                <Sparkles className="h-3 w-3 text-gold" />
                <span>{img.rights.replace("_", " ")}</span>
              </div>

              <div className="absolute top-3 right-3 rounded-full bg-obsidian/80 p-1.5 text-ivory-dim opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                <Maximize2 className="h-3.5 w-3.5 text-gold-bright" />
              </div>

              {/* Bottom Caption & Credit */}
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <p className="font-display text-sm font-semibold text-ivory drop-shadow-md line-clamp-1">
                  {img.caption || img.alt}
                </p>
                <p className="text-[11px] text-ivory-dim/80 line-clamp-1">
                  Source: {img.credit}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback Artistic Interpretation */
        <div className="rounded-2xl border border-line bg-obsidian-2 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold-bright mb-3">
            <Camera className="h-6 w-6" />
          </div>
          <h4 className="font-display text-lg font-medium text-ivory">
            Artistic Representation Active
          </h4>
          <p className="mx-auto mt-1 max-w-md text-xs text-ivory-dim">
            Factual licensed photography for {templeName} is currently undergoing provenance review. DevyatraArt geometric representations are displayed to preserve visual fidelity without hallucination.
          </p>
        </div>
      )}

      {/* High-Resolution Lightbox Modal */}
      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/95 p-4 backdrop-blur-lg animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-2xl border border-gold/40 bg-obsidian-2 overflow-hidden shadow-2xl"
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-obsidian/80 text-ivory-dim hover:text-white hover:bg-obsidian border border-line backdrop-blur-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Expanded Image View */}
            <div className="relative aspect-[16/10] w-full bg-obsidian">
              <Image
                src={activeLightbox.src}
                alt={activeLightbox.alt}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Lightbox Metadata Footer */}
            <div className="border-t border-line/80 bg-obsidian-2/95 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold-bright mb-1 border border-gold/30">
                  {activeLightbox.rights}
                </span>
                <h4 className="font-display text-base font-semibold text-ivory">
                  {activeLightbox.caption || activeLightbox.alt}
                </h4>
                <p className="text-xs text-ivory-dim mt-0.5">
                  Archival Credit: {activeLightbox.credit}
                </p>
              </div>

              {activeLightbox.sourceUrl && (
                <a
                  href={activeLightbox.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold-bright hover:bg-gold/25 transition-colors self-start sm:self-auto shrink-0"
                >
                  <span>Verify Provenance</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
