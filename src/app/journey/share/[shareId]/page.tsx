import { notFound } from "next/navigation";
import Link from "next/link";
import { getSharedJourney } from "@/lib/journeys";
import { Container } from "@/components/ui";
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  Users,
  HeartHandshake,
  Accessibility,
  ArrowRight,
  Share2,
  Copy,
  Landmark,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";
import { CalendarDownloadButton } from "@/components/journey/calendar-download-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareId: string }>;
}): Promise<Metadata> {
  const { shareId } = await params;
  const data = await getSharedJourney(shareId);
  if (!data) return { title: "Shared Sacred Journey — Templeora" };

  return {
    title: `${data.journey.title} — Shared Pilgrimage Itinerary`,
    description: `A sacred pilgrimage itinerary featuring ${data.journey.templeNames.join(", ")} created by ${data.authorName}.`,
    openGraph: {
      title: `${data.journey.title} · Templeora Pilgrimage`,
      description: `Sacred pilgrimage itinerary spanning ${data.journey.totalDays} days across ${data.journey.templeNames.length} sanctuaries.`,
    },
  };
}

export default async function SharedJourneyPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const data = await getSharedJourney(shareId);

  if (!data) {
    notFound();
  }

  const { journey, authorName, createdAt, viewsCount } = data;
  const cloneUrl = `/plan?temples=${encodeURIComponent(journey.templeSlugs.join(","))}&days=${journey.totalDays}&travelMode=${journey.travelMode}&budget=${journey.budget}`;

  return (
    <main className="min-h-screen bg-obsidian text-ivory py-16">
      <Container className="max-w-4xl">
        {/* Top Banner */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-gold animate-ping" />
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
              Shared Sacred Journey
            </span>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-ivory/60 border border-white/10">
              {viewsCount} views
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CalendarDownloadButton journey={journey} variant="hero" />
            <Link
              href={cloneUrl}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron to-gold px-5 py-2.5 text-xs font-semibold text-obsidian shadow-lg transition-transform hover:scale-105"
            >
              <span>Clone & Customize This Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#1C1610] to-[#120E0A] p-8 sm:p-10 shadow-2xl">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-ivory/60">
              <span>Curated by <strong className="text-gold">{authorName}</strong></span>
              <span>•</span>
              <span>Published on {new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ivory">
              {journey.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-ivory/80">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                <Calendar className="h-3.5 w-3.5 text-gold" />
                {journey.totalDays} Days ({journey.startDate})
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                <Car className="h-3.5 w-3.5 text-gold" />
                {journey.travelMode.toUpperCase()}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                <IndianRupee className="h-3.5 w-3.5 text-gold" />
                {journey.budget.toUpperCase()} BUDGET
              </span>
            </div>

            {/* Persona Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {journey.familyMode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/20">
                  <Users className="h-3 w-3" /> Family Calibrated
                </span>
              )}
              {journey.seniorMode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/20">
                  <HeartHandshake className="h-3 w-3" /> Senior Friendly
                </span>
              )}
              {journey.accessibilityMode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-300 border border-blue-500/20">
                  <Accessibility className="h-3 w-3" /> Accessible
                </span>
              )}
            </div>

            {journey.notes && (
              <p className="mt-4 rounded-2xl bg-black/30 p-4 text-sm leading-relaxed text-ivory/80 italic border border-white/5">
                &ldquo;{journey.notes}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Temple Order / Route */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-serif text-2xl font-semibold text-ivory">
              Pilgrimage Sequence ({journey.templeNames.length} Sanctuaries)
            </h2>
            <span className="text-xs font-mono text-ivory/60">
              Verified Order
            </span>
          </div>

          <div className="space-y-4">
            {journey.templeNames.map((name, index) => {
              const slug = journey.templeSlugs[index] || "";
              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#16120E] p-4 sm:p-5 transition-all hover:border-gold/40"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 font-mono text-sm font-bold text-gold border border-gold/30">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-medium text-ivory">
                        {name}
                      </h3>
                      <p className="font-mono text-xs text-ivory/60 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-gold" />
                        Sacred Shrine #{index + 1} in circuit
                      </p>
                    </div>
                  </div>

                  {slug && (
                    <Link
                      href={`/temple/${slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gold transition-colors hover:bg-gold hover:text-obsidian"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-[#14100C] p-8 text-center space-y-4">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-ivory">
            Embark on this Pilgrimage
          </h3>
          <p className="text-xs sm:text-sm text-ivory/70 max-w-lg mx-auto">
            Take this itinerary into Plan Studio to customize dates, adjust daily pacing, check live weather forecasts, and compute accurate travel budgets.
          </p>
          <div className="pt-2">
            <Link
              href={cloneUrl}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron to-gold px-8 py-3 text-sm font-semibold text-obsidian shadow-xl transition-transform hover:scale-105"
            >
              <span>Open in Devyatra Plan Studio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
