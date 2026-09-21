"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Bookmark, LogOut, Sparkles, User, MapPin } from "lucide-react";
import { Container } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";

interface LiteTemple {
  id: string;
  slug: string;
  name: string;
  stateCode: string;
  district: string;
  location: string;
  deity: string;
  href: string;
}

interface MeResp {
  user: { id: string; name: string; email: string; role: string } | null;
}

const SAVED_KEY = "tem_saved";

export default function JourneyPage() {
  const [temples, setTemples] = useState<LiteTemple[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [user, setUser] = useState<MeResp["user"]>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/temples-lite").then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([t, d]: [LiteTemple[], MeResp]) => {
      setTemples(t);
      const u = d.user;
      setUser(u);
      if (u) {
        fetch("/api/saved")
          .then((r) => r.json())
          .then((s: { saved?: string[] }) => {
            if (Array.isArray(s.saved)) {
              const stored = localStorage.getItem(SAVED_KEY);
              setSaved(s.saved);
              if (stored) {
                const merged = [...new Set([...s.saved, ...JSON.parse(stored)])];
                localStorage.setItem(SAVED_KEY, JSON.stringify(merged));
              }
            }
          })
          .catch(() => {});
        return;
      }
      const stored = localStorage.getItem(SAVED_KEY);
      if (stored) setSaved(JSON.parse(stored));
    }).catch(() => {});
  }, []);

  const savedTmpls = temples.filter((t) => saved.includes(t.slug));
  const others = temples.filter((t) => !saved.includes(t.slug)).slice(0, 6);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="journey" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Journey</p>
          <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">Your pilgrimage map</h1>
          <p className="mt-3 max-w-lg text-[13.5px] text-ivory-dim">
            Saved temples live on this device while you&apos;re signed out, and sync to your account when you sign in.
          </p>
        </Container>
      </section>

      <Container className="pb-24">
        {user && (
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gold/20 bg-surface-warm px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold-bright">
                <User className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-[16px] text-ivory">{user.name}</p>
                <p className="text-[12.5px] text-ivory-dim">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[12.5px] text-ivory-dim transition-colors hover:border-red-500/40 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}

        <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-medium text-ivory">
          <Bookmark className="h-5 w-5 text-gold" /> Saved temples
          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[12px] text-ivory-dim">{saved.length}</span>
        </h2>

        {savedTmpls.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
            <Heart className="h-8 w-8 text-gold-dim/50" />
            <p className="mt-3 font-display text-lg text-ivory">Nothing saved yet</p>
            <p className="mt-1 max-w-sm text-[13px] text-ivory-dim">
              Tap the save icon on any temple card and it will appear here as your personal pilgrimage.
            </p>
            <Link
              href="/temples"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-5 py-2.5 text-[13px] font-semibold text-obsidian"
            >
              <Sparkles className="h-4 w-4" /> Browse temples
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedTmpls.map((t) => (
              <Link
                key={t.slug}
                href={t.href}
                className="group rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:-translate-y-0.5 hover:border-gold/30"
              >
                <p className="font-display text-[16px] font-medium text-ivory group-hover:text-gold-bright">{t.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ivory-dim">
                  <MapPin className="h-3 w-3" /> {t.location}, {t.district}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-gold-dim">{t.deity}</p>
              </Link>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <>
            <h2 className="mb-4 mt-14 flex items-center gap-2 font-display text-2xl font-medium text-ivory">
              <Sparkles className="h-5 w-5 text-gold" /> Where to next
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((t) => (
                <Link
                  key={t.slug}
                  href={t.href}
                  className="rounded-2xl border border-line bg-obsidian-2/50 p-5 transition-colors hover:border-gold/25"
                >
                  <p className="font-medium text-ivory">{t.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ivory-dim">
                    <MapPin className="h-3 w-3" /> {t.location}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </Container>
    </>
  );
}