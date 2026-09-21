"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Database, Loader2, RefreshCw, Upload } from "lucide-react";

interface FeedStatus {
  source: string;
  updatedAt: string;
  count: number;
  byTemple?: Record<string, number>;
}

const EXAMPLE =
  JSON.stringify(
    {
      source: "Tirumala TTD vicinity survey",
      places: [
        {
          templeId: "sri-venkateswara-temple",
          kind: "restaurant",
          name: "Annapoorna Tiffin Centre",
          distanceKm: 0.9,
          priceHint: "400–600",
          cuisine: ["south-indian", "snacks"],
          recommendation: "Family-run, popular for breakfast before the 6 am darshan queue.",
        },
        {
          templeId: "kashi-vishwanath-temple",
          kind: "hotel",
          name: "Ganga Heritage Stay",
          distanceKm: 1.2,
          priceHint: "1200–2000",
          recommendation: "Ghat-side rooms; call ahead during Kashi Vishwanath Darshan crowds.",
        },
      ],
    },
    null,
    2
  );

export function FeedPanel() {
  const [status, setStatus] = useState<FeedStatus | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = () => {
    fetch("/api/admin/feed")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStatus)
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setMsg({ ok: false, text: "Invalid JSON — check quotes and brackets." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ ok: false, text: data.error + (data.errors?.length ? ` · ${data.errors.join("; ")}` : "") });
      } else {
        setMsg({ ok: true, text: `Imported ${data.added} places — feed now holds ${data.count}. ${data.errors?.length ? `${data.errors.length} rows skipped.` : ""}` });
        setText("");
        load();
      }
    } catch {
      setMsg({ ok: false, text: "Network error." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-12 rounded-3xl border border-line bg-obsidian-2 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-xl text-ivory">
          <Database className="h-5 w-5 text-gold" /> Live data pipeline
        </p>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[11.5px] text-ivory-dim hover:border-gold/30"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Source" value={status?.source ?? "none"} />
        <Stat label="Business records" value={status ? String(status.count) : "…"} />
        <Stat label="Last sync" value={status?.updatedAt ? new Date(status.updatedAt).toLocaleString("en-IN") : "never"} />
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
          Import batch (JSON) — runs validation: temple ids, kinds and distance sanity
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          spellCheck={false}
          className="min-h-[150px] w-full resize-y rounded-xl border border-line bg-obsidian-3 px-4 py-3 font-mono text-[12px] text-ivory outline-none focus:border-gold/50"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={submit}
            disabled={busy || !text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-5 py-2.5 text-[13px] font-semibold text-obsidian transition-all hover:brightness-110 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Import batch
          </button>
          <button
            onClick={() => setText(EXAMPLE)}
            className="text-[12px] text-ivory-dim hover:text-gold-bright"
          >
            Use example batch
          </button>
        </div>
        {msg && (
          <p
            className={
              "mt-3 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[12.5px] " +
              (msg.ok
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300/90"
                : "border-red-500/20 bg-red-500/5 text-red-300/90")
            }
          >
            {msg.ok && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {msg.text}
          </p>
        )}
        <p className="mt-3 text-[11.5px] leading-relaxed text-ivory-dim/70">
          Imported places appear on /nearby with a “live” tag and stream into map overlays. Rows that fail
          validation are reported back, never silently dropped.
        </p>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-obsidian-3 p-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ivory-dim">{label}</p>
      <p className="mt-1 truncate font-display text-[16px] text-ivory">{value}</p>
    </div>
  );
}