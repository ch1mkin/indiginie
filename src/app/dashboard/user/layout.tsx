import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSessionProfile } from "@/lib/auth/profile";

export default async function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session) redirect("/auth/login?next=/dashboard/user");
  if (session.profile.role !== "user") redirect("/dashboard");

  return (
    <DashboardShell role="user" title="NRI client desk" email={session.email}>
      {children}
    </DashboardShell>
  );
}
