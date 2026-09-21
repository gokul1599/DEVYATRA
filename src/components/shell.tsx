"use client";

import { ReactNode } from "react";
import { AppProviders } from "@/components/providers";
import { Header, MobileNav } from "@/components/header";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/cn";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <div className="relative flex min-h-screen flex-col bg-obsidian text-ivory antialiased transition-colors duration-500">
        {/* ambient background */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(52% 42% at 50% -6%, rgba(200,162,75,0.10), transparent 60%), radial-gradient(34% 26% at 88% 12%, rgba(180,90,61,0.07), transparent 60%), radial-gradient(40% 30% at 8% 30%, rgba(200,162,75,0.05), transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(242,236,225,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(242,236,225,0.6) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(60% 50% at 50% 0%, black, transparent)",
              WebkitMaskImage: "radial-gradient(60% 50% at 50% 0%, black, transparent)",
            }}
          />
        </div>

        <Header />
        <main className={cn("relative z-10 flex-1")}>{children}</main>
        <Footer />
        <MobileNav />
      </div>
    </AppProviders>
  );
}