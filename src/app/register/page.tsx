import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui";
import { DevyatraArt } from "@/components/devyatra-art";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-8 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="register" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading eyebrow="Begin" title="Create your account" />
        </Container>
      </section>
      <Container className="pb-24">
        <AuthForm mode="register" />
      </Container>
    </>
  );
}