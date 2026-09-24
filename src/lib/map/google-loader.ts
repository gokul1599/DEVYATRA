/**
 * Singleton Google Maps JavaScript API Loader
 * 
 * Supports browser-side dynamic loading with libraries=places,marker.
 * Guarantees no duplicate script tags, respects React Strict Mode,
 * and rejects cleanly if API key is not configured.
 */

declare global {
  interface Window {
    google?: typeof google;
    initMap?: () => void;
  }
}

let googleMapsPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }

  if (window.google?.maps?.Map && window.google?.maps?.marker?.AdvancedMarkerElement) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise<typeof google.maps>((resolve, reject) => {
    // 1. If already initialized on window
    if (window.google?.maps?.Map && window.google?.maps?.marker?.AdvancedMarkerElement) {
      resolve(window.google.maps);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not configured"));
      return;
    }

    const onReady = () => {
      let attempts = 0;
      const check = setInterval(() => {
        attempts++;
        if (window.google?.maps?.Map && window.google?.maps?.marker?.AdvancedMarkerElement) {
          clearInterval(check);
          resolve(window.google.maps);
        } else if (attempts > 60) {
          clearInterval(check);
          if (window.google?.maps?.Map) {
            resolve(window.google.maps);
          } else {
            reject(new Error("Google Maps JavaScript API initialization timed out"));
          }
        }
      }, 100);
    };

    const existingScript = document.getElementById("google-maps-js-sdk") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", onReady);
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps script")));
      // If script is already loaded
      onReady();
      return;
    }

    // Set callback if requested by standard script tags
    window.initMap = window.initMap || onReady;

    const script = document.createElement("script");
    script.id = "google-maps-js-sdk";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error("Google Maps JavaScript SDK network request failed"));

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
