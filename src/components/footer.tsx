"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, Landmark, CalendarDays, Sparkles, ExternalLink } from "lucide-react";
import { Container, Logo } from "@/components/ui";

const cols = [
  {
    h: "Explore",
    links: [
      { label: "Explore India", href: "/explore" },
      { label: "All temples", href: "/temples" },
      { label: "Festival calendar", href: "/festivals" },
      { label: "AI journey planner", href: "/plan" },
    ],
  },
  {
    h: "Journey",
    links: [
      { label: "My Journey", href: "/journey" },
      { label: "Sign in", href: "/login" },
      { label: "Report incorrect info", href: "/report" },
    ],
  },
  {
    h: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Sources & verification", href: "/verify" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  const [stats, setStats] = useState({
    temples: "2,205",
    states: "36",
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: { temples?: number; states?: number }) => {
        if (data.temples && data.states) {
          setStats({
            temples: data.temples.toLocaleString("en-IN"),
            states: String(data.states),
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="relative mt-24 border-t border-stone-800/80 bg-[#0C0907]/90 overflow-hidden">
      {/* Sacred Horizon Backlight & Silhouette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#C8A24B]/10 to-transparent" />
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-20 bg-radial from-[#C8A24B]/20 via-transparent to-transparent blur-2xl" />

      {/* trust strip */}
      <div className="relative border-b border-stone-800/60">
        <Container className="flex flex-col items-center gap-4 py-7 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5 text-ivory">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <span className="text-[13.5px] font-medium">Verified temple information, intelligently explored.</span>
          </div>
          <div className="flex items-center gap-6 text-[12.5px] text-ivory-dim">
            <span className="flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5 text-gold-dim" /> {stats.temples} temples</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold-dim" /> {stats.states} states &amp; UTs</span>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-gold-dim" /> Live schedules</span>
          </div>
        </Container>
      </div>

      <Container className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Logo size="sm" />
          <p className="mt-4 max-w-[260px] text-[13px] leading-relaxed text-ivory-dim">
            Discover. Experience. Remember. An AI-powered pilgrimage companion with verifiable,
            source-tagged information.
          </p>
          <div className="mt-5 flex items-center gap-2 text-[11.5px] text-ivory-dim/70">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Multilingual · Hindi, Telugu, Tamil &amp; more
          </div>
        </div>
        {cols.map((c) => (
          <nav key={c.h} aria-label={c.h}>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">{c.h}</p>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-ivory-dim transition-colors hover:text-ivory">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col items-center gap-2 py-6 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-[12px] text-ivory-dim/70">
            © {new Date().getFullYear()} Devyatra. A concept demo — timings & booking data carry
            live verification status, but always confirm with official sources before visiting.
          </p>
          <a
            href="/verify"
            className="flex items-center gap-1 text-[12px] text-gold-dim transition-colors hover:text-gold-bright"
          >
            How we verify data <ExternalLink className="h-3 w-3" />
          </a>
        </Container>
      </div>
    </footer>
  );
}