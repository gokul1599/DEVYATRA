import Link from "next/link";
import {
  MapPin,
  Landmark,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  ScrollText,
  Users,
  ArrowRight,
  Navigation,
  Utensils,
  BedDouble,
  Droplets,
  ShoppingBag,
  ParkingCircle,
  Activity,
  HeartPulse,
  Fence,
  Users2,
  Car,
  TrainFront,
  Archive,
  Trees,
} from "lucide-react";
import { getStates, templesByState, getFestivalAll, nearbyFor, nearbyCategories, templeUrl } from "@/lib/registry";
import { listStates } from "@/lib/db/directory";
import { TEMPLE_INDEX } from "@/lib/data/temples";
import { SectionHeading, Container } from "@/components/ui";
import { TempleCard } from "@/components/temple-card";
import { Stagger, StaggerItem } from "@/components/motion";
import { festivalDate, fmtDate } from "@/lib/format";

/* -------------------------------------------------------------------------- */
/* Explore India                                                              */
/* -------------------------------------------------------------------------- */

export async function ExploreIndia() {
  const dbStates = await listStates();
  const states = dbStates.length > 0
    ? dbStates
        .filter((s) => s.templeCount > 0)
        .sort((a, b) => b.templeCount - a.templeCount || a.name.localeCompare(b.name))
        .map((s) => ({ s: { name: s.name, slug: s.slug, code: s.code }, count: s.templeCount }))
    : getStates()
        .map((s) => ({ s, count: templesByState(s.code).length }))
        .filter((x) => x.count > 0)
        .sort((a, b) => b.count - a.count || a.s.name.localeCompare(b.s.name));

  return (
    <section id="explore-india" className="relative py-20 md:py-28">
      <Container wide>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Explore India"
            title="From state to district to temple"
            sub="Journey through India's sacred geography — every temple anchored to its official administrative home."
          />
          <Link
            href="/explore"
            className="mb-10 inline-flex items-center gap-1.5 rounded-full border border-ivory/12 px-4 py-2 text-[13px] text-ivory-dim transition-colors hover:border-gold/40 hover:text-gold-bright md:mb-14"
          >
            Explore all states <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {states.map(({ s, count }) => (
            <StaggerItem key={s.code}>
              <Link
                href={`/explore/${s.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-obsidian-2 p-4 transition-all duration-300 hover:border-gold/30 hover:bg-obsidian-3"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gold/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl font-semibold text-ivory transition-colors group-hover:text-gold-bright">
                    {s.name.slice(0, 14)}
                    {s.name.length > 14 ? "…" : ""}
                  </span>
                  <MapPin className="h-4 w-4 text-gold-dim shrink-0" />
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-ivory-dim">
                    {count} temple{count === 1 ? "" : "s"}
                  </span>
                  <span className="text-[12px] text-gold-dim transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                 */
/* -------------------------------------------------------------------------- */

const CATS = [
  { e: "🛕", label: "Dravidian architecture", href: "/temples?style=Dravidian" },
  { e: "🏛️", label: "Nagara temples", href: "/temples?style=Nagara" },
  { e: "🚩", label: "Char Dham", href: "/temples?type=Char%20Dham" },
  { e: "🕉️", label: "Jyotirlingas", href: "/temples?type=Jyotirlinga" },
  { e: "🦚", label: "Vaishnava shrines", href: "/temples?tradition=Vaishnava" },
  { e: "🌟", label: "Goddess shrines", href: "/temples?tradition=Shakta" },
  { e: "🌍", label: "UNESCO heritage", href: "/temples?badge=UNESCO%20World%20Heritage" },
  { e: "🏔️", label: "Himalayan shrines", href: "/temples?state=uttarakhand" },
];

export function Categories() {
  return (
    <section className="py-4 md:py-8">
      <Container>
        <SectionHeading eyebrow="Browse" title="Popular ways to explore" align="center" />
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATS.map((c) => (
            <StaggerItem key={c.label}>
              <Link
                href={c.href}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-obsidian-2 px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-surface-warm"
              >
                <span className="text-2xl">{c.e}</span>
                <span className="text-[13.5px] font-medium leading-tight text-ivory transition-colors group-hover:text-gold-bright">
                  {c.label}
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Famous temples                                                             */
/* -------------------------------------------------------------------------- */

const FAMOUS_SLUGS = [
  ["andhra-pradesh", "sri-venkateswara-temple"],
  ["uttar-pradesh", "kashi-vishwanath-temple"],
  ["odisha", "jagannath-temple-puri"],
  ["tamil-nadu", "meenakshi-amman-temple"],
  ["uttarakhand", "kedarnath-temple"],
  ["gujarat", "somnath-temple"],
] as const;

export function Famous() {
  const temples = FAMOUS_SLUGS.map(([st, slug]) => ({
    temple: TEMPLE_INDEX.get(slug),
    stateSlug: st,
  })).filter((x) => x.temple);

  return (
    <section id="famous" className="py-20 md:py-28">
      <Container wide>
        <SectionHeading
          eyebrow="Famous & historic"
          title="Temples that shaped India"
          sub="Six landmark shrines — each carrying verified visitor information and its own cinematic story."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {temples.map(({ temple, stateSlug }, i) =>
            temple ? (
              <Stagger key={temple.slug}>
                <StaggerItem>
                  <TempleCard temple={temple} stateSlug={stateSlug} index={i} featured />
                </StaggerItem>
              </Stagger>
            ) : null
          )}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Upcoming festivals                                                          */
/* -------------------------------------------------------------------------- */

export function FestivalStrip() {
  const now = new Date();
  const year = now.getFullYear();

  const upcoming = getFestivalAll()
    .map((f) => {
      let d = festivalDate(f.month, f.day, year);
      if (d < now) d = festivalDate(f.month, f.day, year + 1);
      return { ...f, date: d };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 10);

  return (
    <section id="festivals" className="py-6 md:py-10">
      <Container wide>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Mark your calendar"
            title="Temple festivals, on the horizon"
            sub="Seasons, processions and celestial marriages — the festival calendar of India's great shrines."
          />
          <Link
            href="/festivals"
            className="mb-10 inline-flex items-center gap-1.5 rounded-full border border-ivory/12 px-4 py-2 text-[13px] text-ivory-dim transition-colors hover:border-gold/40 hover:text-gold-bright md:mb-14"
          >
            Full festival calendar <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* horizontal scroll rail */}
        <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
          {upcoming.map((f) => {
            const key = `${f.name}-${f.date.toISOString()}`;
            return (
              <Link
                key={key}
                href={`${templeUrl(f.temple)}#festivals`}
                className="group relative w-60 shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-obsidian-2 px-5 py-4 transition-all duration-300 hover:border-gold/30"
              >
                <p className="font-display text-2xl font-semibold gold-text">
                  {fmtDate(f.date)}
                </p>
                <p className="mt-1 truncate text-[15px] font-medium text-ivory transition-colors group-hover:text-gold-bright">
                  {f.name}
                </p>
                <p className="mt-0.5 truncate text-[12.5px] text-ivory-dim">{f.temple.name}</p>
                <p className="mt-2.5 line-clamp-2 text-[11.5px] leading-relaxed text-ivory-dim/70">
                  {f.description}
                </p>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* AI plan band                                                                */
/* -------------------------------------------------------------------------- */

export function PlanBand() {
  return (
    <section className="py-20 md:py-28">
      <Container wide>
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-surface-warm p-8 md:p-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-gold/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-terracotta/15 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-bright">
                <Sparkles className="h-4 w-4" /> AI Journey Studio
              </p>
              <h2 className="font-display text-3xl font-medium leading-[1.12] text-ivory sm:text-4xl">
                Let AI craft your pilgrimage day
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ivory-dim">
                Tell us the temple, your time window, budget and energy — and receive a
                structured itinerary with darshan slots, prasad breaks, nearby sights and
                honest travel warnings. No hallucinated bookings. Ever.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/plan"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-7 py-3 text-sm font-semibold text-obsidian shadow-[0_14px_34px_-12px_rgba(217,130,43,0.6)] transition-all hover:brightness-110"
                >
                  <Sparkles className="h-4 w-4" /> Plan My Visit
                </Link>
                <Link
                  href="/plan?mode=route"
                  className="inline-flex items-center gap-2 rounded-full border border-ivory/15 px-6 py-3 text-sm font-medium text-ivory transition-colors hover:border-gold/50 hover:text-gold-bright"
                >
                  <Navigation className="h-4 w-4" /> Build a pilgrimage route
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { n: "01", t: "Pick your temple", d: "Search 1,655 shrines across India.", icon: Landmark },
                { n: "02", t: "Set your window", d: "Start time, hours, budget, pace & interests.", icon: ScrollText },
                { n: "03", t: "Get your day", d: "A time-ordered itinerary with reasons and sources.", icon: BadgeCheck },
              ].map((s) => (
                <div
                  key={s.n}
                  className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-obsidian/40 p-4"
                >
                  <s.icon className="mt-0.5 h-5 w-5 text-gold" />
                  <div>
                    <p className="text-[14px] font-medium text-ivory">{s.t}</p>
                    <p className="mt-0.5 text-[12.5px] text-ivory-dim">{s.d}</p>
                  </div>
                  <span className="ml-auto font-display text-sm text-gold-dim">{s.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Nearby teaser                                                               */
/* -------------------------------------------------------------------------- */

const KIND_ICON: Record<string, unknown> = {
  temple: Landmark,
  restaurant: Utensils,
  hotel: BedDouble,
  attraction: Archive,
  nature: Trees,
  shopping: ShoppingBag,
  parking: ParkingCircle,
  hospital: HeartPulse,
  pharmacy: Droplets,
  police: Fence,
  restroom: Users2,
  atm: Activity,
  fuel: Car,
  transport: TrainFront,
};

export function NearbyTeaser() {
  const samples = [
    { slug: "sri-venkateswara-temple", stateSlug: "andhra-pradesh" },
    { slug: "meenakshi-amman-temple", stateSlug: "tamil-nadu" },
  ].map((x) => ({ ...x, temple: TEMPLE_INDEX.get(x.slug), places: nearbyFor(x.slug).slice(0, 6) }));

  return (
    <section id="nearby" className="py-6 md:py-10">
      <Container wide>
        <SectionHeading
          eyebrow="Around the shrine"
          title="Everything you need, near the temple"
          sub="Curated hotels, vegetarian kitchens, parking, pharmacies and more — within walking distance of great temples."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {samples.map(
            ({ temple, stateSlug, places }) =>
              temple && (
                <div key={temple.slug} className="rounded-3xl border border-line bg-obsidian-2 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="font-display text-lg text-ivory">
                      Near <span className="gold-text">{temple.name}</span>
                    </p>
                    <Link
                      href={`/temples/${stateSlug}/${temple.slug}#nearby`}
                      className="text-[12.5px] text-gold-bright hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {places.map((p) => {
                      const Icon = (KIND_ICON[p.kind] ?? MapPin) as typeof MapPin;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-obsidian-3 p-3"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium text-ivory">{p.name}</p>
                            <p className="text-[11px] text-ivory-dim">
                              {p.distanceKm} km · {nearbyCategories.find((c) => c.kind === p.kind)?.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
          )}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Trust                                                                       */
/* -------------------------------------------------------------------------- */

export function TrustSection() {
  const items = [
    {
      icon: ShieldCheck,
      t: "Verified, not guessed",
      d: "Every timing, price and fact carries a verification status — from official board sources to community reports.",
    },
    {
      icon: ScrollText,
      t: "Source-tagged data",
      d: "Hover any badge to see who verified it. We link official portals (TTD, HR&CE, ASI, Shrine Boards) wherever they exist.",
    },
    {
      icon: Users,
      t: "Community-powered corrections",
      d: "Spot something wrong? Report it and our admin pipeline reconciles it against official sources.",
    },
    {
      icon: Sparkles,
      t: "AI that refuses to invent",
      d: "The AI companion answers only from indexed, verified content — and tells you plainly when it cannot verify.",
    },
  ];
  return (
    <section id="trust" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Radically honest"
          title="Verified information. Smarter journeys."
          sub="We treat temple information as data — versioned, sourced and auditable — so you can plan with confidence."
          align="center"
        />
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <StaggerItem key={it.t}>
              <div className="h-full rounded-2xl border border-line bg-obsidian-2 p-6">
                <it.icon className="h-6 w-6 text-gold" />
                <p className="mt-4 font-display text-lg text-ivory">{it.t}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ivory-dim">{it.d}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-8 text-center">
          <Link
            href="/verify"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gold-bright hover:underline"
          >
            How we verify information <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Final CTA                                                                   */
/* -------------------------------------------------------------------------- */

export function CtaBand() {
  return (
    <section className="py-8 pb-24 md:pb-28">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 px-8 py-16 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 90% at 50% 0%, rgba(200,162,75,0.18), transparent 60%), linear-gradient(180deg, #1c1812, #120f0c)",
            }}
          />
          <div className="relative">
            <p className="font-display text-3xl font-medium leading-tight text-ivory sm:text-5xl">
              Begin your <span className="gold-text">journey</span>
            </p>
            <p className="mx-auto mt-4 max-w-md text-[15px] text-ivory-dim">
              From Tirumala&apos;s hills to Kashi&apos;s ghats — explore, plan and remember.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/temples"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-8 py-3.5 text-sm font-semibold text-obsidian shadow-[0_14px_34px_-12px_rgba(217,130,43,0.6)] transition-all hover:brightness-110"
              >
                <Landmark className="h-4 w-4" /> Explore temples
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-ivory/15 px-7 py-3.5 text-sm font-medium text-ivory transition-colors hover:border-gold/50 hover:text-gold-bright"
              >
                <MapPin className="h-4 w-4" /> Explore India
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}