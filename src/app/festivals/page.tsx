import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, Sparkles } from "lucide-react";
import { getFestivalAll, templeUrl } from "@/lib/registry";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { festivalDate, fmtDate } from "@/lib/format";
import { cn } from "@/lib/cn";

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
        </Container>
      </section>

      <Container>
        {sortedMonths.map((m) => (
          <section key={m} className="mb-12">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/12 text-gold-bright">
                <CalendarDays className="h-5 w-5" />
              </span>
              <h2 className="font-display text-2xl font-medium text-ivory">{MONTHS[m]}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(grouped[m] ?? []).map((f) => (
                <Link
                  key={`${f.id}-${m}`}
                  href={`${templeUrl(f.temple)}#festivals`}
                  className={cn(
                    "group rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:-translate-y-0.5 hover:border-gold/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[17px] font-medium text-ivory group-hover:text-gold-bright">{f.name}</p>
                      <p className="mt-0.5 text-[12.5px] text-ivory-dim">{f.temple.name}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-gold/12 px-2.5 py-1 font-display text-[13px] font-semibold text-gold-bright">
                      {fmtDate(f.date)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-ivory-dim">{f.description}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-wider text-gold-dim">{f.dateLabel}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-4 rounded-2xl border border-dashed border-line p-6 text-center">
          <p className="flex items-center justify-center gap-2 text-[13px] text-ivory-dim">
            <Sparkles className="h-4 w-4 text-gold" />
            Dates are nominal yearly positions; lunar festivals shift seasonally. Confirm on the official temple source before travel.
          </p>
        </div>
      </Container>
    </>
  );
}