import type { Metadata } from "next";
import { MapClientShell } from "@/components/map-client-shell";

export const metadata: Metadata = {
  title: "Temple Map · Devyatra",
  description: "Discover temples across India with live place data and verified temple profiles.",
};

export default function MapPage() {
  return (
    <main className="relative pt-16 lg:pt-[72px]">
      <MapClientShell />
    </main>
  );
}