"use client";

import React, { useState } from "react";
import { Coins, Users, Calendar, Car, Hotel, Utensils, ShieldAlert, Sparkles, ChevronRight } from "lucide-react";
import { calculateTripCost, CostCalculatorInput, TripCostSummary } from "@/lib/travel/cost-calculator";
import { FreshnessBadge } from "@/components/trust/badges";
import { cn } from "@/lib/cn";

interface TripCostPanelProps {
  totalDays: number;
  totalEstimatedKm: number;
  templeCount: number;
  className?: string;
}

export function TripCostPanel({
  totalDays = 3,
  totalEstimatedKm = 350,
  templeCount = 5,
  className,
}: TripCostPanelProps) {
  const [groupSize, setGroupSize] = useState(2);
  const [travelMode, setTravelMode] = useState<CostCalculatorInput["travelMode"]>("car");
  const [accommodationType, setAccommodationType] = useState<CostCalculatorInput["accommodationType"]>("budget_hotel");
  const [foodPreference, setFoodPreference] = useState<CostCalculatorInput["foodPreference"]>("vegetarian_mess");
  const [specialDarshan, setSpecialDarshan] = useState(2);

  const costSummary: TripCostSummary = calculateTripCost({
    totalDays,
    groupSize,
    travelMode,
    accommodationType,
    foodPreference,
    totalEstimatedKm,
    templeCount,
    specialDarshanCount: specialDarshan,
  });

  return (
    <div className={cn("rounded-3xl border border-white/10 bg-[#16120E] p-6 sm:p-8 shadow-2xl backdrop-blur-xl", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Coins className="h-4 w-4 text-gold" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-gold font-bold">
              Transparent Pilgrim Budget
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-ivory">
            Trip Cost Estimator
          </h3>
          <p className="text-xs text-ivory/60 mt-0.5">
            Configurable budget benchmark for {templeCount} shrines across {totalDays} days (~{totalEstimatedKm} km).
          </p>
        </div>
        <FreshnessBadge status="ESTIMATED" label="Estimated Benchmark" />
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-b border-white/5">
        {/* Group Size */}
        <div>
          <label className="text-[11px] font-mono uppercase text-ivory/50 block mb-1.5">Pilgrim Group</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => setGroupSize(num)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                  groupSize === num
                    ? "bg-gold text-obsidian border-gold"
                    : "bg-white/5 text-ivory/70 border-white/10 hover:bg-white/10"
                )}
              >
                {num} {num === 1 ? "Person" : "Pax"}
              </button>
            ))}
          </div>
        </div>

        {/* Travel Mode */}
        <div>
          <label className="text-[11px] font-mono uppercase text-ivory/50 block mb-1.5">Transit Mode</label>
          <select
            value={travelMode}
            onChange={(e) => setTravelMode(e.target.value as typeof travelMode)}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-ivory font-medium focus:border-gold outline-none"
          >
            <option value="car">Private Car / Cab</option>
            <option value="train">IRCTC Express Train</option>
            <option value="bus">State Roadways Bus</option>
            <option value="walking">Pada Yatra (Walking)</option>
          </select>
        </div>

        {/* Stay Type */}
        <div>
          <label className="text-[11px] font-mono uppercase text-ivory/50 block mb-1.5">Stay Category</label>
          <select
            value={accommodationType}
            onChange={(e) => setAccommodationType(e.target.value as typeof accommodationType)}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-ivory font-medium focus:border-gold outline-none"
          >
            <option value="dharamshala">Trust Dharamshala</option>
            <option value="budget_hotel">Standard Lodge / Hotel</option>
            <option value="comfort_hotel">Comfort Trust AC Guest House</option>
          </select>
        </div>

        {/* Food Preference */}
        <div>
          <label className="text-[11px] font-mono uppercase text-ivory/50 block mb-1.5">Meals & Prasadam</label>
          <select
            value={foodPreference}
            onChange={(e) => setFoodPreference(e.target.value as typeof foodPreference)}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-ivory font-medium focus:border-gold outline-none"
          >
            <option value="annadanam_temple">Temple Annadanam</option>
            <option value="vegetarian_mess">Vegetarian Mess</option>
            <option value="restaurant">Multi-Cuisine Pure Veg</option>
          </select>
        </div>
      </div>

      {/* Summary Total Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-white/10">
        <div>
          <span className="text-xs uppercase font-mono text-ivory/60">Estimated Total Journey Cost</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-gold">
              ₹{costSummary.totalInr.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-ivory/60 font-mono">
              (₹{costSummary.perPersonInr.toLocaleString("en-IN")} / person)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-right">
          <span className="text-[10px] uppercase font-mono text-ivory/50 block">Emergency Reserve Included</span>
          <span className="font-mono text-sm font-semibold text-emerald-400">
            ₹{costSummary.emergencyBufferInr.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Itemized Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
        {costSummary.breakdown.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-white/5 bg-black/25 p-4 flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-ivory block">{item.category}</span>
              <p className="text-[11px] text-ivory/60 mt-0.5 leading-relaxed">{item.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-sm font-bold text-ivory">₹{item.amountInr.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-ivory/40 block font-mono">₹{item.perPersonInr}/pax</span>
            </div>
          </div>
        ))}
      </div>

      {/* Honest Disclaimer */}
      <p className="text-[11px] text-ivory/50 leading-relaxed mt-6 border-t border-white/5 pt-4">
        {costSummary.disclaimer}
      </p>
    </div>
  );
}
