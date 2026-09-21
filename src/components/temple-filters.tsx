"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

interface Opt {
  value: string;
  label: string;
}

export function TempleFilters({
  states,
  styles,
  traditions,
}: {
  states: Opt[];
  styles: Opt[];
  traditions: Opt[];
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/temples?${qs}` : "/temples");
  };

  const hasActive = sp.size > 0;

  const sel = "rounded-xl border border-line bg-obsidian-2 px-4 py-2.5 text-sm text-ivory focus:outline-none focus:border-gold/50 appearance-none";

  return (
    <div className="grid w-full gap-3 sm:grid-cols-4">
      <select aria-label="Filter by state" className={sel} value={sp.get("state") ?? ""} onChange={(e) => setParam("state", e.target.value)}>
        <option value="">All states</option>
        {states.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select aria-label="Filter by architecture" className={sel} value={sp.get("style") ?? ""} onChange={(e) => setParam("style", e.target.value)}>
        <option value="">All architecture</option>
        {styles.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select aria-label="Filter by tradition" className={sel} value={sp.get("tradition") ?? ""} onChange={(e) => setParam("tradition", e.target.value)}>
        <option value="">All traditions</option>
        {traditions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => router.replace("/temples")}
        disabled={!hasActive}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm transition-colors",
          hasActive
            ? "border-ivory/15 text-ivory hover:border-gold/40 hover:text-gold-bright"
            : "cursor-not-allowed border-white/5 text-ivory-dim/40"
        )}
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </button>
    </div>
  );
}