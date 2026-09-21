"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { statusFor } from "@/lib/format";
import type { Temple } from "@/lib/types";
import { cn } from "@/lib/cn";

export function LiveStatus({ temple }: { temple: Temple }) {
  const [st, setSt] = useState<ReturnType<typeof statusFor>>(() => statusFor(temple));
  useEffect(() => {
    const to = setTimeout(() => setSt(statusFor(temple)), 0);
    const id = setInterval(() => setSt(statusFor(temple)), 60_000);
    return () => {
      clearTimeout(to);
      clearInterval(id);
    };
  }, [temple]);

  const meta = {
    open: { cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", label: "Open now", pulse: true },
    closed: { cls: "bg-terracotta/15 text-[#e08568] border-terracotta/30", label: "Closed now", pulse: false },
    seasonal: { cls: "bg-sky-500/15 text-sky-400 border-sky-500/30", label: "Seasonal schedule", pulse: false },
    unknown: { cls: "bg-zinc-500/15 text-zinc-400 border-zinc-600/30", label: "Timing not verified — check official source", pulse: false },
  }[st.state];

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium", meta.cls)}>
      <span className="relative flex h-2 w-2">
        {meta.pulse && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {meta.label}
      {st.state === "unknown" && <Clock className="h-3.5 w-3.5" />}
      {temple.timings?.todayNote && <span className="ml-1 hidden text-[11px] opacity-80 md:inline">· {temple.timings.todayNote}</span>}
    </span>
  );
}

export function PlanCta({ slug }: { slug: string }) {
  return (
    <a
      href={`/plan?temple=${slug}`}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-6 py-2.5 text-sm font-semibold text-obsidian shadow-[0_14px_34px_-12px_rgba(217,130,43,0.6)] transition-all hover:brightness-110"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" strokeLinejoin="round" />
        <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" strokeLinejoin="round" />
      </svg>
      Plan My Visit
    </a>
  );
}