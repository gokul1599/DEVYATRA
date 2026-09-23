import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  isGenuineGooglePlaceId,
  calculateNameSimilarity,
  evaluateCandidate,
  pickBestCandidate,
} from "../src/lib/images/place-matcher";
import {
  buildPhotoProxyUrl,
  resolveGooglePlacePhotos,
} from "../src/lib/images/photo-resolver";
import { resolvePrimaryTempleMedia } from "../src/lib/images/resolver";

describe("Temple Image Engine — Google Place ID & Candidate Matcher", () => {
  test("strictly validates genuine Google Place IDs and rejects synthetic/corrupted IDs", () => {
    // Valid ChIJ IDs
    assert.equal(isGenuineGooglePlaceId("ChIJ2-VjU3X4wzsR25a2W41qjQY"), true);
    assert.equal(isGenuineGooglePlaceId("ChIJb92-rE74wzsR25a2W41qjQY"), true);
    assert.equal(isGenuineGooglePlaceId("ChIJU1234567890abcdefABCDEF"), true);

    // ASI Monument IDs (corrupted into place IDs in legacy imports)
    assert.equal(isGenuineGooglePlaceId("ASI_N_KA_B82"), false);
    assert.equal(isGenuineGooglePlaceId("ASI_S_TN_001"), false);

    // Empty or malformed IDs
    assert.equal(isGenuineGooglePlaceId(""), false);
    assert.equal(isGenuineGooglePlaceId("place_12345"), false);
    assert.equal(isGenuineGooglePlaceId("ChIJ123"), false); // too short
  });

  test("calculates token-based name similarity correctly", () => {
    const sim1 = calculateNameSimilarity(
      "Meenakshi Sundareshwarar Temple",
      "Arulmigu Meenakshi Amman Temple"
    );
    assert.ok(sim1 > 0.4, `Expected similarity > 0.4, got ${sim1}`);

    const sim2 = calculateNameSimilarity(
      "Somnath Jyotirlinga Temple",
      "Somnath Railway Station"
    );
    assert.ok(sim2 < 0.6, `Expected similarity < 0.6, got ${sim2}`);

    const simExact = calculateNameSimilarity(
      "Kedarnath Temple",
      "Kedarnath Temple"
    );
    assert.equal(simExact, 1.0);
  });

  test("rejects commercial and non-sacred Google Place types", () => {
    const hotelCandidate = {
      id: "ChIJ2-VjU3X4wzsR25a2W41qjQY",
      displayName: { text: "Meenakshi Grand Luxury Hotel", languageCode: "en" },
      types: ["lodging", "hotel"],
      location: { latitude: 9.9195, longitude: 78.1193 },
    };

    const result = evaluateCandidate(
      {
        name: "Meenakshi Temple",
        latitude: 9.9195,
        longitude: 78.1193,
        state: "Tamil Nadu",
      },
      hotelCandidate
    );

    assert.equal(result.confidence, "REJECTED");
    assert.ok(result.rejectionReason?.includes("Candidate contains disallowed type"));
  });

  test("classifies exact and strong sacred matches within spatial proximity", () => {
    const validCandidate = {
      id: "ChIJ2-VjU3X4wzsR25a2W41qjQY",
      displayName: { text: "Arulmigu Meenakshi Amman Temple", languageCode: "en" },
      types: ["hindu_temple", "place_of_worship"],
      location: { latitude: 9.9195, longitude: 78.1193 },
    };

    const result = evaluateCandidate(
      {
        name: "Meenakshi Amman Temple",
        latitude: 9.9195,
        longitude: 78.1193,
        state: "Tamil Nadu",
      },
      validCandidate
    );

    assert.ok(result.confidence === "EXACT_MATCH" || result.confidence === "STRONG_MATCH");
    assert.ok(result.distanceKm !== null && result.distanceKm < 0.5);
  });

  test("picks the best candidate from a list based on confidence rank", () => {
    const target = {
      name: "Meenakshi Amman Temple",
      latitude: 9.9195,
      longitude: 78.1193,
      state: "Tamil Nadu",
    };

    const candidates = [
      {
        id: "ChIJrestaurant12345678901234",
        displayName: { text: "Meenakshi Restaurant" },
        types: ["restaurant"],
        location: { latitude: 9.9195, longitude: 78.1193 },
      },
      {
        id: "ChIJ2-VjU3X4wzsR25a2W41qjQY",
        displayName: { text: "Meenakshi Amman Temple" },
        types: ["hindu_temple"],
        location: { latitude: 9.9195, longitude: 78.1193 },
      },
    ];

    const best = pickBestCandidate(target, candidates);
    assert.ok(best !== null);
    assert.equal(best?.candidate.id, "ChIJ2-VjU3X4wzsR25a2W41qjQY");
    assert.equal(best?.confidence, "EXACT_MATCH");
  });
});

