import { Compass } from "lucide-react";

export function MapLoadingSkeleton() {
  return (
    <div className="relative flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)] w-full flex-col lg:flex-row overflow-hidden bg-obsidian">
      {/* Top Floating Controls Skeleton */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-col gap-2 px-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-xl items-center gap-2">
          <div className="h-11 w-full rounded-2xl bg-stone-900/80 border border-stone-800/80 animate-pulse backdrop-blur-md" />
          <div className="h-11 w-28 shrink-0 rounded-2xl bg-stone-900/80 border border-stone-800/80 animate-pulse backdrop-blur-md" />
        </div>
      </div>

      {/* Map Canvas Placeholder */}
      <div className="relative flex-1 w-full h-full bg-[#110E0C] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-[#C8A24B]/30 bg-[#1C1812]/90 text-[#C8A24B] shadow-2xl shadow-[#C8A24B]/10 animate-pulse">
          <Compass className="h-8 w-8 animate-spin text-[#C8A24B] duration-3000" />
        </div>
        <h3 className="mt-5 font-serif text-xl font-medium text-[#F2ECE1]">
          Initializing Sacred Atlas
        </h3>
        <p className="mt-2 max-w-sm font-sans text-xs text-stone-400 leading-relaxed">
          Connecting to verified sanctuary coordinates, administrative boundaries, and live geospatial points…
        </p>
      </div>

      {/* Side Rail Skeleton */}
      <aside className="hidden lg:flex flex-col border-stone-800/80 bg-stone-950/95 backdrop-blur-xl lg:w-[380px] lg:border-l p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
          <div className="h-4 w-32 bg-stone-900 rounded-md animate-pulse" />
          <div className="h-3 w-16 bg-stone-900 rounded-md animate-pulse" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 w-full rounded-2xl bg-stone-900/60 border border-stone-800/60 animate-pulse" />
        ))}
      </aside>
    </div>
  );
}
