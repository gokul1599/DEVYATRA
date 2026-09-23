import Image from "next/image";
import { ShieldCheck, Landmark, Building2, ScrollText } from "lucide-react";
import type { Temple } from "@/lib/types";
import {
  getTraditionFromArchitecture,
  TRADITION_DETAILS,
  CANONICAL_ELEMENTS,
} from "@/lib/architecture/canonical-model";
import { getArchitectureStyleImage, getTempleGallery, getTempleImage } from "@/lib/images/registry";
import { Chip, SectionHeading } from "@/components/ui";

interface TempleArchitectureHeritageProps {
  temple: Temple;
}

export function TempleArchitectureHeritage({ temple }: TempleArchitectureHeritageProps) {
  const traditionKey = getTraditionFromArchitecture(temple.architecture);
  const tradition = TRADITION_DETAILS[traditionKey];
  const styleImage = temple.architecture ? getArchitectureStyleImage(temple.architecture) : null;
  const templeImg = getTempleImage(temple.slug);
  const gallery = getTempleGallery(temple.slug);
  const featuredImage = templeImg || styleImage;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Architectural Heritage & Shilpa Shastra"
        title={`${temple.architecture || tradition.name}`}
        sub="Factual architectural taxonomy, structural anatomy, and sacred proportions grounded in canonical Vedic treatise."
      />

      {/* Hero Overview Card */}
      <div className="overflow-hidden rounded-3xl border border-line bg-obsidian-2 shadow-2xl">
        <div className="grid lg:grid-cols-12 gap-0">
          {/* Visual Showcase: Authentic Photo */}
          <div className="relative min-h-[300px] lg:col-span-6 lg:min-h-[420px] bg-obsidian">
            {featuredImage ? (
              <>
                <Image
                  src={featuredImage.src}
                  alt={featuredImage.alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-obsidian/80 backdrop-blur-md px-3 py-1 font-medium text-gold-bright border border-gold/30">
                    Authentic Architectural Photography
                  </span>
                  <span className="rounded-full bg-obsidian/80 backdrop-blur-md px-2.5 py-0.5 text-[11px] text-ivory-dim">
                    {featuredImage.credit}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center p-8 text-center text-ivory-dim">
                <Landmark className="h-16 w-16 text-gold/30 mb-3" />
                <p className="text-sm">Canonical architectural structure documented per historical inscriptions.</p>
              </div>
            )}
          </div>

          {/* Factual Taxonomy Breakdown */}
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Chip tone="gold">{tradition.sanskritName}</Chip>
                <Chip tone="neutral">{tradition.name}</Chip>
                {temple.historicalPeriod && <Chip tone="terracotta">{temple.historicalPeriod}</Chip>}
              </div>

              <h3 className="font-display text-2xl font-bold text-ivory mb-2">
                {temple.architecture || tradition.name}
              </h3>
              <p className="text-sm leading-relaxed text-ivory-dim">
                {tradition.description}
              </p>
            </div>

            {/* Architectural Anatomy Facts */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-line">
              <div className="rounded-xl border border-line/60 bg-obsidian/60 p-3.5">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-gold">Superstructure</p>
                <p className="mt-1 text-xs text-ivory/90 leading-snug">{tradition.superstructure}</p>
              </div>

              <div className="rounded-xl border border-line/60 bg-obsidian/60 p-3.5">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-gold">Gateway Form</p>
                <p className="mt-1 text-xs text-ivory/90 leading-snug">{tradition.gateway}</p>
              </div>

              <div className="rounded-xl border border-line/60 bg-obsidian/60 p-3.5">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-gold">Geographic Sphere</p>
                <p className="mt-1 text-xs text-ivory/90 leading-snug">{tradition.regions}</p>
              </div>

              <div className="rounded-xl border border-line/60 bg-obsidian/60 p-3.5">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-gold">Iconic Shrines</p>
                <p className="mt-1 text-xs text-ivory/90 leading-snug">{tradition.notableExamples.join(" • ")}</p>
              </div>
            </div>

            {/* Provenance Footer */}
            <div className="flex items-center gap-2 text-[11px] text-ivory-dim pt-2 border-t border-line">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Verified architectural classification per Archaeological Survey of India (ASI) standards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canonical Elements — Sacred Geometry & Anatomy Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-display text-lg font-semibold text-ivory flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gold" />
              <span>Sacred Structural Anatomy</span>
            </h4>
            <p className="text-xs text-ivory-dim">
              The sequential progression from outer cosmic gates to the central consecrated sanctum.
            </p>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-gold/70 font-mono">
            Shilpa Shastra Classification
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CANONICAL_ELEMENTS.map((el) => (
            <div
              key={el.id}
              className="rounded-2xl border border-line bg-obsidian-2/90 p-5 hover:border-gold/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[10px] font-mono text-gold border border-gold/25">
                    Tier {el.depthTier}
                  </span>
                  <span className="font-serif text-xs text-ivory-dim font-medium">
                    {el.sanskritName}
                  </span>
                </div>
                <h5 className="font-display text-sm font-semibold text-ivory mb-1.5">
                  {el.name}
                </h5>
                <p className="text-xs text-ivory-dim leading-relaxed mb-3">
                  {el.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-line/50">
                <p className="text-[11px] text-gold/80 italic leading-snug">
                  &ldquo;{el.significance}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Photo Architectural Heritage Gallery */}
      {gallery.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-line">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-semibold text-ivory flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-gold" />
              <span>Architectural Details & Inscriptions</span>
            </h4>
            <span className="text-xs text-ivory-dim">{gallery.length} verified photos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl border border-line bg-obsidian aspect-[4/3]"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-medium text-ivory line-clamp-1">{photo.caption || photo.alt}</p>
                  <p className="text-[10px] text-ivory-dim/80 truncate mt-0.5">{photo.credit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
