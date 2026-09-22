import Link from "next/link";
import { DatabaseZap } from "lucide-react";
import { Container, Breadcrumbs } from "@/components/ui";
import { DirectoryTemple } from "@/lib/db/directory";

export function DirectoryOffline() {
  return (
    <Container>
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-line bg-obsidian-2/40 px-8 py-16 text-center">
        <DatabaseZap className="mx-auto h-10 w-10 text-gold/60" />
        <h2 className="mt-5 font-display text-2xl text-ivory">The directory is coming online</h2>
        <p className="mt-3 text-sm leading-relaxed text-ivory-dim">
          Devyatra&apos;s permanent temple directory is seeded from official administrative data. The database connection is
          being enabled — this page will show live coverage numbers the moment it is.
        </p>
      </div>
    </Container>
  );
}

export function DirectoryBreadcrumbs({ crumbs }: { crumbs: { label: string; href?: string }[] }) {
  return <Breadcrumbs crumbs={crumbs.map((c) => ({ label: c.label, href: c.href }))} className="mb-4" />;
}

export function TempleCards({ temples }: { temples: DirectoryTemple[] }) {
  if (!temples.length) {
    return (
      <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-ivory-dim">
        No temples recorded here yet. Verified records land in the directory as they are confirmed.
      </p>
    );
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {temples.map((t) => (
        <li key={t.id}>
          <Link
            href={`/temples/${t.stateSlug}/${t.slug}`}
            className="group block rounded-2xl border border-line bg-obsidian-2 p-5 transition-colors hover:border-gold/30"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg text-ivory transition-colors group-hover:text-gold-bright">{t.name}</h3>
            </div>
            <p className="mt-1 text-[12.5px] text-ivory-dim">{t.mainDeity || t.deities.join(", ") || "Deity unrecorded"}</p>
            <div className="mt-4 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-ivory-dim/80">
                {t.verificationStatus.replace(/_/g, " ")}
              </span>
              <span className="text-gold/70">{t.identifier}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}