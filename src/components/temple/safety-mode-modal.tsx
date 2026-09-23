"use client";

import { useState } from "react";
import {
  ShieldAlert,
  PhoneCall,
  Ambulance,
  Building2,
  Navigation,
  Pill,
  X,
  AlertTriangle,
} from "lucide-react";
import type { SafetyIntelligenceContext } from "@/lib/intelligence/destination-intelligence";

interface SafetyModeModalProps {
  safety: SafetyIntelligenceContext;
}

export function SafetyModeModal({ safety }: SafetyModeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/20 px-3.5 py-2 text-xs font-semibold text-red-400 shadow-sm transition hover:bg-red-950/40 active:scale-95"
      >
        <ShieldAlert className="h-4 w-4 text-red-400" />
        <span>Safety Mode</span>
      </button>

      {/* Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-red-500/30 bg-obsidian-2 p-6 sm:p-8 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-ivory-dim hover:bg-white/10 hover:text-ivory transition"
              aria-label="Close Safety Dialog"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
                <ShieldAlert className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-medium text-ivory">
                  Safety & Emergency Services
                </h3>
                <p className="text-[12.5px] text-ivory-dim">
                  Emergency contacts & verified medical posts around {safety.destinationName}
                </p>
              </div>
            </div>

            {/* Emergency Speed Dial Grid */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <a
                href={`tel:${safety.emergencyHelplines.nationalEmergency}`}
                className="flex flex-col items-center justify-center rounded-2xl border border-red-500/40 bg-red-950/20 p-3 text-center transition hover:bg-red-950/40"
              >
                <PhoneCall className="h-5 w-5 text-red-400" />
                <span className="mt-1 font-mono text-lg font-bold text-ivory">112</span>
                <span className="text-[10px] uppercase font-semibold text-ivory-dim">National Help</span>
              </a>

              <a
                href={`tel:${safety.emergencyHelplines.ambulance}`}
                className="flex flex-col items-center justify-center rounded-2xl border border-line bg-obsidian-3 p-3 text-center transition hover:border-red-500/30"
              >
                <Ambulance className="h-5 w-5 text-gold-bright" />
                <span className="mt-1 font-mono text-lg font-bold text-ivory">108</span>
                <span className="text-[10px] uppercase font-semibold text-ivory-dim">Ambulance</span>
              </a>

              <a
                href={`tel:${safety.emergencyHelplines.police}`}
                className="flex flex-col items-center justify-center rounded-2xl border border-line bg-obsidian-3 p-3 text-center transition hover:border-red-500/30"
              >
                <ShieldAlert className="h-5 w-5 text-blue-400" />
                <span className="mt-1 font-mono text-lg font-bold text-ivory">100</span>
                <span className="text-[10px] uppercase font-semibold text-ivory-dim">Police</span>
              </a>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-obsidian-3 p-3 text-center">
                <Building2 className="h-5 w-5 text-emerald-400" />
                <span className="mt-1 text-[11px] font-semibold text-ivory line-clamp-1">Temple Office</span>
                <span className="text-[10px] text-ivory-dim">On-ground desk</span>
              </div>
            </div>

            {/* Nearest Medical & Police Facilities */}
            <div className="mt-6 space-y-3">
              <h4 className="text-[11.5px] font-semibold uppercase tracking-wider text-gold-dim">
                Nearest Verified Ground Facilities
              </h4>

              {/* Hospital */}
              {safety.nearestHospital && (
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-obsidian-3 p-3.5">
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-red-400">
                      <Ambulance className="h-3 w-3" /> Emergency Hospital (24/7)
                    </span>
                    <p className="text-[13.5px] font-medium text-ivory">{safety.nearestHospital.name}</p>
                    <p className="text-[11.5px] text-ivory-dim">
                      {safety.nearestHospital.distanceRoadKm} km (~{safety.nearestHospital.estimatedDriveMinutes} min drive) · Source: {safety.nearestHospital.provider}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(safety.nearestHospital.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-obsidian hover:bg-red-400 transition"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Navigate
                  </a>
                </div>
              )}

              {/* Pharmacy */}
              {safety.nearestPharmacy && (
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-obsidian-3 p-3.5">
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-400">
                      <Pill className="h-3 w-3" /> Nearest Pharmacy
                    </span>
                    <p className="text-[13.5px] font-medium text-ivory">{safety.nearestPharmacy.name}</p>
                    <p className="text-[11.5px] text-ivory-dim">
                      {safety.nearestPharmacy.distanceRoadKm} km (~{safety.nearestPharmacy.estimatedDriveMinutes} min drive)
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(safety.nearestPharmacy.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-line bg-obsidian-4 px-3 py-1.5 text-xs font-medium text-ivory hover:border-gold/40 transition"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Navigate
                  </a>
                </div>
              )}

              {/* First Aid Post */}
              {safety.templeFirstAidPost && (
                <div className="rounded-2xl border border-gold/20 bg-gold/5 p-3.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
                    Sanctum First Aid Assistance
                  </span>
                  <p className="mt-1 text-[12.5px] text-ivory">
                    {safety.templeFirstAidPost.locationNote}
                  </p>
                  <p className="mt-1 text-[10.5px] text-ivory-dim">
                    Protocol: {safety.templeFirstAidPost.source}
                  </p>
                </div>
              )}
            </div>

            {/* Advisory footer */}
            {safety.safetyAdvisory && (
              <div className="mt-5 flex items-start gap-2 rounded-2xl border border-line/60 bg-obsidian p-3 text-[11.5px] text-ivory-dim">
                <AlertTriangle className="h-4 w-4 shrink-0 text-gold-bright" />
                <span>{safety.safetyAdvisory}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
