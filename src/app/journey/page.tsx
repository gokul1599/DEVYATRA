"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Heart,
  Bookmark,
  LogOut,
  Sparkles,
  User,
  MapPin,
  Calendar,
  Bell,
  Sliders,
  Compass,
  Trash2,
  Check,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { Container } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import type { SavedJourney } from "@/lib/journeys";
import type { TempleAlert } from "@/lib/intelligence/alerts";
import type { ScoredTemple } from "@/lib/discovery/personalized";
import type { UserPreferences } from "@/lib/auth";

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

interface PublicUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  preferences: UserPreferences;
  followedTemples: string[];
}

const SAVED_KEY = "tem_saved";

const DEITIES = [
  "Shiva",
  "Vishnu",
  "Devi / Shakti",
  "Ganesha",
  "Murugan / Kartikeya",
  "Krishna",
  "Rama",
  "Hanuman",
  "Surya",
  "Ayyappa",
];

const TRADITIONS = ["Shaiva", "Vaishnava", "Shakta", "Smarta"];

export default function JourneyPage() {
  const [temples, setTemples] = useState<LiteTemple[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [user, setUser] = useState<PublicUserData | null>(null);
  const [journeys, setJourneys] = useState<SavedJourney[]>([]);
  const [alerts, setAlerts] = useState<TempleAlert[]>([]);
  const [recommendations, setRecommendations] = useState<ScoredTemple[]>([]);
  const [activeTab, setActiveTab] = useState<"saved" | "places" | "journeys" | "alerts" | "recommendations" | "preferences">("saved");
  const [savedPlaces, setSavedPlaces] = useState<Array<{ id: string; name: string; category: string; location: string }>>([]);

  // Editable preferences
  const [prefs, setPrefs] = useState<UserPreferences>({
    preferredLanguage: "en",
    deities: [],
    traditions: [],
    travelStyle: "family",
    accessibilityNeeds: false,
    budgetTier: "mid",
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSaveStatus, setPrefSaveStatus] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetch("/api/temples-lite").then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ])
      .then(([t, d]: [LiteTemple[], { user: PublicUserData | null; alerts: TempleAlert[] }]) => {
        setTemples(t);
        const u = d.user;
        setUser(u);
        if (d.alerts) setAlerts(d.alerts);

        if (u) {
          setPrefs(u.preferences);
          // Fetch saved shrines from account
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

          // Fetch saved multi-day journeys
          fetch("/api/journeys")
            .then((r) => r.json())
            .then((j: { journeys?: SavedJourney[] }) => {
              if (Array.isArray(j.journeys)) setJourneys(j.journeys);
            })
            .catch(() => {});
        } else {
          const stored = localStorage.getItem(SAVED_KEY);
          if (stored) setSaved(JSON.parse(stored));
        }

        try {
          const raw = localStorage.getItem("tem_saved_places_rich");
          if (raw) {
            const list = JSON.parse(raw) as Array<{ id: string; name: string; category: string; location: string }>;
            setSavedPlaces(list);
          }
        } catch {}
      })
      .catch(() => {});
  }, []);

  // Fetch personalized recommendations when preferences or tab changes
  useEffect(() => {
    if (activeTab === "recommendations") {
      fetch("/api/discovery/personalized")
        .then((r) => r.json())
        .then((data: { recommendations?: ScoredTemple[] }) => {
          if (Array.isArray(data.recommendations)) {
            setRecommendations(data.recommendations);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const savedTmpls = temples.filter((t) => saved.includes(t.slug));

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const removeSavedTemple = async (slug: string) => {
    const next = saved.filter((s) => s !== slug);
    setSaved(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));

    if (user) {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, add: false }),
      });
    }
  };

  const deleteJourney = async (id: string) => {
    setJourneys((prev) => prev.filter((j) => j.id !== id));
    await fetch(`/api/journeys?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  };

  const toggleFollow = async (slug: string) => {
    if (!user) return;
    const resp = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggleFollow: slug }),
    });
    const data = await resp.json();
    if (data.user) {
      setUser(data.user);
      if (data.alerts) setAlerts(data.alerts);
    }
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    setPrefSaveStatus(null);
    try {
      const resp = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (resp.ok) {
        setPrefSaveStatus("Preferences saved!");
        setTimeout(() => setPrefSaveStatus(null), 3000);
      } else {
        setPrefSaveStatus("Failed to save. Please sign in.");
      }
    } catch {
      setPrefSaveStatus("Network error");
    } finally {
      setSavingPrefs(false);
    }
  };

  const toggleDeity = (d: string) => {
    startTransition(() => {
      setPrefs((p) => {
        const next = p.deities.includes(d) ? p.deities.filter((x) => x !== d) : [...p.deities, d];
        return { ...p, deities: next };
      });
    });
  };

  const toggleTradition = (tr: string) => {
    startTransition(() => {
      setPrefs((p) => {
        const next = p.traditions.includes(tr) ? p.traditions.filter((x) => x !== tr) : [...p.traditions, tr];
        return { ...p, traditions: next };
      });
    });
  };

  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="journey" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Pilgrim Sanctuary</p>
              <h1 className="font-display text-4xl font-medium text-ivory sm:text-5xl">My Sacred Journey</h1>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-ivory-dim">
                Your personal sanctuary for saved temples, multi-day sacred itineraries, Panchang-derived holy alerts, and customized pilgrimage preferences.
              </p>
            </div>

            {user ? (
              <div className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-obsidian-2/80 p-3.5 backdrop-blur-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-bright">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-sm font-medium text-ivory">{user.name}</p>
                  <p className="text-xs text-ivory-dim">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="ml-2 rounded-lg border border-white/[0.08] p-2 text-ivory-dim transition-colors hover:border-red-500/40 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-obsidian-2/80 p-4">
                <p className="text-xs text-ivory-dim">Sign in to sync your saved journeys across devices</p>
                <Link
                  href="/login"
                  className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-obsidian hover:bg-gold-bright"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-white/[0.08] pb-4">
            <button
              onClick={() => setActiveTab("saved")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeTab === "saved"
                  ? "bg-gold text-obsidian font-semibold"
                  : "bg-white/[0.04] text-ivory-dim hover:text-ivory hover:bg-white/[0.08]"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Saved Shrines</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${activeTab === "saved" ? "bg-obsidian/20 text-obsidian" : "bg-white/10 text-ivory-dim"}`}>
                {savedTmpls.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("places")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeTab === "places"
                  ? "bg-gold text-obsidian font-semibold"
                  : "bg-white/[0.04] text-ivory-dim hover:text-ivory hover:bg-white/[0.08]"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Saved Places</span>
              {savedPlaces.length > 0 && (
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${activeTab === "places" ? "bg-obsidian/20 text-obsidian" : "bg-white/10 text-ivory-dim"}`}>
                  {savedPlaces.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("journeys")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeTab === "journeys"
                  ? "bg-gold text-obsidian font-semibold"
                  : "bg-white/[0.04] text-ivory-dim hover:text-ivory hover:bg-white/[0.08]"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>My Journeys</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${activeTab === "journeys" ? "bg-obsidian/20 text-obsidian" : "bg-white/10 text-ivory-dim"}`}>
                {journeys.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("alerts")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeTab === "alerts"
                  ? "bg-gold text-obsidian font-semibold"
                  : "bg-white/[0.04] text-ivory-dim hover:text-ivory hover:bg-white/[0.08]"
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Holy Alerts</span>
              {alerts.length > 0 && (
                <span className="rounded-full bg-saffron px-1.5 py-0.2 text-[10px] font-bold text-obsidian">
                  {alerts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("recommendations")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeTab === "recommendations"
                  ? "bg-gold text-obsidian font-semibold"
                  : "bg-white/[0.04] text-ivory-dim hover:text-ivory hover:bg-white/[0.08]"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Personalized</span>
            </button>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                activeTab === "preferences"
                  ? "bg-gold text-obsidian font-semibold"
                  : "bg-white/[0.04] text-ivory-dim hover:text-ivory hover:bg-white/[0.08]"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Pilgrim Profile</span>
            </button>
          </div>
        </Container>
      </section>

      <Container className="pb-28">
        {/* ── TAB 1: SAVED TEMPLES ── */}
        {activeTab === "saved" && (
          <div>
            {savedTmpls.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
                <Heart className="h-8 w-8 text-gold-dim/50" />
                <p className="mt-3 font-display text-lg text-ivory">No saved temples yet</p>
                <p className="mt-1 max-w-sm text-xs text-ivory-dim">
                  Tap the bookmark icon on any temple page to save it to your pilgrimage list.
                </p>
                <Link
                  href="/temples"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-semibold text-obsidian hover:bg-gold-bright"
                >
                  <Sparkles className="h-4 w-4" /> Browse Temples
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedTmpls.map((t) => {
                  const isFollowed = user?.followedTemples?.includes(t.slug);
                  return (
                    <div
                      key={t.slug}
                      className="group relative flex flex-col justify-between rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:border-gold/30"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link href={t.href} className="font-display text-base font-medium text-ivory group-hover:text-gold-bright">
                            {t.name}
                          </Link>
                          <div className="flex items-center gap-1">
                            {user && (
                              <button
                                onClick={() => toggleFollow(t.slug)}
                                title={isFollowed ? "Following (receiving alerts)" : "Follow for Panchang festival alerts"}
                                className={`rounded-lg p-1.5 text-xs transition-colors ${
                                  isFollowed
                                    ? "bg-gold/20 text-gold-bright"
                                    : "text-ivory-dim hover:bg-white/[0.06] hover:text-ivory"
                                }`}
                              >
                                <Bell className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => removeSavedTemple(t.slug)}
                              title="Remove from saved"
                              className="rounded-lg p-1.5 text-xs text-ivory-dim hover:bg-red-500/10 hover:text-red-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="mt-1 flex items-center gap-1 text-xs text-ivory-dim">
                          <MapPin className="h-3 w-3 text-gold/60" /> {t.location}, {t.district}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-gold-dim">{t.deity}</span>
                        <Link
                          href={t.href}
                          className="font-medium text-gold-bright hover:underline"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 1b: SAVED PLACES ── */}
        {activeTab === "places" && (
          <div>
            {savedPlaces.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
                <MapPin className="h-8 w-8 text-gold-dim/50" />
                <p className="mt-3 font-display text-lg text-ivory">No saved places yet</p>
                <p className="mt-1 max-w-sm text-xs text-ivory-dim">
                  While exploring a temple, tap the bookmark icon next to any nearby attraction (heritage site, nature spot, etc.) to save it here.
                </p>
                <Link
                  href="/explore"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-semibold text-obsidian hover:bg-gold-bright"
                >
                  <Sparkles className="h-4 w-4" /> Explore Temples
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:border-gold/30"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display text-base font-medium text-ivory group-hover:text-gold-bright">
                          {place.name}
                        </p>
                        <button
                          onClick={() => {
                            const next = savedPlaces.filter((p) => p.id !== place.id);
                            setSavedPlaces(next);
                            try {
                              localStorage.setItem("tem_saved_places_rich", JSON.stringify(next));
                              const rawIds = localStorage.getItem("tem_saved_places");
                              const ids: string[] = rawIds ? JSON.parse(rawIds) : [];
                              localStorage.setItem("tem_saved_places", JSON.stringify(ids.filter((id) => id !== place.id)));
                            } catch {}
                          }}
                          title="Remove from saved places"
                          className="rounded-lg p-1.5 text-xs text-ivory-dim hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-xs text-ivory-dim">
                        <MapPin className="h-3 w-3 text-gold/60" /> {place.location}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-gold-dim">
                        {place.category.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: MY JOURNEYS ── */}
        {activeTab === "journeys" && (
          <div>
            {journeys.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
                <Calendar className="h-8 w-8 text-gold-dim/50" />
                <p className="mt-3 font-display text-lg text-ivory">No saved journeys yet</p>
                <p className="mt-1 max-w-sm text-xs text-ivory-dim">
                  Design a multi-day pilgrimage in Plan Studio 2.0 with terrain transit and midday breaks, then tap &quot;Save Journey&quot; to view it here.
                </p>
                <Link
                  href="/plan"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-semibold text-obsidian hover:bg-gold-bright"
                >
                  <Sparkles className="h-4 w-4" /> Open AI Plan Studio 2.0
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {journeys.map((j) => (
                  <div
                    key={j.id}
                    className="flex flex-col justify-between rounded-2xl border border-gold/20 bg-obsidian-2 p-6 transition-all hover:border-gold/40"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-medium text-ivory">{j.title}</p>
                          <p className="mt-1 text-xs text-ivory-dim">
                            Starting {new Date(j.startDate).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {j.totalDays} Days · Mode: {j.travelMode}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteJourney(j.id)}
                          title="Delete Journey"
                          className="rounded-lg p-2 text-ivory-dim hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {j.templeNames.map((n, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-ivory/80"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                      <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs text-gold-bright">
                        {j.budget.toUpperCase()} Tier
                      </span>
                      <Link
                        href={`/plan?circuit=${j.circuitId || ""}`}
                        className="text-xs font-medium text-gold hover:underline"
                      >
                        Re-open Itinerary in Plan Studio →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: HOLY ALERTS ── */}
        {activeTab === "alerts" && (
          <div>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-16 text-center">
                <Bell className="h-8 w-8 text-gold-dim/50" />
                <p className="mt-3 font-display text-lg text-ivory">No active alerts for followed temples</p>
                <p className="mt-1 max-w-sm text-xs text-ivory-dim">
                  Follow temples in your &quot;Saved Shrines&quot; tab to receive verified Panchang festival countdowns, crowd warnings, and seasonal closure advisories.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`rounded-2xl border p-5 ${
                      a.severity === "urgent"
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                        : "border-gold/30 bg-gold/5 text-ivory"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold-bright uppercase tracking-wider">
                          {a.type.replace(/_/g, " ")}
                        </span>
                        <p className="font-display text-sm font-semibold">{a.templeName}</p>
                      </div>
                      <span className="text-[11px] text-ivory-dim">{a.source}</span>
                    </div>

                    <p className="mt-2 text-sm font-medium">{a.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ivory-dim">{a.message}</p>

                    {a.actionUrl && (
                      <a
                        href={a.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-bright hover:underline"
                      >
                        Official Devasthanam Portal →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: PERSONALIZED RECOMMENDATIONS ── */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">Matched to your pilgrim profile</p>
              <p className="mt-1 text-xs text-ivory-dim">
                Active Preferences: {prefs.deities.length > 0 ? prefs.deities.join(", ") : "All Deities"} · {prefs.travelStyle} style · {prefs.accessibilityNeeds ? "Step-Free Required" : "Standard Mobility"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map(({ temple, matchScore, matchReasons }) => (
                <div
                  key={temple.slug}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-obsidian-2 p-5 transition-all hover:border-gold/30"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/temples/${temple.stateCode.toLowerCase()}/${temple.slug}`} className="font-display text-base font-medium text-ivory hover:text-gold-bright">
                        {temple.name}
                      </Link>
                      <span className="rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[10px] font-mono text-gold-bright">
                        {matchScore}% Match
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-ivory-dim">
                      {temple.location}, {temple.district}
                    </p>

                    <div className="mt-3 space-y-1">
                      {matchReasons.map((r, i) => (
                        <p key={i} className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                          <Check className="h-3 w-3" /> {r}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                    <span className="text-[11px] text-ivory-dim">{temple.mainDeity}</span>
                    <Link
                      href={`/temples/${temple.stateCode.toLowerCase()}/${temple.slug}`}
                      className="font-medium text-gold hover:underline"
                    >
                      Visit Shrine →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: PILGRIM PROFILE & PREFERENCES ── */}
        {activeTab === "preferences" && (
          <div className="max-w-2xl space-y-8 rounded-3xl border border-line bg-obsidian-2 p-8">
            <div>
              <p className="font-display text-xl font-medium text-ivory">Pilgrim Profile & Preferences</p>
              <p className="mt-1 text-xs text-ivory-dim">
                Customize your spiritual affinities, accessibility needs, and travel constraints to tailor AI recommendations and discovery.
              </p>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ivory">
                <Languages className="h-4 w-4 text-gold" /> Preferred Indic Language
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, preferredLanguage: l.code })}
                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs transition-colors ${
                      prefs.preferredLanguage === l.code
                        ? "border-gold/50 bg-gold/15 text-gold-bright"
                        : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.native}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Deity Affinities */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ivory">
                Primary Deity Affinities
              </label>
              <div className="flex flex-wrap gap-2">
                {DEITIES.map((d) => {
                  const sel = prefs.deities.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDeity(d)}
                      className={`rounded-xl border px-3 py-1.5 text-xs transition-colors ${
                        sel
                          ? "border-gold/50 bg-gold/15 text-gold-bright"
                          : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
                      }`}
                    >
                      {sel && "✓ "}
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spiritual Tradition */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ivory">
                Spiritual Tradition
              </label>
              <div className="flex flex-wrap gap-2">
                {TRADITIONS.map((tr) => {
                  const sel = prefs.traditions.includes(tr);
                  return (
                    <button
                      key={tr}
                      type="button"
                      onClick={() => toggleTradition(tr)}
                      className={`rounded-xl border px-3 py-1.5 text-xs transition-colors ${
                        sel
                          ? "border-gold/50 bg-gold/15 text-gold-bright"
                          : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
                      }`}
                    >
                      {sel && "✓ "}
                      {tr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Style & Accessibility */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ivory">
                  Travel Companion Style
                </label>
                <select
                  value={prefs.travelStyle}
                  onChange={(e) => setPrefs({ ...prefs, travelStyle: e.target.value as "solo" | "family" | "elderly" | "friends" })}
                  className="w-full rounded-xl border border-line bg-obsidian-3 px-3 py-2 text-xs text-ivory outline-none focus:border-gold"
                >
                  <option value="solo">Solo Sadhana / Pilgrim</option>
                  <option value="family">Family with Children</option>
                  <option value="elderly">Elderly / Senior Citizens</option>
                  <option value="friends">Group / Friends</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ivory">
                  Budget Preference
                </label>
                <select
                  value={prefs.budgetTier}
                  onChange={(e) => setPrefs({ ...prefs, budgetTier: e.target.value as "budget" | "mid" | "premium" })}
                  className="w-full rounded-xl border border-line bg-obsidian-3 px-3 py-2 text-xs text-ivory outline-none focus:border-gold"
                >
                  <option value="budget">Budget (Yatri Niwas & Public Transit)</option>
                  <option value="mid">Comfort / Mid-Range (Private Cab & Trust Guest House)</option>
                  <option value="premium">Premium / VIP (Heritage Stays & Special Passes)</option>
                </select>
              </div>
            </div>

            {/* Accessibility Toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-line bg-obsidian-3 p-4">
              <div>
                <p className="text-xs font-semibold text-ivory">Step-Free & Wheelchair Accessibility</p>
                <p className="text-[11px] text-ivory-dim">Prioritize shrines with ground-level access, ramps, or battery buggy passes.</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.accessibilityNeeds}
                onChange={(e) => setPrefs({ ...prefs, accessibilityNeeds: e.target.checked })}
                className="h-4 w-4 accent-gold"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              {prefSaveStatus ? (
                <span className="text-xs font-medium text-emerald-400">{prefSaveStatus}</span>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={savePreferences}
                disabled={savingPrefs}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs font-semibold text-obsidian transition-colors hover:bg-gold-bright disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{savingPrefs ? "Saving..." : "Save Preferences"}</span>
              </button>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}