import type { Metadata } from "next";
import { getFestivalAll, getState } from "@/lib/registry";
import { Container } from "@/components/ui";
import { festivalDate, fmtDate } from "@/lib/format";
import { getTodayPanchang } from "@/lib/intelligence";
import { FestivalExplorer, type SerializedFestival } from "@/components/festivals/festival-explorer";

export const metadata: Metadata = {
  title: "The Celestial Calendar of Bharat · Sacred Festivals · Templeora",
  description: "Pan-India sacred temple festival calendar arranged strictly date-wise. Processions, Rath Yatras, Kalyanotsavams, and Jayantis across verified living sanctuaries.",
};

export default async function FestivalsPage() {
  const now = new Date();
  const year = now.getFullYear();

  // Compute exact dates and sort strictly date-wise
  const rawFestivals = getFestivalAll();

  const allFestivals: SerializedFestival[] = rawFestivals.map((f) => {
    let d = festivalDate(f.month, f.day, year);
    if (d < now) {
      d = festivalDate(f.month, f.day, year + 1);
    }

    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    let relativeLabel = `In ${diffDays} days`;
    if (diffDays === 0) relativeLabel = "Today";
    else if (diffDays === 1) relativeLabel = "Tomorrow";
    else if (diffDays <= 7) relativeLabel = `In ${diffDays} days`;
    else if (diffDays <= 30) relativeLabel = `In ${Math.ceil(diffDays / 7)} weeks`;
    else relativeLabel = `In ${Math.round(diffDays / 30)} months`;

    const st = getState(f.temple.stateCode);

    return {
      id: f.id,
      name: f.name,
      month: f.month,
      day: f.day,
      dateStr: d.toISOString(),
      formattedDate: fmtDate(d),
      daysRemaining: diffDays,
      relativeLabel,
      dateLabel: f.dateLabel,
      description: f.description,
      specialDarshan: f.specialDarshan,
      temple: {
        id: f.temple.id,
        slug: f.temple.slug,
        name: f.temple.name,
        location: f.temple.location,
        district: f.temple.district,
        stateCode: f.temple.stateCode,
        stateName: st ? st.name : f.temple.stateCode,
        mainDeity: f.temple.mainDeity,
      },
    };
  }).sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());

  const panchang = getTodayPanchang(now);

  return (
    <main className="relative min-h-screen bg-[#0A0806] pt-28 pb-24">
      {/* Editorial Header */}
      <section className="relative pb-10">
        <Container>
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-[#C8A24B]">
              Sacred Time &amp; Celestial Rhythm
            </span>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F2ECE1] leading-tight">
              The Celestial Calendar of Bharat
            </h1>
            <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-stone-300">
              India’s temples breathe to the rhythm of lunar tithis, solstices, and cosmic alignments.
              Explore all {allFestivals.length} sacred celebrations arranged strictly date-wise, from today’s upcoming processions to the annual twelve-month cycle.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Interactive Festival Explorer */}
      <Container>
        <FestivalExplorer
          festivals={allFestivals}
          panchang={{
            tithi: panchang.tithi,
            paksha: panchang.paksha,
            masa: panchang.masa,
            nakshatra: panchang.nakshatra,
            samvat: panchang.samvat,
            auspiciousRitualNote: panchang.auspiciousRitualNote,
          }}
        />
      </Container>
    </main>
  );
}