"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, Sparkles, Users, Wallet } from "lucide-react";
import type { PlanResult } from "@/lib/ai/engine";
import { cn } from "@/lib/cn";

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

const INTERESTS = ["Darshan", "History", "Photography", "Devotional music", "Food & prasad", "Rest & comfort"];

export default function PlanStudio() {
  const sp = useSearchParams();
  const [temples, setTemples] = useState<LiteTemple[]>([]);
  const [templeId, setTempleId] = useState(sp.get("temple") ?? "");
  const [people, setPeople] = useState(2);
  const [budget, setBudget] = useState<"budget" | "moderate" | "premium">("moderate");
  const [pace, setPace] = useState<"leisurely" | "standard" | "fast">("standard");
  const [type, setType] = useState<"morning" | "full" | "evening">("full");
  const [interests, setInterests] = useState<string[]>(["Darshan", "History"]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/temples-lite")
      .then((r) => r.json())
      .then((d: LiteTemple[]) => {
        setTemples(d);
        if (!templeId && d.length) setTempleId(sp.get("temple") ?? d[0].id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const generate = async () => {
    if (!templeId) {
      setError("Pick a temple first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templeId, people, budget, pace, type, interests, lang: "en" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Plan failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Plan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {/* Controls */}
      <div className="rounded-3xl border border-line bg-obsidian-2 p-6">
        <p className="mb-4 font-display text-lg text-ivory">Design your day</p>

        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Temple</label>
        <select
          value={templeId}
          onChange={(e) => setTempleId(e.target.value)}
          className="mb-5 w-full rounded-xl border border-line bg-obsidian-3 px-4 py-3 text-[13.5px] text-ivory outline-none focus:border-gold/50"
        >
          {temples.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {t.location}
            </option>
          ))}
        </select>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {(["morning", "full", "evening"] as const).map((td) => (
            <SegBtn key={td} active={type === td} onClick={() => setType(td)} label={td[0].toUpperCase() + td.slice(1)} />
          ))}
        </div>

        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
          <Users className="mr-1 inline h-3.5 w-3.5" /> People: {people}
        </label>
        <input
          type="range" min={1} max={10} value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
          className="mb-5 w-full accent-saffron"
        />

        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
          <Wallet className="mr-1 inline h-3.5 w-3.5" /> Budget
        </label>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {(["budget", "moderate", "premium"] as const).map((b) => (
            <SegBtn key={b} active={budget === b} onClick={() => setBudget(b)} label={b === "budget" ? "Budget" : b === "moderate" ? "Mid" : "Premium"} />
          ))}
        </div>

        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Pace
        </label>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {(["leisurely", "standard", "fast"] as const).map((p) => (
            <SegBtn key={p} active={pace === p} onClick={() => setPace(p)} label={p[0].toUpperCase() + p.slice(1)} />
          ))}
        </div>

        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Interests</label>
        <div className="mb-6 flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[12px] transition-colors",
                interests.includes(i)
                  ? "border-gold/50 bg-gold/12 text-gold-bright"
                  : "border-line text-ivory-dim hover:border-gold/30"
              )}
            >
              {i}
            </button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-5 py-3.5 text-sm font-semibold text-obsidian transition-all hover:brightness-110 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" /> {loading ? "Crafting your plan…" : "Generate itinerary"}
        </button>
        {error && <p className="mt-3 text-center text-[12.5px] text-red-400">{error}</p>}
      </div>

      {/* Result */}
      <div className="min-h-[360px] rounded-3xl border border-line bg-obsidian-2 p-6">
        {!result && !loading ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
            <Sparkles className="h-8 w-8 text-gold-dim/60" />
            <p className="mt-3 max-w-xs text-[13px] text-ivory-dim">
              Your contextual itinerary — timings, darshan plans, food stops and transport — appears here the moment you generate it.
            </p>
          </div>
        ) : loading ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
            <p className="text-[13px] text-ivory-dim">Reconciling temple context…</p>
          </div>
        ) : result ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/8 px-3 py-1.5 text-[12px] text-gold-bright">
                <Clock className="h-3.5 w-3.5" /> {result.duration}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/8 px-3 py-1.5 text-[12px] text-gold-bright">
                <Wallet className="h-3.5 w-3.5" /> {result.estimatedCost}
              </span>
            </div>

            <p className="text-[13.5px] leading-relaxed text-ivory-dim">{result.summary}</p>

            <ol className="space-y-3">
              {result.items.map((it, i) => (
                <li key={i} className="flex gap-3 rounded-2xl border border-white/[0.06] bg-obsidian-3 p-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/12 font-display text-[13px] font-semibold text-gold-bright">
                      {i + 1}
                    </span>
                    {i < result.items.length - 1 && <span className="mt-1 h-full w-px bg-line" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[14px] font-medium text-ivory">{it.time}</span>
                      <span className="text-[11px] uppercase tracking-wider text-gold">· {it.place}</span>
                      {it.distanceKm > 0 && <span className="text-[11px] text-ivory-dim">{it.distanceKm} km</span>}
                      {it.durationMinutes > 0 && <span className="text-[11px] text-ivory-dim">{it.durationMinutes} min</span>}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ivory-dim">{it.reason}</p>
                    {it.source && (
                      <p className="mt-1 text-[10.5px] uppercase tracking-wider text-ivory-dim/50">source: {it.source}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {result.warnings.length > 0 && (
              <div className="space-y-2">
                {result.warnings.map((w, i) => (
                  <p
                    key={i}
                    className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-[12.5px] text-amber-300/90"
                  >
                    {w}
                  </p>
                ))}
              </div>
            )}

            <p className="text-[11.5px] leading-relaxed text-ivory-dim/60">
              Generated from verified timing data and curated nearby places. Always confirm current schedules with the
              official temple source.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SegBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border px-2 py-2.5 text-[12px] font-medium transition-all",
        active ? "border-gold/50 bg-gold/12 text-gold-bright" : "border-line bg-obsidian-3 text-ivory-dim hover:border-gold/30"
      )}
    >
      {label}
    </button>
  );
}