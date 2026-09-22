import type { MetadataRoute } from "next";
import { TEMPLES, getState } from "@/lib/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://templeora.vercel.app";
  const now = new Date();

  const staticRoutes = [
    "/", "/explore", "/temples", "/festivals", "/nearby", "/plan", "/search",
    "/journey", "/verify", "/report", "/about", "/login", "/register", "/map",
  ].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 }));

  const explore = getStatesForSitemap().map((s) => ({
    url: `${base}/explore/${s}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const templePages = TEMPLES.map((t) => ({
    url: `${base}/temples/${getState(t.stateCode)?.slug ?? ""}/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...explore, ...templePages];
}

function getStatesForSitemap(): string[] {
  const seen = new Set<string>();
  for (const t of TEMPLES) {
    const s = getState(t.stateCode);
    if (s) seen.add(s.slug);
  }
  return [...seen];
}