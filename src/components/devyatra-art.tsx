import { cn } from "@/lib/cn";

/**
 * DevyatraArt — deterministic, cinematic SVG temple art.
 * Generates a stylised temple silhouette (Nagara/Dravidian/Kalinga soul)
 * over an atmospheric dusk gradient, with glow, light rays, mist and dust
 * particles. Seeded per temple so every shrine feels distinct.
 */

const mulberry32 = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hashSeed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

function shikharaPath(style: string, x: number, baseY: number, w: number, h: number) {
  const cx = x;
  const half = w / 2;
  const topY = baseY - h;
  const l = (n: number) => n.toFixed(1);
  if (style === "nagara" || style === "vesara" || style === "kakatiya") {
    // Curved, tapering shikhara with latavasin segments
    let d = `M ${l(cx - half)} ${l(baseY)} `;
    const segs = 6;
    for (let i = 1; i <= segs; i++) {
      const p = i / segs;
      const y = baseY - h * p;
      const shrink = half * (1 - Math.pow(p, 1.45));
      d += `L ${l(cx - shrink)} ${l(y)} `;
    }
    d += `L ${l(cx - half * 0.12)} ${l(topY - h * 0.18)} L ${l(cx + half * 0.12)} ${l(topY - h * 0.18)} `;
    for (let i = segs - 1; i >= 1; i--) {
      const p = i / segs;
      const y = baseY - h * p;
      const shrink = half * (1 - Math.pow(p, 1.45));
      d += `L ${l(cx + shrink)} ${l(y)} `;
    }
    d += `Z`;
    return d;
  }
  if (style === "dravidian" || style === "kerala") {
    // Stepped pyramidal vimana + dome
    let d = `M ${l(cx - half)} ${l(baseY)} `;
    const tiers = 5;
    for (let i = 1; i <= tiers; i++) {
      const p = i / tiers;
      const y = baseY - h * p;
      const shrink = half * (1 - p * 0.9);
      d += `L ${l(cx - shrink)} ${l(y - h * 0.02)} L ${l(cx - shrink + half * 0.1)} ${l(y)} `;
    }
    d += `L ${l(cx - half * 0.16)} ${l(topY - h * 0.12)} L ${l(cx + half * 0.16)} ${l(topY - h * 0.12)} `;
    d += `A ${l(half * 0.16)} ${l(half * 0.16)} 0 0 0 ${l(cx - half * 0.16)} ${l(topY - h * 0.12)} `;
    for (let i = tiers - 1; i >= 1; i--) {
      const p = i / tiers;
      const y = baseY - h * p;
      const shrink = half * (1 - p * 0.9);
      d += `L ${l(cx + shrink - half * 0.1)} ${l(y)} L ${l(cx + shrink)} ${l(y - h * 0.02)} `;
    }
    d += `Z`;
    return d;
  }
  if (style === "kalinga") {
    // Broad, vertical-faced deul with concave top
    let d = `M ${l(cx - half)} ${l(baseY)} L ${l(cx - half * 0.86)} ${l(baseY - h * 0.72)} `;
    d += `Q ${l(cx - half * 0.3)} ${l(baseY - h * 0.86)} ${l(cx - half * 0.14)} ${l(topY - h * 0.14)} `;
    d += `L ${l(cx - half * 0.14)} ${l(topY - h * 0.32)} L ${l(cx + half * 0.14)} ${l(topY - h * 0.32)} `;
    d += `L ${l(cx + half * 0.14)} ${l(topY - h * 0.14)} Q ${l(cx + half * 0.3)} ${l(baseY - h * 0.86)} ${l(cx + half * 0.86)} ${l(baseY - h * 0.72)} `;
    d += `L ${l(cx + half)} ${l(baseY)} Z`;
    return d;
  }
  // classic cave/hill
  return `M ${l(cx - half)} ${l(baseY)} C ${l(cx - half)} ${l(baseY - h * 0.4)} ${l(cx - half * 0.5)} ${l(baseY - h * 0.75)} ${l(cx)} ${l(baseY - h * 0.85)} C ${l(cx + half * 0.5)} ${l(baseY - h * 0.75)} ${l(cx + half)} ${l(baseY - h * 0.4)} ${l(cx + half)} ${l(baseY)} Z`;
}

