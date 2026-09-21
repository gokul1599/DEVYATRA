import Link from "next/link";
import { Compass, Landmark, Sparkles } from "lucide-react";
import { Container } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden pt-28">
      <div className="absolute inset-0 -z-10 opacity-50">
        <DevyatraArt seed="not-found" variant="banner" className="h-full w-full" />
      </div>
      <Container className="text-center">
        <p className="font-display text-[7rem] leading-none text-gold/25 sm:text-[10rem]">404</p>
        <h1 className="mt-2 font-display text-3xl font-medium text-ivory sm:text-5xl">
          This path leads nowhere
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] text-ivory-dim">
          The page you sought isn&apos;t on the atlas — maybe it moved, or never existed.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-6 py-3 text-sm font-semibold text-obsidian transition-all hover:brightness-110"
          >
            <Sparkles className="h-4 w-4" /> Back home
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ivory-dim transition-colors hover:border-gold/40 hover:text-ivory"
          >
            <Compass className="h-4 w-4" /> Explore India
          </Link>
          <Link
            href="/temples"
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ivory-dim transition-colors hover:border-gold/40 hover:text-ivory"
          >
            <Landmark className="h-4 w-4" /> All temples
          </Link>
        </div>
      </Container>
    </section>
  );
}