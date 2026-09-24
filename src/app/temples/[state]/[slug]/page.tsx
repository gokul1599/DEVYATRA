import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  MapPin,
  Landmark,
  Clock,
  Ticket,
  CalendarDays,
  ShieldCheck,
  ExternalLink,
  Quote,
  Navigation,
  Flag,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { getState, nearbyFor, templeUrl, TEMPLES, templesByState } from "@/lib/registry";
import { resolveTemple } from "@/lib/db/directory";
import { VERIFY_LABEL } from "@/lib/format";
import { Container, Breadcrumbs, Chip, SectionHeading } from "@/components/ui";
import { SaveButton } from "@/components/save-button";
import { LiveStatus, PlanCta } from "@/components/temple/live";
import { LiveTempleIntelligence } from "@/components/temple/live-intelligence";
import { AiPanel } from "@/components/temple/ai-panel";
import { TempleCard } from "@/components/temple-card";
import { Reveal } from "@/components/motion";
import { SacredAmbient } from "@/components/sacred-ambient";
import { GsapCinematicHero } from "@/components/gsap-cinematic";
import { NearbyPlaceEngine } from "@/lib/nearby/engine";
import { ExploreAround } from "@/components/temple/explore-around";
import { VisitCommandCenter } from "@/components/temple/visit-command-center";
import { TempleDayView } from "@/components/temple/temple-day-view";
import { SeniorEase } from "@/components/temple/senior-ease";
import { FamilyComfort } from "@/components/temple/family-comfort";
import { P1PersonaExplorer } from "@/components/temple/p1-personas";
import { TempleExtendedDiscovery } from "@/components/temple/temple-extended-discovery";
import { AccessPointsCard } from "@/components/temple/access-points-card";
import { VisitLogisticsPanel } from "@/components/temple/visit-logistics-panel";
import { SafetyModeModal } from "@/components/temple/safety-mode-modal";
import { WhatChangedCard } from "@/components/temple/what-changed-card";
import { buildMasterDestinationIntelligence } from "@/lib/intelligence/context-engine";
import { CinematicImage } from "@/components/ui/cinematic-image";
import { resolvePrimaryTempleMedia } from "@/lib/images/resolver";
import { TempleArchitectureHeritage } from "@/components/temple/temple-architecture-heritage";
import { TempleScrollGuard } from "@/components/temple/temple-scroll-guard";
import { TempleMediaGallery } from "@/components/temple/temple-media-gallery";
import { TempleTopBar } from "@/components/temple/temple-top-bar";
import { TempleDna } from "@/components/temple/temple-dna";
import { SourceTransparencyDrawer } from "@/components/temple/source-transparency-drawer";
import { cn } from "@/lib/cn";

export const dynamicParams = true;

