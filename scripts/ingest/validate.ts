import type { RawPlaceInput, ValidationResult, ValidationIssue } from "./types";

export const OFFICIAL_INDIAN_STATES_AND_UTS = new Set([
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
]);

export function validatePlaceRecord(place: RawPlaceInput): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Mandatory Identity Checks
  if (!place.slug || !/^[a-z0-9-]+$/.test(place.slug)) {
    issues.push({
      field: "slug",
      message: `Invalid slug format '${place.slug}'. Must be lower-case alphanumeric with hyphens.`,
      severity: "CRITICAL"
    });
  }

  if (!place.name || place.name.trim().length < 2) {
    issues.push({
      field: "name",
      message: "Place name is missing or too short.",
      severity: "CRITICAL"
    });
  }

  if (!place.description || place.description.trim().length < 15) {
    issues.push({
      field: "description",
      message: "Place description is missing or too brief.",
      severity: "HIGH"
    });
  }

  // 2. Sovereign Geolocation Validation
  if (typeof place.latitude !== "number" || isNaN(place.latitude) || typeof place.longitude !== "number" || isNaN(place.longitude)) {
    issues.push({
      field: "coordinates",
      message: "Latitude or longitude is not a valid number.",
      severity: "CRITICAL"
    });
  } else {
    // Null Island check
    if (Math.abs(place.latitude) < 0.001 && Math.abs(place.longitude) < 0.001) {
      issues.push({
        field: "coordinates",
        message: "Rejected Null Island (0,0) coordinates.",
        severity: "CRITICAL"
      });
    }

    // Sovereign India envelope: Lat 6.0N to 37.5N, Lng 68.0E to 97.5E
    if (place.latitude < 6.0 || place.latitude > 37.5 || place.longitude < 68.0 || place.longitude > 97.5) {
      issues.push({
        field: "coordinates",
        message: `Coordinates (${place.latitude}, ${place.longitude}) fall outside the sovereign territory of India.`,
        severity: "CRITICAL"
      });
    }
  }

  // 3. Administrative Boundary Verification
  if (!place.state || !OFFICIAL_INDIAN_STATES_AND_UTS.has(place.state)) {
    issues.push({
      field: "state",
      message: `State '${place.state}' is not in the recognized 28 States + 8 Union Territories list.`,
      severity: "CRITICAL"
    });
  }

  if (!place.district || place.district.trim().length === 0) {
    issues.push({
      field: "district",
      message: "District is mandatory for administrative provenance.",
      severity: "HIGH"
    });
  }

  // 4. Source & Provenance
  if (!place.sourceName || place.sourceName.trim().length === 0) {
    issues.push({
      field: "sourceName",
      message: "Authoritative source name is required for verification audit.",
      severity: "HIGH"
    });
  }

  return {
    valid: !issues.some(i => i.severity === "CRITICAL"),
    issues
  };
}
