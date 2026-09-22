import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Landmark } from "lucide-react";
import { getCoverage, listStates, directoryStatus } from "@/lib/db/directory";
import { Container, SectionHeading, Breadcrumbs } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { Stagger, StaggerItem } from "@/components/motion";
import { DirectoryOffline } from "@/components/directory/shared";

export const metadata: Metadata = {
  title: "India — Devyatra Directory",
  description: "The permanent, database-driven directory of India's temples, organised by the official administrative hierarchy.",
};

export const dynamic = "force-dynamic";

export default async function IndiaPage() {
  if (directoryStatus() === "offline") {
    return (
      <>
        <Header />
        <DirectoryOffline />
      </>
    );
  }
  const coverage = await getCoverage();
  if (!coverage) throw new Error("Directory unavailable");
  const states = await listStates();

  return (
    <>
      <Header />
      <Container>
        <section className="grid grid-cols-2 gap-3 rounded-3xl border border-line bg-obsidian-2/50 p-5 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "States & UTs in directory", value: coverage.states },
            { label: "Districts indexed", value: coverage.districts },
            { label: "Sub-districts", value: coverage.adminUnits },
            { label: "Localities", value: coverage.localities },
            { label: "States with temples", value: coverage.statesWithTemples },
            { label: "Verified temple records", value: coverage.temples },
          ].map((c) => (
            <div key={c.label}>
              <p className="font-display text-3xl text-gold">{c.value.toLocaleString()}</p>
              <p className="mt-1 text-[11.5px] leading-tight text-ivory-dim">{c.label}</p>
            </div>
          ))}
        </section>
        <p className="mt-3 text-[11.5px] text-ivory-dim/70">
          Coverage is computed live from the directory database — never estimated.
        </p>

        <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {states.map((s) => (
            <StaggerItem key={s.code}>
              <Link
                href={`/states/${s.slug}`}
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
                    {s.templeCount} temple{s.templeCount === 1 ? "" : "s"} · {s.districtCount} district{s.districtCount === 1 ? "" : "s"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-gold-dim transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </>
  );
}

function Header() {
  return (
    <section className="relative overflow-hidden pb-10 pt-32">
      <div className="absolute inset-0 -z-10 opacity-40">
        <DevyatraArt seed="india-directory" variant="banner" className="h-full w-full" />
      </div>
      <Container>
        <DirectoryBreadcrumbsInline />
        <SectionHeading
          eyebrow="The permanent directory"
          title="India"
          sub="Every temple is anchored to its official administrative home — state, district, sub-district and locality."
        />
      </Container>
    </section>
  );
}

function DirectoryBreadcrumbsInline() {
  return (
    <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "India" }]} className="mb-4" />
  );
}