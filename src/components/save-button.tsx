"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export function SaveButton({ slug, className }: { slug: string; className?: string }) {
  const [saved, setSaved] = useState(false);
  const [synced, setSynced] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem("tem_saved");
        const local: string[] = raw ? JSON.parse(raw) : [];
        const me = await fetch("/api/me").then((r) => r.json());
        if (me.user) {
          const res = await fetch("/api/saved").then((r) => r.json());
          if (!cancelled && Array.isArray(res.saved)) {
            setSaved(res.saved.includes(slug));
            setSynced(true);
            return;
          }
        }
        if (!cancelled) setSaved(local.includes(slug));
      } catch {
        if (!cancelled) {
          try {
            const raw = localStorage.getItem("tem_saved");
            setSaved(raw ? JSON.parse(raw).includes(slug) : false);
          } catch {}
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const readLocal = (): string[] => {
    try {
      const raw = localStorage.getItem("tem_saved");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const next = !saved;

    if (synced) {
      setBusy(true);
      try {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, add: next }),
        });
        if (res.ok) setSaved(next);
      } catch {
        /* keep local fallback */
      } finally {
        setBusy(false);
      }
      return;
    }

    setSaved(next);
    try {
      const list = readLocal();
      const updated = next ? [...list, slug] : list.filter((s) => s !== slug);
      localStorage.setItem("tem_saved", JSON.stringify(updated));
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={saved ? "Remove from My Journey" : "Save to My Journey"}
      title={saved ? "Saved" : "Save"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all",
        saved
          ? "border-gold/60 bg-gold/20 text-gold-bright"
          : "border-white/15 bg-obsidian/40 text-ivory-dim hover:border-gold/40 hover:text-gold-bright",
        busy && "opacity-60",
        className
      )}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
    </button>
  );
}