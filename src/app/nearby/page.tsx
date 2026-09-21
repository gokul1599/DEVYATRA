import type { Metadata } from "next";
import { Navigation } from "lucide-react";
import { getTemple, getState, nearbyFor, templeUrl, TEMPLES } from "@/lib/registry";
import { feedPlacesFor } from "@/lib/feeds";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = { title: "Explore nearby" };

const KIND_EMOJI: Record<string, string> = {
  temple: "🛕", restaurant: "🍴", hotel: "🏨", attraction: "🏛️", nature: "🌳",
  shopping: "🛍️", parking: "🚗", hospital: "🏥", pharmacy: "💊", police: "👮",
  restroom: "🚻", atm: "🏧", fuel: "⛽", transport: "🚉",
};

const KIND_LABEL: Record<string, string> = {
  temple: "Temples", restaurant: "Restaurants", hotel: "Hotels", attraction: "Historical places",
  nature: "Nature", shopping: "Shopping", parking: "Parking", hospital: "Hospitals",
  pharmacy: "Pharmacies", police: "Police", restroom: "Restrooms", atm: "ATMs", fuel: "Fuel", transport: "Transport",
};

export default async function NearbyPage({ searchParams }: { searchParams: Promise<{ temple?: string; lat?: string; lng?: string; label?: string }> }) {
  const sp = await searchParams;
  const temple = sp.temple ? getTemple(sp.temple) : undefined;

  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="nearby-explorer" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading
            eyebrow="Explore nearby"
            title={temple ? `Around ${temple.name}` : sp.lat ? "Near your location" : "What's around India's temples"}
            sub={
              temple
                ? `Curated places in and around ${temple.location}, ${temple.district}.`
                : sp.lat
                  ? `You're at ${sp.lat}, ${sp.lng}${sp.label ? ` near ${sp.label}` : ""}. Doorstep business data is streamed here via our maps integration from the admin pipeline; meanwhile explore curated temple surroundings.`
                  : "Food, stays, darshan essentials and nature around the atlas's great shrines."
            }
          />
        </Container>
      </section>

      <Container>
        {temple && (
          <Reveal className="mb-10">
            <div className="rounded-3xl border border-gold/20 bg-surface-warm p-6">
              <p className="text-[14px] text-ivory-dim">
                Viewing via{" "}
                <a href={templeUrl(temple)} className="font-medium text-gold-bright hover:underline">
                  {temple.name}
                </a>{" "}
                in {temple.location}, {temple.district}.
              </p>
            </div>
          </Reveal>
        )}

        {/* Geolocation banner if lat/lng present */}
        {!temple && sp.lat && (
          <Reveal className="mb-8">
            <div className="flex items-start gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 px-5 py-4 text-[13px] leading-relaxed text-sky-200/80">
              <Navigation className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Live map data (restaurants, hotels, pharmacies within &lt;2 km) arrives via the
                business-data integration in the admin pipeline. Until then, browse curated nearby
                places around the featured shrines below.
              </p>
            </div>
          </Reveal>
        )}

        <div className="space-y-14">
          {(temple ? [temple] : TEMPLES.filter((t) => nearbyFor(t.id).length > 0)).map((t) => {
            const places = nearbyFor(t.id).filter((n) => n.distanceKm <= 8);
            const feed = feedPlacesFor(t.id);
            const all = [
              ...places.map((p) => ({ ...p, live: false })),
              ...feed.map((p) => ({ ...p, live: true })),
            ];
            const byKind = all.reduce<Record<string, typeof all>>((acc, n) => {
              acc[n.kind] ??= [];
              acc[n.kind].push(n);
              return acc;
            }, {});
            const st = getState(t.stateCode);
            return (
              <section key={t.id}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl font-medium text-ivory">{t.name}</p>
                    <p className="text-[13px] text-ivory-dim">
                      {t.location}, {t.district} · {st?.name}
                    </p>
                  </div>
                  <a href={templeUrl(t)} className="text-[12.5px] font-medium text-gold-bright hover:underline">
                    View temple →
                  </a>
                </div>

                <div className="grid gap-10 lg:grid-cols-2">
                  {Object.entries(byKind).map(([kind, list]) => (
                    <div key={kind}>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-dim">
                        {KIND_EMOJI[kind]} {KIND_LABEL[kind]}
                      </p>
                      <div className="space-y-2.5">
                        {list.map((p) => (
                          <div key={p.id} className="rounded-2xl border border-line bg-obsidian-2 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-medium text-ivory">{p.name}</p>
                              <span className="flex shrink-0 items-center gap-1.5">
                                {p.live && (
                                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300/90">
                                    live
                                  </span>
                                )}
                                <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-ivory-dim">
                                  {p.distanceKm} km
                                </span>
                              </span>
                            </div>
                            {p.recommendation && (
                              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ivory-dim">{p.recommendation}</p>
                            )}
                            {p.priceHint && <p className="mt-1 text-[11px] uppercase tracking-wider text-gold-dim">{p.priceHint}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Container>
    </>
  );
}