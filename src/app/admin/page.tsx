import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";
import { readReports } from "@/lib/reports";
import { getTemple } from "@/lib/registry";
import { getAdminDashboardData } from "@/lib/db/directory";
import { AdminConsole } from "@/components/admin-console";
import { DevyatraArt } from "@/components/devyatra-art";
import { Container, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Admin Operations Command Center" };

export default async function AdminPage() {
  const store = await cookies();
  const user = await getUserByToken(store.get(SESSION_COOKIE)?.value);
  if (!user || user.role !== "admin") redirect("/login");

  const [reports, dashboardData] = await Promise.all([
    readReports().map((r) => ({ ...r, templeName: getTemple(r.templeId)?.name ?? r.templeId })),
    getAdminDashboardData(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-32">
        <div className="absolute inset-0 -z-10 opacity-40">
          <DevyatraArt seed="admin" variant="banner" className="h-full w-full" />
        </div>
        <Container>
          <SectionHeading
            eyebrow="Admin Operations Command Center"
            title="Temple Verification & Provenance Console"
            sub={`Signed in as ${user.email} (${user.role.toUpperCase()})`}
          />
        </Container>
      </section>
      <Container className="pb-20">
        <AdminConsole data={dashboardData} reports={reports} role={user.role} />
      </Container>
    </>
  );
}