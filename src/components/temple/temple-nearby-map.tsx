"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Compass, Navigation } from "lucide-react";
import type { NormalizedAttraction, AdaptiveRadiusConfig } from "@/lib/nearby/engine";
import { cn } from "@/lib/cn";

interface TempleNearbyMapProps {
  templeName: string;
  templeLat: number;
  templeLng: number;
  attractions: NormalizedAttraction[];
  radiusConfig: AdaptiveRadiusConfig;
}

const CATEGORY_COLORS: Record<string, string> = {
  HERITAGE: "#e4be72", // Gold
  PILGRIMAGE: "#ff8c42", // Saffron
  NATURE: "#34d399", // Emerald
  CULTURE: "#a78bfa", // Lavender
  LOCAL_EXPERIENCES: "#38bdf8", // Sky blue
};

export function TempleNearbyMap({
  templeName,
  templeLat,
  templeLng,
  attractions,
  radiusConfig,
}: TempleNearbyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<NormalizedAttraction | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const filteredAttractions =
    activeCategory === "ALL"
      ? attractions
      : attractions.filter((a) => a.category === activeCategory);

  // Geographic bounds calculation
  const allLats = [templeLat, ...filteredAttractions.map((a) => a.latitude)];
  const allLngs = [templeLng, ...filteredAttractions.map((a) => a.longitude)];
  const minLat = Math.min(...allLats);
  const maxLat = Math.max(...allLats);
  const minLng = Math.min(...allLngs);
  const maxLng = Math.max(...allLngs);

  // Draw on Canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = "#0d0b09";
    ctx.fillRect(0, 0, width, height);

    // Grid lines (sacred geometry backdrop)
    ctx.strokeStyle = "rgba(228, 190, 114, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Dynamic Coordinate projection
    const latSpan = Math.max(maxLat - minLat, 0.08) * 1.4 / zoomLevel;
    const lngSpan = Math.max(maxLng - minLng, 0.08) * 1.4 / zoomLevel;
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const toCanvasX = (lng: number) => {
      return width / 2 + ((lng - centerLng) / lngSpan) * (width * 0.75);
    };

    const toCanvasY = (lat: number) => {
      return height / 2 - ((lat - centerLat) / latSpan) * (height * 0.75);
    };

    const templeX = toCanvasX(templeLng);
    const templeY = toCanvasY(templeLat);

    // Draw Adaptive Radius Ring
    const pxPerKm = (width * 0.75) / (lngSpan * 111 * Math.cos((templeLat * Math.PI) / 180));
    const radiusPx = radiusConfig.maxRadiusKm * pxPerKm;

    ctx.save();
    ctx.beginPath();
    ctx.arc(templeX, templeY, Math.min(radiusPx, width * 0.9), 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(228, 190, 114, 0.22)";
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Radius boundary label
    ctx.fillStyle = "rgba(228, 190, 114, 0.4)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `${radiusConfig.maxRadiusKm} km Radius (${radiusConfig.description.split(" (")[0]})`,
      templeX,
      Math.max(25, templeY - Math.min(radiusPx, width * 0.85) - 6)
    );
    ctx.restore();

    // Draw connecting vectors from sanctum to nearby places
    for (const attr of filteredAttractions) {
      const ax = toCanvasX(attr.longitude);
      const ay = toCanvasY(attr.latitude);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(templeX, templeY);
      ctx.lineTo(ax, ay);
      ctx.strokeStyle = "rgba(228, 190, 114, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // Draw Nearby Attractions Pins
    for (const attr of filteredAttractions) {
      const ax = toCanvasX(attr.longitude);
      const ay = toCanvasY(attr.latitude);
      const isSelected = selectedAttraction?.id === attr.id;
      const isHovered = hoveredPoint === attr.id;
      const color = CATEGORY_COLORS[attr.category] || "#e4be72";

      ctx.save();
      // Outer glow if active
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(ax, ay, 12, 0, Math.PI * 2);
        ctx.fillStyle = `${color}33`;
        ctx.fill();
      }

      // Attraction pin
      ctx.beginPath();
      ctx.arc(ax, ay, isSelected ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = isSelected ? "#ffffff" : "rgba(245, 240, 230, 0.8)";
      ctx.font = isSelected ? "bold 11px sans-serif" : "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(attr.name, ax, ay + 16);
      ctx.restore();
    }

    // Draw Central Sanctum (Temple) Pin
    ctx.save();
    // Halo
    ctx.beginPath();
    ctx.arc(templeX, templeY, 16, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 140, 66, 0.25)";
    ctx.fill();

    // Main marker
    ctx.beginPath();
    ctx.arc(templeX, templeY, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#ff8c42";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Sanctum label
    ctx.fillStyle = "#e4be72";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`★ ${templeName}`, templeX, templeY - 14);
    ctx.restore();
  }, [
    filteredAttractions,
    templeLat,
    templeLng,
    templeName,
    minLat,
    maxLat,
    minLng,
    maxLng,
    zoomLevel,
    radiusConfig,
    selectedAttraction,
    hoveredPoint,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  // Handle Canvas Click to select attraction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const latSpan = Math.max(maxLat - minLat, 0.08) * 1.4 / zoomLevel;
    const lngSpan = Math.max(maxLng - minLng, 0.08) * 1.4 / zoomLevel;
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const toCanvasX = (lng: number) => canvas.width / 2 + ((lng - centerLng) / lngSpan) * (canvas.width * 0.75);
    const toCanvasY = (lat: number) => canvas.height / 2 - ((lat - centerLat) / latSpan) * (canvas.height * 0.75);

    let clicked: NormalizedAttraction | null = null;
    for (const attr of filteredAttractions) {
      const ax = toCanvasX(attr.longitude);
      const ay = toCanvasY(attr.latitude);
      const dist = Math.hypot(clickX - ax, clickY - ay);
      if (dist < 14) {
        clicked = attr;
        break;
      }
    }
    setSelectedAttraction(clicked);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const latSpan = (Math.max(maxLat - minLat, 0.08) * 1.4) / zoomLevel;
    const lngSpan = (Math.max(maxLng - minLng, 0.08) * 1.4) / zoomLevel;
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    const toCanvasX = (lng: number) => canvas.width / 2 + ((lng - centerLng) / lngSpan) * (canvas.width * 0.75);
    const toCanvasY = (lat: number) => canvas.height / 2 - ((lat - centerLat) / latSpan) * (canvas.height * 0.75);

    let hovered: string | null = null;
    for (const attr of filteredAttractions) {
      const ax = toCanvasX(attr.longitude);
      const ay = toCanvasY(attr.latitude);
      if (Math.hypot(mouseX - ax, mouseY - ay) < 14) {
        hovered = attr.id;
        break;
      }
    }
    setHoveredPoint(hovered);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-obsidian-2">
      {/* Map Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-obsidian-3/80 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-gold" />
          <span className="text-[12.5px] font-medium text-ivory">
            Dual-Marker Sacred Map ({filteredAttractions.length} Nearby)
          </span>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {["ALL", "HERITAGE", "PILGRIMAGE", "NATURE", "CULTURE", "LOCAL_EXPERIENCES"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedAttraction(null);
              }}
              className={cn(
                "rounded-full px-2.5 py-1 font-medium transition-colors",
                activeCategory === cat
                  ? "bg-gold/20 text-gold-bright border border-gold/40"
                  : "bg-surface text-ivory-dim hover:text-ivory border border-transparent"
              )}
            >
              {cat === "ALL" ? "All Categories" : cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 3))}
            aria-label="Zoom in"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface text-ivory-dim transition hover:bg-surface-elevated hover:text-ivory"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.7))}
            aria-label="Zoom out"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface text-ivory-dim transition hover:bg-surface-elevated hover:text-ivory"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setSelectedAttraction(null);
            }}
            aria-label="Reset map view"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface text-ivory-dim transition hover:bg-surface-elevated hover:text-ivory"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative h-[380px] w-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
          className="h-full w-full object-cover"
        />

        {/* Selected Attraction Popup Card Overlay */}
        {selectedAttraction && (
          <div className="absolute bottom-4 left-4 right-4 z-20 max-w-md rounded-2xl border border-gold/30 bg-obsidian-1/95 p-4 shadow-2xl backdrop-blur-md sm:left-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className="inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[selectedAttraction.category] || "#e4be72",
                  }}
                >
                  {selectedAttraction.category.replace(/_/g, " ")}
                </span>
                <h4 className="mt-1 text-sm font-semibold text-ivory">
                  {selectedAttraction.name}
                  {selectedAttraction.nativeName && (
                    <span className="ml-1.5 text-[12px] font-normal text-gold-dim">
                      ({selectedAttraction.nativeName})
                    </span>
                  )}
                </h4>
              </div>
              <button
                onClick={() => setSelectedAttraction(null)}
                className="text-xs text-ivory-dim hover:text-ivory"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ivory-dim">
              {selectedAttraction.description}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-2.5 text-[11.5px]">
              <span className="flex items-center gap-1 text-gold-bright">
                <Navigation className="h-3 w-3" />
                {selectedAttraction.displayDistance}
              </span>
              <span className="text-ivory-dim">
                Source: {selectedAttraction.sourceType || "Official Registry"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-obsidian-3/60 px-5 py-2.5 text-[11px] text-ivory-dim">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ff8c42]" />
            Sanctum (This Temple)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#e4be72]" />
            Heritage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#34d399]" />
            Nature
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#a78bfa]" />
            Culture
          </span>
        </div>
        <div>
          Radius: {radiusConfig.maxRadiusKm} km ({radiusConfig.description})
        </div>
      </div>
    </div>
  );
}
