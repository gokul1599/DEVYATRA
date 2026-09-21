import "server-only";
import { randomUUID } from "crypto";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export interface ReportRecord {
  id: string;
  templeId: string;
  topic: string;
  detail: string;
  contact?: string;
  status: "open" | "confirmed" | "resolved" | "rejected";
  created: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(REPORTS_FILE)) writeFileSync(REPORTS_FILE, "[]");
}

export function readReports(): ReportRecord[] {
  ensure();
  try {
    return JSON.parse(readFileSync(REPORTS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

export function addReport(r: Omit<ReportRecord, "id" | "status" | "created">): ReportRecord {
  const report: ReportRecord = { ...r, id: randomUUID(), status: "open", created: new Date().toISOString() };
  const all = readReports();
  all.push(report);
  writeFileSync(REPORTS_FILE, JSON.stringify(all, null, 2));
  return report;
}