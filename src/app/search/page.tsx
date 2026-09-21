import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Landmark, MapPin, Sparkles, CalendarDays } from "lucide-react";
import { search } from "@/lib/search";
import { getState } from "@/lib/registry";
import { Container } from "@/components/ui";
import { SearchBar } from "@/components/search-bar";
import { TempleCard } from "@/components/temple-card";
import { LiveDiscoveryPanel } from "@/components/live-discovery-panel";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const res = query ? search(query, 12) : null;

  return (
    <>
      <section className="relative pt-32">
        <Container>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Search</p>
          <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">
            {query ? `Results for “${query}”` : "Search the sacred atlas"}
          </h1>
          <div className="mt-6 max-w-2xl">
            <SearchBar size="lg" autoFocus={!query} />
          </div>
        </Container>
      </section>

      <section className="pt-10">
        <Container>
          {!query ? (
            <p className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-sm text-ivory-dim">
              Search by temple, deity, city, district, festival or state — try “Tirumala”, “Shiva”, “Ayodhya” or “Jyotirlinga”.
            </p>
          ) : !res || !res.temples.length && !res.locations.length && !res.deities.length && !res.festivals.length ? (
            <div className="space-y-6">
              <p className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-sm text-ivory-dim">
                No matches for “{query}”. Try a deity, city or festival.
              </p>
              {query && <LiveDiscoveryPanel query={query} exclude={[]} />}
            </div>
          ) : (
            <div className="space-y-12">
              {res.temples.length > 0 && (
                <div>
                  <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-ivory">
                    <Landmark className="h-5 w-5 text-gold" /> Temples
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {res.temples.map((t, i) => (
                      <TempleCard key={t.slug} temple={t} stateSlug={getState(t.stateCode)?.slug ?? ""} index={i} />
                    ))}
                  </div>
                </div>
              )}

              <ResultGroup
                icon={<MapPin className="h-4 w-4" />}
                title="Places"
                items={res.locations?.map((l) => ({ href: l.href, title: l.label, sub: l.sub }))}
              />
              <ResultGroup
                icon={<Sparkles className="h-4 w-4" />}
                title="Deities"
                items={res.deities?.map((d) => ({ href: d.href, title: d.label, sub: `${d.count} temple${d.count > 1 ? "s" : ""}` }))}
              />
              <ResultGroup
                icon={<CalendarDays className="h-4 w-4" />}
                title="Festivals"
                items={res.festivals?.map((f) => ({ href: f.href, title: f.label, sub: f.temple.name }))}
              />

              {query && (
                <div className="border-t border-line pt-8">
                  <h2 className="mb-3 flex items-center gap-2 font-display text-xl text-ivory">More temples via live place data</h2>
                  <LiveDiscoveryPanel query={query} exclude={res.temples.map((t) => t.name)} />
                </div>
              )}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

function ResultGroup({ icon, title, items }: { icon: ReactNode; title: string; items?: { href: string; title: string; sub: string }[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-ivory">
        <span className="text-gold">{icon}</span> {title}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="flex items-center justify-between rounded-xl border border-line bg-obsidian-2 px-4 py-3 transition-colors hover:border-gold/30"
          >
            <div>
              <p className="text-[13.5px] font-medium text-ivory">{it.title}</p>
              <p className="text-[11.5px] text-ivory-dim">{it.sub}</p>
            </div>
            <span className="text-gold-dim">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}