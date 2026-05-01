import { redirect } from "next/navigation";

import { dashboardHomeForRole, getSessionProfile, isUserProfileComplete } from "@/lib/auth/profile";

export default async function DashboardIndexPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/auth/login?next=/dashboard");
  if (session.profile.role === "user" && !isUserProfileComplete(session.profile)) {
    redirect("/dashboard/user/profile?required=1");
  }
  redirect(dashboardHomeForRole(session.profile.role));
}
