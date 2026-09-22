import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPinned } from "lucide-react";
import { directoryStatus, getAdminUnitPage } from "@/lib/db/directory";
import { Container, SectionHeading } from "@/components/ui";
import { DirectoryBreadcrumbs, DirectoryOffline, TempleCards } from "@/components/directory/shared";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ state: string; district: string; adminUnit: string }> }): Promise<Metadata> {
  const p = await params;
  if (directoryStatus() === "offline") return { title: "Sub-district — Devyatra" };
  const page = await getAdminUnitPage(p.state, p.district, p.adminUnit);
  if (!page) return { title: "Sub-district — Devyatra" };
  return {
    title: `${page.adminUnit.name} ${page.adminUnit.type} · Temples — Devyatra`,
    description: `${page.adminUnit.templeCount} verified temple record${page.adminUnit.templeCount === 1 ? "" : "s"} in ${page.adminUnit.name}, ${page.district.name}, ${page.state.name}.`,
  };
}

export default async function AdminUnitPage({ params }: { params: Promise<{ state: string; district: string; adminUnit: string }> }) {
  const { state, district, adminUnit } = await params;
  if (directoryStatus() === "offline") {
    return (
      <>
        <SectionHeading eyebrow="The permanent directory" title="Sub-district view" sub="Loading from the directory database." />
        <div className="pt-8">
          <DirectoryOffline />
        </div>
      </>
    );
  }
  const page = await getAdminUnitPage(state, district, adminUnit);
  if (!page) notFound();
  const { state: st, district: d } = page;

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32">
        <Container>
          <DirectoryBreadcrumbs crumbs={page.breadcrumbs} />
          <SectionHeading
            eyebrow={page.adminUnit.type}
            title={page.adminUnit.name}
            sub={`${page.adminUnit.templeCount} temple record${page.adminUnit.templeCount === 1 ? "" : "s"} · ${d.name}, ${st.name}.`}
          />
        </Container>
      </section>

      <Container>
        {page.localities.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-dim">
              <MapPinned className="h-3.5 w-3.5" /> Localities
            </h2>
            <div className="flex flex-wrap gap-2">
              {page.localities.map((l) => (
                <span key={l.id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-obsidian-2 px-3 py-1.5 text-[12.5px] text-ivory-dim">
                  {l.name} · {l.templeCount}
                </span>
              ))}
            </div>
          </div>
        )}

        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-dim">Temples in {page.adminUnit.name}</h2>
        <TempleCards temples={page.temples} />
      </Container>
    </>
  );
}