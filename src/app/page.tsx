import { Hero } from "@/components/home/hero";
import { PersonaEntryCards } from "@/components/home/persona-entry";
import { ExploreIndia, Categories, Famous, FestivalStrip, PlanBand, NearbyTeaser, TrustSection, CtaBand } from "@/components/home/sections";

export default function Home() {
  return (
    <>
      <Hero />
      <PersonaEntryCards />
      <ExploreIndia />
      <Categories />
      <Famous />
      <FestivalStrip />
      <PlanBand />
      <NearbyTeaser />
      <TrustSection />
      <CtaBand />
    </>
  );
}