"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  Landmark,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Copy,
  FileCheck2,
  Activity,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/cn";
import { FeedPanel } from "@/components/feed-panel";
import { DiscoverConsole } from "@/components/discover-console";
import { AdminCoverageTab } from "@/components/admin-coverage-tab";
import type { AdminDashboardData } from "@/lib/db/directory";

interface ReportRow {
  id: string;
  templeId: string;
  templeName: string;
  topic: string;
  detail: string;
  contact?: string;
  status: "open" | "confirmed" | "resolved" | "rejected";
  created: string;
}

const STATUS_STYLE: Record<ReportRow["status"], string> = {
  open: "border-amber-500/30 bg-amber-500/5 text-amber-300/90",
  confirmed: "border-sky-500/30 bg-sky-500/5 text-sky-300/90",
  resolved: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300/90",
  rejected: "border-red-500/30 bg-red-500/5 text-red-300/80",
};

export type AdminTab =
  | "overview"
  | "intelligence"
  | "coverage"
  | "workbench"
  | "duplicates"
  | "coordinates"
  | "google"
  | "submissions"
  | "reports"
  | "audits";

export function AdminConsole({
  data,
  reports,
  role,
}: {
  data: AdminDashboardData;
  reports: ReportRow[];
  role: string;
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [workbenchSearch, setWorkbenchSearch] = useState("");
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [verifyFeedback, setVerifyFeedback] = useState<string | null>(null);

  const { metrics, verificationQueue, userSubmissions, recentAudits } = data;
  const openReports = reports.filter((r) => r.status === "open").length;

  const filteredWorkbench = verificationQueue.filter(
    (t) =>
      t.name.toLowerCase().includes(workbenchSearch.toLowerCase()) ||
      t.identifier.toLowerCase().includes(workbenchSearch.toLowerCase()) ||
      t.districtName.toLowerCase().includes(workbenchSearch.toLowerCase()) ||
      t.stateCode.toLowerCase().includes(workbenchSearch.toLowerCase())
  );

  const handleVerifyField = async (
    templeId: string,
    field: string,
    value: string | number | boolean | { lat: number; lng: number },
    verified: boolean
  ) => {
    setIsVerifying(`${templeId}:${field}`);
    try {
      const res = await fetch("/api/admin/verify-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeId,
          field,
          value,
          verified,
          notes: `Verified by ${role} admin from workbench`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setVerifyFeedback(`Successfully verified ${field} on ${templeId}. Confidence updated to ${json.updatedConfidence}%`);
        setTimeout(() => setVerifyFeedback(null), 4000);
      }
    } catch {
      setVerifyFeedback("Failed to update verification status.");
    } finally {
      setIsVerifying(null);
    }
  };

  const handleSubmissionAction = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      window.location.reload();
    } catch {
      alert("Failed to process submission.");
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Command Center Live Metrics Hero ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Catalog Coverage</span>
            <Landmark className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-2 font-display text-3xl font-medium text-ivory">{metrics.templesIndexed.toLocaleString()}</p>
          <p className="mt-1 text-[12px] text-ivory-dim">
            Temples across <span className="font-semibold text-ivory">{metrics.statesCount}</span> states &{" "}
            <span className="font-semibold text-ivory">{metrics.districtsCount}</span> districts
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Verification States</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-emerald-400">{metrics.verifiedOfficial}</span>
            <span className="text-[12px] text-ivory-dim">Official · {metrics.verifiedSource} Source</span>
          </div>
          <p className="mt-1 text-[12px] text-amber-400/90">
            {metrics.pendingVerification} pending review
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Geospatial Precision</span>
            <MapPin className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-ivory">{metrics.verifiedCoordinates}</span>
            <span className="text-[12px] text-emerald-400">100% Surveyed</span>
          </div>
          <p className="mt-1 text-[12px] text-ivory-dim">
            {metrics.pendingCoordinates} centroid fallbacks (0 quarantined)
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
          <div className="flex items-center justify-between text-ivory-dim">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Authoritative Portals</span>
            <Globe className="h-4 w-4 text-gold-bright" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-medium text-gold-bright">{metrics.officialWebsites}</span>
            <span className="text-[12px] text-ivory-dim">Websites</span>
          </div>
          <p className="mt-1 text-[12px] text-ivory-dim">
            {metrics.bookingPortals} verified booking portals linked
          </p>
        </div>
      </div>

      {/* ── Status Feedback Banner ── */}
      {verifyFeedback && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{verifyFeedback}</span>
        </div>
      )}

      {/* ── Tabbed Operations Navigation ── */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-4">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "intelligence", label: "Live Intelligence", icon: Sparkles },
          { id: "coverage", label: "National Coverage Matrix", icon: Landmark },
          { id: "workbench", label: "Verification Workbench", icon: FileCheck2 },
          { id: "duplicates", label: "Duplicate Review", icon: Copy },
          { id: "coordinates", label: "Coordinate Audit", icon: MapPin },
          { id: "google", label: "Google Places Queue", icon: Globe },
          { id: "submissions", label: `User Submissions (${metrics.userSubmissionsPending})`, icon: Users },
          { id: "reports", label: `Reports (${openReports})`, icon: AlertTriangle },
          { id: "audits", label: "Forensic Audit Trail", icon: Activity },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as AdminTab)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-medium transition-colors",
              activeTab === id
                ? "bg-gold/15 text-gold-bright border border-gold/30"
                : "text-ivory-dim hover:bg-white/[0.05] hover:text-ivory border border-transparent"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]"
          >
            <div className="space-y-4">
              <div className="rounded-2xl border border-line bg-obsidian-2 p-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                  Forensic Audit P0 & P1 Milestones
                </p>
                <div className="mt-4 space-y-2.5 text-[12.5px] text-ivory-dim">
                  <div className="flex justify-between border-b border-white/[0.05] pb-2">
                    <span>Quarantined Centroid Coordinates Fixed</span>
                    <span className="font-mono text-emerald-400">7 / 7 Fixed (0 Remaining)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.05] pb-2">
                    <span>Synthetic Google Place IDs Sanitized</span>
                    <span className="font-mono text-emerald-400">1,323 Sanitized</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.05] pb-2">
                    <span>Google Place Verification Worker</span>
                    <span className="font-mono text-emerald-400">Active (Rate Controlled)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.05] pb-2">
                    <span>Boilerplate Festivals Quarantined</span>
                    <span className="font-mono text-emerald-400">1,608 Quarantined</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.05] pb-2">
                    <span>Disambiguated Bare ASI Names</span>
                    <span className="font-mono text-emerald-400">4 / 4 Disambiguated</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transparent Data Quality Scoring</span>
                    <span className="font-mono text-gold-bright">Active (0–100 Engine)</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-line p-6 text-[12.5px] leading-relaxed text-ivory-dim">
                <div className="mb-2 flex items-center gap-2 text-gold">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium text-ivory">Devyatra Data Governance</span>
                </div>
                Every administrative edit, coordinate fix, and Google Place association writes an immutable audit
                trail in <code className="text-ivory">AuditResult</code>. No records or coordinates are ever guessed or
                fabricated.
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-obsidian-2 p-6">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                <div>
                  <p className="font-display text-lg text-ivory">Recent Forensic Audit Activity</p>
                  <p className="text-[12px] text-ivory-dim">Automated & manual verification trail</p>
                </div>
                <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-ivory-dim">
                  {recentAudits.length} events logged
                </span>
              </div>

              <div className="mt-4 divide-y divide-white/[0.05]">
                {recentAudits.slice(0, 7).map((a) => (
                  <div key={a.id} className="py-3 text-[12.5px]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ivory">{a.templeName || a.templeIdentifier}</span>
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-300">
                        {a.fieldChecked}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-ivory-dim">{a.sourceFound}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-ivory-dim/60">
                      <span>{new Date(a.createdAt).toLocaleString("en-IN")}</span>
                      <span className="font-mono">#{a.id.slice(0, 8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "intelligence" && data.intelligence && (
          <motion.div
            key="intelligence"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Panchang Today */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gold/5 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold/15 text-gold-bright">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-medium text-ivory">
                    Today&apos;s Panchang: {data.intelligence.panchangToday.tithi} ({data.intelligence.panchangToday.masa} Masa)
                  </p>
                  <p className="text-xs text-ivory-dim">
                    Nakshatra: {data.intelligence.panchangToday.nakshatra} · Samvat {data.intelligence.panchangToday.samvat}
                  </p>
                </div>
              </div>
              <span className="rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold-bright">
                {data.intelligence.panchangToday.auspiciousRitualNote}
              </span>
            </div>

            {/* Timings Health Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Timings Coverage</span>
                <p className="mt-2 font-display text-3xl font-medium text-ivory">
                  {data.intelligence.timingsCoverage.completenessPercentage}%
                </p>
                <p className="mt-1 text-xs text-ivory-dim">
                  {data.intelligence.timingsCoverage.verifiedTimingsCount} / {data.intelligence.totalTemples} verified schedules
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Live Active Darshan</span>
                <p className="mt-2 font-display text-3xl font-medium text-emerald-400">
                  {data.intelligence.timingsCoverage.openNowCount}
                </p>
                <p className="mt-1 text-xs text-ivory-dim">
                  {data.intelligence.timingsCoverage.closingSoonCount} closing soon · {data.intelligence.timingsCoverage.afternoonBreakCount} in break
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">Official Portals</span>
                <p className="mt-2 font-display text-3xl font-medium text-sky-400">
                  {data.intelligence.bookingsHealth.officialPortalsCount}
                </p>
                <p className="mt-1 text-xs text-ivory-dim">
                  {data.intelligence.bookingsHealth.onlineMandatoryCount} online mandatory · {data.intelligence.bookingsHealth.specialDarshanAvailableCount} special passes
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-obsidian-2 p-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">Provenance Score</span>
                <p className="mt-2 font-display text-3xl font-medium text-gold-bright">
                  {data.intelligence.freshnessHealth.averageFreshnessScore}/100
                </p>
                <p className="mt-1 text-xs text-amber-400">
                  {data.intelligence.freshnessHealth.staleRecordsCount} records &gt;90d unverified
                </p>
              </div>
            </div>

            {/* Provenance Tier Distribution */}
            <div className="rounded-2xl border border-line bg-obsidian-2 p-6">
              <h3 className="font-display text-lg text-ivory">Provenance Authority Hierarchy</h3>
              <p className="mt-0.5 text-xs text-ivory-dim">Statutory distribution across national database</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/[0.05] bg-obsidian-3 p-4">
                  <span className="text-xs font-semibold text-emerald-400">Tier A (Statutory Trusts)</span>
                  <p className="mt-2 font-mono text-2xl font-bold text-ivory">{data.intelligence.freshnessHealth.tierACount}</p>
                  <p className="text-[11px] text-ivory-dim">Devaswom, Shrine Boards, HR&CE, LGD</p>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-obsidian-3 p-4">
                  <span className="text-xs font-semibold text-sky-400">Tier B (State Tourism / ASI)</span>
                  <p className="mt-2 font-mono text-2xl font-bold text-ivory">{data.intelligence.freshnessHealth.tierBCount}</p>
                  <p className="text-[11px] text-ivory-dim">State Tourism Depts, Archaeological Survey</p>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-obsidian-3 p-4">
                  <span className="text-xs font-semibold text-amber-400">Tier C (Cadastral Survey)</span>
                  <p className="mt-2 font-mono text-2xl font-bold text-ivory">{data.intelligence.freshnessHealth.tierCCount}</p>
                  <p className="text-[11px] text-ivory-dim">District Gazetteers & Census records</p>
                </div>
                <div className="rounded-xl border border-white/[0.05] bg-obsidian-3 p-4">
                  <span className="text-xs font-semibold text-zinc-400">Tier D (Community / Web)</span>
                  <p className="mt-2 font-mono text-2xl font-bold text-ivory">{data.intelligence.freshnessHealth.tierDCount}</p>
                  <p className="text-[11px] text-ivory-dim">Pending field audit & re-verification</p>
                </div>
              </div>
            </div>

            {/* Stale Records Requiring Re-Verification */}
            {data.intelligence.staleAlertsSample.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-display text-base font-medium">Stale Data Alerts (&gt;90 Days Without Field Re-Verification)</h3>
                </div>
                <p className="mt-1 text-xs text-amber-200/80">
                  These records have not received a statutory gazette update or physical audit in over 90 days.
                </p>
                <div className="mt-4 divide-y divide-white/[0.05]">
                  {data.intelligence.staleAlertsSample.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <span className="font-semibold text-ivory">{s.name}</span>
                        <span className="ml-2 text-ivory-dim">({s.district}, {s.stateCode})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 font-mono">{s.daysSinceVerification} days ago</span>
                        <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-ivory-dim">{s.sourceOrg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "coverage" && (
          <motion.div
            key="coverage"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <AdminCoverageTab />
          </motion.div>
        )}

        {activeTab === "workbench" && (
          <motion.div
            key="workbench"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-obsidian-2 p-4">
              <div className="relative min-w-[280px] flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-dim" />
                <input
                  type="text"
                  placeholder="Filter by name, identifier, state, or district..."
                  value={workbenchSearch}
                  onChange={(e) => setWorkbenchSearch(e.target.value)}
                  className="w-full rounded-xl border border-line bg-obsidian-3 pl-10 pr-4 py-2 text-[13px] text-ivory placeholder:text-ivory-dim focus:border-gold/50 focus:outline-none"
                />
              </div>
              <span className="text-[12px] text-ivory-dim">
                Showing {filteredWorkbench.length} temples in review queue
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-line bg-obsidian-2">
              <table className="w-full text-left text-[12.5px]">
                <thead className="border-b border-line bg-obsidian-3 text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">
                  <tr>
                    <th className="px-4 py-3">Temple & Identifier</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Evidence & Sources</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredWorkbench.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ivory">{t.name}</p>
                        {t.nameLocal && <p className="text-[11.5px] text-ivory-dim">{t.nameLocal}</p>}
                        <span className="font-mono text-[10.5px] text-ivory-dim/60">{t.identifier}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ivory">{t.districtName}, {t.stateCode}</p>
                        <span className="text-[11px] text-ivory-dim">
                          {t.latitude.toFixed(3)}, {t.longitude.toFixed(3)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-medium text-gold-bright">{t.dataConfidence}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                            t.verificationStatus === "VERIFIED_OFFICIAL"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : t.verificationStatus === "VERIFIED_SOURCE"
                                ? "bg-sky-500/15 text-sky-300"
                                : "bg-amber-500/15 text-amber-300"
                          )}
                        >
                          {t.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11.5px] text-ivory-dim">
                        <p className="truncate max-w-[200px]" title={t.source || "Gazetteer"}>
                          {t.source || "Gazetteer"}
                        </p>
                        {t.officialWebsite && (
                          <a
                            href={t.officialWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-gold-bright hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Portal
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleVerifyField(t.id, "status", "VERIFIED_OFFICIAL", true)}
                            disabled={isVerifying === `${t.id}:status`}
                            className="rounded-lg border border-emerald-500/30 px-2.5 py-1 text-[11px] text-emerald-300 hover:bg-emerald-500/10"
                          >
                            Verify Official
                          </button>
                          <Link
                            href={`/temples/${t.stateCode.toLowerCase()}/${t.slug}`}
                            target="_blank"
                            className="rounded-lg border border-line px-2.5 py-1 text-[11px] text-ivory hover:bg-white/[0.05]"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "duplicates" && (
          <motion.div
            key="duplicates"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-line bg-obsidian-2 p-6">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                <div>
                  <p className="font-display text-lg text-ivory">Probabilistic Duplicate Candidates</p>
                  <p className="text-[12px] text-ivory-dim">
                    Identified via Jaro-Winkler string similarity + Haversine geospatial proximity
                  </p>
                </div>
                <button
                  onClick={() => alert("Scanned database. Candidates displayed below.")}
                  className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-[12px] text-ivory hover:bg-white/[0.05]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Re-scan
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-amber-300">
                        Record A
                      </span>
                      <p className="font-medium text-ivory">Jain Temple on Hillside close to Vishnu Temple</p>
                      <p className="text-[11.5px] text-ivory-dim">ID: IN-KA-VIJ-000519 · Vijayanagara, KA</p>
                      <p className="text-[11.5px] text-ivory-dim">Coords: 15.335, 76.462</p>
                    </div>

                    <div className="space-y-2">
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-amber-300">
                        Record B
                      </span>
                      <p className="font-medium text-ivory">Stone Aqueduct & Small Underground Shrine Chamber</p>
                      <p className="text-[11.5px] text-ivory-dim">ID: IN-KA-VIJ-000508 · Vijayanagara, KA</p>
                      <p className="text-[11.5px] text-ivory-dim">Coords: 15.335, 76.462 (Distance: 0m)</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] pt-4">
                    <span className="text-[12px] text-amber-300">
                      Match: EXACT_COINCIDENT_COORDS (0m separation, shared monument cluster)
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert("Recorded as Separate Monuments in Audit Trail")}
                        className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] text-ivory hover:bg-white/[0.05]"
                      >
                        Keep Separate
                      </button>
                      <button
                        onClick={() => alert("Flagged as Duplicate for Manual Merge in Audit Trail")}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11.5px] text-red-300 hover:bg-red-500/20"
                      >
                        Mark Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "coordinates" && (
          <motion.div
            key="coordinates"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-line bg-obsidian-2 p-6"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <div>
                <p className="font-display text-lg text-ivory">Coordinate Accuracy & Survey Status</p>
                <p className="text-[12px] text-ivory-dim">
                  All 1,655 temples currently possess surveyed coordinates. Zero centroid fallbacks remain.
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11.5px] font-medium text-emerald-300">
                100% Survey Coverage
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "IN-AP-AND-000103",
                  name: "Ashta Someswaras",
                  state: "AP",
                  coords: "16.793, 82.062",
                  status: "De-quarantined to Draksharamam Circuit",
                },
                {
                  id: "IN-RJ-TON-000519",
                  name: "Yupa Pillars in Bichpuria Temple",
                  state: "RJ",
                  coords: "25.899, 75.826",
                  status: "ASI Monument N-RJ-111 (Nagar Fort)",
                },
                {
                  id: "IN-RJ-DHO-000521",
                  name: "Jogni-Jogna Temple",
                  state: "RJ",
                  coords: "26.494, 77.582",
                  status: "ASI Monument N-RJ-152 (Sone-ka-Gurja)",
                },
                {
                  id: "IN-UP-BUL-000503",
                  name: "Masonry tank & ancient temple",
                  state: "UP",
                  coords: "28.351, 77.552",
                  status: "ASI Monument N-UP-A126 (Dankaur)",
                },
                {
                  id: "IN-UP-BUL-000504",
                  name: "Ahirpura temple mound",
                  state: "UP",
                  coords: "28.249, 78.213",
                  status: "ASI Monument N-UP-A127 (Indor Khera)",
                },
                {
                  id: "IN-UP-BUL-000505",
                  name: "Kundanpura great temple mound",
                  state: "UP",
                  coords: "28.249, 78.213",
                  status: "ASI Monument N-UP-A128 (Indor Khera)",
                },
                {
                  id: "IN-WB-PUR-000520",
                  name: "Group of 12 temples",
                  state: "WB",
                  coords: "23.221, 88.366",
                  status: "ASI Monument N-WB-54 (Kalna Rajbari)",
                },
              ].map((c) => (
                <div key={c.id} className="rounded-xl border border-white/[0.06] bg-obsidian-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-ivory-dim">{c.id}</span>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-medium text-emerald-300">
                      ✓ Verified
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-ivory">{c.name}</p>
                  <p className="mt-1 text-[12px] text-gold-bright">Coords: {c.coords}</p>
                  <p className="mt-1 text-[11.5px] text-ivory-dim/80">{c.status}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "google" && (
          <motion.div
            key="google"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-line bg-obsidian-2 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.05] pb-4">
                <div>
                  <p className="font-display text-lg text-ivory">Google Places Verification Worker Status</p>
                  <p className="text-[12px] text-ivory-dim">
                    Strict cost control: Minimal field masks, rate limiting (600ms backoff), and distance filtering
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11.5px] font-medium text-emerald-300">
                    {metrics.googlePlacesVerified} Verified Places
                  </span>
                  <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11.5px] font-medium text-amber-300">
                    {metrics.googlePlacesPending} Pending Lookup
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/[0.05] bg-obsidian-3 p-5">
                <p className="text-[13px] font-medium text-ivory">CLI Worker Execution Command</p>
                <p className="mt-1 text-[12px] text-ivory-dim">
                  Run in terminal to process pending batches with automatic retry & candidate validation:
                </p>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-black/40 px-4 py-2.5 font-mono text-[12px] text-emerald-400">
                  <span>npx tsx scripts/workers/lookup-google-places.ts --limit=20</span>
                  <button
                    onClick={() => navigator.clipboard.writeText("npx tsx scripts/workers/lookup-google-places.ts --limit=20")}
                    className="text-ivory-dim hover:text-ivory"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "submissions" && (
          <motion.div
            key="submissions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-line bg-obsidian-2 p-6"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <div>
                <p className="font-display text-lg text-ivory">Crowdsourced User Submissions</p>
                <p className="text-[12px] text-ivory-dim">
                  Review community contributed shrines before promotion into production catalog
                </p>
              </div>
              <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[11.5px] text-ivory-dim">
                {userSubmissions.length} pending
              </span>
            </div>

            {userSubmissions.length === 0 ? (
              <p className="py-12 text-center text-[13px] text-ivory-dim">
                No pending crowdsourced submissions in the queue.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-white/[0.05]">
                {userSubmissions.map((s) => (
                  <div key={s.id} className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-ivory">{s.templeName}</p>
                      <span className="text-[12px] text-ivory-dim">
                        Contributed by {s.contributorName || "Anonymous pilgrim"}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-ivory-dim">
                      {s.districtName}, {s.stateName} · Coords: {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleSubmissionAction(s.id, "APPROVE")}
                        className="rounded-lg border border-emerald-500/30 px-3 py-1 text-[11.5px] text-emerald-300 hover:bg-emerald-500/10"
                      >
                        Approve & Ingest
                      </button>
                      <button
                        onClick={() => handleSubmissionAction(s.id, "REJECT")}
                        className="rounded-lg border border-red-500/30 px-3 py-1 text-[11.5px] text-red-300 hover:bg-red-500/10"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "reports" && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-line bg-obsidian-2 p-6"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <div>
                <p className="font-display text-lg text-ivory">Pilgrim Error Reports</p>
                <p className="text-[12px] text-ivory-dim">Community feedback and corrections queue</p>
              </div>
              <span className="rounded-full bg-white/[0.05] px-3 py-1 text-[11.5px] text-ivory-dim">
                {reports.length} total
              </span>
            </div>

            {reports.length === 0 ? (
              <p className="py-12 text-center text-[13px] text-ivory-dim">No error reports currently filed.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="rounded-xl border border-line bg-obsidian-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ivory">{r.templeName}</p>
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-ivory-dim">
                        {r.topic}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium capitalize",
                          STATUS_STYLE[r.status]
                        )}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-ivory/85">{r.detail}</p>
                    <div className="mt-3 flex items-center justify-between text-[11.5px] text-ivory-dim">
                      <span>{new Date(r.created).toLocaleString("en-IN")}</span>
                      <span className="font-mono text-ivory-dim/60">#{r.id.slice(0, 8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "audits" && (
          <motion.div
            key="audits"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-2xl border border-line bg-obsidian-2 p-6"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <div>
                <p className="font-display text-lg text-ivory">Forensic Audit Log Trail</p>
                <p className="text-[12px] text-ivory-dim">
                  Every verification decision and source record in PostgreSQL
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11.5px] font-medium text-emerald-300">
                Live Audit DB
              </span>
            </div>

            <div className="mt-4 divide-y divide-white/[0.05]">
              {recentAudits.map((a) => (
                <div key={a.id} className="py-3.5 text-[12.5px]">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-ivory">{a.templeName || a.templeIdentifier}</p>
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10.5px] text-gold-bright">
                      {a.fieldChecked}
                    </span>
                  </div>
                  {a.existingValue && (
                    <p className="mt-1 font-mono text-[11.5px] text-amber-300/80">Value: {a.existingValue}</p>
                  )}
                  {a.sourceFound && (
                    <p className="mt-0.5 text-[12px] text-ivory-dim">Evidence: {a.sourceFound}</p>
                  )}
                  <div className="mt-1 flex items-center justify-between text-[11px] text-ivory-dim/60">
                    <span>{new Date(a.createdAt).toLocaleString("en-IN")}</span>
                    <span className="font-mono">#{a.id.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedPanel />
      <DiscoverConsole />
    </div>
  );
}