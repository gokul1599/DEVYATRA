import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { readReports } from "@/lib/reports";
import { TEMPLES, getTemple } from "@/lib/registry";
import { AdminConsole } from "@/components/admin-console";
import { DevyatraArt } from "@/components/devyatra-art";
import { Container, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Admin console" };

export default async function AdminPage() {
  const store = await cookies();
  const user = getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") redirect("/login");

  const reports = readReports().map((r) => ({ ...r, templeName: getTemple(r.templeId)?.name ?? r.templeId }));

  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="admin" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading
            eyebrow="Admin console"
            title="From reports to verified listings"
            sub={`Signed in as ${user.email}`}
          />
        </Container>
      </section>
      <Container className="pb-20">
        <AdminConsole reports={reports} templeCount={TEMPLES.length} role={user.role} />
      </Container>
    </>
  );
}