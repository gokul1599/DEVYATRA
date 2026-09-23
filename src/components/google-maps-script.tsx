"use client";

import Script from "next/script";

/**
 * Loads Google Maps JavaScript API (with Places library) globally.
 * Ensures window.initMap is defined prior to callback invocation.
 */
export function GoogleMapsScript() {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao";

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
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`}
        strategy="afterInteractive"
      />
    </>
  );
}
