import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import { directoryStatus, getStateBySlug, listDistricts } from "@/lib/db/directory";
import { Container, SectionHeading } from "@/components/ui";
import { Stagger, StaggerItem } from "@/components/motion";
import { DirectoryBreadcrumbs, DirectoryOffline } from "@/components/directory/shared";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const s = directoryStatus() === "offline" ? null : await getStateBySlug(state);
  if (!s) return { title: "State — Devyatra" };
  const districts = s.districtCount;
  const temples = s.templeCount;
  return {
    title: `${s.name} · Temples — Devyatra Directory`,
    description: `${temples} verified temple record${temples === 1 ? "" : "s"} across ${districts} district${districts === 1 ? "" : "s"} of ${s.name}, indexed by the official administrative hierarchy.`,
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;

  if (directoryStatus() === "offline") {
    return (
      <>
        <OfflineHeader />
        <DirectoryOffline />
      </>
    );
  }

  const s = await getStateBySlug(state);
  if (!s) notFound();
  const districts = await listDistricts(s.slug);
  const withTemples = districts.filter((d) => d.templeCount > 0);
  const bare = districts.filter((d) => d.templeCount === 0);

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32">
        <Container>
          <DirectoryBreadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "India", href: "/india" }, { label: s.name }]} />
          <SectionHeading
            eyebrow={`${s.type === "union_territory" ? "Union territory" : "State"} · ${s.adminUnitTerm} sub-districts`}
            title={s.name}
            sub={`${s.templeCount} temple record${s.templeCount === 1 ? "" : "s"} · ${withTemples.length} of ${districts.length} districts with verified temple presence.`}
          />
        </Container>
      </section>

      <Container>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {districts.map((d) => (
            <StaggerItem key={d.id}>
              <Link
                href={`/states/${s.slug}/districts/${d.slug}`}
                className="group flex h-full flex-col justify-between rounded-2xl border border-line bg-obsidian-2 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30"
              >
                <h2 className="font-display text-lg leading-snug text-ivory transition-colors group-hover:text-gold-bright">
                  {d.name}
                </h2>
                <div className="mt-4 flex items-center justify-between text-[12px] text-ivory-dim">
                  <span>{d.templeCount} temple{d.templeCount === 1 ? "" : "s"}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-gold-dim transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        {bare.length > 0 && (
          <div className="mt-10">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-dim">
              Districts awaiting verified records
            </p>
            <div className="flex flex-wrap gap-2">
              {bare.map((d) => (
                <span key={d.id} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-3 py-1.5 text-[12.5px] text-ivory-dim/70">
                  <MapPin className="h-3 w-3" /> {d.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

function OfflineHeader() {
  return (
    <section className="relative overflow-hidden pb-6 pt-32">
      <Container>
        <SectionHeading eyebrow="The permanent directory" title="State view" sub="Loading from the directory database." />
      </Container>
    </section>
  );
}