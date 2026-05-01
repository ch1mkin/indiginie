import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSessionProfile } from "@/lib/auth/profile";

export default async function EmployeeDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session) redirect("/auth/login?next=/dashboard/employee");
  if (session.profile.role !== "employee") redirect("/dashboard");

  return (
    <DashboardShell role="employee" title="Operations desk" email={session.email}>
      {children}
    </DashboardShell>
  );
}
