"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Bot, User, AlertTriangle, CheckCircle2, Clock, Wallet, CalendarDays } from "lucide-react";
import type { PlanResult } from "@/lib/ai/engine";
import { cn } from "@/lib/cn";

const CHIP_SUGGESTIONS = [
  "What are today's darshan timings?",
  "What should I carry on the yatra?",
  "Tell me the history of this temple",
];

interface AskBody {
  templeId: string;
  question: string;
  lang?: string;
}

export function AiPanel({
  templeId,
  templeName,
  lang,
}: {
  templeId: string;
  templeName: string;
  lang: string;
}) {
  const [tab, setTab] = useState<"ask" | "plan">("ask");
  return (
    <div className="overflow-hidden rounded-3xl border border-gold/20 bg-surface-warm">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold-bright">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[14px] font-medium text-ivory">Devyatra Companion</p>
          <p className="text-[11.5px] text-ivory-dim">Answered only from verified, indexed context</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-white/[0.06] px-5 pt-3">
        {(["ask", "plan"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded-t-lg px-4 py-2 text-[13px] font-medium transition-colors",
              tab === k ? "border-b-2 border-gold text-gold-bright" : "text-ivory-dim hover:text-ivory"
            )}
          >
            {k === "ask" ? "Ask about this temple" : "Plan My Visit"}
          </button>
        ))}
      </div>

      {tab === "ask" ? <AskStudio key={templeId} templeId={templeId} templeName={templeName} lang={lang} /> : <PlanStudio templeId={templeId} lang={lang} />}
    </div>
  );
}

/* ---------------- Ask ---------------- */

