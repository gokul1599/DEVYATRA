import { Users2, Baby, Droplets, PackageCheck, Utensils, HeartPulse, HelpCircle } from "lucide-react";
import type { Temple } from "@/lib/types";

interface FamilyComfortProps {
  temple: Temple;
}

export function FamilyComfort({ temple }: FamilyComfortProps) {
  const familyAmenities = [
    {
      id: "cloakroom",
      name: "Luggage & Phone Cloakrooms",
      icon: PackageCheck,
      statusText: "Verify on arrival",
      detail: "Official devasthanam counter or token locker facility typically available near main gopuram.",
    },
    {
      id: "footwear",
      name: "Shoe Custody Counters",
      icon: Users2,
      statusText: "Operational",
      detail: "Designated free or nominal-token shoe keeping stands outside temple complex entrances.",
    },
    {
      id: "water",
      name: "Drinking Water Points",
      icon: Droplets,
      statusText: "Available",
      detail: "Clean drinking water / RO coolers provided along queue lines in major corridors.",
    },
    {
      id: "stroller",
      name: "Pram / Stroller Access",
      icon: Baby,
      statusText: "Restricted in Sanctum",
      detail: "Strollers may be used in outer courtyards but must be parked before entering inner mandapams.",
    },
    {
      id: "annadanam",
      name: "Annadanam / Dining Hall",
      icon: Utensils,
      statusText: "Trust Specific",
      detail: "Daily sacred prasadam meals served during noon hours at affiliated devasthanam dining halls.",
    },
    {
      id: "medical",
      name: "First Aid & Emergency",
      icon: HeartPulse,
      statusText: "Verify with Trust",
      detail: "Basic medical care available at temple administration rooms; nearest hospital mapped in essentials.",
    },
  ];

  return (
    <div className="rounded-3xl border border-line bg-obsidian-2 p-6 sm:p-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <Users2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl font-medium text-ivory">Family & Pilgrim Comfort Guide</h3>
          <p className="text-xs text-ivory-dim">
            Practical amenities, footwear, dining, and pram readiness for family visits to {temple.name}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {familyAmenities.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-white/[0.05] bg-obsidian-3 p-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-ivory">
                  <item.icon className="h-4 w-4 text-gold-dim" />
                  <span>{item.name}</span>
                </div>
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-ivory-dim">
                  {item.statusText}
                </span>
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-ivory-dim/80">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.06] bg-obsidian-3/60 p-4 text-xs text-ivory-dim flex items-start gap-2.5">
        <HelpCircle className="h-4 w-4 text-gold-dim shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Tip for young families:</strong> Keep identification tags or emergency phone numbers in children&apos;s pockets during busy festival weekends when queue densities peak.
        </p>
      </div>
    </div>
  );
}
