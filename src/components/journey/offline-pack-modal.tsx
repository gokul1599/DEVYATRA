"use client";

import { useState } from "react";
import {
  Download,
  CheckCircle2,
  MapPin,
  X,
  Copy,
  Check,
} from "lucide-react";
import type { OfflineJourneyPack } from "@/lib/intelligence/offline-pack";

interface OfflinePackModalProps {
  pack: OfflineJourneyPack;
}

export function OfflinePackModal({ pack }: OfflinePackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pack, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `devyatra-offline-journey-${pack.journeyId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyBrief = () => {
    const textLines = [
      `🇮🇳 DEVYATRA OFFLINE JOURNEY: ${pack.journeyTitle}`,
      `Watermark: ${pack.offlineWatermark}`,
      `Total Stops: ${pack.totalDestinations}`,
      "",
      "--- ITINERARY STOPS ---",
      ...pack.destinations.map(
        (d, i) =>
          `${i + 1}. ${d.name} (${d.latitude.toFixed(4)}°N, ${d.longitude.toFixed(4)}°E)\n   Address: ${d.formattedAddress}\n   Hours: ${d.openingHoursSummary}\n   Footwear: ${d.rulesSummary.footwear}\n   Police: ${d.emergencyContacts.police} | Ambulance: ${d.emergencyContacts.ambulance}`
      ),
      "",
      "--- PRE-TRIP CHECKLIST ---",
      ...pack.preTripChecklist.map((c) => `[ ] ${c.item}`),
      "",
      `Notice: ${pack.safetyDisclaimer}`,
    ].join("\n");

    navigator.clipboard.writeText(textLines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold-bright transition hover:bg-gold/20 active:scale-95"
      >
        <Download className="h-4 w-4" />
        <span>Download Offline Pack</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gold/30 bg-obsidian-2 p-6 sm:p-8 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-ivory-dim hover:bg-white/10 hover:text-ivory transition"
              aria-label="Close Offline Pack Dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Network-Independent Sacred Travel
              </div>
              <h3 className="mt-2.5 font-display text-2xl font-medium text-ivory">
                Offline Journey Pack
              </h3>
              <p className="mt-1 text-[13px] text-ivory-dim">
                Complete pre-trip package with coordinates, addresses, emergency numbers, and checklist. Works with zero cellular signal.
              </p>
            </div>

            {/* Watermark Notice */}
            <div className="mt-5 rounded-2xl border border-line/80 bg-obsidian-3 p-3.5 text-[12px]">
              <span className="font-mono font-semibold text-gold-bright">{pack.offlineWatermark}</span>
              <p className="mt-1 text-[11.5px] text-ivory-dim leading-relaxed">
                {pack.safetyDisclaimer}
              </p>
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-obsidian hover:bg-gold-bright transition"
              >
                <Download className="h-4 w-4" /> Save Offline JSON
              </button>
              <button
                onClick={handleCopyBrief}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-obsidian-3 px-4 py-2 text-xs font-medium text-ivory hover:border-gold/40 transition"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied to Clipboard!" : "Copy Trip Brief"}
              </button>
            </div>

            {/* Stops Summary */}
            <div className="mt-8 space-y-3">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-gold-dim">
                Offline Verified Destinations ({pack.totalDestinations})
              </h4>
              {pack.destinations.map((d, i) => (
                <div key={d.id} className="rounded-2xl border border-line/60 bg-obsidian-3 p-4 text-[12.5px]">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-ivory text-[14px]">
                      {i + 1}. {d.name}
                    </span>
                    <span className="font-mono text-[11px] text-gold-dim">
                      {d.latitude.toFixed(4)}°N, {d.longitude.toFixed(4)}°E
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-ivory-dim flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gold/70 shrink-0" />
                    {d.formattedAddress}
                  </p>
                  <p className="mt-1 text-[11.5px] text-emerald-400">
                    Hours: {d.openingHoursSummary}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-ivory-dim">
                    <span className="rounded-md bg-white/5 px-2 py-0.5">Footwear: {d.rulesSummary.footwear}</span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5">Dress: {d.rulesSummary.dressCode}</span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5">Emergency Police: {d.emergencyContacts.police}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist */}
            <div className="mt-8 space-y-2.5">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-gold-dim">
                Pre-Trip Readiness Checklist
              </h4>
              {pack.preTripChecklist.map((chk) => (
                <div key={chk.id} className="flex items-center gap-2.5 rounded-xl border border-line/40 bg-obsidian/70 p-2.5 text-[12px]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-ivory">{chk.item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
