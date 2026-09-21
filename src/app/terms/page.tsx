import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";

export const metadata: Metadata = { title: "Terms of service" };

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Information quality",
    body: "Devyatra publishes temple information with explicit verification statuses. We work hard to keep facts accurate, but timings, fees and festival dates change; the temple administration remains the authoritative source. Never rely on Devyatra alone for critical decisions — verify on the official portal before you travel.",
  },
  {
    title: "No bookings brokered",
    body: "Devyatra links to official booking portals where the verification status allows it. We do not sell tickets, accept payments, or broker darshan slots. Any official-website links are clearly attributed, and unverified booking URLs are never surfaced as actions.",
  },
  {
    title: "Community reports",
    body: "Pilgrim reports are accepted in good faith and enter a triage pipeline. Publishing a report does not imply that Devyatra endorses its content; corrections appear only after reconciliation with official sources.",
  },
  {
    title: "Acceptable use",
    body: "Do not misuse the service to scrape listings, to harass temple administrations, or to misrepresent official data. Accounts that submit abusive reports may be closed.",
  },
];

export default async function TermsPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="terms" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading eyebrow="Legal" title="Terms of service" />
        </Container>
      </section>
      <Container className="pb-24">
        <div className="max-w-2xl space-y-6">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-lg font-medium text-ivory">{s.title}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ivory/85">{s.body}</p>
            </div>
          ))}
          <p className="pt-4 text-[12.5px] text-ivory-dim">Last updated: {new Date().toLocaleDateString("en-IN")}</p>
        </div>
      </Container>
    </>
  );
}