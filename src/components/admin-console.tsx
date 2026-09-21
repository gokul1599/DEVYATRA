import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import { FeedPanel } from "@/components/feed-panel";
import { DiscoverConsole } from "@/components/discover-console";

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

export function AdminConsole({ reports, templeCount }: { reports: ReportRow[]; templeCount: number; role: string }) {
  const open = reports.filter((r) => r.status === "open").length;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      <div className="space-y-4">
        <div className="rounded-3xl border border-line bg-obsidian-2 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Atlas</p>
          <p className="mt-1 font-display text-3xl text-ivory">{templeCount}</p>
          <p className="text-[12px] text-ivory-dim">listed temples</p>
        </div>
        <div className="rounded-3xl border border-line bg-obsidian-2 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Verification queue</p>
          <p className="mt-1 font-display text-3xl text-ivory">{open}</p>
          <p className="text-[12px] text-ivory-dim">open reports</p>
        </div>
        <div className="rounded-3xl border border-dashed border-line p-6 text-[12.5px] leading-relaxed text-ivory-dim">
          <AlertTriangle className="mb-2 h-4 w-4 text-amber-400/80" />
          The live admin pipeline (business-data, map overlays, batch import from the community) plugs in here. Status changes below are persisted to the local report store.
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-3 font-display text-xl text-ivory">Report queue</p>
        {reports.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-[13px] text-ivory-dim">
            No reports yet — pilgrims mark errors here and the queue fills.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-obsidian-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ivory">{r.templeName}</p>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-ivory-dim">{r.topic}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ivory/85">{r.detail}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-ivory-dim">
                  <span>{new Date(r.created).toLocaleString("en-IN")}{r.contact ? ` · ${r.contact}` : ""}</span>
                  <span className="font-mono text-ivory-dim/60">#{r.id.slice(0, 8)}</span>
                </div>
                <ReportActions id={r.id} status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

      <FeedPanel />

      <DiscoverConsole />
    </>
  );
}

function StatusBadge({ status }: { status: ReportRow["status"] }) {
  return <span className={cn("rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium capitalize", STATUS_STYLE[status])}>{status}</span>;
}

function ReportActions({ id, status }: { id: string; status: ReportRow["status"] }) {
  const adv = async (to: string) => {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: to }),
    });
    location.reload();
  };
  if (status === "resolved" || status === "rejected") return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {status !== "confirmed" && (
        <button onClick={() => adv("confirmed")} className="rounded-full border border-sky-500/30 px-3.5 py-1.5 text-[11.5px] text-sky-300/90 hover:bg-sky-500/10">
          Confirm with source
        </button>
      )}
      <button onClick={() => adv("resolved")} className="rounded-full border border-emerald-500/30 px-3.5 py-1.5 text-[11.5px] text-emerald-300/90 hover:bg-emerald-500/10">
        Mark resolved
      </button>
      <button onClick={() => adv("rejected")} className="rounded-full border border-red-500/30 px-3.5 py-1.5 text-[11.5px] text-red-300/80 hover:bg-red-500/10">
        Reject
      </button>
    </div>
  );
}