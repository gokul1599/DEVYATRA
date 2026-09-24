import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui";
import { SACRED_COLLECTIONS } from "@/lib/discovery/collections";
import { TEMPLES, getState, templeUrl } from "@/lib/registry";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SACRED_COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = SACRED_COLLECTIONS.find((c) => c.slug === slug);
  if (!collection) return { title: "Collection Not Found · Templeora" };

  return {
    title: `${collection.title} · Sacred Circuit · Templeora`,
    description: collection.description,
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = SACRED_COLLECTIONS.find((c) => c.slug === slug);
  if (!collection) notFound();

  // Find all matched temples from the registry
  const temples = collection.templeSlugs
    .map((s) => TEMPLES.find((t) => t.slug === s))
    .filter(Boolean);

  return (
    <main className="relative min-h-screen bg-[#0A0806] pt-24 pb-28">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-[#C8A24B] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Collections</span>
          </Link>
        </div>

        {/* Collection Header */}
        <div className="max-w-4xl space-y-4 border-b border-stone-800/80 pb-8 mb-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#C8A24B]/15 border border-[#C8A24B]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#E4BE72]">
              {collection.category.replace(/_/g, " ")}
            </span>
            <span className="font-mono text-xs text-stone-400">
              {collection.templeCount} Canonical Shrines
            </span>
            <span className="text-emerald-400 text-xs font-mono flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Epigraphically Verified
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F2ECE1] leading-tight">
            {collection.title}
          </h1>

          {collection.vernacularTitle && (
            <p className="font-serif text-lg text-[#E4BE72]/80 italic">
              {collection.vernacularTitle}
            </p>
          )}

          <p className="font-sans text-sm sm:text-base leading-relaxed text-stone-300 max-w-3xl">
            {collection.description}
          </p>

          <div className="rounded-2xl border border-stone-800/80 bg-stone-950/80 p-4 font-mono text-xs text-stone-300">
            <span className="text-[#C8A24B]">Epigraphical Authority:</span> {collection.epigraphicalEvidence}
          </div>

          <div className="pt-2">
            <Link
              href={`/plan?mode=circuit&circuit=${collection.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-6 py-3 font-mono text-xs uppercase tracking-wider text-[#0A0806] font-semibold hover:bg-[#E4BE72] transition-colors shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              <span>Compose AI Pilgrimage for this Circuit</span>
            </Link>
          </div>
        </div>

        {/* Temples in this Collection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
            <h2 className="font-serif text-2xl font-normal text-[#F2ECE1]">
              Sanctuaries in this Sacred Circuit ({temples.length})
            </h2>
            <span className="text-xs font-mono text-stone-400">
              Complete Circuit Checklist
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {temples.map((temple, idx) => {
              if (!temple) return null;
              const state = getState(temple.stateCode);

              return (
                <Link
                  key={temple.id}
                  href={templeUrl(temple)}
                  className="group flex flex-col justify-between rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#C8A24B]/60 hover:bg-stone-900/90 shadow-xl"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#C8A24B]/15 font-mono text-xs text-[#E4BE72]">
                        {idx + 1}
                      </span>
                      <div className="text-right">
                        <span className="font-mono text-[10px] uppercase text-stone-500">
                          {temple.architecture || "Traditional"}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-3 font-serif text-xl font-medium text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors leading-snug">
                      {temple.name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
                      <MapPin className="h-3 w-3 text-[#C8A24B] shrink-0" />
                      <span className="truncate">{temple.location}, {state?.name ?? temple.stateCode}</span>
                    </div>

                    <p className="mt-3 text-xs text-stone-300 line-clamp-3 leading-relaxed">
                      {temple.description}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-stone-800/80 pt-3 flex items-center justify-between text-xs font-mono text-stone-400 group-hover:text-[#C8A24B]">
                    <span>Enter Sanctuary Record</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </main>
  );
}
