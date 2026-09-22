import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, ArrowRight, Landmark } from "lucide-react";
import { listStates } from "@/lib/db/directory";
import { getStates } from "@/lib/registry";
import { Container, SectionHeading, Breadcrumbs } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { Stagger, StaggerItem } from "@/components/motion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore India — Devyatra",
  description: "Journey through India's sacred geography — 36 States & Union Territories and 1,655 verified temples.",
};

export default async function ExplorePage() {
  const dbStates = await listStates();
  const all = getStates();

  const liveStates = dbStates.length > 0
    ? dbStates
        .filter((s) => s.templeCount > 0)
        .sort((a, b) => b.templeCount - a.templeCount || a.name.localeCompare(b.name))
        .map((s) => ({
          code: s.code,
          name: s.name,
          slug: s.slug,
          type: s.type,
          capital: s.capital || "Capital",
          count: s.templeCount,
        }))
    : all.map((s) => ({
        code: s.code,
        name: s.name,
        slug: s.slug,
        type: s.type,
        capital: s.capital,
        count: 0,
      }));

  const pending = dbStates.length > 0
    ? dbStates
        .filter((s) => s.templeCount === 0)
        .map((s) => ({ name: s.name, code: s.code }))
    : [];

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="explore-india-map" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Explore India" }]} className="mb-4" />
          <SectionHeading
            eyebrow="The sacred atlas"
            title="Explore India"
            sub="Every temple on Devyatra is anchored to its official administrative home — state, district, sub-district and locality."
          />
        </Container>
      </section>

      <Container>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {liveStates.map((s) => (
            <StaggerItem key={s.code}>
              <Link
                href={`/explore/${s.slug}`}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-line bg-obsidian-2 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30"
              >
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold">
                  <Landmark className="h-3.5 w-3.5" /> {s.type}
                </span>
                <h2 className="mt-3 font-display text-xl font-medium text-ivory transition-colors group-hover:text-gold-bright">
                  {s.name}
                </h2>
                <div className="mt-5 flex items-center justify-between text-[12px] text-ivory-dim">
                  <span>
                    {s.count} temple{s.count === 1 ? "" : "s"} · {s.capital}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-gold-dim transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        {pending.length > 0 && (
          <div className="mt-14">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-dim">
              More of India, coming to the atlas
            </p>
            <div className="flex flex-wrap gap-2">
              {pending.map((s) => (
                <span
                  key={s.code}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-3 py-1.5 text-[12.5px] text-ivory-dim/70"
                >
                  <MapPin className="h-3 w-3" /> {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}