import Link from "next/link";
import type { Metadata } from "next";
import { Landmark, X } from "lucide-react";
import { TEMPLES } from "@/lib/data/temples";
import { getStates, templesByState, getState } from "@/lib/registry";
import { search } from "@/lib/search";
import { Container } from "@/components/ui";
import { TempleCard } from "@/components/temple-card";
import { TempleFilters } from "@/components/temple-filters";
import { SearchBar } from "@/components/search-bar";

export const metadata: Metadata = {
  title: "Temple directory",
  description: "Browse every temple on Devyatra — filter by state, architecture, tradition, deity and more.",
};

interface Filters {
  q: string;
  state: string;
  style: string;
  tradition: string;
  deity: string;
  badge: string;
  type: string;
}

function param(p: URLSearchParams) {
  return {
    q: (p.get("q") ?? "").toLowerCase().trim(),
    state: (p.get("state") ?? "").toLowerCase().trim(),
    style: (p.get("style") ?? "").toLowerCase().trim(),
    tradition: (p.get("tradition") ?? "").toLowerCase().trim(),
    deity: (p.get("deity") ?? "").toLowerCase().trim(),
    badge: (p.get("badge") ?? "").toLowerCase().trim(),
    type: (p.get("type") ?? "").toLowerCase().trim(),
  };
}

export default async function TemplesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") p.set(k, v);

  const f: Filters = param(p);

  let temples = TEMPLES;
  if (f.q) {
    const { temples: fuzzy } = search(f.q, 100);
    const slugSet = new Set(fuzzy.map((t) => t.slug));
    temples = temples.filter((t) => slugSet.has(t.slug));
  }
  if (f.state) temples = temples.filter((t) => t.stateCode === f.state.toUpperCase() || t.stateCode);
  if (f.style) temples = temples.filter((t) => (t.architecture ?? "").toLowerCase().includes(f.style));
  if (f.tradition) temples = temples.filter((t) => t.tradition.some((tr) => tr.toLowerCase().includes(f.tradition)));
  if (f.deity) temples = temples.filter((t) => t.mainDeity.toLowerCase().includes(f.deity) || t.deities.some((d) => d.toLowerCase().includes(f.deity)));
  if (f.badge) temples = temples.filter((t) => t.badges.some((b) => b.toLowerCase().includes(f.badge)));
  if (f.type) temples = temples.filter((t) => t.type.toLowerCase().includes(f.type));

  const stateFilter = f.state ? getState(f.state) : undefined;
  if (f.state && stateFilter) temples = temples.filter((t) => t.stateCode === stateFilter.code);

  const styles = [...new Set(TEMPLES.map((t) => (t.architecture ?? t.type)).filter(Boolean))].sort();
  const traditions = [...new Set(TEMPLES.flatMap((t) => t.tradition))].sort();

  const activeChips: { label: string; href: string }[] = [];
  const base = "/temples";
  const rm = (key: string) => {
    const np = new URLSearchParams(p);
    np.delete(key);
    const qs = np.toString();
    return qs ? `${base}?${qs}` : base;
  };
  if (f.q) activeChips.push({ label: `“${f.q}”`, href: rm("q") });
  if (stateFilter) activeChips.push({ label: stateFilter.name, href: rm("state") });
  if (f.style) activeChips.push({ label: `Style: ${f.style}`, href: rm("style") });
  if (f.tradition) activeChips.push({ label: `Tradition: ${f.tradition}`, href: rm("tradition") });
  if (f.deity) activeChips.push({ label: `Deity: ${f.deity}`, href: rm("deity") });
  if (f.badge) activeChips.push({ label: `${f.badge}`, href: rm("badge") });
  if (f.type) activeChips.push({ label: `Type: ${f.type}`, href: rm("type") });

  const stateOptions = getStates().filter((s) => templesByState(s.code).length > 0);

  return (
    <>
      <section className="relative pt-32">
        <Container>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Directory</p>
          <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">All temples</h1>
          <p className="mt-3 max-w-lg text-[15px] text-ivory-dim">
            {TEMPLES.length} verified, source-tagged shrines — filter by region, architecture, tradition or deity.
          </p>
          <div className="mt-7 max-w-2xl">
            <SearchBar size="lg" />
          </div>
        </Container>
      </section>

      <section className="pt-10">
        <Container>
          <TempleFilters
            states={stateOptions.map((s) => ({ value: s.code, label: s.name }))}
            styles={styles.map((s) => ({ value: s, label: s }))}
            traditions={traditions.map((s) => ({ value: s, label: s }))}
          />

          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeChips.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[12px] text-gold-bright transition-colors hover:bg-gold/20"
                >
                  {c.label} <X className="h-3 w-3" />
                </Link>
              ))}
              <span className="text-[12px] text-ivory-dim">
                {temples.length} of {TEMPLES.length} temples
              </span>
            </div>
          )}
        </Container>
      </section>

      <section className="pt-8">
        <Container>
          {temples.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {temples.map((t, i) => (
                <TempleCard key={t.slug} temple={t} stateSlug={getState(t.stateCode)?.slug ?? ""} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-line py-20 text-center">
              <Landmark className="mb-4 h-10 w-10 text-ivory-dim/40" />
              <p className="font-display text-lg text-ivory">No temples match those filters</p>
              <p className="mt-2 text-sm text-ivory-dim">Try clearing filters or searching differently.</p>
              <Link href={base} className="mt-6 rounded-full border border-ivory/15 px-5 py-2 text-[13px] text-ivory">
                Clear all
              </Link>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}