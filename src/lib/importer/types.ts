export type LocationLevel = "state" | "district" | "admin_unit" | "locality";

export interface LocationRow {
  level: LocationLevel;
  /** Official administrative code (LGD/Census). Kept null until confirmed. */
  officialCode?: string;
  name: string;
  nameLocal?: string;
  /** Parent officialCode or name of the immediate parent record. */
  parent?: string;
  /** Disambiguation zone: state code for districts/admin units, district for localities. */
  zone?: string;
  /** "state" | "union_territory" | "village" | "town" | "city" */
  kind?: string;
  /** Override for the admin-unit term (e.g. "Mandal"); defaults to the state's term. */
  adminUnitTerm?: string;
  latitude?: number;
  longitude?: number;
  /** True when the row carries only a code/name correction for an existing record. */
  updateOnly?: boolean;
}

export interface ImportStats {
  statesAdded: number;
  statesUpdated: number;
  districtsAdded: number;
  districtsUpdated: number;
  adminUnitsAdded: number;
  adminUnitsUpdated: number;
  localitiesAdded: number;
  localitiesUpdated: number;
  duplicates: number;
  errors: number;
  warnings: string[];
}

export interface ImportPlan {
  states: PlannedState[];
  districts: PlannedDistrict[];
  adminUnits: PlannedAdminUnit[];
  localities: PlannedLocality[];
  stats: ImportStats;
}

export interface PlannedState {
  officialCode?: string;
  name: string;
  nameLocal?: string;
  kind?: string;
  adminUnitTerm: string;
}

export interface PlannedDistrict {
  officialCode?: string;
  name: string;
  nameLocal?: string;
  stateCode: string;
  latitude?: number;
  longitude?: number;
}

export interface PlannedAdminUnit {
  officialCode?: string;
  name: string;
  nameLocal?: string;
  type: string;
  stateCode: string;
  districtName: string;
  latitude?: number;
  longitude?: number;
}

export interface PlannedLocality {
  officialCode?: string;
  name: string;
  nameLocal?: string;
  kind?: string;
  stateCode: string;
  districtName: string;
  adminUnitName?: string;
  latitude?: number;
  longitude?: number;
}

export const DEFAULT_ADMIN_TERM = "Tehsil";