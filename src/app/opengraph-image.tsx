import { ImageResponse } from "next/og";

export const alt = "Devyatra — Discover India's Temples";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const dynamic = "force-static";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "radial-gradient(120% 120% at 50% 0%, #241d15 0%, #12100d 55%, #0d0b09 100%)",
          color: "#f4ecdc",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <svg viewBox="0 0 64 64" width="64" height="64">
            <rect width="64" height="64" rx="14" fill="#0d0b09" />
            <g transform="translate(32 30)">
              <path d="M-3.5 2 C-3.5 -8 -12 -8 -12 -20 C-5 -16 0 -20 0 -26 C0 -20 5 -16 12 -20 C12 -8 3.5 -8 3.5 2 Z" fill="#d98a2b" />
              <path d="M-6 2 C-6 -6 -14 -6 -14 -15 C-8 -12 -3 -15 0 -19 C3 -15 8 -12 14 -15 C14 -6 6 -6 6 2 Z" fill="#e9b45f" />
              <rect x="-13" y="2" width="26" height="6" rx="2" fill="#a3661f" />
            </g>
          </svg>
          <span style={{ fontSize: 40, letterSpacing: 2, color: "#d98a2b", textTransform: "uppercase" }}>Devyatra</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 88, fontWeight: 600, lineHeight: 1.05, marginTop: 40, color: "#f4ecdc" }}>
          Discover India&apos;s
          <br />
          Temples
        </div>
        <div style={{ fontSize: 30, marginTop: 32, color: "#b9ad97" }}>
          Verified timings · festivals · nearby places · AI itineraries
        </div>
      </div>
    ),
    size
  );
}