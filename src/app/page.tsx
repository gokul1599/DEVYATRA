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
import { TempleOfTheDay } from "@/components/home/temple-of-the-day";
import { GeographicAtlasChapter } from "@/components/home/geographic-atlas-chapter";
import {
  BeginYourJourney,
  BeyondTheTemple,
  WeekendEscapes,
} from "@/components/home/discovery-suite";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0A0806] selection:bg-[#C8A24B]/30 selection:text-[#F2ECE1]">
      {/* 01. Cinematic Hero */}
      <Hero />

      {/* 02. Begin Your Journey: Visual Multi-Category Discovery Tiles */}
      <BeginYourJourney />

      {/* 03. India Is Calling Breathing Section */}
      <IndiaIsCalling />

      {/* 04. Daily Archival Spotlight: Temple of the Day */}
      <TempleOfTheDay />

      {/* 05. Chapter I: The Six Sacred Realms of Bharat */}
      <ExploreIndia />

      {/* 06. Geographic Atlas: Topological Nodes & Geodetic Fixes */}
      <GeographicAtlasChapter />

      {/* 07. Beyond the Temple: Complete Multi-Category Circuits */}
      <BeyondTheTemple />

      {/* 08. Sacred Landscape: River, Mountain, Forest, Road */}
      <SacredLandscape />

      {/* 09. Chapter II: Masterpieces of Stone & Living Sanctuaries */}
      <Famous />

      {/* 10. Weekend Escapes: 1, 2 & 3 Day Regional Micro-Yatras */}
      <WeekendEscapes />

      {/* 11. Chapter III: Sacred Geometry & Shilpa Shastra */}
      <ArchitectureShowcase />

      {/* 12. Chapter IV: The Celestial Calendar of Bharat */}
      <FestivalStrip />

      {/* 13. Sacred Routes & Multi-Temple Corridors */}
      <SacredRoutes />

      {/* 14. Chapter V: The Pilgrimage Studio / Plan Your Yatra */}
      <PlanBand />

      {/* 15. Beyond the Famous / Hidden Architectural Jewels */}
      <BeyondTheFamous />

      {/* 16. Chapter VI: The Archival Standard & Verification */}
      <TrustSection />

      {/* 17. Epilogue: The Open Road */}
      <CtaBand />
    </main>
  );
}