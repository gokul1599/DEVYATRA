import Link from "next/link";
import type { Metadata } from "next";
import { Landmark, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { getPaginatedTemples, getDirectoryStats, listStates } from "@/lib/db/directory";
import { Container } from "@/components/ui";
import { TempleCard } from "@/components/temple-card";
import { TempleFilters } from "@/components/temple-filters";
import { SearchBar } from "@/components/search-bar";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Temple directory — Devyatra",
  description: "Browse verified, source-tagged temples across India — filter by state, district, tradition, deity, or architecture.",
};

interface Filters {
  q: string;
  state: string;
  style: string;
  tradition: string;
  deity: string;
  verificationStatus: string;
}

function param(p: URLSearchParams): Filters {
  return {
    q: (p.get("q") ?? "").trim(),
    state: (p.get("state") ?? "").trim(),
    style: (p.get("style") ?? "").trim(),
    tradition: (p.get("tradition") ?? "").trim(),
    deity: (p.get("deity") ?? "").trim(),
    verificationStatus: (p.get("verificationStatus") ?? p.get("badge") ?? "").trim(),
  };
}

function makePageUrl(params: URLSearchParams, pageNum: number): string {
  const nextP = new URLSearchParams(params);
  if (pageNum <= 1) {
    nextP.delete("page");
  } else {
    nextP.set("page", String(pageNum));
  }
  const qs = nextP.toString();
  return qs ? `/temples?${qs}` : "/temples";
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) return [1, "...", total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default async function TemplesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") p.set(k, v);
  }

  const f = param(p);
  const page = Math.max(1, parseInt(p.get("page") || "1", 10));
  const limit = 24;

  const [result, stats, allStates] = await Promise.all([
    getPaginatedTemples({
      page,
      limit,
      q: f.q || undefined,
      state: f.state || undefined,
      style: f.style || undefined,
      tradition: f.tradition || undefined,
      deity: f.deity || undefined,
      verificationStatus: f.verificationStatus || undefined,
    }),
    getDirectoryStats(),
    listStates(),
  ]);

  const activeStates = allStates
    .filter((s) => s.templeCount > 0)
    .sort((a, b) => b.templeCount - a.templeCount || a.name.localeCompare(b.name));

  const currentState = f.state
    ? activeStates.find(
        (s) =>
          s.code.toUpperCase() === f.state.toUpperCase() ||
          s.slug.toLowerCase() === f.state.toLowerCase()
      )
    : undefined;

  const activeChips: { label: string; href: string }[] = [];
  const base = "/temples";
  const rm = (key: string) => {
    const np = new URLSearchParams(p);
    np.delete(key);
    np.delete("page");
    const qs = np.toString();
    return qs ? `${base}?${qs}` : base;
  };

  if (f.q) activeChips.push({ label: `“${f.q}”`, href: rm("q") });
  if (currentState) activeChips.push({ label: currentState.name, href: rm("state") });
  else if (f.state) activeChips.push({ label: `State: ${f.state}`, href: rm("state") });
  if (f.style) activeChips.push({ label: `Style: ${f.style}`, href: rm("style") });
  if (f.tradition) activeChips.push({ label: `Tradition: ${f.tradition}`, href: rm("tradition") });
  if (f.deity) activeChips.push({ label: `Deity: ${f.deity}`, href: rm("deity") });
  if (f.verificationStatus) {
    activeChips.push({ label: `Status: ${f.verificationStatus.replace(/_/g, " ")}`, href: rm("verificationStatus") });
  }

  const startIdx = result.total === 0 ? 0 : (result.page - 1) * result.limit + 1;
  const endIdx = Math.min(result.page * result.limit, result.total);

  const styleOptions = [
    { value: "Dravidian", label: "Dravidian" },
    { value: "Nagara", label: "Nagara" },
    { value: "Vesara", label: "Vesara" },
    { value: "Kalinga", label: "Kalinga" },
    { value: "Hemadpanti", label: "Hemadpanti" },
    { value: "Cave", label: "Rock-cut / Cave" },
  ];

  const traditionOptions = [
    { value: "Shaiva", label: "Shaiva" },
    { value: "Vaishnava", label: "Vaishnava" },
    { value: "Shakta", label: "Shakta" },
    { value: "Smartism", label: "Smartha" },
  ];

  return (
    <>
      <section className="relative pt-32">
        <Container>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            National Master Directory
          </p>
          <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">All temples</h1>
          <p className="mt-3 max-w-xl text-[15px] text-ivory-dim">
            <span className="font-semibold text-ivory">{stats.temples.toLocaleString()}</span> authentic, source-backed shrines indexed across <span className="font-semibold text-ivory">{stats.states}</span> States & UTs. Filter by administrative region, deity, tradition, or architectural style.
          </p>
          <div className="mt-7 max-w-2xl">
            <SearchBar size="lg" />
          </div>
        </Container>
      </section>

      <section className="pt-10">
        <Container>
          <TempleFilters
            states={activeStates.map((s) => ({
              value: s.slug,
              label: `${s.name} (${s.templeCount})`,
            }))}
            styles={styleOptions}
            traditions={traditionOptions}
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-medium text-ivory-dim">
                Showing <span className="text-ivory font-semibold">{startIdx}–{endIdx}</span> of{" "}
                <span className="text-ivory font-semibold">{result.total.toLocaleString()}</span> temples
              </span>

              {activeChips.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[12px] text-gold-bright transition-colors hover:bg-gold/20"
                >
                  {c.label} <X className="h-3 w-3" />
                </Link>
              ))}

              {activeChips.length > 0 && (
                <Link
                  href={base}
                  className="text-[12px] text-ivory-dim/70 underline underline-offset-4 hover:text-ivory"
                >
                  Clear all
                </Link>
              )}
            </div>

            {result.totalPages > 1 && (
              <div className="text-[12.5px] text-ivory-dim">
                Page <span className="text-ivory font-medium">{result.page}</span> of{" "}
                <span className="text-ivory font-medium">{result.totalPages}</span>
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="pt-8 pb-16">
        <Container>
          {result.temples.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {result.temples.map((t, i) => (
                  <TempleCard
                    key={t.slug || t.id}
                    temple={t}
                    stateSlug={t.stateSlug}
                    index={i}
                  />
                ))}
              </div>

              {/* Pagination bar */}
              {result.totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between border-t border-white/[0.08] pt-6">
                  <p className="text-[13px] text-ivory-dim">
                    Showing {startIdx}–{endIdx} of {result.total.toLocaleString()} records
                  </p>

                  <div className="flex items-center gap-1.5">
                    {result.hasPreviousPage ? (
                      <Link
                        href={makePageUrl(p, result.page - 1)}
                        className="inline-flex items-center gap-1 rounded-xl border border-line bg-obsidian-2 px-3 py-2 text-[13px] text-ivory transition-colors hover:border-gold/40 hover:text-gold-bright"
                      >
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </Link>
                    ) : (
                      <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-white/5 bg-obsidian-2/40 px-3 py-2 text-[13px] text-ivory-dim/30">
                        <ChevronLeft className="h-4 w-4" /> Previous
                      </span>
                    )}

                    <div className="hidden sm:flex items-center gap-1">
                      {getPageNumbers(result.page, result.totalPages).map((pn, idx) =>
                        pn === "..." ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-ivory-dim/40">
                            …
                          </span>
                        ) : (
                          <Link
                            key={pn}
                            href={makePageUrl(p, pn)}
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-medium transition-colors",
                              pn === result.page
                                ? "border border-gold bg-gold/20 text-gold-bright shadow-sm"
                                : "border border-line bg-obsidian-2 text-ivory hover:border-gold/40 hover:text-gold-bright"
                            )}
                          >
                            {pn}
                          </Link>
                        )
                      )}
                    </div>

                    {result.hasNextPage ? (
                      <Link
                        href={makePageUrl(p, result.page + 1)}
                        className="inline-flex items-center gap-1 rounded-xl border border-line bg-obsidian-2 px-3 py-2 text-[13px] text-ivory transition-colors hover:border-gold/40 hover:text-gold-bright"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-xl border border-white/5 bg-obsidian-2/40 px-3 py-2 text-[13px] text-ivory-dim/30">
                        Next <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-line py-20 text-center">
              <Landmark className="mb-4 h-10 w-10 text-ivory-dim/40" />
              <p className="font-display text-lg text-ivory">No temples match those criteria</p>
              <p className="mt-2 text-sm text-ivory-dim">Try clearing filters or searching differently.</p>
              <Link
                href={base}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-ivory/20 px-5 py-2 text-[13px] text-ivory transition-colors hover:border-gold/40 hover:text-gold-bright"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> View all temples
              </Link>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}