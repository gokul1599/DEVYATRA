import { LocationRow } from "./types";
import { isValidLevel } from "./normalize";

const HEADER_ALIASES: Record<string, keyof LocationRow> = {
  level: "level",
  type: "level",
  code: "officialCode",
  officialcode: "officialCode",
  official_code: "officialCode",
  lgdcode: "officialCode",
  name: "name",
  namelocal: "nameLocal",
  name_local: "nameLocal",
  localname: "nameLocal",
  parent: "parent",
  parentcode: "parent",
  parent_code: "parent",
  zone: "zone",
  state: "zone",
  district: "zone",
  kind: "kind",
  adminunitterm: "adminUnitTerm",
  admin_unit_term: "adminUnitTerm",
  lat: "latitude",
  latitude: "latitude",
  lng: "longitude",
  lon: "longitude",
  longitude: "longitude",
};

function splitCsvLine(line: string): string[] {
  const delimiter = line.includes("\t") ? "\t" : line.includes("|") && !line.includes(",") ? "|" : ",";
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === delimiter && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseLocationCsv(content: string): LocationRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (!lines.length) return [];
  const header = splitCsvLine(lines[0]).map((h) => HEADER_ALIASES[h.toLowerCase().replace(/[\s-]/g, "")] ?? (h as keyof LocationRow));
  const rows: LocationRow[] = [];
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line);
    const row: Record<string, unknown> = {};
    header.forEach((key, i) => {
      const raw = cells[i];
      if (raw === undefined || raw === "") return;
      if (key === "latitude" || key === "longitude") row[key] = Number(raw);
      else row[key] = raw;
    });
    if (isValidLevel(row.level as string)) rows.push(row as unknown as LocationRow);
  }
  return rows;
}

export function parseLocationJson(content: string): LocationRow[] {
  const data = JSON.parse(content) as unknown;
  const arr = Array.isArray(data) ? data : (data as { locations?: unknown[] }).locations ?? [];
  if (!Array.isArray(arr)) return [];
  const rows: LocationRow[] = [];
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const src = item as Record<string, unknown>;
    const row: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(src)) {
      const key = HEADER_ALIASES[k.toLowerCase().replace(/[\s-]/g, "")] ?? k;
      if (v === null || v === undefined || v === "") continue;
      row[key] = key === "latitude" || key === "longitude" ? Number(v) : v;
    }
    if (isValidLevel(row.level as string)) rows.push(row as unknown as LocationRow);
  }
  return rows;
}

/** Detect JSON vs CSV by the first non-space character. */
export function parseLocationData(content: string): LocationRow[] {
  const trimmed = content.trimStart();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return parseLocationJson(content);
  return parseLocationCsv(content);
}