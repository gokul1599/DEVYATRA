"use client";

import dynamic from "next/dynamic";
import { MapLoadingSkeleton } from "@/components/map-loading-skeleton";

const MapExplorer = dynamic(
  () => import("@/components/map-explorer").then((m) => m.MapExplorer),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
);

export function MapClientShell() {
  return <MapExplorer />;
}
