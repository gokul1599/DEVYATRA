import { type ReactNode, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { VERIFY_COLOR, VERIFY_LABEL } from "@/lib/format";
import type { VerificationStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "soft";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 disabled:opacity-45 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-saffron/90 to-gold text-obsidian shadow-[0_10px_30px_-10px_rgba(217,130,43,0.55)] hover:shadow-[0_16px_40px_-12px_rgba(217,130,43,0.7)] hover:brightness-110",
  outline:
    "border border-ivory/15 text-ivory hover:border-gold/60 hover:text-gold-bright bg-transparent",
  ghost: "text-ivory-dim hover:text-ivory hover:bg-white/5",
  soft: "bg-white/[0.06] text-ivory hover:bg-white/[0.1] border border-white/5",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-4 py-1.5",
  md: "text-sm px-6 py-2.5",
  lg: "text-[15px] px-8 py-3.5",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Chip({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "gold" | "terracotta" | "green" | "neutral";
  className?: string;
}) {
  const tones = {
    default: "bg-white/[0.05] text-ivory-dim border-white/10",
    gold: "bg-gold/12 text-gold-bright border-gold/25",
    terracotta: "bg-terracotta/15 text-[#e08568] border-terracotta/30",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    neutral: "bg-white/[0.03] text-ivory-dim border-white/8",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-medium leading-none tracking-wide",
        tones,
        className
      )}
    >
      {children}
    </span>
  );
}

export function VerifyBadge({
  verification,
  compact = false,
}: {
  verification?: { status: VerificationStatus; source?: { org?: string } | null } | undefined;
  compact?: boolean;
}) {
  if (!verification?.status) return null;
  const tone = VERIFY_COLOR[verification.status] || "bg-zinc-500/15 text-zinc-400 border-zinc-600/30";
  let label = VERIFY_LABEL[verification.status] || verification.status.replace(/_/g, " ");
  if (compact) {
    if (verification.status === "VERIFIED_OFFICIAL") label = "✓ Official";
    else if (verification.status === "VERIFIED_SOURCE") label = "◐ Source Verified";
    else if (verification.status === "NEEDS_VERIFICATION") label = "⚠ Pending";
    else label = verification.status.replace(/_/g, " ");
  }
  return (
    <span
      title={verification.source?.org ? `Source: ${verification.source.org}` : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider",
        tone
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "left",
  className,
  id,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-10 md:mb-14", align === "center" && "text-center", id && "scroll-mt-28", className)}>
      {id && <span id={id} className="sr-only" />}
      {eyebrow && (
        <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.28em] text-gold">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl font-medium text-ivory sm:text-4xl md:text-[2.9rem] leading-[1.12] tracking-tight">
        {title}
      </h2>
      {sub && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ivory-dim">{sub}</p>}
    </div>
  );
}

export function Container({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-8", wide ? "max-w-[1440px]" : "max-w-[1200px]", className)}>
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function EmptyState({
  icon,
  title,
  sub,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  sub?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-line px-8 py-16 text-center",
        className
      )}
    >
      {icon && <div className="mb-4 text-3xl opacity-70">{icon}</div>}
      <p className="font-display text-lg text-ivory">{title}</p>
      {sub && <p className="mt-2 max-w-sm text-sm text-ivory-dim">{sub}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1.5 text-[12.5px] text-ivory-dim", className)}>
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={c.label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-ivory-dim/50">/</span>}
            {c.href && !last ? (
              <Link href={c.href} className="transition-colors hover:text-gold-bright">
                {c.label}
              </Link>
            ) : (
              <span className={cn(last && "text-ivory")}>{c.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* ---------- form primitives ---------- */

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium uppercase tracking-wider text-ivory-dim">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-[11.5px] text-ivory-dim/70">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-obsidian-2 px-4 py-3 text-sm text-ivory placeholder:text-ivory-dim/50 transition-colors focus:border-gold/50 focus:outline-none";

export function Select({
  children,
  className,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputCls, "appearance-none", className)} {...rest}>
      {children}
    </select>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "h-10" : size === "sm" ? "h-7" : "h-8";
  const txt = size === "lg" ? "text-2xl" : "text-lg";
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Templeora home">
      <svg viewBox="0 0 40 40" className={cn(s, "w-auto")} aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e4be72" />
            <stop offset="100%" stopColor="#b9832f" />
          </linearGradient>
        </defs>
        <path
          d="M20 4 33 12v5H7v-5z"
          fill="url(#logo-g)"
          opacity="0.9"
        />
        <path d="M20 13 27 18H13z" fill="#f2ece1" />
        <rect x="12" y="18" width="16" height="14" rx="1.5" fill="url(#logo-g)" opacity="0.85" />
        <path d="M17 24h6v8h-6z" fill="#14110d" />
        <circle cx="20" cy="25.5" r="1.1" fill="#e4be72" />
      </svg>
      <span className={cn("font-display font-semibold tracking-wide gold-text uppercase", txt)}>
        Templeora
      </span>
    </Link>
  );
}