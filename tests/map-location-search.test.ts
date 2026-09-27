import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  findLocationBoundary,
  getLocalityBoundary,
  getDistrictBoundary,
  getStateBoundary,
  POPULAR_LOCALITIES,
} from "@/lib/map/admin-boundaries";
import { VERIFIED_DESTINATIONS } from "@/lib/destinations/registry";
import { TEMPLES } from "@/lib/data/temples";

describe("Map Location Search — Village / Town / City Discovery", () => {
  it("resolves key temple towns and pilgrimage centers using findLocationBoundary", () => {
    const testCases = [
      { query: "Kanchipuram", expectedName: "Kanchipuram" },
      { query: "Udupi", expectedName: "Udupi" },
      { query: "Ganpatipule", expectedName: "Ganpatipule" },
      { query: "Varanasi", expectedName: "Varanasi" },
      { query: "Puri", expectedName: "Puri" },
      { query: "Hampi", expectedName: "Hampi" },
      { query: "Srirangam", expectedName: "Srirangam" },
      { query: "Alampur", expectedName: "Alampur" },
      { query: "Chidambaram", expectedName: "Chidambaram" },
      { query: "Palani", expectedName: "Palani" },
      { query: "Thanjavur", expectedName: "Thanjavur" },
      { query: "Kumbakonam", expectedName: "Kumbakonam" },
      { query: "Tirupati", expectedName: "Tirupati" },
      { query: "Gokarna", expectedName: "Gokarna" },
      { query: "Rishikesh", expectedName: "Rishikesh" },
      { query: "Vrindavan", expectedName: "Vrindavan" },
      { query: "Badrinath", expectedName: "Badrinath" },
      { query: "Kedarnath", expectedName: "Kedarnath" },
      { query: "Dwarka", expectedName: "Dwarka" },
      { query: "Somnath", expectedName: "Somnath" },
      { query: "Ayodhya", expectedName: "Ayodhya" },
      { query: "Shirdi", expectedName: "Shirdi" },
      { query: "Ponda", expectedName: "Ponda" },
      { query: "Kavlem", expectedName: "Kavlem" },
    ];

    for (const { query, expectedName } of testCases) {
      const boundary = findLocationBoundary(query);
      assert.ok(boundary, `Expected boundary to be found for '${query}'`);
      assert.ok(
        boundary.name.toLowerCase().includes(expectedName.toLowerCase()),
        `Expected boundary name '${boundary.name}' to include '${expectedName}'`
      );
      assert.ok(boundary.center.lat > 6 && boundary.center.lat < 38, `Valid latitude for '${query}'`);
      assert.ok(boundary.center.lng > 68 && boundary.center.lng < 98, `Valid longitude for '${query}'`);
      assert.ok(boundary.recommendedZoom >= 7, `Valid recommended zoom for '${query}'`);
    }
  });

  it("finds all temples situated in Kanchipuram across registry and database", () => {
    const kanchiDestinations = VERIFIED_DESTINATIONS.filter(
      (d) =>
        (d.city && d.city.toLowerCase().includes("kanchipuram")) ||
        d.district.toLowerCase().includes("kanchipuram") ||
        d.name.toLowerCase().includes("kanchipuram")
    );

    assert.ok(kanchiDestinations.length >= 3, `Expected at least 3 Kanchipuram destinations, found ${kanchiDestinations.length}`);
    const names = kanchiDestinations.map((d) => d.name);
    assert.ok(
      names.some((n) => n.includes("Varadaraja Perumal")),
      "Includes Varadaraja Perumal Temple"
    );
    assert.ok(
      names.some((n) => n.includes("Kamakshi Amman")),
      "Includes Kamakshi Amman Temple"
    );
    assert.ok(
      names.some((n) => n.includes("Ekambareswarar")),
      "Includes Ekambareswarar Temple"
    );
  });

  it("finds all temples and places in Udupi", () => {
    const udupiDestinations = VERIFIED_DESTINATIONS.filter(
      (d) =>
        (d.city && d.city.toLowerCase().includes("udupi")) ||
        d.district.toLowerCase().includes("udupi") ||
        d.name.toLowerCase().includes("udupi")
    );

    assert.ok(udupiDestinations.length >= 2, `Expected at least 2 Udupi destinations, found ${udupiDestinations.length}`);
    const names = udupiDestinations.map((d) => d.name);
    assert.ok(
      names.some((n) => n.includes("Krishna") || n.includes("Udupi")),
      "Includes Udupi Sri Krishna Matha"
    );
  });

  it("finds Ganpatipule temple and beach when searching Ganpatipule", () => {
    const ganpatipulePlaces = VERIFIED_DESTINATIONS.filter(
      (d) =>
        (d.city && d.city.toLowerCase().includes("ganpatipule")) ||
        d.name.toLowerCase().includes("ganpatipule")
    );

    assert.ok(ganpatipulePlaces.length >= 1, `Expected at least 1 Ganpatipule place, found ${ganpatipulePlaces.length}`);
    assert.ok(
      ganpatipulePlaces.some((p) => p.name.includes("Ganpati")),
      "Includes Swayambhu Ganpati Temple"
    );
  });

  it("finds Vrindavan temples when searching Vrindavan", () => {
    const vrindavanPlaces = VERIFIED_DESTINATIONS.filter(
      (d) =>
        (d.city && d.city.toLowerCase().includes("vrindavan")) ||
        d.name.toLowerCase().includes("vrindavan")
    );

    assert.ok(vrindavanPlaces.length >= 2, `Expected at least 2 Vrindavan temples, found ${vrindavanPlaces.length}`);
    const names = vrindavanPlaces.map((p) => p.name);
    assert.ok(
      names.some((n) => n.includes("Banke Bihari") || n.includes("Prem Mandir")),
      "Includes famous Vrindavan temples"
    );
  });

  it("finds Hampi monuments and temples when searching Hampi", () => {
    const hampiPlaces = VERIFIED_DESTINATIONS.filter(
      (d) =>
        (d.city && d.city.toLowerCase().includes("hampi")) ||
        d.district.toLowerCase().includes("vijayanagara") ||
        d.name.toLowerCase().includes("hampi")
    );

    assert.ok(hampiPlaces.length >= 2, `Expected at least 2 Hampi places, found ${hampiPlaces.length}`);
    const names = hampiPlaces.map((p) => p.name);
    assert.ok(
      names.some((n) => n.includes("Virupaksha") || n.includes("Vittala") || n.includes("Hampi")),
      "Includes Hampi temples/monuments"
    );
  });

  it("finds Puri temples when searching Puri", () => {
    const puriPlaces = VERIFIED_DESTINATIONS.filter(
      (d) =>
        (d.city && d.city.toLowerCase().includes("puri")) ||
        d.district.toLowerCase().includes("puri") ||
        d.name.toLowerCase().includes("puri")
    );

    assert.ok(puriPlaces.length >= 2, `Expected at least 2 Puri destinations, found ${puriPlaces.length}`);
    const names = puriPlaces.map((p) => p.name);
    assert.ok(
      names.some((n) => n.includes("Jagannath") || n.includes("Puri")),
      "Includes Jagannath Temple Puri"
    );
  });

  it("finds Varanasi and Kashi temples when searching Varanasi", () => {
    const varanasiPlaces = VERIFIED_DESTINATIONS.filter(
      (d) =>
        (d.city && d.city.toLowerCase().includes("varanasi")) ||
        d.district.toLowerCase().includes("varanasi") ||
        d.name.toLowerCase().includes("varanasi")
    );

    assert.ok(varanasiPlaces.length >= 2, `Expected at least 2 Varanasi destinations, found ${varanasiPlaces.length}`);
    const names = varanasiPlaces.map((p) => p.name);
    assert.ok(
      names.some((n) => n.includes("Bhairav") || n.includes("Vishwanath") || n.includes("Ghat")),
      "Includes Varanasi temples/destinations"
    );
  });

  it("finds Warangal temples when searching Warangal", () => {
    const warangalPlaces = VERIFIED_DESTINATIONS.filter(
      (d) =>
        (d.city && d.city.toLowerCase().includes("warangal")) ||
        d.district.toLowerCase().includes("warangal") ||
        d.name.toLowerCase().includes("warangal")
    );

    assert.ok(warangalPlaces.length >= 1, `Expected at least 1 Warangal destination, found ${warangalPlaces.length}`);
    const names = warangalPlaces.map((p) => p.name);
    assert.ok(
      names.some((n) => n.includes("Bhadrakali") || n.includes("Warangal")),
      "Includes Bhadrakali Temple Warangal"
    );
  });

  it("finds Goa temples when searching Kavlem", () => {
    const kavlemPlaces = VERIFIED_DESTINATIONS.filter(
      (d) =>
        (d.city && d.city.toLowerCase().includes("kavlem")) ||
        d.name.toLowerCase().includes("kavlem")
    );

    assert.ok(kavlemPlaces.length >= 1, `Expected at least 1 Kavlem destination, found ${kavlemPlaces.length}`);
    const names = kavlemPlaces.map((p) => p.name);
    assert.ok(
      names.some((n) => n.includes("Shantadurga")),
      "Includes Shri Shantadurga Temple Kavlem"
    );
  });
});
