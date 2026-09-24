"use client";

import Script from "next/script";

/**
 * Loads Google Maps JavaScript API (with places and marker libraries) globally.
 * Strictly reads from environment variable NEXT_PUBLIC_GOOGLE_MAPS_API_KEY without fallback.
 */
export function GoogleMapsScript() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) return null;

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
        src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,marker&v=weekly&callback=initMap`}
        strategy="afterInteractive"
      />
    </>
  );
}
