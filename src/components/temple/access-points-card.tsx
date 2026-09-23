"use client";

import { MapPin, Navigation, HelpCircle, CheckCircle2 } from "lucide-react";
import type { DestinationAccessPoint } from "@/lib/intelligence/destination-intelligence";
import { cn } from "@/lib/cn";

interface AccessPointsCardProps {
  templeName: string;
  accessPoints: DestinationAccessPoint[];
}

export function AccessPointsCard({ templeName, accessPoints }: AccessPointsCardProps) {
  return (
    <div className="rounded-3xl border border-line bg-obsidian-2 p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-bright">
            <MapPin className="h-3.5 w-3.5" />
            Precise Entry & Navigation
          </div>
          <h3 className="mt-2.5 font-display text-xl font-medium text-ivory sm:text-2xl">
            Exact Access Points
          </h3>
          <p className="mt-1 text-[13px] text-ivory-dim">
            A temple&apos;s main GPS coordinate is often inside the inner sanctum. Navigate to the genuine pilgrim gates below.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {accessPoints.map((point) => {
          const isVerified = point.status === "VERIFIED" && point.latitude && point.longitude;

          return (
            <div
              key={point.id}
              className={cn(
                "flex flex-col justify-between rounded-2xl border p-4 transition",
                isVerified
                  ? "border-line/70 bg-obsidian-3 hover:border-gold/40"
                  : "border-line/40 bg-obsidian/40"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ivory text-[14px]">
                    {point.label}
                  </span>
                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Surveyed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10.5px] font-medium text-ivory-dim">
                      <HelpCircle className="h-3 w-3 text-gold/60" /> Info Unavailable
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-[12px] leading-relaxed text-ivory-dim">
                  {point.notes || "Access gate verified locally."}
                </p>

                <div className="mt-2 text-[11px] text-ivory-dim/70">
                  <span>Source: {point.source}</span>
                </div>
              </div>

              {isVerified && point.latitude && point.longitude ? (
                <div className="mt-4 flex items-center justify-between border-t border-line/50 pt-2.5">
                  <span className="text-[11px] text-gold-dim">
                    {point.latitude.toFixed(4)}°N, {point.longitude.toFixed(4)}°E
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold-bright hover:bg-gold/20 transition"
                  >
                    <Navigation className="h-3 w-3" /> Navigate Here
                  </a>
                </div>
              ) : (
                <div className="mt-4 border-t border-line/30 pt-2 text-[11px] italic text-ivory-dim/60">
                  Follow official on-ground signage near {templeName}.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
