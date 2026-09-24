"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle, Clock, Radio, Sparkles, Building, Database } from "lucide-react";
import { cn } from "@/lib/cn";

export type FreshnessStatus =
  | "LIVE"
  | "RECENT"
  | "VERIFIED"
  | "STATIC"
  | "ESTIMATED"
  | "COMMUNITY_REPORTED"
  | "UNAVAILABLE";

interface FreshnessBadgeProps {
  status: FreshnessStatus;
  label?: string;
  className?: string;
}

export function FreshnessBadge({ status, label, className }: FreshnessBadgeProps) {
  switch (status) {
    case "LIVE":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
            className
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          {label || "LIVE"}
        </span>
      );

    case "RECENT":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20",
            className
          )}
        >
          <Clock className="h-3 w-3" />
          {label || "UPDATED RECENTLY"}
        </span>
      );

    case "VERIFIED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-gold/15 text-gold border border-gold/30",
            className
          )}
        >
          <ShieldCheck className="h-3 w-3" />
          {label || "VERIFIED"}
        </span>
      );

    case "ESTIMATED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20",
            className
          )}
        >
          <Sparkles className="h-3 w-3 text-amber-400" />
          {label || "ESTIMATED"}
        </span>
      );

    case "COMMUNITY_REPORTED":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20",
            className
          )}
        >
          <Database className="h-3 w-3" />
          {label || "COMMUNITY REPORTED"}
        </span>
      );

    case "UNAVAILABLE":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-white/5 text-ivory/40 border border-white/10",
            className
          )}
        >
          <AlertTriangle className="h-3 w-3 text-ivory/40" />
          {label || "LIVE DATA UNAVAILABLE"}
        </span>
      );
  }
}

interface SourceBadgeProps {
  sourceOrg?: string | null;
  sourceType?: string | null;
  className?: string;
}

export function SourceBadge({ sourceOrg, sourceType, className }: SourceBadgeProps) {
  const isOfficial =
    sourceType?.toLowerCase() === "official" ||
    sourceOrg?.toLowerCase().includes("trust") ||
    sourceOrg?.toLowerCase().includes("board") ||
    sourceOrg?.toLowerCase().includes("devaswom");

  const isAsi =
    sourceOrg?.toLowerCase().includes("asi") ||
    sourceOrg?.toLowerCase().includes("archaeological") ||
    sourceType?.toLowerCase() === "asi";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs border",
        isOfficial
          ? "bg-gold/10 text-gold border-gold/30"
          : isAsi
          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
          : "bg-white/5 text-ivory/80 border-white/10",
        className
      )}
    >
      <Building className="h-3.5 w-3.5 opacity-80" />
      <span className="font-medium truncate max-w-[200px]">
        {sourceOrg || (isOfficial ? "Official Temple Trust" : "Verified Source")}
      </span>
    </span>
  );
}

interface VerificationBadgeProps {
  status?: string | null;
  verifiedAt?: string | Date | null;
  className?: string;
}

export function VerificationBadge({ status, verifiedAt, className }: VerificationBadgeProps) {
  const isVerified =
    status === "VERIFIED" ||
    status === "VERIFIED_OFFICIAL" ||
    status === "VERIFIED_SOURCE";

  const dateStr = verifiedAt
    ? typeof verifiedAt === "string"
      ? new Date(verifiedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
      : verifiedAt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium border",
        isVerified
          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
          : "bg-amber-500/10 text-amber-300 border-amber-500/20",
        className
      )}
    >
      {isVerified ? (
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
      ) : (
        <AlertTriangle className="h-3 w-3 text-amber-400" />
      )}
      <span>{isVerified ? `Verified${dateStr ? ` (${dateStr})` : ""}` : "Pending Field Verification"}</span>
    </span>
  );
}

interface DataConfidenceProps {
  score?: number;
  reason?: string;
  className?: string;
}

export function DataConfidence({ score = 90, reason, className }: DataConfidenceProps) {
  const tier = score >= 85 ? "High Confidence" : score >= 65 ? "Medium Confidence" : "Provisional";
  const color =
    score >= 85
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : score >= 65
      ? "text-gold border-gold/30 bg-gold/10"
      : "text-amber-400 border-amber-500/30 bg-amber-500/10";

  return (
    <div className={cn("flex flex-col gap-1 rounded-xl border p-3 bg-obsidian-2/50", color, className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider">{tier}</span>
        <span className="text-xs font-mono font-bold">{score}% Integrity</span>
      </div>
      {reason && <p className="text-[11px] text-ivory/70 leading-relaxed mt-0.5">{reason}</p>}
    </div>
  );
}
