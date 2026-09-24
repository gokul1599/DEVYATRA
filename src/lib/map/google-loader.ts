/**
 * Singleton Google Maps JavaScript API Loader
 * 
 * Supports dynamic browser loading with places and geometry libraries.
 * Handles React Strict Mode, avoids duplicate script tags, and resolves as soon as google.maps.Map is ready.
 */

declare global {
  interface Window {
    google?: typeof google;
    initMap?: () => void;
    gm_authFailure?: () => void;
  }
}

let googleMapsPromise: Promise<typeof google.maps> | null = null;

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser"));
  }

  if (window.google?.maps?.Map) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise<typeof google.maps>((resolve, reject) => {
    if (window.google?.maps?.Map) {
      resolve(window.google.maps);
      return;
    }

    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao";

    const onReady = () => {
      if (window.google?.maps?.Map) {
        resolve(window.google.maps);
        return;
      }

      let attempts = 0;
      const check = setInterval(() => {
        attempts++;
        if (window.google?.maps?.Map) {
          clearInterval(check);
          resolve(window.google.maps);
        } else if (attempts > 50) {
          clearInterval(check);
          reject(new Error("Google Maps JavaScript API initialization timed out"));
        }
      }, 100);
    };

    // Chain into global callback
    const prevInit = window.initMap;
    window.initMap = () => {
      if (prevInit) {
        try {
          prevInit();
        } catch {
          /* ignore */
        }
      }
      onReady();
    };

    // Chain into authentication failure callback
    const prevAuth = window.gm_authFailure;
    window.gm_authFailure = () => {
      if (prevAuth) {
        try {
          prevAuth();
        } catch {
          /* ignore */
        }
      }
      reject(new Error("auth_failure"));
    };

    const existingScript = document.getElementById("google-maps-js-sdk") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", onReady);
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps script")));
      if (window.google?.maps?.Map) {
        resolve(window.google.maps);
      } else {
        onReady();
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-js-sdk";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry&v=weekly&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => reject(new Error("Google Maps JavaScript SDK network request failed"));

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
