import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Building2, Landmark, ShieldAlert, ShieldCheck, SearchCheck, Users } from "lucide-react";
import { TEMPLES } from "@/lib/registry";
import { VERIFY_LABEL, VERIFY_COLOR } from "@/lib/format";
import { templeUrl } from "@/lib/registry";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Verification status" };

const STATUS_META = [
  {
    key: "VERIFIED_OFFICIAL",
    icon: ShieldCheck,
    label: "Verified · official",
    color: "text-emerald-400",
    desc: "Confirmed directly by the temple administration or governing body.",
  },
  {
    key: "GOVERNMENT_SOURCE",
    icon: Building2,
    label: "Government source",
    color: "text-sky-400",
    desc: "Reconciled against a government or statutory publication.",
  },
  {
    key: "TRUSTED_SOURCE",
    icon: SearchCheck,
    label: "Trusted source",
    color: "text-gold-bright",
    desc: "Cross-checked against reputable third-party documentation.",
  },
  {
    key: "COMMUNITY_REPORTED",
    icon: Users,
    label: "Community reported",
    color: "text-orange-400",
    desc: "Reported by pilgrims; awaiting official confirmation.",
  },
  {
    key: "UNVERIFIED",
    icon: ShieldAlert,
    label: "Unverified",
    color: "text-red-400",
    desc: "Pending verification — treat as provisional.",
  },
];

const STATUS_KEYS = ["VERIFIED_OFFICIAL", "GOVERNMENT_SOURCE", "TRUSTED_SOURCE", "COMMUNITY_REPORTED", "UNVERIFIED"] as const;

export default async function VerifyPage() {
  const counts = Object.fromEntries(
    STATUS_KEYS.map((s) => [s, TEMPLES.filter((t) => (t.booking?.verification?.status ?? "UNVERIFIED") === s).length])
  );

  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="verify" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading
            eyebrow="Trust engine"
            title="Every listing, every source"
            sub="Devyatra marks exactly how each data point was verified. Nothing is presented as fact without its provenance."
          />
        </Container>
      </section>

      <Container className="pb-20">
        <div className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STATUS_META.map((s) => (
            <div key={s.key} className="rounded-2xl border border-line bg-obsidian-2 p-4">
              <s.icon className={cn("h-5 w-5", s.color)} />
              <p className="mt-2.5 font-display text-[15px] font-medium text-ivory">{s.label}</p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-ivory-dim">{s.desc}</p>
              <p className="mt-3 text-[12px] text-ivory-dim">{counts[s.key] ?? 0} listings</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-gold" />
          <h2 className="font-display text-xl font-medium text-ivory">Listing provenance</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
            {TEMPLES.map((t) => {
              const status = t.booking?.verification?.status ?? "UNVERIFIED";
              const color = VERIFY_COLOR[status] ?? "text-ivory-dim";
              return (
                <Link key={t.slug} href={templeUrl(t)} className="group flex items-center justify-between gap-3 bg-obsidian-2 px-4 py-3.5 transition-colors hover:bg-obsidian-3">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-4 w-4 shrink-0 text-gold-dim" />
                    <div>
                      <p className="text-[13.5px] font-medium text-ivory group-hover:text-gold-bright">{t.name}</p>
                      <p className="text-[11px] text-ivory-dim">{t.location}</p>
                    </div>
                  </div>
                  <span className={cn("shrink-0 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10.5px] font-medium", color)}>
                    {VERIFY_LABEL[status]}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-line p-5 text-center text-[12.5px] text-ivory-dim">
          <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-gold" />
          See something outdated?{" "}
          <Link href="/report" className="font-medium text-gold-bright hover:underline">
            Report a correction
          </Link>{" "}
          and the pipeline will re-verify it.
        </div>
      </Container>
    </>
  );
}