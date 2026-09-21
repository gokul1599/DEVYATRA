import { ImageResponse } from "next/og";
import { getTemple, getState } from "@/lib/registry";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const dynamic = "force-static";

export default async function TempleOgImage({ params }: { params: Promise<{ state: string; slug: string }> }) {
  const { state: stateSlug, slug } = await params;
  const temple = getTemple(slug);
  if (!temple) return new ImageResponse(<>Temple not found</>, size);

  const st = getState(stateSlug) ?? getState(temple.stateCode);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(140% 120% at 50% 8%, #33271a 0%, #151210 55%, #0d0b09 100%)",
          color: "#f4ecdc",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg viewBox="0 0 64 64" width="34" height="34">
            <rect width="64" height="64" rx="14" fill="#0d0b09" />
            <g transform="translate(32 30)">
              <path d="M-3.5 2 C-3.5 -8 -12 -8 -12 -20 C-5 -16 0 -20 0 -26 C0 -20 5 -16 12 -20 C12 -8 3.5 -8 3.5 2 Z" fill="#d98a2b" />
            </g>
          </svg>
          <span style={{ fontSize: 28, letterSpacing: 2, color: "#d98a2b", textTransform: "uppercase" }}>Devyatra</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 12, fontSize: 26, color: "#c7baa3" }}>
            <span>{temple.architecture ?? temple.type}</span>
            {(temple.badges ?? []).slice(0, 2).map((b) => (
              <span key={b}>{`· ${b}`}</span>
            ))}
          </div>
          <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.1, marginTop: 16, color: "#f4ecdc" }}>
            {temple.name}
          </div>
          <div style={{ fontSize: 30, marginTop: 16, color: "#d98a2b" }}>
            {`${temple.location}, ${temple.district} · ${st?.name}`}
          </div>
        </div>
      </div>
    ),
    size
  );
}

export async function generateStaticParams() {
  const { TEMPLES } = await import("@/lib/registry");
  return TEMPLES.map((t) => ({ state: getState(t.stateCode)?.slug ?? "", slug: t.slug }));
}