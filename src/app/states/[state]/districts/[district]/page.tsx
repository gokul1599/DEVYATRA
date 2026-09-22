import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Building2, MapPinned } from "lucide-react";
import { directoryStatus, getDistrictPage } from "@/lib/db/directory";
import { Container, SectionHeading, Chip } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";
import { DirectoryBreadcrumbs, DirectoryOffline, TempleCards } from "@/components/directory/shared";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ state: string; district: string }> }): Promise<Metadata> {
  const { state, district } = await params;
  if (directoryStatus() === "offline") return { title: "District — Devyatra" };
  const page = await getDistrictPage(state, district);
  if (!page) return { title: "District — Devyatra" };
  return {
    title: `${page.district.name} District · Temples — Devyatra`,
    description: `${page.district.templeCount} verified temple record${page.district.templeCount === 1 ? "" : "s"} in ${page.district.name}, ${page.state.name}.`,
  };
}

export default async function DistrictPage({ params }: { params: Promise<{ state: string; district: string }> }) {
  const { state, district } = await params;
  if (directoryStatus() === "offline") {
    return (
      <>
        <SectionHeading eyebrow="The permanent directory" title="District view" sub="Loading from the directory database." />
        <div className="pt-8">
          <DirectoryOffline />
        </div>
      </>
    );
  }
  const page = await getDistrictPage(state, district);
  if (!page) notFound();
  const { state: st, district: d } = page;

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32">
        <Container>
          <DirectoryBreadcrumbs crumbs={page.breadcrumbs} />
          <SectionHeading
            eyebrow={`${st.adminUnitTerm} sub-districts`}
            title={`${d.name} District`}
            sub={`${d.templeCount} temple record${d.templeCount === 1 ? "" : "s"} · ${st.name}.`}
          />
        </Container>
      </section>

      <Container>
        {page.adminUnits.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-dim">
              <Building2 className="h-3.5 w-3.5" /> {st.adminUnitTerm}s in {d.name}
            </h2>
            <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {page.adminUnits.map((au) => (
                <StaggerItem key={au.id}>
                  <Link
                    href={`/states/${st.slug}/districts/${d.slug}/${au.slug}`}
                    className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-obsidian-2 p-4 transition-colors hover:border-gold/30"
                  >
                    <h3 className="font-display text-lg text-ivory transition-colors group-hover:text-gold-bright">{au.name}</h3>
                    <div className="mt-4 flex items-center justify-between text-[12px] text-ivory-dim">
                      <span>{au.templeCount} temple{au.templeCount === 1 ? "" : "s"}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-gold-dim transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}

        {page.localities.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-dim">
              <MapPinned className="h-3.5 w-3.5" /> Localities
            </h2>
            <div className="flex flex-wrap gap-2">
              {page.localities.map((l) => (
                <Chip key={l.id}>
                  {l.name} · {l.templeCount}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-dim">Temples in {d.name}</h2>
        <TempleCards temples={page.temples} />
      </Container>
    </>
  );
}