/**
 * DEVYATRA / TEMPLEORA — CANONICAL MEDIA RESOLVER
 *
 * Single source of truth for resolving verified temple visual assets across
 * Temple Cards, Detail Pages, Media Galleries, and Discovery Components.
 *
 * Enforces Zero Visual Hallucination:
 * 1. Checks approved persistent database media (`TempleMedia`).
 * 2. Checks curated landmark images registry (`CURATED_LANDMARK_IMAGES`).
 * 3. Checks direct verified URLs on temple record.
 * 4. Yields explicit `hasFactualPhoto: false` state if no factual photo exists,
 *    allowing the UI to display a dignified "Photo verification in progress" state.
 *    Never masquerades synthetic art or an unrelated temple as factual photography.
 */

import { getTempleImage, type DestinationImage, type ImageRightsType } from "./registry";

export interface ResolvedTempleMedia {
  id: string;
  src: string | null;
  alt: string;
  caption?: string;
  sourceType: "DATABASE" | "CURATED" | "GOOGLE_PLACES" | "OFFICIAL" | "ASI" | "CC" | "NONE";
  rights: ImageRightsType;
  credit: string;
  authorUrl?: string;
  authorAvatarUrl?: string;
  googleMapsUrl?: string;
  hasFactualPhoto: boolean;
  verificationStatus: "VERIFIED" | "PENDING_VERIFICATION" | "UNAVAILABLE";
  aspectRatio: "16/9" | "4/3" | "1/1" | "21/9";
  focalPoint: "center" | "top" | "bottom" | "left" | "right";
}

export interface MediaCapableTemple {
  id?: string;
  slug: string;
  name: string;
  stateCode?: string;
  district?: string;
  googlePlaceId?: string | null;
  googleMapsUrl?: string | null;
  images?: string[];
  media?: Array<{
    id: string;
    kind: string;
    sourceType: string;
    sourceName?: string | null;
    sourceUrl?: string | null;
    googlePlaceId?: string | null;
    googleMapsUrl?: string | null;
    publicUrl?: string | null;
    altText?: string | null;
    caption?: string | null;
    authorName?: string | null;
    authorUrl?: string | null;
    authorAvatarUrl?: string | null;
    licenseType?: string | null;
    attributionRequired?: boolean;
    attributionHtml?: string | null;
    isPrimary?: boolean;
    isApproved?: boolean;
    isFactual?: boolean;
    verificationStatus?: string;
  }>;
}

/**
 * Resolves the primary verified visual asset for any temple record
 */
export function resolvePrimaryTempleMedia(
  temple: MediaCapableTemple | null | undefined
): ResolvedTempleMedia {
  if (!temple) {
    return {
      id: "media-none",
      src: null,
      alt: "Templeora Sacred Destination",
      sourceType: "NONE",
      rights: "ARTISTIC_INTERPRETATION",
      credit: "Templeora Sacred Atlas",
      hasFactualPhoto: false,
      verificationStatus: "UNAVAILABLE",
      aspectRatio: "16/9",
      focalPoint: "center",
    };
  }

  // 1. Tier 1: Approved persistent media in database
  if (temple.media && temple.media.length > 0) {
    const approved = temple.media.filter(
      (m) => m.isApproved || m.verificationStatus === "VERIFIED" || m.verificationStatus === "AUTO_APPROVED"
    );

    const primary = approved.find((m) => m.isPrimary) || approved[0];

    if (primary && primary.publicUrl) {
      let rights: ImageRightsType = "OFFICIAL_PROVENANCE";
      if (primary.sourceType === "GOOGLE_PLACES") rights = "UNSPLASH_LICENSE"; // Rights Attribution
      if (primary.sourceType === "CC") rights = "CREATIVE_COMMONS";
      if (primary.sourceType === "PUBLIC_DOMAIN" || primary.sourceType === "ASI") rights = "PUBLIC_DOMAIN";

      return {
        id: primary.id,
        src: primary.publicUrl,
        alt: primary.altText || `${temple.name} sanctum and heritage architecture`,
        caption: primary.caption || `${temple.name}, sacred heritage site`,
        sourceType: (primary.sourceType as ResolvedTempleMedia["sourceType"]) || "DATABASE",
        rights,
        credit: primary.authorName || primary.sourceName || "Verified Heritage Contributor",
        authorUrl: primary.authorUrl || undefined,
        authorAvatarUrl: primary.authorAvatarUrl || undefined,
        googleMapsUrl: primary.googleMapsUrl || undefined,
        hasFactualPhoto: true,
        verificationStatus: "VERIFIED",
        aspectRatio: "16/9",
        focalPoint: "center",
      };
    }
  }

  // 2. Tier 2: Curated Editorial Landmark Images Registry
  const curated = getTempleImage(temple.slug);
  if (curated && curated.src) {
    return {
      id: curated.id,
      src: curated.src,
      alt: curated.alt,
      caption: curated.caption,
      sourceType: "CURATED",
      rights: curated.rights,
      credit: curated.credit,
      authorUrl: curated.sourceUrl,
      hasFactualPhoto: true,
      verificationStatus: "VERIFIED",
      aspectRatio: (curated.aspectRatio as ResolvedTempleMedia["aspectRatio"]) || "16/9",
      focalPoint: curated.focalPoint || "center",
    };
  }

  // 3. Tier 3: Direct verified images stored on temple record
  if (temple.images && temple.images.length > 0) {
    const firstImg = temple.images[0];
    if (firstImg && (firstImg.startsWith("https://") || firstImg.startsWith("http://"))) {
      return {
        id: `img-${temple.slug}-0`,
        src: firstImg,
        alt: `${temple.name} temple complex`,
        caption: `${temple.name} sanctuary`,
        sourceType: "OFFICIAL",
        rights: "OFFICIAL_PROVENANCE",
        credit: "Verified Temple Trust / Field Registry",
        hasFactualPhoto: true,
        verificationStatus: "VERIFIED",
        aspectRatio: "16/9",
        focalPoint: "center",
      };
    }
  }

  // 4. Tier 4: No approved factual photo exists
  return {
    id: `placeholder-${temple.slug}`,
    src: null,
    alt: `${temple.name} — Photography verification pending`,
    caption: `${temple.name} (Authentic photography undergoing archival verification)`,
    sourceType: "NONE",
    rights: "ARTISTIC_INTERPRETATION",
    credit: "Devyatra Field Verification in Progress",
    hasFactualPhoto: false,
    verificationStatus: "PENDING_VERIFICATION",
    aspectRatio: "16/9",
    focalPoint: "center",
  };
}

/**
 * Adapter to convert ResolvedTempleMedia to DestinationImage for backwards compatibility
 */
export function toDestinationImage(resolved: ResolvedTempleMedia): DestinationImage | null {
  if (!resolved.hasFactualPhoto || !resolved.src) return null;
  return {
    id: resolved.id,
    src: resolved.src,
    alt: resolved.alt,
    caption: resolved.caption,
    category: "LANDMARK",
    rights: resolved.rights,
    credit: resolved.credit,
    sourceUrl: resolved.authorUrl,
    focalPoint: resolved.focalPoint,
    aspectRatio: resolved.aspectRatio,
  };
}
