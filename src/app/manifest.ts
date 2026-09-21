import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Devyatra — Discover India's Temples",
    short_name: "Devyatra",
    description:
      "An AI-powered India temple & pilgrimage explorer. Verified timings, festivals, nearby places and personalized itineraries.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0d0b09",
    theme_color: "#0d0b09",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}