describe("Temple Image Engine — Photo Resolver & Live Proxy", () => {
  test("constructs policy-compliant live proxy URLs with author attributions", () => {
    const mockGooglePhotos = [
      {
        name: "places/ChIJ2-VjU3X4wzsR25a2W41qjQY/photos/AU3yTZV123abc",
        widthPx: 4000,
        heightPx: 3000,
        authorAttributions: [
          {
            displayName: "Devotee Photographer",
            uri: "https://maps.google.com/contrib/123",
            photoUri: "https://lh3.googleusercontent.com/a/photo",
          },
        ],
      },
    ];

    const resolved = resolveGooglePlacePhotos(mockGooglePhotos, {
      maxHeight: 1200,
      googleMapsUri: "https://maps.google.com/?cid=123",
    });

    assert.equal(resolved.length, 1);
    assert.ok(resolved[0].proxyUrl.startsWith("/api/places/photo?name="));
    assert.equal(resolved[0].authorName, "Devotee Photographer");
    assert.equal(resolved[0].authorUrl, "https://maps.google.com/contrib/123");
    assert.ok(resolved[0].attributionHtml?.includes("Devotee Photographer"));
    assert.ok(resolved[0].attributionHtml?.includes("Google Maps"));
    assert.equal(resolved[0].isPrimary, true);
  });

  test("builds safe proxy URL with encoded photo resource name", () => {
    const url = buildPhotoProxyUrl("places/test/photos/123", 800);
    assert.equal(url, "/api/places/photo?name=places%2Ftest%2Fphotos%2F123&h=800");
  });
});

describe("Temple Image Engine — Canonical Primary Media Resolution", () => {
  test("prioritizes approved TempleMedia over curated landmark registry", () => {
    const templeWithMedia = {
      id: "t-1",
      slug: "test-shrine",
      name: "Test Shrine",
      stateCode: "TN",
      media: [
        {
          id: "m-1",
          kind: "PHOTO",
          publicUrl: "https://cdn.example.com/verified-shrine.jpg",
          sourceType: "OFFICIAL",
          sourceName: "Temple Administration",
          authorName: "Temple Administration",
          authorUrl: "https://temple.org",
          isPrimary: true,
          isApproved: true,
          caption: "Sanctum tower",
        },
      ],
    };

    const resolved = resolvePrimaryTempleMedia(templeWithMedia);
    assert.equal(resolved.src, "https://cdn.example.com/verified-shrine.jpg");
    assert.equal(resolved.sourceType, "OFFICIAL");
    assert.equal(resolved.hasFactualPhoto, true);
    assert.equal(resolved.verificationStatus, "VERIFIED");
  });

  test("falls back to curated landmark registry when no TempleMedia exists", () => {
    const templeInLandmarks = {
      id: "t-2",
      slug: "sri-venkateswara-temple",
      name: "Sri Venkateswara Temple",
      media: [],
    };

    const resolved = resolvePrimaryTempleMedia(templeInLandmarks);
    assert.equal(resolved.hasFactualPhoto, true);
    assert.equal(resolved.verificationStatus, "VERIFIED");
    assert.equal(resolved.sourceType, "CURATED");
    assert.ok(resolved.src?.includes("unsplash.com"));
  });

  test("returns explicit PENDING_VERIFICATION artistic representation fallback when no factual image exists", () => {
    const obscureTemple = {
      id: "t-999",
      slug: "obscure-remote-grama-kovil-999999",
      name: "Village Grama Devata Kovil",
      media: [],
    };

    const resolved = resolvePrimaryTempleMedia(obscureTemple);
    assert.equal(resolved.hasFactualPhoto, false);
    assert.equal(resolved.verificationStatus, "PENDING_VERIFICATION");
    assert.equal(resolved.src, null);
    assert.equal(resolved.sourceType, "NONE");
  });
});
