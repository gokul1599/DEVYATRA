import test from "node:test";
import assert from "node:assert/strict";
import {
  resolvePrimaryTempleMedia,
  resolveDestinationMedia,
} from "../src/lib/images/resolver";
import { getCategoryVisual, MAP_CATEGORIES } from "../src/lib/map/categories";
import { VERIFIED_DESTINATIONS } from "../src/lib/destinations/registry";

test("Image Resolver — GOOGLE_PLACES Provenance Fix (§29)", () => {
  const templeWithGooglePlace = {
    slug: "somnath-temple",
    name: "Somnath Jyotirlinga",
    media: [
      {
        id: "media-gp-1",
        kind: "PHOTO",
        sourceType: "GOOGLE_PLACES",
        publicUrl: "https://lh3.googleusercontent.com/p/AF1QipNxyz",
        authorName: "Ramesh Sharma",
        googleMapsUrl: "https://maps.google.com/?cid=123",
        isPrimary: true,
        isApproved: true,
        isFactual: true,
      },
    ],
  };

  const resolved = resolvePrimaryTempleMedia(templeWithGooglePlace);
  assert.equal(resolved.hasFactualPhoto, true);
  assert.equal(resolved.src, "https://lh3.googleusercontent.com/p/AF1QipNxyz");
  // Strict test: Must NOT be mapped to UNSPLASH_LICENSE
  assert.equal(
    resolved.rights,
    "GOOGLE_PLACES_ATTRIBUTION",
    "GOOGLE_PLACES media must be mapped to GOOGLE_PLACES_ATTRIBUTION, not UNSPLASH_LICENSE"
  );
  assert.equal(resolved.credit, "Ramesh Sharma");
});

test("Image Resolver — Universal Destination Media Resolver (§28, §30)", () => {
  const hampi = VERIFIED_DESTINATIONS.find((d) => d.slug === "hampi-group-of-monuments");
  assert.ok(hampi, "Hampi monument should exist in VERIFIED_DESTINATIONS");

  const resolved = resolveDestinationMedia(hampi);
  assert.equal(resolved.hasFactualPhoto, true);
  assert.ok(resolved.src?.startsWith("http"), "Should resolve valid image source");
  assert.ok(resolved.alt.includes("Hampi"), "Alt text should reference destination name");
  assert.equal(resolved.verificationStatus, "VERIFIED");
});

test("Map Explorer — Multi-Category Visual Identity (§13, §16)", () => {
  assert.ok(MAP_CATEGORIES.length >= 10, "Should define at least 10 destination categories");

  const heritage = getCategoryVisual("HERITAGE");
  assert.equal(heritage.color, "#D97706");
  assert.equal(heritage.iconName, "Landmark");

  const nature = getCategoryVisual("NATURE");
  assert.equal(nature.color, "#10B981");
  assert.equal(nature.iconName, "Trees");

  const beaches = getCategoryVisual("BEACHES");
  assert.equal(beaches.color, "#0284C7");
  assert.equal(beaches.iconName, "Waves");

  const food = getCategoryVisual("FOOD");
  assert.equal(food.color, "#E11D48");
  assert.equal(food.iconName, "UtensilsCrossed");

  const sacred = getCategoryVisual("SACRED");
  assert.equal(sacred.color, "#F59E0B");
  assert.equal(sacred.iconName, "Sparkles");
});
