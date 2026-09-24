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
import {
  IndiaIsCalling,
  SacredLandscape,
  SacredRoutes,
  BeyondTheFamous,
} from "@/components/home/narrative-chapters";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0A0806] selection:bg-[#C8A24B]/30 selection:text-[#F2ECE1]">
      {/* 01. Cinematic Hero */}
      <Hero />

      {/* 02. India Is Calling Breathing Section */}
      <IndiaIsCalling />

      {/* 03. Chapter I: The Six Sacred Realms & Geographic Atlas */}
      <ExploreIndia />

      {/* 04. Sacred Landscape: River, Mountain, Forest, Road */}
      <SacredLandscape />

      {/* 05. Chapter II: Masterpieces of Stone & Living Sanctuaries */}
      <Famous />

      {/* 06. Chapter III: Sacred Geometry & Shilpa Shastra */}
      <ArchitectureShowcase />

      {/* 07. Chapter IV: The Celestial Calendar of Bharat */}
      <FestivalStrip />

      {/* 08. Sacred Routes & Multi-Temple Corridors */}
      <SacredRoutes />

      {/* 09. Chapter V: The Pilgrimage Studio / Plan Your Yatra */}
      <PlanBand />

      {/* 10. Beyond the Famous / Hidden Architectural Jewels */}
      <BeyondTheFamous />

      {/* 11. Chapter VI: The Archival Standard & Verification */}
      <TrustSection />

      {/* 12. Epilogue: The Open Road */}
      <CtaBand />
    </main>
  );
}