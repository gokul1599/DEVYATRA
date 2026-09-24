"use client";

import Script from "next/script";

/**
 * Loads Google Maps JavaScript API (with places and geometry libraries) globally.
 * Supports NEXT_PUBLIC_GOOGLE_MAPS_API_KEY with standard fallback.
 */
export function GoogleMapsScript() {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao";

  return (
    <>
      <script
        id="google-maps-init-callback"
        dangerouslySetInnerHTML={{
          __html: `window.initMap = window.initMap || function() {};`,
        }}
      />
      <Script
        id="google-maps-js-sdk"
        src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry&v=weekly&callback=initMap`}
        strategy="afterInteractive"
      />
    </>
  );
}
