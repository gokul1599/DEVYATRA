import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Landmark, Layers, MapPin } from "lucide-react";
import { getDistrictByState, getState, getAdminUnits, templesByDistrict, templeUrl } from "@/lib/registry";
import { Container, SectionHeading, Breadcrumbs, EmptyState } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { Stagger, StaggerItem } from "@/components/motion";

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ state: string; district: string }> }) {
  const { state, district } = await params;
  const s = getState(state);
  return { title: `${s?.name ?? ""} — ${district.split("-").map(capitalize).join(" ")}` };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ state: string; district: string }>;
}) {
  const { state: stateSlug, district: districtSlug } = await params;
  const state = getState(stateSlug);
  if (!state) notFound();
  const district = getDistrictByState(state, districtSlug);
  if (!district) notFound();

  const units = getAdminUnits(state.code, districtSlug);
  const directTemples = templesByDistrict(state.code, districtSlug);

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed={`explore-${state.slug}-${districtSlug}`} variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Explore India", href: "/explore" },
              { label: state.name, href: `/explore/${state.slug}` },
              { label: district.name },
            ]}
            className="mb-4"
          />
          <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">{district.name}</h1>
          <p className="mt-3 text-[14px] text-ivory-dim">
            {state.name} · {state.type} · organised in {state.subUnitTerm}s
          </p>
        </Container>
      </section>

      <Container>
        {units.length > 0 ? (
          <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((u) => (
              <StaggerItem key={u.slug}>
                <Link
                  href={`/explore/${state.slug}/${districtSlug}/${u.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:-translate-y-0.5 hover:border-gold/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                      <Layers className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-medium text-ivory">
                        {u.name} {state.subUnitTerm}
                      </p>
                      <p className="text-[11.5px] text-ivory-dim">
                        {u.temples.length} temple{u.temples.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gold-dim transition-transform group-hover:translate-x-0.5" />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <>
            <SectionHeading
              eyebrow={`${district.name}, ${state.name}`}
              title="Temples in this district"
              sub={units.length === 0 && directTemples.length ? "" : undefined}
            />
            {directTemples.length > 0 ? (
              <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {directTemples.map((t) => (
                  <StaggerItem key={t.slug}>
                    <Link
                      href={templeUrl(t)}
                      className="group flex items-center gap-3 rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:-translate-y-0.5 hover:border-gold/30"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-medium text-ivory">{t.name}</p>
                        <p className="text-[11.5px] text-ivory-dim">
                          {t.location} · {t.mainDeity}
                        </p>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <EmptyState
                icon={<Landmark className="h-8 w-8" />}
                title="No mapped temples in this district yet"
                sub="The atlas pipeline sources and verifies temples district by district."
                action={
                  <Link href={`/explore/${state.slug}`} className="rounded-full border border-ivory/15 px-5 py-2 text-[13px] text-ivory">
                    Back to {state.name}
                  </Link>
                }
              />
            )}
          </>
        )}
      </Container>
    </>
  );
}