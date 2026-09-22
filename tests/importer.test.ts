import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { districtMnemonic, templeIdentifier } from "@/lib/importer/identifier";
import { buildImportPlan } from "@/lib/importer/location-import";
import { normalizeName, matchName } from "@/lib/importer/normalize";
import { parseLocationCsv, parseLocationJson, parseLocationData } from "@/lib/importer/parse";

describe("temple identifiers (spec §13)", () => {
  it("builds TEMPLE-IND-STATE-DISTRICT-SEQ form", () => {
    assert.equal(templeIdentifier("KA", "MYS", 123), "TEMPLE-IND-KA-MYS-000123");
    assert.equal(templeIdentifier("ka", "MYS", 1), "TEMPLE-IND-KA-MYS-000001");
  });

  it("derives stable district mnemonics", () => {
    assert.equal(districtMnemonic("Mysuru"), "MYS");
    assert.equal(districtMnemonic("Kolar Gold Fields"), "KOL");
    assert.equal(districtMnemonic("Sri Potti Sriramulu"), "POT");
  });
});

describe("normalize & parent matching", () => {
  it("normalises comparison keys", () => {
    assert.equal(normalizeName("  Mysuru & Co "), "mysuru and co");
    assert.equal(normalizeName(""), "");
  });

  it("matches by official code first", () => {
    const candidates = [{ code: "607", name: "Mysuru" }, { code: "608", name: "Chamarajanagara" }];
    assert.equal(matchName("607", "Anything", candidates)?.by, "code");
  });

  it("matches by name, then name with suffix stripped", () => {
    const candidates = [{ code: undefined, name: "Mysuru" }];
    assert.equal(matchName(undefined, "Mysuru", candidates)?.by, "name");
    assert.equal(matchName(undefined, "Mysuru Taluk", candidates)?.by, "name_stripped");
    assert.equal(matchName(undefined, "Mysuru Mandal", candidates)?.by, "name_stripped");
    assert.equal(matchName(undefined, "Coimbatore", candidates), undefined);
  });
});

describe("CSV/JSON parsing (§7)", () => {
  it("parses CSV with quoted cells and comments", () => {
    const csv = [
      "# header",
      'level,officialCode,name,parent,zone,adminUnitTerm,lat,lng',
      'state,29,Karnataka,,,Taluk,15.3173,75.7139',
      'district,581,"Mysuru",Karnataka,,,12.2958,76.6394',
    ].join("\n");
    const rows = parseLocationData(csv);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].level, "state");
    assert.equal(rows[0].adminUnitTerm, "Taluk");
    assert.equal(rows[1].parent, "Karnataka");
    assert.equal(rows[1].latitude, 12.2958);
  });

  it("parses JSON arrays and objects", () => {
    const arr = parseLocationJson(JSON.stringify([{ level: "state", officialCode: "28", name: "Delhi" }]));
    assert.equal(arr[0].name, "Delhi");
    const obj = parseLocationData(JSON.stringify({ locations: [{ level: "district", name: "New Delhi", parent: "28" }] }));
    assert.equal(obj[0].level, "district");
  });

  it("skips rows with invalid levels", () => {
    const rows = parseLocationCsv("type,name\ncontinent,Asia\nstate,India\n");
    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, "India");
  });
});

describe("buildImportPlan hierarchy construction", () => {
  const knownTerms = { "29": "Taluk", "28": "District" } as Record<string, string>;
  const rows = [
    { level: "state" as const, officialCode: "29", name: "Karnataka", adminUnitTerm: "Taluk", kind: "state" },
    { level: "district" as const, officialCode: "581", name: "Mysuru", parent: "29" },
    { level: "admin_unit" as const, officialCode: "58101", name: "Mysuru North", parent: "581", zone: "29" },
    { level: "locality" as const, name: "Tirumala Vasa", parent: "Mysuru North", zone: "581" },
  ];

  it("orders levels and attaches parents", () => {
    const plan = buildImportPlan(rows, { knownTerms });
    assert.equal(plan.stats.errors, 0);
    assert.equal(plan.stats.statesAdded, 1);
    assert.equal(plan.stats.districtsAdded, 1);
    assert.equal(plan.stats.adminUnitsAdded, 1);
    assert.equal(plan.stats.localitiesAdded, 1);
    assert.equal(plan.districts[0].stateCode, "29");
    assert.equal(plan.adminUnits[0].stateCode, "29");
    assert.equal(plan.adminUnits[0].type, "Taluk");
    assert.equal(plan.localities[0].adminUnitName, "Mysuru North");
  });

  it("dedupes duplicate names within a zone and upgrades with official codes", () => {
    const plan = buildImportPlan(
      [
        { level: "state" as const, name: "Delhi" },
        { level: "state" as const, name: "Delhi", officialCode: "28" },
        { level: "state" as const, name: "Delhi" },
      ],
      { knownTerms },
    );
    assert.equal(plan.states.length, 1);
    assert.equal(plan.stats.statesAdded, 1);
    assert.equal(plan.stats.statesUpdated, 1);
    assert.equal(plan.stats.duplicates, 1);
    assert.equal(plan.states[0].officialCode, "28");
  });

  it("records errors for unreferenced parents", () => {
    const plan = buildImportPlan([
      { level: "district" as const, name: "Ramanagara", parent: "ZZ" },
      { level: "locality" as const, name: "Channapatna", parent: "Mysuru", zone: "Ramanagara" },
    ]);
    assert.equal(plan.stats.errors, 2);
    assert.equal(plan.districts.length, 0);
    assert.equal(plan.localities.length, 0);
  });

  it("allows localities without an admin unit", () => {
    const plan = buildImportPlan([
      { level: "state" as const, officialCode: "29", name: "Karnataka" },
      { level: "district" as const, officialCode: "581", name: "Mysuru", parent: "29" },
      { level: "locality" as const, name: "Varuna", parent: "Mysuru", zone: "29" },
    ], { knownTerms });
    assert.equal(plan.stats.errors, 0);
    assert.equal(plan.localities[0].adminUnitName, undefined);
  });
});