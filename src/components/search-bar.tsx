"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Landmark, Sparkles, CalendarDays, X, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { useApp } from "@/components/providers";

interface Suggestion {
  slug: string;
  name: string;
  nameLocal: string | null;
  stateSlug: string;
  location: string;
  district: string;
  href: string;
}
interface Loc {
  label: string;
  sub: string;
  href: string;
}
interface Deity {
  label: string;
  count: number;
  href: string;
}
interface Fest {
  label: string;
  temple: { name: string };
  href: string;
}
interface Res {
  temples: Suggestion[];
  locations: Loc[];
  deities: Deity[];
  festivals: Fest[];
}

const empty: Res = { temples: [], locations: [], deities: [], festivals: [] };

export function SearchBar({
  size = "lg",
  autoFocus = false,
  className,
}: {
  size?: "lg" | "md";
  autoFocus?: boolean;
  className?: string;
}) {
  const { t } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Res>(empty);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idx, setIdx] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=6`);
        const data = (await r.json()) as Res;
        setRes(data);
      } catch {
        setRes(empty);
      } finally {
        setLoading(false);
      }
    }, 170);
    return () => clearTimeout(id);
  }, [q]);

  const groups: {
    key: string;
    label: string;
    items: { href: string; icon: typeof Landmark; title: string; sub: string }[];
  }[] = [];

  if (res.temples.length)
    groups.push({
      key: "temples",
      label: "Temples",
      items: res.temples.map((s) => ({
        href: s.href,
        icon: Landmark,
        title: s.name,
        sub: `${s.location}, ${s.district}${s.nameLocal ? ` · ${s.nameLocal}` : ""}`,
      })),
    });
  if (res.locations.length)
    groups.push({
      key: "locations",
      label: "Places",
      items: res.locations.map((l) => ({ href: l.href, icon: MapPin, title: l.label, sub: l.sub })),
    });
  if (res.deities.length)
    groups.push({
      key: "deities",
      label: "Deities",
      items: res.deities.map((d) => ({
        href: d.href,
        icon: Sparkles,
        title: d.label,
        sub: `${d.count} temple${d.count > 1 ? "s" : ""}`,
      })),
    });
  if (res.festivals.length)
    groups.push({
      key: "festivals",
      label: "Festivals",
      items: res.festivals.map((f) => ({
        href: f.href,
        icon: CalendarDays,
        title: f.label,
        sub: f.temple.name,
      })),
    });

  const flat = groups.flatMap((g) => g.items);
  const goto = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (idx >= 0 && flat[idx]) goto(flat[idx].href);
      else router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={box} className={cn("relative z-40", className)}>
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-2xl border bg-obsidian-3/95 backdrop-blur transition-colors focus-within:border-gold/50",
          size === "lg" ? "border-line px-4 py-3.5" : "border-line/80 px-3.5 py-2.5",
          "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
        )}
      >
        <Search className={cn("text-gold-dim", size === "lg" ? "h-5 w-5" : "h-4 w-4")} />
        <input
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            if (e.target.value.trim().length >= 2) setOpen(true);
          }}
          onFocus={() => q.trim().length >= 2 && setOpen(true)}
          onKeyDown={onKey}
          placeholder={t("search_placeholder")}
          aria-label="Search"
          className={cn(
            "w-full bg-transparent text-ivory placeholder:text-ivory-dim/45 focus:outline-none",
            size === "lg" ? "text-[15px]" : "text-sm"
          )}
        />
        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />}
        {q && (
          <button
            onClick={() => {
              setQ("");
              setOpen(false);
            }}
            aria-label="Clear search"
            className="text-ivory-dim hover:text-ivory"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && q.trim().length >= 2 && (loading || flat.length > 0) && (
        <div className="glass absolute inset-x-0 top-full mt-2 max-h-[70vh] overflow-auto rounded-2xl border border-line p-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
          {loading && flat.length === 0 && (
            <div className="space-y-2 p-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-10 rounded-xl" />
              ))}
            </div>
          )}
          {groups.map((g) => (
            <div key={g.key} className="mb-1 last:mb-0">
              <p className="px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ivory-dim/60">
                {g.label}
              </p>
              {g.items.map((it, gi) => {
                const fidx = flat.indexOf(it);
                const Icon = it.icon;
                return (
                  <button
                    key={`${g.key}-${it.title}-${gi}`}
                    onMouseEnter={() => setIdx(fidx)}
                    onClick={() => goto(it.href)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      idx === fidx ? "bg-gold/12 text-ivory" : "text-ivory-dim hover:bg-white/[0.05]"
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-dim" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium text-ivory">{it.title}</span>
                      <span className="block truncate text-[11.5px] text-ivory-dim/70">{it.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
          {!loading && flat.length > 0 && (
            <button
              onClick={() => router.push(`/search?q=${encodeURIComponent(q.trim())}`)}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border-t border-line px-3 py-2.5 text-[12.5px] text-gold-bright transition-colors hover:bg-white/[0.04]"
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
              Show all results for “{q.trim()}”
            </button>
          )}
          {!loading && flat.length === 0 && (
            <p className="px-3 py-6 text-center text-[13px] text-ivory-dim">
              No matches for “{q.trim()}”. Try a deity, city or festival.
            </p>
          )}
        </div>
      )}
    </div>
  );
}