import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Sparkles } from "lucide-react";
import { getFestivalAll, templeUrl } from "@/lib/registry";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { festivalDate, fmtDate } from "@/lib/format";
import { getTodayPanchang } from "@/lib/intelligence";

export const metadata: Metadata = {
  title: "Festival calendar",
  description: "Temple festivals across India — processions, jayantis and celestial marriages.",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default async function FestivalsPage() {
  const now = new Date();
  const year = now.getFullYear();
  const all = getFestivalAll().map((f) => {
    let d = festivalDate(f.month, f.day, year);
    if (d < now) d = festivalDate(f.month, f.day, year + 1);
    return { ...f, date: d };
  });
  const grouped = all.reduce<Record<number, typeof all>>((acc, f) => {
    acc[f.date.getMonth()] ??= [];
    acc[f.date.getMonth()].push(f);
    return acc;
  }, {});
  const sortedMonths = Object.keys(grouped).map(Number).sort();

  const panchang = getTodayPanchang(now);

  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="festival-calendar" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading
            eyebrow="Festival calendar"
            title="Days the temples come alive"
            sub={`Nominal yearly dates for ${all.length} celebrations across the atlas. Lunar-calendar festivals shift each year — always follow the temple's announced date.`}
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-obsidian-2/90 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/15 text-gold-bright">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-base font-medium text-ivory">
                  Today&apos;s Hindu Panchang: {panchang.tithi}
                </p>
                <p className="text-xs text-ivory-dim">
                  {panchang.masa} Masa · Nakshatra: {panchang.nakshatra} · Samvat {panchang.samvat}
                </p>
              </div>
            </div>

            <span className="rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold-bright">
              {panchang.auspiciousRitualNote}
            </span>
          </div>
          {/* Month Quick Jump Bar */}
          <div className="mt-6 flex flex-wrap gap-2">
            {sortedMonths.map((m) => (
              <a
                key={m}
                href={`#month-${m}`}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-ivory-dim transition-colors hover:border-gold/40 hover:text-gold-bright"
              >
                {MONTHS[m]}
              </a>
            ))}
          </div>

          {/* Festival Operational Integrity Notice */}
          <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/[0.03] p-4 text-xs leading-relaxed text-ivory-dim">
            <p>
              <strong className="text-gold-bright">Lunar Calendar &amp; Devasthanam Confirmation:</strong> Sacred festival tithis are calculated according to traditional Hindu panchang systems. Regional observances can vary by one day depending on local sunrise calculations. Devyatra strongly advises confirming exact puja and rathotsavam schedules with official temple trusts prior to booking journey logistics.
            </p>
          </div>
        </Container>
      </section>

      <Container>
        {sortedMonths.map((m) => (
          <section key={m} id={`month-${m}`} className="mb-14 scroll-mt-24">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/12 text-gold-bright">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <h2 className="font-display text-2xl font-medium text-ivory">{MONTHS[m]}</h2>
              </div>
              <span className="text-xs text-ivory-dim">
                {(grouped[m] ?? []).length} Auspicious Festivities
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(grouped[m] ?? []).map((f) => (
                <div
                  key={`${f.id}-${m}`}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:border-gold/30 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`${templeUrl(f.temple)}#festivals`}
                          className="font-display text-[17px] font-medium text-ivory hover:text-gold-bright"
                        >
                          {f.name}
                        </Link>
                        <p className="mt-0.5 text-[12.5px] text-ivory-dim">{f.temple.name}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-gold/12 px-2.5 py-1 font-display text-[13px] font-semibold text-gold-bright">
                        {fmtDate(f.date)}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-[12.5px] leading-relaxed text-ivory-dim">{f.description}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-wider text-gold-dim">{f.dateLabel}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
                    <Link
                      href={templeUrl(f.temple)}
                      className="text-xs text-ivory-dim hover:text-gold-bright transition-colors"
                    >
                      Temple details →
                    </Link>
                    <Link
                      href={`/plan?temple=${f.temple.slug}&festival=${encodeURIComponent(f.name)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11.5px] font-medium text-gold-bright transition-colors hover:bg-gold/20"
                    >
                      <Sparkles className="h-3 w-3" /> Plan Festival Visit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-8 rounded-2xl border border-line/70 bg-obsidian-2/50 p-6 text-center backdrop-blur-sm">
          <p className="flex items-center justify-center gap-2 text-[13px] text-ivory-dim">
            <Sparkles className="h-4 w-4 text-gold" />
            Dates are nominal yearly positions; lunar festivals shift seasonally. Confirm on official temple sources before travel.
          </p>
        </div>
      </Container>
    </>
  );
}