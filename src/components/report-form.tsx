"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

interface LiteTemple {
  id: string;
  slug: string;
  name: string;
  location: string;
}

const TOPICS = ["Timings", "Darshan fee", "Facilities", "Booking link", "Festival dates", "Location", "Other"];

export function ReportForm() {
  const [temples, setTemples] = useState<LiteTemple[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [templeId, setTempleId] = useState("");
  const [topic, setTopic] = useState("");
  const [detail, setDetail] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const inner = async () => {
    if (!loaded && temples.length === 0) {
      try {
        const r = await fetch("/api/temples-lite");
        const d: LiteTemple[] = await r.json();
        setTemples(d);
        if (d.length) setTempleId(d[0].id);
      } catch {
        /* keep empty */
      }
      setLoaded(true);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templeId, topic, detail, contact }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setStatus("error");
    }
  };

  if (status === "done")
    return (
      <div className="flex flex-col items-center rounded-3xl border border-emerald-500/20 bg-emerald-500/5 px-6 py-14 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        <p className="mt-4 font-display text-xl text-ivory">Report received</p>
        <p className="mt-2 max-w-sm text-[13px] text-ivory-dim">
          Our verification pipeline will reconcile this with official sources before it reflects in the atlas.
        </p>
      </div>
    );

  const input =
    "w-full rounded-xl border border-line bg-obsidian-3 px-4 py-3 text-[13.5px] text-ivory outline-none transition-colors focus:border-gold/50";
  const label = "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim";

  return (
    <form onFocus={inner} onSubmit={submit} className="mx-auto max-w-xl space-y-5 rounded-3xl border border-line bg-obsidian-2 p-6 sm:p-8">
      {temples.length === 0 && !loaded && <p className="text-center text-[12.5px] text-ivory-dim">Loading temples…</p>}
      {temples.length > 0 && (
        <>
          <div>
            <label className={label}>Temple</label>
            <select value={templeId} onChange={(e) => setTempleId(e.target.value)} className={input}>
              {temples.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name} · {t.location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>What needs correcting?</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={
                    "rounded-full border px-3.5 py-1.5 text-[12px] transition-colors " +
                    (topic === t
                      ? "border-gold/50 bg-gold/12 text-gold-bright"
                      : "border-line text-ivory-dim hover:border-gold/30")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>Details</label>
            <textarea
              className={input + " min-h-[110px] resize-y"}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="e.g. On Tuesdays the evening darshan now closes at 8 pm and VIP entry moved to the north gate…"
            />
          </div>
          <div>
            <label className={label}>
              Contact (optional) <span className="normal-case text-ivory-dim/60">— for verification follow-up</span>
            </label>
            <input className={input} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="email or phone" />
          </div>
          {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[12.5px] text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={status === "sending"}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-5 py-3 text-sm font-semibold text-obsidian transition-all hover:brightness-110 disabled:opacity-60"
          >
            <Send className="h-4 w-4" /> {status === "sending" ? "Submitting…" : "Submit report"}
          </button>
        </>
      )}
    </form>
  );
}