export async function generateStaticParams() {
  const out: { state: string; slug: string }[] = [];
  for (const t of TEMPLES) {
    const st = getState(t.stateCode);
    if (st) out.push({ state: st.slug, slug: t.slug });
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = await resolveTemple(slug);
  if (!t) return { title: "Temple not found" };
  return {
    title: `${t.name} — timings, history & booking`,
    description: t.description.slice(0, 158),
    alternates: { canonical: templeUrl(t) },
    openGraph: {
      title: `${t.name} · ${t.district}, ${t.location}`,
      description: t.description.slice(0, 158),
      type: "website",
    },
  };
}

const KIND_LABEL: Record<string, string> = {
  temple: "Temples", restaurant: "Restaurants", hotel: "Hotels", attraction: "Historical places",
  nature: "Nature", shopping: "Shopping", parking: "Parking", hospital: "Hospitals",
  pharmacy: "Pharmacies", police: "Police", restroom: "Restrooms", atm: "ATMs", fuel: "Fuel", transport: "Transport",
};

export default async function TemplePage({ params }: { params: Promise<{ state: string; slug: string }> }) {
  const { state: stateSlug, slug } = await params;
  const temple = await resolveTemple(slug);
  if (!temple) notFound();
  const masterIntelligence = await buildMasterDestinationIntelligence(temple.id);

  const st =
    getState(stateSlug) ||
    getState(temple.stateCode) || {
      name: temple.stateCode,
      slug: stateSlug,
      code: temple.stateCode,
      type: "state" as const,
      subUnitTerm: "subdivision",
      capital: "Capital",
      districts: [temple.districtSlug],
    };

  const stateTemples = templesByState(st.code).filter((t2) => t2.slug !== slug).slice(0, 4);
  const nearbyPlacesResult = await NearbyPlaceEngine.getNearbyForTemple(
    temple.id,
    temple.latitude,
    temple.longitude,
    temple.locationKind
  );
  const nearby = nearbyFor(temple.id);
  const byKind = nearby.reduce<Record<string, typeof nearby>>((acc, n) => {
    acc[n.kind] ??= [];
    acc[n.kind].push(n);
    return acc;
  }, {});

  const structData = {
    "@context": "https://schema.org",
    "@type": "HinduTemple",
    name: temple.name,
    alternateName: temple.aliases,
    description: temple.description.slice(0, 300),
    url: templeUrl(temple),
    deity: temple.mainDeity,
    locatedIn: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: temple.location,
        addressRegion: st.name,
        addressCountry: "IN",
      },
    },
    geo: { "@type": "GeoCoordinates", latitude: temple.latitude, longitude: temple.longitude },
    ...(temple.booking.bookingUrl ? { sameAs: [temple.booking.bookingUrl] } : {}),
  };

  const canBook =
    temple.booking.bookingMode === "online" &&
    temple.booking.bookingUrl &&
    (temple.booking.verification.status === "VERIFIED_OFFICIAL" ||
      temple.booking.verification.status === "GOVERNMENT_SOURCE" ||
      temple.booking.verification.status === "TRUSTED_SOURCE");

  const heroMedia = resolvePrimaryTempleMedia(temple);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structData) }} />
      <TempleScrollGuard />
      <TempleTopBar
        templeSlug={temple.slug}
        templeName={temple.name}
        stateName={st.name}
        stateCode={st.code}
      />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden pt-28">
        <SacredAmbient />
        <div className="absolute inset-0 -z-10">
          <CinematicImage
            media={heroMedia}
            artSeed={temple.slug}
            alt={temple.name}
            aspectRatio="16/9"
            priority
            showCreditBadge={heroMedia.hasFactualPhoto}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/75 via-obsidian/50 to-obsidian" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/60 to-transparent" />
        </div>

        <Container className="pb-14 pt-6">
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Explore India", href: "/explore" },
              { label: st.name, href: `/explore/${st.slug}` },
              { label: temple.district, href: `/explore/${st.slug}/${temple.districtSlug}` },
              { label: temple.name },
            ]}
            className="mb-6"
          />

          <GsapCinematicHero className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-1 text-xs font-mono uppercase tracking-wider text-stone-200 border border-stone-800 backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C8A24B]" />
                <span>{VERIFY_LABEL[temple.booking.verification.status]}</span>
              </span>
              {temple.badges.includes("UNESCO World Heritage") && (
                <span className="rounded-full bg-[#C8A24B]/15 px-3 py-1 font-mono text-xs uppercase tracking-wider text-[#E4BE72] border border-[#C8A24B]/30">
                  UNESCO World Heritage
                </span>
              )}
              {temple.badges.includes("Historic") && !temple.badges.includes("UNESCO World Heritage") && (
                <span className="rounded-full bg-stone-900/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-stone-300 border border-stone-800">
                  Historic Monument
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl font-medium leading-[1.05] text-ivory sm:text-6xl">
              {temple.name}
            </h1>
            {temple.nameLocal && (
              <p className="mt-2 text-xl font-medium text-gold-bright/90">{temple.nameLocal}</p>
            )}

            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px] text-ivory-dim">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gold" />
                {temple.location}, {temple.district}, {st.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Landmark className="h-4 w-4 text-gold" /> {temple.architecture ?? temple.type}
              </span>
              <span className="flex items-center gap-1.5">
                <Quote className="h-3.5 w-3.5 text-gold" /> {temple.mainDeity}
              </span>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <LiveStatus temple={temple} />
              <PlanCta slug={temple.slug} />
              <SaveButton slug={temple.slug} className="h-10 w-10 rounded-full" />
              {masterIntelligence && <SafetyModeModal safety={masterIntelligence.emergencySafety} />}
            </div>
          </GsapCinematicHero>
        </Container>
      </section>

      <Container className="pt-10">
        {/* Temple DNA Identity Matrix */}
        <section id="temple-dna" className="mb-12 scroll-mt-28">
          <TempleDna temple={temple} stateName={st.name} />
        </section>

        {/* Destination Command Center */}
        <section id="command-center" className="mb-12 scroll-mt-28">
          <TempleDayView temple={temple} />
        </section>

        {/* Visual Heritage Archive / Authentic Photo Gallery */}
        <section id="gallery" className="mb-12 scroll-mt-28">
          <TempleMediaGallery
            templeSlug={temple.slug}
            templeName={temple.name}
            architectureStyle={temple.architecture}
          />
        </section>

        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0 space-y-16">
            {/* Live Intelligence Section */}
            <section id="intelligence" className="scroll-mt-28">
              <LiveTempleIntelligence temple={temple} />
            </section>

            {/* Exact Access Points */}
            {masterIntelligence && (
              <section id="access-points" className="scroll-mt-28">
                <AccessPointsCard
                  templeName={temple.name}
                  accessPoints={masterIntelligence.accessPoints}
                />
              </section>
            )}

            {/* Visit Logistics & Courtyard Protocol */}
            {masterIntelligence && (
              <section id="logistics" className="scroll-mt-28">
                <VisitLogisticsPanel
                  logistics={masterIntelligence.visitLogistics}
                  templeName={temple.name}
                />
              </section>
            )}

            {/* Overview */}
            <section id="overview" className="scroll-mt-28">
              <p className="text-[15.5px] leading-relaxed text-ivory/90">{temple.description}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {temple.whyFamous.map((w, i) => (
                  <Reveal key={w.title} delay={i * 0.05}>
                    <div className="h-full rounded-2xl border border-line bg-obsidian-2 p-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{w.icon}</span>
                        <p className="font-display text-[15px] font-medium text-ivory">{w.title}</p>
                      </div>
                      <p className="mt-2.5 text-[13px] leading-relaxed text-ivory-dim">{w.body}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* History */}
            <section id="history" className="scroll-mt-28">
              <SectionHeading eyebrow="Chronicles" title="Through the Centuries" />
              <div className="relative mt-8 border-l border-stone-800/80 pl-6 sm:pl-8 space-y-10">
                {temple.history.map((h, i) => (
                  <div key={i} className="relative group">
                    <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#C8A24B]/60 bg-[#0C0907]" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                      {h.year && (
                        <span className="font-serif text-2xl font-normal text-[#C8A24B] shrink-0">
                          {h.year}
                        </span>
                      )}
                      <h4 className="font-serif text-lg font-medium text-[#F2ECE1]">{h.title}</h4>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-stone-300 max-w-2xl">{h.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Architecture & Visual Heritage */}
            <section id="architecture" className="space-y-8 scroll-mt-28">
              <TempleArchitectureHeritage temple={temple} />
            </section>

            {/* Heritage Perspectives & Personas */}
            <section id="perspectives">
              <P1PersonaExplorer temple={temple} />
            </section>

            {/* Accessibility & Family Comfort */}
            <section id="accessibility" className="space-y-6">
              <SectionHeading eyebrow="Comfort & Accessibility" title="Senior ease & family readiness" />
              <SeniorEase temple={temple} />
              <FamilyComfort temple={temple} />
            </section>

            {/* Festivals Arranged Date-wise */}
            <section id="festivals" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-stone-800/80 pb-4">
                <div>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#C8A24B]">
                    Sacred Timetable
                  </span>
                  <h3 className="font-serif text-2xl font-medium text-[#F2ECE1] mt-1">
                    Festivals &amp; Celestial Observances
                  </h3>
                </div>
                <span className="font-mono text-xs text-stone-400">
                  Arranged in Date Order
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[...temple.festivals]
                  .sort((a, b) => (a.month * 100 + a.day) - (b.month * 100 + b.day))
                  .map((f, i) => (
                    <Reveal key={f.id} delay={i * 0.05}>
                      <div className="flex flex-col justify-between h-full rounded-3xl border border-stone-800/80 bg-stone-950/80 p-5 backdrop-blur-sm transition-all hover:border-[#C8A24B]/50 hover:bg-stone-900/80">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="font-mono text-[10px] uppercase tracking-wider text-[#C8A24B]">
                                Month {f.month} · Day {f.day}
                              </span>
                              <p className="font-serif text-lg font-medium text-[#F2ECE1] mt-0.5">{f.name}</p>
                            </div>
                            {f.specialDarshan && (
                              <span className="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[9.5px] text-amber-300">
                                Special Darshan
                              </span>
                            )}
                          </div>
                          <p className="mt-2 flex items-center gap-1.5 text-xs font-mono text-stone-400">
                            <CalendarDays className="h-3.5 w-3.5 text-[#C8A24B]" /> {f.dateLabel}
                          </p>
                          <p className="mt-3 text-xs leading-relaxed text-stone-300">{f.description}</p>
                        </div>

                        <div className="mt-5 border-t border-stone-800/70 pt-3 flex items-center justify-end">
                          <Link
                            href={`/plan?temple=${temple.slug}&festival=${encodeURIComponent(f.name)}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#C8A24B]/40 bg-[#C8A24B]/10 px-3 py-1 text-[11px] font-mono text-[#E4BE72] transition-colors hover:bg-[#C8A24B]/20"
                          >
                            <span>Plan for this festival</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </Reveal>
                  ))}
              </div>
            </section>
          </div>

          {/* ---------- Side rail ---------- */}
          <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            {/* Visit Command Center */}
            <VisitCommandCenter temple={temple} />

            {/* Timings */}
            <section id="timings" className="rounded-3xl border border-line bg-obsidian-2 p-6 scroll-mt-28">
              <div className="mb-4 flex items-center justify-between">
                <p className="flex items-center gap-2 font-display text-lg text-ivory">
                  <Clock className="h-5 w-5 text-gold" /> Timings & darshan
                </p>
                <LiveStatus temple={temple} />
              </div>

              {temple.timings ? (
                <ul className="space-y-2.5">
                  {temple.timings.slots.map((s, i) => (
                    <li key={i} className="rounded-xl border border-white/[0.05] bg-obsidian-3 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-medium text-ivory">{s.label}</p>
                        <p className="shrink-0 font-display text-[13.5px] text-gold-bright">
                          {s.opening ?? "—"}{s.opening && s.closing ? " – " : ""}{s.closing ?? ""}
                        </p>
                      </div>
                      {s.note && <p className="mt-1 text-[11.5px] leading-relaxed text-ivory-dim/70">{s.note}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-ivory-dim">Timings not yet indexed for this shrine.</p>
              )}

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-obsidian-3 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[11.5px] uppercase tracking-wider text-ivory-dim">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> {VERIFY_LABEL[temple.timings?.verification.status ?? "UNVERIFIED"]}
                </p>
                {temple.timings?.verification.note && (
                  <p className="mt-1 text-[12px] leading-relaxed text-ivory-dim/70">{temple.timings.verification.note}</p>
                )}
              </div>
            </section>

            {/* Booking / entry */}
            <section id="booking" className="rounded-3xl border border-line bg-obsidian-2 p-6 scroll-mt-28">
              <p className="mb-4 flex items-center gap-2 font-display text-lg text-ivory">
                <Ticket className="h-5 w-5 text-gold" /> Booking & entry
              </p>

              <div className="space-y-2">
                <InfoRow label="General darshan" value={temple.entryFee.generalDarshan === "free" ? "Free" : temple.entryFee.generalDarshan === "paid" ? "Paid entry" : "By appointment"} />
                {temple.entryFee.specialDarshan && <InfoRow label="Special darshan" value={temple.entryFee.specialDarshan} />}
                {temple.entryFee.bookingOrg && <InfoRow label="Authority" value={temple.entryFee.bookingOrg} />}
                {temple.entryFee.notes && (
                  <p className="rounded-xl bg-white/[0.03] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ivory-dim">{temple.entryFee.notes}</p>
                )}
              </div>

              <div className="mt-4">
                {canBook && temple.booking.bookingUrl ? (
                  <a
                    href={temple.booking.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-5 py-3 text-sm font-semibold text-obsidian transition-all hover:brightness-110"
                  >
                    <ExternalLink className="h-4 w-4" /> Book on official website
                  </a>
                ) : (
                  <p className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[12.5px] text-amber-300/90">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    Booking link not verified — book only through the official portal linked at the temple.
                  </p>
                )}

                <div className="mt-3 flex items-start gap-2 text-[12px] text-ivory-dim/70">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>
                    Source: {temple.booking.verification.source?.org ?? "not available"},{" "}
                    {VERIFY_LABEL[temple.booking.verification.status]}
                  </span>
                </div>
              </div>
            </section>

            {/* What Changed & Source Ledger */}
            {masterIntelligence && (
              <section id="what-changed" className="scroll-mt-28">
                <WhatChangedCard
                  recentChanges={masterIntelligence.recentChanges}
                  sourceLedger={masterIntelligence.sourceLedger}
                />
              </section>
            )}

            {/* Meta strip */}
            <div className="rounded-3xl border border-line bg-obsidian-2 p-6">
              <p className="flex items-center gap-2 font-display text-lg text-ivory">
                <Flag className="h-5 w-5 text-gold" /> Quick facts
              </p>
              <div className="mt-3 space-y-2 text-[12.5px]">
                <InfoRow label="Tradition" value={temple.tradition.join(", ")} />
                <InfoRow label="Deities" value={[temple.mainDeity, ...temple.deities].join(", ")} />
                {temple.historicalPeriod && <InfoRow label="Period" value={temple.historicalPeriod} />}
                {temple.establishedYear && <InfoRow label="Established" value={temple.establishedYear} />}
                <InfoRow label="Coordinates" value={`${temple.latitude.toFixed(3)}, ${temple.longitude.toFixed(3)}`} />
              </div>
              <a
                href={`/nearby?lat=${temple.latitude}&lng=${temple.longitude}&label=${encodeURIComponent(temple.location)}`}
                className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gold-bright hover:underline"
              >
                <Navigation className="h-3.5 w-3.5" /> Explore around {temple.location}
              </a>
            </div>
          </aside>
        </div>

        {/* ---------- Explore Around This Temple (Normalized Heritage & Famous Places) ---------- */}
        <section id="explore-around" className="mt-16 scroll-mt-28">
          <ExploreAround
            templeId={temple.id}
            templeSlug={temple.slug}
            templeName={temple.name}
            templeLat={temple.latitude}
            templeLng={temple.longitude}
            location={temple.location}
            attractions={nearbyPlacesResult.attractions}
            radiusConfig={nearbyPlacesResult.radiusConfig}
          />
        </section>

        {/* ---------- Extend Your Yatra (300 km Regional Sacred Atlas) ---------- */}
        <section id="extend-your-yatra" className="mt-16 scroll-mt-28">
          <TempleExtendedDiscovery
            templeId={temple.id}
            templeName={temple.name}
            templeLat={temple.latitude}
            templeLng={temple.longitude}
            locationName={`${temple.location}, ${temple.district}`}
          />
        </section>

        {/* ---------- Nearby ---------- */}
        <section id="nearby" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Around the shrine"
            title="What's close by"
            sub="Curated, commonly documented places — always verify hours locally during yatra season."
          />
          <div className="space-y-6">
            {Object.entries(byKind).map(([kind, places]) => (
              <div key={kind}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-dim">
                  {KIND_LABEL[kind] ?? kind}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {places.map((pl) => (
                    <Reveal key={pl.id}>
                      <div className={cn("h-full rounded-2xl border border-line bg-obsidian-2 p-4")}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-ivory">{pl.name}</p>
                          <Chip>{pl.distanceKm} km</Chip>
                        </div>
                        {pl.recommendation && (
                          <p className="mt-2 text-[12.5px] leading-relaxed text-ivory-dim">{pl.recommendation}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {pl.priceHint && <Chip tone="gold">{pl.priceHint}</Chip>}
                          {pl.cuisine?.slice(0, 2).map((c) => <Chip key={c}>{c}</Chip>)}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
            {nearby.length === 0 && (
              <p className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-[13px] text-ivory-dim">
                Nearby data for {temple.location} is being sourced through the verified pipeline.
              </p>
            )}
          </div>
        </section>

        {/* ---------- AI ---------- */}
        <section id="ask-ai" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="AI companion"
            title="Ask anything. Plan beautifully."
            sub="Scoped to this temple's verified context — the companion never guesses."
          />
          <AiPanel templeId={temple.id} templeName={temple.name} lang="en" />
        </section>

        {/* ---------- More ---------- */}
        {stateTemples.length > 0 && (
          <section className="mt-16">
            <SectionHeading eyebrow={st.name} title="More temples in the state" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stateTemples.map((t2, i) => (
                <TempleCard key={t2.slug} temple={t2} stateSlug={st.slug} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Source Transparency & Archival Provenance */}
        <section id="source-transparency" className="mt-16 scroll-mt-28">
          <SourceTransparencyDrawer temple={temple} />
        </section>

        <div id="report" className="mt-16 rounded-3xl border border-dashed border-terracotta/30 bg-terracotta/[0.04] p-8 text-center">
          <p className="font-display text-lg text-ivory">Spot something wrong?</p>
          <p className="mx-auto mt-2 max-w-md text-[13px] text-ivory-dim">
            Timings, prices and facilities change. Report an update and our verification pipeline will reconcile it with official sources.
          </p>
          <Link
            href="/report"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-terracotta/40 px-6 py-2.5 text-[13px] font-medium text-[#e08568] transition-colors hover:bg-terracotta/10"
          >
            <AlertTriangle className="h-4 w-4" /> Report incorrect information
          </Link>
        </div>
      </Container>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-ivory-dim">{label}</span>
      <span className="text-right font-medium text-ivory">{value}</span>
    </div>
  );
}