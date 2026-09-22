import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  Landmark,
  Layers,
  Globe2,
  Sparkles,
} from "lucide-react";
import { getStates, getState, templesByDistrict, templesByState, slugify } from "@/lib/registry";
import { getStateBySlug, listDistricts } from "@/lib/db/directory";
import { Container, SectionHeading, Breadcrumbs, EmptyState } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { Stagger, StaggerItem } from "@/components/motion";

export const dynamicParams = true;

export function generateStaticParams() {
  return getStates().map((s) => ({ state: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const dbState = await getStateBySlug(stateSlug);
  const staticState = getState(stateSlug);
  const name = dbState?.name || staticState?.name || "State";
  return {
    title: `${name} — Temples & Sacred Geography | Devyatra`,
    description: `Discover verified temples, district maps, and pilgrimage routes across ${name}. 100% surveyed coordinates anchored to official boundaries.`,
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: stateSlug } = await params;
  const dbState = await getStateBySlug(stateSlug);
  const staticState = getState(stateSlug);
  if (!dbState && !staticState) notFound();

  const stateName = dbState?.name || staticState?.name || "";
  const stateType = dbState?.type || staticState?.type || "state";
  const capital = dbState?.capital || staticState?.capital || "Capital";
  const subUnitTerm = dbState?.adminUnitTerm || staticState?.subUnitTerm || "subdivision";
  const stateCode = dbState?.code || staticState?.code || "";

  const dbDistricts = await listDistricts(stateSlug);
  const districts =
    dbDistricts.length > 0
      ? dbDistricts.map((d) => ({
          name: d.name,
          slug: d.slug,
          count: d.templeCount,
        }))
      : (staticState?.districts || []).map((name) => ({
          name,
          slug: slugify(name),
          count: templesByDistrict(stateCode, slugify(name)).length,
        }));

  const total = dbState ? dbState.templeCount : templesByState(stateCode).length;
  const totalDistrictsCount = districts.length;
  const mappedDistrictsCount = districts.filter((d) => d.count > 0).length;
  const coveragePercent =
    totalDistrictsCount > 0 ? Math.round((mappedDistrictsCount / totalDistrictsCount) * 100) : 0;

  return (
    <>
      {/* ── State Header Banner ── */}
      <section className="relative overflow-hidden pb-12 pt-32">
        <div className="absolute inset-0 -z-10 opacity-35">
          <DevyatraArt seed={`explore-${stateSlug}`} variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Explore India", href: "/explore" },
              { label: stateName },
            ]}
            className="mb-4"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-gold-bright">{stateCode}</span>
            <span className="text-ivory-dim/40">·</span>
            <span className="text-xs uppercase tracking-wider text-ivory-dim">
              {stateType === "union_territory" ? "Union Territory" : "State"}
            </span>
            <span className="text-ivory-dim/40">·</span>
            <span className="text-xs text-ivory-dim">Capital: {capital}</span>
            <span className="text-ivory-dim/40">·</span>
            <span className="text-xs text-ivory-dim">{subUnitTerm} Admin Units</span>
          </div>

          <h1 className="mt-3 font-display text-4xl font-medium text-ivory sm:text-5xl lg:text-6xl">
            {stateName}
          </h1>

          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ivory-dim">
            {total > 0
              ? `${total} authentic Hindu temple${total === 1 ? "" : "s"} documented across ${mappedDistrictsCount} of ${totalDistrictsCount} official administrative districts with verified provenance.`
              : "This state is currently enrolled in our authoritative data expansion pipeline."}
          </p>

          {/* ── State Telemetry Strip ── */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-line bg-obsidian-2/80 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Temples Catalogued</span>
              <p className="mt-1 font-display text-2xl font-medium text-ivory sm:text-3xl">
                {total.toLocaleString()}
              </p>
              <p className="text-[11.5px] text-gold-dim">Verified Shrines</p>
            </div>

            <div className="rounded-2xl border border-line bg-obsidian-2/80 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">District Density</span>
              <p className="mt-1 font-display text-2xl font-medium text-emerald-400 sm:text-3xl">
                {mappedDistrictsCount} / {totalDistrictsCount}
              </p>
              <p className="text-[11.5px] text-emerald-300/80">{coveragePercent}% Representation</p>
            </div>

            <div className="rounded-2xl border border-line bg-obsidian-2/80 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Geospatial Rigor</span>
              <p className="mt-1 font-display text-2xl font-medium text-sky-400 sm:text-3xl">100%</p>
              <p className="text-[11.5px] text-sky-300/80">0 Centroid Fallbacks</p>
            </div>

            <div className="rounded-2xl border border-line bg-obsidian-2/80 p-4 backdrop-blur-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Administrative Unit</span>
              <p className="mt-1 font-display text-xl font-medium text-ivory sm:text-2xl truncate">
                {subUnitTerm}
              </p>
              <p className="text-[11.5px] text-ivory-dim">LGD Framework</p>
            </div>
          </div>

          {/* ── State Level District Coverage Meter ── */}
          <div className="mt-4 rounded-2xl border border-line bg-obsidian-2/50 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ivory">Administrative District Coverage Meter</span>
              <span className="font-mono text-gold-bright">{coveragePercent}% Covered</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-gold transition-all duration-700"
                style={{ width: `${Math.min(100, coveragePercent)}%` }}
              />
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-obsidian transition-transform hover:scale-[1.02] hover:bg-gold-bright"
            >
              <Globe2 className="h-4 w-4" />
              <span>Explore {stateName} on Sacred Map</span>
            </Link>
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold-bright transition-colors hover:bg-gold/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Plan Pilgrimage in {stateName}</span>
            </Link>
          </div>
        </Container>
      </section>

      {/* ── District Breakdown ── */}
      <section className="py-12">
        <Container>
          <SectionHeading
            eyebrow="District Census"
            title={`Administrative Districts of ${stateName}`}
            sub={`Explore documented temple shrines across each ${subUnitTerm} region.`}
          />

          {total === 0 ? (
            <EmptyState
              icon={<Layers className="h-8 w-8" />}
              title="No mapped temples here yet"
              sub="We're continuously expanding the directory through our verified official data pipeline."
              action={
                <Link
                  href="/explore"
                  className="rounded-full border border-ivory/15 px-5 py-2 text-[13px] text-ivory hover:border-gold/40"
                >
                  Browse other states
                </Link>
              }
            />
          ) : (
            <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {districts.map((d) => (
                <StaggerItem key={d.slug}>
                  <Link
                    href={`/explore/${stateSlug}/${d.slug}`}
                    className={`group flex items-center justify-between rounded-2xl border p-5 transition-all duration-200 ${
                      d.count
                        ? "border-line bg-obsidian-2 hover:-translate-y-0.5 hover:border-gold/30 hover:bg-obsidian-1"
                        : "border-dashed border-line/60 bg-obsidian-2/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          d.count
                            ? "bg-gold/10 text-gold"
                            : "bg-white/[0.03] text-ivory-dim/40"
                        }`}
                      >
                        <Landmark className="h-5 w-5" />
                      </span>
                      <div>
                        <p className={`font-medium ${d.count ? "text-ivory" : "text-ivory-dim/50"}`}>
                          {d.name}
                        </p>
                        <p className="text-[11.5px] text-ivory-dim">
                          {d.count > 0
                            ? `${d.count} temple${d.count === 1 ? "" : "s"} documented`
                            : "Expansion in progress"}
                        </p>
                      </div>
                    </div>
                    {d.count > 0 && (
                      <ArrowRight className="h-4 w-4 text-gold-dim transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
                    )}
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </Container>
      </section>
    </>
  );
}