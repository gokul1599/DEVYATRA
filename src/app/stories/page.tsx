import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui";
import { EDITORIAL_STORIES } from "@/lib/stories";

export const metadata: Metadata = {
  title: "Editorial Stories & Architectural Chronicles · Templeora",
  description: "Deeply researched cultural monographs, architectural treatises, and pilgrimage narratives exploring India's sacred heritage.",
};

export default function StoriesPage() {
  return (
    <main className="relative min-h-screen bg-[#0A0806] pt-28 pb-24">
      {/* Editorial Header */}
      <section className="relative pb-12 border-b border-stone-800/80">
        <Container>
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              The Templeora Chronicles
            </span>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F2ECE1] leading-tight">
              Stories in Stone &amp; Spirit
            </h1>
            <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-stone-300">
              Beyond facts and coordinates lie the civilizational memories of Bharat.
              Explore our archival monographs on Chola engineering, high-altitude Himalayan trails, sacred geometric cosmologies, and monumental rituals.
            </p>
          </div>
        </Container>
      </section>

      {/* Stories Grid */}
      <Container className="pt-12">
        <div className="grid gap-8 md:grid-cols-2">
          {EDITORIAL_STORIES.map((story) => (
            <Link
              key={story.slug}
              href={`/stories/${story.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 md:p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#C8A24B]/60 hover:bg-stone-900/90 shadow-2xl"
            >
              <div>
                {/* Hero Image Preview */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl mb-6">
                  <Image
                    src={story.heroImage.src}
                    alt={story.heroImage.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-black/60 backdrop-blur-md border border-stone-700/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#C8A24B]">
                      {story.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-stone-400">
                  <span className="flex items-center gap-1 text-[#C8A24B]">
                    <Clock className="h-3.5 w-3.5" />
                    {story.readingTimeMinutes} min read
                  </span>
                  <span>•</span>
                  <span>{story.publishDate}</span>
                </div>

                <h2 className="mt-3 font-serif text-2xl font-normal text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors leading-snug">
                  {story.title}
                </h2>

                <p className="mt-2 font-serif text-xs text-stone-400 italic">
                  {story.subtitle}
                </p>

                <p className="mt-4 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans line-clamp-3">
                  {story.excerpt}
                </p>
              </div>

              <div className="mt-6 border-t border-stone-800/80 pt-4 flex items-center justify-between text-xs font-mono text-[#C8A24B]">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Read Full Monograph
                </span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Archival Integrity Footer Note */}
        <div className="mt-16 rounded-3xl border border-stone-800/80 bg-stone-950/60 p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4 mb-4">
            <span className="font-mono text-xs text-[#C8A24B] uppercase tracking-widest">
              Archival Publishing Policy
            </span>
            <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> ASI &amp; Epigraphia Documented
            </span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed font-sans">
            Every chronicle published on Templeora is reviewed against authoritative epigraphical records, Archaeological Survey of India (ASI) survey reports, and official temple trust documentation. We strictly separate epigraphical facts from regional oral folklore.
          </p>
        </div>
      </Container>
    </main>
  );
}
