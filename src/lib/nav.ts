import type { AppRole } from "@/lib/types";

export type NavItem = { href: string; label: string };

export function navForRole(role: AppRole): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/dashboard/admin", label: "Dashboard" },
      { href: "/dashboard/admin/services", label: "Services Management" },
      { href: "/dashboard/admin/requests", label: "Requests" },
      { href: "/dashboard/admin/users", label: "Users" },
      { href: "/dashboard/admin/documents", label: "Documents" },
      { href: "/dashboard/admin/callbacks", label: "Callback Requests" },
      { href: "/dashboard/admin/tickets", label: "Tickets" },
      { href: "/dashboard/admin/content", label: "Content Management" },
      { href: "/dashboard/admin/analytics", label: "Analytics" },
    ];
  }
  if (role === "employee") {
    return [
      { href: "/dashboard/employee", label: "Dashboard" },
      { href: "/dashboard/employee/tickets", label: "Tickets" },
      { href: "/dashboard/employee/profile", label: "Profile" },
    ];
  }
  return [
    { href: "/dashboard/user", label: "Dashboard" },
    { href: "/dashboard/user/services", label: "My Services" },
    { href: "/dashboard/user/documents", label: "Documents" },
    { href: "/dashboard/user/support", label: "Support / Issues" },
    { href: "/dashboard/user/profile", label: "Profile" },
  ];
}
