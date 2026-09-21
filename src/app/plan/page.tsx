import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import PlanStudio from "@/components/plan-studio";

export const metadata: Metadata = {
  title: "Plan a trip",
  description: "AI-generated, context-scoped temple itineraries — darshan timing, food, transport and pacing.",
};

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ temple?: string }> }) {
  const { temple } = await searchParams;
  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="plan-studio" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading
            eyebrow="The planner"
            title="A darshan plan, crafted for your day"
            sub="Pick a temple, set your hours and mood — the planner builds a step-by-step itinerary from verified context, never invented timings."
          />
        </Container>
      </section>
      <Container className="pb-20">
        <PlanStudio key={temple ?? "all"} />
      </Container>
    </>
  );
}