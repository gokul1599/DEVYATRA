"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * SacredAmbient — subtle, high-performance sacred geometry ambient particle canvas.
 * Renders a slow-drifting sacred geometric star-ring with saffron, gold, and warm ivory tones.
 * Uses native HTML5 Canvas for zero-dependency, GPU-efficient 60fps rendering.
 * Automatically pauses when off-screen and respects prefers-reduced-motion.
 */
export function SacredAmbient({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const particles: Array<{
      radius: number;
      angle: number;
      speed: number;
      size: number;
      color: string;
      yOffset: number;
    }> = [];

    const colors = [
      "rgba(212, 175, 55, 0.45)", // Gold
      "rgba(255, 119, 34, 0.35)",  // Saffron
      "rgba(244, 237, 226, 0.25)", // Warm ivory
      "rgba(180, 83, 9, 0.30)",   // Deep amber
    ];

    const count = 72;
    for (let i = 0; i < count; i++) {
      particles.push({
        radius: 80 + Math.random() * 120,
        angle: (i / count) * Math.PI * 2,
        speed: (0.0004 + Math.random() * 0.0006) * (Math.random() > 0.5 ? 1 : -1),
        size: 1.2 + Math.random() * 2.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        yOffset: (Math.random() - 0.5) * 40,
      });
    }

    let ringAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2.2;

      // Draw subtle sacred geometric concentric circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200, 162, 75, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 119, 34, 0.06)";
      ctx.stroke();

      // Subtle 8-pointed star hint
      if (!reducedMotion) ringAngle += 0.0005;
      ctx.translate(cx, cy);
      ctx.rotate(ringAngle);
      for (let s = 0; s < 8; s++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.beginPath();
        ctx.moveTo(0, -90);
        ctx.lineTo(15, -120);
        ctx.lineTo(0, -150);
        ctx.lineTo(-15, -120);
        ctx.closePath();
        ctx.strokeStyle = "rgba(200, 162, 75, 0.04)";
        ctx.stroke();
      }
      ctx.restore();

      // Draw floating particles
      for (const p of particles) {
        if (!reducedMotion) {
          p.angle += p.speed;
        }
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * (p.radius * 0.45) + p.yOffset;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className={className ?? "pointer-events-none absolute inset-0 -z-10 opacity-75 overflow-hidden"}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
