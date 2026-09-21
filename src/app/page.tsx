import { Hero } from "@/components/home/hero";
import { ExploreIndia, Categories, Famous, FestivalStrip, PlanBand, NearbyTeaser, TrustSection, CtaBand } from "@/components/home/sections";

export default function Home() {
  return (
    <>
      <Hero />
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