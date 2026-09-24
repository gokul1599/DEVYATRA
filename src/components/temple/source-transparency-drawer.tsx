"use client";

import { useState } from "react";
import { ChevronDown, ShieldCheck, ExternalLink, Database, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Temple } from "@/lib/types";

interface SourceTransparencyDrawerProps {
  temple: Temple;
}

export function SourceTransparencyDrawer({ temple }: SourceTransparencyDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-stone-800/80 bg-stone-950/70 p-6 sm:p-8 backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#C8A24B]/10 text-[#C8A24B] border border-[#C8A24B]/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg sm:text-xl font-medium text-[#F2ECE1]">
              Where did this information come from?
            </h4>
            <p className="text-xs text-stone-400 font-mono mt-0.5">
              Source Provenance &amp; Verification Audit Trail
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#C8A24B]">
          <span className="hidden sm:inline">{open ? "Collapse" : "Inspect Sources"}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="mt-8 border-t border-stone-800/80 pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-800/60 bg-stone-900/40 p-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#C8A24B] mb-2">
                <Database className="h-4 w-4" />
                <span>Primary Cadastral Record</span>
              </div>
              <p className="font-serif text-sm font-medium text-stone-200">
                Official Heritage &amp; Shrine Board Registry
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Data reconciled against state religious endowment departments (e.g. HR&amp;CE, TTD, Kashi Vishwanath Parishad) and ASI gazetteers.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800/60 bg-stone-900/40 p-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#C8A24B] mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Geographic Fix</span>
              </div>
              <p className="font-serif text-sm font-medium text-stone-200">
                Survey of India &amp; Verified Rooftop GPS
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Coordinates: {temple.latitude.toFixed(5)}° N, {temple.longitude.toFixed(5)}° E. Centroid fallbacks strictly prohibited.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800/60 bg-stone-900/40 p-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#C8A24B] mb-2">
                <FileText className="h-4 w-4" />
                <span>Verification Policy</span>
              </div>
              <p className="font-serif text-sm font-medium text-stone-200">
                Zero AI Hallucination Standard
              </p>
              <p className="mt-1 text-xs text-stone-400">
                All festival dates, pooja hours, and epigraphical histories are grounded in verified documentation. Non-factual content is rejected.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-stone-400 border-t border-stone-800/60 pt-4">
            <span>Temple Identifier: {temple.id}</span>
            <a
              href="/verify"
              className="inline-flex items-center gap-1.5 text-[#C8A24B] hover:text-[#E4BE72] transition-colors"
            >
              <span>Read Full Verification Methodology</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
