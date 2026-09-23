"use client";

import { useState } from "react";
import {
  Globe2,
  Scroll,
  Music,
  Plane,
  Building,
  Info,
} from "lucide-react";
import type { Temple } from "@/lib/types";
import { cn } from "@/lib/cn";

interface P1PersonasProps {
  temple: Temple;
}

type PersonaTab = "overseas" | "international" | "architecture" | "dynasty" | "culture";

export function P1PersonaExplorer({ temple }: P1PersonasProps) {
  const [activeTab, setActiveTab] = useState<PersonaTab>("overseas");

  return (
    <div className="rounded-3xl border border-line bg-obsidian-2 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
            In-Depth Perspectives &amp; Heritage Dimensions
          </span>
          <h3 className="mt-1 font-display text-2xl font-medium text-ivory">
            Sacred Persona Explorer
          </h3>
          <p className="mt-1 text-xs text-ivory-dim">
            Curated intelligence for global seekers, architectural scholars, and diaspora pilgrims
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-white/[0.06] bg-obsidian-3 p-1 text-xs">
          {[
            { id: "overseas" as const, label: "NRI / Diaspora", icon: Plane },
            { id: "international" as const, label: "Global Visitors", icon: Globe2 },
            { id: "architecture" as const, label: "Architecture Anatomy", icon: Building },
            { id: "dynasty" as const, label: "Dynasties & Epigraphy", icon: Scroll },
            { id: "culture" as const, label: "Living Traditions", icon: Music },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all",
                  isSelected
                    ? "bg-gold text-obsidian shadow-sm"
                    : "text-ivory-dim hover:text-ivory hover:bg-white/[0.03]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: NRI / Diaspora */}
      {activeTab === "overseas" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-4">
              <h4 className="font-display text-sm font-semibold text-ivory">NRI Darshan Quotas &amp; Identity</h4>
              <p className="mt-1 text-xs leading-relaxed text-ivory-dim">
                Select major temples (e.g. Tirumala, Somnath) maintain specialized NRI/OCI reporting counters. Carry your physical original passport with valid OCI card or tourist visa. Advance booking tokens must match passport details exactly.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-4">
              <h4 className="font-display text-sm font-semibold text-ivory">Official E-Hundi &amp; Seva Bookings</h4>
              <p className="mt-1 text-xs leading-relaxed text-ivory-dim">
                Never remit donations through unverified third-party brokers. Remit e-Hundi offerings and book Nitya Sevas exclusively through the statutory devasthanam or endowment department portal linked in Devyatra.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-gold/20 bg-gold/[0.02] p-4 text-xs text-ivory-dim flex items-start gap-2.5">
            <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Ritual Offerings for Diaspora:</strong> Homam and archana sankalpam can be requested with your Gothra and Nakshatra at the temple administrative office upon presenting valid photo ID.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Global Visitors */}
      {activeTab === "international" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-4">
              <h4 className="font-display text-sm font-semibold text-ivory">Inner Sanctum Etiquette</h4>
              <p className="mt-1 text-xs leading-relaxed text-ivory-dim">
                Certain ancient traditional shrines reserve inner Garbhagriha entry for practicing Hindus while welcoming all visitors to outer mandapams and architectural courtyards. Check signboards near the Dwajasthambam (flagpole).
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-4">
              <h4 className="font-display text-sm font-semibold text-ivory">Modest Attire &amp; Customs</h4>
              <p className="mt-1 text-xs leading-relaxed text-ivory-dim">
                Wear clothing covering shoulders and knees. Remove footwear at authorized outside counters before stepping onto sanctified stone corridors. Circumambulate shrines in a clockwise direction.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-4 text-xs text-ivory-dim">
            <h4 className="font-display text-sm font-semibold text-ivory mb-1">Approved Tour Guides</h4>
            <p>
              Engage only Ministry of Tourism or State Tourism Board certified regional guides wearing official badge credentials. Official ASI ticket counters provide authorized heritage booklet guides.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Architecture Anatomy */}
      {activeTab === "architecture" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h4 className="font-display text-base font-semibold text-ivory">
                {temple.architecture || "Sanatan Temple Architecture"}
              </h4>
              <span className="rounded-full bg-gold/15 px-3 py-0.5 text-xs font-medium text-gold-bright">
                {temple.type}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                <span className="font-semibold text-ivory block mb-1">Gopuram / Shikhara</span>
                <p className="text-ivory-dim">Monolithic entrance towers designed according to Shilpa Shastra proportions.</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                <span className="font-semibold text-ivory block mb-1">Mandapam Corridors</span>
                <p className="text-ivory-dim">Pillared congregation halls showcasing intricate relief sculptures and celestial motifs.</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                <span className="font-semibold text-ivory block mb-1">Garbhagriha</span>
                <p className="text-ivory-dim">The central sanctum sanctorum housing the consecrated murti of {temple.mainDeity}.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Dynasties & Epigraphy */}
      {activeTab === "dynasty" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-5">
            <h4 className="font-display text-base font-semibold text-ivory mb-2">Historical Inscriptions &amp; Royal Patrons</h4>
            <p className="text-xs leading-relaxed text-ivory-dim mb-4">
              Historical records indicate continuous royal endowments, land grants (Brahmadeya), and epigraphical copper-plate records across historic reigns.
            </p>
            <div className="space-y-2 text-xs">
              {temple.history.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                  {item.year && (
                    <span className="rounded bg-gold/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-gold-bright shrink-0">
                      {item.year}
                    </span>
                  )}
                  <div>
                    <span className="font-medium text-ivory">{item.title}</span>
                    <p className="mt-0.5 text-ivory-dim/80">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Living Traditions */}
      {activeTab === "culture" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-4">
              <h4 className="font-display text-sm font-semibold text-ivory">Nadaswaram &amp; Temple Melam</h4>
              <p className="mt-1 text-xs leading-relaxed text-ivory-dim">
                Sacred acoustic rituals herald the waking of the deity during Ushakkala puja and accompany evening deeparadhana processions.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.05] bg-obsidian-3 p-4">
              <h4 className="font-display text-sm font-semibold text-ivory">Pushkarini &amp; Sacred Groves</h4>
              <p className="mt-1 text-xs leading-relaxed text-ivory-dim">
                The temple water tank (Theertham) serves both ecological rainwater harvesting and ritual purification purposes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
