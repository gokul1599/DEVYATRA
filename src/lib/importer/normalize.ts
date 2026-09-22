import { LocationLevel } from "./types";

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Normalised comparison key: lowercase, collapsed whitespace, common variants. */
export function normalizeName(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const SUFFIXES = [
  "mandal",
  "taluk",
  "taluka",
  "tehsil",
  "block",
  "circle",
  "sub-division",
  "subdivision",
  "development block",
  "district",
  "jilla",
  "zilla",
];

/** Match against a canonical name using code first, then fuzzy name equality. */
export function matchName(
  key: string | undefined,
  name: string | undefined,
  candidates: Array<{ code?: string; name: string }>,
):
  | { by: "code"; index: number }
  | { by: "name"; index: number }
  | { by: "name_stripped"; index: number }
  | undefined {
  if (!candidates.length) return undefined;
  if (key) {
    const i = candidates.findIndex((c) => c.code === key);
    if (i >= 0) return { by: "code", index: i };
  }
  if (name) {
    const n = normalizeName(name);
    let i = candidates.findIndex((c) => normalizeName(c.name) === n);
    if (i >= 0) return { by: "name", index: i };
    if (n.startsWith("the ")) {
      const t = n.slice(4).trim();
      i = candidates.findIndex((c) => normalizeName(c.name) === t);
      if (i >= 0) return { by: "name_stripped", index: i };
    }
    // Strip administrative suffix, e.g. "Mysuru" vs "Mysuru Taluk".
    for (const suffix of SUFFIXES) {
      if (n.endsWith(` ${suffix}`)) {
        const s = n.slice(0, -(suffix.length + 1));
        i = candidates.findIndex((c) => normalizeName(c.name) === s);
        if (i >= 0) return { by: "name_stripped", index: i };
      }
    }
  }
  return undefined;
}

export const LEVELS: Record<LocationLevel, number> = {
  state: 0,
  district: 1,
  admin_unit: 2,
  locality: 3,
};

export const VALID_LEVELS: LocationLevel[] = ["state", "district", "admin_unit", "locality"];

export function isValidLevel(v: string): v is LocationLevel {
  return (VALID_LEVELS as string[]).includes(v);
}