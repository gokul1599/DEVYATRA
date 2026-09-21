import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="login" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading eyebrow="Welcome back" title="Sign in to your journey" />
        </Container>
      </section>
      <Container className="pb-24">
        <AuthForm mode="login" />
      </Container>
    </>
  );
}