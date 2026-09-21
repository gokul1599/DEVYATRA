import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Landmark, Layers } from "lucide-react";
import { getStates, getState, templesByDistrict, templesByState, slugify } from "@/lib/registry";
import { Container, SectionHeading, Breadcrumbs, EmptyState } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { Stagger, StaggerItem } from "@/components/motion";

export const dynamicParams = true;

export function generateStaticParams() {
  return getStates().map((s) => ({ state: s.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  return { title: params.then((p) => getState(p.state)?.name ?? "Explore") };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state: stateSlug } = await params;
  const state = getState(stateSlug);
  if (!state) notFound();

  const districts = state.districts.map((name) => ({
    name,
    slug: slugify(name),
    count: templesByDistrict(state.code, slugify(name)).length,
  }));
  const total = templesByState(state.code).length;

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed={`explore-${state.slug}`} variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <Breadcrumbs
            crumbs={[{ label: "Home", href: "/" }, { label: "Explore India", href: "/explore" }, { label: state.name }]}
            className="mb-4"
          />
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            {state.type} · Capital {state.capital} · {state.subUnitTerm} subdivisions
          </p>
          <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">{state.name}</h1>
          <p className="mt-3 max-w-xl text-[15px] text-ivory-dim">
            {total > 0
              ? `${total} temple${total === 1 ? "" : "s"} across ${districts.filter((d) => d.count).length} districts currently mapped.`
              : "This state is part of the atlas expansion pipeline — temples here are being sourced and verified."}
          </p>
        </Container>
      </section>

      <Container>
        <SectionHeading
          eyebrow="Districts"
          title={`Choose a district${total > 0 ? "" : " (pending)"}`}
          sub={state.subUnitTerm}
        />

        {total === 0 ? (
          <EmptyState
            icon={<Layers className="h-8 w-8" />}
            title="No mapped temples here yet"
            sub="We're continuously expanding the directory through our verified data pipeline."
            action={
              <Link href="/explore" className="rounded-full border border-ivory/15 px-5 py-2 text-[13px] text-ivory">
                Browse other states
              </Link>
            }
          />
        ) : (
          <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {districts.map((d) => (
              <StaggerItem key={d.slug}>
                <Link
                  href={`/explore/${state.slug}/${d.slug}`}
                  className={`group flex items-center justify-between rounded-2xl border p-5 transition-all ${
                    d.count
                      ? "border-line bg-obsidian-2 hover:-translate-y-0.5 hover:border-gold/30"
                      : "border-dashed border-line/60 bg-obsidian-2/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${d.count ? "bg-gold/10 text-gold" : "bg-white/[0.03] text-ivory-dim/40"}`}>
                      <Landmark className="h-5 w-5" />
                    </span>
                    <div>
                      <p className={`font-medium ${d.count ? "text-ivory" : "text-ivory-dim/50"}`}>{d.name}</p>
                      <p className="text-[11.5px] text-ivory-dim">
                        {d.count > 0 ? `${d.count} temple${d.count === 1 ? "" : "s"}` : "Awaiting content"}
                      </p>
                    </div>
                  </div>
                  {d.count > 0 && (
                    <ArrowRight className="h-4 w-4 text-gold-dim transition-transform group-hover:translate-x-0.5" />
                  )}
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Container>
    </>
  );
}