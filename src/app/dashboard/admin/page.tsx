import Link from "next/link";
import { Clock3, PhoneCall, LifeBuoy, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: users }, { count: requests }, { count: callbacks }, { count: tickets }, { data: recent }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("user_services").select("*", { count: "exact", head: true }),
    supabase.from("callback_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("user_services")
      .select("id, status, created_at, service_id, user_id, payment_status, call_completed")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);
  const [{ data: services }, { data: profiles }] = await Promise.all([
    supabase.from("services").select("id, title"),
    supabase.from("profiles").select("id, full_name"),
  ]);
  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.title]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const estimatedRevenue = ((requests ?? 0) - (callbacks ?? 0)) * 9500;
  const metrics = [
    { label: "Active requests", value: requests ?? 0, icon: Clock3 },
    { label: "Pending callbacks", value: callbacks ?? 0, icon: PhoneCall },
    { label: "Open tickets", value: tickets ?? 0, icon: LifeBuoy },
    { label: "Client directory", value: users ?? 0, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
          <Card key={m.label} className="border-blue-100/80 bg-white shadow-sm transition hover:-translate-y-0.5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-950">
                  <Icon className="size-5" />
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold tracking-widest text-blue-950 uppercase">
                  Live
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-slate-900">{m.value}</div>
              <div className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">{m.label}</div>
            </CardContent>
          </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden border-blue-100/80">
          <CardHeader className="border-b bg-blue-50/50">
            <CardTitle className="text-sm font-bold tracking-widest text-blue-950 uppercase">Service request inventory</CardTitle>
            <CardDescription>Latest client transitions and operational status.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px]">
              <thead className="bg-slate-50">
                <tr className="text-left text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  <th className="px-4 py-3">Request</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Call</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(recent ?? []).map((r) => (
                  <tr key={r.id} className="text-sm hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{serviceMap.get(r.service_id) ?? r.service_id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">{profileMap.get(r.user_id) ?? r.user_id}</td>
                    <td className="px-4 py-3 capitalize">{r.status}</td>
                    <td className="px-4 py-3">{formatLabel(r.payment_status ?? "not_paid")}</td>
                    <td className="px-4 py-3">{r.call_completed ? "Done" : "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-950 to-primary text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">Admin command</CardTitle>
            <CardDescription className="text-blue-100">
              Coordinate assignments, payment verification, and callback operations with full audit visibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-black">₹{estimatedRevenue.toLocaleString()}</div>
            <p className="text-xs font-bold tracking-widest text-blue-100 uppercase">Revenue projection</p>
            <Link href="/dashboard/admin/requests" className={cn(buttonVariants({ variant: "secondary" }), "w-full justify-center")}>
              Open request board
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
