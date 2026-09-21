import type { Metadata } from "next";
import { MapExplorer } from "@/components/map-explorer";

export const metadata: Metadata = {
  title: "Temple Map",
  description: "Discover temples across India with live place data and verified temple profiles.",
};

export default async function MapPage() {
  return (
    <main className="relative pt-16 lg:pt-[72px]">
      <MapExplorer />
    </main>
  );
}