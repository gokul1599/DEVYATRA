import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui";
import { SACRED_COLLECTIONS } from "@/lib/discovery/collections";

export const metadata: Metadata = {
  title: "Thematic Pilgrimage Collections · Templeora",
  description: "Canonical sacred collections backed by scriptural and epigraphical records: 12 Jyotirlingas, Pancha Bhoota Sthalams, Char Dham, and UNESCO World Heritage Sanctuaries.",
};

export default function CollectionsPage() {
  return (
    <main className="relative min-h-screen bg-[#0A0806] pt-28 pb-24">
      {/* Editorial Header */}
      <section className="relative pb-12 border-b border-stone-800/80">
        <Container>
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Thematic Pilgrimage Codex
            </span>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F2ECE1] leading-tight">
              Sacred Collections of Bharat
            </h1>
            <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-stone-300">
              Pilgrimage in India follows timeless cosmological patterns. Explore our curated sacred circuits
              grounded in the Puranas, Sangam literature, and Archaeological Survey of India documentation.
            </p>
          </div>
        </Container>
      </section>

      {/* Collections Grid */}
      <Container className="pt-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SACRED_COLLECTIONS.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 md:p-7 backdrop-blur-sm transition-all duration-300 hover:border-[#C8A24B]/60 hover:bg-stone-900/90 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[#C8A24B]/15 border border-[#C8A24B]/30 px-3 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#E4BE72]">
                    {c.category.replace(/_/g, " ")}
                  </span>
                  <span className="font-mono text-xs text-stone-400">
                    {c.templeCount} Sanctuaries
                  </span>
                </div>

                <h2 className="mt-4 font-serif text-2xl font-normal text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors leading-snug">
                  {c.title}
                </h2>

                {c.vernacularTitle && (
                  <p className="mt-1 font-serif text-xs text-[#E4BE72]/70 italic">
                    {c.vernacularTitle}
                  </p>
                )}

                <p className="mt-3 text-xs leading-relaxed text-stone-300 font-sans line-clamp-3">
                  {c.description}
                </p>

                <div className="mt-5 rounded-2xl border border-stone-800/70 bg-stone-900/40 p-3 text-[11px] font-mono text-stone-400">
                  <span className="text-[#C8A24B]">Epigraphical Source:</span> {c.epigraphicalEvidence}
                </div>
              </div>

              <div className="mt-6 border-t border-stone-800/80 pt-4 flex items-center justify-between text-xs font-mono text-[#C8A24B]">
                <span>Explore Shrines in Circuit</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
