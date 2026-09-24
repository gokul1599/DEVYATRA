import type { Metadata } from "next";
import Image from "next/image";
import { Compass, Sparkles } from "lucide-react";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In · Templeora",
  description: "Sign in to Templeora — India's Sacred Atlas to access your saved temples and custom pilgrimage itineraries.",
};

export default function LoginPage() {
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
              Pilgrim Sanctuary
            </span>
            <h2 className="mt-3 font-serif text-3xl xl:text-4xl font-normal text-[#F2ECE1] leading-snug">
              Every stone carries memory. Every river remembers a prayer.
            </h2>
            <p className="mt-4 text-sm text-stone-300 leading-relaxed font-sans">
              Sign in to sync your saved sanctuaries, access personalized pilgrimage corridors, and consult our verified AI companion.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-xs font-mono text-stone-400">
            <span>2,205 Sanctuaries</span>
            <span>•</span>
            <span>36 States &amp; UTs</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> 100% Verified
            </span>
          </div>
        </div>

        {/* Right: Minimalist Luxury Auth Form */}
        <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:col-span-6 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#C8A24B]">
                Welcome Back
              </span>
              <h1 className="mt-2 font-serif text-3xl font-medium text-[#F2ECE1]">
                Sign in to your journey
              </h1>
              <p className="mt-2 text-xs text-stone-400">
                Continue your personal pilgrimage through sacred Bharat.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/70 p-7 sm:p-8 backdrop-blur-md shadow-2xl">
              <AuthForm mode="login" />
            </div>

            <p className="mt-8 text-center text-xs text-stone-500 font-mono">
              Protected by Templeora verified session authentication.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}