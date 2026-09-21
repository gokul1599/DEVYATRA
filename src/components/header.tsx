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
  Landmark,
  CalendarDays,
  MapPin,
  LocateFixed,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/ui";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { useApp } from "@/components/providers";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/explore", key: "nav_explore", icon: Compass },
  { href: "/map", key: "nav_map", icon: MapPin },
  { href: "/temples", key: "nav_temples", icon: Landmark },
  { href: "/festivals", key: "nav_festivals", icon: CalendarDays },
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
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass border-b border-line/70 py-2.5" : "bg-transparent py-4"
      )}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-5 sm:px-8">
        <Logo />

        <nav className="ml-8 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                isActive(pathname, href)
                  ? "bg-white/[0.06] text-gold-bright"
                  : "text-ivory-dim hover:bg-white/[0.04] hover:text-ivory"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(key)}
            </Link>
          ))}
          <Link
            href="/plan"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
              isActive(pathname, "/plan")
                ? "bg-gold/15 text-gold-bright"
                : "text-ivory-dim hover:bg-white/[0.04] hover:text-gold-bright"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("nav_ai")}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-ivory-dim transition-colors hover:bg-white/[0.06] hover:text-ivory sm:flex"
          >
            <Search className="h-[17px] w-[17px]" />
          </Link>

          {/* theme toggle */}
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

          {/* language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className="flex h-9 items-center gap-1 rounded-full px-2.5 text-[13px] font-medium text-ivory-dim transition-colors hover:bg-white/[0.06] hover:text-ivory"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden uppercase sm:inline">{lang}</span>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", langOpen && "rotate-180")} />
            </button>
            {langOpen && (
              <div
                role="listbox"
                className="glass absolute right-0 top-11 z-50 grid w-56 grid-cols-2 gap-0.5 rounded-2xl border border-line p-2 shadow-2xl"
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
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors",
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
        </div>
      </div>
    </header>
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
      className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-gold/25 text-gold-bright transition-colors hover:bg-gold/10"
    >
      <User className="h-4 w-4" />
    </Link>
  );
}

export function MobileNav() {
  const { t } = useApp();
  const pathname = usePathname();
  const items = [
    { href: "/", key: "nav_home", icon: MapPin },
    { href: "/explore", key: "nav_explore", icon: Compass },
    { href: "/map", key: "nav_map", icon: LocateFixed },
    { href: "/plan", key: "nav_ai", icon: Sparkles },
    { href: "/temples", key: "nav_temples", icon: Landmark },
    { href: "/journey", key: "nav_saved", icon: User },
  ] as const;
  return (
    <nav
      aria-label="Mobile"
      className="glass fixed inset-x-3 bottom-3 z-50 flex items-center justify-around rounded-2xl border border-line py-2 lg:hidden"
    >
      {items.map(({ href, key, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
              active ? "text-gold-bright" : "text-ivory-dim"
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}