import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Building2, Grid2X2, Megaphone, Newspaper, UserCheck } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { ReportForm } from "@/components/report-form";

export const metadata: Metadata = { title: "Report incorrect information" };

const STEPS = [
  { icon: Megaphone, title: "Report", body: "Submit a correction for any temple — timings, fees, facilities or links." },
  { icon: UserCheck, title: "Triage", body: "A human editor checks the claim against the reported source." },
  { icon: Newspaper, title: "Official source", body: "We reconcile with government or trust publications — never hearsay." },
  { icon: BadgeCheck, title: "Published", body: "The correction lands in the atlas with a fresh verification stamp." },
];

export default async function ReportPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="report" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading
            eyebrow="Community trust"
            title="Report incorrect information"
            sub="Pilgrims know the ground truth. Flag anything that looks off and our verification pipeline reconciles it with official sources."
          />
        </Container>
      </section>

      <Container className="pb-20">
        <div className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-line bg-obsidian-2 p-5">
              <s.icon className="h-5 w-5 text-gold" />
              <p className="mt-3 font-display text-[15px] font-medium text-ivory">{s.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ivory-dim">{s.body}</p>
            </div>
          ))}
        </div>

        <ReportForm />

        <div className="mt-10 rounded-2xl border border-dashed border-line p-6">
          <p className="mb-3 flex items-center gap-2 font-display text-[16px] text-ivory">
            <Building2 className="h-5 w-5 text-gold" /> For temple trusts & authorities
          </p>
          <p className="max-w-2xl text-[13px] leading-relaxed text-ivory-dim">
            Devyatra welcomes official corrections from temple administrations. Reach out with official
            letterhead and we&apos;ll mark your temple VERIFIED_OFFICIAL. Every verified listing carries a source
            attribution you can audit.
          </p>
          <Link href="/verify" className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gold-bright hover:underline">
            <Grid2X2 className="h-3.5 w-3.5" /> See verification statuses across the atlas
          </Link>
        </div>

        <p className="mt-8 flex items-center gap-2 text-[12.5px] text-ivory-dim/70">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400/70" />
          Always confirm critical details on the official portal before you travel. Devyatra timelines reflect its best-effort verification, not official announcements.
        </p>
      </Container>
    </>
  );
}