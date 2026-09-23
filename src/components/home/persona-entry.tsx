"use client";

import Link from "next/link";
import {
  Compass,
  Landmark,
  Users,
  Car,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";

const PERSONAS = [
  {
    title: "Sacred Pilgrimage",
    subtitle: "Devotional darshans & sacred circuits",
    desc: "Panchang festival alignment, darshan slots, parikrama pacing, and traditional temple rituals.",
    icon: Compass,
    href: "/plan",
    badge: "Tirth Yatra",
    gradient: "from-amber-500/20 to-gold/10",
  },
  {
    title: "Heritage & Architecture",
    subtitle: "Chola, Hoysala, Nagara & Dravidian wonders",
    desc: "Centuries of documented history, monolithic stone iconography, epigraphy, and protected monuments.",
    icon: Landmark,
    href: "/explore",
    badge: "Heritage",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  {
    title: "Family & Senior Yatra",
    subtitle: "Gentle pacing & accessibility buffers",
    desc: "High threshold step awareness, midday sun buffers, footwear guidance, and restful darshan schedules.",
    icon: Users,
    href: "/plan",
    badge: "Family & Seniors",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    title: "Road-Trip & Corridors",
    subtitle: "Explore 12–75 km around every shrine",
    desc: "Discover heritage forts, sacred rivers, ghats, and nature spots along your pilgrimage route.",
    icon: Car,
    href: "/map",
    badge: "Corridor Discovery",
    gradient: "from-purple-500/20 to-indigo-500/10",
  },
  {
    title: "Mindful & Solo Seeker",
    subtitle: "Quiet sanctuaries & deep reflection",
    desc: "Early morning aarti timings, peaceful hill shrines, and serene riverfront contemplation.",
    icon: Sparkles,
    href: "/temples",
    badge: "Mindful",
    gradient: "from-rose-500/20 to-orange-500/10",
  },
];

export function PersonaEntryCards() {
  return (
    <section className="relative border-b border-line/60 bg-obsidian-2/50 py-16 md:py-20">
      <Container wide>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Explore Your Way"
            title="How are you exploring India?"
            sub="Devyatra adapts to your travel mode — whether you seek intense spiritual darshan, ancient architecture, or family-paced comfort."
          />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.title}
                href={p.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-obsidian-2 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-obsidian-3 hover:shadow-xl"
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${p.gradient} blur-2xl opacity-40 transition-opacity duration-500 group-hover:opacity-100`}
                />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-gold-bright transition-colors group-hover:border-gold/40 group-hover:bg-gold/10">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-gold/30 bg-gold/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-bright">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-medium text-ivory transition-colors group-hover:text-gold-bright">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-[11.5px] font-medium text-gold-dim">
                    {p.subtitle}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-ivory-dim">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1 text-[12px] font-medium text-gold-bright transition-transform duration-300 group-hover:translate-x-1">
                  <span>Start exploring</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
