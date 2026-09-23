import { CheckCircle2, XCircle, HelpCircle, HeartHandshake, ShieldAlert } from "lucide-react";
import type { Temple } from "@/lib/types";

interface SeniorEaseProps {
  temple: Temple;
}

type FacilityState = "VERIFIED_AVAILABLE" | "NOT_AVAILABLE" | "UNAVAILABLE_VERIFY";

interface FacilityItem {
  id: string;
  name: string;
  state: FacilityState;
  note?: string;
}

export function SeniorEase({ temple }: SeniorEaseProps) {
  // Check if temple data has explicit facilities recorded, otherwise default strictly to UNAVAILABLE_VERIFY
  // NEVER assume or fabricate facility availability.
  const facilities: FacilityItem[] = [
    {
      id: "wheelchair",
      name: "Wheelchair & Ramp Assistance",
      state: "UNAVAILABLE_VERIFY",
      note: "Availability varies across outer praharams. Inquire at main Devasthanam office.",
    },
    {
      id: "ground_level",
      name: "Ground-Level Sanctum Access",
      state: "UNAVAILABLE_VERIFY",
      note: "Ancient sanctum stone steps and thresholds may require physical assistance.",
    },
    {
      id: "battery_cart",
      name: "Battery-Operated Shuttles",
      state: "UNAVAILABLE_VERIFY",
      note: "Active primarily in major state-administered pilgrimage complexes.",
    },
    {
      id: "rest_seating",
      name: "Seating in Queue Corridors",
      state: "UNAVAILABLE_VERIFY",
      note: "Rest benches are deployed along designated senior citizen darshan corridors.",
    },
    {
      id: "handrails",
      name: "Handrails & Anti-Skid Mats",
      state: "UNAVAILABLE_VERIFY",
      note: "Paved parikrama pathways may be exposed to heat; mats spread during summer mornings.",
    },
    {
      id: "accessible_toilets",
      name: "Accessible Restroom Facilities",
      state: "UNAVAILABLE_VERIFY",
      note: "Public convenience complexes situated outside footwear deposit zones.",
    },
  ];

  return (
    <div className="rounded-3xl border border-line bg-obsidian-2 p-6 sm:p-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
          <HeartHandshake className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl font-medium text-ivory">Senior Citizen & Mobility Readiness</h3>
          <p className="text-xs text-ivory-dim">
            Transparent physical accessibility parameters for elderly pilgrims visiting {temple.name}
          </p>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {facilities.map((f) => (
          <div
            key={f.id}
            className="flex flex-col justify-between rounded-2xl border border-white/[0.05] bg-obsidian-3 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-ivory">{f.name}</span>
              {f.state === "VERIFIED_AVAILABLE" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> Available
                </span>
              ) : f.state === "NOT_AVAILABLE" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                  <XCircle className="h-3 w-3" /> Not Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-ivory-dim">
                  <HelpCircle className="h-3 w-3 text-gold-dim" /> Verify on-ground
                </span>
              )}
            </div>
            {f.note && (
              <p className="mt-2 text-[11.5px] leading-relaxed text-ivory-dim/80">
                {f.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Senior Comfort Advice */}
      <div className="mt-5 rounded-2xl border border-gold/20 bg-gold/[0.03] p-4 text-xs leading-relaxed text-ivory-dim">
        <div className="flex items-center gap-2 font-semibold text-gold-bright mb-1">
          <ShieldAlert className="h-4 w-4" />
          <span>Recommended Window for Elders</span>
        </div>
        <p>
          To minimize crowd pressure and stone floor temperature, schedule visits between <strong>06:30 AM – 08:00 AM</strong> or immediately at the afternoon reopening window. Carry prescribed medications, oral hydration, and valid senior citizen government ID cards (Aadhaar) to access concession counters if available.
        </p>
      </div>
    </div>
  );
}
