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
} from "lucide-react";
import { getState, nearbyFor, templeUrl, TEMPLES, templesByState } from "@/lib/registry";
import { resolveTemple } from "@/lib/db/directory";
import { VERIFY_LABEL } from "@/lib/format";
import { Container, Breadcrumbs, Chip, VerifyBadge, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structData) }} />

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden pt-28">
        <SacredAmbient />
        <div className="absolute inset-0 -z-10">
          <DevyatraArt seed={temple.slug} variant="hero" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/50 via-transparent to-obsidian" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-transparent to-transparent" />
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
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <VerifyBadge verification={temple.booking.verification} />
              {temple.badges.map((b) => (
                <Chip key={b} tone={b === "UNESCO World Heritage" || b === "Historic" ? "gold" : "default"}>
                  {b}
                </Chip>
              ))}
              <Chip tone="gold">Surveyed Coordinates</Chip>
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
            </div>
          </GsapCinematicHero>
        </Container>
      </section>

      {/* ---------- Quick nav ---------- */}
      <div className="sticky top-16 z-40 border-y border-line bg-obsidian/80 backdrop-blur-md">
        <Container className="flex gap-5 overflow-x-auto py-2.5 text-[12.5px]">
          {[
            ["#intelligence", "Live Intelligence"],
            ["#overview", "Overview"],
            ["#timings", "Timings"],
            ["#booking", "Booking"],
            ["#festivals", "Festivals"],
            ["#nearby", "Nearby"],
            ["#ask-ai", "Ask AI"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="shrink-0 whitespace-nowrap text-ivory-dim transition-colors hover:text-gold-bright">
              {label}
            </a>
          ))}
        </Container>
      </div>

      <Container className="pt-12">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div className="min-w-0 space-y-16">
            {/* Live Intelligence Section */}
            <section id="intelligence">
              <LiveTempleIntelligence temple={temple} />
            </section>

            {/* Overview */}
            <section id="overview">
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
            <section id="history">
              <SectionHeading eyebrow="History" title="Through the centuries" />
              <ol className="relative space-y-6 border-l border-line pl-6">
                {temple.history.map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full border border-gold/40 bg-obsidian" />
                    <p className="flex flex-wrap items-center gap-2">
                      {h.year && (
                        <span className="rounded-md bg-gold/12 px-2 py-0.5 font-display text-[12.5px] font-semibold text-gold-bright">
                          {h.year}
                        </span>
                      )}
                      <span className="font-medium text-ivory">{h.title}</span>
                    </p>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-ivory-dim">{h.body}</p>
                  </li>
                ))}
              </ol>
            </section>

            {/* Festivals */}
            <section id="festivals">
              <SectionHeading eyebrow="Festivals" title="Mark your calendar" />
              <div className="grid gap-3 sm:grid-cols-2">
                {temple.festivals.map((f, i) => (
                  <Reveal key={f.id} delay={i * 0.05}>
                    <div className="h-full rounded-2xl border border-line bg-obsidian-2 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display text-[16px] font-medium text-ivory">{f.name}</p>
                        {f.specialDarshan && <Chip tone="terracotta">Special darshan</Chip>}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-gold-bright">
                        <CalendarDays className="h-3.5 w-3.5" /> {f.dateLabel}
                      </p>
                      <p className="mt-2.5 text-[13px] leading-relaxed text-ivory-dim">{f.description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          </div>

          {/* ---------- Side rail ---------- */}
          <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            {/* Timings */}
            <section id="timings" className="rounded-3xl border border-line bg-obsidian-2 p-6">
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
            <section id="booking" className="rounded-3xl border border-line bg-obsidian-2 p-6">
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

        {/* ---------- Nearby ---------- */}
        <section id="nearby" className="mt-16">
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
        <section id="ask-ai" className="mt-16">
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