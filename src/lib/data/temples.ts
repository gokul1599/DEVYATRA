import { Temple } from "@/lib/types";
import { CORE_TEMPLES } from "./temples-core";
import { EXTRA_TEMPLES_1 } from "./temples-extra-1";
import { EXTRA_TEMPLES_2 } from "./temples-extra-2";

export const TEMPLES: Temple[] = [...CORE_TEMPLES, ...EXTRA_TEMPLES_1, ...EXTRA_TEMPLES_2];

export const TEMPLE_INDEX = new Map<string, Temple>();
for (const t of TEMPLES) {
  TEMPLE_INDEX.set(t.id, t);
  TEMPLE_INDEX.set(t.slug, t);
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");