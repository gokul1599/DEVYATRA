import type { MetadataRoute } from "next";
import { TEMPLES, getState } from "@/lib/registry";
import { SACRED_COLLECTIONS } from "@/lib/discovery/collections";
import { SACRED_CIRCUITS } from "@/lib/ai/circuits";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://templeora.vercel.app";
  const now = new Date();

  const staticRoutes = [
    "/", "/explore", "/temples", "/festivals", "/nearby", "/plan", "/search",
    "/journey", "/verify", "/report", "/about", "/login", "/register", "/map",
    "/stories", "/submit", "/collections",
  ].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 }));

  const explore = getStatesForSitemap().map((s) => ({
    url: `${base}/explore/${s}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const collections = SACRED_COLLECTIONS.map((c) => ({
    url: `${base}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const circuits = SACRED_CIRCUITS.map((c) => ({
    url: `${base}/plan?circuit=${c.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const stories = [
    "chola-granite-monuments-and-bronze-devotion",
    "himalayan-mandakini-trail-kedarnath",
    "sacred-geometry-vastu-purusha-mandala",
    "puri-rath-yatra-cosmic-wheels",
  ].map((s) => ({
    url: `${base}/stories/${s}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const templePages = TEMPLES.map((t) => ({
    url: `${base}/temples/${getState(t.stateCode)?.slug ?? ""}/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...explore, ...collections, ...circuits, ...stories, ...templePages];
}

function getStatesForSitemap(): string[] {
  const seen = new Set<string>();
  for (const t of TEMPLES) {
    const s = getState(t.stateCode);
    if (s) seen.add(s.slug);
  }
  return [...seen];
}