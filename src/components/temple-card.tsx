import Link from "next/link";
import { MapPin, Quote, Flame, Crown, Landmark, CalendarDays, ShieldCheck, Ticket } from "lucide-react";
import { Temple, TempleBadge } from "@/lib/types";
import { getState } from "@/lib/registry";
import { VerifyBadge, Chip } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import { SaveButton } from "@/components/save-button";
import { Lift } from "@/components/motion";
import { cn } from "@/lib/cn";

const BADGE_ICON: Record<TempleBadge, { icon: typeof Flame; cls: string }> = {
  "Major Pilgrimage": { icon: Flame, cls: "text-terracotta" },
  Historic: { icon: Landmark, cls: "text-gold-bright" },
  Heritage: { icon: Landmark, cls: "text-gold" },
  "UNESCO World Heritage": { icon: Landmark, cls: "text-gold-bright" },
  "Online Booking": { icon: Ticket, cls: "text-saffron" },
  Festival: { icon: CalendarDays, cls: "text-ivory-dim" },
  Verified: { icon: ShieldCheck, cls: "text-emerald-400" },
  "Free Entry": { icon: Crown, cls: "text-ivory-dim" },
};

export function TempleCard({
  temple,
  stateSlug,
  index = 0,
  showLocation = true,
  featured = false,
  className,
}: {
  temple: Temple;
  stateSlug: string;
  index?: number;
  showLocation?: boolean;
  featured?: boolean;
  className?: string;
}) {
  const state = getState(stateSlug);
  const href = `/temples/${stateSlug}/${temple.slug}`;
  const badges = temple.badges.slice(0, featured ? 3 : 2);

  return (
    <Lift>
      <Link
        href={href}
        className={cn(
          "group relative block overflow-hidden rounded-3xl border border-line bg-obsidian-2 transition-colors duration-500 hover:border-gold/30",
          className
        )}
      >
        <div className={cn("relative overflow-hidden", featured ? "aspect-[16/9]" : "aspect-[4/3]")}>
          <div className="absolute inset-0 transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]">
            <DevyatraArt seed={`${temple.name}-${index}`} />
          </div>

          <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
            <VerifyBadge verification={temple.source} compact />
          </div>
          <div className="absolute right-3 top-3">
            <SaveButton slug={temple.slug} />
          </div>

          {/* metadata chip row */}
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1.5">
            {badges.map((b) => {
            const def = BADGE_ICON[b] ?? { icon: ShieldCheck, cls: "text-ivory-dim" };
            const Icon = def.icon;
            return (
                <span
                  key={b}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium backdrop-blur-sm",
                    "border-white/12 bg-obsidian/55 text-ivory"
                  )}
                >
                  <Icon className={cn("h-3 w-3", def.cls)} />
                  {b}
                </span>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-[20px] font-medium leading-snug text-ivory transition-colors group-hover:text-gold-bright">
                {temple.name}
              </h3>
              {temple.nameLocal && (
                <p className="mt-0.5 text-[12px] text-ivory-dim/70">{temple.nameLocal}</p>
              )}
            </div>
          </div>

          {showLocation && (
            <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-ivory-dim">
              <MapPin className="h-3.5 w-3.5 text-gold-dim" />
              {temple.location}, {temple.district}
              {state ? `, ${state.name}` : ""}
            </p>
          )}

          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-ivory-dim/85">
            {temple.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {temple.deities.slice(0, 2).map((d) => (
              <Chip key={d} tone="gold">
                <Quote className="h-2.5 w-2.5" />
                {d}
              </Chip>
            ))}
            <Chip>{temple.architecture ?? temple.type}</Chip>
          </div>
        </div>
      </Link>
    </Lift>
  );
}