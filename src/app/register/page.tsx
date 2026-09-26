import type { Metadata } from "next";
import Image from "next/image";
import { Compass, Sparkles } from "lucide-react";
import AuthForm from "@/components/auth-form";
import { getPlatformStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Begin Your Journey · Templeora",
  description: "Create an account on Templeora — India's Sacred Atlas to curate sacred yatra corridors, record darshans, and explore verified temples.",
};

export default async function RegisterPage() {
  const stats = await getPlatformStats();

  return (
    <main className="relative min-h-screen bg-[#0A0806] pt-16 lg:pt-0">
      <div className="grid min-h-[calc(100vh-64px)] lg:min-h-screen lg:grid-cols-12">
        {/* Left: Atmospheric Sanctuary Photography (Desktop) */}
        <div className="relative hidden lg:col-span-6 lg:flex flex-col justify-between overflow-hidden border-r border-stone-800/80 p-12">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/images/templeora-hero.png"
              alt="Templeora Sacred Sanctuary"
              fill
              priority
              className="object-cover object-center brightness-[0.75] contrast-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0806] via-transparent to-[#0A0806]/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0A0806]" />
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-[#C8A24B]">
            <Compass className="h-4 w-4" />
            <span>India&apos;s Sacred Atlas</span>
          </div>

          <div className="relative z-10 max-w-lg">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#E4BE72]">
              Join The Pilgrimage
            </span>
            <h2 className="mt-3 font-serif text-3xl xl:text-4xl font-normal text-[#F2ECE1] leading-snug">
              Begin your sacred pilgrimage through timeless Bharat.
            </h2>
            <p className="mt-4 text-sm text-stone-300 leading-relaxed font-sans">
              Create an account to curate your custom pilgrimage circuits, preserve spiritual reflections, and receive real-time darshan alerts across India.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-xs font-mono text-stone-400">
            <span>{stats.formattedTotalTemples} Sanctuaries</span>
            <span>•</span>
            <span>{stats.formattedStates} States &amp; UTs</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> 100% Free Forever
            </span>
          </div>
        </div>

        {/* Right: Minimalist Luxury Auth Form */}
        <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:col-span-6 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#C8A24B]">
                New Pilgrim
              </span>
              <h1 className="mt-2 font-serif text-3xl font-medium text-[#F2ECE1]">
                Create your account
              </h1>
              <p className="mt-2 text-xs text-stone-400">
                Start your journey into sacred architecture, rituals, and routes.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/70 p-7 sm:p-8 backdrop-blur-md shadow-2xl">
              <AuthForm mode="register" />
            </div>

            <p className="mt-8 text-center text-xs text-stone-500 font-mono">
              Zero spam. Respecting your privacy and spiritual contemplation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}