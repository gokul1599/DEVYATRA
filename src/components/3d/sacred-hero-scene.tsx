"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * SacredHeroScene — lightweight, 3D celestial depth canvas for the Hero.
 * Renders drifting sacred geometric star rings, 3D perspective rays,
 * and celestial depth particles using native canvas with 3D projection.
 * 
 * Performance & Accessibility Guarantees:
 * - Automatically pauses when scrolled out of viewport (IntersectionObserver).
 * - Degrades to static elegant composition when prefers-reduced-motion is true.
 * - Caps particle count for smooth 60fps on mobile and low-power devices.
 */
export function SacredHeroScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Track mouse for subtle 3D parallax tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let tiltX = 0;
    let tiltY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      targetTiltX = mouseX * 25;
      targetTiltY = mouseY * 20;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", onResize, { passive: true });

    // IntersectionObserver to pause rendering when offscreen
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !reducedMotion) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    });
    observer.observe(canvas);

    // 3D Particles
    interface Particle3D {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      speed: number;
    }

    const count = 55;
    const particles: Particle3D[] = [];
    const colors = [
      "rgba(200, 162, 75, 0.45)",  // Gold
      "rgba(228, 190, 114, 0.35)", // Light gold
      "rgba(217, 130, 43, 0.30)",  // Saffron
      "rgba(242, 236, 225, 0.25)", // Moon ivory
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 1200,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 800 + 100,
        size: Math.random() * 2 + 1,
        color: colors[i % colors.length],
        speed: Math.random() * 0.4 + 0.2,
      });
    }

    let ringRotation = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      if (!isVisible) return;

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Smooth tilt interpolation
      tiltX += (targetTiltX - tiltX) * 0.05;
      tiltY += (targetTiltY - tiltY) * 0.05;

      const cx = width / 2 + tiltX;
      const cy = height * 0.4 + tiltY;

      // Draw 3D Sacred Geometry Mandala Rings
      ctx.save();
      ctx.translate(cx, cy);

      if (!reducedMotion) {
        ringRotation += delta * 0.08;
      }

      ctx.rotate(ringRotation);

      // Outer golden sacred ring with dash
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200, 162, 75, 0.09)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 12]);
      ctx.stroke();

      // Middle concentric ring
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(217, 130, 43, 0.07)";
      ctx.setLineDash([8, 8]);
      ctx.stroke();

      // Inner 8-pointed star
      ctx.setLineDash([]);
      for (let s = 0; s < 8; s++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.beginPath();
        ctx.moveTo(0, -75);
        ctx.lineTo(14, -100);
        ctx.lineTo(0, -125);
        ctx.lineTo(-14, -100);
        ctx.closePath();
        ctx.strokeStyle = "rgba(200, 162, 75, 0.05)";
        ctx.stroke();
      }

      ctx.restore();

      // Project & Render 3D Celestial Dust Particles
      const fov = 350;
      for (const p of particles) {
        if (!reducedMotion) {
          p.z -= p.speed * 20 * delta;
          if (p.z <= 10) {
            p.z = 800;
            p.x = (Math.random() - 0.5) * 1200;
            p.y = (Math.random() - 0.5) * 800;
          }
        }

        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, p.size * scale), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }

      if (!reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    if (reducedMotion) {
      render(performance.now());
    } else {
      animId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 pointer-events-none"}
      aria-hidden="true"
    />
  );
}
