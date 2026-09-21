import { TEMPLES } from "./data/temples";
import { getState } from "./registry";
import { Temple } from "./types";

/** Canonicalise text for matching: lower-case, strip diacritics, collapse spaces. */
export const canonical = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Common transliteration alternatives so 'Tirupathi' still matches 'Tirupati'. */
const TRANSLIT: [RegExp, string][] = [
  [/th/g, "t"],
  [/ksh/g, "k"],
  [/sh/g, "s"],
  [/j/g, "z"],
];

const alternate = (s: string): string[] => {
  const out = new Set<string>([s, canonical(s)]);
  for (const [re, rep] of TRANSLIT) out.add(canonical(s).replace(re, rep));
  return [...out];
};

const tokens = (s: string) => canonical(s).split(" ").filter(Boolean);
const tokenSet = (s: string) => new Set(tokens(s));

interface Scored {
  temple: Temple;
  score: number;
}

function scoreTemple(t: Temple, q: string, qTokens: Set<string>): number {
  let s = 0;
  const names = [t.name, ...t.aliases, t.mainDeity, ...t.deities, t.location, t.district, t.subUnit ?? "", t.type];
  for (const variant of alternate(q)) {
    const vc = canonical(variant);
    for (const n of names) {
      const nc = canonical(n);
      if (nc === vc) s += 120;
      else if (nc.startsWith(vc)) s += 70;
      else if (nc.includes(vc)) s += 40;
    }
  }
  const all = tokenSet([t.name, ...t.aliases, t.location, t.district, t.mainDeity, t.type].join(" "));
  let hits = 0;
  for (const qt of qTokens) if (all.has(qt)) hits++;
  s += hits * 12;
  if (tokens(t.location).some((l) => [...qTokens].some((q) => l.includes(q)))) s += 30;
  return s;
}

export interface SearchResults {
  temples: Temple[];
  locations: { label: string; sub: string; href: string }[];
  deities: { label: string; href: string; count: number }[];
  festivals: { label: string; temple: Temple; href: string }[];
}

export function search(q: string, limit = 8): SearchResults {
  const query = q.trim();
  if (!query) return { temples: [], locations: [], deities: [], festivals: [] };
  const qTokens = tokenSet(query);

  const scored: Scored[] = [];
  for (const t of TEMPLES) {
    const s = scoreTemple(t, query, qTokens);
    if (s > 0) scored.push({ temple: t, score: s });
  }
  scored.sort((a, b) => b.score - a.score);

  const locations = new Map<string, SearchResults["locations"][number]>();
  const addLocation = (label: string, sub: string, href: string) => {
    if ([...qTokens].some((qt) => canonical(label).includes(qt))) {
      locations.set(label, { label, sub, href });
    }
  };
  for (const t of TEMPLES.slice(0, 40)) {
    const state = getState(t.stateCode);
    if (!state) continue;
    addLocation(state.name, `${state.districts.length} districts`, `/explore/${state.slug}`);
    addLocation(t.district, `${state.name}`, `/explore/${state.slug}/${t.districtSlug}`);
    addLocation(t.location, `${t.district}, ${state.name}`, `/temples/${state.slug}/${t.slug}`);
  }

  const deityMap = new Map<string, { label: string; count: number }>();
  const festivals: SearchResults["festivals"] = [];
  for (const t of TEMPLES) {
    const state = getState(t.stateCode);
    const addDeity = (deity: string) => {
      if ([...qTokens].some((qt) => canonical(deity).includes(qt))) {
        const cur = deityMap.get(deity) ?? { label: deity, count: 0 };
        cur.count += 1;
        deityMap.set(deity, cur);
      }
    };
    for (const ali of [t.mainDeity, ...t.deities]) addDeity(ali);
    for (const f of t.festivals) {
      if (
        canonical(f.name).includes(canonical(query)) ||
        [...qTokens].some((qt) => canonical(f.name).includes(qt))
      ) {
        festivals.push({ label: f.name, temple: t, href: `/temples/${state?.slug}/${t.slug}#festivals` });
      }
    }
  }
  const deities = [...deityMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((d) => ({ label: d.label, count: d.count, href: `/temples?deity=${encodeURIComponent(d.label)}` }));

  return {
    temples: scored.slice(0, limit).map((s) => s.temple),
    locations: [...locations.values()].slice(0, 6),
    deities,
    festivals: festivals.slice(0, 6),
  };
}

export const isQueryAmbiguous = (q: string) => canonical(q).length < 2;