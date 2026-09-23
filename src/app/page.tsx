import { Hero } from "@/components/home/hero";
import {
  ExploreIndia,
  Famous,
  ArchitectureShowcase,
  FestivalStrip,
  PlanBand,
  TrustSection,
  CtaBand,
} from "@/components/home/sections";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0C0907] selection:bg-[#C8A24B]/30 selection:text-[#F2ECE1]">
      <Hero />
      <ExploreIndia />
      <Famous />
      <ArchitectureShowcase />
      <FestivalStrip />
      <PlanBand />
      <TrustSection />
      <CtaBand />
    </main>
  );
}