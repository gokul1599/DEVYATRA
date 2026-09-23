"use client";

import { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Sparkles, Eye, Info } from "lucide-react";

import {
  type ArchitecturalElement,
  CANONICAL_ELEMENTS,
} from "@/lib/architecture/canonical-model";

export { type ArchitecturalElement, CANONICAL_ELEMENTS };

interface Props {
  className?: string;
  title?: string;
  subtitle?: string;
}

export function TempleArchitecture3D({
  className,
  title = "Anatomy of Sacred Architecture",
  subtitle = "Explore the sacred geometry, concentric thresholds, and metaphysical layers of canonical Indian temples.",
}: Props) {
  const [selectedId, setSelectedId] = useState<string>("garbhagriha");
  const [rotationAngle, setRotationAngle] = useState(0.45); // Radians
  const [pitchAngle, setPitchAngle] = useState(0.35);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, rot: 0.45, pitch: 0.35 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerId = useId();

  const selectedElement = CANONICAL_ELEMENTS.find((el) => el.id === selectedId) || CANONICAL_ELEMENTS[3];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", onResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 30;
      const scale = Math.min(width, height) * 0.28;

      // Projection helper: 3D point (x,y,z) rotated by rotationAngle around Y, pitch around X
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y
        const cosY = Math.cos(rotationAngle);
        const sinY = Math.sin(rotationAngle);
        const rx = x * cosY + z * sinY;
        const rz = -x * sinY + z * cosY;

        // Rotate around X (pitch)
        const cosX = Math.cos(pitchAngle);
        const sinX = Math.sin(pitchAngle);
        const ry = y * cosX - rz * sinX;
        const depth = y * sinX + rz * cosX;

        // Perspective
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
      const gridSize = 5;
      const step = 0.6;
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

      // Draw Base Temple Axis Ray
      const startAxis = project(0, -0.35, 2.5);
      const endAxis = project(0, -0.35, -1.2);
      ctx.beginPath();
      ctx.moveTo(startAxis.px, startAxis.py);
      ctx.lineTo(endAxis.px, endAxis.py);
      ctx.strokeStyle = "rgba(200, 162, 75, 0.35)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Elements and Connections
      // Sort by depth (painter's algorithm)
      const projectedElements = CANONICAL_ELEMENTS.map((el) => ({
        el,
        proj: project(el.coordinates.x, el.coordinates.y, el.coordinates.z),
      })).sort((a, b) => b.proj.depth - a.proj.depth);

      for (const item of projectedElements) {
        const { el, proj } = item;
        const isSelected = el.id === selectedId;

        // Draw pillar/pedestal line to ground
        const ground = project(el.coordinates.x, -0.4, el.coordinates.z);
        ctx.beginPath();
        ctx.moveTo(ground.px, ground.py);
        ctx.lineTo(proj.px, proj.py);
        ctx.strokeStyle = isSelected
          ? "rgba(228, 190, 114, 0.85)"
          : "rgba(200, 162, 75, 0.25)";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Node disc
        ctx.beginPath();
        const radius = isSelected ? 11 * proj.scale : 7 * proj.scale;
        ctx.arc(proj.px, proj.py, radius, 0, Math.PI * 2);

        if (isSelected) {
          ctx.fillStyle = "#E4BE72";
          ctx.shadowColor = "rgba(228, 190, 114, 0.8)";
          ctx.shadowBlur = 16;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Inner ring
          ctx.beginPath();
          ctx.arc(proj.px, proj.py, radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(228, 190, 114, 0.4)";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(35, 25, 20, 0.9)";
          ctx.fill();
          ctx.strokeStyle = "rgba(200, 162, 75, 0.6)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Tier / Depth number badge
        ctx.fillStyle = isSelected ? "#0F0B08" : "#E4BE72";
        ctx.font = `${Math.max(10, Math.round(11 * proj.scale))}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(el.depthTier), proj.px, proj.py);

        // Label above
        ctx.fillStyle = isSelected ? "#FFF8EA" : "rgba(242, 236, 225, 0.75)";
        ctx.font = isSelected
          ? `600 ${Math.max(12, Math.round(13 * proj.scale))}px Fraunces, serif`
          : `400 ${Math.max(10, Math.round(11 * proj.scale))}px Inter, sans-serif`;
        ctx.fillText(el.name, proj.px, proj.py - radius - 10);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [rotationAngle, pitchAngle, selectedId]);

  // Touch and Mouse Drag to Rotate
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
    const dx = (e.clientX - dragStartRef.current.x) * 0.008;
    const dy = (e.clientY - dragStartRef.current.y) * 0.006;
    setRotationAngle(dragStartRef.current.rot + dx);
    setPitchAngle(Math.max(0.1, Math.min(0.75, dragStartRef.current.pitch + dy)));
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      className={`rounded-2xl border border-stone-800/80 bg-gradient-to-b from-[#18110D]/95 via-[#120D0A]/95 to-[#0D0907]/95 p-6 shadow-2xl backdrop-blur-md overflow-hidden ${
        className || ""
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-900/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#E4BE72] uppercase">
            <Compass className="w-3.5 h-3.5 text-[#C8A24B]" />
            <span>Interactive Sacred Diagram</span>
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-medium text-stone-100 mt-1">
            {title}
          </h3>
          <p className="text-sm text-stone-400 mt-1 max-w-2xl">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-900/60 border border-stone-800 px-3 py-1.5 rounded-full self-start md:self-auto">
          <Eye className="w-3.5 h-3.5 text-[#E4BE72]" />
          <span>Drag to orbit perspective (3D)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* 3D Viewport */}
        <div
          className="lg:col-span-7 h-[360px] md:h-[420px] rounded-xl relative overflow-hidden bg-radial from-[#22160F]/60 via-[#140D09]/90 to-[#0A0705] border border-amber-900/20 select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          role="region"
          aria-label="3D architectural temple model"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Quick instructions badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-[11px] text-stone-300 px-2.5 py-1 rounded-md border border-stone-800 pointer-events-none">
            <Sparkles className="w-3 h-3 text-[#E4BE72]" />
            <span>Axis: East (Entrance) → West (Garbhagriha)</span>
          </div>
        </div>

        {/* Interactive Selector & Detail Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Element Selector Tabs */}
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Temple architectural sections">
            {CANONICAL_ELEMENTS.map((elem) => {
              const active = elem.id === selectedId;
              return (
                <button
                  key={elem.id}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${containerId}-${elem.id}`}
                  onClick={() => setSelectedId(elem.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    active
                      ? "bg-[#C8A24B]/20 border-[#E4BE72] text-[#E4BE72] font-semibold shadow-[0_0_12px_rgba(200,162,75,0.25)]"
                      : "bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700"
                  }`}
                >
                  <span className="opacity-60 mr-1.5 font-mono text-[10px]">0{elem.depthTier}</span>
                  {elem.name.split("/")[0].trim()}
                </button>
              );
            })}
          </div>

          {/* Detail Spotlight Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedElement.id}
              id={`${containerId}-${selectedElement.id}`}
              role="tabpanel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-amber-800/30 bg-[#1A120D]/90 p-5 shadow-inner"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono tracking-wider text-[#E4BE72]/80 uppercase">
                    Tier 0{selectedElement.depthTier} • {selectedElement.tradition} Tradition
                  </span>
                  <h4 className="font-serif text-xl font-medium text-stone-100 mt-0.5">
                    {selectedElement.name}
                  </h4>
                  <p className="text-xs text-amber-200/70 font-sans italic">
                    {selectedElement.sanskritName}
                  </p>
                </div>
                <span className="bg-[#C8A24B]/15 text-[#E4BE72] border border-[#C8A24B]/30 text-xs px-2.5 py-1 rounded-md font-mono">
                  #0{selectedElement.depthTier}
                </span>
              </div>

              <p className="text-sm text-stone-300 mt-3 leading-relaxed">
                {selectedElement.shortDescription}
              </p>

              <div className="mt-4 pt-3 border-t border-amber-900/30 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#C8A24B] shrink-0 mt-0.5" />
                <p className="text-xs text-stone-400 leading-relaxed">
                  <strong className="text-stone-300">Metaphysical Principle: </strong>
                  {selectedElement.significance}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
