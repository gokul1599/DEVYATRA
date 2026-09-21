import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
import { getState, templesByDistrict } from "@/lib/registry";
import { Container, Breadcrumbs } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { TempleCard } from "@/components/temple-card";

export const dynamicParams = true;

function cap(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ state: string; district: string; subunit: string; location: string }>;
}) {
  const { state: stateSlug, district: districtSlug, subunit, location } = await params;
  const state = getState(stateSlug);
  if (!state) notFound();

  const temples = templesByDistrict(state.code, districtSlug).filter((t) => t.locationSlug === location);
  if (temples.length === 0) notFound();

  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed={`explore-${state.slug}-${location}`} variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Explore India", href: "/explore" },
              { label: state.name, href: `/explore/${state.slug}` },
              { label: cap(districtSlug), href: `/explore/${state.slug}/${districtSlug}` },
              { label: `${cap(subunit)} ${state.subUnitTerm}`, href: `/explore/${state.slug}/${districtSlug}/${subunit}` },
              { label: cap(location) },
            ]}
            className="mb-4"
          />
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            <MapPin className="h-3.5 w-3.5" /> {cap(location)} · {state.name}
          </p>
          <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">{cap(location)}</h1>
          <p className="mt-3 text-[14px] text-ivory-dim">
            {temples.length} temple{temples.length === 1 ? "" : "s"} in and around this location
          </p>
        </Container>
      </section>

      <Container>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {temples.map((t, i) => (
            <TempleCard key={t.slug} temple={t} stateSlug={state.slug} index={i} />
          ))}
        </div>
        <div className="mt-8">
          <Link
            href={`/explore/${state.slug}/${districtSlug}/${subunit}`}
            className="inline-flex items-center gap-1.5 text-[13px] text-gold-bright hover:underline"
          >
            Back to {cap(subunit)} {state.subUnitTerm} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Container>
    </>
  );
}