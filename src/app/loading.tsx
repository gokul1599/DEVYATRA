import { Container } from "@/components/ui";

export default function Loading() {
  return (
    <section className="flex min-h-[70svh] items-center justify-center pt-28">
      <Container>
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="skeleton h-4 w-28 rounded-full" />
          <div className="skeleton h-10 w-3/4 rounded-2xl" />
          <div className="skeleton h-4 w-1/2 rounded-full" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="skeleton h-40 rounded-3xl" />
            <div className="skeleton h-40 rounded-3xl" />
          </div>
          <div className="skeleton h-24 rounded-3xl" />
        </div>
      </Container>
    </section>
  );
}