"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Sun,
  Moon,
  Languages,
  Search,
  User,
  Compass,
  MapPin,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { Logo } from "@/components/ui";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/cn";
import { motion } from "motion/react";

const NAV = [
  { href: "/explore", key: "nav_explore", label: "Explore" },
  { href: "/map", key: "nav_map", label: "Map" },
  { href: "/temples", key: "nav_temples", label: "Temples" },
  { href: "/festivals", key: "nav_festivals", label: "Festivals" },
  { href: "/journey", key: "nav_saved", label: "Journey" },
] as const;

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

const emptySubscribe = () => () => {};
const useHydrated = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

export function Header() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const mounted = useHydrated();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-stone-950/85 backdrop-blur-xl border-b border-stone-800/60 py-3 shadow-2xl shadow-black/40"
          : "bg-transparent py-5"
      )}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-10">
          <Logo />

          {/* Desktop Editorial Navigation Rail */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary Navigation">
            {NAV.map(({ href, key, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-4 py-2 text-[13.5px] tracking-wide transition-colors duration-200",
                    active
                      ? "text-gold-bright font-medium"
                      : "text-ivory-dim hover:text-ivory font-normal"
                  )}
                >
                  {t(key) || label}
                  {active && (
                    <span className="absolute inset-x-4 -bottom-1 h-[2px] bg-gradient-to-r from-gold/40 via-gold-bright to-gold/40 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions & Editorial Plan CTA */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ivory-dim transition-colors hover:bg-white/[0.06] hover:text-ivory"
          >
            <Search className="h-[17px] w-[17px]" />
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ivory-dim transition-colors hover:bg-white/[0.06] hover:text-ivory"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-[17px] w-[17px]" />
            ) : (
              <Moon className="h-[17px] w-[17px]" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className="flex h-9 items-center gap-1 rounded-full px-2.5 text-[12.5px] font-medium text-ivory-dim transition-colors hover:bg-white/[0.06] hover:text-ivory"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden uppercase sm:inline">{lang}</span>
              <ChevronDown className={cn("h-3 w-3 transition-transform", langOpen && "rotate-180")} />
            </button>
            {langOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-11 z-50 grid w-56 grid-cols-2 gap-0.5 rounded-2xl border border-stone-800 bg-stone-950/95 backdrop-blur-2xl p-2 shadow-2xl"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    role="option"
                    aria-selected={l.code === lang}
                    onClick={() => {
                      setLang(l.code);
                      setLangOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors",
                      l.code === lang
                        ? "bg-gold/15 font-semibold text-gold-bright"
                        : "text-ivory-dim hover:bg-white/[0.05] hover:text-ivory"
                    )}
                  >
                    <span className="text-sm">{l.flag}</span>
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <AccountChip />

          {/* Prominent Editorial CTA: Plan a Visit */}
          <Link
            href="/plan"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-[12.5px] font-medium text-gold-bright transition-all duration-300 hover:border-gold hover:bg-gold/20 hover:text-ivory"
          >
            <span>Plan a Visit</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function AccountChip() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => {});
  }, [pathname]);

  return (
    <Link
      href={user ? "/journey" : "/login"}
      aria-label={user ? "My Journey" : "Sign in"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-700/60 text-ivory-dim transition-colors hover:border-gold/50 hover:text-gold-bright"
    >
      <User className="h-4 w-4" />
    </Link>
  );
}

export function MobileNav() {
  const { t } = useApp();
  const pathname = usePathname();

  // Focused 4-item mobile navigation: Explore · Map · Plan · Journey
  const items = [
    { href: "/explore", key: "nav_explore", label: "Explore", icon: Compass },
    { href: "/map", key: "nav_map", label: "Map", icon: MapPin },
    { href: "/plan", key: "nav_ai", label: "Plan", icon: Sparkles },
    { href: "/journey", key: "nav_saved", label: "Journey", icon: User },
  ] as const;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-around rounded-2xl border border-stone-800/80 bg-stone-950/90 backdrop-blur-2xl py-2.5 shadow-2xl shadow-black/70 md:hidden"
    >
      {items.map(({ href, key, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl px-4 py-1 text-[11px] font-medium transition-all duration-300",
              active
                ? "text-gold-bright font-semibold"
                : "text-ivory-dim/70 hover:text-ivory font-normal"
            )}
          >
            <Icon className={cn("h-4 w-4 transition-transform duration-300", active && "scale-110 text-gold-bright")} />
            <span>{t(key) || label}</span>
            {active && (
              <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-gold-bright/80" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}