function AskStudio({ templeId, templeName, lang }: { templeId: string; templeName: string; lang: string }) {
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: `Namaste! Ask me anything about ${templeName} — timings, history, festivals, how to reach, what to carry. If I don't have verified information, I'll say so honestly.`,
    },
  ]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setQ("");
    setBusy(true);
    try {
      const r = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templeId, question: text, lang } satisfies AskBody),
      });
      const data = (await r.json()) as { answer: string };
      setMsgs((m) => [...m, { role: "ai", text: data.answer }]);
    } catch {
      setMsgs((m) => [...m, { role: "ai", text: "I hit a snag. Please try again." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-[420px] flex-col px-5 py-4">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                m.role === "ai" ? "bg-gold/15 text-gold-bright" : "bg-white/[0.06] text-ivory-dim"
              )}
            >
              {m.role === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed",
                m.role === "ai" ? "bg-obsidian-3 text-ivory" : "bg-gold/15 text-ivory"
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-[12.5px] text-ivory-dim">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
            Thinking…
          </div>
        )}
        <div ref={end} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {CHIP_SUGGESTIONS.map((c) => (
          <button
            key={c}
            onClick={() => ask(c)}
            className="rounded-full border border-white/10 px-3 py-1 text-[11.5px] text-ivory-dim transition-colors hover:border-gold/40 hover:text-gold-bright"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-line bg-obsidian-2 px-4 py-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(q)}
          placeholder="Ask about timings, history, festivals…"
          className="w-full bg-transparent text-[13.5px] text-ivory placeholder:text-ivory-dim/45 focus:outline-none"
        />
        <button onClick={() => ask(q)} disabled={busy || !q.trim()} aria-label="Ask" className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-saffron to-gold text-obsidian transition-opacity disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Plan ---------------- */

const INTERESTS = ["Darshan", "History", "Photography", "Devotional music", "Food & prasad", "Rest & comfort"];

const PLAN_TYPES = [
  { id: "morning", label: "Morning visit", desc: "Dawn darshan, prasad breakfast, midday exit" },
  { id: "full", label: "Full day immersion", desc: "Everything: darshan, history, nearby sights" },
  { id: "evening", label: "Evening + aarti", desc: "Arrive after 2pm, stay for the evening aarti" },
];

function PlanStudio({ templeId, lang }: { templeId: string; lang: string }) {
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [people, setPeople] = useState(1);
  const [budget, setBudget] = useState("moderate");
  const [pace, setPace] = useState("standard");
  const [type, setType] = useState("full");
  const [interests, setInterests] = useState<string[]>(["Darshan"]);
  const now = new Date();

  const toggleInterest = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  const generate = async () => {
    setBusy(true);
    setPlan(null);
    const date = now.toISOString().slice(0, 10);
    try {
      const r = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templeId, date, people, budget, pace, interests, type, lang }),
      });
      const data = (await r.json()) as PlanResult;
      setPlan(data);
    } catch {
      /* handled by empty state */
    } finally {
      setBusy(false);
    }
  };

  const fld = "rounded-xl border border-line bg-obsidian-2 px-3 py-2 text-[13px] text-ivory focus:outline-none focus:border-gold/50";

  return (
    <div className="px-5 py-4">
      {!plan && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wider text-ivory-dim">Visit plan</p>
              <div className="space-y-1.5">
                {PLAN_TYPES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setType(p.id)}
                    className={cn(
                      "w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                      type === p.id ? "border-gold/50 bg-gold/10" : "border-white/[0.07] bg-obsidian-2 hover:border-gold/25"
                    )}
                  >
                    <p className="text-[13px] font-medium text-ivory">{p.label}</p>
                    <p className="text-[11px] text-ivory-dim">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wider text-ivory-dim">People & pace</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 6].map((n) => (
                    <button key={n} onClick={() => setPeople(n)} className={cn("h-9 w-9 rounded-full border text-[13px] transition-colors", people === n ? "border-gold/60 bg-gold/15 text-gold-bright" : "border-white/10 text-ivory-dim hover:border-gold/40")}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wider text-ivory-dim">Budget</p>
                <select value={budget} onChange={(e) => setBudget(e.target.value)} className={cn(fld, "w-full")}>
                  <option value="budget">Budget</option>
                  <option value="moderate">Moderate</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wider text-ivory-dim">Pace</p>
                <select value={pace} onChange={(e) => setPace(e.target.value)} className={cn(fld, "w-full")}>
                  <option value="leisurely">Leisurely</option>
                  <option value="standard">Standard</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wider text-ivory-dim">Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS.map((i) => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[11.5px] transition-colors",
                      interests.includes(i) ? "border-gold/50 bg-gold/12 text-gold-bright" : "border-white/10 text-ivory-dim hover:border-gold/30"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={generate}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-7 py-3 text-sm font-semibold text-obsidian shadow-[0_14px_34px_-12px_rgba(217,130,43,0.6)] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-obsidian/30 border-t-obsidian" /> Crafting your day…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate my plan
                </>
              )}
            </button>
            <span className="text-[12px] text-ivory-dim">Scoped to {new Date().toDateString()}</span>
          </div>
        </>
      )}

      {busy && !plan && (
        <div className="space-y-3 py-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      )}

      {plan && (
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <MetaChip icon={Clock} text={plan.duration} />
              <MetaChip icon={Wallet} text={plan.estimatedCost.replace(/–₹.*/, "–")} title={plan.estimatedCost} />
              <MetaChip icon={CalendarDays} text={new Date().toDateString()} />
            </div>
            <button onClick={generate} className="rounded-full border border-white/10 px-4 py-1.5 text-[12px] text-ivory-dim hover:border-gold/40 hover:text-gold-bright">
              Regenerate
            </button>
          </div>

          <p className="mt-4 text-[13.5px] leading-relaxed text-ivory-dim">{plan.summary}</p>

          <ol className="mt-4 space-y-2.5">
            {plan.items.map((it, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-white/[0.06] bg-obsidian-3 p-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 font-display text-[13px] font-semibold text-gold-bright">
                    {i + 1}
                  </span>
                  {i < plan.items.length - 1 && <span className="mt-1 h-full w-px bg-line" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[14px] font-medium text-ivory">{it.time}</span>
                    <span className="text-[11px] uppercase tracking-wider text-gold">· {it.place}</span>
                    {it.distanceKm > 0 && <span className="text-[11px] text-ivory-dim">{it.distanceKm} km</span>}
                    {it.durationMinutes > 0 && <span className="text-[11px] text-ivory-dim">{it.durationMinutes} min</span>}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ivory-dim">{it.reason}</p>
                  {it.source && <p className="mt-1 text-[10.5px] uppercase tracking-wider text-ivory-dim/50">source: {it.source}</p>}
                </div>
              </li>
            ))}
          </ol>

          {plan.warnings.length > 0 && (
            <div className="mt-4 space-y-2">
              {plan.warnings.map((w, i) => (
                <p key={i} className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-[12.5px] text-amber-300/90">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {w}
                </p>
              ))}
            </div>
          )}

          <p className="mt-4 flex items-start gap-2 text-[11.5px] text-ivory-dim/60">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
            Generated from verified timing data and curated nearby places. Always confirm current schedules with the official temple source.
          </p>
        </div>
      )}
    </div>
  );
}

function MetaChip({ icon: Icon, text, title }: { icon: typeof Clock; text: string; title?: string }) {
  return (
    <span title={title} className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/8 px-3 py-1.5 text-[12px] text-gold-bright">
      <Icon className="h-3.5 w-3.5" /> {text}
    </span>
  );
}