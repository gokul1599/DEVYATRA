import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";

export const metadata: Metadata = { title: "Privacy policy" };

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "What we store",
    body: "Devyatra stores the minimum needed to work: your name and email if you create an account, a hashed password, and — only in memory — a session token. Saved temple lists live in your browser until you sign in.",
  },
  {
    title: "Explicit data files",
    body: "Account, session and report records are written to a .data directory inside the server. There is no third-party analytics, no ad tracking, and no marketing pixels.",
  },
  {
    title: "Location",
    body: "Geolocation is used only when you explicitly allow it, to suggest nearby temples. The coordinates never leave for anything other than that suggestion, and live map data is not stored.",
  },
  {
    title: "Your choices",
    body: "You can delete your saved list at any time from your browser. To delete an account, contact the team and the record will be removed along with its sessions and reports.",
  },
];

export default async function PrivacyPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="privacy" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading eyebrow="Legal" title="Privacy policy" />
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