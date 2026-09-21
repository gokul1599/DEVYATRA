import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";

export const metadata: Metadata = { title: "About Devyatra", description: "What Devyatra is, why it exists, and how verification works." };

const BLOCKS: { title: string; body: string[] }[] = [
  {
    title: "A living atlas of India's temples",
    body: [
      "Devyatra is a purpose-built explorer for India's temples — pilgrimage trails, darshan culture, architecture, festivals and the practical realities of visiting them. It is designed to be as calm as the spaces it documents.",
      "Every shrine is filed under its state → district → sub-unit → location, mirroring how pilgrims and administrators actually refer to places.",
    ],
  },
  {
    title: "Verification over speed",
    body: [
      "Timings, fees, festival dates and booking links change constantly. Devyatra refuses to guess. Each data point carries a verification status — from VERIFIED_OFFICIAL (confirmed by the temple administration) down to UNVERIFIED (pending) — with the source attached.",
      "When pilgrims report an error, the correction enters a triage pipeline and is only published once reconciled with an official source.",
    ],
  },
  {
    title: "AI that stays in context",
    body: [
      "The AI companion and the planner are scoped to the temple's own verified context. They can synthesise, sequence and translate — but they are hard-wired never to invent a price, a timing, or a booking URL.",
      "The planner lays out a realistic darshan day; the companion answers questions grounded in the shrine's record.",
    ],
  },
  {
    title: "Respectful by design",
    body: [
      "Reduced-motion friendly, multilingual in 12 Indian languages, and honest about what is known versus what is still being verified. Devyatra is built for pilgrims, trustees, travellers and historians alike.",
    ],
  },
];

export default async function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="about" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading eyebrow="About" title="Built for the sacred geography of India" />
        </Container>
      </section>
      <Container className="pb-24">
        <div className="max-w-2xl space-y-8">
          {BLOCKS.map((b) => (
            <div key={b.title}>
              <h2 className="font-display text-xl font-medium text-ivory">{b.title}</h2>
              {b.body.map((p, i) => (
                <p key={i} className="mt-3 text-[14.5px] leading-relaxed text-ivory/85">{p}</p>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}