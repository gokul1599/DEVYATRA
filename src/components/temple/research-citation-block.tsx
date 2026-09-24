"use client";

import { useState } from "react";
import { BookOpen, Copy, Check, ScrollText, Landmark, ShieldCheck, Quote } from "lucide-react";
import type { Temple } from "@/lib/types";

interface ResearchCitationBlockProps {
  temple: Temple;
  stateName: string;
}

export function ResearchCitationBlock({ temple, stateName }: ResearchCitationBlockProps) {
  const [citationFormat, setCitationFormat] = useState<"apa" | "chicago" | "bibtex">("apa");
  const [copied, setCopied] = useState(false);

  const currentYear = new Date().getFullYear();
  const canonicalUrl = `https://templeora.vercel.app/temples/${temple.stateCode.toLowerCase()}/${temple.slug}`;

  const getCitationText = () => {
    switch (citationFormat) {
      case "apa":
        return `Templeora Sacred Atlas. (${currentYear}). ${temple.name} (${temple.district}, ${stateName}): Architectural classification, epigraphical history, and canonical records. Retrived from ${canonicalUrl}`;
      case "chicago":
        return `Templeora Sacred Atlas. "${temple.name} (${temple.district}, ${stateName})." National Sacred Atlas of India, ${currentYear}. ${canonicalUrl}.`;
      case "bibtex":
        return `@misc{templeora_${temple.slug.replace(/-/g, "_")},
  author = {{Templeora Sacred Research Archive}},
  title = {{${temple.name}: Architectural Classification and Epigraphical Chronicles}},
  year = {${currentYear}},
  howpublished = {\\url{${canonicalUrl}}},
  note = {District: ${temple.district}, State: ${stateName}, Architecture: ${temple.architecture || "Canonical Classical"}}
}`;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCitationText());
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {}
  };

  return (
    <div className="rounded-3xl border border-line bg-obsidian-2/90 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/15 text-gold-bright border border-gold/25">
            <ScrollText className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-xl font-medium text-ivory">
              Epigraphical Provenance &amp; Scholarly Citation
            </h3>
            <p className="text-xs text-ivory-dim">
              Verified historical record, epigraphical distinctions, and academic research citations.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Epigraphical Cross-Reference</span>
        </span>
      </div>

      {/* Epigraphy vs Sthala Purana Methodological Delineation */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-obsidian-3/60 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
            <Landmark className="h-3.5 w-3.5" />
            <span>Archaeological &amp; Inscriptional Record</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Historical chronology is derived from epigraphical records (*tamra-shasana*, stone inscriptions), Archaeological Survey of India (ASI) surveys, and dynastic patronage evidence.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-gold-dim">
            <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5">
              Period: {temple.historicalPeriod || "Ancient / Classical Era"}
            </span>
            {temple.architecture && (
              <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5">
                Style: {temple.architecture}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-obsidian-3/60 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E5A93C] uppercase tracking-wider">
            <Quote className="h-3.5 w-3.5" />
            <span>Sthala Purana &amp; Living Sacred Memory</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Spiritual narratives, saint-hymns (Alvars, Nayanars, Bhakti poets), and sanctum legends reflect unbroken liturgical sacred tradition (*sthala mahatmya*), distinguished from political chronological strata.
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-[#E5A93C]/80">
            <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5">
              Tradition: {temple.tradition.join(", ") || "Vedic Agamic"}
            </span>
            <span className="rounded bg-black/40 px-2 py-0.5 border border-white/5">
              Deity: {temple.mainDeity}
            </span>
          </div>
        </div>
      </div>

      {/* Academic Citation Box */}
      <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" />
            <span className="text-xs font-medium text-ivory">Academic Research Citation</span>
          </div>

          <div className="flex items-center gap-1.5 bg-obsidian-2 rounded-xl p-1 border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => setCitationFormat("apa")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                citationFormat === "apa"
                  ? "bg-gold text-obsidian font-semibold"
                  : "text-stone-400 hover:text-ivory"
              }`}
            >
              APA
            </button>
            <button
              type="button"
              onClick={() => setCitationFormat("chicago")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                citationFormat === "chicago"
                  ? "bg-gold text-obsidian font-semibold"
                  : "text-stone-400 hover:text-ivory"
              }`}
            >
              Chicago
            </button>
            <button
              type="button"
              onClick={() => setCitationFormat("bibtex")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                citationFormat === "bibtex"
                  ? "bg-gold text-obsidian font-semibold"
                  : "text-stone-400 hover:text-ivory"
              }`}
            >
              BibTeX
            </button>
          </div>
        </div>

        <div className="relative rounded-xl border border-white/[0.08] bg-obsidian-3/80 p-3 sm:p-4 font-mono text-[11.5px] leading-relaxed text-stone-300 overflow-x-auto whitespace-pre-wrap select-all">
          {getCitationText()}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-stone-400">
            For academic papers, field studies, and dissertation references
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-obsidian transition-colors hover:bg-gold-bright shadow"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Citation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