export function DevyatraArt({
  seed = "devyatra",
  className,
  variant = "card",
}: {
  seed: string;
  className?: string;
  variant?: "card" | "hero" | "banner";
}) {
  const rnd = mulberry32(hashSeed(seed));
  const stylePick: string[] = ["nagara", "dravidian", "kalinga", "vesara", "nagara", "dravidian"];
  const style = stylePick[Math.floor(rnd() * stylePick.length)];
  const W = 800;
  const H = variant === "hero" ? 900 : variant === "banner" ? 500 : 520;
  const sky = variant === "hero" ? `radial-gradient(120% 90% at 50% 18%, rgba(222,170,90,${0.16 + rnd() * 0.05}), rgba(150,70,90,0.08) 45%, rgba(13,11,9,0) 72%), linear-gradient(180deg, #17130e 0%, #120f0c 55%, #0d0b09 100%)` : `radial-gradient(120% 120% at 50% 0%, rgba(${210 + rnd() * 30},${150 + rnd() * 40},70,0.18) 0%, rgba(90,40,60,0.1) 50%, rgba(13,11,9,0) 70%), linear-gradient(180deg,#181410,#100d0b)`;

  const particles = Array.from({ length: variant === "hero" ? 26 : 12 }, () => ({
    x: rnd() * 100,
    y: rnd() * 100,
    r: 0.8 + rnd() * 1.8,
    o: 0.15 + rnd() * 0.4,
  }));

  const towerX = 400;
  const towerW = variant === "hero" ? 240 : 180;
  const towerH = variant === "hero" ? 360 : 240;
  const towerBaseY = variant === "hero" ? 770 : 430;

  const hillA = `M 0 ${H} C 120 ${H - 110 - rnd() * 30} 300 ${H - 70} 480 ${H - 130 - rnd() * 20} C 640 ${H - 60} 720 ${H - 120} 800 ${H - 90} L 800 ${H} Z`;
  const hillB = `M 0 ${H} C 200 ${H - 46} 420 ${H - 20} 620 ${H - 56} C 700 ${H - 24} 760 ${H - 40} 800 ${H - 30} L 800 ${H} Z`;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      role="img"
      aria-label={`Artistic rendering of ${seed}`}
      style={{ background: sky }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id={`glow-${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2d9a0" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f2d9a0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`tower-${seed}`} x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor="#241c12" />
            <stop offset="55%" stopColor="#2e2414" />
            <stop offset="100%" stopColor="#1c1610" />
          </linearGradient>
          <linearGradient id={`towerEdge-${seed}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(228,190,114,0.34)" />
            <stop offset="100%" stopColor="rgba(228,190,114,0.05)" />
          </linearGradient>
          <radialGradient id={`orb-${seed}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe9bd" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#e4be72" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#e4be72" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* light rays */}
        <g opacity="0.16">
          {[130, -60].map((rot, i) => (
            <ellipse
              key={rot}
              cx="400"
              cy="120"
              rx="520"
              ry="240"
              fill={`url(#orb-${seed})`}
              transform={`rotate(${rot} 400 120)`}
              opacity={0.55 + i * 0.2}
            />
          ))}
        </g>

        {/* sun/moon orb */}
        <circle cx={variant === "hero" ? 400 : 620} cy={variant === "hero" ? 210 : 130} r={variant === "hero" ? 70 : 42} fill={`url(#orb-${seed})`} />

        {/* hills */}
        <path d={hillA} fill="#16110c" opacity="0.9" />
        <path d={hillB} fill="#1d1712" />

        {/* temple base */}
        <rect x={variant === "hero" ? 210 : 260} y={towerBaseY - 8} width={variant === "hero" ? 380 : 280} height="14" rx="2" fill="#2a2116" />
        <rect x={variant === "hero" ? 240 : 285} y={towerBaseY + 6} width={variant === "hero" ? 320 : 230} height="24" fill="#241c12" opacity="0.9" />

        {/* main tower */}
        <path d={shikharaPath(style, towerX, towerBaseY, towerW, towerH)} fill={`url(#tower-${seed})`} stroke={`url(#towerEdge-${seed})`} strokeWidth="1.6" />

        {/* sanctuary block */}
        <rect x={towerX - towerW / 2} y={towerBaseY - towerH * 0.34} width={towerW} height={towerH * 0.34} rx="2" fill="#221a11" stroke="rgba(228,190,114,0.12)" />

        {/* doorway */}
        <path
          d={`M ${towerX - 26} ${towerBaseY} L ${towerX - 26} ${towerBaseY - 64} Q ${towerX} ${towerBaseY - 92} ${towerX + 26} ${towerBaseY - 64} L ${towerX + 26} ${towerBaseY} Z`}
          fill="#0c0a07"
        />
        <circle cx={towerX} cy={towerBaseY - 46} r="4.5" fill="#e4be72" opacity="0.9" />

        {/* pole finials */}
        <rect x={towerX - 2.5} y={towerBaseY - towerH - 34} width="5" height="34" fill="#3a2c1a" />
        <circle cx={towerX} cy={towerBaseY - towerH - 42} r="8" fill="#e4be72" opacity="0.85" />

        {/* banner flags offset (dravidian) */}
        {style !== "nagara" && (
          <rect x={towerX - towerW / 2 + 8} y={towerBaseY - towerH * 0.78} width="3" height="40" fill="#4a3820" transform={`rotate(-8 ${towerX - towerW / 2 + 8} ${towerBaseY})`} />
        )}

        {/* side shrines */}
        <path d={shikharaPath("dravidian", towerX - towerW - 46, towerBaseY, 74, towerH * 0.42)} fill="#201910" opacity="0.85" />
        <path d={shikharaPath("dravidian", towerX + towerW + 46, towerBaseY, 74, towerH * 0.42)} fill="#201910" opacity="0.85" />

        {/* particles */}
        <g fill="#e8d5a8">
          {particles.map((p, i) => (
            <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} opacity={p.o} />
          ))}
        </g>

        {/* mist at base */}
        <ellipse cx="50%" cy={towerBaseY + 40} rx="70%" ry="30" fill="#e4be72" opacity="0.05" />
      </svg>

      {/* atmospheric vignette */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 100% at 50% 30%, transparent 55%, rgba(4,3,2,0.55) 100%)" }} />
    </div>
  );
}