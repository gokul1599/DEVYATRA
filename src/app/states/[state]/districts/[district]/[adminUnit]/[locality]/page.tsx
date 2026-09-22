import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { directoryStatus, getLocalityPage } from "@/lib/db/directory";
import { Container, SectionHeading } from "@/components/ui";
import { DirectoryBreadcrumbs, DirectoryOffline, TempleCards } from "@/components/directory/shared";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ state: string; district: string; adminUnit: string; locality: string }> }): Promise<Metadata> {
  const p = await params;
  if (directoryStatus() === "offline") return { title: "Locality — Devyatra" };
  const page = await getLocalityPage(p.state, p.district, p.adminUnit, p.locality);
  if (!page) return { title: "Locality — Devyatra" };
  return {
    title: `${page.locality.name} · Temples — Devyatra`,
    description: `${page.locality.templeCount} verified temple record${page.locality.templeCount === 1 ? "" : "s"} in ${page.locality.name}.`,
  };
}

export default async function LocalityPage({ params }: { params: Promise<{ state: string; district: string; adminUnit: string; locality: string }> }) {
  const { state, district, adminUnit, locality } = await params;
  if (directoryStatus() === "offline") {
    return (
      <>
        <SectionHeading eyebrow="The permanent directory" title="Locality view" sub="Loading from the directory database." />
        <div className="pt-8">
          <DirectoryOffline />
        </div>
      </>
    );
  }
  const page = await getLocalityPage(state, district, adminUnit, locality);
  if (!page) notFound();
  const { state: st } = page;

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32">
        <Container>
          <DirectoryBreadcrumbs crumbs={page.breadcrumbs} />
          <SectionHeading
            eyebrow={`${page.locality.kind} · ${page.district.name}, ${st.name}`}
            title={page.locality.name}
            sub={`${page.locality.templeCount} temple record${page.locality.templeCount === 1 ? "" : "s"}.`}
          />
        </Container>
      </section>

      <Container>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-dim">Temples in {page.locality.name}</h2>
        <TempleCards temples={page.temples} />
      </Container>
    </>
  );
}