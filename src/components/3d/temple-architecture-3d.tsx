"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Compass, Sparkles, Eye, Info, RotateCcw, Box, Layers, ShieldCheck } from "lucide-react";

import {
  type ArchitecturalElement,
  CANONICAL_ELEMENTS,
  type TempleTradition,
  TRADITION_DETAILS,
  getTraditionFromArchitecture,
} from "@/lib/architecture/canonical-model";
import { cn } from "@/lib/cn";

export { type ArchitecturalElement, CANONICAL_ELEMENTS };

interface Props {
  className?: string;
  title?: string;
  subtitle?: string;
  templeArchitecture?: string;
}

export function TempleArchitecture3D({
  className,
  title = "Spatial Anatomy of Sacred Architecture",
  subtitle = "Explore the sacred geometry, concentric thresholds, and metaphysical layers of canonical Indian temples.",
  templeArchitecture,
}: Props) {
  const initialTradition = getTraditionFromArchitecture(templeArchitecture);
  const [selectedTradition, setSelectedTradition] = useState<TempleTradition>(initialTradition);
  const [selectedId, setSelectedId] = useState<string>("garbhagriha");
  const [rotationAngle, setRotationAngle] = useState(0.48); // Radians
  const [pitchAngle, setPitchAngle] = useState(0.38);
  const [showWireframe, setShowWireframe] = useState(true);
  const [showAxis, setShowAxis] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, rot: 0.48, pitch: 0.38 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerId = useId();

  const selectedElement =
    CANONICAL_ELEMENTS.find((el) => el.id === selectedId) || CANONICAL_ELEMENTS[3];

  const traditionInfo = TRADITION_DETAILS[selectedTradition];

  // 3D Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 640);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 460);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", onResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 35;
      const scale = Math.min(width, height) * 0.28;

      // 3D Point Projection Helper
      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(rotationAngle);
        const sinY = Math.sin(rotationAngle);
        const rx = x * cosY + z * sinY;
        const rz = -x * sinY + z * cosY;

        const cosX = Math.cos(pitchAngle);
        const sinX = Math.sin(pitchAngle);
        const ry = y * cosX - rz * sinX;
        const depth = y * sinX + rz * cosX;

        const dist = 4.2;
        const f = dist / (dist + depth);
        return {
          px: cx + rx * scale * f,
          py: cy - ry * scale * f,
          scale: f,
          depth,
        };
      };

      // Draw subtle ground isometric grid
      ctx.save();
      ctx.strokeStyle = "rgba(200, 162, 75, 0.12)";
      ctx.lineWidth = 1;
      const gridSize = 6;
      const step = 0.55;
      for (let i = -gridSize; i <= gridSize; i++) {
        const p1 = project(-gridSize * step, -0.4, i * step);
        const p2 = project(gridSize * step, -0.4, i * step);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        const p3 = project(i * step, -0.4, -gridSize * step);
        const p4 = project(i * step, -0.4, gridSize * step);
        ctx.beginPath();
        ctx.moveTo(p3.px, p3.py);
        ctx.lineTo(p4.px, p4.py);
        ctx.stroke();
      }
      ctx.restore();

      // Draw Sacred Brahma-Sutra Axis Ray
      if (showAxis) {
        const startAxis = project(0, -0.38, 2.8);
        const endAxis = project(0, -0.38, -1.6);
        ctx.beginPath();
        ctx.moveTo(startAxis.px, startAxis.py);
        ctx.lineTo(endAxis.px, endAxis.py);
        ctx.strokeStyle = "rgba(228, 190, 114, 0.4)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Volumetric Wireframe Geometries
      if (showWireframe) {
        ctx.save();
        ctx.lineWidth = 1.2;

        // 1. Prakara Wall Perimeter
        const w = 1.8;
        const l1 = -1.4;
        const l2 = 2.4;
        const hWall = 0.4;
        const c1 = project(-w, -0.4, l2);
        const c2 = project(w, -0.4, l2);
        const c3 = project(w, -0.4, l1);
        const c4 = project(-w, -0.4, l1);
        const t1 = project(-w, -0.4 + hWall, l2);
        const t2 = project(w, -0.4 + hWall, l2);
        const t3 = project(w, -0.4 + hWall, l1);
        const t4 = project(-w, -0.4 + hWall, l1);

        ctx.strokeStyle = "rgba(200, 162, 75, 0.25)";
        ctx.beginPath();
        ctx.moveTo(c1.px, c1.py);
        ctx.lineTo(c2.px, c2.py);
        ctx.lineTo(c3.px, c3.py);
        ctx.lineTo(c4.px, c4.py);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(t1.px, t1.py);
        ctx.lineTo(t2.px, t2.py);
        ctx.lineTo(t3.px, t3.py);
        ctx.lineTo(t4.px, t4.py);
        ctx.closePath();
        ctx.stroke();

        // Wall vertical edges
        [
          [c1, t1],
          [c2, t2],
          [c3, t3],
          [c4, t4],
        ].forEach(([b, t]) => {
          ctx.beginPath();
          ctx.moveTo(b.px, b.py);
          ctx.lineTo(t.px, t.py);
          ctx.stroke();
        });

        // 2. Sanctum Superstructure (Vimana / Shikhara)
        // Dravidian = Stepped pyramid tiers; Nagara/Kalinga = Curvilinear spire
        const isDravidian = selectedTradition === "DRAVIDIAN";
        const tiers = isDravidian ? 4 : 5;
        const sX = 0;
        const sZ = -0.7;
        const baseY = -0.4;

        for (let i = 0; i < tiers; i++) {
          const tierFraction = i / tiers;
          const tierY = baseY + 0.3 + (isDravidian ? tierFraction * 1.5 : Math.pow(tierFraction, 0.8) * 1.8);
          const tierSize = isDravidian ? 0.65 * (1 - tierFraction * 0.75) : 0.6 * (1 - Math.pow(tierFraction, 1.4) * 0.85);

          const pA = project(sX - tierSize, tierY, sZ - tierSize);
          const pB = project(sX + tierSize, tierY, sZ - tierSize);
          const pC = project(sX + tierSize, tierY, sZ + tierSize);
          const pD = project(sX - tierSize, tierY, sZ + tierSize);

          ctx.strokeStyle =
            selectedId === "shikhara" || selectedId === "garbhagriha"
              ? "rgba(228, 190, 114, 0.7)"
              : "rgba(200, 162, 75, 0.28)";

          ctx.beginPath();
          ctx.moveTo(pA.px, pA.py);
          ctx.lineTo(pB.px, pB.py);
          ctx.lineTo(pC.px, pC.py);
          ctx.lineTo(pD.px, pD.py);
          ctx.closePath();
          ctx.stroke();
        }

        // 3. Gopuram Gateway (if Dravidian or generic)
        if (selectedTradition === "DRAVIDIAN" || selectedTradition === "VESARA") {
          const gZ = 2.2;
          for (let i = 0; i < 4; i++) {
            const fraction = i / 4;
            const gY = -0.4 + fraction * 1.4;
            const gWidth = 0.65 * (1 - fraction * 0.6);
            const gDepth = 0.45 * (1 - fraction * 0.6);

            const gA = project(-gWidth, gY, gZ - gDepth);
            const gB = project(gWidth, gY, gZ - gDepth);
            const gC = project(gWidth, gY, gZ + gDepth);
            const gD = project(-gWidth, gY, gZ + gDepth);

            ctx.strokeStyle =
              selectedId === "gopuram"
                ? "rgba(228, 190, 114, 0.75)"
                : "rgba(200, 162, 75, 0.28)";

            ctx.beginPath();
            ctx.moveTo(gA.px, gA.py);
            ctx.lineTo(gB.px, gB.py);
            ctx.lineTo(gC.px, gC.py);
            ctx.lineTo(gD.px, gD.py);
            ctx.closePath();
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      // Draw Interactive Element Nodes (Sorted by depth for proper painter's order)
      const projectedElements = CANONICAL_ELEMENTS.map((el) => ({
        el,
        proj: project(el.coordinates.x, el.coordinates.y, el.coordinates.z),
      })).sort((a, b) => b.proj.depth - a.proj.depth);

      for (const item of projectedElements) {
        const { el, proj } = item;
        const isSelected = el.id === selectedId;

        // Ground anchor line
        const ground = project(el.coordinates.x, -0.4, el.coordinates.z);
        ctx.beginPath();
        ctx.moveTo(ground.px, ground.py);
        ctx.lineTo(proj.px, proj.py);
        ctx.strokeStyle = isSelected
          ? "rgba(228, 190, 114, 0.9)"
          : "rgba(200, 162, 75, 0.25)";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Node disc
        ctx.beginPath();
        const radius = isSelected ? 12 * proj.scale : 7 * proj.scale;
        ctx.arc(proj.px, proj.py, radius, 0, Math.PI * 2);

        if (isSelected) {
          ctx.fillStyle = "#E4BE72";
          ctx.shadowColor = "rgba(228, 190, 114, 0.8)";
          ctx.shadowBlur = 18;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Outer glowing ring
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(228, 190, 114, 0.5)";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(35, 25, 20, 0.95)";
          ctx.fill();
          ctx.strokeStyle = "rgba(200, 162, 75, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Tier / Depth number
        ctx.fillStyle = isSelected ? "#0F0B08" : "#E4BE72";
        ctx.font = `${Math.max(10, Math.round(11 * proj.scale))}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(el.depthTier), proj.px, proj.py);

        // Text label
        ctx.fillStyle = isSelected ? "#FFF8EA" : "rgba(242, 236, 225, 0.75)";
        ctx.font = isSelected
          ? `600 ${Math.max(12, Math.round(13 * proj.scale))}px Fraunces, serif`
          : `400 ${Math.max(10, Math.round(11 * proj.scale))}px Inter, sans-serif`;
        ctx.fillText(el.name.split("/")[0].trim(), proj.px, proj.py - radius - 10);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [rotationAngle, pitchAngle, selectedId, selectedTradition, showWireframe, showAxis]);

  // Orbit rotation controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rot: rotationAngle,
      pitch: pitchAngle,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setRotationAngle(dragStartRef.current.rot + dx * 0.008);
    setPitchAngle(
      Math.max(0.1, Math.min(0.85, dragStartRef.current.pitch + dy * 0.008))
    );
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      rot: rotationAngle,
      pitch: pitchAngle,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setRotationAngle(dragStartRef.current.rot + dx * 0.008);
    setPitchAngle(
      Math.max(0.1, Math.min(0.85, dragStartRef.current.pitch + dy * 0.008))
    );
  };

  const resetView = () => {
    setRotationAngle(0.48);
    setPitchAngle(0.38);
  };

  return (
    <div
      id={containerId}
      className={cn(
        "relative rounded-3xl border border-gold/30 bg-obsidian-2/95 p-6 shadow-2xl backdrop-blur-md overflow-hidden",
        className
      )}
    >
      {/* Background Accent Gradients */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-saffron/5 blur-3xl" />

      {/* Header with Title and Tradition Selector */}
      <div className="flex flex-col gap-4 border-b border-line/60 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-bright">
            <Compass className="h-4 w-4" />
            <span>Sacred Spatial Engineering</span>
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] text-gold-bright border border-gold/30">
              Shilpa Shastras
            </span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-medium text-ivory md:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-xs text-ivory-dim max-w-xl">{subtitle}</p>
        </div>

        {/* Tradition Style Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-obsidian p-1 self-start md:self-auto">
          {(["DRAVIDIAN", "NAGARA", "KALINGA", "VESARA"] as TempleTradition[]).map((trad) => (
            <button
              key={trad}
              onClick={() => setSelectedTradition(trad)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                selectedTradition === trad
                  ? "bg-gold/20 text-gold-bright border border-gold/40 shadow-sm"
                  : "text-ivory-dim hover:text-ivory"
              )}
            >
              {trad.charAt(0) + trad.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Stage & Detail Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* 3D Interactive Spatial Canvas */}
        <div className="relative min-h-[380px] rounded-2xl border border-line bg-obsidian p-2 lg:col-span-7 flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing select-none">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="h-full w-full"
          />

          {/* Canvas Floating Overlay Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-auto">
            <span className="rounded-lg bg-obsidian-2/90 border border-gold/30 px-2.5 py-1 text-[11px] font-medium text-gold-bright shadow-lg backdrop-blur-md">
              {traditionInfo.name} ({traditionInfo.sanskritName})
            </span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all backdrop-blur-md",
                showWireframe
                  ? "border-gold/40 bg-gold/20 text-gold-bright"
                  : "border-line bg-obsidian-2/80 text-ivory-dim"
              )}
              title="Toggle Wireframe Volumes"
            >
              <Box className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Volumes</span>
            </button>
            <button
              onClick={() => setShowAxis(!showAxis)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all backdrop-blur-md",
                showAxis
                  ? "border-gold/40 bg-gold/20 text-gold-bright"
                  : "border-line bg-obsidian-2/80 text-ivory-dim"
              )}
              title="Toggle Brahma-Sutra Axis"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Axis</span>
            </button>
            <button
              onClick={resetView}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-obsidian-2/80 text-ivory-dim hover:text-gold-bright transition-colors"
              title="Reset 3D View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 text-[11px] text-ivory-dim/70 flex items-center gap-1 bg-obsidian-2/80 px-2 py-0.5 rounded-md border border-line pointer-events-none">
            <Eye className="h-3 w-3 text-gold" />
            <span>Drag to rotate 3D orbit • Click nodes below to inspect</span>
          </div>
        </div>

        {/* Element Inspector & Tradition Blueprint */}
        <div className="space-y-4 lg:col-span-5">
          {/* Active Element Inspector Card */}
          <div className="rounded-2xl border border-gold/30 bg-obsidian p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                  Threshold Tier {selectedElement.depthTier} of 5
                </span>
                <h3 className="font-display text-xl font-medium text-ivory">
                  {selectedElement.name}
                </h3>
                <p className="text-xs text-gold-bright/90 font-serif">
                  {selectedElement.sanskritName}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-bright border border-gold/40">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-ivory-dim">
              {selectedElement.shortDescription}
            </p>

            <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gold-bright">
                <Info className="h-3.5 w-3.5" />
                <span>Metaphysical & Structural Significance</span>
              </div>
              <p className="mt-1 text-xs text-ivory/80 leading-relaxed">
                {selectedElement.significance}
              </p>
            </div>
          </div>

          {/* Architectural Tradition Context */}
          <div className="rounded-2xl border border-line bg-obsidian p-4 text-xs">
            <div className="flex items-center gap-2 text-ivory font-semibold mb-2">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span>{traditionInfo.name} Blueprint</span>
            </div>
            <p className="text-ivory-dim leading-relaxed mb-3">
              {traditionInfo.description}
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-line/60 pt-2 text-ivory-dim">
              <div>
                <span className="text-gold font-medium block">Superstructure:</span>
                <span className="text-ivory/80">{traditionInfo.superstructure}</span>
              </div>
              <div>
                <span className="text-gold font-medium block">Gateway:</span>
                <span className="text-ivory/80">{traditionInfo.gateway}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sequential Threshold Selector Ribbon */}
      <div className="mt-6 border-t border-line/60 pt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ivory-dim mb-3 flex items-center justify-between">
          <span>Sequential Sacred Thresholds (Outer Gateway $\to$ Supreme Sanctum)</span>
          <span className="text-gold">Click to highlight</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {CANONICAL_ELEMENTS.map((el) => {
            const isSelected = el.id === selectedId;
            return (
              <button
                key={el.id}
                onClick={() => setSelectedId(el.id)}
                className={cn(
                  "flex flex-col items-start p-2.5 rounded-xl border text-left transition-all",
                  isSelected
                    ? "border-gold bg-gold/15 text-gold-bright shadow-lg shadow-gold/20 scale-102"
                    : "border-line bg-obsidian hover:border-gold/30 text-ivory-dim hover:text-ivory"
                )}
              >
                <span className="text-[10px] font-mono text-gold/80 mb-0.5">
                  Tier {el.depthTier}
                </span>
                <span className="text-xs font-medium text-ivory truncate w-full">
                  {el.name.split("/")[0]}
                </span>
                <span className="text-[10px] text-ivory-dim/70 truncate w-full">
                  {el.sanskritName.split("/")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
