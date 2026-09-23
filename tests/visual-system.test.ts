import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  SECTION_THEMES,
  getSectionTheme,
  type SectionTheme,
} from "../src/lib/theme/cinematic-tokens";
import {
  AUTHENTIC_IMAGE_REGISTRY,
  REGIONAL_LANDSCAPES,
  getTempleImage,
} from "../src/lib/images/registry";
import {
  CANONICAL_ELEMENTS,
} from "../src/lib/architecture/canonical-model";

describe("V2.5 — Premium Cinematic Visual Experience & Design Tokens", () => {
  test("defines all 8 canonical section color environments", () => {
    const requiredSections: SectionTheme[] = [
      "hero",
      "explore",
      "architecture",
      "famous",
      "map",
      "festivals",
      "journey",
      "trust",
    ];

    for (const sec of requiredSections) {
      const theme = SECTION_THEMES[sec];
      assert.ok(theme, `Section environment "${sec}" must be configured`);
      assert.ok(theme.name, `Section "${sec}" must have a name`);
      assert.ok(theme.bgClass, `Section "${sec}" must have a bgClass`);
      assert.ok(theme.borderClass, `Section "${sec}" must have a borderClass`);
      assert.ok(theme.accentTextClass, `Section "${sec}" must have an accentTextClass`);
      assert.ok(theme.glowClass, `Section "${sec}" must have a glowClass`);
      assert.ok(theme.gradientOverlay, `Section "${sec}" must have a gradientOverlay`);
    }
  });

  test("getSectionTheme returns configured theme and falls back safely", () => {
    const hero = getSectionTheme("hero");
    assert.equal(hero.name, "Sacred Gold & Night");
    assert.ok(hero.accentTextClass.includes("gold-bright"));

    const fallback = getSectionTheme("non-existent-section" as SectionTheme);
    assert.equal(fallback.name, "Sacred Gold & Night");
  });

  test("maintains authentic photo registry with zero hallucinated imagery", () => {
    assert.ok(Object.keys(AUTHENTIC_IMAGE_REGISTRY).length >= 7, "Registry must contain curated images");
    // Check known iconic temples
    const iconicSlugs = [
      "sri-venkateswara-temple",
      "kashi-vishwanath-temple",
      "meenakshi-amman-temple",
      "jagannath-temple-puri",
      "kedarnath-temple",
      "somnath-temple",
      "brihadeeswarar-temple",
    ];

    for (const slug of iconicSlugs) {
      const record = getTempleImage(slug);
      assert.ok(record, `Iconic temple "${slug}" must have an authentic image record`);
      assert.ok(record.src.startsWith("https://"), "Image source must be secure HTTPS");
      assert.ok(record.rights, "Image must have explicit rights declaration");
      assert.ok(
        ["PUBLIC_DOMAIN", "CREATIVE_COMMONS", "UNSPLASH_LICENSE"].includes(record.rights),
        `Image rights "${record.rights}" must be an authentic recognized license`
      );
      assert.ok(record.credit.length > 0, "Attribution credit must be declared");
    }

    // Zero-hallucination check: unknown temple returns null so it falls back to DevyatraArt
    const unknown = getTempleImage("unknown-fake-temple-123");
    assert.equal(unknown, null, "Unverified shrines must not have invented images");
  });

  test("contains all 6 macro regional landscapes with verified licensing", () => {
    const requiredRegions = ["north", "south", "east", "west", "central", "northeast"];
    const declaredRegions = REGIONAL_LANDSCAPES.map((r) => r.regionId);

    for (const r of requiredRegions) {
      assert.ok(declaredRegions.includes(r), `Regional landscape for "${r}" must exist`);
      const landscape = REGIONAL_LANDSCAPES.find((l) => l.regionId === r)!;
      assert.ok(landscape.name.length > 0);
      assert.ok(landscape.keyStates.length > 0, `Region "${r}" must list key states`);
      assert.ok(landscape.image.rights, `Region "${r}" image must declare licensing rights`);
    }
  });

  test("validates 3D temple architectural anatomy elements and depth ordering", () => {
    assert.ok(CANONICAL_ELEMENTS.length >= 6, "Must define at least 6 canonical architectural elements");

    const requiredIds = ["gopuram", "mandapa", "antarala", "garbhagriha", "shikhara", "prakara"];
    const foundIds = CANONICAL_ELEMENTS.map((el) => el.id);

    for (const req of requiredIds) {
      assert.ok(foundIds.includes(req), `Element "${req}" must be in the canonical architectural model`);
    }

    // Garbhagriha must be Tier 4 and have Sanskrit name
    const sanctum = CANONICAL_ELEMENTS.find((el) => el.id === "garbhagriha")!;
    assert.equal(sanctum.depthTier, 4);
    assert.equal(sanctum.sanskritName, "गर्भगृह");
    assert.ok(sanctum.significance.length > 20, "Sanctum must have metaphysical significance documented");

    // Shikhara / Vimana crowns the sanctum (Tier 5)
    const tower = CANONICAL_ELEMENTS.find((el) => el.id === "shikhara")!;
    assert.equal(tower.depthTier, 5);
    assert.ok(tower.coordinates.y > sanctum.coordinates.y, "Tower must ascend skyward above sanctum");
  });

  test("resolves authentic multi-photo galleries with verified licensing", async () => {
    const { getTempleGallery } = await import("../src/lib/images/registry");
    const tirupatiGallery = getTempleGallery("sri-venkateswara-temple");
    assert.ok(tirupatiGallery.length >= 3, "Tirupati must have at least 3 curated gallery images");

    for (const img of tirupatiGallery) {
      assert.ok(img.src.startsWith("https://"), "Gallery image source must be secure HTTPS");
      assert.ok(img.rights, "Gallery image must have declared rights");
      assert.ok(img.credit.length > 0, "Gallery image must have attribution credit");
      assert.ok(img.caption && img.caption.length > 0, "Gallery image must have educational caption");
    }

    // Zero-hallucination check: non-existent temple returns empty gallery array
    const emptyGallery = getTempleGallery("non-existent-temple");
    assert.deepEqual(emptyGallery, []);
  });

  test("classifies temple architectural traditions and verifies Shilpa Shastra models", async () => {
    const { getTraditionFromArchitecture, TRADITION_DETAILS } = await import(
      "../src/lib/architecture/canonical-model"
    );

    assert.equal(getTraditionFromArchitecture("Dravidian Architecture"), "DRAVIDIAN");
    assert.equal(getTraditionFromArchitecture("Nagara Style"), "NAGARA");
    assert.equal(getTraditionFromArchitecture("Kalinga Rekha Deul"), "KALINGA");
    assert.equal(getTraditionFromArchitecture("Hoysala Vesara"), "VESARA");
    assert.equal(getTraditionFromArchitecture(undefined), "DRAVIDIAN");

    const traditions = ["DRAVIDIAN", "NAGARA", "KALINGA", "VESARA"] as const;
    for (const t of traditions) {
      const details = TRADITION_DETAILS[t];
      assert.ok(details, `Tradition details for "${t}" must be defined`);
      assert.ok(details.name.length > 0);
      assert.ok(details.sanskritName.length > 0, `Tradition "${t}" must include Sanskrit designation`);
      assert.ok(details.superstructure.length > 0);
      assert.ok(details.notableExamples.length >= 2, `Tradition "${t}" must list iconic shrines`);
    }
  });
});
