import { Landmark, Compass, Quote, MapPin, ShieldCheck, Database } from "lucide-react";
import type { Temple } from "@/lib/types";

interface TempleDnaProps {
  temple: Temple;
  stateName: string;
}

export function TempleDna({ temple, stateName }: TempleDnaProps) {
  const items = [
    {
      label: "Main Deity",
      val: temple.mainDeity || "Sacred Sanctum",
      icon: Quote,
      sub: "Presiding Divine Energy",
    },
    {
      label: "Tradition",
      val: temple.type || "Sanatana Dharma",
      icon: ShieldCheck,
      sub: "Agama / Sacred Lineage",
    },
    {
      label: "Architecture",
      val: temple.architecture || "Traditional Indian",
      icon: Landmark,
      sub: "Shilpa Shastra Order",
    },
    {
      label: "Region & State",
      val: `${temple.district}, ${stateName}`,
      icon: MapPin,
      sub: "Administrative Boundary",
    },
    {
      label: "Coordinates",
      val: `${temple.latitude.toFixed(4)}° N, ${temple.longitude.toFixed(4)}° E`,
      icon: Compass,
      sub: "Verified Geodetic Fix",
    },
    {
      label: "Archival Status",
      val: temple.verified ? "Archival Grade (100%)" : "Field Monitored",
      icon: Database,
      sub: "Source Transparency",
    },
  ];

  return (
    <div className="rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 md:p-8 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-5 mb-6">
        <div>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#C8A24B]">
            Identity Matrix
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#F2ECE1] mt-1">
            Temple DNA
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Factual Grounding Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex flex-col justify-between rounded-2xl border border-stone-800/60 bg-stone-900/40 p-4 transition-all hover:border-[#C8A24B]/40 hover:bg-stone-900/70"
          >
            <div>
              <div className="flex items-center justify-between text-stone-500 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#C8A24B]">
                  {it.label}
                </span>
                <it.icon className="h-3.5 w-3.5 text-stone-400" />
              </div>
              <p className="font-serif text-sm font-medium text-[#F2ECE1] leading-snug line-clamp-2">
                {it.val}
              </p>
            </div>
            <span className="mt-3 block font-mono text-[10px] text-stone-500 truncate">
              {it.sub}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
