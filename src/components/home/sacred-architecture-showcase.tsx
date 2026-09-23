"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Compass } from "lucide-react";
import { cn } from "@/lib/cn";
import { TRADITION_DETAILS, type TempleTradition } from "@/lib/architecture/canonical-model";
import { ARCHITECTURE_STYLE_IMAGES } from "@/lib/images/registry";

const TRADITIONS: TempleTradition[] = ["DRAVIDIAN", "NAGARA", "VESARA", "KALINGA"];

const TRADITION_IMAGES: Record<TempleTradition, typeof ARCHITECTURE_STYLE_IMAGES.Dravidian> = {
  DRAVIDIAN: ARCHITECTURE_STYLE_IMAGES.Dravidian,
  NAGARA: ARCHITECTURE_STYLE_IMAGES.Nagara,
  VESARA: ARCHITECTURE_STYLE_IMAGES.Vesara,
  KALINGA: ARCHITECTURE_STYLE_IMAGES.Kalinga,
};

export function SacredArchitectureShowcase() {
  const [selectedTradition, setSelectedTradition] = useState<TempleTradition>("DRAVIDIAN");
  const activeDetail = TRADITION_DETAILS[selectedTradition];
  const activeImage = TRADITION_IMAGES[selectedTradition];

  return (
    <div className="space-y-6">
      {/* Tradition Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {TRADITIONS.map((traditionKey) => {
          const t = TRADITION_DETAILS[traditionKey];
          const isSelected = selectedTradition === traditionKey;
          return (
            <button
              key={traditionKey}
              onClick={() => setSelectedTradition(traditionKey)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-300",
                isSelected
                  ? "bg-gold text-obsidian font-semibold shadow-lg shadow-gold/20 scale-105"
                  : "bg-obsidian-2 text-ivory-dim border border-line hover:border-gold/30 hover:text-ivory"
              )}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Showcase Feature Card */}
      <div className="overflow-hidden rounded-3xl border border-line bg-obsidian-2/95 shadow-2xl">
        <div className="grid lg:grid-cols-12 gap-0">
          {/* Authentic Architectural Photo */}
          <div className="relative min-h-[320px] lg:col-span-7 bg-obsidian">
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
              <span className="rounded-full bg-obsidian/80 backdrop-blur-md px-3 py-1 font-medium text-gold-bright border border-gold/30">
                {activeDetail.sanskritName}
              </span>
              <span className="rounded-full bg-obsidian/80 backdrop-blur-md px-2.5 py-0.5 text-[11px] text-ivory-dim">
                {activeImage.credit}
              </span>
            </div>
          </div>

          {/* Architectural Facts & Exemplars */}
          <div className="p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs text-gold">
                <Compass className="h-3.5 w-3.5" />
                <span className="font-mono uppercase tracking-wider">{activeDetail.regions}</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-ivory mb-2">
                {activeDetail.name}
              </h3>
              <p className="text-xs text-ivory-dim leading-relaxed mb-6">
                {activeDetail.description}
              </p>

              <div className="space-y-3 border-t border-line pt-4">
                <div className="rounded-xl border border-line/60 bg-obsidian/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">Superstructure</p>
                  <p className="text-xs text-ivory mt-0.5">{activeDetail.superstructure}</p>
                </div>

                <div className="rounded-xl border border-line/60 bg-obsidian/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">Gateway Architecture</p>
                  <p className="text-xs text-ivory mt-0.5">{activeDetail.gateway}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-ivory-dim uppercase tracking-wider mb-1.5">Notable Exemplars</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeDetail.notableExamples.map((ex) => (
                    <span
                      key={ex}
                      className="rounded-lg border border-line bg-obsidian px-2.5 py-1 text-xs text-ivory-dim"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-line text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[11px]">ASI Certified Taxonomy</span>
                </div>
                <Link
                  href="/temples"
                  className="inline-flex items-center gap-1 text-gold-bright hover:text-gold transition-colors font-medium text-xs"
                >
                  <span>Explore temples</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
