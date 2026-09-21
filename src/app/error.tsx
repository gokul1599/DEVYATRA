"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Devyatra page error:", error.message, error.digest ?? "");
  }, [error]);

  return (
    <section className="flex min-h-[70svh] items-center justify-center px-5 pt-28">
      <div className="max-w-md rounded-3xl border border-line bg-obsidian-2 p-8 text-center">
        <p className="font-display text-2xl font-medium text-ivory">The sacred path hit a hiccup</p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ivory-dim">
          This page could not be rendered just now. Reload, or return home and try another route.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-6 py-3 text-sm font-semibold text-obsidian transition-all hover:brightness-110"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>
      </div>
    </section>
  );
}