import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSessionProfile } from "@/lib/auth/profile";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session) redirect("/auth/login?next=/dashboard/admin");
  if (session.profile.role !== "admin") redirect("/dashboard");

  return (
    <DashboardShell role="admin" title="Administration" email={session.email}>
      {children}
    </DashboardShell>
  );
}
