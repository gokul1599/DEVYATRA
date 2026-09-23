/**
 * DEVYATRA / TEMPLEORA — GOOGLE PHOTO RESOLUTION ENGINE
 *
 * Extracts and prepares verified photography from Google Places API
 * in strict compliance with Google Maps Platform Terms of Service:
 *
 * 1. Prohibits saving or caching binary image bytes in external object storage or database.
 * 2. Uses server-side proxy route (`/api/places/photo`) keeping API keys secret.
 * 3. Enforces extraction and transmission of required author attributions
 *    (author name, author profile URL, and Google Maps URI).
 */

export interface GooglePlacePhotoAuthor {
  displayName: string;
  uri?: string;
  photoUri?: string;
}

export interface GooglePlacePhotoRaw {
  name: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: GooglePlacePhotoAuthor[];
  flagContentUri?: string;
  googleMapsUri?: string;
}

export interface ResolvedPhotoMedia {
  proxyUrl: string;
  photoName: string;
  authorName: string;
  authorUrl?: string;
  authorAvatarUrl?: string;
  googleMapsUrl?: string;
  attributionHtml?: string;
  widthPx?: number;
  heightPx?: number;
  isPrimary: boolean;
}

/**
 * Build safe server proxy URL for a Google Places photo resource name
 */
export function buildPhotoProxyUrl(photoName: string, maxHeight = 1200): string {
  if (!photoName) return "";
  return `/api/places/photo?name=${encodeURIComponent(photoName)}&h=${maxHeight}`;
}

/**
 * Extract photo attributions and construct compliant ResolvedPhotoMedia objects
 */
export function resolveGooglePlacePhotos(
  photos: GooglePlacePhotoRaw[] | undefined | null,
  options: {
    maxPhotos?: number;
    maxHeight?: number;
    googleMapsUri?: string;
  } = {}
): ResolvedPhotoMedia[] {
  if (!photos || photos.length === 0) return [];

  const maxPhotos = options.maxPhotos ?? 5;
  const maxHeight = options.maxHeight ?? 1200;

  const validPhotos = photos.slice(0, maxPhotos);

  return validPhotos.map((p, idx) => {
    const author = p.authorAttributions?.[0];
    const authorName = author?.displayName || "Google Maps Contributor";
    const authorUrl = author?.uri;
    const authorAvatarUrl = author?.photoUri;
    const googleMapsUrl = p.googleMapsUri || options.googleMapsUri;

    const proxyUrl = buildPhotoProxyUrl(p.name, maxHeight);

    let attributionHtml = authorUrl
      ? `<a href="${encodeURI(authorUrl)}" target="_blank" rel="noopener noreferrer">${authorName}</a>`
      : authorName;

    if (googleMapsUrl) {
      attributionHtml += ` on <a href="${encodeURI(googleMapsUrl)}" target="_blank" rel="noopener noreferrer">Google Maps</a>`;
    }

    return {
      proxyUrl,
      photoName: p.name,
      authorName,
      authorUrl,
      authorAvatarUrl,
      googleMapsUrl,
      attributionHtml,
      widthPx: p.widthPx,
      heightPx: p.heightPx,
      isPrimary: idx === 0,
    };
  });
}
