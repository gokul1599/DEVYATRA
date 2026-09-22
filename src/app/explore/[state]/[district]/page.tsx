import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Landmark, Layers, MapPin } from "lucide-react";
import { getDistrictByState, getState, getAdminUnits, templesByDistrict } from "@/lib/registry";
import { getDistrictPage } from "@/lib/db/directory";
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
  const dbData = await getDistrictPage(stateSlug, districtSlug);

  const staticState = getState(stateSlug);
  const staticDistrict = staticState ? getDistrictByState(staticState, districtSlug) : undefined;

  if (!dbData && (!staticState || !staticDistrict)) notFound();

  const stateName = dbData?.state.name || staticState?.name || "";
  const districtName = dbData?.district.name || staticDistrict?.name || "";
  const subUnitTerm = dbData?.state.adminUnitTerm || staticState?.subUnitTerm || "subdivision";
  const stateType = dbData?.state.type || staticState?.type || "State";

  const adminUnits = dbData
    ? dbData.adminUnits
    : staticState
      ? getAdminUnits(staticState.code, districtSlug).map((u) => ({
          id: u.slug,
          slug: u.slug,
          name: u.name,
          type: subUnitTerm,
          templeCount: u.temples.length,
          localityCount: 0,
        }))
      : [];

  const temples = dbData
    ? dbData.temples
    : staticState
      ? templesByDistrict(staticState.code, districtSlug).map((t) => ({
          id: t.id,
          identifier: t.id,
          slug: t.slug,
          name: t.name,
          mainDeity: t.mainDeity,
          deities: t.deities,
          verificationStatus: t.source.status,
          latitude: t.latitude,
          longitude: t.longitude,
          stateCode: t.stateCode,
          stateSlug,
          districtSlug,
          adminUnitSlug: t.subUnitSlug ?? null,
          localitySlug: t.locationSlug ?? null,
        }))
      : [];

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed={`explore-${stateSlug}-${districtSlug}`} variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Explore India", href: "/explore" },
              { label: stateName, href: `/explore/${stateSlug}` },
              { label: districtName },
            ]}
            className="mb-4"
          />
          <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">{districtName}</h1>
          <p className="mt-3 text-[14px] text-ivory-dim">
            {stateName} · {stateType} · organised in {subUnitTerm}s · {temples.length} temple{temples.length === 1 ? "" : "s"} catalogued
          </p>
        </Container>
      </section>

      <Container>
        {adminUnits.length > 0 && (
          <div className="mb-12">
            <SectionHeading
              eyebrow="Administrative Sub-Districts"
              title={`${districtName} ${subUnitTerm}s`}
            />
            <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {adminUnits.map((u) => (
                <StaggerItem key={u.slug}>
                  <Link
                    href={`/states/${stateSlug}/districts/${districtSlug}/${u.slug}`}
                    className="group flex items-center justify-between rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:-translate-y-0.5 hover:border-gold/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                        <Layers className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-medium text-ivory">
                          {u.name} {subUnitTerm}
                        </p>
                        <p className="text-[11.5px] text-ivory-dim">
                          {u.templeCount} temple{u.templeCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gold-dim transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}

        <div>
          <SectionHeading
            eyebrow={`${districtName}, ${stateName}`}
            title="Temples in this district"
          />
          {temples.length > 0 ? (
            <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {temples.map((t) => (
                <StaggerItem key={t.slug}>
                  <Link
                    href={`/temples/${t.stateSlug}/${t.slug}`}
                    className="group flex items-center justify-between rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:-translate-y-0.5 hover:border-gold/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold shrink-0">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-medium text-ivory">{t.name}</p>
                        <p className="text-[11.5px] text-ivory-dim">
                          {t.mainDeity || "Historic Shrine"}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-ivory-dim/70">
                            {t.verificationStatus.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gold-dim transition-transform group-hover:translate-x-0.5 shrink-0" />
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
                <Link href={`/explore/${stateSlug}`} className="rounded-full border border-ivory/15 px-5 py-2 text-[13px] text-ivory">
                  Back to {stateName}
                </Link>
              }
            />
          )}
        </div>
      </Container>
    </>
  );
}