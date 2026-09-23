"use client";

import { useState } from "react";
import {
  History,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import type {
  TemporalDataChange,
  DestinationSourceLedger,
} from "@/lib/intelligence/destination-intelligence";

interface WhatChangedCardProps {
  recentChanges: TemporalDataChange[];
  sourceLedger: DestinationSourceLedger;
}

export function WhatChangedCard({ recentChanges, sourceLedger }: WhatChangedCardProps) {
  const [showLedger, setShowLedger] = useState(false);

  return (
    <div className="rounded-3xl border border-line bg-obsidian-2 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
            <History className="h-3.5 w-3.5" />
            Temporal Change Detection &amp; Trust
          </div>
          <h3 className="mt-2.5 font-display text-xl font-medium text-ivory sm:text-2xl">
            What Changed? &amp; Source Ledger
          </h3>
          <p className="mt-1 text-[13px] text-ivory-dim">
            Transparent audit history of operational changes and statutory source citations.
          </p>
        </div>

        <button
          onClick={() => setShowLedger(!showLedger)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-obsidian-3 px-3.5 py-2 text-xs font-medium text-ivory hover:border-gold/40 transition"
        >
          <FileCheck className="h-3.5 w-3.5 text-gold-bright" />
          <span>{showLedger ? "Hide Source Ledger" : "View Source Ledger"}</span>
          {showLedger ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Recent Changes Timeline */}
      <div className="mt-6 space-y-3">
        {recentChanges.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-6 text-center text-[12.5px] text-ivory-dim">
            No operational schedule alterations recorded in the last 30 days.
          </p>
        ) : (
          recentChanges.map((chg) => (
            <div
              key={chg.id}
              className="flex flex-col justify-between gap-2 rounded-2xl border border-line/70 bg-obsidian-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[10.5px] font-semibold text-gold-bright">
                    {chg.fieldLabel}
                  </span>
                  <span className="text-[11px] text-ivory-dim flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {chg.changedAt}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-ivory">{chg.explanation}</p>
                <div className="flex items-center gap-3 text-[11.5px] text-ivory-dim">
                  <span className="line-through opacity-70">Previous: {chg.previousValue}</span>
                  <span className="font-semibold text-emerald-400">Current: {chg.currentValue}</span>
                </div>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> {chg.verificationState}
                </span>
                <p className="mt-0.5 text-[10.5px] text-ivory-dim/70">Source: {chg.sourceAuthority}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Discrepancy & Conflict Warning (if active) */}
      {sourceLedger.conflicts.map((conflict) => (
        <div
          key={conflict.id}
          className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-[12px] text-ivory"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300">
              Source Discrepancy Flagged: {conflict.fieldName}
            </span>
            <p className="text-ivory-dim">{conflict.publicDisclosureText}</p>
          </div>
        </div>
      ))}

      {/* Expandable Source Ledger */}
      {showLedger && (
        <div className="mt-6 border-t border-line/60 pt-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-gold-dim">
              Fact-Level Provenance &amp; Verification Chain
            </h4>
            <span className="text-[11px] text-ivory-dim">
              Last Full Audit: {sourceLedger.lastAuditDate}
            </span>
          </div>

          <div className="space-y-2.5">
            {sourceLedger.facts.map((fact) => (
              <div
                key={fact.factKey}
                className="flex flex-col justify-between gap-2 rounded-xl border border-line/40 bg-obsidian/70 p-3 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ivory text-[13px]">{fact.factLabel}</span>
                    <span className="rounded-md bg-white/5 px-2 py-0.2 text-[10px] text-ivory-dim">
                      {fact.sourceType}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-gold-bright font-mono">{fact.currentValue}</p>
                </div>

                <div className="text-[11px] text-ivory-dim sm:text-right">
                  <p className="font-medium text-ivory">{fact.sourceName}</p>
                  <p className="text-ivory-dim/60">Verified {fact.verifiedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
