import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck, MapPin, ExternalLink, Quote } from "lucide-react";
import { Container } from "@/components/ui";
import { EDITORIAL_STORIES, getStoryBySlug } from "@/lib/stories";
import { TEMPLES, templeUrl } from "@/lib/registry";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return EDITORIAL_STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return { title: "Story Not Found · Templeora" };

  return {
    title: `${story.title} · Templeora Chronicles`,
    description: story.excerpt,
    openGraph: {
      title: story.title,
      description: story.excerpt,
      images: [{ url: story.heroImage.src }],
    },
  };
}

export default async function StoryDetailPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();

  // Find related temples
  const relatedTemples = story.relatedTempleSlugs
    .map((s) => TEMPLES.find((t) => t.slug === s))
    .filter(Boolean);

  return (
    <main className="relative min-h-screen bg-[#0A0806] pt-24 pb-28">
      <Container className="max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-[#C8A24B] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Templeora Chronicles</span>
          </Link>
        </div>

        {/* Story Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#C8A24B]/15 border border-[#C8A24B]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#E4BE72]">
              {story.category}
            </span>
            <span className="text-xs font-mono text-stone-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#C8A24B]" />
              {story.readingTimeMinutes} min read
            </span>
            <span className="text-stone-500">•</span>
            <span className="text-xs font-mono text-stone-400">{story.publishDate}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F2ECE1] leading-tight">
            {story.title}
          </h1>

          <p className="font-serif text-lg sm:text-xl text-stone-300 italic leading-relaxed">
            {story.subtitle}
          </p>
        </div>

        {/* Hero Image Showcase */}
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-stone-800/80 bg-stone-950 shadow-2xl">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={story.heroImage.src}
              alt={story.heroImage.alt}
              fill
              priority
              className="object-cover brightness-[0.9] contrast-[1.05]"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
          <div className="p-4 md:p-5 border-t border-stone-800/80 bg-stone-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-stone-400">
            <span>{story.heroImage.caption}</span>
            <span className="text-stone-500 shrink-0">Credit: {story.heroImage.credit}</span>
          </div>
        </div>

        {/* Story Body Paragraphs */}
        <article className="mt-12 space-y-12">
          {story.content.map((sec, idx) => (
            <div key={idx} className="space-y-6">
              {sec.sectionTitle && (
                <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#F2ECE1] border-b border-stone-800/70 pb-3">
                  {sec.sectionTitle}
                </h2>
              )}

              {sec.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  className="font-sans text-base sm:text-lg text-stone-200 leading-relaxed tracking-normal"
                >
                  {p}
                </p>
              ))}

              {sec.quote && (
                <div className="my-8 rounded-2xl border-l-2 border-[#C8A24B] bg-[#C8A24B]/5 p-6 pl-8">
                  <Quote className="h-6 w-6 text-[#C8A24B] mb-2" />
                  <p className="font-serif text-xl italic text-[#F2ECE1] leading-relaxed">
                    &ldquo;{sec.quote}&rdquo;
                  </p>
                </div>
              )}
            </div>
          ))}
        </article>

        {/* Related Sanctuaries */}
        {relatedTemples.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-800/80 space-y-6">
            <div>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#C8A24B]">
                Geographic Nodes
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#F2ECE1] mt-1">
                Sanctuaries Mentioned in this Chronicle
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {relatedTemples.map((temple) => {
                if (!temple) return null;
                return (
                  <Link
                    key={temple.id}
                    href={templeUrl(temple)}
                    className="group flex flex-col justify-between rounded-2xl border border-stone-800/80 bg-stone-950/80 p-5 transition-all hover:border-[#C8A24B]/50 hover:bg-stone-900/80"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#C8A24B]">
                        <MapPin className="h-3 w-3" />
                        <span>{temple.location}, {temple.district}</span>
                      </div>
                      <h4 className="mt-2 font-serif text-lg font-medium text-[#F2ECE1] group-hover:text-[#E4BE72] transition-colors">
                        {temple.name}
                      </h4>
                      <p className="mt-1 text-xs text-stone-400 line-clamp-2">
                        {temple.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/70 flex items-center justify-between text-xs font-mono text-stone-400">
                      <span>View Sanctuary Record</span>
                      <ExternalLink className="h-3.5 w-3.5 text-[#C8A24B]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Source Archive Transparency */}
        <div className="mt-16 rounded-3xl border border-stone-800/80 bg-stone-950/70 p-6 md:p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-stone-800/80 pb-4 mb-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h4 className="font-serif text-lg font-medium text-[#F2ECE1]">
              Source Provenance &amp; Verification Monograph
            </h4>
          </div>

          <div className="space-y-3 font-mono text-xs text-stone-300">
            <div>
              <span className="text-[#C8A24B]">Primary Reference:</span> {story.sourceArchive.primarySource}
            </div>
            {story.sourceArchive.gazetteerRef && (
              <div>
                <span className="text-[#C8A24B]">Gazetteer Reference:</span> {story.sourceArchive.gazetteerRef}
              </div>
            )}
            <div>
              <span className="text-[#C8A24B]">Audit Level:</span> {story.sourceArchive.auditStatus}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
