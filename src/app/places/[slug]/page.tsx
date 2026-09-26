import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Ticket,
  Car,
  ExternalLink,
  Landmark,
  Share2,
} from "lucide-react";
import { Container, Breadcrumbs } from "@/components/ui";
import { getDestinationBySlug, CATEGORY_METADATA } from "@/lib/destinations/registry";
import { DestinationService } from "@/lib/destinations/service";
import { getPrisma } from "@/lib/db/client";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const destination = await DestinationService.getBySlug(slug);

  if (!destination) {
    return {
      title: "Destination Not Found | Devyatra",
    };
  }

  return {
    title: `${destination.name} — ${destination.subcategory || destination.category} | Devyatra`,
    description: destination.description.slice(0, 160),
    openGraph: {
      title: `${destination.name} | Devyatra Sacred & Travel Atlas`,
      description: destination.description,
      images: [{ url: destination.image, width: 1200, height: 630, alt: destination.name }],
    },
  };
}

export default async function PlaceDetailPage({ params }: Props) {
  const { slug } = await params;
  const destination = await DestinationService.getBySlug(slug);

  if (!destination) {
    notFound();
  }

  const catMeta = CATEGORY_METADATA[destination.category] || CATEGORY_METADATA.HERITAGE;

  return (
    <main className="min-h-screen bg-[#0A0806] text-[#F2ECE1] pb-24">
      {/* 01. Breadcrumb bar */}
      <div className="border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md">
        <Container wide className="py-3">
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Explore India", href: "/explore" },
              { label: destination.state, href: `/explore` },
              { label: destination.name },
            ]}
          />
        </Container>
      </div>

      {/* 02. Cinematic Hero Section */}
      <section className="relative h-[55vh] min-h-[420px] max-h-[640px] w-full overflow-hidden">
        <Image
          src={destination.image}
          alt={destination.imageAlt}
          fill
          priority
          className="object-cover brightness-[0.75]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0806] via-[#0A0806]/40 to-black/30" />

        <Container wide className="absolute inset-x-0 bottom-0 pb-10 z-10">
          <div className="max-w-3xl">
            {/* Category and Provenance Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-semibold border ${catMeta.badgeColor}`}>
                <span>{catMeta.icon}</span>
                <span>{destination.category}</span>
              </span>
              <span className="rounded-full bg-stone-900/80 px-3 py-1 text-xs font-mono text-stone-300 border border-stone-700/60 backdrop-blur-sm">
                {destination.subcategory}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Provenance ({destination.provenance.sourceType.toUpperCase()})</span>
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#F2ECE1] leading-tight">
              {destination.name}
            </h1>

            {destination.nativeName && (
              <p className="mt-2 font-serif text-lg text-[#C8A24B] opacity-90">
                {destination.nativeName}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-stone-300">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#C8A24B]" />
                {[destination.city, destination.district, destination.state].filter(Boolean).join(", ")}
              </span>
              <span>•</span>
              <span className="text-stone-400">
                Lat: {destination.latitude.toFixed(4)}°, Lng: {destination.longitude.toFixed(4)}°
              </span>
            </div>
          </div>
        </Container>

        {/* Image Attribution Notice (Strict Transparency) */}
        <div className="absolute bottom-3 right-4 z-10 hidden sm:block">
          <div className="rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-mono text-stone-400 backdrop-blur-md border border-stone-800">
            Photo: {destination.imageCredit.photographer} · {destination.imageCredit.source} ({destination.imageCredit.license})
          </div>
        </div>
      </section>

      {/* 03. Core Body & Details */}
      <Container wide className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Context Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview */}
            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/70 p-8 backdrop-blur-sm">
              <h2 className="font-serif text-2xl font-medium text-[#F2ECE1]">
                About This Destination
              </h2>
              <p className="mt-4 font-sans text-base leading-relaxed text-stone-300">
                {destination.description}
              </p>

              {/* Highlights */}
              <div className="mt-8 pt-6 border-t border-stone-800/80">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#C8A24B] mb-4">
                  Key Experiences &amp; Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-xl border border-stone-800 bg-stone-900/40 p-3 text-xs text-stone-200"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C8A24B]/15 text-[10px] font-mono font-semibold text-[#C8A24B]">
                        0{i + 1}
                      </span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sacred Anchor Bridge (Temple + Destination Connection) */}
            {destination.nearbyTempleAnchor && (
              <div className="rounded-3xl border border-[#C8A24B]/40 bg-gradient-to-br from-[#1C160C] to-stone-950 p-8 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#C8A24B]">
                  <Landmark className="h-4 w-4" />
                  <span>Sacred Temple Anchor</span>
                </div>
                <h3 className="mt-2 font-serif text-2xl font-medium text-[#F2ECE1]">
                  Pilgrimage Bridge: {destination.nearbyTempleAnchor.name}
                </h3>
                <p className="mt-3 text-sm text-stone-300 leading-relaxed">
                  This destination is organically connected to the sacred energy field of{" "}
                  <strong className="text-stone-100">{destination.nearbyTempleAnchor.name}</strong>, located just{" "}
                  <strong className="text-[#C8A24B]">{destination.nearbyTempleAnchor.distanceKm} km</strong> away. Pilgrims commonly combine both sites into a single morning or day yatra.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/temples`}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#C8A24B] px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-black hover:bg-[#E4BE72] transition-colors"
                  >
                    <span>View Temple Guide</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/map?lat=${destination.latitude}&lng=${destination.longitude}&zoom=14`}
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-900/60 px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-stone-200 hover:border-[#C8A24B] transition-colors"
                  >
                    <Compass className="h-3.5 w-3.5 text-[#C8A24B]" />
                    <span>View Transit on Sacred Atlas</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Info & Action Sidebar */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/70 p-6 backdrop-blur-sm space-y-6">
              <h3 className="font-serif text-lg font-medium text-[#F2ECE1] border-b border-stone-800/80 pb-3">
                Visiting Information
              </h3>

              <div className="space-y-4 text-xs font-mono">
                {/* Best Season */}
                {destination.bestTimeToVisit && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 shrink-0 text-[#C8A24B] mt-0.5" />
                    <div>
                      <span className="text-stone-400 block">Best Time to Visit</span>
                      <span className="text-stone-200 font-sans font-medium text-sm mt-0.5 block">
                        {destination.bestTimeToVisit}
                      </span>
                    </div>
                  </div>
                )}

                {/* Timings */}
                {destination.timings ? (
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 shrink-0 text-[#C8A24B] mt-0.5" />
                    <div>
                      <span className="text-stone-400 block">Timings</span>
                      <span className="text-stone-200 font-sans font-medium text-sm mt-0.5 block">
                        {destination.timings}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 shrink-0 text-stone-500 mt-0.5" />
                    <div>
                      <span className="text-stone-400 block">Timings</span>
                      <span className="text-stone-400 font-sans text-xs mt-0.5 block italic">
                        Visiting hours not currently verified
                      </span>
                    </div>
                  </div>
                )}

                {/* Entry Fee */}
                {destination.entryFee ? (
                  <div className="flex items-start gap-3">
                    <Ticket className="h-4 w-4 shrink-0 text-[#C8A24B] mt-0.5" />
                    <div>
                      <span className="text-stone-400 block">Entry Fee</span>
                      <span className="text-stone-200 font-sans font-medium text-sm mt-0.5 block">
                        {destination.entryFee}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Ticket className="h-4 w-4 shrink-0 text-stone-500 mt-0.5" />
                    <div>
                      <span className="text-stone-400 block">Entry Fee</span>
                      <span className="text-stone-400 font-sans text-xs mt-0.5 block italic">
                        Tariffs subject to local authority
                      </span>
                    </div>
                  </div>
                )}

                {/* Duration */}
                {destination.recommendedDuration && (
                  <div className="flex items-start gap-3">
                    <Compass className="h-4 w-4 shrink-0 text-[#C8A24B] mt-0.5" />
                    <div>
                      <span className="text-stone-400 block">Recommended Duration</span>
                      <span className="text-stone-200 font-sans font-medium text-sm mt-0.5 block">
                        {destination.recommendedDuration}
                      </span>
                    </div>
                  </div>
                )}

                {/* Official Website */}
                {destination.officialWebsite && (
                  <div className="pt-2 border-t border-stone-800/60">
                    <a
                      href={destination.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#C8A24B] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Official Website / ASI Portal</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-800/80 space-y-2.5">
                <Link
                  href={`/map?place=${destination.slug || destination.id}&lat=${destination.latitude}&lng=${destination.longitude}&zoom=15`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A24B] py-3 text-xs font-mono font-semibold uppercase tracking-wider text-black hover:bg-[#E4BE72] transition-colors shadow-lg shadow-[#C8A24B]/10"
                >
                  <Compass className="h-4 w-4" />
                  <span>View on Sacred Map</span>
                </Link>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900/60 py-2.5 text-xs font-mono uppercase tracking-wider text-stone-200 hover:border-[#C8A24B] transition-colors"
                >
                  <Car className="h-3.5 w-3.5 text-[#C8A24B]" />
                  <span>Get Driving Directions</span>
                </a>

                <Link
                  href={`/plan?destination=${encodeURIComponent(destination.name)}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900/40 py-2.5 text-xs font-mono uppercase tracking-wider text-stone-300 hover:text-white transition-colors"
                >
                  <span>Add to Custom Yatra Plan</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Provenance Box */}
            <div className="rounded-2xl border border-stone-800/60 bg-stone-950/40 p-4 text-[11px] font-mono text-stone-400 leading-relaxed">
              <span className="text-stone-300 block font-semibold mb-1">
                Data Provenance &amp; Authority
              </span>
              Verified against statutory records ({destination.provenance.sourceType.toUpperCase()}) on {destination.provenance.verifiedDate}. All coordinates are validated within sovereign territory.
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
