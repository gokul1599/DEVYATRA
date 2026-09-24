import type { Metadata } from "next";
import { MapClientShell } from "@/components/map-client-shell";

export const metadata: Metadata = {
  title: "Sacred Atlas Map · Templeora",
  description: "Explore India's sacred geography with live geodetic data, multi-tier cartography, and verified sanctuary profiles.",
};

export default function MapPage() {
  return (
    <main className="relative pt-16 lg:pt-[72px]">
      <MapClientShell />
    </main>
  );
}