import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import { getState, getLocations } from "@/lib/registry";
import { Container, SectionHeading, Breadcrumbs } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { Stagger, StaggerItem } from "@/components/motion";

export const dynamicParams = true;

function cap(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function generateMetadata({ params }: { params: Promise<{ state: string; district: string; subunit: string }> }) {
  const { state, subunit } = await params;
  const s = getState(state);
  return { title: `${cap(subunit)}${s ? ` · ${s.subUnitTerm}` : ""} — ${s?.name ?? ""}` };
}

export default async function SubUnitPage({
  params,
}: {
  params: Promise<{ state: string; district: string; subunit: string }>;
}) {
  const { state: stateSlug, district: districtSlug, subunit: subunitSlug } = await params;
  const state = getState(stateSlug);
  if (!state) notFound();

  const locations = getLocations(state.code, districtSlug, subunitSlug);
  if (locations.length === 0) notFound();

  const name = cap(subunitSlug);

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed={`explore-${state.slug}-${subunitSlug}`} variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Explore India", href: "/explore" },
              { label: state.name, href: `/explore/${state.slug}` },
              { label: cap(districtSlug), href: `/explore/${state.slug}/${districtSlug}` },
              { label: `${name} ${state.subUnitTerm}` },
            ]}
            className="mb-4"
          />
          <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">
            {name} {state.subUnitTerm}
          </h1>
          <p className="mt-3 text-[14px] text-ivory-dim">
            {cap(districtSlug)} · {state.name}
          </p>
        </Container>
      </section>

      <Container>
        <SectionHeading eyebrow="Locations" title="Villages, towns & cities" />
        <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((l) => (
            <StaggerItem key={l.slug}>
              <Link
                href={`/explore/${state.slug}/${districtSlug}/${subunitSlug}/${l.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:-translate-y-0.5 hover:border-gold/30"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-ivory">{l.name}</p>
                    <p className="text-[11.5px] capitalize text-ivory-dim">
                      {l.kind} · {l.temples.length} temple{l.temples.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gold-dim transition-transform group-hover:translate-x-0.5" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </>
  );
}