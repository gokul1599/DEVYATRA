import {
  DEFAULT_ADMIN_TERM,
  ImportPlan,
  ImportStats,
  LocationRow,
  PlannedAdminUnit,
  PlannedDistrict,
  PlannedLocality,
  PlannedState,
} from "./types";
import { isValidLevel, matchName, normalizeName } from "./normalize";

export function emptyStats(): ImportStats {
  return {
    statesAdded: 0,
    statesUpdated: 0,
    districtsAdded: 0,
    districtsUpdated: 0,
    adminUnitsAdded: 0,
    adminUnitsUpdated: 0,
    localitiesAdded: 0,
    localitiesUpdated: 0,
    duplicates: 0,
    errors: 0,
    warnings: [],
  };
}

/**
 * Build an ordered, deduplicated import plan from raw location rows.
 *
 * Parent matching (spec §6, §8): rows identify parents by official code first,
 * then by normalised name, then name-with-suffix stripped. Duplicates within a
 * zone are merged — the first row creates the record, later rows may upgrade it
 * with an official code or local name.
 */
export function buildImportPlan(
  rows: LocationRow[],
  opts: { knownTerms?: Record<string, string> } = {},
): ImportPlan {
  const stats = emptyStats();
  const states: PlannedState[] = [];
  const districts: PlannedDistrict[] = [];
  const adminUnits: PlannedAdminUnit[] = [];
  const localities: PlannedLocality[] = [];

  const byLevel = { state: [] as LocationRow[], district: [] as LocationRow[], admin_unit: [] as LocationRow[], locality: [] as LocationRow[] };
  for (const row of rows) {
    if (!isValidLevel(row.level)) {
      stats.errors += 1;
      stats.warnings.push(`Invalid level "${String(row.level)}" for row "${row.name}"`);
      continue;
    }
    if (!row.name || !row.name.trim()) {
      stats.errors += 1;
      stats.warnings.push(`Missing name for ${row.level} row`);
      continue;
    }
    byLevel[row.level].push(row);
  }

  const stateKeyOf = (s: PlannedState): string => s.officialCode ?? `name:${normalizeName(s.name)}`;

  const termForState = (state: PlannedState, fallback: string | undefined): string => {
    const byCode = state.officialCode ? opts.knownTerms?.[state.officialCode] : undefined;
    const byName = opts.knownTerms?.[normalizeName(state.name)];
    return byCode || byName || fallback || DEFAULT_ADMIN_TERM;
  };

  // States
  for (const row of byLevel.state) {
    const hit = matchName(row.officialCode, row.name, states.map((s) => ({ code: s.officialCode, name: s.name })));
    if (hit) {
      const s = states[hit.index];
      let changed = false;
      if (row.officialCode && s.officialCode !== row.officialCode) {
        s.officialCode = row.officialCode;
        changed = true;
      }
      if (row.nameLocal && s.nameLocal !== row.nameLocal) {
        s.nameLocal = row.nameLocal;
        changed = true;
      }
      if (changed) stats.statesUpdated += 1;
      else stats.duplicates += 1;
      continue;
    }
    states.push({ officialCode: row.officialCode, name: row.name.trim(), nameLocal: row.nameLocal, kind: row.kind, adminUnitTerm: row.adminUnitTerm || DEFAULT_ADMIN_TERM });
    stats.statesAdded += 1;
  }

  // Districts (parent = state, matched via zone or official code)
  for (const row of byLevel.district) {
    const stateKey = row.zone ? normalizeName(row.zone) : row.parent ? normalizeName(row.parent) : "";
    const stateIndex = matchName(stateKey.toUpperCase(), stateKey, states.map((s) => ({ code: s.officialCode, name: s.name })))?.index;
    const parentState = stateIndex === undefined ? undefined : states[stateIndex];
    if (!parentState) {
      stats.errors += 1;
      stats.warnings.push(`District "${row.name}" has no matching state (zone "${row.zone ?? row.parent ?? ""}")`);
      continue;
    }
    const sk = stateKeyOf(parentState);
    const scope = districts.filter((d) => d.stateCode === sk);
    const hit = matchName(row.officialCode, row.name, scope.map((d) => ({ code: d.officialCode, name: d.name })));
    if (hit) {
      const target = scope[hit.index];
      let changed = false;
      if (row.officialCode && target.officialCode !== row.officialCode) {
        target.officialCode = row.officialCode;
        changed = true;
      }
      if (row.nameLocal && target.nameLocal !== row.nameLocal) {
        target.nameLocal = row.nameLocal;
        changed = true;
      }
      if (row.latitude !== undefined) target.latitude = row.latitude;
      if (row.longitude !== undefined) target.longitude = row.longitude;
      if (changed) stats.districtsUpdated += 1;
      else stats.duplicates += 1;
      continue;
    }
    districts.push({ officialCode: row.officialCode, name: row.name.trim(), nameLocal: row.nameLocal, stateCode: sk, latitude: row.latitude, longitude: row.longitude });
    stats.districtsAdded += 1;
  }

  // Admin units (parent = district, zone = state)
  for (const row of byLevel.admin_unit) {
    const stateKey = row.zone || "";
    const stateIndex = matchName(stateKey.toUpperCase(), stateKey, states.map((s) => ({ code: s.officialCode, name: s.name })))?.index;
    const parentState = stateIndex === undefined ? undefined : states[stateIndex];
    if (!parentState) {
      stats.errors += 1;
      stats.warnings.push(`Admin unit "${row.name}" has no matching state (zone "${row.zone ?? ""}")`);
      continue;
    }
    const sk = stateKeyOf(parentState);
    const districtIndex = matchName(row.parent, row.parent, districts.filter((x) => x.stateCode === sk).map((x) => ({ code: x.officialCode, name: x.name })))?.index;
    const parentDistrict = districtIndex === undefined ? undefined : districts.filter((x) => x.stateCode === sk)[districtIndex];
    if (!parentDistrict) {
      stats.errors += 1;
      stats.warnings.push(`Admin unit "${row.name}" has no matching district in ${parentState.name}`);
      continue;
    }
    const scope = adminUnits.filter((a) => a.districtName === parentDistrict.name && a.stateCode === parentDistrict.stateCode);
    const hit = matchName(row.officialCode, row.name, scope.map((a) => ({ code: a.officialCode, name: a.name })));
    if (hit) {
      const target = scope[hit.index];
      let changed = false;
      if (row.officialCode && target.officialCode !== row.officialCode) {
        target.officialCode = row.officialCode;
        changed = true;
      }
      if (row.nameLocal && target.nameLocal !== row.nameLocal) {
        target.nameLocal = row.nameLocal;
        changed = true;
      }
      if (row.latitude !== undefined) target.latitude = row.latitude;
      if (row.longitude !== undefined) target.longitude = row.longitude;
      if (changed) stats.adminUnitsUpdated += 1;
      else stats.duplicates += 1;
      continue;
    }
    adminUnits.push({
      officialCode: row.officialCode,
      name: row.name.trim(),
      nameLocal: row.nameLocal,
      type: termForState(parentState, row.adminUnitTerm) || row.adminUnitTerm || DEFAULT_ADMIN_TERM,
      stateCode: parentDistrict.stateCode,
      districtName: parentDistrict.name,
      latitude: row.latitude,
      longitude: row.longitude,
    });
    stats.adminUnitsAdded += 1;
  }

  // Localities — zone identifies the district (name or code); parent names the
  // admin unit, or the district itself when there is no admin unit.
  for (const row of byLevel.locality) {
    // 1. Resolve the district: prefer zone, fall back to parent.
    const zHit = row.zone ? matchName(row.zone, row.zone, districts.map((d) => ({ code: d.officialCode, name: d.name }))) : undefined;
    const pHit = row.parent ? matchName(row.parent, row.parent, districts.map((d) => ({ code: d.officialCode, name: d.name }))) : undefined;
    const parentDistrict = zHit ? districts[zHit.index] : pHit ? districts[pHit.index] : undefined;
    if (!parentDistrict) {
      stats.errors += 1;
      stats.warnings.push(`Locality "${row.name}" has no matching district${row.zone ? ` (zone "${row.zone}")` : ""}`);
      continue;
    }
    // 2. Distinguish an admin-unit parent from the district itself.
    const parentIsDistrict =
      row.parent !== undefined && (row.parent === parentDistrict.officialCode || normalizeName(row.parent) === normalizeName(parentDistrict.name));
    const adminUnitName = row.parent && !parentIsDistrict ? row.parent : undefined;
    let parentAdminUnit: PlannedAdminUnit | undefined;
    if (adminUnitName) {
      const auIndex = matchName(adminUnitName, adminUnitName, adminUnits.filter((a) => a.districtName === parentDistrict.name && a.stateCode === parentDistrict.stateCode).map((a) => ({ code: a.officialCode, name: a.name })))?.index;
      parentAdminUnit = auIndex === undefined ? undefined : adminUnits.filter((a) => a.districtName === parentDistrict.name && a.stateCode === parentDistrict.stateCode)[auIndex];
      if (!parentAdminUnit) {
        stats.errors += 1;
        stats.warnings.push(`Locality "${row.name}" names admin unit "${adminUnitName}" that is not in the plan`);
        continue;
      }
    }
    const scope = localities.filter((l) => l.districtName === parentDistrict.name && (parentAdminUnit ? l.adminUnitName === parentAdminUnit.name : !l.adminUnitName));
    const hit = matchName(row.officialCode, row.name, scope.map((l) => ({ code: l.officialCode, name: l.name })));
    if (hit) {
      const target = scope[hit.index];
      let changed = false;
      if (row.officialCode && target.officialCode !== row.officialCode) {
        target.officialCode = row.officialCode;
        changed = true;
      }
      if (row.nameLocal && target.nameLocal !== row.nameLocal) {
        target.nameLocal = row.nameLocal;
        changed = true;
      }
      if (row.latitude !== undefined) target.latitude = row.latitude;
      if (row.longitude !== undefined) target.longitude = row.longitude;
      if (changed) stats.localitiesUpdated += 1;
      else stats.duplicates += 1;
      continue;
    }
    localities.push({
      officialCode: row.officialCode,
      name: row.name.trim(),
      nameLocal: row.nameLocal,
      kind: row.kind || "town",
      stateCode: parentDistrict.stateCode,
      districtName: parentDistrict.name,
      adminUnitName: parentAdminUnit?.name,
      latitude: row.latitude,
      longitude: row.longitude,
    });
    stats.localitiesAdded += 1;
  }

  return { states, districts, adminUnits, localities, stats };
}